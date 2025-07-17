import { computed, watch, type Ref } from 'vue'
import type { SpDropdownSubProps, SpDropdownSubEmits } from '../dropdown.types'

/**
 * Composable for managing sub-menu state and behavior
 */
export function useDropdownSub(
  props: SpDropdownSubProps,
  emit: SpDropdownSubEmits,
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