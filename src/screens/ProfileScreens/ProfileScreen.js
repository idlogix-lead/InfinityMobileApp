// ProfileScreen.js - UPDATED WITH COMPANY INFO DROPDOWN and custom alerts

import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  BackHandler,
  StatusBar,
  FlatList,
  Modal,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Card from '../../components/ProfileScreenComponents/Card';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Loader from '../../components/Loader';
import { useAuthStore } from '../../store/authStore';
import { useSessionStore } from '../../store/sessionStore';
import CustomAlert from '../../components/CustomAlert'; // Import custom alert
import theme from '../../constants/CRMTheme/CRMTheme'; // Import theme

const { Colors, Typography, Layout, Spacing } = theme;
const { scale, verticalScale } = Layout;
const {height, width} = Dimensions.get('window');

const ProfileScreen = ({navigation}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSwitchAccountModal, setShowSwitchAccountModal] = useState(false);
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);
  
  // Custom alert state
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    onCancel: null,
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancelButton: false,
  });
  
  // Get auth state from store
  const userName = useAuthStore(state => state.userName);
  const clientName = useAuthStore(state => state.clientName);
  const roleName = useAuthStore(state => state.roleName);
  const organizationName = useAuthStore(state => state.organizationName);
  const warehouseName = useAuthStore(state => state.warehouseName);
  const currentUserId = useAuthStore(state => state.userId);
  const logout = useAuthStore(state => state.logout);
  const saveCurrentSession = useAuthStore(state => state.saveCurrentSession);
  const switchSession = useAuthStore(state => state.switchSession);
  const clearCurrentSession = useAuthStore(state => state.clearCurrentSession);
  
  // Get session store
  const sessionsRegistry = useSessionStore(state => state.sessionsRegistry);
  const loadAllSessions = useSessionStore(state => state.loadAllSessions);
  const removeSession = useSessionStore(state => state.removeSession);
  const switchToSession = useSessionStore(state => state.switchToSession);

  // Custom alert helper functions
  const showAlert = (title, message, type = 'info', onConfirm = null, onCancel = null) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      onConfirm: onConfirm || (() => setAlertConfig(prev => ({ ...prev, visible: false }))),
      onCancel: onCancel || (() => setAlertConfig(prev => ({ ...prev, visible: false }))),
      confirmText: type === 'delete' ? 'Delete' : 'OK',
      cancelText: 'Cancel',
      showCancelButton: type === 'delete' || type === 'warning' || type === 'confirm',
    });
  };

  const showSuccessAlert = (message, onConfirm = null) => {
    showAlert('Success', message, 'success', onConfirm);
  };

  const showErrorAlert = (message) => {
    showAlert('Error', message, 'error');
  };

  const showInfoAlert = (message) => {
    showAlert('Info', message, 'info');
  };

  const showConfirmAlert = (title, message, onConfirm, onCancel = null) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type: 'warning',
      onConfirm: () => {
        onConfirm();
        hideAlert();
      },
      onCancel: onCancel || hideAlert,
      confirmText: 'Yes',
      cancelText: 'No',
      showCancelButton: true,
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

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
      console.log('💾 Attempting to save current account...');
      
      // Check if we have a valid session to save
      const authState = useAuthStore.getState();
      if (!authState.userId || !authState.token) {
        showErrorAlert('No active session to save. Please login first.');
        return;
      }
      
      const success = await saveCurrentSession();
      
      if (success) {
        await loadAllSessions();
        showSuccessAlert('Account saved successfully');
      } else {
        showErrorAlert('Failed to save account');
      }
    } catch (error) {
      console.error('Error saving account:', error);
      showErrorAlert('Failed to save account');
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to a different account
  const switchAccount = async (session) => {
    if (session.userId === currentUserId) {
      showInfoAlert('You are already using this account');
      setShowSwitchAccountModal(false);
      return;
    }

    showConfirmAlert(
      'Switch Account',
      `Switch to ${session.userName}?`,
      async () => {
        try {
          setIsLoading(true);
          
          // First save current session
          console.log('💾 Saving current session before switching...');
          try {
            await saveCurrentSession();
          } catch (saveError) {
            console.warn('⚠️ Could not save current session:', saveError);
            // Continue anyway
          }
          
          // Clear current session from store
          clearCurrentSession();
          
          // Try to load the new session
          console.log(`🔄 Switching to session: ${session.userName}`);
          const success = await switchSession(session.userId);
          
          if (success) {
            console.log('✅ Account switched successfully');
            
            // Update session store
            await switchToSession(session.userId);
            
            setShowSwitchAccountModal(false);
            
            // Show success message
            showSuccessAlert(`Switched to ${session.userName}`);
            
            // The Navigation component will detect the auth change automatically
          } else {
            showErrorAlert('Failed to switch account');
          }
        } catch (error) {
          console.error('Error switching account:', error);
          showErrorAlert('Failed to switch account');
        } finally {
          setIsLoading(false);
          setShowSwitchAccountModal(false);
        }
      },
      () => {
        setShowSwitchAccountModal(false);
      }
    );
  };

  // Remove a saved account from Keychain
  const removeAccount = async (userId) => {
    if (userId === currentUserId) {
      showInfoAlert('You cannot remove your current account while logged in. Please logout first or switch to another account.');
      return;
    }

    showConfirmAlert(
      'Remove Account',
      'Are you sure you want to remove this saved account?',
      async () => {
        try {
          await removeSession(userId);
          await loadAllSessions();
          showSuccessAlert('Account removed');
        } catch (error) {
          console.error('Error removing account:', error);
          showErrorAlert('Failed to remove account');
        }
      }
    );
  };

  // Add New Account (logout and go to login)
  const addNewAccount = () => {
    showConfirmAlert(
      'Add New Account',
      'This will log you out and take you to login screen. Continue?',
      async () => {
        try {
          console.log('➕ Add New Account initiated...');
          
          // Check if we have a valid session to save
          const authState = useAuthStore.getState();
          if (authState.userId && authState.token) {
            console.log('💾 Saving current session before adding new account...');
            try {
              await saveCurrentSession();
              console.log('✅ Current session saved');
            } catch (saveError) {
              console.warn('⚠️ Could not save current session:', saveError);
              // Continue anyway
            }
          }
          
          // Logout without deleting from Keychain
          await logout(false);
          
          console.log('✅ Logged out, ready for new account');
          // The Navigation component will detect the auth change automatically
          
        } catch (error) {
          console.error('Error adding new account:', error);
          showErrorAlert('Failed to add new account');
        }
      }
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

  // Handle Change Role
  const handlePressRole = async () => {
    try {
      // Get credentials from store
      const state = useAuthStore.getState();
      const { userName: username, password, serverConfig } = state;
      
      if (!username || !password || !serverConfig?.protocol) {
        showErrorAlert('Missing login information');
        return;
      }

      setIsLoading(true);
      
      const response = await fetch(
        `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.port}/api/v1/auth/tokens`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userName: username,
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

      // Navigate to SelectRoleScreen within AppNavigator
      navigation.navigate('SelectRoleScreen', {
        fromProfile: true,
      });
    } catch (error) {
      console.error('Error in handlePressRole:', error);
      showErrorAlert('Failed to get roles. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handlePressLogout = async () => {
    showConfirmAlert(
      'Confirmation',
      'Do you want to Logout?',
      async () => {
        try {
          console.log('🚪 ProfileScreen: Logout initiated...');
          
          // Get current auth state
          const authState = useAuthStore.getState();
          
          if (authState.userId && authState.token) {
            console.log('💾 Saving session before logout...');
            try {
              await saveCurrentSession();
              console.log('✅ Session saved');
            } catch (saveError) {
              console.warn('⚠️ Could not save session:', saveError.message);
            }
          }
          
          // Logout WITHOUT deleting from Keychain (save session)
          await logout(false);
          
          console.log('✅ ProfileScreen: Logout completed - auth state cleared');
          console.log('🧭 Navigation will automatically switch to Auth flow');
          
        } catch (error) {
          console.error('Error during logout:', error);
          showErrorAlert('Failed to logout properly');
        }
      }
    );
  };

  // Handle logout and delete
  const handleLogoutAndDelete = async () => {
    showConfirmAlert(
      'Logout & Remove Account',
      'This will logout and remove your current account from saved accounts. Continue?',
      async () => {
        try {
          console.log('🚪 ProfileScreen: Logout & Delete initiated...');
          
          // Logout and DELETE from Keychain
          await logout(true);
          
          console.log('✅ ProfileScreen: Logout & Delete completed');
          console.log('🧭 Navigation will automatically switch to Auth flow');
          
        } catch (error) {
          console.error('Error during logout & delete:', error);
          showErrorAlert('Failed to logout & delete account');
        }
      }
    );
  };

  // Toggle company information dropdown
  const toggleCompanyInfo = () => {
    setShowCompanyInfo(!showCompanyInfo);
  };

  // Sort sessions: current account first, then others
  const getSortedSessions = () => {
    if (!sessionsRegistry.length) return [];
    
    const currentSessions = sessionsRegistry.filter(session => session.isCurrent);
    const otherSessions = sessionsRegistry.filter(session => !session.isCurrent);
    
    return [...currentSessions, ...otherSessions];
  };

  // Render company information dropdown
  const renderCompanyInfo = () => {
    if (!showCompanyInfo) return null;

    return (
      <View style={styles.companyInfoDropdown}>
        {/* Client Info */}
        <View style={styles.companyInfoRow}>
          <View style={styles.companyIconContainer}>
            <FontAwesome5 name='user-tie' size={20} color={Colors.textPrimary} />
          </View>
          <View style={styles.companyInfoTextContainer}>
            <Text style={styles.companyInfoLabel}>Client</Text>
            <Text style={styles.companyInfoValue}>
              {clientName || 'Not Selected'}
            </Text>
          </View>
        </View>

        {/* Role Info */}
        <View style={styles.companyInfoRow}>
          <View style={styles.companyIconContainer}>
            <FontAwesome5 name='user-check' size={20} color={Colors.textPrimary} />
          </View>
          <View style={styles.companyInfoTextContainer}>
            <Text style={styles.companyInfoLabel}>Role</Text>
            <Text style={styles.companyInfoValue}>
              {roleName || 'Not Selected'}
            </Text>
          </View>
        </View>

        {/* Organization Info */}
        <View style={styles.companyInfoRow}>
          <View style={styles.companyIconContainer}>
            <FontAwesome6 name='users-viewfinder' size={20} color={Colors.textPrimary} />
          </View>
          <View style={styles.companyInfoTextContainer}>
            <Text style={styles.companyInfoLabel}>Organization</Text>
            <Text style={styles.companyInfoValue}>
              {organizationName || 'Not Selected'}
            </Text>
          </View>
        </View>

        {/* Warehouse Info */}
        <View style={styles.companyInfoRow}>
          <View style={styles.companyIconContainer}>
            <MaterialCommunityIcons name='warehouse' size={20} color={Colors.textPrimary} />
          </View>
          <View style={styles.companyInfoTextContainer}>
            <Text style={styles.companyInfoLabel}>Warehouse</Text>
            <Text style={styles.companyInfoValue}>
              {warehouseName || 'Not Selected'}
            </Text>
          </View>
        </View>
      </View>
    );
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
              <MaterialIcons name="check-circle" size={14} color={Colors.textInverse} />
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
        color={item.isCurrent ? Colors.primary : Colors.textSecondary} 
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
            <MaterialIcons name="check-circle" size={16} color={Colors.primary} />
            <Text style={styles.currentAccountBadgeText}>Active</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <Text style={styles.otherAccountsTitle}>Other Accounts</Text>
      </View>
    );
  };

  const sortedSessions = getSortedSessions();

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        
        <StatusBar backgroundColor={Colors.primary} />
        
        {/* Custom Alert Modal */}
        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onConfirm={() => {
            if (alertConfig.onConfirm) {
              alertConfig.onConfirm();
            }
            hideAlert();
          }}
          onCancel={() => {
            if (alertConfig.onCancel) {
              alertConfig.onCancel();
            }
            hideAlert();
          }}
          confirmText={alertConfig.confirmText}
          cancelText={alertConfig.cancelText}
          showCancelButton={alertConfig.showCancelButton}
        />
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}>
              <MaterialIcons
                name="keyboard-arrow-left"
                color={Colors.textPrimary}
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
          <MaterialIcons name="save-alt" size={22} color={Colors.primary} />
          <Text style={styles.saveAccountText}>Save Current Account</Text>
        </TouchableOpacity>
        
        {/* Multi-Account Management Section */}
        <View style={styles.accountCon}>
          <Text style={styles.userAccountTxt}>Multi-Account</Text>
        </View>
        
        <Card
          Icon={<MaterialIcons name="add" size={20} color={Colors.textPrimary} />}
          txt="Add New Account"
          handlePress={addNewAccount}
        />
        
        <Card
          Icon={<MaterialIcons name="swap-horiz" size={20} color={Colors.textPrimary} />}
          txt="Switch Account"
          handlePress={() => setShowSwitchAccountModal(true)}
        />

        {/* Company Information Section */}
        <View style={styles.accountCon}>
          <Text style={styles.userAccountTxt}>Company Information</Text>
        </View>
        
        <Card
          Icon={<FontAwesome name="building-o" size={18} color={Colors.textPrimary} />}
          txt="View Company Details"
          handlePress={toggleCompanyInfo}
          chevron={
            <MaterialIcons 
              name={showCompanyInfo ? "expand-less" : "expand-more"} 
              size={24} 
              color={Colors.primary} 
            />
          }
        />
        
        {/* Company Information Dropdown */}
        {renderCompanyInfo()}

        <View style={styles.accountCon}>
          <Text style={styles.userAccountTxt}>Your Account</Text>
        </View>
        
        <Card
          Icon={<MaterialCommunityIcons name="account-box-outline" size={20} color={Colors.textPrimary} />}
          txt="Preferences"
          handlePress={() => {/* Navigate to preferences */}}
        />
        
        <Card
          Icon={
            <MaterialIcons
              name="published-with-changes"
              size={20}
              color={Colors.textPrimary}
            />
          }
          txt="Change Role"
          handlePress={handlePressRole}
        />
        
        <Card
          Icon={<MaterialIcons name="chat-bubble-outline" size={20} color={Colors.textPrimary} />}
          txt="Feedback"
          handlePress={() => {/* Navigate to feedback */}}
        />

        <View style={styles.accountCon}>
          <Text style={styles.userAccountTxt}>Support</Text>
        </View>

        <Card
          Icon={<MaterialIcons name="help-outline" size={20} color={Colors.textPrimary} />}
          txt="Help & Support"
          handlePress={() => {/* Navigate to help */}}
        />

        <View style={styles.accountCon}>
          <Text style={styles.userAccountTxt}>Language</Text>
        </View>

        <Card
          Icon={<FontAwesome name="language" color={Colors.textPrimary} size={20} />}
          txt="English"
          handlePress={() => {/* Open language selector */}}
        />

        {/* Logout Section */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={[styles.logoutButton, styles.logoutButtonPrimary]}
            onPress={handlePressLogout}>
            <View style={styles.logoutIcon}>
              <Feather name="log-out" color={Colors.primary} size={25} />
            </View>
            <View style={styles.logoutTextContainer}>
              <Text style={styles.logoutText}>Logout</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.logoutButton, styles.logoutButtonDanger]}
            onPress={handleLogoutAndDelete}>
            <View style={styles.logoutIcon}>
              <MaterialIcons name="delete-outline" color={Colors.error} size={25} />
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
                <MaterialIcons name="close" size={24} color={Colors.textPrimary} />
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
                      <MaterialIcons name="people-outline" size={50} color={Colors.border} />
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
                  <MaterialIcons name="add-circle-outline" size={22} color={Colors.primary} />
                  <Text style={styles.addNewText}>Add New Account</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.noAccountsContainer}>
                <MaterialIcons name="account-circle" size={60} color={Colors.border} />
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
    backgroundColor: Colors.backgroundLight,
  },
  contentContainer: {
    paddingTop: verticalScale(15),
    paddingBottom: verticalScale(15),
    alignItems: 'center',
  },
  header: {
    width: '95%',
    marginBottom: verticalScale(25),
    paddingHorizontal: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  backBtn: {
    height: verticalScale(45),
    width: scale(45),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  nameTxt: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.h2,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: 'bold',
    flex: 1,
  },
  saveAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.infoLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Spacing.xxs,
    width: '90%',
  },
  saveAccountText: {
    color: Colors.primary,
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.medium,
    marginLeft: Spacing.sm,
  },
  accountCon: {
    width: '90%',
    marginTop: Spacing.xxs,
    marginBottom: Spacing.xxs,
  },
  userAccountTxt: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.h4,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '600',
  },
  // Company Information Dropdown Styles
  companyInfoDropdown: {
    width: '90%',
    backgroundColor: Colors.backgroundLight,
    borderRadius: Layout.borderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  companyInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  companyIconContainer: {
    width: scale(40),
    height: scale(40),
    backgroundColor: Colors.backgroundLight,
    borderRadius: Layout.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  companyInfoTextContainer: {
    flex: 1,
  },
  companyInfoLabel: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxs,
  },
  companyInfoValue: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.primary,
  },
  logoutContainer: {
    width: '90%',
    marginTop: Spacing.sm,
    marginBottom: verticalScale(30),
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginBottom: Spacing.xxs,
  },
  logoutButtonPrimary: {
    borderTopColor: Colors.borderLight,
  },
  logoutButtonDanger: {
    borderTopColor: Colors.borderLight,
  },
  logoutIcon: {
    height: scale(40),
    width: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutTextContainer: {
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  logoutText: {
    color: Colors.primary,
    fontSize: Typography.fontSize.h4,
    fontFamily: Typography.fontFamily.regular,
    fontWeight: '500',
  },
  logoutTextDanger: {
    color: Colors.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: Layout.borderRadius.xl,
    borderTopRightRadius: Layout.borderRadius.xl,
    maxHeight: height * 0.85,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    fontSize: Typography.fontSize.h4,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: Typography.fontSize.small,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.regular,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.backgroundLight,
  },
  closeButton: {
    padding: Spacing.xxs,
  },
  currentAccountHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.backgroundLight,
  },
  currentAccountHeaderTitle: {
    fontSize: Typography.fontSize.small,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.medium,
    marginBottom: Spacing.sm,
  },
  currentAccountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.md,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  currentAccountAvatar: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  currentAvatarText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.h4,
    fontFamily: Typography.fontFamily.bold,
  },
  currentAccountInfo: {
    flex: 1,
  },
  currentAccountName: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.primary,
    marginBottom: Spacing.xxs,
  },
  currentAccountDetails: {
    fontSize: Typography.fontSize.xsmall,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.regular,
    marginBottom: Spacing.xxs,
  },
  currentAccountServer: {
    fontSize: Typography.fontSize.xsmall,
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily.regular,
  },
  currentAccountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.infoLight,
    borderRadius: Layout.borderRadius.round,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
  },
  currentAccountBadgeText: {
    color: Colors.primary,
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.bold,
    marginLeft: Spacing.xxs,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
  otherAccountsTitle: {
    fontSize: Typography.fontSize.small,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.medium,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  currentAccountItem: {
    backgroundColor: Colors.infoLight,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  accountAvatar: {
    width: scale(45),
    height: scale(45),
    borderRadius: scale(22.5),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  avatarText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.h4,
    fontFamily: Typography.fontFamily.bold,
  },
  accountInfo: {
    flex: 1,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xxs,
  },
  accountName: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginRight: Spacing.xs,
  },
  currentAccountName: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.round,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xxs,
  },
  currentBadgeText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.bold,
    marginLeft: Spacing.xxs,
  },
  accountDetails: {
    fontSize: Typography.fontSize.xsmall,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.regular,
    marginBottom: Spacing.xxs,
  },
  accountTimestamp: {
    fontSize: Typography.fontSize.xsmall,
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily.regular,
  },
  accountsList: {
    maxHeight: height * 0.4,
  },
  noOtherAccounts: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  noOtherAccountsText: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  noOtherAccountsSubtext: {
    fontSize: Typography.fontSize.small,
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
  },
  addNewInModal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  addNewText: {
    color: Colors.primary,
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.medium,
    marginLeft: Spacing.sm,
  },
  noAccountsContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  noAccountsText: {
    fontSize: Typography.fontSize.h4,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  noAccountsSubtext: {
    fontSize: Typography.fontSize.small,
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  saveCurrentButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Layout.borderRadius.md,
  },
  saveCurrentText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.medium,
  },
});