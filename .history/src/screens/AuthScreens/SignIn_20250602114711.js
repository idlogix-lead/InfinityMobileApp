import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Picker} from '@react-native-picker/picker';
import {CheckBox} from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/dist/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/dist/Ionicons';
import FontAwesome from 'react-native-vector-icons/dist/FontAwesome';

const {height, width} = Dimensions.get('window');

const SignIn = ({navigation}) => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const options = [
    // { label: 'Select Language', value: 'Select Language' },
    {label: 'English', value: 'English'},
    // { label: 'Urdu', value: 'Urdu' },
  ];
  const [checked, setChecked] = useState(false);
  const [checkedRem, setCheckedRem] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  let protocol, host, port;

  const handleCheckedChange = () => {
    setChecked(!checked);
  };

  const handleCheckedRem = () => {
    setCheckedRem(!checkedRem);
  };

  const login = async () => {
    setIsLoading(true); // Begin loading

    // Validation
    if (!userName.trim()) {
      alert('Please enter userName');
      setIsLoading(false);
      return;
    } else if (!password.trim()) {
      alert('Please enter password');
      setIsLoading(false);
      return;
    }

    // Prepare for API call
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');

    try {
      // Attempt to login
      const loginResponse = await fetch(
        `${protocol}://${host}:${port}/api/v1/auth/tokens`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({userName, password}),
        },
      );

      if (!loginResponse.ok) {
        throw new Error(
          'Authentication failed. Please check your credentials.',
        );
      }

      const {token, clients} = await loginResponse.json();
      const clientId = clients[0].id;
      const clientName = clients[0].name;

      // Store relevant data in AsyncStorage
      await AsyncStorage.multiSet([
        ['tokenLogin', token],
        ['userName', userName],
        ['password', password],
        ['clientId', clientId.toString()],
        ['clientName', clientName],
      ]);

      if (checked) {
        navigation.navigate('SelectRoleScreen', {
          token,
          clientId,
          clientName,
          protocol,
          host,
          port,
          checkedRem,
        });
        setIsLoading(false);
        return;
      }

      const sessionResponse = await fetch(
        `${protocol}://${host}:${port}/api/v1/auth/tokens`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            clientId,
            roleId: await AsyncStorage.getItem('roleId'),
            organizationId: await AsyncStorage.getItem('organizationId'),
            warehouseId: await AsyncStorage.getItem('warehouseId'),
            language: 'en_US',
          }),
        },
      );

      if (!sessionResponse.ok) {
        throw new Error('Session creation failed. Please try again.');
      }

      const sessionData = await sessionResponse.json();
      await AsyncStorage.multiSet([
        ['token', sessionData.token],
        ['tokenOk', sessionData.userId.toString()],
      ]);

      navigation.navigate(
        userName.trim() === getPreUser
          ? 'FingerPrintScreen'
          : 'SelectRoleScreen',
        {
          token: sessionData.token,
          tokenOk: sessionData.userId,
          roleId: await AsyncStorage.getItem('roleId'),
        },
      );
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false); // End loading
    }
  };

  const navigateBack = () => {
    const unsubscribe = navigation.addListener('focus', async () => {
      protocol = await AsyncStorage.getItem('protocol');
      host = await AsyncStorage.getItem('host');
      port = await AsyncStorage.getItem('port');
      setUserName('');
      setPassword('');
      setChecked(false);
      setCheckedRem(false);
      setIsLoading(false);
    });

    return unsubscribe;
  };

  useEffect(() => {
    navigateBack();

    const backAction = () => {
      navigation.navigate('WelcomeScreen');
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [navigation]);

  return (
    <>
      {isLoading && (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator size="large" color="#0050C0" />
        </View>
      )}
      {!isLoading && (
        <View
          style={{
            flex: 1,
            //  backgroundColor: '#0050C0'
            backgroundColor: '#fff',
          }}>
          {/* First image */}
          <View style={styles.imageCon}>
            <Image
              // source={require('../../asserts/splashScreenAsserts/infinityLoginIcon.png')}
              source={require('../../asserts/WelcomeSrn/icon-erp167.png')}
              style={{
                height: height / 5.8,
                width: width / 1.8,
                marginTop: '40%',
              }}
            />
          </View>

          <View style={styles.inpucontainer}>
            <View>
              <Text
                style={{
                  marginTop: '5%',
                  fontSize: 20,
                  fontWeight: '800',
                  color: 'black',
                  paddingLeft: '3%',
                }}>
                Welcome
              </Text>
              <Text style={{color: 'gray', paddingLeft: '3%', fontSize: 16}}>
                Login to access your account
              </Text>
            </View>
            {/* First input */}
            <View
              style={{
                marginTop: 12,
                flexDirection: 'row',
                alignSelf: 'center',
              }}>
              <TextInput
                onChangeText={text => setUserName(text)}
                value={userName}
                placeholder="Enter your Name"
                placeholderTextColor="black"
                style={styles.input}
              />
              {/* <View style={styles.imageContainer}>

                                <MaterialCommunityIcons name='account-circle-outline' size={24} color='white' />
                            </View> */}
            </View>

            {/* Second input */}
            <View
              style={{
                marginTop: 20,
                flexDirection: 'row',
                alignSelf: 'center',
              }}>
              <TextInput
                onChangeText={text => setPassword(text)}
                value={password}
                placeholder="Enter your Password"
                placeholderTextColor="black"
                style={styles.input}
                secureTextEntry
              />
              {/* <View style={styles.imageContainer}>

                                <MaterialIcons name='lock-outline' size={24} color='white' />
                            </View> */}
            </View>

            <View style={styles.pickerStyle}>
              <Picker
                selectedValue={selectedValue}
                onValueChange={(itemValue, itemIndex) =>
                  setSelectedValue(itemValue)
                }
                style={styles.pickerItem}
                dropdownIconColor={'black'}>
                {options.map(option => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>

            {/* Check box */}
            <View style={{alignItems: 'center', marginTop: 40}}>
              <View style={styles.checkBoxCon}>
                <View style={{flexDirection: 'row'}}>
                  <View style={{width: width / 1.6}}>
                    <Text style={styles.checkBoxTxt}>Select role</Text>
                  </View>
                  <CheckBox
                    checked={checked}
                    onPress={handleCheckedChange}
                    containerStyle={{
                      borderColor: 'black',
                      width: width / 15.5,
                      height: height / 30,
                      borderWidth: 0.5,
                      borderRadius: 5,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#fff',
                    }}
                    checkedIcon={
                      <View style={{height: 30, width: 30}}>
                        <Ionicons
                          name="checkmark-sharp"
                          color="black"
                          size={30}
                        />
                      </View>
                    }
                    uncheckedIcon={
                      <View style={{backgroundColor: 'white'}}></View>
                    }
                  />
                </View>
                <View style={{flexDirection: 'row'}}>
                  <View style={{width: width / 1.6}}>
                    <Text style={styles.checkBoxTxt}>Remember me</Text>
                  </View>
                  <CheckBox
                    checked={checkedRem}
                    onPress={handleCheckedRem}
                    containerStyle={{
                      borderColor: 'black',
                      width: width / 15.5,
                      height: height / 30,
                      borderRadius: 5,
                      borderWidth: 0.5,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'white',
                    }}
                    checkedIcon={
                      <View style={{height: 30, width: 30}}>
                        <Ionicons
                          name="checkmark-sharp"
                          color="black"
                          size={30}
                        />
                      </View>
                    }
                    uncheckedIcon={
                      <View style={{backgroundColor: 'white'}}></View>
                    }
                  />
                </View>
              </View>
            </View>

            {/* Button */}
            <View style={styles.btnCotainer}>
              <TouchableOpacity style={styles.btn} onPress={() => login()}>
                <Text style={styles.btnTxt}>Login</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('WelcomeScreen')}
              style={styles.WelcomeScreenButton}>
              <FontAwesome name="gear" size={30} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  imageCon: {
    alignItems: 'center',
    justifyContent: 'center',
    height: height / 7,
    width: width,

    // alignItems: 'center',
    // justifyContent: 'center',
    // height: height / 4.2,
    // width: width,
  },
  middleContainer: {
    alignItems: 'center',
  },
  txt: {
    fontSize: 32,
    fontFamily: 'K2D-Bold',
    color: '#800000',
    textShadowColor: 'black',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 3,
  },
  txt2: {
    fontSize: 32,
    fontFamily: 'K2D-Bold',
    color: '#330000',
    textShadowColor: 'black',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 3,
  },
  topMiddleText: {
    flexDirection: 'row',
  },
  input: {
    width: width / 1.5,
    // borderBottomColor: 'white',
    // borderBottomWidth: 1,
    color: 'black',
    fontFamily: 'K2D-Regular',
    backgroundColor: '#DCDADA',
    width: '90%',
    borderRadius: 10,
  },
  inpucontainer: {
    // marginTop: height / 7,
    // alignItems: 'center'

    marginTop: height / 8,
    // backgroundColor:"gray"
    backgroundColor: '#f1f1f1',
    width: '95%',
    alignSelf: 'center',
    borderRadius: 10,
  },
  imageInput: {
    height: height / 20,
    width: width / 10,
  },
  imageContainer: {
    // borderBottomColor: 'white',
    // borderBottomWidth: 1,
    backgroundColor: '#DCDADA',
  },
  pickerStyle: {
    width: width / 1.3,
    // borderBottomColor: 'white',
    // borderBottomWidth: 1,
    marginTop: 20,
    backgroundColor: '#DCDADA',
    width: '90%',
    alignSelf: 'center',
    borderRadius: 10,
  },
  pickerItem: {
    color: 'black',
    fontFamily: 'K2D-Regular',
  },
  checkBoxCon: {
    width: width / 1.3,
  },
  checkBoxTxt: {
    fontSize: 16,
    fontFamily: 'K2D-SemiBold',
    color: 'black',
  },
  btnCotainer: {
    // alignItems: 'center',
    // marginTop: height / 12
    alignItems: 'center',
    marginTop: height / 10,
  },
  btnTxt: {
    // color: 'white',
    // fontSize: 16,
    // fontFamily: 'K2D'
    color: 'white',
    fontSize: 16,
    fontFamily: 'K2D',
  },
  btn: {
    backgroundColor: '#002E62',
    width: width / 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    height: height / 16,
    borderRadius: 10,
    marginBottom: '10%',
    marginTop: '-5%',
  },
  WelcomeScreenButton: {
    // marginTop: 100,
    alignSelf: 'flex-end',
    marginRight: 20,
    backgroundColor: '#fff',
    height: 60,
    width: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderShadowColor: '#000',
    borderShadowOpacity: 0.25,
    borderShadowRadius: 3.84,
    elevation: 5,
  },
});
