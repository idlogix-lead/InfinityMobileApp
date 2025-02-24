import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomHeader from '../../components/CustomHeader'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import BasicInformation from './BasicInformation';
import Education from './Education';
import Experience from './Experience';

const Tab = createMaterialTopTabNavigator();

const EmployeeProfileTopNavigation = () => {
    return (
        <View style={{ flex: 1 }}> 
        <CustomHeader title="Employee Profile" />
        <Tab.Navigator screenOptions={{
            tabBarStyle: { backgroundColor: '#0050c0' },
        }}
        >
          <Tab.Screen name="BasicInformation" component={BasicInformation} />
          <Tab.Screen name="Education" component={Education} />
          <Tab.Screen name="Experience" component={Experience} />
        </Tab.Navigator>
      </View>
    )
}

export default EmployeeProfileTopNavigation

const styles = StyleSheet.create({})