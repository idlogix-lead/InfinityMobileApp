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
  Modal as RNModal,
  Switch,
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

// Phone Input Component with Country Code Selection - Fixed with proper vertical padding
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

        {/* Phone Number Input - Fixed with proper vertical padding */}
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
  ...props 
}) => {
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
  ...props 
}) => {
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

// Compact Dropdown Field - Fixed with proper vertical padding
const DropdownField = ({ 
  label, 
  value, 
  options, 
  onSelect, 
  editable = true, 
  placeholder = 'Select option'
}) => {
  const [menuVisible, setMenuVisible] = useState(false);

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
              title={option.identifier}
              titleStyle={[
                styles.menuItemTitle,
                value === option.identifier && styles.menuItemSelected
              ]}
            />
            {index < options.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </Menu>
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

  // Focus state
  const [focusedField, setFocusedField] = useState(null);

  // Use detailed data directly
  const displayLead = leadData;

  // Menu visibility states
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
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
                editable={isEditMode}
              />

              <TextField
                label="Email"
                value={formData.email}
                onChangeText={(text) => updateFormData('email', text)}
                placeholder="Enter email"
                error={errors.email}
                editable={isEditMode}
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

              <TextField
                label="Birthday"
                value={formData.birthday}
                onChangeText={(text) => updateFormData('birthday', text)}
                placeholder="YYYY-MM-DD"
                error={errors.birthday}
                editable={isEditMode}
              />

              <DropdownField
                label="Lead Source"
                value={formData.leadSourceLabel}
                options={leadSourceOptions}
                onSelect={(option) => {
                  updateFormData('leadSourceId', option.id);
                  updateFormData('leadSourceLabel', option.identifier);
                }}
                editable={isEditMode}
                placeholder="Select Lead Source"
              />

              {/* Sales Representative Field */}
              {isEditMode ? (
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
                          <MaterialCommunityIcons name="close-circle" size={Layout.iconSize.sm} color={Colors.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <>
                        <Text style={styles.placeholderText}>Select Sales Representative</Text>
                        <MaterialCommunityIcons name="chevron-down" size={Layout.iconSize.sm} color={Colors.textSecondary} />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <ViewRow 
                  label="Sales Representative"
                  value={selectedRepName || 'Not assigned'}
                />
              )}
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
                editable={isEditMode}
              />

              <DropdownField
                label="Business Partner"
                value={formData.businessPartnerLabel}
                options={businessPartnerOptions}
                onSelect={(option) => {
                  updateFormData('businessPartnerId', option.id);
                  updateFormData('businessPartnerLabel', option.identifier);
                }}
                editable={isEditMode}
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
                editable={isEditMode}
                placeholder="Select Organization"
              />

              <TextAreaField
                label="Lead Source Description"
                value={formData.leadSourceDesc}
                onChangeText={(text) => updateFormData('leadSourceDesc', text)}
                placeholder="Enter lead source description"
                editable={isEditMode}
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
                  editable={isEditMode}
                />
                
                <View style={styles.booleanSpacer} />
                
                <InlineSwipeButton
                  label="Vendor Lead"
                  value={formData.vendorLead}
                  onValueChange={(val) => handleBooleanToggle('vendorLead', val)}
                  editable={isEditMode}
                />
              </View>

              <TextAreaField
                label="Description"
                value={formData.description}
                onChangeText={(text) => updateFormData('description', text)}
                placeholder="Enter description"
                editable={isEditMode}
              />

              <TextAreaField
                label="Comments"
                value={formData.comments}
                onChangeText={(text) => updateFormData('comments', text)}
                placeholder="Enter comments"
                editable={isEditMode}
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
                  <MaterialCommunityIcons name="content-save" size={Layout.iconSize.sm} color={Colors.textInverse} />
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
                <MaterialCommunityIcons name="close" size={Layout.iconSize.md} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearch}>
              <MaterialCommunityIcons name="magnify" size={Layout.iconSize.sm} color={Colors.textSecondary} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search by name..."
                placeholderTextColor={Colors.textTertiary}
                value={salesRepSearch}
                onChangeText={setSalesRepSearch}
              />
              {salesRepSearch.length > 0 && (
                <TouchableOpacity onPress={() => setSalesRepSearch('')}>
                  <MaterialCommunityIcons name="close-circle" size={Layout.iconSize.sm} color={Colors.textSecondary} />
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
                  <View style={styles.modalEmpty}>
                    <MaterialCommunityIcons name="account-off" size={Layout.iconSize.xl} color={Colors.border} />
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
    paddingBottom: verticalScale(20),
  },

  // Header Card - Minimized Spacing
  headerCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    
    // Elevation for Android
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

  // Status Badge
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
    fontFamily: Typography.fontFamily.regular, // NOT bold
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

  // Status Note
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
    fontFamily: Typography.fontFamily.regular, // NOT bold
    color: Colors.info,
  },

  // Tabs with Integrated Arrow Connector - Touches Card
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
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    
    // Elevation for Android
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
    
    // Shadow for iOS
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    
    // Elevation for Android
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
  
  // Integrated Arrow - Part of Active Tab, Touches Both Tab and Card
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

  // Section Cards
  sectionCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.md,
    marginHorizontal: Spacing.md,
    marginTop: verticalScale(8),
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    
    // Elevation for Android
    elevation: 2,
  },
  
  // Activity Section Card - Minimized
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
    fontFamily: Typography.fontFamily.bold, // Already bold
    color: Colors.textPrimary,
  },
  sectionContent: {
    padding: Spacing.sm,
  },

  // Boolean Row for two swipe buttons side by side
  booleanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  booleanSpacer: {
    width: Spacing.md,
  },

  // View Mode Row - No Icons, Clear Label/Value Hierarchy
  viewRow: {
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  viewLabel: {
    fontSize: Typography.fontSize.small, // SMALL and BOLD
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  viewValue: {
    fontSize: Typography.fontSize.small, // Same size as label but NOT bold
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeight.h4,
  },

  // Inline Container for Boolean Fields (label on top, switch/chip below)
  inlineContainer: {
    flex: 1,
  },
  inlineLabel: {
    fontSize: Typography.fontSize.small, // SMALL and BOLD
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

  // Value Chip for Boolean Fields in View Mode
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
    fontFamily: Typography.fontFamily.regular, // NOT bold
    textAlign: 'center',
  },
  valueChipTextSuccess: {
    color: Colors.success,
  },
  valueChipTextDefault: {
    color: Colors.textSecondary,
  },

  // Edit Mode Field Styles
  editField: {
    marginBottom: Spacing.sm,
  },
  editLabel: {
    fontSize: Typography.fontSize.small, // SMALL and BOLD
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Input Wrapper with Shadow and Elevation
  inputWrapper: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: Layout.borderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    
    // Elevation for Android
    elevation: 2,
  },
  input: {
    height: 42,
    paddingHorizontal: Spacing.sm,
    paddingVertical: verticalScale(8),
    fontSize: Typography.fontSize.small, // Same size as label but NOT bold
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
    fontFamily: Typography.fontFamily.regular, // NOT bold
    marginTop: Spacing.xxs,
    marginLeft: Spacing.xs,
  },

  // Phone Input Styles - Fixed with proper vertical padding
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
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    
    // Elevation for Android
    elevation: 2,
  },
  countryPickerFocused: {
    borderColor: Colors.primary,
    
    // Enhanced shadow for focused state
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
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    
    // Elevation for Android
    elevation: 2,
  },
  phoneInputWrapperFocused: {
    borderColor: Colors.primary,
    
    // Enhanced shadow for focused state
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
    fontSize: Typography.fontSize.small, // Same size as label but NOT bold
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  flexible: {
    flex: 1,
  },

  // Dropdown Input - Fixed with proper vertical padding
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
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    
    // Elevation for Android
    elevation: 2,
  },
  dropdownText: {
    fontSize: Typography.fontSize.small,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.bold, // BOLD
    flex: 1,
  },

  // Sales Rep Selector - Fixed with proper vertical padding
  salesRepSelector: {
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
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    
    // Elevation for Android
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
  },
  selectedRepText: {
    fontSize: Typography.fontSize.small,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.bold, // BOLD
  },
  placeholderText: {
    fontSize: Typography.fontSize.small,
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily.regular,
  },
  clearButton: {
    padding: Spacing.xxs,
  },

  // Activity Styles - Minimized
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
    fontFamily: Typography.fontFamily.bold, // Only activity titles are BOLD
    color: Colors.textPrimary,
  },
  activityStatusBadge: {
    paddingHorizontal: Spacing.xxs,
    paddingVertical: Spacing.xxs,
    borderRadius: Layout.borderRadius.round,
  },
  activityStatusText: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.regular, // NOT bold
  },
  activityDescription: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.regular, // NOT bold
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
    fontFamily: Typography.fontFamily.regular, // NOT bold
    color: Colors.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.xxs,
  },

  // Loading & Empty States - Minimized
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

  // Action Buttons
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
    
    // Shadow for iOS
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    
    // Elevation for Android
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
    fontFamily: Typography.fontFamily.semiBold, // Keep as is
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
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    
    // Elevation for Android
    elevation: 2,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.semiBold, // Keep as is
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: Layout.borderRadius.lg,
    borderTopRightRadius: Layout.borderRadius.lg,
    maxHeight: '80%',
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    
    // Elevation for Android
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    fontSize: Typography.fontSize.h4,
    fontFamily: Typography.fontFamily.bold, // Only title is bold
    color: Colors.textPrimary,
  },
  modalSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.md,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.sm,
    gap: Spacing.xs,
    height: 42,
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    
    // Elevation for Android
    elevation: 2,
  },
  modalSearchInput: {
    flex: 1,
    height: 42,
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular, // NOT bold
    color: Colors.textPrimary,
    paddingVertical: verticalScale(8),
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  modalLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(32),
  },
  modalLoadingText: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular, // NOT bold
    color: Colors.textSecondary,
  },
  modalEmpty: {
    alignItems: 'center',
    paddingVertical: verticalScale(32),
  },
  modalEmptyText: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular, // NOT bold
    color: Colors.textTertiary,
    textAlign: 'center',
  },

  // Rep Item Styles
  repItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(10),
    paddingHorizontal: Spacing.md,
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
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    
    // Shadow for iOS
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    
    // Elevation for Android
    elevation: 2,
  },
  repAvatarText: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.semiBold, // Keep as is
    color: Colors.textInverse,
  },
  repDetails: {
    flex: 1,
  },
  repName: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.bold, // BOLD
    color: Colors.textPrimary,
    marginBottom: Spacing.xxs,
  },
  repEmail: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.regular, // NOT bold
    color: Colors.textSecondary,
  },

  // Menu Styles
  menuItemTitle: {
    fontSize: Typography.fontSize.small,
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
    fontFamily: Typography.fontFamily.semiBold, // Keep as is
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
    
    // Shadow for iOS
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    
    // Elevation for Android
    elevation: 4,
  },
  retryButtonText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.semiBold, // Keep as is
  },
});

export default LeadEdit;