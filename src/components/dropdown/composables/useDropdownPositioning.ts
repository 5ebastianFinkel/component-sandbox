import { type Ref, watch, nextTick } from 'vue'
import { createPositioningStrategy, AutoPositionStrategy } from '../utils/positioningStrategy'
import type { Position } from '../utils/positioningStrategy'

export interface PositioningOptions {
  placement: Ref<string>
  align?: string
  sideOffset?: number
  avoidCollisions?: boolean
  useStrategyPattern?: boolean
  autoPlacement?: boolean
}

export { Position }

// Parse placement string into side and alignment components
function parsePlacement(placementValue: string): { side: string; align: string } {
  const [side, align = 'start'] = placementValue.split('-')
  return { side, align }
}

// Calculate base position based on side
function calculateBasePosition(
  triggerRect: DOMRect,
  contentRect: DOMRect,
  side: string,
  align: string,
  sideOffset: number
): Position {
  let left = 0
  let top = 0

  switch (side) {
    case 'top':
      top = triggerRect.top - contentRect.height - sideOffset
      // Horizontal alignment for top placement
      switch (align) {
        case 'start':
          left = triggerRect.left
          break
        case 'center':
          left = triggerRect.left + triggerRect.width / 2
          break
        case 'end':
          left = triggerRect.right - contentRect.width
          break
      }
      break
    case 'bottom':
      top = triggerRect.bottom + sideOffset
      // Horizontal alignment for bottom placement
      switch (align) {
        case 'start':
          left = triggerRect.left
          break
        case 'center':
          left = triggerRect.left + triggerRect.width / 2
          break
        case 'end':
          left = triggerRect.right - contentRect.width
          break
      }
      break
    case 'left':
      left = triggerRect.left - contentRect.width - sideOffset
      // Vertical alignment for left placement
      switch (align) {
        case 'start':
          top = triggerRect.top
          break
        case 'center':
          top = triggerRect.top + triggerRect.height / 2
          break
        case 'end':
          top = triggerRect.bottom - contentRect.height
          break
      }
      break
    case 'right':
      left = triggerRect.right + sideOffset
      // Vertical alignment for right placement
      switch (align) {
        case 'start':
          top = triggerRect.top
          break
        case 'center':
          top = triggerRect.top + triggerRect.height / 2
          break
        case 'end':
          top = triggerRect.bottom - contentRect.height
          break
      }
      break
  }

  return { left, top }
}

// Apply collision detection and adjustments
function applyCollisionDetection(
  position: Position,
  triggerRect: DOMRect,
  contentRect: DOMRect,
  side: string,
  sideOffset: number
): Position {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const viewportPadding = 8
  let { left, top } = position

  // Handle collisions based on primary side
  if (side === 'top' || side === 'bottom') {
    // Horizontal collision
    if (left + contentRect.width > viewportWidth - viewportPadding) {
      left = viewportWidth - contentRect.width - viewportPadding
    }
    if (left < viewportPadding) {
      left = viewportPadding
    }

    // Vertical collision - flip to opposite side if no space
    if (side === 'bottom' && top + contentRect.height > viewportHeight - viewportPadding) {
      const spaceAbove = triggerRect.top - viewportPadding
      const spaceBelow = viewportHeight - triggerRect.bottom - viewportPadding
      if (spaceAbove > spaceBelow) {
        top = triggerRect.top - contentRect.height - sideOffset
      }
    } else if (side === 'top' && top < viewportPadding) {
      const spaceAbove = triggerRect.top - viewportPadding
      const spaceBelow = viewportHeight - triggerRect.bottom - viewportPadding
      if (spaceBelow > spaceAbove) {
        top = triggerRect.bottom + sideOffset
      }
    }
  } else {
    // Vertical collision
    if (top + contentRect.height > viewportHeight - viewportPadding) {
      top = viewportHeight - contentRect.height - viewportPadding
    }
    if (top < viewportPadding) {
      top = viewportPadding
    }

    // Horizontal collision - flip to opposite side if no space
    if (side === 'right' && left + contentRect.width > viewportWidth - viewportPadding) {
      const spaceLeft = triggerRect.left - viewportPadding
      const spaceRight = viewportWidth - triggerRect.right - viewportPadding
      if (spaceLeft > spaceRight) {
        left = triggerRect.left - contentRect.width - sideOffset
      }
    } else if (side === 'left' && left < viewportPadding) {
      const spaceLeft = triggerRect.left - viewportPadding
      const spaceRight = viewportWidth - triggerRect.right - viewportPadding
      if (spaceRight > spaceLeft) {
        left = triggerRect.right + sideOffset
      }
    }
  }

  return { left, top }
}

// Apply position to element
function applyPosition(element: HTMLElement, position: Position): void {
  element.style.left = `${position.left}px`
  element.style.top = `${position.top}px`
}

export function useDropdownPositioning(
  contentElement: Ref<HTMLElement | null>,
  triggerElement: Ref<HTMLElement | null>,
  options: PositioningOptions
) {
  const updatePosition = async () => {
    // Ensure we have both elements
    if (!contentElement.value || !triggerElement.value) return

    // Wait for next tick to ensure element is rendered
    await nextTick()

    const triggerRect = triggerElement.value.getBoundingClientRect()
    const contentRect = contentElement.value.getBoundingClientRect()
    
    let position: Position

    // Use strategy pattern if enabled
    if (options.useStrategyPattern || options.autoPlacement) {
      const strategy = options.autoPlacement 
        ? new AutoPositionStrategy()
        : createPositioningStrategy(options.placement.value)
      
      position = strategy.calculatePosition(triggerRect, contentRect, {
        sideOffset: options.sideOffset || 4,
        align: options.align || 'start',
        avoidCollisions: options.avoidCollisions !== false
      })
    } else {
      // Use original positioning logic
      const { side, align } = parsePlacement(options.placement.value)

      // Calculate base position
      position = calculateBasePosition(
        triggerRect,
        contentRect,
        side,
        align,
        options.sideOffset || 4
      )

      // Apply collision detection if enabled
      if (options.avoidCollisions !== false) {
        position = applyCollisionDetection(
          position,
          triggerRect,
          contentRect,
          side,
          options.sideOffset || 4
        )
      }
    }

    // Apply the calculated position
    applyPosition(contentElement.value, position)
  }

  // Watch for placement changes
  watch(() => options.placement.value, updatePosition)

  // Handle window resize
  let resizeObserver: ResizeObserver | null = null
  
  const startObserving = () => {
    if (!contentElement.value || !triggerElement.value) return
    
    resizeObserver = new ResizeObserver(updatePosition)
    resizeObserver.observe(contentElement.value)
    resizeObserver.observe(triggerElement.value)
  }
  
  const stopObserving = () => {
    resizeObserver?.disconnect()
    resizeObserver = null
  }

  // Watch for element changes
  watch([contentElement, triggerElement], ([content, trigger]) => {
    stopObserving()
    if (content && trigger) {
      startObserving()
    }
  })

  return {
    updatePosition,
    stopObserving
  }
}