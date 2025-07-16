<template>
  <div
      v-if="triggerRef"
      :id="contentId"
      ref="contentElement"
      :class="[
      'sp-dropdown__content',
      `sp-dropdown__content--placement-${placement}`
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
import { onClickOutside } from '@vueuse/core'
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
  placement,
  close
} = useDropdown()

const contentElement = ref<HTMLElement>()

// Helper function to parse placement into side and alignment
const parsePlacement = (placementValue: string) => {
  const [side, align = 'start'] = placementValue.split('-')
  return { side, align }
}

// Register content ref and setup popover
onMounted(() => {
  if (contentElement.value) {
    contentRef.value = contentElement.value
  }
})

// Handle click outside to close dropdown
onClickOutside(
  contentElement,
  () => {
    if (isOpen.value) {
      close()
    }
  },
  {
    ignore: [triggerRef]
  }
)

// Position dropdown using manual positioning
const updatePosition = () => {
  if (!contentElement.value || !triggerRef.value) return

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const contentRect = contentElement.value.getBoundingClientRect()
  const { side, align } = parsePlacement(placement.value)

  let left = 0
  let top = 0

  // Position based on side
  switch (side) {
    case 'top':
      top = triggerRect.top - contentRect.height - props.sideOffset
      // Horizontal alignment for top placement
      switch (align) {
        case 'start':
          left = triggerRect.left
          break
        case 'center':
          left = triggerRect.left + triggerRect.width / 2
          break
        case 'end':
          left = triggerRect.right - contentRect.width
          break
      }
      break
    case 'bottom':
      top = triggerRect.bottom + props.sideOffset
      // Horizontal alignment for bottom placement
      switch (align) {
        case 'start':
          left = triggerRect.left
          break
        case 'center':
          left = triggerRect.left + triggerRect.width / 2
          break
        case 'end':
          left = triggerRect.right - contentRect.width
          break
      }
      break
    case 'left':
      left = triggerRect.left - contentRect.width - props.sideOffset
      // Vertical alignment for left placement
      switch (align) {
        case 'start':
          top = triggerRect.top
          break
        case 'center':
          top = triggerRect.top + triggerRect.height / 2
          break
        case 'end':
          top = triggerRect.bottom - contentRect.height
          break
      }
      break
    case 'right':
      left = triggerRect.right + props.sideOffset
      // Vertical alignment for right placement
      switch (align) {
        case 'start':
          top = triggerRect.top
          break
        case 'center':
          top = triggerRect.top + triggerRect.height / 2
          break
        case 'end':
          top = triggerRect.bottom - contentRect.height
          break
      }
      break
  }

  // Collision detection
  if (props.avoidCollisions) {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Handle collisions based on primary side
    if (side === 'top' || side === 'bottom') {
      // Horizontal collision
      if (left + contentRect.width > viewportWidth - 8) {
        left = viewportWidth - contentRect.width - 8
      }
      if (left < 8) {
        left = 8
      }

      // Vertical collision - flip to opposite side if no space
      if (side === 'bottom' && top + contentRect.height > viewportHeight - 8) {
        const spaceAbove = triggerRect.top - 8
        const spaceBelow = viewportHeight - triggerRect.bottom - 8
        if (spaceAbove > spaceBelow) {
          top = triggerRect.top - contentRect.height - props.sideOffset
        }
      } else if (side === 'top' && top < 8) {
        const spaceAbove = triggerRect.top - 8
        const spaceBelow = viewportHeight - triggerRect.bottom - 8
        if (spaceBelow > spaceAbove) {
          top = triggerRect.bottom + props.sideOffset
        }
      }
    } else {
      // Vertical collision
      if (top + contentRect.height > viewportHeight - 8) {
        top = viewportHeight - contentRect.height - 8
      }
      if (top < 8) {
        top = 8
      }

      // Horizontal collision - flip to opposite side if no space
      if (side === 'right' && left + contentRect.width > viewportWidth - 8) {
        const spaceLeft = triggerRect.left - 8
        const spaceRight = viewportWidth - triggerRect.right - 8
        if (spaceLeft > spaceRight) {
          left = triggerRect.left - contentRect.width - props.sideOffset
        }
      } else if (side === 'left' && left < 8) {
        const spaceLeft = triggerRect.left - 8
        const spaceRight = viewportWidth - triggerRect.right - 8
        if (spaceRight > spaceLeft) {
          left = triggerRect.right + props.sideOffset
        }
      }
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
.sp-dropdown__content {
  // Modern dropdown content styling
  margin: 0;
  padding: var(--spacing-xs, 0.25rem);
  border: 0;

  // Position will be handled by popover + manual positioning
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

  // Enhanced popover animation - default for bottom placement
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

  // Placement-specific animations
  &--placement-top,
  &--placement-top-start,
  &--placement-top-end,
  &--placement-top-center {
    transform: translateY(8px) scale(0.95);
    
    &:popover-open {
      transform: translateY(0) scale(1);
    }
    
    @starting-style {
      &:popover-open {
        opacity: 0;
        transform: translateY(8px) scale(0.95);
      }
    }
  }

  &--placement-left,
  &--placement-left-start,
  &--placement-left-end,
  &--placement-left-center {
    transform: translateX(8px) scale(0.95);
    
    &:popover-open {
      transform: translateX(0) scale(1);
    }
    
    @starting-style {
      &:popover-open {
        opacity: 0;
        transform: translateX(8px) scale(0.95);
      }
    }
  }

  &--placement-right,
  &--placement-right-start,
  &--placement-right-end,
  &--placement-right-center {
    transform: translateX(-8px) scale(0.95);
    
    &:popover-open {
      transform: translateX(0) scale(1);
    }
    
    @starting-style {
      &:popover-open {
        opacity: 0;
        transform: translateX(-8px) scale(0.95);
      }
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

  // Center alignment adjustments for top/bottom placements
  &--placement-top-center,
  &--placement-bottom-center {
    transform: translateX(-50%) translateY(8px) scale(0.95);
    
    &:popover-open {
      transform: translateX(-50%) translateY(0) scale(1);
    }
  }

  &--placement-top-center {
    transform: translateX(-50%) translateY(8px) scale(0.95);
  }

  // Center alignment adjustments for left/right placements
  &--placement-left-center,
  &--placement-right-center {
    &:popover-open {
      transform: translateY(-50%) translateX(0) scale(1);
    }
  }

  &--placement-left-center {
    transform: translateY(-50%) translateX(8px) scale(0.95);
  }

  &--placement-right-center {
    transform: translateY(-50%) translateX(-8px) scale(0.95);
  }
}</style>