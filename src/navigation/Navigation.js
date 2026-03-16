import { StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppInitializer from '../components/AppInitializer';
import { useAuthStore } from '../store/authStore';

// Import navigators
import AuthNavigator from './MainNavigation/AuthNavigator';
import AppNavigator from './MainNavigation/AppNavigator';

const Stack = createNativeStackNavigator();

const Navigation = () => {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const state = useAuthStore.getState();

      // --- Detailed debugging of isCompleteAuthenticated conditions ---
      const hasBasicAuth = !!(
        state.token &&
        typeof state.token === 'string' &&
        state.token.length > 10 &&
        state.userName
      );

      const hasRealUserId = !!(
        state.userId &&
        !isNaN(Number(state.userId)) &&
        state.userId !== state.userName
      );

      const hasCompleteParams = !!(
        state.loginParameters?.clientId &&
        state.loginParameters?.roleId &&
        state.loginParameters?.organizationId &&
        state.loginParameters?.warehouseId
      );

      const hasRoleData = !!(
        state.roleId &&
        state.organizationId &&
        state.warehouseId
      );

      const authenticated = hasBasicAuth && hasRealUserId && hasCompleteParams && hasRoleData;

      console.log('🧭 Navigation - Detailed Auth Check:', {
        hasBasicAuth,
        hasRealUserId,
        hasCompleteParams,
        hasRoleData,
        userId: state.userId,
        userName: state.userName,
        loginParameters: state.loginParameters,
        roleId: state.roleId,
        orgId: state.organizationId,
        whId: state.warehouseId,
      });
      // -----------------------------------------------------------------

      setIsAuthenticated(authenticated);
      console.log('🧭 Navigation - Auth Check:', {
        authenticated,
        hasToken: !!state.token,
        tokenLength: state.token?.length || 0,
        userName: state.userName,
        isCompleteAuthenticated: state.isCompleteAuthenticated, // should match authenticated
      });
    };

    // Initial check after store is ready
    const timer = setTimeout(() => {
      checkAuth();
      setIsCheckingAuth(false);
    }, 800);

    // Subscribe to store changes
    const unsubscribe = useAuthStore.subscribe(checkAuth);

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // Show loading while checking
  if (isCheckingAuth) {
    return (
      <NavigationContainer>
        <AppInitializer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Auth" component={AuthNavigator} />
          </Stack.Navigator>
        </AppInitializer>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <AppInitializer>
        <Stack.Navigator
          key={isAuthenticated ? 'app' : 'auth'} // Force remount on change
          screenOptions={{
            headerShown: false,
            animation: 'none',
          }}
        >
          {isAuthenticated ? (
            <Stack.Screen name="App" component={AppNavigator} />
          ) : (
            <Stack.Screen name="Auth" component={AuthNavigator} />
          )}
        </Stack.Navigator>
      </AppInitializer>
    </NavigationContainer>
  );
};

export default Navigation;

const styles = StyleSheet.create({});