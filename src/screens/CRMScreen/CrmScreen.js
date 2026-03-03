// screens/CrmScreen.js - Clean version without forceUpdate

import React, { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
  Dimensions,
  Alert,
  Linking,
  RefreshControl,
  BackHandler,
  FlatList,
  Platform
} from 'react-native';
import { Provider } from 'react-native-paper';
import { useQueryClient } from 'react-query';
import { useAuthStore } from '../../store/authStore';
import { useCRMStore } from '../../store/crmStore';
import {
  useLeads,
  useFollowups,
  useSalesOpportunities,
  useLeadStatuses,
} from '../../hooks/CRMhooks/useCRM';
import Loader from '../../components/Loader';
import LeadTab from '../CRMScreen/LeadTab';
import SalesTab from '../../screens/SalesOppertunity/SalesTab';
import FollowupScreen from '../CRMFollowupsScreen/FollowupScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import CustomHeader from '../../components/CustomHeader';

// Import theme
import theme from '../../constants/CRMTheme/CRMTheme';

// Destructure theme for easy access
const { Colors, Typography, Layout, Spacing } = theme;
const { scale, verticalScale, screen } = Layout;

const CrmScreen = ({ navigation }) => {
  const queryClient = useQueryClient();
  const scrollViewRef = useRef(null);
  const [manualRefreshTrigger, setManualRefreshTrigger] = useState(0);

  // Fetch dynamic lead statuses
  const { data: leadStatuses = [] } = useLeadStatuses();

  // DEBUG: Check auth state on mount
  useEffect(() => {
    const authState = useAuthStore.getState();
    console.log('🔐 Auth State in CrmScreen:', {
      userId: authState.userId,
      userName: authState.userName,
      hasToken: !!authState.token,
      tokenLength: authState.token?.length,
      isCompleteAuthenticated: authState.isCompleteAuthenticated,
      serverConfig: authState.serverConfig
    });
  }, []);

  // Add this useEffect to handle Android back button
  useEffect(() => {
    const backAction = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      } else {
        Alert.alert(
          'Exit App',
          'Do you want to exit the application?',
          [
            {
              text: 'Cancel',
              onPress: () => null,
              style: 'cancel',
            },
            {
              text: 'Exit',
              onPress: () => BackHandler.exitApp(),
              style: 'destructive',
            },
          ],
          { cancelable: false }
        );
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  // REMOVED: forceUpdate state and cache subscription useEffect

  // Get UI states from CRM store
  const {
    activeTab,
    showCRMCard,
    showSalesCard,
    showOverviewCard,
    setActiveTab,
    setShowCRMCard,
    setShowSalesCard,
    setShowOverviewCard,
  } = useCRMStore();

  // State for pull-to-refresh
  const [manualRefreshing, setManualRefreshing] = React.useState(false);

  // Fetch data with React Query
  const {
    data: leads = [],
    isLoading: leadsLoading,
    error: leadsError,
    refetch: refetchLeads,
    isRefetching: leadsRefetching,
  } = useLeads();

  // Get the latest leads from cache
  const getLatestLeads = useCallback(() => {
    // Try to get from main leads cache
    const cachedLeads = queryClient.getQueryData(['leads']);
    if (Array.isArray(cachedLeads) && cachedLeads.length > 0) {
      return cachedLeads;
    }
    return leads;
  }, [leads, queryClient]);

  const {
    data: followups = [],
    isLoading: followupsLoading,
    error: followupsError,
    refetch: refetchFollowups,
    isRefetching: followupsRefetching,
  } = useFollowups();

  // Get sales opportunities with proper error handling and logging
  const {
    data: salesOpportunities = [],
    isLoading: salesLoading,
    error: salesError,
    refetch: refetchSales,
    isRefetching: salesRefetching,
  } = useSalesOpportunities({}, true); // Empty filters, enabled true

  // Manual refresh trigger - keep this for pull-to-refresh
  useEffect(() => {
    if (manualRefreshTrigger > 0) {
      console.log('🔄 Manual refresh triggered for sales opportunities');
      refetchSales();
    }
  }, [manualRefreshTrigger]);

  // Log sales opportunities for debugging
  useEffect(() => {
    console.log('📊 Sales Opportunities in CrmScreen:', {
      count: salesOpportunities.length,
      data: salesOpportunities.map(opp => ({
        id: opp.id,
        documentNo: opp.DocumentNo,
        businessPartner: opp.businessPartnerName || opp.C_BPartner_ID?.identifier,
        amount: opp.OpportunityAmt,
        stage: opp.salesStageName || opp.C_SalesStage_ID?.identifier
      }))
    });
  }, [salesOpportunities]);

  // Combined refreshing state
  const isRefreshing = leadsRefetching || followupsRefetching || salesRefetching || manualRefreshing;

  // Get the latest leads for display
  const latestLeads = getLatestLeads();

  // ============================================
  // DYNAMIC LEAD CATEGORIZATION BASED ON STATUSES
  // ============================================
  const {
    leadsByStatus,
    statusSummaries,
    totalLeads,
    convertedLeads,
    workingLeads,
    newLeads,
    expiredLeads,
    otherStatusLeads
  } = useMemo(() => {
    // Group leads by their status ID
    const grouped = {};
    const summaries = [];

    // Initialize with all known statuses
    leadStatuses.forEach(status => {
      grouped[status.id] = [];
    });

    // Also add an "unknown" category for any status not in our list
    grouped['unknown'] = [];

    // Categorize each lead
    latestLeads.forEach(lead => {
      const statusId = lead.statusId || lead.LeadStatus?.id || 'unknown';
      if (grouped[statusId]) {
        grouped[statusId].push(lead);
      } else {
        grouped['unknown'].push(lead);
      }
    });

    // Create summaries for each status
    leadStatuses.forEach(status => {
      summaries.push({
        id: status.id,
        name: status.name,
        color: status.color,
        count: grouped[status.id]?.length || 0,
        leads: grouped[status.id] || []
      });
    });

    // Add unknown status if there are any
    if (grouped['unknown'].length > 0) {
      summaries.push({
        id: 'unknown',
        name: 'Unknown',
        color: '#9E9E9E',
        count: grouped['unknown'].length,
        leads: grouped['unknown']
      });
    }

    // Sort summaries by sequence or name
    summaries.sort((a, b) => (a.sequence || 999) - (b.sequence || 999));

    // For backward compatibility, still provide categorized leads
    // This finds statuses that match common names
    const findStatusLeads = (namePattern) => {
      const matchingStatuses = leadStatuses.filter(s =>
        s.name.toLowerCase().includes(namePattern.toLowerCase())
      );

      if (matchingStatuses.length > 0) {
        return matchingStatuses.flatMap(s => grouped[s.id] || []);
      }
      return [];
    };

    return {
      leadsByStatus: grouped,
      statusSummaries: summaries,
      totalLeads: latestLeads.length,
      // Backward compatibility fields
      convertedLeads: findStatusLeads('converted'),
      workingLeads: findStatusLeads('working'),
      newLeads: findStatusLeads('new'),
      expiredLeads: findStatusLeads('expired'),
      otherStatusLeads: summaries.filter(s =>
        !s.name.toLowerCase().includes('converted') &&
        !s.name.toLowerCase().includes('working') &&
        !s.name.toLowerCase().includes('new') &&
        !s.name.toLowerCase().includes('expired')
      )
    };
  }, [latestLeads, leadStatuses]);

  // Memoized sales opportunity calculations
  const salesSummary = useMemo(() => {
    const totalSales = salesOpportunities.length;
    const wonSales = salesOpportunities.filter(sale =>
      sale?.C_OpportunityStatus?.identifier?.toLowerCase().includes('won')
    ).length;
    const lostSales = salesOpportunities.filter(sale =>
      sale?.C_OpportunityStatus?.identifier?.toLowerCase().includes('lost')
    ).length;
    const inProgressSales = salesOpportunities.filter(sale =>
      sale?.C_OpportunityStatus?.identifier?.toLowerCase().includes('progress') ||
      sale?.C_OpportunityStatus?.identifier?.toLowerCase().includes('open')
    ).length;

    // Calculate total opportunity value
    const totalValue = salesOpportunities.reduce((sum, sale) => {
      const value = parseFloat(sale.OpportunityAmt || sale.Amount || 0);
      return sum + (isNaN(value) ? 0 : value);
    }, 0);

    return {
      totalSales,
      wonSales,
      lostSales,
      inProgressSales,
      totalValue
    };
  }, [salesOpportunities]);

  // Memoized followup calculations
  const { todayFollowups, futureFollowups, missedFollowups } = useMemo(() => {
    const today = moment().startOf('day');
    const sortedFollowups = [...followups].sort((a, b) => {
      const endA = a.EndDate ? moment(a.EndDate) : moment(a.StartDate);
      const endB = b.EndDate ? moment(b.EndDate) : moment(b.StartDate);
      return endB.valueOf() - endA.valueOf();
    });

    const todayFollowups = sortedFollowups.filter(item => {
      const start = moment(item.StartDate);
      const end = item.EndDate ? moment(item.EndDate) : start;
      return (
        start.isSameOrBefore(today, 'day') &&
        end.isSameOrAfter(today, 'day') &&
        item.IsComplete === false
      );
    });

    const futureFollowups = sortedFollowups.filter(item => {
      const start = moment(item.StartDate);
      return start.isAfter(today, 'day') && item.IsComplete === false;
    });

    const missedFollowups = sortedFollowups.filter(item => {
      const end = item.EndDate ? moment(item.EndDate) : moment(item.StartDate);
      return end.isBefore(today, 'day') && item.IsComplete === false;
    });

    return { todayFollowups, futureFollowups, missedFollowups };
  }, [followups]);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setManualRefreshing(true);

    try {
      console.log('🔄 Manual refresh started');
      await Promise.all([
        refetchLeads(),
        refetchFollowups(),
        refetchSales(),
      ]);

      queryClient.invalidateQueries(['leads']);
      queryClient.invalidateQueries(['followups']);
      queryClient.invalidateQueries(['sales-opportunities']);
      queryClient.invalidateQueries(['lead-statuses']);

      console.log('✅ Manual refresh completed');
    } catch (error) {
      console.error('Refresh error:', error);
      Alert.alert('Refresh Failed', 'Could not update data. Please try again.');
    } finally {
      setManualRefreshing(false);
    }
  }, [refetchLeads, refetchFollowups, refetchSales, queryClient]);

  // Handle tab press
  const handleTabPress = (tab) => {
    setActiveTab(tab);

    switch (tab) {
      case 'Leads':
        setShowCRMCard(true);
        setShowSalesCard(false);
        setShowOverviewCard(false);
        break;
      case 'SalesOpportunity':
        setShowCRMCard(false);
        setShowSalesCard(true);
        setShowOverviewCard(false);
        break;
      case 'FollowUps':
        setShowCRMCard(false);
        setShowSalesCard(false);
        setShowOverviewCard(true);
        break;
      default:
        setShowCRMCard(true);
        setShowSalesCard(false);
        setShowOverviewCard(false);
    }
  };

  // Handle lead summary card press
  const handleLeadSummaryPress = (type) => {
    let filteredLeads = [];
    let screenTitle = "";
    let screenName = "GenericLead";

    if (type === 'total') {
      filteredLeads = latestLeads;
      screenTitle = "All Leads";
      screenName = "CrmTotal";
    } else if (type === 'converted') {
      filteredLeads = convertedLeads;
      screenTitle = "Converted Leads";
      screenName = "CrmConverted";
    } else if (type === 'working') {
      filteredLeads = workingLeads;
      screenTitle = "Working Leads";
      screenName = "CrmWorking";
    } else if (type === 'new') {
      filteredLeads = newLeads;
      screenTitle = "New Leads";
      screenName = "CrmNew";
    } else if (type === 'expired') {
      filteredLeads = expiredLeads;
      screenTitle = "Expired Leads";
      screenName = "CrmExpired";
    } else {
      const statusSummary = statusSummaries.find(s => s.id === type);
      if (statusSummary) {
        filteredLeads = statusSummary.leads;
        screenTitle = `${statusSummary.name} Leads`;
        screenName = "GenericLead";
      } else {
        filteredLeads = latestLeads;
        screenTitle = "Leads";
        screenName = "GenericLead";
      }
    }

    navigation.navigate(screenName, {
      leads: filteredLeads,
      screenTitle: screenTitle,
      timestamp: Date.now()
    });
  };

  // Handle sales summary card press
  const handleSalesSummaryPress = (type) => {
    let filteredSales = [];
    let screenTitle = "";

    switch (type) {
      case 'total':
        filteredSales = salesOpportunities;
        screenTitle = "All Opportunities";
        break;
      case 'won':
        filteredSales = salesOpportunities.filter(sale =>
          sale?.C_OpportunityStatus?.identifier?.toLowerCase().includes('won')
        );
        screenTitle = "Won Opportunities";
        break;
      case 'progress':
        filteredSales = salesOpportunities.filter(sale =>
          sale?.C_OpportunityStatus?.identifier?.toLowerCase().includes('progress') ||
          sale?.C_OpportunityStatus?.identifier?.toLowerCase().includes('open')
        );
        screenTitle = "In Progress Opportunities";
        break;
      default:
        filteredSales = salesOpportunities;
        screenTitle = "Sales Opportunities";
    }

    navigation.navigate('SalesOpportunitiesList', {
      sales: filteredSales,
      screenTitle: screenTitle,
      timestamp: Date.now()
    });
  };

  // Handle sales blue card press
  const handleSalesBlueCardPress = () => {
    navigation.navigate('SalesOpportunitiesList', {
      sales: salesOpportunities,
      screenTitle: "All Opportunities",
      timestamp: Date.now()
    });
  };

  // Handle status card press for custom statuses
  const handleStatusCardPress = (status) => {
    navigation.navigate('GenericLead', {
      leads: status.leads,
      screenTitle: `${status.name} Leads`,
      timestamp: Date.now()
    });
  };

  // Loading state
  const isLoading = leadsLoading || followupsLoading || salesLoading;

  // Show error if any
  if (leadsError || followupsError || salesError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Error loading data. Please try again.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            queryClient.invalidateQueries(['leads']);
            queryClient.invalidateQueries(['followups']);
            queryClient.invalidateQueries(['sales-opportunities']);
            queryClient.invalidateQueries(['lead-statuses']);
            setManualRefreshTrigger(prev => prev + 1);
          }}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Data for circular chart
  const circularChartData = [salesSummary.wonSales, salesSummary.inProgressSales, salesSummary.lostSales];
  const circularChartLabels = ['Won', 'In Progress', 'Lost'];

  // REMOVED: key={`sales-${forceUpdate}`} and key={`leads-${forceUpdate}`} from ScrollViews
  // REMOVED: key={`leadtab-${forceUpdate}`} from LeadTab

  return (
    <Provider>
      <>
        <CustomHeader title="CRM Board"
          RightIcon="home"
          RightPress={() => navigation.navigate('Home')} />

        <View style={styles.container}>
          {/* MINIMAL TAB DESIGN */}
          <View style={styles.tabsWrapper}>
            <View style={styles.tabsContainer}>
              {/* Leads Tab */}
              <TouchableOpacity
                onPress={() => handleTabPress('Leads')}
                style={styles.tabItem}
                activeOpacity={0.7}
              >
                <View style={styles.tabContent}>
                  <Ionicons
                    name="people-outline"
                    size={scale(20)}
                    color={activeTab === 'Leads' ? Colors.primary : Colors.textSecondary}
                  />
                  <Text style={[
                    styles.tabText,
                    activeTab === 'Leads' && styles.activeTabText
                  ]}>
                    Leads
                  </Text>
                </View>
                {activeTab === 'Leads' && <View style={styles.activeIndicator} />}
              </TouchableOpacity>

              {/* Sales Opportunity Tab */}
              <TouchableOpacity
                onPress={() => handleTabPress('SalesOpportunity')}
                style={styles.tabItem}
                activeOpacity={0.7}
              >
                <View style={styles.tabContent}>
                  <Ionicons
                    name="trending-up-outline"
                    size={scale(20)}
                    color={activeTab === 'SalesOpportunity' ? Colors.primary : Colors.textSecondary}
                  />
                  <Text style={[
                    styles.tabText,
                    activeTab === 'SalesOpportunity' && styles.activeTabText,
                    styles.salesTabText
                  ]}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    Opportunities
                  </Text>
                </View>
                {activeTab === 'SalesOpportunity' && <View style={styles.activeIndicator} />}
              </TouchableOpacity>

              {/* Follow Ups Tab */}
              <TouchableOpacity
                onPress={() => handleTabPress('FollowUps')}
                style={styles.tabItem}
                activeOpacity={0.7}
              >
                <View style={styles.tabContent}>
                  <Ionicons
                    name="alarm-outline"
                    size={scale(20)}
                    color={activeTab === 'FollowUps' ? Colors.primary : Colors.textSecondary}
                  />
                  <Text style={[
                    styles.tabText,
                    activeTab === 'FollowUps' && styles.activeTabText
                  ]}>
                    Follow Ups
                  </Text>
                </View>
                {activeTab === 'FollowUps' && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Content based on active tab */}
          {showSalesCard && (
            <View style={styles.tabContentContainer}>
              <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    colors={[Colors.primary]}
                    tintColor={Colors.primary}
                  />
                }
              >
                <SalesTab
                  navigation={navigation}
                  salesOpportunities={salesOpportunities}
                  circularChartData={circularChartData}
                  circularChartLabels={circularChartLabels}
                  isRefreshing={isRefreshing}
                  onRefresh={() => {
                    refetchSales();
                    setManualRefreshTrigger(prev => prev + 1);
                  }}
                />
              </ScrollView>
            </View>
          )}

          {showCRMCard && (
            <View style={styles.tabContentContainer}>
              <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    colors={[Colors.primary]}
                    tintColor={Colors.primary}
                  />
                }
              >
                <LeadTab
                  leads={latestLeads}
                  navigation={navigation}
                  isRefreshing={isRefreshing}
                  handleLeadSummaryPress={handleLeadSummaryPress}
                  handleStatusCardPress={handleStatusCardPress}
                  totalLeads={totalLeads}
                  statusSummaries={statusSummaries}
                />
              </ScrollView>
            </View>
          )}

          {/* Show FollowupScreen when FollowUps tab is active */}
          {showOverviewCard && (
            <View style={[styles.tabContentContainer, styles.followupsContainer]}>
              <FollowupScreen
                navigation={navigation}
              />
            </View>
          )}
        </View>

        {isLoading && <Loader />}

        {/* Floating Action Button for Add Lead */}
        {showCRMCard && (
          <TouchableOpacity
            onPress={() => navigation.navigate('AddLeads')}
            style={styles.floatingButton}
            disabled={isRefreshing}>
            <Ionicons name="add" size={scale(30)} color={Colors.textInverse} />
          </TouchableOpacity>
        )}

        {/* Floating Action Button for Add Opportunity */}
        {showSalesCard && (
          <TouchableOpacity
            onPress={() => navigation.navigate('AddSaleOppor')}
            style={styles.floatingButton}
            disabled={isRefreshing}>
            <Ionicons name="add" size={scale(30)} color={Colors.textInverse} />
          </TouchableOpacity>
        )}
      </>
    </Provider>
  );
};

// MINIMAL TAB STYLES - Blue indicator line only
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabContentContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  followupsContainer: {
    flex: 1,
  },

  // MINIMAL TAB DESIGN
  tabsWrapper: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.round,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xxs,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabItem: {
    flex: 1,
    paddingVertical: verticalScale(8),
    position: 'relative',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  tabText: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    includeFontPadding: false,
    textAlign: 'center',
  },
  activeTabText: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.semiBold,
  },
  // Special style for sales tab
  salesTabText: {
    fontSize: Typography.fontSize.xsmall,
    maxWidth: Layout.screen.width * 0.25,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    left: '20%',
    right: '20%',
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.round,
  },

  // Floating Action Button
  floatingButton: {
    position: 'absolute',
    bottom: Layout.floatingButton.bottom,
    right: Layout.floatingButton.right,
    backgroundColor: Colors.primary,
    width: Layout.floatingButton.size,
    height: Layout.floatingButton.size,
    borderRadius: Layout.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 1000,
  },

  // Error states
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: Typography.fontSize.medium,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    fontFamily: Typography.fontFamily.medium,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Layout.borderRadius.md,
  },
  retryButtonText: {
    color: Colors.textInverse,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.medium,
  },
});

export default CrmScreen;