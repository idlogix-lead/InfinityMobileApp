// screens/CRM/AddSaleOppor.js – Table‑like form with bottom borders only
// All fields have uniform height and only bottom border, matching the "table" feel.

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  StatusBar,
  ActivityIndicator,
  Modal,
  FlatList,
  Pressable,
  Platform,
  SafeAreaView,
  StatusBar as RNStatusBar,
} from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import { useAuthStore } from '../../store/authStore';
import { useCreateSalesOpportunity } from '../../hooks/CRMhooks/useCRM';
import { useSalesRepresentatives } from '../../hooks/CRMhooks/useCRM';
import theme from '../../constants/CRMTheme/CRMTheme';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CalendarModal from '../../components/RequestScreenComponents/Calendar/CalendarModal';
import moment from 'moment';
import CustomAlert from '../../components/CustomAlert';

const { Colors, Typography, Layout, Spacing } = theme;
const { scale, verticalScale } = Layout;

// ============================================
// UI COMPONENTS (with labels, bottom borders only)
// ============================================

const FormInput = React.memo(({ label, required, value, onChangeText, error, keyboardType, autoCapitalize, containerStyle, inputStyle }) => (
  <View style={[styles.fieldContainer, containerStyle]}>
    <Text style={styles.fieldLabel}>
      {label}
      {required && <Text style={styles.requiredStar}> *</Text>}
    </Text>
    <View style={[styles.inputWrapper, error && styles.inputError]}>
      <TextInput
        style={[styles.input, inputStyle]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        placeholderTextColor={Colors.textTertiary}
      />
    </View>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
));

const ReadOnlyField = React.memo(({ label, value, icon, containerStyle }) => (
  <View style={[styles.fieldContainer, containerStyle]}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={[styles.inputWrapper, styles.readOnlyWrapper]}>
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={Layout.iconSize.sm}
          color={Colors.textSecondary}
          style={styles.inputIcon}
        />
      )}
      <Text style={[styles.readOnlyText, icon && { paddingLeft: Spacing.xs }]}>
        {value || 'Not provided'}
      </Text>
    </View>
  </View>
));

const ContactDisplay = React.memo(({ leadData, containerStyle }) => {
  const getContactDisplayName = () => {
    if (!leadData) return 'No lead data';
    if (leadData.companyName && leadData.name) {
      return `${leadData.name} (${leadData.companyName})`;
    }
    if (leadData.companyName) return leadData.companyName;
    if (leadData.name) return leadData.name;
    return 'Lead Contact';
  };

  const getContactDetails = () => {
    const details = [];
    if (leadData?.email) details.push(leadData.email);
    if (leadData?.phone) details.push(leadData.phone);
    return details.join(' • ');
  };

  return (
    <View style={[styles.fieldContainer, containerStyle]}>
      <Text style={styles.fieldLabel}>Lead Contact</Text>
      <View style={[styles.inputWrapper, styles.readOnlyWrapper, styles.contactWrapper]}>
        <MaterialCommunityIcons
          name="account"
          size={Layout.iconSize.sm}
          color={Colors.primary}
          style={styles.inputIcon}
        />
        <View style={styles.contactContent}>
          <Text style={styles.contactName} numberOfLines={1}>
            {getContactDisplayName()}
          </Text>
          {getContactDetails() ? (
            <Text style={styles.contactDetails} numberOfLines={1}>
              {getContactDetails()}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
});

// Custom picker field with modal and search
const CustomPickerField = React.memo(({ label, required, selectedValue, onValueChange, options, error, containerStyle }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const selectedOption = options.find(opt => opt.value === selectedValue);

  // Filter options based on search text
  const filteredOptions = useMemo(() => {
    if (!searchText.trim()) return options;
    const query = searchText.toLowerCase();
    return options.filter(opt => 
      opt.label.toLowerCase().includes(query)
    );
  }, [options, searchText]);

  const handleSelect = (value) => {
    onValueChange(value);
    setShowModal(false);
    setSearchText('');
  };

  return (
    <View style={[styles.fieldContainer, containerStyle]}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.requiredStar}> *</Text>}
      </Text>
      <TouchableOpacity
        style={[styles.inputWrapper, error && styles.inputError]}
        onPress={() => setShowModal(true)}
        activeOpacity={0.7}
      >
        <View style={styles.chevronWrapper}>
          <Text style={[styles.pickerText, !selectedValue && styles.placeholderText]}>
            {selectedOption ? selectedOption.label : `Select ${label}`}
          </Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={Layout.iconSize.sm}
            color={Colors.textSecondary}
            style={styles.chevronIcon}
          />
        </View>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowModal(false);
          setSearchText('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label}</Text>
              <TouchableOpacity onPress={() => {
                setShowModal(false);
                setSearchText('');
              }}>
                <MaterialCommunityIcons name="close" size={Layout.iconSize.lg} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.modalSearch}>
              <MaterialCommunityIcons
                name="magnify"
                size={Layout.iconSize.sm}
                color={Colors.textSecondary}
              />
              <TextInput
                style={styles.modalSearchInput}
                placeholder={`Search ${label}...`}
                placeholderTextColor={Colors.textTertiary}
                value={searchText}
                onChangeText={setSearchText}
                autoFocus={true}
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={Layout.iconSize.sm}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filteredOptions}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.itemRow, selectedValue === item.value && styles.selectedItemRow]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text style={styles.itemName}>{item.label}</Text>
                  {selectedValue === item.value && (
                    <MaterialCommunityIcons name="check" size={Layout.iconSize.md} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.value.toString()}
              ListEmptyComponent={
                <View style={styles.modalEmpty}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={Layout.iconSize.xl} color={Colors.border} />
                  <Text style={styles.modalEmptyText}>
                    {searchText.trim() ? `No results for "${searchText}"` : 'No options available'}
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
});

const DatePickerField = React.memo(({ label, required, value, onPress, error, containerStyle }) => {
  const formatDate = (date) => {
    if (!date) return '';
    return moment(date).format('DD MMM YYYY');
  };

  return (
    <View style={[styles.fieldContainer, containerStyle]}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.requiredStar}> *</Text>}
      </Text>
      <TouchableOpacity
        style={[styles.inputWrapper, error && styles.inputError]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={[styles.dateText, !value && styles.placeholderText]}>
          {value ? formatDate(value) : 'Select date'}
        </Text>
        <MaterialCommunityIcons
          name="calendar-month"
          size={Layout.iconSize.sm}
          color={Colors.textSecondary}
          style={styles.dateIcon}
        />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

const SwitchRow = React.memo(({ label, value, onValueChange, disabled, containerStyle }) => (
  <View style={[styles.switchRow, containerStyle]}>
    <Text style={styles.switchLabel}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: Colors.border, true: Colors.primary }}
      thumbColor={Colors.backgroundLight}
    />
  </View>
));

const BusinessPartnerSelector = React.memo(({ selectedBPName, error, onPress, onClear, containerStyle }) => (
  <View style={[styles.fieldContainer, containerStyle]}>
    <Text style={styles.fieldLabel}>
      Business Partner <Text style={styles.requiredStar}>*</Text>
    </Text>
    <TouchableOpacity
      style={[styles.inputWrapper, error && styles.inputError]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {selectedBPName ? (
        <View style={styles.selectedItemContainer}>
          <View style={styles.selectedItemInfo}>
            <MaterialCommunityIcons
              name="domain"
              size={Layout.iconSize.sm}
              color={Colors.primary}
            />
            <Text style={styles.selectedItemText} numberOfLines={1}>
              {selectedBPName}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={(e) => {
              e.stopPropagation();
              onClear();
            }}
          >
            <MaterialCommunityIcons
              name="close-circle"
              size={Layout.iconSize.sm}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.chevronWrapper}>
          <Text style={styles.placeholderText}>Select Business Partner</Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={Layout.iconSize.sm}
            color={Colors.textSecondary}
            style={styles.chevronIcon}
          />
        </View>
      )}
    </TouchableOpacity>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
));

const ErrorRetry = ({ message, onRetry, containerStyle }) => (
  <View style={[styles.errorContainer, containerStyle]}>
    <MaterialCommunityIcons
      name="alert-circle"
      size={Layout.iconSize.sm}
      color={Colors.error}
    />
    <Text style={styles.errorRetryText}>{message}</Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryButtonText}>Retry</Text>
    </TouchableOpacity>
  </View>
);

// ============================================
// MAIN COMPONENT
// ============================================
const AddSaleOppor = ({ navigation, route }) => {
  const { leadData, followupData, mode } = route.params || {};

  console.log(
    '📦 AddSaleOppor - Received leadData:',
    leadData
      ? JSON.stringify({
          id: leadData.id,
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone,
          companyName: leadData.companyName,
          businessPartnerId: leadData.businessPartnerId,
          businessPartnerName: leadData.businessPartnerName,
          userId: leadData.userId,
          salesRepId: leadData.salesRepId,
        })
      : 'No'
  );

  const createOpportunity = useCreateSalesOpportunity();

  /* ---------------- AUTH STORE ---------------- */
  const authState = useAuthStore();
  const userId = authState?.userId;
  const userName = authState?.userName;
  const clientId = authState?.clientId;
  const clientName = authState?.clientName;
  const organizationId = authState?.organizationId;
  const organizationName = authState?.organizationName;

  /* ---------------- CUSTOM ALERT STATE ---------------- */
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

  /* ---------------- LOADING STATES ---------------- */
  const [isLoadingStages, setIsLoadingStages] = useState(true);
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(true);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);
  const [isLoadingBusinessPartners, setIsLoadingBusinessPartners] = useState(true);

  const [stagesError, setStagesError] = useState(null);
  const [currenciesError, setCurrenciesError] = useState(null);
  const [campaignsError, setCampaignsError] = useState(null);
  const [businessPartnersError, setBusinessPartnersError] = useState(null);

  /* ---------------- DATA STATES ---------------- */
  const [stages, setStages] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [businessPartnersData, setBusinessPartnersData] = useState([]);

  /* ---------------- OPPORTUNITY STATE ---------------- */
  const [selectedBPId, setSelectedBPId] = useState(null);
  const [selectedBPName, setSelectedBPName] = useState('');
  const [showBPModal, setShowBPModal] = useState(false);
  const [bpSearch, setBpSearch] = useState('');

  const [bpContacts, setBpContacts] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [amount, setAmount] = useState('');

  /* ---------------- SALES STAGE ---------------- */
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [probability, setProbability] = useState('');

  /* ---------------- CURRENCY ---------------- */
  const [selectedCurrencyId, setSelectedCurrencyId] = useState(null);

  /* ---------------- CAMPAIGNS ---------------- */
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  /* ---------------- SALES REP ---------------- */
  const [showSalesRepModal, setShowSalesRepModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSalesRepId, setSelectedSalesRepId] = useState(null);
  const [selectedSalesRepName, setSelectedSalesRepName] = useState('');
  const [initialRepSet, setInitialRepSet] = useState(false);

  /* ---------------- UI STATE ---------------- */
  const [showCalendar, setShowCalendar] = useState(false);
  const [active] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: salesReps = [],
    isLoading: loadingSalesReps,
    error: salesRepsError,
  } = useSalesRepresentatives(true);

  const showAlert = (title, message, type = 'info', onConfirm = null, onCancel = null) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      onConfirm: onConfirm || (() => setAlertConfig((prev) => ({ ...prev, visible: false }))),
      onCancel: onCancel || (() => setAlertConfig((prev) => ({ ...prev, visible: false }))),
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
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  // ============================================
  // FETCH ALL DATA ON MOUNT
  // ============================================
  useEffect(() => {
    console.log('🚀 AddSaleOppor mounted - fetching all data');

    const fetchAllData = async () => {
      try {
        await Promise.all([
          fetchStages(),
          fetchCurrencies(),
          fetchCampaigns(),
          fetchBusinessPartners(),
        ]);
        console.log('✅ All data fetched successfully');
      } catch (error) {
        console.error('❌ Error fetching initial data:', error);
      }
    };

    fetchAllData();
  }, []);

  // Set default sales rep to current user (for new opportunities)
  useEffect(() => {
    if (mode !== 'edit' && !initialRepSet && salesReps.length > 0 && userId && !selectedSalesRepId) {
      console.log('🎯 AddSaleOppor - Setting default sales rep to current user:', userId);
      console.log('Current user name from auth:', userName);

      const currentUserAsRep = salesReps.find((rep) => rep.id === parseInt(userId));

      if (currentUserAsRep) {
        console.log('✅ Found current user in sales reps list:', currentUserAsRep.Name);
        setSelectedSalesRepId(currentUserAsRep.id);
        setSelectedSalesRepName(currentUserAsRep.Name);
        setInitialRepSet(true);
      } else {
        console.log('⚠️ Current user not found in sales reps list, looking by name...');

        const userByName = salesReps.find(
          (rep) => rep.Name && rep.Name.toLowerCase() === userName?.toLowerCase()
        );

        if (userByName) {
          console.log('✅ Found current user by name:', userByName.Name);
          setSelectedSalesRepId(userByName.id);
          setSelectedSalesRepName(userByName.Name);
          setInitialRepSet(true);
        } else {
          console.log('❌ Could not find current user in sales reps list');
          console.log(
            'Auth User:',
            { id: userId, name: userName }
          );
          console.log(
            'Available sales reps:',
            salesReps.map((r) => ({ id: r.id, name: r.Name }))
          );
        }
      }
    }
  }, [mode, salesReps, userId, userName, selectedSalesRepId, initialRepSet]);

  // Set default currency to PKR when currencies are loaded and no selection exists
  useEffect(() => {
    if (currencies.length > 0 && !selectedCurrencyId) {
      const defaultCurrency = currencies.find((c) => c.ISO_Code === 'PKR' || c.id === '306');
      if (defaultCurrency) {
        console.log('💰 Setting default currency to PKR:', defaultCurrency.id);
        setSelectedCurrencyId(defaultCurrency.id);
      } else {
        console.log('⚠️ PKR not found, falling back to first currency');
        setSelectedCurrencyId(currencies[0]?.id);
      }
    }
  }, [currencies, selectedCurrencyId]);

  // Initialize from leadData (if any)
  useEffect(() => {
    if (leadData) {
      console.log('🔄 Initializing from leadData');

      if (leadData.businessPartnerId) {
        console.log('✅ Setting business partner ID:', leadData.businessPartnerId);
        console.log('✅ Setting business partner Name:', leadData.businessPartnerName);

        setSelectedBPId(leadData.businessPartnerId);
        setSelectedBPName(leadData.businessPartnerName || leadData.companyName || '');

        if (leadData.businessPartnerId) {
          fetchBpUsers(leadData.businessPartnerId);
        }
      }

      if (leadData.userId) {
        console.log('✅ Setting user ID from leadData.userId:', leadData.userId);
        setSelectedUserId(leadData.userId);
      } else if (leadData.id) {
        console.log('✅ Setting user ID from leadData.id:', leadData.id);
        setSelectedUserId(leadData.id);
      }

      if (leadData.salesRepId && mode === 'edit') {
        console.log('✅ Setting sales rep ID from leadData:', leadData.salesRepId);
        setSelectedSalesRepId(leadData.salesRepId);
        setSelectedSalesRepName(leadData.salesRepLabel || '');
        setInitialRepSet(true);
      }

      // If leadData has a currency, we might override the default PKR
      if (leadData.currencyId) {
        setSelectedCurrencyId(leadData.currencyId);
      }
    }
  }, [leadData, mode]);

  // Clear BP error when selected
  useEffect(() => {
    if (selectedBPId) {
      setErrors((prev) => ({ ...prev, bp: null }));
    }
  }, [selectedBPId]);

  // ============================================
  // API HELPER FUNCTIONS
  // ============================================
  const makeAuthenticatedRequest = async (url, options = {}) => {
    const token = authState?.token;
    if (!token) {
      throw new Error('Authentication token missing');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }

      console.error('API Request Failed:', error.message);
      throw error;
    }
  };

  const buildApiUrl = (endpoint, filter = '') => {
    const serverConfig = authState?.serverConfig;
    if (!serverConfig?.protocol || !serverConfig?.host || !serverConfig?.port) {
      throw new Error('Server configuration missing');
    }
    const baseUrl = `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.port}/api/v1`;
    const url = `${baseUrl}/${endpoint}`;
    return filter ? `${url}?$filter=${encodeURIComponent(filter)}` : url;
  };

  // ============================================
  // FETCH FUNCTIONS WITH ERROR HANDLING
  // ============================================
  const fetchStages = async () => {
    setIsLoadingStages(true);
    setStagesError(null);

    try {
      const url = buildApiUrl('models/C_SalesStage');
      console.log('🔍 Fetching stages from:', url);
      const data = await makeAuthenticatedRequest(url);
      const records = data.records || [];
      console.log(`✅ Loaded ${records.length} stages`);
      setStages(records);
    } catch (error) {
      console.error('❌ Stages fetch error:', error.message);
      setStagesError(error.message);
    } finally {
      setIsLoadingStages(false);
    }
  };

  const fetchCurrencies = async () => {
    setIsLoadingCurrencies(true);
    setCurrenciesError(null);

    try {
      const url = buildApiUrl('models/C_Currency');
      console.log('🔍 Fetching currencies from:', url);
      const data = await makeAuthenticatedRequest(url);
      const records = data.records || [];
      console.log(`✅ Loaded ${records.length} currencies`);
      setCurrencies(records);
    } catch (error) {
      console.error('❌ Currencies fetch error:', error.message);
      setCurrenciesError(error.message);
    } finally {
      setIsLoadingCurrencies(false);
    }
  };

  const fetchCampaigns = async () => {
    setIsLoadingCampaigns(true);
    setCampaignsError(null);

    try {
      const url = buildApiUrl('models/C_Campaign');
      console.log('🔍 Fetching campaigns from:', url);
      const data = await makeAuthenticatedRequest(url);
      const records = data.records || [];
      console.log(`✅ Loaded ${records.length} campaigns`);
      setCampaigns(records);
    } catch (error) {
      console.error('❌ Campaigns fetch error:', error.message);
      setCampaignsError(error.message);
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  const fetchBusinessPartners = async () => {
    setIsLoadingBusinessPartners(true);
    setBusinessPartnersError(null);

    try {
      const url = buildApiUrl('models/C_BPartner');
      console.log('🔍 Fetching business partners from:', url);
      const data = await makeAuthenticatedRequest(url);
      const records = data.records || [];
      console.log(`✅ Loaded ${records.length} business partners`);
      setBusinessPartnersData(records);
    } catch (error) {
      console.error('❌ Business partners fetch error:', error.message);
      setBusinessPartnersError(error.message);
    } finally {
      setIsLoadingBusinessPartners(false);
    }
  };

  const fetchBusinessPartnerDetails = async (bpId) => {
    if (!bpId) return;

    try {
      const url = buildApiUrl(`models/C_BPartner/${bpId}`);
      const data = await makeAuthenticatedRequest(url);
      if (data) {
        setSelectedBPName(data.Name || '');
        setErrors((prev) => ({ ...prev, bp: null }));
      }
    } catch (error) {
      console.log('BP fetch error', error.message);
    }
  };

  // ============================================
  // Fetch BP users and auto-select contact person
  // ============================================
  const fetchBpUsers = async (bpId) => {
    if (!bpId) return;
    try {
      console.log('🔍 Fetching users for BP:', bpId);
      const url = buildApiUrl('models/AD_User', `C_BPartner_ID eq ${bpId}`);
      const data = await makeAuthenticatedRequest(url);
      const users = data.records || [];
      console.log(`✅ Found ${users.length} users for BP ${bpId}`);
      setBpContacts(users);

      // Auto-select logic: if leadData provides a userId that exists in the list, use it.
      // Otherwise, select the first contact (if any).
      if (users.length > 0) {
        if (leadData?.userId && users.some(u => u.id === leadData.userId)) {
          setSelectedUserId(leadData.userId);
        } else {
          setSelectedUserId(users[0].id);
        }
      } else {
        setSelectedUserId(null);
      }
    } catch (error) {
      console.log('BP users fetch error', error.message);
    }
  };

  // ============================================
  // FILTERED DATA
  // ============================================
  const filteredBusinessPartners = useMemo(() => {
    if (!bpSearch.trim()) {
      return businessPartnersData;
    }
    const query = bpSearch.toLowerCase();
    return businessPartnersData.filter((bp) => bp.Name && bp.Name.toLowerCase().includes(query));
  }, [businessPartnersData, bpSearch]);

  const filteredSalesReps = useMemo(() => {
    if (!searchQuery.trim()) {
      return salesReps;
    }
    const query = searchQuery.toLowerCase();
    return salesReps.filter((rep) => rep.Name && rep.Name.toLowerCase().includes(query));
  }, [salesReps, searchQuery]);

  const selectedRepName = useMemo(() => {
    if (!selectedSalesRepId) return '';
    const rep = salesReps.find((r) => r.id === selectedSalesRepId);
    return rep ? rep.Name : selectedSalesRepName;
  }, [selectedSalesRepId, salesReps, selectedSalesRepName]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleSelectSalesRep = useCallback((rep) => {
    setSelectedSalesRepId(rep.id);
    setSelectedSalesRepName(rep.Name);
    setShowSalesRepModal(false);
    setSearchQuery('');
    setErrors((prev) => ({ ...prev, salesRep: null }));
    setInitialRepSet(true);
  }, []);

  const handleClearSalesRep = useCallback(() => {
    setSelectedSalesRepId(null);
    setSelectedSalesRepName('');
    setInitialRepSet(false);
  }, []);

  const handleSelectBusinessPartner = useCallback((bp) => {
    console.log('✅ Selected business partner:', bp.id, bp.Name);
    setSelectedBPId(bp.id);
    setSelectedBPName(bp.Name);
    setShowBPModal(false);
    setBpSearch('');
    fetchBpUsers(bp.id);
    setErrors((prev) => ({ ...prev, bp: null }));
  }, []);

  const handleClearBusinessPartner = useCallback(() => {
    setSelectedBPId(null);
    setSelectedBPName('');
    setBpContacts([]);
    setSelectedUserId(null);
  }, []);

  const handleStageChange = useCallback(
    (id) => {
      setSelectedStageId(id);
      const stage = stages.find((s) => s.id === id);
      if (stage?.Probability) {
        setProbability(stage.Probability.toString());
      } else {
        setProbability('');
      }
      setErrors((prev) => ({ ...prev, stage: null }));
    },
    [stages]
  );

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    const e = {};

    if (!selectedBPId) {
      e.bp = 'Business Partner is required';
    }

    if (!selectedStageId) e.stage = 'Sales Stage is required';
    if (!expectedCloseDate) e.date = 'Expected Close Date is required';
    if (!amount) e.amount = 'Opportunity Amount is required';
    if (!selectedCurrencyId) e.currency = 'Currency is required';
    if (!selectedSalesRepId) e.salesRep = 'Sales Representative is required';
    if (amount && isNaN(Number(amount))) e.amount = 'Amount must be a valid number';

    setErrors(e);

    if (Object.keys(e).length) {
      console.log('❌ Validation errors:', e);
      showValidationAlert('Please fill in all required fields');
      return false;
    }
    return true;
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    console.log('📝 Submitting form with selectedBPId:', selectedBPId);
    console.log('📝 Selected User ID:', selectedUserId);
    console.log('📝 Selected Sales Rep ID:', selectedSalesRepId);

    if (!validate()) return;

    setIsSubmitting(true);

    const opportunityData = {
      AD_Client_ID: { id: clientId },
      AD_Org_ID: { id: organizationId },
      AD_User_ID: { id: selectedUserId || userId },
      SalesRep_ID: { id: selectedSalesRepId },
      C_SalesStage_ID: { id: selectedStageId },
      Probability: probability ? Number(probability) : 0,
      ExpectedCloseDate: expectedCloseDate,
      OpportunityAmt: Number(amount),
      C_Currency_ID: { id: selectedCurrencyId },
      IsActive: active,
    };

    if (selectedBPId) {
      opportunityData.C_BPartner_ID = { id: selectedBPId };
    }

    if (selectedCampaign) {
      opportunityData.C_Campaign_ID = { id: selectedCampaign };
    }

    console.log('Sending opportunity data with user ID:', opportunityData.AD_User_ID.id);
    console.log('Sending opportunity data with sales rep ID:', opportunityData.SalesRep_ID.id);

    try {
      const result = await createOpportunity.mutateAsync(opportunityData);
      console.log('✅ Success result:', result);
      showSuccessAlert('Sales Opportunity created successfully!', () => {
        hideAlert();
        navigation.goBack();
      });
    } catch (error) {
      console.error('❌ Create opportunity error:', error);

      let errorMessage = 'Failed to create opportunity';
      if (error.message) {
        errorMessage = error.message;
      }

      showErrorAlert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBusinessPartnerItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={[styles.itemRow, selectedBPId === item.id && styles.selectedItemRow]}
        onPress={() => handleSelectBusinessPartner(item)}
        activeOpacity={0.7}
      >
        <View style={styles.itemContent}>
          <View style={styles.itemAvatar}>
            <Text style={styles.itemAvatarText}>
              {item.Name?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.itemDetails}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.Name}
            </Text>
            {item.Value && <Text style={styles.itemSubtext}>Code: {item.Value}</Text>}
          </View>
        </View>
        {selectedBPId === item.id && (
          <MaterialCommunityIcons
            name="check-circle"
            size={Layout.iconSize.md}
            color={Colors.primary}
          />
        )}
      </TouchableOpacity>
    ),
    [selectedBPId, handleSelectBusinessPartner]
  );

  const renderSalesRepItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={[styles.repItem, selectedSalesRepId === item.id && styles.selectedRepItem]}
        onPress={() => handleSelectSalesRep(item)}
        activeOpacity={0.7}
      >
        <View style={styles.repItemContent}>
          <Text style={styles.repName}>{item.Name}</Text>
          {item.EMail && <Text style={styles.repEmail}>{item.EMail}</Text>}
          {item.id === parseInt(userId) && (
            <Text style={styles.currentUserBadge}>(You)</Text>
          )}
        </View>
        {selectedSalesRepId === item.id && (
          <MaterialCommunityIcons name="check" size={20} color={Colors.primary} />
        )}
      </TouchableOpacity>
    ),
    [selectedSalesRepId, handleSelectSalesRep, userId]
  );

  const isLoading =
    isLoadingStages || isLoadingCurrencies || isLoadingCampaigns || loadingSalesReps || isLoadingBusinessPartners;
  const hasError =
    stagesError || currenciesError || campaignsError || salesRepsError || businessPartnersError;

  if (hasError && !isLoading) {
    return (
      <>
        <StatusBar translucent backgroundColor="transparent" />
        <CustomHeader title="Add Sale Opportunity" LeftIcon="arrow-left" LeftPress={() => navigation.goBack()} />
        <View style={styles.fullScreenError}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={Layout.iconSize.xxxl}
            color={Colors.error}
          />
          <Text style={styles.fullScreenErrorText}>Failed to load required data</Text>
          <TouchableOpacity
            style={styles.fullScreenRetryButton}
            onPress={() => {
              setStagesError(null);
              setCurrenciesError(null);
              setCampaignsError(null);
              setBusinessPartnersError(null);
              fetchStages();
              fetchCurrencies();
              fetchCampaigns();
              fetchBusinessPartners();
            }}
          >
            <Text style={styles.fullScreenRetryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  const HeaderWrapper = Platform.OS === 'ios' ? SafeAreaView : View;
  const headerWrapperStyle = Platform.OS === 'android'
    ? { paddingTop: RNStatusBar.currentHeight || 0, backgroundColor: 'transparent' }
    : { backgroundColor: 'transparent' };

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" />
      <HeaderWrapper style={headerWrapperStyle}>
        <CustomHeader title="Add Sale Opportunity" LeftIcon="arrow-left" LeftPress={() => navigation.goBack()} />
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

      <CalendarModal
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onSelectDate={(date) => {
          setExpectedCloseDate(date);
          setErrors((prev) => ({ ...prev, date: null }));
          setShowCalendar(false);
        }}
        title="Select Expected Close Date"
      />

      {/* Business Partner Modal */}
      <Modal
        visible={showBPModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowBPModal(false);
          setBpSearch('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Business Partner</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowBPModal(false);
                  setBpSearch('');
                }}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={Layout.iconSize.lg}
                  color={Colors.textPrimary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearch}>
              <MaterialCommunityIcons
                name="magnify"
                size={Layout.iconSize.sm}
                color={Colors.textSecondary}
              />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search by name..."
                placeholderTextColor={Colors.textTertiary}
                value={bpSearch}
                onChangeText={setBpSearch}
                autoFocus={true}
              />
              {bpSearch.length > 0 && (
                <TouchableOpacity onPress={() => setBpSearch('')}>
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={Layout.iconSize.sm}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>

            {isLoadingBusinessPartners ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.modalLoadingText}>Loading...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredBusinessPartners}
                renderItem={renderBusinessPartnerItem}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                initialNumToRender={20}
                maxToRenderPerBatch={20}
                windowSize={10}
                ListEmptyComponent={
                  <View style={styles.modalEmpty}>
                    <MaterialCommunityIcons
                      name="domain-off"
                      size={Layout.iconSize.xl}
                      color={Colors.border}
                    />
                    <Text style={styles.modalEmptyText}>
                      {bpSearch.trim()
                        ? `No results for "${bpSearch}"`
                        : 'No business partners available'}
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Sales Representative Modal */}
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
                <MaterialCommunityIcons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color={Colors.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name..."
                placeholderTextColor={Colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={true}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearSearchButton}
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={18}
                    color={Colors.textSecondary}
                  />
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
                initialNumToRender={20}
                maxToRenderPerBatch={20}
                windowSize={10}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="account-off" size={50} color={Colors.border} />
                    <Text style={styles.emptyText}>
                      {searchQuery.trim()
                        ? `No sales representatives found for "${searchQuery}"`
                        : 'No sales representatives available'}
                    </Text>
                  </View>
                }
              />
            )}

            <View style={styles.modalFooter}>
              <Text style={styles.footerText}>
                {filteredSalesReps.length} of {salesReps.length} sales representatives
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Main content with ScrollView and fixed submit button */}
      <View style={styles.mainContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Form Card (table‑like border) */}
          <View style={styles.formCard}>
            {/* Business Partner */}
            <BusinessPartnerSelector
              selectedBPName={selectedBPName}
              error={errors.bp}
              onPress={() => setShowBPModal(true)}
              onClear={handleClearBusinessPartner}
              containerStyle={styles.fieldContainer}
            />

            {/* Sales Representative */}
            <View style={[styles.fieldContainer]}>
              <Text style={styles.fieldLabel}>
                Sales Representative <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TouchableOpacity
                style={[styles.inputWrapper, errors.salesRep && styles.inputError]}
                onPress={() => setShowSalesRepModal(true)}
                activeOpacity={0.7}
              >
                {selectedRepName ? (
                  <View style={styles.selectedRepContainer}>
                    <Text style={styles.selectedRepText}>{selectedRepName}</Text>
                    <View style={styles.rightContainer}>
                      <TouchableOpacity
                        style={styles.clearButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleClearSalesRep();
                        }}
                      >
                        <MaterialCommunityIcons
                          name="close-circle"
                          size={14}
                          color={Colors.textSecondary}
                        />
                      </TouchableOpacity>
                      <MaterialCommunityIcons
                        name="chevron-down"
                        size={16}
                        color={Colors.textSecondary}
                        style={styles.chevronIcon}
                      />
                    </View>
                  </View>
                ) : (
                  <View style={styles.chevronWrapper}>
                    <Text style={styles.placeholderText}>Select Sales Representative</Text>
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={20}
                      color={Colors.textSecondary}
                      style={styles.chevronIcon}
                    />
                  </View>
                )}
              </TouchableOpacity>
              {errors.salesRep && <Text style={styles.errorText}>{errors.salesRep}</Text>}
            </View>

            {/* Sales Stage */}
            {isLoadingStages ? (
              <View style={[styles.loaderContainer, styles.fieldContainer]}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : stagesError ? (
              <ErrorRetry message={stagesError} onRetry={fetchStages} containerStyle={styles.fieldContainer} />
            ) : (
              <CustomPickerField
                label="Sales Stage"
                required
                selectedValue={selectedStageId}
                onValueChange={handleStageChange}
                options={stages.map(stage => ({ value: stage.id, label: stage.Name }))}
                error={errors.stage}
                containerStyle={styles.fieldContainer}
              />
            )}

            {/* Probability */}
            <FormInput
              label="Probability (%)"
              value={probability}
              onChangeText={(text) => {
                const filtered = text.replace(/[^0-9.]/g, '');
                setProbability(filtered);
              }}
              keyboardType="numeric"
              containerStyle={styles.fieldContainer}
            />

            {/* Campaign */}
            {isLoadingCampaigns ? (
              <View style={[styles.loaderContainer, styles.fieldContainer]}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : campaignsError ? (
              <ErrorRetry message={campaignsError} onRetry={fetchCampaigns} containerStyle={styles.fieldContainer} />
            ) : (
              <CustomPickerField
                label="Campaign"
                selectedValue={selectedCampaign}
                onValueChange={setSelectedCampaign}
                options={campaigns.map(campaign => ({ value: campaign.id, label: campaign.Name }))}
                containerStyle={styles.fieldContainer}
              />
            )}

            {/* Expected Close Date */}
            <DatePickerField
              label="Expected Close Date"
              required
              value={expectedCloseDate}
              onPress={() => setShowCalendar(true)}
              error={errors.date}
              containerStyle={styles.fieldContainer}
            />

            {/* Opportunity Amount */}
            <FormInput
              label="Opportunity Amount"
              required
              value={amount}
              onChangeText={(v) => {
                setAmount(v);
                setErrors((prev) => ({ ...prev, amount: null }));
              }}
              keyboardType="numeric"
              error={errors.amount}
              containerStyle={styles.fieldContainer}
            />

            {/* Currency */}
            {isLoadingCurrencies ? (
              <View style={[styles.loaderContainer, styles.fieldContainer]}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : currenciesError ? (
              <ErrorRetry message={currenciesError} onRetry={fetchCurrencies} containerStyle={styles.fieldContainer} />
            ) : (
              <CustomPickerField
                label="Currency"
                required
                selectedValue={selectedCurrencyId}
                onValueChange={(value) => {
                  if (value) {
                    setSelectedCurrencyId(value);
                    setErrors((prev) => ({ ...prev, currency: null }));
                  }
                }}
                options={currencies.map(currency => ({ value: currency.id, label: `${currency.ISO_Code} - ${currency.Description || ''}` }))}
                error={errors.currency}
                containerStyle={styles.fieldContainer}
              />
            )}

            {/* Active Switch */}
            <SwitchRow
              label="Active"
              value={active}
              disabled
              containerStyle={styles.fieldContainer}
            />
          </View>

          {/* Info text (like AddLeads) */}
          <Text style={styles.infoText}>Additional information can be updated later.</Text>
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Fixed Submit Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (isSubmitting || isLoading || !selectedSalesRepId) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting || isLoading || !selectedSalesRepId}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={Colors.textInverse} />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="plus-circle"
                  size={Layout.iconSize.md}
                  color={Colors.textInverse}
                />
                <Text style={styles.submitButtonText}>Create Opportunity</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

// ============================================
// STYLES – Only bottom borders on all fields
// ============================================
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  formCard: {
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  fieldContainer: {
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  fieldLabel: {
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.medium,
    letterSpacing: 0.5,
    marginLeft: Spacing.md,
  },
  requiredStar: {
    color: Colors.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.backgroundLight,
    minHeight: 40,
  },
  inputError: {
    borderBottomColor: Colors.error,
    borderBottomWidth: 1.5,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.large,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    padding: 0,
  },
  readOnlyWrapper: {
    backgroundColor: Colors.backgroundLight,
    opacity: 0.9,
  },
  readOnlyText: {
    flex: 1,
    fontSize: Typography.fontSize.large,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },
  contactWrapper: {
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  contactContent: {
    flex: 1,
    paddingLeft: Spacing.sm,
  },
  contactName: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xxs,
  },
  contactDetails: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  dateText: {
    flex: 1,
    fontSize: Typography.fontSize.large,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },
  dateIcon: {
    paddingRight: Spacing.xs,
  },
  placeholderText: {
    fontSize: Typography.fontSize.large,
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily.regular,
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.regular,
    marginTop: Spacing.xxs,
    marginLeft: Spacing.xs,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.md,
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  switchLabel: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loaderContainer: {
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  errorContainer: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.errorLight,
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: Layout.borderRadius.sm,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  errorRetryText: {
    color: Colors.error,
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.regular,
    marginLeft: Spacing.xs,
    flex: 1,
  },
  retryButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    backgroundColor: Colors.error,
    borderRadius: Layout.borderRadius.sm,
  },
  retryButtonText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.semiBold,
  },
  fullScreenError: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xxl,
  },
  fullScreenErrorText: {
    fontSize: Typography.fontSize.h4,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  fullScreenRetryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Layout.borderRadius.md,
  },
  fullScreenRetryButtonText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.semiBold,
  },
  buttonContainer: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Layout.borderRadius.md,
    gap: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.7,
    backgroundColor: Colors.buttonDisabled || '#ccc',
    shadowOpacity: 0.2,
    elevation: 3,
  },
  submitButtonText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.semiBold,
  },
  infoText: {
    fontSize: Typography.fontSize.medium,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.medium,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  selectedItemContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedItemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginRight: Spacing.xs,
  },
  selectedItemText: {
    flex: 1,
    fontSize: Typography.fontSize.large,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.regular,
  },
  clearButton: {
    padding: Spacing.xxs,
  },
  rightContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  selectedRepContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedRepText: {
    fontSize: Typography.fontSize.large,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.regular,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.backgroundLight,
    borderTopLeftRadius: Layout.borderRadius.xl,
    borderTopRightRadius: Layout.borderRadius.xl,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomWidth: 0,
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
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  modalSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.md,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    gap: Spacing.xs,
    height: verticalScale(42),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modalSearchInput: {
    flex: 1,
    height: verticalScale(42),
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    paddingVertical: 0,
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
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  modalEmpty: {
    alignItems: 'center',
    paddingVertical: verticalScale(32),
  },
  modalEmptyText: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  modalFooter: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    alignItems: 'center',
  },
  footerText: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(10),
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  selectedItemRow: {
    backgroundColor: Colors.infoLight,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemAvatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  itemAvatarText: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textInverse,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xxs,
  },
  itemSubtext: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  repItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(12),
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  selectedRepItem: {
    backgroundColor: Colors.infoLight,
  },
  repItemContent: {
    flex: 1,
  },
  repName: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  repEmail: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
  },
  currentUserBadge: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
    marginTop: Spacing.xxs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.md,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    gap: Spacing.xs,
    height: verticalScale(42),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: verticalScale(42),
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  clearSearchButton: {
    padding: Spacing.xxs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(40),
    paddingHorizontal: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  // New styles for consistent chevron alignment
  chevronWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chevronIcon: {
    marginRight: Spacing.sm, // Same as right padding of picker
  },
  pickerText: {
    flex: 1,
    fontSize: Typography.fontSize.large,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },
});

export default AddSaleOppor;