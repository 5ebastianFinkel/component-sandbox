/**
 * @fileoverview TokenGrid component for displaying design tokens in a grid layout
 * @module TokenGrid
 */

import React, { memo, useCallback } from 'react';
import type { TokenGridProps, Token, VisualType } from '../shared/types';
import { DESIGN_TOKENS } from '../shared/constants';
import { 
  getTokenPreviewStyle, 
  getTokenLabel, 
  getTokenPreviewText,
  filterTokens
} from '../shared/utils';
import { useCopyToClipboard } from '../shared/hooks';
import { useToast } from '../ToastProvider/ToastProvider';
import styles from './TokenGrid.module.css';

/**
 * CheckIcon Component
 * 
 * SVG icon for successful copy feedback
 * 
 * @internal
 * @returns {React.ReactElement} Rendered icon
 */
const CheckIcon: React.FC = memo(() => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 16 16" 
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
  </svg>
));

CheckIcon.displayName = 'CheckIcon';

/**
 * TokenGridItem Component
 * 
 * Individual token item with visual preview and copy functionality
 * 
 * @internal
 * @param {Object} props - Component props
 * @param {Token} props.token - Token data
 * @param {VisualType} props.visualType - Type of visual representation
 * @param {boolean} props.showValue - Whether to show token value
 * @param {boolean} props.isCopied - Whether token is copied
 * @param {Function} props.onCopy - Copy handler
 * @returns {React.ReactElement} Rendered component
 */
const TokenGridItem: React.FC<{
  token: Token;
  visualType: VisualType;
  showValue: boolean;
  isCopied: boolean;
  onCopy: (tokenName: string) => void;
}> = memo(({ token, visualType, showValue, isCopied, onCopy }) => {
  const visualStyle = getTokenPreviewStyle(token, visualType);
  const label = getTokenLabel(token);
  
  const handleClick = () => onCopy(token.name);
  
  /**
   * Renders the appropriate visual preview based on type
   */
  const renderVisualContent = () => {
    switch (visualType) {
      case 'text':
        return (
          <span className={styles.textPreview}>
            {getTokenPreviewText(token)}
          </span>
        );
      case 'radius':
        return <div className={styles.radiusPreview} />;
      case 'shadow':
        return <div className={styles.shadowPreview} />;
      default:
        return null;
    }
  };

  return (
    <button
      className={styles.item}
      onClick={handleClick}
      aria-label={`${label} Token: ${token.name}, Wert: ${token.value}. Klicken zum Kopieren`}
      aria-pressed={isCopied}
      type="button"
    >
      <div
        className={`${styles.visual} ${styles[`visual${visualType.charAt(0).toUpperCase() + visualType.slice(1)}`] || ''}`}
        style={visualStyle}
        aria-hidden="true"
      >
        {renderVisualContent()}
      </div>

      <div className={styles.details}>
        <div className={styles.label}>{label}</div>
        <code className={styles.name}>{token.name}</code>
        {showValue && (
          <div className={styles.value}>{token.value}</div>
        )}
      </div>

      {isCopied && (
        <div className={styles.copied} aria-live="polite">
          <CheckIcon />
          Kopiert
        </div>
      )}
    </button>
  );
});

TokenGridItem.displayName = 'TokenGridItem';

/**
 * TokenGrid Component
 * 
 * Displays design tokens in a responsive grid layout with visual previews.
 * Supports filtering by category and custom filters, with copy-to-clipboard functionality.
 * 
 * @component
 * @example
 * ```tsx
 * // Display color tokens
 * <TokenGrid category="color" visualType="color" />
 * 
 * // Display border radius tokens without values
 * <TokenGrid 
 *   category="border" 
 *   visualType="radius" 
 *   showValue={false} 
 * />
 * 
 * // Custom filter for specific tokens
 * <TokenGrid 
 *   filter="brand|primary" 
 *   visualType="color" 
 * />
 * ```
 * 
 * @param {TokenGridProps} props - Component props
 * @returns {React.ReactElement} Rendered component
 */
export const TokenGrid: React.FC<TokenGridProps> = memo(({
  category,
  filter,
  showValue = true,
  visualType = 'color'
}) => {
  const { copyToken, isCopied } = useCopyToClipboard();
  const { showToast } = useToast();
  
  /**
   * Get filtered tokens based on props
   */
  const filteredTokens = React.useMemo(() => {
    return filterTokens(DESIGN_TOKENS, {
      category,
      customFilter: filter
    });
  }, [category, filter]);
  
  /**
   * Handles token copy action
   */
  const handleCopyToken = useCallback((tokenName: string) => {
    copyToken(tokenName);
    showToast(`Token kopiert: ${tokenName}`);
  }, [copyToken, showToast]);

  if (filteredTokens.length === 0) {
    return (
      <div className={styles.tokenGrid}>
        <div className={styles.emptyState} role="status">
          <p>Keine Tokens gefunden.</p>
          {(category || filter) && (
            <p>Versuchen Sie andere Filter-Einstellungen.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={styles.tokenGrid} 
      role="list"
      aria-label={`Token Grid mit ${filteredTokens.length} Tokens`}
    >
      {filteredTokens.map((token) => (
        <TokenGridItem
          key={token.name}
          token={token}
          visualType={visualType}
          showValue={showValue}
          isCopied={isCopied(token.name)}
          onCopy={handleCopyToken}
        />
      ))}
    </div>
  );
});

TokenGrid.displayName = 'TokenGrid';