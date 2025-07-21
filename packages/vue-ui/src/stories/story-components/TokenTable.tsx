/**
 * @fileoverview TokenTable component for displaying design tokens in a tabular format
 * @module TokenTable
 */

import React, { memo, useCallback } from 'react';
import type { TokenTableProps, Token } from './types';
import { DESIGN_TOKENS } from './constants';
import { 
  getTokenPreviewStyle, 
  filterTokens,
  formatTokenForDisplay
} from './utils';
import { useCopyToClipboard } from './hooks';
import { useToast } from './ToastProvider';
import styles from './TokenTable.module.css';

/**
 * TableHeader Component
 * 
 * Renders the table header with configurable columns
 * 
 * @internal
 * @param {Object} props - Component props
 * @param {boolean} props.showPreview - Whether to show preview column
 * @returns {React.ReactElement} Rendered header
 */
const TableHeader: React.FC<{ showPreview: boolean }> = memo(({ showPreview }) => (
  <thead>
    <tr>
      <th scope="col">Token</th>
      <th scope="col">Wert</th>
      {showPreview && <th scope="col">Vorschau</th>}
      <th scope="col">Beschreibung</th>
      <th scope="col">Verwendung</th>
    </tr>
  </thead>
));

TableHeader.displayName = 'TableHeader';

/**
 * TokenPreview Component
 * 
 * Renders a visual preview of the token based on its type
 * 
 * @internal
 * @param {Object} props - Component props
 * @param {Token} props.token - Token to preview
 * @returns {React.ReactElement} Rendered preview
 */
const TokenPreview: React.FC<{ token: Token }> = memo(({ token }) => {
  const previewStyle = getTokenPreviewStyle(token, token.type as any);
  
  return (
    <div style={previewStyle} className={styles.previewBox} aria-hidden="true">
      {token.type === 'text' && <span>Aa</span>}
    </div>
  );
});

TokenPreview.displayName = 'TokenPreview';

/**
 * TokenTableRow Component
 * 
 * Individual table row for a token with copy functionality
 * 
 * @internal
 * @param {Object} props - Component props
 * @param {Token} props.token - Token data
 * @param {boolean} props.showPreview - Whether to show preview
 * @param {boolean} props.showNumericValue - Whether to show numeric value
 * @param {boolean} props.isCopied - Whether token is copied
 * @param {Function} props.onCopy - Copy handler
 * @returns {React.ReactElement} Rendered row
 */
const TokenTableRow: React.FC<{
  token: Token;
  showPreview: boolean;
  showNumericValue: boolean;
  isCopied: boolean;
  onCopy: (tokenName: string) => void;
}> = memo(({ token, showPreview, showNumericValue, isCopied, onCopy }) => {
  const handleClick = () => onCopy(token.name);
  
  const displayValue = showNumericValue && token.numericValue 
    ? token.numericValue 
    : token.value;
  
  const usage = token.usage || formatTokenForDisplay(token.name);

  return (
    <tr>
      <td>
        <button
          className={styles.tokenButton}
          onClick={handleClick}
          title="Klicken zum Kopieren"
          aria-label={`Token ${token.name} kopieren`}
          aria-pressed={isCopied}
          type="button"
        >
          <code className={styles.name}>{token.name}</code>
        </button>
      </td>
      <td className={styles.value}>
        {displayValue}
      </td>
      {showPreview && (
        <td className={styles.preview}>
          <TokenPreview token={token} />
        </td>
      )}
      <td className={styles.description}>
        {token.description || '-'}
      </td>
      <td className={styles.usage}>
        <code>{usage}</code>
      </td>
    </tr>
  );
});

TokenTableRow.displayName = 'TokenTableRow';


/**
 * TokenTable Component
 * 
 * Displays design tokens in a structured table format with detailed information.
 * Supports filtering, visual previews, and copy-to-clipboard functionality.
 * 
 * @component
 * @example
 * ```tsx
 * // Basic usage with all tokens
 * <TokenTable />
 * 
 * // Filter by category without preview
 * <TokenTable 
 *   category="color" 
 *   showPreview={false} 
 * />
 * 
 * // Show numeric values for layer tokens
 * <TokenTable 
 *   category="layer" 
 *   showNumericValue={true} 
 * />
 * 
 * // Custom filter with pipe-separated values
 * <TokenTable 
 *   filter="brand|primary|hover" 
 * />
 * ```
 * 
 * @param {TokenTableProps} props - Component props
 * @returns {React.ReactElement} Rendered component
 */
export const TokenTable: React.FC<TokenTableProps> = memo(({
  category,
  filter,
  showPreview = true,
  showNumericValue = false
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
    showToast(`Token kopiert: ${formatTokenForDisplay(tokenName)}`);
  }, [copyToken, showToast]);

  if (filteredTokens.length === 0) {
    return (
      <div className={styles.tokenTable}>
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
    <div className={styles.tokenTable}>
      <table 
        className={styles.table}
        role="table"
        aria-label={`Token Tabelle mit ${filteredTokens.length} Einträgen`}
      >
        <TableHeader showPreview={showPreview} />
        <tbody>
          {filteredTokens.map((token) => (
            <TokenTableRow
              key={token.name}
              token={token}
              showPreview={showPreview}
              showNumericValue={showNumericValue}
              isCopied={isCopied(token.name)}
              onCopy={handleCopyToken}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
});

TokenTable.displayName = 'TokenTable';