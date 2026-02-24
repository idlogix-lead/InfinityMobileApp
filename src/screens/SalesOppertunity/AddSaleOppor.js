// screens/CRM/AddSaleOppor.js - FIXED validation for pre-filled business partner with CalendarModal

import React, { useEffect, useState, useMemo } from 'react';
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
  Pressable,
  ActivityIndicator,
  Modal,
  FlatList,
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

const AddSaleOppor = ({ navigation, route }) => {
  // Get params from route
  const { leadData, followupData, mode } = route.params || {};
  
  // Log the incoming leadData for debugging
  console.log('📦 AddSaleOppor - Received leadData:', JSON.stringify(leadData, null, 2));
  
  const createOpportunity = useCreateSalesOpportunity();
  
  // Safely use sales representatives hook with error handling
  let salesRepsData = [];
  let loadingSalesReps = false;
  
  try {
    const result = useSalesRepresentatives();
    if (result && typeof result === 'object') {
      salesRepsData = result.data || [];
      loadingSalesReps = result.isLoading || false;
    }
  } catch (error) {
    console.error('Error loading sales representatives:', error);
  }
  
  /* ---------------- AUTH STORE ---------------- */
  const authState = useAuthStore();
  const userId = authState?.userId;
  const userName = authState?.userName;
  const clientId = authState?.clientId;
  const clientName = authState?.clientName;
  const organizationId = authState?.organizationId;
  const organizationName = authState?.organizationName;
  const warehouseName = 'Default';

  /* ---------------- OPPORTUNITY STATE ---------------- */
  // Initialize with pre-filled data if available - FIXED: Set both ID and name
  const [selectedBPId, setSelectedBPId] = useState(null);
  const [selectedBPName, setSelectedBPName] = useState('');
  const [bpQuery, setBpQuery] = useState('');
  const [bpResults, setBpResults] = useState([]);
  const [showBPList, setShowBPList] = useState(false);
  const [isLoadingBP, setIsLoadingBP] = useState(false);

  const [bpContacts, setBpContacts] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [documentNo, setDocumentNo] = useState('');
  const [description, setDescription] = useState('');
  const [comments, setComments] = useState('');

  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [amount, setAmount] = useState('');

  /* ---------------- SALES STAGE ---------------- */
  const [stages, setStages] = useState([]);
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [probability, setProbability] = useState('0');
  const [isLoadingStages, setIsLoadingStages] = useState(false);

  /* ---------------- CURRENCY ---------------- */
  const [currencyQuery, setCurrencyQuery] = useState('');
  const [currencyResults, setCurrencyResults] = useState([]);
  const [showCurrencyList, setShowCurrencyList] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrencyId, setSelectedCurrencyId] = useState(null);
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(false);

  /* ---------------- CAMPAIGNS ---------------- */
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);

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

  // FIXED: Initialize state from leadData on component mount
  useEffect(() => {
    if (leadData) {
      console.log('🔄 Initializing from leadData:', leadData);
      
      // Set Business Partner - FIXED: Set both ID and name
      if (leadData.businessPartnerId) {
        console.log('✅ Setting business partner ID:', leadData.businessPartnerId);
        setSelectedBPId(leadData.businessPartnerId);
        setSelectedBPName(leadData.businessPartnerName || leadData.companyName || '');
      } else if (leadData.C_BPartner_ID?.id) {
        console.log('✅ Setting business partner from nested object:', leadData.C_BPartner_ID);
        setSelectedBPId(leadData.C_BPartner_ID.id);
        setSelectedBPName(leadData.C_BPartner_ID.identifier || '');
      }
      
      // Set User/Contact
      if (leadData.userId) {
        console.log('✅ Setting user ID:', leadData.userId);
        setSelectedUserId(leadData.userId);
      } else if (leadData.id) {
        console.log('✅ Setting user ID from lead.id:', leadData.id);
        setSelectedUserId(leadData.id);
      }
      
      // Set Description from followup
      if (followupData?.description) {
        console.log('✅ Setting description from followup:', followupData.description);
        setDescription(followupData.description);
      } else if (leadData.description) {
        setDescription(leadData.description);
      }
      
      // Set Comments
      if (leadData.comments) {
        setComments(leadData.comments);
      }
      
      // Set Sales Rep
      if (leadData.salesRepId) {
        console.log('✅ Setting sales rep ID:', leadData.salesRepId);
        setSelectedSalesRepId(leadData.salesRepId);
        setSelectedSalesRepName(leadData.salesRepLabel || '');
      }
    }
  }, [leadData, followupData]);

  // Clear BP error on mount if we have pre-filled data
  useEffect(() => {
    if (selectedBPId) {
      console.log('✅ Business partner already set, clearing error');
      setErrors(prev => ({ ...prev, bp: null }));
    }
  }, [selectedBPId]);

  /* ---------------- FETCH BUSINESS PARTNER DETAILS ---------------- */
  const fetchBusinessPartnerDetails = async (bpId) => {
    if (!bpId) return;
    
    setIsLoadingBP(true);
    try {
      const url = buildApiUrl(`models/C_BPartner/${bpId}`);
      const data = await makeAuthenticatedRequest(url);
      if (data) {
        setSelectedBPName(data.Name || '');
        // Clear error when we successfully set the business partner
        setErrors(prev => ({ ...prev, bp: null }));
      }
    } catch (error) {
      console.log('BP fetch error', error.message);
    } finally {
      setIsLoadingBP(false);
    }
  };

  /* ---------------- FETCH BP USERS AND SET CONTACT ---------------- */
  const fetchBpUsers = async (bpId) => {
    if (!bpId) return;
    try {
      const url = buildApiUrl('models/AD_User', `C_BPartner_ID eq ${bpId}`);
      const data = await makeAuthenticatedRequest(url);
      const users = data.records || [];
      setBpContacts(users);
      
      // If we have a specific userId from leadData, try to select that user
      if (leadData?.userId) {
        const matchingUser = users.find(u => u.id === leadData.userId);
        if (matchingUser) {
          setSelectedUserId(matchingUser.id);
        } else {
          setSelectedUserId(users[0]?.id || null);
        }
      } else {
        setSelectedUserId(users[0]?.id || null);
      }
    } catch (error) {
      console.log('BP users fetch error', error.message);
    }
  };

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    // If we have businessPartnerId, fetch its details for the name
    if (selectedBPId && !selectedBPName) {
      fetchBusinessPartnerDetails(selectedBPId);
    }
  }, [selectedBPId]);

  useEffect(() => {
    fetchStages();
    fetchCurrencies();
    fetchCampaigns();
    setDocumentNo('Auto Generated');
    
    // If we have lead data with business partner, fetch its contacts
    if (selectedBPId) {
      fetchBpUsers(selectedBPId);
    }
    
    // Show a message if coming from follow-up
    if (mode === 'fromFollowup' && leadData) {
      console.log('Creating opportunity from follow-up for lead:', leadData.name);
    }
  }, []);

  /* ---------------- API HELPER ---------------- */
  const makeAuthenticatedRequest = async (url, options = {}) => {
    const token = authState?.token;
    if (!token) {
      throw new Error('Authentication token missing');
    }
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
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

  /* ---------------- SEARCH BUSINESS PARTNER ---------------- */
  const searchBusinessPartner = async (text) => {
    setBpQuery(text);
    setSelectedBPName('');
    setSelectedBPId(null);
    setErrors(prev => ({ ...prev, bp: null }));

    if (text.length < 2) {
      setBpResults([]);
      setShowBPList(false);
      return;
    }

    setIsLoadingBP(true);
    try {
      const url = buildApiUrl('models/C_BPartner', `contains(Name,'${text}')`);
      const data = await makeAuthenticatedRequest(url);
      setBpResults(data.records || []);
      setShowBPList(true);
    } catch (error) {
      console.log('BP search error', error.message);
      Alert.alert('Error', 'Failed to search business partners');
    } finally {
      setIsLoadingBP(false);
    }
  };

  /* ---------------- FETCH STAGES ---------------- */
  const fetchStages = async () => {
    setIsLoadingStages(true);
    try {
      const url = buildApiUrl('models/C_SalesStage');
      const data = await makeAuthenticatedRequest(url);
      setStages(data.records || []);
    } catch (error) {
      console.log('Stages fetch error', error.message);
      Alert.alert('Error', 'Failed to load sales stages');
    } finally {
      setIsLoadingStages(false);
    }
  };

  const handleStageChange = (id) => {
    setSelectedStageId(id);
    const stage = stages.find(s => s.id === id);
    setProbability(stage?.Probability?.toString() || '0');
    setErrors(prev => ({ ...prev, stage: null }));
  };

  /* ---------------- FETCH CURRENCIES ---------------- */
  const fetchCurrencies = async () => {
    setIsLoadingCurrencies(true);
    try {
      const url = buildApiUrl('models/C_Currency');
      const data = await makeAuthenticatedRequest(url);
      setCurrencies(data.records || []);
    } catch (error) {
      console.log('Currencies fetch error', error.message);
    } finally {
      setIsLoadingCurrencies(false);
    }
  };

  const searchCurrency = (text) => {
    setCurrencyQuery(text);
    setSelectedCurrencyId(null);
    setErrors(prev => ({ ...prev, currency: null }));

    if (text.length < 1) {
      setCurrencyResults([]);
      setShowCurrencyList(false);
      return;
    }

    const filtered = currencies.filter(
      c =>
        c.ISO_Code?.toLowerCase().includes(text.toLowerCase()) ||
        c.Description?.toLowerCase().includes(text.toLowerCase())
    );
    setCurrencyResults(filtered);
    setShowCurrencyList(true);
  };

  /* ---------------- FETCH CAMPAIGNS ---------------- */
  const fetchCampaigns = async () => {
    setIsLoadingCampaigns(true);
    try {
      const url = buildApiUrl('models/C_Campaign');
      const data = await makeAuthenticatedRequest(url);
      setCampaigns(data.records || []);
    } catch (error) {
      console.log('Campaigns fetch error', error.message);
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  /* ---------------- SALES REP HANDLERS ---------------- */
  const filteredSalesReps = useMemo(() => {
    if (!searchQuery.trim()) {
      return salesRepsData;
    }
    
    const query = searchQuery.toLowerCase();
    return salesRepsData.filter(rep => 
      rep.Name && rep.Name.toLowerCase().includes(query)
    );
  }, [salesRepsData, searchQuery]);

  const handleSelectSalesRep = (rep) => {
    setSelectedSalesRepId(rep.id);
    setSelectedSalesRepName(rep.Name);
    setShowSalesRepModal(false);
    setSearchQuery('');
    setErrors(prev => ({ ...prev, salesRep: null }));
  };

  const handleClearSalesRep = () => {
    setSelectedSalesRepId(null);
    setSelectedSalesRepName('');
  };

  /* ---------------- FORMAT DATE ---------------- */
  const formatDate = (date) => {
    if (!date) return '';
    return moment(date).format('DD MMM YYYY');
  };

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    const e = {};
    // Business Partner is REQUIRED for iDempiere
    if (!selectedBPId) {
      console.log('❌ Validation failed: Business Partner ID is missing');
      e.bp = 'Business Partner is required';
    } else {
      console.log('✅ Validation passed: Business Partner ID =', selectedBPId);
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
    
    if (!validate()) return;

    setIsSubmitting(true);
    
    // Build payload dynamically, only including fields with values
    const opportunityData = {
      AD_Client_ID: { id: clientId },
      AD_Org_ID: { id: organizationId },
      AD_User_ID: { id: selectedUserId },
      SalesRep_ID: { id: selectedSalesRepId },
      C_SalesStage_ID: { id: selectedStageId },
      Probability: Number(probability),
      ExpectedCloseDate: expectedCloseDate,
      OpportunityAmt: Number(amount),
      C_Currency_ID: { id: selectedCurrencyId },
      Description: description,
      Comments: comments,
      IsActive: active,
    };

    // Add C_BPartner_ID - it should exist because validation passed
    if (selectedBPId) {
      opportunityData.C_BPartner_ID = { id: selectedBPId };
      console.log('✅ Adding C_BPartner_ID to payload:', selectedBPId);
    } else {
      console.log('❌ CRITICAL: selectedBPId is missing in submit!');
    }

    // Add C_Campaign_ID if it has a value
    if (selectedCampaign) {
      opportunityData.C_Campaign_ID = { id: selectedCampaign };
    }

    console.log('Sending opportunity data:', JSON.stringify(opportunityData, null, 2));

    try {
      const result = await createOpportunity.mutateAsync(opportunityData);
      console.log('✅ Success result:', result);
      Alert.alert('Success', 'Sales Opportunity created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('❌ Create opportunity error:', error);
      
      // Show user-friendly error message
      let errorMessage = 'Failed to create opportunity';
      if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- UI COMPONENTS ---------------- */
  const Label = ({ title, required }) => (
    <Text style={styles.label}>
      {title}
      {required && <Text style={styles.requiredStar}> *</Text>}
    </Text>
  );

  const Input = ({ error, icon, ...props }) => (
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
  );

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

  const SearchField = ({ 
    value, 
    onChangeText, 
    placeholder, 
    error, 
    icon,
    showResults,
    results,
    onSelectItem,
    isLoading,
    renderItem
  }) => (
    <View style={styles.searchContainer}>
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
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          style={[styles.input, icon && styles.inputWithIcon]}
        />
        {isLoading && (
          <ActivityIndicator size="small" color={Colors.primary} style={styles.searchLoader} />
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      {showResults && results.length > 0 && (
        <View style={styles.searchResults}>
          <ScrollView nestedScrollEnabled style={styles.searchResultsScroll} keyboardShouldPersistTaps="handled">
            {results.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.searchResultItem,
                  pressed && styles.searchResultItemPressed,
                ]}
                onPress={() => onSelectItem(item)}
              >
                <Text style={styles.searchResultText}>
                  {renderItem ? renderItem(item) : item.Name || item.ISO_Code}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  const DatePickerField = ({ value, onPress, error, icon }) => (
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

  const SalesRepSelector = ({ error }) => (
    <View style={styles.editField}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>Sales Representative</Text>
        <Text style={styles.requiredStar}> *</Text>
      </View>
      <TouchableOpacity
        style={[
          styles.salesRepSelector,
          error && styles.selectorError,
        ]}
        onPress={() => setShowSalesRepModal(true)}
        activeOpacity={0.7}
      >
        {selectedSalesRepName ? (
          <View style={styles.selectedRepContainer}>
            <View style={styles.selectedRepInfo}>
              <MaterialCommunityIcons name="account-tie" size={Layout.iconSize.sm} color={Colors.primary} />
              <Text style={styles.selectedRepText}>{selectedSalesRepName}</Text>
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
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  const renderSalesRepItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.repItem,
        selectedSalesRepId === item.id && styles.selectedRepItem,
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
      {selectedSalesRepId === item.id && (
        <MaterialCommunityIcons name="check-circle" size={Layout.iconSize.md} color={Colors.primary} />
      )}
    </TouchableOpacity>
  );

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

  /* ---------------- MAIN RENDER ---------------- */
  const isLoading = loadingSalesReps || isLoadingStages || isLoadingCurrencies || isLoadingCampaigns;

  // Debug render
  console.log('🎨 Rendering with selectedBPId:', selectedBPId, 'selectedBPName:', selectedBPName);

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" />
      <CustomHeader title="Add Sale Opportunity" />

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

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading data...</Text>
        </View>
      )}

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formCard}>
          {/* Document No */}
          <Label title="Document No" />
          <ReadOnly value={documentNo} icon="file-document" />

          {/* Business Partner Search - Required */}
          <Label title="Business Partner" required />
          <SearchField
            value={selectedBPName || bpQuery}
            onChangeText={searchBusinessPartner}
            placeholder="Search Business Partner"
            error={errors.bp}
            icon="office-building"
            showResults={showBPList}
            results={bpResults}
            isLoading={isLoadingBP}
            onSelectItem={(item) => {
              console.log('✅ Selected business partner:', item.id, item.Name);
              setSelectedBPId(item.id);
              setSelectedBPName(item.Name);
              setShowBPList(false);
              fetchBpUsers(item.id);
              // Clear error when selected
              setErrors(prev => ({ ...prev, bp: null }));
            }}
            renderItem={(item) => `${item.Name} (${item.Value || ''})`}
          />

          {/* User / Contact */}
          <Label title="User / Contact" />
          <PickerField
            selectedValue={selectedUserId}
            onValueChange={(value) => value !== null && setSelectedUserId(value)}
            icon="account"
            placeholder="Auto select"
          >
            {bpContacts.map(user => (
              <Picker.Item 
                key={user.id} 
                label={user.Name} 
                value={user.id} 
                color={Colors.textPrimary}
              />
            ))}
          </PickerField>

          {/* Sales Representative - Dynamic Searchable Picker */}
          <SalesRepSelector error={errors.salesRep} />

          {/* Sales Stage */}
          <Label title="Sales Stage" required />
          {isLoadingStages ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
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

          {/* Probability */}
          <Label title="Probability" />
          <ReadOnly value={`${probability}%`} icon="percent" />

          {/* Campaign */}
          <Label title="Campaign" />
          {isLoadingCampaigns ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
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

          {/* Opportunity Amount */}
          <Label title="Opportunity Amount" required />
          <Input
            value={amount}
            onChangeText={(v) => {
              setAmount(v);
              setErrors(prev => ({ ...prev, amount: null }));
            }}
            placeholder="Enter amount"
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
          ) : (
            <SearchField
              value={currencyQuery || currencies.find(c => c.id === selectedCurrencyId)?.ISO_Code || ''}
              onChangeText={searchCurrency}
              placeholder="Search Currency"
              error={errors.currency}
              icon="currency-sign"
              showResults={showCurrencyList}
              results={currencyResults}
              onSelectItem={(item) => {
                setSelectedCurrencyId(item.id);
                setCurrencyQuery(item.ISO_Code);
                setShowCurrencyList(false);
                setErrors(prev => ({ ...prev, currency: null }));
              }}
              renderItem={(item) => `${item.ISO_Code} - ${item.Description}`}
            />
          )}

          {/* Description - Pre-filled from follow-up */}
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

          {/* Company - Using organization name instead of warehouse */}
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

            {loadingSalesReps ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.modalLoadingText}>Loading...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredSalesReps}
                renderItem={renderSalesRepItem}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
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
    </>
  );
};

// Keep all your existing styles - they remain the same
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
  searchContainer: {
    position: 'relative',
    zIndex: 10,
  },
  searchLoader: {
    marginRight: Spacing.sm,
  },
  searchResults: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.sm,
    maxHeight: verticalScale(200),
    zIndex: 20,
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    
    // Elevation for Android
    elevation: 5,
  },
  searchResultsScroll: {
    maxHeight: verticalScale(200),
  },
  searchResultItem: {
    padding: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  searchResultItemPressed: {
    backgroundColor: Colors.primaryLight + '20',
  },
  searchResultText: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
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
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
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
  
  // Sales Rep Selector Styles
  editField: {
    marginBottom: Spacing.sm,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xxs,
  },
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
  selectorError: {
    borderColor: Colors.error,
    borderWidth: 1.5,
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
    fontFamily: Typography.fontFamily.regular,
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
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
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
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textInverse,
  },
  repDetails: {
    flex: 1,
  },
  repName: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xxs,
  },
  repEmail: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
});

export default AddSaleOppor;