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
  toggle
} = useDropdown()

const disabled = computed(() => props.disabled || contextDisabled.value)

const triggerElement = ref<HTMLElement>()
const isFocused = ref(false)
const hoverTimeout = ref<number>()

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
  }
}

// Open on hover with slight delay
const handleMouseEnter = () => {
  clearTimeout(hoverTimeout.value)
  hoverTimeout.value = window.setTimeout(() => {
    if (!disabled.value && !isOpen.value) {
      open()
    }
  }, 100)
}

const handleMouseLeave = () => {
  clearTimeout(hoverTimeout.value)
  hoverTimeout.value = window.setTimeout(() => {
    if (isOpen.value) {
      close()
    }
  }, 300) // Increased delay for better UX
}

onUnmounted(() => {
  clearTimeout(hoverTimeout.value)
})

</script>

<style scoped lang="scss">
.sp-dropdown__sub-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
  margin: 2px 0;

  background-color: transparent;
  color: var(--color-black-primary);
  border: none;
  border-radius: var(--border-radius-small);

  font-size: var(--font-size-normal);
  font-weight: var(--font-weight-normal);
  text-align: left;
  line-height: 1.5;

  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background-color: var(--color-brand-default-state-hover);
  }

  &:focus-visible {
    outline: 2px solid var(--color-brand-default-state-focus-visible);
    outline-offset: -2px;
  }

  &--focused:not(:disabled),
  &--open:not(:disabled) {
    background-color: var(--color-brand-default-state-hover);
  }

  &--disabled {
    color: var(--color-black-disabled);
    cursor: not-allowed;
    opacity: 0.5;
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
  color: var(--color-black-secondary);
  flex-shrink: 0;
}</style>