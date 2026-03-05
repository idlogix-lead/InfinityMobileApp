// screens/CRM/LeadDetailsScreen.js - REMOVED opportunity creation functionality with custom alerts

import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  FlatList,
} from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useCompletedLeadActivities, useLeadById } from '../../hooks/CRMhooks/useCRM';
import { useQueryClient } from 'react-query';
import moment from 'moment';
import theme from '../../constants/CRMTheme/CRMTheme';
import CustomAlert from '../../components/CustomAlert'; // Import custom alert

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

// View Mode Row Component - No Icons, Clear Label/Value Hierarchy (matching LeadEdit)
const ViewRow = ({ label, value }) => (
  <View style={styles.viewRow}>
    <Text style={styles.viewLabel}>{label}</Text>
    <Text style={styles.viewValue}>{value || 'Not provided'}</Text>
  </View>
);

// Section Header Component - Compact (matching LeadEdit)
const SectionHeader = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

// Boolean Chip Component for Yes/No Fields (matching LeadEdit's InlineSwipeButton in view mode)
const BooleanChip = ({ label, value }) => (
  <View style={styles.booleanRow}>
    <Text style={styles.booleanLabel}>{label}</Text>
    <View style={[styles.booleanChip, value ? styles.booleanChipSuccess : styles.booleanChipDefault]}>
      <Text style={[styles.booleanChipText, value ? styles.booleanChipTextSuccess : styles.booleanChipTextDefault]}>
        {value ? 'Yes' : 'No'}
      </Text>
    </View>
  </View>
);

const LeadDetailsScreen = ({ route, navigation }) => {
  const { data: leadData, followupData } = route.params || {};
  const queryClient = useQueryClient();

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

  // Get lead ID from passed data
  const leadId = leadData?.id;

  // Fetch complete lead data using the ID
  const { 
    data: fetchedLead, 
    isLoading: isLoadingLead,
    refetch: refetchLead
  } = useLeadById(leadId, !!leadId);

  // Use the fetched lead data if available, otherwise fallback to passed data
  const displayLead = fetchedLead || leadData;

  // Tab state
  const [activeTab, setActiveTab] = useState('basic');

  // Use completed activities hook
  const { 
    data: activities = [], 
    isLoading: activitiesLoading, 
    refetch: refetchActivities 
  } = useCompletedLeadActivities(displayLead?.id);

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

  const showErrorAlert = (message) => {
    showAlert('Error', message, 'error');
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  // Handle add activity
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

  // Handle edit lead
  const handleEditLead = () => {
    navigation.navigate('LeadEdit', { 
      data: displayLead,
      onGoBack: () => {
        // Refresh data if needed
        refetchLead();
        queryClient.invalidateQueries(['lead', displayLead.id]);
      }
    });
  };

  // Handle edit followup
  const handleEditFollowup = () => {
    if (followupData) {
      navigation.navigate('AddActivity', {
        data: followupData,
        mode: 'edit',
        leadData: displayLead,
        onGoBack: () => {
          refetchActivities();
        }
      });
    }
  };

  // FIXED: Helper function to check if business partner exists
  const hasBusinessPartner = (lead) => {
    if (!lead) return false;
    
    // Check all possible locations where business partner ID might be stored
    const bpId = 
      // From transformed data
      lead.businessPartnerId ||
      // From original nested object
      lead.C_BPartner_ID?.id ||
      // From C_BPartner_ID as direct object
      lead.C_BPartner_ID ||
      // From BP data
      lead.BP_BPartner_ID?.id ||
      // From client ID (fallback)
      lead.clientId;
    
    return !!bpId;
  };

  // FIXED: Helper function to get business partner ID
  const getBusinessPartnerId = (lead) => {
    if (!lead) return null;
    
    return (
      lead.businessPartnerId ||
      lead.C_BPartner_ID?.id ||
      (lead.C_BPartner_ID?.id ? lead.C_BPartner_ID.id : null) ||
      lead.BP_BPartner_ID?.id ||
      lead.clientId ||
      null
    );
  };

  // FIXED: Helper function to get business partner name
  const getBusinessPartnerName = (lead) => {
    if (!lead) return '';
    
    return (
      lead.businessPartnerName ||
      lead.C_BPartner_ID?.identifier ||
      lead.BPName ||
      lead.companyName ||
      lead.clientName ||
      ''
    );
  };

  // Get activity type for the followup
  const activityType = followupData?.ContactActivityType?.identifier || 'Task';
  const isComplete = followupData?.IsComplete || false;

  // Loading state
  if (isLoadingLead) {
    return (
      <View style={styles.container}>
        <CustomHeader
          title={'Lead Details'}
          LeftIcon="arrow-left"
          LeftPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading lead details...</Text>
        </View>
      </View>
    );
  }

  if (!displayLead) {
    return (
      <View style={styles.container}>
        <CustomHeader
          title={'Follow Up Details'}
          LeftIcon="arrow-left"
          LeftPress={() => navigation.goBack()}
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

  // Render content based on active tab (matching LeadEdit structure with correct field names)
  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <View style={styles.sectionCard}>
            <SectionHeader title="Contact Information" />
            <View style={styles.sectionContent}>
              <ViewRow 
                label="Name"
                value={displayLead?.Name}
              />
              <ViewRow 
                label="Email"
                value={displayLead?.EMail}
              />
              <ViewRow 
                label="Phone"
                value={displayLead?.Phone}
              />
              <ViewRow 
                label="Secondary Phone"
                value={displayLead?.Phone2}
              />
              <ViewRow 
                label="Birthday"
                value={displayLead?.Birthday}
              />
              <ViewRow 
                label="Lead Source"
                value={displayLead?.leadSourceName || displayLead?.LeadSource?.identifier || 'Not provided'}
              />
              <ViewRow 
                label="Lead Source Description"
                value={displayLead?.LeadSourceDescription}
              />
              <ViewRow 
                label="Sales Representative"
                value={displayLead?.salesRepName || displayLead?.SalesRep_ID?.identifier || 'Not assigned'}
              />
            </View>
          </View>
        );

      case 'company':
        return (
          <View style={styles.sectionCard}>
            <SectionHeader title="Company Information" />
            <View style={styles.sectionContent}>
              <ViewRow 
                label="Company Name"
                value={displayLead?.BPName || getBusinessPartnerName(displayLead) || ''}
              />
              <ViewRow 
                label="Business Partner"
                value={getBusinessPartnerName(displayLead) || displayLead?.C_BPartner_ID?.identifier || displayLead?.AD_Client_ID?.identifier || 'Not provided'}
              />
              <ViewRow 
                label="Organization"
                value={displayLead?.organizationName || displayLead?.AD_Org_ID?.identifier || 'Not provided'}
              />
              <ViewRow 
                label="Tenant/Client"
                value={displayLead?.clientName || displayLead?.AD_Client_ID?.identifier || 'Not provided'}
              />
              <ViewRow 
                label="Search Key"
                value={displayLead?.Value}
              />
            </View>
          </View>
        );

      case 'detailed':
        return (
          <View style={styles.sectionCard}>
            <SectionHeader title="Detailed Information" />
            <View style={styles.sectionContent}>
              <ViewRow 
                label="Status"
                value={displayLead?.statusName || displayLead?.LeadStatus?.identifier || 'Not provided'}
              />
              <ViewRow 
                label="Status Description"
                value={displayLead?.LeadStatusDescription}
              />
              
              <BooleanChip 
                label="Sales Lead"
                value={displayLead?.IsSalesLead}
              />
              <BooleanChip 
                label="Vendor Lead"
                value={displayLead?.IsVendorLead}
              />
              <BooleanChip 
                label="Active"
                value={displayLead?.IsActive}
              />
              
              <ViewRow 
                label="Description"
                value={displayLead?.Description}
              />
              <ViewRow 
                label="Comments"
                value={displayLead?.Comments}
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

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>

      <CustomHeader
        title={'Follow Up Details'}
        LeftIcon="arrow-left"
        LeftPress={() => navigation.goBack()}
        RightIcon="plus"
        RightPress={handleAddActivity}
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

        {/* Header Card - Shows Lead Info and Follow-up Card */}
        <View style={styles.headerCard}>
          {/* Lead Basic Info */}
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
                  style={styles.avatar}
                />
              </View>
              
              <View style={styles.headerInfo}>
                <Text style={styles.leadName}>{displayLead?.Name || 'Unnamed Lead'}</Text>
                
               
              </View>
            </View>

            {/* Follow-up Status Badge - Only shown when coming from FollowupScreen */}
            {followupData && (
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
            )}
          </View>

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
                {/* Header Row - Activity Type on left, Actions on right */}
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
                    {/* REMOVED: Create Opportunity Button */}
                    
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

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Keep all your existing styles - they remain the same
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

  // Header Card
  headerCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.lg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
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
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Layout.borderRadius.round,
  },
  companyBadgeText: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.medium,
    marginLeft: Spacing.xxs,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Layout.borderRadius.round,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.semiBold,
  },
  
  // Follow-up Status Badge
  followupStatusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Layout.borderRadius.round,
    alignSelf: 'flex-start',
  },
  followupStatusText: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.semiBold,
  },
  
  // Contact Info Row
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

  // Follow-up Card
  followupCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  followupCardContent: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.md,
    padding: Spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.borderDark,
    borderLeftWidth: 1,
  },
  followupCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  followupTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  followupActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  opportunityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Layout.borderRadius.sm,
    gap: Spacing.xxs,
  },
  opportunityButtonText: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.primary,
  },
  editIcon: {
    padding: Spacing.xxs,
  },
  followupIconContainer: {
    width: scale(24),
    height: scale(24),
    borderRadius: Layout.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  followupTypeText: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  followupDescriptionContainer: {
    marginBottom: Spacing.md,
  },
  followupDescriptionText: {
    fontSize: Typography.fontSize.small,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: Typography.lineHeight.small,
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
    marginHorizontal: Spacing.sm,
    color: Colors.textTertiary,
    fontSize: Typography.fontSize.xsmall,
  },
  followupDateLabel: {
    fontSize: Typography.fontSize.xsmall,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.regular,
    marginLeft: Spacing.xs,
    marginRight: Spacing.xxs,
  },
  followupDateValue: {
    fontSize: Typography.fontSize.xsmall,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.semiBold,
  },

  // Tabs
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
    paddingVertical: verticalScale(10),
    alignItems: 'center',
    position: 'relative',
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
  
  // Integrated Arrow
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
  },
  activitySectionCard: {
    marginTop: verticalScale(14),
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
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
    padding: Spacing.md,
  },

  // View Mode Row (matching LeadEdit)
  viewRow: {
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
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

  // Boolean Row for chips
  booleanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  booleanLabel: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  booleanChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Layout.borderRadius.round,
    minWidth: scale(60),
    alignItems: 'center',
  },
  booleanChipSuccess: {
    backgroundColor: Colors.successLight,
  },
  booleanChipDefault: {
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  booleanChipText: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.semiBold,
    textAlign: 'center',
  },
  booleanChipTextSuccess: {
    color: Colors.success,
  },
  booleanChipTextDefault: {
    color: Colors.textSecondary,
  },

  // Activity Styles
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

  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(20),
  },
  loadingText: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
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
  },
  retryButtonText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.semiBold,
  },
});

export default LeadDetailsScreen;