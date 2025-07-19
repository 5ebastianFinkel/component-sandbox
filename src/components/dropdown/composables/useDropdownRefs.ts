import { ref, type Ref } from 'vue'
import type { DropdownRefs } from '../useDropdown'
import { generateId } from '../utils/id'

/**
 * Composable for managing dropdown DOM element references and IDs.
 * Provides unique IDs for accessibility and refs for DOM element access.
 * 
 * @returns {DropdownRefs} DOM references and IDs
 * 
 * @example
 * ```typescript
 * const refs = useDropdownRefs()
 * 
 * // Use in template
 * <button :id="refs.triggerId.value">
 *   Trigger
 * </button>
 * 
 * <div 
 *   :id="refs.contentId.value"
 *   :aria-labelledby="refs.triggerId.value"
 * >
 *   Content
 * </div>
 * 
 * // Register DOM elements
 * onMounted(() => {
 *   refs.triggerRef.value = triggerElement.value
 *   refs.contentRef.value = contentElement.value
 * })
 * ```
 */
export function useDropdownRefs(): DropdownRefs {
  // Generate unique IDs for accessibility
  const triggerId = ref(generateId('dropdown-trigger'))
  const contentId = ref(generateId('dropdown-content'))
  
  // DOM element references
  const triggerRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)
  
  return {
    triggerId: triggerId as Ref<string>,
    contentId: contentId as Ref<string>,
    triggerRef,
    contentRef
  }
}