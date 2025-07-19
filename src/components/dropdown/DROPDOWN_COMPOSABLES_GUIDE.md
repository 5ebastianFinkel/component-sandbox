# Dropdown Composables Guide

This guide provides comprehensive documentation for the dropdown composables system, explaining how each composable works and demonstrating various usage patterns for building flexible dropdown components.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Composables](#core-composables)
4. [Usage Examples](#usage-examples)
5. [Advanced Patterns](#advanced-patterns)
6. [Integration with Other UI Components](#integration-with-other-ui-components)

## Overview

The dropdown composables system provides a modular, flexible approach to building dropdown menus with advanced features:

- **Compound Component Pattern**: Parent-child communication via provide/inject
- **Accessibility**: Full ARIA support and keyboard navigation
- **Positioning**: Smart collision detection and auto-positioning
- **Nested Menus**: Support for multi-level dropdown structures
- **Focus Management**: Comprehensive focus handling and type-ahead search
- **Popover API**: Native browser popover integration with fallback

## Architecture

The composables follow a hierarchical structure:

```
useDropdown (Provider)
├── useDropdownTrigger
├── useDropdownPopover
├── useDropdownPositioning
├── useDropdownFocus
└── useDropdownSub
    └── useDropdownSubTrigger
```

## Core Composables

### 1. useDropdown / useDropdownProvider

The main composable that provides context and state management for the entire dropdown system.

```typescript
// Root component (SpDropdown.vue)
import { useDropdownProvider } from './composables/useDropdown'

const dropdown = useDropdownProvider(props, emit)

// Child components
import { useDropdown } from './composables/useDropdown'

const dropdown = useDropdown() // Access parent context
```

**Key Features:**
- Manages open/closed state
- Handles sub-menu registration
- Provides keyboard navigation at the container level
- Manages hover timeouts for sub-menus

### 2. useDropdownFocus

Handles focus management and navigation within dropdown menus.

```typescript
const focus = useDropdownFocus(contentRef, {
  focusableSelector: '[role="menuitem"]:not([disabled])',
  wrapFocus: true
})

// Navigate items
focus.focusNext()
focus.focusPrevious()
focus.focusFirst()
focus.focusLast()

// Type-ahead search
focus.focusByText('opt') // Focuses item starting with "opt"
```

**Use Cases:**
- Arrow key navigation
- Home/End key support
- Type-ahead functionality
- Focus wrapping

### 3. useDropdownPopover

Integrates with the native Popover API and handles event management.

```typescript
const popover = useDropdownPopover({
  isOpen,
  close: () => { isOpen.value = false },
  updatePosition,
  focusFirst: focus.focusFirst,
  focusNext: focus.focusNext,
  onItemSelect: (item) => {
    // Handle selection
  }
})

// In template
<div 
  popover="auto"
  @toggle="popover.handlePopoverToggle"
  @keydown="popover.handleKeyDown"
>
```

**Key Features:**
- Native popover API integration
- Keyboard event handling
- Mouse interaction support
- Graceful fallback for older browsers

### 4. useDropdownPositioning

Manages dropdown positioning with collision detection.

```typescript
const { updatePosition } = useDropdownPositioning(
  contentRef,
  triggerRef,
  {
    placement: ref('bottom-start'),
    sideOffset: 8,
    avoidCollisions: true,
    autoPlacement: true // Finds best position automatically
  }
)

// Update position when dropdown opens
watch(isOpen, (open) => {
  if (open) nextTick(() => updatePosition())
})
```

**Positioning Options:**
- 12 placement options (top/bottom/left/right with start/center/end)
- Collision detection and avoidance
- Auto-placement mode
- Strategy pattern support
- ResizeObserver integration

### 5. useDropdownSub

Manages sub-menu state and behavior for nested dropdowns.

```typescript
const sub = useDropdownSub(
  props,
  emit,
  parentDropdown,
  subMenuId
)

// Access state
sub.isOpen // Is this sub-menu open?
sub.isActive // Is this the active sub-menu?
sub.disabled // Is it disabled?

// Cleanup on unmount
onUnmounted(() => sub.cleanup())
```

### 6. useDropdownSubTrigger

Handles sub-menu trigger behavior with hover support.

```typescript
const trigger = useDropdownSubTrigger(props, {
  isOpen,
  open: () => { /* open sub-menu */ },
  close: () => { /* close sub-menu */ },
  setHoverTimeout,
  clearHoverTimeout
})

// Supports different hover behaviors
// - immediate: Opens instantly on hover
// - delayed: Opens after delay (customizable)
// - disabled: No hover, keyboard/click only
```

### 7. useDropdownTrigger

Manages the main dropdown trigger button behavior.

```typescript
const trigger = useDropdownTrigger(props, dropdown)

// Supports asChild pattern
<SpDropdownTrigger as-child>
  <CustomButton>Menu</CustomButton>
</SpDropdownTrigger>

// Access computed props for custom elements
const { slotProps } = trigger
// slotProps includes: id, aria-expanded, aria-haspopup, etc.
```

## Usage Examples

### Basic Dropdown Menu

```vue
<template>
  <SpDropdown v-model="isOpen" placement="bottom-start">
    <SpDropdownTrigger>
      <button>Options</button>
    </SpDropdownTrigger>
    
    <SpDropdownContent>
      <SpDropdownItem @click="edit">Edit</SpDropdownItem>
      <SpDropdownItem @click="duplicate">Duplicate</SpDropdownItem>
      <SpDropdownSeparator />
      <SpDropdownItem @click="delete" variant="danger">
        Delete
      </SpDropdownItem>
    </SpDropdownContent>
  </SpDropdown>
</template>

<script setup>
import { ref } from 'vue'

const isOpen = ref(false)
const edit = () => { /* ... */ }
const duplicate = () => { /* ... */ }
const delete = () => { /* ... */ }
</script>
```

### Nested Dropdown (Sub-menus)

```vue
<template>
  <SpDropdown>
    <SpDropdownTrigger>File</SpDropdownTrigger>
    
    <SpDropdownContent>
      <SpDropdownItem>New File</SpDropdownItem>
      <SpDropdownItem>Open...</SpDropdownItem>
      
      <SpDropdownSub>
        <SpDropdownSubTrigger>
          Recent Files
        </SpDropdownSubTrigger>
        
        <SpDropdownSubContent>
          <SpDropdownItem>project.vue</SpDropdownItem>
          <SpDropdownItem>styles.css</SpDropdownItem>
          <SpDropdownItem>config.js</SpDropdownItem>
        </SpDropdownSubContent>
      </SpDropdownSub>
      
      <SpDropdownSeparator />
      <SpDropdownItem>Exit</SpDropdownItem>
    </SpDropdownContent>
  </SpDropdown>
</template>
```

### Custom Trigger with Hover Behavior

```vue
<template>
  <SpDropdown>
    <SpDropdownTrigger as-child>
      <CustomAvatarButton 
        :user="currentUser"
        :show-chevron="true"
      />
    </SpDropdownTrigger>
    
    <SpDropdownContent>
      <SpDropdownItem>
        <UserIcon /> Profile
      </SpDropdownItem>
      <SpDropdownItem>
        <SettingsIcon /> Settings
      </SpDropdownItem>
      
      <SpDropdownSub>
        <SpDropdownSubTrigger
          hover-behavior="delayed"
          :hover-open-delay="200"
        >
          <ThemeIcon /> Theme
        </SpDropdownSubTrigger>
        
        <SpDropdownSubContent>
          <SpDropdownItem @click="setTheme('light')">
            Light
          </SpDropdownItem>
          <SpDropdownItem @click="setTheme('dark')">
            Dark
          </SpDropdownItem>
          <SpDropdownItem @click="setTheme('system')">
            System
          </SpDropdownItem>
        </SpDropdownSubContent>
      </SpDropdownSub>
    </SpDropdownContent>
  </SpDropdown>
</template>
```

## Advanced Patterns

### 1. Programmatic Control

```typescript
// Direct composable usage for custom implementations
const contentRef = ref<HTMLElement>()
const triggerRef = ref<HTMLElement>()
const isOpen = ref(false)

// Set up positioning
const { updatePosition } = useDropdownPositioning(
  contentRef,
  triggerRef,
  {
    placement: ref('bottom-start'),
    autoPlacement: true
  }
)

// Set up focus management
const focus = useDropdownFocus(contentRef)

// Set up popover
const popover = useDropdownPopover({
  isOpen,
  close: () => { isOpen.value = false },
  updatePosition,
  focusFirst: focus.focusFirst,
  focusNext: focus.focusNext
})

// Open programmatically
const openDropdown = async () => {
  isOpen.value = true
  await nextTick()
  await popover.showPopover(contentRef.value!)
  focus.focusFirst()
}
```

### 2. Type-Ahead Search

```vue
<script setup>
import { ref } from 'vue'
import { useDropdownFocus } from './composables/useDropdownFocus'

const contentRef = ref<HTMLElement>()
const focus = useDropdownFocus(contentRef)

let searchBuffer = ''
let searchTimeout: number | null = null

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
    searchBuffer += event.key
    
    // Try to focus item matching search
    if (focus.focusByText(searchBuffer)) {
      event.preventDefault()
    }
    
    // Clear search buffer after delay
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = window.setTimeout(() => {
      searchBuffer = ''
    }, 500)
  }
}
</script>

<template>
  <div ref="contentRef" @keypress="handleKeyPress">
    <!-- Menu items -->
  </div>
</template>
```

### 3. Custom Positioning Strategy

```typescript
import { createPositioningStrategy } from './utils/positioningStrategy'

// Create custom positioning strategy
class TooltipPositionStrategy implements PositioningStrategy {
  calculatePosition(trigger: DOMRect, content: DOMRect, options: any): Position {
    // Custom positioning logic for tooltips
    return {
      left: trigger.left + trigger.width / 2 - content.width / 2,
      top: trigger.top - content.height - 8
    }
  }
}

// Use with positioning composable
const { updatePosition } = useDropdownPositioning(
  contentRef,
  triggerRef,
  {
    placement: ref('custom'),
    useStrategyPattern: true
  }
)
```

## Integration with Other UI Components

### 1. Context Menu

```vue
<script setup>
import { ref } from 'vue'

const menuRef = ref<HTMLElement>()
const contextMenuPosition = ref({ x: 0, y: 0 })
const showContextMenu = ref(false)

const handleContextMenu = (event: MouseEvent) => {
  event.preventDefault()
  contextMenuPosition.value = { x: event.clientX, y: event.clientY }
  showContextMenu.value = true
}

// Use dropdown composables for menu behavior
const focus = useDropdownFocus(menuRef)
const popover = useDropdownPopover({
  isOpen: showContextMenu,
  close: () => { showContextMenu.value = false },
  focusFirst: focus.focusFirst
})
</script>

<template>
  <div @contextmenu="handleContextMenu">
    <!-- Content -->
    
    <div
      v-if="showContextMenu"
      ref="menuRef"
      :style="{
        position: 'fixed',
        left: `${contextMenuPosition.x}px`,
        top: `${contextMenuPosition.y}px`
      }"
      @keydown="popover.handleKeyDown"
    >
      <!-- Context menu items -->
    </div>
  </div>
</template>
```

### 2. Select Component

```vue
<script setup>
// Leverage dropdown composables for select functionality
const options = ['Option 1', 'Option 2', 'Option 3']
const selected = ref(options[0])
const isOpen = ref(false)

const selectOption = (option: string) => {
  selected.value = option
  isOpen.value = false
}
</script>

<template>
  <SpDropdown v-model="isOpen" close-on-select>
    <SpDropdownTrigger as-child>
      <button class="select-trigger">
        {{ selected }}
        <ChevronDownIcon />
      </button>
    </SpDropdownTrigger>
    
    <SpDropdownContent>
      <SpDropdownItem
        v-for="option in options"
        :key="option"
        @click="selectOption(option)"
      >
        <CheckIcon v-if="option === selected" />
        {{ option }}
      </SpDropdownItem>
    </SpDropdownContent>
  </SpDropdown>
</template>
```

### 3. Command Palette

```vue
<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const allCommands = [
  { id: 'new', label: 'New File', shortcut: 'Cmd+N' },
  { id: 'open', label: 'Open...', shortcut: 'Cmd+O' },
  { id: 'save', label: 'Save', shortcut: 'Cmd+S' }
]

const filteredCommands = computed(() => 
  allCommands.filter(cmd => 
    cmd.label.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)

// Use focus composable for navigation
const contentRef = ref<HTMLElement>()
const focus = useDropdownFocus(contentRef, {
  focusableSelector: '.command-item'
})
</script>

<template>
  <SpDropdown :model-value="true" placement="top-center">
    <template #default>
      <input
        v-model="searchQuery"
        placeholder="Type a command..."
        @keydown.down.prevent="focus.focusFirst()"
      />
      
      <div ref="contentRef" class="command-list">
        <button
          v-for="cmd in filteredCommands"
          :key="cmd.id"
          class="command-item"
          @click="executeCommand(cmd.id)"
        >
          <span>{{ cmd.label }}</span>
          <kbd>{{ cmd.shortcut }}</kbd>
        </button>
      </div>
    </template>
  </SpDropdown>
</template>
```

### 4. Autocomplete/Combobox

```vue
<script setup>
const inputRef = ref<HTMLInputElement>()
const searchValue = ref('')
const suggestions = ref<string[]>([])
const showSuggestions = ref(false)

// Focus management for suggestions
const suggestionsRef = ref<HTMLElement>()
const focus = useDropdownFocus(suggestionsRef)

// Positioning for suggestions dropdown
const { updatePosition } = useDropdownPositioning(
  suggestionsRef,
  inputRef,
  {
    placement: ref('bottom-start'),
    sideOffset: 4
  }
)

const handleInput = async () => {
  // Fetch suggestions
  suggestions.value = await fetchSuggestions(searchValue.value)
  showSuggestions.value = suggestions.value.length > 0
  
  if (showSuggestions.value) {
    await nextTick()
    updatePosition()
  }
}

const selectSuggestion = (suggestion: string) => {
  searchValue.value = suggestion
  showSuggestions.value = false
  inputRef.value?.focus()
}
</script>

<template>
  <div class="autocomplete">
    <input
      ref="inputRef"
      v-model="searchValue"
      @input="handleInput"
      @keydown.down.prevent="focus.focusFirst()"
      @keydown.escape="showSuggestions = false"
    />
    
    <div
      v-if="showSuggestions"
      ref="suggestionsRef"
      class="suggestions-dropdown"
    >
      <button
        v-for="suggestion in suggestions"
        :key="suggestion"
        @click="selectSuggestion(suggestion)"
        @mouseenter="$event.target.focus()"
      >
        {{ suggestion }}
      </button>
    </div>
  </div>
</template>
```

## Best Practices

1. **Accessibility First**: Always ensure proper ARIA attributes and keyboard navigation
2. **Performance**: Use ResizeObserver efficiently, clean up on unmount
3. **Focus Management**: Implement focus trapping for better UX
4. **Error Handling**: Handle edge cases like missing refs gracefully
5. **Type Safety**: Leverage TypeScript for better developer experience

## Conclusion

The dropdown composables system provides a powerful, flexible foundation for building various dropdown-based UI components. By understanding each composable's role and how they work together, you can create sophisticated dropdown experiences that are accessible, performant, and user-friendly.