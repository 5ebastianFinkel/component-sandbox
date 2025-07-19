/**
 * Default configuration values for dropdown components
 */
export const DROPDOWN_DEFAULTS = {
  PLACEMENT: 'bottom-start',
  SIDE_OFFSET: 4,
  HOVER_OPEN_DELAY: 100,
  HOVER_CLOSE_DELAY: 300,
  MIN_WIDTH: 180,
  MAX_WIDTH: 320,
  MAX_HEIGHT: 400,
  Z_INDEX: 50,
  CLOSE_ON_SELECT: true,
  AVOID_COLLISIONS: true,
} as const

/**
 * Positioning constants
 */
export const POSITIONING = {
  VIEWPORT_PADDING: 8,
  FOCUS_RETURN_DELAY: 0,
} as const

/**
 * Animation timing constants
 */
export const ANIMATION = {
  DURATION: 200,
  EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
  TRANSFORM_OFFSET: 8,
  SCALE_CLOSED: 0.95,
  SCALE_OPEN: 1,
} as const

/**
 * Valid dropdown placements
 */
export const VALID_PLACEMENTS = [
  'top',
  'top-start',
  'top-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'left-start',
  'left-end',
  'right',
  'right-start',
  'right-end',
] as const

/**
 * CSS custom property names used by dropdown components
 */
export const CSS_VARIABLES = {
  // Layout
  MIN_WIDTH: '--dropdown-min-width',
  MAX_WIDTH: '--dropdown-max-width',
  MAX_HEIGHT: '--dropdown-max-height',
  Z_INDEX: '--dropdown-z-index',
  PADDING: '--dropdown-padding',
  
  // Colors
  BACKGROUND: '--dropdown-bg',
  BORDER: '--dropdown-border',
  
  // Effects
  BORDER_RADIUS: '--dropdown-border-radius',
  SHADOW: '--dropdown-shadow',
  BACKDROP_FILTER: '--dropdown-backdrop-filter',
  
  // Animation
  TRANSITION: '--dropdown-transition',
  TRANSFORM_CLOSED: '--dropdown-transform-closed',
  TRANSFORM_OPEN: '--dropdown-transform-open',
  
  // Scrollbar
  SCROLLBAR_WIDTH: '--dropdown-scrollbar-width',
  SCROLLBAR_TRACK: '--dropdown-scrollbar-track',
  SCROLLBAR_THUMB: '--dropdown-scrollbar-thumb',
  SCROLLBAR_THUMB_HOVER: '--dropdown-scrollbar-thumb-hover',
  SCROLLBAR_RADIUS: '--dropdown-scrollbar-radius',
} as const

/**
 * Keyboard key constants
 */
export const KEYS = {
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ENTER: 'Enter',
  SPACE: ' ',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
} as const

/**
 * ARIA attribute values
 */
export const ARIA = {
  ROLE_MENU: 'menu',
  ROLE_MENUITEM: 'menuitem',
  ROLE_SEPARATOR: 'separator',
  ROLE_PRESENTATION: 'presentation',
  ROLE_NONE: 'none',
  HASPOPUP_TRUE: 'true',
} as const