// import {StyleSheet, Text, View} from 'react-native';
// import React from 'react';
// import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
// import BasicInformation from '../../screens/EmployeePortalScreens/ProfileScreens/BasicInformation';
// import Education from '../../screens/EmployeePortalScreens/ProfileScreens/Education';
// import Experience from '../../screens/EmployeePortalScreens/ProfileScreens/Experience';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import Feather from 'react-native-vector-icons/Feather';

// const Tab = createMaterialTopTabNavigator();

// const TopNavigationEmployeeProfile = () => {
//   return (
//     <Tab.Navigator
//       screenOptions={{
//         tabBarShowIcon: true,
//         tabBarActiveTintColor: '#000',
//         tabBarInactiveTintColor: '#000',
//         tabBarIndicatorStyle: {backgroundColor: '#000', height: 2},
//         tabBarStyle: {
//           backgroundColor: '#f4f4f4',
//           elevation: 5,
//           marginHorizontal: 10,
//           borderRadius: 10,
//           marginTop: 10,
//         },
//       }}>
//       <Tab.Screen
//         name="Basic Information"
//         component={BasicInformation}
//         options={{
//           tabBarIcon: () => (
//             <Feather name="alert-octagon" color={'blue'} size={24} />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="Education"
//         component={Education}
//         options={{
//           tabBarIcon: () => (
//             <MaterialIcons name="school" color={'lightgreen'} size={25} />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="Experience"
//         component={Experience}
//         options={{
//           tabBarIcon: () => (
//             <MaterialIcons name="work" color={'pink'} size={25} />
//           ),
//         }}
//       />
//     </Tab.Navigator>
//   );
// };

// export default TopNavigationEmployeeProfile;

// const styles = StyleSheet.create({});

import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
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
      screenOptions={({route}) => ({
        tabBarShowIcon: true,
        tabBarIndicatorStyle: {backgroundColor: '#000', height: 2},
        tabBarStyle: {
          backgroundColor: '#fff',
          elevation: 5,
          marginHorizontal: 10,
          borderRadius: 10,
          marginTop: 10,
        },
        tabBarLabel: ({focused, color}) => {
          let label = '';
          if (route.name === 'Basic Information') label = 'Basic Information';
          else if (route.name === 'Education') label = 'Education';
          else if (route.name === 'Experience') label = 'Experience';

          return (
            <Text
              style={{
                color: focused ? '#000' : '#888',
                fontSize: 12,
                marginTop: 5,
              }}>
              {label}
            </Text>
          );
        },
        tabBarIcon: ({color}) => {
          let icon;
          if (route.name === 'Basic Information') {
            icon = <Feather name="info" size={24} color="blue" />;
          } else if (route.name === 'Education') {
            icon = <MaterialIcons name="school" size={24} color="lightgreen" />;
          } else if (route.name === 'Experience') {
            icon = <MaterialIcons name="work" size={24} color="pink" />;
          }
          return icon;
        },
      })}>
      <Tab.Screen name="Basic Information" component={BasicInformation} />
      <Tab.Screen name="Education" component={Education} />
      <Tab.Screen name="Experience" component={Experience} />
    </Tab.Navigator>
  );
};

export default TopNavigationEmployeeProfile;
