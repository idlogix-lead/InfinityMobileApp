import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const Tab = createMaterialTopTabNavigator();

const TopNavigationEmployeeProfile = () => {
  return (
    <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#fff',
            tabBarInactiveTintColor: '#fff',
            tabBarIndicatorStyle: { backgroundColor: '#fff' },
            tabBarStyle: { backgroundColor: 'transparent', elevation: 0 }, 
          }}
        >
          <Tab.Screen name="Basic Information" component={BasicInformation} />
          <Tab.Screen name="Education" component={Education} />
          <Tab.Screen name="Experience" component={Experience} />
        </Tab.Navigator>
  )
}

export default TopNavigationEmployeeProfile

const styles = StyleSheet.create({})