import React from 'react';
import { SearchHistoryItem } from '../../utils/searchHistory';
import { SearchShortcut } from '../../utils/searchShortcuts';
import styles from './RecentSearches.module.css';

interface RecentSearchesProps {
  recentSearches: SearchHistoryItem[];
  shortcuts: SearchShortcut[];
  onSelectQuery: (query: string) => void;
  onSelectShortcut: (shortcut: SearchShortcut) => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  recentSearches,
  shortcuts,
  onSelectQuery,
  onSelectShortcut
}) => {
  return (
    <div className={styles.container}>
      {recentSearches.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Recent Searches</div>
          <div className={styles.items}>
            {recentSearches.map((item, index) => (
              <button
                key={`${item.query}-${index}`}
                className={styles.recentItem}
                onClick={() => onSelectQuery(item.query)}
              >
                <div className={styles.recentIcon}>🕒</div>
                <div className={styles.recentContent}>
                  <div className={styles.recentQuery}>{item.query}</div>
                  {item.resultCount && (
                    <div className={styles.recentMeta}>
                      {item.resultCount} result{item.resultCount !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <div className={styles.recentTime}>
                  {formatRelativeTime(item.timestamp)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Search Shortcuts</div>
        <div className={styles.items}>
          {shortcuts.slice(0, 6).map((shortcut) => (
            <button
              key={shortcut.prefix}
              className={styles.shortcutItem}
              onClick={() => onSelectShortcut(shortcut)}
            >
              <div className={styles.shortcutIcon}>{shortcut.icon || '🔍'}</div>
              <div className={styles.shortcutContent}>
                <div className={styles.shortcutPrefix}>{shortcut.prefix}</div>
                <div className={styles.shortcutDescription}>
                  {shortcut.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tips}>
        <div className={styles.tipsTitle}>💡 Tips</div>
        <ul className={styles.tipsList}>
          <li>Use <kbd>↑</kbd><kbd>↓</kbd> to navigate results</li>
          <li>Press <kbd>Enter</kbd> to select</li>
          <li>Try shortcuts like <kbd>s:</kbd> for stories only</li>
        </ul>
      </div>
    </div>
  );
};

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return new Date(timestamp).toLocaleDateString();
}