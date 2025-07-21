/**
 * @fileoverview Toast provider component using Radix UI
 * @module ToastProvider
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast } from 'radix-ui';
import styles from './ToastProvider.module.css';

/**
 * Toast context type
 */
interface ToastContextType {
  showToast: (message: string) => void;
}

/**
 * Toast context
 */
const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Hook to use toast functionality
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

/**
 * ToastProvider Component
 * 
 * Provides global toast notification functionality using Radix UI Toast
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} Rendered component
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string }>>([]);

  const showToast = useCallback((message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      <Toast.Provider>
        {children}
        {toasts.map((toast) => (
          <Toast.Root
            key={toast.id}
            className={styles.toast}
            duration={2000}
            onOpenChange={(open) => {
              if (!open) removeToast(toast.id);
            }}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              boxShadow: '0 10px 38px -10px rgba(0, 0, 0, 0.25), 0 10px 20px -15px rgba(0, 0, 0, 0.2)'
            }}
          >
            <Toast.Title 
              className={styles.toastTitle}
              style={{
                color: 'rgba(0, 0, 0, 0.86)',
                fontSize: '0.875rem'
              }}
            >
              {toast.message}
            </Toast.Title>
            <Toast.Action className={styles.toastAction} asChild altText="Schließen">
              <button className={styles.closeButton}>×</button>
            </Toast.Action>
          </Toast.Root>
        ))}
        <Toast.Viewport className={styles.toastViewport} />
      </Toast.Provider>
    </ToastContext.Provider>
  );
};

ToastProvider.displayName = 'ToastProvider';