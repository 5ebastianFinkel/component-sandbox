import {
    provide,
    inject,
    watch,
    type InjectionKey,
    type Ref
} from 'vue'
import { useDropdownState } from './composables/useDropdownState'
import { useDropdownRefs } from './composables/useDropdownRefs'
import { useSubMenuManager } from './composables/useSubMenuManager'
import { useHoverBehavior } from './composables/useHoverBehavior'
import { useDropdownKeyboard } from './composables/useDropdownKeyboard'
import { POSITIONING } from './constants/dropdown.constants'

/**
 * Core dropdown state properties
 * @interface DropdownState
 */
export interface DropdownState {
    /** Current open/closed state of the dropdown */
    isOpen: Ref<boolean>
    /** Whether the dropdown is disabled */
    disabled: Ref<boolean>
    /** Whether to close dropdown when an item is selected */
    closeOnSelect: Ref<boolean>
    /** Positioning placement (e.g., 'bottom-start', 'top-end') */
    placement: Ref<string>
}

/**
 * DOM element references for dropdown components
 * @interface DropdownRefs
 */
export interface DropdownRefs {
    /** Unique ID for the trigger element (for accessibility) */
    triggerId: Ref<string>
    /** Unique ID for the content element (for accessibility) */
    contentId: Ref<string>
    /** Reference to the trigger DOM element */
    triggerRef: Ref<HTMLElement | null>
    /** Reference to the content DOM element */
    contentRef: Ref<HTMLElement | null>
}

/**
 * Sub-menu management functionality
 * @interface SubMenuManager
 */
export interface SubMenuManager {
    /** ID of currently active sub-menu (if any) */
    activeSubMenu: Ref<string | null>
    /** Registers a sub-menu with this dropdown */
    registerSubMenu: (id: string) => void
    /** Unregisters a sub-menu */
    unregisterSubMenu: (id: string) => void
    /** Opens a specific sub-menu by ID */
    openSubMenu: (id: string) => void
    /** Closes a specific sub-menu by ID */
    closeSubMenu: (id: string) => void
    /** Closes all sub-menus */
    closeAllSubMenus: () => void
}

/**
 * Core dropdown actions
 * @interface DropdownActions
 */
export interface DropdownActions {
    /** Opens the dropdown */
    open: () => void
    /** Closes the dropdown and all sub-menus */
    close: () => void
    /** Toggles the dropdown open/closed state */
    toggle: () => void
    /** Handles item selection, optionally with a value */
    onItemClick: (value?: string) => void
}

/**
 * Hover behavior management
 * @interface HoverBehavior
 */
export interface HoverBehaviorManager {
    /** Timeout ID for hover behavior management */
    hoverTimeout: Ref<number | null>
    /** Clears any pending hover timeout */
    clearHoverTimeout: () => void
    /** Sets a hover timeout with callback */
    setHoverTimeout: (callback: () => void, delay: number) => void
}

/**
 * Complete dropdown context combining all interfaces
 * @interface DropdownContext
 */
export interface DropdownContext extends 
    DropdownState, 
    DropdownRefs, 
    SubMenuManager, 
    DropdownActions,
    HoverBehaviorManager {
    /** Parent dropdown context for nested dropdowns */
    parentDropdown: DropdownContext | null
}

/** 
 * Injection key for providing/injecting dropdown context throughout the component tree
 * @internal
 */
const DROPDOWN_INJECTION_KEY: InjectionKey<DropdownContext> = Symbol('SpDropdown')

/**
 * Provider composable for managing dropdown state and behavior.
 * This should be used by the root SpDropdown component to establish the dropdown context.
 * 
 * @param {Object} props - Component props
 * @param {boolean} [props.modelValue] - v-model binding for open/closed state
 * @param {boolean} [props.disabled] - Whether the dropdown is disabled
 * @param {boolean} [props.closeOnSelect=true] - Whether to close dropdown when an item is selected
 * @param {string} [props.placement='bottom-start'] - Positioning placement for the dropdown
 * @param {Function} emit - Vue emit function for updating modelValue
 * 
 * @returns {Object} Extended dropdown context with additional methods:
 * - All properties and methods from DropdownContext
 * - handleKeyDown: Keyboard event handler for the dropdown container
 * - clearHoverTimeout: Clears any pending hover timeout
 * - setHoverTimeout: Sets a hover timeout with callback
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useDropdownProvider } from './useDropdown'
 * 
 * const props = defineProps<{
 *   modelValue?: boolean
 *   disabled?: boolean
 *   closeOnSelect?: boolean
 *   placement?: string
 * }>()
 * 
 * const emit = defineEmits<{
 *   'update:modelValue': [value: boolean]
 * }>()
 * 
 * const dropdown = useDropdownProvider(props, emit)
 * </script>
 * 
 * <template>
 *   <div @keydown="dropdown.handleKeyDown">
 *     <!-- Dropdown content -->
 *   </div>
 * </template>
 * ```
 */
export function useDropdownProvider(props: {
    modelValue?: boolean
    disabled?: boolean
    closeOnSelect?: boolean
    placement?: string
}, emit: (event: 'update:modelValue', value: boolean) => void) {
    // Initialize state using composables
    const state = useDropdownState(props)
    const refs = useDropdownRefs()
    const subMenuManager = useSubMenuManager()
    const hoverBehavior = useHoverBehavior()
    
    // Check if this is a sub-dropdown
    const parentDropdown = inject(DROPDOWN_INJECTION_KEY, null)

    // Core dropdown actions
    const open = () => {
        if (!state.disabled.value && !state.isOpen.value) {
            state.isOpen.value = true
            emit('update:modelValue', true)

            // Close sibling sub-menus if this is a sub-menu
            if (parentDropdown) {
                parentDropdown.closeAllSubMenus()
            }
        }
    }

    const close = () => {
        if (state.isOpen.value) {
            state.isOpen.value = false
            emit('update:modelValue', false)
            subMenuManager.closeAllSubMenus()

            // Don't return focus to trigger if this is a sub-menu closing
            if (!parentDropdown) {
                // Return focus to trigger for root dropdown
                setTimeout(() => {
                    refs.triggerRef.value?.focus()
                }, POSITIONING.FOCUS_RETURN_DELAY)
            }
        }
    }

    const toggle = () => {
        if (state.isOpen.value) {
            close()
        } else {
            open()
        }
    }

    const onItemClick = (_?: string) => {
        if (state.closeOnSelect.value) {
            // Close all dropdowns in the chain
            close()
            let parent = parentDropdown
            while (parent) {
                parent.close()
                parent = parent.parentDropdown
            }
        }
    }

    // Create dropdown actions
    const dropdownActions: DropdownActions = {
        open,
        close,
        toggle,
        onItemClick
    }

    // Watch for external modelValue changes
    watch(() => props.modelValue, (newValue) => {
        if (newValue !== undefined) {
            state.isOpen.value = newValue
        }
    })

    // Setup keyboard handling
    const keyboard = useDropdownKeyboard({
        isOpen: state.isOpen,
        parentDropdown,
        close
    })

    // Create complete context by combining all interfaces
    const context: DropdownContext = {
        // State
        ...state,
        // Refs
        ...refs,
        // Sub-menu management
        ...subMenuManager,
        // Actions
        ...dropdownActions,
        // Hover behavior
        ...hoverBehavior,
        // Parent reference
        parentDropdown
    }

    provide(DROPDOWN_INJECTION_KEY, context)

    return {
        ...context,
        handleKeyDown: keyboard.handleKeyDown
    }
}

/**
 * Consumer composable for accessing the dropdown context from child components.
 * This must be used within a component tree that has a SpDropdown provider.
 * 
 * @throws {Error} Throws an error if used outside of a SpDropdown component tree
 * 
 * @returns {DropdownContext} The dropdown context with all state and methods
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useDropdown } from './useDropdown'
 * 
 * // In a child component like SpDropdownItem
 * const dropdown = useDropdown()
 * 
 * const handleClick = () => {
 *   // Perform some action
 *   dropdown.onItemClick('item-value')
 * }
 * </script>
 * ```
 * 
 * @example
 * ```vue
 * <script setup>
 * // In SpDropdownTrigger component
 * const dropdown = useDropdown()
 * 
 * const handleKeyDown = (event: KeyboardEvent) => {
 *   if (event.key === 'Enter') {
 *     dropdown.toggle()
 *   }
 * }
 * </script>
 * ```
 */
export function useDropdown() {
    const context = inject(DROPDOWN_INJECTION_KEY)

    if (!context) {
        throw new Error(
            'useDropdown() must be used within a SpDropdown component. ' +
            'Make sure this component is used as a child of <SpDropdown>.'
        )
    }

    return context
}