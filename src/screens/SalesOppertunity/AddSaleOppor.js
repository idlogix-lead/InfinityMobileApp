// screens/CRM/AddSaleOppor.js - FIXED VERSION WITH PROPER USER MAPPING

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
  StatusBar,
  ActivityIndicator,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import { Picker } from '@react-native-picker/picker';
import { useAuthStore } from '../../store/authStore';
import { useCreateSalesOpportunity } from '../../hooks/CRMhooks/useCRM';
import { useSalesRepresentatives } from '../../services/CRMAPI/useLead';
import theme from '../../constants/CRMTheme/CRMTheme';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CalendarModal from '../../components/RequestScreenComponents/Calendar/CalendarModal';
import moment from 'moment';

const { Colors, Typography, Layout, Spacing } = theme;
const { scale, verticalScale } = Layout;

// ============================================
// MOVE UI COMPONENTS OUTSIDE MAIN COMPONENT
// ============================================

const Label = ({ title, required }) => (
  <Text style={styles.label}>
    {title}
    {required && <Text style={styles.requiredStar}> *</Text>}
  </Text>
);

// FIXED: Memoize Input component to prevent unnecessary re-renders
const Input = React.memo(({ error, icon, ...props }) => (
  <View>
    <View style={[styles.inputContainer, error && styles.inputError]}>
      {icon && (
        <MaterialCommunityIcons 
          name={icon} 
          size={Layout.iconSize.sm} 
          color={Colors.textSecondary} 
          style={styles.inputIcon}
        />
      )}
      <TextInput
        {...props}
        placeholderTextColor={Colors.textTertiary}
        style={[styles.input, icon && styles.inputWithIcon]}
      />
    </View>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
));

const ReadOnly = ({ value, icon }) => (
  <View style={[styles.inputContainer, styles.readOnlyContainer]}>
    {icon && (
      <MaterialCommunityIcons 
        name={icon} 
        size={Layout.iconSize.sm} 
        color={Colors.textSecondary} 
        style={styles.inputIcon}
      />
    )}
    <Text style={[styles.readOnlyText, icon && styles.inputWithIcon]}>{value || 'Not provided'}</Text>
  </View>
);

// FIXED: Contact Display Component - Shows user name from API
const ContactDisplay = ({ leadData }) => {
  const getContactDisplayName = () => {
    if (!leadData) return 'No lead data';
    
    // From your API response, the user has a "Name" field
    if (leadData.Name) {
      // If we have company information, show both
      if (leadData.C_BPartner_ID?.identifier) {
        return `${leadData.Name} (${leadData.C_BPartner_ID.identifier})`;
      }
      return leadData.Name;
    }
    
    // Fallback to other fields
    if (leadData.companyName && leadData.name) {
      return `${leadData.name} (${leadData.companyName})`;
    }
    if (leadData.companyName) {
      return leadData.companyName;
    }
    if (leadData.name) {
      return leadData.name;
    }
    return 'Lead Contact';
  };

  const getContactDetails = () => {
    const details = [];
    // Check for email in various possible locations
    if (leadData?.EMail) details.push(leadData.EMail);
    if (leadData?.email) details.push(leadData.email);
    
    // Check for phone in various possible locations
    if (leadData?.Phone) details.push(leadData.Phone);
    if (leadData?.phone) details.push(leadData.phone);
    
    return details.join(' • ');
  };

  return (
    <View style={[styles.inputContainer, styles.readOnlyContainer, styles.contactContainer]}>
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
  );
};

const PickerField = ({ selectedValue, onValueChange, children, error, icon, placeholder }) => (
  <View>
    <View style={[styles.pickerContainer, error && styles.inputError]}>
      {icon && (
        <MaterialCommunityIcons 
          name={icon} 
          size={Layout.iconSize.sm} 
          color={Colors.textSecondary} 
          style={styles.pickerIcon}
        />
      )}
      <Picker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={[styles.picker, icon && styles.pickerWithIcon]}
        dropdownIconColor={Colors.textSecondary}
      >
        {placeholder && (
          <Picker.Item 
            label={placeholder} 
            value={null} 
            color={Colors.textTertiary}
          />
        )}
        {children}
      </Picker>
    </View>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const DatePickerField = ({ value, onPress, error, icon }) => {
  const formatDate = (date) => {
    if (!date) return '';
    return moment(date).format('DD MMM YYYY');
  };

  return (
    <View>
      <TouchableOpacity 
        style={[styles.inputContainer, error && styles.inputError]} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        {icon && (
          <MaterialCommunityIcons 
            name={icon} 
            size={Layout.iconSize.sm} 
            color={Colors.textSecondary} 
            style={styles.inputIcon}
          />
        )}
        <Text style={[styles.dateText, icon && styles.inputWithIcon]}>
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
};

const SwitchRow = ({ label, value, onValueChange, disabled }) => (
  <View style={styles.switchRow}>
    <Text style={styles.switchLabel}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: Colors.border, true: Colors.primary }}
      thumbColor={Colors.backgroundLight}
    />
  </View>
);

// Business Partner Selector Component
const BusinessPartnerSelector = ({ selectedBPName, error, onPress, onClear }) => (
  <View style={styles.editField}>
    <View style={styles.labelContainer}>
      <Text style={styles.label}>Business Partner</Text>
      <Text style={styles.requiredStar}> *</Text>
    </View>
    <TouchableOpacity
      style={[
        styles.selector,
        error && styles.selectorError,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {selectedBPName ? (
        <View style={styles.selectedItemContainer}>
          <View style={styles.selectedItemInfo}>
            <MaterialCommunityIcons name="domain" size={Layout.iconSize.sm} color={Colors.primary} />
            <Text style={styles.selectedItemText} numberOfLines={1}>{selectedBPName}</Text>
          </View>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={(e) => {
              e.stopPropagation();
              onClear();
            }}
          >
            <MaterialCommunityIcons name="close-circle" size={Layout.iconSize.sm} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.placeholderText}>Select Business Partner</Text>
          <MaterialCommunityIcons name="chevron-down" size={Layout.iconSize.sm} color={Colors.textSecondary} />
        </>
      )}
    </TouchableOpacity>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

// Sales Rep Selector Component
const SalesRepSelector = ({ selectedSalesRepName, error, onPress, onClear }) => (
  <View style={styles.editField}>
    <View style={styles.labelContainer}>
      <Text style={styles.label}>Sales Representative</Text>
      <Text style={styles.requiredStar}> *</Text>
    </View>
    <TouchableOpacity
      style={[
        styles.selector,
        error && styles.selectorError,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {selectedSalesRepName ? (
        <View style={styles.selectedItemContainer}>
          <View style={styles.selectedItemInfo}>
            <MaterialCommunityIcons name="account-tie" size={Layout.iconSize.sm} color={Colors.primary} />
            <Text style={styles.selectedItemText} numberOfLines={1}>{selectedSalesRepName}</Text>
          </View>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={(e) => {
              e.stopPropagation();
              onClear();
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
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

// Error Retry Component
const ErrorRetry = ({ message, onRetry }) => (
  <View style={styles.errorContainer}>
    <MaterialCommunityIcons name="alert-circle" size={Layout.iconSize.sm} color={Colors.error} />
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
  // Get params from route
  const { leadData, followupData, mode } = route.params || {};
  
  // Log the incoming leadData for debugging
  console.log('📦 AddSaleOppor - Received leadData:', leadData ? JSON.stringify({
    id: leadData.id,
    Name: leadData.Name,
    EMail: leadData.EMail,
    Phone: leadData.Phone,
    C_BPartner_ID: leadData.C_BPartner_ID,
    model: leadData['model-name']
  }) : 'No');
  
  const createOpportunity = useCreateSalesOpportunity();
  
  /* ---------------- AUTH STORE ---------------- */
  const authState = useAuthStore();
  const userId = authState?.userId;
  const clientId = authState?.clientId;
  const clientName = authState?.clientName;
  const organizationId = authState?.organizationId;
  const organizationName = authState?.organizationName;

  /* ---------------- LOADING STATES ---------------- */
  const [isLoadingStages, setIsLoadingStages] = useState(true);
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(true);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);
  const [isLoadingSalesReps, setIsLoadingSalesReps] = useState(true);
  const [isLoadingBusinessPartners, setIsLoadingBusinessPartners] = useState(true);
  
  const [stagesError, setStagesError] = useState(null);
  const [currenciesError, setCurrenciesError] = useState(null);
  const [campaignsError, setCampaignsError] = useState(null);
  const [salesRepsError, setSalesRepsError] = useState(null);
  const [businessPartnersError, setBusinessPartnersError] = useState(null);

  /* ---------------- DATA STATES ---------------- */
  const [stages, setStages] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [salesRepsData, setSalesRepsData] = useState([]);
  const [businessPartnersData, setBusinessPartnersData] = useState([]);

  /* ---------------- OPPORTUNITY STATE ---------------- */
  // Business Partner State with Modal
  const [selectedBPId, setSelectedBPId] = useState(null);
  const [selectedBPName, setSelectedBPName] = useState('');
  const [showBPModal, setShowBPModal] = useState(false);
  const [bpSearch, setBpSearch] = useState('');

  const [bpContacts, setBpContacts] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [documentNo, setDocumentNo] = useState('');
  const [description, setDescription] = useState('');
  const [comments, setComments] = useState('');

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

  /* ---------------- UI STATE ---------------- */
  const [showCalendar, setShowCalendar] = useState(false);
  const [active] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          fetchSalesRepresentatives(),
          fetchBusinessPartners()
        ]);
        console.log('✅ All data fetched successfully');
      } catch (error) {
        console.error('❌ Error fetching initial data:', error);
      }
    };
    
    fetchAllData();
    setDocumentNo('Auto Generated');
  }, []);

  // Initialize from leadData after data is loaded
  useEffect(() => {
    if (leadData) {
      console.log('🔄 Initializing from leadData');
      
      // Set Business Partner FIRST
      if (leadData.C_BPartner_ID?.id) {
        console.log('✅ Setting business partner ID:', leadData.C_BPartner_ID.id);
        console.log('✅ Setting business partner Name:', leadData.C_BPartner_ID.identifier);
        
        setSelectedBPId(leadData.C_BPartner_ID.id);
        setSelectedBPName(leadData.C_BPartner_ID.identifier || '');
        
        // Fetch BP contacts for this business partner
        if (leadData.C_BPartner_ID.id) {
          fetchBpUsers(leadData.C_BPartner_ID.id);
        }
      }
      
      // FIXED: Set User/Contact from lead data using the correct field names
      // In your API response, the user's ID is in the 'id' field
      if (leadData.id) {
        console.log('✅ Setting user ID from leadData.id:', leadData.id);
        setSelectedUserId(leadData.id);
      }
      
      // Set Description
      if (followupData?.description) {
        setDescription(followupData.description);
      } else if (leadData.Description) {
        setDescription(leadData.Description);
      } else if (leadData.Name) {
        setDescription(`Opportunity from user: ${leadData.Name}`);
      }
      
      // Set Comments
      if (leadData.Comments) {
        setComments(leadData.Comments);
      }
      
      // Set Sales Rep - In your data, sales rep might be in CreatedBy or UpdatedBy
      if (leadData.SalesRep_ID?.id) {
        console.log('✅ Setting sales rep ID from SalesRep_ID:', leadData.SalesRep_ID.id);
        setSelectedSalesRepId(leadData.SalesRep_ID.id);
        setSelectedSalesRepName(leadData.SalesRep_ID.identifier || '');
      } else if (leadData.CreatedBy?.id) {
        console.log('✅ Setting sales rep ID from CreatedBy:', leadData.CreatedBy.id);
        setSelectedSalesRepId(leadData.CreatedBy.id);
        setSelectedSalesRepName(leadData.CreatedBy.identifier || '');
      }
      
      // Set default currency (PKR - 306) if available
      if (currencies.length > 0) {
        const defaultCurrency = currencies.find(c => c.ISO_Code === 'PKR' || c.id === '306');
        if (defaultCurrency) {
          setSelectedCurrencyId(defaultCurrency.id);
        }
      }
    }
  }, [leadData, followupData]);

  // Separate effect to handle when currencies load after leadData is set
  useEffect(() => {
    if (leadData && currencies.length > 0 && !selectedCurrencyId) {
      const defaultCurrency = currencies.find(c => c.ISO_Code === 'PKR' || c.id === '306');
      if (defaultCurrency) {
        setSelectedCurrencyId(defaultCurrency.id);
      }
    }
  }, [currencies, leadData]);

  // Clear BP error on mount if we have pre-filled data
  useEffect(() => {
    if (selectedBPId) {
      setErrors(prev => ({ ...prev, bp: null }));
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
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
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

  const fetchSalesRepresentatives = async () => {
    setIsLoadingSalesReps(true);
    setSalesRepsError(null);
    
    try {
      const url = buildApiUrl('models/AD_User');
      console.log('🔍 Fetching sales reps from:', url);
      const data = await makeAuthenticatedRequest(url);
      const records = data.records || [];
      console.log(`✅ Loaded ${records.length} sales reps`);
      setSalesRepsData(records);
    } catch (error) {
      console.error('❌ Sales reps fetch error:', error.message);
      setSalesRepsError(error.message);
    } finally {
      setIsLoadingSalesReps(false);
    }
  };

  // Fetch all business partners
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

  /* ---------------- FETCH BUSINESS PARTNER DETAILS ---------------- */
  const fetchBusinessPartnerDetails = async (bpId) => {
    if (!bpId) return;
    
    try {
      const url = buildApiUrl(`models/C_BPartner/${bpId}`);
      const data = await makeAuthenticatedRequest(url);
      if (data) {
        setSelectedBPName(data.Name || '');
        setErrors(prev => ({ ...prev, bp: null }));
      }
    } catch (error) {
      console.log('BP fetch error', error.message);
    }
  };

  /* ---------------- FETCH BP USERS ---------------- */
  const fetchBpUsers = async (bpId) => {
    if (!bpId) return;
    try {
      console.log('🔍 Fetching users for BP:', bpId);
      const url = buildApiUrl('models/AD_User', `C_BPartner_ID eq ${bpId}`);
      const data = await makeAuthenticatedRequest(url);
      const users = data.records || [];
      console.log(`✅ Found ${users.length} users for BP ${bpId}`);
      setBpContacts(users);
      
      // IMPORTANT: Automatically select the lead user if it exists
      if (leadData?.id) {
        console.log('🔍 Looking for lead user ID:', leadData.id);
        const matchingUser = users.find(u => u.id === leadData.id);
        if (matchingUser) {
          console.log('✅ Found matching lead user, auto-selecting:', matchingUser.Name);
          setSelectedUserId(matchingUser.id);
        } else {
          console.log('⚠️ Lead user not found in BP contacts, keeping existing selection');
          // Keep the existing selection (already set from leadData)
        }
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
    return businessPartnersData.filter(bp =>
      bp.Name && bp.Name.toLowerCase().includes(query)
    );
  }, [businessPartnersData, bpSearch]);

  const filteredSalesReps = useMemo(() => {
    if (!searchQuery.trim()) {
      return salesRepsData;
    }
    
    const query = searchQuery.toLowerCase();
    return salesRepsData.filter(rep => 
      rep.Name && rep.Name.toLowerCase().includes(query)
    );
  }, [salesRepsData, searchQuery]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleSelectSalesRep = useCallback((rep) => {
    setSelectedSalesRepId(rep.id);
    setSelectedSalesRepName(rep.Name);
    setShowSalesRepModal(false);
    setSearchQuery('');
    setErrors(prev => ({ ...prev, salesRep: null }));
  }, []);

  const handleClearSalesRep = useCallback(() => {
    setSelectedSalesRepId(null);
    setSelectedSalesRepName('');
  }, []);

  const handleSelectBusinessPartner = useCallback((bp) => {
    console.log('✅ Selected business partner:', bp.id, bp.Name);
    setSelectedBPId(bp.id);
    setSelectedBPName(bp.Name);
    setShowBPModal(false);
    setBpSearch('');
    fetchBpUsers(bp.id);
    setErrors(prev => ({ ...prev, bp: null }));
  }, []);

  const handleClearBusinessPartner = useCallback(() => {
    setSelectedBPId(null);
    setSelectedBPName('');
    setBpContacts([]);
    setSelectedUserId(null);
  }, []);

  const handleStageChange = useCallback((id) => {
    setSelectedStageId(id);
    const stage = stages.find(s => s.id === id);
    if (stage?.Probability) {
      setProbability(stage.Probability.toString());
    } else {
      setProbability(''); // Clear probability if stage has no default
    }
    setErrors(prev => ({ ...prev, stage: null }));
  }, [stages]);

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
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return false;
    }
    return true;
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    console.log('📝 Submitting form with selectedBPId:', selectedBPId);
    console.log('📝 Selected User ID:', selectedUserId);
    
    if (!validate()) return;

    setIsSubmitting(true);
    
    const opportunityData = {
      AD_Client_ID: { id: clientId },
      AD_Org_ID: { id: organizationId },
      AD_User_ID: { id: selectedUserId || userId }, // Fallback to current user if no contact selected
      SalesRep_ID: { id: selectedSalesRepId },
      C_SalesStage_ID: { id: selectedStageId },
      Probability: probability ? Number(probability) : 0,
      ExpectedCloseDate: expectedCloseDate,
      OpportunityAmt: Number(amount),
      C_Currency_ID: { id: selectedCurrencyId },
      Description: description,
      Comments: comments,
      IsActive: active,
       
    };

    if (selectedBPId) {
      opportunityData.C_BPartner_ID = { id: selectedBPId };
    }

    if (selectedCampaign) {
      opportunityData.C_Campaign_ID = { id: selectedCampaign };
    }

    console.log('Sending opportunity data with user ID:', opportunityData.AD_User_ID.id);

    try {
      const result = await createOpportunity.mutateAsync(opportunityData);
      console.log('✅ Success result:', result);
      Alert.alert('Success', 'Sales Opportunity created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('❌ Create opportunity error:', error);
      
      let errorMessage = 'Failed to create opportunity';
      if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Business Partner Item
  const renderBusinessPartnerItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={[
        styles.itemRow,
        selectedBPId === item.id && styles.selectedItemRow,
      ]}
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
          <Text style={styles.itemName} numberOfLines={1}>{item.Name}</Text>
          {item.Value && (
            <Text style={styles.itemSubtext}>Code: {item.Value}</Text>
          )}
        </View>
      </View>
      {selectedBPId === item.id && (
        <MaterialCommunityIcons name="check-circle" size={Layout.iconSize.md} color={Colors.primary} />
      )}
    </TouchableOpacity>
  ), [selectedBPId, handleSelectBusinessPartner]);

  // Render Sales Rep Item
  const renderSalesRepItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={[
        styles.itemRow,
        selectedSalesRepId === item.id && styles.selectedItemRow,
      ]}
      onPress={() => handleSelectSalesRep(item)}
      activeOpacity={0.7}
    >
      <View style={styles.itemContent}>
        <View style={styles.itemAvatar}>
          <Text style={styles.itemAvatarText}>
            {item.Name?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={1}>{item.Name}</Text>
          {item.EMail && (
            <Text style={styles.itemSubtext} numberOfLines={1}>{item.EMail}</Text>
          )}
        </View>
      </View>
      {selectedSalesRepId === item.id && (
        <MaterialCommunityIcons name="check-circle" size={Layout.iconSize.md} color={Colors.primary} />
      )}
    </TouchableOpacity>
  ), [selectedSalesRepId, handleSelectSalesRep]);

  // Check if any data is loading
  const isLoading = isLoadingStages || isLoadingCurrencies || isLoadingCampaigns || isLoadingSalesReps || isLoadingBusinessPartners;
  
  // Check if there are any errors
  const hasError = stagesError || currenciesError || campaignsError || salesRepsError || businessPartnersError;

  // If there's an error, show retry option
  if (hasError && !isLoading) {
    return (
      <>
        <StatusBar translucent backgroundColor="transparent" />
        <CustomHeader title="Add Sale Opportunity" LeftIcon="arrow-left" LeftPress={() => navigation.goBack()} />
        <View style={styles.fullScreenError}>
          <MaterialCommunityIcons name="alert-circle" size={Layout.iconSize.xxxl} color={Colors.error} />
          <Text style={styles.fullScreenErrorText}>Failed to load required data</Text>
          <TouchableOpacity 
            style={styles.fullScreenRetryButton}
            onPress={() => {
              setStagesError(null);
              setCurrenciesError(null);
              setCampaignsError(null);
              setSalesRepsError(null);
              setBusinessPartnersError(null);
              fetchStages();
              fetchCurrencies();
              fetchCampaigns();
              fetchSalesRepresentatives();
              fetchBusinessPartners();
            }}
          >
            <Text style={styles.fullScreenRetryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" />
      <CustomHeader title="Add Sale Opportunity" LeftIcon="arrow-left" LeftPress={() => navigation.goBack()} />

      {/* Calendar Modal */}
      <CalendarModal
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onSelectDate={(date) => {
          setExpectedCloseDate(date);
          setErrors(prev => ({ ...prev, date: null }));
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
                <MaterialCommunityIcons name="close" size={Layout.iconSize.lg} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearch}>
              <MaterialCommunityIcons name="magnify" size={Layout.iconSize.sm} color={Colors.textSecondary} />
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
                  <MaterialCommunityIcons name="close-circle" size={Layout.iconSize.sm} color={Colors.textSecondary} />
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
                    <MaterialCommunityIcons name="domain-off" size={Layout.iconSize.xl} color={Colors.border} />
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
              >
                <MaterialCommunityIcons name="close" size={Layout.iconSize.lg} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearch}>
              <MaterialCommunityIcons name="magnify" size={Layout.iconSize.sm} color={Colors.textSecondary} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search by name..."
                placeholderTextColor={Colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <MaterialCommunityIcons name="close-circle" size={Layout.iconSize.sm} color={Colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {isLoadingSalesReps ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.modalLoadingText}>Loading...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredSalesReps}
                renderItem={renderSalesRepItem}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                initialNumToRender={20}
                maxToRenderPerBatch={20}
                windowSize={10}
                ListEmptyComponent={
                  <View style={styles.modalEmpty}>
                    <MaterialCommunityIcons name="account-off" size={Layout.iconSize.xl} color={Colors.border} />
                    <Text style={styles.modalEmptyText}>
                      {searchQuery.trim()
                        ? `No results for "${searchQuery}"`
                        : 'No sales representatives available'}
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formCard}>
          {/* Document No */}
          <Label title="Document No" />
          <ReadOnly value={documentNo} icon="file-document-outline" />

          {/* Business Partner - Modal Selector */}
          <BusinessPartnerSelector 
            selectedBPName={selectedBPName}
            error={errors.bp}
            onPress={() => setShowBPModal(true)}
            onClear={handleClearBusinessPartner}
          />

          {/* User / Contact - Custom Display Component */}
          <Label title="Contact" />
          <ContactDisplay leadData={leadData} />

          {/* Sales Representative - Modal Selector */}
          <SalesRepSelector 
            selectedSalesRepName={selectedSalesRepName}
            error={errors.salesRep}
            onPress={() => setShowSalesRepModal(true)}
            onClear={handleClearSalesRep}
          />

          {/* Sales Stage */}
          <Label title="Sales Stage" required />
          {isLoadingStages ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : stagesError ? (
            <ErrorRetry message={stagesError} onRetry={fetchStages} />
          ) : (
            <PickerField
              selectedValue={selectedStageId}
              onValueChange={handleStageChange}
              error={errors.stage}
              icon="chart-line"
              placeholder="Select Stage"
            >
              {stages.map(stage => (
                <Picker.Item 
                  key={stage.id} 
                  label={stage.Name} 
                  value={stage.id} 
                  color={Colors.textPrimary}
                />
              ))}
            </PickerField>
          )}

          {/* Probability - EDITABLE TEXT INPUT */}
          <Label title="Probability (%)" />
          <Input
            value={probability}
            onChangeText={(text) => {
              // Allow only numbers and decimal point
              const filtered = text.replace(/[^0-9.]/g, '');
              setProbability(filtered);
            }}
            placeholder="Enter probability percentage"
            keyboardType="numeric"
            icon="percent"
          />

          {/* Campaign */}
          <Label title="Campaign" />
          {isLoadingCampaigns ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : campaignsError ? (
            <ErrorRetry message={campaignsError} onRetry={fetchCampaigns} />
          ) : (
            <PickerField
              selectedValue={selectedCampaign}
              onValueChange={setSelectedCampaign}
              icon="bullhorn"
              placeholder="Select Campaign"
            >
              {campaigns.map(campaign => (
                <Picker.Item 
                  key={campaign.id} 
                  label={campaign.Name} 
                  value={campaign.id} 
                  color={Colors.textPrimary}
                />
              ))}
            </PickerField>
          )}

          {/* Expected Close Date */}
          <Label title="Expected Close Date" required />
          <DatePickerField
            value={expectedCloseDate}
            onPress={() => setShowCalendar(true)}
            error={errors.date}
            icon="calendar-clock"
          />

          {/* Opportunity Amount - FULL WIDTH TEXT INPUT */}
          <Label title="Opportunity Amount" required />
          <Input
            value={amount}
            onChangeText={(v) => {
              setAmount(v);
              setErrors(prev => ({ ...prev, amount: null }));
            }}
            placeholder="Enter amount (e.g., 1000, 5000.50, 1000000)"
            keyboardType="numeric"
            error={errors.amount}
            icon="currency-usd"
          />

          {/* Currency */}
          <Label title="Currency" required />
          {isLoadingCurrencies ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : currenciesError ? (
            <ErrorRetry message={currenciesError} onRetry={fetchCurrencies} />
          ) : (
            <PickerField
              selectedValue={selectedCurrencyId}
              onValueChange={(value) => {
                if (value) {
                  setSelectedCurrencyId(value);
                  setErrors(prev => ({ ...prev, currency: null }));
                }
              }}
              error={errors.currency}
              icon="currency-sign"
              placeholder="Select Currency"
            >
              {currencies.map(currency => (
                <Picker.Item 
                  key={currency.id} 
                  label={`${currency.ISO_Code} - ${currency.Description || ''}`} 
                  value={currency.id} 
                  color={Colors.textPrimary}
                />
              ))}
            </PickerField>
          )}

          {/* Description */}
          <Label title="Description" />
          <Input
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description"
            multiline
            numberOfLines={3}
            style={styles.textArea}
            icon="text"
          />

          {/* Comments */}
          <Label title="Comments" />
          <Input
            value={comments}
            onChangeText={setComments}
            placeholder="Enter comments"
            multiline
            numberOfLines={3}
            style={styles.textArea}
            icon="comment-text"
          />

          {/* Tenant */}
          <Label title="Tenant" />
          <ReadOnly value={clientName} icon="domain" />

          {/* Organization */}
          <Label title="Organization" />
          <ReadOnly value={organizationName} icon="office-building" />

          {/* Company */}
          <Label title="Company" />
          <ReadOnly value={organizationName || 'Default'} icon="warehouse" />

          {/* Active Switch */}
          <SwitchRow label="Active" value={active} disabled />
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={[styles.submitButton, (isSubmitting || isLoading) && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={isSubmitting || isLoading}
        activeOpacity={0.8}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color={Colors.textInverse} />
        ) : (
          <>
            <MaterialCommunityIcons name="plus-circle" size={Layout.iconSize.md} color={Colors.textInverse} />
            <Text style={styles.submitButtonText}>Create Opportunity</Text>
          </>
        )}
      </TouchableOpacity>
    </>
  );
};

// Keep all the styles from your original file (they're the same)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingBottom: verticalScale(100),
  },
  formCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.lg,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.lg,
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    
    // Elevation for Android
    elevation: 3,
  },
  label: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xxs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  requiredStar: {
    color: Colors.error,
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.bold,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xxs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.sm,
    minHeight: 42,
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    
    // Elevation for Android
    elevation: 2,
  },
  inputError: {
    borderColor: Colors.error,
    borderWidth: 1.5,
  },
  inputIcon: {
    paddingLeft: Spacing.sm,
  },
  input: {
    flex: 1,
    height: 42,
    paddingHorizontal: Spacing.sm,
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  inputWithIcon: {
    paddingLeft: Spacing.xs,
  },
  readOnlyContainer: {
    backgroundColor: Colors.backgroundLight,
    opacity: 0.9,
  },
  readOnlyText: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    textAlignVertical: 'center',
  },
  contactContainer: {
    minHeight: 52,
    paddingVertical: Spacing.xs,
  },
  contactContent: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
  },
  contactName: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xxs,
  },
  contactDetails: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.sm,
    minHeight: 42,
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    
    // Elevation for Android
    elevation: 2,
  },
  pickerIcon: {
    paddingLeft: Spacing.sm,
  },
  picker: {
    flex: 1,
    height: 42,
    color: Colors.textPrimary,
  },
  pickerWithIcon: {
    marginLeft: -Spacing.xs,
  },
  dateText: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },
  dateIcon: {
    paddingRight: Spacing.sm,
  },
  textArea: {
    minHeight: verticalScale(80),
    textAlignVertical: 'top',
    paddingTop: Spacing.sm,
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
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  switchLabel: {
    fontSize: Typography.fontSize.small,
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
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.sm,
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
  submitButton: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
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
  submitButtonDisabled: {
    opacity: 0.7,
    backgroundColor: Colors.buttonDisabled,
    shadowOpacity: 0.2,
    elevation: 3,
  },
  submitButtonText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.semiBold,
  },

  // Selector Styles
  editField: {
    marginBottom: Spacing.md,
  },
  selector: {
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
  selectorError: {
    borderColor: Colors.error,
    borderWidth: 1.5,
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
    fontSize: Typography.fontSize.small,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.regular,
  },
  placeholderText: {
    fontSize: Typography.fontSize.small,
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily.regular,
  },
  clearButton: {
    padding: Spacing.xxs,
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
    padding: Spacing.md,
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
    margin: Spacing.md,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    gap: Spacing.xs,
    height: verticalScale(42),
    
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

  // Item Row Styles
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
    
    // Shadow for iOS
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    
    // Elevation for Android
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
});

export default AddSaleOppor;