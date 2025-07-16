import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import SpDropdownItem from './SpDropdownItem.vue'
import SpDropdown from './SpDropdown.vue'
import SpDropdownTrigger from './SpDropdownTrigger.vue'
import SpDropdownContent from './SpDropdownContent.vue'
import SpDropdownSeparator from './SpDropdownSeparator.vue'

const meta = {
  title: 'Components/Dropdown/SpDropdownItem',
  component: SpDropdownItem,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**SpDropdownItem** ist ein einzelnes Menüelement mit verbesserter Barrierefreiheit und Fokus-Management.

### Funktionen:
- Vollständige Unterstützung der Tastaturnavigation
- Verbesserte ARIA-Attribute für Bildschirmleser
- Korrekte Fokus-Management
- Integration mit übergeordnetem Dropdown-Kontext
        `
      }
    }
  },
  argTypes: {
    value: {
      control: { type: 'text' },
      description: 'Eindeutige Kennung für das Element'
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Deaktiviert das Element'
    },
    closeOnSelect: {
      control: { type: 'boolean' },
      description: 'Steuert, ob das Dropdown geschlossen wird, wenn dieses Element ausgewählt wird'
    },
    onSelect: {
      action: 'select',
      description: 'Wird ausgelöst wenn das Element ausgewählt wird'
    },
    onClick: {
      action: 'click',
      description: 'Wird ausgelöst wenn das Element angeklickt wird'
    },
    onFocus: {
      action: 'focus',
      description: 'Wird ausgelöst wenn das Element den Fokus erhält'
    },
    onBlur: {
      action: 'blur',
      description: 'Wird ausgelöst wenn das Element den Fokus verliert'
    }
  }
} satisfies Meta<typeof SpDropdownItem>

export default meta
type Story = StoryObj<typeof meta>

// Standard Item
export const Standard: Story = {
  args: {
    value: 'standard'
  },
  render: (args) => ({
    components: { SpDropdownItem },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 200px; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 8px;">
        <SpDropdownItem 
          v-bind="args" 
          @select="args.onSelect" 
          @click="args.onClick"
          @focus="args.onFocus"
          @blur="args.onBlur"
        >
          Standard Element
        </SpDropdownItem>
      </div>
    `
  })
}

// Verschiedene Zustände
export const Zustaende: Story = {
  render: () => ({
    components: { SpDropdownItem },
    setup() {
      const handleSelect = (value: string) => {
        console.log('Ausgewählt:', value)
      }
      return { handleSelect }
    },
    template: `
      <div style="width: 300px; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="margin-bottom: 1rem;">
          <h4 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Normal</h4>
          <SpDropdownItem value="normal" @select="handleSelect">
            Normales Element
          </SpDropdownItem>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <h4 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Deaktiviert</h4>
          <SpDropdownItem value="disabled" disabled @select="handleSelect">
            Deaktiviertes Element
          </SpDropdownItem>
        </div>
        
        <div>
          <h4 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Nicht automatisch schließen</h4>
          <SpDropdownItem value="no-close" :close-on-select="false" @select="handleSelect">
            Dropdown bleibt offen
          </SpDropdownItem>
        </div>
      </div>
    `
  })
}

// Tastaturnavigation
export const Tastaturnavigation: Story = {
  render: () => ({
    components: { SpDropdownItem },
    setup() {
      const handleSelect = (value: string) => {
        console.log('Ausgewählt:', value)
      }
      return { handleSelect }
    },
    template: `
      <div style="width: 300px; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
        <p style="margin: 0 0 1rem; font-size: 0.875rem; color: #6b7280;">
          Verwende Tab zum Navigieren zwischen Elementen. Enter oder Leertaste zum Auswählen.
        </p>
        
        <div style="margin-bottom: 0.5rem;">
          <SpDropdownItem value="item1" @select="handleSelect">
            Element 1
          </SpDropdownItem>
        </div>
        
        <div style="margin-bottom: 0.5rem;">
          <SpDropdownItem value="item2" @select="handleSelect">
            Element 2
          </SpDropdownItem>
        </div>
        
        <div style="margin-bottom: 0.5rem;">
          <SpDropdownItem value="item3" @select="handleSelect">
            Element 3
          </SpDropdownItem>
        </div>
        
        <div>
          <SpDropdownItem value="item4" disabled @select="handleSelect">
            Element 4 (deaktiviert)
          </SpDropdownItem>
        </div>
      </div>
    `
  })
}

// Im Dropdown-Kontext
export const ImDropdownKontext: Story = {
  render: () => ({
    components: { 
      SpDropdown, 
      SpDropdownTrigger, 
      SpDropdownContent, 
      SpDropdownItem, 
      SpDropdownSeparator 
    },
    setup() {
      const isOpen = ref(false)
      
      const handleSelect = (value: string) => {
        console.log('Ausgewählt:', value)
      }
      
      return { isOpen, handleSelect }
    },
    template: `
      <SpDropdown v-model="isOpen">
        <SpDropdownTrigger>
          Aktionsmenü
        </SpDropdownTrigger>
        <SpDropdownContent>
          <SpDropdownItem value="edit" @select="handleSelect">
            Bearbeiten
          </SpDropdownItem>
          
          <SpDropdownItem value="copy" @select="handleSelect">
            Kopieren
          </SpDropdownItem>
          
          <SpDropdownItem value="paste" @select="handleSelect">
            Einfügen
          </SpDropdownItem>
          
          <SpDropdownSeparator />
          
          <SpDropdownItem value="export" @select="handleSelect">
            Exportieren
          </SpDropdownItem>
          
          <SpDropdownItem value="share" @select="handleSelect">
            Teilen
          </SpDropdownItem>
          
          <SpDropdownSeparator />
          
          <SpDropdownItem value="delete" @select="handleSelect">
            Löschen
          </SpDropdownItem>
        </SpDropdownContent>
      </SpDropdown>
    `
  })
}

// Interaktive Spielwiese
export const InteraktiveSpielwiese: Story = {
  args: {
    value: 'playground',
    disabled: false,
    closeOnSelect: true
  },
  render: (args) => ({
    components: { SpDropdownItem },
    setup() {
      const handleSelect = (value: string) => {
        console.log('Ausgewählt:', value)
      }
      
      return { args, handleSelect }
    },
    template: `
      <div style="width: 400px; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h4 style="margin: 0 0 1rem; font-size: 1rem; color: #374151;">Interaktive Spielwiese</h4>
        <p style="margin: 0 0 1rem; font-size: 0.875rem; color: #6b7280;">
          Verwende die Steuerelemente unten, um verschiedene Konfigurationen zu testen.
        </p>
        
        <div style="min-height: 60px; display: flex; align-items: center; border: 1px dashed #d1d5db; border-radius: 4px; margin-bottom: 1rem; padding: 0.5rem;">
          <SpDropdownItem v-bind="args" @select="handleSelect">
            Spielwiese Element
          </SpDropdownItem>
        </div>
        
        <div style="font-size: 0.875rem; color: #6b7280;">
          <strong>Aktuelle Konfiguration:</strong><br>
          Wert: {{ args.value }}<br>
          Deaktiviert: {{ args.disabled ? 'Ja' : 'Nein' }}<br>
          Schließt bei Auswahl: {{ args.closeOnSelect ? 'Ja' : 'Nein' }}
        </div>
      </div>
    `
  })
}

// Barrierefreiheit
export const Barrierefreiheit: Story = {
  render: () => ({
    components: { SpDropdownItem },
    setup() {
      const handleSelect = (value: string) => {
        console.log('Ausgewählt:', value)
      }
      
      return { handleSelect }
    },
    template: `
      <div style="width: 400px; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h4 style="margin: 0 0 1rem; font-size: 1rem; color: #374151;">Barrierefreiheit</h4>
        
        <div style="margin-bottom: 1rem;">
          <h5 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Normale Elemente</h5>
          <div style="margin-bottom: 0.5rem;">
            <SpDropdownItem value="save" @select="handleSelect">
              Speichern
            </SpDropdownItem>
          </div>
          <div style="margin-bottom: 0.5rem;">
            <SpDropdownItem value="open" @select="handleSelect">
              Öffnen
            </SpDropdownItem>
          </div>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <h5 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Deaktivierte Elemente</h5>
          <div style="margin-bottom: 0.5rem;">
            <SpDropdownItem value="locked" disabled @select="handleSelect">
              Gesperrt (nicht fokussierbar)
            </SpDropdownItem>
          </div>
        </div>
        
        <div style="font-size: 0.875rem; color: #6b7280; background: #f9fafb; padding: 0.75rem; border-radius: 4px;">
          <strong>Barrierefreiheit-Hinweise:</strong><br>
          • Alle Elemente haben <code>role="menuitem"</code> für Bildschirmleser<br>
          • Deaktivierte Elemente haben <code>tabindex="-1"</code> und sind nicht fokussierbar<br>
          • Fokussierte Elemente haben verbesserte visuelle Indikatoren<br>
          • Tastaturnavigation mit Enter und Leertaste funktioniert<br>
          • Fokus-Management wird korrekt mit internem Zustand verwaltet
        </div>
      </div>
    `
  })
}