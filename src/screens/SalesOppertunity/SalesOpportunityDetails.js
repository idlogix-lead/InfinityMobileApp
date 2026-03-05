// screens/SalesOpportunityDetail/SalesOpportunityDetail.js - COMPLETE EDITION with custom alerts

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  Switch,
} from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useQueryClient } from 'react-query';
import theme from '../../constants/CRMTheme/CRMTheme';
import moment from 'moment';
import { Menu, Divider } from 'react-native-paper';
import { useUpdateSalesOpportunity } from '../../hooks/CRMhooks/useCRM';
import { useAuthStore } from '../../store/authStore';
import CalendarModal from '../../components/RequestScreenComponents/Calendar/CalendarModal';
import { Picker } from '@react-native-picker/picker';
import CustomAlert from '../../components/CustomAlert'; // Import custom alert

const { Colors, Typography, Layout, Spacing } = theme;
const { scale, verticalScale } = Layout;

// ============================================
// UI COMPONENTS
// ============================================

const Label = ({ title, required }) => (
  <Text style={styles.label}>
    {title}
    {required && <Text style={styles.requiredStar}> *</Text>}
  </Text>
);

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

// Contact Selector Component
const ContactSelector = ({ selectedContactName, selectedContactDetails, error, onPress, onClear }) => (
  <View style={styles.editField}>
    <View style={styles.labelContainer}>
      <Text style={styles.label}>Contact</Text>
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
      {selectedContactName ? (
        <View style={styles.selectedItemContainer}>
          <View style={styles.selectedItemInfo}>
            <MaterialCommunityIcons name="account" size={Layout.iconSize.sm} color={Colors.primary} />
            <View style={styles.contactSelectorText}>
              <Text style={styles.selectedItemText} numberOfLines={1}>{selectedContactName}</Text>
              {selectedContactDetails && (
                <Text style={styles.contactSelectorDetails} numberOfLines={1}>{selectedContactDetails}</Text>
              )}
            </View>
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
          <Text style={styles.placeholderText}>Select Contact</Text>
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

// Status Config for Sales Opportunities
const STATUS_CONFIG = {
  'Won': {
    barColor: Colors.statusConverted || '#10B981',
    badgeText: 'Won',
    badgeBg: Colors.successLight || '#E6F4EA',
    badgeColor: Colors.statusConverted || '#10B981',
    showDot: false,
    showCheck: true,
  },
  'Lost': {
    barColor: Colors.statusExpired || '#EF4444',
    badgeText: 'Lost',
    badgeBg: Colors.errorLight || '#FEE2E2',
    badgeColor: Colors.statusExpired || '#EF4444',
    showDot: true,
  },
  'In Progress': {
    barColor: Colors.statusWorking || '#F59E0B',
    badgeText: 'In Progress',
    badgeBg: Colors.warningLight || '#FEF3C7',
    badgeColor: Colors.statusWorking || '#F59E0B',
    showDot: true,
  },
  'Open': {
    barColor: Colors.statusNew || '#3B82F6',
    badgeText: 'Open',
    badgeBg: Colors.infoLight || '#EFF6FF',
    badgeColor: Colors.statusNew || '#3B82F6',
    showDot: true,
  },
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
    
    {/* Integrated Arrow Connector */}
    {active && (
      <View style={styles.activeTabArrowContainer}>
        <View style={styles.activeTabArrow} />
      </View>
    )}
  </View>
);

// Section Header Component
const SectionHeader = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

// View Mode Row Component
const ViewRow = ({ label, value }) => (
  <View style={styles.viewRow}>
    <Text style={styles.viewLabel}>{label}</Text>
    <Text style={styles.viewValue}>{value || 'Not provided'}</Text>
  </View>
);

// Clickable View Row
const ClickableViewRow = ({ label, value, onPress, icon }) => (
  <TouchableOpacity 
    style={styles.viewRow}
    onPress={onPress}
    activeOpacity={0.7}
    disabled={!onPress}
  >
    <Text style={styles.viewLabel}>{label}</Text>
    <View style={styles.clickableValueContainer}>
      <Text style={[styles.viewValue, icon && styles.viewValueWithIcon]}>{value || 'Not provided'}</Text>
      {icon && (
        <MaterialCommunityIcons 
          name={icon} 
          size={Layout.iconSize.sm} 
          color={Colors.primary} 
          style={styles.clickableIcon}
        />
      )}
    </View>
  </TouchableOpacity>
);

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  return moment(dateString).format('DD MMM YYYY');
};

// ============================================
// MAIN COMPONENT
// ============================================
const SalesOpportunityDetail = ({ route, navigation }) => {
  const { data: initialOpportunity } = route.params || {};
  const queryClient = useQueryClient();
  const authState = useAuthStore();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // State for current opportunity data
  const [opportunity, setOpportunity] = useState(initialOpportunity);

  // State for fetched lead/contact data
  const [leadData, setLeadData] = useState(null);
  const [loadingLead, setLoadingLead] = useState(false);

  // Loading states
  const [isLoadingStages, setIsLoadingStages] = useState(false);
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(false);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [isLoadingSalesReps, setIsLoadingSalesReps] = useState(false);
  const [isLoadingBusinessPartners, setIsLoadingBusinessPartners] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  // Error states
  const [stagesError, setStagesError] = useState(null);
  const [currenciesError, setCurrenciesError] = useState(null);
  const [campaignsError, setCampaignsError] = useState(null);
  const [salesRepsError, setSalesRepsError] = useState(null);
  const [businessPartnersError, setBusinessPartnersError] = useState(null);

  // Data states
  const [stages, setStages] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [salesRepsData, setSalesRepsData] = useState([]);
  const [businessPartnersData, setBusinessPartnersData] = useState([]);
  const [contactsData, setContactsData] = useState([]);

  // Modal visibility states
  const [showBPModal, setShowBPModal] = useState(false);
  const [showSalesRepModal, setShowSalesRepModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Search states
  const [bpSearch, setBpSearch] = useState('');
  const [salesRepSearch, setSalesRepSearch] = useState('');
  const [contactSearch, setContactSearch] = useState('');

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

  // Form state for editable fields
  const [formData, setFormData] = useState({
    documentNo: '',
    businessPartnerId: null,
    businessPartnerName: '',
    contactId: null,
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    salesRepId: null,
    salesRepName: '',
    salesRepEmail: '',
    stageId: null,
    stageName: '',
    probability: '',
    campaignId: null,
    campaignName: '',
    expectedCloseDate: '',
    amount: '',
    currencyId: null,
    currencyCode: '',
    description: '',
    comments: '',
    isActive: true,
  });

  // Update mutation
  const updateMutation = useUpdateSalesOpportunity();

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

  const showDiscardAlert = (onConfirm) => {
    setAlertConfig({
      visible: true,
      title: 'Discard Changes',
      message: 'Are you sure you want to discard your changes?',
      type: 'warning',
      onConfirm: () => {
        onConfirm();
        hideAlert();
      },
      onCancel: hideAlert,
      confirmText: 'Discard',
      cancelText: 'Stay',
      showCancelButton: true,
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  // ============================================
  // EXTRACT OPPORTUNITY DATA
  // ============================================
  const opportunityId = opportunity?.id;
  const documentNo = opportunity?.DocumentNo || 'Auto Generated';
  const opportunityName = opportunity?.Name || opportunity?.DocumentNo || 'Unnamed Opportunity';
  const opportunityAmount = opportunity?.OpportunityAmt || opportunity?.Amount || 0;
  const probability = opportunity?.Probability || 0;
  const expectedCloseDate = opportunity?.ExpectedCloseDate || opportunity?.CloseDate;
  const description = opportunity?.Description || '';
  const comments = opportunity?.Comments || '';
  const isActive = opportunity?.IsActive !== undefined ? opportunity.IsActive : true;

  // Extract currency
  const currencyId = opportunity?.C_Currency_ID?.id || opportunity?.currencyId;
  const currencyCode = opportunity?.C_Currency_ID?.ISO_Code || 
                      opportunity?.currencyCode || 
                      'PKR';

  // Extract stage
  const stageId = opportunity?.C_SalesStage_ID?.id || opportunity?.salesStageId;
  const stageName = opportunity?.C_SalesStage_ID?.identifier || 
                    opportunity?.salesStageName || 
                    'Not specified';

  // Extract status
  const status = opportunity?.C_OpportunityStatus?.identifier || 
                opportunity?.OpportunityStatus || 
                'Open';

  // Extract campaign
  const campaignId = opportunity?.C_Campaign_ID?.id || opportunity?.campaignId;
  const campaignName = opportunity?.C_Campaign_ID?.identifier || opportunity?.campaignName;

  // Extract business partner
  const businessPartnerId = opportunity?.C_BPartner_ID?.id || opportunity?.businessPartnerId;
  const businessPartnerName = opportunity?.C_BPartner_ID?.identifier || 
                             opportunity?.businessPartnerName ||
                             opportunity?.BusinessPartner || 
                             'No Company';

  // Extract contact/lead data (initial from opportunity)
  const contactId = opportunity?.AD_User_ID?.id || opportunity?.userId;
  const initialContactName = opportunity?.AD_User_ID?.identifier || 
                            opportunity?.userName ||
                            opportunity?.ContactName || 
                            'Unknown Contact';
  const initialContactEmail = opportunity?.AD_User_ID?.EMail || 
                             opportunity?.ContactEmail || 
                             '';
  const initialContactPhone = opportunity?.AD_User_ID?.Phone || 
                             opportunity?.ContactPhone || 
                             '';

  // Extract sales rep
  const salesRepId = opportunity?.SalesRep_ID?.id || opportunity?.salesRepId;
  const salesRepName = opportunity?.SalesRep_ID?.identifier || 
                      opportunity?.salesRepName ||
                      opportunity?.SalesRep || 
                      'Unassigned';
  const salesRepEmail = opportunity?.SalesRep_ID?.EMail || '';

  // Extract dates
  const createdDate = opportunity?.Created;
  const updatedDate = opportunity?.Updated;

  // Get status UI config
  const statusUI = STATUS_CONFIG[status] || STATUS_CONFIG['Open'];

  // ============================================
  // FETCH LEAD DATA (to get accurate email and phone)
  // ============================================
  useEffect(() => {
    const fetchLeadData = async () => {
      if (!contactId) {
        // Even without contactId, use initial data
        setLeadData({
          name: initialContactName,
          email: initialContactEmail,
          phone: initialContactPhone,
        });
        return;
      }

      setLoadingLead(true);
      
      try {
        // Try to get from cache first
        const cachedLeads = queryClient.getQueryData(['leads']);
        if (Array.isArray(cachedLeads)) {
          const cachedLead = cachedLeads.find(lead => 
            lead.id === contactId || lead.AD_User_ID?.id === contactId
          );
          if (cachedLead) {
            setLeadData({
              name: cachedLead.Name || cachedLead.name || initialContactName,
              email: cachedLead.EMail || cachedLead.email || initialContactEmail,
              phone: cachedLead.Phone || cachedLead.phone || initialContactPhone,
            });
            setLoadingLead(false);
            return;
          }
        }

        // If not in cache, fetch from API
        const token = authState?.token;
        const serverConfig = authState?.serverConfig;

        if (!token || !serverConfig) {
          setLeadData({
            name: initialContactName,
            email: initialContactEmail,
            phone: initialContactPhone,
          });
          setLoadingLead(false);
          return;
        }

        const baseUrl = `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.port}/api/v1`;
        const url = `${baseUrl}/models/AD_User/${contactId}`;

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setLeadData({
            name: data.Name || initialContactName,
            email: data.EMail || '',
            phone: data.Phone || '',
          });
        } else {
          // Fallback to initial data
          setLeadData({
            name: initialContactName,
            email: initialContactEmail,
            phone: initialContactPhone,
          });
        }
      } catch (error) {
        console.error('Error fetching lead data:', error);
        setLeadData({
          name: initialContactName,
          email: initialContactEmail,
          phone: initialContactPhone,
        });
      } finally {
        setLoadingLead(false);
      }
    };

    fetchLeadData();
  }, [contactId, initialContactName, initialContactEmail, initialContactPhone, queryClient, authState]);

  // Use leadData for display
  const contactName = leadData?.name || initialContactName;
  const contactEmail = leadData?.email || '';
  const contactPhone = leadData?.phone || '';

  // ============================================
  // INITIALIZE FORM DATA
  // ============================================
  useEffect(() => {
    setFormData({
      documentNo: documentNo,
      businessPartnerId: businessPartnerId,
      businessPartnerName: businessPartnerName,
      contactId: contactId,
      contactName: contactName,
      contactEmail: contactEmail,
      contactPhone: contactPhone,
      salesRepId: salesRepId,
      salesRepName: salesRepName,
      salesRepEmail: salesRepEmail,
      stageId: stageId,
      stageName: stageName,
      probability: probability.toString(),
      campaignId: campaignId,
      campaignName: campaignName || '',
      expectedCloseDate: expectedCloseDate || '',
      amount: opportunityAmount.toString(),
      currencyId: currencyId,
      currencyCode: currencyCode,
      description: description || '',
      comments: comments || '',
      isActive: isActive,
    });
  }, [opportunity, contactName, contactEmail, contactPhone]);

  // ============================================
  // FETCH FUNCTIONS
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
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
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

  const fetchStages = async () => {
    setIsLoadingStages(true);
    setStagesError(null);
    try {
      const url = buildApiUrl('models/C_SalesStage');
      const data = await makeAuthenticatedRequest(url);
      setStages(data.records || []);
    } catch (error) {
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
      const data = await makeAuthenticatedRequest(url);
      setCurrencies(data.records || []);
    } catch (error) {
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
      const data = await makeAuthenticatedRequest(url);
      setCampaigns(data.records || []);
    } catch (error) {
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
      const data = await makeAuthenticatedRequest(url);
      setSalesRepsData(data.records || []);
    } catch (error) {
      setSalesRepsError(error.message);
    } finally {
      setIsLoadingSalesReps(false);
    }
  };

  const fetchBusinessPartners = async () => {
    setIsLoadingBusinessPartners(true);
    setBusinessPartnersError(null);
    try {
      const url = buildApiUrl('models/C_BPartner');
      const data = await makeAuthenticatedRequest(url);
      setBusinessPartnersData(data.records || []);
    } catch (error) {
      setBusinessPartnersError(error.message);
    } finally {
      setIsLoadingBusinessPartners(false);
    }
  };

  const fetchContactsForBP = async (bpId) => {
    if (!bpId) return;
    setIsLoadingContacts(true);
    try {
      const url = buildApiUrl('models/AD_User', `C_BPartner_ID eq ${bpId}`);
      const data = await makeAuthenticatedRequest(url);
      setContactsData(data.records || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  // ============================================
  // FILTERED DATA FOR MODALS
  // ============================================
  const filteredBusinessPartners = useMemo(() => {
    if (!bpSearch.trim()) return businessPartnersData;
    const query = bpSearch.toLowerCase();
    return businessPartnersData.filter(bp =>
      bp.Name && bp.Name.toLowerCase().includes(query)
    );
  }, [businessPartnersData, bpSearch]);

  const filteredSalesReps = useMemo(() => {
    if (!salesRepSearch.trim()) return salesRepsData;
    const query = salesRepSearch.toLowerCase();
    return salesRepsData.filter(rep => 
      rep.Name && rep.Name.toLowerCase().includes(query)
    );
  }, [salesRepsData, salesRepSearch]);

  const filteredContacts = useMemo(() => {
    if (!contactSearch.trim()) return contactsData;
    const query = contactSearch.toLowerCase();
    return contactsData.filter(contact =>
      (contact.Name && contact.Name.toLowerCase().includes(query)) ||
      (contact.EMail && contact.EMail.toLowerCase().includes(query))
    );
  }, [contactsData, contactSearch]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleSelectBusinessPartner = useCallback((bp) => {
    setFormData(prev => ({
      ...prev,
      businessPartnerId: bp.id,
      businessPartnerName: bp.Name,
    }));
    setShowBPModal(false);
    setBpSearch('');
    fetchContactsForBP(bp.id);
  }, []);

  const handleClearBusinessPartner = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      businessPartnerId: null,
      businessPartnerName: '',
      contactId: null,
      contactName: '',
      contactEmail: '',
      contactPhone: '',
    }));
    setContactsData([]);
  }, []);

  const handleSelectContact = useCallback((contact) => {
    setFormData(prev => ({
      ...prev,
      contactId: contact.id,
      contactName: contact.Name,
      contactEmail: contact.EMail || '',
      contactPhone: contact.Phone || '',
    }));
    setShowContactModal(false);
    setContactSearch('');
  }, []);

  const handleClearContact = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      contactId: null,
      contactName: '',
      contactEmail: '',
      contactPhone: '',
    }));
  }, []);

  const handleSelectSalesRep = useCallback((rep) => {
    setFormData(prev => ({
      ...prev,
      salesRepId: rep.id,
      salesRepName: rep.Name,
      salesRepEmail: rep.EMail || '',
    }));
    setShowSalesRepModal(false);
    setSalesRepSearch('');
  }, []);

  const handleClearSalesRep = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      salesRepId: null,
      salesRepName: '',
      salesRepEmail: '',
    }));
  }, []);

  const handleStageChange = useCallback((id) => {
    setFormData(prev => ({ ...prev, stageId: id }));
    const stage = stages.find(s => s.id === id);
    if (stage?.Probability) {
      setFormData(prev => ({ ...prev, probability: stage.Probability.toString() }));
    }
  }, [stages]);

  const handleCurrencyChange = useCallback((id) => {
    setFormData(prev => ({ ...prev, currencyId: id }));
    const currency = currencies.find(c => c.id === id);
    if (currency?.ISO_Code) {
      setFormData(prev => ({ ...prev, currencyCode: currency.ISO_Code }));
    }
  }, [currencies]);

  const validate = () => {
    const errors = {};
    
    if (!formData.businessPartnerId) errors.bp = 'Business Partner is required';
    if (!formData.contactId) errors.contact = 'Contact is required';
    if (!formData.salesRepId) errors.salesRep = 'Sales Representative is required';
    if (!formData.stageId) errors.stage = 'Sales Stage is required';
    if (!formData.expectedCloseDate) errors.date = 'Expected Close Date is required';
    if (!formData.amount) errors.amount = 'Opportunity Amount is required';
    if (!formData.currencyId) errors.currency = 'Currency is required';
    if (formData.amount && isNaN(Number(formData.amount))) {
      errors.amount = 'Amount must be a valid number';
    }

    return errors;
  };

  const handleSave = () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      showValidationAlert('Please fill in all required fields');
      return;
    }

    const updates = {
      Name: formData.documentNo,
      C_BPartner_ID: { id: formData.businessPartnerId },
      AD_User_ID: { id: formData.contactId },
      SalesRep_ID: { id: formData.salesRepId },
      C_SalesStage_ID: { id: formData.stageId },
      Probability: parseFloat(formData.probability) || 0,
      ExpectedCloseDate: formData.expectedCloseDate,
      OpportunityAmt: parseFloat(formData.amount) || 0,
      C_Currency_ID: { id: formData.currencyId },
      Description: formData.description,
      Comments: formData.comments,
      IsActive: formData.isActive,
    };

    if (formData.campaignId) {
      updates.C_Campaign_ID = { id: formData.campaignId };
    }

    updateMutation.mutate({
      id: opportunityId,
      updates: updates
    }, {
      onSuccess: (updatedData) => {
        setOpportunity(updatedData);
        setIsEditMode(false);
        queryClient.setQueryData(['sales-opportunity', opportunityId], updatedData);
        queryClient.invalidateQueries(['sales-opportunities']);
        showSuccessAlert('Opportunity updated successfully!');
      },
      onError: (error) => {
        showErrorAlert(error.message || 'Failed to update opportunity');
      }
    });
  };

  const handleCancel = () => {
    showDiscardAlert(() => {
      setIsEditMode(false);
      // Reset form to original values
      setFormData({
        documentNo: documentNo,
        businessPartnerId: businessPartnerId,
        businessPartnerName: businessPartnerName,
        contactId: contactId,
        contactName: contactName,
        contactEmail: contactEmail,
        contactPhone: contactPhone,
        salesRepId: salesRepId,
        salesRepName: salesRepName,
        salesRepEmail: salesRepEmail,
        stageId: stageId,
        stageName: stageName,
        probability: probability.toString(),
        campaignId: campaignId,
        campaignName: campaignName || '',
        expectedCloseDate: expectedCloseDate || '',
        amount: opportunityAmount.toString(),
        currencyId: currencyId,
        currencyCode: currencyCode,
        description: description || '',
        comments: comments || '',
        isActive: isActive,
      });
    });
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      handleSave();
    } else {
      // Fetch all required data when entering edit mode
      Promise.all([
        fetchStages(),
        fetchCurrencies(),
        fetchCampaigns(),
        fetchSalesRepresentatives(),
        fetchBusinessPartners(),
        businessPartnerId && fetchContactsForBP(businessPartnerId)
      ]);
      setIsEditMode(true);
    }
  };

  const handleStatusUpdate = (newStatus) => {
    setStatusMenuVisible(false);
    
    updateMutation.mutate({
      id: opportunityId,
      updates: { OpportunityStatus: newStatus }
    }, {
      onSuccess: (updatedData) => {
        setOpportunity(updatedData);
        queryClient.invalidateQueries(['sales-opportunity', opportunityId]);
        queryClient.invalidateQueries(['sales-opportunities']);
        showSuccessAlert(`Status updated to ${newStatus}`);
      },
      onError: (error) => {
        showErrorAlert(error.message || 'Failed to update status');
      }
    });
  };

  const handlePhoneCall = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`).catch(() => {
        showErrorAlert('Cannot open phone app');
      });
    } else {
      showValidationAlert('No phone number available');
    }
  };

  const handleEmail = (email) => {
    if (email) {
      Linking.openURL(`mailto:${email}`).catch(() => {
        showErrorAlert('Cannot open email app');
      });
    } else {
      showValidationAlert('No email address available');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries(['sales-opportunity', opportunityId]);
      await queryClient.invalidateQueries(['sales-opportunities']);
      // Also refresh lead data
      if (contactId) {
        const token = authState?.token;
        const serverConfig = authState?.serverConfig;
        if (token && serverConfig) {
          const baseUrl = `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.port}/api/v1`;
          const url = `${baseUrl}/models/AD_User/${contactId}`;
          const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setLeadData({
              name: data.Name,
              email: data.EMail,
              phone: data.Phone,
            });
          }
        }
      }
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Render Business Partner Item
  const renderBusinessPartnerItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={[
        styles.itemRow,
        formData.businessPartnerId === item.id && styles.selectedItemRow,
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
      {formData.businessPartnerId === item.id && (
        <MaterialCommunityIcons name="check-circle" size={Layout.iconSize.md} color={Colors.primary} />
      )}
    </TouchableOpacity>
  ), [formData.businessPartnerId, handleSelectBusinessPartner]);

  // Render Contact Item
  const renderContactItem = useCallback(({ item }) => {
    const details = [];
    if (item.EMail) details.push(item.EMail);
    if (item.Phone) details.push(item.Phone);
    
    return (
      <TouchableOpacity
        style={[
          styles.itemRow,
          formData.contactId === item.id && styles.selectedItemRow,
        ]}
        onPress={() => handleSelectContact(item)}
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
            {details.length > 0 && (
              <Text style={styles.itemSubtext} numberOfLines={1}>
                {details.join(' • ')}
              </Text>
            )}
          </View>
        </View>
        {formData.contactId === item.id && (
          <MaterialCommunityIcons name="check-circle" size={Layout.iconSize.md} color={Colors.primary} />
        )}
      </TouchableOpacity>
    );
  }, [formData.contactId, handleSelectContact]);

  // Render Sales Rep Item
  const renderSalesRepItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={[
        styles.itemRow,
        formData.salesRepId === item.id && styles.selectedItemRow,
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
      {formData.salesRepId === item.id && (
        <MaterialCommunityIcons name="check-circle" size={Layout.iconSize.md} color={Colors.primary} />
      )}
    </TouchableOpacity>
  ), [formData.salesRepId, handleSelectSalesRep]);

  // ============================================
  // RENDER METHODS
  // ============================================
  const renderViewMode = () => {
    if (loadingLead && activeTab === 'lead') {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading contact data...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'details':
        return (
          <View style={styles.sectionCard}>
            <SectionHeader title="Opportunity Details" />
            <View style={styles.sectionContent}>
              <ViewRow label="Document No" value={documentNo} />
              <ViewRow label="Stage" value={stageName} />
              <ViewRow label="Expected Close Date" value={formatDate(expectedCloseDate)} />
              <ViewRow label="Probability" value={`${probability}%`} />
              <ViewRow label="Amount" value={new Intl.NumberFormat('en-PK', {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 0,
              }).format(opportunityAmount)} />
              <ViewRow label="Currency" value={currencyCode} />
              {campaignName && <ViewRow label="Campaign" value={campaignName} />}
              <ViewRow label="Created Date" value={formatDate(createdDate)} />
              <ViewRow label="Last Updated" value={formatDate(updatedDate)} />
            </View>
          </View>
        );

      case 'lead':
        return (
          <View style={styles.sectionCard}>
            <SectionHeader title="Contact Information" />
            <View style={styles.sectionContent}>
              <ClickableViewRow 
                label="Contact Name"
                value={contactName}
                onPress={() => contactId && navigation.navigate('LeadDetails', { 
                  data: { id: contactId, Name: contactName, EMail: contactEmail, Phone: contactPhone }
                })}
              />
              
              {contactEmail ? (
                <ClickableViewRow 
                  label="Email"
                  value={contactEmail}
                  onPress={() => handleEmail(contactEmail)}
                  icon="email"
                />
              ) : (
                <ViewRow label="Email" value="Not provided" />
              )}
              
              {contactPhone ? (
                <ClickableViewRow 
                  label="Phone"
                  value={contactPhone}
                  onPress={() => handlePhoneCall(contactPhone)}
                  icon="phone"
                />
              ) : (
                <ViewRow label="Phone" value="Not provided" />
              )}
            </View>
          </View>
        );

      case 'company':
        return (
          <View style={styles.sectionCard}>
            <SectionHeader title="Company Information" />
            <View style={styles.sectionContent}>
              <ClickableViewRow 
                label="Company Name"
                value={businessPartnerName}
                onPress={() => businessPartnerId && navigation.navigate('BusinessPartnerDetail', { 
                  id: businessPartnerId, name: businessPartnerName 
                })}
              />
              <ViewRow label="Sales Representative" value={salesRepName} />
              {salesRepEmail && (
                <ClickableViewRow 
                  label="Sales Rep Email"
                  value={salesRepEmail}
                  onPress={() => handleEmail(salesRepEmail)}
                  icon="email"
                />
              )}
            </View>
          </View>
        );

      case 'description':
        return (
          <View style={styles.sectionCard}>
            <SectionHeader title="Description & Comments" />
            <View style={styles.sectionContent}>
              {description ? (
                <View style={styles.textBlock}>
                  <Text style={styles.viewLabel}>DESCRIPTION</Text>
                  <Text style={styles.viewValue}>{description}</Text>
                </View>
              ) : null}
              
              {comments ? (
                <View style={[styles.textBlock, description && styles.textBlockWithGap]}>
                  <Text style={styles.viewLabel}>COMMENTS</Text>
                  <Text style={[styles.viewValue, styles.commentsText]}>{comments}</Text>
                </View>
              ) : null}

              {!description && !comments && (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="text" size={Layout.iconSize.lg} color={Colors.border} />
                  <Text style={styles.emptyStateText}>No description or comments</Text>
                </View>
              )}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const renderEditMode = () => {
    const errors = validate();
    
    return (
      <View style={styles.formCard}>
        {/* Document No (Read Only) */}
        <Label title="Document No" />
        <ReadOnly value={formData.documentNo} icon="file-document-outline" />

        {/* Business Partner - Modal Selector */}
        <BusinessPartnerSelector 
          selectedBPName={formData.businessPartnerName}
          error={errors.bp}
          onPress={() => {
            setShowBPModal(true);
            fetchBusinessPartners();
          }}
          onClear={handleClearBusinessPartner}
        />

        {/* Contact - Modal Selector */}
        <ContactSelector 
          selectedContactName={formData.contactName}
          selectedContactDetails={
            formData.contactEmail || formData.contactPhone
              ? [formData.contactEmail, formData.contactPhone].filter(Boolean).join(' • ')
              : null
          }
          error={errors.contact}
          onPress={() => {
            if (formData.businessPartnerId) {
              setShowContactModal(true);
              fetchContactsForBP(formData.businessPartnerId);
            } else {
              showValidationAlert('Please select a Business Partner first');
            }
          }}
          onClear={handleClearContact}
        />

        {/* Sales Representative - Modal Selector */}
        <SalesRepSelector 
          selectedSalesRepName={formData.salesRepName}
          error={errors.salesRep}
          onPress={() => {
            setShowSalesRepModal(true);
            fetchSalesRepresentatives();
          }}
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
            selectedValue={formData.stageId}
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
        <Label title="Probability (%)" />
        <Input
          value={formData.probability}
          onChangeText={(text) => {
            const filtered = text.replace(/[^0-9.]/g, '');
            setFormData(prev => ({ ...prev, probability: filtered }));
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
            selectedValue={formData.campaignId}
            onValueChange={(id) => {
              setFormData(prev => ({ ...prev, campaignId: id }));
              const campaign = campaigns.find(c => c.id === id);
              if (campaign) {
                setFormData(prev => ({ ...prev, campaignName: campaign.Name }));
              }
            }}
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
          value={formData.expectedCloseDate}
          onPress={() => setShowCalendar(true)}
          error={errors.date}
          icon="calendar-clock"
        />

        {/* Opportunity Amount */}
        <Label title="Opportunity Amount" required />
        <Input
          value={formData.amount}
          onChangeText={(v) => {
            setFormData(prev => ({ ...prev, amount: v }));
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
        ) : currenciesError ? (
          <ErrorRetry message={currenciesError} onRetry={fetchCurrencies} />
        ) : (
          <PickerField
            selectedValue={formData.currencyId}
            onValueChange={handleCurrencyChange}
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
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
          placeholder="Enter description"
          multiline
          numberOfLines={3}
          style={styles.textArea}
          icon="text"
        />

        {/* Comments */}
        <Label title="Comments" />
        <Input
          value={formData.comments}
          onChangeText={(text) => setFormData(prev => ({ ...prev, comments: text }))}
          placeholder="Enter comments"
          multiline
          numberOfLines={3}
          style={styles.textArea}
          icon="comment-text"
        />

        {/* Tenant */}
        <Label title="Tenant" />
        <ReadOnly value={authState?.clientName} icon="domain" />

        {/* Organization */}
        <Label title="Organization" />
        <ReadOnly value={authState?.organizationName} icon="office-building" />

        {/* Active Switch */}
        <SwitchRow 
          label="Active" 
          value={formData.isActive} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value }))}
          disabled={false}
        />
      </View>
    );
  };

  if (!opportunity) {
    return (
      <View style={styles.container}>
        <CustomHeader
          title="Opportunity Details"
          LeftIcon="arrow-left"
          LeftPress={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={Layout.iconSize.xxl} color={Colors.error} />
          <Text style={styles.errorText}>Failed to load opportunity details</Text>
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
        title={isEditMode ? "Edit Opportunity" : "Opportunity Details"}
        LeftIcon="arrow-left"
        LeftPress={() => isEditMode ? handleCancel() : navigation.goBack()}
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
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          !isEditMode && <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {formData.businessPartnerName && formData.businessPartnerName !== 'No Company' 
                    ? formData.businessPartnerName.charAt(0).toUpperCase()
                    : formData.documentNo?.charAt(0).toUpperCase() || 'O'}
                </Text>
              </View>
              <View style={styles.headerInfo}>
                {isEditMode ? (
                  <>
                    <TextInput
                      style={styles.editNameInput}
                      value={formData.documentNo}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, documentNo: text }))}
                      placeholder="Document No"
                      placeholderTextColor={Colors.textTertiary}
                    />
                    <Text style={styles.opportunitySubtitle}>
                      {formData.businessPartnerName || 'No Company'}
                    </Text>
                  </>
                ) : (
                  <>
                    <TouchableOpacity 
                      onPress={() => businessPartnerId && navigation.navigate('BusinessPartnerDetail', { 
                        id: businessPartnerId, name: businessPartnerName 
                      })}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.companyNameHeader} numberOfLines={1}>
                        {businessPartnerName}
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.opportunitySubtitle} numberOfLines={1}>
                      {documentNo}
                    </Text>
                  </>
                )}
              </View>
            </View>

            {/* Status Badge */}
            {!isEditMode && (
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
                {Object.keys(STATUS_CONFIG).map((statusKey, index) => (
                  <React.Fragment key={statusKey}>
                    <Menu.Item
                      onPress={() => handleStatusUpdate(statusKey)}
                      title={statusKey}
                      titleStyle={[
                        styles.menuItemTitle,
                        status === statusKey && styles.menuItemSelected
                      ]}
                    />
                    {index < Object.keys(STATUS_CONFIG).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </Menu>
            )}
          </View>

          {/* Amount Display */}
          {!isEditMode && (
            <View style={styles.amountContainer}>
              <View style={styles.amountHeader}>
                <Text style={styles.amountLabel}>OPPORTUNITY VALUE</Text>
              </View>
              <Text style={styles.amountValue}>
                {new Intl.NumberFormat('en-PK', {
                  style: 'currency',
                  currency: currencyCode,
                  minimumFractionDigits: 0,
                }).format(opportunityAmount)}
              </Text>
              <View style={styles.probabilityRow}>
                <View style={styles.probabilityBarContainer}>
                  <View style={styles.probabilityBar}>
                    <View 
                      style={[
                        styles.probabilityFill, 
                        { width: `${probability}%`, backgroundColor: Colors.primary }
                      ]} 
                    />
                  </View>
                </View>
                <Text style={styles.probabilityText}>{probability}%</Text>
              </View>
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabsWrapper}>
          <View style={styles.tabsContainer}>
            <TabButton 
              title="Details" 
              active={!isEditMode && activeTab === 'details'} 
              onPress={() => !isEditMode && setActiveTab('details')}
              isFirst={true}
              isLast={false}
            />
            <TabButton 
              title="Lead" 
              active={!isEditMode && activeTab === 'lead'} 
              onPress={() => !isEditMode && setActiveTab('lead')}
              isFirst={false}
              isLast={false}
            />
            <TabButton 
              title="Company" 
              active={!isEditMode && activeTab === 'company'} 
              onPress={() => !isEditMode && setActiveTab('company')}
              isFirst={false}
              isLast={false}
            />
            <TabButton 
              title="Notes" 
              active={!isEditMode && activeTab === 'description'} 
              onPress={() => !isEditMode && setActiveTab('description')}
              isFirst={false}
              isLast={true}
            />
          </View>
        </View>

        {/* Tab Content */}
        {isEditMode ? renderEditMode() : renderViewMode()}

        {/* Edit Mode Action Buttons */}
        {isEditMode && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.saveButton, updateMutation.isLoading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={updateMutation.isLoading}
              activeOpacity={0.7}
            >
              {updateMutation.isLoading ? (
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
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Calendar Modal */}
      <CalendarModal
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onSelectDate={(date) => {
          setFormData(prev => ({ ...prev, expectedCloseDate: date }));
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

      {/* Contact Modal */}
      <Modal
        visible={showContactModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowContactModal(false);
          setContactSearch('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Contact</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowContactModal(false);
                  setContactSearch('');
                }}
              >
                <MaterialCommunityIcons name="close" size={Layout.iconSize.lg} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearch}>
              <MaterialCommunityIcons name="magnify" size={Layout.iconSize.sm} color={Colors.textSecondary} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search by name or email..."
                placeholderTextColor={Colors.textTertiary}
                value={contactSearch}
                onChangeText={setContactSearch}
                autoFocus={true}
              />
              {contactSearch.length > 0 && (
                <TouchableOpacity onPress={() => setContactSearch('')}>
                  <MaterialCommunityIcons name="close-circle" size={Layout.iconSize.sm} color={Colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {isLoadingContacts ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.modalLoadingText}>Loading...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredContacts}
                renderItem={renderContactItem}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                initialNumToRender={20}
                maxToRenderPerBatch={20}
                windowSize={10}
                ListEmptyComponent={
                  <View style={styles.modalEmpty}>
                    <MaterialCommunityIcons name="account-off" size={Layout.iconSize.xl} color={Colors.border} />
                    <Text style={styles.modalEmptyText}>
                      {contactSearch.trim()
                        ? `No results for "${contactSearch}"`
                        : 'No contacts available for this business partner'}
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
          setSalesRepSearch('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Sales Representative</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowSalesRepModal(false);
                  setSalesRepSearch('');
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
                value={salesRepSearch}
                onChangeText={setSalesRepSearch}
              />
              {salesRepSearch.length > 0 && (
                <TouchableOpacity onPress={() => setSalesRepSearch('')}>
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
      </Modal>
    </KeyboardAvoidingView>
  );
};

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: Colors.background || '#EDEBEB',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background || '#EDEBEB',
  },
  scrollContent: {
    paddingBottom: verticalScale(20),
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.small,
    color: Colors.textSecondary,
  },

  // Header Card
  headerCard: {
    backgroundColor: Colors.cardBackground || '#FFFFFF',
    borderRadius: Layout.borderRadius.md || 8,
    marginHorizontal: Spacing.md || 12,
    marginTop: Spacing.md || 12,
    marginBottom: Spacing.sm || 8,
    padding: Spacing.md || 12,
    borderWidth: 1,
    borderColor: Colors.borderLight || '#F0F0F0',
    shadowColor: Colors.shadow || '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm || 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm || 8,
  },
  avatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: Colors.primary || '#2F4FE3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm || 8,
  },
  avatarText: {
    fontSize: Typography.fontSize.h4 || 16,
    fontFamily: Typography.fontFamily.bold || 'K2D-Bold',
    color: Colors.textInverse || '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
  },
  companyNameHeader: {
    fontSize: Typography.fontSize.h4 || 16,
    fontFamily: Typography.fontFamily.bold || 'K2D-Bold',
    color: Colors.textPrimary || '#333333',
    marginBottom: 2,
  },
  opportunitySubtitle: {
    fontSize: Typography.fontSize.small || 12,
    fontFamily: Typography.fontFamily.regular || 'K2D-Regular',
    color: Colors.textSecondary || '#666666',
  },
  editNameInput: {
    fontSize: Typography.fontSize.h4 || 16,
    fontFamily: Typography.fontFamily.bold || 'K2D-Bold',
    color: Colors.textPrimary || '#333333',
    padding: 0,
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border || '#E0E0E0',
  },

  // Status Badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs || 4,
    paddingVertical: 2,
    borderRadius: Layout.borderRadius.round || 20,
    gap: 2,
  },
  statusBadgeText: {
    fontSize: Typography.fontSize.xsmall || 10,
    fontFamily: Typography.fontFamily.regular || 'K2D-Regular',
  },
  dot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
  },

  // Amount Display
  amountContainer: {
    backgroundColor: Colors.backgroundLight || '#F5F5F5',
    borderRadius: Layout.borderRadius.sm || 4,
    padding: Spacing.sm || 8,
  },
  amountHeader: {
    marginBottom: 2,
  },
  amountLabel: {
    fontSize: Typography.fontSize.xsmall || 10,
    fontFamily: Typography.fontFamily.bold || 'K2D-Bold',
    color: Colors.textSecondary || '#666666',
  },
  amountValue: {
    fontSize: Typography.fontSize.h3 || 20,
    fontFamily: Typography.fontFamily.bold || 'K2D-Bold',
    color: Colors.primary || '#2F4FE3',
    marginBottom: 8,
  },
  probabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm || 8,
  },
  probabilityBarContainer: {
    flex: 1,
  },
  probabilityBar: {
    height: scale(6),
    backgroundColor: Colors.border || '#E0E0E0',
    borderRadius: Layout.borderRadius.round || 20,
    overflow: 'hidden',
  },
  probabilityFill: {
    height: '100%',
    borderRadius: Layout.borderRadius.round || 20,
  },
  probabilityText: {
    fontSize: Typography.fontSize.small || 12,
    fontFamily: Typography.fontFamily.bold || 'K2D-Bold',
    color: Colors.primary || '#2F4FE3',
    minWidth: scale(40),
    textAlign: 'right',
  },

  // Tabs
  tabsWrapper: {
    marginHorizontal: Spacing.md || 12,
    marginBottom: 0,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground || '#FFFFFF',
    borderRadius: Layout.borderRadius.md || 8,
    borderWidth: 1,
    borderColor: Colors.borderLight || '#F0F0F0',
    padding: 2,
    shadowColor: Colors.shadow || '#000',
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
    borderRadius: Layout.borderRadius.sm || 4,
  },
  tabButtonFirst: {
    borderTopLeftRadius: Layout.borderRadius.sm || 4,
    borderBottomLeftRadius: Layout.borderRadius.sm || 4,
  },
  tabButtonLast: {
    borderTopRightRadius: Layout.borderRadius.sm || 4,
    borderBottomRightRadius: Layout.borderRadius.sm || 4,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary || '#2F4FE3',
    shadowColor: Colors.primary || '#2F4FE3',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: Typography.fontSize.small || 12,
    fontFamily: Typography.fontFamily.medium || 'K2D-Medium',
    color: Colors.textSecondary || '#666666',
  },
  tabButtonTextActive: {
    color: Colors.textInverse || '#FFFFFF',
    fontFamily: Typography.fontFamily.semiBold || 'K2D-SemiBold',
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
    borderTopColor: Colors.primary || '#2F4FE3',
  },

  // Section Cards
  sectionCard: {
    backgroundColor: Colors.cardBackground || '#FFFFFF',
    borderRadius: Layout.borderRadius.md || 8,
    marginHorizontal: Spacing.md || 12,
    marginTop: verticalScale(8),
    marginBottom: Spacing.sm || 8,
    borderWidth: 1,
    borderColor: Colors.borderLight || '#F0F0F0',
    overflow: 'hidden',
    shadowColor: Colors.shadow || '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.md || 12,
    paddingVertical: Spacing.xs || 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight || '#F0F0F0',
    backgroundColor: Colors.backgroundLight || '#F5F5F5',
  },
  sectionTitle: {
    fontSize: Typography.fontSize.small || 12,
    fontFamily: Typography.fontFamily.bold || 'K2D-Bold',
    color: Colors.textPrimary || '#333333',
  },
  sectionContent: {
    padding: Spacing.sm || 8,
  },

  // Form Card for Edit Mode
  formCard: {
    backgroundColor: Colors.cardBackground || '#FFFFFF',
    borderRadius: Layout.borderRadius.md || 8,
    marginHorizontal: Spacing.md || 12,
    marginTop: verticalScale(8),
    marginBottom: Spacing.sm || 8,
    padding: Spacing.md || 12,
    borderWidth: 1,
    borderColor: Colors.borderLight || '#F0F0F0',
    shadowColor: Colors.shadow || '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // View Mode Row
  viewRow: {
    marginBottom: Spacing.sm || 8,
    paddingBottom: Spacing.xs || 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight || '#F0F0F0',
  },
  viewLabel: {
    fontSize: Typography.fontSize.small || 12,
    fontFamily: Typography.fontFamily.bold || 'K2D-Bold',
    color: Colors.textSecondary || '#666666',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  viewValue: {
    fontSize: Typography.fontSize.xsmall || 10,
    fontFamily: Typography.fontFamily.regular || 'K2D-Regular',
    color: Colors.textPrimary || '#333333',
    lineHeight: 16,
  },
  viewValueWithIcon: {
    marginRight: Spacing.sm || 8,
  },
  clickableValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clickableIcon: {
    marginLeft: Spacing.xs,
  },

  // Edit Mode Fields
  label: {
    fontSize: Typography.fontSize.small || 12,
    fontFamily: Typography.fontFamily.bold || 'K2D-Bold',
    color: Colors.textSecondary || '#666666',
    marginTop: Spacing.md || 12,
    marginBottom: Spacing.xxs || 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  requiredStar: {
    color: Colors.error,
    fontSize: Typography.fontSize.small || 12,
    fontFamily: Typography.fontFamily.bold || 'K2D-Bold',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xxs || 2,
  },
  editField: {
    marginBottom: Spacing.md || 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight || '#F5F5F5',
    borderWidth: 1,
    borderColor: Colors.border || '#E0E0E0',
    borderRadius: Layout.borderRadius.sm || 4,
    minHeight: 42,
    shadowColor: Colors.shadow || '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputError: {
    borderColor: Colors.error,
    borderWidth: 1.5,
  },
  inputIcon: {
    paddingLeft: Spacing.sm || 8,
  },
  input: {
    flex: 1,
    height: 42,
    paddingHorizontal: Spacing.sm || 8,
    fontSize: Typography.fontSize.small || 12,
    fontFamily: Typography.fontFamily.regular || 'K2D-Regular',
    color: Colors.textPrimary || '#333333',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  inputWithIcon: {
    paddingLeft: Spacing.xs || 4,
  },
  readOnlyContainer: {
    backgroundColor: Colors.backgroundLight || '#F5F5F5',
    opacity: 0.9,
  },
  readOnlyText: {
    flex: 1,
    paddingHorizontal: Spacing.sm || 8,
    fontSize: Typography.fontSize.small || 12,
    fontFamily: Typography.fontFamily.regular || 'K2D-Regular',
    color: Colors.textPrimary || '#333333',
    textAlignVertical: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight || '#F5F5F5',
    borderWidth: 1,
    borderColor: Colors.border || '#E0E0E0',
    borderRadius: Layout.borderRadius.sm || 4,
    minHeight: 42,
    shadowColor: Colors.shadow || '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pickerIcon: {
    paddingLeft: Spacing.sm || 8,
  },
  picker: {
    flex: 1,
    height: 42,
    color: Colors.textPrimary || '#333333',
  },
  pickerWithIcon: {
    marginLeft: -Spacing.xs || -4,
  },
  dateText: {
    flex: 1,
    paddingHorizontal: Spacing.sm || 8,
    fontSize: Typography.fontSize.small || 12,
    fontFamily: Typography.fontFamily.regular || 'K2D-Regular',
    color: Colors.textPrimary || '#333333',
  },
  dateIcon: {
    paddingRight: Spacing.sm || 8,
  },
  textArea: {
    minHeight: verticalScale(80) || 80,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm || 8,
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.fontSize.xsmall || 10,
    fontFamily: Typography.fontFamily.regular || 'K2D-Regular',
    marginTop: Spacing.xxs || 2,
    marginLeft: Spacing.xs || 4,
  },

  // Selector Styles
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundLight || '#F5F5F5',
    borderWidth: 1,
    borderColor: Colors.border || '#E0E0E0',
    borderRadius: Layout.borderRadius.sm || 4,
    paddingHorizontal: Spacing.sm || 8,
    paddingVertical: 0,
    height: 42,
    shadowColor: Colors.shadow || '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    gap: Spacing.xs || 4,
    marginRight: Spacing.xs || 4,
  },
  selectedItemText: {
    flex: 1,
    fontSize: Typography.fontSize.small || 12,
    color: Colors.textPrimary || '#333333',
    fontFamily: Typography.fontFamily.regular || 'K2D-Regular',
  },
  contactSelectorText: {
    flex: 1,
  },
  contactSelectorDetails: {
    fontSize: Typography.fontSize.xsmall || 10,
    color: Colors.textSecondary || '#666666',
    fontFamily: Typography.fontFamily.regular || 'K2D-Regular',
  },
  placeholderText: {
    fontSize: Typography.fontSize.small || 12,
    color: Colors.textTertiary || '#999999',
    fontFamily: Typography.fontFamily.regular || 'K2D-Regular',
  },
  clearButton: {
    padding: Spacing.xxs || 2,
  },

  // Switch
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md || 12,
    paddingVertical: Spacing.sm || 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight || '#F0F0F0',
  },
  switchLabel: {
    fontSize: Typography.fontSize.small || 12,
    fontFamily: Typography.fontFamily.bold || 'K2D-Bold',
    color: Colors.textSecondary || '#666666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Loader and Error
  loaderContainer: {
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight || '#F5F5F5',
    borderWidth: 1,
    borderColor: Colors.border || '#E0E0E0',
    borderRadius: Layout.borderRadius.sm || 4,
  },
  errorContainer: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.errorLight || '#FDEAEA',
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: Layout.borderRadius.sm || 4,
    paddingHorizontal: Spacing.sm || 8,
  },
  errorRetryText: {
    color: Colors.error,
    fontSize: Typography.fontSize.xsmall || 10,
    fontFamily: Typography.fontFamily.regular || 'K2D-Regular',
    marginLeft: Spacing.xs || 4,
    flex: 1,
  },
  retryButton: {
    paddingHorizontal: Spacing.sm || 8,
    paddingVertical: Spacing.xxs || 2,
    backgroundColor: Colors.error,
    borderRadius: Layout.borderRadius.sm || 4,
  },
  retryButtonText: {
    color: Colors.textInverse || '#FFFFFF',
    fontSize: Typography.fontSize.xsmall || 10,
    fontFamily: Typography.fontFamily.semiBold || 'K2D-SemiBold',
  },

  // Action Buttons
  actionButtons: {
    marginHorizontal: Spacing.md || 12,
    marginTop: Spacing.sm || 8,
    marginBottom: verticalScale(16) || 16,
    gap: Spacing.sm || 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary || '#2F4FE3',
    paddingVertical: 0,
    borderRadius: Layout.borderRadius.md || 6,
    gap: Spacing.sm || 8,
    height: 48,
    shadowColor: Colors.primary || '#2F4FE3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.7,
    backgroundColor: Colors.buttonDisabled || '#A0A0A0',
  },
  saveButtonText: {
    color: Colors.textInverse || '#FFFFFF',
    fontSize: Typography.fontSize.small || 12,
    fontFamily: Typography.fontFamily.semiBold || 'K2D-SemiBold',
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
    borderRadius: Layout.borderRadius.md || 6,
    borderWidth: 1,
    borderColor: Colors.border || '#E0E0E0',
    backgroundColor: Colors.backgroundLight || '#F5F5F5',
    height: 48,
    shadowColor: Colors.shadow || '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cancelButtonText: {
    color: Colors.textSecondary || '#666666',
    fontSize: Typography.fontSize.small || 12,
    fontFamily: Typography.fontFamily.semiBold || 'K2D-SemiBold',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay || 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.cardBackground || '#FFFFFF',
    borderTopLeftRadius: Layout.borderRadius.lg || 12,
    borderTopRightRadius: Layout.borderRadius.lg || 12,
    maxHeight: '80%',
    shadowColor: Colors.shadow || '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md || 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight || '#F0F0F0',
  },
  modalTitle: {
    fontSize: Typography.fontSize.h4 || 18,
    fontFamily: Typography.fontFamily.semiBold || 'K2D-SemiBold',
    color: Colors.textPrimary || '#333333',
  },
  modalSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.md || 12,
    paddingHorizontal: Spacing.sm || 8,
    backgroundColor: Colors.backgroundLight || '#F5F5F5',
    borderWidth: 1,
    borderColor: Colors.border || '#E0E0E0',
    borderRadius: Layout.borderRadius.md || 8,
    gap: Spacing.xs || 4,
    height: verticalScale(42) || 42,
    shadowColor: Colors.shadow || '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modalSearchInput: {
    flex: 1,
    height: verticalScale(42) || 42,
    fontSize: Typography.fontSize.small || 12,
    fontFamily: Typography.fontFamily.regular || 'K2D-Regular',
    color: Colors.textPrimary || '#333333',
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  modalLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(32) || 32,
  },
  modalLoadingText: {
    marginTop: Spacing.sm || 8,
    fontSize: Typography.fontSize.small || 12,
    fontFamily: Typography.fontFamily.regular || 'K2D-Regular',
    color: Colors.textSecondary || '#666666',
  },
  modalEmpty: {
    alignItems: 'center',
    paddingVertical: verticalScale(32) || 32,
  },
  modalEmptyText: {
    marginTop: Spacing.sm || 8,
    fontSize: Typography.fontSize.small || 12,
    fontFamily: Typography.fontFamily.regular || 'K2D-Regular',
    color: Colors.textTertiary || '#999999',
    textAlign: 'center',
    paddingHorizontal: Spacing.xl || 20,
  },

  // Item Row Styles
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(10) || 10,
    paddingHorizontal: Spacing.md || 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight || '#F0F0F0',
  },
  selectedItemRow: {
    backgroundColor: Colors.infoLight || '#F0F9FF',
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemAvatar: {
    width: scale(40) || 40,
    height: scale(40) || 40,
    borderRadius: scale(20) || 20,
    backgroundColor: Colors.primary || '#2F4FE3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm || 8,
    shadowColor: Colors.primary || '#2F4FE3',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  itemAvatarText: {
    fontSize: Typography.fontSize.medium || 14,
    fontFamily: Typography.fontFamily.semiBold || 'K2D-SemiBold',
    color: Colors.textInverse || '#FFFFFF',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: Typography.fontSize.medium || 14,
    fontFamily: Typography.fontFamily.semiBold || 'K2D-SemiBold',
    color: Colors.textPrimary || '#333333',
    marginBottom: Spacing.xxs || 2,
  },
  itemSubtext: {
    fontSize: Typography.fontSize.xsmall || 10,
    fontFamily: Typography.fontFamily.regular || 'K2D-Regular',
    color: Colors.textSecondary || '#666666',
  },

  // Text Block
  textBlock: {
    marginBottom: Spacing.sm || 8,
  },
  textBlockWithGap: {
    marginTop: Spacing.sm || 8,
    paddingTop: Spacing.sm || 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight || '#F0F0F0',
  },
  commentsText: {
    color: Colors.textSecondary || '#666666',
    fontStyle: 'italic',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: verticalScale(16) || 16,
  },
  emptyStateText: {
    fontSize: Typography.fontSize.small || 12,
    fontFamily: Typography.fontFamily.regular || 'K2D-Regular',
    color: Colors.textTertiary || '#999999',
    marginTop: Spacing.xs || 4,
  },

  // Menu Styles
  menuItemTitle: {
    fontSize: Typography.fontSize.small || 12,
    fontFamily: Typography.fontFamily.regular || 'K2D-Regular',
  },
  menuItemSelected: {
    color: Colors.primary || '#2F4FE3',
    fontFamily: Typography.fontFamily.semiBold || 'K2D-SemiBold',
  },

  // Error States
  fullScreenError: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background || '#EDEBEB',
    padding: Spacing.xxl || 24,
  },
  fullScreenErrorText: {
    fontSize: Typography.fontSize.h4 || 18,
    fontFamily: Typography.fontFamily.medium || 'K2D-Medium',
    color: Colors.textPrimary || '#333333',
    textAlign: 'center',
    marginTop: Spacing.md || 12,
    marginBottom: Spacing.lg || 16,
  },
  fullScreenRetryButton: {
    backgroundColor: Colors.primary || '#2F4FE3',
    paddingHorizontal: Spacing.xl || 20,
    paddingVertical: Spacing.md || 12,
    borderRadius: Layout.borderRadius.md || 6,
  },
  fullScreenRetryButtonText: {
    color: Colors.textInverse || '#FFFFFF',
    fontSize: Typography.fontSize.medium || 14,
    fontFamily: Typography.fontFamily.semiBold || 'K2D-SemiBold',
  },
  errorText: {
    fontSize: Typography.fontSize.h4 || 18,
    fontFamily: Typography.fontFamily.semiBold || 'K2D-SemiBold',
    color: Colors.textPrimary || '#333333',
    marginTop: Spacing.md || 12,
    marginBottom: Spacing.sm || 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary || '#2F4FE3',
    paddingHorizontal: Spacing.xl || 20,
    paddingVertical: 0,
    borderRadius: Layout.borderRadius.md || 6,
    height: 48,
    justifyContent: 'center',
    shadowColor: Colors.primary || '#2F4FE3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  retryButtonText: {
    color: Colors.textInverse || '#FFFFFF',
    fontSize: Typography.fontSize.medium || 14,
    fontFamily: Typography.fontFamily.semiBold || 'K2D-SemiBold',
  },
});

export default SalesOpportunityDetail;