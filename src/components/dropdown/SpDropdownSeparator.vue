<template>
  <div
    :class="separatorClasses"
    :role="role"
    :aria-orientation="orientation"
    :aria-label="label"
    :aria-labelledby="labelledBy"
  >
    <span v-if="$slots.default || label" class="sp-dropdown__separator-label">
      <slot>{{ label }}</slot>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import type { SpDropdownSeparatorProps } from './dropdown.types'

/**
 * SpDropdownSeparator - Visueller Trenner für Dropdown-Menüabschnitte
 * 
 * Funktionen:
 * - Mehrere visuelle Varianten (durchgehend, gestrichelt, gepunktet, Verlauf)
 * - Abstandsvarianten (kompakt, normal, geräumig)
 * - Farbvarianten für verschiedene Kontexte
 * - Optionale Beschriftungen zur Abschnittsidentifikation
 * - Vollständige Barrierefreiheitsunterstützung
 * - Theme-Unterstützung mit CSS-Custom-Properties
 * 
 * @example Einfacher Trenner
 * ```vue
 * <SpDropdownSeparator />
 * ```
 * 
 * @example Mit Beschriftung
 * ```vue
 * <SpDropdownSeparator label="Zuletzt verwendete Elemente" />
 * ```
 * 
 * @example Benutzerdefinierte Variante
 * ```vue
 * <SpDropdownSeparator 
 *   variant="dashed" 
 *   spacing="spacious" 
 *   color="muted" 
 * />
 * ```
 * 
 * @example Mit Slot-Inhalt
 * ```vue
 * <SpDropdownSeparator>
 *   <template #default>
 *     <Icon class="w-4 h-4" />
 *     <span>Abschnittstitel</span>
 *   </template>
 * </SpDropdownSeparator>
 * ```
 */
const props = withDefaults(defineProps<SpDropdownSeparatorProps>(), {
  variant: 'solid',
  spacing: 'normal',
  color: 'default',
  orientation: 'horizontal',
  role: 'separator'
})

const slots = useSlots()

const separatorClasses = computed(() => [
  'sp-dropdown__separator',
  `sp-dropdown__separator--${props.variant}`,
  `sp-dropdown__separator--${props.spacing}`,
  `sp-dropdown__separator--${props.color}`,
  `sp-dropdown__separator--${props.orientation}`,
  {
    'sp-dropdown__separator--labeled': props.label || !!slots.default
  },
  props.class
])
</script>

<style scoped lang="scss">
.sp-dropdown__separator {
  // Base styles
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  
  // Spacing variants
  &--compact {
    --separator-margin: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
  }
  
  &--normal {
    --separator-margin: var(--spacing-sm, 0.5rem) var(--spacing-md, 0.75rem);
  }
  
  &--spacious {
    --separator-margin: var(--spacing-md, 0.75rem) var(--spacing-lg, 1rem);
  }
  
  // Apply margin
  margin: var(--separator-margin);
  
  // Orientation variants
  &--horizontal {
    width: 100%;
    height: auto;
    flex-direction: row;
    
    &::before {
      content: '';
      flex: 1;
      height: var(--separator-thickness, 1px);
      background: var(--separator-color);
    }
    
    &::after {
      content: '';
      flex: 1;
      height: var(--separator-thickness, 1px);
      background: var(--separator-color);
    }
  }
  
  &--vertical {
    width: auto;
    height: 100%;
    flex-direction: column;
    
    &::before {
      content: '';
      flex: 1;
      width: var(--separator-thickness, 1px);
      background: var(--separator-color);
    }
    
    &::after {
      content: '';
      flex: 1;
      width: var(--separator-thickness, 1px);
      background: var(--separator-color);
    }
  }
  
  // Visual variants
  &--solid {
    --separator-color: var(--color-border-default, #e5e7eb);
    --separator-thickness: 1px;
  }
  
  &--dashed {
    --separator-color: var(--color-border-default, #e5e7eb);
    --separator-thickness: 1px;
    
    &::before,
    &::after {
      background: repeating-linear-gradient(
        to right,
        var(--separator-color) 0,
        var(--separator-color) 4px,
        transparent 4px,
        transparent 8px
      );
    }
  }
  
  &--dotted {
    --separator-color: var(--color-border-default, #e5e7eb);
    --separator-thickness: 1px;
    
    &::before,
    &::after {
      background: repeating-linear-gradient(
        to right,
        var(--separator-color) 0,
        var(--separator-color) 1px,
        transparent 1px,
        transparent 4px
      );
    }
  }
  
  &--gradient {
    --separator-thickness: 1px;
    
    &::before,
    &::after {
      background: linear-gradient(
        90deg,
        transparent,
        var(--color-border-default, #e5e7eb) 20%,
        var(--color-border-default, #e5e7eb) 80%,
        transparent
      );
    }
  }
  
  &--double {
    --separator-thickness: 3px;
    
    &::before,
    &::after {
      background: 
        linear-gradient(var(--color-border-default, #e5e7eb), var(--color-border-default, #e5e7eb)) 0 0 / 100% 1px,
        linear-gradient(var(--color-border-default, #e5e7eb), var(--color-border-default, #e5e7eb)) 0 2px / 100% 1px;
      background-repeat: no-repeat;
    }
  }
  
  // Color variants
  &--default {
    --separator-color: var(--color-border-default, #e5e7eb);
  }
  
  &--muted {
    --separator-color: var(--color-border-muted, #f3f4f6);
  }
  
  &--accent {
    --separator-color: var(--color-border-accent, #3b82f6);
  }
  
  &--success {
    --separator-color: var(--color-border-success, #10b981);
  }
  
  &--warning {
    --separator-color: var(--color-border-warning, #f59e0b);
  }
  
  &--error {
    --separator-color: var(--color-border-error, #ef4444);
  }
  
  // Labeled separator
  &--labeled {
    &::before {
      margin-right: var(--spacing-sm, 0.5rem);
    }
    
    &::after {
      margin-left: var(--spacing-sm, 0.5rem);
    }
  }
  
  // No line for labeled separators without explicit variants
  &--labeled:not(.sp-dropdown__separator--solid):not(.sp-dropdown__separator--dashed):not(.sp-dropdown__separator--dotted):not(.sp-dropdown__separator--gradient):not(.sp-dropdown__separator--double) {
    &::before,
    &::after {
      display: none;
    }
  }
}

.sp-dropdown__separator-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 0.25rem);
  
  font-size: var(--font-size-small, 0.875rem);
  font-weight: var(--font-weight-medium, 500);
  color: var(--color-text-secondary, #6b7280);
  line-height: 1.4;
  
  padding: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
  background-color: var(--color-surface-default, #ffffff);
  border-radius: var(--border-radius-small, 0.25rem);
  
  white-space: nowrap;
  user-select: none;
}
</style>