import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import CustomHeader from '../../components/CustomHeader';
import TopNavigationEmployeeProfile from '../../navigation/TopNavigation/TopNavigationEmployeeProfile';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import BasicInformation from './BasicInformation';
import Education from './Education';
import Experience from './Experience';

const Tab = createMaterialTopTabNavigator();

const EmployeeProfileTopNavigation = () => {
  return (
    <View style={{ flex: 1, }}>
      <CustomHeader title="Employee Profile" />
       <TopNavigationEmployeeProfile
       />
    </View>
  );
};

const styles = StyleSheet.create({
});

export default EmployeeProfileTopNavigation;

