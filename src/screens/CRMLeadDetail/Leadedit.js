// LeadEdit.js – Fully updated with location-based address handling and conversion flow
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
  StatusBar,
  SafeAreaView,
  StatusBar as RNStatusBar,
} from 'react-native';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import CustomHeader from '../../components/CustomHeader';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Menu, Divider } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import {
  useUpdateLead,
  useLeadStatistics,
  useCompletedLeadActivities,
  useLeadStatuses,
  useCountries,
  useLocation,
} from '../../hooks/CRMhooks/useCRM';
import { useSalesRepresentatives } from '../../services/CRMAPI/useLead';
import { useQueryClient } from 'react-query';
import theme from '../../constants/CRMTheme/CRMTheme';
import { useAuthStore } from '../../store/authStore';
import CustomAlert from '../../components/CustomAlert';
import { PhoneInput } from '../../components/AddLead/LeadForm';
import crmApiService from '../../services/CRMAPI/crmApiService';

const { Colors, Typography, Layout, Spacing } = theme;
const { scale, verticalScale } = Layout;

// Validation functions
const validateEmail = (email) => {
  if (!email) return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  if (!phone) return true;
  const phoneRegex = /^\+\d{8,15}$/;
  return phoneRegex.test(phone);
};

const validateDate = (date) => {
  if (!date) return true;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date);
};

// Fallback countries
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

// Common dial codes
const DIAL_CODES = [
  { label: '+92 (PK)', value: '+92' },
  { label: '+1 (US)', value: '+1' },
  { label: '+44 (GB)', value: '+44' },
  { label: '+1 (CA)', value: '+1' },
  { label: '+61 (AU)', value: '+61' },
  { label: '+49 (DE)', value: '+49' },
  { label: '+33 (FR)', value: '+33' },
  { label: '+39 (IT)', value: '+39' },
  { label: '+34 (ES)', value: '+34' },
  { label: '+971 (AE)', value: '+971' },
  { label: '+86 (CN)', value: '+86' },
  { label: '+91 (IN)', value: '+91' },
];

// Helper to parse phone
const parsePhone = (phone) => {
  if (!phone) return { dialCode: '+92', number: '' };
  for (const dc of DIAL_CODES) {
    if (phone.startsWith(dc.value)) {
      return { dialCode: dc.value, number: phone.slice(dc.value.length) };
    }
  }
  return { dialCode: '+92', number: phone };
};

// ========== TAB BUTTON ==========
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

    {active && (
      <View style={styles.activeTabArrowContainer}>
        <View style={styles.activeTabArrow} />
      </View>
    )}
  </View>
);

// Activity Item
const ActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'phone call': case 'phone': return 'phone';
      case 'email': return 'email';
      case 'meeting': return 'calendar';
      case 'task': return 'checkbox-marked-circle';
      default: return 'account';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return 'Invalid date'; }
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
            <Text style={[styles.activityStatusText, { color: Colors.success }]}>Completed</Text>
          </View>
        </View>
        <Text style={styles.activityDescription} numberOfLines={1}>
          {activity.Description || 'No description'}
        </Text>
        <View style={styles.activityMeta}>
          <View style={styles.activityMetaItem}>
            <MaterialCommunityIcons name="calendar" size={Layout.iconSize.xs} color={Colors.textSecondary} />
            <Text style={styles.activityMetaText}>{formatDate(activity.StartDate)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// Addable Field
const AddableField = ({ label, placeholder, onAddPress }) => (
  <View style={styles.addableField}>
    <Text style={styles.viewLabel}>{label}</Text>
    <TouchableOpacity style={styles.addableContainer} onPress={onAddPress}>
      <Text style={styles.addablePlaceholder}>{placeholder}</Text>
      <View style={styles.addableIconCircle}>
        <AntDesign name="plus" size={14} color={Colors.textPrimary} />
      </View>
    </TouchableOpacity>
  </View>
);

// Section Header
const SectionHeader = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

// Inline Swipe Button
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

// Text Field
const TextField = ({
  label, value, onChangeText, placeholder, error, editable = true,
  keyboardType = 'default', required = false, multiline = false, numberOfLines = 1,
  onAddPress, ...props
}) => {
  if (!editable) {
    if (!value) {
      return <AddableField label={label} placeholder={placeholder} onAddPress={onAddPress} />;
    }
    return (
      <View style={styles.viewRow}>
        <Text style={styles.viewLabel}>{label}</Text>
        <Text style={styles.viewValue}>{value}</Text>
      </View>
    );
  }

  return (
    <View style={styles.editField}>
      <Text style={styles.editLabel}>{label}{required ? ' *' : ''}</Text>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
          editable={editable}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// Dropdown Field
const DropdownField = ({
  label, value, options, onSelect, editable = true, placeholder = 'Select option',
  required = false, onAddPress,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);

  if (!editable) {
    if (!value) {
      return <AddableField label={label} placeholder={placeholder} onAddPress={onAddPress} />;
    }
    return (
      <View style={styles.viewRow}>
        <Text style={styles.viewLabel}>{label}</Text>
        <Text style={styles.viewValue}>{value}</Text>
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
          <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.dropdownInput} activeOpacity={0.7}>
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
              onPress={() => { onSelect(option); setMenuVisible(false); }}
              title={option.name || option.identifier || option.label}
              titleStyle={[styles.menuItemTitle, value === (option.name || option.identifier || option.label) && styles.menuItemSelected]}
            />
            {index < options.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </Menu>
    </View>
  );
};

// Sales Rep Field
const SalesRepField = ({
  label, value, selectedName, onPress, onClear, error, editable = true, required = false,
}) => {
  if (!editable) {
    if (!selectedName) {
      return <AddableField label={label} placeholder="Select Sales Representative" onAddPress={onPress} />;
    }
    return (
      <View style={styles.viewRow}>
        <Text style={styles.viewLabel}>{label}</Text>
        <Text style={styles.viewValue}>{selectedName}</Text>
      </View>
    );
  }

  return (
    <View style={styles.editField}>
      <Text style={styles.editLabel}>{label}{required ? ' *' : ''}</Text>
      <TouchableOpacity
        style={[styles.salesRepSelector, error && styles.selectorError, !selectedName && styles.selectorEmpty]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {selectedName ? (
          <View style={styles.selectedRepContainer}>
            <Text style={styles.selectedRepText}>{selectedName}</Text>
            <TouchableOpacity style={styles.clearButton} onPress={(e) => { e.stopPropagation(); onClear(); }}>
              <Icon name="close" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.placeholderText}>Select Sales Representative</Text>
        )}
        <MaterialCommunityIcons name="chevron-down" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// Country Picker Field
const CountryPickerField = ({
  label,
  value,
  onValueChange,
  editable = true,
  required = false,
  onAddPress,
  countries,
  loading,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const selectedCountry = useMemo(() => {
    if (!value) return null;
    return countries.find(c => c.countryCode === value) || null;
  }, [value, countries]);

  if (!editable) {
    if (!selectedCountry) {
      return <AddableField label={label} placeholder="Select Country" onAddPress={onAddPress} />;
    }
    return (
      <View style={styles.viewRow}>
        <Text style={styles.viewLabel}>{label}</Text>
        <Text style={styles.viewValue}>{selectedCountry.name}</Text>
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
            style={styles.countryPickerButton}
            onPress={() => setMenuVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.countryPickerText, !selectedCountry && styles.placeholderText]}>
              {selectedCountry ? selectedCountry.name : 'Select Country'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={Layout.iconSize.sm} color={Colors.textSecondary} />
          </TouchableOpacity>
        }
        style={styles.countryMenu}
      >
        {loading ? (
          <Menu.Item title="Loading..." disabled />
        ) : (
          countries.map((country, index) => (
            <React.Fragment key={country.id}>
              <Menu.Item
                onPress={() => {
                  onValueChange(country.countryCode, country.id);
                  setMenuVisible(false);
                }}
                title={country.name}
                titleStyle={[
                  styles.menuItemTitle,
                  selectedCountry?.id === country.id && styles.menuItemSelected,
                ]}
              />
              {index < countries.length - 1 && <Divider />}
            </React.Fragment>
          ))
        )}
      </Menu>
    </View>
  );
};

// ========== MAIN COMPONENT ==========
const LeadEdit = ({ route, navigation }) => {
  const { data: leadData } = route.params;
  const queryClient = useQueryClient();
  const authState = useAuthStore();

  const [isMounted, setIsMounted] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false, title: '', message: '', type: 'info',
    onConfirm: null, onCancel: null, confirmText: 'OK', cancelText: 'Cancel', showCancelButton: false,
  });

  useEffect(() => { setIsMounted(true); return () => {}; }, []);

  const { data: leadStatuses = [], isLoading: statusesLoading } = useLeadStatuses();
  const { data: countriesFromApi = [], isLoading: countriesLoading } = useCountries(isMounted);

  const countries = useMemo(() => {
    if (countriesFromApi.length > 0) {
      return countriesFromApi.map(c => ({
        id: c.id,
        name: c.Name || c.identifier || 'Unknown',
        countryCode: c.CountryCode || '',
      }));
    }
    return FALLBACK_COUNTRIES;
  }, [countriesFromApi]);

  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const displayLead = leadData;

  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [salesRepModalVisible, setSalesRepModalVisible] = useState(false);
  const [salesRepSearch, setSalesRepSearch] = useState('');
  const [isConverting, setIsConverting] = useState(false);

  // Location
  const locationId = displayLead?.C_Location_ID?.id;
  const { data: locationData, isLoading: locationLoading } = useLocation(locationId, isMounted && !!locationId);

  // Contact address fields
  const [contactStreet, setContactStreet] = useState('');
  const [contactCity, setContactCity] = useState('');
  const [contactCountryCode, setContactCountryCode] = useState('');
  const [contactCountryId, setContactCountryId] = useState(null);

  // Business partner address (single field)
  const [bpAddress, setBpAddress] = useState('');

  // Phone split
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneDialCode, setPhoneDialCode] = useState('+92');

  // Combined contact address for display
  const combinedContactAddress = useMemo(() => {
    if (locationData?.identifier) return locationData.identifier;
    const parts = [];
    if (contactStreet) parts.push(contactStreet);
    if (contactCity) parts.push(contactCity);
    if (contactCountryCode) {
      const country = countries.find(c => c.countryCode === contactCountryCode);
      if (country) parts.push(country.name);
    }
    return parts.join(', ');
  }, [contactStreet, contactCity, contactCountryCode, countries, locationData]);

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
    statusColor: Colors.statusNew,
    leadSourceId: 'CC',
    leadSourceLabel: 'Cold Call',
    client: '',
    organization: '',
  });

  const { data: salesReps = [], isLoading: loadingSalesReps } = useSalesRepresentatives(isMounted);

  // Options
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

  const updateLeadMutation = useUpdateLead();
  const { refetch: refetchLeadStatistics } = useLeadStatistics();
  const { data: activities = [], isLoading: activitiesLoading, refetch: refetchActivities } =
    useCompletedLeadActivities(displayLead?.id);

  // Alert helpers
  const showAlert = (title, message, type = 'info', onConfirm = null, onCancel = null) => {
    setAlertConfig({
      visible: true, title, message, type,
      onConfirm: onConfirm || (() => setAlertConfig(prev => ({ ...prev, visible: false }))),
      onCancel: onCancel || (() => setAlertConfig(prev => ({ ...prev, visible: false }))),
      confirmText: type === 'delete' ? 'Delete' : 'OK',
      cancelText: 'Cancel',
      showCancelButton: type === 'delete' || type === 'warning',
    });
  };
  const showSuccessAlert = (message, onConfirm = null) => showAlert('Success', message, 'success', onConfirm);
  const showErrorAlert = (message, onConfirm = null) => showAlert('Error', message, 'error', onConfirm);
  const showValidationAlert = (message) => showAlert('Validation Error', message, 'warning');
  const showConfirmationAlert = (title, message, onConfirm, onCancel = null) => {
    setAlertConfig({
      visible: true, title, message, type: 'warning',
      onConfirm: () => { onConfirm(); hideAlert(); },
      onCancel: onCancel || hideAlert,
      confirmText: 'Yes', cancelText: 'No', showCancelButton: true,
    });
  };
  const hideAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

  const filteredSalesReps = useMemo(() => {
    if (!salesRepSearch.trim()) return salesReps;
    const q = salesRepSearch.toLowerCase();
    return salesReps.filter(rep => rep.Name && rep.Name.toLowerCase().includes(q));
  }, [salesReps, salesRepSearch]);

  const selectedRepName = useMemo(() => {
    if (!formData.salesRepId) return '';
    const rep = salesReps.find(r => r.id === formData.salesRepId);
    return rep ? rep.Name : '';
  }, [formData.salesRepId, salesReps]);

  const currentStatus = useMemo(() => {
    if (!formData.statusId) return null;
    return leadStatuses.find(s => s.id === formData.statusId) || {
      id: formData.statusId, name: formData.statusLabel, color: formData.statusColor || Colors.statusNew
    };
  }, [formData.statusId, formData.statusLabel, leadStatuses]);

  // Populate address fields from locationData
  useEffect(() => {
    if (locationData && countries.length > 0) {
      setContactStreet(locationData.Address1 || '');
      setContactCity(locationData.City || '');
      const country = countries.find(c => c.id === locationData.C_Country_ID?.id);
      if (country) {
        setContactCountryCode(country.countryCode);
        setContactCountryId(country.id);
      }
    }
  }, [locationData, countries]);

  // Initial form population
  useEffect(() => {
    if (!displayLead) return;

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

    setBpAddress(displayLead?.UserAddress2 || '');

    const { dialCode, number } = parsePhone(displayLead?.Phone || '');
    setPhoneDialCode(dialCode);
    setPhoneNumber(number);

    setErrors({});
  }, [displayLead, leadStatuses]);

  // Update phone in formData when parts change
  useEffect(() => {
    if (isEditMode) {
      const fullPhone = phoneDialCode + phoneNumber;
      setFormData(prev => ({ ...prev, phone: fullPhone }));
    }
  }, [phoneDialCode, phoneNumber, isEditMode]);

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.salesRepId) newErrors.salesRep = 'Sales Representative is required';
    if (!formData.client?.trim()) newErrors.client = 'Client is required';
    if (!formData.organization?.trim()) newErrors.organization = 'Organization is required';

    if (formData.email && formData.email.trim() && !validateEmail(formData.email)) newErrors.email = 'Invalid email format';
    if (formData.phone && formData.phone.trim() && !validatePhone(formData.phone)) newErrors.phone = 'Phone must start with + and contain 8-15 digits';
    if (formData.phone2 && formData.phone2.trim() && !validatePhone(formData.phone2)) newErrors.phone2 = 'Invalid phone format';
    if (formData.birthday && formData.birthday.trim() && !validateDate(formData.birthday)) newErrors.birthday = 'Invalid date format (use YYYY-MM-DD)';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showValidationAlert(Object.values(newErrors)[0]);
      return false;
    }
    return true;
  };

  // ========== Navigate to Add Sale Opportunity ==========
  const navigateToAddOpportunity = () => {
    navigation.navigate('AddSaleOppor', {
      leadData: {
        id: displayLead.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        companyName: formData.companyName,
        description: formData.description,
        comments: formData.comments,
        businessPartnerId: formData.businessPartnerId,
        businessPartnerName: formData.businessPartnerLabel,
        salesRepId: formData.salesRepId,
        salesRepLabel: formData.salesRepLabel,
        organizationId: formData.organizationId,
        organizationName: formData.organizationLabel,
        leadSourceId: formData.leadSourceId,
        leadSourceLabel: formData.leadSourceLabel,
        userId: displayLead.id,
      },
      mode: 'fromLeadConversion',
    });
  };

  // ========== ADDRESS SAVING HELPER ==========
  const saveAddress = async () => {
    if (!contactStreet && !contactCity && !contactCountryId) {
      return null;
    }
    const locationPayload = {
      Address1: contactStreet || '',
      City: contactCity || '',
      C_Country_ID: { id: contactCountryId },
      AD_Client_ID: { id: formData.businessPartnerId || 1000000 },
      AD_Org_ID: { id: formData.organizationId || 1000000 },
      IsActive: true,
    };
    try {
      const newLocation = await crmApiService.createLocation(locationPayload);
      return newLocation.id;
    } catch (error) {
      console.error('Failed to save location:', error);
      showErrorAlert('Could not save address. Please try again.');
      throw error;
    }
  };

  // ========== HANDLE STATUS UPDATE (with conversion) ==========
  const handleStatusUpdate = async (status) => {
    const newStatusId = status.id;
    const newStatusName = status.name;
    const oldStatusName = formData.statusLabel;
    const isConvertedStatus = newStatusName.toLowerCase() === 'converted';

    // For non‑converted status changes, just update local state
    if (!isEditMode || !isConvertedStatus || oldStatusName === 'Converted') {
      updateFormData('statusId', newStatusId);
      updateFormData('statusLabel', newStatusName);
      updateFormData('statusColor', status.color);
      setStatusMenuVisible(false);
      return;
    }

    // === Converted: save lead with new status and offer opportunity creation ===
    if (!validateForm()) return;

    setIsConverting(true);
    setStatusMenuVisible(false);

    try {
      // 1. Save address (if any)
      const newLocationId = await saveAddress();

      // 2. Prepare payload with new status and location
      const payload = {
        Name: formData.name,
        EMail: formData.email || '',
        Phone: formData.phone || '',
        Phone2: formData.phone2 || '',
        Birthday: formData.birthday || null,
        IsSalesLead: formData.salesLead,
        IsVendorLead: formData.vendorLead,
        BPName: formData.companyName || '',
        AD_Org_ID: { id: formData.organizationId, identifier: formData.organizationLabel },
        SalesRep_ID: formData.salesRepId ? { id: formData.salesRepId, identifier: formData.salesRepLabel } : null,
        AD_Client_ID: { id: formData.businessPartnerId, identifier: formData.businessPartnerLabel },
        Description: formData.description || '',
        IsActive: formData.active,
        Value: formData.searchKey || '',
        LeadSourceDescription: formData.leadSourceDesc || '',
        LeadStatusDescription: formData.leadStatusDesc || '',
        Comments: formData.comments || '',
        LeadStatus: { id: newStatusId, identifier: newStatusName },
        LeadSource: { id: formData.leadSourceId, identifier: formData.leadSourceLabel },
        ...(newLocationId && { C_Location_ID: { id: newLocationId } }),
        UserAddress1: null,
        UserAddress2: bpAddress || null,
      };

      await updateLeadMutation.mutateAsync({ id: displayLead.id, updates: payload });

      // 3. Update local form data with new status
      setFormData(prev => ({
        ...prev,
        statusId: newStatusId,
        statusLabel: newStatusName,
        statusColor: status.color,
      }));

      // 4. Refresh related data
      refetchLeadStatistics();
      queryClient.invalidateQueries(['leads']);
      queryClient.invalidateQueries(['lead-completed-activities', displayLead.id]);

      // 5. Exit edit mode
      setIsEditMode(false);

      // 6. Ask user to create opportunity
      showConfirmationAlert(
        'Lead Converted',
        'Lead has been successfully converted. Would you like to create a sales opportunity now?',
        navigateToAddOpportunity
      );
    } catch (error) {
      // Error already shown in saveAddress or mutation, but we catch to reset converting state
      console.error('Conversion failed:', error);
    } finally {
      setIsConverting(false);
    }
  };

  // ========== HANDLE SAVE (normal save) ==========
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const newLocationId = await saveAddress();

      const payload = {
        Name: formData.name,
        EMail: formData.email || '',
        Phone: formData.phone || '',
        Phone2: formData.phone2 || '',
        Birthday: formData.birthday || null,
        IsSalesLead: formData.salesLead,
        IsVendorLead: formData.vendorLead,
        BPName: formData.companyName || '',
        AD_Org_ID: { id: formData.organizationId, identifier: formData.organizationLabel },
        SalesRep_ID: formData.salesRepId ? { id: formData.salesRepId, identifier: formData.salesRepLabel } : null,
        AD_Client_ID: { id: formData.businessPartnerId, identifier: formData.businessPartnerLabel },
        Description: formData.description || '',
        IsActive: formData.active,
        Value: formData.searchKey || '',
        LeadSourceDescription: formData.leadSourceDesc || '',
        LeadStatusDescription: formData.leadStatusDesc || '',
        Comments: formData.comments || '',
        LeadStatus: { id: formData.statusId, identifier: formData.statusLabel },
        LeadSource: { id: formData.leadSourceId, identifier: formData.leadSourceLabel },
        ...(newLocationId && { C_Location_ID: { id: newLocationId } }),
        UserAddress1: null,
        UserAddress2: bpAddress || null,
      };

      await updateLeadMutation.mutateAsync({ id: displayLead.id, updates: payload });

      const isConverted = formData.statusLabel.toLowerCase() === 'converted';
      if (isConverted) {
        showConfirmationAlert('Lead Converted', 'Lead converted. Create sales opportunity?', navigateToAddOpportunity);
      } else {
        showSuccessAlert('Lead updated successfully!', () => { hideAlert(); setIsEditMode(false); });
      }

      refetchLeadStatistics();
      queryClient.invalidateQueries(['leads']);
      queryClient.invalidateQueries(['lead-completed-activities', displayLead.id]);
      setErrors({});
    } catch (error) {
      if (!error.message?.includes('save address')) {
        showErrorAlert(error.message || 'Failed to update lead');
      }
    }
  };

  const handleEditToggle = () => {
    if (isEditMode) handleSave();
    else { setIsEditMode(true); setErrors({}); }
  };

  const handleAddActivity = () => {
    navigation.navigate('AddActivity', {
      data: displayLead, mode: 'create',
      onGoBack: () => { refetchActivities(); queryClient.invalidateQueries(['lead-completed-activities', displayLead.id]); }
    });
  };

  const handleSelectSalesRep = (rep) => {
    updateFormData('salesRepId', rep.id);
    updateFormData('salesRepLabel', rep.Name);
    setSalesRepModalVisible(false);
    setSalesRepSearch('');
  };

  const handleClearSalesRep = () => {
    updateFormData('salesRepId', '');
    updateFormData('salesRepLabel', '');
  };

  const handleBooleanToggle = (key, value) => updateFormData(key, value);

  const handlePhoneCountryChange = (country) => {
    setPhoneDialCode(`+${country.callingCode[0]}`);
  };

  const renderSalesRepItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.repItem, formData.salesRepId === item.id && styles.selectedRepItem]}
      onPress={() => handleSelectSalesRep(item)}
      activeOpacity={0.7}
    >
      <View style={styles.repItemContent}>
        <View style={styles.repAvatar}><Text style={styles.repAvatarText}>{item.Name?.charAt(0).toUpperCase() || '?'}</Text></View>
        <View style={styles.repDetails}>
          <Text style={styles.repName}>{item.Name}</Text>
          {item.EMail && <Text style={styles.repEmail}>{item.EMail}</Text>}
        </View>
      </View>
      {formData.salesRepId === item.id && <AntDesign name="checkcircle" size={Layout.iconSize.sm} color={Colors.primary} />}
    </TouchableOpacity>
  );

  // Render tab content (unchanged from new version)
  const renderTabContent = () => {
    const handleAddPress = () => setIsEditMode(true);

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
                required
                onAddPress={handleAddPress}
              />
              <TextField
                label="Client"
                value={formData.client}
                editable={false}
                onAddPress={handleAddPress}
              />
              <TextField
                label="Organization"
                value={formData.organization}
                editable={false}
                onAddPress={handleAddPress}
              />
              <TextField
                label="Email"
                value={formData.email}
                onChangeText={(text) => updateFormData('email', text)}
                placeholder="Enter email"
                error={errors.email}
                editable={isEditMode && !isConverting}
                keyboardType="email-address"
                onAddPress={handleAddPress}
              />
              {!isEditMode ? (
                !formData.phone ? (
                  <AddableField label="Phone" placeholder="Add phone number" onAddPress={handleAddPress} />
                ) : (
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>Phone</Text>
                    <Text style={styles.viewValue}>{formData.phone}</Text>
                  </View>
                )
              ) : (
                <PhoneInput
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  onCountryChange={handlePhoneCountryChange}
                  defaultCountryCode="PK"
                  placeholder="Enter phone number"
                  error={errors.phone}
                  editable={isEditMode && !isConverting}
                  required
                  containerStyle={{ marginBottom: Spacing.md }}
                />
              )}
              {isEditMode ? (
                <>
                  <TextField
                    label="Street Address"
                    value={contactStreet}
                    onChangeText={setContactStreet}
                    placeholder="Enter street address"
                    editable={isEditMode && !isConverting}
                  />
                  <TextField
                    label="City"
                    value={contactCity}
                    onChangeText={setContactCity}
                    placeholder="Enter city"
                    editable={isEditMode && !isConverting}
                  />
                  <CountryPickerField
                    label="Country"
                    value={contactCountryCode}
                    onValueChange={(code, id) => {
                      setContactCountryCode(code);
                      setContactCountryId(id);
                    }}
                    editable={isEditMode && !isConverting}
                    countries={countries}
                    loading={countriesLoading}
                  />
                </>
              ) : (
                <TextField
                  label="Address"
                  value={combinedContactAddress}
                  editable={false}
                  onAddPress={handleAddPress}
                />
              )}
              <SalesRepField
                label="Sales Representative"
                selectedName={selectedRepName}
                onPress={() => setSalesRepModalVisible(true)}
                onClear={handleClearSalesRep}
                error={errors.salesRep}
                editable={isEditMode && !isConverting}
                required
              />
              <TextField
                label="Description"
                value={formData.description}
                onChangeText={(text) => updateFormData('description', text)}
                placeholder="Enter description"
                editable={isEditMode && !isConverting}
                multiline
                numberOfLines={3}
                onAddPress={handleAddPress}
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
                onAddPress={handleAddPress}
              />
              <TextField
                label="Business Partner Address"
                value={bpAddress}
                onChangeText={setBpAddress}
                placeholder="Enter business partner address"
                editable={isEditMode && !isConverting}
                multiline
                numberOfLines={2}
                onAddPress={handleAddPress}
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
                onAddPress={handleAddPress}
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
                onAddPress={handleAddPress}
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
                onAddPress={handleAddPress}
              />
              <TextField
                label="Lead Source Description"
                value={formData.leadSourceDesc}
                onChangeText={(text) => updateFormData('leadSourceDesc', text)}
                placeholder="Enter lead source description"
                editable={isEditMode && !isConverting}
                multiline
                numberOfLines={2}
                onAddPress={handleAddPress}
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
                label="Secondary Phone"
                value={formData.phone2}
                onChangeText={(text) => updateFormData('phone2', text)}
                placeholder="+923001234567"
                error={errors.phone2}
                editable={isEditMode && !isConverting}
                keyboardType="phone-pad"
                onAddPress={handleAddPress}
              />
              <TextField
                label="Birthday"
                value={formData.birthday}
                onChangeText={(text) => updateFormData('birthday', text)}
                placeholder="YYYY-MM-DD"
                error={errors.birthday}
                editable={isEditMode && !isConverting}
                onAddPress={handleAddPress}
              />
              <TextField
                label="Search Key"
                value={formData.searchKey}
                onChangeText={(text) => updateFormData('searchKey', text)}
                placeholder="Enter search key"
                editable={isEditMode && !isConverting}
                onAddPress={handleAddPress}
              />
              <TextField
                label="Comments"
                value={formData.comments}
                onChangeText={(text) => updateFormData('comments', text)}
                placeholder="Enter comments"
                editable={isEditMode && !isConverting}
                multiline
                numberOfLines={3}
                onAddPress={handleAddPress}
              />
              <TextField
                label="Lead Status Description"
                value={formData.leadStatusDesc}
                onChangeText={(text) => updateFormData('leadStatusDesc', text)}
                placeholder="Enter status description"
                editable={isEditMode && !isConverting}
                multiline
                numberOfLines={2}
                onAddPress={handleAddPress}
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
                  {isEditMode && (
                    <TouchableOpacity style={styles.addActivityButton} onPress={handleAddActivity}>
                      <Text style={styles.addActivityButtonText}>+ Add Activity</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </View>
        );

      default: return null;
    }
  };

  if (!displayLead) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Lead Details" LeftIcon="arrow-left" LeftPress={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={Layout.iconSize.xxl} color={Colors.error} />
          <Text style={styles.errorText}>Failed to load lead details</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (statusesLoading || locationLoading) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Lead Details" LeftIcon="arrow-left" LeftPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{locationLoading ? 'Loading location...' : 'Loading statuses...'}</Text>
        </View>
      </View>
    );
  }

  const HeaderWrapper = Platform.OS === 'ios' ? SafeAreaView : View;
  const headerWrapperStyle = Platform.OS === 'android'
    ? { paddingTop: RNStatusBar.currentHeight || 0, backgroundColor: 'transparent' }
    : { backgroundColor: 'transparent' };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar translucent backgroundColor="transparent" />
      <HeaderWrapper style={headerWrapperStyle}>
        <CustomHeader
          title="Lead Details"
          LeftIcon="arrow-left"
          LeftPress={() => navigation.goBack()}
          RightIcon={isEditMode ? "content-save" : "pencil"}
          RightPress={handleEditToggle}
        />
      </HeaderWrapper>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={() => { if (alertConfig.onConfirm) alertConfig.onConfirm(); hideAlert(); }}
        onCancel={() => { if (alertConfig.onCancel) alertConfig.onCancel(); hideAlert(); }}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        showCancelButton={alertConfig.showCancelButton}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.avatarContainer}>
                <Image source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.avatar} />
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
            <View style={styles.headerRight}>
              {isEditMode ? (
                <Menu
                  visible={statusMenuVisible}
                  onDismiss={() => setStatusMenuVisible(false)}
                  anchor={
                    <TouchableOpacity
                      style={[styles.statusBadge, { backgroundColor: currentStatus?.color ? `${currentStatus.color}20` : Colors.infoLight }]}
                      onPress={() => setStatusMenuVisible(true)}
                      activeOpacity={0.7}
                      disabled={isConverting}
                    >
                      {isConverting ? (
                        <ActivityIndicator size="small" color={currentStatus?.color || Colors.primary} />
                      ) : (
                        <>
                          <View style={[styles.dot, { backgroundColor: currentStatus?.color || Colors.primary }]} />
                          <Text style={[styles.statusBadgeText, { color: currentStatus?.color || Colors.primary }]}>
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
                        titleStyle={[styles.menuItemTitle, formData.statusId === status.id && styles.menuItemSelected]}
                      />
                      {index < leadStatuses.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </Menu>
              ) : (
                <View style={[styles.statusBadge, { backgroundColor: currentStatus?.color ? `${currentStatus.color}20` : Colors.infoLight }]}>
                  <View style={[styles.dot, { backgroundColor: currentStatus?.color || Colors.primary }]} />
                  <Text style={[styles.statusBadgeText, { color: currentStatus?.color || Colors.primary }]}>
                    {currentStatus?.name || formData.statusLabel}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                onPress={handleAddActivity}
                activeOpacity={0.7}
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                style={styles.activityIconWrapper}
                disabled={isConverting}
              >
                <View style={styles.addActivityIcon}>
                  <Ionicons name="alarm-outline" size={Layout.iconSize.sm} color={Colors.textPrimary} />
                  <AntDesign name="pluscircle" size={Layout.iconSize.xs} color={Colors.textPrimary} style={styles.activityPlusIcon} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
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

        {/* Tabs */}
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
              style={[styles.saveButton, (updateLeadMutation.isLoading || isConverting) && styles.saveButtonDisabled]}
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
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditMode(false)} activeOpacity={0.7} disabled={isConverting}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Sales Rep Modal */}
      <RNModal
        visible={salesRepModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => { setSalesRepModalVisible(false); setSalesRepSearch(''); }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Sales Representative</Text>
              <TouchableOpacity onPress={() => { setSalesRepModalVisible(false); setSalesRepSearch(''); }} style={styles.closeButton}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name..."
                placeholderTextColor="#999"
                value={salesRepSearch}
                onChangeText={setSalesRepSearch}
                autoFocus
              />
              {salesRepSearch.length > 0 && (
                <TouchableOpacity onPress={() => setSalesRepSearch('')} style={styles.clearSearchButton}>
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
                      {salesRepSearch.trim() ? `No representatives found for "${salesRepSearch}"` : 'No representatives available'}
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

// ========== STYLES (unchanged from new version) ==========
const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: verticalScale(20) },
  headerCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarContainer: { marginRight: Spacing.sm },
  avatar: { width: scale(40), height: scale(40), borderRadius: scale(20), borderWidth: 1, borderColor: Colors.borderLight },
  headerInfo: { flex: 1 },
  leadName: { fontSize: Typography.fontSize.h4, fontFamily: Typography.fontFamily.bold, color: Colors.textPrimary },
  companyBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: Colors.backgroundLight, borderRadius: Layout.borderRadius.round },
  companyBadgeText: { fontSize: Typography.fontSize.xsmall, fontFamily: Typography.fontFamily.bold, color: Colors.textPrimary, marginLeft: Spacing.xxs },
  headerRight: { alignItems: 'flex-end', justifyContent: 'flex-start' },
  activityIconWrapper: { marginTop: 0, paddingTop: 0 },
  contactInfoRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.md, paddingBottom: Spacing.xs, gap: Spacing.xs },
  contactChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.backgroundLight, paddingHorizontal: Spacing.xs, paddingVertical: Spacing.xxs, borderRadius: Layout.borderRadius.round, gap: Spacing.xxs },
  contactChipText: { fontSize: Typography.fontSize.xsmall, fontFamily: Typography.fontFamily.bold, color: Colors.textSecondary },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xs, paddingVertical: Spacing.xxs, borderRadius: Layout.borderRadius.round, gap: Spacing.xxs },
  statusBadgeText: { fontSize: Typography.fontSize.xsmall, fontFamily: Typography.fontFamily.regular },
  dot: { width: scale(6), height: scale(6), borderRadius: scale(3) },
  addActivityIcon: { position: 'relative', flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, marginRight: Spacing.md },
  activityPlusIcon: { position: 'absolute', right: -scale(4), bottom: -scale(4), backgroundColor: Colors.cardBackground, borderRadius: scale(8) },
  statusNote: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.infoLight, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderTopWidth: 1, borderTopColor: Colors.borderLight, gap: Spacing.xs },
  statusNoteText: { flex: 1, fontSize: Typography.fontSize.xsmall, fontFamily: Typography.fontFamily.regular, color: Colors.info },

  // Tabs
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
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
  },
  tabButtonText: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.bold,
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

  // Section cards
  sectionCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.md,
    marginHorizontal: Spacing.md,
    marginTop: verticalScale(12),
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  activitySectionCard: { marginTop: verticalScale(8), marginBottom: Spacing.sm },
  sectionHeader: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, backgroundColor: Colors.backgroundLight },
  sectionTitle: { fontSize: Typography.fontSize.large, fontFamily: Typography.fontFamily.bold, color: Colors.textPrimary },
  sectionContent: { padding: Spacing.md },
  booleanRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  booleanSpacer: { width: Spacing.md },
  viewRow: { marginBottom: Spacing.md, paddingBottom: Spacing.xs, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  viewLabel: { fontSize: Typography.fontSize.medium, fontFamily: Typography.fontFamily.bold, color: Colors.textSecondary, marginBottom: Spacing.xxs, textTransform: 'uppercase', letterSpacing: 0.5 },
  viewValue: { fontSize: Typography.fontSize.medium, fontFamily: Typography.fontFamily.regular, color: Colors.textPrimary, lineHeight: Typography.lineHeight.h4 },
  addableField: { marginBottom: Spacing.sm},
  addableContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    height: 42,
    backgroundColor: Colors.backgroundLight,
  },
  addablePlaceholder: {
    fontSize: Typography.fontSize.small,
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily.regular, 
  },
  addableIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundLight,
  },
  inlineContainer: { flex: 1 },
  inlineLabel: { fontSize: Typography.fontSize.small, fontFamily: Typography.fontFamily.bold, color: Colors.textSecondary, marginBottom: Spacing.xxs, textTransform: 'uppercase', letterSpacing: 0.5 },
  inlineSwitch: { alignSelf: 'flex-start', transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] },
  valueChip: { alignSelf: 'flex-start', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Layout.borderRadius.round, minWidth: scale(60), alignItems: 'center' },
  valueChipSuccess: { backgroundColor: Colors.successLight },
  valueChipDefault: { backgroundColor: Colors.backgroundLight, borderWidth: 1, borderColor: Colors.border },
  valueChipText: { fontSize: Typography.fontSize.xsmall, fontFamily: Typography.fontFamily.regular, textAlign: 'center' },
  valueChipTextSuccess: { color: Colors.success },
  valueChipTextDefault: { color: Colors.textSecondary },
  editField: { marginBottom: Spacing.md },
  editLabel: { fontSize: Typography.fontSize.small, fontFamily: Typography.fontFamily.bold, color: Colors.textSecondary, marginBottom: Spacing.xxs, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrapper: { backgroundColor: Colors.backgroundLight, borderRadius: Layout.borderRadius.sm, borderBottomWidth: 1, borderBottomColor: Colors.border, justifyContent: 'center' },
  input: { height: 50, paddingHorizontal: Spacing.sm, paddingVertical: verticalScale(15), fontSize: Typography.fontSize.small, fontFamily: Typography.fontFamily.regular, color: Colors.textPrimary,  },
  multilineInput: { minHeight: verticalScale(80), paddingTop: verticalScale(20), paddingBottom: verticalScale(10), textAlignVertical: 'top' },
  inputError: { borderColor: Colors.error, borderWidth: 1.5 },
  errorText: { color: Colors.error, fontSize: Typography.fontSize.xsmall, fontFamily: Typography.fontFamily.regular, marginTop: Spacing.xxs, marginLeft: Spacing.xs },
  dropdownInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.backgroundLight, borderBottomWidth: 1, borderBottomColor: Colors.border, borderRadius: Layout.borderRadius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 0, height: 42 },
  dropdownText: { fontSize: Typography.fontSize.small, color: Colors.textPrimary, fontFamily: Typography.fontFamily.bold, flex: 1 },
  salesRepSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: Colors.border, borderRadius: Layout.borderRadius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 0, height: 42, backgroundColor: Colors.backgroundLight },
  selectorEmpty: { borderColor: Colors.errorLight },
  selectorError: { borderColor: Colors.error, borderWidth: 1.5 },
  selectedRepContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectedRepText: { fontSize: Typography.fontSize.small, color: Colors.textPrimary, fontFamily: Typography.fontFamily.regular, flex: 1 },
  placeholderText: { fontSize: Typography.fontSize.small, color: Colors.textTertiary, fontFamily: Typography.fontFamily.regular, flex: 1 },
  clearButton: { padding: Spacing.xxs, marginRight: Spacing.xxs },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    borderRadius: Layout.borderRadius.sm,
    overflow: 'hidden',
  },
  dialCodePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 0,
    height: 42,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    backgroundColor: Colors.backgroundLight,
  },
  dialCodeText: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    marginRight: Spacing.xxs,
  },
  phoneNumberInput: {
    flex: 1,
    height: 42,
    paddingHorizontal: Spacing.sm,
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },
  countryPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    borderRadius: Layout.borderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 0,
    height: 42,
  },
  countryPickerText: {
    fontSize: Typography.fontSize.small,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.regular,
  },
  countryMenu: {
    marginTop: Spacing.sm,
  },
  menuItemTitle: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
  },
  menuItemSelected: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.semiBold,
  },
  activityItem: { flexDirection: 'row', paddingVertical: Spacing.xs, alignItems: 'center' },
  activityIconContainer: { width: scale(28), height: scale(28), borderRadius: scale(14), backgroundColor: Colors.infoLight, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  activityContent: { flex: 1 },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xxs },
  activityTitle: { fontSize: Typography.fontSize.small, fontFamily: Typography.fontFamily.bold, color: Colors.textPrimary },
  activityStatusBadge: { paddingHorizontal: Spacing.xxs, paddingVertical: Spacing.xxs, borderRadius: Layout.borderRadius.round },
  activityStatusText: { fontSize: Typography.fontSize.xsmall, fontFamily: Typography.fontFamily.regular },
  activityDescription: { fontSize: Typography.fontSize.xsmall, fontFamily: Typography.fontFamily.regular, color: Colors.textSecondary, marginBottom: Spacing.xxs },
  activityMeta: { flexDirection: 'row' },
  activityMetaItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xxs },
  activityMetaText: { fontSize: Typography.fontSize.xsmall, fontFamily: Typography.fontFamily.regular, color: Colors.textSecondary },
  separator: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.xxs },
  loadingContainer: { alignItems: 'center', paddingVertical: verticalScale(16) },
  loadingText: { fontSize: Typography.fontSize.small, fontFamily: Typography.fontFamily.regular, color: Colors.textSecondary, marginTop: Spacing.xs },
  emptyState: { alignItems: 'center', paddingVertical: verticalScale(16) },
  emptyStateText: { fontSize: Typography.fontSize.small, fontFamily: Typography.fontFamily.regular, color: Colors.textTertiary, marginTop: Spacing.xs, marginBottom: Spacing.sm },
  addActivityButton: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Layout.borderRadius.sm },
  addActivityButtonText: { fontSize: Typography.fontSize.xsmall, fontFamily: Typography.fontFamily.semiBold, color: Colors.textInverse },
  actionButtons: { marginHorizontal: Spacing.md, marginTop: Spacing.sm, marginBottom: verticalScale(16), gap: Spacing.sm },
  saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, paddingVertical: 0, borderRadius: Layout.borderRadius.md, gap: Spacing.sm, height: 48 },
  saveButtonDisabled: { opacity: 0.7, backgroundColor: Colors.buttonDisabled },
  saveButtonText: { color: Colors.textInverse, fontSize: Typography.fontSize.small, fontFamily: Typography.fontFamily.semiBold },
  cancelButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: 0, borderRadius: Layout.borderRadius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.backgroundLight, height: 48 },
  cancelButtonText: { color: Colors.textSecondary, fontSize: Typography.fontSize.small, fontFamily: Typography.fontFamily.semiBold },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalTitle: { fontSize: 18, fontFamily: 'K2D-SemiBold', color: '#333' },
  closeButton: { padding: 4 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, margin: 16, paddingHorizontal: 12, backgroundColor: '#fff' },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 15, fontFamily: 'K2D-Regular', color: '#333', paddingVertical: 0 },
  clearSearchButton: { padding: 4 },
  modalLoading: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32 },
  modalLoadingText: { marginTop: 8, fontSize: 14, color: '#666', fontFamily: 'K2D-Regular' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyText: { fontSize: 15, fontFamily: 'K2D-Regular', color: '#999', textAlign: 'center', marginTop: 12 },
  repItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  selectedRepItem: { backgroundColor: '#f0f5ff' },
  repItemContent: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  repAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  repAvatarText: { fontSize: 16, fontFamily: 'K2D-SemiBold', color: '#fff' },
  repDetails: { flex: 1 },
  repName: { fontSize: 15, fontFamily: 'K2D-SemiBold', color: '#333' },
  repEmail: { fontSize: 12, color: '#666', fontFamily: 'K2D-Regular', marginTop: 2 },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxxxl },
  retryButton: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: 0, borderRadius: Layout.borderRadius.md, height: 48, justifyContent: 'center' },
  retryButtonText: { color: Colors.textInverse, fontSize: Typography.fontSize.small, fontFamily: Typography.fontFamily.semiBold },
});

export default LeadEdit;