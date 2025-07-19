import { KEYS } from '../constants/dropdown.constants'

/**
 * Context required for keyboard navigation
 * @interface KeyboardContext
 */
interface KeyboardContext {
  isOpen: { value: boolean }
  parentDropdown: KeyboardContext | null
  close: () => void
}

/**
 * Composable for centralized keyboard event handling in dropdowns.
 * Manages keyboard navigation and interactions consistently across all dropdown components.
 * 
 * @param {KeyboardContext} context - Dropdown context with required methods
 * 
 * @returns {Object} Keyboard utilities:
 * - handleKeyDown: Main keyboard event handler
 * - keyHandlers: Map of key handlers for extensibility
 * 
 * @example
 * ```typescript
 * const keyboard = useDropdownKeyboard({
 *   isOpen: dropdown.isOpen,
 *   parentDropdown: dropdown.parentDropdown,
 *   close: dropdown.close
 * })
 * 
 * // In template
 * <div @keydown="keyboard.handleKeyDown">
 *   <!-- Dropdown content -->
 * </div>
 * ```
 * 
 * @example
 * ```typescript
 * // Extending keyboard handlers
 * const keyboard = useDropdownKeyboard(context)
 * 
 * // Add custom handler
 * keyboard.keyHandlers.set('a', (event) => {
 *   event.preventDefault()
 *   selectAll()
 * })
 * ```
 */
export function useDropdownKeyboard(context: KeyboardContext) {
  /**
   * Handle Escape key - close the dropdown
   */
  const handleEscape = (event: KeyboardEvent) => {
    event.preventDefault()
    event.stopPropagation()
    context.close()
  }
  
  /**
   * Handle Tab key - close dropdown to allow normal tab flow
   */
  const handleTab = (_: KeyboardEvent) => {
    context.close()
  }
  
  /**
   * Handle ArrowLeft key - close sub-menu and return to parent
   */
  const handleArrowLeft = (event: KeyboardEvent) => {
    if (context.parentDropdown) {
      event.preventDefault()
      context.close()
    }
  }
  
  /**
   * Map of keyboard handlers for easy extension and customization
   */
  const keyHandlers = new Map<string, (event: KeyboardEvent) => void>([
    [KEYS.ESCAPE, handleEscape],
    [KEYS.TAB, handleTab],
    [KEYS.ARROW_LEFT, handleArrowLeft],
  ])
  
  /**
   * Main keyboard event handler
   * Delegates to specific handlers based on key pressed
   * 
   * @param {KeyboardEvent} event - The keyboard event
   */
  const handleKeyDown = (event: KeyboardEvent) => {
    // Only handle events when dropdown is open
    if (!context.isOpen.value) return
    
    const handler = keyHandlers.get(event.key)
    if (handler) {
      handler(event)
    }
  }
  
  return {
    handleKeyDown,
    keyHandlers
  }
}