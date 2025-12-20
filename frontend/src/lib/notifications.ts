import { toast } from "sonner@2.0.3";

export const notifications = {
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
      style: {
        background: 'var(--success)',
        color: 'white',
        border: 'none',
      },
    });
  },

  error: (message: string) => {
    toast.error(message, {
      duration: 4000,
      style: {
        background: 'var(--destructive)',
        color: 'white',
        border: 'none',
      },
    });
  },

  info: (message: string) => {
    toast.info(message, {
      duration: 3000,
      style: {
        background: 'var(--info)',
        color: 'white',
        border: 'none',
      },
    });
  },

  warning: (message: string) => {
    toast.warning(message, {
      duration: 3500,
      style: {
        background: 'var(--warning)',
        color: 'white',
        border: 'none',
      },
    });
  },
};

// Transaction-specific notifications
export const transactionNotifications = {
  transferStarted: () => notifications.info('Transfer initiated...'),
  transferComplete: (amount: string) => 
    notifications.success(`Transfer of ${amount} completed successfully!`),
  transferFailed: () => 
    notifications.error('Transfer failed. Please try again.'),
  
  accountCreated: () => 
    notifications.success('Account created successfully!'),
  accountUpdated: () => 
    notifications.success('Account updated successfully!'),
  
  loginSuccess: () => 
    notifications.success('Welcome back!'),
  logoutSuccess: () => 
    notifications.info('Logged out successfully'),
  
  dataReset: () => 
    notifications.info('Demo data has been reset'),
  dataRegenerated: () => 
    notifications.success('Demo data regenerated successfully'),
};
