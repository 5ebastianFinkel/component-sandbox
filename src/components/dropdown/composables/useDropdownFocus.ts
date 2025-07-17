import { type Ref } from 'vue'

export interface DropdownFocusOptions {
  focusableSelector?: string
  wrapFocus?: boolean
}

export function useDropdownFocus(
  containerElement: Ref<HTMLElement | null>,
  options: DropdownFocusOptions = {}
) {
  const {
    focusableSelector = '[role="menuitem"]:not([disabled])',
    wrapFocus = true
  } = options

  // Get all focusable items within the container
  const getFocusableItems = (): HTMLElement[] => {
    if (!containerElement.value) return []
    
    return Array.from(
      containerElement.value.querySelectorAll(focusableSelector)
    ) as HTMLElement[]
  }

  // Get the currently focused item index
  const getCurrentIndex = (): number => {
    const items = getFocusableItems()
    return items.findIndex(item => item === document.activeElement)
  }

  // Focus a specific item by index
  const focusItem = (index: number): void => {
    const items = getFocusableItems()
    if (items.length === 0) return

    // Handle wrapping
    let targetIndex = index
    if (wrapFocus) {
      targetIndex = ((index % items.length) + items.length) % items.length
    } else {
      targetIndex = Math.max(0, Math.min(index, items.length - 1))
    }

    items[targetIndex]?.focus()
  }

  // Focus the first item
  const focusFirst = (): void => {
    focusItem(0)
  }

  // Focus the last item
  const focusLast = (): void => {
    const items = getFocusableItems()
    focusItem(items.length - 1)
  }

  // Focus the next item
  const focusNext = (): void => {
    const currentIndex = getCurrentIndex()
    const nextIndex = currentIndex === -1 ? 0 : currentIndex + 1
    focusItem(nextIndex)
  }

  // Focus the previous item
  const focusPrevious = (): void => {
    const currentIndex = getCurrentIndex()
    const items = getFocusableItems()
    const previousIndex = currentIndex === -1 
      ? items.length - 1 
      : currentIndex - 1
    focusItem(previousIndex)
  }

  // Find and focus an item by text content (for keyboard shortcuts)
  const focusByText = (searchText: string): boolean => {
    const items = getFocusableItems()
    const searchLower = searchText.toLowerCase()
    
    // First try to find items starting with the search text
    let foundItem = items.find(item => 
      item.textContent?.toLowerCase().startsWith(searchLower)
    )
    
    // If not found, try to find items containing the search text
    if (!foundItem) {
      foundItem = items.find(item => 
        item.textContent?.toLowerCase().includes(searchLower)
      )
    }
    
    if (foundItem) {
      foundItem.focus()
      return true
    }
    
    return false
  }

  // Check if focus is within the container
  const hasFocus = (): boolean => {
    return containerElement.value?.contains(document.activeElement) ?? false
  }

  // Get the index of a specific item
  const getItemIndex = (item: HTMLElement): number => {
    const items = getFocusableItems()
    return items.indexOf(item)
  }

  // Focus management for keyboard navigation
  const handleArrowNavigation = (direction: 'up' | 'down' | 'left' | 'right'): void => {
    switch (direction) {
      case 'down':
      case 'right':
        focusNext()
        break
      case 'up':
      case 'left':
        focusPrevious()
        break
    }
  }

  return {
    // Core focus methods
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    focusItem,
    
    // Utility methods
    getFocusableItems,
    getCurrentIndex,
    focusByText,
    hasFocus,
    getItemIndex,
    handleArrowNavigation
  }
}