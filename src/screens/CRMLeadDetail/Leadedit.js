import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
  FlatList,
  focusedField,
  Modal as RNModal,
} from 'react-native';
import React, { useState, useEffect, useMemo } from 'react';
import CustomHeader from '../../components/CustomHeader';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Menu, Divider } from 'react-native-paper';
import { useUpdateLead, useLeadStatistics, useCompletedLeadActivities } from '../../hooks/CRMhooks/useCRM';
import { useSalesRepresentatives } from '../../services/CRMAPI/useLead';
import { useQueryClient } from 'react-query';
import theme from '../../constants/CRMTheme/CRMTheme';

const { Colors, Typography, Layout, Spacing } = theme;
const { scale, verticalScale } = Layout;

/* ================= STATUS CONFIG WITH THEME COLORS ================= */
const STATUS_CONFIG = {
  New: {
    barColor: Colors.statusNew,
    badgeText: 'New',
    badgeBg: Colors.infoLight,
    badgeColor: Colors.statusNew,
    showDot: true,
  },
  Working: {
    barColor: Colors.statusWorking,
    badgeText: 'Working',
    badgeBg: Colors.warningLight,
    badgeColor: Colors.statusWorking,
    showDot: true,
  },
  Converted: {
    barColor: Colors.statusConverted,
    badgeText: 'Converted',
    badgeBg: Colors.successLight,
    badgeColor: Colors.statusConverted,
    showDot: false,
    showCheck: true,
  },
  Expired: {
    barColor: Colors.statusExpired,
    badgeText: 'Expired',
    badgeBg: Colors.errorLight,
    badgeColor: Colors.statusExpired,
    showDot: true,
  },
};

// Validation functions (same as useAddLeadForm)
const validateEmail = (email) => {
  if (!email) return false;
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
          size={Layout.iconSize.md}
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

// Section Header Component - Larger Title
const SectionHeader = ({ title, icon }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionHeaderLeft}>
      <MaterialCommunityIcons name={icon} size={Layout.iconSize.lg} color={Colors.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  </View>
);

// Toggle Button Component for Yes/No Fields
const ToggleButton = ({ label, value, onPress }) => (
  <View style={styles.toggleContainer}>
    <Text style={styles.toggleLabel}>{label}</Text>
    <View style={styles.toggleButtons}>
      <TouchableOpacity
        style={[styles.toggleOption, value === true && styles.toggleOptionActive]}
        onPress={() => onPress(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.toggleOptionText, value === true && styles.toggleOptionTextActive]}>
          Yes
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.toggleOption, value === false && styles.toggleOptionActive]}
        onPress={() => onPress(false)}
        activeOpacity={0.7}
      >
        <Text style={[styles.toggleOptionText, value === false && styles.toggleOptionTextActive]}>
          No
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

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
      <View style={styles.editField}>
        <Text style={styles.editLabel}>{label}</Text>
        <View style={styles.readOnlyContainer}>
          <Text style={styles.readOnlyText}>{value || 'Not provided'}</Text>
        </View>
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
              <MaterialCommunityIcons name="chevron-down" size={18} color={Colors.textSecondary} />
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

const LeadEdit = ({ route, navigation }) => {
  const { data: leadData } = route.params;
  const queryClient = useQueryClient();

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState('basic');

  // Field errors state
  const [errors, setErrors] = useState({});

  // Use detailed data directly
  const displayLead = leadData;

  // Menu visibility states
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [bpMenuVisible, setBpMenuVisible] = useState(false);
  const [orgMenuVisible, setOrgMenuVisible] = useState(false);
  const [leadSourceMenuVisible, setLeadSourceMenuVisible] = useState(false);

  // Dynamic Sales Rep Modal state
  const [salesRepModalVisible, setSalesRepModalVisible] = useState(false);
  const [salesRepSearch, setSalesRepSearch] = useState('');

  // Form state
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
    leadSourceId: 'CC',
    leadSourceLabel: 'Cold Call',
  });

  // Use dynamic sales representatives
  const { data: salesReps = [], isLoading: loadingSalesReps } = useSalesRepresentatives();

  // Static dropdown options
  const leadStatusOptions = [
    { id: 'N', identifier: 'New' },
    { id: 'W', identifier: 'Working' },
    { id: 'C', identifier: 'Converted' },
    { id: 'E', identifier: 'Expired' },
  ];

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

  // Initialize form data
  useEffect(() => {
    if (displayLead) {
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
        statusId: displayLead?.LeadStatus?.id || 'N',
        statusLabel: displayLead?.LeadStatus?.identifier || 'New',
        leadSourceId: displayLead?.LeadSource?.id || 'CC',
        leadSourceLabel: displayLead?.LeadSource?.identifier || 'Cold Call',
      });
      
      // Clear errors when initializing
      setErrors({});
    }
  }, [displayLead]);

  // Clear error for a field when it's updated
  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error for this field if it exists
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  };

  // Validation function - matches useAddLeadForm
  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    }

    // Email format validation
    if (formData.email && !validateEmail(formData.email)) {
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
      Alert.alert('Validation Error', firstError);
      
      return false;
    }
    
    console.log('✅ Form validation passed');
    return true;
  };

  const handleSave = () => {
    // Validate form first
    if (!validateForm()) {
      return;
    }

    const payload = {
      Name: formData.name,
      EMail: formData.email,
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
      }
    };

    updateLeadMutation.mutate({
      id: displayLead.id,
      updates: payload
    }, {
      onSuccess: () => {
        Alert.alert('Success', 'Lead updated successfully!');
        setIsEditMode(false);
        refetchLeadStatistics();
        queryClient.invalidateQueries(['leads']);
        queryClient.invalidateQueries(['lead-completed-activities', displayLead.id]);
        setErrors({}); // Clear errors on success
      },
      onError: (error) => {
        Alert.alert('Error', error.message || 'Failed to update lead');
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

  // Handle status update
  const handleStatusUpdate = (statusOption) => {
    updateFormData('statusId', statusOption.id);
    updateFormData('statusLabel', statusOption.identifier);
    setStatusMenuVisible(false);
  };

  // Get current status UI config
  const statusUI = STATUS_CONFIG[formData.statusLabel] || STATUS_CONFIG.New;

  // Handle boolean field toggle
  const handleBooleanToggle = (key, value) => {
    updateFormData(key, value);
  };

  // RENDER FUNCTIONS FOR DIFFERENT FIELD TYPES
  const renderTextField = (label, value, key, placeholder, keyboardType = 'default') => {
    if (!isEditMode) {
      return (
        <ViewRow 
          label={label}
          value={value}
        />
      );
    }

    return (
      <View style={styles.editField}>
        <Text style={styles.editLabel}>{label}</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              errors[key] && styles.inputError
            ]}
            placeholder={placeholder}
            placeholderTextColor={Colors.textTertiary}
            value={value}
            onChangeText={(text) => updateFormData(key, text)}
            keyboardType={keyboardType}
            autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
            editable={isEditMode}
          />
        </View>
        {errors[key] && (
          <Text style={styles.errorText}>{errors[key]}</Text>
        )}
      </View>
    );
  };

  const renderTextAreaField = (label, value, key, placeholder) => {
    if (!isEditMode) {
      return (
        <ViewRow 
          label={label}
          value={value}
        />
      );
    }

    return (
      <View style={styles.editField}>
        <Text style={styles.editLabel}>{label}</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={placeholder}
            placeholderTextColor={Colors.textTertiary}
            value={value}
            onChangeText={(text) => updateFormData(key, text)}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
            editable={isEditMode}
          />
        </View>
      </View>
    );
  };

  const renderSalesRepField = () => {
    if (!isEditMode) {
      return (
        <ViewRow 
          label="Sales Representative"
          value={selectedRepName || 'Not assigned'}
        />
      );
    }

    return (
      <View style={styles.editField}>
        <Text style={styles.editLabel}>Sales Representative</Text>
        <TouchableOpacity
          style={[
            styles.salesRepSelector,
            !formData.salesRepId && styles.selectorEmpty
          ]}
          onPress={() => setSalesRepModalVisible(true)}
          activeOpacity={0.7}
        >
          {selectedRepName ? (
            <View style={styles.selectedRepContainer}>
              <View style={styles.selectedRepInfo}>
                <MaterialCommunityIcons name="account-tie" size={Layout.iconSize.sm} color={Colors.primary} />
                <Text style={styles.selectedRepText}>{selectedRepName}</Text>
              </View>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleClearSalesRep();
                }}
              >
                <MaterialCommunityIcons name="close-circle" size={Layout.iconSize.md} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.placeholderText}>Select Sales Representative</Text>
              <MaterialCommunityIcons name="chevron-down" size={Layout.iconSize.md} color={Colors.textSecondary} />
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderBooleanField = (label, value, key) => {
    if (!isEditMode) {
      return (
        <ViewRow 
          label={label}
          value={value ? 'Yes' : 'No'}
        />
      );
    }

    return (
      <ToggleButton
        label={label}
        value={value}
        onPress={(val) => handleBooleanToggle(key, val)}
      />
    );
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
          {item.Email && (
            <Text style={styles.repEmail}>{item.Email}</Text>
          )}
        </View>
      </View>
      {formData.salesRepId === item.id && (
        <AntDesign name="checkcircle" size={Layout.iconSize.md} color={Colors.primary} />
      )}
    </TouchableOpacity>
  );

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <View style={styles.sectionCard}>
            <SectionHeader 
              title="Contact Information" 
              icon="phone"
            />
            <View style={styles.sectionContent}>
              <PhoneInputField
                label="Phone"
                value={formData.phone}
                onChangeText={(text) => updateFormData('phone', text)}
                placeholder="Enter Phone"
                error={errors.phone}
                focused={focusedField === 'phone'}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                editable={isEditMode}
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
                editable={isEditMode}
              />

              {renderTextField(
                "Birthday",
                formData.birthday,
                'birthday',
                'YYYY-MM-DD'
              )}

              {/* Lead Source Dropdown with Menu */}
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Lead Source</Text>
                <Menu
                  visible={leadSourceMenuVisible}
                  onDismiss={() => setLeadSourceMenuVisible(false)}
                  anchor={
                    <TouchableOpacity
                      onPress={() => setLeadSourceMenuVisible(true)}
                      style={styles.dropdownInput}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dropdownText}>
                        {formData.leadSourceLabel || 'Select Lead Source'}
                      </Text>
                      <MaterialCommunityIcons name="chevron-down" size={Layout.iconSize.md} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  }
                >
                  {leadSourceOptions.map((option, index) => (
                    <React.Fragment key={option.id}>
                      <Menu.Item
                        onPress={() => {
                          updateFormData('leadSourceId', option.id);
                          updateFormData('leadSourceLabel', option.identifier);
                          setLeadSourceMenuVisible(false);
                        }}
                        title={option.identifier}
                        titleStyle={styles.menuItemTitle}
                      />
                      {index < leadSourceOptions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </Menu>
              </View>

              {/* Dynamic Sales Representative Field */}
              {renderSalesRepField()}
            </View>
          </View>
        );

      case 'company':
        return (
          <View style={styles.sectionCard}>
            <SectionHeader 
              title="Company Information" 
              icon="office-building"
            />
            <View style={styles.sectionContent}>
              {renderTextField(
                "Company Name",
                formData.companyName,
                'companyName',
                'Enter company name'
              )}

              {/* Business Partner Dropdown with Menu */}
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Business Partner</Text>
                <Menu
                  visible={bpMenuVisible}
                  onDismiss={() => setBpMenuVisible(false)}
                  anchor={
                    <TouchableOpacity
                      onPress={() => setBpMenuVisible(true)}
                      style={styles.dropdownInput}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dropdownText}>
                        {formData.businessPartnerLabel || 'Select Business Partner'}
                      </Text>
                      <MaterialCommunityIcons name="chevron-down" size={Layout.iconSize.md} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  }
                >
                  {businessPartnerOptions.map((option, index) => (
                    <React.Fragment key={option.id}>
                      <Menu.Item
                        onPress={() => {
                          updateFormData('businessPartnerId', option.id);
                          updateFormData('businessPartnerLabel', option.identifier);
                          setBpMenuVisible(false);
                        }}
                        title={option.identifier}
                        titleStyle={styles.menuItemTitle}
                      />
                      {index < businessPartnerOptions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </Menu>
              </View>

              {/* Organization Dropdown with Menu */}
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Organization</Text>
                <Menu
                  visible={orgMenuVisible}
                  onDismiss={() => setOrgMenuVisible(false)}
                  anchor={
                    <TouchableOpacity
                      onPress={() => setOrgMenuVisible(true)}
                      style={styles.dropdownInput}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dropdownText}>
                        {formData.organizationLabel || 'Select Organization'}
                      </Text>
                      <MaterialCommunityIcons name="chevron-down" size={Layout.iconSize.md} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  }
                >
                  {organizationOptions.map((option, index) => (
                    <React.Fragment key={option.id}>
                      <Menu.Item
                        onPress={() => {
                          updateFormData('organizationId', option.id);
                          updateFormData('organizationLabel', option.identifier);
                          setOrgMenuVisible(false);
                        }}
                        title={option.identifier}
                        titleStyle={styles.menuItemTitle}
                      />
                      {index < organizationOptions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </Menu>
              </View>

              {renderTextAreaField(
                "Lead Source Description",
                formData.leadSourceDesc,
                'leadSourceDesc',
                'Enter lead source description'
              )}
            </View>
          </View>
        );

      case 'detailed':
        return (
          <View style={styles.sectionCard}>
            <SectionHeader 
              title="Detailed Information" 
              icon="clipboard-text"
            />
            <View style={styles.sectionContent}>
              {renderBooleanField(
                "Sales Lead",
                formData.salesLead,
                'salesLead'
              )}

              {renderBooleanField(
                "Vendor Lead",
                formData.vendorLead,
                'vendorLead'
              )}

              {renderTextAreaField(
                "Description",
                formData.description,
                'description',
                'Enter description'
              )}

              {renderTextAreaField(
                "Comments",
                formData.comments,
                'comments',
                'Enter comments'
              )}
            </View>
          </View>
        );

      case 'activities':
        return (
          <View style={[styles.sectionCard, styles.activitySectionCard]}>
            <SectionHeader 
              title={`Completed Activities (${activities.length})`} 
              icon="calendar-check"
            />
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
                  <MaterialCommunityIcons name="calendar-check" size={Layout.iconSize.xl} color={Colors.border} />
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
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
                  style={styles.avatar}
                />
              </View>
              
              <View style={styles.headerInfo}>
                <Text style={styles.leadName}>{formData.name || 'Unnamed Lead'}</Text>
                {formData.companyName && (
                  <View style={styles.companyBadge}>
                    <MaterialCommunityIcons name="office-building" size={Layout.iconSize.xs} color={Colors.primary} />
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
                      style={[styles.statusBadge, { backgroundColor: statusUI.badgeBg }]}
                      onPress={() => setStatusMenuVisible(true)}
                      activeOpacity={0.7}
                    >
                      {statusUI.showDot && (
                        <View style={[styles.dot, { backgroundColor: statusUI.badgeColor }]} />
                      )}
                      {statusUI.showCheck && (
                        <AntDesign name="checkcircle" size={Layout.iconSize.xs} color={statusUI.badgeColor} />
                      )}
                      <Text style={[styles.statusBadgeText, { color: statusUI.badgeColor }]}>
                        {statusUI.badgeText}
                      </Text>
                      <AntDesign name="down" size={Layout.iconSize.xs} color={statusUI.badgeColor} />
                    </TouchableOpacity>
                  }
                >
                  {leadStatusOptions.map((option, index) => (
                    <React.Fragment key={option.id}>
                      <Menu.Item
                        onPress={() => handleStatusUpdate(option)}
                        title={option.identifier}
                        titleStyle={[
                          styles.menuItemTitle,
                          formData.statusId === option.id && styles.menuItemSelected
                        ]}
                      />
                      {index < leadStatusOptions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </Menu>
              ) : (
                <View style={[styles.statusBadge, { backgroundColor: statusUI.badgeBg }]}>
                  {statusUI.showDot && (
                    <View style={[styles.dot, { backgroundColor: statusUI.badgeColor }]} />
                  )}
                  {statusUI.showCheck && (
                    <AntDesign name="checkcircle" size={Layout.iconSize.xs} color={statusUI.badgeColor} />
                  )}
                  <Text style={[styles.statusBadgeText, { color: statusUI.badgeColor }]}>
                    {statusUI.badgeText}
                  </Text>
                </View>
              )}
              
              {/* Activity Icon - Directly Under Status Badge with No Margin */}
              <TouchableOpacity
                onPress={handleAddActivity}
                activeOpacity={0.7}
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                style={styles.activityIconWrapper}
              >
                <View style={styles.addActivityIcon}>
                  <Ionicons name="alarm-outline" size={Layout.iconSize.md} color={Colors.primary} />
                  <AntDesign 
                    name="pluscircle" 
                    size={Layout.iconSize.xs} 
                    color={Colors.primary} 
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
              <MaterialCommunityIcons name="information" size={Layout.iconSize.sm} color={Colors.info} />
              <Text style={styles.statusNoteText}>{formData.leadStatusDesc}</Text>
            </View>
          )}
        </View>

        {/* Edit Mode Badge - Compact */}
        {isEditMode && (
          <View style={styles.editBadge}>
            <MaterialCommunityIcons name="pencil" size={Layout.iconSize.sm} color={Colors.primary} />
            <Text style={styles.editBadgeText}>Editing Mode</Text>
          </View>
        )}

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
                updateLeadMutation.isLoading && styles.saveButtonDisabled
              ]}
              onPress={handleSave}
              disabled={updateLeadMutation.isLoading}
              activeOpacity={0.7}
            >
              {updateLeadMutation.isLoading ? (
                <ActivityIndicator size="small" color={Colors.textInverse} />
              ) : (
                <>
                  <MaterialCommunityIcons name="content-save" size={Layout.iconSize.md} color={Colors.textInverse} />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsEditMode(false)}
              activeOpacity={0.7}
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
              >
                <MaterialCommunityIcons name="close" size={Layout.iconSize.lg} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearch}>
              <MaterialCommunityIcons name="magnify" size={Layout.iconSize.md} color={Colors.textSecondary} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search by name..."
                placeholderTextColor={Colors.textTertiary}
                value={salesRepSearch}
                onChangeText={setSalesRepSearch}
              />
              {salesRepSearch.length > 0 && (
                <TouchableOpacity onPress={() => setSalesRepSearch('')}>
                  <MaterialCommunityIcons name="close-circle" size={Layout.iconSize.md} color={Colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {loadingSalesReps ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.modalLoadingText}>Loading...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredSalesReps}
                renderItem={renderSalesRepItem}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={
                  <View style={styles.modalEmpty}>
                    <MaterialCommunityIcons name="account-off" size={Layout.iconSize.xxl} color={Colors.border} />
                    <Text style={styles.modalEmptyText}>
                      {salesRepSearch.trim()
                        ? `No results for "${salesRepSearch}"`
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
    paddingBottom: verticalScale(30),
  },

  // Header Card - Minimized Spacing
  headerCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.lg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    
    // Elevation for Android
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: Spacing.md,
  },
  avatar: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    borderWidth: 2,
    borderColor: Colors.borderLight,
  },
  headerInfo: {
    flex: 1,
  },
  leadName: {
    fontSize: Typography.fontSize.h4,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xxs,
  },
  companyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.backgroundLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Layout.borderRadius.round,
  },
  companyBadgeText: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
    marginLeft: Spacing.xxs,
  },
  
  // Header Right - Status and Activity Stacked with No Space
  headerRight: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  activityIconWrapper: {
    marginTop: 0,
    paddingTop: 0,
  },

  // Contact Info Row - Compact
  contactInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  contactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Layout.borderRadius.round,
    gap: Spacing.xxs,
  },
  contactChipText: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },

  // Status Badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Layout.borderRadius.round,
    gap: Spacing.xxs,
  },
  statusBadgeText: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.semiBold,
  },
  dot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
  },
  
  // Activity Icon - Clean, No Background
  addActivityIcon: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginRight: Spacing.lg,
  },
  activityPlusIcon: {
    position: 'absolute',
    right: -scale(4),
    bottom: -scale(4),
    backgroundColor: Colors.cardBackground,
    borderRadius: scale(8),
  },

  // Status Note
  statusNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.infoLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
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

  // Edit Mode Badge - Compact
  editBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: Colors.infoLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Layout.borderRadius.round,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    
    // Elevation for Android
    elevation: 2,
  },
  editBadgeText: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.primary,
  },

  // Tabs with Integrated Arrow Connector - Touches Card
  tabsWrapper: {
    marginHorizontal: Spacing.lg,
    marginBottom: 0,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.xxs,
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    
    // Elevation for Android
    elevation: 3,
    
    position: 'relative',
    zIndex: 5,
  },
  tabButtonWrapper: {
    flex: 1,
    position: 'relative',
  },
  tabButton: {
    paddingVertical: verticalScale(10),
    alignItems: 'center',
    position: 'relative',
    borderRadius: Layout.borderRadius.md,
  },
  tabButtonFirst: {
    borderTopLeftRadius: Layout.borderRadius.md,
    borderBottomLeftRadius: Layout.borderRadius.md,
  },
  tabButtonLast: {
    borderTopRightRadius: Layout.borderRadius.md,
    borderBottomRightRadius: Layout.borderRadius.md,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
    
    // Shadow for iOS
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    
    // Elevation for Android
    elevation: 4,
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
  
  // Integrated Arrow - Part of Active Tab, Touches Both Tab and Card
  activeTabArrowContainer: {
    position: 'absolute',
    bottom: -verticalScale(14),
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
    borderLeftWidth: scale(10),
    borderRightWidth: scale(10),
    borderTopWidth: scale(12),
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.primary,
  },

  // Section Cards
  sectionCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.lg,
    marginHorizontal: Spacing.lg,
    marginTop: verticalScale(14),
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    
    // Elevation for Android
    elevation: 3,
  },
  
  // Activity Section Card - Minimized
  activitySectionCard: {
    marginTop: verticalScale(14),
    marginBottom: Spacing.md,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.backgroundLight,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.large,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  sectionContent: {
    padding: Spacing.md,
  },

  // View Mode Row - No Icons, Clear Label/Value Hierarchy
  viewRow: {
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  viewLabel: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  viewValue: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeight.h4,
  },

  // Edit Mode Field Styles
  editField: {
    marginBottom: Spacing.md,
  },
  editLabel: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Input Wrapper with Shadow and Elevation
  inputWrapper: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    
    // Elevation for Android
    elevation: 3,
  },
  input: {
    height: 48,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },
  textArea: {
    minHeight: verticalScale(100),
    textAlignVertical: 'top',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
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

  // Phone Input Styles
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: verticalScale(12),
    minWidth: scale(90),
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    
    // Elevation for Android
    elevation: 3,
  },
  countryPickerFocused: {
    borderColor: Colors.primary,
    
    // Enhanced shadow for focused state
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  countryPickerError: {
    borderColor: Colors.error,
    shadowColor: Colors.error,
  },
  countryFlag: {
    fontSize: 18,
    marginRight: Spacing.xxs,
  },
  dialCode: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    marginRight: Spacing.xxs,
  },
  countryMenu: {
    marginTop: verticalScale(40),
  },
  phoneInputWrapper: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    
    // Elevation for Android
    elevation: 3,
  },
  phoneInputWrapperFocused: {
    borderColor: Colors.primary,
    
    // Enhanced shadow for focused state
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  phoneInputWrapperError: {
    borderColor: Colors.error,
    shadowColor: Colors.error,
  },
  phoneInput: {
    height: 48,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },
  flexible: {
    flex: 1,
  },

  // Read-only field styles
  readOnlyContainer: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: verticalScale(12),
    opacity: 0.8,
  },
  readOnlyText: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },

  // Dropdown Input
  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: verticalScale(12),
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    
    // Elevation for Android
    elevation: 3,
  },
  dropdownText: {
    fontSize: Typography.fontSize.small,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.regular,
  },

  // Sales Rep Selector
  salesRepSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: verticalScale(12),
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    
    // Elevation for Android
    elevation: 3,
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
    gap: Spacing.sm,
  },
  selectedRepText: {
    fontSize: Typography.fontSize.medium,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.regular,
  },
  placeholderText: {
    fontSize: Typography.fontSize.medium,
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily.regular,
  },
  clearButton: {
    padding: Spacing.xxs,
  },

  // Toggle Button Styles for Yes/No Fields
  toggleContainer: {
    marginBottom: Spacing.lg,
  },
  toggleLabel: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  toggleButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: verticalScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundLight,
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    
    // Elevation for Android
    elevation: 2,
  },
  toggleOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    
    // Enhanced shadow for active state
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  toggleOptionText: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  toggleOptionTextActive: {
    color: Colors.textInverse,
    fontFamily: Typography.fontFamily.semiBold,
  },

  // Activity Styles - Minimized
  activityItem: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  activityIconContainer: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
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
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  activityStatusBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xxs,
    borderRadius: Layout.borderRadius.round,
  },
  activityStatusText: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.semiBold,
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
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.xs,
  },

  // Loading & Empty States - Minimized
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(20),
  },
  loadingText: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: verticalScale(20),
  },
  emptyStateText: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },

  // Action Buttons
  actionButtons: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: verticalScale(20),
    gap: Spacing.sm,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: verticalScale(16),
    borderRadius: Layout.borderRadius.md,
    gap: Spacing.sm,
    
    // Shadow for iOS
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    
    // Elevation for Android
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.7,
    backgroundColor: Colors.buttonDisabled,
    shadowOpacity: 0.2,
    elevation: 3,
  },
  saveButtonText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.semiBold,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(16),
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundLight,
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    
    // Elevation for Android
    elevation: 3,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.semiBold,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: Layout.borderRadius.xl,
    borderTopRightRadius: Layout.borderRadius.xl,
    maxHeight: '80%',
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    
    // Elevation for Android
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    fontSize: Typography.fontSize.h4,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  modalSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.lg,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    gap: Spacing.sm,
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    
    // Elevation for Android
    elevation: 3,
  },
  modalSearchInput: {
    flex: 1,
    height: verticalScale(44),
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },
  modalLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(40),
  },
  modalLoadingText: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  modalEmpty: {
    alignItems: 'center',
    paddingVertical: verticalScale(40),
  },
  modalEmptyText: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary,
    textAlign: 'center',
  },

  // Rep Item Styles
  repItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(12),
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  selectedRepItem: {
    backgroundColor: Colors.infoLight,
  },
  repItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  repAvatar: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    
    // Shadow for iOS
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    
    // Elevation for Android
    elevation: 4,
  },
  repAvatarText: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textInverse,
  },
  repDetails: {
    flex: 1,
  },
  repName: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xxs,
  },
  repEmail: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },

  // Menu Styles
  menuItemTitle: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.regular,
  },
  menuItemSelected: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.semiBold,
  },

  // Error States
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
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Layout.borderRadius.md,
    
    // Shadow for iOS
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    
    // Elevation for Android
    elevation: 6,
  },
  retryButtonText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.semiBold,
  },
});

export default LeadEdit;