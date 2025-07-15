<template>
  <div
      :class="['sp-dropdown__separator', props.class]"
      role="separator"
      aria-orientation="horizontal"
  />
</template>

<script setup lang="ts">
import type { SpDropdownSeparatorProps } from './dropdown.types'

/**
 * SpDropdownSeparator Komponente
 * Visueller Trenner zwischen Dropdown-Items
 *
 * @example
 * <SpDropdownContent>
 *   <SpDropdownItem>Bearbeiten</SpDropdownItem>
 *   <SpDropdownItem>Kopieren</SpDropdownItem>
 *   <SpDropdownSeparator />
 *   <SpDropdownItem>Löschen</SpDropdownItem>
 * </SpDropdownContent>
 */
const props = defineProps<SpDropdownSeparatorProps>()
</script>

<style scoped lang="scss">
.sp-dropdown__separator {
  // Modern separator styling
  height: 1px;
  margin: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
  background: linear-gradient(
    90deg,
    transparent,
    var(--color-gray-200, #e5e7eb) 20%,
    var(--color-gray-200, #e5e7eb) 80%,
    transparent
  );
  border: none;
  
  // Add subtle shadow for depth
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 1px;
    left: 10%;
    right: 10%;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.8) 20%,
      rgba(255, 255, 255, 0.8) 80%,
      transparent
    );
    pointer-events: none;
  }
}</style>