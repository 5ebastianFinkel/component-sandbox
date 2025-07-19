import { type Ref, watch, nextTick } from 'vue'
import { createPositioningStrategy, AutoPositionStrategy } from '../utils/positioningStrategy'
import type { Position } from '../utils/positioningStrategy'
import { POSITIONING } from '../constants/dropdown.constants'

/**
 * Options for configuring dropdown positioning behavior
 * 
 * @interface PositioningOptions
 * @property {Ref<string>} placement - Reactive placement string (e.g., 'bottom-start', 'top-end')
 * @property {string} [align] - Alignment within the placement (start, center, end)
 * @property {number} [sideOffset=4] - Distance in pixels from the trigger element
 * @property {boolean} [avoidCollisions=true] - Whether to detect and avoid viewport collisions
 * @property {boolean} [useStrategyPattern] - Use strategy pattern for positioning calculation
 * @property {boolean} [autoPlacement] - Automatically find best placement to avoid collisions
 */
export interface PositioningOptions {
  placement: Ref<string>
  align?: string
  sideOffset?: number
  avoidCollisions?: boolean
  useStrategyPattern?: boolean
  autoPlacement?: boolean
}

export type { Position }

/**
 * Parse placement string into side and alignment components
 * @param {string} placementValue - Placement string (e.g., 'bottom-start')
 * @returns {{side: string, align: string}} Parsed side and alignment
 * @private
 */
function parsePlacement(placementValue: string): { side: string; align: string } {
  const [side, align = 'start'] = placementValue.split('-')
  return { side, align }
}

/**
 * Calculate horizontal position based on alignment
 * @private
 */
function calculateHorizontalPosition(
  triggerRect: DOMRect,
  contentRect: DOMRect,
  align: string
): number {
  switch (align) {
    case 'start':
      return triggerRect.left
    case 'center':
      return triggerRect.left + (triggerRect.width - contentRect.width) / 2
    case 'end':
      return triggerRect.right - contentRect.width
    default:
      return triggerRect.left
  }
}

/**
 * Calculate vertical position based on alignment
 * @private
 */
function calculateVerticalPosition(
  triggerRect: DOMRect,
  contentRect: DOMRect,
  align: string
): number {
  switch (align) {
    case 'start':
      return triggerRect.top
    case 'center':
      return triggerRect.top + (triggerRect.height - contentRect.height) / 2
    case 'end':
      return triggerRect.bottom - contentRect.height
    default:
      return triggerRect.top
  }
}

/**
 * Calculate base position for dropdown content relative to trigger
 * @param {DOMRect} triggerRect - Bounding rectangle of trigger element
 * @param {DOMRect} contentRect - Bounding rectangle of content element
 * @param {string} side - Side to position on (top, bottom, left, right)
 * @param {string} align - Alignment on that side (start, center, end)
 * @param {number} sideOffset - Distance from trigger
 * @returns {Position} Calculated position with left and top values
 * @private
 */
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
      left = calculateHorizontalPosition(triggerRect, contentRect, align)
      break
    case 'bottom':
      top = triggerRect.bottom + sideOffset
      left = calculateHorizontalPosition(triggerRect, contentRect, align)
      break
    case 'left':
      left = triggerRect.left - contentRect.width - sideOffset
      top = calculateVerticalPosition(triggerRect, contentRect, align)
      break
    case 'right':
      left = triggerRect.right + sideOffset
      top = calculateVerticalPosition(triggerRect, contentRect, align)
      break
  }

  return { left, top }
}

/**
 * Detect and adjust horizontal collision with viewport edges
 * @private
 */
function detectHorizontalCollision(
  left: number,
  contentWidth: number,
  viewportWidth: number,
  viewportPadding: number
): number {
  if (left + contentWidth > viewportWidth - viewportPadding) {
    return viewportWidth - contentWidth - viewportPadding
  }
  if (left < viewportPadding) {
    return viewportPadding
  }
  return left
}

/**
 * Detect and adjust vertical collision with viewport edges
 * @private
 */
function detectVerticalCollision(
  top: number,
  contentHeight: number,
  viewportHeight: number,
  viewportPadding: number
): number {
  if (top + contentHeight > viewportHeight - viewportPadding) {
    return viewportHeight - contentHeight - viewportPadding
  }
  if (top < viewportPadding) {
    return viewportPadding
  }
  return top
}

/**
 * Calculate available space around trigger element
 * @private
 */
function calculateAvailableSpace(
  triggerRect: DOMRect,
  viewportWidth: number,
  viewportHeight: number,
  viewportPadding: number
) {
  return {
    above: triggerRect.top - viewportPadding,
    below: viewportHeight - triggerRect.bottom - viewportPadding,
    left: triggerRect.left - viewportPadding,
    right: viewportWidth - triggerRect.right - viewportPadding
  }
}

/**
 * Determine if position should flip to opposite side
 * @private
 */
function shouldFlipPosition(
  side: string,
  position: Position,
  contentRect: DOMRect,
  space: ReturnType<typeof calculateAvailableSpace>,
  viewportDimensions: { width: number; height: number },
  viewportPadding: number
): boolean {
  switch (side) {
    case 'bottom':
      return position.top + contentRect.height > viewportDimensions.height - viewportPadding && 
             space.above > space.below
    case 'top':
      return position.top < viewportPadding && space.below > space.above
    case 'right':
      return position.left + contentRect.width > viewportDimensions.width - viewportPadding && 
             space.left > space.right
    case 'left':
      return position.left < viewportPadding && space.right > space.left
    default:
      return false
  }
}

/**
 * Apply collision detection and adjust position to keep dropdown in viewport
 * @param {Position} position - Initial calculated position
 * @param {DOMRect} triggerRect - Bounding rectangle of trigger element
 * @param {DOMRect} contentRect - Bounding rectangle of content element
 * @param {string} side - Original side for positioning
 * @param {number} sideOffset - Distance from trigger
 * @returns {Position} Adjusted position that avoids viewport edges
 * @private
 */
function applyCollisionDetection(
  position: Position,
  triggerRect: DOMRect,
  contentRect: DOMRect,
  side: string,
  sideOffset: number
): Position {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const viewportPadding = POSITIONING.VIEWPORT_PADDING
  let { left, top } = position

  const space = calculateAvailableSpace(
    triggerRect,
    viewportWidth,
    viewportHeight,
    viewportPadding
  )

  // Handle collisions based on primary side
  if (side === 'top' || side === 'bottom') {
    // Horizontal collision
    left = detectHorizontalCollision(left, contentRect.width, viewportWidth, viewportPadding)

    // Vertical collision - flip to opposite side if no space
    if (shouldFlipPosition(side, position, contentRect, space, 
        { width: viewportWidth, height: viewportHeight }, viewportPadding)) {
      top = side === 'bottom' 
        ? triggerRect.top - contentRect.height - sideOffset
        : triggerRect.bottom + sideOffset
    }
  } else {
    // Vertical collision
    top = detectVerticalCollision(top, contentRect.height, viewportHeight, viewportPadding)

    // Horizontal collision - flip to opposite side if no space
    if (shouldFlipPosition(side, position, contentRect, space,
        { width: viewportWidth, height: viewportHeight }, viewportPadding)) {
      left = side === 'right'
        ? triggerRect.left - contentRect.width - sideOffset
        : triggerRect.right + sideOffset
    }
  }

  return { left, top }
}

/**
 * Apply calculated position to the DOM element
 * @param {HTMLElement} element - Element to position
 * @param {Position} position - Position to apply
 * @private
 */
function applyPosition(element: HTMLElement, position: Position): void {
  element.style.left = `${position.left}px`
  element.style.top = `${position.top}px`
}

/**
 * Composable for managing dropdown positioning with collision detection.
 * Handles automatic repositioning when content would overflow viewport edges.
 * 
 * Features:
 * - Flexible placement options (12 positions)
 * - Automatic collision detection and avoidance
 * - Strategy pattern support for advanced positioning
 * - Auto-placement to find best position
 * - Reactive updates on placement changes
 * - ResizeObserver integration for dynamic content
 * 
 * @param {Ref<HTMLElement | null>} contentElement - Reference to dropdown content element
 * @param {Ref<HTMLElement | null>} triggerElement - Reference to trigger element
 * @param {PositioningOptions} options - Positioning configuration
 * 
 * @returns {Object} Positioning utilities:
 * - updatePosition: Function to recalculate and apply position
 * - stopObserving: Function to stop resize observers
 * 
 * @example
 * ```vue
 * <script setup>
 * import { ref } from 'vue'
 * import { useDropdownPositioning } from './useDropdownPositioning'
 * 
 * const triggerRef = ref<HTMLElement>()
 * const contentRef = ref<HTMLElement>()
 * const placement = ref('bottom-start')
 * 
 * const { updatePosition } = useDropdownPositioning(
 *   contentRef,
 *   triggerRef,
 *   {
 *     placement,
 *     sideOffset: 8,
 *     avoidCollisions: true
 *   }
 * )
 * 
 * // Update position when dropdown opens
 * watch(isOpen, (open) => {
 *   if (open) {
 *     nextTick(() => updatePosition())
 *   }
 * })
 * </script>
 * ```
 * 
 * @example
 * ```typescript
 * // Using auto-placement
 * const positioning = useDropdownPositioning(content, trigger, {
 *   placement: ref('bottom-start'),
 *   autoPlacement: true, // Will find best position
 *   sideOffset: 4
 * })
 * 
 * // Using strategy pattern
 * const positioning = useDropdownPositioning(content, trigger, {
 *   placement: ref('right-start'),
 *   useStrategyPattern: true,
 *   avoidCollisions: true
 * })
 * ```
 */
export function useDropdownPositioning(
  contentElement: Ref<HTMLElement | null>,
  triggerElement: Ref<HTMLElement | null>,
  options: PositioningOptions
) {
  /**
   * Update the position of the dropdown content.
   * Calculates optimal position based on trigger location and available space.
   * @returns {Promise<void>}
   */
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

  /** ResizeObserver instance for monitoring size changes */
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