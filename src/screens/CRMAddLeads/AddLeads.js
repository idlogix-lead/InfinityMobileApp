// screens/AddLeads.js - COMPLETE FIXED VERSION with CRMTheme and default sales rep

import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StatusBar,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomHeader from '../../components/CustomHeader';
import { useAddLeadForm } from '../../hooks/CRMhooks/useAddLeadForm';
import { useCreateLead, useSalesRepresentatives } from '../../hooks/CRMhooks/useCRM';
import { useAuthStore } from '../../store/authStore';
import FormSection from '../../components/AddLead/FormSection';
import { FormInput, PhoneInput } from '../../components/AddLead/LeadForm';
import SelectPicker from '../../components/AddLead/SelectPicker';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomAlert from '../../components/CustomAlert';
import CRMTheme from '../../constants/CRMTheme/CRMTheme';

// Mock data for countries and regions - in production, these would come from API
const COUNTRIES = [
  { label: 'Pakistan', value: 'PK', id: 1000001 },
  { label: 'United States', value: 'US', id: 1000002 },
  { label: 'United Kingdom', value: 'GB', id: 1000003 },
  { label: 'Canada', value: 'CA', id: 1000004 },
  { label: 'Australia', value: 'AU', id: 1000005 },
  { label: 'Germany', value: 'DE', id: 1000006 },
  { label: 'France', value: 'FR', id: 1000007 },
  { label: 'Italy', value: 'IT', id: 1000008 },
  { label: 'Spain', value: 'ES', id: 1000009 },
  { label: 'UAE', value: 'AE', id: 1000010 },
  { label: 'China', value: 'CN', id: 1000011 },
  { label: 'India', value: 'IN', id: 1000012 },
];

// Regions/States based on country
const REGIONS = {
  PK: [
    { label: 'Punjab', value: 'PK-PB', id: 2000001 },
    { label: 'Sindh', value: 'PK-SD', id: 2000002 },
    { label: 'Khyber Pakhtunkhwa', value: 'PK-KP', id: 2000003 },
    { label: 'Balochistan', value: 'PK-BL', id: 2000004 },
    { label: 'Islamabad Capital Territory', value: 'PK-IS', id: 2000005 },
  ],
  US: [
    { label: 'California', value: 'US-CA', id: 2000101 },
    { label: 'Texas', value: 'US-TX', id: 2000102 },
    { label: 'New York', value: 'US-NY', id: 2000103 },
    { label: 'Florida', value: 'US-FL', id: 2000104 },
    { label: 'Illinois', value: 'US-IL', id: 2000105 },
  ],
  GB: [
    { label: 'England', value: 'GB-ENG', id: 2000201 },
    { label: 'Scotland', value: 'GB-SCT', id: 2000202 },
    { label: 'Wales', value: 'GB-WLS', id: 2000203 },
    { label: 'Northern Ireland', value: 'GB-NIR', id: 2000204 },
  ],
};

const AddLeads = () => {
  const navigation = useNavigation();
  
  // Get auth state
  const authUserId = useAuthStore((state) => state.userId);
  const authUserName = useAuthStore((state) => state.userName);
  
  console.log('🔐 Current logged in user:', { authUserId, authUserName });
  
  // State to track if component is mounted
  const [isMounted, setIsMounted] = useState(false);
  const [initialRepSet, setInitialRepSet] = useState(false);

  // State for address fields
  const [addressFields, setAddressFields] = useState({
    street: '',
    street2: '',
    city: '',
    postalCode: '',
    country: '',
    countryId: null,
    region: '',
    regionId: null,
  });

  // State for Business Partner address fields (same format as addressFields)
  const [bpAddressFields, setBpAddressFields] = useState({
    street: '',
    street2: '',
    city: '',
    postalCode: '',
    country: '',
    countryId: null,
    region: '',
    regionId: null,
  });

  // State for region options based on selected country (for contact address)
  const [regionOptions, setRegionOptions] = useState([]);
  
  // State for region options based on selected country (for business partner address)
  const [bpRegionOptions, setBpRegionOptions] = useState([]);

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

  // useEffect to set mounted state after first render
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  // Update region options when contact country changes
  useEffect(() => {
    if (addressFields.country) {
      const country = COUNTRIES.find(c => c.value === addressFields.country);
      if (country && REGIONS[country.value]) {
        setRegionOptions(REGIONS[country.value]);
      } else {
        setRegionOptions([]);
      }
    } else {
      setRegionOptions([]);
    }
  }, [addressFields.country]);

  // Update region options when business partner country changes
  useEffect(() => {
    if (bpAddressFields.country) {
      const country = COUNTRIES.find(c => c.value === bpAddressFields.country);
      if (country && REGIONS[country.value]) {
        setBpRegionOptions(REGIONS[country.value]);
      } else {
        setBpRegionOptions([]);
      }
    } else {
      setBpRegionOptions([]);
    }
  }, [bpAddressFields.country]);

  // Use custom form hook
  const {
    formData,
    errors,
    focusedField,
    expandedSections,
    updateField,
    setFocusedField,
    toggleSection,
    validateRequiredFields,
    copyContactToBusinessPartner,
    prepareSubmitData,
  } = useAddLeadForm();

  const createLeadMutation = useCreateLead();
  
  // Get sales reps list
  const { 
    data: salesReps = [], 
    isLoading: loadingSalesReps,
    refetch 
  } = useSalesRepresentatives(isMounted);

  // State for searchable sales rep picker
  const [showSalesRepModal, setShowSalesRepModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Status options
  const leadStatusOptions = [
    { label: 'New', value: 'N' },
    { label: 'Working', value: 'W' },
    { label: 'Expired', value: 'E' },
    { label: 'Converted', value: 'C' },
  ];

  // Lead source options
  const leadSourceOptions = [
    { label: 'Cold Call', value: 'CC' },
    { label: 'Existing Customer', value: 'EC' },
    { label: 'Self Generated', value: 'SG' },
    { label: 'Employee', value: 'EM' },
    { label: 'Partner', value: 'PA' },
    { label: 'Public Relations', value: 'PR' },
    { label: 'Direct Mail', value: 'DM' },
    { label: 'Conference', value: 'CO' },
    { label: 'Trade Show', value: 'TS' },
    { label: 'Web Site', value: 'WS' },
    { label: 'Word of mouth', value: 'WM' },
    { label: 'Email', value: 'EM' },
    { label: 'Campaign', value: 'CA' },
    { label: 'Other', value: 'OT' },
  ];

  // Filter sales reps based on search query
  const filteredSalesReps = useMemo(() => {
    if (!searchQuery.trim()) {
      return salesReps;
    }
    
    const query = searchQuery.toLowerCase();
    return salesReps.filter(rep => 
      rep.Name && rep.Name.toLowerCase().includes(query)
    );
  }, [salesReps, searchQuery]);

  // Set default sales rep to current user once salesReps are loaded
  useEffect(() => {
    // Only run if we haven't set initial rep yet, we have sales reps loaded, and we have authUserId
    if (!initialRepSet && salesReps.length > 0 && authUserId && !formData.salesRep) {
      console.log('🎯 Attempting to set default sales rep to current user:', authUserId);
      
      // Try to find current user in sales reps list by ID
      const currentUserAsRep = salesReps.find(rep => rep.id === parseInt(authUserId));
      
      if (currentUserAsRep) {
        console.log('✅ Found current user in sales reps list:', currentUserAsRep.Name);
        updateField('salesRep', currentUserAsRep.id);
        setInitialRepSet(true);
      } else {
        console.log('⚠️ Current user not found in sales reps list, looking by name...');
        
        // Try to find by name as fallback
        const userByName = salesReps.find(rep => 
          rep.Name && rep.Name.toLowerCase() === authUserName?.toLowerCase()
        );
        
        if (userByName) {
          console.log('✅ Found current user by name:', userByName.Name);
          updateField('salesRep', userByName.id);
          setInitialRepSet(true);
        } else {
          console.log('❌ Could not find current user in sales reps list');
          console.log('Auth User:', { id: authUserId, name: authUserName });
          console.log('Available rep IDs:', salesReps.map(r => r.id).slice(0, 10));
        }
      }
    }
  }, [salesReps, authUserId, authUserName, formData.salesRep, initialRepSet, updateField]);

  // Get selected sales rep name
  const selectedRepName = useMemo(() => {
    if (!formData.salesRep) return '';
    const rep = salesReps.find(r => r.id === formData.salesRep);
    return rep ? rep.Name : '';
  }, [formData.salesRep, salesReps]);

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

  // Handle sales rep selection
  const handleSelectSalesRep = (rep) => {
    updateField('salesRep', rep.id);
    setShowSalesRepModal(false);
    setSearchQuery('');
  };

  // Clear selected sales rep
  const handleClearSalesRep = () => {
    updateField('salesRep', '');
    setInitialRepSet(false); // Allow re-setting default if cleared
  };

  // Handle contact address field updates
  const handleAddressFieldChange = (field, value) => {
    setAddressFields(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // For backward compatibility, also update the combined address field
    const combinedAddress = generateCombinedAddress({
      ...addressFields,
      [field]: value,
    });
    updateField('address', combinedAddress);
  };

  // Handle business partner address field updates
  const handleBpAddressFieldChange = (field, value) => {
    setBpAddressFields(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Update company address for backward compatibility
    const combinedAddress = generateCombinedAddress({
      ...bpAddressFields,
      [field]: value,
    });
    updateField('companyAddress', combinedAddress);
  };

  // Generate combined address from separate fields
  const generateCombinedAddress = (fields) => {
    const parts = [];
    if (fields.street) parts.push(fields.street);
    if (fields.street2) parts.push(fields.street2);
    
    const cityRegion = [];
    if (fields.city) cityRegion.push(fields.city);
    if (fields.region) cityRegion.push(fields.region);
    if (cityRegion.length > 0) parts.push(cityRegion.join(', '));
    
    if (fields.country) parts.push(fields.country);
    if (fields.postalCode) parts.push(fields.postalCode);
    
    return parts.join(', ');
  };

  // Copy contact address to business partner address with simple icon
  const copyAddressToBusinessPartner = () => {
    setBpAddressFields({ ...addressFields });
    const combinedAddress = generateCombinedAddress(addressFields);
    updateField('companyAddress', combinedAddress);
  };

  // Copy contact name to business partner name
  const copyContactToBusinessPartnerName = () => {
    if (formData.name) {
      updateField('companyName', formData.name);
    }
  };

  // Override the prepareSubmitData to include separate address fields for both contact and business partner
  const enhancedPrepareSubmitData = () => {
    const baseData = prepareSubmitData();
    
    return {
      ...baseData,
      // Contact address fields
      contactAddressFields: {
        street: addressFields.street,
        street2: addressFields.street2,
        city: addressFields.city,
        postalCode: addressFields.postalCode,
        country: addressFields.country,
        countryId: addressFields.countryId,
        region: addressFields.region,
        regionId: addressFields.regionId,
      },
      // Business Partner address fields (same format)
      businessPartnerAddressFields: {
        street: bpAddressFields.street,
        street2: bpAddressFields.street2,
        city: bpAddressFields.city,
        postalCode: bpAddressFields.postalCode,
        country: bpAddressFields.country,
        countryId: bpAddressFields.countryId,
        region: bpAddressFields.region,
        regionId: bpAddressFields.regionId,
      },
      // Combined addresses for backward compatibility
      address: generateCombinedAddress(addressFields),
      companyAddress: generateCombinedAddress(bpAddressFields),
    };
  };

  // Handle form submission - validate only mandatory fields
  const handleSubmit = async () => {
    // Validate only the mandatory fields: name, salesRep, client, organization
    if (!formData.name) {
      showValidationAlert('Name is required.');
      return;
    }

    if (!formData.salesRep) {
      showValidationAlert('Please select a Sales Representative.');
      return;
    }

    if (!formData.client) {
      showValidationAlert('Client is required.');
      return;
    }

    if (!formData.organization) {
      showValidationAlert('Organization is required.');
      return;
    }

    try {
      const submitData = enhancedPrepareSubmitData();
      console.log('📦 Submitting lead data:', JSON.stringify(submitData, null, 2));
      
      await createLeadMutation.mutateAsync(submitData);
      
      if (isMounted) {
        showSuccessAlert('Lead created successfully!', () => {
          hideAlert();
          if (isMounted) {
            navigation.goBack();
          }
        });
      }
    } catch (error) {
      console.error('❌ Lead creation error:', error);
      if (isMounted) {
        showErrorAlert(error.message || 'Failed to create lead. Please try again.');
      }
    }
  };

  // Loading state
  const isLoading = createLeadMutation.isLoading || loadingSalesReps;

  // Render sales rep item
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
        {item.EMail && (
          <Text style={styles.repEmail}>{item.EMail}</Text>
        )}
        {item.id === parseInt(authUserId) && (
          <Text style={styles.currentUserBadge}>(You)</Text>
        )}
      </View>
      {formData.salesRep === item.id && (
        <Icon name="check" size={20} color={CRMTheme.Colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <CustomHeader title="Add Lead" />
      
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
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={CRMTheme.Colors.primary} />
          <Text style={styles.loadingText}>
            {createLeadMutation.isLoading ? 'Creating lead...' : 'Loading data...'}
          </Text>
        </View>
      )}
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.formWrapper}
        contentContainerStyle={styles.formContent}
      >
        {/* Contact Info Section */}
        <FormSection
          title="Contact Info"
          expanded={expandedSections.contactInfo}
          onToggle={() => toggleSection('contactInfo')}
        >
          <FormInput
            label="Name"
            required
            value={formData.name}
            onChangeText={(value) => updateField('name', value)}
            placeholder="Enter name"
            error={errors.name}
            focused={focusedField === 'name'}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
          />
          
          {/* Client Field - MANDATORY - Moved to Contact Info */}
          <FormInput
            label="Client"
            required
            value={formData.client}
            onChangeText={(value) => updateField('client', value)}
            placeholder="Enter client"
            error={errors.client}
            focused={focusedField === 'client'}
            onFocus={() => setFocusedField('client')}
            onBlur={() => setFocusedField(null)}
          />
          
          {/* Organization Field - MANDATORY - Moved to Contact Info */}
          <FormInput
            label="Organization"
            required
            value={formData.organization}
            onChangeText={(value) => updateField('organization', value)}
            placeholder="Enter organization"
            error={errors.organization}
            focused={focusedField === 'organization'}
            onFocus={() => setFocusedField('organization')}
            onBlur={() => setFocusedField(null)}
          />
          
          <FormInput
            label="Email"
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            focused={focusedField === 'email'}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
          />
          
          <PhoneInput
            label="Phone"
            value={formData.phone}
            onChangeText={(value) => updateField('phone', value)}
            placeholder="Enter phone number"
            error={errors.phone}
            focused={focusedField === 'phone'}
            onFocus={() => setFocusedField('phone')}
            onBlur={() => setFocusedField(null)}
            defaultCountryCode="+92"
          />

          {/* Contact Address Fields - No required indicator */}
          <Text style={styles.sectionSubtitle}>Contact Address Details</Text>
          
          <FormInput
            label="Street Address"
            value={addressFields.street}
            onChangeText={(value) => handleAddressFieldChange('street', value)}
            placeholder="Enter street address"
            focused={focusedField === 'street'}
            onFocus={() => setFocusedField('street')}
            onBlur={() => setFocusedField(null)}
          />
          
          <FormInput
            label="Street Address Line 2"
            value={addressFields.street2}
            onChangeText={(value) => handleAddressFieldChange('street2', value)}
            placeholder="Apartment, suite, unit, etc."
            focused={focusedField === 'street2'}
            onFocus={() => setFocusedField('street2')}
            onBlur={() => setFocusedField(null)}
          />
          
          <FormInput
            label="City"
            value={addressFields.city}
            onChangeText={(value) => handleAddressFieldChange('city', value)}
            placeholder="Enter city"
            focused={focusedField === 'city'}
            onFocus={() => setFocusedField('city')}
            onBlur={() => setFocusedField(null)}
          />
          
          <FormInput
            label="Postal Code"
            value={addressFields.postalCode}
            onChangeText={(value) => handleAddressFieldChange('postalCode', value)}
            placeholder="Enter postal code"
            keyboardType="numeric"
            focused={focusedField === 'postalCode'}
            onFocus={() => setFocusedField('postalCode')}
            onBlur={() => setFocusedField(null)}
          />
          
          {/* Country Picker for Contact */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Country</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={addressFields.country}
                onValueChange={(value) => {
                  const country = COUNTRIES.find(c => c.value === value);
                  handleAddressFieldChange('country', value);
                  handleAddressFieldChange('countryId', country?.id || null);
                  handleAddressFieldChange('region', '');
                  handleAddressFieldChange('regionId', null);
                }}
                style={styles.picker}
                dropdownIconColor={CRMTheme.Colors.textSecondary}
              >
                <Picker.Item 
                  label="Select Country" 
                  value="" 
                  color={CRMTheme.Colors.textTertiary}
                />
                {COUNTRIES.map(country => (
                  <Picker.Item 
                    key={country.value} 
                    label={country.label} 
                    value={country.value}
                    color={CRMTheme.Colors.textPrimary}
                  />
                ))}
              </Picker>
            </View>
          </View>
          
          {/* Region/State Picker for Contact */}
          {regionOptions.length > 0 && (
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Region/State</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={addressFields.region}
                  onValueChange={(value) => {
                    const region = regionOptions.find(r => r.value === value);
                    handleAddressFieldChange('region', value);
                    handleAddressFieldChange('regionId', region?.id || null);
                  }}
                  style={styles.picker}
                  dropdownIconColor={CRMTheme.Colors.textSecondary}
                >
                  <Picker.Item 
                    label="Select Region/State" 
                    value="" 
                    color={CRMTheme.Colors.textTertiary}
                  />
                  {regionOptions.map(region => (
                    <Picker.Item 
                      key={region.value} 
                      label={region.label} 
                      value={region.value}
                      color={CRMTheme.Colors.textPrimary}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          )}
          
          {/* Searchable Sales Representative Picker - MANDATORY */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Assigned To (Sales Representative)*</Text>
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
            {errors.salesRep && (
              <Text style={styles.errorText}>{errors.salesRep}</Text>
            )}
          </View>
          
          <FormInput
            label="Description"
            value={formData.description}
            onChangeText={(value) => updateField('description', value)}
            placeholder="Enter description"
            multiline
            numberOfLines={4}
            focused={focusedField === 'description'}
            onFocus={() => setFocusedField('description')}
            onBlur={() => setFocusedField(null)}
          />
        </FormSection>

        {/* Business Partner Info Section */}
        <FormSection
          title="Business Partner Info"
          expanded={expandedSections.businessPartnerInfo}
          onToggle={() => toggleSection('businessPartnerInfo')}
        >
          <FormInput
            label="Company Name"
            value={formData.companyName}
            onChangeText={(value) => updateField('companyName', value)}
            placeholder="Enter company name or copy from contact"
            icon="content-copy"
            onIconPress={copyContactToBusinessPartnerName}
            focused={focusedField === 'companyName'}
            onFocus={() => setFocusedField('companyName')}
            onBlur={() => setFocusedField(null)}
          />

          {/* Business Partner Address Fields - No required indicator */}
          <View style={styles.addressHeader}>
            <Text style={styles.addressHeaderTitle}>Business Partner Address Details</Text>
            <TouchableOpacity onPress={copyAddressToBusinessPartner} style={styles.copyIconButton}>
              <Icon name="content-copy" size={20} color={CRMTheme.Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <FormInput
            label="Street Address"
            value={bpAddressFields.street}
            onChangeText={(value) => handleBpAddressFieldChange('street', value)}
            placeholder="Enter street address"
            focused={focusedField === 'bpStreet'}
            onFocus={() => setFocusedField('bpStreet')}
            onBlur={() => setFocusedField(null)}
          />
          
          <FormInput
            label="Street Address Line 2"
            value={bpAddressFields.street2}
            onChangeText={(value) => handleBpAddressFieldChange('street2', value)}
            placeholder="Apartment, suite, unit, etc."
            focused={focusedField === 'bpStreet2'}
            onFocus={() => setFocusedField('bpStreet2')}
            onBlur={() => setFocusedField(null)}
          />
          
          <FormInput
            label="City"
            value={bpAddressFields.city}
            onChangeText={(value) => handleBpAddressFieldChange('city', value)}
            placeholder="Enter city"
            focused={focusedField === 'bpCity'}
            onFocus={() => setFocusedField('bpCity')}
            onBlur={() => setFocusedField(null)}
          />
          
          <FormInput
            label="Postal Code"
            value={bpAddressFields.postalCode}
            onChangeText={(value) => handleBpAddressFieldChange('postalCode', value)}
            placeholder="Enter postal code"
            keyboardType="numeric"
            focused={focusedField === 'bpPostalCode'}
            onFocus={() => setFocusedField('bpPostalCode')}
            onBlur={() => setFocusedField(null)}
          />
          
          {/* Country Picker for Business Partner */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Country</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={bpAddressFields.country}
                onValueChange={(value) => {
                  const country = COUNTRIES.find(c => c.value === value);
                  handleBpAddressFieldChange('country', value);
                  handleBpAddressFieldChange('countryId', country?.id || null);
                  handleBpAddressFieldChange('region', '');
                  handleBpAddressFieldChange('regionId', null);
                }}
                style={styles.picker}
                dropdownIconColor={CRMTheme.Colors.textSecondary}
              >
                <Picker.Item 
                  label="Select Country" 
                  value="" 
                  color={CRMTheme.Colors.textTertiary}
                />
                {COUNTRIES.map(country => (
                  <Picker.Item 
                    key={country.value} 
                    label={country.label} 
                    value={country.value}
                    color={CRMTheme.Colors.textPrimary}
                  />
                ))}
              </Picker>
            </View>
          </View>
          
          {/* Region/State Picker for Business Partner */}
          {bpRegionOptions.length > 0 && (
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Region/State</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={bpAddressFields.region}
                  onValueChange={(value) => {
                    const region = bpRegionOptions.find(r => r.value === value);
                    handleBpAddressFieldChange('region', value);
                    handleBpAddressFieldChange('regionId', region?.id || null);
                  }}
                  style={styles.picker}
                  dropdownIconColor={CRMTheme.Colors.textSecondary}
                >
                  <Picker.Item 
                    label="Select Region/State" 
                    value="" 
                    color={CRMTheme.Colors.textTertiary}
                  />
                  {bpRegionOptions.map(region => (
                    <Picker.Item 
                      key={region.value} 
                      label={region.label} 
                      value={region.value}
                      color={CRMTheme.Colors.textPrimary}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          )}
        </FormSection>

        {/* Other Info Section */}
        <FormSection
          title="Other Info"
          expanded={expandedSections.otherInfo}
          onToggle={() => toggleSection('otherInfo')}
        >
          <PhoneInput
            label="Secondary Phone"
            value={formData.phone2}
            onChangeText={(value) => updateField('phone2', value)}
            placeholder="Enter secondary phone"
            focused={focusedField === 'phone2'}
            onFocus={() => setFocusedField('phone2')}
            onBlur={() => setFocusedField(null)}
            defaultCountryCode="+92"
          />
          
          <FormInput
            label="Birthday"
            value={formData.birthday}
            onChangeText={(value) => updateField('birthday', value)}
            placeholder="YYYY-MM-DD"
            focused={focusedField === 'birthday'}
            onFocus={() => setFocusedField('birthday')}
            onBlur={() => setFocusedField(null)}
          />
          
          <FormInput
            label="Search Key"
            value={formData.searchKey}
            onChangeText={(value) => updateField('searchKey', value)}
            placeholder="Enter search key"
            focused={focusedField === 'searchKey'}
            onFocus={() => setFocusedField('searchKey')}
            onBlur={() => setFocusedField(null)}
          />

          <SelectPicker
            label="Lead Source"
            value={formData.leadSourceID}
            options={leadSourceOptions}
            onSelect={(option) => {
              updateField('leadSource', option.label);
              updateField('leadSourceID', option.value);
            }}
            placeholder="Select lead source"
          />
          
          <FormInput
            label="Lead Source Description"
            value={formData.leadSourceDesc}
            onChangeText={(value) => updateField('leadSourceDesc', value)}
            placeholder="Enter lead source description"
            multiline
            numberOfLines={3}
            focused={focusedField === 'leadSourceDesc'}
            onFocus={() => setFocusedField('leadSourceDesc')}
            onBlur={() => setFocusedField(null)}
          />

          <SelectPicker
            label="Status"
            value={formData.statusID}
            options={leadStatusOptions}
            onSelect={(option) => {
              updateField('status', option.label);
              updateField('statusID', option.value);
            }}
            placeholder="Select status"
          />
          
          <FormInput
            label="Lead Status Description"
            value={formData.leadStatusDesc}
            onChangeText={(value) => updateField('leadStatusDesc', value)}
            placeholder="Enter status description"
            multiline
            numberOfLines={3}
            focused={focusedField === 'leadStatusDesc'}
            onFocus={() => setFocusedField('leadStatusDesc')}
            onBlur={() => setFocusedField(null)}
          />
          
          <FormInput
            label="Comments"
            value={formData.comments}
            onChangeText={(value) => updateField('comments', value)}
            placeholder="Enter comments"
            multiline
            numberOfLines={4}
            focused={focusedField === 'comments'}
            onFocus={() => setFocusedField('comments')}
            onBlur={() => setFocusedField(null)}
          />

          {/* Boolean fields */}
          <View style={styles.booleanContainer}>
            <View style={styles.booleanField}>
              <Text style={styles.booleanLabel}>Sales Lead</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.salesLead}
                  onValueChange={(value) => updateField('salesLead', value)}
                  style={styles.smallPicker}
                  dropdownIconColor={CRMTheme.Colors.textSecondary}
                >
                  <Picker.Item label="Yes" value="true" />
                  <Picker.Item label="No" value="false" />
                </Picker>
              </View>
            </View>
            
            <View style={styles.booleanField}>
              <Text style={styles.booleanLabel}>Vendor Lead</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.vendorLead}
                  onValueChange={(value) => updateField('vendorLead', value)}
                  style={styles.smallPicker}
                  dropdownIconColor={CRMTheme.Colors.textSecondary}
                >
                  <Picker.Item label="Yes" value="true" />
                  <Picker.Item label="No" value="false" />
                </Picker>
              </View>
            </View>
          </View>
        </FormSection>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (createLeadMutation.isLoading || !formData.salesRep || !formData.name || !formData.client || !formData.organization) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={createLeadMutation.isLoading || !formData.salesRep || !formData.name || !formData.client || !formData.organization}
        >
          <Text style={styles.submitButtonText}>
            {createLeadMutation.isLoading ? 'Creating...' : 'Create Lead'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Sales Representative Selection Modal */}
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
            
            {/* Search Input */}
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
            
            {/* Sales Representatives List */}
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
            
            {/* Footer */}
            <View style={styles.modalFooter}>
              <Text style={styles.footerText}>
                {filteredSalesReps.length} of {salesReps.length} sales representatives
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles using CRMTheme
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CRMTheme.Colors.background,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
  formWrapper: {
    flex: 1,
    backgroundColor: CRMTheme.Colors.backgroundLight,
    marginHorizontal: CRMTheme.Spacing.lg,
    marginTop: CRMTheme.Spacing.lg,
    marginBottom: CRMTheme.Spacing.lg,
    borderRadius: CRMTheme.Layout.borderRadius.xl,
    elevation: 8,
    shadowColor: CRMTheme.Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  formContent: {
    padding: CRMTheme.Spacing.lg,
  },
  sectionSubtitle: {
    fontSize: CRMTheme.Typography.fontSize.medium,
    fontFamily: CRMTheme.Typography.fontFamily.semiBold,
    color: CRMTheme.Colors.textPrimary, // Changed from primary to textPrimary
    marginTop: CRMTheme.Spacing.sm,
    marginBottom: CRMTheme.Spacing.md,
    paddingBottom: CRMTheme.Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: CRMTheme.Colors.border,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: CRMTheme.Spacing.sm,
  },
  addressHeaderTitle: {
    fontSize: CRMTheme.Typography.fontSize.medium,
    fontFamily: CRMTheme.Typography.fontFamily.semiBold,
    color: CRMTheme.Colors.textPrimary, // Changed from primary to textPrimary
  },
  copyIconButton: {
    padding: CRMTheme.Spacing.xs,
  },
  pickerContainer: {
    marginBottom: CRMTheme.Spacing.md,
  },
  pickerLabel: {
    color: CRMTheme.Colors.textPrimary,
    fontFamily: CRMTheme.Typography.fontFamily.semiBold,
    fontSize: CRMTheme.Typography.fontSize.small,
    marginBottom: CRMTheme.Spacing.xs,
    letterSpacing: CRMTheme.Typography.letterSpacing.wide,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: CRMTheme.Colors.border,
    borderRadius: CRMTheme.Layout.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: CRMTheme.Colors.backgroundLight,
    
    shadowColor: CRMTheme.Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  picker: {
    height: CRMTheme.Layout.input.height,
    color: CRMTheme.Colors.textPrimary,
  },
  smallPicker: {
    height: CRMTheme.Layout.input.height,
    color: CRMTheme.Colors.textPrimary,
    fontSize: CRMTheme.Typography.fontSize.small,
  },
  booleanContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: CRMTheme.Spacing.md,
  },
  booleanField: {
    flex: 1,
    marginRight: CRMTheme.Spacing.sm,
  },
  booleanLabel: {
    color: CRMTheme.Colors.textPrimary,
    fontFamily: CRMTheme.Typography.fontFamily.semiBold,
    fontSize: CRMTheme.Typography.fontSize.small,
    marginBottom: CRMTheme.Spacing.xs,
    letterSpacing: CRMTheme.Typography.letterSpacing.wide,
  },
  submitButton: {
    backgroundColor: CRMTheme.Colors.primary,
    paddingVertical: CRMTheme.Spacing.md,
    borderRadius: CRMTheme.Layout.borderRadius.md,
    alignItems: 'center',
    marginTop: CRMTheme.Spacing.lg,
    marginBottom: CRMTheme.Spacing.sm,
    
    shadowColor: CRMTheme.Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: CRMTheme.Colors.buttonDisabled,
    shadowOpacity: 0.2,
    elevation: 3,
  },
  submitButtonText: {
    color: CRMTheme.Colors.textInverse,
    fontSize: CRMTheme.Typography.fontSize.button,
    fontFamily: CRMTheme.Typography.fontFamily.semiBold,
    letterSpacing: CRMTheme.Typography.letterSpacing.wide,
  },
  bottomSpacing: {
    height: CRMTheme.Spacing.lg,
  },
  errorText: {
    color: CRMTheme.Colors.error,
    fontSize: CRMTheme.Typography.fontSize.xsmall,
    marginTop: CRMTheme.Spacing.xs,
    marginLeft: CRMTheme.Spacing.xs,
    fontFamily: CRMTheme.Typography.fontFamily.regular,
  },
  
  // Sales Rep Selector Styles
  salesRepSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: CRMTheme.Colors.border,
    borderRadius: CRMTheme.Layout.borderRadius.md,
    paddingHorizontal: CRMTheme.Spacing.md,
    paddingVertical: CRMTheme.Spacing.sm,
    backgroundColor: CRMTheme.Colors.backgroundLight,
    
    shadowColor: CRMTheme.Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectorError: {
    borderColor: CRMTheme.Colors.error,
    shadowColor: CRMTheme.Colors.error,
  },
  selectedRepContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedRepText: {
    fontSize: CRMTheme.Typography.fontSize.medium,
    color: CRMTheme.Colors.textPrimary,
    fontFamily: CRMTheme.Typography.fontFamily.regular,
  },
  placeholderText: {
    fontSize: CRMTheme.Typography.fontSize.medium,
    color: CRMTheme.Colors.textTertiary,
    fontFamily: CRMTheme.Typography.fontFamily.regular,
    flex: 1,
  },
  clearButton: {
    padding: CRMTheme.Spacing.xs,
    marginLeft: CRMTheme.Spacing.sm,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: CRMTheme.Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: CRMTheme.Colors.backgroundLight,
    borderTopLeftRadius: CRMTheme.Layout.borderRadius.xl,
    borderTopRightRadius: CRMTheme.Layout.borderRadius.xl,
    maxHeight: CRMTheme.Layout.modal.maxHeight,
    
    shadowColor: CRMTheme.Colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 12,
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
    
    shadowColor: CRMTheme.Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: CRMTheme.Spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: CRMTheme.Layout.input.height,
    fontSize: CRMTheme.Typography.fontSize.medium,
    fontFamily: CRMTheme.Typography.fontFamily.regular,
    color: CRMTheme.Colors.textPrimary,
  },
  clearSearchButton: {
    padding: CRMTheme.Spacing.xs,
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
});

export default AddLeads;