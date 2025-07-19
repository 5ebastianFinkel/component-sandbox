# SpDropdown Component System

A comprehensive, accessible dropdown menu component system built with Vue 3's Composition API.

## Features

- 🎯 **Modular Architecture**: Separated concerns with specialized composables
- ♿ **Fully Accessible**: ARIA compliant with comprehensive keyboard navigation
- 🎨 **Flexible Styling**: Minimal styles with CSS custom properties
- 📐 **Smart Positioning**: Collision detection and automatic repositioning
- 🪆 **Nested Menus**: Multi-level dropdown support
- 🎭 **Compound Components**: Flexible composition pattern
- 🔧 **TypeScript**: Full type safety and IntelliSense support

## Installation

The dropdown component is part of the component library. Import the components and styles as needed:

```typescript
import {
  SpDropdown,
  SpDropdownTrigger,
  SpDropdownContent,
  SpDropdownItem,
  SpDropdownSeparator,
  SpDropdownSub,
  SpDropdownSubTrigger,
  SpDropdownSubContent
} from '@/components/dropdown'
```

## Basic Usage

```vue
<template>
  <SpDropdown v-model="isOpen">
    <SpDropdownTrigger>
      <button>Options</button>
    </SpDropdownTrigger>
    
    <SpDropdownContent>
      <SpDropdownItem @click="handleEdit">Edit</SpDropdownItem>
      <SpDropdownItem @click="handleDuplicate">Duplicate</SpDropdownItem>
      <SpDropdownSeparator />
      <SpDropdownItem @click="handleDelete">Delete</SpDropdownItem>
    </SpDropdownContent>
  </SpDropdown>
</template>

<script setup>
import { ref } from 'vue'

const isOpen = ref(false)
</script>
```

## Architecture

The dropdown system uses a modular architecture with specialized composables:

### Core Structure

```
src/components/dropdown/
├── components/
│   ├── SpDropdown.vue              # Root provider component
│   ├── SpDropdownTrigger.vue       # Trigger button
│   ├── SpDropdownContent.vue       # Content container
│   ├── SpDropdownItem.vue          # Menu items
│   ├── SpDropdownSeparator.vue     # Visual divider
│   ├── SpDropdownSub.vue           # Sub-menu container
│   ├── SpDropdownSubTrigger.vue    # Sub-menu trigger
│   └── SpDropdownSubContent.vue    # Sub-menu content
├── composables/
│   ├── useDropdownState.ts         # State management
│   ├── useDropdownRefs.ts          # DOM references
│   ├── useSubMenuManager.ts        # Sub-menu coordination
│   ├── useHoverBehavior.ts         # Hover timeouts
│   ├── useDropdownKeyboard.ts      # Keyboard handling
│   ├── useDropdownFocus.ts         # Focus management
│   ├── useDropdownPopover.ts       # Popover API integration
│   ├── useDropdownPositioning.ts   # Smart positioning
│   ├── useDropdownTrigger.ts       # Trigger behavior
│   ├── useDropdownSubTrigger.ts    # Sub-trigger behavior
│   └── useDropdownSub.ts           # Sub-menu behavior
├── constants/
│   └── dropdown.constants.ts       # Configuration values
├── utils/
│   ├── id.ts                       # ID generation
│   └── positioningStrategy.ts      # Positioning strategies
├── dropdown.types.ts               # TypeScript definitions
└── useDropdown.ts                  # Main provider composable
```

### Composable Responsibilities

- **`useDropdownProvider`**: Main orchestrator combining all composables
- **`useDropdownState`**: Reactive state management
- **`useDropdownRefs`**: DOM references and ID generation
- **`useSubMenuManager`**: Sub-menu registration and lifecycle
- **`useHoverBehavior`**: Centralized hover timeout management
- **`useDropdownKeyboard`**: Extensible keyboard event handling

## API Reference

### SpDropdown

Root component that provides context to all children.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | `false` | Controls open/closed state |
| `disabled` | `boolean` | `false` | Disables the entire dropdown |
| `closeOnSelect` | `boolean` | `true` | Auto-close when item selected |
| `placement` | `DropdownPlacement` | `'bottom-start'` | Preferred positioning |

#### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `boolean` | Emitted when open state changes |
| `open` | - | Emitted when dropdown opens |
| `close` | - | Emitted when dropdown closes |

### SpDropdownItem

Individual menu items within the dropdown.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string \| number` | - | Unique value for the item |
| `disabled` | `boolean` | `false` | Disables the item |
| `closeOnSelect` | `boolean` | - | Override parent's closeOnSelect |
| `variant` | `DropdownVariant` | `'default'` | Visual style variant |

#### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `click` | `MouseEvent` | Native click event |
| `select` | `value` | Emitted when item is selected |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Enter` / `Space` | Select item or toggle dropdown |
| `ArrowDown` | Move to next item |
| `ArrowUp` | Move to previous item |
| `ArrowRight` | Open sub-menu |
| `ArrowLeft` | Close sub-menu |
| `Escape` | Close dropdown/sub-menu |
| `Tab` | Close dropdown and move focus |
| `Home` | Focus first item |
| `End` | Focus last item |

## Advanced Examples

### Nested Menus

```vue
<SpDropdown>
  <SpDropdownTrigger>File</SpDropdownTrigger>
  <SpDropdownContent>
    <SpDropdownItem>New</SpDropdownItem>
    <SpDropdownItem>Open</SpDropdownItem>
    
    <SpDropdownSub>
      <SpDropdownSubTrigger>Recent Files</SpDropdownSubTrigger>
      <SpDropdownSubContent>
        <SpDropdownItem>document.pdf</SpDropdownItem>
        <SpDropdownItem>image.png</SpDropdownItem>
      </SpDropdownSubContent>
    </SpDropdownSub>
    
    <SpDropdownSeparator />
    <SpDropdownItem>Exit</SpDropdownItem>
  </SpDropdownContent>
</SpDropdown>
```

### Custom Trigger

```vue
<SpDropdown>
  <SpDropdownTrigger as-child>
    <CustomButton variant="primary">
      <UserIcon />
      Profile
      <ChevronDownIcon />
    </CustomButton>
  </SpDropdownTrigger>
  
  <SpDropdownContent>
    <!-- content -->
  </SpDropdownContent>
</SpDropdown>
```

### Controlled State

```vue
<template>
  <SpDropdown 
    :model-value="dropdownOpen"
    @update:model-value="dropdownOpen = $event"
    @open="handleOpen"
    @close="handleClose"
  >
    <!-- content -->
  </SpDropdown>
</template>

<script setup>
const dropdownOpen = ref(false)

const handleOpen = () => {
  console.log('Dropdown opened')
}

const handleClose = () => {
  console.log('Dropdown closed')
}
</script>
```

## Styling

The components use minimal styling with CSS custom properties for customization:

```css
/* Available CSS Custom Properties */
--dropdown-min-width: 180px;
--dropdown-max-width: 320px;
--dropdown-max-height: 400px;
--dropdown-z-index: 50;
--dropdown-padding: 0.25rem;
--dropdown-bg: white;
--dropdown-border: 1px solid #e5e7eb;
--dropdown-border-radius: 8px;
--dropdown-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
```

## Browser Support

- Modern browsers with Popover API support
- Graceful fallback for older browsers
- Tested on Chrome, Firefox, Safari, Edge

## Contributing

See the main project contributing guidelines. Key points:

- Follow the existing code style
- Maintain accessibility standards
- Add tests for new features
- Update documentation

## License

Part of the component-sandbox project.