import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Subordinates from '../../screens/RequestScreens/Subordinates';
import Performance from '../../screens/RequestScreens/Performance';

const Tab = createMaterialTopTabNavigator();

const TopNavigationUser = () => {
  return (
    <Tab.Navigator screenOptions={{
      tabBarStyle: {
        backgroundColor: '#D1D9D3',
        width: '90%',
        marginLeft: 15,
        borderRadius: 20,
        height: '7%',
        marginTop:10
      },
      tabBarActiveTintColor: '#800000',
      tabBarInactiveTintColor: '#4A4747',
      tabBarIndicator: ({ navigation, state }) => { // Customize the tab bar indicator
        return (
          <View style={{ // Add your custom style to the tab bar indicator
            height: 0
          }} />
        );
      }
    }}>
      <Tab.Screen name="Subordinates" component={Subordinates} />
      <Tab.Screen name="Performance" component={Performance} />
    </Tab.Navigator>
  )
}

export default TopNavigationUser

const styles = StyleSheet.create({})