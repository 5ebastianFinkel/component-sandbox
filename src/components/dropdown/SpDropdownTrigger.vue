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
import { ref, onMounted } from 'vue'
import { useDropdown } from './useDropdown'
import { useDropdownTrigger } from './composables/useDropdownTrigger'
import type { SpDropdownTriggerProps } from './dropdown.types'

/**
 * USER-FACING DOCUMENTATION (GERMAN)
 * ==================================
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

/**
 * INTERNAL DEVELOPER DOCUMENTATION (ENGLISH)
 * ==========================================
 * @internal
 * SpDropdownTrigger - Trigger component for dropdown menus
 * 
 * Technical implementation:
 * - Supports both default button rendering and custom elements via asChild
 * - ArrowDown opens dropdown and focuses first item
 * - ArrowUp opens dropdown and focuses last item
 * - Enter/Space toggles dropdown open/closed
 * - Escape closes dropdown if open
 * 
 * Architecture notes:
 * - Uses useDropdownTrigger composable for behavior logic
 * - AsChild pattern allows complete control over trigger element
 * - Trigger ref is registered with parent dropdown context
 * - Focus management ensures proper keyboard navigation flow
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

const {
  triggerClasses,
  slotProps,
  handleClick,
  handleKeyDown
} = useDropdownTrigger(props, {
  isOpen,
  triggerId,
  contentId,
  contentRef,
  disabled,
  toggle,
  open,
  close
})

// Register trigger ref
onMounted(() => {
  if (triggerElement.value) {
    triggerRef.value = triggerElement.value
  }
})
</script>

<style scoped lang="scss">
.sp-dropdown__trigger {
  // Minimal styles - let consumer style the trigger
  cursor: pointer;
  user-select: none;

  &--disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
}
</style>