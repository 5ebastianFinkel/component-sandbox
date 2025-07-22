import React, { useState, useCallback } from 'react';
import { SearchDialog } from './SearchDialog';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';

interface SearchDialogProviderProps {
  children: React.ReactNode;
}

export const SearchDialogProvider: React.FC<SearchDialogProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openDialog = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  const handleSelect = useCallback((result: any) => {
    // TODO: Implement navigation logic
    console.log('Selected result:', result);
    closeDialog();
  }, [closeDialog]);

  // Global CMD/CTRL+K shortcut
  useKeyboardShortcut('k', openDialog);

  return (
    <>
      {children}
      <SearchDialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        onSelect={handleSelect}
      />
    </>
  );
};