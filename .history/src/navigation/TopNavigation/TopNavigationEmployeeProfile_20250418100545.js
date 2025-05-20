import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import BasicInformation from '../../screens/EmployeePortalScreens/ProfileScreens/BasicInformation';
import Education from '../../screens/EmployeePortalScreens/ProfileScreens/Education';
import Experience from '../../screens/EmployeePortalScreens/ProfileScreens/Experience';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';

const Tab = createMaterialTopTabNavigator();

const TopNavigationEmployeeProfile = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#000',
        tabBarIndicatorStyle: {backgroundColor: '#fff'},
        tabBarStyle: {
          backgroundColor: '#f4f4f4',
          elevation: 5,
          marginHorizontal: 10,
        },
      }}>
      <Tab.Screen
        name="Basic Information"
        component={BasicInformation}
        options={{
          tabBarIcon: () => (
            <Feather name="alert-octagon" color={'blue'} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Education"
        component={Education}
        options={{
          tabBarIcon: () => (
            <MaterialIcons name="school" color={'lightgreen'} size={25} />
          ),
        }}
      />
      <Tab.Screen
        name="Experience"
        component={Experience}
        options={{
          tabBarIcon: () => (
            <MaterialIcons name="work" color={'pink'} size={25} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TopNavigationEmployeeProfile;

const styles = StyleSheet.create({});
