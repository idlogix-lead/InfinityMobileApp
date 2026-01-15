import React from 'react';
import {View, Text} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Requests from '../../screens/Requests/Request';
import MyTasks from '../../screens/Requests/MyTasks';
import Search from '../../screens/Requests/Search';
import Account from '../../screens/Requests/Account';
import Inbox from '../../screens/Requests/Inbox';

const Tab = createBottomTabNavigator();

const BottomTabsReq = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'K2D-Bold',
          bottom: 10,
        },
        tabBarStyle: {
          height: 62,
          borderTopWidth: 0.5,
          borderTopColor: '#ccc',
          backgroundColor: '#eee',
        },
        tabBarIcon: ({focused, color, size}) => {
          let icon;

          switch (route.name) {
            case 'Home':
              icon = 'home';
              break;
            case 'MyTasks':
              icon = 'check-circle-outline';
              break;
            case 'Inbox':
              icon = 'notifications-none';
              break;
            case 'Search':
              icon = 'search';
              break;
            case 'Account':
              icon = 'person-outline';
              break;
          }

          return (
            <MaterialIcons
              name={icon}
              size={22}
              color={focused ? '#000' : '#777'}
            />
          );
        },
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#777',
      })}>
      <Tab.Screen name="Home" component={Requests} />
      <Tab.Screen name="MyTasks" component={MyTasks} />
      <Tab.Screen
        name="Inbox"
        component={Inbox}
        options={{
          tabBarIcon: ({focused}) => {
            const badgeCount = 2;

            return (
              <View style={{width: 26, height: 26}}>
                <MaterialIcons
                  name="notifications-none"
                  size={22}
                  color={focused ? '#000' : '#777'}
                />

                {badgeCount > 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      minWidth: 14,
                      height: 14,
                      borderRadius: 7,
                      backgroundColor: '#E74C3C',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 2,
                    }}>
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 9,
                        fontFamily: 'K2D-Bold',
                        lineHeight: 11,
                      }}>
                      {badgeCount}
                    </Text>
                  </View>
                )}
              </View>
            );
          },
        }}
      />

      <Tab.Screen name="Search" component={Search} />
      <Tab.Screen name="Account" component={Account} />
    </Tab.Navigator>
  );
};

export default BottomTabsReq;
