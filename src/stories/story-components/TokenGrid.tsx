import React, { useState, useMemo } from 'react';
import styles from './TokenGrid.module.css';

interface Token {
  name: string;
  value: string;
  label?: string;
}

interface TokenGridProps {
  category: string;
  filter?: string;
  showValue?: boolean;
  visualType?: 'color' | 'radius' | 'shadow' | 'text' | 'spacing';
}

const allTokens: Token[] = [
  // Colors
  { name: '--color-white', value: 'hsl(0deg 0% 100%)', label: 'Weiß' },
  { name: '--surface-default', value: 'var(--color-white)', label: 'Standard Oberfläche' },
  { name: '--color-transparent', value: 'hsla(0deg, 0%, 0%, 0)', label: 'Transparent' },
  { name: '--color-black-primary', value: 'hsl(0deg 0% 0% / 86%)', label: 'Schwarz Primary' },
  { name: '--color-black-secondary', value: 'hsl(0deg 0% 0% / 62%)', label: 'Schwarz Secondary' },
  { name: '--color-black-disabled', value: 'hsl(0deg 0% 0% / 38%)', label: 'Schwarz Disabled' },
  { name: '--color-gray-100', value: 'hsl(0deg 0% 0% / 10%)', label: 'Grau 100' },
  { name: '--color-gray-200', value: 'hsl(0deg 0% 0% / 20%)', label: 'Grau 200' },

  // Brand Colors
  { name: '--color-brand-stage', value: 'hsl(214deg 100% 20%)', label: 'Stage Brand' },
  { name: '--color-brand-default', value: 'hsl(206deg 100% 35%)', label: 'Standard Brand' },
  { name: '--color-brand-default-lighten', value: 'hsl(206deg 70% 76%)', label: 'Brand Aufgehellt' },

  // Border Radius
  { name: '--border-radius-small', value: '4px', label: 'Klein' },
  { name: '--border-radius-medium', value: '8px', label: 'Mittel' },
  { name: '--border-radius-round', value: '50%', label: 'Rund' },

  // Shadows
  { name: '--color-box-shadow', value: 'hsl(0deg 0% 0% / 25%)', label: 'Box Shadow' },

  // Font
  { name: '--font-size-normal', value: '0.813rem', label: 'Normal' },
  { name: '--font-weight-normal', value: '400', label: 'Normal' },
  { name: '--font-weight-bold', value: '700', label: 'Fett' },
];

export const TokenGrid: React.FC<TokenGridProps> = ({
  category,
  filter,
  showValue = true,
  visualType = 'color'
}) => {
  const [copied, setCopied] = useState('');

  const filteredTokens = useMemo(() => {
    let tokens = allTokens;

    if (category) {
      tokens = tokens.filter(token => token.name.includes(category));
    }

    if (filter) {
      const filterTerms = filter.split('|');
      tokens = tokens.filter(token =>
        filterTerms.some(term => token.name.includes(term))
      );
    }

    return tokens;
  }, [category, filter]);

  const getTokenLabel = (token: Token): string => {
    return token.label || token.name.replace('--', '').replace(/-/g, ' ');
  };

  const getVisualStyle = (token: Token): React.CSSProperties => {
    switch (visualType) {
      case 'color':
        return {
          backgroundColor: token.value,
        };
      case 'radius':
        return {
          backgroundColor: 'hsl(206deg 100% 35%)',
          borderRadius: token.value,
        };
      case 'shadow':
        return {
          backgroundColor: 'white',
          boxShadow: `0 4px 8px ${token.value}`,
        };
      case 'spacing':
        return {
          width: token.value,
          backgroundColor: 'hsl(206deg 100% 35%)',
        };
      case 'text':
        if (token.name.includes('size')) {
          return { fontSize: token.value };
        } else if (token.name.includes('weight')) {
          return { fontWeight: token.value };
        }
        return {};
      default:
        return {};
    }
  };

  const getTextPreview = (token: Token): string => {
    if (token.name.includes('weight')) {
      return 'Aa';
    } else if (token.name.includes('size')) {
      return 'Text';
    }
    return token.value;
  };

  const copyToClipboard = async (tokenName: string) => {
    try {
      await navigator.clipboard.writeText(`var(${tokenName})`);
      setCopied(tokenName);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Fehler beim Kopieren:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, tokenName: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      copyToClipboard(tokenName);
    }
  };

  return (
    <div className={styles.tokenGrid}>
      {filteredTokens.map((token) => (
        <div
          key={token.name}
          className={styles.item}
          onClick={() => copyToClipboard(token.name)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => handleKeyDown(e, token.name)}
        >
          <div
            className={`${styles.visual} ${styles[`visual${visualType.charAt(0).toUpperCase() + visualType.slice(1)}`] || ''}`}
            style={getVisualStyle(token)}
          >
            {visualType === 'text' && (
              <span className={styles.textPreview}>
                {getTextPreview(token)}
              </span>
            )}
            {visualType === 'radius' && (
              <div className={styles.radiusPreview} />
            )}
            {visualType === 'shadow' && (
              <div className={styles.shadowPreview} />
            )}
          </div>

          <div className={styles.details}>
            <div className={styles.label}>{getTokenLabel(token)}</div>
            <code className={styles.name}>{token.name}</code>
            {showValue && (
              <div className={styles.value}>{token.value}</div>
            )}
          </div>

          {copied === token.name && (
            <div className={styles.copied}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
              </svg>
              Kopiert
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
