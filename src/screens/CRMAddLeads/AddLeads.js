// screens/AddLeads.js – Updated with floating dropdown menu for country (no modal)
// Fixed safe area header

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Text,
  StatusBar,
  ActivityIndicator,
  TextInput,
  FlatList,
  SafeAreaView,
  Modal,
  Dimensions,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomHeader from '../../components/CustomHeader';
import { useAddLeadForm } from '../../hooks/CRMhooks/useAddLeadForm';
import { useCreateLead, useSalesRepresentatives, useCountries } from '../../hooks/CRMhooks/useCRM';
import { useAuthStore } from '../../store/authStore';
import { FormInput, PhoneInput } from '../../components/AddLead/LeadForm';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomAlert from '../../components/CustomAlert';
import CRMTheme from '../../constants/CRMTheme/CRMTheme';
import crmApiService from '../../services/CRMAPI/crmApiService';

// Fallback countries with correct IDs from original component
const FALLBACK_COUNTRIES = [
  { id: 271, name: 'Pakistan', countryCode: 'PK' },
  { id: 1000002, name: 'United States', countryCode: 'US' },
  { id: 1000003, name: 'United Kingdom', countryCode: 'GB' },
  { id: 1000004, name: 'Canada', countryCode: 'CA' },
  { id: 1000005, name: 'Australia', countryCode: 'AU' },
  { id: 1000006, name: 'Germany', countryCode: 'DE' },
  { id: 1000007, name: 'France', countryCode: 'FR' },
  { id: 1000008, name: 'Italy', countryCode: 'IT' },
  { id: 1000009, name: 'Spain', countryCode: 'ES' },
  { id: 1000010, name: 'UAE', countryCode: 'AE' },
  { id: 1000011, name: 'China', countryCode: 'CN' },
  { id: 1000012, name: 'India', countryCode: 'IN' },
];

const { height: windowHeight } = Dimensions.get('window');

const AddLeads = () => {
  const navigation = useNavigation();

  // Auth data
  const authUserId = useAuthStore((state) => state.userId);
  const authUserName = useAuthStore((state) => state.userName);
  const clientId = useAuthStore((state) => state.clientId);
  const orgId = useAuthStore((state) => state.organizationId);

  // Fallbacks
  const defaultClientId = clientId || 1000000;
  const defaultOrgId = orgId || 1000001;

  const [isMounted, setIsMounted] = useState(false);
  const [initialRepSet, setInitialRepSet] = useState(false);

  // Address card expanded state
  const [addressExpanded, setAddressExpanded] = useState(false);

  // Address fields
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');

  // Countries state (for address)
  const [countries, setCountries] = useState(FALLBACK_COUNTRIES);
  const [selectedCountry, setSelectedCountry] = useState(null);

  // Dropdown state for country (floating menu)
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const countryButtonRef = useRef(null);

  // Address summary
  const [addressSummary, setAddressSummary] = useState('');

  // Fetch countries from API
  const { data: countriesFromApi = [], isLoading: countriesLoading } = useCountries(isMounted);

  // Phone state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneDialCode, setPhoneDialCode] = useState('+92');
  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState(null);

  // Alert config
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

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Process API countries when they arrive (for address) – update list but keep selection null
  useEffect(() => {
    if (countriesFromApi && countriesFromApi.length > 0) {
      const mapped = countriesFromApi.map(c => ({
        id: c.id,
        name: c.Name || c.identifier || 'Unknown',
        countryCode: c.CountryCode || '',
      }));
      setCountries(mapped);
      // Do not set a default selected country
    }
  }, [countriesFromApi]);

  // Form hook
  const {
    formData,
    errors,
    focusedField,
    updateField,
    setFocusedField,
  } = useAddLeadForm();

  const createLeadMutation = useCreateLead();

  // Sales reps
  const {
    data: salesReps = [],
    isLoading: loadingSalesReps,
  } = useSalesRepresentatives(isMounted);

  const [showSalesRepModal, setShowSalesRepModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSalesReps = useMemo(() => {
    if (!searchQuery.trim()) return salesReps;
    const query = searchQuery.toLowerCase();
    return salesReps.filter(rep => rep.Name && rep.Name.toLowerCase().includes(query));
  }, [salesReps, searchQuery]);

  // Auto‑set sales rep to current user
  useEffect(() => {
    if (!initialRepSet && salesReps.length > 0 && authUserId) {
      const numericAuthId = parseInt(authUserId, 10);
      const currentUserAsRep = salesReps.find(rep => rep.id === numericAuthId);
      if (currentUserAsRep) {
        console.log('✅ Auto-selected sales rep by ID:', currentUserAsRep.Name);
        updateField('salesRep', currentUserAsRep.id);
        setInitialRepSet(true);
      } else if (authUserName) {
        const userByName = salesReps.find(rep =>
          rep.Name && rep.Name.toLowerCase() === authUserName.toLowerCase()
        );
        if (userByName) {
          console.log('✅ Auto-selected sales rep by name:', userByName.Name);
          updateField('salesRep', userByName.id);
          setInitialRepSet(true);
        } else {
          console.log('⚠️ Current user not found in sales reps list – no default set');
        }
      }
    }
  }, [salesReps, authUserId, authUserName, formData.salesRep, initialRepSet, updateField]);

  const selectedRepName = useMemo(() => {
    if (!formData.salesRep) return '';
    const rep = salesReps.find(r => r.id === formData.salesRep);
    return rep ? rep.Name : '';
  }, [formData.salesRep, salesReps]);

  // Filtered countries for dropdown
  const filteredCountries = useMemo(() => {
    if (!countrySearchQuery.trim()) return countries;
    const query = countrySearchQuery.toLowerCase();
    return countries.filter(c => c.name.toLowerCase().includes(query));
  }, [countries, countrySearchQuery]);

  // Alert helpers
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
      showCancelButton: type === 'delete' || type === 'warning',
    });
  };

  const showSuccessAlert = (message, onConfirm = null) => {
    showAlert('Success', message, 'success', onConfirm);
  };

  const showErrorAlert = (message, onConfirm = null) => {
    showAlert('Error', message, 'error', onConfirm);
  };

  const showValidationAlert = (message) => {
    showAlert('Validation Error', message, 'warning');
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  // Sales rep selection
  const handleSelectSalesRep = (rep) => {
    updateField('salesRep', rep.id);
    setShowSalesRepModal(false);
    setSearchQuery('');
  };

  const handleClearSalesRep = () => {
    updateField('salesRep', '');
    setInitialRepSet(false);
  };

  // Handle phone country change
  const handlePhoneCountryChange = (country) => {
    setSelectedPhoneCountry(country);
    setPhoneDialCode(`+${country.callingCode[0]}`);
  };

  // Update address summary whenever fields change
  useEffect(() => {
    const parts = [];
    if (street) parts.push(street);
    if (city) parts.push(city);
    if (selectedCountry?.name) parts.push(selectedCountry.name);
    setAddressSummary(parts.join(', '));
  }, [street, city, selectedCountry]);

  // Validation
  const validateForm = () => {
    if (!formData.name?.trim()) {
      showValidationAlert('Name is required');
      return false;
    }
    if (!formData.email?.trim()) {
      showValidationAlert('Email is required');
      return false;
    }

    const fullPhone = phoneDialCode + phoneNumber;
    if (!phoneNumber.trim()) {
      showValidationAlert('Phone is required');
      return false;
    }

    if (!formData.salesRep) {
      showValidationAlert('Sales Representative is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showValidationAlert('Enter a valid email address');
      return false;
    }

    const phoneRegex = /^\+\d{8,15}$/;
    if (!phoneRegex.test(fullPhone)) {
      showValidationAlert('Phone must start with + and contain 8-15 digits (e.g., +923001234567)');
      return false;
    }

    return true;
  };

  // Prepare location payload – if no country selected, we cannot create location;
  // but the address is optional; we'll only create location if user has entered any address field.
  const prepareLocationPayload = () => {
    if (!street && !city) return null; // no address to save
    if (!selectedCountry) {
      throw new Error('Please select a country for the address.');
    }
    return {
      AD_Client_ID: { id: defaultClientId },
      AD_Org_ID: { id: defaultOrgId },
      Address1: street || '',
      City: city || '',
      C_Country_ID: { id: selectedCountry.id },
      IsActive: true,
    };
  };

  // Prepare lead payload
  const prepareLeadPayload = (locationId) => {
    const salesRepId = formData.salesRep ? parseInt(formData.salesRep, 10) : null;
    const fullPhone = phoneDialCode + phoneNumber;

    return {
      Name: formData.name,
      EMail: formData.email,
      Phone: fullPhone,
      IsSalesLead: true,
      SalesRep_ID: { id: salesRepId },
      AD_Org_ID: { id: defaultOrgId },
      AD_Client_ID: { id: defaultClientId },
      IsActive: true,
      ...(locationId && { C_Location_ID: { id: locationId } }),
    };
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      let locationId = null;
      if (street || city) {
        const locationPayload = prepareLocationPayload(); // will throw if no country
        if (locationPayload) {
          console.log('📍 Location payload:', JSON.stringify(locationPayload, null, 2));
          const locationResponse = await crmApiService.createLocation(locationPayload);
          locationId = locationResponse.id;
        }
      }

      const leadPayload = prepareLeadPayload(locationId);
      console.log('📦 Lead payload:', JSON.stringify(leadPayload, null, 2));
      await createLeadMutation.mutateAsync(leadPayload);

      if (isMounted) {
        showSuccessAlert('Lead created successfully!', () => {
          hideAlert();
          if (isMounted) navigation.goBack();
        });
      }
    } catch (error) {
      console.error('❌ Lead creation error:', error);
      if (isMounted) {
        showErrorAlert(error.message || 'Failed to create lead. Please try again.');
      }
    }
  };

  const isLoading = createLeadMutation.isLoading || loadingSalesReps || countriesLoading;

  const renderSalesRepItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.repItem,
        formData.salesRep === item.id && styles.selectedRepItem,
      ]}
      onPress={() => handleSelectSalesRep(item)}
    >
      <View style={styles.repItemContent}>
        <Text style={styles.repName}>{item.Name}</Text>
        {item.EMail && <Text style={styles.repEmail}>{item.EMail}</Text>}
        {item.id === parseInt(authUserId) && <Text style={styles.currentUserBadge}>(You)</Text>}
      </View>
      {formData.salesRep === item.id && (
        <Icon name="check" size={20} color={CRMTheme.Colors.primary} />
      )}
    </TouchableOpacity>
  );

  // Measure button position when opening dropdown
  const openCountryDropdown = () => {
    if (countryButtonRef.current) {
      countryButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
        setDropdownPosition({
          top: pageY + height, // below the button
          left: pageX,
          width: width,
        });
        setShowCountryDropdown(true);
      });
    }
  };

  // Flat input styles
  const flatInputContainerStyle = {
    marginBottom: CRMTheme.Spacing.md,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  };

  const flatInputStyle = {
    borderWidth: 1,
    borderColor: CRMTheme.Colors.border,
    borderRadius: CRMTheme.Layout.borderRadius.md,
    paddingHorizontal: CRMTheme.Spacing.md,
    paddingVertical: CRMTheme.Spacing.sm,
    fontSize: CRMTheme.Typography.fontSize.medium,
    fontFamily: CRMTheme.Typography.fontFamily.regular,
    color: CRMTheme.Colors.textPrimary,
    backgroundColor: CRMTheme.Colors.backgroundLight,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  };

  // Determine wrapper component and style for safe area handling
  const HeaderWrapper = Platform.OS === 'ios' ? SafeAreaView : View;
  const headerWrapperStyle = Platform.OS === 'android'
    ? { paddingTop: RNStatusBar.currentHeight || 0, backgroundColor: 'transparent' }
    : { backgroundColor: 'transparent' };

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" />
      <HeaderWrapper style={headerWrapperStyle}>
        <CustomHeader title="Add Lead" />
      </HeaderWrapper>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={() => {
          if (alertConfig.onConfirm) alertConfig.onConfirm();
          hideAlert();
        }}
        onCancel={() => {
          if (alertConfig.onCancel) alertConfig.onCancel();
          hideAlert();
        }}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        showCancelButton={alertConfig.showCancelButton}
      />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={CRMTheme.Colors.primary} />
          <Text style={styles.loadingText}>
            {createLeadMutation.isLoading ? 'Creating lead...' : 'Loading data...'}
          </Text>
        </View>
      )}

      {/* Main container – takes remaining space */}
      <View style={styles.mainContainer}>
        {/* Scrollable content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Form Card – all input fields */}
          <View style={styles.formCard}>
            {/* Name */}
            <FormInput
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="Name *"
              error={errors.name}
              focused={focusedField === 'name'}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              containerStyle={flatInputContainerStyle}
              inputStyle={flatInputStyle}
            />

            {/* Email */}
            <FormInput
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="Email *"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              focused={focusedField === 'email'}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              containerStyle={flatInputContainerStyle}
              inputStyle={flatInputStyle}
            />

            {/* Phone with integrated country picker */}
            <View style={styles.Phone}>
              <PhoneInput
                required
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                onCountryChange={handlePhoneCountryChange}
                defaultCountryCode="PK"
                placeholder="Enter phone number"
                error={errors.phone}
                focused={focusedField === 'phone'}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                containerStyle={flatInputContainerStyle}
              />
            </View>

            {/* Address Expandable Card */}
            <View style={styles.addressCard}>
              <TouchableOpacity
                style={styles.addressHeader}
                onPress={() => setAddressExpanded(!addressExpanded)}
              >
                <Text style={styles.addressHeaderText}>
                  {addressSummary ? `Address: ${addressSummary}` : 'Add Address'}
                </Text>
                <Icon
                  name={addressExpanded ? 'expand-less' : 'expand-more'}
                  size={24}
                  color={CRMTheme.Colors.textSecondary}
                />
              </TouchableOpacity>

              {addressExpanded && (
                <View style={styles.addressFields}>
                  {/* Street – full width */}
                  <FormInput
                    value={street}
                    onChangeText={setStreet}
                    placeholder="Street address"
                    containerStyle={flatInputContainerStyle}
                    inputStyle={flatInputStyle}
                  />

                  {/* City and Country in a row */}
                  <View style={styles.row}>
                    <View style={styles.cityContainer}>
                      <FormInput
                        value={city}
                        onChangeText={setCity}
                        placeholder="City"
                        containerStyle={{ ...flatInputContainerStyle, marginBottom: 0 }}
                        inputStyle={flatInputStyle}
                      />
                    </View>
                    <View style={styles.countryContainer}>
                      {/* Country picker button that opens floating menu */}
                      <TouchableOpacity
                        ref={countryButtonRef}
                        style={styles.countryPickerButton}
                        onPress={openCountryDropdown}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.countryPickerText, !selectedCountry && styles.placeholderText]}>
                          {selectedCountry?.name || 'Select Country'}
                        </Text>
                        <Icon name="arrow-drop-down" size={24} color={CRMTheme.Colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Sales Representative */}
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Sales Representative *</Text>
              <TouchableOpacity
                style={[
                  styles.salesRepSelector,
                  errors.salesRep && styles.selectorError,
                ]}
                onPress={() => setShowSalesRepModal(true)}
              >
                {selectedRepName ? (
                  <View style={styles.selectedRepContainer}>
                    <Text style={styles.selectedRepText}>{selectedRepName}</Text>
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleClearSalesRep();
                      }}
                    >
                      <Icon name="close" size={18} color={CRMTheme.Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.placeholderText}>Select Sales Representative</Text>
                )}
                <Icon name="arrow-drop-down" size={24} color={CRMTheme.Colors.textSecondary} />
              </TouchableOpacity>
              {errors.salesRep && <Text style={styles.errorText}>{errors.salesRep}</Text>}
            </View>
          </View>

          {/* Information text below form card */}
          <Text style={styles.infoText}>Additional information can be updated later.</Text>

          {/* Extra bottom padding to avoid button overlap */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Fixed Submit Button at bottom */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (createLeadMutation.isLoading || !formData.name || !formData.email || !phoneNumber || !formData.salesRep) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={createLeadMutation.isLoading || !formData.name || !formData.email || !phoneNumber || !formData.salesRep}
          >
            <Text style={styles.submitButtonText}>
              {createLeadMutation.isLoading ? 'Creating...' : 'Create Lead'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sales Rep Modal (unchanged) */}
      <Modal
        visible={showSalesRepModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowSalesRepModal(false);
          setSearchQuery('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Sales Representative</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowSalesRepModal(false);
                  setSearchQuery('');
                }}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color={CRMTheme.Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color={CRMTheme.Colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={true}
                placeholderTextColor={CRMTheme.Colors.textTertiary}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearSearchButton}
                >
                  <Icon name="close" size={18} color={CRMTheme.Colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filteredSalesReps}
              renderItem={renderSalesRepItem}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="person-off" size={50} color={CRMTheme.Colors.borderDark} />
                  <Text style={styles.emptyText}>
                    {searchQuery.trim()
                      ? `No sales representatives found for "${searchQuery}"`
                      : 'No sales representatives available'}
                  </Text>
                </View>
              }
              style={styles.repList}
              contentContainerStyle={styles.repListContent}
            />

            <View style={styles.modalFooter}>
              <Text style={styles.footerText}>
                {filteredSalesReps.length} of {salesReps.length} sales representatives
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating Country Dropdown Menu */}
      {showCountryDropdown && (
        <TouchableWithoutFeedback onPress={() => setShowCountryDropdown(false)}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>
      )}
      {showCountryDropdown && (
        <View
          style={[
            styles.countryDropdownMenu,
            {
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              maxHeight: windowHeight * 0.4,
            },
          ]}
        >
          {/* Search input */}
          <View style={styles.dropdownSearchContainer}>
            <Icon name="search" size={20} color={CRMTheme.Colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.dropdownSearchInput}
              placeholder="Search country..."
              value={countrySearchQuery}
              onChangeText={setCountrySearchQuery}
              placeholderTextColor={CRMTheme.Colors.textTertiary}
            />
            {countrySearchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setCountrySearchQuery('')}
                style={styles.clearSearchButton}
              >
                <Icon name="close" size={18} color={CRMTheme.Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Country list */}
          <FlatList
            data={filteredCountries}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.countryDropdownItem,
                  selectedCountry?.id === item.id && styles.selectedCountryDropdownItem,
                ]}
                onPress={() => {
                  setSelectedCountry(item);
                  setShowCountryDropdown(false);
                  setCountrySearchQuery('');
                }}
              >
                <Text style={styles.countryDropdownItemText}>{item.name}</Text>
                {selectedCountry?.id === item.id && (
                  <Icon name="check" size={20} color={CRMTheme.Colors.primary} />
                )}
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <View style={styles.dropdownEmptyContainer}>
                <Text style={styles.dropdownEmptyText}>
                  {countrySearchQuery.trim()
                    ? `No countries found for "${countrySearchQuery}"`
                    : 'No countries available'}
                </Text>
              </View>
            }
            style={styles.countryDropdownList}
            contentContainerStyle={styles.countryDropdownListContent}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </>
  );
};

// Styles (add mainContainer)
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: CRMTheme.Colors.background,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: CRMTheme.Spacing.sm,
    fontSize: CRMTheme.Typography.fontSize.medium,
    color: CRMTheme.Colors.textPrimary,
    fontFamily: CRMTheme.Typography.fontFamily.medium,
  },
  scrollContent: {
    paddingHorizontal: CRMTheme.Spacing.md,
    paddingVertical: CRMTheme.Spacing.lg,
  },
  formCard: {
    backgroundColor: CRMTheme.Colors.backgroundLight,
    borderRadius: CRMTheme.Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: CRMTheme.Colors.border,
    paddingTop: CRMTheme.Spacing.lg,
    paddingBottom: 0,
  },
  infoText: {
    fontSize: CRMTheme.Typography.fontSize.medium,
    color: CRMTheme.Colors.textSecondary,
    fontFamily: CRMTheme.Typography.fontFamily.medium,
    marginTop: CRMTheme.Spacing.md,
    marginBottom: CRMTheme.Spacing.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomSpacer: {
    height: CRMTheme.Spacing.md,
  },
  addressCard: {
    borderBottomWidth: 1,
    borderBottomColor: CRMTheme.Colors.border,
    backgroundColor: CRMTheme.Colors.backgroundLight,
    marginBottom: CRMTheme.Spacing.md,
    overflow: 'hidden',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: CRMTheme.Spacing.md,
    paddingVertical: CRMTheme.Spacing.sm,
  },
  addressHeaderText: {
    fontSize: CRMTheme.Typography.fontSize.large,
    color: CRMTheme.Colors.textPrimary,
    fontFamily: CRMTheme.Typography.fontFamily.regular,
  },
  addressFields: {
    paddingVertical: CRMTheme.Spacing.sm,
    paddingBottom: 0,
    borderTopWidth: 1,
    borderTopColor: CRMTheme.Colors.borderLight,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: CRMTheme.Spacing.sm,
  },
  cityContainer: {
    flex: 1,
    marginRight: CRMTheme.Spacing.sm,
  },
  countryContainer: {
    flex: 1,
  },
  countryPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: CRMTheme.Spacing.sm,
    paddingHorizontal: CRMTheme.Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: CRMTheme.Colors.border,
    backgroundColor: 'transparent',
    height: 48,
  },
  countryPickerText: {
    fontSize: CRMTheme.Typography.fontSize.large,
    color: CRMTheme.Colors.textPrimary,
    fontFamily: CRMTheme.Typography.fontFamily.regular,
  },
  placeholderText: {
    fontSize: CRMTheme.Typography.fontSize.large,
    color: CRMTheme.Colors.textTertiary,
    fontFamily: CRMTheme.Typography.fontFamily.regular,
  },
  pickerLabel: {
    color: CRMTheme.Colors.textPrimary,
    fontFamily: CRMTheme.Typography.fontFamily.regular,
    fontSize: CRMTheme.Typography.fontSize.large,
    marginBottom: CRMTheme.Spacing.xs,
    marginLeft: CRMTheme.Spacing.sm,
  },
  salesRepSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: CRMTheme.Colors.border,
    paddingHorizontal: CRMTheme.Spacing.md,
    paddingVertical: CRMTheme.Spacing.sm,
    backgroundColor: CRMTheme.Colors.backgroundLight,
  },
  selectorError: {
    borderColor: CRMTheme.Colors.error,
  },
  selectedRepContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedRepText: {
    fontSize: CRMTheme.Typography.fontSize.large,
    color: CRMTheme.Colors.textPrimary,
    fontFamily: CRMTheme.Typography.fontFamily.regular,
  },
  clearButton: {
    padding: CRMTheme.Spacing.xs,
    marginLeft: CRMTheme.Spacing.sm,
  },
  errorText: {
    color: CRMTheme.Colors.error,
    fontSize: CRMTheme.Typography.fontSize.xsmall,
    marginTop: CRMTheme.Spacing.xs,
    marginLeft: CRMTheme.Spacing.xs,
    fontFamily: CRMTheme.Typography.fontFamily.regular,
  },
  buttonContainer: {
    backgroundColor: CRMTheme.Colors.background,
    paddingHorizontal: CRMTheme.Spacing.lg,
    paddingVertical: CRMTheme.Spacing.md,
    borderTopWidth: 1,
    borderTopColor: CRMTheme.Colors.borderLight,
  },
  submitButton: {
    backgroundColor: CRMTheme.Colors.primary,
    paddingVertical: CRMTheme.Spacing.md,
    borderRadius: CRMTheme.Layout.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  submitButtonDisabled: {
    backgroundColor: CRMTheme.Colors.buttonDisabled,
  },
  submitButtonText: {
    color: CRMTheme.Colors.textInverse,
    fontSize: CRMTheme.Typography.fontSize.button,
    fontFamily: CRMTheme.Typography.fontFamily.semiBold,
  },

  // Floating country dropdown menu
  countryDropdownMenu: {
    position: 'absolute',
    backgroundColor: CRMTheme.Colors.backgroundLight,
    borderWidth: 1,
    borderColor: CRMTheme.Colors.border,
    borderRadius: CRMTheme.Layout.borderRadius.md,
    zIndex: 2000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: CRMTheme.Colors.borderLight,
    paddingHorizontal: CRMTheme.Spacing.sm,
    paddingVertical: CRMTheme.Spacing.xs,
  },
  dropdownSearchInput: {
    flex: 1,
    height: 40,
    fontSize: CRMTheme.Typography.fontSize.medium,
    fontFamily: CRMTheme.Typography.fontFamily.regular,
    color: CRMTheme.Colors.textPrimary,
    padding: 0,
    marginLeft: CRMTheme.Spacing.xs,
  },
  searchIcon: {
    marginRight: CRMTheme.Spacing.xs,
  },
  clearSearchButton: {
    padding: CRMTheme.Spacing.xs,
  },
  countryDropdownList: {
    maxHeight: 200,
  },
  countryDropdownListContent: {
    paddingBottom: CRMTheme.Spacing.sm,
  },
  countryDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: CRMTheme.Spacing.sm,
    paddingHorizontal: CRMTheme.Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: CRMTheme.Colors.borderLight,
  },
  selectedCountryDropdownItem: {
    backgroundColor: CRMTheme.Colors.infoLight,
  },
  countryDropdownItemText: {
    fontSize: CRMTheme.Typography.fontSize.medium,
    fontFamily: CRMTheme.Typography.fontFamily.regular,
    color: CRMTheme.Colors.textPrimary,
  },
  dropdownEmptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: CRMTheme.Spacing.lg,
    paddingHorizontal: CRMTheme.Spacing.md,
  },
  dropdownEmptyText: {
    fontSize: CRMTheme.Typography.fontSize.medium,
    fontFamily: CRMTheme.Typography.fontFamily.regular,
    color: CRMTheme.Colors.textTertiary,
    textAlign: 'center',
  },

  // Modal styles (for sales rep)
  modalOverlay: {
    flex: 1,
    backgroundColor: CRMTheme.Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: CRMTheme.Colors.backgroundLight,
    borderTopLeftRadius: CRMTheme.Layout.borderRadius.xl,
    borderTopRightRadius: CRMTheme.Layout.borderRadius.xl,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: CRMTheme.Colors.border,
    borderBottomWidth: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: CRMTheme.Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: CRMTheme.Colors.borderLight,
  },
  modalTitle: {
    fontSize: CRMTheme.Typography.fontSize.h4,
    fontFamily: CRMTheme.Typography.fontFamily.semiBold,
    color: CRMTheme.Colors.textPrimary,
  },
  closeButton: {
    padding: CRMTheme.Spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CRMTheme.Colors.border,
    borderRadius: CRMTheme.Layout.borderRadius.md,
    margin: CRMTheme.Spacing.md,
    paddingHorizontal: CRMTheme.Spacing.sm,
    backgroundColor: CRMTheme.Colors.backgroundLight,
  },
  searchInput: {
    flex: 1,
    height: CRMTheme.Layout.input.height,
    fontSize: CRMTheme.Typography.fontSize.medium,
    fontFamily: CRMTheme.Typography.fontFamily.regular,
    color: CRMTheme.Colors.textPrimary,
    padding: 0,
  },
  repList: {
    maxHeight: CRMTheme.Layout.modal.maxHeight - CRMTheme.Layout.button.height.md * 4,
  },
  repListContent: {
    paddingBottom: CRMTheme.Spacing.md,
  },
  repItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: CRMTheme.Spacing.sm,
    paddingHorizontal: CRMTheme.Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: CRMTheme.Colors.borderLight,
  },
  selectedRepItem: {
    backgroundColor: CRMTheme.Colors.infoLight,
  },
  repItemContent: {
    flex: 1,
  },
  repName: {
    fontSize: CRMTheme.Typography.fontSize.medium,
    fontFamily: CRMTheme.Typography.fontFamily.semiBold,
    color: CRMTheme.Colors.textPrimary,
  },
  repEmail: {
    fontSize: CRMTheme.Typography.fontSize.xsmall,
    color: CRMTheme.Colors.textSecondary,
    fontFamily: CRMTheme.Typography.fontFamily.regular,
    marginTop: CRMTheme.Spacing.xxs,
  },
  currentUserBadge: {
    fontSize: CRMTheme.Typography.fontSize.xsmall,
    color: CRMTheme.Colors.primary,
    fontFamily: CRMTheme.Typography.fontFamily.medium,
    marginTop: CRMTheme.Spacing.xxs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: CRMTheme.Spacing.xxxl,
    paddingHorizontal: CRMTheme.Spacing.lg,
  },
  emptyText: {
    fontSize: CRMTheme.Typography.fontSize.medium,
    fontFamily: CRMTheme.Typography.fontFamily.regular,
    color: CRMTheme.Colors.textTertiary,
    textAlign: 'center',
    marginTop: CRMTheme.Spacing.md,
  },
  modalFooter: {
    padding: CRMTheme.Spacing.md,
    borderTopWidth: 1,
    borderTopColor: CRMTheme.Colors.borderLight,
    alignItems: 'center',
  },
  footerText: {
    fontSize: CRMTheme.Typography.fontSize.small,
    fontFamily: CRMTheme.Typography.fontFamily.regular,
    color: CRMTheme.Colors.textSecondary,
  },
  Phone: {
    marginLeft: CRMTheme.Spacing.sm,
  },
});

export default AddLeads;