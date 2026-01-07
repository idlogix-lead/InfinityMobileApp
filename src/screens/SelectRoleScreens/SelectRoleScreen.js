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

const { height, width } = Dimensions.get('window');

const SelectRoleScreen = ({ navigation, route }) => {
  // Get state from auth store
  const token = useAuthStore(state => state.token);
  const clientId = useAuthStore(state => state.clientId);
  const clientName = useAuthStore(state => state.clientName);
  const userName = useAuthStore(state => state.userName);
  const isLoading = useAuthStore(state => state.isLoading);
  const error = useAuthStore(state => state.error);
  const userId = useAuthStore(state => state.userId);
  
  // Get store actions
  const setCompleteAuthData = useAuthStore(state => state.setCompleteAuthData);
  const setLoading = useAuthStore(state => state.setLoading);
  const clearError = useAuthStore(state => state.clearError);
  
  // Local state
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);

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
      const roleName = getSelectedItemName(roles, selectedRole);
      const organizationName = getSelectedItemName(organizations, selectedOrganization);
      const warehouseName = getSelectedItemName(warehouses, selectedWarehouse);

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
      
      // Store complete auth data
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

  // Check if all fields are selected
  const isLoginDisabled = isLoading || isLoadingLocal || 
                         !selectedRole || !selectedOrganization || !selectedWarehouse;

  // Get filtered items
  const filteredRoles = filterValidItems(roles);
  const filteredOrgs = filterValidItems(organizations);
  const filteredWarehouses = filterValidItems(warehouses);

  return (
    <View style={styles.container}>
      {/* Header Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../../asserts/WelcomeSrn/infinityerpiconillustrator23.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* User Info - Static below image */}
      <View style={styles.userInfoContainer}>
        <Text style={styles.userInfoText}>Welcome, {userName}</Text>
        <Text style={styles.userInfoSubtext}>Client: {clientName || 'Not selected'}</Text>
      </View>

      {/* Main Form Card */}
      <View style={styles.mainCard}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Set User Role & Context</Text>
          
          {/* All three pickers in same card */}
          
          {/* 1. Role Picker */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>
              Role {selectedRole && '✓'}
            </Text>
            <View style={[
              styles.pickerWrapper,
              selectedRole && styles.pickerWrapperSelected
            ]}>
              {loadingRoles ? (
                <View style={styles.loadingPlaceholder}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.loadingText}>Loading roles...</Text>
                </View>
              ) : filteredRoles.length === 0 ? (
                <View style={styles.disabledPlaceholder}>
                  <Text style={styles.disabledText}>No roles available</Text>
                </View>
              ) : (
                <Picker
                  selectedValue={selectedRole}
                  onValueChange={handleRoleChange}
                  style={styles.picker}
                  dropdownIconColor={colors.primary}
                >
                  <Picker.Item 
                    label="Select Role" 
                    value="" 
                    color={colors.textSecondary}
                  />
                  {filteredRoles.map(role => (
                    <Picker.Item
                      key={role.id}
                      label={role.name}
                      value={role.id}
                      color={colors.textPrimary}
                    />
                  ))}
                </Picker>
              )}
            </View>
            {selectedRole && (
              <Text style={styles.selectedText}>
                Selected: {getSelectedItemName(roles, selectedRole)}
              </Text>
            )}
          </View>

          {/* 2. Organization Picker */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>
              Organization {selectedOrganization && '✓'}
            </Text>
            <View style={[
              styles.pickerWrapper,
              !selectedRole && styles.pickerWrapperDisabled,
              selectedOrganization && styles.pickerWrapperSelected
            ]}>
              {!selectedRole ? (
                <View style={styles.disabledPlaceholder}>
                  <Text style={styles.disabledText}>Select role first</Text>
                </View>
              ) : loadingOrgs ? (
                <View style={styles.loadingPlaceholder}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.loadingText}>Loading organizations...</Text>
                </View>
              ) : filteredOrgs.length === 0 ? (
                <View style={styles.disabledPlaceholder}>
                  <Text style={styles.disabledText}>No organizations available</Text>
                </View>
              ) : (
                <Picker
                  selectedValue={selectedOrganization}
                  onValueChange={handleOrganizationChange}
                  style={styles.picker}
                  dropdownIconColor={colors.primary}
                >
                  <Picker.Item 
                    label="Select Organization" 
                    value="" 
                    color={colors.textSecondary}
                  />
                  {filteredOrgs.map(org => (
                    <Picker.Item
                      key={org.id}
                      label={org.name}
                      value={org.id}
                      color={colors.textPrimary}
                    />
                  ))}
                </Picker>
              )}
            </View>
            {selectedOrganization && (
              <Text style={styles.selectedText}>
                Selected: {getSelectedItemName(organizations, selectedOrganization)}
              </Text>
            )}
          </View>

          {/* 3. Company/Warehouse Picker */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>
              Company {selectedWarehouse && '✓'}
            </Text>
            <View style={[
              styles.pickerWrapper,
              (!selectedRole || !selectedOrganization) && styles.pickerWrapperDisabled,
              selectedWarehouse && styles.pickerWrapperSelected
            ]}>
              {!selectedRole || !selectedOrganization ? (
                <View style={styles.disabledPlaceholder}>
                  <Text style={styles.disabledText}>
                    {!selectedRole ? 'Select role first' : 'Select organization first'}
                  </Text>
                </View>
              ) : loadingWarehouses ? (
                <View style={styles.loadingPlaceholder}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.loadingText}>Loading companies...</Text>
                </View>
              ) : filteredWarehouses.length === 0 ? (
                <View style={styles.disabledPlaceholder}>
                  <Text style={styles.disabledText}>No companies available</Text>
                </View>
              ) : (
                <Picker
                  selectedValue={selectedWarehouse}
                  onValueChange={handleWarehouseChange}
                  style={styles.picker}
                  dropdownIconColor={colors.primary}
                >
                  <Picker.Item 
                    label="Select Company" 
                    value="" 
                    color={colors.textSecondary}
                  />
                  {filteredWarehouses.map(warehouse => (
                    <Picker.Item
                      key={warehouse.id}
                      label={warehouse.name}
                      value={warehouse.id}
                      color={colors.textPrimary}
                    />
                  ))}
                </Picker>
              )}
            </View>
            {selectedWarehouse && (
              <Text style={styles.selectedText}>
                Selected: {getSelectedItemName(warehouses, selectedWarehouse)}
              </Text>
            )}
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={isLoading || isLoadingLocal}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.button, 
                styles.saveButton, 
                isLoginDisabled && styles.buttonDisabled
              ]}
              onPress={handleLogin}
              disabled={isLoginDisabled}
            >
              {(isLoading || isLoadingLocal) ? (
                <ActivityIndicator size="small" color={colors.textInverse} />
              ) : (
                <Text style={styles.saveButtonText}>Complete Login</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  imageContainer: {
    height: height / 5,
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingTop: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  image: {
    height: height / 6,
    width: width / 4,
  },
  userInfoContainer: {
    alignItems: 'center',
    paddingVertical: 5,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  userInfoText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    fontFamily: 'K2D-SemiBold',
    marginBottom: 4,
  },
  userInfoSubtext: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: 'K2D-Regular',
  },
  mainCard: {
    flex: 1,
    backgroundColor: colors.surface,
    marginTop: 10,
    marginHorizontal: 15,
    borderRadius: 20,
    elevation: 8,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 10,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: 'K2D-Bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 10,
    backgroundColor: colors.inputBackground,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'K2D-SemiBold',
    marginBottom: 10,
  },
  pickerWrapper: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    minHeight: 30,
  },
  pickerWrapperSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(33, 150, 243, 0.05)',
  },
  pickerWrapperDisabled: {
    backgroundColor: colors.surfaceDisabled,
    borderColor: colors.borderLight,
  },
  picker: {
    height: 50,
    color: colors.textPrimary,
    fontFamily: 'K2D-Regular',
  },
  loadingPlaceholder: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  loadingText: {
    marginLeft: 10,
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: 'K2D-Regular',
  },
  disabledPlaceholder: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  disabledText: {
    color: colors.textTertiary,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: 'K2D-Regular',
  },
  selectedText: {
    fontSize: 14,
    color: colors.success,
    fontFamily: 'K2D-Regular',
    marginTop: 8,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    marginBottom: 10,
  },
  button: {
    height: 55,
    flex: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontFamily: 'K2D-SemiBold',
  },
  saveButton: {
    backgroundColor: colors.primary,
    elevation: 4,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: colors.textInverse,
    fontSize: 16,
    fontFamily: 'K2D-Bold',
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default SelectRoleScreen;