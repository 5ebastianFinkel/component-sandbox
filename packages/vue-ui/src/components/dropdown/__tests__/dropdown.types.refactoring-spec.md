# dropdown.types.ts Refactoring Specification

## Current Analysis

### File Overview
Comprehensive type definitions for the dropdown component system, including interfaces for props, emits, and internal types.

### Current Issues

#### 1. **Mixed Language Documentation** (`dropdown.types.ts:11-226`)
- User-facing JSDoc comments should remain in German for better local user experience
- Internal implementation comments should be in English for developer collaboration
- Need clear separation between user-facing and internal type documentation

#### 2. **Limited Type Utilities** (`dropdown.types.ts:1-226`)
- No utility types for common patterns
- No generic types for reusable functionality
- No type guards for runtime validation
- No discriminated unions for variant handling

#### 3. **Missing Advanced Types**
- No types for positioning strategies
- No types for animation configurations
- No types for accessibility enhancements
- No types for theming support
- No types for error handling

#### 4. **Incomplete Event Types** (`dropdown.types.ts:151-160`)
- Limited event type definitions
- No generic event handling types
- No keyboard event specific types
- No mouse event specific types

#### 5. **Basic Enum Types** (`dropdown.types.ts:13-31`)
- Simple string literal types
- No const assertions for better type inference
- No namespace organization
- No type validation helpers

#### 6. **Missing Integration Types**
- No types for composable return values
- No types for provider/inject patterns
- No types for plugin systems
- No types for testing utilities

## Proposed Refactoring

### 1. **Add Comprehensive Type Utilities**
- [ ] Create utility types for common patterns
- [ ] Add generic types for reusable functionality
- [ ] Add type guards for runtime validation
- [ ] Add discriminated unions for variants

### 2. **Enhance Event Type System**
- [ ] Add comprehensive event type definitions
- [ ] Create generic event handling types
- [ ] Add keyboard-specific event types
- [ ] Add mouse-specific event types

### 3. **Add Advanced Configuration Types**
- [ ] Add positioning strategy types
- [ ] Add animation configuration types
- [ ] Add accessibility enhancement types
- [ ] Add theming support types

### 4. **Improve Documentation**
- [ ] Keep German for user-facing type documentation (public API)
- [ ] Convert internal implementation comments to English
- [ ] Add comprehensive JSDoc examples in both languages
- [ ] Document type relationships for developers (English)
- [ ] Add usage patterns for developers (English)

### 5. **Add Integration Types**
- [ ] Add composable return value types
- [ ] Add provider/inject pattern types
- [ ] Add plugin system types
- [ ] Add testing utility types

### 6. **Organize with Namespaces**
- [ ] Group related types into namespaces
- [ ] Add type aliases for common usage
- [ ] Add const assertions for better inference
- [ ] Add type validation utilities

## Implementation Steps

### Phase 1: Core Type Utilities
```typescript
// Enhanced base types with utilities
export namespace DropdownTypes {
  // Placement types with const assertions
  export const PLACEMENTS = [
    'top', 'top-start', 'top-end',
    'bottom', 'bottom-start', 'bottom-end',
    'left', 'left-start', 'left-end',
    'right', 'right-start', 'right-end'
  ] as const
  
  export type Placement = typeof PLACEMENTS[number]
  
  // Alignment types
  export const ALIGNMENTS = ['start', 'center', 'end'] as const
  export type Alignment = typeof ALIGNMENTS[number]
  
  // Variant types
  export const VARIANTS = ['default', 'outline', 'ghost', 'subtle'] as const
  export type Variant = typeof VARIANTS[number]
  
  // Size types
  export const SIZES = ['sm', 'md', 'lg'] as const
  export type Size = typeof SIZES[number]
  
  // State types
  export const STATES = ['closed', 'opening', 'open', 'closing'] as const
  export type State = typeof STATES[number]
  
  // Type guards
  export function isValidPlacement(value: string): value is Placement {
    return PLACEMENTS.includes(value as Placement)
  }
  
  export function isValidAlignment(value: string): value is Alignment {
    return ALIGNMENTS.includes(value as Alignment)
  }
  
  export function isValidVariant(value: string): value is Variant {
    return VARIANTS.includes(value as Variant)
  }
  
  export function isValidSize(value: string): value is Size {
    return SIZES.includes(value as Size)
  }
}
```

### Phase 2: Enhanced Event Types
```typescript
// Comprehensive event type system
export namespace DropdownEvents {
  // Base event types
  export interface BaseDropdownEvent {
    type: string
    target: HTMLElement
    timestamp: number
  }
  
  // Keyboard event types
  export interface DropdownKeyboardEvent extends BaseDropdownEvent {
    type: 'keydown' | 'keyup' | 'keypress'
    key: string
    code: string
    ctrlKey: boolean
    altKey: boolean
    shiftKey: boolean
    metaKey: boolean
  }
  
  // Mouse event types
  export interface DropdownMouseEvent extends BaseDropdownEvent {
    type: 'click' | 'mouseenter' | 'mouseleave' | 'mousedown' | 'mouseup'
    button: number
    clientX: number
    clientY: number
    ctrlKey: boolean
    altKey: boolean
    shiftKey: boolean
    metaKey: boolean
  }
  
  // Focus event types
  export interface DropdownFocusEvent extends BaseDropdownEvent {
    type: 'focus' | 'blur' | 'focusin' | 'focusout'
    relatedTarget: HTMLElement | null
  }
  
  // State change event types
  export interface DropdownStateChangeEvent extends BaseDropdownEvent {
    type: 'open' | 'close' | 'toggle'
    previousState: DropdownTypes.State
    newState: DropdownTypes.State
    reason: 'user' | 'programmatic' | 'external'
  }
  
  // Selection event types
  export interface DropdownSelectionEvent extends BaseDropdownEvent {
    type: 'select' | 'deselect'
    value: string | number | undefined
    item: HTMLElement
  }
  
  // Union of all event types
  export type DropdownEvent = 
    | DropdownKeyboardEvent
    | DropdownMouseEvent
    | DropdownFocusEvent
    | DropdownStateChangeEvent
    | DropdownSelectionEvent
}
```

### Phase 3: Advanced Configuration Types
```typescript
// Positioning and layout types
export namespace DropdownPositioning {
  export interface PositioningStrategy {
    name: string
    calculate: (
      trigger: DOMRect,
      content: DOMRect,
      options: PositioningOptions
    ) => Position
    handleCollisions: (
      position: Position,
      trigger: DOMRect,
      content: DOMRect,
      viewport: Viewport
    ) => Position
  }
  
  export interface Position {
    left: number
    top: number
    transform?: string
    transformOrigin?: string
  }
  
  export interface Viewport {
    width: number
    height: number
    scrollX: number
    scrollY: number
  }
  
  export interface PositioningOptions {
    placement: DropdownTypes.Placement
    align: DropdownTypes.Alignment
    sideOffset: number
    alignOffset: number
    avoidCollisions: boolean
    collisionPadding: number
    strategy: 'absolute' | 'fixed'
  }
  
  export interface CollisionDetection {
    top: boolean
    right: boolean
    bottom: boolean
    left: boolean
  }
}

// Animation configuration types
export namespace DropdownAnimation {
  export interface AnimationConfig {
    duration: number
    easing: string
    delay: number
    fill: 'none' | 'forwards' | 'backwards' | 'both'
  }
  
  export interface TransitionConfig {
    enter: AnimationConfig
    leave: AnimationConfig
  }
  
  export interface AnimationVariant {
    name: string
    keyframes: Keyframe[]
    options: AnimationConfig
  }
  
  export const ANIMATION_VARIANTS = [
    'slide', 'fade', 'scale', 'flip', 'none'
  ] as const
  
  export type AnimationVariantName = typeof ANIMATION_VARIANTS[number]
}

// Accessibility enhancement types
export namespace DropdownAccessibility {
  export interface AccessibilityConfig {
    announceStateChanges: boolean
    announceSelections: boolean
    announceNavigation: boolean
    respectReducedMotion: boolean
    focusManagement: FocusManagementConfig
  }
  
  export interface FocusManagementConfig {
    trapFocus: boolean
    restoreFocus: boolean
    initialFocus: 'first' | 'last' | 'trigger' | HTMLElement
    finalFocus: 'trigger' | 'none' | HTMLElement
  }
  
  export interface AriaAttributes {
    label?: string
    labelledBy?: string
    describedBy?: string
    expanded?: boolean
    haspopup?: boolean | 'true' | 'false' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'
    controls?: string
    owns?: string
    activedescendant?: string
  }
}
```

### Phase 4: Composable Integration Types
```typescript
// Composable return value types
export namespace DropdownComposables {
  // State composable return type
  export interface UseDropdownStateReturn {
    isOpen: Ref<boolean>
    disabled: Ref<boolean>
    closeOnSelect: Ref<boolean>
    placement: Ref<DropdownTypes.Placement>
    triggerId: Ref<string>
    contentId: Ref<string>
    triggerRef: Ref<HTMLElement | null>
    contentRef: Ref<HTMLElement | null>
    open: () => void
    close: () => void
    toggle: () => void
  }
  
  // Sub-menu composable return type
  export interface UseDropdownSubMenusReturn {
    activeSubMenu: Ref<string | null>
    registerSubMenu: (id: string, callbacks: SubMenuCallbacks) => () => void
    unregisterSubMenu: (id: string) => void
    openSubMenu: (id: string) => void
    closeSubMenu: (id: string) => void
    closeAllSubMenus: () => void
    getSubMenuState: (id: string) => boolean
    handleSubMenuError: (id: string, error: Error) => void
  }
  
  // Positioning composable return type
  export interface UseDropdownPositioningReturn {
    updatePosition: () => void
    currentPosition: Ref<DropdownPositioning.Position | null>
    collisionDetection: Ref<DropdownPositioning.CollisionDetection>
    isPositioned: Ref<boolean>
  }
  
  // Focus composable return type
  export interface UseDropdownFocusReturn {
    focusFirst: () => void
    focusLast: () => void
    focusNext: () => void
    focusPrevious: () => void
    focusItem: (index: number) => void
    getCurrentFocusIndex: () => number
    getFocusableItems: () => HTMLElement[]
  }
  
  // Hover composable return type
  export interface UseDropdownHoverReturn {
    hoverTimeout: Ref<number | null>
    clearHoverTimeout: () => void
    setHoverTimeout: (callback: () => void, delay: number) => void
    setOpenTimeout: (callback: () => void, delay?: number) => void
    setCloseTimeout: (callback: () => void, delay?: number) => void
  }
}
```

### Phase 5: Enhanced Component Props
```typescript
// Enhanced prop interfaces with comprehensive documentation
export interface SpDropdownProps {
  /**
   * Controls the open/closed state of the dropdown
   * @default false
   */
  modelValue?: boolean
  
  /**
   * Disables the entire dropdown
   * @default false
   */
  disabled?: boolean
  
  /**
   * Automatically closes the dropdown when an item is selected
   * @default true
   */
  closeOnSelect?: boolean
  
  /**
   * Preferred placement of the dropdown content
   * @default 'bottom-start'
   */
  placement?: DropdownTypes.Placement
  
  /**
   * Animation variant for open/close transitions
   * @default 'slide'
   */
  animation?: DropdownAnimation.AnimationVariantName
  
  /**
   * Accessibility configuration
   */
  accessibility?: Partial<DropdownAccessibility.AccessibilityConfig>
  
  /**
   * Custom positioning options
   */
  positioning?: Partial<DropdownPositioning.PositioningOptions>
  
  /**
   * Custom CSS classes
   */
  class?: string
  
  /**
   * Custom inline styles
   */
  style?: string | CSSProperties
}

export interface SpDropdownTriggerProps {
  /**
   * Render as child element instead of button
   * @default false
   */
  asChild?: boolean
  
  /**
   * Visual variant of the trigger
   * @default 'default'
   */
  variant?: DropdownTypes.Variant
  
  /**
   * Size of the trigger
   * @default 'md'
   */
  size?: DropdownTypes.Size
  
  /**
   * Icon component to display
   */
  icon?: Component
  
  /**
   * Show dropdown arrow indicator
   * @default true
   */
  showArrow?: boolean
  
  /**
   * Custom arrow icon component
   */
  arrowIcon?: Component
  
  /**
   * ARIA label for accessibility
   */
  ariaLabel?: string
  
  /**
   * ARIA describedby for accessibility
   */
  ariaDescribedby?: string
  
  /**
   * Custom CSS classes
   */
  class?: string
}

export interface SpDropdownItemProps {
  /**
   * Unique identifier for the item
   */
  value?: string | number
  
  /**
   * Disables the item
   * @default false
   */
  disabled?: boolean
  
  /**
   * Controls whether dropdown closes when this item is selected
   * If not specified, inherits from parent dropdown
   */
  closeOnSelect?: boolean
  
  /**
   * Visual variant of the item
   * @default 'default'
   */
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  
  /**
   * Icon component to display
   */
  icon?: Component
  
  /**
   * Keyboard shortcut to display
   */
  keyboardShortcut?: string
  
  /**
   * Description text for accessibility
   */
  description?: string
  
  /**
   * Loading state
   * @default false
   */
  loading?: boolean
  
  /**
   * Custom CSS classes
   */
  class?: string
}
```

### Phase 6: Testing and Validation Types
```typescript
// Testing utility types
export namespace DropdownTesting {
  export interface TestingConfig {
    enableDebugMode: boolean
    mockAnimations: boolean
    mockPositioning: boolean
    logEvents: boolean
  }
  
  export interface MockDropdownContext {
    isOpen: boolean
    disabled: boolean
    triggerId: string
    contentId: string
    mockTrigger: () => void
    mockClose: () => void
    mockItemClick: (value?: string) => void
  }
  
  export interface DropdownTestHelpers {
    createMockContext: (overrides?: Partial<MockDropdownContext>) => MockDropdownContext
    simulateKeyboard: (key: string, target?: HTMLElement) => void
    simulateMouse: (type: string, target?: HTMLElement) => void
    waitForAnimation: () => Promise<void>
    getDropdownState: (element: HTMLElement) => DropdownTypes.State
  }
}

// Validation types
export namespace DropdownValidation {
  export interface ValidationRule<T> {
    validate: (value: T) => boolean
    message: string
  }
  
  export interface ValidationRules {
    placement: ValidationRule<string>[]
    alignment: ValidationRule<string>[]
    variant: ValidationRule<string>[]
    size: ValidationRule<string>[]
  }
  
  export interface ValidationResult {
    isValid: boolean
    errors: string[]
    warnings: string[]
  }
  
  export interface Validator {
    validatePlacement: (value: string) => ValidationResult
    validateAlignment: (value: string) => ValidationResult
    validateVariant: (value: string) => ValidationResult
    validateSize: (value: string) => ValidationResult
    validateProps: (props: Record<string, any>) => ValidationResult
  }
}
```

### Phase 7: Plugin System Types
```typescript
// Plugin system types for extensibility
export namespace DropdownPlugins {
  export interface Plugin {
    name: string
    version: string
    install: (context: DropdownContext) => void
    uninstall?: (context: DropdownContext) => void
  }
  
  export interface PluginContext {
    dropdown: DropdownContext
    addMethod: (name: string, method: Function) => void
    addProperty: (name: string, value: any) => void
    onEvent: (event: string, handler: Function) => void
    offEvent: (event: string, handler: Function) => void
  }
  
  export interface PluginSystem {
    plugins: Map<string, Plugin>
    install: (plugin: Plugin) => void
    uninstall: (name: string) => void
    isInstalled: (name: string) => boolean
    getPlugin: (name: string) => Plugin | undefined
  }
}
```

## Testing Requirements

### Type Testing
- [ ] Test all type definitions with TypeScript compiler
- [ ] Test type guards with runtime values
- [ ] Test generic type inference
- [ ] Test discriminated union handling
- [ ] Test namespace organization

### Integration Testing
- [ ] Test with actual component implementations
- [ ] Test composable return types
- [ ] Test event type handling
- [ ] Test accessibility type integration

### Documentation Testing
- [ ] Test JSDoc examples compile correctly
- [ ] Test type documentation completeness
- [ ] Test usage pattern examples
- [ ] Test migration guide accuracy

## Migration Guide

### Breaking Changes
- German documentation replaced with English
- Some type names may change for consistency
- Enhanced type safety may catch new errors

### New Features
- Comprehensive type utilities
- Enhanced event type system
- Advanced configuration types
- Composable integration types
- Testing utility types
- Plugin system types

### Recommended Updates
- Update imports to use new namespace organization
- Use new type guards for runtime validation
- Adopt new event type system
- Utilize enhanced configuration types

## Files to be Created/Modified

### New Files
- `src/components/dropdown/types/utilities.ts` - Type utilities
- `src/components/dropdown/types/events.ts` - Event types
- `src/components/dropdown/types/positioning.ts` - Positioning types
- `src/components/dropdown/types/animation.ts` - Animation types
- `src/components/dropdown/types/accessibility.ts` - Accessibility types
- `src/components/dropdown/types/testing.ts` - Testing types
- `src/components/dropdown/types/plugins.ts` - Plugin types

### Modified Files
- `src/components/dropdown/dropdown.types.ts` - Main type definitions file

## Performance Considerations

### Improvements
- Better type inference reduces runtime type checking
- Const assertions improve compile-time optimization
- Namespace organization improves tree-shaking
- Type guards reduce runtime validation overhead

### Metrics to Monitor
- TypeScript compilation time
- Bundle size impact of type definitions
- Runtime performance of type guards
- Developer experience improvements

## Risk Assessment

### Low Risk
- Documentation language changes
- Adding new optional types
- Namespace organization
- Type utility additions

### Very Low Risk
- Type definitions have no runtime impact
- Mostly additive changes
- Backward compatibility maintained
- Enhanced type safety

### Mitigation Strategies
- Comprehensive type testing
- Gradual migration path
- Documentation updates
- Community feedback integration

## Developer Experience Improvements

### Enhanced Type Safety
- Better compile-time error detection
- Improved IDE autocompletion
- Better refactoring support
- Clearer type relationships

### Better Documentation
- Comprehensive JSDoc examples
- Clear usage patterns
- Migration guidance
- Troubleshooting information

### Improved Tooling
- Type guards for runtime validation
- Testing utilities
- Plugin system support
- Debug mode enhancements

## Future Enhancements

### Potential Additions
- Advanced generic type utilities
- Custom type validation systems
- Integration with form libraries
- Advanced animation type systems

### Extensibility
- Plugin type system
- Custom variant types
- Advanced configuration types
- Integration with design systems