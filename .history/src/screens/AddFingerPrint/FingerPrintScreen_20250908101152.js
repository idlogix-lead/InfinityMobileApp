import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import TouchID from 'react-native-touch-id';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FingerPrintScreen = ({route, navigation}) => {
  const {token, tokenOk, roleId, userId} = route.params;

  const addFinerPrint = async () => {
    // TouchID.authenticate('Authenticate with fingerprint')
    //     .then(async(fingerprintData) => {
    //     })
    //     .catch(() => {
    //         console.log('Authentication error');
    //     });
    await AsyncStorage.setItem('token', token);
    navigation.navigate('BottomTab', {token, tokenOk, roleId, userId});
  };
  useEffect(() => {
    addFinerPrint();
    const backAction = () => {
      BackHandler.exitApp();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, []);

  const LoggedAccount = async () => {
    const existingUsersString = await AsyncStorage.getItem('usersData');
    const existingUsers = existingUsersString
      ? JSON.parse(existingUsersString)
      : [];
    // console.log(existingUsers,'sa')
    const newUser = {
      protocol: await AsyncStorage.getItem('protocol'),
      host: await AsyncStorage.getItem('host'),
      port: await AsyncStorage.getItem('port'),
      userName: await AsyncStorage.getItem('userName'),
      password: await AsyncStorage.getItem('password'),
      clientName: await AsyncStorage.getItem('clientName'),
      clientId: await AsyncStorage.getItem('clientId'),
      roleId: await AsyncStorage.getItem('roleId'),
      organizationId: await AsyncStorage.getItem('organizationId'),
      warehouseId: await AsyncStorage.getItem('warehouseId'),
      tokenOk: await AsyncStorage.getItem('tokenOk'),
      userId: await AsyncStorage.getItem('userId'),
      token: await AsyncStorage.getItem('token'),
    };
    const userExists = existingUsers.some(
      user =>
        user.protocol === newUser.protocol &&
        user.host === newUser.host &&
        user.port === newUser.port &&
        user.userName === newUser.userName &&
        user.password === newUser.password &&
        user.clientId === newUser.clientId &&
        user.roleId === newUser.roleId &&
        user.organizationId === newUser.organizationId &&
        user.warehouseId === newUser.warehouseId,
    );

    if (!userExists) {
      const updatedUsers = [...existingUsers, newUser];
      await AsyncStorage.setItem('usersData', JSON.stringify(updatedUsers));
    }
  };

  useEffect(() => {
    LoggedAccount();
  }, []);

  useEffect(() => {
    if (!token || !tokenOk || !userId || !roleId) {
      console.error('One or more required parameters are undefined.');
    } else {
      addFinerPrint();
    }
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
      }}>
      <Text style={{color: 'black'}}>You must have to add. </Text>
      <TouchableOpacity onPress={() => addFinerPrint()}>
        <Text style={{color: '#800000'}}>FingerPrint</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FingerPrintScreen;
