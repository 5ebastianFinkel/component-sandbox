<template>
  <button
    v-if="!asChild"
    :id="triggerId"
    ref="triggerElement"
    :class="triggerClasses"
    :aria-expanded="isOpen"
    :aria-haspopup="true"
    :aria-controls="contentId"
    :disabled="disabled"
    @click="handleClick"
    @keydown="handleKeyDown"
  >
    <slot />
  </button>
  <slot
    v-else
    :props="slotProps"
    :aria-expanded="isOpen"
    :aria-haspopup="true"
    :aria-controls="contentId"
    :disabled="disabled"
    @click="handleClick"
    @keydown="handleKeyDown"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { useDropdown } from './useDropdown'
import type { SpDropdownTriggerProps } from './dropdown.types'

/**
 * SpDropdownTrigger - Trigger-Komponente für Dropdown-Menüs
 * 
 * Funktionen:
 * - Vollständige Tastaturnavigation (Enter, Leertaste, Pfeiltasten, Escape)
 * - AsChild-Pattern für benutzerdefinierte Trigger-Elemente
 * - Umfassende Barrierefreiheitsunterstützung
 * - Fokusverwaltungsintegration
 * 
 * @example Grundlegende Verwendung
 * ```vue
 * <SpDropdownTrigger>
 *   Menü öffnen
 * </SpDropdownTrigger>
 * ```
 * 
 * @example Benutzerdefinierter Trigger mit asChild
 * ```vue
 * <SpDropdownTrigger as-child>
 *   <template #default="{ props }">
 *     <MeinBenutzerdefinierterButton v-bind="props">
 *       Benutzerdefinierter Trigger
 *     </MeinBenutzerdefinierterButton>
 *   </template>
 * </SpDropdownTrigger>
 * ```
 */
const props = withDefaults(defineProps<SpDropdownTriggerProps>(), {
  asChild: false
})

const {
  isOpen,
  triggerId,
  contentId,
  contentRef,
  triggerRef,
  disabled,
  toggle,
  open,
  close
} = useDropdown()

const triggerElement = ref<HTMLElement>()

// Compute trigger classes
const triggerClasses = computed(() => [
  'sp-dropdown__trigger',
  {
    'sp-dropdown__trigger--open': isOpen.value,
    'sp-dropdown__trigger--disabled': disabled.value
  }
])

// Compute slot props for asChild pattern
const slotProps = computed(() => ({
  id: triggerId.value,
  ref: triggerElement,
  'aria-expanded': isOpen.value,
  'aria-haspopup': 'true',
  'aria-controls': contentId.value,
  disabled: disabled.value,
  class: triggerClasses.value
}))

// Register trigger ref
onMounted(() => {
  if (triggerElement.value) {
    triggerRef.value = triggerElement.value
  }
})

// Focus management functions
const focusFirstItem = () => {
  const firstItem = contentRef.value?.querySelector('[role="menuitem"]:not([disabled])') as HTMLElement
  firstItem?.focus()
}

const focusLastItem = () => {
  const items = contentRef.value?.querySelectorAll('[role="menuitem"]:not([disabled])')
  const lastItem = items?.[items.length - 1] as HTMLElement
  lastItem?.focus()
}

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
      // Focus first item after opening
      nextTick(() => {
        focusFirstItem()
      })
      break
    case 'ArrowUp':
      event.preventDefault()
      if (!isOpen.value) {
        open()
      }
      // Focus last item after opening
      nextTick(() => {
        focusLastItem()
      })
      break
    case 'Escape':
      if (isOpen.value) {
        event.preventDefault()
        close()
      }
      break
  }
}
</script>

<style scoped lang="scss">
.sp-dropdown__trigger {
  // Base styles
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs, 0.25rem);
  padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
  min-width: 120px;

  background-color: var(--color-surface-primary, white);
  color: var(--color-text-primary, #1f2937);
  border: 1px solid var(--color-border-default, #d1d5db);
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

  // Hover state
  &:hover:not(:disabled) {
    background-color: var(--color-surface-hover, #f9fafb);
    border-color: var(--color-border-hover, #9ca3af);
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
  }

  // Focus state with enhanced visibility
  &:focus-visible {
    outline: 2px solid var(--color-focus-ring, #3b82f6);
    outline-offset: 2px;
    border-color: var(--color-focus-ring, #3b82f6);
  }

  // Active state
  &:active:not(:disabled) {
    background-color: var(--color-surface-pressed, #f3f4f6);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    transform: translateY(1px);
  }

  // Open state
  &--open {
    background-color: var(--color-surface-active, #f9fafb);
    border-color: var(--color-border-active, #3b82f6);
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);

    &::after {
      transform: rotate(180deg);
      opacity: 1;
    }
  }

  // Disabled state
  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: var(--color-surface-disabled, #f3f4f6);
    color: var(--color-text-disabled, #6b7280);

    &::after {
      opacity: 0.3;
    }
  }
}
</style>