import { ref, computed, type Ref, type ComputedRef } from 'vue'
import type { DropdownState } from '../useDropdown'
import { DROPDOWN_DEFAULTS } from '../constants/dropdown.constants'

/**
 * Props interface for dropdown state
 */
interface DropdownStateProps {
  modelValue?: boolean
  disabled?: boolean
  closeOnSelect?: boolean
  placement?: string
}

/**
 * Composable for managing core dropdown state.
 * Handles the reactive state properties that control dropdown behavior.
 * 
 * @param {DropdownStateProps} props - Component props
 * 
 * @returns {DropdownState} Reactive dropdown state
 * 
 * @example
 * ```typescript
 * const state = useDropdownState({
 *   modelValue: false,
 *   disabled: false,
 *   closeOnSelect: true,
 *   placement: 'bottom-start'
 * })
 * 
 * // Access state
 * if (state.isOpen.value) {
 *   console.log('Dropdown is open')
 * }
 * 
 * // State is reactive
 * state.isOpen.value = true // Opens dropdown
 * ```
 */
export function useDropdownState(props: DropdownStateProps): DropdownState {
  // Initialize reactive state
  const isOpen = ref(props.modelValue ?? false)
  
  // Computed properties with defaults
  const disabled = computed(() => props.disabled ?? false)
  const closeOnSelect = computed(() => props.closeOnSelect ?? DROPDOWN_DEFAULTS.CLOSE_ON_SELECT)
  const placement = computed(() => props.placement ?? DROPDOWN_DEFAULTS.PLACEMENT)
  
  return {
    isOpen,
    disabled: disabled as ComputedRef<boolean>,
    closeOnSelect: closeOnSelect as ComputedRef<boolean>,
    placement: placement as ComputedRef<string>
  }
}