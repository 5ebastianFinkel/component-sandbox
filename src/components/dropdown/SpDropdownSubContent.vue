<template>
  <div
      v-if="triggerRef"
      :id="contentId"
      ref="contentElement"
      :class="[
      'sp-dropdown__content',
      'sp-dropdown__sub-content',
      `sp-dropdown__sub-content--align-${align}`
    ]"
      role="menu"
      :aria-labelledby="triggerId"
      popover="manual"
      @keydown="handleKeyDown"
      @toggle="handlePopoverToggle"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useDropdown } from './useDropdown'
import type { SpDropdownSubContentProps, ToggleEvent } from './dropdown.types'

/**
 * SpDropdownSubContent Komponente
 * Container für Sub-Menü Inhalte mit Popover API
 *
 * @example
 * <SpDropdownSubContent>
 *   <SpDropdownItem>Sub Option 1</SpDropdownItem>
 *   <SpDropdownItem>Sub Option 2</SpDropdownItem>
 * </SpDropdownSubContent>
 */
const props = withDefaults(defineProps<SpDropdownSubContentProps>(), {
  align: 'start',
  sideOffset: 4,
  avoidCollisions: true
})

const {
  isOpen,
  contentId,
  triggerId,
  contentRef,
  triggerRef,
  close
} = useDropdown()

const contentElement = ref<HTMLElement>()

// Register content ref and setup popover
onMounted(() => {
  if (contentElement.value) {
    contentRef.value = contentElement.value
    setupPopoverPosition()
  }
})

// Setup popover positioning for sub-menu (to the side)
const setupPopoverPosition = () => {
  if (!contentElement.value || !triggerRef.value) return

  // Set anchor element for popover positioning
  if ('anchorElement' in HTMLElement.prototype) {
    // Use native anchor positioning when available
    ;(contentElement.value as any).anchorElement = triggerRef.value

    // Apply CSS anchor positioning
    const anchorName = `dropdown-sub-trigger-${contentId.value}`
    triggerRef.value.style.anchorName = `--${anchorName}`
    contentElement.value.style.positionAnchor = `--${anchorName}`

    // Position to the right of trigger by default
    contentElement.value.style.left = `anchor(right)`
    contentElement.value.style.marginLeft = `${props.sideOffset}px`

    // Vertical alignment based on align prop
    switch (props.align) {
      case 'start':
        contentElement.value.style.top = `anchor(top)`
        break
      case 'center':
        contentElement.value.style.top = `anchor(center)`
        contentElement.value.style.translate = '0 -50%'
        break
      case 'end':
        contentElement.value.style.bottom = `anchor(bottom)`
        break
    }
  } else {
    // Fallback positioning for browsers without anchor support
    setupFallbackPosition()
  }
}

// Fallback positioning without anchor API
const setupFallbackPosition = () => {
  if (!contentElement.value || !triggerRef.value) return

  const updatePosition = () => {
    const triggerRect = triggerRef.value!.getBoundingClientRect()
    const contentRect = contentElement.value!.getBoundingClientRect()

    // Position to the right by default
    let left = triggerRect.right + props.sideOffset
    let top = triggerRect.top

    // Vertical alignment
    switch (props.align) {
      case 'center':
        top = triggerRect.top + (triggerRect.height - contentRect.height) / 2
        break
      case 'end':
        top = triggerRect.bottom - contentRect.height
        break
    }

    // Collision detection
    if (props.avoidCollisions) {
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // If would overflow right, show on left instead
      if (left + contentRect.width > viewportWidth - 8) {
        left = triggerRect.left - contentRect.width - props.sideOffset
      }

      // Vertical collision
      if (top + contentRect.height > viewportHeight - 8) {
        top = viewportHeight - contentRect.height - 8
      }
      if (top < 8) {
        top = 8
      }
    }

    contentElement.value!.style.setProperty('--dropdown-fallback-left', `${left}px`)
    contentElement.value!.style.setProperty('--dropdown-fallback-top', `${top}px`)
  }

  // Update position when opening
  if (isOpen.value) {
    updatePosition()
  }
}

// Control popover visibility
watch(isOpen, async (open) => {
  await nextTick()

  if (!contentElement.value) return

  if (open) {
    // Setup fallback position if needed
    if (!('anchorElement' in HTMLElement.prototype)) {
      setupFallbackPosition()
    }

    contentElement.value.showPopover()
    focusFirstItem()
  } else {
    if (contentElement.value.matches(':popover-open')) {
      contentElement.value.hidePopover()
    }
  }
})

// Handle popover toggle event
const handlePopoverToggle = (event: Event) => {
  // Check if this is a ToggleEvent (Popover API)
  if ('newState' in event && (event as ToggleEvent).newState === 'closed' && isOpen.value) {
    close()
  }
}

const focusFirstItem = () => {
  const firstItem = contentElement.value?.querySelector('[role="menuitem"]:not([disabled])') as HTMLElement
  firstItem?.focus()
}

const focusLastItem = () => {
  const items = contentElement.value?.querySelectorAll('[role="menuitem"]:not([disabled])')
  const lastItem = items?.[items.length - 1] as HTMLElement
  lastItem?.focus()
}

const focusNextItem = () => {
  const items = Array.from(contentElement.value?.querySelectorAll('[role="menuitem"]:not([disabled])') || [])
  const currentIndex = items.findIndex(item => item === document.activeElement)
  const nextIndex = (currentIndex + 1) % items.length
  ;(items[nextIndex] as HTMLElement)?.focus()
}

const focusPreviousItem = () => {
  const items = Array.from(contentElement.value?.querySelectorAll('[role="menuitem"]:not([disabled])') || [])
  const currentIndex = items.findIndex(item => item === document.activeElement)
  const previousIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1
  ;(items[previousIndex] as HTMLElement)?.focus()
}

const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      focusNextItem()
      break
    case 'ArrowUp':
      event.preventDefault()
      focusPreviousItem()
      break
    case 'Home':
      event.preventDefault()
      focusFirstItem()
      break
    case 'End':
      event.preventDefault()
      focusLastItem()
      break
    case 'Tab':
      // Close on tab to maintain normal tab flow
      event.preventDefault()
      close()
      break
  }
}
</script>

<style scoped lang="scss">
.sp-dropdown__sub-content {
  // Reset popover styles
  margin: 0;
  padding: var(--spacing-xs, 0.25rem);
  border: 0;

  // Position will be handled by popover + anchor positioning
  position: fixed;
  inset: unset;

  min-width: 180px;
  max-width: 320px;
  max-height: var(--popover-available-height, 400px);
  overflow-y: auto;

  background-color: var(--surface-default);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-medium);
  box-shadow: 0 4px 6px -1px var(--color-box-shadow);

  // Popover animation for sub-menus (slide from side)
  opacity: 0;
  transform: translateX(-4px);
  transition:
      opacity 0.15s ease,
      transform 0.15s ease,
      overlay 0.15s ease allow-discrete,
      display 0.15s ease allow-discrete;

  &:popover-open {
    opacity: 1;
    transform: translateX(0);
  }

  @starting-style {
    &:popover-open {
      opacity: 0;
      transform: translateX(-4px);
    }
  }

  &:focus {
    outline: none;
  }

  // Fallback for browsers without anchor positioning
  @supports not (anchor-name: --foo) {
    top: var(--dropdown-fallback-top, auto);
    left: var(--dropdown-fallback-left, auto);
  }
}</style>