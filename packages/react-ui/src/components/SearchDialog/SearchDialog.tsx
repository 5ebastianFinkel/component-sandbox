import React, { useEffect, useRef } from 'react';
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
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        event.preventDefault();
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onOpenChange]);

  // Handle click outside to close
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === overlayRef.current) {
      onOpenChange(false);
    }
  };

  // Focus management
  useEffect(() => {
    if (open) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Focus the search input
      const input = document.querySelector(`[data-cmdk-input]`) as HTMLInputElement;
      if (input) {
        setTimeout(() => input.focus(), 50);
      }
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div 
      ref={overlayRef}
      className={`${styles.overlay} ${open ? styles.open : ''}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Search stories and documentation"
    >
      <Command 
        className={styles.command}
        shouldFilter={false} // We'll handle filtering ourselves
      >
        <Command.Input 
          placeholder={placeholder}
          className={styles.input}
          autoFocus
        />
        <Command.List className={styles.list}>
          <Command.Empty className={styles.empty}>
            No results found.
          </Command.Empty>
          {/* Results will be populated here */}
        </Command.List>
      </Command>
    </div>
  );
};