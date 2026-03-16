import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuthStore } from '../../store/authStore';
import { 
  useRoles, 
  useOrganizations, 
  useWarehouses,
  useCompleteLogin 
} from '../../hooks/useAuth';
import colors from '../../constants/Colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import CustomAlert from '../../components/CustomAlert'; 

const { height, width } = Dimensions.get('window');

const SelectRoleScreen = ({ navigation, route }) => {
  // Get state from auth store
  const token = useAuthStore(state => state.token);
  const clientId = useAuthStore(state => state.clientId);
  const clientName = useAuthStore(state => state.clientName);
  const userName = useAuthStore(state => state.userName);
  const isLoading = useAuthStore(state => state.isLoading);
  const error = useAuthStore(state => state.error);
  
  // Get saved role data for pre-selection (always loaded from last login)
  const savedRoleId = useAuthStore(state => state.roleId);
  const savedOrgId = useAuthStore(state => state.organizationId);
  const savedWarehouseId = useAuthStore(state => state.warehouseId);
  const savedRoleName = useAuthStore(state => state.roleName);
  const savedOrgName = useAuthStore(state => state.organizationName);
  const savedWarehouseName = useAuthStore(state => state.warehouseName);
  
  // Responsive scaling
  const scaleWidth = (size) => (width / 375) * size;
  const scaleHeight = (size) => (height / 812) * size;
  const isLandscape = width > height;
  const isTablet = width >= 768;
  
  // Get store actions
  const setCompleteAuthData = useAuthStore(state => state.setCompleteAuthData);
  const setLoading = useAuthStore(state => state.setLoading);
  const clearError = useAuthStore(state => state.clearError);
  
  // Local state
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);
  
  // Date state
  const [currentDate] = useState(() => {
    const now = new Date();
    // Format: DD/MM/YYYY
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
  });

  // Alert state for CustomAlert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState('info');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertConfirmText, setAlertConfirmText] = useState('OK');
  const [alertCancelText, setAlertCancelText] = useState('Cancel');
  const [alertShowCancel, setAlertShowCancel] = useState(false);
  const [onConfirmAction, setOnConfirmAction] = useState(null);
  const [onCancelAction, setOnCancelAction] = useState(null);

  // Function to show custom alert
  const showAlert = ({
    type = 'info',
    title,
    message,
    confirmText = 'OK',
    cancelText = 'Cancel',
    showCancel = false,
    onConfirm,
    onCancel,
  }) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertConfirmText(confirmText);
    setAlertCancelText(cancelText);
    setAlertShowCancel(showCancel);
    setOnConfirmAction(() => onConfirm || (() => setAlertVisible(false)));
    setOnCancelAction(() => onCancel || (() => setAlertVisible(false)));
    setAlertVisible(true);
  };

  // Queries
  const { 
    data: roles = [], 
    isLoading: loadingRoles,
    isError: rolesError,
    refetch: refetchRoles 
  } = useRoles(clientId, !!clientId);

  const { 
    data: organizations = [], 
    isLoading: loadingOrgs,
    isError: orgsError,
    refetch: refetchOrgs 
  } = useOrganizations(clientId, selectedRole, !!selectedRole);

  const { 
    data: warehouses = [], 
    isLoading: loadingWarehouses,
    isError: warehousesError,
    refetch: refetchWarehouses 
  } = useWarehouses(clientId, selectedRole, selectedOrganization, !!selectedOrganization);

  // Mutation
  const completeLoginMutation = useCompleteLogin();

  // Initialize with saved values if available (pre-fill with last selection)
  useEffect(() => {
    if (savedRoleId) {
      setSelectedRole(savedRoleId);
    }
    if (savedOrgId) {
      setSelectedOrganization(savedOrgId);
    }
    if (savedWarehouseId) {
      setSelectedWarehouse(savedWarehouseId);
    }
  }, [savedRoleId, savedOrgId, savedWarehouseId]);

  // Handle errors
  useEffect(() => {
    if (error) {
      showAlert({
        type: 'error',
        title: 'Error',
        message: error,
        onConfirm: () => {
          clearError();
          setAlertVisible(false);
        }
      });
    }
    
    if (rolesError) {
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to load roles. Please try again.',
        onConfirm: () => setAlertVisible(false)
      });
    }
  }, [error, rolesError]);

  // Handle complete login
  const handleLogin = async () => {
    // Validation
    if (!selectedRole || !selectedOrganization || !selectedWarehouse) {
      showAlert({
        type: 'warning',
        title: 'Required',
        message: 'Please select Role, Organization, and Company',
        onConfirm: () => setAlertVisible(false)
      });
      return;
    }

    setIsLoadingLocal(true);
    setLoading(true);
    
    try {
      // Get the selected item names
      const roleName = getSelectedItemName(roles, selectedRole) || savedRoleName;
      const organizationName = getSelectedItemName(organizations, selectedOrganization) || savedOrgName;
      const warehouseName = getSelectedItemName(warehouses, selectedWarehouse) || savedWarehouseName;

      // Create parameters
      const parameters = {
        clientId: clientId?.toString(),
        roleId: selectedRole?.toString(),
        organizationId: selectedOrganization?.toString(),
        warehouseId: selectedWarehouse?.toString(),
        language: 'en_US',
      };
      
      // Complete login
      const response = await completeLoginMutation.mutateAsync(parameters);
      
      // Store complete auth data (this will save role for next login)
      setCompleteAuthData({
        token: response.token,
        extractedUserId: response.extractedUserId,
        clientId: clientId,
        roleId: selectedRole,
        roleName: roleName,
        organizationId: selectedOrganization,
        organizationName: organizationName,
        warehouseId: selectedWarehouse,
        warehouseName: warehouseName,
      });
      
      // Navigate to FingerPrintScreen
      navigation.replace('FingerPrintScreen');
      
    } catch (error) {
      // Error handling
      let errorMessage = error.message || 'An error occurred during login.';
      
      if (error.message.includes('Network request failed')) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      } else if (error.message.includes('Failed to extract')) {
        errorMessage = 'Could not retrieve user information. Please try again.';
      }
      
      showAlert({
        type: 'error',
        title: 'Login Failed',
        message: errorMessage,
        onConfirm: () => setAlertVisible(false)
      });
      
    } finally {
      setIsLoadingLocal(false);
      setLoading(false);
    }
  };

  // Handle role change
  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    setSelectedOrganization('');
    setSelectedWarehouse('');
  };

  // Handle organization change
  const handleOrganizationChange = (orgId) => {
    setSelectedOrganization(orgId);
    setSelectedWarehouse('');
  };

  // Handle warehouse change
  const handleWarehouseChange = (warehouseId) => {
    setSelectedWarehouse(warehouseId);
  };

  // Filter out entries with asterisk
  const filterValidItems = (items) => {
    if (!items || !Array.isArray(items)) return [];
    return items.filter(item => item && !item.name?.includes('*'));
  };

  // Get display name for selected items
  const getSelectedItemName = (items, selectedId) => {
    if (!selectedId) return '';
    const item = items.find(item => item.id?.toString() === selectedId?.toString());
    return item?.name || '';
  };

  // Back handler
  useEffect(() => {
    const backAction = () => {
      navigation.navigate('SignIn');
      return true;
    };
    
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
    
    return () => backHandler.remove();
  }, [navigation]);

  // Handle cancel
  const handleCancel = () => {
    navigation.navigate('SignIn');
  };

  // Handle calendar icon click (for future implementation)
  const handleCalendarClick = () => {
    showAlert({
      type: 'info',
      title: 'Info',
      message: 'Date picker will be implemented in future update',
      onConfirm: () => setAlertVisible(false)
    });
  };

  // Check if all fields are selected
  const isLoginDisabled = isLoading || isLoadingLocal || 
                         !selectedRole || !selectedOrganization || !selectedWarehouse;

  // Get filtered items
  const filteredRoles = filterValidItems(roles);
  const filteredOrgs = filterValidItems(organizations);
  const filteredWarehouses = filterValidItems(warehouses);

  // Function to create bold text effect
  const makeBold = (text) => {
    // Unicode Mathematical Bold for visual emphasis
    const boldMap = {
      'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘',
      'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜', 'J': '𝗝',
      'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢',
      'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝘀', 'T': '𝘁',
      'U': '𝘂', 'V': '𝘃', 'W': '𝘄', 'X': '𝘅', 'Y': '𝘆',
      'Z': '𝘇',
      'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲',
      'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶', 'j': '𝗷',
      'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼',
      'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁',
      'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆',
      'z': '𝘇',
      ' ': ' '
    };
    
    return text.split('').map(char => boldMap[char] || char).join('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent,
          isLandscape && styles.scrollContentLandscape,
          isTablet && styles.scrollContentTablet
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <Image
          source={require('../../asserts/WelcomeSrn/infinityerpiconillustrator23.png')}
          style={[
            styles.logo,
            isLandscape && styles.logoLandscape,
            isTablet && styles.logoTablet
          ]}
          resizeMode="contain"
        />

        {/* Title Section */}
        <View style={[
          styles.titleSection,
          isLandscape && styles.titleSectionLandscape
        ]}>
          <Text style={[
            styles.title,
            isLandscape && styles.titleLandscape,
            isTablet && styles.titleTablet
          ]}>
            Set User Role
          </Text>
          
          {/* Client info */}
          <Text style={[
            styles.subtitle,
            isLandscape && styles.subtitleLandscape,
            isTablet && styles.subtitleTablet
          ]}>
            Client: {clientName || 'Not selected'}
          </Text>
        </View>

        {/* Card */}
        <View style={[
          styles.card,
          isLandscape && styles.cardLandscape,
          isTablet && styles.cardTablet
        ]}>
          {/* Role */}
          <View style={styles.section}>
            <Text style={[
              styles.label,
              isLandscape && styles.labelLandscape,
              isTablet && styles.labelTablet
            ]}>
              Role
            </Text>
            <View style={[
              styles.pickerWrapper,
              isLandscape && styles.pickerWrapperLandscape,
              isTablet && styles.pickerWrapperTablet
            ]}>
              <Picker
                selectedValue={selectedRole}
                onValueChange={handleRoleChange}
                style={[
                  styles.picker,
                  isLandscape && styles.pickerLandscape,
                  isTablet && styles.pickerTablet
                ]}
                dropdownIconColor="#2F4FE3"
              >
                {/* BOLD & PROMINENT Placeholder */}
                <Picker.Item 
                  label="🔷 SELECT ROLE 🔷"
                  value="" 
                  color="#0c0c0c"
                  fontFamily="K2D-Bold"
                  style={Platform.OS === 'ios' ? styles.boldPlaceholder : {}}
                />
                
                {/* Regular role items */}
                {filteredRoles.map(role => (
                  <Picker.Item
                    key={role.id}
                    label={role.name}
                    value={role.id}
                    color="#000"
                    fontFamily="K2D-Regular"
                    style={Platform.OS === 'ios' ? styles.regularItem : {}}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Organization */}
          <View style={styles.section}>
            <Text style={[
              styles.label,
              isLandscape && styles.labelLandscape,
              isTablet && styles.labelTablet
            ]}>
              Organization
            </Text>
            <View style={[
              styles.pickerWrapper,
              isLandscape && styles.pickerWrapperLandscape,
              isTablet && styles.pickerWrapperTablet,
              !selectedRole && styles.disabledWrapper
            ]}>
              <Picker
                selectedValue={selectedOrganization}
                onValueChange={handleOrganizationChange}
                enabled={!!selectedRole}
                style={[
                  styles.picker,
                  isLandscape && styles.pickerLandscape,
                  isTablet && styles.pickerTablet,
                  !selectedRole && styles.disabledPicker
                ]}
                dropdownIconColor={selectedRole ? "#2F4FE3" : "#CCCCCC"}
              >
                {/* Prominent placeholder with conditional styling */}
                <Picker.Item 
                  label={selectedRole ? "🔷 SELECT ORGANIZATION 🔷" : "⏳ FIRST SELECT ROLE"}
                  value="" 
                  color={"#0c0c0c"}
                  fontFamily="K2D-Bold"
                  style={Platform.OS === 'ios' ? styles.boldPlaceholder : {}}
                />
                
                {/* Organization items */}
                {filteredOrgs.map(org => (
                  <Picker.Item
                    key={org.id}
                    label={org.name}
                    value={org.id}
                    color="#000"
                    fontFamily="K2D-Regular"
                    style={Platform.OS === 'ios' ? styles.regularItem : {}}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Warehouse */}
          <View style={styles.section}>
            <Text style={[
              styles.label,
              isLandscape && styles.labelLandscape,
              isTablet && styles.labelTablet
            ]}>
              Warehouse
            </Text>
            <View style={[
              styles.pickerWrapper,
              isLandscape && styles.pickerWrapperLandscape,
              isTablet && styles.pickerWrapperTablet,
              (!selectedRole || !selectedOrganization) && styles.disabledWrapper
            ]}>
              <Picker
                selectedValue={selectedWarehouse}
                onValueChange={handleWarehouseChange}
                enabled={!!selectedOrganization}
                style={[
                  styles.picker,
                  isLandscape && styles.pickerLandscape,
                  isTablet && styles.pickerTablet,
                  (!selectedRole || !selectedOrganization) && styles.disabledPicker
                ]}
                dropdownIconColor={selectedOrganization ? "#2F4FE3" : "#CCCCCC"}
              >
                {/* Prominent placeholder with state awareness */}
                <Picker.Item 
                  label={
                    !selectedRole ? "⏳ FIRST SELECT ROLE" :
                    !selectedOrganization ? "⏳ FIRST SELECT ORGANIZATION" :
                    "🔷 SELECT WAREHOUSE 🔷"
                  }
                  value="" 
                  color={"#000000"}
                  fontFamily="K2D-Bold"
                  style={Platform.OS === 'ios' ? styles.boldPlaceholder : {}}
                />
                
                {/* Warehouse items */}
                {filteredWarehouses.map(w => (
                  <Picker.Item
                    key={w.id}
                    label={w.name}
                    value={w.id}
                    color="#000"
                    fontFamily="K2D-Regular"
                    style={Platform.OS === 'ios' ? styles.regularItem : {}}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Date - with Calendar Icon */}
          <View style={styles.section}>
            <Text style={[
              styles.label,
              isLandscape && styles.labelLandscape,
              isTablet && styles.labelTablet
            ]}>
              Date
            </Text>
            <View style={[
              styles.dateContainer,
              isLandscape && styles.dateContainerLandscape,
              isTablet && styles.dateContainerTablet
            ]}>
              <TextInput
                value={currentDate}
                style={[
                  styles.dateInput,
                  isLandscape && styles.dateInputLandscape,
                  isTablet && styles.dateInputTablet
                ]}
                editable={false}
                selectTextOnFocus={false}
                pointerEvents="none"
              />
              <TouchableOpacity 
                style={[
                  styles.calendarIconContainer,
                  isLandscape && styles.calendarIconContainerLandscape,
                  isTablet && styles.calendarIconContainerTablet
                ]}
                onPress={handleCalendarClick}
                activeOpacity={0.7}
              >
                <FontAwesome 
                  name="calendar" 
                  size={width * 0.05} 
                  color={colors.authButton}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Buttons */}
          <View style={[
            styles.buttonRow,
            isLandscape && styles.buttonRowLandscape,
            isTablet && styles.buttonRowTablet
          ]}>
            <TouchableOpacity
              style={[
                styles.cancelBtn,
                isLandscape && styles.cancelBtnLandscape,
                isTablet && styles.cancelBtnTablet,
                (isLoading || isLoadingLocal) && styles.buttonDisabled
              ]}
              onPress={handleCancel}
              disabled={isLoading || isLoadingLocal}
            >
              <Text style={[
                styles.cancelText,
                isLandscape && styles.cancelTextLandscape,
                isTablet && styles.cancelTextTablet
              ]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveBtn,
                isLandscape && styles.saveBtnLandscape,
                isTablet && styles.saveBtnTablet,
                isLoginDisabled && styles.disabled,
              ]}
              onPress={handleLogin}
              disabled={isLoginDisabled}
            >
              {(isLoading || isLoadingLocal) ? (
                <ActivityIndicator color={colors.textInverse} size="small" />
              ) : (
                <Text style={[
                  styles.saveText,
                  isLandscape && styles.saveTextLandscape,
                  isTablet && styles.saveTextTablet
                ]}>
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Custom Alert Modal */}
      <CustomAlert
        visible={alertVisible}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        confirmText={alertConfirmText}
        cancelText={alertCancelText}
        showCancelButton={alertShowCancel}
        onConfirm={() => {
          if (onConfirmAction) onConfirmAction();
          setAlertVisible(false);
        }}
        onCancel={() => {
          if (onCancelAction) onCancelAction();
          setAlertVisible(false);
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: height * 0.05,
    paddingBottom: height * 0.05,
    paddingHorizontal: width * 0.05,
  },

  scrollContentLandscape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: height * 0.03,
    paddingBottom: height * 0.03,
    paddingHorizontal: width * 0.03,
  },

  scrollContentTablet: {
    paddingTop: height * 0.08,
    paddingBottom: height * 0.08,
    paddingHorizontal: width * 0.08,
  },

  logo: {
    width: width * 0.25,
    height: height * 0.12,
    maxWidth: 100,
    maxHeight: 100,
    marginBottom: height * 0.02,
  },

  logoLandscape: {
    width: width * 0.2,
    height: height * 0.25,
    marginBottom: 0,
    marginRight: width * 0.05,
  },

  logoTablet: {
    width: width * 0.2,
    height: height * 0.15,
    maxWidth: 120,
    maxHeight: 120,
    marginBottom: height * 0.03,
  },

  titleSection: {
    alignItems: 'center',
    marginBottom: height * 0.03,
  },

  titleSectionLandscape: {
    marginBottom: height * 0.02,
    marginRight: width * 0.05,
    alignItems: 'flex-start',
  },

  title: {
    fontSize: width * 0.06,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: height * 0.005,
    textAlign: 'center',
    fontFamily: 'K2D-SemiBold',
  },

  titleLandscape: {
    fontSize: width * 0.05,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },

  titleTablet: {
    fontSize: width * 0.07,
    marginBottom: height * 0.01,
  },

  subtitle: {
    fontSize: width * 0.04,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'K2D-Regular',
  },

  subtitleLandscape: {
    fontSize: width * 0.035,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },

  subtitleTablet: {
    fontSize: width * 0.045,
  },

  card: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: width * 0.04,
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  cardLandscape: {
    width: width * 0.5,
    maxWidth: 450,
    padding: width * 0.03,
  },

  cardTablet: {
    width: width * 0.6,
    maxWidth: 600,
    padding: width * 0.05,
    borderRadius: 12,
  },

  section: {
    marginBottom: height * 0.02,
  },

  label: {
    fontSize: width * 0.04,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: height * 0.01,
    fontFamily: 'K2D-SemiBold',
  },

  labelLandscape: {
    fontSize: width * 0.035,
  },

  labelTablet: {
    fontSize: width * 0.045,
  },

  pickerWrapper: {
    backgroundColor: colors.backgroundGray,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    overflow: 'hidden',
    minHeight: 48,
  },

  pickerWrapperLandscape: {
    borderRadius: 6,
    minHeight: 48,
  },

  pickerWrapperTablet: {
    borderRadius: 8,
    minHeight: 52,
  },

  disabledWrapper: {
    backgroundColor: colors.surfaceDisabled,
    borderColor: colors.borderLight,
  },

  picker: {
    height: height * 0.06,
    minHeight: 48,
    color: colors.textPrimary,
    fontFamily: 'K2D-Regular',
  },

  pickerLandscape: {
    height: height * 0.07,
    minHeight: 48,
  },

  pickerTablet: {
    height: height * 0.065,
    minHeight: 52,
  },

  disabledPicker: {
    color: colors.textTertiary,
  },

  boldPlaceholder: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  
  regularItem: {
    fontSize: 16,
    fontWeight: 'normal',
  },

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    overflow: 'hidden',
    minHeight: 48,
  },

  dateContainerLandscape: {
    borderRadius: 6,
    minHeight: 48,
  },

  dateContainerTablet: {
    borderRadius: 8,
    minHeight: 52,
  },

  dateInput: {
    flex: 1,
    height: height * 0.06,
    minHeight: 48,
    color: colors.textPrimary,
    fontSize: width * 0.04,
    fontFamily: 'K2D-Regular',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.015,
  },

  dateInputLandscape: {
    height: height * 0.07,
    minHeight: 48,
    fontSize: width * 0.035,
    paddingVertical: height * 0.015,
  },

  dateInputTablet: {
    height: height * 0.065,
    minHeight: 52,
    fontSize: width * 0.045,
    paddingVertical: height * 0.015,
  },

  calendarIconContainer: {
    paddingHorizontal: width * 0.03,
    height: '100%',
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    borderLeftWidth: 1,
    borderLeftColor: colors.borderLight,
  },

  calendarIconContainerLandscape: {
    paddingHorizontal: width * 0.02,
    minHeight: 48,
  },

  calendarIconContainerTablet: {
    paddingHorizontal: width * 0.04,
    minHeight: 52,
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: height * 0.03,
    gap: width * 0.02,
  },

  buttonRowLandscape: {
    marginTop: height * 0.04,
    gap: width * 0.015,
  },

  buttonRowTablet: {
    marginTop: height * 0.04,
    gap: width * 0.03,
  },

  cancelBtn: {
    height: height * 0.06,
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.authButton,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: width * 0.06,
    minWidth: width * 0.2,
  },

  cancelBtnLandscape: {
    height: height * 0.07,
    minHeight: 46,
    paddingHorizontal: width * 0.05,
    minWidth: width * 0.15,
  },

  cancelBtnTablet: {
    height: height * 0.07,
    minHeight: 52,
    borderRadius: 8,
    paddingHorizontal: width * 0.08,
    minWidth: width * 0.15,
  },

  saveBtn: {
    height: height * 0.06,
    minHeight: 46,
    backgroundColor: colors.authButton,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.06,
    minWidth: width * 0.2,
  },

  saveBtnLandscape: {
    height: height * 0.07,
    minHeight: 46,
    paddingHorizontal: width * 0.05,
    minWidth: width * 0.15,
  },

  saveBtnTablet: {
    height: height * 0.07,
    minHeight: 52,
    borderRadius: 8,
    paddingHorizontal: width * 0.08,
    minWidth: width * 0.15,
  },

  cancelText: {
    color: colors.primary,
    fontSize: width * 0.045,
    fontWeight: '600',
    fontFamily: 'K2D-SemiBold',
  },

  cancelTextLandscape: {
    fontSize: width * 0.04,
  },

  cancelTextTablet: {
    fontSize: width * 0.05,
  },

  saveText: {
    color: colors.textInverse,
    fontSize: width * 0.045,
    fontWeight: '600',
    fontFamily: 'K2D-SemiBold',
  },

  saveTextLandscape: {
    fontSize: width * 0.04,
  },

  saveTextTablet: {
    fontSize: width * 0.05,
  },

  disabled: {
    opacity: 0.5,
  },

  buttonDisabled: {
    opacity: 0.5,
  },
});

export default SelectRoleScreen;