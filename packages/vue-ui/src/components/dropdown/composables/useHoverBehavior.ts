import { ref, onUnmounted, type Ref } from 'vue'

/**
 * Composable for managing hover timeout behavior in dropdowns.
 * Provides a centralized way to handle hover delays for opening/closing sub-menus.
 * 
 * This composable ensures that:
 * - Only one timeout is active at a time
 * - Timeouts are properly cleaned up on unmount
 * - Hover behavior is consistent across components
 * 
 * @returns {Object} Hover behavior utilities:
 * - hoverTimeout: Ref to the current timeout ID
 * - clearHoverTimeout: Function to clear any pending timeout
 * - setHoverTimeout: Function to set a new timeout with callback
 * 
 * @example
 * ```typescript
 * const { clearHoverTimeout, setHoverTimeout } = useHoverBehavior()
 * 
 * // On mouse enter
 * clearHoverTimeout()
 * setHoverTimeout(() => {
 *   openSubMenu()
 * }, 200)
 * 
 * // On mouse leave
 * clearHoverTimeout()
 * setHoverTimeout(() => {
 *   closeSubMenu()
 * }, 500)
 * ```
 */
export function useHoverBehavior() {
  const hoverTimeout = ref<number | null>(null)
  
  /**
   * Clear any pending hover timeout
   */
  const clearHoverTimeout = () => {
    if (hoverTimeout.value) {
      clearTimeout(hoverTimeout.value)
      hoverTimeout.value = null
    }
  }
  
  /**
   * Set a new hover timeout with a callback
   * Automatically clears any existing timeout before setting a new one
   * 
   * @param {() => void} callback - Function to execute after the delay
   * @param {number} delay - Delay in milliseconds
   */
  const setHoverTimeout = (callback: () => void, delay: number) => {
    clearHoverTimeout()
    hoverTimeout.value = window.setTimeout(callback, delay)
  }
  
  // Cleanup on unmount
  onUnmounted(() => {
    clearHoverTimeout()
  })
  
  return {
    hoverTimeout: hoverTimeout as Ref<number | null>,
    clearHoverTimeout,
    setHoverTimeout
  }
}