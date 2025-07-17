import { type Ref } from 'vue'
import type { ToggleEvent } from '../dropdown.types'

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

  // Handle popover toggle event from the Popover API
  const handlePopoverToggle = (event: Event) => {
    // Check if this is a ToggleEvent (Popover API)
    if ('newState' in event && (event as ToggleEvent).newState === 'closed' && isOpen.value) {
      close()
    }
  }

  // Handle keyboard navigation within the dropdown
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

  // Handle click events on menu items
  const handleItemClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    const menuItem = target.closest('[role="menuitem"]') as HTMLElement

    if (menuItem && !menuItem.hasAttribute('disabled')) {
      onItemSelect?.(menuItem)
    }
  }

  // Handle mouse enter events for hover effects
  const handleMouseEnter = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    const menuItem = target.closest('[role="menuitem"]') as HTMLElement

    if (menuItem && !menuItem.hasAttribute('disabled')) {
      menuItem.focus()
    }
  }

  // Control popover visibility programmatically
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

  // Check if popover is open
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