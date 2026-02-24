// screens/SalesOpportunityDetail/SalesOpportunityDetail.js - FIXED with dynamic currency
import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useQueryClient } from 'react-query';
import theme from '../../constants/CRMTheme/CRMTheme';
import moment from 'moment';
import { Menu, Divider } from 'react-native-paper';
import { useUpdateSalesOpportunity } from '../../hooks/CRMhooks/useCRM';

const { Colors, Typography, Layout, Spacing } = theme;
const { scale, verticalScale } = Layout;

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
  >
    <Text style={styles.viewLabel}>{label}</Text>
    <View style={styles.clickableValueContainer}>
      <Text style={styles.viewValue}>{value || 'Not provided'}</Text>
      {icon && (
        <MaterialCommunityIcons name={icon} size={Layout.iconSize.sm} color={Colors.textSecondary} />
      )}
    </View>
  </TouchableOpacity>
);

// Edit Mode Input Field
const EditField = ({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false, editable = true }) => (
  <View style={styles.editField}>
    <Text style={styles.editLabel}>{label}</Text>
    <View style={[styles.inputWrapper, !editable && styles.inputDisabled]}>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
        editable={editable}
      />
    </View>
  </View>
);

// Amount Display Component with Visual Bar and Dynamic Currency
const AmountDisplay = ({ amount, probability, isEditMode, onAmountChange, onProbabilityChange, currencyCode = 'PKR' }) => {
  const formattedAmount = new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);

  if (isEditMode) {
    return (
      <View style={styles.amountContainer}>
        <View style={styles.editAmountRow}>
          <View style={styles.editAmountField}>
            <Text style={styles.editAmountLabel}>OPPORTUNITY VALUE</Text>
            <TextInput
              style={styles.editAmountInput}
              value={amount?.toString()}
              onChangeText={onAmountChange}
              placeholder="Enter amount"
              keyboardType="numeric"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>
          <View style={styles.editProbabilityField}>
            <Text style={styles.editAmountLabel}>PROBABILITY %</Text>
            <TextInput
              style={styles.editAmountInput}
              value={probability?.toString()}
              onChangeText={onProbabilityChange}
              placeholder="0-100"
              keyboardType="numeric"
              placeholderTextColor={Colors.textTertiary}
              maxLength={3}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.amountContainer}>
      <View style={styles.amountHeader}>
        <Text style={styles.amountLabel}>OPPORTUNITY VALUE</Text>
      </View>
      <Text style={styles.amountValue}>{formattedAmount}</Text>
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
  );
};

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  return moment(dateString).format('DD MMM YYYY');
};

const SalesOpportunityDetail = ({ route, navigation }) => {
  const { data: initialOpportunity } = route.params || {};
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // State for current opportunity data (this will be updated after save)
  const [opportunity, setOpportunity] = useState(initialOpportunity);

  // Update mutation
  const updateMutation = useUpdateSalesOpportunity();

  // Edit mode form state
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    probability: '',
    stage: '',
    expectedCloseDate: '',
    description: '',
    comments: '',
    leadName: '',
    leadEmail: '',
    leadPhone: '',
    businessPartnerName: '',
    salesRepName: '',
    salesRepEmail: '',
  });

  // Extract opportunity data with safe defaults from current opportunity state
  const opportunityId = opportunity?.id;
  const opportunityName = opportunity?.Name || opportunity?.DocumentNo || 'Unnamed Opportunity';
  const opportunityAmount = opportunity?.OpportunityAmt || opportunity?.Amount || 0;
  const probability = opportunity?.Probability || 0;
  const expectedCloseDate = opportunity?.ExpectedCloseDate || opportunity?.CloseDate;
  const description = opportunity?.Description || '';
  const comments = opportunity?.Comments || '';

  // Extract currency code from the opportunity data
  const currencyCode = 
    opportunity?.currencyCode || // From transformed data
    opportunity?.C_Currency_ID?.ISO_Code || // Original nested with ISO_Code
    opportunity?.C_Currency_ID?.identifier || // Original nested with identifier
    'PKR'; // Default to PKR if not found

  // Extract stage/status
  const stage = opportunity?.C_SalesStage_ID?.identifier || 
                opportunity?.salesStageName ||
                opportunity?.SalesStage || 
                'Not specified';
  
  const status = opportunity?.C_OpportunityStatus?.identifier || 
                opportunity?.OpportunityStatus || 
                'Open';

  // Extract related lead/contact data
  const leadId = opportunity?.AD_User_ID?.id || opportunity?.userId;
  const leadName = opportunity?.AD_User_ID?.identifier || 
                  opportunity?.userName ||
                  opportunity?.ContactName || 
                  'Unknown Contact';
  const leadEmail = opportunity?.AD_User_ID?.EMail || 
                   opportunity?.ContactEmail || 
                   '';
  const leadPhone = opportunity?.AD_User_ID?.Phone || 
                   opportunity?.ContactPhone || 
                   '';

  // Extract business partner data
  const businessPartnerId = opportunity?.C_BPartner_ID?.id || opportunity?.businessPartnerId;
  const businessPartnerName = opportunity?.C_BPartner_ID?.identifier || 
                             opportunity?.businessPartnerName ||
                             opportunity?.BusinessPartner || 
                             'No Company';

  // Extract sales rep data
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

  // Initialize form data when opportunity loads or edit mode starts
  useEffect(() => {
    if (opportunity) {
      setFormData({
        name: opportunityName,
        amount: opportunityAmount.toString(),
        probability: probability.toString(),
        stage: stage,
        expectedCloseDate: expectedCloseDate || '',
        description: description,
        comments: comments,
        leadName: leadName,
        leadEmail: leadEmail,
        leadPhone: leadPhone,
        businessPartnerName: businessPartnerName,
        salesRepName: salesRepName,
        salesRepEmail: salesRepEmail,
      });
    }
  }, [opportunity, isEditMode]);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries(['sales-opportunity', opportunityId]);
      await queryClient.invalidateQueries(['sales-opportunities']);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle edit toggle
  const handleEditToggle = () => {
    if (isEditMode) {
      // Save changes
      handleSave();
    } else {
      // Enter edit mode
      setIsEditMode(true);
    }
  };

  // Handle save with mutation
  const handleSave = () => {
    // Validate form
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Opportunity name is required');
      return;
    }

    // Prepare updates for API
    const updates = {
      Name: formData.name,
      OpportunityAmt: parseFloat(formData.amount) || 0,
      Probability: parseInt(formData.probability) || 0,
      Description: formData.description,
      Comments: formData.comments,
    };

    // Call update mutation - REMOVED Alert from here since it's in the hook
    updateMutation.mutate({
      id: opportunityId,
      updates: updates
    }, {
      onSuccess: (updatedData) => {
        // Update the local opportunity state with the updated data
        setOpportunity(updatedData);
        
        // Exit edit mode
        setIsEditMode(false);
        
        // Update cache with new data
        queryClient.setQueryData(['sales-opportunity', opportunityId], updatedData);
        queryClient.invalidateQueries(['sales-opportunities']);
      },
      onError: (error) => {
        // Only show error alert here, success is shown in hook
        Alert.alert('Error', error.message || 'Failed to update opportunity');
      }
    });
  };

  // Handle cancel
  const handleCancel = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard your changes?',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Discard',
          onPress: () => {
            setIsEditMode(false);
            // Reset form to original values from current opportunity
            setFormData({
              name: opportunityName,
              amount: opportunityAmount.toString(),
              probability: probability.toString(),
              stage: stage,
              expectedCloseDate: expectedCloseDate || '',
              description: description,
              comments: comments,
              leadName: leadName,
              leadEmail: leadEmail,
              leadPhone: leadPhone,
              businessPartnerName: businessPartnerName,
              salesRepName: salesRepName,
              salesRepEmail: salesRepEmail,
            });
          },
          style: 'destructive'
        }
      ]
    );
  };

  // Handle delete
  const handleDelete = () => {
    Alert.alert(
      'Delete Opportunity',
      'Are you sure you want to delete this sales opportunity?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: async () => {
            // Add delete logic here
            Alert.alert('Success', 'Opportunity deleted successfully');
            navigation.goBack();
          },
          style: 'destructive'
        }
      ]
    );
  };

  // Handle status update
  const handleStatusUpdate = (newStatus) => {
    setStatusMenuVisible(false);
    
    // Update status via API - REMOVED Alert from here since it's in the hook
    updateMutation.mutate({
      id: opportunityId,
      updates: {
        OpportunityStatus: newStatus
      }
    }, {
      onSuccess: (updatedData) => {
        // Update the local opportunity state with the updated data
        setOpportunity(updatedData);
        
        // Invalidate queries
        queryClient.invalidateQueries(['sales-opportunity', opportunityId]);
        queryClient.invalidateQueries(['sales-opportunities']);
      },
      onError: (error) => {
        // Only show error alert here, success is shown in hook
        Alert.alert('Error', error.message || 'Failed to update status');
      }
    });
  };

  // Handle phone call
  const handlePhoneCall = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  // Handle email
  const handleEmail = (email) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  // Navigate to lead
  const handleLeadPress = () => {
    if (leadId && !isEditMode) {
      navigation.navigate('LeadDetails', { 
        data: { id: leadId, Name: leadName }
      });
    }
  };

  // Navigate to business partner
  const handleBusinessPartnerPress = () => {
    if (businessPartnerId && !isEditMode) {
      navigation.navigate('BusinessPartnerDetail', { 
        id: businessPartnerId,
        name: businessPartnerName
      });
    }
  };

  // Navigate to sales rep
  const handleSalesRepPress = () => {
    if (salesRepId && !isEditMode) {
      navigation.navigate('UserDetail', { 
        id: salesRepId,
        name: salesRepName
      });
    }
  };

  // Render content based on active tab
  const renderTabContent = () => {
    if (isEditMode) {
      // Edit Mode Content
      switch (activeTab) {
        case 'details':
          return (
            <View style={styles.sectionCard}>
              <SectionHeader title="Opportunity Details" />
              <View style={styles.sectionContent}>
                <EditField
                  label="Opportunity Name"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Enter opportunity name"
                />
                
                <EditField
                  label="Stage"
                  value={formData.stage}
                  onChangeText={(text) => setFormData({ ...formData, stage: text })}
                  placeholder="Enter stage"
                />
                
                <EditField
                  label="Expected Close Date"
                  value={formData.expectedCloseDate}
                  onChangeText={(text) => setFormData({ ...formData, expectedCloseDate: text })}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            </View>
          );

        case 'lead':
          return (
            <View style={styles.sectionCard}>
              <SectionHeader title="Lead/Contact Information" />
              <View style={styles.sectionContent}>
                <EditField
                  label="Lead Name"
                  value={formData.leadName}
                  onChangeText={(text) => setFormData({ ...formData, leadName: text })}
                  placeholder="Enter lead name"
                  editable={false}
                />
                
                <EditField
                  label="Email"
                  value={formData.leadEmail}
                  onChangeText={(text) => setFormData({ ...formData, leadEmail: text })}
                  placeholder="Enter email"
                  keyboardType="email-address"
                  editable={false}
                />
                
                <EditField
                  label="Phone"
                  value={formData.leadPhone}
                  onChangeText={(text) => setFormData({ ...formData, leadPhone: text })}
                  placeholder="Enter phone"
                  keyboardType="phone-pad"
                  editable={false}
                />
              </View>
            </View>
          );

        case 'company':
          return (
            <View style={styles.sectionCard}>
              <SectionHeader title="Company Information" />
              <View style={styles.sectionContent}>
                <EditField
                  label="Company Name"
                  value={formData.businessPartnerName}
                  onChangeText={(text) => setFormData({ ...formData, businessPartnerName: text })}
                  placeholder="Enter company name"
                  editable={false}
                />
              </View>
            </View>
          );

        case 'sales':
          return (
            <View style={styles.sectionCard}>
              <SectionHeader title="Sales Representative" />
              <View style={styles.sectionContent}>
                <EditField
                  label="Sales Rep Name"
                  value={formData.salesRepName}
                  onChangeText={(text) => setFormData({ ...formData, salesRepName: text })}
                  placeholder="Enter sales rep name"
                  editable={false}
                />
                
                <EditField
                  label="Sales Rep Email"
                  value={formData.salesRepEmail}
                  onChangeText={(text) => setFormData({ ...formData, salesRepEmail: text })}
                  placeholder="Enter sales rep email"
                  keyboardType="email-address"
                  editable={false}
                />
              </View>
            </View>
          );

        case 'description':
          return (
            <View style={styles.sectionCard}>
              <SectionHeader title="Description & Comments" />
              <View style={styles.sectionContent}>
                <EditField
                  label="Description"
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Enter description"
                  multiline={true}
                />
                
                <EditField
                  label="Comments"
                  value={formData.comments}
                  onChangeText={(text) => setFormData({ ...formData, comments: text })}
                  placeholder="Enter comments"
                  multiline={true}
                />
              </View>
            </View>
          );

        default:
          return null;
      }
    } else {
      // View Mode Content - Using updated opportunity data
      switch (activeTab) {
        case 'details':
          return (
            <View style={styles.sectionCard}>
              <SectionHeader title="Opportunity Details" />
              <View style={styles.sectionContent}>
                <ViewRow 
                  label="Stage"
                  value={stage}
                />
                
                <ViewRow 
                  label="Expected Close Date"
                  value={formatDate(expectedCloseDate)}
                />
                
                <ViewRow 
                  label="Created Date"
                  value={formatDate(createdDate)}
                />
                
                <ViewRow 
                  label="Last Updated"
                  value={formatDate(updatedDate)}
                />
              </View>
            </View>
          );

        case 'lead':
          return (
            <View style={styles.sectionCard}>
              <SectionHeader title="Lead/Contact Information" />
              <View style={styles.sectionContent}>
                <ClickableViewRow 
                  label="Name"
                  value={leadName}
                  onPress={handleLeadPress}
                  icon="chevron-right"
                />
                
                {leadEmail ? (
                  <ClickableViewRow 
                    label="Email"
                    value={leadEmail}
                    onPress={() => handleEmail(leadEmail)}
                    icon="email"
                  />
                ) : (
                  <ViewRow 
                    label="Email"
                    value="Not provided"
                  />
                )}
                
                {leadPhone ? (
                  <ClickableViewRow 
                    label="Phone"
                    value={leadPhone}
                    onPress={() => handlePhoneCall(leadPhone)}
                    icon="phone"
                  />
                ) : (
                  <ViewRow 
                    label="Phone"
                    value="Not provided"
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
                <ClickableViewRow 
                  label="Company Name"
                  value={businessPartnerName}
                  onPress={handleBusinessPartnerPress}
                  icon="chevron-right"
                />
              </View>
            </View>
          );

        case 'sales':
          return (
            <View style={styles.sectionCard}>
              <SectionHeader title="Sales Representative" />
              <View style={styles.sectionContent}>
                <ClickableViewRow 
                  label="Name"
                  value={salesRepName}
                  onPress={handleSalesRepPress}
                  icon="chevron-right"
                />
                
                {salesRepEmail ? (
                  <ClickableViewRow 
                    label="Email"
                    value={salesRepEmail}
                    onPress={() => handleEmail(salesRepEmail)}
                    icon="email"
                  />
                ) : (
                  <ViewRow 
                    label="Email"
                    value="Not provided"
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
    }
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

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          !isEditMode && <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(isEditMode ? formData.name : opportunityName).charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.headerInfo}>
                {isEditMode ? (
                  <TextInput
                    style={styles.editNameInput}
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    placeholder="Opportunity Name"
                    placeholderTextColor={Colors.textTertiary}
                  />
                ) : (
                  <Text style={styles.opportunityName} numberOfLines={1}>
                    {opportunityName}
                  </Text>
                )}
                
                {/* Business Partner under name */}
                {isEditMode ? (
                  <TextInput
                    style={styles.editCompanyInput}
                    value={formData.businessPartnerName}
                    onChangeText={(text) => setFormData({ ...formData, businessPartnerName: text })}
                    placeholder="Company Name"
                    placeholderTextColor={Colors.textTertiary}
                    editable={false}
                  />
                ) : (
                  businessPartnerName && businessPartnerName !== 'No Company' && (
                    <TouchableOpacity onPress={handleBusinessPartnerPress} activeOpacity={0.7}>
                      <Text style={styles.companyName} numberOfLines={1}>
                        {businessPartnerName}
                      </Text>
                    </TouchableOpacity>
                  )
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

          {/* Amount Display with Probability Bar and Dynamic Currency */}
          <AmountDisplay 
            amount={isEditMode ? parseFloat(formData.amount) || 0 : opportunityAmount}
            probability={isEditMode ? parseInt(formData.probability) || 0 : probability}
            isEditMode={isEditMode}
            onAmountChange={(text) => setFormData({ ...formData, amount: text })}
            onProbabilityChange={(text) => setFormData({ ...formData, probability: text })}
            currencyCode={currencyCode}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabsWrapper}>
          <View style={styles.tabsContainer}>
            <TabButton 
              title="Details" 
              active={activeTab === 'details'} 
              onPress={() => setActiveTab('details')}
              isFirst={true}
              isLast={false}
            />
            <TabButton 
              title="Lead" 
              active={activeTab === 'lead'} 
              onPress={() => setActiveTab('lead')}
              isFirst={false}
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
              title="Sales" 
              active={activeTab === 'sales'} 
              onPress={() => setActiveTab('sales')}
              isFirst={false}
              isLast={false}
            />
            <TabButton 
              title="Notes" 
              active={activeTab === 'description'} 
              onPress={() => setActiveTab('description')}
              isFirst={false}
              isLast={true}
            />
          </View>
        </View>

        {/* Tab Content */}
        {renderTabContent()}

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
    </KeyboardAvoidingView>
  );
};

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
    
    // Shadow
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
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: Colors.primary || '#2F4FE3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm || 8,
  },
  avatarText: {
    fontSize: Typography.fontSize.medium || 14,
    fontFamily: Typography.fontFamily.bold || 'K2D-Bold',
    color: Colors.textInverse || '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
  },
  opportunityName: {
    fontSize: Typography.fontSize.medium || 14,
    fontFamily: Typography.fontFamily.bold || 'K2D-Bold',
    color: Colors.textPrimary || '#333333',
    marginBottom: 2,
  },
  companyName: {
    fontSize: Typography.fontSize.xsmall || 10,
    fontFamily: Typography.fontFamily.regular || 'K2D-Regular',
    color: Colors.textSecondary || '#666666',
  },
  editNameInput: {
    fontSize: Typography.fontSize.medium || 14,
    fontFamily: Typography.fontFamily.bold || 'K2D-Bold',
    color: Colors.textPrimary || '#333333',
    padding: 0,
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border || '#E0E0E0',
  },
  editCompanyInput: {
    fontSize: Typography.fontSize.xsmall || 10,
    fontFamily: Typography.fontFamily.regular || 'K2D-Regular',
    color: Colors.textSecondary || '#666666',
    padding: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border || '#E0E0E0',
    backgroundColor: Colors.backgroundLight || '#F5F5F5',
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

  // Edit Mode Amount
  editAmountRow: {
    flexDirection: 'row',
    gap: Spacing.sm || 8,
  },
  editAmountField: {
    flex: 2,
  },
  editProbabilityField: {
    flex: 1,
  },
  editAmountLabel: {
    fontSize: Typography.fontSize.xsmall || 10,
    fontFamily: Typography.fontFamily.bold || 'K2D-Bold',
    color: Colors.textSecondary || '#666666',
    marginBottom: 4,
  },
  editAmountInput: {
    height: 40,
    borderWidth: 1,
    borderColor: Colors.border || '#E0E0E0',
    borderRadius: Layout.borderRadius.sm || 4,
    paddingHorizontal: Spacing.sm || 8,
    fontSize: Typography.fontSize.small || 12,
    fontFamily: Typography.fontFamily.regular || 'K2D-Regular',
    color: Colors.textPrimary || '#333333',
    backgroundColor: Colors.cardBackground || '#FFFFFF',
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
  
  // Integrated Arrow
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

  // Clickable View Row
  clickableValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Edit Mode Fields
  editField: {
    marginBottom: Spacing.sm || 8,
  },
  editLabel: {
    fontSize: Typography.fontSize.small || 12,
    fontFamily: Typography.fontFamily.bold || 'K2D-Bold',
    color: Colors.textSecondary || '#666666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: Colors.border || '#E0E0E0',
    borderRadius: Layout.borderRadius.sm || 4,
    backgroundColor: Colors.cardBackground || '#FFFFFF',
  },
  inputDisabled: {
    backgroundColor: Colors.backgroundLight || '#F5F5F5',
    borderColor: Colors.borderLight || '#F0F0F0',
  },
  input: {
    height: 40,
    paddingHorizontal: Spacing.sm || 8,
    fontSize: Typography.fontSize.small || 12,
    fontFamily: Typography.fontFamily.regular || 'K2D-Regular',
    color: Colors.textPrimary || '#333333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm || 8,
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
    paddingVertical: verticalScale(16),
  },
  emptyStateText: {
    fontSize: Typography.fontSize.small || 12,
    fontFamily: Typography.fontFamily.regular || 'K2D-Regular',
    color: Colors.textTertiary || '#999999',
    marginTop: Spacing.xs || 4,
  },

  // Action Buttons
  actionButtons: {
    marginHorizontal: Spacing.md || 12,
    marginTop: Spacing.sm || 8,
    marginBottom: verticalScale(16),
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

  // System Info
  systemInfo: {
    padding: Spacing.md || 12,
    alignItems: 'center',
  },
  systemInfoText: {
    fontSize: Typography.fontSize.xsmall || 10,
    fontFamily: Typography.fontFamily.regular || 'K2D-Regular',
    color: Colors.textTertiary || '#999999',
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxxl || 40,
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