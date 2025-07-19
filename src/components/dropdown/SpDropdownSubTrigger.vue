<template>
  <button
    :id="triggerId"
    ref="triggerElement"
    :class="triggerClasses"
    role="menuitem"
    :aria-expanded="isOpen"
    :aria-haspopup="true"
    :aria-controls="contentId"
    :disabled="disabled"
    :tabindex="disabled ? -1 : 0"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
    @keydown="handleKeyDown"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <span class="sp-dropdown__sub-trigger-content">
      <slot></slot>
    </span>
    <span class="sp-dropdown__sub-trigger-icon" aria-hidden="true">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.5 2L8.5 6L4.5 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
  </button>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDropdown } from './useDropdown'
import { useDropdownSubTrigger } from './composables/useDropdownSubTrigger'
import type { SpDropdownSubTriggerProps } from './dropdown.types'

/**
 * USER-FACING DOCUMENTATION (GERMAN)
 * ==================================
 * SpDropdownSubTrigger - Trigger-Komponente für Untermenü-Dropdowns
 * 
 * Funktionen:
 * - Vollständige Tastaturnavigation mit Pfeiltasten
 * - Konfigurierbares Hover-Verhalten und -Verzögerungen
 * - Gemeinsame Gestaltung mit Dropdown-Elementen
 * - Barrierefreiheitsverbesserungen
 * 
 * @example Einfacher Untermenü-Trigger
 * ```vue
 * <SpDropdownSub>
 *   <SpDropdownSubTrigger>
 *     Weitere Optionen
 *   </SpDropdownSubTrigger>
 *   <SpDropdownSubContent>
 *     <SpDropdownItem>Unteroption 1</SpDropdownItem>
 *   </SpDropdownSubContent>
 * </SpDropdownSub>
 * ```
 * 
 * @example Mit konfiguriertem Hover-Verhalten
 * ```vue
 * <SpDropdownSubTrigger 
 *   :hover-open-delay="200"
 *   :hover-close-delay="500"
 *   hover-behavior="delayed"
 * >
 *   Erweiterte Optionen
 * </SpDropdownSubTrigger>
 * ```
 */

/**
 * INTERNAL DEVELOPER DOCUMENTATION (ENGLISH)
 * ==========================================
 * @internal
 * SpDropdownSubTrigger - Trigger component for sub-menu dropdowns
 * 
 * Technical implementation:
 * - Extends dropdown item styling for visual consistency
 * - ArrowRight key opens sub-menu and focuses first item
 * - ArrowLeft key closes sub-menu and returns focus
 * - Hover timeouts prevent accidental opens/closes
 * 
 * Architecture notes:
 * - Uses useDropdownSubTrigger composable for behavior
 * - Shares base styling with SpDropdownItem
 * - Arrow icon rotates 90deg when sub-menu is open
 */

const props = withDefaults(defineProps<SpDropdownSubTriggerProps>(), {
  disabled: false,
  hoverBehavior: 'delayed',
  hoverOpenDelay: 100,
  hoverCloseDelay: 300
})

const {
  isOpen,
  triggerId,
  contentId,
  contentRef,
  triggerRef,
  disabled: contextDisabled,
  open,
  close,
  toggle,
  clearHoverTimeout,
  setHoverTimeout
} = useDropdown()

const disabled = computed(() => props.disabled || contextDisabled.value)
const triggerElement = ref<HTMLElement>()

const {
  triggerClasses,
  handleClick,
  handleFocus,
  handleBlur,
  handleKeyDown,
  handleMouseEnter,
  handleMouseLeave
} = useDropdownSubTrigger(props, {
  isOpen,
  triggerId,
  contentId,
  contentRef,
  disabled,
  open,
  close,
  toggle,
  clearHoverTimeout,
  setHoverTimeout
})

// Register trigger ref
onMounted(() => {
  if (triggerElement.value) {
    triggerRef.value = triggerElement.value
  }
})
</script>

<style scoped lang="scss">
// Sub-trigger inherits most styles from .sp-dropdown__item
// Only add sub-trigger specific overrides here
.sp-dropdown__sub-trigger {
  // Structure
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  // Sub-trigger specific states
  &--open:not(:disabled) {
    background-color: var(--color-blue-50, #eff6ff);
    color: var(--color-blue-900, #1e3a8a);
  }
}

.sp-dropdown__sub-trigger-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sp-dropdown__sub-trigger-icon {
  display: flex;
  align-items: center;
  margin-left: var(--spacing-sm, 0.5rem);
  color: var(--color-gray-500, #6b7280);
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  
  .sp-dropdown__sub-trigger--open & {
    transform: rotate(90deg);
  }
}
</style>