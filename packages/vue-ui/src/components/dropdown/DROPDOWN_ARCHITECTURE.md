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

## Core Architecture

### Modular Composable System

The dropdown system has been refactored into a modular architecture with specialized composables, each handling a specific concern:

```
useDropdownProvider (Main orchestrator)
├── useDropdownState (State management)
├── useDropdownRefs (DOM references)
├── useSubMenuManager (Sub-menu coordination)
├── useHoverBehavior (Hover timeout management)
└── useDropdownKeyboard (Keyboard event handling)
```

### Context Structure

The `DropdownContext` interface is composed of smaller, focused interfaces:

```typescript
interface DropdownContext extends 
    DropdownState,      // Core state (isOpen, disabled, etc.)
    DropdownRefs,       // DOM references (triggerRef, contentRef, etc.)
    SubMenuManager,     // Sub-menu management methods
    DropdownActions,    // Core actions (open, close, toggle, etc.)
    HoverBehaviorManager { // Hover behavior utilities
    parentDropdown: DropdownContext | null
}
```

## Core Composables

### 1. `useDropdownProvider` (in `useDropdown.ts`)

The main orchestrator that combines all composables to provide the complete dropdown context.

**Responsibilities:**
- Orchestrates all specialized composables
- Provides context to child components
- Manages v-model synchronization
- Handles parent dropdown relationships

**Implementation:**
```typescript
export function useDropdownProvider(props, emit) {
  // Initialize specialized composables
  const state = useDropdownState(props)
  const refs = useDropdownRefs()
  const subMenuManager = useSubMenuManager()
  const hoverBehavior = useHoverBehavior()
  
  // Setup keyboard handling
  const keyboard = useDropdownKeyboard({
    isOpen: state.isOpen,
    parentDropdown,
    close
  })
  
  // Create context by combining all parts
  const context: DropdownContext = {
    ...state,
    ...refs,
    ...subMenuManager,
    ...dropdownActions,
    ...hoverBehavior,
    parentDropdown
  }
  
  provide(DROPDOWN_INJECTION_KEY, context)
  return context
}
```

### 2. Specialized Composables

#### `useDropdownState`
Manages core reactive state with proper defaults:
- `isOpen`: Current open/closed state
- `disabled`: Whether dropdown is disabled
- `closeOnSelect`: Auto-close behavior
- `placement`: Positioning preference

#### `useDropdownRefs`
Handles DOM references and generates unique IDs:
- `triggerId` / `contentId`: Unique IDs for accessibility
- `triggerRef` / `contentRef`: DOM element references

#### `useSubMenuManager`
Dedicated sub-menu coordination:
- `activeSubMenu`: Currently active sub-menu ID
- `registerSubMenu` / `unregisterSubMenu`: Lifecycle management
- `openSubMenu` / `closeSubMenu`: State control
- `closeAllSubMenus`: Bulk operations

#### `useHoverBehavior`
Centralized hover timeout management:
- `hoverTimeout`: Current timeout reference
- `clearHoverTimeout`: Cancel pending operations
- `setHoverTimeout`: Schedule delayed actions

#### `useDropdownKeyboard`
Extensible keyboard event handling:
- `handleKeyDown`: Main event handler
- `keyHandlers`: Map of key-specific handlers
- Supports custom key bindings

### 3. `useDropdown` (Consumer)

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

### 4. `useDropdownTrigger`

Manages trigger behavior and keyboard navigation.

**Features:**
- Handles click events to toggle dropdown
- Keyboard navigation:
  - `Enter/Space`: Toggle dropdown
  - `ArrowDown`: Open and focus first item
  - `ArrowUp`: Open and focus last item
  - `Escape`: Close dropdown
- Supports `asChild` pattern for custom trigger elements

### 5. `useDropdownSubTrigger`

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

### 6. `useDropdownSub`

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

### 7. `useDropdownPositioning`

Advanced positioning with collision detection:

**Features:**
- Smart positioning with 12 placement options
- Viewport collision detection and avoidance
- Automatic flipping when space is constrained
- ResizeObserver integration for dynamic content
- Modular positioning functions:
  - `calculateHorizontalPosition` / `calculateVerticalPosition`
  - `detectHorizontalCollision` / `detectVerticalCollision`
  - `calculateAvailableSpace` / `shouldFlipPosition`

### 8. `useDropdownFocus`

Comprehensive focus management for accessibility:

**Features:**
- Navigate items with arrow keys
- Focus wrapping at boundaries
- Type-ahead search functionality
- Home/End key support
- Customizable focusable element selector

### 9. `useDropdownPopover`

Integration with native Popover API:

**Features:**
- Native browser popover support with fallback
- Keyboard event handling delegation
- Mouse interaction management
- Popover state synchronization

## Configuration and Constants

All configuration values are centralized in `constants/dropdown.constants.ts`:

```typescript
export const DROPDOWN_DEFAULTS = {
  PLACEMENT: 'bottom-start',
  SIDE_OFFSET: 4,
  HOVER_OPEN_DELAY: 100,
  HOVER_CLOSE_DELAY: 300,
  MIN_WIDTH: 180,
  MAX_WIDTH: 320,
  // ... more defaults
}

export const KEYS = {
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ENTER: 'Enter',
  // ... keyboard constants
}
```

## Type System

The type system has been enhanced with:

### Base Interfaces
```typescript
interface Disableable {
  disabled?: boolean
}

interface Closeable {
  closeOnSelect?: boolean
}

interface Positionable {
  placement?: DropdownPlacement
  align?: DropdownAlign
  sideOffset?: number
  avoidCollisions?: boolean
}
```

### Type Aliases
```typescript
type DropdownVariant = 'default' | 'destructive' | 'success' | 'warning'
type DropdownSize = 'small' | 'medium' | 'large'
type HoverBehavior = 'immediate' | 'delayed' | 'disabled'
```

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