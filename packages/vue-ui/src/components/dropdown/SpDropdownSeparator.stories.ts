import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import SpDropdownSeparator from './SpDropdownSeparator.vue'
import SpDropdown from './SpDropdown.vue'
import SpDropdownTrigger from './SpDropdownTrigger.vue'
import SpDropdownContent from './SpDropdownContent.vue'
import SpDropdownItem from './SpDropdownItem.vue'

const meta = {
  title: 'Components/Dropdown/SpDropdownSeparator',
  component: SpDropdownSeparator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**SpDropdownSeparator** ist ein visueller Trenner für Dropdown-Menüabschnitte mit verschiedenen Varianten und Stilen.

### Funktionen:
- Mehrere visuelle Varianten (durchgehend, gestrichelt, gepunktet, Verlauf, doppelt)
- Abstandsvarianten (kompakt, normal, geräumig)
- Farbvarianten für verschiedene Kontexte
- Optionale Beschriftungen zur Abschnittsidentifikation
- Vollständige Barrierefreiheitsunterstützung
- Theme-Unterstützung mit CSS-Custom-Properties
        `
      }
    }
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['solid', 'dashed', 'dotted', 'gradient', 'double'],
      description: 'Visueller Stil des Trenners'
    },
    spacing: {
      control: { type: 'select' },
      options: ['compact', 'normal', 'spacious'],
      description: 'Abstand um den Trenner'
    },
    color: {
      control: { type: 'select' },
      options: ['default', 'muted', 'accent', 'success', 'warning', 'error'],
      description: 'Farbvariante für verschiedene Kontexte'
    },
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      description: 'Ausrichtung des Trenners'
    },
    role: {
      control: { type: 'select' },
      options: ['separator', 'presentation', 'none'],
      description: 'ARIA-Rolle für den Trenner'
    },
    label: {
      control: { type: 'text' },
      description: 'Beschriftung für den Trennerabschnitt'
    },
    labelledBy: {
      control: { type: 'text' },
      description: 'ID des Elements, das diesen Trenner beschriftet'
    },
    class: {
      control: { type: 'text' },
      description: 'Zusätzliche CSS-Klassen'
    }
  }
} satisfies Meta<typeof SpDropdownSeparator>

export default meta
type Story = StoryObj<typeof meta>

// Einfacher Trenner
export const Standard: Story = {
  args: {},
  render: (args) => ({
    components: { SpDropdownSeparator },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 200px; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
        <SpDropdownSeparator v-bind="args" />
      </div>
    `
  })
}

// Alle visuellen Varianten
export const VisuelleVarianten: Story = {
  render: () => ({
    components: { SpDropdownSeparator },
    template: `
      <div style="width: 300px; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="margin-bottom: 1rem;">
          <h4 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Durchgehend (Standard)</h4>
          <SpDropdownSeparator variant="solid" />
        </div>
        
        <div style="margin-bottom: 1rem;">
          <h4 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Gestrichelt</h4>
          <SpDropdownSeparator variant="dashed" />
        </div>
        
        <div style="margin-bottom: 1rem;">
          <h4 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Gepunktet</h4>
          <SpDropdownSeparator variant="dotted" />
        </div>
        
        <div style="margin-bottom: 1rem;">
          <h4 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Verlauf</h4>
          <SpDropdownSeparator variant="gradient" />
        </div>
        
        <div>
          <h4 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Doppelt</h4>
          <SpDropdownSeparator variant="double" />
        </div>
      </div>
    `
  })
}

// Abstandsvarianten
export const Abstandsvarianten: Story = {
  render: () => ({
    components: { SpDropdownSeparator },
    template: `
      <div style="width: 300px; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="margin-bottom: 1rem;">
          <h4 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Kompakt</h4>
          <SpDropdownSeparator spacing="compact" />
        </div>
        
        <div style="margin-bottom: 1rem;">
          <h4 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Normal (Standard)</h4>
          <SpDropdownSeparator spacing="normal" />
        </div>
        
        <div>
          <h4 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Geräumig</h4>
          <SpDropdownSeparator spacing="spacious" />
        </div>
      </div>
    `
  })
}

// Farbvarianten
export const Farbvarianten: Story = {
  render: () => ({
    components: { SpDropdownSeparator },
    template: `
      <div style="width: 300px; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="margin-bottom: 1rem;">
          <h4 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Standard</h4>
          <SpDropdownSeparator color="default" />
        </div>
        
        <div style="margin-bottom: 1rem;">
          <h4 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Gedämpft</h4>
          <SpDropdownSeparator color="muted" />
        </div>
        
        <div style="margin-bottom: 1rem;">
          <h4 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Akzent</h4>
          <SpDropdownSeparator color="accent" />
        </div>
        
        <div style="margin-bottom: 1rem;">
          <h4 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Erfolg</h4>
          <SpDropdownSeparator color="success" />
        </div>
        
        <div style="margin-bottom: 1rem;">
          <h4 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Warnung</h4>
          <SpDropdownSeparator color="warning" />
        </div>
        
        <div>
          <h4 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Fehler</h4>
          <SpDropdownSeparator color="error" />
        </div>
      </div>
    `
  })
}

// Mit Beschriftung
export const MitBeschriftung: Story = {
  render: () => ({
    components: { SpDropdownSeparator },
    template: `
      <div style="width: 300px; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="margin-bottom: 1rem;">
          <h4 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Einfache Beschriftung</h4>
          <SpDropdownSeparator label="Zuletzt verwendet" />
        </div>
        
        <div style="margin-bottom: 1rem;">
          <h4 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Beschriftung mit Variante</h4>
          <SpDropdownSeparator label="Aktionen" variant="dashed" color="accent" />
        </div>
        
        <div>
          <h4 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Nur Beschriftung (keine Linie)</h4>
          <SpDropdownSeparator label="Kategorien" />
        </div>
      </div>
    `
  })
}

// Mit Slot-Inhalt
export const MitSlotInhalt: Story = {
  render: () => ({
    components: { SpDropdownSeparator },
    template: `
      <div style="width: 300px; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="margin-bottom: 1rem;">
          <h4 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Mit Icon</h4>
          <SpDropdownSeparator>
            <template #default>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
              <span>Verlauf</span>
            </template>
          </SpDropdownSeparator>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <h4 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Nur Icon</h4>
          <SpDropdownSeparator>
            <template #default>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6"/>
              </svg>
            </template>
          </SpDropdownSeparator>
        </div>
        
        <div>
          <h4 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Mit Linie und Icon</h4>
          <SpDropdownSeparator variant="solid" color="accent">
            <template #default>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              <span>Dokumentation</span>
            </template>
          </SpDropdownSeparator>
        </div>
      </div>
    `
  })
}

// Ausrichtungsvarianten
export const Ausrichtungsvarianten: Story = {
  render: () => ({
    components: { SpDropdownSeparator },
    template: `
      <div style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="margin-bottom: 2rem;">
          <h4 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Horizontal (Standard)</h4>
          <div style="width: 300px;">
            <SpDropdownSeparator orientation="horizontal" />
          </div>
        </div>
        
        <div>
          <h4 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Vertikal</h4>
          <div style="height: 100px; display: flex; align-items: center;">
            <SpDropdownSeparator orientation="vertical" />
          </div>
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
      return { isOpen }
    },
    template: `
      <SpDropdown v-model="isOpen">
        <SpDropdownTrigger>
          Menü öffnen
        </SpDropdownTrigger>
        <SpDropdownContent>
          <SpDropdownItem>Bearbeiten</SpDropdownItem>
          <SpDropdownItem>Kopieren</SpDropdownItem>
          <SpDropdownItem>Einfügen</SpDropdownItem>
          
          <SpDropdownSeparator />
          
          <SpDropdownItem>Ausschneiden</SpDropdownItem>
          <SpDropdownItem>Duplizieren</SpDropdownItem>
          
          <SpDropdownSeparator label="Zuletzt verwendet" />
          
          <SpDropdownItem>Dokument.pdf</SpDropdownItem>
          <SpDropdownItem>Präsentation.pptx</SpDropdownItem>
          <SpDropdownItem>Tabelle.xlsx</SpDropdownItem>
          
          <SpDropdownSeparator variant="dashed" color="warning" />
          
          <SpDropdownItem>Löschen</SpDropdownItem>
          
          <SpDropdownSeparator>
            <template #default>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
              <span>Erweitert</span>
            </template>
          </SpDropdownSeparator>
          
          <SpDropdownItem>Eigenschaften</SpDropdownItem>
          <SpDropdownItem>Einstellungen</SpDropdownItem>
        </SpDropdownContent>
      </SpDropdown>
    `
  })
}

// Interaktive Spielwiese
export const InteraktiveSpielwiese: Story = {
  args: {
    variant: 'solid',
    spacing: 'normal',
    color: 'default',
    orientation: 'horizontal',
    role: 'separator',
    label: '',
    labelledBy: '',
    class: ''
  },
  render: (args) => ({
    components: { SpDropdownSeparator },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 400px; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h4 style="margin: 0 0 1rem; font-size: 1rem; color: #374151;">Interaktive Spielwiese</h4>
        <p style="margin: 0 0 1rem; font-size: 0.875rem; color: #6b7280;">
          Verwende die Steuerelemente unten, um verschiedene Konfigurationen zu testen.
        </p>
        
        <div style="min-height: 60px; display: flex; align-items: center; justify-content: center; border: 1px dashed #d1d5db; border-radius: 4px; margin-bottom: 1rem;">
          <SpDropdownSeparator v-bind="args" />
        </div>
        
        <div style="font-size: 0.875rem; color: #6b7280;">
          <strong>Aktuelle Konfiguration:</strong><br>
          Variante: {{ args.variant }}<br>
          Abstand: {{ args.spacing }}<br>
          Farbe: {{ args.color }}<br>
          Ausrichtung: {{ args.orientation }}<br>
          <template v-if="args.label">Beschriftung: "{{ args.label }}"</template>
        </div>
      </div>
    `
  })
}

// Barrierefreiheit
export const Barrierefreiheit: Story = {
  render: () => ({
    components: { SpDropdownSeparator },
    template: `
      <div style="width: 400px; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h4 style="margin: 0 0 1rem; font-size: 1rem; color: #374151;">Barrierefreiheit</h4>
        
        <div style="margin-bottom: 1rem;">
          <h5 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Standard-Trenner (role="separator")</h5>
          <SpDropdownSeparator role="separator" />
        </div>
        
        <div style="margin-bottom: 1rem;">
          <h5 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Dekorativer Trenner (role="presentation")</h5>
          <SpDropdownSeparator role="presentation" />
        </div>
        
        <div style="margin-bottom: 1rem;">
          <h5 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Trenner mit Beschriftung für Bildschirmleser</h5>
          <SpDropdownSeparator label="Hauptaktionen" role="separator" />
        </div>
        
        <div style="margin-bottom: 1rem;">
          <h5 style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Trenner mit aria-labelledby</h5>
          <div>
            <div id="separator-label" style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.25rem;">
              Dieser Abschnitt wird durch einen Trenner unterteilt
            </div>
            <SpDropdownSeparator labelledBy="separator-label" />
          </div>
        </div>
        
        <div style="font-size: 0.875rem; color: #6b7280; background: #f9fafb; padding: 0.75rem; border-radius: 4px;">
          <strong>Barrierefreiheit-Hinweise:</strong><br>
          • Verwende <code>role="separator"</code> für semantische Trennung<br>
          • Verwende <code>role="presentation"</code> für rein dekorative Trenner<br>
          • Füge <code>label</code> hinzu, wenn der Trenner eine Bedeutung hat<br>
          • Verwende <code>aria-labelledby</code> für erweiterte Beschriftungen
        </div>
      </div>
    `
  })
}