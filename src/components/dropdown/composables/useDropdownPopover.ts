import { type Ref } from 'vue'
import type { ToggleEvent } from '../dropdown.types'

/**
 * Options for configuring popover behavior and interactions
 * 
 * @interface DropdownPopoverOptions
 * @property {Ref<boolean>} isOpen - Reactive reference to dropdown open state
 * @property {() => void} close - Function to close the dropdown
 * @property {() => void | Promise<void>} [updatePosition] - Function to update popover position
 * @property {() => void} [focusFirst] - Function to focus the first item
 * @property {() => void} [focusLast] - Function to focus the last item
 * @property {() => void} [focusNext] - Function to focus the next item
 * @property {() => void} [focusPrevious] - Function to focus the previous item
 * @property {(item: HTMLElement) => void} [onItemSelect] - Callback when an item is selected
 */
export interface DropdownPopoverOptions {
  isOpen: Ref<boolean>
  close: () => void
  updatePosition?: () => void | Promise<void>
  focusFirst?: () => void
  focusLast?: () => void
  focusNext?: () => void
  focusPrevious?: () => void
  onItemSelect?: (item: HTMLElement) => void
}

/**
 * Composable for managing popover behavior, including Popover API integration,
 * keyboard navigation, and event handling.
 * 
 * This composable provides:
 * - Integration with the native Popover API (with fallback)
 * - Keyboard navigation (arrows, home/end, tab, escape)
 * - Mouse interaction handling
 * - Type-ahead support foundation
 * 
 * @param {DropdownPopoverOptions} options - Configuration options
 * 
 * @returns {Object} Popover management utilities:
 * - handlePopoverToggle: Handler for popover toggle events
 * - handleKeyDown: Keyboard event handler for navigation
 * - handleItemClick: Click handler for menu items
 * - handleMouseEnter: Mouse enter handler for hover effects
 * - showPopover: Programmatically show the popover
 * - hidePopover: Programmatically hide the popover
 * - isPopoverOpen: Check if popover is currently open
 * 
 * @example
 * ```vue
 * <script setup>
 * import { ref } from 'vue'
 * import { useDropdownPopover } from './useDropdownPopover'
 * import { useDropdownFocus } from './useDropdownFocus'
 * 
 * const contentRef = ref<HTMLElement>()
 * const isOpen = ref(false)
 * 
 * const focus = useDropdownFocus(contentRef)
 * const popover = useDropdownPopover({
 *   isOpen,
 *   close: () => { isOpen.value = false },
 *   updatePosition: async () => { // position update logic },
 *   focusFirst: focus.focusFirst,
 *   focusNext: focus.focusNext,
 *   focusPrevious: focus.focusPrevious,
 *   onItemSelect: (item) => {
 *     console.log('Selected:', item.textContent)
 *   }
 * })
 * </script>
 * 
 * <template>
 *   <div
 *     ref="contentRef"
 *     popover="auto"
 *     @toggle="popover.handlePopoverToggle"
 *     @keydown="popover.handleKeyDown"
 *     @click="popover.handleItemClick"
 *   >
 *     <!-- Menu items -->
 *   </div>
 * </template>
 * ```
 * 
 * @example
 * ```typescript
 * // Programmatic control
 * const showDropdown = async () => {
 *   await popover.showPopover(contentElement)
 * }
 * 
 * const hideDropdown = () => {
 *   popover.hidePopover(contentElement)
 * }
 * 
 * // Check state
 * if (popover.isPopoverOpen(contentElement)) {
 *   console.log('Popover is open')
 * }
 * ```
 */
export function useDropdownPopover(options: DropdownPopoverOptions) {
  const {
    isOpen,
    close,
    updatePosition,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    onItemSelect
  } = options

  /**
   * Handle popover toggle event from the native Popover API.
   * Syncs popover state with internal dropdown state.
   * 
   * @param {Event} event - The toggle event from the Popover API
   */
  const handlePopoverToggle = (event: Event) => {
    // Check if this is a ToggleEvent (Popover API)
    if ('newState' in event && (event as ToggleEvent).newState === 'closed' && isOpen.value) {
      close()
    }
  }

  /**
   * Handle keyboard navigation within the dropdown.
   * Supports arrow navigation, home/end, tab, escape, and selection.
   * 
   * @param {KeyboardEvent} event - The keyboard event
   */
  const handleKeyDown = (event: KeyboardEvent) => {
    // Don't handle if the event is from an input or textarea
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        focusNext?.()
        break

      case 'ArrowUp':
        event.preventDefault()
        focusPrevious?.()
        break

      case 'Home':
        event.preventDefault()
        focusFirst?.()
        break

      case 'End':
        event.preventDefault()
        focusLast?.()
        break

      case 'Tab':
        // Close on tab to maintain normal tab flow
        event.preventDefault()
        close()
        break

      case 'Escape':
        // Close dropdown on escape
        event.preventDefault()
        event.stopPropagation()
        close()
        break

      case 'Enter':
      case ' ': // Space key
        // Handle item selection if the focused element is a menu item
        if (target.getAttribute('role') === 'menuitem') {
          event.preventDefault()
          onItemSelect?.(target)
        }
        break

      default:
        // Handle type-ahead functionality for single character keys
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
          // This could be implemented in the parent component
          // to search for items starting with the typed character
        }
        break
    }
  }

  /**
   * Handle click events on menu items.
   * Delegates to onItemSelect callback if the clicked element is a menu item.
   * 
   * @param {MouseEvent} event - The click event
   */
  const handleItemClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    const menuItem = target.closest('[role="menuitem"]') as HTMLElement

    if (menuItem && !menuItem.hasAttribute('disabled')) {
      onItemSelect?.(menuItem)
    }
  }

  /**
   * Handle mouse enter events for hover effects.
   * Focuses menu items on hover if they're not disabled.
   * 
   * @param {MouseEvent} event - The mouse enter event
   */
  const handleMouseEnter = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    const menuItem = target.closest('[role="menuitem"]') as HTMLElement

    if (menuItem && !menuItem.hasAttribute('disabled')) {
      menuItem.focus()
    }
  }

  /**
   * Show the popover programmatically using the Popover API.
   * Updates position and focuses first item after showing.
   * 
   * @param {HTMLElement} element - The popover element to show
   * @returns {Promise<void>}
   */
  const showPopover = async (element: HTMLElement) => {
    if (!element || !element.showPopover) return

    try {
      element.showPopover()
      // Update position after showing
      if (updatePosition) {
        await updatePosition()
      }
      // Focus first item after showing
      focusFirst?.()
    } catch (error) {
      // Handle browsers that don't support popover API
      console.warn('Popover API not supported:', error)
    }
  }

  /**
   * Hide the popover programmatically using the Popover API.
   * Only hides if the popover is currently open.
   * 
   * @param {HTMLElement} element - The popover element to hide
   */
  const hidePopover = (element: HTMLElement) => {
    if (!element || !element.hidePopover) return

    try {
      if (element.matches(':popover-open')) {
        element.hidePopover()
      }
    } catch (error) {
      // Handle browsers that don't support popover API
      console.warn('Popover API not supported:', error)
    }
  }

  /**
   * Check if the popover is currently open using the :popover-open pseudo-class.
   * Falls back gracefully for browsers without Popover API support.
   * 
   * @param {HTMLElement} element - The popover element to check
   * @returns {boolean} True if the popover is open
   */
  const isPopoverOpen = (element: HTMLElement): boolean => {
    if (!element || !element.matches) return false

    try {
      return element.matches(':popover-open')
    } catch {
      return false
    }
  }

  return {
    // Event handlers
    handlePopoverToggle,
    handleKeyDown,
    handleItemClick,
    handleMouseEnter,

    // Popover control methods
    showPopover,
    hidePopover,
    isPopoverOpen
  }
}