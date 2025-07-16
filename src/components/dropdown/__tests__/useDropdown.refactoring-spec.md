# useDropdown.ts Refactoring Specification

## Current Analysis

### File Overview
The main composable that provides dropdown functionality through provider/inject pattern, managing state, keyboard navigation, and sub-menu coordination.

### Current Issues

#### 1. **Large Monolithic File** (`useDropdown.ts:1-240`)
- 240 lines in a single file with multiple responsibilities
- Provider and consumer logic mixed together
- Should be split into focused composables
- Hard to test individual concerns

#### 2. **Mixed Language Error Messages** (`useDropdown.ts:232-237`)
- User-facing error messages should remain in German for better local user experience
- Internal debug messages should be in English for developer collaboration
- Need clear separation between user-facing and internal error messages

#### 3. **Complex State Management** (`useDropdown.ts:49-83`)
- Many reactive refs and computed values
- Complex state synchronization logic
- Hard to understand state dependencies
- Potential for memory leaks

#### 4. **Mixed Concerns** (`useDropdown.ts:160-182`)
- Keyboard handling mixed with state management
- Sub-menu logic mixed with main dropdown logic
- Focus management scattered throughout
- Hard to maintain and extend

#### 5. **Inefficient Sub-menu Management** (`useDropdown.ts:114-138`)
- Simple Set-based sub-menu tracking
- No proper lifecycle management
- Missing error handling
- No cleanup mechanisms

#### 6. **Random ID Generation** (`useDropdown.ts:51-52`)
- Using Math.random() for ID generation
- Not SSR-safe
- Potential for collisions
- No namespace consistency

#### 7. **Hardcoded Values** (`useDropdown.ts:87-90`)
- Hardcoded focus timeout (0ms)
- No configuration options
- Not customizable for different use cases

## Proposed Refactoring

### 1. **Split into Focused Composables**
- [ ] Extract state management to separate composable
- [ ] Extract keyboard navigation to separate composable
- [ ] Extract sub-menu management to separate composable
- [ ] Extract focus management to separate composable
- [ ] Create clear separation of concerns

### 2. **Improve State Management**
- [ ] Simplify reactive state structure
- [ ] Add proper state validation
- [ ] Improve state synchronization
- [ ] Add state debugging tools

### 3. **Enhance Sub-menu Management**
- [ ] Add proper sub-menu lifecycle management
- [ ] Add error handling for sub-menu operations
- [ ] Add cleanup mechanisms
- [ ] Add sub-menu state tracking

### 4. **Improve ID Generation**
- [ ] Use proper ID generation utility
- [ ] Add SSR-safe ID generation
- [ ] Add namespace prefixes
- [ ] Ensure uniqueness guarantees

### 5. **Add Configuration Options**
- [ ] Add configurable timeouts
- [ ] Add behavior customization
- [ ] Add debug mode options
- [ ] Add performance tuning options

### 6. **Improve Documentation**
- [ ] Keep German for user-facing error messages (better UX)
- [ ] Convert internal developer comments to English
- [ ] Add comprehensive JSDoc in both languages
- [ ] Document composable usage patterns for developers (English)
- [ ] Add troubleshooting guide for developers (English)

## Implementation Steps

### Phase 1: Core State Management Composable
```typescript
// New file: composables/useDropdownState.ts
export function useDropdownState(props: {
  modelValue?: boolean
  disabled?: boolean
  closeOnSelect?: boolean
  placement?: string
}) {
  // Core state
  const isOpen = ref(props.modelValue ?? false)
  const disabled = computed(() => props.disabled ?? false)
  const closeOnSelect = computed(() => props.closeOnSelect ?? true)
  const placement = computed(() => props.placement ?? 'bottom-start')
  
  // Element refs
  const triggerId = ref(generateId('sp-dropdown-trigger'))
  const contentId = ref(generateId('sp-dropdown-content'))
  const triggerRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)
  
  // State management
  const open = () => {
    if (!disabled.value && !isOpen.value) {
      isOpen.value = true
    }
  }
  
  const close = () => {
    if (isOpen.value) {
      isOpen.value = false
    }
  }
  
  const toggle = () => {
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }
  
  // Watch for external model value changes
  watch(() => props.modelValue, (newValue) => {
    if (newValue !== undefined) {
      isOpen.value = newValue
    }
  })
  
  return {
    isOpen,
    disabled,
    closeOnSelect,
    placement,
    triggerId,
    contentId,
    triggerRef,
    contentRef,
    open,
    close,
    toggle
  }
}
```

### Phase 2: Sub-menu Management Composable
```typescript
// New file: composables/useDropdownSubMenus.ts
export function useDropdownSubMenus() {
  const activeSubMenu = ref<string | null>(null)
  const subMenus = ref<Map<string, SubMenuInfo>>(new Map())
  
  interface SubMenuInfo {
    id: string
    callbacks: {
      onOpen: () => void
      onClose: () => void
      onToggle: (isOpen: boolean) => void
    }
    cleanup: () => void
  }
  
  const registerSubMenu = (id: string, callbacks: SubMenuInfo['callbacks']) => {
    const cleanup = () => {
      subMenus.value.delete(id)
      if (activeSubMenu.value === id) {
        activeSubMenu.value = null
      }
    }
    
    const subMenuInfo: SubMenuInfo = {
      id,
      callbacks,
      cleanup
    }
    
    subMenus.value.set(id, subMenuInfo)
    
    // Return cleanup function
    return cleanup
  }
  
  const unregisterSubMenu = (id: string) => {
    const subMenu = subMenus.value.get(id)
    if (subMenu) {
      subMenu.cleanup()
    }
  }
  
  const openSubMenu = (id: string) => {
    if (subMenus.value.has(id)) {
      // Close other sub-menus
      closeAllSubMenus()
      
      // Open this sub-menu
      activeSubMenu.value = id
      const subMenu = subMenus.value.get(id)
      if (subMenu) {
        subMenu.callbacks.onOpen()
        subMenu.callbacks.onToggle(true)
      }
    }
  }
  
  const closeSubMenu = (id: string) => {
    if (activeSubMenu.value === id) {
      activeSubMenu.value = null
      const subMenu = subMenus.value.get(id)
      if (subMenu) {
        subMenu.callbacks.onClose()
        subMenu.callbacks.onToggle(false)
      }
    }
  }
  
  const closeAllSubMenus = () => {
    if (activeSubMenu.value) {
      const id = activeSubMenu.value
      activeSubMenu.value = null
      const subMenu = subMenus.value.get(id)
      if (subMenu) {
        subMenu.callbacks.onClose()
        subMenu.callbacks.onToggle(false)
      }
    }
  }
  
  const getSubMenuState = (id: string) => {
    return activeSubMenu.value === id
  }
  
  const handleSubMenuError = (id: string, error: Error) => {
    console.error(`SubMenu ${id} error:`, error)
    // Close problematic sub-menu
    closeSubMenu(id)
  }
  
  return {
    activeSubMenu,
    registerSubMenu,
    unregisterSubMenu,
    openSubMenu,
    closeSubMenu,
    closeAllSubMenus,
    getSubMenuState,
    handleSubMenuError
  }
}
```

### Phase 3: Keyboard Navigation Composable
```typescript
// New file: composables/useDropdownKeyboard.ts
export function useDropdownKeyboard(
  isOpen: Ref<boolean>,
  close: () => void,
  parentDropdown: DropdownContext | null,
  options: {
    escapeCloses?: boolean
    tabCloses?: boolean
    arrowLeftClosesSubMenu?: boolean
  } = {}
) {
  const {
    escapeCloses = true,
    tabCloses = true,
    arrowLeftClosesSubMenu = true
  } = options
  
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isOpen.value) return
    
    switch (event.key) {
      case 'Escape':
        if (escapeCloses) {
          event.preventDefault()
          event.stopPropagation()
          close()
        }
        break
        
      case 'Tab':
        if (tabCloses) {
          // Let Tab work normally but close dropdown
          close()
        }
        break
        
      case 'ArrowLeft':
        if (arrowLeftClosesSubMenu && parentDropdown) {
          event.preventDefault()
          close()
        }
        break
    }
  }
  
  return {
    handleKeyDown
  }
}
```

### Phase 4: Hover Timeout Management Composable
```typescript
// New file: composables/useDropdownHover.ts
export function useDropdownHover(options: {
  defaultOpenDelay?: number
  defaultCloseDelay?: number
} = {}) {
  const {
    defaultOpenDelay = 0,
    defaultCloseDelay = 300
  } = options
  
  const hoverTimeout = ref<number | null>(null)
  
  const clearHoverTimeout = () => {
    if (hoverTimeout.value) {
      clearTimeout(hoverTimeout.value)
      hoverTimeout.value = null
    }
  }
  
  const setHoverTimeout = (callback: () => void, delay: number = defaultCloseDelay) => {
    clearHoverTimeout()
    hoverTimeout.value = window.setTimeout(callback, delay)
  }
  
  const setOpenTimeout = (callback: () => void, delay: number = defaultOpenDelay) => {
    setHoverTimeout(callback, delay)
  }
  
  const setCloseTimeout = (callback: () => void, delay: number = defaultCloseDelay) => {
    setHoverTimeout(callback, delay)
  }
  
  // Cleanup on unmount
  onUnmounted(() => {
    clearHoverTimeout()
  })
  
  return {
    hoverTimeout,
    clearHoverTimeout,
    setHoverTimeout,
    setOpenTimeout,
    setCloseTimeout
  }
}
```

### Phase 5: Refactored Main Composable
```typescript
// Refactored useDropdown.ts
import { provide, inject, type InjectionKey } from 'vue'
import { useDropdownState } from './composables/useDropdownState'
import { useDropdownSubMenus } from './composables/useDropdownSubMenus'
import { useDropdownKeyboard } from './composables/useDropdownKeyboard'
import { useDropdownHover } from './composables/useDropdownHover'

export interface DropdownContext {
  // State
  isOpen: Ref<boolean>
  disabled: Ref<boolean>
  closeOnSelect: Ref<boolean>
  placement: Ref<string>
  
  // Element refs
  triggerId: Ref<string>
  contentId: Ref<string>
  triggerRef: Ref<HTMLElement | null>
  contentRef: Ref<HTMLElement | null>
  
  // Actions
  open: () => void
  close: () => void
  toggle: () => void
  onItemClick: (value?: string) => void
  
  // Sub-menu management
  activeSubMenu: Ref<string | null>
  registerSubMenu: (id: string, callbacks: SubMenuCallbacks) => () => void
  unregisterSubMenu: (id: string) => void
  openSubMenu: (id: string) => void
  closeSubMenu: (id: string) => void
  closeAllSubMenus: () => void
  getSubMenuState: (id: string) => boolean
  handleSubMenuError: (id: string, error: Error) => void
  
  // Hover management
  hoverTimeout: Ref<number | null>
  clearHoverTimeout: () => void
  setHoverTimeout: (callback: () => void, delay: number) => void
  setOpenTimeout: (callback: () => void, delay?: number) => void
  setCloseTimeout: (callback: () => void, delay?: number) => void
  
  // Parent context
  parentDropdown: DropdownContext | null
}

const DROPDOWN_INJECTION_KEY: InjectionKey<DropdownContext> = Symbol('SpDropdown')

/**
 * USER-FACING DOCUMENTATION (GERMAN)
 * ==================================
 * Dropdown-Anbieter-Composable für Wurzel-Dropdown-Komponenten
 * 
 * Erstellt und stellt Dropdown-Kontext für Kindkomponenten bereit
 * unter Verwendung von Vue's provide/inject-Pattern. Verwaltet Zustand,
 * Tastaturnavigation, Untermenüs und Hover-Interaktionen.
 * 
 * @example Grundlegende Verwendung
 * ```typescript
 * const { isOpen, toggle, handleKeyDown } = useDropdownProvider(props, emit)
 * ```
 * 
 * @example Mit benutzerdefinierten Optionen
 * ```typescript
 * const context = useDropdownProvider(props, emit, {
 *   hoverOpenDelay: 200,
 *   hoverCloseDelay: 500
 * })
 * ```
 */

/**
 * INTERNAL DEVELOPER DOCUMENTATION (ENGLISH)
 * ==========================================
 * @internal
 * Dropdown provider composable for root dropdown components
 * 
 * Technical implementation:
 * - Uses Vue's provide/inject pattern for context sharing
 * - Manages dropdown state via useDropdownState composable
 * - Coordinates sub-menus through useDropdownSubMenus
 * - Handles hover timeouts via useDropdownHover
 * - Provides keyboard navigation through useDropdownKeyboard
 * 
 * Architecture notes:
 * - Root composable that orchestrates all dropdown functionality
 * - Provides context that child components inject
 * - Manages cleanup on unmount to prevent memory leaks
 * - Supports nested dropdowns through parent context injection
 */
export function useDropdownProvider(
  props: DropdownProviderProps,
  emit: (event: 'update:modelValue', value: boolean) => void,
  options: {
    hoverOpenDelay?: number
    hoverCloseDelay?: number
  } = {}
) {
  // Get parent dropdown context if exists
  const parentDropdown = inject(DROPDOWN_INJECTION_KEY, null)
  
  // Core state management
  const state = useDropdownState(props)
  
  // Sub-menu management
  const subMenus = useDropdownSubMenus()
  
  // Keyboard navigation
  const keyboard = useDropdownKeyboard(state.isOpen, state.close, parentDropdown)
  
  // Hover timeout management
  const hover = useDropdownHover(options)
  
  // Item click handler
  const onItemClick = (value?: string) => {
    if (state.closeOnSelect.value) {
      // Close all dropdowns in the chain
      state.close()
      let parent = parentDropdown
      while (parent) {
        parent.close()
        parent = parent.parentDropdown
      }
    }
  }
  
  // Enhanced close function with cleanup
  const close = () => {
    state.close()
    subMenus.closeAllSubMenus()
    hover.clearHoverTimeout()
    
    // Emit update
    emit('update:modelValue', false)
    
    // Return focus to trigger for root dropdown
    if (!parentDropdown) {
      nextTick(() => {
        state.triggerRef.value?.focus()
      })
    }
  }
  
  // Enhanced open function
  const open = () => {
    if (!state.disabled.value && !state.isOpen.value) {
      state.open()
      
      // Close sibling sub-menus if this is a sub-menu
      if (parentDropdown) {
        parentDropdown.closeAllSubMenus()
      }
      
      // Emit update
      emit('update:modelValue', true)
    }
  }
  
  // Enhanced toggle function
  const toggle = () => {
    if (state.isOpen.value) {
      close()
    } else {
      open()
    }
  }
  
  // Create context
  const context: DropdownContext = {
    ...state,
    ...subMenus,
    ...hover,
    open,
    close,
    toggle,
    onItemClick,
    parentDropdown
  }
  
  // Provide context
  provide(DROPDOWN_INJECTION_KEY, context)
  
  return {
    ...context,
    handleKeyDown: keyboard.handleKeyDown
  }
}

/**
 * Dropdown consumer composable for child components
 * 
 * Injects the dropdown context provided by useDropdownProvider.
 * Throws an error if used outside of a dropdown context.
 * 
 * @example Basic usage
 * ```typescript
 * const { isOpen, close, triggerRef } = useDropdown()
 * ```
 * 
 * @throws {Error} If used outside of a dropdown context
 */
export function useDropdown(): DropdownContext {
  const context = inject(DROPDOWN_INJECTION_KEY)
  
  if (!context) {
    throw new Error(
      'useDropdown() must be used within a SpDropdown component. ' +
      'Make sure this component is used as a child of <SpDropdown>.'
    )
  }
  
  return context
}
```

### Phase 6: Enhanced Types
```typescript
// Enhanced types for the refactored composables
export interface DropdownProviderProps {
  modelValue?: boolean
  disabled?: boolean
  closeOnSelect?: boolean
  placement?: string
}

export interface SubMenuCallbacks {
  onOpen: () => void
  onClose: () => void
  onToggle: (isOpen: boolean) => void
}

export interface DropdownHoverOptions {
  defaultOpenDelay?: number
  defaultCloseDelay?: number
}

export interface DropdownKeyboardOptions {
  escapeCloses?: boolean
  tabCloses?: boolean
  arrowLeftClosesSubMenu?: boolean
}
```

## Testing Requirements

### Unit Tests
- [ ] Test each composable independently
- [ ] Test state management logic
- [ ] Test sub-menu management
- [ ] Test keyboard navigation
- [ ] Test hover timeout management
- [ ] Test error handling
- [ ] Test cleanup mechanisms

### Integration Tests
- [ ] Test provider/consumer pattern
- [ ] Test nested dropdown contexts
- [ ] Test complete interaction flows
- [ ] Test performance with many dropdowns
- [ ] Test memory leak prevention

### Error Handling Tests
- [ ] Test invalid context usage
- [ ] Test cleanup failures
- [ ] Test sub-menu errors
- [ ] Test state corruption recovery

## Migration Guide

### Breaking Changes
- Error messages now in English
- Some internal APIs changed (mostly for better type safety)
- Improved cleanup mechanisms may affect lifecycle

### New Features
- Modular composable architecture
- Better error handling and debugging
- Enhanced sub-menu management
- Configurable hover behavior
- Improved performance monitoring

### Recommended Updates
- Test composable usage patterns
- Verify error handling improvements
- Check cleanup mechanisms
- Monitor performance improvements

## Files to be Created/Modified

### New Files
- `src/components/dropdown/composables/useDropdownState.ts`
- `src/components/dropdown/composables/useDropdownSubMenus.ts`
- `src/components/dropdown/composables/useDropdownKeyboard.ts`
- `src/components/dropdown/composables/useDropdownHover.ts`

### Modified Files
- `src/components/dropdown/useDropdown.ts` - Main refactoring target
- `src/components/dropdown/dropdown.types.ts` - Enhanced types

## Performance Considerations

### Improvements
- Reduced memory footprint with focused composables
- Better cleanup mechanisms
- Improved state management efficiency
- Better tree-shaking support

### Metrics to Monitor
- Memory usage with nested dropdowns
- State synchronization performance
- Sub-menu management efficiency
- Cleanup mechanism effectiveness

## Risk Assessment

### Low Risk
- Documentation improvements
- Error message language changes
- Adding new optional features
- Modular architecture improvements

### Medium Risk
- Internal API changes
- State management refactoring
- Cleanup mechanism changes

### High Risk
- Provider/inject pattern changes
- Breaking existing composable usage

### Mitigation Strategies
- Comprehensive testing of all composable combinations
- Gradual migration path for existing usage
- Performance monitoring and optimization
- Memory leak detection and prevention
- Error handling validation

## Development Experience Improvements

### Better Debugging
- Clear error messages in English
- Modular architecture easier to debug
- Better development warnings
- Improved type safety

### Enhanced Maintainability
- Focused composables with single responsibilities
- Better test coverage
- Clear separation of concerns
- Improved documentation

### Performance Monitoring
- Memory usage tracking
- State synchronization monitoring
- Cleanup mechanism validation
- Performance profiling tools

## Future Enhancements

### Potential Additions
- Advanced debugging tools
- Performance profiling utilities
- Custom state management strategies
- Plugin system for extensions

### Extensibility
- Easy to add new composables
- Flexible configuration options
- Custom behavior patterns
- Integration with external systems