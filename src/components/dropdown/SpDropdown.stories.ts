import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { within, userEvent } from '@storybook/testing-library'
import { expect } from 'storybook/test'
import SpDropdown from './SpDropdown.vue'
import SpDropdownTrigger from './SpDropdownTrigger.vue'
import SpDropdownContent from './SpDropdownContent.vue'
import SpDropdownItem from './SpDropdownItem.vue'
import SpDropdownSeparator from './SpDropdownSeparator.vue'
import SpDropdownSub from './SpDropdownSub.vue'
import SpDropdownSubTrigger from './SpDropdownSubTrigger.vue'
import SpDropdownSubContent from './SpDropdownSubContent.vue'

const meta: Meta<typeof SpDropdown> = {
    title: 'Components/SpDropdown',
    component: SpDropdown,
    argTypes: {
        modelValue: {
            control: 'boolean',
            description: 'Kontrolliert den geöffneten/geschlossenen Zustand',
            table: {
                type: { summary: 'boolean' },
                defaultValue: { summary: 'false' }
            }
        },
        disabled: {
            control: 'boolean',
            description: 'Deaktiviert das gesamte Dropdown',
            table: {
                type: { summary: 'boolean' },
                defaultValue: { summary: 'false' }
            }
        },
        closeOnSelect: {
            control: 'boolean',
            description: 'Schließt automatisch bei Item-Auswahl',
            table: {
                type: { summary: 'boolean' },
                defaultValue: { summary: 'true' }
            }
        },
        placement: {
            control: 'select',
            options: [
                'top', 'top-start', 'top-end',
                'bottom', 'bottom-start', 'bottom-end',
                'left', 'left-start', 'left-end',
                'right', 'right-start', 'right-end'
            ],
            description: 'Platzierung des Dropdown-Contents',
            table: {
                type: { summary: 'DropdownPlacement' },
                defaultValue: { summary: 'bottom-start' }
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof meta>

// Default Story
export const Default: Story = {
    args: {
        modelValue: false,
        disabled: false,
        closeOnSelect: true
    },
    render: (args) => ({
        components: { SpDropdown, SpDropdownTrigger, SpDropdownContent, SpDropdownItem },
        setup() {
            const isOpen = ref(args.modelValue)
            return { args, isOpen }
        },
        template: `
      <SpDropdown v-model="isOpen" v-bind="args">
        <SpDropdownTrigger>
          Dropdown öffnen
        </SpDropdownTrigger>
        <SpDropdownContent>
          <SpDropdownItem value="edit">Bearbeiten</SpDropdownItem>
          <SpDropdownItem value="duplicate">Duplizieren</SpDropdownItem>
          <SpDropdownItem value="delete">Löschen</SpDropdownItem>
        </SpDropdownContent>
      </SpDropdown>
    `
    })
}

// With Separator
export const WithSeparator: Story = {
    render: () => ({
        components: { SpDropdown, SpDropdownTrigger, SpDropdownContent, SpDropdownItem, SpDropdownSeparator },
        setup() {
            const isOpen = ref(false)
            return { isOpen }
        },
        template: `
      <SpDropdown v-model="isOpen">
        <SpDropdownTrigger>
          Aktionen
        </SpDropdownTrigger>
        <SpDropdownContent>
          <SpDropdownItem value="cut">Ausschneiden</SpDropdownItem>
          <SpDropdownItem value="copy">Kopieren</SpDropdownItem>
          <SpDropdownItem value="paste">Einfügen</SpDropdownItem>
          <SpDropdownSeparator />
          <SpDropdownItem value="delete">Löschen</SpDropdownItem>
        </SpDropdownContent>
      </SpDropdown>
    `
    })
}

// With Disabled Items
export const WithDisabledItems: Story = {
    render: () => ({
        components: { SpDropdown, SpDropdownTrigger, SpDropdownContent, SpDropdownItem },
        setup() {
            const isOpen = ref(false)
            return { isOpen }
        },
        template: `
      <SpDropdown v-model="isOpen">
        <SpDropdownTrigger>
          Optionen
        </SpDropdownTrigger>
        <SpDropdownContent>
          <SpDropdownItem value="option1">Option 1</SpDropdownItem>
          <SpDropdownItem value="option2" disabled>Option 2 (Deaktiviert)</SpDropdownItem>
          <SpDropdownItem value="option3">Option 3</SpDropdownItem>
        </SpDropdownContent>
      </SpDropdown>
    `
    })
}

// Controlled Example with Selection
export const WithSelection: Story = {
    render: () => ({
        components: { SpDropdown, SpDropdownTrigger, SpDropdownContent, SpDropdownItem },
        setup() {
            const isOpen = ref(false)
            const selectedValue = ref<string>('')

            const handleSelect = (value: string) => {
                selectedValue.value = value
            }

            return { isOpen, selectedValue, handleSelect }
        },
        template: `
      <div>
        <SpDropdown v-model="isOpen">
          <SpDropdownTrigger>
            {{ selectedValue || 'Wählen Sie eine Option' }}
          </SpDropdownTrigger>
          <SpDropdownContent>
            <SpDropdownItem value="option1" @select="handleSelect">
              Option 1
            </SpDropdownItem>
            <SpDropdownItem value="option2" @select="handleSelect">
              Option 2
            </SpDropdownItem>
            <SpDropdownItem value="option3" @select="handleSelect">
              Option 3
            </SpDropdownItem>
          </SpDropdownContent>
        </SpDropdown>
        <p style="margin-top: 1rem">Ausgewählt: {{ selectedValue || 'Keine' }}</p>
      </div>
    `
    })
}

// Interactive Test Story
export const Interactive: Story = {
    render: () => ({
        components: { SpDropdown, SpDropdownTrigger, SpDropdownContent, SpDropdownItem },
        setup() {
            const isOpen = ref(false)
            const clickedItem = ref('')

            const handleItemClick = (value: string) => {
                clickedItem.value = value
            }

            return { isOpen, clickedItem, handleItemClick }
        },
        template: `
      <div>
        <SpDropdown v-model="isOpen">
          <SpDropdownTrigger>
            Test Dropdown
          </SpDropdownTrigger>
          <SpDropdownContent>
            <SpDropdownItem 
              value="item1" 
              @select="handleItemClick"
              data-testid="item1"
            >
              Item 1
            </SpDropdownItem>
            <SpDropdownItem 
              value="item2" 
              @select="handleItemClick"
              data-testid="item2"
            >
              Item 2
            </SpDropdownItem>
          </SpDropdownContent>
        </SpDropdown>
        <div data-testid="clicked-item">{{ clickedItem }}</div>
      </div>
    `
    }),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        const user = userEvent.setup()

        // Click trigger to open dropdown
        const trigger = canvas.getByText('Test Dropdown')
        await user.click(trigger)

        // Verify dropdown is open
        const item1 = await canvas.findByTestId('item1')
        expect(item1).toBeInTheDocument()

        // Click an item
        await user.click(item1)

        // Verify item was selected
        const clickedItem = canvas.getByTestId('clicked-item')
        expect(clickedItem).toHaveTextContent('item1')
    }
}

// With Sub-Menus
export const WithSubMenus: Story = {
    render: () => ({
        components: {
            SpDropdown,
            SpDropdownTrigger,
            SpDropdownContent,
            SpDropdownItem,
            SpDropdownSeparator,
            SpDropdownSub,
            SpDropdownSubTrigger,
            SpDropdownSubContent
        },
        setup() {
            const isOpen = ref(false)
            const selectedValue = ref('')

            const handleSelect = (value: string) => {
                selectedValue.value = value
            }

            return { isOpen, selectedValue, handleSelect }
        },
        template: `
      <div style="padding: 2rem;">
        <SpDropdown v-model="isOpen">
          <SpDropdownTrigger>
            Datei
          </SpDropdownTrigger>
          <SpDropdownContent>
            <SpDropdownItem value="new" @select="handleSelect">
              Neu
            </SpDropdownItem>
            <SpDropdownItem value="open" @select="handleSelect">
              Öffnen
            </SpDropdownItem>
            <SpDropdownSeparator />
            <SpDropdownSub>
              <SpDropdownSubTrigger>
                Zuletzt verwendet
              </SpDropdownSubTrigger>
              <SpDropdownSubContent>
                <SpDropdownItem value="file1" @select="handleSelect">
                  Dokument1.pdf
                </SpDropdownItem>
                <SpDropdownItem value="file2" @select="handleSelect">
                  Tabelle.xlsx
                </SpDropdownItem>
                <SpDropdownItem value="file3" @select="handleSelect">
                  Präsentation.pptx
                </SpDropdownItem>
              </SpDropdownSubContent>
            </SpDropdownSub>
            <SpDropdownSeparator />
            <SpDropdownSub>
              <SpDropdownSubTrigger>
                Exportieren als
              </SpDropdownSubTrigger>
              <SpDropdownSubContent>
                <SpDropdownItem value="pdf" @select="handleSelect">
                  PDF
                </SpDropdownItem>
                <SpDropdownItem value="word" @select="handleSelect">
                  Word
                </SpDropdownItem>
                <SpDropdownSub>
                  <SpDropdownSubTrigger>
                    Bild
                  </SpDropdownSubTrigger>
                  <SpDropdownSubContent>
                    <SpDropdownItem value="png" @select="handleSelect">
                      PNG
                    </SpDropdownItem>
                    <SpDropdownItem value="jpg" @select="handleSelect">
                      JPG
                    </SpDropdownItem>
                    <SpDropdownItem value="svg" @select="handleSelect">
                      SVG
                    </SpDropdownItem>
                  </SpDropdownSubContent>
                </SpDropdownSub>
              </SpDropdownSubContent>
            </SpDropdownSub>
            <SpDropdownSeparator />
            <SpDropdownItem value="exit" @select="handleSelect">
              Beenden
            </SpDropdownItem>
          </SpDropdownContent>
        </SpDropdown>
        <p style="margin-top: 1rem">Ausgewählt: {{ selectedValue || 'Keine' }}</p>
      </div>
    `
    })
}