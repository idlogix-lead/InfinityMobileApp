import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useSessionStore } from '../store/sessionStore';

const AppInitializer = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { initialize: initializeSessions } = useSessionStore();
  const token = useAuthStore(state => state.token);
  const userId = useAuthStore(state => state.userId);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🔄 AppInitializer: Starting initialization...');
        
        // Wait for Zustand hydration
        const unsubAuth = useAuthStore.persist.onFinishHydration(() => {
          console.log('✅ Auth store hydrated');
        });

        const unsubSession = useSessionStore.persist.onFinishHydration(() => {
          console.log('✅ Session store hydrated');
          
          // Initialize session store
          initializeSessions();
          setIsLoading(false);
          
          // Check if we should auto-load a session
          setTimeout(() => {
            checkAutoLogin();
            setIsInitialized(true);
          }, 500);
        });

        // If already hydrated
        if (useAuthStore.persist.hasHydrated() && useSessionStore.persist.hasHydrated()) {
          console.log('✅ Stores already hydrated');
          initializeSessions();
          setIsLoading(false);
          checkAutoLogin();
          setIsInitialized(true);
        }

        // Safety timeout
        const timeout = setTimeout(() => {
          console.log('⚠️  Initialization timeout - forcing complete');
          setIsLoading(false);
          setIsInitialized(true);
        }, 5000);

        return () => {
          unsubAuth?.();
          unsubSession?.();
          clearTimeout(timeout);
        };
      } catch (error) {
        console.error('❌ App initialization error:', error);
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  const checkAutoLogin = () => {
    try {
      const state = useAuthStore.getState();
      
      // Check if we already have a valid session
      if (state.token && state.userId && state.isCompleteAuthenticated) {
        console.log('✅ Already authenticated, no auto-login needed');
        return;
      }
      
      // The session switching should be handled by ProfileScreen
      // Don't auto-login here to prevent errors
      console.log('ℹ️  No auto-login - user needs to login manually');
      
    } catch (error) {
      console.error('Error checking auto login:', error);
    }
  };

  // Show loading screen
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <ActivityIndicator size="large" color="#0050C0" />
      </View>
    );
  }

  return children;
};

export default AppInitializer;