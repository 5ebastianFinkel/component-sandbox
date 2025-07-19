import { computed, nextTick, type Ref } from 'vue'
import type { SpDropdownTriggerProps } from '../dropdown.types'

/**
 * Context interface required for trigger functionality
 * @interface DropdownTriggerContext
 */
interface DropdownTriggerContext {
  isOpen: Ref<boolean>
  triggerId: Ref<string>
  contentId: Ref<string>
  contentRef: Ref<HTMLElement | null>
  disabled: Ref<boolean>
  toggle: () => void
  open: () => void
  close: () => void
}

/**
 * Composable for managing dropdown trigger behavior, keyboard navigation,
 * and accessibility attributes.
 * 
 * Features:
 * - Keyboard support (Enter/Space to toggle, arrows to open and focus)
 * - ARIA attributes for accessibility
 * - Support for asChild pattern with slot props
 * - Focus management for menu items
 * 
 * @param {SpDropdownTriggerProps} props - Component props
 * @param {DropdownTriggerContext} context - Dropdown context from parent
 * 
 * @returns {Object} Trigger management utilities:
 * - triggerClasses: Computed CSS classes based on state
 * - slotProps: Props to spread on custom trigger elements (asChild pattern)
 * - handleClick: Click event handler
 * - handleKeyDown: Keyboard event handler
 * - focusFirstItem: Function to focus first menu item
 * - focusLastItem: Function to focus last menu item
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useDropdownTrigger } from './useDropdownTrigger'
 * import { useDropdown } from '../useDropdown'
 * 
 * const props = defineProps<SpDropdownTriggerProps>()
 * const dropdown = useDropdown()
 * const trigger = useDropdownTrigger(props, dropdown)
 * </script>
 * 
 * <template>
 *   <!-- Default trigger button -->
 *   <button
 *     v-if="!asChild"
 *     :class="trigger.triggerClasses"
 *     @click="trigger.handleClick"
 *     @keydown="trigger.handleKeyDown"
 *   >
 *     <slot />
 *   </button>
 *   
 *   <!-- Custom trigger with asChild pattern -->
 *   <slot
 *     v-else
 *     v-bind="trigger.slotProps"
 *     @click="trigger.handleClick"
 *     @keydown="trigger.handleKeyDown"
 *   />
 * </template>
 * ```
 * 
 * @example
 * ```vue
 * <!-- Usage with custom trigger element -->
 * <SpDropdownTrigger as-child>
 *   <CustomButton>
 *     Options
 *     <ChevronDownIcon />
 *   </CustomButton>
 * </SpDropdownTrigger>
 * ```
 */
export function useDropdownTrigger(
  props: SpDropdownTriggerProps,
  context: DropdownTriggerContext
) {
  /**
   * Computed CSS classes for the trigger element
   */
  const triggerClasses = computed(() => [
    'sp-dropdown__trigger',
    {
      'sp-dropdown__trigger--open': context.isOpen.value,
      'sp-dropdown__trigger--disabled': context.disabled.value
    }
  ])

  /**
   * Props to spread on custom trigger elements when using asChild pattern.
   * Includes all necessary ARIA attributes and event handlers.
   */
  const slotProps = computed(() => ({
    id: context.triggerId.value,
    'aria-expanded': context.isOpen.value,
    'aria-haspopup': 'true',
    'aria-controls': context.contentId.value,
    disabled: context.disabled.value,
    class: triggerClasses.value
  }))

  /**
   * Focus the first menu item in the dropdown content
   */
  const focusFirstItem = () => {
    const firstItem = context.contentRef.value?.querySelector('[role="menuitem"]:not([disabled])') as HTMLElement
    firstItem?.focus()
  }

  /**
   * Focus the last menu item in the dropdown content
   */
  const focusLastItem = () => {
    const items = context.contentRef.value?.querySelectorAll('[role="menuitem"]:not([disabled])')
    const lastItem = items?.[items.length - 1] as HTMLElement
    lastItem?.focus()
  }

  const handleClick = (event: MouseEvent) => {
    event.preventDefault()
    context.toggle()
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        context.toggle()
        break
      case 'ArrowDown':
        event.preventDefault()
        if (!context.isOpen.value) {
          context.open()
        }
        // Focus first item after opening
        nextTick(() => {
          focusFirstItem()
        })
        break
      case 'ArrowUp':
        event.preventDefault()
        if (!context.isOpen.value) {
          context.open()
        }
        // Focus last item after opening
        nextTick(() => {
          focusLastItem()
        })
        break
      case 'Escape':
        if (context.isOpen.value) {
          event.preventDefault()
          context.close()
        }
        break
    }
  }

  return {
    triggerClasses,
    slotProps,
    handleClick,
    handleKeyDown,
    focusFirstItem,
    focusLastItem
  }
}