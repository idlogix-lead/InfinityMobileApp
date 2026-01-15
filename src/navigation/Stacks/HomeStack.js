import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../../screens/HomeScreens/HomeScreen';

const Stack = createNativeStackNavigator();

const HomeStack = ({route}) => {
  const {token, tokenOk, roleId, userId} = route.params || {};

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        initialParams={{token, tokenOk, roleId, userId}}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;
