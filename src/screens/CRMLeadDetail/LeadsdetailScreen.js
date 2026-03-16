// screens/CRM/LeadDetailsScreen.js – Simplified header card

import React, { useState, useEffect, useMemo } from 'react';
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useCompletedLeadActivities, useLeadById } from '../../hooks/CRMhooks/useCRM';
import { useQueryClient } from 'react-query';
import moment from 'moment';
import theme from '../../constants/CRMTheme/CRMTheme';
import CustomAlert from '../../components/CustomAlert';

const { Colors, Typography, Layout, Spacing } = theme;
const { scale, verticalScale } = Layout;

// Country options (same as AddLead/LeadEdit)
const COUNTRIES = [
  { label: 'Pakistan', value: 'PK', id: 1000001 },
  { label: 'United States', value: 'US', id: 1000002 },
  { label: 'United Kingdom', value: 'GB', id: 1000003 },
  { label: 'Canada', value: 'CA', id: 1000004 },
  { label: 'Australia', value: 'AU', id: 1000005 },
  { label: 'Germany', value: 'DE', id: 1000006 },
  { label: 'France', value: 'FR', id: 1000007 },
  { label: 'Italy', value: 'IT', id: 1000008 },
  { label: 'Spain', value: 'ES', id: 1000009 },
  { label: 'UAE', value: 'AE', id: 1000010 },
  { label: 'China', value: 'CN', id: 1000011 },
  { label: 'India', value: 'IN', id: 1000012 },
];

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

// Helper functions for activity styling (unchanged)
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
    
    {active && (
      <View style={styles.activeTabArrowContainer}>
        <View style={styles.activeTabArrow} />
      </View>
    )}
  </View>
);

// Activity Item Component (unchanged)
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

// View Mode Row Component
const ViewRow = ({ label, value }) => (
  <View style={styles.viewRow}>
    <Text style={styles.viewLabel}>{label}</Text>
    <Text style={styles.viewValue}>{value || 'Not provided'}</Text>
  </View>
);

// Section Header Component
const SectionHeader = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

// Boolean Chip Component
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

  const leadId = leadData?.id;

  const { 
    data: fetchedLead, 
    isLoading: isLoadingLead,
    refetch: refetchLead
  } = useLeadById(leadId, !!leadId);

  const displayLead = fetchedLead || leadData;

  const [activeTab, setActiveTab] = useState('basic');

  const { 
    data: activities = [], 
    isLoading: activitiesLoading, 
    refetch: refetchActivities 
  } = useCompletedLeadActivities(displayLead?.id);

  // ========== COMPUTE COMBINED CONTACT ADDRESS (like LeadEdit) ==========
  const combinedContactAddress = useMemo(() => {
    if (!displayLead) return '';
    // Use C_Location_ID.identifier or UserAddress1
    const fullAddress = displayLead?.C_Location_ID?.identifier || displayLead?.UserAddress1 || '';
    return fullAddress;
  }, [displayLead]);

  // ========== CURRENT STATUS (for header badge) ==========
  const currentStatus = useMemo(() => {
    if (!displayLead) return null;
    const statusName = displayLead?.LeadStatus?.identifier || displayLead?.statusName || 'New';
    return STATUS_CONFIG[statusName] || STATUS_CONFIG.New;
  }, [displayLead]);

  // Alert helpers
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

  // Handlers
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

  const handleEditLead = () => {
    navigation.navigate('LeadEdit', { 
      data: displayLead,
      onGoBack: () => {
        refetchLead();
        queryClient.invalidateQueries(['lead', displayLead.id]);
      }
    });
  };

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

  // Helper functions (unchanged)
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
          RightIcon="plus"
          RightPress={handleAddActivity}
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
          RightIcon="plus"
          RightPress={handleAddActivity}
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

  // ========== RENDER TAB CONTENT (EXACT FIELDS AS LEADEDIT) ==========
  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <View style={styles.sectionCard}>
            <SectionHeader title="Contact Information" />
            <View style={styles.sectionContent}>
              <ViewRow label="Name" value={displayLead?.Name} />
              <ViewRow label="Client" value={displayLead?.AD_Client_ID?.identifier || displayLead?.clientName} />
              <ViewRow label="Organization" value={displayLead?.AD_Org_ID?.identifier || displayLead?.organizationName} />
              <ViewRow label="Email" value={displayLead?.EMail} />
              <ViewRow label="Phone" value={displayLead?.Phone} />
              <ViewRow label="Address" value={combinedContactAddress} />
              <ViewRow 
                label="Sales Representative" 
                value={displayLead?.salesRepName || displayLead?.SalesRep_ID?.identifier || 'Not assigned'} 
              />
              <ViewRow label="Description" value={displayLead?.Description} />
            </View>
          </View>
        );

      case 'company':
        return (
          <View style={styles.sectionCard}>
            <SectionHeader title="Company Information" />
            <View style={styles.sectionContent}>
              <ViewRow label="Company Name" value={displayLead?.BPName || getBusinessPartnerName(displayLead) || ''} />
              <ViewRow label="Business Partner Address" value={displayLead?.UserAddress2} />
              <ViewRow 
                label="Business Partner" 
                value={getBusinessPartnerName(displayLead) || displayLead?.C_BPartner_ID?.identifier || displayLead?.AD_Client_ID?.identifier || 'Not provided'} 
              />
              <ViewRow 
                label="Organization" 
                value={displayLead?.organizationName || displayLead?.AD_Org_ID?.identifier || 'Not provided'} 
              />
              <ViewRow 
                label="Lead Source" 
                value={displayLead?.leadSourceName || displayLead?.LeadSource?.identifier || 'Not provided'} 
              />
              <ViewRow label="Lead Source Description" value={displayLead?.LeadSourceDescription} />
            </View>
          </View>
        );

      case 'detailed':
        return (
          <View style={styles.sectionCard}>
            <SectionHeader title="Detailed Information" />
            <View style={styles.sectionContent}>
              <BooleanChip label="Sales Lead" value={displayLead?.IsSalesLead} />
              <BooleanChip label="Vendor Lead" value={displayLead?.IsVendorLead} />
              <ViewRow label="Secondary Phone" value={displayLead?.Phone2} />
              <ViewRow label="Birthday" value={displayLead?.Birthday} />
              <ViewRow label="Search Key" value={displayLead?.Value} />
              <ViewRow label="Comments" value={displayLead?.Comments} />
              <ViewRow label="Lead Status Description" value={displayLead?.LeadStatusDescription} />
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

      default: return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>

      <CustomHeader
        title={'Lead Details'}
        LeftIcon="arrow-left"
        LeftPress={() => navigation.goBack()}
        RightIcon="plus"
        RightPress={handleAddActivity}
      />

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

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* Simplified Header Card – only name and status */}
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
                <Text style={styles.leadName}>{displayLead?.Name || 'Unnamed Lead'}</Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              {currentStatus && (
                <View style={[styles.statusBadge, { backgroundColor: currentStatus.badgeBg }]}>
                  {currentStatus.showDot && (
                    <View style={[styles.dot, { backgroundColor: currentStatus.badgeColor }]} />
                  )}
                  <Text style={[styles.statusBadgeText, { color: currentStatus.badgeColor }]}>
                    {currentStatus.badgeText}
                  </Text>
                </View>
              )}

             
            </View>
          </View>

          {/* Follow-up Card (only if followupData exists) */}
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
                <View style={styles.followupCardHeader}>
                  <View style={styles.followupTypeRow}>
                    <View style={[styles.followupIconContainer, { backgroundColor: getActivityBgColor(activityType) }]}>
                      {getActivityIcon(activityType)}
                    </View>
                    <Text style={styles.followupTypeText}>{activityType}</Text>
                  </View>
                  <View style={styles.followupActions}>
                    <MaterialCommunityIcons
                      name="pencil"
                      size={scale(18)}
                      color={Colors.textSecondary}
                      style={styles.editIcon}
                    />
                  </View>
                </View>
                <View style={styles.followupDescriptionContainer}>
                  <Text style={styles.followupDescriptionText} numberOfLines={2}>
                    {followupData.Description || 'No description provided'}
                  </Text>
                </View>
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
              title="Basic"
              active={activeTab === 'basic'}
              onPress={() => setActiveTab('basic')}
              isFirst
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
              isLast
            />
          </View>
        </View>

        {/* Tab Content */}
        {renderTabContent()}

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ========== STYLES (removed companyBadge and contactChip styles) ==========
const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: verticalScale(20) },

  // Header Card
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

  headerRight: { alignItems: 'flex-end', justifyContent: 'flex-start' },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xxs,
    borderRadius: Layout.borderRadius.round,
    gap: Spacing.xxs,
  },
  statusBadgeText: { fontSize: Typography.fontSize.xsmall, fontFamily: Typography.fontFamily.regular },
  dot: { width: scale(6), height: scale(6), borderRadius: scale(3) },

  activityIconWrapper: { marginTop: 0, paddingTop: 0 },
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

  // Follow-up Card
  followupCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.md },
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
  followupTypeRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  followupActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  editIcon: { padding: Spacing.xxs },
  followupIconContainer: {
    width: scale(24),
    height: scale(24),
    borderRadius: Layout.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  followupTypeText: { fontSize: Typography.fontSize.medium, fontFamily: Typography.fontFamily.semiBold, color: Colors.textPrimary },
  followupDescriptionContainer: { marginBottom: Spacing.md },
  followupDescriptionText: {
    fontSize: Typography.fontSize.small,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: Typography.lineHeight.small,
  },
  followupBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  followupDatesContainer: { flex: 1 },
  followupDateRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  followupDateItem: { flexDirection: 'row', alignItems: 'center' },
  followupDateSeparator: { marginHorizontal: Spacing.sm, color: Colors.textTertiary, fontSize: Typography.fontSize.xsmall },
  followupDateLabel: { fontSize: Typography.fontSize.xsmall, color: Colors.textSecondary, fontFamily: Typography.fontFamily.regular, marginLeft: Spacing.xs, marginRight: Spacing.xxs },
  followupDateValue: { fontSize: Typography.fontSize.xsmall, color: Colors.textPrimary, fontFamily: Typography.fontFamily.semiBold },

  // Tabs
  tabsWrapper: { marginHorizontal: Spacing.md, marginBottom: 0 },
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
  tabButtonWrapper: { flex: 1, position: 'relative' },
  tabButton: { paddingVertical: verticalScale(6), alignItems: 'center', borderRadius: Layout.borderRadius.sm },
  tabButtonFirst: { borderTopLeftRadius: Layout.borderRadius.sm, borderBottomLeftRadius: Layout.borderRadius.sm },
  tabButtonLast: { borderTopRightRadius: Layout.borderRadius.sm, borderBottomRightRadius: Layout.borderRadius.sm },
  tabButtonActive: { backgroundColor: Colors.primary },
  tabButtonText: { fontSize: Typography.fontSize.small, fontFamily: Typography.fontFamily.medium, color: Colors.textSecondary },
  tabButtonTextActive: { color: Colors.textInverse, fontFamily: Typography.fontFamily.semiBold },
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

  // View Row
  viewRow: { marginBottom: Spacing.md, paddingBottom: Spacing.xs, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  viewLabel: { fontSize: Typography.fontSize.small, fontFamily: Typography.fontFamily.bold, color: Colors.textSecondary, marginBottom: Spacing.xxs, textTransform: 'uppercase', letterSpacing: 0.5 },
  viewValue: { fontSize: Typography.fontSize.small, fontFamily: Typography.fontFamily.regular, color: Colors.textPrimary, lineHeight: Typography.lineHeight.h4 },

  // Boolean Row
  booleanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  booleanLabel: { fontSize: Typography.fontSize.small, fontFamily: Typography.fontFamily.bold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  booleanChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Layout.borderRadius.round, minWidth: scale(60), alignItems: 'center' },
  booleanChipSuccess: { backgroundColor: Colors.successLight },
  booleanChipDefault: { backgroundColor: Colors.backgroundLight, borderWidth: 1, borderColor: Colors.border },
  booleanChipText: { fontSize: Typography.fontSize.small, fontFamily: Typography.fontFamily.semiBold, textAlign: 'center' },
  booleanChipTextSuccess: { color: Colors.success },
  booleanChipTextDefault: { color: Colors.textSecondary },

  // Activity Styles
  activityItem: { flexDirection: 'row', paddingVertical: Spacing.sm, alignItems: 'center' },
  activityIconContainer: { width: scale(32), height: scale(32), borderRadius: scale(16), backgroundColor: Colors.infoLight, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  activityContent: { flex: 1 },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xxs },
  activityTitle: { fontSize: Typography.fontSize.medium, fontFamily: Typography.fontFamily.semiBold, color: Colors.textPrimary },
  activityStatusBadge: { paddingHorizontal: Spacing.xs, paddingVertical: Spacing.xxs, borderRadius: Layout.borderRadius.round },
  activityStatusText: { fontSize: Typography.fontSize.xsmall, fontFamily: Typography.fontFamily.semiBold },
  activityDescription: { fontSize: Typography.fontSize.xsmall, fontFamily: Typography.fontFamily.regular, color: Colors.textSecondary, marginBottom: Spacing.xxs },
  activityMeta: { flexDirection: 'row' },
  activityMetaItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xxs },
  activityMetaText: { fontSize: Typography.fontSize.xsmall, fontFamily: Typography.fontFamily.medium, color: Colors.textSecondary },
  separator: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.xs },

  // Loading & Empty States
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: verticalScale(20) },
  loadingText: { fontSize: Typography.fontSize.medium, fontFamily: Typography.fontFamily.regular, color: Colors.textSecondary, marginTop: Spacing.md },
  emptyState: { alignItems: 'center', paddingVertical: verticalScale(16) },
  emptyStateText: { fontSize: Typography.fontSize.small, fontFamily: Typography.fontFamily.regular, color: Colors.textTertiary, marginTop: Spacing.xs },

  // Error States
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxxxl },
  errorText: { fontSize: Typography.fontSize.h4, fontFamily: Typography.fontFamily.semiBold, color: Colors.textPrimary, marginTop: Spacing.lg, marginBottom: Spacing.md, textAlign: 'center' },
  retryButton: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Layout.borderRadius.md },
  retryButtonText: { color: Colors.textInverse, fontSize: Typography.fontSize.medium, fontFamily: Typography.fontFamily.semiBold },
});

export default LeadDetailsScreen;