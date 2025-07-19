import {
    ref,
    computed,
    provide,
    inject,
    watch,
    onUnmounted,
    type InjectionKey,
    type Ref
} from 'vue'

/**
 * Context interface for dropdown components, providing all necessary state and methods
 * for managing dropdown behavior, including sub-menus and keyboard navigation.
 * 
 * @interface DropdownContext
 * @property {Ref<boolean>} isOpen - Current open/closed state of the dropdown
 * @property {Ref<string>} triggerId - Unique ID for the trigger element (for accessibility)
 * @property {Ref<string>} contentId - Unique ID for the content element (for accessibility)
 * @property {Ref<HTMLElement | null>} triggerRef - Reference to the trigger DOM element
 * @property {Ref<HTMLElement | null>} contentRef - Reference to the content DOM element
 * @property {Ref<boolean>} disabled - Whether the dropdown is disabled
 * @property {Ref<boolean>} closeOnSelect - Whether to close dropdown when an item is selected
 * @property {Ref<string>} placement - Positioning placement (e.g., 'bottom-start', 'top-end')
 * @property {Ref<string | null>} activeSubMenu - ID of currently active sub-menu (if any)
 * @property {DropdownContext | null} parentDropdown - Parent dropdown context for nested dropdowns
 * @property {Ref<number | null>} hoverTimeout - Timeout ID for hover behavior management
 * @property {() => void} open - Opens the dropdown
 * @property {() => void} close - Closes the dropdown and all sub-menus
 * @property {() => void} toggle - Toggles the dropdown open/closed state
 * @property {(value?: string) => void} onItemClick - Handles item selection, optionally with a value
 * @property {(id: string) => void} registerSubMenu - Registers a sub-menu with this dropdown
 * @property {(id: string) => void} unregisterSubMenu - Unregisters a sub-menu
 * @property {(id: string) => void} openSubMenu - Opens a specific sub-menu by ID
 * @property {(id: string) => void} closeSubMenu - Closes a specific sub-menu by ID
 * @property {() => void} closeAllSubMenus - Closes all sub-menus
 * @property {() => void} clearHoverTimeout - Clears any pending hover timeout
 * @property {(callback: () => void, delay: number) => void} setHoverTimeout - Sets a hover timeout with callback
 */
export interface DropdownContext {
    isOpen: Ref<boolean>
    triggerId: Ref<string>
    contentId: Ref<string>
    triggerRef: Ref<HTMLElement | null>
    contentRef: Ref<HTMLElement | null>
    disabled: Ref<boolean>
    closeOnSelect: Ref<boolean>
    placement: Ref<string>
    activeSubMenu: Ref<string | null>
    parentDropdown: DropdownContext | null
    hoverTimeout: Ref<number | null>
    open: () => void
    close: () => void
    toggle: () => void
    onItemClick: (value?: string) => void
    registerSubMenu: (id: string) => void
    unregisterSubMenu: (id: string) => void
    openSubMenu: (id: string) => void
    closeSubMenu: (id: string) => void
    closeAllSubMenus: () => void
    clearHoverTimeout: () => void
    setHoverTimeout: (callback: () => void, delay: number) => void
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
    // State
    const isOpen = ref(props.modelValue ?? false)
    const triggerId = ref(`sp-dropdown-trigger-${Math.random().toString(36).substr(2, 9)}`)
    const contentId = ref(`sp-dropdown-content-${Math.random().toString(36).substr(2, 9)}`)
    const triggerRef = ref<HTMLElement | null>(null)
    const contentRef = ref<HTMLElement | null>(null)
    const disabled = computed(() => props.disabled ?? false)
    const closeOnSelect = computed(() => props.closeOnSelect ?? true)
    const placement = computed(() => props.placement ?? 'bottom-start')
    const activeSubMenu = ref<string | null>(null)
    const subMenus = ref<Set<string>>(new Set())
    const hoverTimeout = ref<number | null>(null)

    // Check if this is a sub-dropdown
    const parentDropdown = inject(DROPDOWN_INJECTION_KEY, null)

    // Methods
    const open = () => {
        if (!disabled.value && !isOpen.value) {
            isOpen.value = true
            emit('update:modelValue', true)

            // Close sibling sub-menus if this is a sub-menu
            if (parentDropdown) {
                parentDropdown.closeAllSubMenus()
            }
        }
    }

    const close = () => {
        if (isOpen.value) {
            isOpen.value = false
            emit('update:modelValue', false)
            closeAllSubMenus()

            // Don't return focus to trigger if this is a sub-menu closing
            if (!parentDropdown) {
                // Return focus to trigger for root dropdown
                setTimeout(() => {
                    triggerRef.value?.focus()
                }, 0)
            }
        }
    }

    const toggle = () => {
        if (isOpen.value) {
            close()
        } else {
            open()
        }
    }

    const onItemClick = (_?: string) => {
        if (closeOnSelect.value) {
            // Close all dropdowns in the chain
            close()
            let parent = parentDropdown
            while (parent) {
                parent.close()
                parent = parent.parentDropdown
            }
        }
    }

    // Sub-menu management
    const registerSubMenu = (id: string) => {
        subMenus.value.add(id)
    }

    const unregisterSubMenu = (id: string) => {
        subMenus.value.delete(id)
        if (activeSubMenu.value === id) {
            activeSubMenu.value = null
        }
    }

    const openSubMenu = (id: string) => {
        activeSubMenu.value = id
    }

    const closeSubMenu = (id: string) => {
        if (activeSubMenu.value === id) {
            activeSubMenu.value = null
        }
    }

    const closeAllSubMenus = () => {
        activeSubMenu.value = null
    }

    // Shared hover timeout management
    const clearHoverTimeout = () => {
        if (hoverTimeout.value) {
            clearTimeout(hoverTimeout.value)
            hoverTimeout.value = null
        }
    }

    const setHoverTimeout = (callback: () => void, delay: number) => {
        clearHoverTimeout()
        hoverTimeout.value = window.setTimeout(callback, delay)
    }

    // Watch for external modelValue changes
    watch(() => props.modelValue, (newValue) => {
        if (newValue !== undefined) {
            isOpen.value = newValue
        }
    })

    // Keyboard navigation
    const handleKeyDown = (event: KeyboardEvent) => {
        if (!isOpen.value) return

        switch (event.key) {
            case 'Escape':
                event.preventDefault()
                event.stopPropagation()
                close()
                break
            case 'Tab':
                // Let Tab work normally but close dropdown
                close()
                break
            case 'ArrowLeft':
                // Close sub-menu and return to parent
                if (parentDropdown) {
                    event.preventDefault()
                    close()
                }
                break
        }
    }

    // Provide context
    const context: DropdownContext = {
        isOpen,
        triggerId,
        contentId,
        triggerRef,
        contentRef,
        disabled,
        closeOnSelect,
        placement,
        activeSubMenu,
        parentDropdown,
        hoverTimeout,
        open,
        close,
        toggle,
        onItemClick,
        registerSubMenu,
        unregisterSubMenu,
        openSubMenu,
        closeSubMenu,
        closeAllSubMenus,
        clearHoverTimeout,
        setHoverTimeout
    }

    provide(DROPDOWN_INJECTION_KEY, context)

    // Cleanup on unmount
    onUnmounted(() => {
        clearHoverTimeout()
    })

    return {
        ...context,
        handleKeyDown,
        clearHoverTimeout,
        setHoverTimeout
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