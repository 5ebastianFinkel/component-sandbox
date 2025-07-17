<template>
  <div
    :class="subMenuClasses"
    :data-submenu-id="subMenuId"
    @keydown="handleKeyDown"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue'
import { useDropdown } from './useDropdown'
import { useDropdownSub } from './composables/useDropdownSub'
import { useDropdownProvider } from './useDropdown'
import { generateSSRSafeId } from './utils/id'
import type { SpDropdownSubProps, SpDropdownSubEmits } from './dropdown.types'

/**
 * USER-FACING DOCUMENTATION (GERMAN)
 * ==================================
 * SpDropdownSub - Container für verschachtelte Dropdown-Menüs
 * 
 * Funktionen:
 * - Vereinfachte Zustandsverwaltung mit übergeordnetem Dropdown
 * - Ordnungsgemäße Lebenszyklusverwaltung und Bereinigung
 * - SSR-sichere ID-Generierung
 * - Erweiterte Fehlerbehandlung
 * - Verbesserte Barrierefreiheit
 * 
 * @example Einfaches verschachteltes Menü
 * ```vue
 * <SpDropdown>
 *   <SpDropdownTrigger>Hauptmenü</SpDropdownTrigger>
 *   <SpDropdownContent>
 *     <SpDropdownItem>Option 1</SpDropdownItem>
 *     <SpDropdownSub>
 *       <SpDropdownSubTrigger>Weitere Optionen</SpDropdownSubTrigger>
 *       <SpDropdownSubContent>
 *         <SpDropdownItem>Unteroption 1</SpDropdownItem>
 *         <SpDropdownItem>Unteroption 2</SpDropdownItem>
 *       </SpDropdownSubContent>
 *     </SpDropdownSub>
 *   </SpDropdownContent>
 * </SpDropdown>
 * ```
 * 
 * @example Mit v-model Steuerung
 * ```vue
 * <SpDropdownSub 
 *   :model-value="istUntermenuOffen"
 *   @update:model-value="handleUntermenuToggle"
 * >
 *   <SpDropdownSubTrigger>Erweitert</SpDropdownSubTrigger>
 *   <SpDropdownSubContent>
 *     <SpDropdownItem>Erweiterte Option 1</SpDropdownItem>
 *   </SpDropdownSubContent>
 * </SpDropdownSub>
 * ```
 */

/**
 * INTERNAL DEVELOPER DOCUMENTATION (ENGLISH)  
 * ==========================================
 * @internal
 * SpDropdownSub - Container for nested dropdown menus
 * 
 * Technical implementation:
 * - Registers itself with parent dropdown context on mount
 * - Manages sub-menu state through parent coordination
 * - Implements proper cleanup on unmount to prevent memory leaks
 * - Uses display: contents to maintain layout flow
 * 
 * Architecture notes:
 * - Acts as a wrapper that provides sub-menu context
 * - Coordinates with parent to ensure only one sub-menu is open
 * - State management delegated to useDropdownSub composable
 * - ID generation uses SSR-safe utility for uniqueness
 */

const props = withDefaults(defineProps<SpDropdownSubProps>(), {
  disabled: false,
  modelValue: false
})

const emit = defineEmits<SpDropdownSubEmits>()

// Get parent dropdown context
const parentDropdown = useDropdown()

// Generate stable ID for this sub-menu
const subMenuId = generateSSRSafeId('sp-dropdown-sub')

// Use sub-menu composable for state management
const {
  isActive,
  isOpen,
  disabled,
  subMenuClasses,
  handleKeyDown,
  cleanup
} = useDropdownSub(props, emit, parentDropdown, subMenuId)

// Setup sub-dropdown context for child components
useDropdownProvider(
  { 
    modelValue: isOpen.value,
    disabled: disabled.value,
    closeOnSelect: true,
    placement: 'right-start'
  },
  () => {
    // Sub-menu state is managed by parent
  }
)

// Cleanup on unmount
onUnmounted(() => {
  cleanup()
})
</script>

<style scoped lang="scss">
.sp-dropdown-sub {
  display: contents; // Allow direct children to participate in parent layout

  &--disabled {
    pointer-events: none;
    opacity: 0.6;
  }
}
</style>