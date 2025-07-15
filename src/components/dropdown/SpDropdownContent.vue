<template>
  <div
      v-if="triggerRef"
      :id="contentId"
      ref="contentElement"
      :class="[
      'sp-dropdown__content',
      `sp-dropdown__content--align-${align}`
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
import type { SpDropdownContentProps, ToggleEvent } from './dropdown.types'

/**
 * SpDropdownContent Komponente
 * Container für die Dropdown-Inhalte mit Popover API
 *
 * @example
 * <SpDropdownContent>
 *   <SpDropdownItem>Option 1</SpDropdownItem>
 *   <SpDropdownItem>Option 2</SpDropdownItem>
 * </SpDropdownContent>
 */
const props = withDefaults(defineProps<SpDropdownContentProps>(), {
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

// Setup popover positioning
const setupPopoverPosition = () => {
  if (!contentElement.value || !triggerRef.value) return

  // Set anchor element for popover positioning
  if ('anchorElement' in HTMLElement.prototype) {
    // Use native anchor positioning when available
    ;(contentElement.value as any).anchorElement = triggerRef.value

    // Apply CSS anchor positioning
    const anchorName = `dropdown-trigger-${contentId.value}`
    triggerRef.value.style.anchorName = `--${anchorName}`
    contentElement.value.style.positionAnchor = `--${anchorName}`

    // Set vertical position below trigger
    contentElement.value.style.top = `anchor(bottom)`
    contentElement.value.style.marginTop = `${props.sideOffset}px`

    // Set horizontal alignment using anchor positioning
    switch (props.align) {
      case 'start':
        contentElement.value.style.left = 'anchor(left)'
        contentElement.value.style.right = 'auto'
        break
      case 'center':
        contentElement.value.style.left = 'anchor(center)'
        contentElement.value.style.right = 'auto'
        contentElement.value.style.translate = '-50% 0'
        break
      case 'end':
        contentElement.value.style.right = 'anchor(right)'
        contentElement.value.style.left = 'auto'
        break
    }

    // Clear any conflicting positioning
    contentElement.value.style.bottom = 'auto'
    contentElement.value.style.inset = 'unset'
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

    // Position below trigger by default
    let left = triggerRect.left
    let top = triggerRect.bottom + props.sideOffset

    // Horizontal alignment
    switch (props.align) {
      case 'center':
        left = triggerRect.left + (triggerRect.width - contentRect.width) / 2
        break
      case 'end':
        left = triggerRect.right - contentRect.width
        break
    }

    // Collision detection
    if (props.avoidCollisions) {
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Horizontal collision
      if (left + contentRect.width > viewportWidth - 8) {
        left = viewportWidth - contentRect.width - 8
      }
      if (left < 8) {
        left = 8
      }

      // Vertical collision - show above if no space below
      if (top + contentRect.height > viewportHeight - 8) {
        const spaceAbove = triggerRect.top - 8
        const spaceBelow = viewportHeight - triggerRect.bottom - 8
        if (spaceAbove > spaceBelow) {
          top = triggerRect.top - contentRect.height - props.sideOffset
        }
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
.sp-dropdown__content {
  // Modern dropdown content styling
  margin: 0;
  padding: var(--spacing-xs, 0.25rem);
  border: 0;

  // Position will be handled by popover + anchor positioning
  position: fixed;
  inset: unset;
  z-index: 50;

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

  // Enhanced popover animation
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
  transition:
      opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
      overlay 0.2s ease allow-discrete,
      display 0.2s ease allow-discrete;

  &:popover-open {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  @starting-style {
    &:popover-open {
      opacity: 0;
      transform: translateY(-8px) scale(0.95);
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

  // Fallback for browsers without anchor positioning
  @supports not (anchor-name: --foo) {
    top: var(--dropdown-fallback-top, auto);
    left: var(--dropdown-fallback-left, auto);

    &--align-center {
      transform: translateX(-50%) translateY(-8px) scale(0.95);
      
      &:popover-open {
        transform: translateX(-50%) translateY(0) scale(1);
      }
    }

    &--align-end {
      right: 0;
      left: auto;
    }
  }
}</style>