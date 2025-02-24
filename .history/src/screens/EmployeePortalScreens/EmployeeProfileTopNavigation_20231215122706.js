import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomHeader from '../../components/CustomHeader'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const Tab = createMaterialTopTabNavigator();

const EmployeeProfile = () => {
    return (
        <Tab.Navigator>
            {/* <Tab.Screen name="" component={} /> */}
            {/* <Tab.Screen name="Settings" component={SettingsScreen} /> */}
        </Tab.Navigator>
    )
}

export default EmployeeProfile

const styles = StyleSheet.create({})