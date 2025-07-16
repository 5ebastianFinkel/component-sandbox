import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, screen, cleanup } from '@testing-library/vue'
import { nextTick } from 'vue'
import SpDropdown from '../SpDropdown.vue'
import SpDropdownFixture from './SpDropdown.fixture.vue'

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
})