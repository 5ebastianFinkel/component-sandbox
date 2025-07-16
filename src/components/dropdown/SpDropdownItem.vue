<template>
  <button
    :class="itemClasses"
    role="menuitem"
    :disabled="disabled"
    :tabindex="disabled ? -1 : 0"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
    @keydown="handleKeyDown"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDropdown } from './useDropdown'
import type { SpDropdownItemProps, SpDropdownItemEmits } from './dropdown.types'

/**
 * SpDropdownItem - Einzelnes Menüelement innerhalb des Dropdown-Menüs
 * 
 * Funktionen:
 * - Tastaturnavigation mit Enter und Leertaste
 * - Korrekte ARIA-Attribute für Barrierefreiheit
 * - Fokus-Management
 * - Integration mit übergeordnetem Dropdown-Kontext
 * 
 * @example Grundlegende Verwendung
 * ```vue
 * <SpDropdownItem value="speichern" @select="handleSpeichern">
 *   Dokument speichern
 * </SpDropdownItem>
 * ```
 * 
 * @example Mit Deaktivierung
 * ```vue
 * <SpDropdownItem value="loeschen" :disabled="true" @select="handleLoeschen">
 *   Element löschen
 * </SpDropdownItem>
 * ```
 */
const props = withDefaults(defineProps<SpDropdownItemProps>(), {
  disabled: false,
  closeOnSelect: undefined
})

const emit = defineEmits<SpDropdownItemEmits>()

const { onItemClick, closeOnSelect: parentCloseOnSelect } = useDropdown()

// Track focus state properly
const isFocused = ref(false)

// Compute item classes with proper focus management
const itemClasses = computed(() => [
  'sp-dropdown__item',
  {
    'sp-dropdown__item--disabled': props.disabled,
    'sp-dropdown__item--focused': isFocused.value
  }
])

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

const handleFocus = (event: FocusEvent) => {
  if (props.disabled) return
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  if (props.disabled) return
  isFocused.value = false
  emit('blur', event)
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (props.disabled) return

  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      // Create a synthetic MouseEvent for consistency
      const syntheticEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      })
      handleClick(syntheticEvent)
      break
  }
}
</script>

<style scoped lang="scss">
.sp-dropdown__item {
  // Base styles
  display: flex;
  align-items: center;
  width: 100%;
  
  padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
  margin: 1px 0;

  background-color: transparent;
  border: none;
  border-radius: var(--border-radius-small, 6px);

  font-size: var(--font-size-normal, 14px);
  font-weight: var(--font-weight-normal, 400);
  text-align: left;
  line-height: 1.5;
  color: var(--color-text-primary, #1f2937);

  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;

  // Hover state
  &:hover:not(:disabled) {
    background-color: var(--color-surface-hover, #f9fafb);
  }

  // Focus state - improved focus management
  &--focused {
    background-color: var(--color-surface-hover, #f9fafb);
  }

  // Enhanced focus styling with :focus-visible
  &:focus-visible {
    outline: 2px solid var(--color-focus-ring, #3b82f6);
    outline-offset: -2px;
    background-color: var(--color-focus-surface, #eff6ff);
  }

  // Active/pressed state
  &:active:not(:disabled) {
    background-color: var(--color-surface-pressed, #f3f4f6);
    transform: translateX(1px);
  }

  // Disabled state
  &--disabled {
    color: var(--color-text-disabled, #9ca3af);
    cursor: not-allowed;
    opacity: 0.6;
    
    &:hover {
      background-color: transparent;
      transform: none;
    }
  }
}
</style>