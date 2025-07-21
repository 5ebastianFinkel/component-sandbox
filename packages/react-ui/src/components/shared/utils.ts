/**
 * @fileoverview Utility functions for design token components
 */

import * as React from 'react';
import type { Token, VisualType, ClipboardResult } from './types';
import { ERROR_MESSAGES } from './constants';

/**
 * Copies text to clipboard with fallback support
 * @param {string} text - Text to copy to clipboard
 * @returns {Promise<ClipboardResult>} Result of the clipboard operation
 * @example
 * const result = await copyToClipboard('var(--color-brand-default)');
 * if (result.success) {
 *   console.log('Copied successfully');
 * }
 */
export async function copyToClipboard(text: string): Promise<ClipboardResult> {
  try {
    // Check if Clipboard API is available
    if (!navigator.clipboard) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return { success: true };
      } catch (error) {
        document.body.removeChild(textArea);
        return { 
          success: false, 
          error: ERROR_MESSAGES.CLIPBOARD_NOT_SUPPORTED 
        };
      }
    }
    
    // Modern clipboard API
    await navigator.clipboard.writeText(text);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : ERROR_MESSAGES.COPY_FAILED 
    };
  }
}

/**
 * Formats a token name for display with CSS var() syntax
 * @param {string} tokenName - The token name
 * @param {boolean} includeVar - Whether to wrap in var()
 * @returns {string} Formatted token string
 * @example
 * formatTokenForDisplay('--color-brand-default', true); // 'var(--color-brand-default)'
 * formatTokenForDisplay('--color-brand-default', false); // '--color-brand-default'
 */
export function formatTokenForDisplay(tokenName: string, includeVar: boolean = true): string {
  return includeVar ? `var(${tokenName})` : tokenName;
}

/**
 * Resolves CSS relative color syntax to actual color values for preview
 * @param {string} colorValue - The color value that might contain relative syntax
 * @returns {string} Resolved color value
 */
export function resolveRelativeColor(colorValue: string): string {
  // Handle CSS relative color syntax like "hsl(from var(--color-brand-default) h s l / 10%)"
  if (colorValue.includes('hsl(from var(--color-brand-default)')) {
    // const baseColor = 'hsl(206deg 100% 35%)'; // --color-brand-default value
    
    if (colorValue.includes('/ 10%)')) {
      return 'hsla(206, 100%, 35%, 0.1)';
    } else if (colorValue.includes('/ 5%)')) {
      return 'hsla(206, 100%, 35%, 0.05)';
    } else if (colorValue.includes('h 54% 55%')) {
      return 'hsl(206deg 54% 55%)';
    } else if (colorValue.includes('calc(l * 0.9)')) {
      return 'hsl(206deg 100% 31.5%)'; // 35% * 0.9
    } else if (colorValue.includes('calc(l * 0.85)')) {
      return 'hsl(206deg 100% 29.75%)'; // 35% * 0.85
    }
  }
  
  // Handle other CSS variables that might not be available
  if (colorValue.includes('var(--color-brand-default)') && !colorValue.includes('hsl(from')) {
    return 'hsl(206deg 100% 35%)';
  }
  
  if (colorValue.includes('var(--color-white)')) {
    return 'hsl(0deg 0% 100%)';
  }
  
  if (colorValue.includes('var(--color-brand-stage)')) {
    return 'hsl(214deg 100% 20%)';
  }
  
  // Return original value if no relative syntax found
  return colorValue;
}

/**
 * Maps token type to visual type for preview rendering
 * @param {Token} token - The token to map
 * @returns {VisualType} Visual type for preview
 */
export function getVisualTypeFromToken(token: Token): VisualType {
  switch (token.type) {
    case 'color':
      return 'color';
    case 'radius':
      return 'radius';
    case 'shadow':
      return 'shadow';
    case 'font':
      return 'text';
    case 'size':
    case 'spacing':
      return 'spacing';
    case 'layer':
      return 'text'; // Layer tokens show as text with z-index value
    default:
      return 'text';
  }
}

/**
 * Gets the preview style for a token based on its type
 * @param {Token} token - The token to get preview style for
 * @param {VisualType} visualType - The type of visual representation
 * @returns {React.CSSProperties} CSS properties for the preview
 * @example
 * const style = getTokenPreviewStyle(colorToken, 'color');
 * // Returns: { backgroundColor: 'hsl(206deg 100% 35%)' }
 */
export function getTokenPreviewStyle(
  token: Token, 
  visualType: VisualType
): React.CSSProperties {
  switch (visualType) {
    case 'color':
      return { 
        backgroundColor: resolveRelativeColor(token.value)
      };
      
    case 'radius':
      return {
        backgroundColor: 'var(--color-brand-default, hsl(206deg 100% 35%))',
        borderRadius: token.value,
        width: '60px',
        height: '60px'
      };
      
    case 'shadow':
      return {
        boxShadow: `0 4px 8px ${token.value}`,
        backgroundColor: 'white',
        width: '100%',
        height: '100%',
        minHeight: '60px'
      };
      
    case 'spacing':
      // Handle different spacing token types
      if (token.type === 'size' && token.value.includes('%')) {
        // Percentage values (like 100% for max-width)
        return {
          width: '100%',
          height: '20px',
          backgroundColor: 'var(--color-brand-default, hsl(206deg 100% 35%))',
          opacity: 0.7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          color: 'white',
          fontWeight: 'bold'
        };
      } else {
        // Pixel or rem values
        return {
          width: token.value,
          height: '20px',
          backgroundColor: 'var(--color-brand-default, hsl(206deg 100% 35%))',
          minWidth: '4px',
          maxWidth: '200px'
        };
      }
      
    case 'text':
      // Handle font tokens
      if (token.type === 'font') {
        if (token.name.includes('size')) {
          return { 
            fontSize: token.value,
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60px'
          };
        } else if (token.name.includes('weight')) {
          return { 
            fontWeight: token.value,
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60px'
          };
        }
      }
      
      // Handle layer tokens (z-index)
      if (token.type === 'layer') {
        return {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-gray-100, rgba(0, 0, 0, 0.05))',
          border: '1px solid var(--color-gray-200, rgba(0, 0, 0, 0.1))',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 'bold',
          color: 'var(--color-black-primary, rgba(0, 0, 0, 0.86))',
          height: '60px',
          fontFamily: 'monospace'
        };
      }
      
      return {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60px'
      };
      
    default:
      return {};
  }
}

/**
 * Gets the text content for text-based token previews
 * @param {Token} token - The token to get preview text for
 * @returns {string} Preview text
 * @example
 * getTokenPreviewText(fontWeightToken); // 'Aa'
 * getTokenPreviewText(fontSizeToken); // 'Text'
 * getTokenPreviewText(layerToken); // '5'
 */
export function getTokenPreviewText(token: Token): string {
  // Handle layer tokens (z-index)
  if (token.type === 'layer') {
    return token.value;
  }
  
  // Handle font tokens
  if (token.type === 'font') {
    if (token.name.includes('weight')) {
      return 'Aa';
    } else if (token.name.includes('size')) {
      return 'Text';
    }
  }
  
  // Handle spacing tokens with percentage
  if (token.type === 'size' && token.value.includes('%')) {
    return token.value;
  }
  
  return token.value;
}

/**
 * Filters tokens based on search criteria
 * @param {Token[]} tokens - Array of tokens to filter
 * @param {Object} filters - Filter criteria
 * @param {string} [filters.searchTerm] - Search term for name/value
 * @param {string} [filters.category] - Category filter
 * @param {string} [filters.customFilter] - Custom filter string (pipe-separated)
 * @returns {Token[]} Filtered tokens
 * @example
 * const filtered = filterTokens(allTokens, {
 *   searchTerm: 'brand',
 *   category: 'color'
 * });
 */
export function filterTokens(
  tokens: Token[],
  filters: {
    searchTerm?: string;
    category?: string;
    customFilter?: string;
  }
): Token[] {
  let filteredTokens = tokens;

  // Apply search term filter
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filteredTokens = filteredTokens.filter(token =>
      token.name.toLowerCase().includes(term) ||
      token.value.toLowerCase().includes(term) ||
      token.label?.toLowerCase().includes(term) ||
      token.description?.toLowerCase().includes(term)
    );
  }

  // Apply category filter
  if (filters.category) {
    filteredTokens = filteredTokens.filter(token => 
      token.category === filters.category
    );
  }

  // Apply custom filter (pipe-separated terms)
  if (filters.customFilter) {
    const filterTerms = filters.customFilter.split('|').map(term => term.trim());
    filteredTokens = filteredTokens.filter(token =>
      filterTerms.some(term => token.name.includes(term))
    );
  }

  return filteredTokens;
}

/**
 * Gets a human-readable label for a token
 * @param {Token} token - The token to get label for
 * @returns {string} Human-readable label
 * @example
 * getTokenLabel(token); // 'Brand Default' (from '--color-brand-default')
 */
export function getTokenLabel(token: Token): string {
  if (token.label) {
    return token.label;
  }
  
  // Generate label from token name
  return token.name
    .replace('--', '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}


/**
 * Debounces a function to limit execution frequency
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 * @example
 * const debouncedSearch = debounce(handleSearch, 300);
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Groups tokens by category
 * @param {Token[]} tokens - Array of tokens to group
 * @returns {Record<string, Token[]>} Tokens grouped by category
 * @example
 * const grouped = groupTokensByCategory(allTokens);
 * // { color: [...], border: [...], ... }
 */
export function groupTokensByCategory(tokens: Token[]): Record<string, Token[]> {
  return tokens.reduce((acc, token) => {
    if (!acc[token.category]) {
      acc[token.category] = [];
    }
    acc[token.category].push(token);
    return acc;
  }, {} as Record<string, Token[]>);
}

/**
 * Announces a message to screen readers
 * @param {string} message - Message to announce
 * @param {('polite' | 'assertive')} [priority='polite'] - Announcement priority
 * @example
 * announceToScreenReader('Token copied to clipboard');
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';
  
  announcement.textContent = message;
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}