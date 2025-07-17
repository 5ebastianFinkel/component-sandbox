import { ref, computed, nextTick, type Ref } from 'vue'
import type { SpDropdownSubTriggerProps } from '../dropdown.types'

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
 * Composable for sub-trigger behavior and keyboard navigation
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
    },
    props.class
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