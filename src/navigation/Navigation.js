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
  
  // Get auth state
  const token = useAuthStore(state => state.token);
  const userId = useAuthStore(state => state.userId);
  const userName = useAuthStore(state => state.userName);
  const roleId = useAuthStore(state => state.roleId);
  
  // SIMPLIFIED AUTHENTICATION CHECK - More tolerant
  const isAuthenticated = React.useMemo(() => {
    if (isCheckingAuth) return false;
    
    // Only require token and username for basic auth
    // Don't require roleId - that's for complete auth only
    const result = Boolean(
      token &&
      typeof token === 'string' &&
      token.length > 10 &&
      userName
    );
    
    console.log('🧭 Navigation - Auth Check:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      userName: !!userName,
      userId: !!userId,
      roleId: !!roleId,
      isAuthenticated: result,
      isCheckingAuth
    });
    
    return result;
  }, [token, userName, isCheckingAuth]); // Removed userId and roleId from dependencies
  
  // Check for valid session on mount
  useEffect(() => {
    const checkSession = async () => {
      console.log('🧭 Navigation: Starting auth check...');
      
      // Wait for stores to initialize
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const storeState = useAuthStore.getState();
      console.log('🧭 Navigation: Store state loaded', {
        userId: storeState.userId,
        tokenExists: !!storeState.token,
        tokenLength: storeState.token?.length || 0,
        roleId: storeState.roleId,
        isCompleteAuth: storeState.isCompleteAuthenticated
      });
      
      setIsCheckingAuth(false);
    };
    
    checkSession();
  }, []);
  
  // Listen for auth state changes
  useEffect(() => {
    if (!isCheckingAuth) {
      console.log('🧭 Navigation: Auth state updated', {
        isAuthenticated,
        userId,
        userName
      });
    }
  }, [isAuthenticated, userId, userName, isCheckingAuth]);
  
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
          screenOptions={{ 
            headerShown: false,
            animation: 'none' // Disable animation to prevent flicker
          }}
        >
          {isAuthenticated ? (
            <Stack.Screen 
              name="App" 
              component={AppNavigator}
            />
          ) : (
            <Stack.Screen 
              name="Auth" 
              component={AuthNavigator}
            />
          )}
        </Stack.Navigator>
      </AppInitializer>
    </NavigationContainer>
  );
};

export default Navigation;

const styles = StyleSheet.create({});