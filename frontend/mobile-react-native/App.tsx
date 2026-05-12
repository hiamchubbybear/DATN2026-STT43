import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from './src/app/navigation/RootNavigator';
import { ToastProvider } from './src/shared/components/ToastProvider';

import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Disable debug logs on screen
LogBox.ignoreAllLogs();

// Ensure a single instance of the query client for the app lifecycle
const queryClient = new QueryClient();

export default function App() {
  return (
    // React Query Provider wraps the entire app
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <RootNavigator />
        </ToastProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
