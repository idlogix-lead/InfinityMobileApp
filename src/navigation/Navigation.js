import {StyleSheet} from 'react-native';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AppInitializer from '../components/AppInitializer';
import { useAuthStore } from '../store/authStore';

// Import navigators
import AuthNavigator from './MainNavigation/AuthNavigator';
import AppNavigator from './MainNavigation/AppNavigator';

const Stack = createNativeStackNavigator();

const Navigation = () => {
  // Get all auth state values
  const token = useAuthStore(state => state.token);
  const userId = useAuthStore(state => state.userId);
  const userName = useAuthStore(state => state.userName);
  const roleId = useAuthStore(state => state.roleId);
  
  // Manual check - more reliable than the getter
  const isCompleteAuthenticated = React.useMemo(() => {
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
  
  return (
    <NavigationContainer>
      <AppInitializer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          {isCompleteAuthenticated ? (
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