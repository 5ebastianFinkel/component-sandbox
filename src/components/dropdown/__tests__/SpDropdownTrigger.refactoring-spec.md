# SpDropdownTrigger.vue Refactoring Specification

## Current Analysis

### Component Overview
The trigger component that opens/closes the dropdown menu, supporting both default button rendering and custom elements via the `asChild` pattern.

### Current Issues

#### 1. **Incomplete Implementation** (`SpDropdownTrigger.vue:95-103`)
- TODO comments for focus management in keyboard navigation
- Missing first/last item focus functionality
- Incomplete arrow key implementation

#### 2. **Mixed Language Documentation** (`SpDropdownTrigger.vue:41-54`)
- User-facing JSDoc comments should remain in German for better local user experience
- Internal implementation comments should be in English for developer collaboration
- Need clear separation between user-facing and internal documentation

#### 3. **AsChild Pattern Complexity** (`SpDropdownTrigger.vue:22-33`)
- Complex slot prop passing that could be simplified
- Potential type safety issues with props passing
- Limited documentation on usage patterns

#### 4. **Limited Accessibility** (`SpDropdownTrigger.vue:13-15`)
- Missing ARIA attributes for enhanced accessibility
- No support for additional aria-* props
- Limited screen reader context

#### 5. **Basic Styling** (`SpDropdownTrigger.vue:109-184`)
- Hardcoded arrow indicator
- Limited customization options
- No support for different trigger variants

## Proposed Refactoring

### 1. **Complete Keyboard Navigation**
- [ ] Implement proper focus management
- [ ] Add arrow key navigation to first/last items
- [ ] Integrate with dropdown content focus system
- [ ] Add proper keyboard event handling

### 2. **Improve AsChild Pattern**
- [ ] Simplify prop passing with better types
- [ ] Add validation for asChild usage
- [ ] Improve documentation and examples
- [ ] Add type safety for slot props

### 3. **Enhance Accessibility**
- [ ] Add comprehensive ARIA attributes
- [ ] Support custom aria-* props
- [ ] Add screen reader context
- [ ] Improve focus indicators

### 4. **Add Trigger Variants**
- [ ] Support different visual variants
- [ ] Add custom arrow indicators
- [ ] Improve theming support
- [ ] Add size variants

### 5. **Extract Reusable Logic**
- [ ] Create trigger behavior composable
- [ ] Share keyboard handling logic
- [ ] Extract focus management
- [ ] Create trigger state management

## Implementation Steps

### Phase 1: Complete Keyboard Navigation
```typescript
// Enhanced keyboard handling
const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      toggle()
      break
    case 'ArrowDown':
      event.preventDefault()
      if (!isOpen.value) {
        open()
      }
      // Focus first item after opening
      nextTick(() => {
        focusFirstItem()
      })
      break
    case 'ArrowUp':
      event.preventDefault()
      if (!isOpen.value) {
        open()
      }
      // Focus last item after opening
      nextTick(() => {
        focusLastItem()
      })
      break
    case 'Escape':
      if (isOpen.value) {
        event.preventDefault()
        close()
      }
      break
  }
}

// Focus management functions
const focusFirstItem = () => {
  const firstItem = contentRef.value?.querySelector('[role="menuitem"]:not([disabled])') as HTMLElement
  firstItem?.focus()
}

const focusLastItem = () => {
  const items = contentRef.value?.querySelectorAll('[role="menuitem"]:not([disabled])')
  const lastItem = items?.[items.length - 1] as HTMLElement
  lastItem?.focus()
}
```

### Phase 2: Enhanced Component Structure
```vue
<template>
  <button
    v-if="!asChild"
    :id="triggerId"
    ref="triggerElement"
    :class="triggerClasses"
    :aria-expanded="isOpen"
    :aria-haspopup="true"
    :aria-controls="contentId"
    :aria-label="ariaLabel"
    :aria-describedby="ariaDescribedby"
    :disabled="disabled"
    @click="handleClick"
    @keydown="handleKeyDown"
  >
    <span class="sp-dropdown__trigger-content">
      <slot name="icon" v-if="$slots.icon || icon">
        <component :is="icon" v-if="icon" />
      </slot>
      <slot />
    </span>
    
    <span 
      v-if="showArrow"
      class="sp-dropdown__trigger-arrow"
      :class="{ 'sp-dropdown__trigger-arrow--rotated': isOpen }"
      aria-hidden="true"
    >
      <slot name="arrow">
        <component :is="arrowIcon" />
      </slot>
    </span>
  </button>
  
  <slot
    v-else
    :props="slotProps"
    :aria-expanded="isOpen"
    :aria-haspopup="true"
    :aria-controls="contentId"
    :aria-label="ariaLabel"
    :aria-describedby="ariaDescribedby"
    :disabled="disabled"
    :class="triggerClasses"
    @click="handleClick"
    @keydown="handleKeyDown"
  />
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue'
import { useDropdown } from './useDropdown'
import { useDropdownTrigger } from './composables/useDropdownTrigger'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import type { SpDropdownTriggerProps } from './dropdown.types'

/**
 * USER-FACING DOCUMENTATION (GERMAN)
 * ==================================
 * SpDropdownTrigger - Trigger-Komponente für Dropdown-Menüs
 * 
 * Funktionen:
 * - Vollständige Tastaturnavigation (Enter, Leertaste, Pfeiltasten, Escape)
 * - AsChild-Pattern für benutzerdefinierte Trigger-Elemente
 * - Mehrere Varianten und Größen
 * - Umfassende Barrierefreiheitsunterstützung
 * - Benutzerdefinierte Pfeilindikatoren
 * - Fokusverwaltungsintegration
 * 
 * @example Grundlegende Verwendung
 * ```vue
 * <SpDropdownTrigger>
 *   Menü öffnen
 * </SpDropdownTrigger>
 * ```
 * 
 * @example Mit Symbol und Variante
 * ```vue
 * <SpDropdownTrigger
 *   variant="outline"
 *   size="lg"
 *   :icon="BenutzerIcon"
 * >
 *   Benutzermenü
 * </SpDropdownTrigger>
 * ```
 * 
 * @example Benutzerdefinierter Trigger mit asChild
 * ```vue
 * <SpDropdownTrigger as-child>
 *   <template #default="{ props }">
 *     <MeinBenutzerdefinierterButton v-bind="props">
 *       Benutzerdefinierter Trigger
 *     </MeinBenutzerdefinierterButton>
 *   </template>
 * </SpDropdownTrigger>
 * ```
 * 
 * @example Mit benutzerdefiniertem Pfeil
 * ```vue
 * <SpDropdownTrigger>
 *   <template #default>Menü</template>
 *   <template #arrow>
 *     <ChevronDownIcon class="w-4 h-4" />
 *   </template>
 * </SpDropdownTrigger>
 * ```
 */

/**
 * INTERNAL DEVELOPER DOCUMENTATION (ENGLISH)
 * ==========================================
 * @internal
 * SpDropdownTrigger - Trigger component for dropdown menus
 * 
 * Technical implementation:
 * - Supports both button rendering and asChild pattern
 * - ArrowDown/ArrowUp keys open dropdown and focus first/last item
 * - Integrates with parent dropdown context via inject
 * - Manages ARIA attributes for accessibility
 * 
 * Architecture notes:
 * - Uses useDropdownTrigger composable for behavior logic
 * - Slot props passed to asChild for custom elements
 * - Arrow icon rotates 180deg when dropdown is open
 * - Focus management coordinates with dropdown content
 */
const props = withDefaults(defineProps<SpDropdownTriggerProps>(), {
  asChild: false,
  variant: 'default',
  size: 'md',
  showArrow: true,
  arrowIcon: ChevronDownIcon
})

const {
  isOpen,
  triggerId,
  contentId,
  contentRef,
  triggerRef,
  disabled,
  toggle,
  open,
  close
} = useDropdown()

const triggerElement = ref<HTMLElement>()

const {
  triggerClasses,
  slotProps,
  handleClick,
  handleKeyDown,
  focusFirstItem,
  focusLastItem
} = useDropdownTrigger(props, {
  isOpen,
  triggerId,
  contentId,
  contentRef,
  disabled,
  toggle,
  open,
  close
})

// Register trigger ref
onMounted(() => {
  if (triggerElement.value) {
    triggerRef.value = triggerElement.value
  }
})
</script>
```

### Phase 3: Enhanced Props Interface
```typescript
export interface SpDropdownTriggerProps {
  /** Render as child element instead of button */
  asChild?: boolean
  /** Visual variant of the trigger */
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  /** Size of the trigger */
  size?: 'sm' | 'md' | 'lg'
  /** Icon component to display */
  icon?: Component
  /** Show dropdown arrow indicator */
  showArrow?: boolean
  /** Custom arrow icon component */
  arrowIcon?: Component
  /** ARIA label for accessibility */
  ariaLabel?: string
  /** ARIA describedby for accessibility */
  ariaDescribedby?: string
  /** Custom CSS classes */
  class?: string
}
```

### Phase 4: Trigger Behavior Composable
```typescript
// New composable: useDropdownTrigger.ts
export function useDropdownTrigger(
  props: SpDropdownTriggerProps,
  context: {
    isOpen: Ref<boolean>
    triggerId: Ref<string>
    contentId: Ref<string>
    contentRef: Ref<HTMLElement | null>
    disabled: Ref<boolean>
    toggle: () => void
    open: () => void
    close: () => void
  }
) {
  const triggerClasses = computed(() => [
    'sp-dropdown__trigger',
    `sp-dropdown__trigger--${props.variant}`,
    `sp-dropdown__trigger--${props.size}`,
    {
      'sp-dropdown__trigger--open': context.isOpen.value,
      'sp-dropdown__trigger--disabled': context.disabled.value
    },
    props.class
  ])
  
  const slotProps = computed(() => ({
    id: context.triggerId.value,
    'aria-expanded': context.isOpen.value,
    'aria-haspopup': 'true',
    'aria-controls': context.contentId.value,
    'aria-label': props.ariaLabel,
    'aria-describedby': props.ariaDescribedby,
    disabled: context.disabled.value,
    class: triggerClasses.value
  }))
  
  const handleClick = (event: MouseEvent) => {
    event.preventDefault()
    context.toggle()
  }
  
  const focusFirstItem = () => {
    const firstItem = context.contentRef.value?.querySelector('[role="menuitem"]:not([disabled])') as HTMLElement
    firstItem?.focus()
  }
  
  const focusLastItem = () => {
    const items = context.contentRef.value?.querySelectorAll('[role="menuitem"]:not([disabled])')
    const lastItem = items?.[items.length - 1] as HTMLElement
    lastItem?.focus()
  }
  
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        context.toggle()
        break
      case 'ArrowDown':
        event.preventDefault()
        if (!context.isOpen.value) {
          context.open()
        }
        nextTick(() => {
          focusFirstItem()
        })
        break
      case 'ArrowUp':
        event.preventDefault()
        if (!context.isOpen.value) {
          context.open()
        }
        nextTick(() => {
          focusLastItem()
        })
        break
      case 'Escape':
        if (context.isOpen.value) {
          event.preventDefault()
          context.close()
        }
        break
    }
  }
  
  return {
    triggerClasses,
    slotProps,
    handleClick,
    handleKeyDown,
    focusFirstItem,
    focusLastItem
  }
}
```

### Phase 5: Enhanced CSS with Variants
```scss
.sp-dropdown__trigger {
  // Base styles
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-xs);
  
  background-color: var(--trigger-bg, white);
  color: var(--trigger-color, var(--color-text-primary));
  border: var(--trigger-border, 1px solid var(--color-border-default));
  border-radius: var(--trigger-border-radius, var(--border-radius-medium));
  
  font-size: var(--trigger-font-size, var(--font-size-normal));
  font-weight: var(--trigger-font-weight, var(--font-weight-medium));
  line-height: 1.5;
  
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  user-select: none;
  
  // Size variants
  &--sm {
    --trigger-padding: var(--spacing-xs) var(--spacing-sm);
    --trigger-font-size: var(--font-size-small);
    --trigger-min-height: 32px;
  }
  
  &--md {
    --trigger-padding: var(--spacing-sm) var(--spacing-md);
    --trigger-font-size: var(--font-size-normal);
    --trigger-min-height: 40px;
  }
  
  &--lg {
    --trigger-padding: var(--spacing-md) var(--spacing-lg);
    --trigger-font-size: var(--font-size-large);
    --trigger-min-height: 48px;
  }
  
  // Visual variants
  &--default {
    --trigger-bg: white;
    --trigger-color: var(--color-text-primary);
    --trigger-border: 1px solid var(--color-border-default);
    
    &:hover:not(:disabled) {
      --trigger-bg: var(--color-surface-hover);
      --trigger-border: 1px solid var(--color-border-hover);
    }
  }
  
  &--outline {
    --trigger-bg: transparent;
    --trigger-color: var(--color-text-primary);
    --trigger-border: 1px solid var(--color-border-default);
    
    &:hover:not(:disabled) {
      --trigger-bg: var(--color-surface-hover);
    }
  }
  
  &--ghost {
    --trigger-bg: transparent;
    --trigger-color: var(--color-text-primary);
    --trigger-border: 1px solid transparent;
    
    &:hover:not(:disabled) {
      --trigger-bg: var(--color-surface-hover);
    }
  }
  
  &--secondary {
    --trigger-bg: var(--color-surface-secondary);
    --trigger-color: var(--color-text-primary);
    --trigger-border: 1px solid var(--color-border-secondary);
    
    &:hover:not(:disabled) {
      --trigger-bg: var(--color-surface-secondary-hover);
    }
  }
  
  // Apply computed styles
  padding: var(--trigger-padding);
  min-height: var(--trigger-min-height);
  font-size: var(--trigger-font-size);
  
  // States
  &:focus-visible {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: 2px;
  }
  
  &--open {
    --trigger-bg: var(--color-surface-active);
    --trigger-border: 1px solid var(--color-border-active);
  }
  
  &--disabled {
    --trigger-bg: var(--color-surface-disabled);
    --trigger-color: var(--color-text-disabled);
    --trigger-border: 1px solid var(--color-border-disabled);
    cursor: not-allowed;
    opacity: 0.6;
  }
}

.sp-dropdown__trigger-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex: 1;
  min-width: 0;
}

.sp-dropdown__trigger-arrow {
  display: flex;
  align-items: center;
  margin-left: auto;
  transition: transform 0.15s ease-in-out;
  opacity: 0.6;
  
  &--rotated {
    transform: rotate(180deg);
    opacity: 1;
  }
}
```

## Testing Requirements

### Unit Tests
- [ ] Test keyboard navigation completeness
- [ ] Test asChild pattern with different elements
- [ ] Test all variants and sizes
- [ ] Test focus management
- [ ] Test accessibility attributes
- [ ] Test arrow customization
- [ ] Test disabled state

### Integration Tests
- [ ] Test with dropdown content
- [ ] Test focus flow between trigger and content
- [ ] Test keyboard shortcuts
- [ ] Test custom trigger elements
- [ ] Test screen reader compatibility

### Accessibility Tests
- [ ] Test ARIA attributes
- [ ] Test keyboard navigation
- [ ] Test screen reader announcements
- [ ] Test focus indicators
- [ ] Test high contrast mode

## Migration Guide

### Breaking Changes
- Enhanced props interface (mostly additive)
- Improved keyboard navigation (may change behavior)
- New CSS custom properties for theming

### New Features
- Variant support (`variant` prop)
- Size support (`size` prop)
- Icon support (`icon` prop)
- Custom arrow support (`arrowIcon` prop and slot)
- Enhanced accessibility (`ariaLabel`, `ariaDescribedby` props)

### Recommended Updates
- Use appropriate variants for different contexts
- Add icons to improve visual hierarchy
- Provide aria-label for better accessibility
- Test custom trigger elements thoroughly

## Files to be Created/Modified

### New Files
- `src/components/dropdown/composables/useDropdownTrigger.ts`

### Modified Files
- `src/components/dropdown/SpDropdownTrigger.vue` - Main refactoring target
- `src/components/dropdown/dropdown.types.ts` - Enhanced trigger types
- `src/components/dropdown/useDropdown.ts` - May need focus management improvements

## Performance Considerations

### Improvements
- Better component reusability with composables
- Reduced bundle size with conditional rendering
- Improved keyboard navigation performance
- Better tree-shaking support

### Metrics to Monitor
- Component initialization time
- Keyboard event handling performance
- Focus management efficiency
- Custom element rendering performance

## Risk Assessment

### Low Risk
- Documentation improvements
- Adding new optional props
- CSS enhancements
- Accessibility improvements

### Medium Risk
- Changing keyboard navigation behavior
- Modifying asChild pattern
- Focus management changes

### High Risk
- Breaking existing custom trigger implementations

### Mitigation Strategies
- Comprehensive testing with existing implementations
- Gradual rollout of keyboard navigation improvements
- Backward compatibility testing
- Performance monitoring
- User feedback collection