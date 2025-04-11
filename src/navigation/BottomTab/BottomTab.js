
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



import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView } from 'react-native'
import React from 'react'
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import HomeScreen from '../../screens/HomeScreens/HomeScreen';
import HelpScreen from '../../screens/HelpScreen/HelpScreen';
import ProfileScreen from '../../screens/ProfileScreens/ProfileScreen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient'; // ✅ added

const Tab = createBottomTabNavigator();

// ✅ Custom Tab Bar with Linear Gradient
const CustomTabBar = (props) => (
    <LinearGradient
        colors={[ '#FFFFFF','#0057FF']} // your gradient colors
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 60 }}
    >
        <BottomTabBar {...props} />
    </LinearGradient>
);

const BottomTab = ({ route, navigation }) => {
    const { tokenOk, token, roleId } = route.params;

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Tab.Navigator
                tabBar={(props) => <CustomTabBar {...props} />} // ✅ use custom tab bar
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: 'transparent', // ✅ make it transparent to show gradient
                        position: 'absolute',
                        borderTopWidth: 0,
                        elevation: 0,
                        paddingVertical: 10,
                        height: 60,
                    },
                    tabBarIcon: ({ focused, color, size }) => {
                        let icon;
                        if (route.name === 'Home') {
                            icon = focused ? 'home' : 'home-outline';
                        } else if (route.name === 'Help') {
                            icon = focused ? 'headset' : 'headset';
                        } else if (route.name === 'Profile') {
                            icon = focused ? 'account' : 'account-outline';
                        }
                        return <MaterialCommunityIcons name={icon} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: 'white',
                    tabBarInactiveTintColor: '#ccc',
                })}
            >
                <Tab.Screen
                    name="Home"
                    component={HomeScreen}
                    initialParams={{ tokenOk, token, roleId }}
                />
                <Tab.Screen name="Help" component={HelpScreen} />
                <Tab.Screen name="Profile" component={ProfileScreen} />
            </Tab.Navigator>
        </SafeAreaView>
    );
};

export default BottomTab;

const styles = StyleSheet.create({});
