import React from 'react';
import { Command } from 'cmdk';
import styles from './SearchDialog.module.css';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?: (result: any) => void;
  placeholder?: string;
  maxResults?: number;
}

export const SearchDialog: React.FC<SearchDialogProps> = ({ 
  open, 
  onOpenChange, 
  onSelect,
  placeholder = "Search stories and docs...",
  maxResults = 50
}) => {
  return (
    <div className={`${styles.overlay} ${open ? styles.open : ''}`}>
      <Command className={styles.command}>
        <Command.Input 
          placeholder={placeholder}
          className={styles.input}
        />
        <Command.List className={styles.list}>
          <Command.Empty>No results found.</Command.Empty>
        </Command.List>
      </Command>
    </div>
  );
};