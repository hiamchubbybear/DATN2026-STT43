import { Alert } from 'react-native';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastOptions {
  title: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

// Backward-compatible shape with `react-native-toast-message`
export interface LegacyToastOptions {
  type?: ToastType | string;
  text1?: string;
  text2?: string;
  duration?: number;
}

type ToastHandler = (options: ToastOptions) => void;

let handler: ToastHandler | null = null;

export function registerToastHandler(next: ToastHandler | null) {
  handler = next;
}

export const toast = {
  show(options: ToastOptions | LegacyToastOptions) {
    if (!handler) {
      const t = ('title' in options ? options.title : (options as any).text1) || 'Notice';
      const m = ('message' in options ? options.message : (options as any).text2) || '';
      Alert.alert(t, m);
      return;
    }

    if ('title' in options && 'message' in options) {
      handler(options);
      return;
    }

    handler({
      type: (options.type as ToastType) || 'info',
      title: options.text1 || 'Notice',
      message: options.text2 || '',
      duration: options.duration,
    });
  },
};

