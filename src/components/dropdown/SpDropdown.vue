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
import { getCurrentInstance } from 'vue'
import { useDropdownProvider } from './useDropdown'
import type { SpDropdownProps, SpDropdownEmits } from './dropdown.types'

/**
 * USER-FACING DOCUMENTATION (GERMAN)
 * ==================================
 * SpDropdown - Wurzel-Dropdown-Komponente, die Kontext für alle Kindkomponenten bereitstellt
 * 
 * Implementiert das Compound-Component-Pattern, bei dem diese Wurzelkomponente
 * den Gesamtzustand verwaltet und Kontext an Kindkomponenten über provide/inject bereitstellt.
 * 
 * @example Grundlegende Verwendung
 * ```vue
 * <SpDropdown v-model:open="istOffen">
 *   <SpDropdownTrigger>Klick mich</SpDropdownTrigger>
 *   <SpDropdownContent>
 *     <SpDropdownItem>Option 1</SpDropdownItem>
 *     <SpDropdownItem>Option 2</SpDropdownItem>
 *   </SpDropdownContent>
 * </SpDropdown>
 * ```
 * 
 * @example Mit Untermenüs
 * ```vue
 * <SpDropdown v-model:open="istOffen">
 *   <SpDropdownTrigger>Hauptmenü</SpDropdownTrigger>
 *   <SpDropdownContent>
 *     <SpDropdownItem>Option 1</SpDropdownItem>
 *     <SpDropdownSub>
 *       <SpDropdownSubTrigger>Weitere Optionen</SpDropdownSubTrigger>
 *       <SpDropdownSubContent>
 *         <SpDropdownItem>Unteroption 1</SpDropdownItem>
 *       </SpDropdownSubContent>
 *     </SpDropdownSub>
 *   </SpDropdownContent>
 * </SpDropdown>
 * ```
 */

/**
 * INTERNAL DEVELOPER DOCUMENTATION (ENGLISH)
 * ==========================================
 * @internal
 * SpDropdown - Root dropdown component providing context for all child components
 * 
 * Technical implementation details:
 * - Uses Vue 3 provide/inject pattern for component communication
 * - Manages global dropdown state and sub-menu coordination
 * - Handles keyboard navigation and focus management
 * - Integrates with Popover API for positioning
 * 
 * Architecture notes:
 * - This is the container component that establishes the dropdown context
 * - All child components (trigger, content, items) consume this context
 * - State is managed via composables for better testability
 * - Sub-menus are tracked and coordinated through the parent context
 */

const props = withDefaults(defineProps<SpDropdownProps>(), {
  modelValue: false,
  disabled: false,
  closeOnSelect: true,
  placement: 'bottom-start'
})

const emit = defineEmits<SpDropdownEmits>()

// Validate placement prop in development
if (process.env.NODE_ENV !== 'production') {
  const validPlacements = [
    'top', 'top-start', 'top-end',
    'bottom', 'bottom-start', 'bottom-end',
    'left', 'left-start', 'left-end',
    'right', 'right-start', 'right-end'
  ]
  if (!validPlacements.includes(props.placement)) {
    console.warn(`[SpDropdown] Invalid placement: "${props.placement}". Must be one of: ${validPlacements.join(', ')}`)
  }
}

// Setup dropdown context
const { handleKeyDown, isOpen, disabled } = useDropdownProvider(props, (_, value) => {
  emit('update:modelValue', value)

  if (value) {
    emit('open')
  } else {
    emit('close')
  }
})

// Add display name for debugging
if (process.env.NODE_ENV !== 'production') {
  const instance = getCurrentInstance()
  if (instance?.type) {
    ;(instance.type as any).displayName = 'SpDropdown'
  }
}
</script>

<style scoped lang="scss">
.sp-dropdown {
  position: relative;
  display: inline-block;

  &--open {
    // Open state styles can be added here if needed
  }

  &--disabled {
    pointer-events: none;
    opacity: 0.6;
  }
}
</style>