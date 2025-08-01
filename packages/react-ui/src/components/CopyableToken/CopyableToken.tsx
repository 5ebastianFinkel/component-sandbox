/**
 * @fileoverview CopyableToken component for displaying and copying design tokens
 * @module CopyableToken
 */

import React, { memo } from 'react';
import { Tooltip } from 'radix-ui';
import type { CopyableTokenProps } from '../shared/types';
import { formatTokenForDisplay } from '../shared/utils';
import { useCopyToClipboard } from '../shared/hooks';
import styles from './CopyableToken.module.css';

/**
 * Icon component for copy action
 * @internal
 */
const CopyIcon: React.FC = memo(() => (
  <svg
    className={styles.icon}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M10.5 1.5H3.5A1.5 1.5 0 002 3v8.5a.5.5 0 001 0V3a.5.5 0 01.5-.5h7a.5.5 0 010 1z"/>
    <path d="M5 4.5A1.5 1.5 0 016.5 3h7A1.5 1.5 0 0115 4.5v9a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 015 13.5v-9zm1.5-.5a.5.5 0 00-.5.5v9a.5.5 0 00.5.5h7a.5.5 0 00.5-.5v-9a.5.5 0 00-.5-.5h-7z"/>
  </svg>
));

CopyIcon.displayName = 'CopyIcon';

/**
 * Icon component for successful copy
 * @internal
 */
const CheckIcon: React.FC = memo(() => (
  <svg
    className={`${styles.icon} ${styles.iconSuccess}`}
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
 * CopyableToken Component
 * 
 * A clickable token display that copies its value to clipboard on click.
 * Provides visual feedback when the token is successfully copied.
 * 
 * @component
 * @example
 * ```tsx
 * // Basic usage
 * <CopyableToken token="--color-brand-default" />
 * 
 * // Without var() wrapper
 * <CopyableToken token="--color-brand-default" showVar={false} />
 * ```
 * 
 * @param {CopyableTokenProps} props - Component props
 * @returns {React.ReactElement} Rendered component
 */
export const CopyableToken: React.FC<CopyableTokenProps> = memo(({
  token,
  showVar = true
}) => {
  const { copyToken, isCopied } = useCopyToClipboard();
  
  const displayValue = formatTokenForDisplay(token, showVar);
  const copied = isCopied(token);
  
  /**
   * Handles the copy action
   */
  const handleCopy = () => {
    copyToken(token, showVar);
  };

  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            className={styles.copyableToken}
            onClick={handleCopy}
            aria-label={`Token ${displayValue} kopieren`}
            aria-pressed={copied}
            type="button"
          >
            <code className={styles.code}>{displayValue}</code>
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className={styles.tooltipContent} sideOffset={5}>
            Klicken zum Kopieren
            <Tooltip.Arrow className={styles.tooltipArrow} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
});

CopyableToken.displayName = 'CopyableToken';
