# Dropdown Component Architecture

## Overview

The dropdown component system is built using Vue 3's Composition API with a compound component pattern. This architecture provides maximum flexibility while maintaining a clean API and proper separation of concerns.

## Core Concepts

### 1. Compound Component Pattern

The dropdown system consists of multiple components that work together:

```vue
<SpDropdown v-model:open="isOpen">
  <SpDropdownTrigger>Open Menu</SpDropdownTrigger>
  <SpDropdownContent>
    <SpDropdownItem>Option 1</SpDropdownItem>
    <SpDropdownSeparator />
    <SpDropdownSub>
      <SpDropdownSubTrigger>More Options</SpDropdownSubTrigger>
      <SpDropdownSubContent>
        <SpDropdownItem>Sub Option 1</SpDropdownItem>
      </SpDropdownSubContent>
    </SpDropdownSub>
  </SpDropdownContent>
</SpDropdown>
```

### 2. Context Provider Pattern

The root `SpDropdown` component provides context to all child components using Vue's provide/inject mechanism. This allows child components to access shared state and methods without prop drilling.

## Component Hierarchy

```
SpDropdown (Root Provider)
├── SpDropdownTrigger (Opens/closes dropdown)
└── SpDropdownContent (Contains menu items)
    ├── SpDropdownItem (Selectable option)
    ├── SpDropdownSeparator (Visual divider)
    └── SpDropdownSub (Sub-menu container)
        ├── SpDropdownSubTrigger (Opens sub-menu)
        └── SpDropdownSubContent (Sub-menu items)
            └── SpDropdownItem (Sub-menu option)
```

## Core Composables

### 1. `useDropdownProvider` (in `useDropdown.ts`)

The main composable that manages the dropdown state and provides context to child components.

**Responsibilities:**
- Manages open/closed state
- Generates unique IDs for accessibility
- Handles sub-menu coordination
- Manages focus and keyboard navigation
- Provides methods for opening, closing, and toggling

**Key Features:**
```typescript
// State Management
const isOpen = ref(false)
const activeSubMenu = ref<string | null>(null)
const subMenus = ref<Set<string>>(new Set())

// Methods
const open = () => { /* Opens dropdown */ }
const close = () => { /* Closes dropdown and sub-menus */ }
const toggle = () => { /* Toggles open/closed state */ }

// Sub-menu Management
const registerSubMenu = (id: string) => { /* Registers a sub-menu */ }
const unregisterSubMenu = (id: string) => { /* Cleanup on unmount */ }
const openSubMenu = (id: string) => { /* Opens specific sub-menu */ }
const closeSubMenu = (id: string) => { /* Closes specific sub-menu */ }
```

### 2. `useDropdown` (Consumer)

A simple composable that injects the dropdown context for child components.

```typescript
export function useDropdown() {
  const context = inject(DROPDOWN_INJECTION_KEY)
  if (!context) {
    throw new Error('useDropdown must be used within SpDropdown')
  }
  return context
}
```

### 3. `useDropdownTrigger`

Manages trigger behavior and keyboard navigation.

**Features:**
- Handles click events to toggle dropdown
- Keyboard navigation:
  - `Enter/Space`: Toggle dropdown
  - `ArrowDown`: Open and focus first item
  - `ArrowUp`: Open and focus last item
  - `Escape`: Close dropdown
- Supports `asChild` pattern for custom trigger elements

### 4. `useDropdownSubTrigger`

Specialized trigger for sub-menus with hover behavior.

**Features:**
- Extends base trigger functionality
- Keyboard navigation:
  - `ArrowRight`: Open sub-menu and focus first item
  - `ArrowLeft`: Close sub-menu
- Configurable hover delays:
  - `hoverOpenDelay`: Time before opening on hover
  - `hoverCloseDelay`: Time before closing on mouse leave
- Prevents accidental opens/closes with hover timeouts

### 5. `useDropdownSub`

Manages sub-menu state and coordination with parent dropdown.

**Features:**
- Registers/unregisters with parent dropdown
- Syncs state with parent's `activeSubMenu`
- Handles keyboard events (Escape, ArrowLeft)
- Manages cleanup on unmount

## State Flow

### 1. Opening a Dropdown

```
User clicks trigger → handleClick() → toggle() → open() → isOpen = true
                                                        ↓
                                              emit('update:modelValue', true)
                                                        ↓
                                              Parent component updated
```

### 2. Opening a Sub-menu

```
Hover over sub-trigger → handleMouseEnter() → setHoverTimeout() → open()
                                                                ↓
                                              parentDropdown.openSubMenu(id)
                                                                ↓
                                              activeSubMenu = id
                                                                ↓
                                              Sub-menu becomes visible
```

### 3. Keyboard Navigation Flow

```
ArrowDown on trigger → Opens dropdown → Focuses first menuitem
                                    ↓
                    ArrowDown → Moves focus to next item
                                    ↓
                    ArrowRight on sub-trigger → Opens sub-menu
                                                      ↓
                                              Focuses first sub-item
```

## Focus Management

The system maintains proper focus management for accessibility:

1. **Opening**: When opened via keyboard, focus moves to first/last item
2. **Navigation**: Arrow keys move focus between items
3. **Closing**: Focus returns to trigger element
4. **Sub-menus**: Focus moves seamlessly between menu levels

## Accessibility Features

### ARIA Attributes

- **Trigger**: `aria-expanded`, `aria-haspopup`, `aria-controls`
- **Content**: `role="menu"`, proper IDs for association
- **Items**: `role="menuitem"`, `tabindex` management
- **Sub-menus**: Nested ARIA relationships maintained

### Keyboard Support

| Key | Action |
|-----|--------|
| `Enter/Space` | Select item or toggle dropdown |
| `ArrowDown` | Move to next item |
| `ArrowUp` | Move to previous item |
| `ArrowRight` | Open sub-menu |
| `ArrowLeft` | Close sub-menu |
| `Escape` | Close dropdown/sub-menu |
| `Tab` | Close dropdown and move focus |
| `Home` | Focus first item |
| `End` | Focus last item |

## Styling Architecture

### CSS Classes

The component uses BEM naming convention:

```scss
.sp-dropdown              // Root container
.sp-dropdown--open        // Open state
.sp-dropdown--disabled    // Disabled state

.sp-dropdown__trigger     // Trigger button
.sp-dropdown__content     // Menu container
.sp-dropdown__item        // Menu item
.sp-dropdown__separator   // Divider

.sp-dropdown__sub         // Sub-menu container
.sp-dropdown__sub-trigger // Sub-menu trigger
.sp-dropdown__sub-content // Sub-menu content
```

### Minimal Styling Philosophy

Components have minimal built-in styles to allow maximum customization:
- Structure and layout are preserved
- Visual styling is left to consumers
- CSS custom properties used for theming

## Advanced Features

### 1. AsChild Pattern

The trigger supports rendering custom elements:

```vue
<SpDropdownTrigger as-child>
  <template #default="{ props }">
    <CustomButton v-bind="props">
      Custom Trigger
    </CustomButton>
  </template>
</SpDropdownTrigger>
```

### 2. Controlled State

Full v-model support for controlled components:

```vue
<SpDropdown v-model:open="dropdownOpen" @open="onOpen" @close="onClose">
  <!-- content -->
</SpDropdown>
```

### 3. Nested Sub-menus

Sub-menus can be nested to create multi-level navigation:

```vue
<SpDropdownSub>
  <SpDropdownSubTrigger>Level 1</SpDropdownSubTrigger>
  <SpDropdownSubContent>
    <SpDropdownSub>
      <SpDropdownSubTrigger>Level 2</SpDropdownSubTrigger>
      <SpDropdownSubContent>
        <SpDropdownItem>Deep option</SpDropdownItem>
      </SpDropdownSubContent>
    </SpDropdownSub>
  </SpDropdownSubContent>
</SpDropdownSub>
```

## Performance Considerations

### 1. Event Delegation
- Keyboard events are handled at container level
- Reduces number of event listeners

### 2. Lazy Rendering
- Content only renders when open
- Sub-menus render on demand

### 3. Cleanup
- Proper cleanup of timeouts and event listeners
- Sub-menus unregister on unmount

## Testing Strategy

### Unit Tests
- Component isolation with mocked context
- Composable logic testing
- Accessibility attribute verification

### Integration Tests
- Full dropdown interaction flows
- Keyboard navigation sequences
- Sub-menu coordination

### E2E Tests
- Real browser interactions
- Focus management verification
- Screen reader compatibility

## Best Practices

### 1. Always Provide Labels
```vue
<SpDropdownTrigger aria-label="User menu">
  <UserIcon />
</SpDropdownTrigger>
```

### 2. Group Related Items
```vue
<SpDropdownContent>
  <SpDropdownItem>Profile</SpDropdownItem>
  <SpDropdownItem>Settings</SpDropdownItem>
  <SpDropdownSeparator />
  <SpDropdownItem>Logout</SpDropdownItem>
</SpDropdownContent>
```

### 3. Use Semantic Structure
- Keep menu depth reasonable (max 2-3 levels)
- Group related options together
- Use separators to create visual hierarchy

### 4. Handle Loading States
```vue
<SpDropdownContent>
  <div v-if="loading" class="loading">Loading...</div>
  <template v-else>
    <SpDropdownItem v-for="item in items" :key="item.id">
      {{ item.label }}
    </SpDropdownItem>
  </template>
</SpDropdownContent>
```

## Troubleshooting

### Common Issues

1. **Context Error**: "useDropdown must be used within SpDropdown"
   - Ensure components are properly nested
   - Check that SpDropdown is the root provider

2. **Focus Not Working**: Focus management requires proper structure
   - Ensure items have `role="menuitem"`
   - Check tabindex values
   - Verify no CSS preventing focus

3. **Sub-menus Not Opening**: Check hover delays
   - Adjust `hoverOpenDelay` and `hoverCloseDelay`
   - Ensure mouse events are not blocked

## Future Enhancements

- [ ] Animation support with configurable transitions
- [ ] Portal/Teleport support for content rendering
- [ ] Touch gesture support for mobile
- [ ] Typeahead search functionality
- [ ] Virtual scrolling for large lists
- [ ] RTL (Right-to-Left) support