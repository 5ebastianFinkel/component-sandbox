# SpDropdownSubTrigger.vue Refactoring Specification

## Current Analysis

### Component Overview
Trigger component for sub-menu dropdowns with hover and keyboard interactions, extending the functionality of regular dropdown items.

### Current Issues

#### 1. **Incomplete Implementation** (`SpDropdownSubTrigger.vue:106-107`)
- TODO comments for focus management
- Missing first item focus functionality after opening sub-menu
- Incomplete keyboard navigation implementation

#### 2. **Mixed Language Documentation** (`SpDropdownSubTrigger.vue:43-56`)
- User-facing JSDoc comments should remain in German for better local user experience
- Internal implementation comments should be in English for developer collaboration
- Need clear separation between user-facing and internal documentation

#### 3. **Complex Mouse Handling** (`SpDropdownSubTrigger.vue:124-142`)
- Complex hover timeout logic
- Hardcoded delay values
- No configuration options for hover behavior
- Potential race conditions with rapid mouse movements

#### 4. **Duplicate Item Styling** (`SpDropdownSubTrigger.vue:146-240`)
- Duplicates styling from SpDropdownItem
- Inconsistent with DRY principle
- Hard to maintain consistent styling
- Increased bundle size

#### 5. **Arrow Icon Hardcoded** (`SpDropdownSubTrigger.vue:30-35`)
- Hardcoded SVG arrow icon
- No customization options
- Not using design system icons
- Inconsistent with other components

#### 6. **Limited Accessibility** (`SpDropdownSubTrigger.vue:14-19`)
- Basic ARIA attributes
- No support for enhanced accessibility features
- Missing keyboard shortcuts indication
- Limited screen reader support

## Proposed Refactoring

### 1. **Complete Keyboard Navigation**
- [ ] Implement proper sub-menu focus management
- [ ] Add arrow key navigation to sub-menu items
- [ ] Integrate with parent dropdown navigation
- [ ] Add escape key handling

### 2. **Extract Shared Styling**
- [ ] Share styles with SpDropdownItem
- [ ] Create base item component or mixin
- [ ] Reduce code duplication
- [ ] Improve maintainability

### 3. **Enhance Hover Behavior**
- [ ] Add configurable hover delays
- [ ] Improve hover state management
- [ ] Add hover behavior variants
- [ ] Prevent race conditions

### 4. **Improve Icon System**
- [ ] Use design system icons
- [ ] Add icon customization options
- [ ] Support different arrow styles
- [ ] Add icon animation options

### 5. **Enhance Accessibility**
- [ ] Add comprehensive ARIA attributes
- [ ] Support keyboard shortcuts display
- [ ] Add screen reader enhancements
- [ ] Improve focus indicators

### 6. **Add Trigger Variants**
- [ ] Support different visual styles
- [ ] Add size variants
- [ ] Add state variants
- [ ] Add customization options

## Implementation Steps

### Phase 1: Complete Keyboard Navigation
```typescript
const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      event.stopPropagation()
      toggle()
      // Focus first item after opening
      if (!isOpen.value) {
        nextTick(() => {
          focusFirstSubMenuItem()
        })
      }
      break
    case 'ArrowRight':
      event.preventDefault()
      event.stopPropagation()
      if (!isOpen.value) {
        open()
        nextTick(() => {
          focusFirstSubMenuItem()
        })
      }
      break
    case 'ArrowLeft':
      event.preventDefault()
      event.stopPropagation()
      if (isOpen.value) {
        close()
        // Return focus to this trigger
        nextTick(() => {
          triggerElement.value?.focus()
        })
      }
      break
    case 'ArrowDown':
    case 'ArrowUp':
      // Don't prevent default - let parent handle navigation between triggers
      break
    case 'Escape':
      if (isOpen.value) {
        event.preventDefault()
        event.stopPropagation()
        close()
      }
      break
  }
}

const focusFirstSubMenuItem = () => {
  const subContent = contentRef.value
  if (subContent) {
    const firstItem = subContent.querySelector('[role="menuitem"]:not([disabled])') as HTMLElement
    firstItem?.focus()
  }
}
```

### Phase 2: Enhanced Component Structure
```vue
<template>
  <component
    :is="baseComponent"
    :id="triggerId"
    ref="triggerElement"
    :class="triggerClasses"
    role="menuitem"
    :aria-expanded="isOpen"
    :aria-haspopup="true"
    :aria-controls="contentId"
    :aria-keyshortcuts="keyboardShortcut"
    :disabled="disabled"
    :tabindex="disabled ? -1 : 0"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
    @keydown="handleKeyDown"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <span class="sp-dropdown__sub-trigger-content">
      <slot name="icon" v-if="$slots.icon || icon">
        <component :is="icon" v-if="icon" class="sp-dropdown__sub-trigger-icon" />
      </slot>
      <span class="sp-dropdown__sub-trigger-text">
        <slot />
      </span>
    </span>
    
    <span 
      class="sp-dropdown__sub-trigger-arrow"
      :class="{ 'sp-dropdown__sub-trigger-arrow--open': isOpen }"
      aria-hidden="true"
    >
      <slot name="arrow">
        <component :is="arrowIcon" />
      </slot>
    </span>
    
    <span v-if="keyboardShortcut" class="sp-dropdown__sub-trigger-shortcut">
      {{ keyboardShortcut }}
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue'
import { useDropdown } from './useDropdown'
import { useDropdownSubTrigger } from './composables/useDropdownSubTrigger'
import { ChevronRightIcon } from '@heroicons/vue/24/outline'
import type { SpDropdownSubTriggerProps } from './dropdown.types'

/**
 * USER-FACING DOCUMENTATION (GERMAN)
 * ==================================
 * SpDropdownSubTrigger - Trigger-Komponente für Untermenü-Dropdowns
 * 
 * Funktionen:
 * - Vollständige Tastaturnavigation mit Pfeiltasten
 * - Konfigurierbares Hover-Verhalten und -Verzögerungen
 * - Gemeinsame Gestaltung mit Dropdown-Elementen
 * - Benutzerdefinierte Symbolunterstützung
 * - Barrierefreiheitsverbesserungen
 * - Mehrere Varianten und Größen
 * 
 * @example Einfacher Untermenü-Trigger
 * ```vue
 * <SpDropdownSub>
 *   <SpDropdownSubTrigger>
 *     Weitere Optionen
 *   </SpDropdownSubTrigger>
 *   <SpDropdownSubContent>
 *     <SpDropdownItem>Unteroption 1</SpDropdownItem>
 *   </SpDropdownSubContent>
 * </SpDropdownSub>
 * ```
 * 
 * @example Mit Symbol und Tastaturkürzel
 * ```vue
 * <SpDropdownSubTrigger 
 *   :icon="EinstellungenIcon"
 *   keyboard-shortcut="Strg+,"
 * >
 *   Einstellungen
 * </SpDropdownSubTrigger>
 * ```
 * 
 * @example Mit benutzerdefiniertem Hover-Verhalten
 * ```vue
 * <SpDropdownSubTrigger 
 *   :hover-open-delay="200"
 *   :hover-close-delay="500"
 *   hover-behavior="delayed"
 * >
 *   Erweiterte Optionen
 * </SpDropdownSubTrigger>
 * ```
 * 
 * @example Mit benutzerdefiniertem Pfeil
 * ```vue
 * <SpDropdownSubTrigger>
 *   <template #default>Kategorien</template>
 *   <template #arrow>
 *     <ChevronDownIcon class="w-4 h-4" />
 *   </template>
 * </SpDropdownSubTrigger>
 * ```
 */

/**
 * INTERNAL DEVELOPER DOCUMENTATION (ENGLISH)
 * ==========================================
 * @internal
 * SpDropdownSubTrigger - Trigger component for sub-menu dropdowns
 * 
 * Technical implementation:
 * - Extends dropdown item styling for visual consistency
 * - ArrowRight key opens sub-menu and focuses first item
 * - ArrowLeft key closes sub-menu and returns focus
 * - Hover timeouts prevent accidental opens/closes
 * 
 * Architecture notes:
 * - Uses useDropdownSubTrigger composable for behavior
 * - Shares base styling with SpDropdownItem
 * - Arrow icon rotates 90deg when sub-menu is open
 * - Supports custom base components via baseComponent prop
 */
const props = withDefaults(defineProps<SpDropdownSubTriggerProps>(), {
  disabled: false,
  variant: 'default',
  size: 'md',
  baseComponent: 'button',
  arrowIcon: ChevronRightIcon,
  hoverBehavior: 'default',
  hoverOpenDelay: 100,
  hoverCloseDelay: 300
})

const {
  isOpen,
  triggerId,
  contentId,
  contentRef,
  triggerRef,
  disabled: contextDisabled,
  open,
  close,
  toggle,
  clearHoverTimeout,
  setHoverTimeout
} = useDropdown()

const disabled = computed(() => props.disabled || contextDisabled.value)
const triggerElement = ref<HTMLElement>()

const {
  triggerClasses,
  handleClick,
  handleFocus,
  handleBlur,
  handleKeyDown,
  handleMouseEnter,
  handleMouseLeave,
  focusFirstSubMenuItem
} = useDropdownSubTrigger(props, {
  isOpen,
  triggerId,
  contentId,
  contentRef,
  disabled,
  open,
  close,
  toggle,
  clearHoverTimeout,
  setHoverTimeout
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
export interface SpDropdownSubTriggerProps {
  /** Disables the sub-trigger */
  disabled?: boolean
  /** Visual variant of the trigger */
  variant?: 'default' | 'subtle' | 'ghost' | 'outline'
  /** Size of the trigger */
  size?: 'sm' | 'md' | 'lg'
  /** Base component to render (button, div, etc.) */
  baseComponent?: string | Component
  /** Icon component to display */
  icon?: Component
  /** Custom arrow icon component */
  arrowIcon?: Component
  /** Keyboard shortcut to display */
  keyboardShortcut?: string
  /** Hover behavior variant */
  hoverBehavior?: 'default' | 'delayed' | 'immediate' | 'disabled'
  /** Delay before opening on hover (ms) */
  hoverOpenDelay?: number
  /** Delay before closing on hover (ms) */
  hoverCloseDelay?: number
  /** Custom CSS classes */
  class?: string
}
```

### Phase 4: Sub-Trigger Composable
```typescript
// New composable: useDropdownSubTrigger.ts
export function useDropdownSubTrigger(
  props: SpDropdownSubTriggerProps,
  context: {
    isOpen: Ref<boolean>
    triggerId: Ref<string>
    contentId: Ref<string>
    contentRef: Ref<HTMLElement | null>
    disabled: Ref<boolean>
    open: () => void
    close: () => void
    toggle: () => void
    clearHoverTimeout: () => void
    setHoverTimeout: (callback: () => void, delay: number) => void
  }
) {
  const isFocused = ref(false)
  
  const triggerClasses = computed(() => [
    'sp-dropdown__sub-trigger',
    `sp-dropdown__sub-trigger--${props.variant}`,
    `sp-dropdown__sub-trigger--${props.size}`,
    {
      'sp-dropdown__sub-trigger--open': context.isOpen.value,
      'sp-dropdown__sub-trigger--disabled': context.disabled.value,
      'sp-dropdown__sub-trigger--focused': isFocused.value
    },
    props.class
  ])
  
  const handleClick = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    context.toggle()
  }
  
  const handleFocus = (event: FocusEvent) => {
    isFocused.value = true
  }
  
  const handleBlur = (event: FocusEvent) => {
    isFocused.value = false
  }
  
  const focusFirstSubMenuItem = () => {
    const subContent = context.contentRef.value
    if (subContent) {
      const firstItem = subContent.querySelector('[role="menuitem"]:not([disabled])') as HTMLElement
      firstItem?.focus()
    }
  }
  
  const handleKeyDown = (event: KeyboardEvent) => {
    if (context.disabled.value) return
    
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        event.stopPropagation()
        context.toggle()
        if (!context.isOpen.value) {
          nextTick(() => {
            focusFirstSubMenuItem()
          })
        }
        break
      case 'ArrowRight':
        event.preventDefault()
        event.stopPropagation()
        if (!context.isOpen.value) {
          context.open()
          nextTick(() => {
            focusFirstSubMenuItem()
          })
        }
        break
      case 'ArrowLeft':
        event.preventDefault()
        event.stopPropagation()
        if (context.isOpen.value) {
          context.close()
        }
        break
      case 'Escape':
        if (context.isOpen.value) {
          event.preventDefault()
          event.stopPropagation()
          context.close()
        }
        break
    }
  }
  
  const handleMouseEnter = () => {
    if (context.disabled.value || props.hoverBehavior === 'disabled') return
    
    context.clearHoverTimeout()
    
    const delay = props.hoverBehavior === 'immediate' ? 0 : props.hoverOpenDelay
    
    context.setHoverTimeout(() => {
      if (!context.disabled.value && !context.isOpen.value) {
        context.open()
      }
    }, delay)
  }
  
  const handleMouseLeave = () => {
    if (context.disabled.value || props.hoverBehavior === 'disabled') return
    
    const delay = props.hoverBehavior === 'immediate' ? 0 : props.hoverCloseDelay
    
    context.setHoverTimeout(() => {
      if (context.isOpen.value) {
        context.close()
      }
    }, delay)
  }
  
  return {
    triggerClasses,
    handleClick,
    handleFocus,
    handleBlur,
    handleKeyDown,
    handleMouseEnter,
    handleMouseLeave,
    focusFirstSubMenuItem
  }
}
```

### Phase 5: Enhanced CSS with Shared Styles
```scss
// Extend dropdown item styles
.sp-dropdown__sub-trigger {
  // Extend base item styles
  @extend .sp-dropdown__item;
  
  // Sub-trigger specific styles
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  // Variant overrides
  &--default {
    // Use item default styling
  }
  
  &--subtle {
    background-color: transparent;
    
    &:hover:not(:disabled) {
      background-color: var(--color-surface-subtle);
    }
  }
  
  &--ghost {
    background-color: transparent;
    border: 1px solid transparent;
    
    &:hover:not(:disabled) {
      background-color: var(--color-surface-ghost);
    }
  }
  
  &--outline {
    border: 1px solid var(--color-border-default);
    
    &:hover:not(:disabled) {
      border-color: var(--color-border-hover);
    }
  }
  
  // Size variants
  &--sm {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-small);
  }
  
  &--md {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-normal);
  }
  
  &--lg {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: var(--font-size-large);
  }
  
  // Open state
  &--open {
    background-color: var(--color-surface-active);
    color: var(--color-text-active);
    
    &::before {
      background-color: var(--color-accent-primary);
    }
  }
  
  // Focused state
  &--focused:not(:disabled) {
    background-color: var(--color-surface-focused);
    color: var(--color-text-focused);
  }
}

.sp-dropdown__sub-trigger-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex: 1;
  min-width: 0;
}

.sp-dropdown__sub-trigger-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sp-dropdown__sub-trigger-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.sp-dropdown__sub-trigger-arrow {
  display: flex;
  align-items: center;
  margin-left: var(--spacing-sm);
  color: var(--color-text-tertiary);
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  
  &--open {
    transform: rotate(90deg);
    color: var(--color-text-active);
  }
}

.sp-dropdown__sub-trigger-shortcut {
  margin-left: auto;
  font-size: var(--font-size-small);
  color: var(--color-text-tertiary);
  font-family: var(--font-family-mono);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-surface-secondary);
  border-radius: var(--border-radius-small);
}
```

## Testing Requirements

### Unit Tests
- [ ] Test keyboard navigation completeness
- [ ] Test hover behavior variants
- [ ] Test all variants and sizes
- [ ] Test focus management
- [ ] Test accessibility attributes
- [ ] Test icon customization
- [ ] Test disabled state
- [ ] Test shortcut display

### Integration Tests
- [ ] Test with sub-menu content
- [ ] Test focus flow between trigger and sub-items
- [ ] Test hover timeouts and race conditions
- [ ] Test nested sub-menu navigation
- [ ] Test screen reader compatibility
- [ ] Test with different base components

### Accessibility Tests
- [ ] Test ARIA attributes
- [ ] Test keyboard navigation
- [ ] Test screen reader announcements
- [ ] Test focus indicators
- [ ] Test high contrast mode
- [ ] Test keyboard shortcuts

### Performance Tests
- [ ] Test hover timeout performance
- [ ] Test with many sub-triggers
- [ ] Test memory usage
- [ ] Test event handling efficiency

## Migration Guide

### Breaking Changes
- Enhanced props interface (mostly additive)
- Improved keyboard navigation (may change behavior)
- New CSS structure with shared styles

### New Features
- Variant support (`variant` prop)
- Size support (`size` prop)
- Icon support (`icon` prop)
- Hover behavior configuration
- Keyboard shortcut display
- Custom arrow support

### Recommended Updates
- Test keyboard navigation thoroughly
- Configure hover delays appropriately
- Use appropriate variants for different contexts
- Add keyboard shortcuts for better UX
- Test with different base components

## Files to be Created/Modified

### New Files
- `src/components/dropdown/composables/useDropdownSubTrigger.ts`

### Modified Files
- `src/components/dropdown/SpDropdownSubTrigger.vue` - Main refactoring target
- `src/components/dropdown/dropdown.types.ts` - Enhanced sub-trigger types
- `src/components/dropdown/SpDropdownItem.vue` - May need shared styling extraction

## Performance Considerations

### Improvements
- Reduced code duplication with shared styles
- Better hover timeout management
- Improved keyboard navigation performance
- Better tree-shaking support

### Metrics to Monitor
- Hover timeout efficiency
- Keyboard event handling performance
- Focus management performance
- Memory usage with many sub-triggers

## Risk Assessment

### Low Risk
- Documentation improvements
- Adding new optional props
- CSS enhancements
- Accessibility improvements

### Medium Risk
- Changing keyboard navigation behavior
- Modifying hover behavior
- Shared styling changes

### High Risk
- Breaking existing sub-menu implementations
- Focus management changes

### Mitigation Strategies
- Comprehensive testing with existing implementations
- Gradual rollout of keyboard navigation improvements
- Backward compatibility testing
- Performance monitoring
- User feedback collection
- Accessibility auditing