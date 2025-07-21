/**
 * @fileoverview Design token definitions and constants
 */

import type { Token } from './types';

/**
 * Complete collection of design tokens used in the design system
 * @constant
 */
export const DESIGN_TOKENS: Token[] = [
  // ===== COLOR TOKENS =====
  {
    name: '--color-white',
    value: 'hsl(0deg 0% 100%)',
    category: 'color',
    type: 'color',
    label: 'Weiß',
    description: 'Basis Weiß für Hintergründe'
  },
  {
    name: '--surface-default',
    value: 'var(--color-white)',
    category: 'color',
    type: 'color',
    label: 'Standard Oberfläche',
    description: 'Standard Oberfläche, referenziert color-white'
  },
  {
    name: '--color-transparent',
    value: 'hsla(0deg, 0%, 0%, 0)',
    category: 'color',
    type: 'color',
    label: 'Transparent',
    description: 'Vollständig transparent'
  },
  {
    name: '--color-black-primary',
    value: 'hsl(0deg 0% 0% / 86%)',
    category: 'color',
    type: 'color',
    label: 'Schwarz Primary',
    description: 'Haupttextfarbe mit hohem Kontrast'
  },
  {
    name: '--color-black-secondary',
    value: 'hsl(0deg 0% 0% / 62%)',
    category: 'color',
    type: 'color',
    label: 'Schwarz Secondary',
    description: 'Sekundäre Textfarbe für weniger wichtige Inhalte'
  },
  {
    name: '--color-black-disabled',
    value: 'hsl(0deg 0% 0% / 38%)',
    category: 'color',
    type: 'color',
    label: 'Schwarz Disabled',
    description: 'Farbe für deaktivierte Elemente'
  },
  {
    name: '--color-gray-100',
    value: 'hsl(0deg 0% 0% / 10%)',
    category: 'color',
    type: 'color',
    label: 'Grau 100',
    description: 'Sehr helles Grau für Hintergründe'
  },
  {
    name: '--color-gray-200',
    value: 'hsl(0deg 0% 0% / 20%)',
    category: 'color',
    type: 'color',
    label: 'Grau 200',
    description: 'Helles Grau für Trennlinien'
  },
  {
    name: '--color-black-state-active-ripple',
    value: 'hsl(0deg 0% 100% / 10%)',
    category: 'color',
    type: 'color',
    label: 'Ripple Effekt',
    description: 'Ripple-Effekt für aktive Zustände'
  },

  // ===== BRAND COLORS =====
  {
    name: '--color-brand-stage',
    value: 'hsl(214deg 100% 20%)',
    category: 'color',
    type: 'color',
    label: 'Stage Brand',
    description: 'Dunkle Markenfarbe für Stage-Umgebungen'
  },
  {
    name: '--surface-stage',
    value: 'var(--color-brand-stage)',
    category: 'color',
    type: 'color',
    label: 'Stage Oberfläche',
    description: 'Stage Oberfläche, referenziert brand-stage'
  },
  {
    name: '--color-brand-default',
    value: 'hsl(206deg 100% 35%)',
    category: 'color',
    type: 'color',
    label: 'Standard Brand',
    description: 'Primäre Markenfarbe für CTAs und wichtige UI-Elemente'
  },
  {
    name: '--color-brand-default-lighten',
    value: 'hsl(206deg 70% 76%)',
    category: 'color',
    type: 'color',
    label: 'Brand Aufgehellt',
    description: 'Aufgehellte Variante der Markenfarbe'
  },
  {
    name: '--color-brand-default-state-ripple',
    value: 'hsl(206deg 100% 35% / 10%)',
    category: 'color',
    type: 'color',
    label: 'Brand Ripple',
    description: 'Ripple-Effekt basierend auf Markenfarbe'
  },
  {
    name: '--color-brand-default-state-active',
    value: 'hsl(from var(--color-brand-default) h s l / 10%)',
    category: 'color',
    type: 'color',
    label: 'Brand Aktiv',
    description: 'Aktiver Zustand mit Transparenz'
  },
  {
    name: '--color-brand-default-state-hover',
    value: 'hsl(from var(--color-brand-default) h s l / 5%)',
    category: 'color',
    type: 'color',
    label: 'Brand Hover',
    description: 'Hover-Zustand mit leichter Transparenz'
  },
  {
    name: '--color-brand-default-state-focus-visible',
    value: 'hsl(from var(--color-brand-default) h 54% 55%)',
    category: 'color',
    type: 'color',
    label: 'Brand Fokus',
    description: 'Fokus-Indikator für Barrierefreiheit'
  },

  // ===== STATE COLORS =====
  {
    name: '--state-button-primary-hover',
    value: 'hsl(from var(--color-brand-default) h s calc(l * 0.9))',
    category: 'color',
    type: 'color',
    label: 'Button Hover',
    description: 'Hover-Zustand für primäre Buttons'
  },
  {
    name: '--state-button-primary-active',
    value: 'hsl(from var(--color-brand-default) h s calc(l * 0.85))',
    category: 'color',
    type: 'color',
    label: 'Button Aktiv',
    description: 'Aktiver/Gedrückter Zustand für primäre Buttons'
  },

  // ===== SHADOWS =====
  {
    name: '--color-box-shadow',
    value: 'hsl(0deg 0% 0% / 25%)',
    category: 'shadow',
    type: 'shadow',
    label: 'Box Shadow',
    description: 'Standard Schattenfarbe'
  },

  // ===== BORDER RADIUS =====
  {
    name: '--border-radius-small',
    value: '4px',
    category: 'border',
    type: 'radius',
    label: 'Klein',
    description: 'Kleine Rundungen für Buttons und Inputs'
  },
  {
    name: '--border-radius-medium',
    value: '8px',
    category: 'border',
    type: 'radius',
    label: 'Mittel',
    description: 'Standard Rundung für Cards und Container'
  },
  {
    name: '--border-radius-round',
    value: '50%',
    category: 'border',
    type: 'radius',
    label: 'Rund',
    description: 'Vollständig runde Elemente (Avatare, Icons)'
  },

  // ===== Z-INDEX LAYERS =====
  {
    name: '--layer-1',
    value: '1',
    category: 'layer',
    type: 'layer',
    numericValue: '1',
    label: 'Ebene 1',
    description: 'Basis-Ebene für leicht erhöhte Elemente'
  },
  {
    name: '--layer-2',
    value: '2',
    category: 'layer',
    type: 'layer',
    numericValue: '2',
    label: 'Ebene 2',
    description: 'Dropdowns, Tooltips'
  },
  {
    name: '--layer-3',
    value: '3',
    category: 'layer',
    type: 'layer',
    numericValue: '3',
    label: 'Ebene 3',
    description: 'Modale Overlays'
  },
  {
    name: '--layer-4',
    value: '4',
    category: 'layer',
    type: 'layer',
    numericValue: '4',
    label: 'Ebene 4',
    description: 'Wichtige Modals'
  },
  {
    name: '--layer-5',
    value: '5',
    category: 'layer',
    type: 'layer',
    numericValue: '5',
    label: 'Ebene 5',
    description: 'Kritische UI-Elemente'
  },
  {
    name: '--layer-important',
    value: '2147483647',
    category: 'layer',
    type: 'layer',
    numericValue: '2147483647',
    label: 'Wichtigste Ebene',
    description: 'Maximale Ebene für Toast-Nachrichten'
  },

  // ===== TYPOGRAPHY =====
  {
    name: '--font-size-normal',
    value: '0.813rem',
    category: 'font',
    type: 'font',
    label: 'Normal',
    description: 'Standard Schriftgröße (13px bei 16px Basis)'
  },
  {
    name: '--font-weight-normal',
    value: '400',
    category: 'font',
    type: 'font',
    label: 'Normal',
    description: 'Normale Schriftstärke'
  },
  {
    name: '--font-weight-bold',
    value: '700',
    category: 'font',
    type: 'font',
    label: 'Fett',
    description: 'Fette Schriftstärke für Überschriften'
  },

  // ===== SPACING & SIZES =====
  {
    name: '--sp-button-min-width',
    value: '180px',
    category: 'spacing',
    type: 'size',
    label: 'Button Min-Breite',
    description: 'Minimale Breite für Buttons'
  },
  {
    name: '--sp-button-max-width',
    value: '100%',
    category: 'spacing',
    type: 'size',
    label: 'Button Max-Breite',
    description: 'Maximale Breite für Buttons'
  }
];

/**
 * Token categories for filtering
 * @constant
 */
export const TOKEN_CATEGORIES = {
  ALL: '',
  COLOR: 'color',
  BORDER: 'border',
  LAYER: 'layer',
  FONT: 'font',
  SPACING: 'spacing',
  SHADOW: 'shadow'
} as const;

/**
 * Visual types for token preview
 * @constant
 */
export const VISUAL_TYPES = {
  COLOR: 'color',
  RADIUS: 'radius',
  SHADOW: 'shadow',
  TEXT: 'text',
  SPACING: 'spacing'
} as const;

/**
 * Animation durations
 * @constant
 */
export const ANIMATION_DURATIONS = {
  /** Duration for copy feedback */
  COPY_FEEDBACK: 2000,
  /** Duration for transitions */
  TRANSITION: 200
} as const;

/**
 * Keyboard keys
 * @constant
 */
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' '
} as const;

/**
 * Error messages
 * @constant
 */
export const ERROR_MESSAGES = {
  COPY_FAILED: 'Fehler beim Kopieren',
  CLIPBOARD_NOT_SUPPORTED: 'Clipboard API wird nicht unterstützt'
} as const;