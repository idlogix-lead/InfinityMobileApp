import { StyleSheet, Text, View, Dimensions, Image, TouchableOpacity, Alert, ActivityIndicator, BackHandler, StatusBar, FlatList } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import Card from '../../components/ProfileScreenComponents/Card';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Feather from 'react-native-vector-icons/Feather'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Loader from '../../components/Loader';
import RBSheet from "react-native-raw-bottom-sheet";

const { height, width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const bottomSheetRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState('')
  const [multiUsers, setMultiUsers] = useState([])
  const [selectedUserName, setSelectedUserName] = useState('');
  const openBottomSheet = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.open();
    }
  };

  const getLoginUsers = async () => {
    const usersString = await AsyncStorage.getItem('usersData');
    const usersArray = usersString ? JSON.parse(usersString) : [];
    const userNames = usersArray.map(user => user.userName);
    console.log(userNames,'users')

    setMultiUsers(userNames);
  };

  const switchAccount = async (userName) => {
    const currentUserName = await AsyncStorage.getItem('userName');
    const closeBottomSheet = () => bottomSheetRef.current?.close();

    if (userName === currentUserName) {
        closeBottomSheet();
        return;
    }

    const usersString = await AsyncStorage.getItem('usersData');
    const usersArray = usersString ? JSON.parse(usersString) : [];
    const selectedUser = usersArray.find(user => user.userName === userName);
    console.log(selectedUser,'selectedUser')
    console.log(usersArray.map(user => user.userName),'ds'); 

    if (selectedUser) {
      await AsyncStorage.multiSet([
        ['protocol', selectedUser.protocol],
        ['host', selectedUser.host],
        ['port', selectedUser.port],
        ['userName', selectedUser.userName],
        ['clientId', selectedUser.clientId],
        ['clientName', selectedUser.clientName],
        ['roleId', selectedUser.roleId],
        ['organizationId', selectedUser.organizationId],
        ['warehouseId', selectedUser.warehouseId],
        ['tokenOk', selectedUser.tokenOk],
        ['token', selectedUser.token],
      ]).then(() => {
        navigation.navigate('FingerPrintScreen', {
          token: selectedUser.token,
          tokenOk: selectedUser.tokenOk,
          roleId: selectedUser.roleId
        });
        closeBottomSheet();
      });
    } else {
      console.log("Selected user not found in the stored data.");
    }
  };
  
  useEffect(() => {
    const getCurrentUser = async () => {
      const currentUser = await AsyncStorage.getItem('userName');
      console.log(currentUser,'currentUser')
      setSelectedUserName(currentUser);
      console.log(selectedUserName,'sdf')
    };

    getCurrentUser();
    getLoginUsers();
    switchAccount();
  }, []);


  const getName = async () => {
    setIsLoading(true)
    const value = await AsyncStorage.getItem('userName');
    setUserName(value)
    setIsLoading(false)
  }

  const navigateBack = () => {
    const unsubscribe = navigation.addListener('focus', () => {
      getName()
    });

    return unsubscribe;
  }

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    navigateBack()
    return () => backHandler.remove();
  }, [])


  const handlePressRole = async () => {
    const userName = await AsyncStorage.getItem('userName')
    const password = await AsyncStorage.getItem('password')
    const protocol = await AsyncStorage.getItem('protocol')
    const host = await AsyncStorage.getItem('host')
    const port = await AsyncStorage.getItem('port')
    await fetch(`${protocol}:${host}:${port}/api/v1/auth/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userName: userName,
        password: password
      }),
    })
      .then(response => response.text())
      .then(async (responseText) => {
        const responseJSON = JSON.parse(responseText);
        const token = responseJSON.token;
        const clientId = responseJSON.clients[0].id;
        const clientName = responseJSON.clients[0].name
        const checkedRem = true
        navigation.navigate('SelectRoleScreen', { token, clientId, clientName, protocol, host, port, checkedRem })
      })
  };

  const handlePressLogout = () => {
    Alert.alert(
      'Confirmation Action',
      'Do you want to LogOut?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Okay',
          onPress: async () => {
            console.log('handlePress logout')
            const token = await AsyncStorage.getItem('token');
            const tokenOk = await AsyncStorage.getItem('tokenOk');
            console.log(token, tokenOk)
            await AsyncStorage.removeItem('token').then(async () => {
              await AsyncStorage.removeItem('tokenOk').then(() => {
                console.log('remove all item')
                navigation.navigate('WelcomeScreen')
              })
            })
          }
        }
      ]
    );
  };

  return (
    <>
      <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center' }}>
        <StatusBar backgroundColor={'#0050C0'} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name='keyboard-backspace' color='#000' size={35} />
          </TouchableOpacity>
          <View style={styles.name}>
            <Text style={styles.nameTxt}>{userName}</Text>
          </View>
          <TouchableOpacity style={styles.helpCon}>
            <Text style={styles.help}>Help</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.accountCon}>
          <Text style={styles.userAccountTxt}>Your Account</Text>
        </View>
        <Card
          Icon={<FontAwesome name='wpforms' size={25} color='#877e7e' />}
          txt='Company Information'
          handlePress={() => navigation.navigate('CompanyInformationScreen')}
        />
        <Card
          Icon={<MaterialIcons name='co-present' size={25} color='#877e7e' />}
          txt='Preference' />
        <Card
          Icon={<MaterialIcons name='published-with-changes' size={25} color='#877e7e' />}
          txt='Change role '
          handlePress={() => { handlePressRole() }} />
        <Card
          Icon={<MaterialIcons name='feedback' size={25} color='#877e7e' />}
          txt='Feedback' />

        <View style={styles.accountCon}>
          <Text style={styles.userAccountTxt}>Support</Text>
        </View>

        <Card
          Icon={<MaterialIcons name='help' size={23} color='#877e7e' />}
          txt='Help' />

        <View style={styles.accountCon}>
          <Text style={styles.userAccountTxt}>Language</Text>
        </View>

        <Card
          Icon={<FontAwesome name='language' color='#877e7e' size={23} />}
          txt='English' />

        <View style={styles.accountCon}>
          <Text style={styles.userAccountTxt}>Login</Text>
        </View>

        <Card handlePress={openBottomSheet}
          Icon={<MaterialCommunityIcons name='plus-circle' color='#877e7e' size={23} />}
          txt='Add Account' />

        <RBSheet
          ref={bottomSheetRef}
          openDuration={250}
          closeOnDragDown={true}
          closeOnPressMask={false}
          customStyles={{
            container: {
              height: multiUsers.length * 65 + 100,
            }
          }}
        >
          <View>
          <FlatList
            data={multiUsers}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={[styles.BottomView,{justifyContent:'space-between'}]}
                    onPress={() => {
                        switchAccount(item.userName);
                        setSelectedUserName(item); 
                    }}
                >
                    <Text style={styles.MultiLogTxt}>{item}</Text>
                    <View style={styles.radioButton}>
                        {selectedUserName === item && <View style={styles.radioButtonSelected} />}
                    </View>
                </TouchableOpacity>
            )}
        />
            <TouchableOpacity onPress={() => navigation.navigate('WelcomeScreen')}
              style={styles.BottomView}>
              <MaterialCommunityIcons name='plus-circle' color='#877e7e' size={27} />
              <Text style={styles.MultiLogTxt}>Add Account</Text>
            </TouchableOpacity>

          </View>
        </RBSheet>

        <View style={{ width: '90%', marginTop: 15 }}>
          <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => handlePressLogout()}>
            <View style={{ height: height / 20, width: width / 10, justifyContent: 'center', alignItems: 'center' }} >
              <Feather name='log-out' color='#0050C0' size={25} />
            </View>
            <View style={{ justifyContent: 'center', marginLeft: 10 }}>
              <Text style={{ color: '#0050C0', fontSize: 20, fontFamily: 'K2D-Regular' }}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      {isLoading ? <Loader /> : null}

    </>
  )
}
export default ProfileScreen

const styles = StyleSheet.create({
  header: {
    height: height / 12,
    flexDirection: 'row',
    width: '95%',
    marginTop: 25
  },
  BottomView: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  backBtn: {
    padding: 15
  },
  name: {
    justifyContent: 'center',
    marginLeft: 10,
    width: '66%'
  },
  nameTxt: {
    color: 'black',
    fontSize: 24,
    fontFamily: 'K2D-Regular'
  },
  helpCon: {
    justifyContent: 'center',
    fontSize: 15,
  },
  help: {
    color: '#00B0F0',
    fontFamily: 'K2D-Regular',
    borderBottomColor: '#00B0F0',
    borderBottomWidth: 1
  },
  accountCon: {
    width: '90%',
    marginTop: 10
  },
  userAccountTxt: {
    color: 'black',
    fontSize: 24,
    fontFamily: 'K2D-Bold'
  },
  MultiLogTxt: {
    color: '#000',
    fontSize: 18,
    fontFamily: 'K2D-Bold',
    padding: 10
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
},
radioButtonSelected: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#0050C0',
},
})