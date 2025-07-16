# SpDropdown.vue Refactoring Specification

## Current Analysis

### Component Overview
The root component of the dropdown system that provides context and manages the overall state.

### Current Issues

#### 1. **Mixed Styles and Organization** (`SpDropdown.vue:53-130`)
- Contains both component-specific styles and global dropdown utilities
- CSS animations and mixins are mixed with component styles
- Hard to maintain and understand style hierarchy

#### 2. **Mixed Language Documentation** (`SpDropdown.vue:21-31`)
- User-facing JSDoc comments should remain in German for better local user experience
- Internal implementation comments should be in English for developer collaboration
- Need clear separation between user-facing and internal documentation

#### 3. **Incomplete Root CSS Variables** (`SpDropdown.vue:66-69`)
- `:root` selector inside scoped styles won't work as expected
- CSS custom properties should be in global styles

#### 4. **Unused Utility Classes** (`SpDropdown.vue:94-129`)
- Complex utility classes that aren't used in the component
- Mixins that could be extracted to shared styles

## Proposed Refactoring

### 1. **Improve Documentation and Language**
- [ ] Keep German for user-facing documentation (Storybook, public API docs)
- [ ] Convert internal developer comments to English
- [ ] Add comprehensive JSDoc with examples in both languages
- [ ] Document the compound component pattern for developers (English)
- [ ] Add prop validation examples

### 2. **Extract and Organize Styles**
- [ ] Move shared animations to `src/styles/components/dropdown.scss`
- [ ] Extract mixins to `src/styles/mixins/dropdown.scss`
- [ ] Keep only component-specific styles in the component
- [ ] Fix CSS custom properties placement

### 3. **Enhance Component Structure**
- [ ] Add better prop validation with custom validators
- [ ] Improve error handling for edge cases
- [ ] Add component displayName for debugging
- [ ] Implement proper TypeScript generics for better type safety

### 4. **Improve Accessibility**
- [ ] Add ARIA attributes documentation
- [ ] Implement proper focus management
- [ ] Add keyboard shortcuts documentation
- [ ] Ensure proper screen reader support

## Implementation Steps

### Phase 1: Documentation and Language
```typescript
/**
 * USER-FACING DOCUMENTATION (GERMAN)
 * ==================================
 * SpDropdown - Wurzel-Dropdown-Komponente, die Kontext für alle Kindkomponenten bereitstellt
 * 
 * Implementiert das Compound-Component-Pattern, bei dem diese Wurzelkomponente
 * den Gesamtzustand verwaltet und Kontext an Kindkomponenten über provide/inject bereitstellt.
 * 
 * @example Grundlegende Verwendung
 * ```vue
 * <SpDropdown v-model:open="istOffen">
 *   <SpDropdownTrigger>Klick mich</SpDropdownTrigger>
 *   <SpDropdownContent>
 *     <SpDropdownItem>Option 1</SpDropdownItem>
 *     <SpDropdownItem>Option 2</SpDropdownItem>
 *   </SpDropdownContent>
 * </SpDropdown>
 * ```
 * 
 * @example Mit Untermenüs
 * ```vue
 * <SpDropdown v-model:open="istOffen">
 *   <SpDropdownTrigger>Hauptmenü</SpDropdownTrigger>
 *   <SpDropdownContent>
 *     <SpDropdownItem>Option 1</SpDropdownItem>
 *     <SpDropdownSub>
 *       <SpDropdownSubTrigger>Weitere Optionen</SpDropdownSubTrigger>
 *       <SpDropdownSubContent>
 *         <SpDropdownItem>Unteroption 1</SpDropdownItem>
 *       </SpDropdownSubContent>
 *     </SpDropdownSub>
 *   </SpDropdownContent>
 * </SpDropdown>
 * ```
 */

/**
 * INTERNAL DEVELOPER DOCUMENTATION (ENGLISH)
 * ==========================================
 * @internal
 * SpDropdown - Root dropdown component providing context for all child components
 * 
 * Technical implementation details:
 * - Uses Vue 3 provide/inject pattern for component communication
 * - Manages global dropdown state and sub-menu coordination
 * - Handles keyboard navigation and focus management
 * - Integrates with Popover API for positioning
 * 
 * Architecture notes:
 * - This is the container component that establishes the dropdown context
 * - All child components (trigger, content, items) consume this context
 * - State is managed via composables for better testability
 * - Sub-menus are tracked and coordinated through the parent context
 */
```

### Phase 2: Style Extraction
```scss
// Component-specific styles only
.sp-dropdown {
  position: relative;
  display: inline-block;

  &--disabled {
    pointer-events: none;
    opacity: 0.6;
  }
}
```

### Phase 3: Enhanced Props and Validation
```typescript
const props = withDefaults(defineProps<SpDropdownProps>(), {
  modelValue: false,
  disabled: false,
  closeOnSelect: true,
  placement: 'bottom-start'
})

// Add custom validation
if (process.env.NODE_ENV !== 'production') {
  // Validate placement prop
  const validPlacements = ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'left-start', 'left-end', 'right', 'right-start', 'right-end']
  if (!validPlacements.includes(props.placement)) {
    console.warn(`Invalid placement: ${props.placement}. Must be one of: ${validPlacements.join(', ')}`)
  }
}
```

### Phase 4: Component Display Name
```typescript
// Add display name for debugging
if (process.env.NODE_ENV !== 'production') {
  (getCurrentInstance()?.type as any).displayName = 'SpDropdown'
}
```

## Testing Requirements

### Unit Tests
- [ ] Test component initialization with default props
- [ ] Test v-model binding works correctly
- [ ] Test disabled state prevents interactions
- [ ] Test placement prop validation
- [ ] Test context provision to child components

### Integration Tests
- [ ] Test complete dropdown interaction flow
- [ ] Test keyboard navigation
- [ ] Test accessibility features
- [ ] Test sub-menu functionality
- [ ] Test click outside behavior

### Accessibility Tests
- [ ] Test ARIA attributes are correctly set
- [ ] Test keyboard navigation works
- [ ] Test screen reader announcements
- [ ] Test focus management
- [ ] Test high contrast mode support

## Migration Guide

### Breaking Changes
- None expected - this is primarily a documentation and organization refactor
- German documentation remains for user-facing APIs
- English documentation added for internal development

### Recommended Updates
- Update import statements if styles are moved to global location
- Consider using new validation features in development

## Files to be Created/Modified

### New Files
- `src/styles/components/dropdown.scss` - Shared dropdown styles
- `src/styles/mixins/dropdown.scss` - Dropdown mixins

### Modified Files
- `src/components/dropdown/SpDropdown.vue` - Main refactoring target
- `src/components/dropdown/dropdown.types.ts` - Enhanced type definitions

## Performance Considerations

### Improvements
- Reduced CSS bundle size by extracting shared styles
- Better tree-shaking with cleaner imports
- Improved dev experience with better error messages

### Metrics to Monitor
- Component initialization time
- CSS bundle size impact
- TypeScript compilation time
- Runtime performance in development mode

## Risk Assessment

### Low Risk
- Documentation improvements
- Style extraction
- Adding development warnings

### Medium Risk
- Moving CSS custom properties
- Changing prop validation

### Mitigation Strategies
- Comprehensive testing before deployment
- Gradual rollout of changes
- Fallback for CSS custom properties
- Backward compatibility checks