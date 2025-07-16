<template>
  <SpDropdown
    v-model:modelValue="isOpen"
    :disabled="disabled"
    :close-on-select="closeOnSelect"
    :placement="placement"
    @open="onOpen"
    @close="onClose"
  >
    <SpDropdownTrigger data-testid="main-trigger">
      {{ triggerText }}
    </SpDropdownTrigger>
    <SpDropdownContent data-testid="main-content">
      <SpDropdownItem
        v-for="item in items"
        :key="item.value"
        :value="item.value"
        :disabled="item.disabled"
        @select="onItemSelect"
        :data-testid="`main-item-${item.value}`"
      >
        {{ item.label }}
      </SpDropdownItem>
      
      <!-- First Sub Menu -->
      <SpDropdownSub v-model:modelValue="subMenu1Open">
        <SpDropdownSubTrigger data-testid="sub-trigger-1">
          {{ subMenu1Title }}
        </SpDropdownSubTrigger>
        <SpDropdownSubContent data-testid="sub-content-1">
          <SpDropdownItem
            v-for="subItem in subItems1"
            :key="subItem.value"
            :value="subItem.value"
            :disabled="subItem.disabled"
            @select="onSubItem1Select"
            :data-testid="`sub1-item-${subItem.value}`"
          >
            {{ subItem.label }}
          </SpDropdownItem>
        </SpDropdownSubContent>
      </SpDropdownSub>

      <!-- Second Sub Menu -->
      <SpDropdownSub v-model:modelValue="subMenu2Open">
        <SpDropdownSubTrigger data-testid="sub-trigger-2">
          {{ subMenu2Title }}
        </SpDropdownSubTrigger>
        <SpDropdownSubContent data-testid="sub-content-2">
          <SpDropdownItem
            v-for="subItem in subItems2"
            :key="subItem.value"
            :value="subItem.value"
            :disabled="subItem.disabled"
            @select="onSubItem2Select"
            :data-testid="`sub2-item-${subItem.value}`"
          >
            {{ subItem.label }}
          </SpDropdownItem>
        </SpDropdownSubContent>
      </SpDropdownSub>

      <!-- Additional main items after sub-menus -->
      <SpDropdownItem
        v-for="item in additionalItems"
        :key="item.value"
        :value="item.value"
        :disabled="item.disabled"
        @select="onItemSelect"
        :data-testid="`main-item-${item.value}`"
      >
        {{ item.label }}
      </SpDropdownItem>
    </SpDropdownContent>
  </SpDropdown>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SpDropdown from '@/components/dropdown/SpDropdown.vue'
import SpDropdownTrigger from '@/components/dropdown/SpDropdownTrigger.vue'
import SpDropdownContent from '@/components/dropdown/SpDropdownContent.vue'
import SpDropdownItem from '@/components/dropdown/SpDropdownItem.vue'
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
  subMenu1Title?: string
  subItems1?: Array<{ value: string; label: string; disabled?: boolean }>
  subMenu2Title?: string
  subItems2?: Array<{ value: string; label: string; disabled?: boolean }>
  additionalItems?: Array<{ value: string; label: string; disabled?: boolean }>
}

const props = withDefaults(defineProps<Props>(), {
  triggerText: 'Navigation Test',
  disabled: false,
  closeOnSelect: true,
  placement: 'bottom-start',
  items: () => [
    { value: 'main1', label: 'Main Item 1' },
    { value: 'main2', label: 'Main Item 2' }
  ],
  subMenu1Title: 'Sub Menu 1',
  subItems1: () => [
    { value: 'sub1-item1', label: 'Sub 1 Item 1' },
    { value: 'sub1-item2', label: 'Sub 1 Item 2' },
    { value: 'sub1-item3', label: 'Sub 1 Item 3', disabled: true }
  ],
  subMenu2Title: 'Sub Menu 2',
  subItems2: () => [
    { value: 'sub2-item1', label: 'Sub 2 Item 1' },
    { value: 'sub2-item2', label: 'Sub 2 Item 2' }
  ],
  additionalItems: () => [
    { value: 'main3', label: 'Main Item 3' },
    { value: 'main4', label: 'Main Item 4', disabled: true }
  ]
})

const isOpen = ref(false)
const subMenu1Open = ref(false)
const subMenu2Open = ref(false)

const emit = defineEmits<{
  open: []
  close: []
  itemSelect: [value: string | number | undefined]
  subItem1Select: [value: string | number | undefined]
  subItem2Select: [value: string | number | undefined]
}>()

const onOpen = () => emit('open')
const onClose = () => emit('close')
const onItemSelect = (value: string | number | undefined) => emit('itemSelect', value)
const onSubItem1Select = (value: string | number | undefined) => emit('subItem1Select', value)
const onSubItem2Select = (value: string | number | undefined) => emit('subItem2Select', value)
</script>