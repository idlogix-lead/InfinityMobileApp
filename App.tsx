import React, {useEffect} from 'react';
import {QueryClient, QueryClientProvider} from 'react-query';
import {MenuProvider} from 'react-native-popup-menu';
import Navigation from './src/navigation/Navigation';
import {Platform} from 'react-native';
import keychainService from './src/services/KeyChainService';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

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
  useEffect(() => {
    const initializeKeychain = async () => {
      try {
        // Simple health check
        const health = await keychainService.healthCheck();

        // Test Keychain in development mode only
        if (!health.error) {
          // Run a quick test but don't show errors to user
          setTimeout(async () => {
            try {
              await keychainService.testKeychain();
            } catch (testError) {
              // Silent fail
            }
          }, 1000);
        }
      } catch (error) {
        // Silent fail
      }
    };

    initializeKeychain();
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
    <QueryClientProvider client={queryClient}>
      <MenuProvider>
        <Navigation />
      </MenuProvider>
    </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default App;
