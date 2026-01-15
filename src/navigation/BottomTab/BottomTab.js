// import {StyleSheet, SafeAreaView, View} from 'react-native';
// import React from 'react';
// import {
//   createBottomTabNavigator,
//   BottomTabBar,
// } from '@react-navigation/bottom-tabs';
// import HomeScreen from '../../screens/HomeScreens/HomeScreen';
// import CrmScreen from '../../screens/CRMScreen/CrmScreen';
// import HelpScreen from '../../screens/HelpScreen/HelpScreen';
// import ProfileScreen from '../../screens/ProfileScreens/ProfileScreen';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// const Tab = createBottomTabNavigator();

// // Custom Solid Blue Tab Bar
// const CustomTabBar = props => (
//   <View style={{height: 50, backgroundColor: '#2F4FE3'}}>
//     <BottomTabBar {...props} />
//   </View>
// );

// const BottomTab = ({route}) => {
//   const {tokenOk, token, roleId} = route.params;

//   return (
//     <SafeAreaView style={{flex: 1}}>
//       <Tab.Navigator
//         tabBar={props => <CustomTabBar {...props} />}
//         screenOptions={({route}) => ({
//           headerShown: false,

//           // 👇👇👇👇  ICON LABELS OFF
//           tabBarShowLabel: false,

//           tabBarStyle: {
//             backgroundColor: 'transparent',
//             borderTopWidth: 0,
//             elevation: 0,
//             height: 40,
//             paddingVertical: 10,
//           },

//           tabBarIcon: ({focused, color, size}) => {
//             let icon;
//             if (route.name === 'Home') {
//               icon = focused ? 'home' : 'home';
//             } else if (route.name === 'Help') {
//               icon = focused ? 'all-inclusive' : 'all-inclusive';
//             } else if (route.name === 'Profile') {
//               icon = focused ? 'person' : 'person';
//             }
//             return <MaterialIcons name={icon} size={size} color={color} />;
//           },

//           tabBarActiveTintColor: 'white',
//           tabBarInactiveTintColor: '#ccc',
//         })}>
//         <Tab.Screen
//           name="Home"
//           component={HomeScreen}
//           initialParams={{tokenOk, token, roleId}}
//         />
//         <Tab.Screen name="Help" component={CrmScreen} />
//         <Tab.Screen name="Profile" component={ProfileScreen} />
//       </Tab.Navigator>
//     </SafeAreaView>
//   );
// };

// export default BottomTab;

// const styles = StyleSheet.create({});

import {SafeAreaView, StatusBar, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import HomeStack from '../Stacks/HomeStack';
import CRMStack from '../Stacks/CRMStacks';
import ApprovalStack from '../Stacks/ApprovalStack';
import RequestStack from '../Stacks/RequestStacks';
import EmployeeStack from '../Stacks/EmployeeStack';
import NotificationSrn from '../../screens/NotificationSrn/NotificationSrn';

const Tab = createBottomTabNavigator();

// Custom Tab Bar
const CustomTabBar = ({state, navigation}) => {
  const currentRouteName = state.routes[state.index].name;

  return (
    <View
      style={{flexDirection: 'row', height: 55, backgroundColor: '#2F4FE3'}}>
      {state.routes.map(route => {
        // <-- removed filter, now Home will show
        const isFocused = currentRouteName === route.name;
        // state.routes
        //   .filter(route => route.name !== 'HomeScreen')
        //   .map(route => {
        //     const isFocused = currentRouteName === route.name;

        let iconName;
        if (route.name === 'HomeScreen') iconName = 'home';
        if (route.name === 'CRM') iconName = 'all-inclusive';
        // if (route.name === 'Approval') iconName = 'check-circle';
        // if (route.name === 'Request') iconName = 'assignment';
        if (route.name === 'Employee') iconName = 'person';
        // if (route.name === 'Notification') iconName = 'notifications';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, {
              screen:
                route.name === 'HomeScreen'
                  ? 'HomeMain'
                  : route.name === 'CRM'
                  ? 'CRMMain'
                  : // : route.name === 'Approval'
                  // ? 'ApprovalMain'
                  // : route.name === 'Request'
                  // ? 'RequestMain'
                  route.name === 'Employee'
                  ? 'EmployeeMain'
                  : // : route.name === 'Notification'
                    // ? 'NotificationSrn'
                    undefined,
            });
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <MaterialIcons
              name={iconName}
              size={isFocused ? 30 : 24}
              color={isFocused ? '#fff' : '#cfd8ff'}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// BottomTab Navigator
const BottomTab = ({route}) => {
  const {token, tokenOk, roleId, userId} = route.params || {};

  return (
    <SafeAreaView style={{flex: 1}}>
      {/* Global StatusBar */}
      <StatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent={false}
      />

      <Tab.Navigator
        initialRouteName="HomeScreen"
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={{headerShown: false}}>
        <Tab.Screen
          name="HomeScreen"
          component={HomeStack}
          initialParams={{token, tokenOk, roleId, userId}}
        />
        <Tab.Screen
          name="CRM"
          component={CRMStack}
          initialParams={{token, tokenOk, roleId, userId}}
          options={{unmountOnBlur: true}}
        />
        {/* <Tab.Screen
          name="Approval"
          component={ApprovalStack}
          initialParams={{token, tokenOk, roleId, userId}}
          options={{unmountOnBlur: true}}
        /> */}
        {/* <Tab.Screen
          name="Request"
          component={RequestStack}
          initialParams={{token, tokenOk, roleId, userId}}
          options={{unmountOnBlur: true}}
        /> */}
        <Tab.Screen
          name="Employee"
          component={EmployeeStack}
          initialParams={{token, tokenOk, roleId, userId}}
          options={{unmountOnBlur: true}}
        />
        {/* <Tab.Screen
          name="Notification"
          component={NotificationSrn}
          initialParams={{token, tokenOk, roleId, userId}}
          options={{unmountOnBlur: true}}
        /> */}
      </Tab.Navigator>
    </SafeAreaView>
  );
};

export default BottomTab;
