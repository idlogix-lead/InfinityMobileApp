import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  BackHandler,
  StatusBar,
  FlatList,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import Card from '../../components/ProfileScreenComponents/Card';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Loader from '../../components/Loader';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useAuthStore } from '../../store/authStore'; 
import { useBasicLogin } from '../../hooks/useAuth'; 

const {height, width} = Dimensions.get('window');

const ProfileScreen = ({navigation}) => {
  const bottomSheetRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [multiUsers, setMultiUsers] = useState([]);
  const [selectedUserIdentifier, setSelectedUserIdentifier] = useState('');
  
  // Get auth state and actions from store
  const {
    userName,
    userId,
    roleId,
    token,
    serverConfig,
    logout,
    setAuthData,
    setServerConfig,
    setRoleData,
    checkAuthState
  } = useAuthStore();
  
  const basicLoginMutation = useBasicLogin();

  const openBottomSheet = () => bottomSheetRef.current?.open();

  const generateUserIdentifier = (user) => {
    return `${user.userName}-${user.protocol}-${user.host}-${user.port}-${user.clientId}`;
  };

  const getLoginUsers = async () => {
    try {
      const usersString = await AsyncStorage.getItem('usersData');
      const usersArray = usersString ? JSON.parse(usersString) : [];
      setMultiUsers(usersArray);
    } catch (error) {
      console.error('Error getting login users:', error);
    }
  };

  const switchAccount = async (identifier) => {
    try {
      const currentUserIdentifier = await AsyncStorage.getItem(
        'currentUserIdentifier',
      );
      
      if (identifier === currentUserIdentifier) {
        bottomSheetRef.current?.close();
        return;
      }

      const selectedUser = multiUsers.find(
        user => generateUserIdentifier(user) === identifier,
      );
      
      if (selectedUser) {
        // Update server config in store
        setServerConfig({
          protocol: selectedUser.protocol,
          host: selectedUser.host,
          port: selectedUser.port,
        });

        // Update auth data in store
        setAuthData({
          userName: selectedUser.userName,
          password: selectedUser.password,
          token: selectedUser.token,
          tokenOk: selectedUser.tokenOk || 'true',
          userId: selectedUser.userId,
          clientId: selectedUser.clientId,
          clientName: selectedUser.clientName,
          roleId: selectedUser.roleId,
          roleName: selectedUser.roleName,
          organizationId: selectedUser.organizationId,
          organizationName: selectedUser.organizationName,
          warehouseId: selectedUser.warehouseId,
          warehouseName: selectedUser.warehouseName,
        });

        // Update AsyncStorage for multi-user support
        await AsyncStorage.multiSet([
          ['currentUserIdentifier', identifier],
          ['userName', selectedUser.userName],
          ['password', selectedUser.password],
          ['protocol', selectedUser.protocol],
          ['host', selectedUser.host],
          ['port', selectedUser.port],
          ['clientId', selectedUser.clientId],
          ['clientName', selectedUser.clientName],
          ['roleId', selectedUser.roleId],
          ['organizationId', selectedUser.organizationId],
          ['warehouseId', selectedUser.warehouseId],
          ['token', selectedUser.token],
          ['tokenOk', selectedUser.tokenOk || 'true'],
        ]);

        // Navigate to splash or refresh
        navigation.navigate('SplashScreen');
        bottomSheetRef.current?.close();
      } else {
        console.log('Selected user not found in the stored data.');
      }
    } catch (error) {
      console.error('Error switching account:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        // Get current user data from AsyncStorage
        const currentUser = {
          userName: await AsyncStorage.getItem('userName'),
          password: await AsyncStorage.getItem('password'),
          protocol: await AsyncStorage.getItem('protocol'),
          host: await AsyncStorage.getItem('host'),
          port: await AsyncStorage.getItem('port'),
          clientId: await AsyncStorage.getItem('clientId'),
          clientName: await AsyncStorage.getItem('clientName'),
          roleId: await AsyncStorage.getItem('roleId'),
          organizationId: await AsyncStorage.getItem('organizationId'),
          warehouseId: await AsyncStorage.getItem('warehouseId'),
        };
        
        const currentUserIdentifier = generateUserIdentifier(currentUser);
        await AsyncStorage.setItem(
          'currentUserIdentifier',
          currentUserIdentifier,
        );
        setSelectedUserIdentifier(currentUserIdentifier);
        getLoginUsers();
      } catch (error) {
        console.error('Error initializing profile:', error);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [navigation]);

  const handlePressRole = async () => {
    try {
      // Get credentials from store
      const { userName, password, serverConfig } = useAuthStore.getState();
      
      if (!userName || !password || !serverConfig.protocol) {
        Alert.alert('Error', 'Missing login information');
        return;
      }

      // Make login request
      const response = await fetch(
        `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.port}/api/v1/auth/tokens`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userName: userName,
            password: password,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`);
      }

      const responseText = await response.text();
      const responseJSON = JSON.parse(responseText);
      const token = responseJSON.token;
      const clientId = responseJSON.clients?.[0]?.id;
      const clientName = responseJSON.clients?.[0]?.name;

      if (!token || !clientId) {
        throw new Error('Invalid response from server');
      }

      // Navigate to SelectRoleScreen
      navigation.navigate('SelectRoleScreen', {
        token,
        clientId,
        clientName,
        protocol: serverConfig.protocol,
        host: serverConfig.host,
        port: serverConfig.port,
        fromProfile: true,
      });
    } catch (error) {
      console.error('Error in handlePressRole:', error);
      Alert.alert('Error', 'Failed to get roles. Please try again.');
    }
  };

  const navigateToSelectRole = async () => {
    const { token, clientId, clientName, serverConfig } = useAuthStore.getState();
    
    if (!token || !clientId) {
      Alert.alert('Error', 'No active session found');
      return;
    }

    navigation.navigate('SelectRoleScreen', {
      token,
      clientId,
      clientName,
      protocol: serverConfig.protocol,
      host: serverConfig.host,
      port: serverConfig.port,
      fromProfile: true,
    });
  };

 const handlePressLogout = async () => {
  Alert.alert('Confirmation', 'Do you want to Logout?', [
    {text: 'Cancel', style: 'cancel'},
    {
      text: 'Logout',
      style: 'destructive',
      onPress: async () => {
        try {
          // Remove current user from multi-user storage
          const usersDataString = await AsyncStorage.getItem('usersData');
          if (usersDataString) {
            let usersData = JSON.parse(usersDataString);
            const currentUserIdentifier = await AsyncStorage.getItem(
              'currentUserIdentifier',
            );
            usersData = usersData.filter(
              user => generateUserIdentifier(user) !== currentUserIdentifier,
            );
            await AsyncStorage.setItem('usersData', JSON.stringify(usersData));
          }

          // IMPORTANT: DO NOT remove userName and password here!
          // They should be preserved by Zustand's persist middleware
          // Only remove session-specific data
          const keysToRemove = [
            'currentUserIdentifier',
            // 'userName',        // REMOVE THIS LINE
            // 'password',        // REMOVE THIS LINE
            'clientId',
            'clientName',
            'roleId',
            'organizationId',
            'warehouseId',
            'tokenOk',
            'token',
          ];
          await AsyncStorage.multiRemove(keysToRemove);

          // Clear Zustand store (logout function should preserve credentials)
          logout();

          // Navigate to WelcomeScreen
          navigation.reset({
            index: 0,
            routes: [{ name: 'WelcomeScreen' }],
          });
          
        } catch (error) {
          console.error('Error during logout:', error);
          Alert.alert('Error', 'Failed to logout properly');
        }
      },
    },
  ]);
};

  const handleAddAccount = () => {
    bottomSheetRef.current?.close();
    navigation.reset({
      index: 0,
      routes: [{ name: 'WelcomeScreen' }],
    });
  };

  return (
    <>
      <View style={{flex: 1, backgroundColor: 'white', alignItems: 'center'}}>
        <StatusBar backgroundColor={'#0050C0'} />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons
              name="keyboard-backspace"
              color="#000"
              size={35}
            />
          </TouchableOpacity>
          <View style={styles.name}>
            <Text style={styles.nameTxt}>{userName || 'User'}</Text>
            {userId && userId !== userName && (
              <Text style={styles.userIdTxt}>ID: {userId}</Text>
            )}
            {roleId && (
              <Text style={styles.roleTxt}>Role ID: {roleId}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.helpCon}>
            <Text style={styles.help}>Help</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.accountCon}>
          <Text style={styles.userAccountTxt}>Your Account</Text>
        </View>
        <Card
          Icon={<FontAwesome name="wpforms" size={25} color="#877e7e" />}
          txt="Company Information"
          handlePress={() => navigation.navigate('CompanyInformationScreen')}
        />
        <Card
          Icon={<MaterialIcons name="co-present" size={25} color="#877e7e" />}
          txt="Preferences"
          handlePress={() => {/* Navigate to preferences */}}
        />
        <Card
          Icon={
            <MaterialIcons
              name="published-with-changes"
              size={25}
              color="#877e7e"
            />
          }
          txt="Change Role"
          handlePress={handlePressRole}
        />
        <Card
          Icon={<MaterialIcons name="feedback" size={25} color="#877e7e" />}
          txt="Feedback"
          handlePress={() => {/* Navigate to feedback */}}
        />

        <View style={styles.accountCon}>
          <Text style={styles.userAccountTxt}>Support</Text>
        </View>

        <Card
          Icon={<MaterialIcons name="help" size={23} color="#877e7e" />}
          txt="Help & Support"
          handlePress={() => {/* Navigate to help */}}
        />

        <View style={styles.accountCon}>
          <Text style={styles.userAccountTxt}>Language</Text>
        </View>

        <Card
          Icon={<FontAwesome name="language" color="#877e7e" size={23} />}
          txt="English"
          handlePress={() => {/* Open language selector */}}
        />

        <View style={styles.accountCon}>
          <Text style={styles.userAccountTxt}>Login</Text>
        </View>

        <Card
          handlePress={openBottomSheet}
          Icon={
            <MaterialCommunityIcons
              name="plus-circle"
              color="#877e7e"
              size={23}
            />
          }
          txt="Switch Account"
        />

        <RBSheet
          ref={bottomSheetRef}
          openDuration={250}
          closeOnDragDown={true}
          closeOnPressMask={false}
          customStyles={{
            container: {
              height: Math.min(multiUsers.length * 65 + 150, height * 0.7),
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            },
          }}>
          <View style={styles.bottomSheetContent}>
            <Text style={styles.bottomSheetTitle}>Switch Account</Text>
            <FlatList
              data={multiUsers}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => {
                const identifier = generateUserIdentifier(item);
                return (
                  <TouchableOpacity
                    style={[
                      styles.accountItem,
                      selectedUserIdentifier === identifier && styles.selectedAccountItem,
                    ]}
                    onPress={() => switchAccount(identifier)}>
                    <View style={styles.accountInfo}>
                      <Text style={styles.accountName}>{item.userName}</Text>
                      <Text style={styles.accountClient}>{item.clientName || 'No Client'}</Text>
                    </View>
                    <View style={styles.radioButton}>
                      {selectedUserIdentifier === identifier && (
                        <View style={styles.radioButtonSelected} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyAccounts}>
                  <Text style={styles.emptyText}>No other accounts</Text>
                </View>
              }
            />
            <TouchableOpacity
              onPress={handleAddAccount}
              style={styles.addAccountButton}>
              <MaterialCommunityIcons
                name="plus-circle"
                color="#0050C0"
                size={27}
              />
              <Text style={styles.addAccountText}>Add New Account</Text>
            </TouchableOpacity>
          </View>
        </RBSheet>

        <View style={{width: '90%', marginTop: 15}}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handlePressLogout}>
            <View style={styles.logoutIcon}>
              <Feather name="log-out" color="#0050C0" size={25} />
            </View>
            <View style={styles.logoutTextContainer}>
              <Text style={styles.logoutText}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      {isLoading && <Loader />}
    </>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  header: {
    height: height / 12,
    flexDirection: 'row',
    width: '95%',
    marginTop: 25,
    alignItems: 'center',
  },
  backBtn: {
    padding: 10,
  },
  name: {
    justifyContent: 'center',
    marginLeft: 10,
    flex: 1,
  },
  nameTxt: {
    color: 'black',
    fontSize: 24,
    fontFamily: 'K2D-Regular',
    fontWeight: 'bold',
  },
  userIdTxt: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'K2D-Regular',
    marginTop: 2,
  },
  roleTxt: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'K2D-Regular',
    marginTop: 1,
  },
  helpCon: {
    justifyContent: 'center',
    padding: 10,
  },
  help: {
    color: '#00B0F0',
    fontFamily: 'K2D-Regular',
    borderBottomColor: '#00B0F0',
    borderBottomWidth: 1,
  },
  accountCon: {
    width: '90%',
    marginTop: 20,
    marginBottom: 10,
  },
  userAccountTxt: {
    color: 'black',
    fontSize: 20,
    fontFamily: 'K2D-Bold',
    fontWeight: '600',
  },
  bottomSheetContent: {
    padding: 20,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontFamily: 'K2D-Bold',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedAccountItem: {
    backgroundColor: '#f0f8ff',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    color: '#000',
    fontSize: 18,
    fontFamily: 'K2D-Regular',
    fontWeight: '500',
  },
  accountClient: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'K2D-Regular',
    marginTop: 2,
  },
  radioButton: {
    height: 22,
    width: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#0050C0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#0050C0',
  },
  emptyAccounts: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    fontFamily: 'K2D-Regular',
  },
  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginTop: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addAccountText: {
    color: '#0050C0',
    fontSize: 18,
    fontFamily: 'K2D-Bold',
    marginLeft: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  logoutIcon: {
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutTextContainer: {
    justifyContent: 'center',
    marginLeft: 15,
  },
  logoutText: {
    color: '#0050C0',
    fontSize: 20,
    fontFamily: 'K2D-Regular',
    fontWeight: '500',
  },
});