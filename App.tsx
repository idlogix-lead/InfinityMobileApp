import React, { useEffect, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MenuProvider } from 'react-native-popup-menu';
import Navigation from './src/navigation/Navigation';
import { Platform, View, Text } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import keychainService from './src/services/KeyChainService';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from './src/store/authStore';
import { tokenRefreshService } from './src/services/TokenRefresh'; // Fixed import

// Define types for error object
interface ErrorWithMessage {
  message?: string;
}

// Create a QueryClient with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount: number, error: unknown) => {
        // Safe error handling with type guard
        let errorMessage = '';
        
        if (error && typeof error === 'object') {
          const err = error as ErrorWithMessage;
          if (err.message && typeof err.message === 'string') {
            errorMessage = err.message;
          }
        }
        
        // Don't retry on session expired
        if (errorMessage === 'SESSION_EXPIRED') {
          return false;
        }
        // Don't retry on permission denied
        if (errorMessage === 'PERMISSION_DENIED') {
          return false;
        }
        // Don't retry on 404
        if (errorMessage === 'RESOURCE_NOT_FOUND') {
          return false;
        }
        // For temporary auth errors, retry once
        if (errorMessage === 'TEMPORARY_AUTH_ERROR') {
          return failureCount < 1;
        }
        // For network errors, retry up to 2 times
        return failureCount < 2;
      },
      retryDelay: (attemptIndex: number) => {
        return Math.min(1000 * 2 ** attemptIndex, 10000);
      },
      cacheTime: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: (failureCount: number, error: unknown) => {
        // Safe error handling with type guard
        let errorMessage = '';
        
        if (error && typeof error === 'object') {
          const err = error as ErrorWithMessage;
          if (err.message && typeof err.message === 'string') {
            errorMessage = err.message;
          }
        }
        
        if (errorMessage === 'SESSION_EXPIRED' || 
            errorMessage === 'PERMISSION_DENIED' ||
            errorMessage === 'TEMPORARY_AUTH_ERROR') {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

// Define props interface for SessionMonitor
interface SessionMonitorProps {
  children: ReactNode;
}

// Simple Session Monitor Component
const SessionMonitor: React.FC<SessionMonitorProps> = ({ children }) => {
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const state = useAuthStore.getState();
        
        // Check if token exists
        if (state && state.token) {
          console.log('🕒 Token exists, length:', state.token.length);
          
          // Try to get expiry info if method exists
          if (state.getTokenExpiryInfo && typeof state.getTokenExpiryInfo === 'function') {
            try {
              const info = state.getTokenExpiryInfo();
              if (info && typeof info === 'object') {
                console.log('Token status:', {
                  isValid: (info as any).isValid || false,
                  expiresAt: (info as any).expiresAt || 'Unknown'
                });
              }
            } catch (e) {
              // Silent fail for expiry info
            }
          }
        }
      } catch (error) {
        // Completely silent fail
      }
    }, 300000);
    
    return () => clearInterval(interval);
  }, []);
  
  return <>{children}</>;
};

// Define props interface for ErrorBoundary
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Error Boundary Component to catch rendering errors
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.log('App Error:', error?.toString() || 'Unknown error');
    console.log('Error Info:', errorInfo?.componentStack || 'No stack trace');
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Something went wrong. Please restart the app.</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

function App(): React.JSX.Element {
  // ✅ FIXED: useEffect moved inside component
  useEffect(() => {
    // Start token refresh service
    tokenRefreshService.start();
    
    return () => {
      tokenRefreshService.stop();
    };
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize keychain
        const health = await keychainService.healthCheck();
        
        // Log app start
        console.log('🚀 App started');
        
        // Try to get auth state safely
        try {
          const state = useAuthStore.getState();
          if (state && state.token) {
            console.log('Token present on startup');
            
            // Check if token needs refresh on startup
            if (state.shouldRefreshToken?.()) {
              console.log('🔄 Token expiring soon, refreshing on startup...');
              state.relogin?.();
            }
          } else {
            console.log('No token on startup');
          }
        } catch (authError) {
          console.log('Auth store not ready');
        }
        
        // Test keychain silently
        if (!health.error) {
          setTimeout(() => {
            keychainService.testKeychain().catch(() => {});
          }, 1000);
        }
      } catch (error) {
        // Silent fail
      }
    };

    initializeApp();
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PaperProvider>
          <QueryClientProvider client={queryClient}>
            <MenuProvider>
              <SessionMonitor>
                <Navigation />
              </SessionMonitor>
            </MenuProvider>
          </QueryClientProvider>
        </PaperProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

export default App;