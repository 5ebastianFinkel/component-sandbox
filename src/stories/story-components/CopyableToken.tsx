import React, { useState } from 'react';
import styles from './CopyableToken.module.css';

interface CopyableTokenProps {
  token: string;
  showVar?: boolean;
}

export const CopyableToken: React.FC<CopyableTokenProps> = ({
  token,
  showVar = true
}) => {
  const [copied, setCopied] = useState(false);

  const displayValue = showVar ? `var(${token})` : token;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(displayValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Fehler beim Kopieren:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      copyToClipboard();
    }
  };

  return (
    <span
      className={styles.copyableToken}
      onClick={copyToClipboard}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      title="Klicken zum Kopieren"
    >
      <code className={styles.code}>{displayValue}</code>

      {!copied ? (
        <svg
          className={styles.icon}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M10.5 1.5H3.5A1.5 1.5 0 002 3v8.5a.5.5 0 001 0V3a.5.5 0 01.5-.5h7a.5.5 0 010 1z"/>
          <path d="M5 4.5A1.5 1.5 0 016.5 3h7A1.5 1.5 0 0115 4.5v9a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 015 13.5v-9zm1.5-.5a.5.5 0 00-.5.5v9a.5.5 0 00.5.5h7a.5.5 0 00.5-.5v-9a.5.5 0 00-.5-.5h-7z"/>
        </svg>
      ) : (
        <svg
          className={`${styles.icon} ${styles.iconSuccess}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
        </svg>
      )}
    </span>
  );
};
