import { toast } from 'sonner';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  type: ToastType;
  title: string;
  description?: string;
}

// Helper functions for different toast types
export const showToast = {
  success: (title: string, description?: string) => {
    toast.success(title, description ? { description } : undefined);
  },
  error: (title: string, description?: string) => {
    toast.error(title, description ? { description } : undefined);
  },
  info: (title: string, description?: string) => {
    toast.info(title, description ? { description } : undefined);
  },
  warning: (title: string, description?: string) => {
    toast.warning(title, description ? { description } : undefined);
  },
};

// Main toast function
export const addToast = ({ type, title, description }: ToastMessage) => {
  showToast[type](title, description);
};

// Backwards compatibility hook
export const useToast = () => {
  return {
    addToast,
    showToast,
  };
};
