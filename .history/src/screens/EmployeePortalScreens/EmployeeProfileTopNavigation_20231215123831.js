import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomHeader from '../../components/CustomHeader'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import BasicInformation from './BasicInformation';

const Tab = createMaterialTopTabNavigator();

const EmployeeProfileTopNavigation = () => {
    return (
        <Tab.Navigator>
            <Tab.Screen name="BasicInformation" component={BasicInformation} />
            {/* <Tab.Screen name="Settings" component={SettingsScreen} /> */}
        </Tab.Navigator>
    )
}

export default EmployeeProfileTopNavigation

const styles = StyleSheet.create({})