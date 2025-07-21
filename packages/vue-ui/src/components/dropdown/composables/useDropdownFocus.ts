import { type Ref } from 'vue'

/**
 * Options for configuring focus behavior within a dropdown menu
 * 
 * @interface DropdownFocusOptions
 * @property {string} [focusableSelector='[role="menuitem"]:not([disabled])'] - CSS selector for focusable elements
 * @property {boolean} [wrapFocus=true] - Whether focus should wrap from last to first item and vice versa
 */
export interface DropdownFocusOptions {
  focusableSelector?: string
  wrapFocus?: boolean
}

/**
 * Composable for managing focus and keyboard navigation within dropdown menus.
 * Provides comprehensive focus management including arrow navigation, type-ahead search,
 * and focus wrapping.
 * 
 * @param {Ref<HTMLElement | null>} containerElement - Reference to the container element (usually dropdown content)
 * @param {DropdownFocusOptions} [options={}] - Configuration options for focus behavior
 * 
 * @returns {Object} Focus management utilities:
 * - focusFirst: Focus the first focusable item
 * - focusLast: Focus the last focusable item
 * - focusNext: Focus the next item (with optional wrapping)
 * - focusPrevious: Focus the previous item (with optional wrapping)
 * - focusItem: Focus a specific item by index
 * - getFocusableItems: Get all focusable elements within the container
 * - getCurrentIndex: Get the index of the currently focused item
 * - focusByText: Find and focus an item by its text content
 * - hasFocus: Check if focus is within the container
 * - getItemIndex: Get the index of a specific item element
 * - handleArrowNavigation: Handle arrow key navigation
 * 
 * @example
 * ```vue
 * <script setup>
 * import { ref } from 'vue'
 * import { useDropdownFocus } from './useDropdownFocus'
 * 
 * const contentRef = ref<HTMLElement>()
 * const focus = useDropdownFocus(contentRef, {
 *   focusableSelector: 'button:not([disabled])',
 *   wrapFocus: true
 * })
 * 
 * // Handle keyboard navigation
 * const handleKeyDown = (event: KeyboardEvent) => {
 *   switch(event.key) {
 *     case 'ArrowDown':
 *       focus.focusNext()
 *       break
 *     case 'ArrowUp':
 *       focus.focusPrevious()
 *       break
 *     case 'Home':
 *       focus.focusFirst()
 *       break
 *     case 'End':
 *       focus.focusLast()
 *       break
 *   }
 * }
 * </script>
 * ```
 * 
 * @example
 * ```vue
 * <script setup>
 * // Type-ahead search example
 * let searchBuffer = ''
 * let searchTimeout: number | null = null
 * 
 * const handleKeyPress = (event: KeyboardEvent) => {
 *   if (event.key.length === 1) {
 *     searchBuffer += event.key
 *     focus.focusByText(searchBuffer)
 *     
 *     // Clear search buffer after 500ms
 *     if (searchTimeout) clearTimeout(searchTimeout)
 *     searchTimeout = setTimeout(() => {
 *       searchBuffer = ''
 *     }, 500)
 *   }
 * }
 * </script>
 * ```
 */
export function useDropdownFocus(
  containerElement: Ref<HTMLElement | null>,
  options: DropdownFocusOptions = {}
) {
  const {
    focusableSelector = '[role="menuitem"]:not([disabled])',
    wrapFocus = true
  } = options

  /**
   * Get all focusable items within the container
   * @returns {HTMLElement[]} Array of focusable elements
   */
  const getFocusableItems = (): HTMLElement[] => {
    if (!containerElement.value) return []
    
    return Array.from(
      containerElement.value.querySelectorAll(focusableSelector)
    ) as HTMLElement[]
  }

  /**
   * Get the index of the currently focused item
   * @returns {number} Index of focused item, or -1 if no item is focused
   */
  const getCurrentIndex = (): number => {
    const items = getFocusableItems()
    return items.findIndex(item => item === document.activeElement)
  }

  /**
   * Focus a specific item by index with optional wrapping
   * @param {number} index - The index of the item to focus
   */
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

  /**
   * Focus the first focusable item in the container
   */
  const focusFirst = (): void => {
    focusItem(0)
  }

  /**
   * Focus the last focusable item in the container
   */
  const focusLast = (): void => {
    const items = getFocusableItems()
    focusItem(items.length - 1)
  }

  /**
   * Focus the next item in the list, wrapping to first if at end (when wrapFocus is true)
   */
  const focusNext = (): void => {
    const currentIndex = getCurrentIndex()
    const nextIndex = currentIndex === -1 ? 0 : currentIndex + 1
    focusItem(nextIndex)
  }

  /**
   * Focus the previous item in the list, wrapping to last if at beginning (when wrapFocus is true)
   */
  const focusPrevious = (): void => {
    const currentIndex = getCurrentIndex()
    const items = getFocusableItems()
    const previousIndex = currentIndex === -1 
      ? items.length - 1 
      : currentIndex - 1
    focusItem(previousIndex)
  }

  /**
   * Find and focus an item by its text content. Useful for type-ahead functionality.
   * First tries to find items starting with the search text, then falls back to items containing it.
   * 
   * @param {string} searchText - The text to search for
   * @returns {boolean} True if an item was found and focused, false otherwise
   */
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

  /**
   * Check if focus is currently within the container
   * @returns {boolean} True if an element within the container has focus
   */
  const hasFocus = (): boolean => {
    return containerElement.value?.contains(document.activeElement) ?? false
  }

  /**
   * Get the index of a specific item element
   * @param {HTMLElement} item - The item element to find
   * @returns {number} The index of the item, or -1 if not found
   */
  const getItemIndex = (item: HTMLElement): number => {
    const items = getFocusableItems()
    return items.indexOf(item)
  }

  /**
   * Handle arrow key navigation with support for all four directions
   * @param {'up' | 'down' | 'left' | 'right'} direction - The arrow key direction
   */
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