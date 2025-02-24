import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import CustomHeader from '../../components/CustomHeader';
import TopNavigationEmployeeProfile from '../../navigation/TopNavigation/TopNavigationEmployeeProfile';

const EmployeeProfileTopNavigation = () => {
  return (
    <View style={{ flex: 1, }}>
      <CustomHeader title="Employee Profile" style={styles.Container}/>
       <TopNavigationEmployeeProfile
       />
    </View>
  );
};

const styles = StyleSheet.create({
    Container:{
        borderBottomLeftRadius:0,
        borderBottomRightRadius:0,
        height:80,
        justifyContent:'flex-end',
    },
});

export default EmployeeProfileTopNavigation;