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
  Alert,
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
      Alert.alert('Error', error);
      clearError();
    }
    
    if (rolesError) {
      Alert.alert('Error', 'Failed to load roles. Please try again.');
    }
  }, [error, rolesError]);

  // Handle complete login
  const handleLogin = async () => {
    // Validation
    if (!selectedRole || !selectedOrganization || !selectedWarehouse) {
      Alert.alert('Required', 'Please select Role, Organization, and Company');
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
      
      Alert.alert('Login Failed', errorMessage);
      
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
    // This will be implemented in the future
    Alert.alert('Info', 'Date picker will be implemented in future update');
  };

  // Check if all fields are selected
  const isLoginDisabled = isLoading || isLoadingLocal || 
                         !selectedRole || !selectedOrganization || !selectedWarehouse;

  // Get filtered items
  const filteredRoles = filterValidItems(roles);
  const filteredOrgs = filterValidItems(organizations);
  const filteredWarehouses = filterValidItems(warehouses);

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

        {/* Title */}
        <Text style={[
          styles.title,
          isLandscape && styles.titleLandscape,
          isTablet && styles.titleTablet
        ]}>
          Set User Role
        </Text>
        
        {/* Client info */}
        <Text style={[
          styles.clientText,
          isLandscape && styles.clientTextLandscape,
          isTablet && styles.clientTextTablet
        ]}>
          Client: {clientName || 'Not selected'}
        </Text>

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
              >
                <Picker.Item label="Select Role" value="" />
                {filteredRoles.map(role => (
                  <Picker.Item
                    key={role.id}
                    label={role.name}
                    value={role.id}
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
              >
                <Picker.Item label="Select Organization" value="" />
                {filteredOrgs.map(org => (
                  <Picker.Item
                    key={org.id}
                    label={org.name}
                    value={org.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Company */}
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
              >
                <Picker.Item label="Select Company" value="" />
                {filteredWarehouses.map(w => (
                  <Picker.Item
                    key={w.id}
                    label={w.name}
                    value={w.id}
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
    paddingTop: height * 0.08,
    paddingBottom: height * 0.05,
    paddingHorizontal: width * 0.05,
  },

  scrollContentLandscape: {
    paddingTop: height * 0.05,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  scrollContentTablet: {
    paddingTop: height * 0.1,
    paddingHorizontal: width * 0.1,
  },

  logo: {
    width: width * 0.25,
    height: height * 0.12,
    maxWidth: 100,
    maxHeight: 100,
    marginBottom: height * 0.03,
  },

  logoLandscape: {
    width: width * 0.15,
    height: height * 0.2,
    marginBottom: height * 0.02,
  },

  logoTablet: {
    width: width * 0.2,
    height: height * 0.15,
    maxWidth: 120,
    maxHeight: 120,
    marginBottom: height * 0.04,
  },

  clientText: {
    fontSize: width * 0.04,
    color: colors.textSecondary,
    marginBottom: height * 0.04,
    textAlign: 'center',
  },

  clientTextLandscape: {
    fontSize: width * 0.035,
    marginBottom: height * 0.03,
  },

  clientTextTablet: {
    fontSize: width * 0.045,
    marginBottom: height * 0.05,
  },

  title: {
    fontSize: width * 0.065,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: height * 0.015,
    textAlign: 'center',
  },

  titleLandscape: {
    fontSize: width * 0.055,
    marginBottom: height * 0.01,
  },

  titleTablet: {
    fontSize: width * 0.075,
    marginBottom: height * 0.02,
  },

  card: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: width * 0.04,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  cardLandscape: {
    width: width * 0.6,
    maxWidth: 450,
    padding: width * 0.03,
  },

  cardTablet: {
    width: width * 0.7,
    maxWidth: 600,
    padding: width * 0.05,
    borderRadius: 16,
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
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    minHeight: 44,
  },

  pickerWrapperLandscape: {
    borderRadius: 6,
    minHeight: 44,
  },

  pickerWrapperTablet: {
    borderRadius: 10,
    minHeight: 48,
  },

  disabledWrapper: {
    backgroundColor: colors.surfaceDisabled,
    borderColor: colors.borderLight,
  },

  picker: {
    height: height * 0.055,
    minHeight: 44,
    color: colors.textPrimary,
    fontFamily: 'K2D-Regular',
  },

  pickerLandscape: {
    height: height * 0.06,
    minHeight: 44,
  },

  pickerTablet: {
    height: height * 0.06,
    minHeight: 48,
  },

  disabledPicker: {
    color: colors.textTertiary,
  },

  // Date container with icon - Updated for consistent sizing
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    minHeight: 44,
  },

  dateContainerLandscape: {
    borderRadius: 6,
    minHeight: 44,
  },

  dateContainerTablet: {
    borderRadius: 10,
    minHeight: 48,
  },

  dateInput: {
    flex: 1,
    height: height * 0.055,
    minHeight: 44,
    color: colors.textTertiary,
    fontSize: width * 0.04,
    fontFamily: 'K2D-Regular',
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.015,
  },

  dateInputLandscape: {
    height: height * 0.06,
    minHeight: 44,
    fontSize: width * 0.035,
    paddingVertical: height * 0.015,
  },

  dateInputTablet: {
    height: height * 0.06,
    minHeight: 48,
    fontSize: width * 0.045,
    paddingVertical: height * 0.015,
  },

  calendarIconContainer: {
    paddingHorizontal: width * 0.03,
    height: '100%',
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    borderLeftWidth: 1,
    borderLeftColor: colors.borderLight,
  },

  calendarIconContainerLandscape: {
    paddingHorizontal: width * 0.02,
    minHeight: 44,
  },

  calendarIconContainerTablet: {
    paddingHorizontal: width * 0.04,
    minHeight: 48,
  },

  dateHint: {
    fontSize: width * 0.032,
    color: colors.textTertiary,
    fontStyle: 'italic',
    marginTop: height * 0.005,
    fontFamily: 'K2D-Regular',
  },

  dateHintLandscape: {
    fontSize: width * 0.028,
  },

  dateHintTablet: {
    fontSize: width * 0.038,
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
    height: height * 0.05,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.authButton,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: width * 0.06,
    minWidth: width * 0.2,
  },

  cancelBtnLandscape: {
    height: height * 0.06,
    minHeight: 44,
    paddingHorizontal: width * 0.05,
    minWidth: width * 0.15,
  },

  cancelBtnTablet: {
    height: height * 0.055,
    minHeight: 44,
    borderRadius: 10,
    paddingHorizontal: width * 0.08,
    minWidth: width * 0.15,
  },

  saveBtn: {
    height: height * 0.05,
    minHeight: 44,
    backgroundColor: colors.authButton,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.06,
    minWidth: width * 0.2,
  },

  saveBtnLandscape: {
    height: height * 0.06,
    minHeight: 44,
    paddingHorizontal: width * 0.05,
    minWidth: width * 0.15,
  },

  saveBtnTablet: {
    height: height * 0.055,
    minHeight: 44,
    borderRadius: 10,
    paddingHorizontal: width * 0.08,
    minWidth: width * 0.15,
  },

  cancelText: {
    color: colors.primary,
    fontSize: width * 0.04,
    fontWeight: '500',
    fontFamily: 'K2D-SemiBold',
  },

  cancelTextLandscape: {
    fontSize: width * 0.035,
  },

  cancelTextTablet: {
    fontSize: width * 0.045,
  },

  saveText: {
    color: colors.textInverse,
    fontSize: width * 0.04,
    fontWeight: '500',
    fontFamily: 'K2D-SemiBold',
  },

  saveTextLandscape: {
    fontSize: width * 0.035,
  },

  saveTextTablet: {
    fontSize: width * 0.045,
  },

  disabled: {
    opacity: 0.5,
  },

  buttonDisabled: {
    opacity: 0.5,
  },
});

export default SelectRoleScreen;