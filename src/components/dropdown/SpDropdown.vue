<template>
  <div
      :class="[
      'sp-dropdown',
      {
        'sp-dropdown--open': isOpen,
        'sp-dropdown--disabled': disabled
      }
    ]"
      @keydown="handleKeyDown"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { useDropdownProvider } from './useDropdown'
import type { SpDropdownProps, SpDropdownEmits } from './dropdown.types'

/**
 * SpDropdown Root-Komponente
 * Stellt den Context für alle Child-Komponenten bereit
 *
 * @example
 * <SpDropdown v-model:open="isOpen">
 *   <SpDropdownTrigger>Click me</SpDropdownTrigger>
 *   <SpDropdownContent>
 *     <SpDropdownItem>Option 1</SpDropdownItem>
 *   </SpDropdownContent>
 * </SpDropdown>
 */
const props = withDefaults(defineProps<SpDropdownProps>(), {
  modelValue: false,
  disabled: false,
  closeOnSelect: true,
  placement: 'bottom-start'
})

const emit = defineEmits<SpDropdownEmits>()

// Setup dropdown context
const { handleKeyDown, isOpen, disabled } = useDropdownProvider(props, (event, value) => {
  emit('update:modelValue', value)

  if (value) {
    emit('open')
  } else {
    emit('close')
  }
})
</script>

<style scoped lang="scss">
.sp-dropdown {
  position: relative;
  display: inline-block;

  &--disabled {
    pointer-events: none;
    opacity: 0.6;
  }
  // Shared dropdown styles and utilities
  // This file is optional - styles can also be kept in individual component files

  // Dropdown z-index management
  :root {
    --dropdown-z-index: var(--layer-4, 999);
  }

  // Animation keyframes for dropdown
  @keyframes dropdown-slide-down {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes dropdown-slide-up {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  // Utility classes for dropdown positioning
  .sp-dropdown-utils {
    // Position variants
    &--position-top {
      .sp-dropdown__content {
        animation: dropdown-slide-up 0.15s ease;
      }
    }

    &--position-bottom {
      .sp-dropdown__content {
        animation: dropdown-slide-down 0.15s ease;
      }
    }
  }

  // Focus styles mixin
  @mixin dropdown-focus-visible {
    &:focus-visible {
      outline: 2px solid var(--color-brand-default-state-focus-visible);
      outline-offset: 2px;
    }
  }

  // Hover styles mixin
  @mixin dropdown-hover {
    &:hover:not(:disabled) {
      background-color: var(--color-brand-default-state-hover);
    }
  }

  // Shared dropdown shadow
  @mixin dropdown-shadow {
    box-shadow:
        0 10px 15px -3px var(--color-box-shadow),
        0 4px 6px -2px var(--color-box-shadow);
  }
}</style>