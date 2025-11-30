/**
 * Toast Notification System
 * Provides feedback for user actions (copy, export, etc.)
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

let toastId = 0;
const subscribers: Set<(toast: Toast) => void> = new Set();

export const createToast = (message: string, type: ToastType = 'info', duration: number = 3000): string => {
  const id = `toast-${++toastId}`;
  const toast: Toast = { id, message, type, duration };
  subscribers.forEach(callback => callback(toast));
  return id;
};

export const subscribeToToasts = (callback: (toast: Toast) => void) => {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
};

export const showSuccess = (message: string) => createToast(message, 'success');
export const showError = (message: string) => createToast(message, 'error');
export const showInfo = (message: string) => createToast(message, 'info');
export const showWarning = (message: string) => createToast(message, 'warning');
