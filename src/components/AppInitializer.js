import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
const useSessionStore = require('../store/sessionStore').useSessionStore;

const AppInitializer = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { initialize: initializeSessions } = useSessionStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🔄 AppInitializer: Starting...');
        
        // Set a timeout to ensure we don't get stuck
        const timeout = setTimeout(() => {
          console.log('⚠️ AppInitializer: Timeout - forcing completion');
          setIsLoading(false);
          setIsInitialized(true);
        }, 3000);

        // Wait for Zustand hydration
        const unsubAuth = useAuthStore.persist.onFinishHydration(() => {
          console.log('✅ Auth store hydrated');
        });

        const unsubSession = useSessionStore.persist.onFinishHydration(() => {
          console.log('✅ Session store hydrated');
          initializeSessions();
        });

        // If already hydrated, complete immediately
        if (useAuthStore.persist.hasHydrated() && useSessionStore.persist.hasHydrated()) {
          console.log('✅ Stores already hydrated');
          initializeSessions();
          clearTimeout(timeout);
          setIsLoading(false);
          setIsInitialized(true);
        }

        // Complete after 1 second regardless
        setTimeout(() => {
          console.log('✅ AppInitializer: Complete');
          clearTimeout(timeout);
          setIsLoading(false);
          setIsInitialized(true);
        }, 1000);

        return () => {
          clearTimeout(timeout);
          unsubAuth?.();
          unsubSession?.();
        };
      } catch (error) {
        console.error('❌ App initialization error:', error);
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

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