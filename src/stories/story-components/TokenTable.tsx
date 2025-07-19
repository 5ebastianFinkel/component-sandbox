import React, { useState, useMemo } from 'react';
import styles from './TokenTable.module.css';

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
    <div className={styles.tokenTable}>
      <table className={styles.table}>
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
                  className={styles.name}
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
              <td className={styles.value}>
                {showNumericValue && token.numericValue ? token.numericValue : token.value}
              </td>
              {showPreview && (
                <td className={styles.preview}>
                  <div style={getPreviewStyle(token)} className={styles.previewBox}>
                    {token.type === 'text' && <span>Aa</span>}
                  </div>
                </td>
              )}
              <td className={styles.description}>
                {token.description || '-'}
              </td>
              <td className={styles.usage}>
                <code>{token.usage || `var(${token.name})`}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {copied && (
        <div className={styles.toast}>
          Token kopiert: {copied}
        </div>
      )}
    </div>
  );
};
