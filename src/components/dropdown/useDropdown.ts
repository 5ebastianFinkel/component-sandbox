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

const DROPDOWN_INJECTION_KEY: InjectionKey<DropdownContext> = Symbol('SpDropdown')

/**
 * Composable für die Verwaltung des Dropdown-Zustands
 * Wird vom SpDropdown Root-Component verwendet
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
 * Composable für Child-Components um auf den Dropdown-Context zuzugreifen
 * Wirft einen Fehler wenn außerhalb eines SpDropdown verwendet
 */
export function useDropdown() {
    const context = inject(DROPDOWN_INJECTION_KEY)

    if (!context) {
        throw new Error(
            'useDropdown() muss innerhalb einer SpDropdown Komponente verwendet werden. ' +
            'Stellen Sie sicher, dass diese Komponente als Kind von <SpDropdown> verwendet wird.'
        )
    }

    return context
}