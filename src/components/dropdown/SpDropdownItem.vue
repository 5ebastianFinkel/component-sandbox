<template>
  <button
      :class="[
      'sp-dropdown__item',
      {
        'sp-dropdown__item--disabled': disabled,
        'sp-dropdown__item--focused': isFocused
      }
    ]"
      role="menuitem"
      :disabled="disabled"
      :tabindex="disabled ? -1 : 0"
      @click="handleClick"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @keydown="handleKeyDown"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDropdown } from './useDropdown'
import type { SpDropdownItemProps, SpDropdownItemEmits } from './dropdown.types'

/**
 * SpDropdownItem Komponente
 * Ein einzelnes Item innerhalb des Dropdown-Menüs
 *
 * @example
 * <SpDropdownItem value="option1" @select="handleSelect">
 *   Option 1
 * </SpDropdownItem>
 *
 * @example Deaktiviertes Item
 * <SpDropdownItem disabled>
 *   Nicht verfügbar
 * </SpDropdownItem>
 */
const props = withDefaults(defineProps<SpDropdownItemProps>(), {
  disabled: false,
  closeOnSelect: undefined // Will use parent's default if not specified
})

const emit = defineEmits<SpDropdownItemEmits>()

const { onItemClick, closeOnSelect: parentCloseOnSelect } = useDropdown()

const isFocused = ref(false)

// Use item's closeOnSelect if specified, otherwise use parent's
const shouldCloseOnSelect = computed(() =>
    props.closeOnSelect !== undefined ? props.closeOnSelect : parentCloseOnSelect.value
)

const handleClick = (event: MouseEvent) => {
  if (props.disabled) return

  emit('click', event)
  emit('select', props.value)

  if (shouldCloseOnSelect.value) {
    onItemClick(props.value?.toString())
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (props.disabled) return

  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      handleClick(event as unknown as MouseEvent)
      break
  }
}
</script>

<style scoped lang="scss">
.sp-dropdown__item {
  // Modern dropdown item styling
  display: flex;
  align-items: center;
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

  // Add subtle hover effect
  &:hover:not(:disabled) {
    background-color: var(--color-gray-50, #f9fafb);
    color: var(--color-gray-900, #111827);
    transform: translateX(2px);
  }

  // Enhanced focus styling
  &:focus-visible {
    outline: 2px solid var(--color-brand-default-state-focus-visible, #3b82f6);
    outline-offset: -2px;
    background-color: var(--color-blue-50, #eff6ff);
  }

  // Active/pressed state
  &:active:not(:disabled) {
    background-color: var(--color-gray-100, #f3f4f6);
    transform: translateX(1px);
  }

  // Focused state (via keyboard navigation)
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

  // Disabled state
  &--disabled {
    color: var(--color-gray-400, #9ca3af);
    cursor: not-allowed;
    opacity: 0.6;
    
    &:hover {
      background-color: transparent;
      transform: none;
    }
  }

  // Add icon support
  .sp-dropdown__item-icon {
    margin-right: var(--spacing-sm, 0.5rem);
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  // Add keyboard shortcut support
  .sp-dropdown__item-shortcut {
    margin-left: auto;
    font-size: var(--font-size-small, 12px);
    color: var(--color-gray-500, #6b7280);
    font-family: ui-monospace, 'SF Mono', 'Monaco', 'Cascadia Code', monospace;
  }
}</style>