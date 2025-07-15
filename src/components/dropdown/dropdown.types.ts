/**
 * ToggleEvent type for Popover API
 * This is a newer browser API that might not be in all TypeScript definitions yet
 */
export interface ToggleEvent extends Event {
    oldState: 'open' | 'closed'
    newState: 'open' | 'closed'
}

/**
 * Placement-Optionen für das Dropdown
 */
export type DropdownPlacement =
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'left'
    | 'left-start'
    | 'left-end'
    | 'right'
    | 'right-start'
    | 'right-end'

/**
 * Alignment-Optionen für das Dropdown-Content
 */
export type DropdownAlign = 'start' | 'center' | 'end'

/**
 * Props für die SpDropdown Root-Komponente
 */
export interface SpDropdownProps {
    /**
     * Kontrolliert den geöffneten/geschlossenen Zustand des Dropdowns
     * @default false
     */
    modelValue?: boolean
    /**
     * Deaktiviert das gesamte Dropdown
     * @default false
     */
    disabled?: boolean
    /**
     * Schließt das Dropdown automatisch bei Auswahl eines Items
     * @default true
     */
    closeOnSelect?: boolean
    /**
     * Bevorzugte Platzierung des Dropdown-Contents
     * @default 'bottom-start'
     */
    placement?: DropdownPlacement
}

/**
 * Props für die SpDropdownTrigger Komponente
 */
export interface SpDropdownTriggerProps {
    /**
     * Rendert den Trigger als das direkte Kind-Element
     * Nützlich für custom Trigger-Elemente
     * @default false
     */
    asChild?: boolean
}

/**
 * Props für die SpDropdownContent Komponente
 */
export interface SpDropdownContentProps {
    /**
     * Bevorzugte Platzierung des Dropdown-Contents
     * @default 'bottom-start'
     */
    placement?: DropdownPlacement
    /**
     * Ausrichtung relativ zum Trigger
     * @default 'start'
     */
    align?: DropdownAlign
    /**
     * Abstand vom Trigger in Pixeln
     * @default 4
     */
    sideOffset?: number
    /**
     * Aktiviert Kollisionserkennung mit Viewport-Rändern
     * @default true
     */
    avoidCollisions?: boolean
    /**
     * z-index für das Dropdown-Content
     */
    zIndex?: number
}

/**
 * Props für die SpDropdownItem Komponente
 */
export interface SpDropdownItemProps {
    /**
     * Deaktiviert das einzelne Item
     * @default false
     */
    disabled?: boolean
    /**
     * Wert des Items für die Selektion
     */
    value?: string | number
    /**
     * Verhindert das Schließen des Dropdowns bei Klick auf dieses Item
     * @default false
     */
    closeOnSelect?: boolean
}

/**
 * Props für die SpDropdownSeparator Komponente
 */
export interface SpDropdownSeparatorProps {
    /**
     * Zusätzliche CSS-Klassen
     */
    class?: string
}

/**
 * Emits für SpDropdown
 */
export interface SpDropdownEmits {
    /**
     * Wird ausgelöst wenn sich der open/closed Zustand ändert
     */
    'update:modelValue': [value: boolean]
    /**
     * Wird ausgelöst wenn das Dropdown geöffnet wird
     */
    'open': []
    /**
     * Wird ausgelöst wenn das Dropdown geschlossen wird
     */
    'close': []
}

/**
 * Emits für SpDropdownItem
 */
export interface SpDropdownItemEmits {
    /**
     * Wird ausgelöst wenn das Item angeklickt wird
     */
    'click': [event: MouseEvent]
    /**
     * Wird ausgelöst wenn das Item ausgewählt wird (via Klick oder Keyboard)
     */
    'select': [value: string | number | undefined]
}

/**
 * Props für die SpDropdownSub Komponente
 */
export interface SpDropdownSubProps {
    /**
     * Deaktiviert das Sub-Menü
     * @default false
     */
    disabled?: boolean
    /**
     * Kontrolliert den geöffneten/geschlossenen Zustand
     * @default false
     */
    modelValue?: boolean
}

/**
 * Props für die SpDropdownSubTrigger Komponente
 */
export interface SpDropdownSubTriggerProps {
    /**
     * Deaktiviert den Sub-Trigger
     * @default false
     */
    disabled?: boolean
}

/**
 * Props für die SpDropdownSubContent Komponente
 */
export interface SpDropdownSubContentProps {
    /**
     * Ausrichtung relativ zum Trigger
     * @default 'start'
     */
    align?: DropdownAlign
    /**
     * Abstand vom Trigger in Pixeln
     * @default 4
     */
    sideOffset?: number
    /**
     * Aktiviert Kollisionserkennung mit Viewport-Rändern
     * @default true
     */
    avoidCollisions?: boolean
}

/**
 * Emits für SpDropdownSub
 */
export interface SpDropdownSubEmits {
    /**
     * Wird ausgelöst wenn sich der open/closed Zustand ändert
     */
    'update:modelValue': [value: boolean]
    /**
     * Wird ausgelöst wenn das Sub-Menü geöffnet wird
     */
    'open': []
    /**
     * Wird ausgelöst wenn das Sub-Menü geschlossen wird
     */
    'close': []
}