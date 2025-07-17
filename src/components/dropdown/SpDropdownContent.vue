<template>
  <div
      v-if="triggerRef"
      :id="contentId"
      ref="contentElement"
      :class="contentClasses"
      role="menu"
      :aria-labelledby="triggerId"
      popover="manual"
      @keydown="handleKeyDown"
      @toggle="handlePopoverToggle"
      @click="handleItemClick"
      @mouseenter="handleMouseEnter"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed, onUnmounted } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useDropdown } from './useDropdown'
import { useDropdownPositioning } from './composables/useDropdownPositioning'
import { useDropdownFocus } from './composables/useDropdownFocus'
import { useDropdownPopover } from './composables/useDropdownPopover'
import type { SpDropdownContentProps } from './dropdown.types'

/**
 * SpDropdownContent - Container für Dropdown-Menüelemente mit Positionierung und Tastaturnavigation
 * 
 * Funktionen:
 * - Automatische Positionierung mit Kollisionserkennung
 * - Tastaturnavigation (Pfeiltasten, Pos1, Ende, Tab, Escape)
 * - Popover-API-Integration
 * - Fokusverwaltung und -eingrenzung
 * - Erkennung von Klicks außerhalb
 * 
 * @example
 * <SpDropdownContent>
 *   <SpDropdownItem>Option 1</SpDropdownItem>
 *   <SpDropdownItem>Option 2</SpDropdownItem>
 *   <SpDropdownSeparator />
 *   <SpDropdownItem>Option 3</SpDropdownItem>
 * </SpDropdownContent>
 */
/**
 * @internal
 * Technical implementation:
 * - Uses Popover API for native browser positioning
 * - Implements collision detection algorithm for viewport boundaries
 * - Manages focus trap and keyboard event handling
 * - Coordinates with parent dropdown context via inject
 * 
 * Architecture notes:
 * - Positioning logic is extracted to useDropdownPositioning composable
 * - Focus management handled by useDropdownFocus composable
 * - Popover state synchronized with dropdown open state
 * - Performance optimized for smooth animations
 */
const props = withDefaults(defineProps<SpDropdownContentProps>(), {
  align: 'start',
  sideOffset: 4,
  avoidCollisions: true
})

const {
  isOpen,
  contentId,
  triggerId,
  contentRef,
  triggerRef,
  placement,
  close
} = useDropdown()

const contentElement = ref<HTMLElement>()

// Computed classes for better readability
const contentClasses = computed(() => [
  'sp-dropdown__content',
  `sp-dropdown__content--placement-${placement.value}`
])

// Initialize composables
const { updatePosition, stopObserving } = useDropdownPositioning(
  contentElement,
  triggerRef,
  {
    placement,
    align: props.align,
    sideOffset: props.sideOffset,
    avoidCollisions: props.avoidCollisions
  }
)

const { 
  focusFirst, 
  focusLast, 
  focusNext, 
  focusPrevious 
} = useDropdownFocus(contentElement)

const { 
  handlePopoverToggle, 
  handleKeyDown,
  handleItemClick,
  handleMouseEnter,
  showPopover,
  hidePopover
} = useDropdownPopover({
  isOpen,
  close,
  updatePosition,
  focusFirst,
  focusLast,
  focusNext,
  focusPrevious,
  onItemSelect: () => close()
})

// Register content ref and setup popover
onMounted(() => {
  if (contentElement.value) {
    contentRef.value = contentElement.value
  }
})

// Cleanup on unmount
onUnmounted(() => {
  stopObserving()
})

// Handle click outside to close dropdown
onClickOutside(
  contentElement,
  () => {
    if (isOpen.value) {
      close()
    }
  },
  {
    ignore: [triggerRef]
  }
)

// Control popover visibility
watch(isOpen, async (open) => {
  await nextTick()

  if (!contentElement.value) return

  if (open) {
    await showPopover(contentElement.value)
  } else {
    hidePopover(contentElement.value)
  }
})
</script>

<style scoped lang="scss">
.sp-dropdown__content {
  // Base layout and positioning
  position: fixed;
  inset: unset;
  z-index: var(--dropdown-z-index, 50);
  margin: 0;
  padding: var(--dropdown-padding, var(--spacing-xs, 0.25rem));
  border: 0;
  
  // Dimensions with CSS custom properties
  min-width: var(--dropdown-min-width, 180px);
  max-width: var(--dropdown-max-width, 320px);
  max-height: var(--dropdown-max-height, var(--popover-available-height, 400px));
  overflow-y: auto;
  overflow-x: hidden;
  
  // Visual styling with CSS custom properties
  background-color: var(--dropdown-bg, white);
  border: var(--dropdown-border, 1px solid var(--color-gray-200, #e5e7eb));
  border-radius: var(--dropdown-border-radius, var(--border-radius-medium, 8px));
  box-shadow: var(--dropdown-shadow, 
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05)
  );
  
  // Animation base using CSS custom properties
  opacity: 0;
  transform: var(--dropdown-transform-closed, translateY(-8px) scale(0.95));
  transition: var(--dropdown-transition, 
    opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    overlay 0.2s ease allow-discrete,
    display 0.2s ease allow-discrete
  );
  
  // Backdrop effects
  backdrop-filter: var(--dropdown-backdrop-filter, blur(8px));
  -webkit-backdrop-filter: var(--dropdown-backdrop-filter, blur(8px));
  
  // Open state
  &:popover-open {
    opacity: 1;
    transform: var(--dropdown-transform-open, translateY(0) scale(1));
  }
  
  // Starting style for entrance animation
  @starting-style {
    &:popover-open {
      opacity: 0;
      transform: var(--dropdown-transform-closed, translateY(-8px) scale(0.95));
    }
  }
  
  &:focus {
    outline: none;
  }
  
  // Custom scrollbar styling
  &::-webkit-scrollbar {
    width: var(--dropdown-scrollbar-width, 6px);
  }
  
  &::-webkit-scrollbar-track {
    background: var(--dropdown-scrollbar-track, transparent);
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: var(--dropdown-scrollbar-thumb, var(--color-gray-300, #d1d5db));
    border-radius: var(--dropdown-scrollbar-radius, 3px);
    
    &:hover {
      background-color: var(--dropdown-scrollbar-thumb-hover, var(--color-gray-400, #9ca3af));
    }
  }
  
  // Optional glass morphism effect
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: var(--dropdown-glass-effect, linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0.05)
    ));
    pointer-events: none;
    opacity: var(--dropdown-glass-opacity, 0.5);
  }
  
  // Placement-specific transforms using CSS custom properties
  &--placement-top {
    --dropdown-transform-closed: translateY(8px) scale(0.95);
  }
  
  &--placement-bottom {
    --dropdown-transform-closed: translateY(-8px) scale(0.95);
  }
  
  &--placement-left {
    --dropdown-transform-closed: translateX(8px) scale(0.95);
  }
  
  &--placement-right {
    --dropdown-transform-closed: translateX(-8px) scale(0.95);
  }
  
  // Center aligned variants
  &--placement-top-center,
  &--placement-bottom-center {
    --dropdown-transform-closed: translateX(-50%) translateY(var(--dropdown-offset-y, -8px)) scale(0.95);
    --dropdown-transform-open: translateX(-50%) translateY(0) scale(1);
  }
  
  &--placement-top-center {
    --dropdown-offset-y: 8px;
  }
  
  &--placement-left-center,
  &--placement-right-center {
    --dropdown-transform-open: translateY(-50%) translateX(0) scale(1);
  }
  
  &--placement-left-center {
    --dropdown-transform-closed: translateY(-50%) translateX(8px) scale(0.95);
  }
  
  &--placement-right-center {
    --dropdown-transform-closed: translateY(-50%) translateX(-8px) scale(0.95);
  }
}</style>