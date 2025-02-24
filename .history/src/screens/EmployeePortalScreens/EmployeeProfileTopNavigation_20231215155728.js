// import { StyleSheet, Text, View } from 'react-native';
// import React from 'react';
// import CustomHeader from '../../components/CustomHeader';
// import TopNavigationEmployeeProfile from '../../navigation/TopNavigation/TopNavigationEmployeeProfile';
// import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
// import BasicInformation from './BasicInformation';
// import Education from './Education';
// import Experience from './Experience';

// const Tab = createMaterialTopTabNavigator();

// const EmployeeProfileTopNavigation = () => {
//   return (
//     <View style={{ flex: 1, }}>
//       <CustomHeader title="Employee Profile" />
//       <View style={styles.tabBarContainer}>
//        <TopNavigationEmployeeProfile/>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   tabBarContainer: {
//     position: 'absolute',
//     top: 100,
//     left: 0, 
//     right: 0, 
//     backgroundColor: '#0050c0',
//   },
// });

// export default EmployeeProfileTopNavigation;

import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomHeader from '../../components/CustomHeader'

const EmployeeProfileTopNavigation = () => {
  return (
    <View>
        <CustomHeader/>
     {/* <EmployeeProfileTopNavigation/> */}
    </View>
  )
}

export default EmployeeProfileTopNavigation

const styles = StyleSheet.create({})