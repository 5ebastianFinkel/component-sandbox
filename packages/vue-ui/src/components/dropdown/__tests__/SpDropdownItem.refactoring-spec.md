# SpDropdownItem.vue Refactoring Specification

## Current Analysis

### Component Overview
Individual menu item component within dropdown menus with click handling, keyboard navigation, and focus management.

### Current Issues

#### 1. **Mixed Language Documentation** (`SpDropdownItem.vue:27-40`)
- User-facing JSDoc comments should remain in German for better local user experience  
- Internal implementation comments should be in English for developer collaboration
- Need clear separation between user-facing and internal documentation

#### 2. **Basic Accessibility Implementation** (`SpDropdownItem.vue:10-19`)
- Missing ARIA attributes for enhanced accessibility
- No support for keyboard shortcuts display
- Limited screen reader support

#### 3. **Limited Extensibility** (`SpDropdownItem.vue:158-172`)
- Icon and shortcut support exists in CSS but not in component logic
- No support for different item variants (destructive, disabled states)
- Hard to extend for custom item types

#### 4. **Type Casting Issues** (`SpDropdownItem.vue:75`)
- Unsafe type casting in keyboard event handling
- Could lead to runtime errors

#### 5. **Focus Management** (`SpDropdownItem.vue:50, 14-15`)
- Manual focus state management instead of using :focus-visible
- Could be improved with better focus indicators

## Proposed Refactoring

### 1. **Enhance Accessibility**
- [ ] Add comprehensive ARIA attributes
- [ ] Implement keyboard shortcut display
- [ ] Add screen reader announcements
- [ ] Improve focus management
- [ ] Add support for item descriptions

### 2. **Improve Component API**
- [ ] Add icon slot support
- [ ] Add keyboard shortcut prop
- [ ] Add item variants (destructive, success, warning)
- [ ] Add loading state support
- [ ] Add item descriptions

### 3. **Enhance Type Safety**
- [ ] Remove unsafe type casting
- [ ] Add proper event type handling
- [ ] Improve prop validation
- [ ] Add generic type support for values

### 4. **Improve Documentation**
- [ ] Keep German for user-facing documentation (Storybook, public API docs)
- [ ] Convert internal developer comments to English
- [ ] Add comprehensive examples in both languages
- [ ] Document accessibility features in both languages  
- [ ] Add usage patterns for developers (English)

### 5. **Extract Reusable Logic**
- [ ] Create item behavior composable
- [ ] Extract keyboard handling
- [ ] Share focus management logic
- [ ] Create item state management

## Implementation Steps

### Phase 1: Enhanced Component API
```vue
<template>
  <button
    :class="itemClasses"
    role="menuitem"
    :disabled="disabled"
    :tabindex="disabled ? -1 : 0"
    :aria-describedby="description ? `${itemId}-description` : undefined"
    :aria-keyshortcuts="keyboardShortcut"
    @click="handleClick"
    @keydown="handleKeyDown"
  >
    <slot name="icon" v-if="$slots.icon" class="sp-dropdown__item-icon">
      <component :is="icon" v-if="icon" class="sp-dropdown__item-icon" />
    </slot>
    
    <span class="sp-dropdown__item-content">
      <slot />
      <span
        v-if="description"
        :id="`${itemId}-description`"
        class="sp-dropdown__item-description"
      >
        {{ description }}
      </span>
    </span>
    
    <span v-if="keyboardShortcut" class="sp-dropdown__item-shortcut">
      {{ keyboardShortcut }}
    </span>
    
    <span v-if="loading" class="sp-dropdown__item-loading" aria-hidden="true">
      <SpSpinner size="sm" />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDropdown } from './useDropdown'
import { useDropdownItem } from './composables/useDropdownItem'
import type { SpDropdownItemProps, SpDropdownItemEmits } from './dropdown.types'

/**
 * USER-FACING DOCUMENTATION (GERMAN)
 * ==================================
 * SpDropdownItem - Einzelnes Menüelement mit erweiterter Barrierefreiheit
 * 
 * Funktionen:
 * - Vollständige Unterstützung der Tastaturnavigation
 * - ARIA-Attribute für Bildschirmleser
 * - Unterstützung für Symbole und Tastaturkürzel
 * - Mehrere Varianten (Standard, destruktiv, Erfolg, Warnung)
 * - Ladezustandsunterstützung
 * - Unterstützung für Beschreibungstext
 * 
 * @example Grundlegende Verwendung
 * ```vue
 * <SpDropdownItem value="speichern" @select="handleSpeichern">
 *   Dokument speichern
 * </SpDropdownItem>
 * ```
 * 
 * @example Mit Symbol und Tastaturkürzel
 * ```vue
 * <SpDropdownItem
 *   value="speichern"
 *   :icon="SpeichernIcon"
 *   keyboard-shortcut="Strg+S"
 *   @select="handleSpeichern"
 * >
 *   Dokument speichern
 * </SpDropdownItem>
 * ```
 * 
 * @example Destruktive Aktion
 * ```vue
 * <SpDropdownItem
 *   value="loeschen"
 *   variant="destructive"
 *   :icon="PapierkorbIcon"
 *   @select="handleLoeschen"
 * >
 *   Element löschen
 * </SpDropdownItem>
 * ```
 * 
 * @example Mit Beschreibung
 * ```vue
 * <SpDropdownItem
 *   value="exportieren"
 *   description="Als PDF oder CSV herunterladen"
 *   @select="handleExportieren"
 * >
 *   Daten exportieren
 * </SpDropdownItem>
 * ```
 */

/**
 * INTERNAL DEVELOPER DOCUMENTATION (ENGLISH)
 * ==========================================
 * @internal
 * SpDropdownItem - Individual menu item component with enhanced accessibility
 * 
 * Technical implementation:
 * - Extends base button/menuitem semantics with ARIA attributes
 * - Handles click and keyboard events with proper event delegation
 * - Integrates with parent dropdown context for state management
 * - Supports async operations with loading states
 * 
 * Architecture notes:
 * - Uses useDropdownItem composable for behavior logic
 * - Shares styling with SpDropdownSubTrigger for consistency
 * - Implements proper focus management for keyboard navigation
 * - Performance optimized with event delegation
 */
const props = withDefaults(defineProps<SpDropdownItemProps>(), {
  disabled: false,
  closeOnSelect: undefined,
  variant: 'default',
  loading: false
})

const emit = defineEmits<SpDropdownItemEmits>()

const { onItemClick, closeOnSelect: parentCloseOnSelect } = useDropdown()

const {
  itemId,
  itemClasses,
  shouldCloseOnSelect,
  handleClick,
  handleKeyDown
} = useDropdownItem(props, emit, { onItemClick, parentCloseOnSelect })
</script>
```

### Phase 2: Enhanced Props Interface
```typescript
export interface SpDropdownItemProps {
  /** Unique identifier for the item */
  value?: string | number
  /** Disables the item */
  disabled?: boolean
  /** Controls whether dropdown closes when this item is selected */
  closeOnSelect?: boolean
  /** Visual variant of the item */
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  /** Icon component to display */
  icon?: Component
  /** Keyboard shortcut to display */
  keyboardShortcut?: string
  /** Description text for accessibility */
  description?: string
  /** Loading state */
  loading?: boolean
  /** Custom CSS classes */
  class?: string
}

export interface SpDropdownItemEmits {
  /** Emitted when item is clicked */
  'click': [event: MouseEvent]
  /** Emitted when item is selected */
  'select': [value: string | number | undefined]
  /** Emitted when item receives focus */
  'focus': [event: FocusEvent]
  /** Emitted when item loses focus */
  'blur': [event: FocusEvent]
}
```

### Phase 3: Item Behavior Composable
```typescript
// New composable: useDropdownItem.ts
export function useDropdownItem(
  props: SpDropdownItemProps,
  emit: SpDropdownItemEmits,
  context: { onItemClick: (value?: string) => void; parentCloseOnSelect: Ref<boolean> }
) {
  const itemId = computed(() => `sp-dropdown-item-${Math.random().toString(36).substr(2, 9)}`)
  
  const itemClasses = computed(() => [
    'sp-dropdown__item',
    `sp-dropdown__item--${props.variant}`,
    {
      'sp-dropdown__item--disabled': props.disabled,
      'sp-dropdown__item--loading': props.loading
    },
    props.class
  ])
  
  const shouldCloseOnSelect = computed(() =>
    props.closeOnSelect !== undefined ? props.closeOnSelect : context.parentCloseOnSelect.value
  )
  
  const handleClick = (event: MouseEvent) => {
    if (props.disabled || props.loading) return
    
    emit('click', event)
    emit('select', props.value)
    
    if (shouldCloseOnSelect.value) {
      context.onItemClick(props.value?.toString())
    }
  }
  
  const handleKeyDown = (event: KeyboardEvent) => {
    if (props.disabled || props.loading) return
    
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        // Create a synthetic MouseEvent for consistency
        const syntheticEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true
        })
        handleClick(syntheticEvent)
        break
    }
  }
  
  return {
    itemId,
    itemClasses,
    shouldCloseOnSelect,
    handleClick,
    handleKeyDown
  }
}
```

### Phase 4: Enhanced CSS with Variants
```scss
.sp-dropdown__item {
  // Base styles
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  margin: 1px 0;
  
  background-color: transparent;
  border: none;
  border-radius: var(--border-radius-small);
  
  font-size: var(--font-size-normal);
  font-weight: var(--font-weight-normal);
  text-align: left;
  line-height: 1.5;
  
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  
  // Variant styles
  &--default {
    color: var(--color-text-primary);
    
    &:hover:not(:disabled) {
      background-color: var(--color-surface-hover);
    }
  }
  
  &--destructive {
    color: var(--color-error-text);
    
    &:hover:not(:disabled) {
      background-color: var(--color-error-surface);
    }
  }
  
  &--success {
    color: var(--color-success-text);
    
    &:hover:not(:disabled) {
      background-color: var(--color-success-surface);
    }
  }
  
  &--warning {
    color: var(--color-warning-text);
    
    &:hover:not(:disabled) {
      background-color: var(--color-warning-surface);
    }
  }
  
  // States
  &:focus-visible {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: -2px;
  }
  
  &--disabled {
    color: var(--color-text-disabled);
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  &--loading {
    cursor: wait;
    opacity: 0.7;
  }
}

.sp-dropdown__item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.sp-dropdown__item-description {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.sp-dropdown__item-icon {
  margin-right: var(--spacing-sm);
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.sp-dropdown__item-shortcut {
  margin-left: auto;
  font-size: var(--font-size-small);
  color: var(--color-text-tertiary);
  font-family: var(--font-family-mono);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-surface-secondary);
  border-radius: var(--border-radius-small);
}

.sp-dropdown__item-loading {
  margin-left: var(--spacing-sm);
  display: flex;
  align-items: center;
}
```

## Testing Requirements

### Unit Tests
- [ ] Test all variants render correctly
- [ ] Test keyboard navigation with shortcuts
- [ ] Test accessibility attributes
- [ ] Test loading state behavior
- [ ] Test icon and description rendering
- [ ] Test event emission
- [ ] Test focus management

### Integration Tests
- [ ] Test within dropdown context
- [ ] Test with screen readers
- [ ] Test keyboard shortcuts
- [ ] Test different combinations of props
- [ ] Test error states

### Accessibility Tests
- [ ] Test ARIA attributes
- [ ] Test keyboard navigation
- [ ] Test screen reader announcements
- [ ] Test color contrast in all variants
- [ ] Test focus indicators

## Migration Guide

### Breaking Changes
- Enhanced props interface (backward compatible)
- New CSS custom properties for variants
- Improved event handling (should be compatible)

### New Features
- Variant support (`variant` prop)
- Icon support (`icon` prop and slot)
- Keyboard shortcut display (`keyboardShortcut` prop)
- Description text (`description` prop)
- Loading state (`loading` prop)

### Recommended Updates
- Add icons to important actions
- Use appropriate variants for different action types
- Add keyboard shortcuts for common actions
- Add descriptions for complex actions

## Files to be Created/Modified

### New Files
- `src/components/dropdown/composables/useDropdownItem.ts`

### Modified Files
- `src/components/dropdown/SpDropdownItem.vue` - Main refactoring target
- `src/components/dropdown/dropdown.types.ts` - Enhanced item types
- `src/components/dropdown/SpDropdownSubTrigger.vue` - May benefit from shared logic

## Performance Considerations

### Improvements
- Better component reusability
- Reduced bundle size with composables
- Improved rendering performance with computed classes
- Better tree-shaking support

### Metrics to Monitor
- Component initialization time
- Rendering performance with many items
- Memory usage with large lists
- Event handling performance

## Risk Assessment

### Low Risk
- Documentation improvements
- Adding new optional props
- CSS enhancements
- Accessibility improvements

### Medium Risk
- Changing event handling logic
- Modifying focus management
- Adding new composables

### Mitigation Strategies
- Comprehensive testing suite
- Gradual feature rollout
- Backward compatibility testing
- Performance monitoring
- Accessibility auditing