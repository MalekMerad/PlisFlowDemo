import { toast } from 'react-toastify';

export const useToast = () => {
  const showToast = (message, type = 'default') => {
    toast(message, { type, position: 'top-right' });
  };

  return { showToast };
};
