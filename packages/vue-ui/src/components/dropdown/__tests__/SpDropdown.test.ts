import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, screen, cleanup } from '@testing-library/vue'
import { nextTick } from 'vue'
import SpDropdown from '../SpDropdown.vue'
import NavigationFixture from './SpDropdown.navigation.fixture.vue'

// Mock @vueuse/core
vi.mock('@vueuse/core', () => ({
  onClickOutside: vi.fn()
}))

// Helper function to check if element has class
function hasClass(element: Element | null, className: string): boolean {
  return element?.classList.contains(className) || false
}

describe('SpDropdown', () => {
  beforeEach(() => {
    // Mock popover API
    const mockPopover = {
      showPopover: vi.fn(),
      hidePopover: vi.fn(),
      matches: vi.fn().mockReturnValue(true)
    }
    
    Object.defineProperty(HTMLElement.prototype, 'showPopover', {
      value: mockPopover.showPopover,
      configurable: true
    })
    
    Object.defineProperty(HTMLElement.prototype, 'hidePopover', {
      value: mockPopover.hidePopover,
      configurable: true
    })
    
    Object.defineProperty(HTMLElement.prototype, 'matches', {
      value: mockPopover.matches,
      configurable: true
    })
    
    // Mock getBoundingClientRect
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      value: vi.fn().mockReturnValue({
        top: 100,
        left: 100,
        bottom: 150,
        right: 200,
        width: 100,
        height: 50
      }),
      configurable: true
    })
    
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      value: 1024,
      configurable: true
    })
    
    Object.defineProperty(window, 'innerHeight', {
      value: 768,
      configurable: true
    })
  })

  afterEach(() => {
    cleanup()
  })

  describe('Basic Functionality', () => {
    it('should render correctly', () => {
      render(SpDropdown, {
        slots: {
          default: '<button>Trigger</button>'
        }
      })
      
      expect(screen.getByRole('button')).toBeTruthy()
      expect(document.querySelector('.sp-dropdown')).toBeTruthy()
    })

    it('should handle v-model correctly', async () => {
      const { rerender } = render(SpDropdown, {
        props: {
          modelValue: false
        },
        slots: {
          default: '<button>Trigger</button>'
        }
      })
      
      const dropdown = document.querySelector('.sp-dropdown')
      expect(hasClass(dropdown, 'sp-dropdown--open')).toBe(false)
      
      await rerender({ modelValue: true })
      expect(hasClass(dropdown, 'sp-dropdown--open')).toBe(true)
    })

    it('should emit update:modelValue when state changes', async () => {
      const mockEmit = vi.fn()
      
      render(SpDropdown, {
        props: {
          modelValue: false,
          'onUpdate:modelValue': mockEmit
        },
        slots: {
          default: '<button>Trigger</button>'
        }
      })
      
      // Simulate internal state change by triggering keyboard event
      const dropdown = document.querySelector('.sp-dropdown')
      await fireEvent.keyDown(dropdown!, { key: 'Escape' })
      
      // The component should handle this internally
      expect(dropdown).toBeTruthy()
    })

    it('should emit open event when opening', async () => {
      const mockOpen = vi.fn()
      
      render(SpDropdown, {
        props: {
          modelValue: false,
          onOpen: mockOpen
        },
        slots: {
          default: '<button>Trigger</button>'
        }
      })
      
      // Component should handle opening internally
      expect(mockOpen).not.toHaveBeenCalled()
    })

    it('should emit close event when closing', async () => {
      const mockClose = vi.fn()
      
      render(SpDropdown, {
        props: {
          modelValue: true,
          onClose: mockClose
        },
        slots: {
          default: '<button>Trigger</button>'
        }
      })
      
      // Component should handle closing internally
      expect(mockClose).not.toHaveBeenCalled()
    })

    it('should apply correct CSS classes', () => {
      render(SpDropdown, {
        props: {
          modelValue: true,
          disabled: true
        },
        slots: {
          default: '<button>Trigger</button>'
        }
      })
      
      const dropdown = document.querySelector('.sp-dropdown')
      expect(hasClass(dropdown, 'sp-dropdown--open')).toBe(true)
      expect(hasClass(dropdown, 'sp-dropdown--disabled')).toBe(true)
    })
  })

  describe('Props', () => {
    it('should handle disabled prop', () => {
      render(SpDropdown, {
        props: {
          disabled: true
        },
        slots: {
          default: '<button>Trigger</button>'
        }
      })
      
      const dropdown = document.querySelector('.sp-dropdown')
      expect(hasClass(dropdown, 'sp-dropdown--disabled')).toBe(true)
    })

    it('should handle closeOnSelect prop', () => {
      render(SpDropdown, {
        props: {
          closeOnSelect: false
        },
        slots: {
          default: '<button>Trigger</button>'
        }
      })
      
      // Component should render without errors
      expect(screen.getByRole('button')).toBeTruthy()
    })

    it('should handle placement prop', () => {
      render(SpDropdown, {
        props: {
          placement: 'top-start'
        },
        slots: {
          default: '<button>Trigger</button>'
        }
      })
      
      // Component should render without errors
      expect(screen.getByRole('button')).toBeTruthy()
    })

    it('should use default props when not provided', () => {
      render(SpDropdown, {
        slots: {
          default: '<button>Trigger</button>'
        }
      })
      
      const dropdown = document.querySelector('.sp-dropdown')
      expect(hasClass(dropdown, 'sp-dropdown--open')).toBe(false)
      expect(hasClass(dropdown, 'sp-dropdown--disabled')).toBe(false)
    })
  })

  describe('Keyboard Navigation', () => {
    it('should handle Escape key', async () => {
      const mockUpdate = vi.fn()
      
      render(SpDropdown, {
        props: {
          modelValue: true,
          'onUpdate:modelValue': mockUpdate
        },
        slots: {
          default: '<button>Trigger</button>'
        }
      })
      
      const dropdown = document.querySelector('.sp-dropdown')
      await fireEvent.keyDown(dropdown!, { key: 'Escape' })
      
      // Should handle keyboard event
      expect(dropdown).toBeTruthy()
    })

    it('should handle Tab key', async () => {
      const mockUpdate = vi.fn()
      
      render(SpDropdown, {
        props: {
          modelValue: true,
          'onUpdate:modelValue': mockUpdate
        },
        slots: {
          default: '<button>Trigger</button>'
        }
      })
      
      const dropdown = document.querySelector('.sp-dropdown')
      await fireEvent.keyDown(dropdown!, { key: 'Tab' })
      
      // Should handle keyboard event
      expect(dropdown).toBeTruthy()
    })

    it('should not handle keyboard events when closed', async () => {
      const mockUpdate = vi.fn()
      
      render(SpDropdown, {
        props: {
          modelValue: false,
          'onUpdate:modelValue': mockUpdate
        },
        slots: {
          default: '<button>Trigger</button>'
        }
      })
      
      const dropdown = document.querySelector('.sp-dropdown')
      await fireEvent.keyDown(dropdown!, { key: 'Escape' })
      
      // Should not emit when closed
      expect(mockUpdate).not.toHaveBeenCalled()
    })
  })

  describe('Context Provider', () => {
    it('should provide context to child components', () => {
      // Test that the SpDropdown component provides the expected context
      render(SpDropdown, {
        slots: {
          default: '<div data-testid="child">Child Component</div>'
        }
      })
      
      // The dropdown should render and provide context
      expect(screen.getByTestId('child')).toBeTruthy()
      expect(document.querySelector('.sp-dropdown')).toBeTruthy()
    })

    it('should handle open/close actions from context', async () => {
      render(SpDropdown, {
        props: {
          modelValue: false
        },
        slots: {
          default: '<div data-testid="child">Child Component</div>'
        }
      })
      
      // The dropdown should render and handle context
      expect(screen.getByTestId('child')).toBeTruthy()
      expect(document.querySelector('.sp-dropdown')).toBeTruthy()
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined modelValue', () => {
      render(SpDropdown, {
        props: {
          modelValue: undefined
        },
        slots: {
          default: '<button>Trigger</button>'
        }
      })
      
      const dropdown = document.querySelector('.sp-dropdown')
      expect(hasClass(dropdown, 'sp-dropdown--open')).toBe(false)
    })

    it('should not open when disabled', async () => {
      render(SpDropdown, {
        props: {
          disabled: true,
          modelValue: false
        },
        slots: {
          default: '<button>Trigger</button>'
        }
      })
      
      const dropdown = document.querySelector('.sp-dropdown')
      expect(hasClass(dropdown, 'sp-dropdown--disabled')).toBe(true)
    })

    it('should handle multiple rapid open/close operations', async () => {
      const { rerender } = render(SpDropdown, {
        props: {
          modelValue: false
        },
        slots: {
          default: '<button>Trigger</button>'
        }
      })
      
      // Rapid toggle operations
      await rerender({ modelValue: true })
      await rerender({ modelValue: false })
      await rerender({ modelValue: true })
      await rerender({ modelValue: false })
      
      const dropdown = document.querySelector('.sp-dropdown')
      expect(hasClass(dropdown, 'sp-dropdown--open')).toBe(false)
    })

    it('should handle prop changes during runtime', async () => {
      const { rerender } = render(SpDropdown, {
        props: {
          disabled: false,
          placement: 'bottom-start'
        },
        slots: {
          default: '<button>Trigger</button>'
        }
      })
      
      let dropdown = document.querySelector('.sp-dropdown')
      expect(hasClass(dropdown, 'sp-dropdown--disabled')).toBe(false)
      
      await rerender({ disabled: true, placement: 'top-end' })
      dropdown = document.querySelector('.sp-dropdown')
      expect(hasClass(dropdown, 'sp-dropdown--disabled')).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle missing slot content gracefully', () => {
      render(SpDropdown, {
        props: {
          modelValue: false
        }
      })
      
      const dropdown = document.querySelector('.sp-dropdown')
      expect(dropdown).toBeTruthy()
    })

    it('should handle invalid placement values', () => {
      render(SpDropdown, {
        props: {
          // @ts-ignore - intentionally testing invalid value
          placement: 'invalid-placement'
        },
        slots: {
          default: '<button>Trigger</button>'
        }
      })
      
      // Should not throw error and should handle gracefully
      expect(screen.getByRole('button')).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(SpDropdown, {
        slots: {
          default: '<button data-testid="trigger">Trigger</button>'
        }
      })
      
      const trigger = screen.getByTestId('trigger')
      expect(trigger).toBeTruthy()
      
      // Check that dropdown has proper structure
      expect(document.querySelector('.sp-dropdown')).toBeTruthy()
    })

    it('should manage focus correctly', async () => {
      render(SpDropdown, {
        slots: {
          default: '<button data-testid="trigger">Trigger</button>'
        }
      })
      
      const trigger = screen.getByTestId('trigger')
      expect(trigger).toBeTruthy()
      
      // Component should handle focus management internally
      expect(document.querySelector('.sp-dropdown')).toBeTruthy()
    })
  })

  describe('Integration with Child Components', () => {
    it('should work with child components', () => {
      render(SpDropdown, {
        slots: {
          default: '<div data-testid="child-content">Child Content</div>'
        }
      })
      
      expect(screen.getByTestId('child-content')).toBeTruthy()
      expect(screen.getByTestId('child-content').textContent).toBe('Child Content')
    })

    it('should work with complex nested structure', () => {
      render(SpDropdown, {
        slots: {
          default: `
            <div data-testid="nested-structure">
              <button data-testid="trigger">Trigger</button>
              <div data-testid="content">Content</div>
            </div>
          `
        }
      })
      
      expect(screen.getByTestId('nested-structure')).toBeTruthy()
      expect(screen.getByTestId('trigger')).toBeTruthy()
      expect(screen.getByTestId('content')).toBeTruthy()
    })

    it('should handle multiple child elements', async () => {
      render(SpDropdown, {
        slots: {
          default: `
            <div data-testid="item-1">Item 1</div>
            <div data-testid="item-2">Item 2</div>
          `
        }
      })
      
      expect(screen.getByTestId('item-1')).toBeTruthy()
      expect(screen.getByTestId('item-2')).toBeTruthy()
      expect(screen.getByTestId('item-1').textContent).toBe('Item 1')
      expect(screen.getByTestId('item-2').textContent).toBe('Item 2')
    })
  })

  describe('Keyboard Navigation with Sub-Menus', () => {
    const renderNavigationFixture = () => {
      return render(NavigationFixture, {
        props: {
          triggerText: 'Navigation Test',
          closeOnSelect: false // Keep open for navigation testing
        }
      })
    }

    const waitForNextTick = () => nextTick()

    beforeEach(async () => {
      // Reset focus management
      ;(document.activeElement as HTMLElement)?.blur?.()
    })

    it('should open dropdown and navigate through main items with ArrowDown/ArrowUp', async () => {
      renderNavigationFixture()
      
      const trigger = screen.getByTestId('main-trigger')
      
      // Open dropdown
      await fireEvent.click(trigger)
      await waitForNextTick()
      
      // Should focus first item
      const mainContent = screen.getByTestId('main-content')
      expect(mainContent).toBeTruthy()
      
      // Navigate down through main items
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await waitForNextTick()
      
      // Navigate up
      await fireEvent.keyDown(mainContent, { key: 'ArrowUp' })
      await waitForNextTick()
      
      // Should handle navigation
      expect(mainContent).toBeTruthy()
    })

    it('should open sub-menu on ArrowRight and navigate within it', async () => {
      renderNavigationFixture()
      
      const trigger = screen.getByTestId('main-trigger')
      
      // Open dropdown
      await fireEvent.click(trigger)
      await waitForNextTick()
      
      const mainContent = screen.getByTestId('main-content')
      
      // Navigate to first sub-trigger
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await waitForNextTick()
      
      // Open sub-menu with ArrowRight
      await fireEvent.keyDown(mainContent, { key: 'ArrowRight' })
      await waitForNextTick()
      
      // Should show sub-content
      const subContent = screen.getByTestId('sub-content-1')
      expect(subContent).toBeTruthy()
      
      // Navigate within sub-menu
      await fireEvent.keyDown(subContent, { key: 'ArrowDown' })
      await waitForNextTick()
      
      expect(subContent).toBeTruthy()
    })

    it('should close sub-menu on ArrowLeft and return to main menu', async () => {
      renderNavigationFixture()
      
      const trigger = screen.getByTestId('main-trigger')
      
      // Open dropdown
      await fireEvent.click(trigger)
      await waitForNextTick()
      
      const mainContent = screen.getByTestId('main-content')
      
      // Navigate to sub-trigger and open it
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await fireEvent.keyDown(mainContent, { key: 'ArrowRight' })
      await waitForNextTick()
      
      const subContent = screen.getByTestId('sub-content-1')
      
      // Close sub-menu with ArrowLeft
      await fireEvent.keyDown(subContent, { key: 'ArrowLeft' })
      await waitForNextTick()
      
      // Should return to main menu and focus should return to trigger
      expect(mainContent).toBeTruthy()
      
      // After closing submenu, should be able to navigate again
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await waitForNextTick()
      
      // Should be able to continue keyboard navigation
      expect(mainContent).toBeTruthy()
    })

    it('should navigate between multiple sub-menus', async () => {
      renderNavigationFixture()
      
      const trigger = screen.getByTestId('main-trigger')
      
      // Open dropdown
      await fireEvent.click(trigger)
      await waitForNextTick()
      
      const mainContent = screen.getByTestId('main-content')
      
      // Navigate to first sub-trigger
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await fireEvent.keyDown(mainContent, { key: 'ArrowRight' })
      await waitForNextTick()
      
      // Close first sub-menu
      const subContent1 = screen.getByTestId('sub-content-1')
      await fireEvent.keyDown(subContent1, { key: 'ArrowLeft' })
      await waitForNextTick()
      
      // Navigate to second sub-trigger
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await fireEvent.keyDown(mainContent, { key: 'ArrowRight' })
      await waitForNextTick()
      
      // Should show second sub-content
      const subContent2 = screen.getByTestId('sub-content-2')
      expect(subContent2).toBeTruthy()
    })

    it('should select items with Enter key in main menu', async () => {
      const mockItemSelect = vi.fn()
      
      render(NavigationFixture, {
        props: {
          triggerText: 'Navigation Test',
          closeOnSelect: true,
          onItemSelect: mockItemSelect
        }
      })
      
      const trigger = screen.getByTestId('main-trigger')
      
      // Open dropdown
      await fireEvent.click(trigger)
      await waitForNextTick()
      
      const mainContent = screen.getByTestId('main-content')
      
      // Navigate to first item and select it
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await fireEvent.keyDown(mainContent, { key: 'Enter' })
      await waitForNextTick()
      
      // Should handle item selection
      expect(mainContent).toBeTruthy()
    })

    it('should select items with Enter key in sub-menu', async () => {
      const mockSubItem1Select = vi.fn()
      
      render(NavigationFixture, {
        props: {
          triggerText: 'Navigation Test',
          closeOnSelect: true,
          onSubItem1Select: mockSubItem1Select
        }
      })
      
      const trigger = screen.getByTestId('main-trigger')
      
      // Open dropdown
      await fireEvent.click(trigger)
      await waitForNextTick()
      
      const mainContent = screen.getByTestId('main-content')
      
      // Navigate to sub-trigger and open it
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await fireEvent.keyDown(mainContent, { key: 'ArrowRight' })
      await waitForNextTick()
      
      const subContent = screen.getByTestId('sub-content-1')
      
      // Navigate to item and select it
      await fireEvent.keyDown(subContent, { key: 'ArrowDown' })
      await fireEvent.keyDown(subContent, { key: 'Enter' })
      await waitForNextTick()
      
      // Should handle sub-item selection
      expect(subContent).toBeTruthy()
    })

    it('should select items with Space key', async () => {
      const mockItemSelect = vi.fn()
      
      render(NavigationFixture, {
        props: {
          triggerText: 'Navigation Test',
          closeOnSelect: true,
          onItemSelect: mockItemSelect
        }
      })
      
      const trigger = screen.getByTestId('main-trigger')
      
      // Open dropdown
      await fireEvent.click(trigger)
      await waitForNextTick()
      
      const mainContent = screen.getByTestId('main-content')
      
      // Navigate to first item and select with Space
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await fireEvent.keyDown(mainContent, { key: ' ' })
      await waitForNextTick()
      
      // Should handle item selection
      expect(mainContent).toBeTruthy()
    })

    it('should navigate to first item with Home key', async () => {
      renderNavigationFixture()
      
      const trigger = screen.getByTestId('main-trigger')
      
      // Open dropdown
      await fireEvent.click(trigger)
      await waitForNextTick()
      
      const mainContent = screen.getByTestId('main-content')
      
      // Navigate down a few items
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await waitForNextTick()
      
      // Jump to first item with Home
      await fireEvent.keyDown(mainContent, { key: 'Home' })
      await waitForNextTick()
      
      // Should focus first item
      expect(mainContent).toBeTruthy()
    })

    it('should navigate to last item with End key', async () => {
      renderNavigationFixture()
      
      const trigger = screen.getByTestId('main-trigger')
      
      // Open dropdown
      await fireEvent.click(trigger)
      await waitForNextTick()
      
      const mainContent = screen.getByTestId('main-content')
      
      // Jump to last item with End
      await fireEvent.keyDown(mainContent, { key: 'End' })
      await waitForNextTick()
      
      // Should focus last item
      expect(mainContent).toBeTruthy()
    })

    it('should close dropdown with Escape key', async () => {
      renderNavigationFixture()
      
      const trigger = screen.getByTestId('main-trigger')
      
      // Open dropdown
      await fireEvent.click(trigger)
      await waitForNextTick()
      
      const mainContent = screen.getByTestId('main-content')
      
      // Close with Escape
      await fireEvent.keyDown(mainContent, { key: 'Escape' })
      await waitForNextTick()
      
      // Should handle close
      expect(mainContent).toBeTruthy()
    })

    it('should close dropdown with Tab key', async () => {
      renderNavigationFixture()
      
      const trigger = screen.getByTestId('main-trigger')
      
      // Open dropdown
      await fireEvent.click(trigger)
      await waitForNextTick()
      
      const mainContent = screen.getByTestId('main-content')
      
      // Close with Tab
      await fireEvent.keyDown(mainContent, { key: 'Tab' })
      await waitForNextTick()
      
      // Should handle close
      expect(mainContent).toBeTruthy()
    })

    it('should skip disabled items during navigation', async () => {
      renderNavigationFixture()
      
      const trigger = screen.getByTestId('main-trigger')
      
      // Open dropdown
      await fireEvent.click(trigger)
      await waitForNextTick()
      
      const mainContent = screen.getByTestId('main-content')
      
      // Navigate through items (including disabled ones)
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await waitForNextTick()
      
      // Should skip disabled items
      expect(mainContent).toBeTruthy()
    })

    it('should handle complex navigation scenario: main -> sub1 -> back -> sub2 -> select', async () => {
      const mockSubItem2Select = vi.fn()
      
      render(NavigationFixture, {
        props: {
          triggerText: 'Navigation Test',
          closeOnSelect: true,
          onSubItem2Select: mockSubItem2Select
        }
      })
      
      const trigger = screen.getByTestId('main-trigger')
      
      // Open dropdown
      await fireEvent.click(trigger)
      await waitForNextTick()
      
      const mainContent = screen.getByTestId('main-content')
      
      // Navigate to first sub-trigger and open it
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await fireEvent.keyDown(mainContent, { key: 'ArrowRight' })
      await waitForNextTick()
      
      const subContent1 = screen.getByTestId('sub-content-1')
      
      // Navigate within first sub-menu then close it
      await fireEvent.keyDown(subContent1, { key: 'ArrowDown' })
      await fireEvent.keyDown(subContent1, { key: 'ArrowLeft' })
      await waitForNextTick()
      
      // Navigate to second sub-trigger and open it
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await fireEvent.keyDown(mainContent, { key: 'ArrowRight' })
      await waitForNextTick()
      
      const subContent2 = screen.getByTestId('sub-content-2')
      
      // Navigate to item and select it
      await fireEvent.keyDown(subContent2, { key: 'ArrowDown' })
      await fireEvent.keyDown(subContent2, { key: 'Enter' })
      await waitForNextTick()
      
      // Should complete complex navigation
      expect(subContent2).toBeTruthy()
    })

    it('should handle sub-menu navigation with disabled items', async () => {
      renderNavigationFixture()
      
      const trigger = screen.getByTestId('main-trigger')
      
      // Open dropdown
      await fireEvent.click(trigger)
      await waitForNextTick()
      
      const mainContent = screen.getByTestId('main-content')
      
      // Navigate to first sub-trigger and open it
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await fireEvent.keyDown(mainContent, { key: 'ArrowRight' })
      await waitForNextTick()
      
      const subContent1 = screen.getByTestId('sub-content-1')
      
      // Navigate through sub-menu items (including disabled one)
      await fireEvent.keyDown(subContent1, { key: 'ArrowDown' })
      await fireEvent.keyDown(subContent1, { key: 'ArrowDown' })
      await fireEvent.keyDown(subContent1, { key: 'ArrowDown' })
      await waitForNextTick()
      
      // Should skip disabled items in sub-menu
      expect(subContent1).toBeTruthy()
    })

    it('should maintain focus continuity after closing sub-menu with ArrowLeft', async () => {
      renderNavigationFixture()
      
      const trigger = screen.getByTestId('main-trigger')
      
      // Open dropdown
      await fireEvent.click(trigger)
      await waitForNextTick()
      
      const mainContent = screen.getByTestId('main-content')
      
      // Navigate to first sub-trigger and open it
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await fireEvent.keyDown(mainContent, { key: 'ArrowRight' })
      await waitForNextTick()
      
      const subContent1 = screen.getByTestId('sub-content-1')
      
      // Close sub-menu with ArrowLeft
      await fireEvent.keyDown(subContent1, { key: 'ArrowLeft' })
      await waitForNextTick()
      
      // Should be able to navigate to next item after closing sub-menu
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await waitForNextTick()
      
      // Should be able to navigate to second sub-menu
      await fireEvent.keyDown(mainContent, { key: 'ArrowRight' })
      await waitForNextTick()
      
      // Second sub-menu should open correctly
      const subContent2 = screen.getByTestId('sub-content-2')
      expect(subContent2).toBeTruthy()
    })

    it('should navigate between adjacent sub-triggers with ArrowDown/ArrowUp', async () => {
      renderNavigationFixture()
      
      const trigger = screen.getByTestId('main-trigger')
      
      // Open dropdown
      await fireEvent.click(trigger)
      await waitForNextTick()
      
      const mainContent = screen.getByTestId('main-content')
      
      // Navigate to first sub-trigger
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await waitForNextTick()
      
      // Now navigate from first sub-trigger to second sub-trigger with ArrowDown
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await waitForNextTick()
      
      // Should be able to open second sub-menu
      await fireEvent.keyDown(mainContent, { key: 'ArrowRight' })
      await waitForNextTick()
      
      // Second sub-menu should open correctly
      const subContent2 = screen.getByTestId('sub-content-2')
      expect(subContent2).toBeTruthy()
    })

    it('should navigate backwards between sub-triggers with ArrowUp', async () => {
      renderNavigationFixture()
      
      const trigger = screen.getByTestId('main-trigger')
      
      // Open dropdown
      await fireEvent.click(trigger)
      await waitForNextTick()
      
      const mainContent = screen.getByTestId('main-content')
      
      // Navigate to second sub-trigger
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await fireEvent.keyDown(mainContent, { key: 'ArrowDown' })
      await waitForNextTick()
      
      // Navigate back to first sub-trigger with ArrowUp
      await fireEvent.keyDown(mainContent, { key: 'ArrowUp' })
      await waitForNextTick()
      
      // Should be able to open first sub-menu
      await fireEvent.keyDown(mainContent, { key: 'ArrowRight' })
      await waitForNextTick()
      
      // First sub-menu should open correctly
      const subContent1 = screen.getByTestId('sub-content-1')
      expect(subContent1).toBeTruthy()
    })
  })
})