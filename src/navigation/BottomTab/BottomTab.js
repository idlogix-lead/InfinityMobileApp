import {
  StyleSheet,
  SafeAreaView,
  View,
  ActivityIndicator,
  Text,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  createBottomTabNavigator,
  BottomTabBar,
} from '@react-navigation/bottom-tabs';
import HomeScreen from '../../screens/HomeScreens/HomeScreen';
import CrmScreen from '../../screens/CRMScreen/CrmScreen';
import HelpScreen from '../../screens/HelpScreen/HelpScreen';
import ProfileScreen from '../../screens/ProfileScreens/ProfileScreen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useAuthStore} from '../../store/authStore';

const Tab = createBottomTabNavigator();

// Custom Solid Blue Tab Bar
const CustomTabBar = props => (
  <View style={{height: 50, backgroundColor: '#2F4FE3'}}>
    <BottomTabBar {...props} />
  </View>
);

const BottomTab = ({navigation}) => {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Get auth data from store
  const token = useAuthStore(state => state.token);
  const userId = useAuthStore(state => state.userId);
  const userName = useAuthStore(state => state.userName);
  const roleId = useAuthStore(state => state.roleId);

  // Create a reliable auth check (don't rely on isAuthenticated getter)
  const isAuthenticated = React.useMemo(() => {
    return Boolean(
      token &&
        typeof token === 'string' &&
        token.length > 10 &&
        userName &&
        userId &&
        !isNaN(Number(userId)) &&
        userId !== userName &&
        roleId,
    );
  }, [token, userId, userName, roleId]);

  console.log('🔍 BottomTab - Auth Check:', {
    hasToken: !!token,
    tokenLength: token?.length || 0,
    userId,
    userName,
    roleId,
    isAuthenticated,
  });

  useEffect(() => {
    const checkAuth = async () => {
      // Wait a moment for store to update
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log('🔍 BottomTab - Final Auth State:', {
        isAuthenticated,
        userId,
        roleId,
      });

      if (!isAuthenticated) {
        console.log('❌ BottomTab: Not authenticated - showing error state');
        // Don't navigate - just show error state
        // The main Navigation component should handle switching back to Auth
      }

      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [isAuthenticated]);

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2F4FE3" />
        <Text style={styles.loadingText}>Loading app...</Text>
        <Text style={styles.userInfo}>User: {userName}</Text>
        <Text style={styles.userInfo}>ID: {userId}</Text>
      </View>
    );
  }

  // If not authenticated, show error screen
  if (!isAuthenticated) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Authentication Error</Text>
        <Text style={styles.errorText}>
          You need to be logged in to access the app.
        </Text>
        <Text style={styles.debugInfo}>
          Token: {token ? 'Present' : 'Missing'}
          {'\n'}
          User ID: {userId || 'Not set'}
          {'\n'}
          Role ID: {roleId || 'Not set'}
        </Text>
        <Text style={styles.instruction}>
          Please close and restart the app, or wait to be redirected.
        </Text>
      </View>
    );
  }

  // User is authenticated - show the tab navigator
  return (
    <SafeAreaView style={{flex: 1}}>
      <Tab.Navigator
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={({route}) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            height: 40,
            paddingVertical: 10,
          },
          tabBarIcon: ({focused, color, size}) => {
            let icon;
            if (route.name === 'Home') {
              icon = focused ? 'home' : 'home';
            } else if (route.name === 'Help') {
              icon = focused ? 'all-inclusive' : 'all-inclusive';
            } else if (route.name === 'Profile') {
              icon = focused ? 'person' : 'person';
            }
            return <MaterialIcons name={icon} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'white',
          tabBarInactiveTintColor: '#ccc',
        })}>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          listeners={{
            tabPress: () => {
              console.log('🏠 Home tab pressed - User:', userName);
            },
          }}
        />
        <Tab.Screen
          name="Help"
          component={CrmScreen}
          listeners={{
            tabPress: () => {
              console.log('📊 CRM tab pressed - User:', userName);
            },
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          listeners={{
            tabPress: () => {
              console.log('👤 Profile tab pressed - User:', userName);
            },
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

export default BottomTab;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
    marginTop: 20,
    fontWeight: '600',
  },
  userInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 30,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#cc0000',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  debugInfo: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    width: '100%',
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
});
