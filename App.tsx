import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MenuProvider } from 'react-native-popup-menu';
import Navigation from './src/navigation/Navigation';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MenuProvider>
        <Navigation />
      </MenuProvider>
    </QueryClientProvider>
  );
}

export default App;