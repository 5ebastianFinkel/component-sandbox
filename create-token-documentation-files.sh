#!/bin/bash

# Script to create all token documentation files for Storybook
# This will create the directory structure and all necessary files

echo "Creating Storybook token documentation files..."

# Create directories
mkdir -p .storybook/components
mkdir -p src/stories

# Create TokenDisplay.tsx
cat > .storybook/components/TokenDisplay.tsx << 'EOF'
import React, { useState, useMemo, useEffect } from 'react';

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
    <div className="token-display">
      <div className="token-display__header">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          type="text"
          placeholder="Token suchen..."
          className="token-display__search"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="token-display__filter"
        >
          <option value="">Alle Kategorien</option>
          <option value="color">Farben</option>
          <option value="border">Border</option>
          <option value="layer">Layer</option>
          <option value="font">Typografie</option>
          <option value="spacing">Abstände</option>
        </select>
      </div>

      <div className="token-display__grid">
        {filteredTokens.map((token) => (
          <div
            key={token.name}
            className="token-display__item"
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
              className="token-display__preview"
              style={getPreviewStyle(token)}
            >
              {token.type === 'text' && <span>Aa</span>}
            </div>
            <div className="token-display__info">
              <code className="token-display__name">{token.name}</code>
              <span className="token-display__value">{token.value}</span>
            </div>
            {copied === token.name && (
              <div className="token-display__copied">Kopiert!</div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{\`
        .token-display {
          font-family: system-ui, -apple-system, sans-serif;
        }

        .token-display__header {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .token-display__search,
        .token-display__filter {
          padding: 0.5rem 1rem;
          border: 1px solid hsl(0deg 0% 0% / 20%);
          border-radius: 4px;
          font-size: 0.813rem;
          background: white;
        }

        .token-display__search:focus,
        .token-display__filter:focus {
          outline: 2px solid hsl(206deg 100% 35%);
          outline-offset: 2px;
        }

        .token-display__search {
          flex: 1;
        }

        .token-display__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }

        .token-display__item {
          position: relative;
          padding: 1rem;
          border: 1px solid hsl(0deg 0% 0% / 10%);
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .token-display__item:hover {
          border-color: hsl(206deg 100% 35%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px hsl(0deg 0% 0% / 25%);
        }

        .token-display__item:focus {
          outline: 2px solid hsl(206deg 100% 35%);
          outline-offset: 2px;
        }

        .token-display__preview {
          width: 100%;
          height: 60px;
          margin-bottom: 0.75rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .token-display__info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .token-display__name {
          font-size: 0.75rem;
          color: hsl(206deg 100% 35%);
          font-family: monospace;
        }

        .token-display__value {
          font-size: 0.688rem;
          color: hsl(0deg 0% 0% / 62%);
        }

        .token-display__copied {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: hsl(206deg 100% 35%);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          animation: fadeInOut 2s ease;
        }

        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-10px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
      \`}</style>
    </div>
  );
};
EOF

# Create TokenTable.tsx
cat > .storybook/components/TokenTable.tsx << 'EOF'
import React, { useState, useMemo } from 'react';

interface Token {
  name: string;
  value: string;
  numericValue?: string;
  type?: string;
  usage?: string;
  description?: string;
}

interface TokenTableProps {
  category?: string;
  filter?: string;
  showPreview?: boolean;
  showNumericValue?: boolean;
}

const allTokens: Token[] = [
  // Colors
  {
    name: '--color-white',
    value: 'hsl(0deg 0% 100%)',
    type: 'color',
    description: 'Basis Weiß für Hintergründe'
  },
  {
    name: '--surface-default',
    value: 'var(--color-white)',
    type: 'color',
    description: 'Standard Oberfläche, referenziert color-white'
  },
  {
    name: '--color-transparent',
    value: 'hsla(0deg, 0%, 0%, 0)',
    type: 'color',
    description: 'Vollständig transparent'
  },
  {
    name: '--color-black-primary',
    value: 'hsl(0deg 0% 0% / 86%)',
    type: 'color',
    description: 'Haupttextfarbe mit hohem Kontrast'
  },
  {
    name: '--color-black-secondary',
    value: 'hsl(0deg 0% 0% / 62%)',
    type: 'color',
    description: 'Sekundäre Textfarbe für weniger wichtige Inhalte'
  },
  {
    name: '--color-black-disabled',
    value: 'hsl(0deg 0% 0% / 38%)',
    type: 'color',
    description: 'Farbe für deaktivierte Elemente'
  },
  {
    name: '--color-gray-100',
    value: 'hsl(0deg 0% 0% / 10%)',
    type: 'color',
    description: 'Sehr helles Grau für Hintergründe'
  },
  {
    name: '--color-gray-200',
    value: 'hsl(0deg 0% 0% / 20%)',
    type: 'color',
    description: 'Helles Grau für Trennlinien'
  },

  // Brand Colors
  {
    name: '--color-brand-stage',
    value: 'hsl(214deg 100% 20%)',
    type: 'color',
    description: 'Dunkle Markenfarbe für Stage-Umgebungen'
  },
  {
    name: '--surface-stage',
    value: 'var(--color-brand-stage)',
    type: 'color',
    description: 'Stage Oberfläche, referenziert brand-stage'
  },
  {
    name: '--color-brand-default',
    value: 'hsl(206deg 100% 35%)',
    type: 'color',
    description: 'Primäre Markenfarbe für CTAs und wichtige UI-Elemente'
  },
  {
    name: '--color-brand-default-state-ripple',
    value: 'hsl(206deg 100% 35% / 10%)',
    type: 'color',
    description: 'Ripple-Effekt basierend auf Markenfarbe'
  },
  {
    name: '--color-brand-default-state-active',
    value: 'hsl(from var(--color-brand-default) h s l / 10%)',
    type: 'color',
    description: 'Aktiver Zustand mit Transparenz'
  },
  {
    name: '--color-brand-default-state-hover',
    value: 'hsl(from var(--color-brand-default) h s l / 5%)',
    type: 'color',
    description: 'Hover-Zustand mit leichter Transparenz'
  },
  {
    name: '--color-brand-default-state-focus-visible',
    value: 'hsl(from var(--color-brand-default) h 54% 55%)',
    type: 'color',
    description: 'Fokus-Indikator für Barrierefreiheit'
  },
  {
    name: '--color-brand-default-lighten',
    value: 'hsl(206deg 70% 76%)',
    type: 'color',
    description: 'Aufgehellte Variante der Markenfarbe'
  },

  // State Colors
  {
    name: '--state-button-primary-hover',
    value: 'hsl(from var(--color-brand-default) h s calc(l * 0.9))',
    type: 'color',
    description: 'Hover-Zustand für primäre Buttons'
  },
  {
    name: '--state-button-primary-active',
    value: 'hsl(from var(--color-brand-default) h s calc(l * 0.85))',
    type: 'color',
    description: 'Aktiver/Gedrückter Zustand für primäre Buttons'
  },

  // Shadows
  {
    name: '--color-box-shadow',
    value: 'hsl(0deg 0% 0% / 25%)',
    type: 'shadow',
    description: 'Standard Schattenfarbe'
  },

  // Border Radius
  {
    name: '--border-radius-small',
    value: '4px',
    type: 'radius',
    description: 'Kleine Rundungen für Buttons und Inputs'
  },
  {
    name: '--border-radius-medium',
    value: '8px',
    type: 'radius',
    description: 'Standard Rundung für Cards und Container'
  },
  {
    name: '--border-radius-round',
    value: '50%',
    type: 'radius',
    description: 'Vollständig runde Elemente (Avatare, Icons)'
  },

  // Z-Index Layers
  {
    name: '--layer-1',
    value: '1',
    type: 'layer',
    numericValue: '1',
    description: 'Basis-Ebene für leicht erhöhte Elemente'
  },
  {
    name: '--layer-2',
    value: '2',
    type: 'layer',
    numericValue: '2',
    description: 'Dropdowns, Tooltips'
  },
  {
    name: '--layer-3',
    value: '3',
    type: 'layer',
    numericValue: '3',
    description: 'Modale Overlays'
  },
  {
    name: '--layer-4',
    value: '4',
    type: 'layer',
    numericValue: '4',
    description: 'Wichtige Modals'
  },
  {
    name: '--layer-5',
    value: '5',
    type: 'layer',
    numericValue: '5',
    description: 'Kritische UI-Elemente'
  },
  {
    name: '--layer-important',
    value: '2147483647',
    type: 'layer',
    numericValue: '2147483647',
    description: 'Maximale Ebene für Toast-Nachrichten'
  },

  // Font Settings
  {
    name: '--font-size-normal',
    value: '0.813rem',
    type: 'font',
    description: 'Standard Schriftgröße (13px bei 16px Basis)'
  },
  {
    name: '--font-weight-normal',
    value: '400',
    type: 'font',
    description: 'Normale Schriftstärke'
  },
  {
    name: '--font-weight-bold',
    value: '700',
    type: 'font',
    description: 'Fette Schriftstärke für Überschriften'
  },

  // Button Sizes
  {
    name: '--sp-button-min-width',
    value: '180px',
    type: 'button',
    description: 'Minimale Breite für Buttons'
  },
  {
    name: '--sp-button-max-width',
    value: '100%',
    type: 'button',
    description: 'Maximale Breite für Buttons'
  },
];

export const TokenTable: React.FC<TokenTableProps> = ({
  category,
  filter,
  showPreview = true,
  showNumericValue = false
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

  const getPreviewStyle = (token: Token): React.CSSProperties => {
    switch (token.type) {
      case 'color':
        return {
          backgroundColor: token.value,
          width: '100%',
          height: '30px',
          borderRadius: '4px',
          border: '1px solid rgba(0,0,0,0.1)'
        };
      case 'radius':
        return {
          backgroundColor: 'hsl(206deg 100% 35%)',
          borderRadius: token.value,
          width: '40px',
          height: '40px'
        };
      case 'shadow':
        return {
          boxShadow: `0 2px 8px ${token.value}`,
          backgroundColor: 'white',
          width: '100%',
          height: '30px',
          borderRadius: '4px'
        };
      case 'font':
        if (token.name.includes('size')) {
          return {
            fontSize: token.value,
            lineHeight: '1.5'
          };
        } else if (token.name.includes('weight')) {
          return {
            fontWeight: token.value
          };
        }
        return {};
      default:
        return {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '30px'
        };
    }
  };

  const copyToClipboard = async (tokenName: string) => {
    try {
      await navigator.clipboard.writeText(`var(${tokenName})`);
      setCopied(`var(${tokenName})`);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Fehler beim Kopieren:', err);
    }
  };

  return (
    <div className="token-table">
      <table className="token-table__table">
        <thead>
          <tr>
            <th>Token</th>
            <th>Wert</th>
            {showPreview && <th>Vorschau</th>}
            <th>Beschreibung</th>
            <th>Verwendung</th>
          </tr>
        </thead>
        <tbody>
          {filteredTokens.map((token) => (
            <tr key={token.name}>
              <td>
                <code
                  className="token-table__name"
                  onClick={() => copyToClipboard(token.name)}
                  title="Klicken zum Kopieren"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      copyToClipboard(token.name);
                    }
                  }}
                >
                  {token.name}
                </code>
              </td>
              <td className="token-table__value">
                {showNumericValue && token.numericValue ? token.numericValue : token.value}
              </td>
              {showPreview && (
                <td className="token-table__preview">
                  <div style={getPreviewStyle(token)} className="token-table__preview-box">
                    {token.type === 'text' && <span>Aa</span>}
                  </div>
                </td>
              )}
              <td className="token-table__description">
                {token.description || '-'}
              </td>
              <td className="token-table__usage">
                <code>{token.usage || `var(${token.name})`}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {copied && (
        <div className="token-table__toast">
          Token kopiert: {copied}
        </div>
      )}

      <style jsx>{\`
        .token-table {
          position: relative;
          margin: 2rem 0;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .token-table__table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border: 1px solid hsl(0deg 0% 0% / 10%);
          border-radius: 8px;
          overflow: hidden;
        }

        .token-table__table th,
        .token-table__table td {
          padding: 0.75rem 1rem;
          text-align: left;
          border-bottom: 1px solid hsl(0deg 0% 0% / 10%);
        }

        .token-table__table th {
          background: hsl(0deg 0% 0% / 5%);
          font-weight: 700;
          font-size: 0.875rem;
          color: hsl(0deg 0% 0% / 86%);
        }

        .token-table__table tbody tr:last-child td {
          border-bottom: none;
        }

        .token-table__table tbody tr:hover {
          background: hsl(206deg 100% 35% / 5%);
        }

        .token-table__name {
          color: hsl(206deg 100% 35%);
          font-family: monospace;
          font-size: 0.875rem;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .token-table__name:hover {
          color: hsl(206deg 100% 28%);
          text-decoration: underline;
        }

        .token-table__name:focus {
          outline: 2px solid hsl(206deg 100% 35%);
          outline-offset: 2px;
          border-radius: 2px;
        }

        .token-table__value {
          font-size: 0.813rem;
          color: hsl(0deg 0% 0% / 62%);
          font-family: monospace;
        }

        .token-table__preview {
          width: 120px;
        }

        .token-table__preview-box {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 30px;
        }

        .token-table__description {
          font-size: 0.813rem;
          color: hsl(0deg 0% 0% / 62%);
        }

        .token-table__usage code {
          background: hsl(0deg 0% 0% / 5%);
          padding: 0.125rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          color: hsl(0deg 0% 0% / 86%);
        }

        .token-table__toast {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          background: hsl(206deg 100% 35%);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          box-shadow: 0 4px 12px hsl(0deg 0% 0% / 25%);
          font-size: 0.875rem;
          animation: slideIn 0.3s ease, slideOut 0.3s ease 1.7s;
          z-index: 2147483647;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      \`}</style>
    </div>
  );
};
EOF

# Create TokenGrid.tsx
cat > .storybook/components/TokenGrid.tsx << 'EOF'
import React, { useState, useMemo } from 'react';

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
    <div className="token-grid">
      {filteredTokens.map((token) => (
        <div
          key={token.name}
          className="token-grid__item"
          onClick={() => copyToClipboard(token.name)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => handleKeyDown(e, token.name)}
        >
          <div
            className={`token-grid__visual token-grid__visual--${visualType}`}
            style={getVisualStyle(token)}
          >
            {visualType === 'text' && (
              <span className="token-grid__text-preview">
                {getTextPreview(token)}
              </span>
            )}
            {visualType === 'radius' && (
              <div className="token-grid__radius-preview" />
            )}
            {visualType === 'shadow' && (
              <div className="token-grid__shadow-preview" />
            )}
          </div>

          <div className="token-grid__details">
            <div className="token-grid__label">{getTokenLabel(token)}</div>
            <code className="token-grid__name">{token.name}</code>
            {showValue && (
              <div className="token-grid__value">{token.value}</div>
            )}
          </div>

          {copied === token.name && (
            <div className="token-grid__copied">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
              </svg>
              Kopiert
            </div>
          )}
        </div>
      ))}

      <style jsx>{\`
        .token-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1.5rem;
          margin: 2rem 0;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .token-grid__item {
          position: relative;
          background: white;
          border: 1px solid hsl(0deg 0% 0% / 10%);
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .token-grid__item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px hsl(0deg 0% 0% / 25%);
          border-color: hsl(206deg 100% 35%);
        }

        .token-grid__item:focus {
          outline: 2px solid hsl(206deg 100% 35%);
          outline-offset: 2px;
        }

        .token-grid__item:hover .token-grid__name {
          color: hsl(206deg 100% 28%);
        }

        .token-grid__visual {
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .token-grid__visual--radius {
          background-color: transparent !important;
          padding: 1rem;
        }

        .token-grid__radius-preview {
          position: absolute;
          width: 60px;
          height: 60px;
          background-color: hsl(206deg 100% 35%);
          border-radius: inherit;
        }

        .token-grid__visual--shadow {
          padding: 1rem;
          background-color: hsl(0deg 0% 0% / 5%) !important;
        }

        .token-grid__shadow-preview {
          position: absolute;
          width: calc(100% - 2rem);
          height: calc(100% - 2rem);
          background-color: white;
          border-radius: 4px;
          box-shadow: inherit;
        }

        .token-grid__visual--spacing {
          height: 40px;
          min-width: 20px;
          max-width: 100%;
          margin: 20px auto;
        }

        .token-grid__visual--text {
          background-color: hsl(0deg 0% 0% / 5%);
        }

        .token-grid__text-preview {
          position: relative;
          z-index: 1;
          color: hsl(0deg 0% 0% / 86%);
        }

        .token-grid__details {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .token-grid__label {
          font-size: 0.875rem;
          font-weight: 700;
          color: hsl(0deg 0% 0% / 86%);
          margin-bottom: 0.25rem;
        }

        .token-grid__name {
          font-family: monospace;
          font-size: 0.75rem;
          color: hsl(206deg 100% 35%);
          word-break: break-all;
          transition: color 0.2s ease;
        }

        .token-grid__value {
          font-size: 0.75rem;
          color: hsl(0deg 0% 0% / 62%);
          font-family: monospace;
        }

        .token-grid__copied {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: hsl(206deg 100% 35%);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          animation: fadeInOut 2s ease;
        }

        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-10px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
      \`}</style>
    </div>
  );
};
EOF

# Create CopyableToken.tsx
cat > .storybook/components/CopyableToken.tsx << 'EOF'
import React, { useState } from 'react';

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
      className="copyable-token"
      onClick={copyToClipboard}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      title="Klicken zum Kopieren"
    >
      <code className="copyable-token__code">{displayValue}</code>

      {!copied ? (
        <svg
          className="copyable-token__icon"
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
          className="copyable-token__icon copyable-token__icon--success"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
        </svg>
      )}

      <style jsx>{\`
        .copyable-token {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.125rem 0.5rem;
          background: hsl(0deg 0% 0% / 5%);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          vertical-align: middle;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .copyable-token:hover {
          background: hsl(206deg 100% 35% / 10%);
          color: hsl(206deg 100% 35%);
        }

        .copyable-token:focus {
          outline: 2px solid hsl(206deg 100% 35%);
          outline-offset: 2px;
        }

        .copyable-token__code {
          font-size: 0.875em;
          font-family: monospace;
        }

        .copyable-token__icon {
          opacity: 0.6;
          transition: opacity 0.2s ease;
        }

        .copyable-token__icon--success {
          color: hsl(206deg 100% 35%);
          opacity: 1;
        }

        .copyable-token:hover .copyable-token__icon {
          opacity: 1;
        }
      \`}</style>
    </span>
  );
};
EOF

# Create example MDX files
cat > src/stories/Tokens.mdx << 'EOF'
import { Meta, ColorPalette, ColorItem, Typeset, Source } from '@storybook/blocks';
import { TokenDisplay } from '../../.storybook/components/TokenDisplay';
import { TokenTable } from '../../.storybook/components/TokenTable';
import { TokenGrid } from '../../.storybook/components/TokenGrid';
import { CopyableToken } from '../../.storybook/components/CopyableToken';

<Meta title="Design System/Tokens" />

# Design System Tokens

Unsere Design Tokens bilden die Grundlage für ein konsistentes visuelles Erscheinungsbild über alle Komponenten hinweg.
Diese Tokens sind als CSS Custom Properties implementiert und können direkt in Ihren Styles verwendet werden.

## Verwendung

Die Tokens können auf zwei Arten genutzt werden:

### In CSS/SCSS
```css
.my-component {
  background-color: var(--color-brand-default);
  border-radius: var(--border-radius-medium);
  padding: var(--spacing-sm) var(--spacing-lg);
}
```

### In Vue-Komponenten
```vue
<style lang="scss">
.sp-card {
  background: var(--surface-default);
  box-shadow: 0 2px 4px var(--color-box-shadow);

  &--stage {
    background: var(--surface-stage);
  }
}
</style>
```

## Farben

### Basis-Farben

<TokenGrid category="color" filter="color-white|color-black|color-gray" />

### Brand-Farben

<ColorPalette>
  <ColorItem
    title="Brand Default"
    subtitle="Primäre Markenfarbe"
    colors={{
      'Default': 'hsl(206deg 100% 35%)',
      'Hover': 'hsl(206deg 100% 31.5%)',
      'Active': 'hsl(206deg 100% 29.75%)',
      'Lighten': 'hsl(206deg 70% 76%)'
    }}
  />
  <ColorItem
    title="Brand Stage"
    subtitle="Stage-Umgebung Farbe"
    colors={{
      'Stage': 'hsl(214deg 100% 20%)'
    }}
  />
</ColorPalette>

<TokenTable category="brand" />

### Zustands-Farben

<TokenTable category="state" />

## Abstände und Größen

### Border Radius

<TokenGrid category="border-radius" showValue visualType="radius" />

### Button-Größen

<TokenTable category="button" />

## Layering (Z-Index)

<TokenTable category="layer" showNumericValue />

## Typografie

<TokenTable category="font" />

## Interaktive Token-Übersicht

Nutzen Sie die Suchfunktion, um schnell das benötigte Token zu finden:

<TokenDisplay />

## Integration in Ihre Anwendung

### Import über NPM

```javascript
// In Ihrer main.js oder App.vue
import '@egp/ui/dist/tokens.css';
```

### Überschreiben von Tokens

Sie können die Standard-Tokens in Ihrer Anwendung überschreiben:

```css
:root {
  /* Überschreiben Sie die Markenfarbe */
  --brand-default-hue: 120deg; /* Grün statt Blau */
  --color-brand-default: hsl(var(--brand-default-hue) 100% 35%);
}
```

## Best Practices

1. **Verwenden Sie semantische Tokens**: Nutzen Sie `--color-brand-default` anstatt direkte Farbwerte
2. **Konsistenz**: Verwenden Sie immer die definierten Tokens für Abstände, Farben und Radien
3. **Keine Magic Numbers**: Ersetzen Sie hartcodierte Werte durch Token-Referenzen
4. **Dokumentation**: Kommentieren Sie, warum Sie bestimmte Tokens in speziellen Kontexten verwenden
EOF

cat > src/stories/TokensBuiltIn.mdx << 'EOF'
import { Meta, ColorPalette, ColorItem, Typeset, Source, Unstyled } from '@storybook/blocks';

<Meta title="Design System/Tokens (Built-in Components)" />

# Design System Tokens mit Storybook Components

Diese Seite demonstriert die Verwendung von Storybooks eingebauten Komponenten zur Dokumentation von Design Tokens.

## Farben mit ColorPalette und ColorItem

### ColorPalette für Farbgruppen

<ColorPalette>
  <ColorItem
    title="Basis Farben"
    subtitle="Grundlegende Schwarz/Weiß/Grau Palette"
    colors={{
      'Weiß': 'hsl(0deg 0% 100%)',
      'Transparent': 'hsla(0deg, 0%, 0%, 0)',
      'Schwarz Primary': 'hsl(0deg 0% 0% / 86%)',
      'Schwarz Secondary': 'hsl(0deg 0% 0% / 62%)',
      'Schwarz Disabled': 'hsl(0deg 0% 0% / 38%)',
      'Grau 100': 'hsl(0deg 0% 0% / 10%)',
      'Grau 200': 'hsl(0deg 0% 0% / 20%)',
    }}
  />

  <ColorItem
    title="Brand Farben"
    subtitle="Primäre Markenfarben"
    colors={{
      'Brand Default': 'hsl(206deg 100% 35%)',
      'Brand Hover': 'hsl(206deg 100% 31.5%)',
      'Brand Active': 'hsl(206deg 100% 29.75%)',
      'Brand Light': 'hsl(206deg 70% 76%)',
      'Brand Stage': 'hsl(214deg 100% 20%)',
    }}
  />
</ColorPalette>

## Typografie mit Typeset

### Schriftgrößen

<Typeset
  fontFamily="system-ui, -apple-system, sans-serif"
  fontSizes={[
    '0.813rem',
    '1rem',
    '1.25rem',
    '1.5rem',
  ]}
  sampleText="Die schnelle braune Füchsin springt über den faulen Hund"
/>

## Code-Beispiele mit Source

### CSS Verwendung

<Source
  language="css"
  dark
  code={`
/* Farben verwenden */
.sp-button {
  background-color: var(--color-brand-default);
  color: var(--color-white);
  border-radius: var(--border-radius-medium);
}

/* Hover-Zustand */
.sp-button:hover {
  background-color: var(--state-button-primary-hover);
}
`} />
EOF

# Create npm package export files
mkdir -p dist

cat > dist/tokens.css << 'EOF'
@layer tokens {
  @property --brand-default-hue {
    syntax: '<angle>';
    initial-value: 206deg;
    inherits: true;
  }

  :root {
    /* base colors */
    --color-white: hsl(0deg 0% 100%);
    --surface-default: var(--color-white);
    --color-transparent: hsla(0deg, 0%, 0%, 0);
    --color-black-primary: hsl(0deg 0% 0% / 86%);
    --color-black-secondary: hsl(0deg 0% 0% / 62%);
    --color-black-disabled: hsl(0deg 0% 0% / 38%);
    --color-gray-100: hsl(0deg 0% 0% / 10%);
    --color-gray-200: hsl(0deg 0% 0% / 20%);
    --color-black-state-active-ripple: hsl(0deg 0% 100% / 10%);

    /* brand colors */
    --color-brand-stage: hsl(214deg 100% 20%);
    --surface-stage: var(--color-brand-stage);
    --color-brand-default: hsl(206deg 100% 35%);
    --color-brand-default-state-ripple: hsl(var(--brand-default-hue) 100% 35% / 10%);
    --color-brand-default-state-active: hsl(from var(--color-brand-default) h s l / 10%);
    --color-brand-default-state-hover: hsl(from var(--color-brand-default) h s l / 5%);
    --color-brand-default-state-focus-visible: hsl(from var(--color-brand-default) h 54% 55%);
    --color-brand-default-lighten: hsl(206deg 70% 76%);
    --state-button-primary-hover: hsl(from var(--color-brand-default) h s calc(l * 0.9));
    --state-button-primary-active: hsl(from var(--color-brand-default) h s calc(l * 0.85));

    /* shadows */
    --color-box-shadow: hsl(0deg 0% 0% / 25%);

    /* radii */
    --border-radius-small: 4px;
    --border-radius-medium: 8px;
    --border-radius-round: 50%;

    /* z-index layer */
    --layer-1: 1;
    --layer-2: 2;
    --layer-3: 3;
    --layer-4: 4;
    --layer-5: 5;
    --layer-important: 2147483647;

    /* Font settings */
    --font-size-normal: 0.813rem;
    --font-weight-normal: 400;
    --font-weight-bold: 700;

    /* Other variables */
    --sp-button-min-width: 180px;
    --sp-button-max-width: 100%;
  }
}
EOF

cat > dist/tokens.js << 'EOF'
export const tokens = {
  "color": {
    "--color-white": {
      "cssVariable": "--color-white",
      "value": "hsl(0deg 0% 100%)",
      "type": "color"
    },
    "--color-black-primary": {
      "cssVariable": "--color-black-primary",
      "value": "hsl(0deg 0% 0% / 86%)",
      "type": "color"
    },
    "--color-brand-default": {
      "cssVariable": "--color-brand-default",
      "value": "hsl(206deg 100% 35%)",
      "type": "color"
    }
  },
  "border": {
    "--border-radius-small": {
      "cssVariable": "--border-radius-small",
      "value": "4px",
      "type": "dimension"
    },
    "--border-radius-medium": {
      "cssVariable": "--border-radius-medium",
      "value": "8px",
      "type": "dimension"
    }
  }
};

export function getCSSVariable(tokenName) {
  return `var(--${tokenName})`;
}
EOF

cat > dist/tokens.d.ts << 'EOF'
export interface TokenValue {
  cssVariable: string;
  value: string;
  type: 'color' | 'dimension' | 'number' | 'font-size' | 'font-weight' | 'other';
}

export interface Tokens {
  [category: string]: {
    [token: string]: TokenValue;
  };
}

export declare const tokens: Tokens;
export declare function getCSSVariable(tokenName: string): string;
EOF

echo "✅ All files created successfully!"
echo ""
echo "Directory structure:"
echo "  .storybook/components/ - React components for token documentation"
echo "  src/stories/ - Example MDX documentation files"
echo "  dist/ - Token export files for npm package"
echo ""
echo "Next steps:"
echo "1. Run this script in your project root: bash create-token-documentation-files.sh"
echo "2. Import the components in your MDX files"
echo "3. Update package.json with the exports configuration"
echo "4. Customize the token arrays in the components with your actual values"