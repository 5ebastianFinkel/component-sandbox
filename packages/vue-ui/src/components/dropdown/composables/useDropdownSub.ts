import { computed, watch, type Ref } from 'vue'
import type { SpDropdownSubProps, SpDropdownSubEmits } from '../dropdown.types'

/**
 * Composable for managing sub-menu state and behavior in nested dropdowns.
 * Handles registration with parent dropdown, state management, and keyboard navigation.
 * 
 * @param {SpDropdownSubProps} props - Component props for sub-dropdown
 * @param {SpDropdownSubEmits} emit - Vue emit function
 * @param {any} parentDropdown - Parent dropdown context (DropdownContext type)
 * @param {string} subMenuId - Unique identifier for this sub-menu
 * 
 * @returns {Object} Sub-menu management utilities:
 * - isActive: Whether this sub-menu is the active one in parent
 * - isOpen: Whether this sub-menu is currently open
 * - disabled: Whether this sub-menu is disabled
 * - subMenuClasses: Computed CSS classes for styling
 * - handleKeyDown: Keyboard event handler
 * - cleanup: Function to unregister from parent on unmount
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useDropdownSub } from './useDropdownSub'
 * import { useDropdown } from '../useDropdown'
 * 
 * const props = defineProps<SpDropdownSubProps>()
 * const emit = defineEmits<SpDropdownSubEmits>()
 * 
 * const parentDropdown = useDropdown()
 * const subMenuId = `sub-${Math.random()}`
 * 
 * const sub = useDropdownSub(props, emit, parentDropdown, subMenuId)
 * 
 * onUnmounted(() => {
 *   sub.cleanup()
 * })
 * </script>
 * 
 * <template>
 *   <div 
 *     :class="sub.subMenuClasses"
 *     @keydown="sub.handleKeyDown"
 *   >
 *     <!-- Sub-menu content -->
 *   </div>
 * </template>
 * ```
 */
export function useDropdownSub(
  props: SpDropdownSubProps,
  emit: (event: 'update:modelValue', value: boolean) => void,
  parentDropdown: any, // Type will be DropdownContext
  subMenuId: string
) {
  // Register this sub-menu with parent
  parentDropdown.registerSubMenu(subMenuId)
  
  // Cleanup function
  const cleanup = () => {
    parentDropdown.unregisterSubMenu(subMenuId)
  }
  
  // Computed state
  const isActive = computed(() => parentDropdown.activeSubMenu.value === subMenuId)
  const isOpen = computed(() => isActive.value && !props.disabled)
  const disabled = computed(() => props.disabled || parentDropdown.disabled.value)
  
  const subMenuClasses = computed(() => [
    'sp-dropdown-sub',
    {
      'sp-dropdown-sub--active': isActive.value,
      'sp-dropdown-sub--disabled': disabled.value
    }
  ])
  
  // Handle keyboard events
  const handleKeyDown = (event: KeyboardEvent) => {
    if (disabled.value) return
    
    switch (event.key) {
      case 'Escape':
        if (isOpen.value) {
          event.preventDefault()
          event.stopPropagation()
          parentDropdown.closeSubMenu(subMenuId)
        }
        break
      case 'ArrowLeft':
        // Close sub-menu and focus parent trigger
        if (isOpen.value) {
          event.preventDefault()
          event.stopPropagation()
          parentDropdown.closeSubMenu(subMenuId)
        }
        break
    }
  }
  
  // Watch for external model value changes
  watch(() => props.modelValue, (newValue) => {
    if (newValue !== isOpen.value) {
      if (newValue) {
        parentDropdown.openSubMenu(subMenuId)
      } else {
        parentDropdown.closeSubMenu(subMenuId)
      }
    }
  })
  
  return {
    isActive,
    isOpen,
    disabled,
    subMenuClasses,
    handleKeyDown,
    cleanup
  }
}