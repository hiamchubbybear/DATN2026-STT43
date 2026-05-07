import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from './src/app/navigation/RootNavigator';
import { ToastProvider } from './src/shared/components/ToastProvider';

// Ensure a single instance of the query client for the app lifecycle
const queryClient = new QueryClient();

export default function App() {
  return (
    // React Query Provider wraps the entire app
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RootNavigator />
      </ToastProvider>
    </QueryClientProvider>
  );
}
