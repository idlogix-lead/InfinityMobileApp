// components/AppInitializer.js
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useCheckAuth } from '../hooks/useAuth';

const AppInitializer = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { isAuthenticated, hasServerConfig, token, userName, password } = useAuthStore();
  const checkAuthQuery = useCheckAuth();

  useEffect(() => {
    const initialize = async () => {
      try {
        // Wait for Zustand to hydrate from AsyncStorage
        const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
          // Check if we have credentials stored
          if (userName && password && token) {
            // The useCheckAuth hook will automatically run when enabled
            // Wait a moment for the query to start
            setTimeout(() => setIsInitialized(true), 100);
          } else {
            setIsInitialized(true);
          }
        });

        // If already hydrated, proceed
        if (useAuthStore.persist.hasHydrated()) {
          if (userName && password && token) {
            setTimeout(() => setIsInitialized(true), 100);
          } else {
            setIsInitialized(true);
          }
        }

        return () => unsubscribe();
      } catch (error) {
        console.error('Initialization error:', error);
        setIsInitialized(true);
      }
    };

    initialize();
  }, []);

  // Show loading screen
  if (!isInitialized || (checkAuthQuery.isFetching && isAuthenticated)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return children;
};

export default AppInitializer;