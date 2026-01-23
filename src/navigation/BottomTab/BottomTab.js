import {StyleSheet, SafeAreaView, View} from 'react-native';
import React from 'react';
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
  // Get user info for debugging (not for auth check)
  const userName = useAuthStore(state => state.userName);

  console.log('🏠 BottomTab: Rendering tabs for user:', userName);

  // User is authenticated - show the tab navigator
  // (Navigation component already verified authentication)
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
  // Remove error and loading styles - not needed anymore
});
