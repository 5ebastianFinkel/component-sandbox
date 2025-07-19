/**
 * ToggleEvent type for Popover API
 * This is a newer browser API that might not be in all TypeScript definitions yet
 */
export interface ToggleEvent extends Event {
    oldState: 'open' | 'closed'
    newState: 'open' | 'closed'
}

/**
 * Placement options for dropdown positioning
 */
export type DropdownPlacement =
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'left'
    | 'left-start'
    | 'left-end'
    | 'right'
    | 'right-start'
    | 'right-end'

/**
 * Alignment options for dropdown content
 */
export type DropdownAlign = 'start' | 'center' | 'end'

/**
 * Common variant types used across dropdown components
 */
export type DropdownVariant = 'default' | 'destructive' | 'success' | 'warning'

/**
 * Size options for dropdown components
 */
export type DropdownSize = 'small' | 'medium' | 'large'

/**
 * Hover behavior options for sub-menu triggers
 */
export type HoverBehavior = 'immediate' | 'delayed' | 'disabled'

/**
 * Base interface for components that can be disabled
 */
export interface Disableable {
    disabled?: boolean
}

/**
 * Base interface for components that control dropdown closing behavior
 */
export interface Closeable {
    closeOnSelect?: boolean
}

/**
 * Base interface for components with positioning options
 */
export interface Positionable {
    placement?: DropdownPlacement
    align?: DropdownAlign
    sideOffset?: number
    avoidCollisions?: boolean
}

/**
 * Props for the SpDropdown root component
 */
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
    placement?: DropdownPlacement
}

/**
 * Props for the SpDropdownTrigger component
 */
export interface SpDropdownTriggerProps {
    /**
     * Renders the trigger as the direct child element
     * Useful for custom trigger elements
     * @default false
     */
    asChild?: boolean
}

/**
 * Props for the SpDropdownContent component
 */
export interface SpDropdownContentProps {
    /**
     * Bevorzugte Platzierung des Dropdown-Contents
     * @default 'bottom-start'
     */
    placement?: DropdownPlacement
    /**
     * Alignment relative to the trigger
     * @default 'start'
     */
    align?: DropdownAlign
    /**
     * Distance from the trigger in pixels
     * @default 4
     */
    sideOffset?: number
    /**
     * Enables collision detection with viewport edges
     * @default true
     */
    avoidCollisions?: boolean
    /**
     * z-index for the dropdown content
     */
    zIndex?: number
}

/**
 * Props for the SpDropdownItem component
 */
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
     * Controls whether the dropdown closes when this item is selected
     * If not specified, inherits from parent dropdown
     */
    closeOnSelect?: boolean
    /**
     * Visual style of the item
     * @default 'default'
     */
    variant?: 'default' | 'destructive' | 'success' | 'warning'
    /**
     * Icon component to display
     */
    icon?: any
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
     * Additional CSS classes
     */
    class?: string
}

/**
 * Props for the SpDropdownSeparator component
 */
export interface SpDropdownSeparatorProps {
    /**
     * Visual style of the separator
     * @default 'solid'
     */
    variant?: 'solid' | 'dashed' | 'dotted' | 'gradient' | 'double'
    /**
     * Spacing around the separator
     * @default 'normal'
     */
    spacing?: 'compact' | 'normal' | 'spacious'
    /**
     * Color variant for different contexts
     * @default 'default'
     */
    color?: 'default' | 'muted' | 'accent' | 'success' | 'warning' | 'error'
    /**
     * Orientation of the separator
     * @default 'horizontal'
     */
    orientation?: 'horizontal' | 'vertical'
    /**
     * ARIA role for the separator
     * @default 'separator'
     */
    role?: 'separator' | 'presentation' | 'none'
    /**
     * Label for the separator section
     */
    label?: string
    /**
     * ID of the element that labels this separator
     */
    labelledBy?: string
    /**
     * Additional CSS classes
     */
    class?: string
}

/**
 * Emits for SpDropdown
 */
export interface SpDropdownEmits {
    /**
     * Emitted when the open/closed state changes
     */
    'update:modelValue': [value: boolean]
    /**
     * Emitted when the dropdown is opened
     */
    'open': []
    /**
     * Emitted when the dropdown is closed
     */
    'close': []
}

/**
 * Emits for SpDropdownItem
 */
export interface SpDropdownItemEmits {
    /**
     * Emitted when the item is clicked
     */
    'click': [event: MouseEvent]
    /**
     * Emitted when the item is selected (via click or keyboard)
     */
    'select': [value: string | number | undefined]
    /**
     * Emitted when the item receives focus
     */
    'focus': [event: FocusEvent]
    /**
     * Emitted when the item loses focus
     */
    'blur': [event: FocusEvent]
}

/**
 * Props for the SpDropdownSub component
 */
export interface SpDropdownSubProps {
    /**
     * Disables the sub-menu
     * @default false
     */
    disabled?: boolean
    /**
     * Controls the open/closed state
     * @default false
     */
    modelValue?: boolean
}

/**
 * Props for the SpDropdownSubTrigger component
 */
export interface SpDropdownSubTriggerProps {
    /**
     * Disables the sub-trigger
     * @default false
     */
    disabled?: boolean
    /**
     * Hover behavior for the sub-trigger
     * @default 'default'
     */
    hoverBehavior?: HoverBehavior
    /**
     * Delay in milliseconds before opening on hover
     * @default 100
     */
    hoverOpenDelay?: number
    /**
     * Delay in milliseconds before closing on hover out
     * @default 300
     */
    hoverCloseDelay?: number
}

/**
 * Props for the SpDropdownSubContent component
 */
export interface SpDropdownSubContentProps {
    /**
     * Alignment relative to the trigger
     * @default 'start'
     */
    align?: DropdownAlign
    /**
     * Distance from the trigger in pixels
     * @default 4
     */
    sideOffset?: number
    /**
     * Enables collision detection with viewport edges
     * @default true
     */
    avoidCollisions?: boolean
}

/**
 * Emits for SpDropdownSub
 */
export interface SpDropdownSubEmits {
    /**
     * Emitted when the open/closed state changes
     */
    'update:modelValue': [value: boolean]
    /**
     * Emitted when the sub-menu is opened
     */
    'open': []
    /**
     * Emitted when the sub-menu is closed
     */
    'close': []
}