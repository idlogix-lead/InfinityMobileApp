// import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView } from 'react-native'
// import React, { useEffect, useState } from 'react'
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import HomeScreen from '../../screens/HomeScreens/HomeScreen';
// import HelpScreen from '../../screens/HelpScreen/HelpScreen';
// import ProfileScreen from '../../screens/ProfileScreens/ProfileScreen';
// import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';

// const Tab = createBottomTabNavigator();

// const BottomTab = ({ route, navigation }) => {
//     const { tokenOk, token, roleId } = route.params

//     return (
//         <SafeAreaView style={{ flex: 1 }}>
//             <Tab.Navigator
//                 screenOptions={({ route }) => ({
//                     headerShown: false,
//                     tabBarStyle: {
//                         //  backgroundColor: "#0050C0",
//                         // backgroundColor: "#002E62",
//                         backgroundColor: "red",
//                          paddingVertical: 10, height: 60,},
//                     tabBarIcon: ({ focused, color, size }) => {

//                         let icon;

//                         if (route.name === 'Home') {
//                             icon = focused ? 'home' : 'home-outline';
//                         } else if (route.name === 'Help') {
//                             icon = focused ? 'headset' : 'headset';
//                         } else if (route.name === 'Profile') {
//                             icon = focused ? 'account' : 'account-outline';
//                         }

//                         // You can return any component that you like here!
//                         return <MaterialCommunityIcons name={icon} size={size} color={color} />;
//                     },
//                 })}

//             >
//                 <Tab.Screen options={{ tabBarActiveTintColor: 'white' }}
//                     name="Home"
//                     component={HomeScreen}
//                     initialParams={{ tokenOk, token, roleId }} />
//                 <Tab.Screen
//                     options={{ tabBarActiveTintColor: 'white' }}
//                     name="Help" component={HelpScreen} />
//                 <Tab.Screen
//                     options={{ tabBarActiveTintColor: 'white' }}
//                     name="Profile" component={ProfileScreen} />
//             </Tab.Navigator>
//         </SafeAreaView>
//     )
// }

// export default BottomTab

// const styles = StyleSheet.create({})

import {StyleSheet, SafeAreaView, View} from 'react-native';
import React from 'react';
import {
  createBottomTabNavigator,
  BottomTabBar,
} from '@react-navigation/bottom-tabs';
import HomeScreen from '../../screens/HomeScreens/HomeScreen';
import CrmScreen from '../../screens/CRMScreen/CrmScreen';
import HelpScreen from '../../screens/HelpScreen/HelpScreen';
import ProfileScreen from '../../screens/ProfileScreens/ProfileScreen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator();

// Custom Solid Blue Tab Bar
const CustomTabBar = props => (
  <View style={{height: 50, backgroundColor: '#2F4FE3'}}>
    <BottomTabBar {...props} />
  </View>
);

const BottomTab = ({route}) => {
  const {tokenOk, token, roleId} = route.params;

  return (
    <SafeAreaView style={{flex: 1}}>
      <Tab.Navigator
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={({route}) => ({
          headerShown: false,

          // 👇👇👇👇  ICON LABELS OFF
          tabBarShowLabel: false,

          tabBarStyle: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            height: 40,
            paddingVertical: 10,
          },

          tabBarIcon: ({focused, color, size}) => {
            let icon;
            if (route.name === 'Home') {
              icon = focused ? 'home' : 'home';
            } else if (route.name === 'Help') {
              icon = focused ? 'all-inclusive' : 'all-inclusive';
            } else if (route.name === 'Profile') {
              icon = focused ? 'person' : 'person';
            }
            return <MaterialIcons name={icon} size={size} color={color} />;
          },

          tabBarActiveTintColor: 'white',
          tabBarInactiveTintColor: '#ccc',
        })}>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          initialParams={{tokenOk, token, roleId}}
        />
        <Tab.Screen name="Help" component={CrmScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

export default BottomTab;

const styles = StyleSheet.create({});
