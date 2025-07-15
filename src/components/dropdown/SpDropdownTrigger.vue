<template>
  <button
      v-if="!asChild"
      :id="triggerId"
      ref="triggerElement"
      :class="[
      'sp-dropdown__trigger',
      {
        'sp-dropdown__trigger--open': isOpen,
        'sp-dropdown__trigger--disabled': disabled
      }
    ]"
      :aria-expanded="isOpen"
      :aria-haspopup="true"
      :aria-controls="contentId"
      :disabled="disabled"
      @click="handleClick"
      @keydown="handleKeyDown"
  >
    <slot></slot>
  </button>
  <slot
      v-else
      :props="{
      id: triggerId,
      ref: triggerElement,
      'aria-expanded': isOpen,
      'aria-haspopup': true,
      'aria-controls': contentId,
      onClick: handleClick,
      onKeydown: handleKeyDown
    }"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDropdown } from './useDropdown'
import type { SpDropdownTriggerProps } from './dropdown.types'

/**
 * SpDropdownTrigger Komponente
 * Der Trigger, der das Dropdown öffnet/schließt
 *
 * @example
 * <SpDropdownTrigger>
 *   Click me
 * </SpDropdownTrigger>
 *
 * @example Mit custom Element
 * <SpDropdownTrigger as-child>
 *   <MyCustomButton />
 * </SpDropdownTrigger>
 */
withDefaults(defineProps<SpDropdownTriggerProps>(), {
  asChild: false
})

const {
  isOpen,
  triggerId,
  contentId,
  triggerRef,
  disabled,
  toggle,
  open
} = useDropdown()

const triggerElement = ref<HTMLElement>()

// Register trigger ref
onMounted(() => {
  if (triggerElement.value) {
    triggerRef.value = triggerElement.value
  }
})

const handleClick = (event: MouseEvent) => {
  event.preventDefault()
  toggle()
}

const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      toggle()
      break
    case 'ArrowDown':
      event.preventDefault()
      if (!isOpen.value) {
        open()
      }
      // TODO: Focus first item in dropdown
      break
    case 'ArrowUp':
      event.preventDefault()
      if (!isOpen.value) {
        open()
      }
      // TODO: Focus last item in dropdown
      break
  }
}
</script>

<style scoped lang="scss">
.sp-dropdown__trigger {
  // Modern dropdown trigger styling
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-xs, 0.25rem);
  padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
  min-width: 120px;

  background-color: white;
  color: var(--color-black-primary, #1f2937);
  border: 1px solid var(--color-gray-300, #d1d5db);
  border-radius: var(--border-radius-medium, 8px);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

  font-size: var(--font-size-normal, 14px);
  font-weight: var(--font-weight-medium, 500);
  line-height: 1.5;

  cursor: pointer;
  transition: all 0.15s ease-in-out;
  user-select: none;

  // Add dropdown arrow indicator
  &::after {
    content: '';
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid currentColor;
    margin-left: auto;
    transition: transform 0.15s ease-in-out;
    opacity: 0.6;
  }

  &:hover:not(:disabled) {
    background-color: var(--color-gray-50, #f9fafb);
    border-color: var(--color-gray-400, #9ca3af);
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
  }

  &:focus-visible {
    outline: 2px solid var(--color-brand-default-state-focus-visible, #3b82f6);
    outline-offset: 2px;
    border-color: var(--color-brand-default-state-focus-visible, #3b82f6);
  }

  &:active:not(:disabled) {
    background-color: var(--color-gray-100, #f3f4f6);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    transform: translateY(1px);
  }

  &--open {
    background-color: var(--color-gray-50, #f9fafb);
    border-color: var(--color-brand-default-state-focus-visible, #3b82f6);
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);

    &::after {
      transform: rotate(180deg);
      opacity: 1;
    }
  }

  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: var(--color-gray-100, #f3f4f6);
    color: var(--color-gray-500, #6b7280);

    &::after {
      opacity: 0.3;
    }
  }
}</style>