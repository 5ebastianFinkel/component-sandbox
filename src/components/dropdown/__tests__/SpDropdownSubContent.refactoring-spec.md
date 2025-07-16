# SpDropdownSubContent.vue Refactoring Specification

## Current Analysis

### Component Overview
Content container for sub-menu items with positioning, keyboard navigation, and mouse interaction handling specific to nested menu behavior.

### Current Issues

#### 1. **Duplicate Positioning Logic** (`SpDropdownSubContent.vue:103-147`)
- 44 lines of positioning code very similar to SpDropdownContent
- Manual positioning calculations duplicated
- Collision detection logic duplicated
- Should share positioning logic with main content

#### 2. **Mixed Language Documentation** (`SpDropdownSubContent.vue:29-38`)
- User-facing JSDoc comments should remain in German for better local user experience
- Internal implementation comments should be in English for developer collaboration
- Need clear separation between user-facing and internal documentation

#### 3. **Complex Mouse Interaction** (`SpDropdownSubContent.vue:82-100`)
- Complex click-outside logic specific to sub-menus
- Hover timeout management duplicated from trigger
- Mouse event handling could be simplified
- Race conditions with rapid mouse movements

#### 4. **Duplicate Focus Management** (`SpDropdownSubContent.vue:176-234`)
- Focus navigation functions identical to SpDropdownContent
- Should share focus management logic
- Code duplication increases maintenance burden

#### 5. **Hardcoded Values** (`SpDropdownSubContent.vue:78, 132`)
- Hardcoded hover delay (300ms)
- Hardcoded collision detection margins (8px)
- No configuration options
- Not consistent with design system

#### 6. **CSS Duplication** (`SpDropdownSubContent.vue:238-326`)
- Very similar CSS to SpDropdownContent
- Same animation patterns
- Same styling approach
- Should share base styles

## Proposed Refactoring

### 1. **Share Positioning Logic**
- [ ] Use shared positioning composable from SpDropdownContent
- [ ] Extend positioning for sub-menu specific needs
- [ ] Reduce code duplication
- [ ] Improve maintainability

### 2. **Extract Mouse Interaction Logic**
- [ ] Create sub-menu mouse behavior composable
- [ ] Simplify click-outside handling
- [ ] Improve hover timeout management
- [ ] Add configuration options

### 3. **Share Focus Management**
- [ ] Use shared focus composable from SpDropdownContent
- [ ] Extend for sub-menu specific navigation
- [ ] Reduce code duplication
- [ ] Improve consistency

### 4. **Share CSS Styles**
- [ ] Extend base content styles
- [ ] Add sub-menu specific overrides
- [ ] Reduce CSS duplication
- [ ] Improve theming consistency

### 5. **Add Configuration Options**
- [ ] Add hover delay configuration
- [ ] Add positioning options
- [ ] Add animation variants
- [ ] Add collision detection settings

### 6. **Improve Documentation**
- [ ] Keep German for user-facing documentation (Storybook, public API docs)
- [ ] Convert internal developer comments to English
- [ ] Add comprehensive examples in both languages
- [ ] Document sub-menu behavior for developers (English)
- [ ] Add troubleshooting guide for developers (English)

## Implementation Steps

### Phase 1: Shared Logic Integration
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
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useDropdown } from './useDropdown'
import { useDropdownPositioning } from './composables/useDropdownPositioning'
import { useDropdownFocus } from './composables/useDropdownFocus'
import { useDropdownPopover } from './composables/useDropdownPopover'
import { useDropdownSubMouse } from './composables/useDropdownSubMouse'
import type { SpDropdownSubContentProps } from './dropdown.types'

/**
 * USER-FACING DOCUMENTATION (GERMAN)
 * ==================================
 * SpDropdownSubContent - Container für Untermenüelemente mit erweiterter Positionierung
 * 
 * Funktionen:
 * - Gemeinsame Positionierungslogik mit Haupt-Dropdown-Inhalt
 * - Untermenüspezifische Mausinteraktionsbehandlung
 * - Konfigurierbare Hover-Verzögerungen und -Verhalten
 * - Erweiterte Tastaturnavigation
 * - Ordnungsgemäße Fokusverwaltung für verschachtelte Menüs
 * - Kollisionserkennung und Viewport-Bewusstsein
 * 
 * @example Grundlegender Untermenü-Inhalt
 * ```vue
 * <SpDropdownSubContent>
 *   <SpDropdownItem>Unteroption 1</SpDropdownItem>
 *   <SpDropdownItem>Unteroption 2</SpDropdownItem>
 *   <SpDropdownSeparator />
 *   <SpDropdownItem>Unteroption 3</SpDropdownItem>
 * </SpDropdownSubContent>
 * ```
 * 
 * @example Mit benutzerdefinierter Positionierung
 * ```vue
 * <SpDropdownSubContent
 *   align="center"
 *   :side-offset="8"
 *   :avoid-collisions="true"
 * >
 *   <SpDropdownItem>Zentrierte Unteroption</SpDropdownItem>
 * </SpDropdownSubContent>
 * ```
 * 
 * @example Mit Hover-Konfiguration
 * ```vue
 * <SpDropdownSubContent
 *   :hover-close-delay="500"
 *   :hover-enter-delay="100"
 * >
 *   <SpDropdownItem>Verzögerte Unteroption</SpDropdownItem>
 * </SpDropdownSubContent>
 * ```
 */

/**
 * INTERNAL DEVELOPER DOCUMENTATION (ENGLISH)
 * ==========================================
 * @internal
 * SpDropdownSubContent - Container for sub-menu items with enhanced positioning
 * 
 * Technical implementation:
 * - Shares positioning composable with main content for consistency
 * - Implements sub-menu specific hover timeouts
 * - ArrowLeft key closes sub-menu and returns focus to trigger
 * - Default positioning is right-start (opens to the right)
 * 
 * Architecture notes:
 * - Extends base dropdown content functionality
 * - Mouse enter/leave events manage hover timeouts
 * - Collision detection flips to left side when needed
 * - Higher z-index than main dropdown for proper layering
 */
const props = withDefaults(defineProps<SpDropdownSubContentProps>(), {
  align: 'start',
  sideOffset: 4,
  avoidCollisions: true,
  hoverCloseDelay: 300,
  hoverEnterDelay: 0,
  placement: 'right-start' // Sub-menus default to right
})

const {
  isOpen,
  contentId,
  triggerId,
  contentRef,
  triggerRef,
  close,
  clearHoverTimeout,
  setHoverTimeout
} = useDropdown()

const contentElement = ref<HTMLElement>()

// Shared positioning logic
const { updatePosition } = useDropdownPositioning(contentElement, triggerRef, {
  placement: computed(() => props.placement),
  align: props.align,
  sideOffset: props.sideOffset,
  avoidCollisions: props.avoidCollisions,
  strategy: 'submenu' // Special strategy for sub-menus
})

// Shared focus management
const { focusFirst, focusLast, focusNext, focusPrevious } = useDropdownFocus(contentElement)

// Shared popover management
const { handlePopoverToggle } = useDropdownPopover({
  isOpen,
  close,
  updatePosition,
  focusFirst,
  focusLast,
  focusNext,
  focusPrevious,
  type: 'submenu'
})

// Sub-menu specific mouse handling
const { handleMouseEnter, handleMouseLeave } = useDropdownSubMouse({
  isOpen,
  close,
  clearHoverTimeout,
  setHoverTimeout,
  hoverCloseDelay: props.hoverCloseDelay,
  hoverEnterDelay: props.hoverEnterDelay
})

// Enhanced keyboard navigation for sub-menus
const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      focusNext()
      break
    case 'ArrowUp':
      event.preventDefault()
      focusPrevious()
      break
    case 'Home':
      event.preventDefault()
      focusFirst()
      break
    case 'End':
      event.preventDefault()
      focusLast()
      break
    case 'ArrowLeft':
      // Close sub-menu and return focus to parent trigger
      event.preventDefault()
      close()
      nextTick(() => {
        triggerRef.value?.focus()
      })
      break
    case 'ArrowRight':
      // If focused item is a sub-trigger, open it
      const focusedElement = document.activeElement as HTMLElement
      if (focusedElement?.classList.contains('sp-dropdown__sub-trigger')) {
        event.preventDefault()
        focusedElement.click()
      }
      break
    case 'Tab':
      // Close on tab to maintain normal tab flow
      event.preventDefault()
      close()
      break
    case 'Escape':
      // Close and return focus to parent trigger
      event.preventDefault()
      close()
      nextTick(() => {
        triggerRef.value?.focus()
      })
      break
  }
}

const contentClasses = computed(() => [
  'sp-dropdown__content',
  'sp-dropdown__sub-content',
  `sp-dropdown__sub-content--align-${props.align}`,
  `sp-dropdown__sub-content--placement-${props.placement}`
])

// Setup lifecycle and refs
onMounted(() => {
  if (contentElement.value) {
    contentRef.value = contentElement.value
  }
})
</script>
```

### Phase 2: Sub-Menu Mouse Composable
```typescript
// New composable: useDropdownSubMouse.ts
export function useDropdownSubMouse(options: {
  isOpen: Ref<boolean>
  close: () => void
  clearHoverTimeout: () => void
  setHoverTimeout: (callback: () => void, delay: number) => void
  hoverCloseDelay: number
  hoverEnterDelay: number
}) {
  const handleMouseEnter = () => {
    // Clear any pending close timeout
    options.clearHoverTimeout()
  }
  
  const handleMouseLeave = () => {
    // Set timeout to close sub-menu
    options.setHoverTimeout(() => {
      if (options.isOpen.value) {
        options.close()
      }
    }, options.hoverCloseDelay)
  }
  
  return {
    handleMouseEnter,
    handleMouseLeave
  }
}
```

### Phase 3: Enhanced Props Interface
```typescript
export interface SpDropdownSubContentProps {
  /** Alignment relative to trigger */
  align?: 'start' | 'center' | 'end'
  /** Distance from trigger in pixels */
  sideOffset?: number
  /** Enable collision detection with viewport */
  avoidCollisions?: boolean
  /** Preferred placement of sub-content */
  placement?: 'right-start' | 'right-end' | 'left-start' | 'left-end' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'
  /** Delay before closing on mouse leave (ms) */
  hoverCloseDelay?: number
  /** Delay before entering on mouse enter (ms) */
  hoverEnterDelay?: number
  /** Animation variant for sub-menu */
  animation?: 'slide' | 'fade' | 'scale' | 'none'
  /** z-index for the sub-content */
  zIndex?: number
  /** Custom CSS classes */
  class?: string
}
```

### Phase 4: Enhanced Positioning Strategy
```typescript
// Enhanced positioning strategy for sub-menus
export function createSubMenuPositioningStrategy(placement: string) {
  return {
    calculatePosition(
      triggerRect: DOMRect,
      contentRect: DOMRect,
      options: PositioningOptions
    ) {
      const [side, align = 'start'] = placement.split('-')
      
      let left = 0
      let top = 0
      
      // Sub-menus typically open to the right or left
      switch (side) {
        case 'right':
          left = triggerRect.right + options.sideOffset
          break
        case 'left':
          left = triggerRect.left - contentRect.width - options.sideOffset
          break
        case 'top':
          top = triggerRect.top - contentRect.height - options.sideOffset
          break
        case 'bottom':
          top = triggerRect.bottom + options.sideOffset
          break
      }
      
      // Align vertically or horizontally based on side
      if (side === 'right' || side === 'left') {
        switch (align) {
          case 'start':
            top = triggerRect.top
            break
          case 'center':
            top = triggerRect.top + (triggerRect.height - contentRect.height) / 2
            break
          case 'end':
            top = triggerRect.bottom - contentRect.height
            break
        }
      } else {
        switch (align) {
          case 'start':
            left = triggerRect.left
            break
          case 'center':
            left = triggerRect.left + (triggerRect.width - contentRect.width) / 2
            break
          case 'end':
            left = triggerRect.right - contentRect.width
            break
        }
      }
      
      return { left, top }
    },
    
    handleCollisions(
      position: { left: number; top: number },
      triggerRect: DOMRect,
      contentRect: DOMRect,
      viewport: { width: number; height: number }
    ) {
      // Sub-menu specific collision handling
      const margin = 8
      
      // Horizontal collision
      if (position.left + contentRect.width > viewport.width - margin) {
        // Try flipping to the left side
        const leftSidePosition = triggerRect.left - contentRect.width - margin
        if (leftSidePosition >= margin) {
          position.left = leftSidePosition
        } else {
          position.left = viewport.width - contentRect.width - margin
        }
      }
      
      if (position.left < margin) {
        position.left = margin
      }
      
      // Vertical collision
      if (position.top + contentRect.height > viewport.height - margin) {
        position.top = viewport.height - contentRect.height - margin
      }
      
      if (position.top < margin) {
        position.top = margin
      }
      
      return position
    }
  }
}
```

### Phase 5: Simplified CSS with Shared Styles
```scss
.sp-dropdown__sub-content {
  // Extend base dropdown content styles
  @extend .sp-dropdown__content;
  
  // Sub-menu specific overrides
  z-index: var(--dropdown-sub-z-index, 60); // Higher than main dropdown
  
  // Default animation for sub-menus (slide from left)
  opacity: 0;
  transform: translateX(-8px) scale(0.95);
  transition:
    opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.15s cubic-bezier(0.4, 0, 0.2, 1),
    overlay 0.15s ease allow-discrete,
    display 0.15s ease allow-discrete;
  
  &:popover-open {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  
  @starting-style {
    &:popover-open {
      opacity: 0;
      transform: translateX(-8px) scale(0.95);
    }
  }
  
  // Placement-specific animations
  &--placement-right-start,
  &--placement-right-end {
    transform: translateX(-8px) scale(0.95);
    
    &:popover-open {
      transform: translateX(0) scale(1);
    }
  }
  
  &--placement-left-start,
  &--placement-left-end {
    transform: translateX(8px) scale(0.95);
    
    &:popover-open {
      transform: translateX(0) scale(1);
    }
  }
  
  &--placement-top-start,
  &--placement-top-end {
    transform: translateY(8px) scale(0.95);
    
    &:popover-open {
      transform: translateY(0) scale(1);
    }
  }
  
  &--placement-bottom-start,
  &--placement-bottom-end {
    transform: translateY(-8px) scale(0.95);
    
    &:popover-open {
      transform: translateY(0) scale(1);
    }
  }
  
  // Alignment-specific adjustments
  &--align-center {
    transform-origin: center;
  }
  
  &--align-end {
    transform-origin: bottom right;
  }
  
  // Sub-menu specific styling
  border-left: 2px solid var(--color-border-accent);
  margin-left: 2px;
  
  // Slightly different shadow for depth
  box-shadow: 
    0 12px 20px -4px rgba(0, 0, 0, 0.12),
    0 6px 8px -2px rgba(0, 0, 0, 0.08);
}
```

## Testing Requirements

### Unit Tests
- [ ] Test shared positioning logic
- [ ] Test sub-menu specific mouse interactions
- [ ] Test hover delay configurations
- [ ] Test keyboard navigation enhancements
- [ ] Test collision detection for sub-menus
- [ ] Test animation variants
- [ ] Test z-index layering

### Integration Tests
- [ ] Test with parent dropdown content
- [ ] Test nested sub-menu behavior
- [ ] Test focus flow between levels
- [ ] Test mouse interaction consistency
- [ ] Test accessibility features
- [ ] Test responsive behavior

### Performance Tests
- [ ] Test positioning performance with shared logic
- [ ] Test memory usage with many sub-menus
- [ ] Test animation performance
- [ ] Test hover timeout efficiency

### Accessibility Tests
- [ ] Test keyboard navigation between levels
- [ ] Test screen reader announcements
- [ ] Test focus management
- [ ] Test ARIA attributes
- [ ] Test high contrast mode

## Migration Guide

### Breaking Changes
- Enhanced props interface (mostly additive)
- Shared positioning logic (internal changes)
- Improved keyboard navigation (may change behavior)

### New Features
- Placement support (`placement` prop)
- Hover delay configuration
- Animation variants
- Enhanced collision detection
- Improved keyboard navigation

### Recommended Updates
- Test positioning with different placements
- Configure hover delays appropriately
- Test keyboard navigation thoroughly
- Verify accessibility features

## Files to be Created/Modified

### New Files
- `src/components/dropdown/composables/useDropdownSubMouse.ts`

### Modified Files
- `src/components/dropdown/SpDropdownSubContent.vue` - Main refactoring target
- `src/components/dropdown/dropdown.types.ts` - Enhanced sub-content types
- `src/components/dropdown/composables/useDropdownPositioning.ts` - Add sub-menu strategy

## Performance Considerations

### Improvements
- Reduced code duplication with shared logic
- Better positioning performance with optimized calculations
- Improved hover timeout management
- Better CSS performance with shared styles

### Metrics to Monitor
- Positioning calculation performance
- Mouse interaction efficiency
- Animation smoothness
- Memory usage with nested menus

## Risk Assessment

### Low Risk
- Documentation improvements
- Adding new optional props
- CSS organization improvements
- Shared logic extraction

### Medium Risk
- Changing positioning logic
- Modifying mouse interaction behavior
- Keyboard navigation changes

### High Risk
- Breaking existing sub-menu implementations
- Focus management changes

### Mitigation Strategies
- Comprehensive testing with existing sub-menu implementations
- Gradual rollout of shared logic
- Performance monitoring
- Accessibility auditing
- User feedback collection

## Code Quality Improvements

### Shared Logic Benefits
- Reduced maintenance burden
- Consistent behavior across components
- Better testability
- Improved performance

### Extensibility
- Easy to add new positioning strategies
- Configurable hover behavior
- Extensible animation system
- Flexible collision detection

## Future Enhancements

### Potential Additions
- Multi-level nesting support
- Custom animation configurations
- Advanced collision detection
- Touch interaction support

### Performance Optimizations
- Lazy positioning calculations
- Optimized hover timeout management
- Better animation performance
- Reduced bundle size impact