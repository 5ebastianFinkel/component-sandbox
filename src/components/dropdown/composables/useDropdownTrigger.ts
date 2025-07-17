import { computed, nextTick, type Ref } from 'vue'
import type { SpDropdownTriggerProps } from '../dropdown.types'

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
 * Composable for trigger behavior and keyboard navigation
 */
export function useDropdownTrigger(
  props: SpDropdownTriggerProps,
  context: DropdownTriggerContext
) {
  // Compute trigger classes
  const triggerClasses = computed(() => [
    'sp-dropdown__trigger',
    {
      'sp-dropdown__trigger--open': context.isOpen.value,
      'sp-dropdown__trigger--disabled': context.disabled.value
    }
  ])

  // Compute slot props for asChild pattern
  const slotProps = computed(() => ({
    id: context.triggerId.value,
    'aria-expanded': context.isOpen.value,
    'aria-haspopup': 'true',
    'aria-controls': context.contentId.value,
    disabled: context.disabled.value,
    class: triggerClasses.value
  }))

  // Focus management functions
  const focusFirstItem = () => {
    const firstItem = context.contentRef.value?.querySelector('[role="menuitem"]:not([disabled])') as HTMLElement
    firstItem?.focus()
  }

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