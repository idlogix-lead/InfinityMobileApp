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
  Modal,
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

const {height, width} = Dimensions.get('window');

const ProfileScreen = ({navigation}) => {
  const bottomSheetRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [multiUsers, setMultiUsers] = useState([]);
  const [showSwitchAccountModal, setShowSwitchAccountModal] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState([]);
  
  // Get auth state and actions from store
  const {
    userName,
    userId,
    roleId,
    roleName,
    clientName,
    organizationName,
    warehouseName,
    logout
  } = useAuthStore();
  
  const openBottomSheet = () => bottomSheetRef.current?.open();

  // Load saved accounts on component mount
  useEffect(() => {
    loadSavedAccounts();
  }, []);

  // Load saved accounts from AsyncStorage
  const loadSavedAccounts = async () => {
    try {
      const savedAccountsStr = await AsyncStorage.getItem('saved_accounts');
      if (savedAccountsStr) {
        const accounts = JSON.parse(savedAccountsStr);
        setSavedAccounts(accounts);
      }
    } catch (error) {
      console.error('Error loading saved accounts:', error);
    }
  };

  // Save current account to saved accounts
  const saveCurrentAccount = async () => {
    try {
      const state = useAuthStore.getState();
      const { userName, clientName, roleName, organizationName, warehouseName } = state;
      
      if (!userName) return;
      
      const newAccount = {
        id: Date.now().toString(),
        userName,
        clientName: clientName || 'Unknown Client',
        roleName: roleName || 'Unknown Role',
        organizationName: organizationName || 'Unknown Organization',
        warehouseName: warehouseName || 'Unknown Warehouse',
        timestamp: new Date().toISOString(),
      };
      
      let updatedAccounts = [...savedAccounts];
      
      // Check if account already exists
      const existingIndex = updatedAccounts.findIndex(acc => acc.userName === userName);
      if (existingIndex !== -1) {
        // Update existing account
        updatedAccounts[existingIndex] = newAccount;
      } else {
        // Add new account
        updatedAccounts.push(newAccount);
      }
      
      // Limit to last 5 accounts
      if (updatedAccounts.length > 5) {
        updatedAccounts = updatedAccounts.slice(-5);
      }
      
      await AsyncStorage.setItem('saved_accounts', JSON.stringify(updatedAccounts));
      setSavedAccounts(updatedAccounts);
      
      Alert.alert('Success', 'Account saved successfully');
    } catch (error) {
      console.error('Error saving account:', error);
      Alert.alert('Error', 'Failed to save account');
    }
  };

  // Switch to a different account
  const switchAccount = async (account) => {
    Alert.alert(
      'Switch Account',
      `Switch to ${account.userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: async () => {
            try {
              setIsLoading(true);
              
              // For now, we'll just update the current user info
              // In a real app, you would perform login with these credentials
              Alert.alert(
                'Switch Account',
                'This feature requires re-login. Would you like to log out and login with this account?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Logout & Login',
                    onPress: () => {
                      // Save the account info for login screen
                      AsyncStorage.setItem('switch_account_userName', account.userName);
                      
                      // Logout current user
                      logout();
                      
                      // Navigate to WelcomeScreen
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'WelcomeScreen' }],
                      });
                    }
                  }
                ]
              );
              
              setShowSwitchAccountModal(false);
            } catch (error) {
              console.error('Error switching account:', error);
              Alert.alert('Error', 'Failed to switch account');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  // Remove a saved account
  const removeAccount = async (accountId) => {
    Alert.alert(
      'Remove Account',
      'Are you sure you want to remove this saved account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedAccounts = savedAccounts.filter(acc => acc.id !== accountId);
              await AsyncStorage.setItem('saved_accounts', JSON.stringify(updatedAccounts));
              setSavedAccounts(updatedAccounts);
              Alert.alert('Success', 'Account removed');
            } catch (error) {
              console.error('Error removing account:', error);
              Alert.alert('Error', 'Failed to remove account');
            }
          }
        }
      ]
    );
  };

  // Add New Account (navigate to login screen)
  const addNewAccount = () => {
    Alert.alert(
      'Add New Account',
      'This will log you out and take you to login screen. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            // Save current account before logging out
            saveCurrentAccount();
            
            // Logout and navigate to WelcomeScreen
            logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'WelcomeScreen' }],
            });
          }
        }
      ]
    );
  };

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
      const state = useAuthStore.getState();
      const { userName, password, serverConfig } = state;
      
      if (!userName || !password || !serverConfig?.protocol) {
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

      // Update auth store with new token
      useAuthStore.getState().setLoginData({
        token: token,
        clientId: clientId,
        clientName: clientName,
        clients: responseJSON.clients || []
      });

      // Navigate to SelectRoleScreen
      navigation.navigate('SelectRoleScreen', {
        fromProfile: true,
      });
    } catch (error) {
      console.error('Error in handlePressRole:', error);
      Alert.alert('Error', 'Failed to get roles. Please try again.');
    }
  };

 const handlePressLogout = async () => {
  Alert.alert('Confirmation', 'Do you want to Logout?', [
    {text: 'Cancel', style: 'cancel'},
    {
      text: 'Logout',
      style: 'destructive',
      onPress: async () => {
        try {
          // Save current account before logging out
          await saveCurrentAccount();
          
          // Call Zustand's logout function
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

  // Render saved account item
  const renderAccountItem = ({ item }) => (
    <TouchableOpacity
      style={styles.accountItem}
      onPress={() => switchAccount(item)}
      onLongPress={() => removeAccount(item.id)}
    >
      <View style={styles.accountAvatar}>
        <Text style={styles.avatarText}>
          {item.userName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.accountInfo}>
        <Text style={styles.accountName}>{item.userName}</Text>
        <Text style={styles.accountDetails}>
          {item.clientName} • {item.roleName}
        </Text>
        <Text style={styles.accountTimestamp}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#666" />
    </TouchableOpacity>
  );

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
          </View>
        </View>
        
        {/* Save Current Account Button */}
        <TouchableOpacity
          style={styles.saveAccountButton}
          onPress={saveCurrentAccount}>
          <MaterialIcons name="save-alt" size={22} color="#0050C0" />
          <Text style={styles.saveAccountText}>Save Current Account</Text>
        </TouchableOpacity>
        
        {/* Multi-Account Management Section */}
        <View style={styles.accountCon}>
          <Text style={styles.userAccountTxt}>Multi-Account</Text>
        </View>
        
        <Card
          Icon={<MaterialIcons name="add-circle-outline" size={25} color="#877e7e" />}
          txt="Add New Account"
          handlePress={addNewAccount}
        />
        
        <Card
          Icon={<MaterialIcons name="swap-horiz" size={25} color="#877e7e" />}
          txt="Switch Account"
          handlePress={() => setShowSwitchAccountModal(true)}
        />
        
        {/* Saved Accounts Count */}
        {savedAccounts.length > 0 && (
          <TouchableOpacity
            style={styles.savedAccountsCount}
            onPress={() => setShowSwitchAccountModal(true)}>
            <Text style={styles.savedAccountsText}>
              {savedAccounts.length} saved account{savedAccounts.length !== 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        )}

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

      {/* Switch Account Modal */}
      <Modal
        visible={showSwitchAccountModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSwitchAccountModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Switch Account</Text>
              <TouchableOpacity
                onPress={() => setShowSwitchAccountModal(false)}
                style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            {savedAccounts.length > 0 ? (
              <>
                <FlatList
                  data={savedAccounts}
                  renderItem={renderAccountItem}
                  keyExtractor={item => item.id}
                  style={styles.accountsList}
                  ListHeaderComponent={
                    <Text style={styles.modalSubtitle}>
                      Tap to switch, long press to remove
                    </Text>
                  }
                />
                
                <TouchableOpacity
                  style={styles.addNewInModal}
                  onPress={() => {
                    setShowSwitchAccountModal(false);
                    addNewAccount();
                  }}>
                  <MaterialIcons name="add-circle-outline" size={22} color="#0050C0" />
                  <Text style={styles.addNewText}>Add New Account</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.noAccountsContainer}>
                <MaterialIcons name="account-circle" size={60} color="#ccc" />
                <Text style={styles.noAccountsText}>No saved accounts</Text>
                <Text style={styles.noAccountsSubtext}>
                  Save your current account or add a new one
                </Text>
                <TouchableOpacity
                  style={styles.saveCurrentButton}
                  onPress={() => {
                    saveCurrentAccount();
                    setShowSwitchAccountModal(false);
                  }}>
                  <Text style={styles.saveCurrentText}>Save Current Account</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {isLoading && <Loader />}
    </>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  header: {
    height: height / 8,
    flexDirection: 'row',
    width: '95%',
    marginTop: 40,
    alignItems: 'flex-start',
  },
  backBtn: {
    padding: 10,
    marginTop: 5,
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
  
  // Save Account Button
  saveAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: '90%',
  },
  saveAccountText: {
    color: '#0050C0',
    fontSize: 16,
    fontFamily: 'K2D-Medium',
    marginLeft: 10,
  },
  
  // Saved Accounts Count
  savedAccountsCount: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 20,
    width: '90%',
    alignItems: 'center',
  },
  savedAccountsText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'K2D-Regular',
  },
  
  accountCon: {
    width: '90%',
    marginTop: 5,
    marginBottom: 10,
  },
  userAccountTxt: {
    color: 'black',
    fontSize: 20,
    fontFamily: 'K2D-Bold',
    fontWeight: '600',
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
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'K2D-Bold',
    color: '#000',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'K2D-Regular',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F9F9F9',
  },
  closeButton: {
    padding: 5,
  },
  
  // Account Item Styles
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  accountAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0050C0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'K2D-Bold',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontFamily: 'K2D-SemiBold',
    color: '#000',
    marginBottom: 4,
  },
  accountDetails: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'K2D-Regular',
    marginBottom: 2,
  },
  accountTimestamp: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'K2D-Regular',
  },
  
  // Add New in Modal
  addNewInModal: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  addNewText: {
    color: '#0050C0',
    fontSize: 16,
    fontFamily: 'K2D-Medium',
    marginLeft: 10,
  },
  
  // No Accounts State
  noAccountsContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noAccountsText: {
    fontSize: 18,
    fontFamily: 'K2D-SemiBold',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  noAccountsSubtext: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'K2D-Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  saveCurrentButton: {
    backgroundColor: '#0050C0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveCurrentText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'K2D-Medium',
  },
});