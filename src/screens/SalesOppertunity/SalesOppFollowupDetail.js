// screens/SalesOpportunityDetail/SalesOpportunityFollowupDetail.js - Matches SalesOpportunityDetail exactly with follow-up card

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
  Image,
} from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useQueryClient } from 'react-query';
import theme from '../../constants/CRMTheme/CRMTheme';
import moment from 'moment';
import { Menu, Divider } from 'react-native-paper';

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

// Helper functions for activity styling
const getActivityColor = (type) => {
  switch (type?.toUpperCase()) {
    case 'EMAIL': return '#4F46E5';
    case 'PHONE CALL': return '#0EA5E9';
    case 'PHONE': return '#0EA5E9';
    case 'MEETING': return '#F59E0B';
    case 'TASK': return '#EC4899';
    default: return '#6366F1';
  }
};

const getActivityBgColor = (type) => {
  switch (type?.toUpperCase()) {
    case 'EMAIL': return '#EEF2FF';
    case 'PHONE CALL': return '#F0F9FF';
    case 'PHONE': return '#F0F9FF';
    case 'MEETING': return '#FEF3C7';
    case 'TASK': return '#FCE7F3';
    default: return '#F5F3FF';
  }
};

const getActivityIcon = (type) => {
  const iconColor = getActivityColor(type);
  switch (type?.toUpperCase()) {
    case 'EMAIL':
      return <MaterialIcons name="email" size={scale(14)} color={iconColor} />;
    case 'PHONE CALL':
    case 'PHONE':
      return <MaterialIcons name="phone" size={scale(14)} color={iconColor} />;
    case 'MEETING':
      return <MaterialIcons name="people" size={scale(14)} color={iconColor} />;
    case 'TASK':
      return <MaterialIcons name="task-alt" size={scale(14)} color={iconColor} />;
    default:
      return <MaterialIcons name="event" size={scale(14)} color={iconColor} />;
  }
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

// Amount Display Component with Visual Bar and Dynamic Currency
const AmountDisplay = ({ amount, probability, currencyCode = 'PKR' }) => {
  const formattedAmount = new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);

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

const SalesOpportunityFollowupDetail = ({ route, navigation }) => {
  const { data: opportunity, followupData } = route.params || {};
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
  // Extract opportunity data with safe defaults
  const opportunityId = opportunity?.id;
  const opportunityName = opportunity?.Name || opportunity?.DocumentNo || 'Unnamed Opportunity';
  const opportunityAmount = opportunity?.OpportunityAmt || opportunity?.Amount || 0;
  const probability = opportunity?.Probability || 0;
  const expectedCloseDate = opportunity?.ExpectedCloseDate || opportunity?.CloseDate;
  const description = opportunity?.Description || '';
  const comments = opportunity?.Comments || '';

  // Extract currency code from the opportunity data
  const currencyCode = 
    opportunity?.currencyCode ||
    opportunity?.C_Currency_ID?.ISO_Code ||
    opportunity?.C_Currency_ID?.identifier ||
    'PKR';

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

  // Get activity type for the followup
  const activityType = followupData?.ContactActivityType?.identifier || 'Task';
  const isComplete = followupData?.IsComplete || false;

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

  // Handle add activity
  const handleAddActivity = () => {
    navigation.navigate('AddActivity', {
      data: {
        id: opportunityId,
        Name: opportunityName,
        isOpportunity: true,
        opportunityId: opportunityId,
        businessPartnerId: businessPartnerId,
        businessPartnerName: businessPartnerName,
        Description: description,
        Comments: comments,
      },
      mode: 'create',
      sourceType: 'opportunity',
      onGoBack: () => {
        queryClient.invalidateQueries(['sales-opportunity', opportunityId]);
      }
    });
  };

  // Handle edit followup
  const handleEditFollowup = () => {
    if (followupData) {
      navigation.navigate('AddActivity', {
        data: followupData,
        mode: 'edit',
        sourceType: 'opportunity',
        onGoBack: () => {
          queryClient.invalidateQueries(['sales-opportunity', opportunityId]);
        }
      });
    }
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
    if (leadId) {
      navigation.navigate('LeadDetails', { 
        data: { id: leadId, Name: leadName }
      });
    }
  };

  // Navigate to business partner
  const handleBusinessPartnerPress = () => {
    if (businessPartnerId) {
      navigation.navigate('BusinessPartnerDetail', { 
        id: businessPartnerId,
        name: businessPartnerName
      });
    }
  };

  // Navigate to sales rep
  const handleSalesRepPress = () => {
    if (salesRepId) {
      navigation.navigate('UserDetail', { 
        id: salesRepId,
        name: salesRepName
      });
    }
  };

  // Render content based on active tab
  const renderTabContent = () => {
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
  };

  if (!opportunity) {
    return (
      <View style={styles.container}>
        <CustomHeader
          title="Follow Up Details"
          LeftIcon="arrow-left"
          LeftPress={() => navigation.goBack()}
          RightIcon="plus"
          RightPress={handleAddActivity}
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
        title="Follow Up Details"
        LeftIcon="arrow-left"
        LeftPress={() => navigation.goBack()}
        RightIcon="plus"
        RightPress={handleAddActivity}
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Card - Shows Opportunity Info and Follow-up Card */}
        <View style={styles.headerCard}>
          {/* Opportunity Basic Info */}
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {opportunityName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.opportunityName} numberOfLines={1}>
                  {opportunityName}
                </Text>
                
                {/* Business Partner under name */}
                {businessPartnerName && businessPartnerName !== 'No Company' && (
                  <TouchableOpacity onPress={handleBusinessPartnerPress} activeOpacity={0.7}>
                    <Text style={styles.companyName} numberOfLines={1}>
                      {businessPartnerName}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Status Badge */}
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
          </View>

          {/* Amount Display with Probability Bar and Dynamic Currency */}
          <AmountDisplay 
            amount={opportunityAmount}
            probability={probability}
            currencyCode={currencyCode}
          />

          {/* Follow-up Card - Only shown when coming from FollowupScreen */}
          {followupData && (
            <TouchableOpacity
              style={styles.followupCard}
              activeOpacity={0.9}
              onPress={handleEditFollowup}
            >
              <View style={[
                styles.followupCardContent,
                { 
                  borderLeftWidth: 1, 
                  borderLeftColor: getActivityColor(activityType),
                  borderColor: Colors.borderDark,
                }
              ]}>
                {/* Header Row - Activity Type on left, Edit Icon on right */}
                <View style={styles.followupCardHeader}>
                  <View style={styles.followupTypeRow}>
                    <View style={[styles.followupIconContainer, { backgroundColor: getActivityBgColor(activityType) }]}>
                      {getActivityIcon(activityType)}
                    </View>
                    <Text style={styles.followupTypeText}>
                      {activityType}
                    </Text>
                  </View>

                  <View style={styles.followupActions}>
                    {/* Follow-up Status Badge */}
                    <View style={[
                      styles.followupStatusBadge,
                      { backgroundColor: isComplete ? Colors.successLight : Colors.errorLight }
                    ]}>
                      <Text style={[
                        styles.followupStatusText,
                        { color: isComplete ? Colors.success : Colors.error }
                      ]}>
                        {isComplete ? 'Completed' : 'Pending'}
                      </Text>
                    </View>
                    {/* Pencil Icon for editing */}
                    <MaterialCommunityIcons 
                      name="pencil" 
                      size={scale(18)} 
                      color={Colors.textSecondary} 
                      style={styles.editIcon}
                    />
                  </View>
                </View>

                {/* Description */}
                <View style={styles.followupDescriptionContainer}>
                  <Text style={styles.followupDescriptionText} numberOfLines={2}>
                    {followupData.Description || 'No description provided'}
                  </Text>
                </View>

                {/* Bottom Row: Dates Only */}
                <View style={styles.followupBottomRow}>
                  <View style={styles.followupDatesContainer}>
                    <View style={styles.followupDateRow}>
                      <View style={styles.followupDateItem}>
                        <MaterialIcons name="calendar-today" size={scale(12)} color={Colors.textSecondary} />
                        <Text style={styles.followupDateLabel}>Start: </Text>
                        <Text style={styles.followupDateValue}>
                          {moment(followupData.StartDate).format('DD MMM YY')}
                        </Text>
                      </View>
                      <Text style={styles.followupDateSeparator}>|</Text>
                      <View style={styles.followupDateItem}>
                        <MaterialIcons name="calendar-today" size={scale(12)} color={Colors.textSecondary} />
                        <Text style={styles.followupDateLabel}>End: </Text>
                        <Text style={styles.followupDateValue}>
                          {followupData.EndDate ? moment(followupData.EndDate).format('DD MMM YY') : 'N/A'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
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

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Styles - Exactly matching SalesOpportunityDetail with follow-up card additions
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
    marginBottom: Spacing.sm || 8,
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

  // Follow-up Card
  followupCard: {
    marginTop: Spacing.sm || 8,
  },
  followupCardContent: {
    backgroundColor: Colors.cardBackground || '#FFFFFF',
    borderRadius: Layout.borderRadius.md || 6,
    padding: Spacing.sm || 8,
    borderWidth: 0.5,
    borderColor: Colors.borderDark || '#E0E0E0',
    borderLeftWidth: 1,
  },
  followupCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  followupTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  followupActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm || 8,
  },
  followupStatusBadge: {
    paddingHorizontal: Spacing.xs || 4,
    paddingVertical: 2,
    borderRadius: Layout.borderRadius.round || 20,
  },
  followupStatusText: {
    fontSize: Typography.fontSize.xsmall || 10,
    fontFamily: Typography.fontFamily.semiBold || 'K2D-SemiBold',
  },
  editIcon: {
    padding: Spacing.xxs || 2,
  },
  followupIconContainer: {
    width: scale(24),
    height: scale(24),
    borderRadius: Layout.borderRadius.sm || 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm || 8,
  },
  followupTypeText: {
    fontSize: Typography.fontSize.small || 12,
    fontFamily: Typography.fontFamily.semiBold || 'K2D-SemiBold',
    color: Colors.textPrimary || '#333333',
  },
  followupDescriptionContainer: {
    marginBottom: Spacing.sm || 8,
  },
  followupDescriptionText: {
    fontSize: Typography.fontSize.xsmall || 10,
    color: Colors.textSecondary || '#666666',
    fontFamily: Typography.fontFamily.regular || 'K2D-Regular',
    lineHeight: Typography.lineHeight.small || 14,
  },
  followupBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  followupDatesContainer: {
    flex: 1,
  },
  followupDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  followupDateItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followupDateSeparator: {
    marginHorizontal: Spacing.sm || 8,
    color: Colors.textTertiary || '#999999',
    fontSize: Typography.fontSize.xsmall || 10,
  },
  followupDateLabel: {
    fontSize: Typography.fontSize.xsmall || 10,
    color: Colors.textSecondary || '#666666',
    fontFamily: Typography.fontFamily.regular || 'K2D-Regular',
    marginLeft: Spacing.xs || 4,
    marginRight: Spacing.xxs || 2,
  },
  followupDateValue: {
    fontSize: Typography.fontSize.xsmall || 10,
    color: Colors.textPrimary || '#333333',
    fontFamily: Typography.fontFamily.semiBold || 'K2D-SemiBold',
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

export default SalesOpportunityFollowupDetail;