<template>
  <div
      :class="[
      'sp-dropdown-sub',
      {
        'sp-dropdown-sub--open': isOpen,
        'sp-dropdown-sub--disabled': disabled
      }
    ]"
      @keydown="handleKeyDown"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useDropdownProvider, useDropdown as useParentDropdown } from './useDropdown'
import type { SpDropdownSubProps, SpDropdownSubEmits } from './dropdown.types'

/**
 * SpDropdownSub Komponente
 * Container für verschachtelte Dropdown-Menüs
 *
 * @example
 * <SpDropdown>
 *   <SpDropdownTrigger>Hauptmenü</SpDropdownTrigger>
 *   <SpDropdownContent>
 *     <SpDropdownItem>Option 1</SpDropdownItem>
 *     <SpDropdownSub>
 *       <SpDropdownSubTrigger>Mehr Optionen</SpDropdownSubTrigger>
 *       <SpDropdownSubContent>
 *         <SpDropdownItem>Sub Option 1</SpDropdownItem>
 *       </SpDropdownSubContent>
 *     </SpDropdownSub>
 *   </SpDropdownContent>
 * </SpDropdown>
 */
const props = withDefaults(defineProps<SpDropdownSubProps>(), {
  disabled: false,
  modelValue: false
})

const emit = defineEmits<SpDropdownSubEmits>()

// Get parent dropdown context
const parentContext = useParentDropdown()

// Generate unique ID for this sub-menu
const subMenuId = `sp-dropdown-sub-${Math.random().toString(36).substr(2, 9)}`

// Register this sub-menu with parent
onMounted(() => {
  parentContext.registerSubMenu(subMenuId)
})

onUnmounted(() => {
  parentContext.unregisterSubMenu(subMenuId)
})

// Check if this sub-menu is active
const isActive = computed(() => parentContext.activeSubMenu.value === subMenuId)

// Override modelValue with active state from parent
const controlledModelValue = computed(() => isActive.value)

// Setup sub-dropdown context with special emit handling
const { handleKeyDown, isOpen, disabled } = useDropdownProvider(
    {
      modelValue: controlledModelValue.value,
      disabled: props.disabled,
      closeOnSelect: true
    },
    (event, value) => {
      emit('update:modelValue', value)

      if (value) {
        parentContext.openSubMenu(subMenuId)
        emit('open')
      } else {
        parentContext.closeSubMenu(subMenuId)
        emit('close')
      }
    }
)
</script>

<style scoped lang="scss">
.sp-dropdown-sub {
  position: relative;

  &--disabled {
    pointer-events: none;
    opacity: 0.6;
  }
}</style>