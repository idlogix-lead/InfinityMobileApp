import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Alert,
  BackHandler,
  StatusBar,
  FlatList,
  Modal,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import Card from '../../components/ProfileScreenComponents/Card';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Loader from '../../components/Loader';
import { useAuthStore } from '../../store/authStore';
import { useSessionStore } from '../../store/sessionStore';
import { keychainService } from '../../services/KeyChainService';

const {height, width} = Dimensions.get('window');

const ProfileScreen = ({navigation}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSwitchAccountModal, setShowSwitchAccountModal] = useState(false);
  
  // Get auth state from store
  const {
    userName,
    clientName,
    roleName,
    organizationName,
    warehouseName,
    logout,
    saveCurrentSession,
    switchSession,
    clearCurrentSession,
  } = useAuthStore();
  
  // Get session store
  const {
    sessionsRegistry,
    loadAllSessions,
    removeSession,
    switchToSession,
  } = useSessionStore();

  // Get current user ID for comparison
  const currentUserId = useAuthStore(state => state.userId);

  // Load saved sessions on mount
  useEffect(() => {
    loadSavedAccounts();
  }, []);

  // Load saved accounts from Keychain
  const loadSavedAccounts = async () => {
    try {
      await loadAllSessions();
    } catch (error) {
      console.error('Error loading saved accounts:', error);
    }
  };

  // Save current account to Keychain
  const saveCurrentAccount = async () => {
    try {
      setIsLoading(true);
      await saveCurrentSession();
      await loadAllSessions();
      Alert.alert('Success', 'Account saved successfully');
    } catch (error) {
      console.error('Error saving account:', error);
      Alert.alert('Error', 'Failed to save account');
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to a different account
  const switchAccount = async (session) => {
    if (session.userId === currentUserId) {
      Alert.alert('Info', 'You are already using this account');
      setShowSwitchAccountModal(false);
      return;
    }

    Alert.alert(
      'Switch Account',
      `Switch to ${session.userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: async () => {
            try {
              setIsLoading(true);
              
              // Clear current session first
              clearCurrentSession();
              
              // Try to load the new session
              const success = await switchSession(session.userId);
              
              if (success) {
                // Navigate to HomeScreen
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'HomeScreen' }],
                });
              } else {
                Alert.alert('Error', 'Failed to switch account');
                // If failed, go back to login
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'WelcomeScreen' }],
                });
              }
            } catch (error) {
              console.error('Error switching account:', error);
              Alert.alert('Error', 'Failed to switch account');
              // Go back to login on error
              navigation.reset({
                index: 0,
                routes: [{ name: 'WelcomeScreen' }],
              });
            } finally {
              setIsLoading(false);
              setShowSwitchAccountModal(false);
            }
          }
        }
      ]
    );
  };

  // Remove a saved account from Keychain
  const removeAccount = async (userId) => {
    if (userId === currentUserId) {
      Alert.alert('Cannot Remove', 'You cannot remove your current account while logged in.');
      return;
    }

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
              await removeSession(userId);
              await loadAllSessions();
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

  // Add New Account (logout and go to login)
  const addNewAccount = () => {
    Alert.alert(
      'Add New Account',
      'This will log you out and take you to login screen. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            try {
              // Save current session before logging out
              await saveCurrentSession();
              
              // Clear current session (keep in Keychain)
              clearCurrentSession();
              
              // Navigate to WelcomeScreen
              navigation.reset({
                index: 0,
                routes: [{ name: 'WelcomeScreen' }],
              });
            } catch (error) {
              console.error('Error adding new account:', error);
            }
          }
        }
      ]
    );
  };

  // Handle back button
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

  // Handle Change Role (your existing function)
  const handlePressRole = async () => {
    try {
      // Get credentials from store
      const state = useAuthStore.getState();
      const { userName, password, serverConfig } = state;
      
      if (!userName || !password || !serverConfig?.protocol) {
        Alert.alert('Error', 'Missing login information');
        return;
      }

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

      // Update auth store
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

  // Handle logout
  const handlePressLogout = async () => {
    Alert.alert('Confirmation', 'Do you want to Logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            // Save current account before logging out
            await saveCurrentSession();
            
            // Logout without deleting from Keychain
            await logout(false);

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

  // Handle logout and delete from Keychain
  const handleLogoutAndDelete = async () => {
    Alert.alert(
      'Logout & Remove Account',
      'This will logout and remove your account from saved accounts. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout & Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              // Logout and delete from Keychain
              await logout(true);
              
              // Navigate to WelcomeScreen
              navigation.reset({
                index: 0,
                routes: [{ name: 'WelcomeScreen' }],
              });
            } catch (error) {
              console.error('Error during logout & delete:', error);
            }
          }
        }
      ]
    );
  };

  // Sort sessions: current account first, then others
  const getSortedSessions = () => {
    if (!sessionsRegistry.length) return [];
    
    const currentSessions = sessionsRegistry.filter(session => session.isCurrent);
    const otherSessions = sessionsRegistry.filter(session => !session.isCurrent);
    
    return [...currentSessions, ...otherSessions];
  };

  // Render saved account item for modal
  const renderAccountItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.accountItem,
        item.isCurrent && styles.currentAccountItem
      ]}
      onPress={() => switchAccount(item)}
      onLongPress={() => removeAccount(item.userId)}
    >
      <View style={styles.accountAvatar}>
        <Text style={styles.avatarText}>
          {item.userName?.charAt(0)?.toUpperCase() || 'U'}
        </Text>
      </View>
      <View style={styles.accountInfo}>
        <View style={styles.accountHeader}>
          <Text style={[
            styles.accountName,
            item.isCurrent && styles.currentAccountName
          ]}>
            {item.userName}
          </Text>
          {item.isCurrent && (
            <View style={styles.currentBadge}>
              <MaterialIcons name="check-circle" size={14} color="#fff" />
              <Text style={styles.currentBadgeText}>Current</Text>
            </View>
          )}
        </View>
        <Text style={styles.accountDetails}>
          {item.clientName} • {item.roleName || 'No Role'}
        </Text>
        <Text style={styles.accountTimestamp}>
          {item.savedAt ? new Date(item.savedAt).toLocaleDateString() : 'Unknown date'}
        </Text>
      </View>
      <MaterialIcons 
        name="chevron-right" 
        size={24} 
        color={item.isCurrent ? '#0050C0' : '#666'} 
      />
    </TouchableOpacity>
  );

  // Render current account at the top of the modal
  const renderCurrentAccountHeader = () => {
    const currentSession = sessionsRegistry.find(session => session.isCurrent);
    if (!currentSession) return null;

    return (
      <View style={styles.currentAccountHeader}>
        <Text style={styles.currentAccountHeaderTitle}>Current Account</Text>
        <View style={styles.currentAccountCard}>
          <View style={styles.currentAccountAvatar}>
            <Text style={styles.currentAvatarText}>
              {currentSession.userName?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.currentAccountInfo}>
            <Text style={styles.currentAccountName}>
              {currentSession.userName}
            </Text>
            <Text style={styles.currentAccountDetails}>
              {currentSession.clientName} • {currentSession.roleName || 'No Role'}
            </Text>
            <Text style={styles.currentAccountServer}>
              {currentSession.serverConfig?.host}:{currentSession.serverConfig?.port}
            </Text>
          </View>
          <View style={styles.currentAccountBadge}>
            <MaterialIcons name="check-circle" size={16} color="#0050C0" />
            <Text style={styles.currentAccountBadgeText}>Active</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <Text style={styles.otherAccountsTitle}>Other Accounts</Text>
      </View>
    );
  };

  const sortedSessions = getSortedSessions();
  const hasOtherAccounts = sortedSessions.length > 1 || 
    (sortedSessions.length === 1 && !sortedSessions[0].isCurrent);

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        
        <StatusBar backgroundColor={'#0050C0'} />
        
        {/* FIXED HEADER SECTION - Back arrow and username in same row */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons
                name="keyboard-backspace"
                color="#000"
                size={30}
              />
            </TouchableOpacity>
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

        {/* Logout Section */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={[styles.logoutButton, styles.logoutButtonPrimary]}
            onPress={handlePressLogout}>
            <View style={styles.logoutIcon}>
              <Feather name="log-out" color="#0050C0" size={25} />
            </View>
            <View style={styles.logoutTextContainer}>
              <Text style={styles.logoutText}>Logout</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.logoutButton, styles.logoutButtonDanger]}
            onPress={handleLogoutAndDelete}>
            <View style={styles.logoutIcon}>
              <MaterialIcons name="delete-outline" color="#ff4444" size={25} />
            </View>
            <View style={styles.logoutTextContainer}>
              <Text style={[styles.logoutText, styles.logoutTextDanger]}>
                Logout & Remove Account
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
            
            {sessionsRegistry.length > 0 ? (
              <>
                <Text style={styles.modalSubtitle}>
                  Tap to switch, long press to remove
                </Text>
                
                {/* Current Account Header */}
                {renderCurrentAccountHeader()}
                
                {/* Other Accounts List */}
                <FlatList
                  data={sortedSessions.filter(session => !session.isCurrent)}
                  renderItem={renderAccountItem}
                  keyExtractor={item => item.userId}
                  style={styles.accountsList}
                  ListEmptyComponent={
                    <View style={styles.noOtherAccounts}>
                      <MaterialIcons name="people-outline" size={50} color="#ddd" />
                      <Text style={styles.noOtherAccountsText}>
                        No other accounts saved
                      </Text>
                      <Text style={styles.noOtherAccountsSubtext}>
                        Add a new account to switch between them
                      </Text>
                    </View>
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
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  
  // FIXED HEADER STYLES - back arrow and username in same row
  header: {
    width: '95%',
    marginBottom: 25,
    paddingHorizontal: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center', // This aligns items vertically in the center
    justifyContent: 'flex-start', // Aligns items to the left
  },
  backBtn: {
    height: 45,
    width: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  nameTxt: {
    color: 'black',
    fontSize: 26,
    fontFamily: 'K2D-Bold',
    fontWeight: 'bold',
    flex: 1, // Takes available space
  },
  
  // Save Account Button
  saveAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 5,
    width: '90%',
  },
  saveAccountText: {
    color: '#0050C0',
    fontSize: 16,
    fontFamily: 'K2D-Medium',
    marginLeft: 10,
  },
  
  accountCon: {
    width: '90%',
    marginTop: 5,
    marginBottom: 5,
  },
  userAccountTxt: {
    color: 'black',
    fontSize: 20,
    fontFamily: 'K2D-Bold',
    fontWeight: '600',
  },
  
  // Logout Container
  logoutContainer: {
    width: '90%',
    marginTop: 15,
    marginBottom: 30,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 5,
  },
  logoutButtonPrimary: {
    borderTopColor: '#f0f0f0',
  },
  logoutButtonDanger: {
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
  logoutTextDanger: {
    color: '#ff4444',
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
    maxHeight: height * 0.85,
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
  
  // Current Account Header in Modal
  currentAccountHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#F8F9FA',
  },
  currentAccountHeaderTitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'K2D-Medium',
    marginBottom: 12,
  },
  currentAccountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    borderWidth: 2,
    borderColor: '#0050C0',
    elevation: 2,
    shadowColor: '#0050C0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  currentAccountAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0050C0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  currentAvatarText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'K2D-Bold',
  },
  currentAccountInfo: {
    flex: 1,
  },
  currentAccountName: {
    fontSize: 16,
    fontFamily: 'K2D-SemiBold',
    color: '#0050C0',
    marginBottom: 4,
  },
  currentAccountDetails: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'K2D-Regular',
    marginBottom: 2,
  },
  currentAccountServer: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'K2D-Regular',
  },
  currentAccountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  currentAccountBadgeText: {
    color: '#0050C0',
    fontSize: 12,
    fontFamily: 'K2D-Bold',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 15,
  },
  otherAccountsTitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'K2D-Medium',
  },
  
  // Account Item Styles
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  currentAccountItem: {
    backgroundColor: '#F0F7FF',
    borderLeftWidth: 3,
    borderLeftColor: '#0050C0',
  },
  accountAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#0050C0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'K2D-Bold',
  },
  accountInfo: {
    flex: 1,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  accountName: {
    fontSize: 15,
    fontFamily: 'K2D-SemiBold',
    color: '#000',
    marginRight: 8,
  },
  currentAccountName: {
    color: '#0050C0',
    fontWeight: 'bold',
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0050C0',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  currentBadgeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'K2D-Bold',
    marginLeft: 4,
  },
  accountDetails: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'K2D-Regular',
    marginBottom: 2,
  },
  accountTimestamp: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'K2D-Regular',
  },
  
  accountsList: {
    maxHeight: height * 0.4,
  },
  
  // No Other Accounts
  noOtherAccounts: {
    alignItems: 'center',
    padding: 40,
  },
  noOtherAccountsText: {
    fontSize: 16,
    fontFamily: 'K2D-SemiBold',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  noOtherAccountsSubtext: {
    fontSize: 13,
    color: '#999',
    fontFamily: 'K2D-Regular',
    textAlign: 'center',
  },
  
  // Add New in Modal
  addNewInModal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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