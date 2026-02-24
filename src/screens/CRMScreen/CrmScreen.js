// screens/CrmScreen.js - COMPLETE FIXED VERSION with debug and force refresh
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
} from '../../hooks/CRMhooks/useCRM';
import Loader from '../../components/Loader';
import LeadTab from '../CRMScreen/LeadTab';
import SalesTab from '../../screens/SalesOppertunity/SalesTab';
import FollowupScreen from '../CRMFollowupsScreen/FollowupScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import CustomHeader from '../../components/CustomHeader'; 

const screenWidth = Dimensions.get('window').width;

const CrmScreen = ({ navigation }) => {
  const queryClient = useQueryClient();
  const scrollViewRef = useRef(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [manualRefreshTrigger, setManualRefreshTrigger] = useState(0);

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

  // Subscribe to query cache changes for real-time updates
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      // When any leads query is updated, force a re-render
      if (event?.query?.queryKey?.[0] === 'leads' || 
          event?.query?.queryKey?.[0] === 'sales-opportunities') {
        console.log('🔄 Cache update detected for:', event?.query?.queryKey?.[0]);
        setForceUpdate(prev => prev + 1);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

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

  // FIXED: Get sales opportunities with proper error handling and logging
  const {
    data: salesOpportunities = [],
    isLoading: salesLoading,
    error: salesError,
    refetch: refetchSales,
    isRefetching: salesRefetching,
  } = useSalesOpportunities({}, true); // Empty filters, enabled true

  // FORCE REFETCH on component mount and when tab changes
  useEffect(() => {
    console.log('🔄 CrmScreen - Forcing sales opportunities refetch on mount');
    refetchSales();
  }, []);

  useEffect(() => {
    if (activeTab === 'SalesOpportunity') {
      console.log('🔄 Sales tab activated, forcing refetch');
      refetchSales();
    }
  }, [activeTab]);

  // Manual refresh trigger
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

  // Memoized lead calculations based on displayed leads - using latestLeads
  const {
    newLeads,
    convertedLeads,
    workingLeads,
    expiredLeads,
    totalLeads
  } = useMemo(() => {
    const newLeads = latestLeads.filter(lead => lead?.LeadStatus?.id === 'N');
    const converted = latestLeads.filter(lead => lead?.LeadStatus?.id === 'C');
    const working = latestLeads.filter(lead => lead?.LeadStatus?.id === 'W');
    const expired = latestLeads.filter(lead => lead?.LeadStatus?.id === 'E');

    return {
      newLeads,
      convertedLeads: converted,
      workingLeads: working,
      expiredLeads: expired,
      totalLeads: latestLeads.length,
    };
  }, [latestLeads, forceUpdate]);

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
        // Force refresh when switching to Sales tab
        setTimeout(() => {
          refetchSales();
        }, 100);
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
    
    switch(type) {
      case 'total':
        filteredLeads = latestLeads;
        screenTitle = "All Leads";
        screenName = "CrmTotal";
        break;
      case 'converted':
        filteredLeads = convertedLeads;
        screenTitle = "Converted Leads";
        screenName = "CrmConverted";
        break;
      case 'working':
        filteredLeads = workingLeads;
        screenTitle = "Working Leads";
        screenName = "CrmWorking";
        break;
      case 'new':
        filteredLeads = newLeads;
        screenTitle = "New Leads";
        screenName = "CrmNew";
        break;
      default:
        filteredLeads = latestLeads;
        screenTitle = "Leads";
        screenName = "GenericLead";
    }
    
    navigation.navigate(screenName, { 
      leads: filteredLeads,
      screenTitle: screenTitle,
      timestamp: Date.now() // Add timestamp to force refresh
    });
  };

  // Handle sales summary card press
  const handleSalesSummaryPress = (type) => {
    let filteredSales = [];
    let screenTitle = "";
    
    switch(type) {
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
    
    // Navigate to sales opportunities screen
    navigation.navigate('SalesOpportunitiesList', { 
      sales: filteredSales,
      screenTitle: screenTitle,
      timestamp: Date.now() // Add timestamp to force refresh
    });
  };

  // Handle sales blue card press
  const handleSalesBlueCardPress = () => {
    navigation.navigate('SalesOpportunitiesList', { 
      sales: salesOpportunities,
      screenTitle: "All Opportunities",
      timestamp: Date.now() // Add timestamp to force refresh
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

  return (
    <Provider>
      <>
        {/* Custom Header */}
        <CustomHeader title="CRM Board" 
          RightIcon="home" 
          RightPress={() => navigation.navigate('Home')} />
        
        {/* Content */}
        <View style={styles.container}>
          {/* UPDATED: Full Blue Tab Container with active indicator */}
          <View style={styles.tabContainer}>
            {/* Full Blue Background for active tab */}
            <View 
              style={[
                styles.activeTabBackground,
                activeTab === 'Leads' && styles.activeTabLeads,
                activeTab === 'SalesOpportunity' && styles.activeTabSales,
                activeTab === 'FollowUps' && styles.activeTabFollowups,
              ]} 
            />
            
            <TouchableOpacity
              onPress={() => handleTabPress('Leads')}
              style={[styles.tabButton, activeTab === 'Leads' && styles.activeTabButton]}>
              <Text style={[styles.tabText, activeTab === 'Leads' && styles.activeTabText]}>
                Leads
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleTabPress('SalesOpportunity')}
              style={[styles.tabButton, activeTab === 'SalesOpportunity' && styles.activeTabButton]}>
              <Text style={[styles.tabText, activeTab === 'SalesOpportunity' && styles.activeTabText]}>
                Sales Opportunity
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleTabPress('FollowUps')}
              style={[styles.tabButton, activeTab === 'FollowUps' && styles.activeTabButton]}>
              <Text style={[styles.tabText, activeTab === 'FollowUps' && styles.activeTabText]}>
                Follow ups
              </Text>
            </TouchableOpacity>
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
                    colors={['#2F4FE3']}
                    tintColor="#2F4FE3"
                  />
                }
                key={`sales-${forceUpdate}`} // Force re-render on cache update
              >
                {/* FIXED: Pass salesOpportunities to SalesTab */}
                <SalesTab
                  navigation={navigation}
                  salesOpportunities={salesOpportunities}
                  circularChartData={circularChartData}
                  circularChartLabels={circularChartLabels}
                  isRefreshing={isRefreshing}
                  onRefresh={() => {
                    console.log('🔄 Manual refresh from SalesTab');
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
                    colors={['#2F4FE3']}
                    tintColor="#2F4FE3"
                  />
                }
                key={`leads-${forceUpdate}`} // Force re-render on cache update
              >
                {/* NEW: LeadTab Component - Pass latestLeads instead of leads */}
                <LeadTab
                  leads={latestLeads}
                  navigation={navigation}
                  isRefreshing={isRefreshing}
                  handleLeadSummaryPress={handleLeadSummaryPress}
                  totalLeads={totalLeads}
                  convertedLeads={convertedLeads}
                  workingLeads={workingLeads}
                  newLeads={newLeads}
                  key={`leadtab-${forceUpdate}`} // Force re-render on cache update
                />
              </ScrollView>
            </View>
          )}

          {/* Show FollowupScreen when FollowUps tab is active */}
          {showOverviewCard && (
            <View style={[styles.tabContentContainer, styles.followupsContainer]}>
              <FollowupScreen 
                navigation={navigation} 
                key={`followups-${forceUpdate}`} // Force re-render on cache update
              />
            </View>
          )}
        </View>

        {isLoading && <Loader />}

        {/* Floating Action Button for Add Lead - Only show in Leads tab */}
        {showCRMCard && (
          <TouchableOpacity
            onPress={() => navigation.navigate('AddLeads')}
            style={styles.floatingButton}
            disabled={isRefreshing}>
            <Text style={styles.floatingButtonText}>+</Text>
          </TouchableOpacity>
        )}

        {/* Floating Action Button for Add Opportunity - Only show in Sales tab */}
        {showSalesCard && (
          <TouchableOpacity
            onPress={() => navigation.navigate('AddSaleOppor')}
            style={[styles.floatingButton, {backgroundColor: '#2F4FE3'}]}
            disabled={isRefreshing}>
            <Text style={styles.floatingButtonText}>+</Text>
          </TouchableOpacity>
        )}
      </>
    </Provider>
  );
};

// UPDATED: Styles with full blue tab container
const styles = StyleSheet.create({
   container: {
    flex: 1,
    backgroundColor: '#EDEBEB',
  },
  tabContentContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  followupsContainer: {
    flex: 1,
  },
  // UPDATED: Responsive Tab Container
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginTop: screenWidth * 0.05, // 5% of screen width
    marginBottom: screenWidth * 0.03, // 3% of screen width
    marginHorizontal: screenWidth * 0.08, // 8% of screen width
    borderRadius: 20,
    height: screenWidth * 0.08, // 10% of screen width (responsive height)
    minHeight: 35, // Minimum height
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'space-between', // Distribute space evenly
    alignItems: 'center', // Center items vertically
  },
  // Active tab blue background
  activeTabBackground: {
    position: 'absolute',
    backgroundColor: '#2F4FE3',
    height: '100%',
    width: '33.33%', // Each tab takes 1/3 of the width
    top: 0,
    transition: 'left 0.3s ease-in-out',
    borderRadius: 20,
  },
  // Positions for active tab
  activeTabLeads: {
    left: 0,
  },
  activeTabSales: {
    left: '33.33%',
  },
  activeTabFollowups: {
    left: '66.66%',
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    height: '100%',
    minWidth: screenWidth * 0.25, // Minimum width for each tab
    paddingHorizontal: screenWidth * 0.01, // Small horizontal padding
  },
  activeTabButton: {
    // Additional styles for active tab button if needed
  },
  tabText: {
    color: '#333',
    fontSize: screenWidth * 0.030, // Responsive font size (3.5% of screen width)
    fontFamily: 'K2D-Medium',
    textAlign: 'left', // Small padding to prevent text cut-off
    includeFontPadding: false, // Remove extra font padding
    textAlignVertical: 'center', // Center text vertically
  },
  activeTabText: {
    color: '#fff',
    fontFamily: 'K2D-Medium',
    fontSize: screenWidth * 0.030, // Same as inactive tabs
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  // Floating Action Button
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#2F4FE3',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 10,
  },
  floatingButtonText: {
    color: '#fff',
    fontFamily: 'K2D-Bold',
    fontSize: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'K2D-Medium',
  },
  retryButton: {
    backgroundColor: '#2F4FE3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontFamily: 'K2D-SemiBold',
    fontSize: 16,
  },
});

export default CrmScreen;