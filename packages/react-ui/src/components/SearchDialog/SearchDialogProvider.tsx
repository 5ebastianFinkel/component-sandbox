import React, { useState, useCallback } from 'react';
import { SearchDialog } from './SearchDialog';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { SearchResult } from '../../utils/searchIndexBuilder';
import { StorybookNavigator } from '../../utils/storybookNavigation';

interface SearchDialogProviderProps {
  children: React.ReactNode;
  onNavigate?: (result: SearchResult) => void;
  onError?: (error: Error, result: SearchResult) => void;
}

export const SearchDialogProvider: React.FC<SearchDialogProviderProps> = ({ 
  children, 
  onNavigate,
  onError 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const openDialog = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  const handleSelect = useCallback(async (result: SearchResult) => {
    if (isNavigating) return; // Prevent multiple simultaneous navigations
    
    setIsNavigating(true);
    
    try {
      // Call custom navigation handler if provided
      if (onNavigate) {
        onNavigate(result);
      } else {
        // Use default Storybook navigation
        StorybookNavigator.navigateToResult(result);
      }

      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error('Navigation error:', error);
      
      if (onError) {
        onError(error as Error, result);
      } else {
        // Default error handling - try fallback navigation
        try {
          StorybookNavigator.navigateToResult(result);
        } catch (fallbackError) {
          console.error('Fallback navigation also failed:', fallbackError);
          
          // Last resort: show a user-friendly message
          if (typeof window !== 'undefined') {
            const message = `Failed to navigate to ${result.title}. You can manually navigate using the path: ${result.path}`;
            alert(message);
          }
        }
      }
    } finally {
      setIsNavigating(false);
      closeDialog();
    }
  }, [isNavigating, onNavigate, onError, closeDialog]);

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
      
      {/* Loading overlay during navigation */}
      {isNavigating && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          pointerEvents: 'none'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '16px 24px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '14px',
            color: '#333'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid #e1e5e9',
              borderTop: '2px solid #0969da',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Navigating...
          </div>
        </div>
      )}
    </>
  );
};