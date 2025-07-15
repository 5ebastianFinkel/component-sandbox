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
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { onClickOutside } from '@vueuse/core'
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
const hoverTimeout = ref<number>()

// Register content ref and setup popover
onMounted(() => {
  if (contentElement.value) {
    contentRef.value = contentElement.value
  }
})

onUnmounted(() => {
  clearTimeout(hoverTimeout.value)
})


// Handle mouse events for submenu behavior
const handleMouseEnter = () => {
  clearTimeout(hoverTimeout.value)
}

const handleMouseLeave = () => {
  clearTimeout(hoverTimeout.value)
  hoverTimeout.value = window.setTimeout(() => {
    if (isOpen.value) {
      close()
    }
  }, 300) // Increased delay for better UX
}

// Handle click outside to close sub-dropdown - more permissive for submenus
onClickOutside(
  contentElement,
  (event) => {
    // Don't close if clicking on trigger or if mouse is still over trigger
    if (triggerRef.value && (
      triggerRef.value.contains(event.target as Node) ||
      triggerRef.value.matches(':hover')
    )) {
      return
    }
    
    if (isOpen.value) {
      close()
    }
  },
  {
    ignore: [triggerRef]
  }
)

// Position sub-dropdown using manual positioning
const updatePosition = () => {
  if (!contentElement.value || !triggerRef.value) return

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const contentRect = contentElement.value.getBoundingClientRect()

  let left = triggerRect.right + props.sideOffset
  let top = triggerRect.top

  // Vertical alignment based on align prop
  switch (props.align) {
    case 'start':
      top = triggerRect.top
      break
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

    // Horizontal collision - flip to left if would overflow right
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

  // Apply positioning
  contentElement.value.style.left = `${left}px`
  contentElement.value.style.top = `${top}px`
}

// Control popover visibility
watch(isOpen, async (open) => {
  await nextTick()

  if (!contentElement.value) return

  if (open) {
    contentElement.value.showPopover()
    // Wait for popover to be fully shown before positioning
    await nextTick()
    updatePosition()
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

  // Position will be handled by popover + manual positioning
  position: fixed;
  inset: unset;
  z-index: 60; // Higher than main dropdown

  min-width: 180px;
  max-width: 320px;
  max-height: var(--popover-available-height, 400px);
  overflow-y: auto;
  overflow-x: hidden;

  background-color: white;
  border: 1px solid var(--color-gray-200, #e5e7eb);
  border-radius: var(--border-radius-medium, 8px);
  box-shadow: 
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);

  // Custom scrollbar styling
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--color-gray-300, #d1d5db);
    border-radius: 3px;
    
    &:hover {
      background-color: var(--color-gray-400, #9ca3af);
    }
  }

  // Popover animation for sub-menus (slide from side)
  opacity: 0;
  transform: translateX(-8px) scale(0.95);
  transition:
      opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.15s cubic-bezier(0.4, 0, 0.2, 1),
      overlay 0.15s ease allow-discrete,
      display 0.15s ease allow-discrete;

  &:popover-open {
    opacity: 1;
    transform: translateX(0) scale(1);
  }

  @starting-style {
    &:popover-open {
      opacity: 0;
      transform: translateX(-8px) scale(0.95);
    }
  }

  &:focus {
    outline: none;
  }

  // Add backdrop blur effect for modern look
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);

  // Enhanced border styling
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    padding: 1px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.2),
      rgba(255, 255, 255, 0.1)
    );
    border-radius: inherit;
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    -webkit-mask-composite: xor;
    pointer-events: none;
  }
}</style>