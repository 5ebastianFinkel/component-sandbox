/**
 * Positioning strategy pattern for dropdown placement
 * Allows for extensible positioning algorithms
 */

export interface PositionStrategy {
  calculatePosition(
    triggerRect: DOMRect,
    contentRect: DOMRect,
    options: PositioningOptions
  ): Position
}

export interface Position {
  left: number
  top: number
}

export interface PositioningOptions {
  sideOffset: number
  align: string
  avoidCollisions: boolean
  viewportPadding?: number
}

// Base strategy class
abstract class BasePositionStrategy implements PositionStrategy {
  protected viewportPadding = 8
  
  abstract calculatePosition(
    triggerRect: DOMRect,
    contentRect: DOMRect,
    options: PositioningOptions
  ): Position
  
  protected applyViewportConstraints(
    position: Position,
    contentRect: DOMRect,
    padding: number = this.viewportPadding
  ): Position {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    return {
      left: Math.max(
        padding,
        Math.min(position.left, viewportWidth - contentRect.width - padding)
      ),
      top: Math.max(
        padding,
        Math.min(position.top, viewportHeight - contentRect.height - padding)
      )
    }
  }
}

// Top placement strategy
export class TopPositionStrategy extends BasePositionStrategy {
  calculatePosition(
    triggerRect: DOMRect,
    contentRect: DOMRect,
    options: PositioningOptions
  ): Position {
    let left = 0
    const top = triggerRect.top - contentRect.height - options.sideOffset
    
    // Horizontal alignment
    switch (options.align) {
      case 'start':
        left = triggerRect.left
        break
      case 'center':
        left = triggerRect.left + (triggerRect.width - contentRect.width) / 2
        break
      case 'end':
        left = triggerRect.right - contentRect.width
        break
    }
    
    const position = { left, top }
    
    return options.avoidCollisions
      ? this.applyViewportConstraints(position, contentRect, options.viewportPadding)
      : position
  }
}

// Bottom placement strategy
export class BottomPositionStrategy extends BasePositionStrategy {
  calculatePosition(
    triggerRect: DOMRect,
    contentRect: DOMRect,
    options: PositioningOptions
  ): Position {
    let left = 0
    const top = triggerRect.bottom + options.sideOffset
    
    // Horizontal alignment
    switch (options.align) {
      case 'start':
        left = triggerRect.left
        break
      case 'center':
        left = triggerRect.left + (triggerRect.width - contentRect.width) / 2
        break
      case 'end':
        left = triggerRect.right - contentRect.width
        break
    }
    
    const position = { left, top }
    
    return options.avoidCollisions
      ? this.applyViewportConstraints(position, contentRect, options.viewportPadding)
      : position
  }
}

// Left placement strategy
export class LeftPositionStrategy extends BasePositionStrategy {
  calculatePosition(
    triggerRect: DOMRect,
    contentRect: DOMRect,
    options: PositioningOptions
  ): Position {
    const left = triggerRect.left - contentRect.width - options.sideOffset
    let top = 0
    
    // Vertical alignment
    switch (options.align) {
      case 'start':
        top = triggerRect.top
        break
      case 'center':
        top = triggerRect.top + (triggerRect.height - contentRect.height) / 2
        break
      case 'end':
        top = triggerRect.bottom - contentRect.height
        break
    }
    
    const position = { left, top }
    
    return options.avoidCollisions
      ? this.applyViewportConstraints(position, contentRect, options.viewportPadding)
      : position
  }
}

// Right placement strategy
export class RightPositionStrategy extends BasePositionStrategy {
  calculatePosition(
    triggerRect: DOMRect,
    contentRect: DOMRect,
    options: PositioningOptions
  ): Position {
    const left = triggerRect.right + options.sideOffset
    let top = 0
    
    // Vertical alignment
    switch (options.align) {
      case 'start':
        top = triggerRect.top
        break
      case 'center':
        top = triggerRect.top + (triggerRect.height - contentRect.height) / 2
        break
      case 'end':
        top = triggerRect.bottom - contentRect.height
        break
    }
    
    const position = { left, top }
    
    return options.avoidCollisions
      ? this.applyViewportConstraints(position, contentRect, options.viewportPadding)
      : position
  }
}

// Strategy factory
export function createPositioningStrategy(placement: string): PositionStrategy {
  const [side] = placement.split('-')
  
  switch (side) {
    case 'top':
      return new TopPositionStrategy()
    case 'bottom':
      return new BottomPositionStrategy()
    case 'left':
      return new LeftPositionStrategy()
    case 'right':
      return new RightPositionStrategy()
    default:
      return new BottomPositionStrategy() // Default fallback
  }
}

// Advanced positioning with auto-placement
export class AutoPositionStrategy extends BasePositionStrategy {
  private strategies = {
    top: new TopPositionStrategy(),
    bottom: new BottomPositionStrategy(),
    left: new LeftPositionStrategy(),
    right: new RightPositionStrategy()
  }
  
  calculatePosition(
    triggerRect: DOMRect,
    contentRect: DOMRect,
    options: PositioningOptions
  ): Position {
    // Calculate available space in each direction
    const availableSpace = {
      top: triggerRect.top - this.viewportPadding,
      bottom: window.innerHeight - triggerRect.bottom - this.viewportPadding,
      left: triggerRect.left - this.viewportPadding,
      right: window.innerWidth - triggerRect.right - this.viewportPadding
    }
    
    // Find the best placement based on available space
    const placements = Object.entries(availableSpace)
      .filter(([side, space]) => {
        if (side === 'top' || side === 'bottom') {
          return space >= contentRect.height + options.sideOffset
        } else {
          return space >= contentRect.width + options.sideOffset
        }
      })
      .sort(([, a], [, b]) => b - a)
    
    // Use the placement with most space, or default to bottom
    const [bestPlacement] = placements[0] || ['bottom']
    const strategy = this.strategies[bestPlacement as keyof typeof this.strategies]
    
    return strategy.calculatePosition(triggerRect, contentRect, options)
  }
}