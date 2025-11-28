import React from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

export const ToastContext = React.createContext<ToastContextType>({
  showToast: () => {},
});

