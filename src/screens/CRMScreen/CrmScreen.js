// screens/CrmScreen.js - Simplified with custom SalesTab component
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
import EarningChart from '../../components/CRMSearch/CRMChart/EarningChart';
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

  const {
    data: followups = [],
    isLoading: followupsLoading,
    error: followupsError,
    refetch: refetchFollowups,
    isRefetching: followupsRefetching,
  } = useFollowups();

  const {
    data: salesOpportunities = [],
    isLoading: salesLoading,
    error: salesError,
    refetch: refetchSales,
    isRefetching: salesRefetching,
  } = useSalesOpportunities();

  // Combined refreshing state
  const isRefreshing = leadsRefetching || followupsRefetching || salesRefetching || manualRefreshing;

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setManualRefreshing(true);
    
    try {
      await Promise.all([
        refetchLeads(),
        refetchFollowups(),
        refetchSales(),
      ]);
      
      queryClient.invalidateQueries(['leads']);
      queryClient.invalidateQueries(['followups']);
      queryClient.invalidateQueries(['salesOpportunities']);
    } catch (error) {
      console.error('Refresh error:', error);
      Alert.alert('Refresh Failed', 'Could not update data. Please try again.');
    } finally {
      setManualRefreshing(false);
    }
  }, [refetchLeads, refetchFollowups, refetchSales, queryClient]);

  // Memoized lead calculations based on displayed leads
  const {
    newLeads,
    convertedLeads,
    workingLeads,
    expiredLeads,
    totalLeads
  } = useMemo(() => {
    const newLeads = leads.filter(lead => lead?.LeadStatus?.id === 'N');
    const converted = leads.filter(lead => lead?.LeadStatus?.id === 'C');
    const working = leads.filter(lead => lead?.LeadStatus?.id === 'W');
    const expired = leads.filter(lead => lead?.LeadStatus?.id === 'E');

    return {
      newLeads,
      convertedLeads: converted,
      workingLeads: working,
      expiredLeads: expired,
      totalLeads: leads.length,
    };
  }, [leads]);

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
    
    switch(type) {
      case 'total':
        filteredLeads = leads;
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
        filteredLeads = leads;
        screenTitle = "Leads";
        screenName = "GenericLead";
    }
    
    navigation.navigate(screenName, { 
      leads: filteredLeads,
      screenTitle: screenTitle
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
      screenTitle: screenTitle
    });
  };

  // Handle sales blue card press
  const handleSalesBlueCardPress = () => {
    navigation.navigate('SalesOpportunitiesList', { 
      sales: salesOpportunities,
      screenTitle: "All Opportunities"
    });
  };

  // Render lead summary cards with uniform design
  const renderLeadSummaryCards = () => {
    return (
      <View style={styles.leadCardsContainer}>
        {/* Total Leads Card */}
        <TouchableOpacity 
          style={styles.leadCard}
          onPress={() => handleLeadSummaryPress('total')}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <View style={styles.cardIconContainer}>
                <MaterialIcons name="web" size={20} color="#111111" />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardCount}>Total Leads</Text>
                <Text style={styles.cardNumber}>{totalLeads}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#111111" />
          </View>
        </TouchableOpacity>

        {/* Converted Leads Card */}
        <TouchableOpacity 
          style={styles.leadCard}
          onPress={() => handleLeadSummaryPress('converted')}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <View style={styles.cardIconContainer}>
                <MaterialIcons name="swap-horiz" size={20} color="#111111" />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardCount}>Converted</Text>
                <Text style={styles.cardNumber}>{convertedLeads.length}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#111111" />
          </View>
        </TouchableOpacity>

        {/* Working Leads Card */}
        <TouchableOpacity 
          style={styles.leadCard}
          onPress={() => handleLeadSummaryPress('working')}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="time" size={20} color="#111111" />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardCount}>Working</Text>
                <Text style={styles.cardNumber}>{workingLeads.length}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#111111" />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Render minimal blue card with rectangular white button
  const renderBlueCard = () => {
    return (
      <View style={styles.blueCardContainer}>
        <View style={styles.blueCard}>
          <View style={styles.blueCardContent}>
            <View style={styles.blueCardTextContainer}>
              <Text style={styles.blueCardTitle}>Quick Tip</Text>
              <Text style={styles.blueCardDescription}>
                Follow up within 24 hours for better conversion
              </Text>
            </View>
            
            {/* Rectangular white button */}
            <TouchableOpacity 
              style={styles.rectangularButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('FollowUps')}
            >
              <Text style={styles.rectangularButtonText}>View</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
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
            queryClient.invalidateQueries(['salesOpportunities']);
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
        <CustomHeader title="CRM Board" />
        
        {/* Content */}
        <View style={styles.container}>
          {/* Updated Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              onPress={() => handleTabPress('Leads')}
              style={[styles.tab, activeTab === 'Leads' && styles.activeTab]}>
              <Text style={[styles.tabText, activeTab === 'Leads' && styles.activeTabText]}>
                Leads
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleTabPress('SalesOpportunity')}
              style={[styles.tab, activeTab === 'SalesOpportunity' && styles.activeTab]}>
              <Text style={[styles.tabText, activeTab === 'SalesOpportunity' && styles.activeTabText]}>
                Sales Opportunity
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleTabPress('FollowUps')}
              style={[styles.tab, activeTab === 'FollowUps' && styles.activeTab]}>
              <Text style={[styles.tabText, activeTab === 'FollowUps' && styles.activeTabText]}>
                Follow ups
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content based on active tab */}
          {showSalesCard && (
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
            >
              {/* Custom Sales Tab Component */}
              <SalesTab
                navigation={navigation}
                salesSummary={salesSummary}
                salesOpportunities={salesOpportunities}
                circularChartData={circularChartData}
                circularChartLabels={circularChartLabels}
                isRefreshing={isRefreshing}
                handleSalesSummaryPress={handleSalesSummaryPress}
                handleSalesBlueCardPress={handleSalesBlueCardPress}
              />
            </ScrollView>
          )}

          {showCRMCard && (
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
            >
              <View style={styles.contentContainer}>
                <View style={{ marginVertical: '4%' }}>
                  {/* Earning Chart */}
                  <EarningChart
                    data={[1950, 2089, 3267, 5789, 4234, 3000, 2200]}
                    days={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
                    isRefreshing={isRefreshing}
                  />

                  {/* Blue Card with Rectangular Button */}
                  {renderBlueCard()}

                  {/* Lead Summary Cards */}
                  {renderLeadSummaryCards()}
                </View>
              </View>
            </ScrollView>
          )}

          {/* Show FollowupScreen when FollowUps tab is active */}
          {showOverviewCard && (
            <View style={styles.followupsContainer}>
              <FollowupScreen navigation={navigation} />
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

// Updated Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(240, 241, 245, 1)',
    paddingHorizontal: 10,
  },
  contentContainer: {
    flex: 1,
  },
  followupsContainer: {
    flex: 1,
  },
  // Updated Tabs
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2F4FE3',
    padding: 4,
    borderRadius: 6,
    marginTop: 20,
    marginBottom: 10,
    height: 40,
    marginHorizontal: 15,
  },
  tab: {
    backgroundColor: 'transparent',
    height: 25,
    paddingHorizontal: 5,
    borderRadius: 6,
    justifyContent: 'center',
    flex: 1,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#fff',
  },
  tabText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'K2D-Regular',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#000',
    fontFamily: 'K2D-SemiBold',
  },
  // Blue Card with Rectangular Button Styles
  blueCardContainer: {
    marginTop: 10,
    marginBottom: 12,
  },
  blueCard: {
    backgroundColor: '#2F4FE3',
    borderRadius: 8,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  blueCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  blueCardTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  blueCardTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'K2D-Bold',
    marginBottom: 2,
  },
  blueCardDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontFamily: 'K2D-Regular',
    lineHeight: 16,
  },
  rectangularButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rectangularButtonText: {
    color: '#2F4FE3',
    fontSize: 12,
    fontFamily: 'K2D-SemiBold',
  },
  // Lead Summary Cards - Uniform Design
  leadCardsContainer: {
    marginTop: 8,
  },
  leadCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#000000',
  },
  cardTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  cardCount: {
    fontSize: 16,
    fontFamily: 'K2D-Medium',
    color: '#333',
  },
  cardNumber: {
    fontSize: 18,
    fontFamily: 'K2D-Bold',
    color: '#2F4FE3',
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