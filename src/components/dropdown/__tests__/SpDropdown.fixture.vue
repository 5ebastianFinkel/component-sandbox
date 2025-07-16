<template>
  <SpDropdown
    v-model:modelValue="isOpen"
    :disabled="disabled"
    :close-on-select="closeOnSelect"
    :placement="placement"
    @open="onOpen"
    @close="onClose"
  >
    <SpDropdownTrigger data-testid="trigger">
      {{ triggerText }}
    </SpDropdownTrigger>
    <SpDropdownContent data-testid="content">
      <SpDropdownItem
        v-for="item in items"
        :key="item.value"
        :value="item.value"
        :disabled="item.disabled"
        @select="onItemSelect"
        :data-testid="`item-${item.value}`"
      >
        {{ item.label }}
      </SpDropdownItem>
      <SpDropdownSeparator v-if="showSeparator" />
      <SpDropdownSub v-if="showSubMenu" v-model:modelValue="subMenuOpen">
        <SpDropdownSubTrigger data-testid="sub-trigger">
          Sub Menu
        </SpDropdownSubTrigger>
        <SpDropdownSubContent data-testid="sub-content">
          <SpDropdownItem
            v-for="subItem in subItems"
            :key="subItem.value"
            :value="subItem.value"
            @select="onSubItemSelect"
            :data-testid="`sub-item-${subItem.value}`"
          >
            {{ subItem.label }}
          </SpDropdownItem>
        </SpDropdownSubContent>
      </SpDropdownSub>
    </SpDropdownContent>
  </SpDropdown>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SpDropdown from '@/components/dropdown/SpDropdown.vue'
import SpDropdownTrigger from '@/components/dropdown/SpDropdownTrigger.vue'
import SpDropdownContent from '@/components/dropdown/SpDropdownContent.vue'
import SpDropdownItem from '@/components/dropdown/SpDropdownItem.vue'
import SpDropdownSeparator from '@/components/dropdown/SpDropdownSeparator.vue'
import SpDropdownSub from '@/components/dropdown/SpDropdownSub.vue'
import SpDropdownSubTrigger from '@/components/dropdown/SpDropdownSubTrigger.vue'
import SpDropdownSubContent from '@/components/dropdown/SpDropdownSubContent.vue'
import type { DropdownPlacement } from '@/components/dropdown/dropdown.types'

interface Props {
  triggerText?: string
  disabled?: boolean
  closeOnSelect?: boolean
  placement?: DropdownPlacement
  items?: Array<{ value: string; label: string; disabled?: boolean }>
  showSeparator?: boolean
  showSubMenu?: boolean
  subItems?: Array<{ value: string; label: string }>
}

const props = withDefaults(defineProps<Props>(), {
  triggerText: 'Click me',
  disabled: false,
  closeOnSelect: true,
  placement: 'bottom-start',
  items: () => [
    { value: 'item1', label: 'Item 1' },
    { value: 'item2', label: 'Item 2' },
    { value: 'item3', label: 'Item 3', disabled: true }
  ],
  showSeparator: false,
  showSubMenu: false,
  subItems: () => [
    { value: 'sub1', label: 'Sub Item 1' },
    { value: 'sub2', label: 'Sub Item 2' }
  ]
})

const isOpen = ref(false)
const subMenuOpen = ref(false)

const emit = defineEmits<{
  open: []
  close: []
  itemSelect: [value: string | number | undefined]
  subItemSelect: [value: string | number | undefined]
}>()

const onOpen = () => emit('open')
const onClose = () => emit('close')
const onItemSelect = (value: string | number | undefined) => emit('itemSelect', value)
const onSubItemSelect = (value: string | number | undefined) => emit('subItemSelect', value)
</script>