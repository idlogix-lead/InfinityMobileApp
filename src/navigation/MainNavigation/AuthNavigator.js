import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SplashScreen from '../../screens/SplashScreen/SplashScreen';
import WelcomeScreen from '../../screens/WelcomeScreen/WelcomeScreen';
import SignIn from '../../screens/AuthScreens/SignIn';
import SelectRoleScreen from '../../screens/SelectRoleScreens/SelectRoleScreen';
import FingerPrintScreen from '../../screens/AddFingerPrint/FingerPrintScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="SelectRoleScreen" component={SelectRoleScreen} />
      <Stack.Screen name="FingerPrintScreen" component={FingerPrintScreen} />
      
    </Stack.Navigator>
  );
};

export default AuthNavigator;