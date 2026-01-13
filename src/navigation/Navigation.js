import { StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppInitializer from '../components/AppInitializer';
import { useAuthStore } from '../store/authStore';
import { useSessionStore } from '../store/sessionStore';

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
  
  // Get session state
  const { sessionsRegistry, getCurrentSession } = useSessionStore();
  
  // Check authentication status
  const isAuthenticated = React.useMemo(() => {
    return Boolean(
      token &&
      typeof token === 'string' &&
      token.length > 10 &&
      userName &&
      userId &&
      !isNaN(Number(userId)) &&
      userId !== userName &&
      roleId
    );
  }, [token, userId, userName, roleId]);
  
  // Check for valid session on mount
  useEffect(() => {
    const checkSession = async () => {
      // Wait a moment for stores to initialize
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsCheckingAuth(false);
    };
    
    checkSession();
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
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <Stack.Screen 
              name="App" 
              component={AppNavigator}
              options={{ animation: 'fade' }}
            />
          ) : (
            <Stack.Screen 
              name="Auth" 
              component={AuthNavigator}
              options={{ animation: 'fade' }}
            />
          )}
        </Stack.Navigator>
      </AppInitializer>
    </NavigationContainer>
  );
};

export default Navigation;

const styles = StyleSheet.create({});