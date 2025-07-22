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
        <svg width="16" height="16" viewBox="0 0 16 16" className={styles.icon}>
          <path 
            fill="currentColor" 
            d="M1 3.5A1.5 1.5 0 0 1 2.5 2h11A1.5 1.5 0 0 1 15 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12.5v-9zM2.5 3a.5.5 0 0 0-.5.5V9h13V3.5a.5.5 0 0 0-.5-.5h-11zM2 10v2.5a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5V10H2z"
          />
        </svg>
      );
    }
    
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" className={styles.icon}>
        <path 
          fill="currentColor" 
          d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"
        />
      </svg>
    );
  };

  return (
    <Command.Item 
      value={result.id} 
      onSelect={handleSelect}
      className={styles.item}
    >
      <div className={styles.iconContainer}>
        {getResultIcon()}
        <span className={styles.type}>{result.type}</span>
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