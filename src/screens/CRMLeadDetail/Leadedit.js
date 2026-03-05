// LeadEdit.js - COMPLETE FIXED VERSION with address fields and mandatory validation

import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  FlatList,
  Modal as RNModal,
  Switch,
} from 'react-native';
import React, { useState, useEffect, useMemo } from 'react';
import CustomHeader from '../../components/CustomHeader';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Menu, Divider } from 'react-native-paper';
import { useUpdateLead, useLeadStatistics, useCompletedLeadActivities, useLeadStatuses } from '../../hooks/CRMhooks/useCRM';
import { useSalesRepresentatives } from '../../services/CRMAPI/useLead';
import { useQueryClient } from 'react-query';
import theme from '../../constants/CRMTheme/CRMTheme';
import { useAuthStore } from '../../store/authStore';
import CustomAlert from '../../components/CustomAlert'; // Import custom alert
import { Picker } from '@react-native-picker/picker';

const { Colors, Typography, Layout, Spacing } = theme;
const { scale, verticalScale } = Layout;

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

// Validation functions (same as useAddLeadForm)
const validateEmail = (email) => {
  if (!email) return true; // Optional in edit mode
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  if (!phone) return true; // Optional field in edit mode
  const phoneRegex = /^(\+\d{1,4})?\d{8,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

const validateDate = (date) => {
  if (!date) return true; // Optional field
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date);
};

// Tab Component with Integrated Arrow Connector
const TabButton = ({ title, active, onPress, isFirst, isLast }) => (
  <View style={styles.tabButtonWrapper}>
    <TouchableOpacity
      style={[
        styles.tabButton,
        active && styles.tabButtonActive,
        isFirst && styles.tabButtonFirst,
        isLast && styles.tabButtonLast,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
    
    {/* Integrated Arrow Connector - Part of Active Tab, Touches Card */}
    {active && (
      <View style={styles.activeTabArrowContainer}>
        <View style={styles.activeTabArrow} />
      </View>
    )}
  </View>
);

// Activity Item Component - For Completed Activities Only
const ActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'phone call':
      case 'phone':
        return 'phone';
      case 'email':
        return 'email';
      case 'meeting':
        return 'calendar';
      case 'task':
        return 'checkbox-marked-circle';
      default:
        return 'account';
    }
  };

  // Format date properly
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <View style={styles.activityItem}>
      <View style={styles.activityIconContainer}>
        <MaterialCommunityIcons
          name={getActivityIcon(activity.ContactActivityType?.identifier)}
          size={Layout.iconSize.sm}
          color={Colors.primary}
        />
      </View>
      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityTitle}>
            {activity.ContactActivityType?.identifier || 'Activity'}
          </Text>
          <View style={[styles.activityStatusBadge, { backgroundColor: Colors.successLight }]}>
            <Text style={[styles.activityStatusText, { color: Colors.success }]}>
              Completed
            </Text>
          </View>
        </View>
        <Text style={styles.activityDescription} numberOfLines={1}>
          {activity.Description || 'No description'}
        </Text>
        <View style={styles.activityMeta}>
          <View style={styles.activityMetaItem}>
            <MaterialCommunityIcons name="calendar" size={Layout.iconSize.xs} color={Colors.textSecondary} />
            <Text style={styles.activityMetaText}>
              {formatDate(activity.StartDate)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// View Mode Row Component - No Icons, Clear Label/Value Hierarchy
const ViewRow = ({ label, value }) => (
  <View style={styles.viewRow}>
    <Text style={styles.viewLabel}>{label}</Text>
    <Text style={styles.viewValue}>{value || 'Not provided'}</Text>
  </View>
);

// Section Header Component - Compact
const SectionHeader = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

// Swipe Button Component for Yes/No Fields (inline version)
const InlineSwipeButton = ({ label, value, onValueChange, editable = true }) => {
  if (!editable) {
    return (
      <View style={styles.inlineContainer}>
        <Text style={styles.inlineLabel}>{label}</Text>
        <View style={[styles.valueChip, value ? styles.valueChipSuccess : styles.valueChipDefault]}>
          <Text style={[styles.valueChipText, value ? styles.valueChipTextSuccess : styles.valueChipTextDefault]}>
            {value ? 'Yes' : 'No'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.inlineContainer}>
      <Text style={styles.inlineLabel}>{label}</Text>
      <Switch
        trackColor={{ false: Colors.border, true: Colors.primary }}
        thumbColor={Colors.backgroundLight}
        ios_backgroundColor={Colors.border}
        onValueChange={onValueChange}
        value={value}
        style={styles.inlineSwitch}
      />
    </View>
  );
};

// Phone Input Component with Country Code Selection
const PhoneInputField = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  error, 
  focused, 
  onFocus, 
  onBlur,
  editable = true,
  ...props 
}) => {
  const [selectedCountry, setSelectedCountry] = useState('+92');
  const [menuVisible, setMenuVisible] = useState(false);

  const COUNTRY_CODES = [
    { code: 'PK', dialCode: '+92', name: 'Pakistan', flag: '🇵🇰' },
    { code: 'US', dialCode: '+1', name: 'United States', flag: '🇺🇸' },
    { code: 'GB', dialCode: '+44', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'AE', dialCode: '+971', name: 'UAE', flag: '🇦🇪' },
    { code: 'SA', dialCode: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
    { code: 'IN', dialCode: '+91', name: 'India', flag: '🇮🇳' },
    { code: 'CA', dialCode: '+1', name: 'Canada', flag: '🇨🇦' },
    { code: 'AU', dialCode: '+61', name: 'Australia', flag: '🇦🇺' },
  ];

  const handleCountrySelect = (country) => {
    setSelectedCountry(country.dialCode);
    setMenuVisible(false);
  };

  const selectedCountryObj = COUNTRY_CODES.find(c => c.dialCode === selectedCountry) || COUNTRY_CODES[0];

  if (!editable) {
    return (
      <View style={styles.viewRow}>
        <Text style={styles.viewLabel}>{label}</Text>
        <Text style={styles.viewValue}>{value || 'Not provided'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.editField}>
      <Text style={styles.editLabel}>{label}</Text>
      <View style={styles.phoneInputRow}>
        {/* Country Code Picker */}
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableOpacity
              style={[
                styles.countryPicker,
                focused && styles.countryPickerFocused,
                error && styles.countryPickerError,
              ]}
              onPress={() => setMenuVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.countryFlag}>{selectedCountryObj.flag}</Text>
              <Text style={styles.dialCode}>{selectedCountryObj.dialCode}</Text>
              <MaterialCommunityIcons name="chevron-down" size={14} color={Colors.textSecondary} />
            </TouchableOpacity>
          }
          style={styles.countryMenu}
        >
          {COUNTRY_CODES.map((country, index) => (
            <React.Fragment key={country.code}>
              <Menu.Item
                onPress={() => handleCountrySelect(country)}
                title={`${country.flag} ${country.dialCode} ${country.name}`}
                titleStyle={[
                  styles.menuItemTitle,
                  selectedCountry === country.dialCode && styles.menuItemSelected
                ]}
              />
              {index < COUNTRY_CODES.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Menu>

        {/* Phone Number Input */}
        <View style={[
          styles.phoneInputWrapper,
          focused && styles.phoneInputWrapperFocused,
          error && styles.phoneInputWrapperError,
          styles.flexible,
        ]}>
          <TextInput
            style={styles.phoneInput}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={Colors.textTertiary}
            onFocus={onFocus}
            onBlur={onBlur}
            keyboardType="phone-pad"
            editable={editable}
            textAlignVertical="center"
            {...props}
          />
        </View>
      </View>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

// Compact Text Input Field
const TextField = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  error, 
  editable = true, 
  keyboardType = 'default',
  required = false,
  ...props 
}) => {
  if (!editable) {
    return (
      <View style={styles.viewRow}>
        <Text style={styles.viewLabel}>{label}{required ? ' *' : ''}</Text>
        <Text style={styles.viewValue}>{value || 'Not provided'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.editField}>
      <Text style={styles.editLabel}>{label}{required ? ' *' : ''}</Text>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
          editable={editable}
          textAlignVertical="center"
          {...props}
        />
      </View>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

// Compact Text Area Field
const TextAreaField = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  editable = true, 
  required = false,
  ...props 
}) => {
  if (!editable) {
    return (
      <View style={styles.viewRow}>
        <Text style={styles.viewLabel}>{label}{required ? ' *' : ''}</Text>
        <Text style={styles.viewValue}>{value || 'Not provided'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.editField}>
      <Text style={styles.editLabel}>{label}{required ? ' *' : ''}</Text>
      <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          multiline={true}
          numberOfLines={2}
          textAlignVertical="top"
          editable={editable}
          {...props}
        />
      </View>
    </View>
  );
};

// Compact Dropdown Field
const DropdownField = ({ 
  label, 
  value, 
  options, 
  onSelect, 
  editable = true, 
  placeholder = 'Select option',
  required = false
}) => {
  const [menuVisible, setMenuVisible] = useState(false);

  if (!editable) {
    return (
      <View style={styles.viewRow}>
        <Text style={styles.viewLabel}>{label}{required ? ' *' : ''}</Text>
        <Text style={styles.viewValue}>{value || 'Not provided'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.editField}>
      <Text style={styles.editLabel}>{label}{required ? ' *' : ''}</Text>
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            style={styles.dropdownInput}
            activeOpacity={0.7}
          >
            <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
              {value || placeholder}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={Layout.iconSize.sm} color={Colors.textSecondary} />
          </TouchableOpacity>
        }
      >
        {options.map((option, index) => (
          <React.Fragment key={option.id}>
            <Menu.Item
              onPress={() => {
                onSelect(option);
                setMenuVisible(false);
              }}
              title={option.name || option.identifier || option.label}
              titleStyle={[
                styles.menuItemTitle,
                value === (option.name || option.identifier || option.label) && styles.menuItemSelected
              ]}
            />
            {index < options.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </Menu>
    </View>
  );
};

// Address Fields Component for Business Partner
const AddressFields = ({ 
  fields, 
  onFieldChange, 
  regionOptions, 
  editable = true,
  showCopyIcon = false,
  onCopy = null
}) => {
  if (!editable) {
    const addressParts = [];
    if (fields.street) addressParts.push(fields.street);
    if (fields.street2) addressParts.push(fields.street2);
    if (fields.city) addressParts.push(fields.city);
    if (fields.region) addressParts.push(fields.region);
    if (fields.country) addressParts.push(fields.country);
    if (fields.postalCode) addressParts.push(fields.postalCode);
    
    const fullAddress = addressParts.join(', ') || 'Not provided';
    
    return (
      <View style={styles.viewRow}>
        <Text style={styles.viewLabel}>Address</Text>
        <Text style={styles.viewValue}>{fullAddress}</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.addressHeader}>
        <Text style={styles.addressHeaderTitle}>Address Details</Text>
        {showCopyIcon && onCopy && (
          <TouchableOpacity onPress={onCopy} style={styles.copyIconButton}>
            <Icon name="content-copy" size={20} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.editField}>
        <Text style={styles.editLabel}>Street Address</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={fields.street}
            onChangeText={(value) => onFieldChange('street', value)}
            placeholder="Enter street address"
            placeholderTextColor={Colors.textTertiary}
            editable={editable}
          />
        </View>
      </View>
      
      <View style={styles.editField}>
        <Text style={styles.editLabel}>Street Address Line 2</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={fields.street2}
            onChangeText={(value) => onFieldChange('street2', value)}
            placeholder="Apartment, suite, unit, etc."
            placeholderTextColor={Colors.textTertiary}
            editable={editable}
          />
        </View>
      </View>
      
      <View style={styles.editField}>
        <Text style={styles.editLabel}>City</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={fields.city}
            onChangeText={(value) => onFieldChange('city', value)}
            placeholder="Enter city"
            placeholderTextColor={Colors.textTertiary}
            editable={editable}
          />
        </View>
      </View>
      
      <View style={styles.editField}>
        <Text style={styles.editLabel}>Postal Code</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={fields.postalCode}
            onChangeText={(value) => onFieldChange('postalCode', value)}
            placeholder="Enter postal code"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="numeric"
            editable={editable}
          />
        </View>
      </View>
      
      {/* Country Picker */}
      <View style={styles.editField}>
        <Text style={styles.editLabel}>Country</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={fields.country}
            onValueChange={(value) => {
              const country = COUNTRIES.find(c => c.value === value);
              onFieldChange('country', value);
              onFieldChange('countryId', country?.id || null);
              onFieldChange('region', '');
              onFieldChange('regionId', null);
            }}
            style={styles.picker}
            enabled={editable}
            dropdownIconColor={Colors.textSecondary}
          >
            <Picker.Item 
              label="Select Country" 
              value="" 
              color={Colors.textTertiary}
            />
            {COUNTRIES.map(country => (
              <Picker.Item 
                key={country.value} 
                label={country.label} 
                value={country.value}
                color={Colors.textPrimary}
              />
            ))}
          </Picker>
        </View>
      </View>
      
      {/* Region/State Picker */}
      {regionOptions.length > 0 && (
        <View style={styles.editField}>
          <Text style={styles.editLabel}>Region/State</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={fields.region}
              onValueChange={(value) => {
                const region = regionOptions.find(r => r.value === value);
                onFieldChange('region', value);
                onFieldChange('regionId', region?.id || null);
              }}
              style={styles.picker}
              enabled={editable}
              dropdownIconColor={Colors.textSecondary}
            >
              <Picker.Item 
                label="Select Region/State" 
                value="" 
                color={Colors.textTertiary}
              />
              {regionOptions.map(region => (
                <Picker.Item 
                  key={region.value} 
                  label={region.label} 
                  value={region.value}
                  color={Colors.textPrimary}
                />
              ))}
            </Picker>
          </View>
        </View>
      )}
    </View>
  );
};

const LeadEdit = ({ route, navigation }) => {
  const { data: leadData } = route.params;
  const queryClient = useQueryClient();
  const authState = useAuthStore();

  // State to track if component is mounted
  const [isMounted, setIsMounted] = useState(false);

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
      // Cleanup if needed
    };
  }, []);

  // Fetch dynamic lead statuses from backend
  const { data: leadStatuses = [], isLoading: statusesLoading } = useLeadStatuses();

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState('basic');

  // Field errors state
  const [errors, setErrors] = useState({});

  // Focus state
  const [focusedField, setFocusedField] = useState(null);

  // Use detailed data directly
  const displayLead = leadData;

  // Menu visibility states
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [salesRepModalVisible, setSalesRepModalVisible] = useState(false);
  const [salesRepSearch, setSalesRepSearch] = useState('');

  // State to track if we're processing a conversion
  const [isConverting, setIsConverting] = useState(false);

  // State for contact address fields
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

  // State for Business Partner address fields
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

  // Form state - Updated to match AddLeads
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    phone2: '',
    birthday: '',
    salesLead: false,
    vendorLead: false,
    businessPartnerId: '1000000',
    businessPartnerLabel: 'Starlet Innovations Pvt Ltd',
    organizationId: '1000000',
    organizationLabel: 'Starlet Innovation Pvt Ltd',
    description: '',
    active: true,
    searchKey: '',
    salesRepId: '',
    salesRepLabel: '',
    companyName: '',
    leadSourceDesc: '',
    leadStatusDesc: '',
    comments: '',
    statusId: 'N',
    statusLabel: 'New',
    statusColor: Colors.statusNew,
    leadSourceId: 'CC',
    leadSourceLabel: 'Cold Call',
    client: '',
    organization: '',
  });

  // FIXED: Only enable sales representatives query after component is mounted
  const { data: salesReps = [], isLoading: loadingSalesReps } = useSalesRepresentatives(isMounted);

  // Static dropdown options (these might also come from backend in future)
  const businessPartnerOptions = [
    { id: '1000000', identifier: 'Starlet Innovations Pvt Ltd' },
    { id: '1000001', identifier: 'Other Client' },
  ];

  const organizationOptions = [
    { id: '1000000', identifier: 'Starlet Innovation Pvt Ltd' },
    { id: '1000001', identifier: 'Other Organization' },
  ];

  const leadSourceOptions = [
    { id: 'CC', identifier: 'Cold Call' },
    { id: 'E', identifier: 'Email' },
    { id: 'P', identifier: 'Phone' },
    { id: 'W', identifier: 'Website' },
    { id: 'R', identifier: 'Referral' },
  ];

  // Use the custom hooks from useCRM
  const updateLeadMutation = useUpdateLead();
  const { refetch: refetchLeadStatistics } = useLeadStatistics();
  const { 
    data: activities = [], 
    isLoading: activitiesLoading, 
    refetch: refetchActivities 
  } = useCompletedLeadActivities(displayLead?.id);

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

  const showConfirmationAlert = (title, message, onConfirm, onCancel = null) => {
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

  // Filter sales reps based on search query
  const filteredSalesReps = useMemo(() => {
    if (!salesRepSearch.trim()) {
      return salesReps;
    }
    const query = salesRepSearch.toLowerCase();
    return salesReps.filter(rep =>
      rep.Name && rep.Name.toLowerCase().includes(query)
    );
  }, [salesReps, salesRepSearch]);

  // Get selected sales rep name
  const selectedRepName = useMemo(() => {
    if (!formData.salesRepId) return '';
    const rep = salesReps.find(r => r.id === formData.salesRepId);
    return rep ? rep.Name : '';
  }, [formData.salesRepId, salesReps]);

  // Get current status object from dynamic statuses
  const currentStatus = useMemo(() => {
    if (!formData.statusId) return null;
    return leadStatuses.find(s => s.id === formData.statusId) || {
      id: formData.statusId,
      name: formData.statusLabel,
      color: formData.statusColor || Colors.statusNew
    };
  }, [formData.statusId, formData.statusLabel, leadStatuses]);

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

  // Initialize form data from lead
  useEffect(() => {
    if (displayLead) {
      // Find matching status in dynamic statuses
      const leadStatusId = displayLead?.LeadStatus?.id || 'N';
      const matchingStatus = leadStatuses.find(s => s.id === leadStatusId);
      
      setFormData({
        name: displayLead?.Name || '',
        email: displayLead?.EMail || '',
        phone: displayLead?.Phone || '',
        phone2: displayLead?.Phone2 || '',
        birthday: displayLead?.Birthday || '',
        salesLead: displayLead?.IsSalesLead || false,
        vendorLead: displayLead?.IsVendorLead || false,
        businessPartnerId: displayLead?.AD_Client_ID?.id || '1000000',
        businessPartnerLabel: displayLead?.AD_Client_ID?.identifier || 'Starlet Innovations Pvt Ltd',
        organizationId: displayLead?.AD_Org_ID?.id || '1000000',
        organizationLabel: displayLead?.AD_Org_ID?.identifier || 'Starlet Innovation Pvt Ltd',
        description: displayLead?.Description || '',
        active: displayLead?.IsActive !== undefined ? displayLead.IsActive : true,
        searchKey: displayLead?.Value || '',
        salesRepId: displayLead?.SalesRep_ID?.id || '',
        salesRepLabel: displayLead?.SalesRep_ID?.identifier || '',
        companyName: displayLead?.BPName || '',
        leadSourceDesc: displayLead?.LeadSourceDescription || '',
        leadStatusDesc: displayLead?.LeadStatusDescription || '',
        comments: displayLead?.Comments || '',
        statusId: leadStatusId,
        statusLabel: matchingStatus?.name || displayLead?.LeadStatus?.identifier || 'New',
        statusColor: matchingStatus?.color || Colors.statusNew,
        leadSourceId: displayLead?.LeadSource?.id || 'CC',
        leadSourceLabel: displayLead?.LeadSource?.identifier || 'Cold Call',
        client: displayLead?.AD_Client_ID?.identifier || 'Starlet Innovations Pvt Ltd',
        organization: displayLead?.AD_Org_ID?.identifier || 'Starlet Innovation Pvt Ltd',
      });

      // Initialize address fields if they exist in the lead data
      // This assumes your API returns address fields in the response
      if (displayLead?.addressFields) {
        setAddressFields(displayLead.addressFields);
      }
      
      if (displayLead?.businessPartnerAddressFields) {
        setBpAddressFields(displayLead.businessPartnerAddressFields);
      }
      
      // Clear errors when initializing
      setErrors({});
    }
  }, [displayLead, leadStatuses]);

  // Clear error for a field when it's updated
  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error for this field if it exists
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  };

  // Handle contact address field updates
  const handleAddressFieldChange = (field, value) => {
    setAddressFields(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle business partner address field updates
  const handleBpAddressFieldChange = (field, value) => {
    setBpAddressFields(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Copy contact address to business partner address
  const copyAddressToBusinessPartner = () => {
    setBpAddressFields({ ...addressFields });
  };

  // Validation function - matches AddLeads (only name, salesRep, client, organization are mandatory)
  const validateForm = () => {
    const newErrors = {};

    // Required fields validation - only these 4 are mandatory
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.salesRepId) {
      newErrors.salesRep = 'Sales Representative is required';
    }

    if (!formData.client?.trim()) {
      newErrors.client = 'Client is required';
    }

    if (!formData.organization?.trim()) {
      newErrors.organization = 'Organization is required';
    }

    // Email format validation (optional)
    if (formData.email && formData.email.trim() && !validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone format validation (optional)
    if (formData.phone && formData.phone.trim() && !validatePhone(formData.phone)) {
      newErrors.phone = 'Invalid phone format (use +92XXXXXXXXXX)';
    }

    // Secondary phone format validation (optional)
    if (formData.phone2 && formData.phone2.trim() && !validatePhone(formData.phone2)) {
      newErrors.phone2 = 'Invalid phone format';
    }

    // Birthday format validation (optional)
    if (formData.birthday && formData.birthday.trim() && !validateDate(formData.birthday)) {
      newErrors.birthday = 'Invalid date format (use YYYY-MM-DD)';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      console.log('❌ Form validation errors:', newErrors);
      
      // Show first error in alert
      const firstErrorKey = Object.keys(newErrors)[0];
      const firstError = newErrors[firstErrorKey];
      showValidationAlert(firstError);
      
      return false;
    }
    
    console.log('✅ Form validation passed');
    return true;
  };

  // ============================================
  // Navigate to AddSaleOppor with lead data
  // ============================================
  const navigateToAddOpportunity = () => {
    console.log('🔄 Navigating to AddSaleOppor with lead data:', displayLead.id);
    
    // Prepare lead data for the opportunity form
    const opportunityLeadData = {
      id: displayLead.id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      companyName: formData.companyName,
      description: formData.description,
      comments: formData.comments,
      
      // Business Partner info
      businessPartnerId: formData.businessPartnerId,
      businessPartnerName: formData.businessPartnerLabel,
      
      // Sales Rep info
      salesRepId: formData.salesRepId,
      salesRepLabel: formData.salesRepLabel,
      
      // Organization info
      organizationId: formData.organizationId,
      organizationName: formData.organizationLabel,
      
      // Lead source info
      leadSourceId: formData.leadSourceId,
      leadSourceLabel: formData.leadSourceLabel,
      
      // The lead ID itself
      userId: displayLead.id,
    };

    console.log('📦 Sending to AddSaleOppor:', {
      businessPartnerId: opportunityLeadData.businessPartnerId,
      businessPartnerName: opportunityLeadData.businessPartnerName,
      salesRepId: opportunityLeadData.salesRepId,
      userId: opportunityLeadData.userId
    });

    navigation.navigate('AddSaleOppor', {
      leadData: opportunityLeadData,
      mode: 'fromLeadConversion'
    });
  };

  // ============================================
  // Handle status update with opportunity navigation
  // ============================================
  const handleStatusUpdate = (status) => {
    console.log('🔄 Status update requested:', status);
    
    const newStatusId = status.id;
    const newStatusName = status.name;
    const oldStatusName = formData.statusLabel;
    
    // If we're changing to a status that might be considered "converted"
    const isConvertedStatus = newStatusName.toLowerCase() === 'converted';
    
    // If we're changing to "Converted" and we're in edit mode
    if (isEditMode && isConvertedStatus && oldStatusName !== 'Converted') {
      console.log('🎯 Status changing to Converted in edit mode');
      
      // First validate the form
      if (!validateForm()) {
        return; // Don't proceed if validation fails
      }
      
      // Set converting state to show loading
      setIsConverting(true);
      
      // First save the lead with the new status
      const payload = {
        Name: formData.name,
        EMail: formData.email || '',
        Phone: formData.phone || '',
        Phone2: formData.phone2 || '',
        Birthday: formData.birthday || null,
        IsSalesLead: formData.salesLead,
        IsVendorLead: formData.vendorLead,
        BPName: formData.companyName || '',
        AD_Org_ID: {
          id: formData.organizationId,
          identifier: formData.organizationLabel
        },
        SalesRep_ID: formData.salesRepId ? {
          id: formData.salesRepId,
          identifier: formData.salesRepLabel
        } : null,
        AD_Client_ID: {
          id: formData.businessPartnerId,
          identifier: formData.businessPartnerLabel
        },
        Description: formData.description || '',
        IsActive: formData.active,
        Value: formData.searchKey || '',
        LeadSourceDescription: formData.leadSourceDesc || '',
        LeadStatusDescription: formData.leadStatusDesc || '',
        Comments: formData.comments || '',
        LeadStatus: {
          id: newStatusId,
          identifier: newStatusName
        },
        LeadSource: {
          id: formData.leadSourceId,
          identifier: formData.leadSourceLabel
        },
        // Include address fields
        contactAddress: generateCombinedAddress(addressFields),
        businessPartnerAddress: generateCombinedAddress(bpAddressFields),
        contactAddressFields: addressFields,
        businessPartnerAddressFields: bpAddressFields,
      };

      updateLeadMutation.mutate({
        id: displayLead.id,
        updates: payload
      }, {
        onSuccess: () => {
          console.log('✅ Lead saved with Converted status');
          
          // Update local form state
          setFormData(prev => ({
            ...prev,
            statusId: newStatusId,
            statusLabel: newStatusName,
            statusColor: status.color
          }));
          
          // Close the status menu
          setStatusMenuVisible(false);
          
          // Exit edit mode
          setIsEditMode(false);
          
          // Refresh data
          refetchLeadStatistics();
          queryClient.invalidateQueries(['leads']);
          queryClient.invalidateQueries(['lead-completed-activities', displayLead.id]);
          
          // Clear converting state
          setIsConverting(false);
          
          // Show success message with option to create opportunity
          showConfirmationAlert(
            'Lead Converted',
            'Lead has been successfully converted. Would you like to create a sales opportunity now?',
            navigateToAddOpportunity
          );
        },
        onError: (error) => {
          console.error('❌ Failed to update lead status:', error);
          showErrorAlert('Failed to update lead status. Please try again.');
          setIsConverting(false);
        }
      });
    } else {
      // For other status changes or if not in edit mode, just update the form
      updateFormData('statusId', newStatusId);
      updateFormData('statusLabel', newStatusName);
      updateFormData('statusColor', status.color);
      setStatusMenuVisible(false);
    }
  };

  const handleSave = () => {
    // Validate form first - only mandatory fields
    if (!validateForm()) {
      return;
    }

    const payload = {
      Name: formData.name,
      EMail: formData.email || '',
      Phone: formData.phone || '',
      Phone2: formData.phone2 || '',
      Birthday: formData.birthday || null,
      IsSalesLead: formData.salesLead,
      IsVendorLead: formData.vendorLead,
      BPName: formData.companyName || '',
      AD_Org_ID: {
        id: formData.organizationId,
        identifier: formData.organizationLabel
      },
      SalesRep_ID: formData.salesRepId ? {
        id: formData.salesRepId,
        identifier: formData.salesRepLabel
      } : null,
      AD_Client_ID: {
        id: formData.businessPartnerId,
        identifier: formData.businessPartnerLabel
      },
      Description: formData.description || '',
      IsActive: formData.active,
      Value: formData.searchKey || '',
      LeadSourceDescription: formData.leadSourceDesc || '',
      LeadStatusDescription: formData.leadStatusDesc || '',
      Comments: formData.comments || '',
      LeadStatus: {
        id: formData.statusId,
        identifier: formData.statusLabel
      },
      LeadSource: {
        id: formData.leadSourceId,
        identifier: formData.leadSourceLabel
      },
      // Include address fields
      contactAddress: generateCombinedAddress(addressFields),
      businessPartnerAddress: generateCombinedAddress(bpAddressFields),
      contactAddressFields: addressFields,
      businessPartnerAddressFields: bpAddressFields,
    };

    updateLeadMutation.mutate({
      id: displayLead.id,
      updates: payload
    }, {
      onSuccess: () => {
        console.log('✅ Lead updated successfully');
        
        // Check if status is "Converted" and we need to ask about opportunity
        const isConverted = formData.statusLabel.toLowerCase() === 'converted';
        
        if (isConverted) {
          showConfirmationAlert(
            'Lead Converted',
            'Lead has been successfully converted. Would you like to create a sales opportunity now?',
            navigateToAddOpportunity
          );
        } else {
          showSuccessAlert('Lead updated successfully!', () => {
            hideAlert();
            setIsEditMode(false);
          });
        }
        
        refetchLeadStatistics();
        queryClient.invalidateQueries(['leads']);
        queryClient.invalidateQueries(['lead-completed-activities', displayLead.id]);
        setErrors({}); // Clear errors on success
      },
      onError: (error) => {
        showErrorAlert(error.message || 'Failed to update lead');
      }
    });
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      handleSave();
    } else {
      setIsEditMode(true);
      setErrors({}); // Clear errors when entering edit mode
    }
  };

  const handleAddActivity = () => {
    navigation.navigate('AddActivity', {
      data: displayLead,
      mode: 'create',
      onGoBack: () => {
        refetchActivities();
        queryClient.invalidateQueries(['lead-completed-activities', displayLead.id]);
      }
    });
  };

  // Handle sales rep selection
  const handleSelectSalesRep = (rep) => {
    updateFormData('salesRepId', rep.id);
    updateFormData('salesRepLabel', rep.Name);
    setSalesRepModalVisible(false);
    setSalesRepSearch('');
  };

  // Clear selected sales rep
  const handleClearSalesRep = () => {
    updateFormData('salesRepId', '');
    updateFormData('salesRepLabel', '');
  };

  // Handle boolean field toggle
  const handleBooleanToggle = (key, value) => {
    updateFormData(key, value);
  };

  // Render sales rep item in modal
  const renderSalesRepItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.repItem,
        formData.salesRepId === item.id && styles.selectedRepItem,
      ]}
      onPress={() => handleSelectSalesRep(item)}
      activeOpacity={0.7}
    >
      <View style={styles.repItemContent}>
        <View style={styles.repAvatar}>
          <Text style={styles.repAvatarText}>
            {item.Name?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.repDetails}>
          <Text style={styles.repName}>{item.Name}</Text>
          {item.EMail && (
            <Text style={styles.repEmail}>{item.EMail}</Text>
          )}
        </View>
      </View>
      {formData.salesRepId === item.id && (
        <AntDesign name="checkcircle" size={Layout.iconSize.sm} color={Colors.primary} />
      )}
    </TouchableOpacity>
  );

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <View style={styles.sectionCard}>
            <SectionHeader title="Contact Information" />
            <View style={styles.sectionContent}>
              <TextField
                label="Name"
                value={formData.name}
                onChangeText={(text) => updateFormData('name', text)}
                placeholder="Enter name"
                error={errors.name}
                editable={isEditMode && !isConverting}
                required={true}
              />

              <TextField
                label="Client"
                value={formData.client}
                onChangeText={(text) => updateFormData('client', text)}
                placeholder="Enter client"
                error={errors.client}
                editable={isEditMode && !isConverting}
                required={true}
              />

              <TextField
                label="Organization"
                value={formData.organization}
                onChangeText={(text) => updateFormData('organization', text)}
                placeholder="Enter organization"
                error={errors.organization}
                editable={isEditMode && !isConverting}
                required={true}
              />

              <TextField
                label="Email"
                value={formData.email}
                onChangeText={(text) => updateFormData('email', text)}
                placeholder="Enter email"
                error={errors.email}
                editable={isEditMode && !isConverting}
                keyboardType="email-address"
              />

              <PhoneInputField
                label="Phone"
                value={formData.phone}
                onChangeText={(text) => updateFormData('phone', text)}
                placeholder="Enter Phone"
                error={errors.phone}
                focused={focusedField === 'phone'}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                editable={isEditMode && !isConverting}
              />

              <PhoneInputField
                label="Secondary Phone"
                value={formData.phone2}
                onChangeText={(text) => updateFormData('phone2', text)}
                placeholder="Secondary Phone"
                error={errors.phone2}
                focused={focusedField === 'phone2'}
                onFocus={() => setFocusedField('phone2')}
                onBlur={() => setFocusedField(null)}
                editable={isEditMode && !isConverting}
              />

              <TextField
                label="Birthday"
                value={formData.birthday}
                onChangeText={(text) => updateFormData('birthday', text)}
                placeholder="YYYY-MM-DD"
                error={errors.birthday}
                editable={isEditMode && !isConverting}
              />

              {/* Contact Address Fields */}
              <AddressFields
                fields={addressFields}
                onFieldChange={handleAddressFieldChange}
                regionOptions={regionOptions}
                editable={isEditMode && !isConverting}
              />

              <DropdownField
                label="Lead Source"
                value={formData.leadSourceLabel}
                options={leadSourceOptions}
                onSelect={(option) => {
                  updateFormData('leadSourceId', option.id);
                  updateFormData('leadSourceLabel', option.identifier);
                }}
                editable={isEditMode && !isConverting}
                placeholder="Select Lead Source"
              />

              {/* Sales Representative Field */}
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Sales Representative *</Text>
                {isEditMode ? (
                  <TouchableOpacity
                    style={[
                      styles.salesRepSelector,
                      errors.salesRep && styles.selectorError,
                      !selectedRepName && styles.selectorEmpty
                    ]}
                    onPress={() => setSalesRepModalVisible(true)}
                    activeOpacity={0.7}
                    disabled={isConverting}
                  >
                    {selectedRepName ? (
                      <View style={styles.selectedRepContainer}>
                        <View style={styles.selectedRepInfo}>
                          <Text style={styles.selectedRepText}>{selectedRepName}</Text>
                        </View>
                        <View style={styles.rightContainer}>
                          <TouchableOpacity
                            style={styles.clearButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleClearSalesRep();
                            }}
                            disabled={isConverting}
                          >
                            <Icon name="close" size={18} color={Colors.textSecondary} />
                          </TouchableOpacity>
                          <AntDesign name="down" size={12} color={Colors.textSecondary} />
                        </View>
                      </View>
                    ) : (
                      <>
                        <Text style={styles.placeholderText}>Select Sales Representative</Text>
                        <AntDesign name="down" size={12} color={Colors.textSecondary} />
                      </>
                    )}
                  </TouchableOpacity>
                ) : (
                  <ViewRow 
                    label=""
                    value={selectedRepName || 'Not assigned'}
                  />
                )}
                {errors.salesRep && (
                  <Text style={styles.errorText}>{errors.salesRep}</Text>
                )}
              </View>

              <TextAreaField
                label="Description"
                value={formData.description}
                onChangeText={(text) => updateFormData('description', text)}
                placeholder="Enter description"
                editable={isEditMode && !isConverting}
              />
            </View>
          </View>
        );

      case 'company':
        return (
          <View style={styles.sectionCard}>
            <SectionHeader title="Company Information" />
            <View style={styles.sectionContent}>
              <TextField
                label="Company Name"
                value={formData.companyName}
                onChangeText={(text) => updateFormData('companyName', text)}
                placeholder="Enter company name"
                editable={isEditMode && !isConverting}
              />

              {/* Business Partner Address Fields with Copy Icon */}
              <AddressFields
                fields={bpAddressFields}
                onFieldChange={handleBpAddressFieldChange}
                regionOptions={bpRegionOptions}
                editable={isEditMode && !isConverting}
                showCopyIcon={isEditMode}
                onCopy={copyAddressToBusinessPartner}
              />

              <DropdownField
                label="Business Partner"
                value={formData.businessPartnerLabel}
                options={businessPartnerOptions}
                onSelect={(option) => {
                  updateFormData('businessPartnerId', option.id);
                  updateFormData('businessPartnerLabel', option.identifier);
                }}
                editable={isEditMode && !isConverting}
                placeholder="Select Business Partner"
              />

              <DropdownField
                label="Organization"
                value={formData.organizationLabel}
                options={organizationOptions}
                onSelect={(option) => {
                  updateFormData('organizationId', option.id);
                  updateFormData('organizationLabel', option.identifier);
                }}
                editable={isEditMode && !isConverting}
                placeholder="Select Organization"
              />

              <TextAreaField
                label="Lead Source Description"
                value={formData.leadSourceDesc}
                onChangeText={(text) => updateFormData('leadSourceDesc', text)}
                placeholder="Enter lead source description"
                editable={isEditMode && !isConverting}
              />
            </View>
          </View>
        );

      case 'detailed':
        return (
          <View style={styles.sectionCard}>
            <SectionHeader title="Detailed Information" />
            <View style={styles.sectionContent}>
              <View style={styles.booleanRow}>
                <InlineSwipeButton
                  label="Sales Lead"
                  value={formData.salesLead}
                  onValueChange={(val) => handleBooleanToggle('salesLead', val)}
                  editable={isEditMode && !isConverting}
                />
                
                <View style={styles.booleanSpacer} />
                
                <InlineSwipeButton
                  label="Vendor Lead"
                  value={formData.vendorLead}
                  onValueChange={(val) => handleBooleanToggle('vendorLead', val)}
                  editable={isEditMode && !isConverting}
                />
              </View>

              <TextField
                label="Search Key"
                value={formData.searchKey}
                onChangeText={(text) => updateFormData('searchKey', text)}
                placeholder="Enter search key"
                editable={isEditMode && !isConverting}
              />

              <TextAreaField
                label="Comments"
                value={formData.comments}
                onChangeText={(text) => updateFormData('comments', text)}
                placeholder="Enter comments"
                editable={isEditMode && !isConverting}
              />

              <TextAreaField
                label="Lead Status Description"
                value={formData.leadStatusDesc}
                onChangeText={(text) => updateFormData('leadStatusDesc', text)}
                placeholder="Enter status description"
                editable={isEditMode && !isConverting}
              />
            </View>
          </View>
        );

      case 'activities':
        return (
          <View style={[styles.sectionCard, styles.activitySectionCard]}>
            <SectionHeader title={`Completed Activities (${activities.length})`} />
            <View style={styles.sectionContent}>
              {activitiesLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.loadingText}>Loading activities...</Text>
                </View>
              ) : activities.length > 0 ? (
                <FlatList
                  data={activities}
                  keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                  renderItem={({ item }) => <ActivityItem activity={item} />}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
              ) : (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="calendar-check" size={Layout.iconSize.lg} color={Colors.border} />
                  <Text style={styles.emptyStateText}>No completed activities</Text>
                </View>
              )}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  if (!displayLead) {
    return (
      <View style={styles.container}>
        <CustomHeader
          title={'Lead Details'}
          LeftIcon="arrow-left"
          LeftPress={() => navigation.goBack()}
          RightIcon={null}
          RightPress={null}
        />
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={Layout.iconSize.xxl} color={Colors.error} />
          <Text style={styles.errorText}>Failed to load lead details</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (statusesLoading) {
    return (
      <View style={styles.container}>
        <CustomHeader
          title={'Lead Details'}
          LeftIcon="arrow-left"
          LeftPress={() => navigation.goBack()}
          RightIcon={null}
          RightPress={null}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading statuses...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>

      <CustomHeader
        title={'Lead Details'}
        LeftIcon="arrow-left"
        LeftPress={() => navigation.goBack()}
        RightIcon={isEditMode ? "content-save" : "pencil"}
        RightPress={handleEditToggle}
      />

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

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* Header Card - Minimized Spacing */}
        <View style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
                  style={styles.avatar}
                />
              </View>
              
              <View style={styles.headerInfo}>
                <Text style={styles.leadName}>{formData.name || 'Unnamed Lead'}</Text>
                {formData.companyName && (
                  <View style={styles.companyBadge}>
                    <MaterialCommunityIcons name="office-building" size={Layout.iconSize.xs} color={Colors.textPrimary} />
                    <Text style={styles.companyBadgeText}>{formData.companyName}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Status Badge and Activity Icon - Stacked with No Space */}
            <View style={styles.headerRight}>
              {isEditMode ? (
                <Menu
                  visible={statusMenuVisible}
                  onDismiss={() => setStatusMenuVisible(false)}
                  anchor={
                    <TouchableOpacity
                      style={[
                        styles.statusBadge, 
                        { backgroundColor: currentStatus?.color ? `${currentStatus.color}20` : Colors.infoLight }
                      ]}
                      onPress={() => setStatusMenuVisible(true)}
                      activeOpacity={0.7}
                      disabled={isConverting}
                    >
                      {isConverting ? (
                        <ActivityIndicator size="small" color={currentStatus?.color || Colors.primary} />
                      ) : (
                        <>
                          <View style={[
                            styles.dot, 
                            { backgroundColor: currentStatus?.color || Colors.primary }
                          ]} />
                          <Text style={[
                            styles.statusBadgeText, 
                            { color: currentStatus?.color || Colors.primary }
                          ]}>
                            {currentStatus?.name || formData.statusLabel}
                          </Text>
                          <AntDesign name="down" size={Layout.iconSize.xs} color={currentStatus?.color || Colors.primary} />
                        </>
                      )}
                    </TouchableOpacity>
                  }
                >
                  {leadStatuses.map((status, index) => (
                    <React.Fragment key={status.id}>
                      <Menu.Item
                        onPress={() => handleStatusUpdate(status)}
                        title={status.name}
                        titleStyle={[
                          styles.menuItemTitle,
                          formData.statusId === status.id && styles.menuItemSelected
                        ]}
                      />
                      {index < leadStatuses.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </Menu>
              ) : (
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: currentStatus?.color ? `${currentStatus.color}20` : Colors.infoLight }
                ]}>
                  <View style={[
                    styles.dot, 
                    { backgroundColor: currentStatus?.color || Colors.primary }
                  ]} />
                  <Text style={[
                    styles.statusBadgeText, 
                    { color: currentStatus?.color || Colors.primary }
                  ]}>
                    {currentStatus?.name || formData.statusLabel}
                  </Text>
                </View>
              )}
              
              {/* Activity Icon - Directly Under Status Badge with No Margin */}
              <TouchableOpacity
                onPress={handleAddActivity}
                activeOpacity={0.7}
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                style={styles.activityIconWrapper}
                disabled={isConverting}
              >
                <View style={styles.addActivityIcon}>
                  <Ionicons name="alarm-outline" size={Layout.iconSize.sm} color={Colors.textPrimary} />
                  <AntDesign 
                    name="pluscircle" 
                    size={Layout.iconSize.xs} 
                    color={Colors.textPrimary} 
                    style={styles.activityPlusIcon}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Contact Info Row - Compact */}
          <View style={styles.contactInfoRow}>
            {formData.email && (
              <View style={styles.contactChip}>
                <MaterialCommunityIcons name="email" size={Layout.iconSize.xs} color={Colors.textSecondary} />
                <Text style={styles.contactChipText}>{formData.email}</Text>
              </View>
            )}
            {formData.phone && (
              <View style={styles.contactChip}>
                <MaterialCommunityIcons name="phone" size={Layout.iconSize.xs} color={Colors.textSecondary} />
                <Text style={styles.contactChipText}>{formData.phone}</Text>
              </View>
            )}
            {selectedRepName && (
              <View style={styles.contactChip}>
                <MaterialCommunityIcons name="account-tie" size={Layout.iconSize.xs} color={Colors.textSecondary} />
                <Text style={styles.contactChipText}>{selectedRepName}</Text>
              </View>
            )}
          </View>

          {isEditMode && formData.leadStatusDesc && (
            <View style={styles.statusNote}>
              <MaterialCommunityIcons name="information" size={Layout.iconSize.xs} color={Colors.info} />
              <Text style={styles.statusNoteText}>{formData.leadStatusDesc}</Text>
            </View>
          )}
        </View>

        {/* Tabs with Integrated Arrow Connector - Touches Card */}
        <View style={styles.tabsWrapper}>
          <View style={styles.tabsContainer}>
            <TabButton 
              title="Basic" 
              active={activeTab === 'basic'} 
              onPress={() => setActiveTab('basic')}
              isFirst={true}
              isLast={false}
            />
            <TabButton 
              title="Company" 
              active={activeTab === 'company'} 
              onPress={() => setActiveTab('company')}
              isFirst={false}
              isLast={false}
            />
            <TabButton 
              title="Details" 
              active={activeTab === 'detailed'} 
              onPress={() => setActiveTab('detailed')}
              isFirst={false}
              isLast={false}
            />
            <TabButton 
              title="Activities" 
              active={activeTab === 'activities'} 
              onPress={() => setActiveTab('activities')}
              isFirst={false}
              isLast={true}
            />
          </View>
        </View>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Action Buttons */}
        {isEditMode && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                (updateLeadMutation.isLoading || isConverting) && styles.saveButtonDisabled
              ]}
              onPress={handleSave}
              disabled={updateLeadMutation.isLoading || isConverting}
              activeOpacity={0.7}
            >
              {updateLeadMutation.isLoading || isConverting ? (
                <ActivityIndicator size="small" color={Colors.textInverse} />
              ) : (
                <>
                  <MaterialCommunityIcons name="content-save" size={Layout.iconSize.sm} color={Colors.textInverse} />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsEditMode(false)}
              activeOpacity={0.7}
              disabled={isConverting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Sales Representative Modal */}
      <RNModal
        visible={salesRepModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setSalesRepModalVisible(false);
          setSalesRepSearch('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Sales Representative</Text>
              <TouchableOpacity
                onPress={() => {
                  setSalesRepModalVisible(false);
                  setSalesRepSearch('');
                }}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name..."
                placeholderTextColor="#999"
                value={salesRepSearch}
                onChangeText={setSalesRepSearch}
                autoFocus={true}
              />
              {salesRepSearch.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSalesRepSearch('')}
                  style={styles.clearSearchButton}
                >
                  <Icon name="close" size={18} color="#666" />
                </TouchableOpacity>
              )}
            </View>

            {loadingSalesReps ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.modalLoadingText}>Loading...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredSalesReps}
                renderItem={renderSalesRepItem}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Icon name="person-off" size={50} color="#ccc" />
                    <Text style={styles.emptyText}>
                      {salesRepSearch.trim()
                        ? `No sales representatives found for "${salesRepSearch}"`
                        : 'No sales representatives available'}
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </RNModal>
    </KeyboardAvoidingView>
  );
};


const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: verticalScale(20),
  },
  headerCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: Spacing.sm,
  },
  avatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  headerInfo: {
    flex: 1,
  },
  leadName: {
    fontSize: Typography.fontSize.h4,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  companyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.backgroundLight,
    borderRadius: Layout.borderRadius.round,
  },
  companyBadgeText: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginLeft: Spacing.xxs,
  },
  headerRight: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  activityIconWrapper: {
    marginTop: 0,
    paddingTop: 0,
  },
  contactInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  contactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xxs,
    borderRadius: Layout.borderRadius.round,
    gap: Spacing.xxs,
  },
  contactChipText: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xxs,
    borderRadius: Layout.borderRadius.round,
    gap: Spacing.xxs,
  },
  statusBadgeText: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.regular,
  },
  dot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
  },
  addActivityIcon: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginRight: Spacing.md,
  },
  activityPlusIcon: {
    position: 'absolute',
    right: -scale(4),
    bottom: -scale(4),
    backgroundColor: Colors.cardBackground,
    borderRadius: scale(8),
  },
  statusNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.infoLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: Spacing.xs,
  },
  statusNoteText: {
    flex: 1,
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.info,
  },
  tabsWrapper: {
    marginHorizontal: Spacing.md,
    marginBottom: 0,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.xxs,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
    zIndex: 5,
  },
  tabButtonWrapper: {
    flex: 1,
    position: 'relative',
  },
  tabButton: {
    paddingVertical: verticalScale(6),
    alignItems: 'center',
    position: 'relative',
    borderRadius: Layout.borderRadius.sm,
  },
  tabButtonFirst: {
    borderTopLeftRadius: Layout.borderRadius.sm,
    borderBottomLeftRadius: Layout.borderRadius.sm,
  },
  tabButtonLast: {
    borderTopRightRadius: Layout.borderRadius.sm,
    borderBottomRightRadius: Layout.borderRadius.sm,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  tabButtonTextActive: {
    color: Colors.textInverse,
    fontFamily: Typography.fontFamily.semiBold,
  },
  activeTabArrowContainer: {
    position: 'absolute',
    bottom: -verticalScale(8),
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  activeTabArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: scale(8),
    borderRightWidth: scale(8),
    borderTopWidth: scale(8),
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.primary,
  },
  sectionCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.md,
    marginHorizontal: Spacing.md,
    marginTop: verticalScale(8),
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activitySectionCard: {
    marginTop: verticalScale(8),
    marginBottom: Spacing.sm,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.backgroundLight,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.large,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  sectionContent: {
    padding: Spacing.sm,
  },
  booleanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  booleanSpacer: {
    width: Spacing.md,
  },
  viewRow: {
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  viewLabel: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  viewValue: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeight.h4,
  },
  inlineContainer: {
    flex: 1,
  },
  inlineLabel: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inlineSwitch: {
    alignSelf: 'flex-start',
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  valueChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Layout.borderRadius.round,
    minWidth: scale(60),
    alignItems: 'center',
  },
  valueChipSuccess: {
    backgroundColor: Colors.successLight,
  },
  valueChipDefault: {
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  valueChipText: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
  },
  valueChipTextSuccess: {
    color: Colors.success,
  },
  valueChipTextDefault: {
    color: Colors.textSecondary,
  },
  editField: {
    marginBottom: Spacing.sm,
  },
  editLabel: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: Layout.borderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
   addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  addressHeaderTitle: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  copyIconButton: {
    padding: Spacing.xs,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundLight,
    height: 42,
    justifyContent: 'center',
  },
  picker: {
    height: 42,
    color: Colors.textPrimary,
  },
  selectorError: {
    borderColor: Colors.error,
    borderWidth: 1.5,
  },
  input: {
    height: 42,
    paddingHorizontal: Spacing.sm,
    paddingVertical: verticalScale(8),
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  textAreaWrapper: {
    minHeight: verticalScale(80),
  },
  textArea: {
    minHeight: verticalScale(80),
    textAlignVertical: 'top',
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(10),
  },
  inputError: {
    borderColor: Colors.error,
    borderWidth: 1.5,
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.regular,
    marginTop: Spacing.xxs,
    marginLeft: Spacing.xs,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: Layout.borderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: verticalScale(10),
    minWidth: scale(85),
    height: 42,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  countryPickerFocused: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  countryPickerError: {
    borderColor: Colors.error,
    shadowColor: Colors.error,
  },
  countryFlag: {
    fontSize: 16,
    marginRight: Spacing.xs,
    fontFamily: Typography.fontFamily.regular,
  },
  dialCode: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    marginRight: Spacing.xs,
  },
  countryMenu: {
    marginTop: verticalScale(40),
  },
  phoneInputWrapper: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
    borderRadius: Layout.borderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  phoneInputWrapperFocused: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  phoneInputWrapperError: {
    borderColor: Colors.error,
    shadowColor: Colors.error,
  },
  phoneInput: {
    height: 42,
    paddingHorizontal: Spacing.sm,
    paddingVertical: verticalScale(8),
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  flexible: {
    flex: 1,
  },
  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 0,
    height: 42,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownText: {
    fontSize: Typography.fontSize.small,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.bold,
    flex: 1,
  },
  // Updated Sales Rep Selector Styles to match AddLeads
  salesRepSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 0,
    height: 42,
    backgroundColor: Colors.backgroundLight,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectorEmpty: {
    borderColor: Colors.errorLight,
  },
  selectedRepContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedRepInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  selectedRepText: {
    fontSize: Typography.fontSize.small,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.regular,
    flex: 1,
  },
  placeholderText: {
    fontSize: Typography.fontSize.small,
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily.regular,
    flex: 1,
  },
  clearButton: {
    padding: Spacing.xxs,
    marginRight: Spacing.xxs,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityItem: {
    flexDirection: 'row',
    paddingVertical: Spacing.xs,
    alignItems: 'center',
  },
  activityIconContainer: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: Colors.infoLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xxs,
  },
  activityTitle: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  activityStatusBadge: {
    paddingHorizontal: Spacing.xxs,
    paddingVertical: Spacing.xxs,
    borderRadius: Layout.borderRadius.round,
  },
  activityStatusText: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.regular,
  },
  activityDescription: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxs,
  },
  activityMeta: {
    flexDirection: 'row',
  },
  activityMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  activityMetaText: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.xxs,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(16),
  },
  loadingText: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: verticalScale(16),
  },
  emptyStateText: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  actionButtons: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: verticalScale(16),
    gap: Spacing.sm,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 0,
    borderRadius: Layout.borderRadius.md,
    gap: Spacing.sm,
    height: 48,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.7,
    backgroundColor: Colors.buttonDisabled,
    shadowOpacity: 0.2,
    elevation: 2,
  },
  saveButtonText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.semiBold,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundLight,
    height: 48,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.semiBold,
  },
  // Updated Modal Styles to match AddLeads
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'K2D-SemiBold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    fontFamily: 'K2D-Regular',
    color: '#333',
    paddingVertical: 0,
  },
  clearSearchButton: {
    padding: 4,
  },
  modalLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  modalLoadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontFamily: 'K2D-Regular',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'K2D-Regular',
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
  },
  repItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedRepItem: {
    backgroundColor: '#f0f5ff',
  },
  repItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  repAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  repAvatarText: {
    fontSize: 16,
    fontFamily: 'K2D-SemiBold',
    color: '#fff',
  },
  repDetails: {
    flex: 1,
  },
  repName: {
    fontSize: 15,
    fontFamily: 'K2D-SemiBold',
    color: '#333',
  },
  repEmail: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'K2D-Regular',
    marginTop: 2,
  },
  menuItemTitle: {
    fontSize: 14,
    fontFamily: 'K2D-Regular',
  },
  menuItemSelected: {
    color: Colors.primary,
    fontFamily: 'K2D-SemiBold',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxxl,
  },
  errorText: {
    fontSize: Typography.fontSize.h4,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 0,
    borderRadius: Layout.borderRadius.md,
    height: 48,
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  retryButtonText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.semiBold,
  },
});

export default LeadEdit;