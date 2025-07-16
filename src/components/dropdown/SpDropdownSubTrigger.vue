<template>
  <button
      :id="triggerId"
      ref="triggerElement"
      :class="[
      'sp-dropdown__item',
      'sp-dropdown__sub-trigger',
      {
        'sp-dropdown__sub-trigger--open': isOpen,
        'sp-dropdown__sub-trigger--disabled': disabled,
        'sp-dropdown__sub-trigger--focused': isFocused
      }
    ]"
      role="menuitem"
      :aria-expanded="isOpen"
      :aria-haspopup="true"
      :aria-controls="contentId"
      :disabled="disabled"
      :tabindex="disabled ? -1 : 0"
      @click="handleClick"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @keydown="handleKeyDown"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
  >
    <span class="sp-dropdown__sub-trigger-content">
      <slot></slot>
    </span>
    <span class="sp-dropdown__sub-trigger-icon">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.5 2L8.5 6L4.5 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
  </button>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDropdown } from './useDropdown'
import type { SpDropdownSubTriggerProps } from './dropdown.types'

/**
 * SpDropdownSubTrigger Komponente
 * Trigger-Element für Sub-Menüs innerhalb eines Dropdowns
 *
 * @example
 * <SpDropdownSub>
 *   <SpDropdownSubTrigger>
 *     Weitere Optionen
 *   </SpDropdownSubTrigger>
 *   <SpDropdownSubContent>
 *     ...
 *   </SpDropdownSubContent>
 * </SpDropdownSub>
 */
const props = withDefaults(defineProps<SpDropdownSubTriggerProps>(), {
  disabled: false
})

const {
  isOpen,
  triggerId,
  contentId,
  triggerRef,
  disabled: contextDisabled,
  open,
  close,
  toggle,
  clearHoverTimeout,
  setHoverTimeout
} = useDropdown()

const disabled = computed(() => props.disabled || contextDisabled.value)

const triggerElement = ref<HTMLElement>()
const isFocused = ref(false)

// Register trigger ref
onMounted(() => {
  if (triggerElement.value) {
    triggerRef.value = triggerElement.value
  }
})

const handleClick = (event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()
  toggle()
}

const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      event.stopPropagation()
      toggle()
      break
    case 'ArrowRight':
      event.preventDefault()
      event.stopPropagation()
      if (!isOpen.value) {
        open()
      }
      // TODO: Focus first item in sub-menu
      break
    case 'ArrowLeft':
      event.preventDefault()
      event.stopPropagation()
      if (isOpen.value) {
        close()
      }
      break
    case 'ArrowDown':
    case 'ArrowUp':
      // Don't preventDefault() or stopPropagation() - let parent SpDropdownContent handle navigation
      // This allows navigation between sub-triggers and other menu items
      break
  }
}

// Open on hover with slight delay
const handleMouseEnter = () => {
  clearHoverTimeout()
  setHoverTimeout(() => {
    if (!disabled.value && !isOpen.value) {
      open()
    }
  }, 100)
}

const handleMouseLeave = () => {
  setHoverTimeout(() => {
    if (isOpen.value) {
      close()
    }
  }, 300) // Delay before closing to allow moving to content
}

// Cleanup is handled by useDropdown composable

</script>

<style scoped lang="scss">
.sp-dropdown__sub-trigger {
  // Modern dropdown sub-trigger styling - matches SpDropdownItem
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  position: relative;

  padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
  margin: 1px 0;

  background-color: transparent;
  color: var(--color-black-primary, #1f2937);
  border: none;
  border-radius: var(--border-radius-small, 6px);

  font-size: var(--font-size-normal, 14px);
  font-weight: var(--font-weight-normal, 400);
  text-align: left;
  line-height: 1.5;

  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;

  // Add subtle hover effect - matches SpDropdownItem
  &:hover:not(:disabled) {
    background-color: var(--color-gray-50, #f9fafb);
    color: var(--color-gray-900, #111827);
    transform: translateX(2px);
  }

  // Enhanced focus styling - matches SpDropdownItem
  &:focus-visible {
    outline: 2px solid var(--color-brand-default-state-focus-visible, #3b82f6);
    outline-offset: -2px;
    background-color: var(--color-blue-50, #eff6ff);
  }

  // Active/pressed state - matches SpDropdownItem
  &:active:not(:disabled) {
    background-color: var(--color-gray-100, #f3f4f6);
    transform: translateX(1px);
  }

  // Focused state (via keyboard navigation) - matches SpDropdownItem
  &--focused:not(:disabled) {
    background-color: var(--color-blue-50, #eff6ff);
    color: var(--color-blue-900, #1e3a8a);
    
    // Add subtle accent border
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 60%;
      background-color: var(--color-brand-default-state-focus-visible, #3b82f6);
      border-radius: 0 2px 2px 0;
    }
  }

  // Open state - similar to focused but distinct
  &--open:not(:disabled) {
    background-color: var(--color-blue-50, #eff6ff);
    color: var(--color-blue-900, #1e3a8a);
    
    // Add subtle accent border for open state
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 60%;
      background-color: var(--color-brand-default-state-focus-visible, #3b82f6);
      border-radius: 0 2px 2px 0;
    }
  }

  // Disabled state - matches SpDropdownItem
  &--disabled {
    color: var(--color-gray-400, #9ca3af);
    cursor: not-allowed;
    opacity: 0.6;
    
    &:hover {
      background-color: transparent;
      transform: none;
    }
  }
}

.sp-dropdown__sub-trigger-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sp-dropdown__sub-trigger-icon {
  display: flex;
  align-items: center;
  margin-left: var(--spacing-sm, 0.5rem);
  color: var(--color-gray-500, #6b7280);
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  
  // Add subtle transition for the icon
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  
  // Rotate icon when sub-menu is open
  .sp-dropdown__sub-trigger--open & {
    transform: rotate(90deg);
  }
}</style>