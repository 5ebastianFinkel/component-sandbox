/**
 * @fileoverview Type definitions for design token components
 */

/**
 * Available token types in the design system
 */
export type TokenType = 'color' | 'size' | 'radius' | 'shadow' | 'text' | 'number' | 'spacing' | 'font' | 'layer' | 'button';

/**
 * Token categories for filtering and organization
 */
export type TokenCategory = 'color' | 'border' | 'layer' | 'font' | 'spacing' | 'shadow' | 'button';

/**
 * Visual representation types for token previews
 */
export type VisualType = 'color' | 'radius' | 'shadow' | 'text' | 'spacing';

/**
 * Base design token interface
 */
export interface Token {
  /** CSS custom property name (e.g., '--color-brand-default') */
  name: string;
  /** CSS value for the token */
  value: string;
  /** Category for grouping tokens */
  category: TokenCategory;
  /** Type of token for visual representation */
  type: TokenType;
  /** Human-readable label (optional) */
  label?: string;
  /** Numeric representation if applicable (e.g., for z-index values) */
  numericValue?: string;
  /** Usage example or context */
  usage?: string;
  /** Detailed description of the token's purpose */
  description?: string;
}

/**
 * Props for copyable token components
 */
export interface CopyableTokenProps {
  /** The token name to display and copy */
  token: string;
  /** Whether to wrap the token in var() syntax */
  showVar?: boolean;
}

/**
 * Props for token display components
 */
export interface TokenDisplayProps {
  /** Filter tokens by category */
  category?: string;
  /** Custom filter string (supports pipe-separated values) */
  filter?: string;
  /** Whether to show token values */
  showValue?: boolean;
  /** Visual representation type */
  visualType?: VisualType;
}

/**
 * Props for token grid components
 */
export interface TokenGridProps extends TokenDisplayProps {
  /** Visual representation type for previews */
  visualType?: VisualType;
}

/**
 * Props for token table components
 */
export interface TokenTableProps {
  /** Filter tokens by category */
  category?: string;
  /** Custom filter string (supports pipe-separated values) */
  filter?: string;
  /** Whether to show visual preview column */
  showPreview?: boolean;
  /** Whether to show numeric values instead of CSS values */
  showNumericValue?: boolean;
}

/**
 * Clipboard operation result
 */
export interface ClipboardResult {
  /** Whether the operation was successful */
  success: boolean;
  /** Error message if operation failed */
  error?: string;
}

/**
 * Filter parameters for token filtering
 */
export interface TokenFilter {
  /** Search term for token names or values */
  searchTerm?: string;
  /** Selected category filter */
  category?: TokenCategory | '';
  /** Custom filter string */
  filter?: string;
}