import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import BasicInformation from '../../screens/EmployeePortalScreens/BasicInformation';
import Education from '../../screens/EmployeePortalScreens/Education';
import Experience from '../../screens/EmployeePortalScreens/Experience';

const Tab = createMaterialTopTabNavigator();

const TopNavigationEmployeeProfile = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#fff',
        tabBarIndicatorStyle: { backgroundColor: '#fff' },
        tabBarStyle: { backgroundColor: '#0050c0', elevation: 5, },
      }}
    >
      <Tab.Screen name="Basic Information" component={BasicInformation}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen name="Education" component={Education}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="school" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen name="Experience" component={Experience}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="work" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}

export default TopNavigationEmployeeProfile

const styles = StyleSheet.create({})