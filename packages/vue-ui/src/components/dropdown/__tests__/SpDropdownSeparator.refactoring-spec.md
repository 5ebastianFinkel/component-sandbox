# SpDropdownSeparator.vue Refactoring Specification

## Current Analysis

### Component Overview
A simple visual separator component for dividing sections within dropdown menus.

### Current Issues

#### 1. **Mixed Language Documentation** (`SpDropdownSeparator.vue:12-23`)
- User-facing JSDoc comments should remain in German for better local user experience
- Internal implementation comments should be in English for developer collaboration
- Need clear separation between user-facing and internal documentation

#### 2. **Limited Functionality** (`SpDropdownSeparator.vue:1-60`)
- Very basic implementation with only visual styling
- No support for different separator variants
- No accessibility enhancements beyond basic ARIA attributes

#### 3. **Basic Props Interface** (`SpDropdownSeparator.vue:24`)
- Only accepts a `class` prop
- No support for different separator types or styles
- Limited customization options

#### 4. **CSS Complexity** (`SpDropdownSeparator.vue:28-60`)
- Complex gradient and shadow effects that could be simplified
- Hard-coded styling values
- No support for theming or customization

#### 5. **Missing Semantic Options** 
- No support for labeled separators
- No support for different separator contexts
- Limited semantic meaning beyond visual division

## Proposed Refactoring

### 1. **Add Separator Variants**
- [ ] Add different visual styles (solid, dashed)
- [ ] Add orientation variants (vertical, horizontal)

### 2. **Enhance Accessibility**
- [ ] Add support for labeled separators
- [ ] Improve ARIA attributes
- [ ] Add screen reader context
- [ ] Support for navigation landmarks

### 3. **Improve Theming Support**
- [ ] Add CSS custom properties for theming
- [ ] Simplify gradient effects
- [ ] Add support for different color schemes
- [ ] Improve responsive design

### 4. **Add Semantic Variants**
- [ ] Add support for section separators
- [ ] Add support for group separators
- [ ] Add contextual meaning
- [ ] Add optional labels

### 5. **Improve Documentation**
- [ ] Keep German for user-facing documentation (Storybook, public API docs)
- [ ] Convert internal developer comments to English
- [ ] Add comprehensive examples in both languages
- [ ] Document accessibility features in both languages
- [ ] Add usage guidelines for developers (English)

## Implementation Steps

### Phase 1: Enhanced Component Structure
```vue
<template>
  <div
    :class="separatorClasses"
    :role="role"
    :aria-orientation="orientation"
    :aria-label="label"
    :aria-labelledby="labelledBy"
  >
    <span v-if="$slots.default || label" class="sp-dropdown__separator-label">
      <slot>{{ label }}</slot>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SpDropdownSeparatorProps } from './dropdown.types'

/**
 * USER-FACING DOCUMENTATION (GERMAN)
 * ==================================
 * SpDropdownSeparator - Visueller Trenner für Dropdown-Menüabschnitte
 * 
 * Funktionen:
 * - Mehrere visuelle Varianten (durchgehend, gestrichelt, gepunktet, Verlauf)
 * - Abstandsvarianten (kompakt, normal, geräumig)
 * - Farbvarianten für verschiedene Kontexte
 * - Optionale Beschriftungen zur Abschnittsidentifikation
 * - Vollständige Barrierefreiheitsunterstützung
 * - Theme-Unterstützung mit CSS-Custom-Properties
 * 
 * @example Einfacher Trenner
 * ```vue
 * <SpDropdownSeparator />
 * ```
 * 
 * @example Mit Beschriftung
 * ```vue
 * <SpDropdownSeparator label="Zuletzt verwendete Elemente" />
 * ```
 * 
 * @example Benutzerdefinierte Variante
 * ```vue
 * <SpDropdownSeparator 
 *   variant="dashed" 
 *   spacing="spacious" 
 *   color="muted" 
 * />
 * ```
 * 
 * @example Mit Slot-Inhalt
 * ```vue
 * <SpDropdownSeparator>
 *   <template #default>
 *     <Icon class="w-4 h-4" />
 *     <span>Abschnittstitel</span>
 *   </template>
 * </SpDropdownSeparator>
 * ```
 */

/**
 * INTERNAL DEVELOPER DOCUMENTATION (ENGLISH)
 * ==========================================
 * @internal
 * SpDropdownSeparator - Visual separator for dropdown menu sections
 * 
 * Technical implementation:
 * - Pure presentational component with no state
 * - Uses CSS pseudo-elements for line rendering
 * - Supports custom content via default slot
 * - ARIA role can be customized for different contexts
 * 
 * Architecture notes:
 * - Minimal component with focus on styling flexibility
 * - CSS-driven variants for performance
 * - Supports theming through CSS custom properties
 * - No JavaScript logic required for basic functionality
 */
const props = withDefaults(defineProps<SpDropdownSeparatorProps>(), {
  variant: 'solid',
  spacing: 'normal',
  color: 'default',
  orientation: 'horizontal',
  role: 'separator'
})

const separatorClasses = computed(() => [
  'sp-dropdown__separator',
  `sp-dropdown__separator--${props.variant}`,
  `sp-dropdown__separator--${props.spacing}`,
  `sp-dropdown__separator--${props.color}`,
  `sp-dropdown__separator--${props.orientation}`,
  {
    'sp-dropdown__separator--labeled': props.label || props.$slots?.default
  },
  props.class
])
</script>
```

### Phase 2: Enhanced Props Interface
```typescript
export interface SpDropdownSeparatorProps {
  /** Visual variant of the separator */
  variant?: 'solid' | 'dashed' | 'dotted' | 'gradient' | 'double'
  /** Spacing around the separator */
  spacing?: 'compact' | 'normal' | 'spacious'
  /** Color variant for different contexts */
  color?: 'default' | 'muted' | 'accent' | 'success' | 'warning' | 'error'
  /** Orientation of the separator */
  orientation?: 'horizontal' | 'vertical'
  /** ARIA role for the separator */
  role?: 'separator' | 'presentation' | 'none'
  /** Label for the separator section */
  label?: string
  /** ID of element that labels this separator */
  labelledBy?: string
  /** Custom CSS classes */
  class?: string
}
```

### Phase 3: Enhanced CSS with Variants
```scss
.sp-dropdown__separator {
  // Base styles
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  
  // Spacing variants
  &--compact {
    --separator-margin: var(--spacing-xs) var(--spacing-sm);
  }
  
  &--normal {
    --separator-margin: var(--spacing-sm) var(--spacing-md);
  }
  
  &--spacious {
    --separator-margin: var(--spacing-md) var(--spacing-lg);
  }
  
  // Apply margin
  margin: var(--separator-margin);
  
  // Orientation variants
  &--horizontal {
    width: 100%;
    height: auto;
    flex-direction: row;
    
    &::before {
      content: '';
      flex: 1;
      height: var(--separator-thickness, 1px);
      background: var(--separator-color);
    }
    
    &::after {
      content: '';
      flex: 1;
      height: var(--separator-thickness, 1px);
      background: var(--separator-color);
    }
  }
  
  &--vertical {
    width: auto;
    height: 100%;
    flex-direction: column;
    
    &::before {
      content: '';
      flex: 1;
      width: var(--separator-thickness, 1px);
      background: var(--separator-color);
    }
    
    &::after {
      content: '';
      flex: 1;
      width: var(--separator-thickness, 1px);
      background: var(--separator-color);
    }
  }
  
  // Visual variants
  &--solid {
    --separator-color: var(--color-border-default);
    --separator-thickness: 1px;
  }
  
  &--dashed {
    --separator-color: var(--color-border-default);
    --separator-thickness: 1px;
    
    &::before,
    &::after {
      background: repeating-linear-gradient(
        to right,
        var(--separator-color) 0,
        var(--separator-color) 4px,
        transparent 4px,
        transparent 8px
      );
    }
  }
  
  &--dotted {
    --separator-color: var(--color-border-default);
    --separator-thickness: 1px;
    
    &::before,
    &::after {
      background: repeating-linear-gradient(
        to right,
        var(--separator-color) 0,
        var(--separator-color) 1px,
        transparent 1px,
        transparent 4px
      );
    }
  }
  
  &--gradient {
    --separator-thickness: 1px;
    
    &::before,
    &::after {
      background: linear-gradient(
        90deg,
        transparent,
        var(--color-border-default) 20%,
        var(--color-border-default) 80%,
        transparent
      );
    }
  }
  
  &--double {
    --separator-thickness: 3px;
    
    &::before,
    &::after {
      background: 
        linear-gradient(var(--color-border-default), var(--color-border-default)) 0 0 / 100% 1px,
        linear-gradient(var(--color-border-default), var(--color-border-default)) 0 2px / 100% 1px;
      background-repeat: no-repeat;
    }
  }
  
  // Color variants
  &--default {
    --separator-color: var(--color-border-default);
  }
  
  &--muted {
    --separator-color: var(--color-border-muted);
  }
  
  &--accent {
    --separator-color: var(--color-border-accent);
  }
  
  &--success {
    --separator-color: var(--color-border-success);
  }
  
  &--warning {
    --separator-color: var(--color-border-warning);
  }
  
  &--error {
    --separator-color: var(--color-border-error);
  }
  
  // Labeled separator
  &--labeled {
    &::before {
      margin-right: var(--spacing-sm);
    }
    
    &::after {
      margin-left: var(--spacing-sm);
    }
  }
  
  // No line for labeled separators without variants
  &--labeled:not(.sp-dropdown__separator--solid):not(.sp-dropdown__separator--dashed):not(.sp-dropdown__separator--dotted):not(.sp-dropdown__separator--gradient):not(.sp-dropdown__separator--double) {
    &::before,
    &::after {
      display: none;
    }
  }
}

.sp-dropdown__separator-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  line-height: 1.4;
  
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-surface-default);
  border-radius: var(--border-radius-small);
  
  white-space: nowrap;
  user-select: none;
}
```

### Phase 4: Usage Examples and Patterns
```vue
<!-- Basic usage patterns -->
<template>
  <!-- Basic separator -->
  <SpDropdownSeparator />
  
  <!-- Section separator with label -->
  <SpDropdownSeparator label="Recent Files" />
  
  <!-- Visual variant -->
  <SpDropdownSeparator variant="dashed" spacing="spacious" />
  
  <!-- Contextual color -->
  <SpDropdownSeparator color="accent" />
  
  <!-- Custom label with icon -->
  <SpDropdownSeparator>
    <template #default>
      <HistoryIcon class="w-4 h-4" />
      <span>Recent Items</span>
    </template>
  </SpDropdownSeparator>
  
  <!-- Vertical separator (for sub-menus) -->
  <SpDropdownSeparator orientation="vertical" />
</template>
```

## Testing Requirements

### Unit Tests
- [ ] Test all variant combinations
- [ ] Test spacing variants
- [ ] Test color variants
- [ ] Test orientation variants
- [ ] Test with and without labels
- [ ] Test accessibility attributes
- [ ] Test custom classes

### Integration Tests
- [ ] Test within dropdown context
- [ ] Test with different menu layouts
- [ ] Test responsive behavior
- [ ] Test theming support
- [ ] Test with different content types

### Accessibility Tests
- [ ] Test ARIA attributes
- [ ] Test screen reader announcements
- [ ] Test keyboard navigation (should be skipped)
- [ ] Test high contrast mode
- [ ] Test with assistive technologies

### Visual Tests
- [ ] Test all visual variants
- [ ] Test spacing consistency
- [ ] Test color contrast
- [ ] Test responsive design
- [ ] Test theme variations

## Migration Guide

### Breaking Changes
- Enhanced props interface (mostly additive)
- New CSS custom properties for theming
- Improved accessibility attributes

### New Features
- Variant support (`variant` prop)
- Spacing support (`spacing` prop)
- Color support (`color` prop)
- Label support (`label` prop)
- Orientation support (`orientation` prop)
- Slot support for custom content

### Recommended Updates
- Use labeled separators for better organization
- Choose appropriate variants for different contexts
- Utilize spacing variants for better visual hierarchy
- Test with different themes and color schemes

## Files to be Created/Modified

### New Files
- None required (simple component)

### Modified Files
- `src/components/dropdown/SpDropdownSeparator.vue` - Main refactoring target
- `src/components/dropdown/dropdown.types.ts` - Enhanced separator types

## Performance Considerations

### Improvements
- Simplified CSS with better caching
- Reduced specificity for better performance
- Better tree-shaking with optional features
- Improved rendering performance

### Metrics to Monitor
- Component initialization time
- CSS rendering performance
- Memory usage (minimal impact expected)
- Bundle size impact

## Risk Assessment

### Low Risk
- Documentation improvements
- Adding new optional props
- CSS enhancements
- Accessibility improvements

### Very Low Risk
- This is a simple presentational component
- Changes are mostly additive
- No complex logic or state management
- Minimal impact on existing implementations

### Mitigation Strategies
- Comprehensive visual regression testing
- Theme compatibility testing
- Accessibility auditing
- Performance monitoring (minimal impact expected)

## Design Considerations

### Visual Hierarchy
- Different variants serve different purposes
- Spacing variants help establish visual rhythm
- Color variants provide semantic meaning
- Labels add contextual information

### Accessibility
- Proper ARIA attributes for screen readers
- Semantic role options for different contexts
- Label support for better navigation
- High contrast mode support

### Theming
- CSS custom properties for easy customization
- Support for different color schemes
- Responsive design considerations
- Consistent with design system tokens

## Future Enhancements

### Potential Additions
- Animation support for dynamic separators
- Icon integration for decorative separators
- Collapsible section support
- Integration with menu grouping logic

### Extensibility
- Plugin system for custom variants
- Advanced theming options
- Custom separator shapes
- Integration with design tokens system