import { ref, computed, nextTick, type Ref } from 'vue'
import type { SpDropdownSubTriggerProps } from '../dropdown.types'

/**
 * Context interface required for sub-trigger functionality
 * @interface DropdownSubTriggerContext
 */
interface DropdownSubTriggerContext {
  isOpen: Ref<boolean>
  triggerId: Ref<string>
  contentId: Ref<string>
  contentRef: Ref<HTMLElement | null>
  disabled: Ref<boolean>
  open: () => void
  close: () => void
  toggle: () => void
  clearHoverTimeout: () => void
  setHoverTimeout: (callback: () => void, delay: number) => void
}

/**
 * Composable for managing sub-menu trigger behavior including hover effects,
 * keyboard navigation, and accessibility features.
 * 
 * Features:
 * - Keyboard navigation (Enter/Space to open, arrows for navigation)
 * - Configurable hover behavior (immediate, delayed, or disabled)
 * - Focus management and visual feedback
 * - Accessibility attributes (ARIA)
 * 
 * @param {SpDropdownSubTriggerProps} props - Component props
 * @param {DropdownSubTriggerContext} context - Sub-dropdown context
 * 
 * @returns {Object} Sub-trigger management utilities:
 * - triggerClasses: Computed CSS classes based on state
 * - handleClick: Click event handler
 * - handleFocus: Focus event handler
 * - handleBlur: Blur event handler
 * - handleKeyDown: Keyboard navigation handler
 * - handleMouseEnter: Mouse enter handler for hover behavior
 * - handleMouseLeave: Mouse leave handler for hover behavior
 * - focusFirstSubMenuItem: Function to focus first item in sub-menu
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useDropdownSubTrigger } from './useDropdownSubTrigger'
 * 
 * const props = defineProps<SpDropdownSubTriggerProps>()
 * const context = useDropdown() // From parent
 * 
 * const trigger = useDropdownSubTrigger(props, context)
 * </script>
 * 
 * <template>
 *   <button
 *     :class="trigger.triggerClasses"
 *     @click="trigger.handleClick"
 *     @focus="trigger.handleFocus"
 *     @blur="trigger.handleBlur"
 *     @keydown="trigger.handleKeyDown"
 *     @mouseenter="trigger.handleMouseEnter"
 *     @mouseleave="trigger.handleMouseLeave"
 *   >
 *     <slot />
 *     <ChevronRightIcon />
 *   </button>
 * </template>
 * ```
 * 
 * @example
 * ```typescript
 * // Different hover behaviors
 * // Immediate open on hover
 * <SpDropdownSubTrigger hover-behavior="immediate">
 * 
 * // Delayed open (custom delays)
 * <SpDropdownSubTrigger 
 *   hover-behavior="delayed"
 *   :hover-open-delay="200"
 *   :hover-close-delay="400"
 * >
 * 
 * // Disabled hover (keyboard/click only)
 * <SpDropdownSubTrigger hover-behavior="disabled">
 * ```
 */
export function useDropdownSubTrigger(
  props: SpDropdownSubTriggerProps,
  context: DropdownSubTriggerContext
) {
  const isFocused = ref(false)
  
  const triggerClasses = computed(() => [
    'sp-dropdown__item',
    'sp-dropdown__sub-trigger',
    {
      'sp-dropdown__sub-trigger--open': context.isOpen.value,
      'sp-dropdown__sub-trigger--disabled': context.disabled.value,
      'sp-dropdown__sub-trigger--focused': isFocused.value
    }
  ])
  
  const handleClick = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    context.toggle()
  }
  
  const handleFocus = () => {
    isFocused.value = true
  }
  
  const handleBlur = () => {
    isFocused.value = false
  }
  
  const focusFirstSubMenuItem = () => {
    const subContent = context.contentRef.value
    if (subContent) {
      const firstItem = subContent.querySelector('[role="menuitem"]:not([disabled])') as HTMLElement
      firstItem?.focus()
    }
  }
  
  const handleKeyDown = (event: KeyboardEvent) => {
    if (context.disabled.value) return
    
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        event.stopPropagation()
        context.toggle()
        // Focus first item after opening
        if (!context.isOpen.value) {
          nextTick(() => {
            focusFirstSubMenuItem()
          })
        }
        break
      case 'ArrowRight':
        event.preventDefault()
        event.stopPropagation()
        if (!context.isOpen.value) {
          context.open()
          nextTick(() => {
            focusFirstSubMenuItem()
          })
        }
        break
      case 'ArrowLeft':
        event.preventDefault()
        event.stopPropagation()
        if (context.isOpen.value) {
          context.close()
        }
        break
      case 'Escape':
        if (context.isOpen.value) {
          event.preventDefault()
          event.stopPropagation()
          context.close()
        }
        break
      // Let ArrowUp/ArrowDown be handled by parent navigation
    }
  }
  
  const handleMouseEnter = () => {
    if (context.disabled.value || props.hoverBehavior === 'disabled') return
    
    context.clearHoverTimeout()
    
    const delay = props.hoverBehavior === 'immediate' ? 0 : (props.hoverOpenDelay || 100)
    
    context.setHoverTimeout(() => {
      if (!context.disabled.value && !context.isOpen.value) {
        context.open()
      }
    }, delay)
  }
  
  const handleMouseLeave = () => {
    if (context.disabled.value || props.hoverBehavior === 'disabled') return
    
    const delay = props.hoverBehavior === 'immediate' ? 0 : (props.hoverCloseDelay || 300)
    
    context.setHoverTimeout(() => {
      if (context.isOpen.value) {
        context.close()
      }
    }, delay)
  }
  
  return {
    triggerClasses,
    handleClick,
    handleFocus,
    handleBlur,
    handleKeyDown,
    handleMouseEnter,
    handleMouseLeave,
    focusFirstSubMenuItem
  }
}