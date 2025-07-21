import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import SpDropdownTrigger from './SpDropdownTrigger.vue'
import SpDropdown from './SpDropdown.vue'
import SpDropdownContent from './SpDropdownContent.vue'
import SpDropdownItem from './SpDropdownItem.vue'
import SpDropdownSeparator from './SpDropdownSeparator.vue'

const meta = {
  title: 'Components/Dropdown/SpDropdownTrigger',
  component: SpDropdownTrigger,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**SpDropdownTrigger** ist die Trigger-Komponente für Dropdown-Menüs mit verbesserter Tastaturnavigation und Barrierefreiheit.

### Funktionen:
- Vollständige Tastaturnavigation (Enter, Leertaste, Pfeiltasten, Escape)
- AsChild-Pattern für benutzerdefinierte Trigger-Elemente
- Umfassende Barrierefreiheitsunterstützung
- Fokusverwaltungsintegration mit Dropdown-Content
- Automatisches Fokussieren des ersten/letzten Elements
        `
      }
    }
  },
  argTypes: {
    asChild: {
      control: { type: 'boolean' },
      description: 'Rendert den Trigger als das direkte Kind-Element'
    }
  }
} satisfies Meta<typeof SpDropdownTrigger>

export default meta
type Story = StoryObj<typeof meta>

// Standard Trigger
export const Standard: Story = {
  args: {
    asChild: false
  },
  render: (args) => ({
    components: { SpDropdownTrigger },
    setup() {
      return { args }
    },
    template: `
      <SpDropdownTrigger v-bind="args">
        Menü öffnen
      </SpDropdownTrigger>
    `
  })
}

// Tastaturnavigation
export const Tastaturnavigation: Story = {
  render: () => ({
    components: { SpDropdownTrigger },
    template: `
      <div style="width: 400px; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h4 style="margin: 0 0 1rem; font-size: 1rem; color: #374151;">Tastaturnavigation</h4>
        <p style="margin: 0 0 1rem; font-size: 0.875rem; color: #6b7280;">
          Teste die Tastaturnavigation mit:
        </p>
        <ul style="margin: 0 0 1rem; font-size: 0.875rem; color: #6b7280;">
          <li><strong>Enter/Leertaste:</strong> Dropdown öffnen/schließen</li>
          <li><strong>Pfeil nach unten:</strong> Dropdown öffnen und erstes Element fokussieren</li>
          <li><strong>Pfeil nach oben:</strong> Dropdown öffnen und letztes Element fokussieren</li>
          <li><strong>Escape:</strong> Dropdown schließen</li>
        </ul>
        
        <SpDropdownTrigger>
          Tastaturnavigation testen
        </SpDropdownTrigger>
      </div>
    `
  })
}

// AsChild Pattern
export const AsChildPattern: Story = {
  render: () => ({
    components: { SpDropdownTrigger },
    template: `
      <div style="width: 400px; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h4 style="margin: 0 0 1rem; font-size: 1rem; color: #374151;">AsChild Pattern</h4>
        <p style="margin: 0 0 1rem; font-size: 0.875rem; color: #6b7280;">
          Das AsChild-Pattern ermöglicht es, benutzerdefinierte Trigger-Elemente zu verwenden.
        </p>
        
        <div style="margin-bottom: 1rem;">
          <h5 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Standard Button</h5>
          <SpDropdownTrigger>
            Standard Trigger
          </SpDropdownTrigger>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <h5 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">AsChild mit Custom Button</h5>
          <SpDropdownTrigger as-child>
            <template #default="{ props }">
              <button 
                v-bind="props"
                style="
                  padding: 0.75rem 1.5rem;
                  background: linear-gradient(to right, #3b82f6, #1d4ed8);
                  color: white;
                  border: none;
                  border-radius: 12px;
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.2s;
                "
              >
                Benutzerdefinierter Trigger
              </button>
            </template>
          </SpDropdownTrigger>
        </div>
        
        <div>
          <h5 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">AsChild mit Link-Style</h5>
          <SpDropdownTrigger as-child>
            <template #default="{ props }">
              <a 
                v-bind="props"
                href="#"
                style="
                  display: inline-flex;
                  align-items: center;
                  gap: 0.5rem;
                  color: #3b82f6;
                  text-decoration: none;
                  font-weight: 500;
                  padding: 0.5rem;
                  border-radius: 6px;
                  transition: all 0.2s;
                "
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6"/>
                </svg>
                Link-Style Trigger
              </a>
            </template>
          </SpDropdownTrigger>
        </div>
      </div>
    `
  })
}

// Im Dropdown-Kontext (vollständiges Beispiel)
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
      <div style="width: 400px; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h4 style="margin: 0 0 1rem; font-size: 1rem; color: #374151;">Komplettes Dropdown</h4>
        <p style="margin: 0 0 1rem; font-size: 0.875rem; color: #6b7280;">
          Hier ist ein vollständiges Dropdown mit Trigger, Content und Items.
        </p>
        
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
        
        <div style="margin-top: 1rem; font-size: 0.875rem; color: #6b7280;">
          <strong>Status:</strong> {{ isOpen ? 'Geöffnet' : 'Geschlossen' }}
        </div>
      </div>
    `
  })
}

// Verschiedene Trigger-Stile
export const VerschiedeneTriggerStile: Story = {
  render: () => ({
    components: { SpDropdownTrigger },
    template: `
      <div style="width: 500px; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h4 style="margin: 0 0 1rem; font-size: 1rem; color: #374151;">Verschiedene Trigger-Stile</h4>
        
        <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
          <div>
            <h5 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Standard</h5>
            <SpDropdownTrigger>
              Standard
            </SpDropdownTrigger>
          </div>
          
          <div>
            <h5 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Mit Icon</h5>
            <SpDropdownTrigger>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6"/>
              </svg>
              Mit Icon
            </SpDropdownTrigger>
          </div>
          
          <div>
            <h5 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Langer Text</h5>
            <SpDropdownTrigger>
              Sehr langer Trigger-Text
            </SpDropdownTrigger>
          </div>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <h5 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">AsChild - Benutzerdefiniert</h5>
          <SpDropdownTrigger as-child>
            <template #default="{ props }">
              <button 
                v-bind="props"
                style="
                  padding: 0.5rem 1rem;
                  background: #059669;
                  color: white;
                  border: none;
                  border-radius: 6px;
                  font-weight: 500;
                  cursor: pointer;
                  display: inline-flex;
                  align-items: center;
                  gap: 0.5rem;
                "
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
                Erfolg Trigger
              </button>
            </template>
          </SpDropdownTrigger>
        </div>
        
        <div>
          <h5 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">AsChild - Deaktiviert</h5>
          <SpDropdownTrigger as-child>
            <template #default="{ props }">
              <button 
                v-bind="props"
                disabled
                style="
                  padding: 0.5rem 1rem;
                  background: #f3f4f6;
                  color: #9ca3af;
                  border: 1px solid #e5e7eb;
                  border-radius: 6px;
                  cursor: not-allowed;
                "
              >
                Deaktiviert
              </button>
            </template>
          </SpDropdownTrigger>
        </div>
      </div>
    `
  })
}

// Barrierefreiheit
export const Barrierefreiheit: Story = {
  render: () => ({
    components: { SpDropdownTrigger },
    template: `
      <div style="width: 500px; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h4 style="margin: 0 0 1rem; font-size: 1rem; color: #374151;">Barrierefreiheit</h4>
        
        <div style="margin-bottom: 1rem;">
          <h5 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Standard Trigger</h5>
          <SpDropdownTrigger>
            Standard Trigger
          </SpDropdownTrigger>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <h5 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">AsChild mit korrekten ARIA-Attributen</h5>
          <SpDropdownTrigger as-child>
            <template #default="{ props }">
              <button 
                v-bind="props"
                style="
                  padding: 0.5rem 1rem;
                  background: #3b82f6;
                  color: white;
                  border: none;
                  border-radius: 6px;
                  font-weight: 500;
                  cursor: pointer;
                "
              >
                Custom mit ARIA
              </button>
            </template>
          </SpDropdownTrigger>
        </div>
        
        <div style="font-size: 0.875rem; color: #6b7280; background: #f9fafb; padding: 0.75rem; border-radius: 4px;">
          <strong>Barrierefreiheit-Hinweise:</strong><br>
          • Alle Trigger haben <code>aria-haspopup="true"</code> für Bildschirmleser<br>
          • <code>aria-expanded</code> zeigt den aktuellen Zustand an<br>
          • <code>aria-controls</code> verknüpft den Trigger mit dem Content<br>
          • Fokus-Management funktioniert automatisch<br>
          • Tastaturnavigation ist vollständig implementiert<br>
          • AsChild-Pattern behält alle Barrierefreiheits-Attribute bei
        </div>
      </div>
    `
  })
}

// Interaktive Spielwiese
export const InteraktiveSpielwiese: Story = {
  args: {
    asChild: false
  },
  render: (args) => ({
    components: { SpDropdownTrigger },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 400px; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h4 style="margin: 0 0 1rem; font-size: 1rem; color: #374151;">Interaktive Spielwiese</h4>
        <p style="margin: 0 0 1rem; font-size: 0.875rem; color: #6b7280;">
          Verwende die Steuerelemente unten, um verschiedene Konfigurationen zu testen.
        </p>
        
        <div style="min-height: 60px; display: flex; align-items: center; border: 1px dashed #d1d5db; border-radius: 4px; margin-bottom: 1rem; padding: 0.5rem;">
          <SpDropdownTrigger v-bind="args">
            {{ args.asChild ? 'AsChild Trigger' : 'Standard Trigger' }}
          </SpDropdownTrigger>
        </div>
        
        <div style="font-size: 0.875rem; color: #6b7280;">
          <strong>Aktuelle Konfiguration:</strong><br>
          AsChild Pattern: {{ args.asChild ? 'Ja' : 'Nein' }}
        </div>
      </div>
    `
  })
}