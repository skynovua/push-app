import React from 'react';
import { Toaster } from './ui/sonner';

// Provider component - now just the Toaster
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster 
        position="top-right"
        expand={true}
        richColors={true}
        closeButton={true}
      />
    </>
  );
};
