import React, { useState, useMemo, useEffect } from 'react';
import styles from './TokenDisplay.module.css';

interface Token {
  name: string;
  value: string;
  category: string;
  type: 'color' | 'size' | 'radius' | 'shadow' | 'text' | 'number';
}

// Definierte Tokens aus Ihrem Design System
const definedTokens: Token[] = [
  // Colors
  { name: '--color-white', value: 'hsl(0deg 0% 100%)', category: 'color', type: 'color' },
  { name: '--surface-default', value: 'var(--color-white)', category: 'color', type: 'color' },
  { name: '--color-transparent', value: 'hsla(0deg, 0%, 0%, 0)', category: 'color', type: 'color' },
  { name: '--color-black-primary', value: 'hsl(0deg 0% 0% / 86%)', category: 'color', type: 'color' },
  { name: '--color-black-secondary', value: 'hsl(0deg 0% 0% / 62%)', category: 'color', type: 'color' },
  { name: '--color-black-disabled', value: 'hsl(0deg 0% 0% / 38%)', category: 'color', type: 'color' },
  { name: '--color-gray-100', value: 'hsl(0deg 0% 0% / 10%)', category: 'color', type: 'color' },
  { name: '--color-gray-200', value: 'hsl(0deg 0% 0% / 20%)', category: 'color', type: 'color' },
  { name: '--color-black-state-active-ripple', value: 'hsl(0deg 0% 100% / 10%)', category: 'color', type: 'color' },
  { name: '--color-brand-stage', value: 'hsl(214deg 100% 20%)', category: 'color', type: 'color' },
  { name: '--surface-stage', value: 'var(--color-brand-stage)', category: 'color', type: 'color' },
  { name: '--color-brand-default', value: 'hsl(206deg 100% 35%)', category: 'color', type: 'color' },
  { name: '--color-brand-default-lighten', value: 'hsl(206deg 70% 76%)', category: 'color', type: 'color' },
  { name: '--color-box-shadow', value: 'hsl(0deg 0% 0% / 25%)', category: 'shadow', type: 'shadow' },

  // Border Radius
  { name: '--border-radius-small', value: '4px', category: 'border', type: 'radius' },
  { name: '--border-radius-medium', value: '8px', category: 'border', type: 'radius' },
  { name: '--border-radius-round', value: '50%', category: 'border', type: 'radius' },

  // Layers
  { name: '--layer-1', value: '1', category: 'layer', type: 'number' },
  { name: '--layer-2', value: '2', category: 'layer', type: 'number' },
  { name: '--layer-3', value: '3', category: 'layer', type: 'number' },
  { name: '--layer-4', value: '4', category: 'layer', type: 'number' },
  { name: '--layer-5', value: '5', category: 'layer', type: 'number' },
  { name: '--layer-important', value: '2147483647', category: 'layer', type: 'number' },

  // Font
  { name: '--font-size-normal', value: '0.813rem', category: 'font', type: 'size' },
  { name: '--font-weight-normal', value: '400', category: 'font', type: 'text' },
  { name: '--font-weight-bold', value: '700', category: 'font', type: 'text' },

  // Sizes
  { name: '--sp-button-min-width', value: '180px', category: 'spacing', type: 'size' },
  { name: '--sp-button-max-width', value: '100%', category: 'spacing', type: 'size' },
];

export const TokenDisplay: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [copied, setCopied] = useState('');

  const filteredTokens = useMemo(() => {
    return definedTokens.filter(token => {
      const matchesSearch =
        token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.value.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        !selectedCategory || token.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const getPreviewStyle = (token: Token): React.CSSProperties => {
    switch (token.type) {
      case 'color':
        return { backgroundColor: token.value };
      case 'radius':
        return {
          backgroundColor: 'var(--color-brand-default)',
          borderRadius: token.value,
          width: '60px',
          height: '60px'
        };
      case 'shadow':
        return {
          boxShadow: `0 2px 8px ${token.value}`,
          backgroundColor: 'white'
        };
      case 'size':
        return {
          fontSize: token.value,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        };
      default:
        return {};
    }
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

  return (
    <div className={styles.tokenDisplay}>
      <div className={styles.header}>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          type="text"
          placeholder="Token suchen..."
          className={styles.search}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={styles.filter}
        >
          <option value="">Alle Kategorien</option>
          <option value="color">Farben</option>
          <option value="border">Border</option>
          <option value="layer">Layer</option>
          <option value="font">Typografie</option>
          <option value="spacing">Abstände</option>
        </select>
      </div>

      <div className={styles.grid}>
        {filteredTokens.map((token) => (
          <div
            key={token.name}
            className={styles.item}
            onClick={() => copyToClipboard(token.name)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                copyToClipboard(token.name);
              }
            }}
          >
            <div
              className={styles.preview}
              style={getPreviewStyle(token)}
            >
              {token.type === 'text' && <span>Aa</span>}
            </div>
            <div className={styles.info}>
              <code className={styles.name}>{token.name}</code>
              <span className={styles.value}>{token.value}</span>
            </div>
            {copied === token.name && (
              <div className={styles.copied}>Kopiert!</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
