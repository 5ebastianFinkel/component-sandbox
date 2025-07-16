# SpDropdownContent.vue Refactoring Specification

## Current Analysis

### Component Overview
The content container component that holds dropdown items and handles positioning, keyboard navigation, and popover management.

### Current Issues

#### 1. **Complex Positioning Logic** (`SpDropdownContent.vue:80-213`)
- 133 lines of complex positioning code in a single function
- Mixed concerns: positioning, collision detection, and alignment
- Hard to test and maintain
- Duplicate logic shared with SpDropdownSubContent

#### 2. **Mixed Responsibilities** (`SpDropdownContent.vue:20-292`)
- Handles positioning, focus management, event handling, and popover control
- Single component doing too many things
- Makes testing and debugging difficult

#### 3. **Mixed Language Documentation** (`SpDropdownContent.vue:26-35`)
- User-facing JSDoc comments should remain in German for better local user experience
- Internal implementation comments should be in English for developer collaboration

#### 4. **Repetitive Focus Management** (`SpDropdownContent.vue:242-291`)
- Focus navigation functions have similar patterns
- Could be extracted to a shared utility
- Hard to maintain consistent behavior

#### 5. **Complex CSS** (`SpDropdownContent.vue:294-467`)
- Very long CSS with many placement variants
- Repetitive animation rules
- Hard to understand and modify

## Proposed Refactoring

### 1. **Extract Positioning Logic**
- [ ] Create `useDropdownPositioning` composable
- [ ] Extract collision detection to separate utility
- [ ] Create reusable positioning strategy pattern
- [ ] Share positioning logic between Content and SubContent

### 2. **Extract Focus Management**
- [ ] Create `useDropdownFocus` composable
- [ ] Implement reusable focus navigation utilities
- [ ] Add proper focus trapping
- [ ] Improve accessibility compliance

### 3. **Simplify Component Structure**
- [ ] Convert to more focused single-responsibility component
- [ ] Extract event handling to composables
- [ ] Improve prop validation and defaults
- [ ] Add better error handling

### 4. **Improve Documentation and Language**
- [ ] Keep German for user-facing documentation (Storybook, public API docs)
- [ ] Convert internal developer comments to English
- [ ] Add comprehensive JSDoc with examples in both languages
- [ ] Document popover API usage for developers (English)
- [ ] Add accessibility documentation in both languages

### 5. **Optimize CSS Structure**
- [ ] Extract animation variants to CSS custom properties
- [ ] Simplify placement-specific styles
- [ ] Use CSS Grid/Flexbox for better layout
- [ ] Reduce CSS specificity issues

## Implementation Steps

### Phase 1: Extract Positioning Logic
```typescript
// New composable: useDropdownPositioning.ts
export function useDropdownPositioning(
  contentElement: Ref<HTMLElement | null>,
  triggerElement: Ref<HTMLElement | null>,
  options: PositioningOptions
) {
  const updatePosition = () => {
    if (!contentElement.value || !triggerElement.value) return
    
    const strategy = createPositioningStrategy(options.placement)
    const position = strategy.calculatePosition(
      triggerElement.value.getBoundingClientRect(),
      contentElement.value.getBoundingClientRect(),
      options
    )
    
    applyPosition(contentElement.value, position)
  }
  
  return { updatePosition }
}
```

### Phase 2: Extract Focus Management
```typescript
// New composable: useDropdownFocus.ts
export function useDropdownFocus(containerElement: Ref<HTMLElement | null>) {
  const focusableSelector = '[role="menuitem"]:not([disabled])'
  
  const getFocusableItems = () => {
    return Array.from(
      containerElement.value?.querySelectorAll(focusableSelector) || []
    ) as HTMLElement[]
  }
  
  const focusItem = (index: number) => {
    const items = getFocusableItems()
    items[index]?.focus()
  }
  
  const focusNext = () => {
    const items = getFocusableItems()
    const currentIndex = items.findIndex(item => item === document.activeElement)
    const nextIndex = (currentIndex + 1) % items.length
    focusItem(nextIndex)
  }
  
  // ... other focus utilities
  
  return {
    focusFirst: () => focusItem(0),
    focusLast: () => focusItem(getFocusableItems().length - 1),
    focusNext,
    focusPrevious: () => { /* implementation */ }
  }
}
```

### Phase 3: Simplified Component Structure
```vue
<template>
  <div
    v-if="triggerRef"
    :id="contentId"
    ref="contentElement"
    :class="contentClasses"
    role="menu"
    :aria-labelledby="triggerId"
    popover="manual"
    @keydown="handleKeyDown"
    @toggle="handlePopoverToggle"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDropdown } from './useDropdown'
import { useDropdownPositioning } from './composables/useDropdownPositioning'
import { useDropdownFocus } from './composables/useDropdownFocus'
import { useDropdownPopover } from './composables/useDropdownPopover'

/**
 * USER-FACING DOCUMENTATION (GERMAN)
 * ==================================
 * SpDropdownContent - Container für Dropdown-Menüelemente mit Positionierung und Tastaturnavigation
 * 
 * Funktionen:
 * - Automatische Positionierung mit Kollisionserkennung
 * - Tastaturnavigation (Pfeiltasten, Pos1, Ende, Tab, Escape)
 * - Popover-API-Integration
 * - Fokusverwaltung und -eingrenzung
 * - Erkennung von Klicks außerhalb
 * 
 * @example
 * ```vue
 * <SpDropdownContent>
 *   <SpDropdownItem>Option 1</SpDropdownItem>
 *   <SpDropdownItem>Option 2</SpDropdownItem>
 *   <SpDropdownSeparator />
 *   <SpDropdownItem>Option 3</SpDropdownItem>
 * </SpDropdownContent>
 * ```
 */

/**
 * INTERNAL DEVELOPER DOCUMENTATION (ENGLISH)
 * ==========================================
 * @internal
 * SpDropdownContent - Container for dropdown menu items with positioning and keyboard navigation
 * 
 * Technical implementation:
 * - Uses Popover API for native browser positioning
 * - Implements collision detection algorithm for viewport boundaries
 * - Manages focus trap and keyboard event handling
 * - Coordinates with parent dropdown context via inject
 * 
 * Architecture notes:
 * - Positioning logic is extracted to useDropdownPositioning composable
 * - Focus management handled by useDropdownFocus composable
 * - Popover state synchronized with dropdown open state
 * - Performance optimized for smooth animations
 */
const props = withDefaults(defineProps<SpDropdownContentProps>(), {
  align: 'start',
  sideOffset: 4,
  avoidCollisions: true
})

const {
  isOpen,
  contentId,
  triggerId,
  contentRef,
  triggerRef,
  placement,
  close
} = useDropdown()

const contentElement = ref<HTMLElement>()

// Use extracted composables
const { updatePosition } = useDropdownPositioning(contentElement, triggerRef, {
  placement,
  align: props.align,
  sideOffset: props.sideOffset,
  avoidCollisions: props.avoidCollisions
})

const { focusFirst, focusLast, focusNext, focusPrevious } = useDropdownFocus(contentElement)

const { handlePopoverToggle, handleKeyDown } = useDropdownPopover({
  isOpen,
  close,
  updatePosition,
  focusFirst,
  focusLast,
  focusNext,
  focusPrevious
})

// Computed classes for better readability
const contentClasses = computed(() => [
  'sp-dropdown__content',
  `sp-dropdown__content--placement-${placement.value}`
])

// Setup lifecycle and refs
onMounted(() => {
  if (contentElement.value) {
    contentRef.value = contentElement.value
  }
})
</script>
```

### Phase 4: Simplified CSS Structure
```scss
.sp-dropdown__content {
  // Base styles
  position: fixed;
  z-index: var(--dropdown-z-index, 50);
  
  // Dimensions
  min-width: var(--dropdown-min-width, 180px);
  max-width: var(--dropdown-max-width, 320px);
  max-height: var(--dropdown-max-height, 400px);
  
  // Visual styling
  background: var(--dropdown-bg, white);
  border: var(--dropdown-border, 1px solid var(--color-gray-200));
  border-radius: var(--dropdown-border-radius, 8px);
  box-shadow: var(--dropdown-shadow, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
  
  // Animation base
  opacity: 0;
  transform: var(--dropdown-transform-closed, translateY(-8px) scale(0.95));
  transition: var(--dropdown-transition, 
    opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)
  );
  
  // Open state
  &:popover-open {
    opacity: 1;
    transform: var(--dropdown-transform-open, translateY(0) scale(1));
  }
  
  // Placement-specific custom properties
  &--placement-top {
    --dropdown-transform-closed: translateY(8px) scale(0.95);
  }
  
  &--placement-left {
    --dropdown-transform-closed: translateX(8px) scale(0.95);
  }
  
  &--placement-right {
    --dropdown-transform-closed: translateX(-8px) scale(0.95);
  }
}
```

## Testing Requirements

### Unit Tests
- [ ] Test positioning calculations with different placements
- [ ] Test collision detection edge cases
- [ ] Test keyboard navigation behaviors
- [ ] Test popover API integration
- [ ] Test focus management
- [ ] Test click outside behavior

### Integration Tests
- [ ] Test complete dropdown interaction flow
- [ ] Test with different content sizes
- [ ] Test viewport collision scenarios
- [ ] Test with nested dropdowns
- [ ] Test accessibility features

### Performance Tests
- [ ] Test positioning performance with many items
- [ ] Test animation performance
- [ ] Test memory leaks in popover management
- [ ] Test scroll performance with long lists

## Migration Guide

### Breaking Changes
- Positioning logic moved to composables (internal change)
- CSS custom properties changed for theming
- Some internal method signatures changed

### Recommended Updates
- Update any custom positioning logic to use new composables
- Update CSS custom properties for theming
- Test accessibility features thoroughly

## Files to be Created/Modified

### New Files
- `src/components/dropdown/composables/useDropdownPositioning.ts`
- `src/components/dropdown/composables/useDropdownFocus.ts`
- `src/components/dropdown/composables/useDropdownPopover.ts`
- `src/components/dropdown/utils/positioningStrategy.ts`

### Modified Files
- `src/components/dropdown/SpDropdownContent.vue` - Main refactoring target
- `src/components/dropdown/SpDropdownSubContent.vue` - Will reuse positioning logic
- `src/components/dropdown/dropdown.types.ts` - Enhanced positioning types

## Performance Considerations

### Improvements
- Reduced component complexity improves bundle size
- Better tree-shaking with composables
- Improved positioning performance with optimized calculations
- Reduced CSS specificity and better caching

### Metrics to Monitor
- Component initialization time
- Positioning calculation performance
- Animation smoothness
- Memory usage in long-running applications

## Risk Assessment

### Low Risk
- Documentation improvements
- CSS organization
- Extracting composables

### Medium Risk
- Changing positioning logic
- Modifying keyboard navigation
- Updating focus management

### High Risk
- Popover API changes
- Breaking accessibility features

### Mitigation Strategies
- Comprehensive testing suite
- Gradual rollout with feature flags
- Backward compatibility layers
- Performance monitoring
- Accessibility audits