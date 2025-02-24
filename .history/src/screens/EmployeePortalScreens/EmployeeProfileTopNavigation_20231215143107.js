import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import CustomHeader from '../../components/CustomHeader';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import BasicInformation from './BasicInformation';
import Education from './Education';
import Experience from './Experience';

const Tab = createMaterialTopTabNavigator();

const EmployeeProfileTopNavigation = () => {
  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <CustomHeader title="Employee Profile" />
      <View style={styles.tabBarContainer}>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#fff',
            tabBarInactiveTintColor: '#fff',
            tabBarIndicatorStyle: { backgroundColor: '#fff' },
            tabBarStyle: { backgroundColor: 'transparent', elevation: 0 }, // Make the tab bar transparent
          }}
        >
          <Tab.Screen name="BasicInformation" component={BasicInformation} />
          <Tab.Screen name="Education" component={Education} />
          <Tab.Screen name="Experience" component={Experience} />
        </Tab.Navigator>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    top: 100,
    left: 0, 
    right: 0, 
    backgroundColor: '#0050c0',
  },
});

export default EmployeeProfileTopNavigation;
