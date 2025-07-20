/**
 * @fileoverview TokenDisplay component for showcasing design tokens with search and filtering
 * @module TokenDisplay
 */

import React, { memo, useCallback } from 'react';
import { Select } from 'radix-ui';
import type { Token, TokenCategory } from './types';
import { DESIGN_TOKENS, TOKEN_CATEGORIES, ERROR_MESSAGES } from './constants';
import { getTokenPreviewStyle } from './utils';
import { useCopyToClipboard, useTokenFilter } from './hooks';
import styles from './TokenDisplay.module.css';

/**
 * Category option type for select dropdown
 */
interface CategoryOption {
  value: string;
  label: string;
}

/**
 * Available category options for filtering
 */
const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: 'all', label: 'Alle Kategorien' },
  { value: TOKEN_CATEGORIES.COLOR, label: 'Farben' },
  { value: TOKEN_CATEGORIES.BORDER, label: 'Border' },
  { value: TOKEN_CATEGORIES.LAYER, label: 'Layer' },
  { value: TOKEN_CATEGORIES.FONT, label: 'Typografie' },
  { value: TOKEN_CATEGORIES.SPACING, label: 'Abstände' },
  { value: TOKEN_CATEGORIES.SHADOW, label: 'Schatten' }
];

/**
 * TokenItem Component
 * 
 * Individual token display with preview and copy functionality
 * 
 * @internal
 * @param {Object} props - Component props
 * @param {Token} props.token - Token to display
 * @param {boolean} props.isCopied - Whether token is currently copied
 * @param {Function} props.onCopy - Copy handler
 * @returns {React.ReactElement} Rendered component
 */
const TokenItem: React.FC<{
  token: Token;
  isCopied: boolean;
  onCopy: (tokenName: string) => void;
}> = memo(({ token, isCopied, onCopy }) => {
  const previewStyle = getTokenPreviewStyle(token, token.type as any);
  
  const handleClick = () => onCopy(token.name);

  return (
    <button
      className={styles.item}
      onClick={handleClick}
      aria-label={`Token ${token.name}, Wert: ${token.value}. Klicken zum Kopieren`}
      aria-pressed={isCopied}
      type="button"
    >
      <div
        className={styles.preview}
        style={previewStyle}
        aria-hidden="true"
      >
        {token.type === 'text' && <span>Aa</span>}
      </div>
      
      <div className={styles.info}>
        <code className={styles.name}>{token.name}</code>
        <span className={styles.value}>{token.value}</span>
      </div>
      
      {isCopied && (
        <div className={styles.copied} aria-live="polite">
          Kopiert!
        </div>
      )}
    </button>
  );
});

TokenItem.displayName = 'TokenItem';

/**
 * TokenDisplay Component
 * 
 * A comprehensive token display component with search, filtering, and copy functionality.
 * Displays all design tokens in a searchable grid layout with visual previews.
 * 
 * @component
 * @example
 * ```tsx
 * // Basic usage
 * <TokenDisplay />
 * ```
 * 
 * @returns {React.ReactElement} Rendered component
 */
export const TokenDisplay: React.FC = memo(() => {
  const { copyToken, isCopied, error } = useCopyToClipboard();
  const {
    filteredTokens,
    searchTerm,
    selectedCategory,
    setSearchTerm,
    setSelectedCategory,
    resultCount,
    totalCount
  } = useTokenFilter(DESIGN_TOKENS);

  /**
   * Handles token copy action
   */
  const handleCopyToken = useCallback((tokenName: string) => {
    copyToken(tokenName);
  }, [copyToken]);

  /**
   * Handles search input change
   */
  const handleSearchChange = useCallback((
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchTerm(event.target.value);
  }, [setSearchTerm]);


  return (
    <div className={styles.tokenDisplay}>
      {/* Search and Filter Controls */}
      <div className={styles.header}>
        <input
          value={searchTerm}
          onChange={handleSearchChange}
          type="text"
          placeholder="Token suchen..."
          className={styles.search}
          aria-label="Token suchen"
          aria-describedby="search-results"
        />
        
        <Select.Root value={selectedCategory || 'all'} onValueChange={(value) => setSelectedCategory(value === 'all' ? '' : value as TokenCategory)}>
          <Select.Trigger className={styles.filter} aria-label="Kategorie filtern">
            <Select.Value />
            <Select.Icon className={styles.selectIcon}>
              <svg width="10" height="5" viewBox="0 0 10 5" fill="currentColor">
                <path d="M0 0l5 5 5-5z" />
              </svg>
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal container={document.body}>
            <Select.Content className={styles.selectContent} style={{ zIndex: 2147483647 }}>
              <Select.Viewport className={styles.selectViewport}>
                {CATEGORY_OPTIONS.map(option => (
                  <Select.Item key={option.value} value={option.value} className={styles.selectItem}>
                    <Select.ItemText>{option.label}</Select.ItemText>
                    <Select.ItemIndicator className={styles.selectItemIndicator}>
                      <svg width="12" height="10" viewBox="0 0 12 10" fill="currentColor">
                        <path d="M1 5l3 3L11 1" stroke="currentColor" strokeWidth="2" fill="none" />
                      </svg>
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      {/* Search Results Info */}
      <div 
        id="search-results" 
        className={styles.resultInfo}
        aria-live="polite"
        aria-atomic="true"
      >
        {searchTerm || selectedCategory ? (
          <span>
            {resultCount} von {totalCount} Tokens gefunden
          </span>
        ) : null}
      </div>

      {/* Error Display */}
      {error && (
        <div 
          className={styles.error} 
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      )}

      {/* Token Grid */}
      <div className={styles.grid} role="list">
        {filteredTokens.length > 0 ? (
          filteredTokens.map((token) => (
            <TokenItem
              key={token.name}
              token={token}
              isCopied={isCopied(token.name)}
              onCopy={handleCopyToken}
            />
          ))
        ) : (
          <div className={styles.noResults} role="listitem">
            <p>Keine Tokens gefunden.</p>
            {searchTerm && (
              <p>Versuchen Sie eine andere Suchanfrage.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

TokenDisplay.displayName = 'TokenDisplay';