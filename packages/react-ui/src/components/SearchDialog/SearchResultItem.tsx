import React from 'react';
import { Command } from 'cmdk';
import { SearchResult } from '../../utils/searchIndexBuilder';
import styles from './SearchResultItem.module.css';

interface SearchResultItemProps {
  result: SearchResult;
  onSelect: (result: SearchResult) => void;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({ result, onSelect }) => {
  const handleSelect = () => {
    onSelect(result);
  };

  const getResultIcon = () => {
    if (result.type === 'story') {
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" className={styles.icon}>
          <rect x="3" y="3" width="14" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="10" cy="10" r="3" fill="currentColor" opacity="0.3"/>
        </svg>
      );
    }
    
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" className={styles.icon}>
        <rect x="4" y="3" width="12" height="14" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="7" y1="6" x2="13" y2="6" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="7" y1="9" x2="13" y2="9" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="7" y1="12" x2="10" y2="12" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    );
  };

  return (
    <Command.Item 
      value={result.id} 
      onSelect={handleSelect}
      className={styles.item}
    >
      <div className={`${styles.iconContainer} ${result.type === 'docs' ? styles.docsIcon : styles.storyIcon}`}>
        {getResultIcon()}
      </div>
      
      <div className={`${styles.badge} ${result.type === 'docs' ? styles.docsBadge : styles.storyBadge}`}>
        {result.type}
      </div>
      
      <div className={styles.content}>
        <div className={styles.title}>
          {result.title}
        </div>
        
        {result.description && (
          <div className={styles.description}>
            {result.description}
          </div>
        )}
        
        {result.tags && result.tags.length > 0 && (
          <div className={styles.tags}>
            {result.tags.slice(0, 3).map(tag => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
            {result.tags.length > 3 && (
              <span className={styles.tag}>+{result.tags.length - 3} more</span>
            )}
          </div>
        )}
      </div>

      <div className={styles.shortcut}>
        ↵
      </div>
    </Command.Item>
  );
};