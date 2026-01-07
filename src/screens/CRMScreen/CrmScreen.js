// screens/CrmScreen.js - Updated with complete logic
import React, { useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
  Dimensions,
  Alert,
  Linking
} from 'react-native';
import { useQueryClient } from 'react-query';
import { useAuthStore } from '../../store/authStore';
import { useCRMStore } from '../../store/crmStore';
import {
  useLeads,
  useFollowups,
  useSalesOpportunities,
  useUpdateFollowup,
} from '../../hooks/CRMhooks/useCRM';
import Loader from '../../components/Loader';
import EarningChart from '../../components/CRMSearch/CRMChart/EarningChart';
import SalesOpper from '../SalesOppertunity/SalesOpper';
import CRMCard from '../../components/CRMCard/CRMCard';
import { Provider } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';

const screenWidth = Dimensions.get('window').width;

const CrmScreen = ({ navigation }) => {
  const queryClient = useQueryClient();
  const userName = useAuthStore(state => state.userName);
  
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
  
  // Fetch data with React Query
  const {
    data: leads = [],
    isLoading: leadsLoading,
    error: leadsError,
  } = useLeads();
  
  const {
    data: followups = [],
    isLoading: followupsLoading,
    error: followupsError,
  } = useFollowups();
  
  const {
    data: salesOpportunities = [],
    isLoading: salesLoading,
    error: salesError,
  } = useSalesOpportunities();
  
  // Memoized lead calculations
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
      case 'Overview':
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
  
  // Handle lead navigation
  const handleLeadNavigation = (type, leadsData) => {
    navigation.navigate(`Crm${type}`, {
      leads: leadsData,
      activities: followups,
    });
  };
  
  // Handle lead actions
  const handleMail = (email) => {
    if (!email) {
      Alert.alert('Error', 'Email address not found.');
      return;
    }
    Linking.openURL(`mailto:${email}`);
  };
  
  const handlePhone = (phone) => {
    if (!phone) {
      Alert.alert('Error', 'Phone number not found.');
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };
  
  // Render lead card for main screen
  const renderLeadCard = (item) => {
    const userActivity = followups.filter(act => act?.AD_User_ID?.id === item?.id);
    const lastActivity = [...userActivity].sort(
      (a, b) => new Date(b.Created) - new Date(a.Created)
    )[0];
    const lastActivityType = lastActivity?.ContactActivityType?.identifier || 'N/A';
    const activityCount = userActivity.length;
    
    return (
      <View style={{ marginHorizontal: 10, marginVertical: 5 }}>
        <CRMCard
          name={item.Name}
          header={item.AD_Client_ID?.identifier}
          status={item?.LeadStatus?.identifier}
          email={item?.EMail}
          count={activityCount}
          cellNo={item?.Phone}
          Description={item?.Description}
          interactionType={lastActivityType}
          mail={() => handleMail(item?.EMail)}
          phone={() => handlePhone(item?.Phone)}
          dateText={item?.Updated}
          actOnPress={() => {
            navigation.navigate('ActivityList', {
              data: item,
              mode: 'create',
            });
          }}
          onPress={() => {
            navigation.navigate('LeadsDetails', { data: item });
          }}
        />
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
  
  return (
    <Provider>
      <ScrollView showsVerticalScrollIndicator={false}>
        <StatusBar barStyle={'dark-content'} />
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ marginRight: 5 }}>
                <Ionicons name="chevron-back" size={25} color={'#000'} />
              </TouchableOpacity>
            </View>
            
            {showCRMCard && (
              <TouchableOpacity
                onPress={() => navigation.navigate('AddLeads')}
                style={styles.addButton}>
                <Text style={styles.addButtonText}>Add Lead</Text>
              </TouchableOpacity>
            )}
            
            {showSalesCard && (
              <TouchableOpacity
                onPress={() => navigation.navigate('AddSaleOppor')}
                style={styles.addButton}>
                <Text style={styles.addButtonText}>Add Opportunity</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Title */}
          <Text style={styles.chartTitle}>CRM Board</Text>
          <Text style={styles.chartSubtitle}>
            Manage leads and opportunities to drive business growth.
          </Text>
          
          {/* Tabs */}
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
              onPress={() => handleTabPress('Overview')}
              style={[styles.tab, activeTab === 'Overview' && styles.activeTab]}>
              <Text style={[styles.tabText, activeTab === 'Overview' && styles.activeTabText]}>
                Overview
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Content based on active tab */}
          {showSalesCard && (
            <SalesOpper
              todayFollowups={todayFollowups}
              futureFollowups={futureFollowups}
              missedFollowups={missedFollowups}
              salesCall={salesOpportunities}
            />
          )}
          
          {showCRMCard && (
            <View style={{ marginVertical: '4%' }}>
              <EarningChart
                data={[1950, 2089, 3267, 5789, 4234, 3000, 2200]}
                days={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
              />
              
              <Text style={[styles.sectionTitle, { paddingVertical: '2%' }]}>
                Leads Summary
              </Text>
              
              <View style={styles.leadsContainer}>
                {/* Working Leads */}
                <TouchableOpacity
                  style={styles.leadCard}
                  onPress={() => handleLeadNavigation('Working', workingLeads)}>
                  <View style={styles.leadContent}>
                    <View style={styles.leadIconWrapper}>
                      <MaterialIcons name="update" size={15} color="#000" />
                    </View>
                    <Text style={styles.leadTitle}>Working Leads</Text>
                    <View style={[styles.badge, { backgroundColor: '#DBEAFE' }]}>
                      <Text style={styles.badgeText}>
                        {workingLeads.length.toString().padStart(2, '0')}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.leadSubtitle}>Open leads</Text>
                </TouchableOpacity>
                
                {/* New Leads */}
                <TouchableOpacity
                  style={styles.leadCard}
                  onPress={() => handleLeadNavigation('New', newLeads)}>
                  <View style={styles.leadContent}>
                    <View style={styles.leadIconWrapper}>
                      <MaterialIcons name="gps-not-fixed" size={15} color="#000" />
                    </View>
                    <Text style={styles.leadTitle}>New Leads</Text>
                    <View style={[styles.badge, { backgroundColor: 'rgb(245, 225, 250)' }]}>
                      <Text style={styles.badgeText}>
                        {newLeads.length.toString().padStart(2, '0')}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.leadSubtitle}>Open leads</Text>
                </TouchableOpacity>
                
                {/* Converted Leads */}
                <TouchableOpacity
                  style={styles.leadCard}
                  onPress={() => handleLeadNavigation('Converted', convertedLeads)}>
                  <View style={styles.leadContent}>
                    <View style={styles.leadIconWrapper}>
                      <MaterialIcons name="sync" size={15} color="#000" />
                    </View>
                    <Text style={[styles.leadTitle, { fontSize: 13 }]}>
                      Converted Leads
                    </Text>
                    <View style={[styles.badge, { backgroundColor: '#DCFCE7' }]}>
                      <Text style={styles.badgeText}>
                        {convertedLeads.length.toString().padStart(2, '0')}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.leadSubtitle}>Total converted</Text>
                </TouchableOpacity>
                
                {/* Total Leads */}
                <TouchableOpacity
                  style={styles.leadCard}
                  onPress={() => handleLeadNavigation('Total', leads)}>
                  <View style={styles.leadContent}>
                    <View style={styles.leadIconWrapper}>
                      <MaterialIcons name="diversity-2" size={15} color="#000" />
                    </View>
                    <Text style={styles.leadTitle}>Total Leads</Text>
                    <View style={[styles.badge, { backgroundColor: '#FEF3C7' }]}>
                      <Text style={styles.badgeText}>
                        {totalLeads.toString().padStart(2, '0')}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.leadSubtitle}>All leads</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {/* Followups Section */}
          {!showOverviewCard && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Followups</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('AllFollowups', { 
                    data: followups,
                    activities: followups 
                  })}
                  style={styles.viewAllButton}>
                  <Text style={styles.viewAllButtonText}>All Activities</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.followupsContainer}>
                {/* Today's Followups */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('AllFollowups', {
                    data: todayFollowups,
                    activities: followups,
                    activeTab: 'today',
                  })}
                  style={styles.followupItem}>
                  <View style={[styles.followupBadge, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={styles.followupBadgeText}>
                      {todayFollowups.length.toString().padStart(2, '0')}
                    </Text>
                  </View>
                  <Text style={styles.followupText}>Today's Followup</Text>
                  <Ionicons name="chevron-forward" size={18} color="#000" />
                </TouchableOpacity>
                
                {/* Future Followups */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('AllFollowups', {
                    data: futureFollowups,
                    activities: followups,
                    activeTab: 'future',
                  })}
                  style={styles.followupItem}>
                  <View style={[styles.followupBadge, { backgroundColor: '#DBEAFE' }]}>
                    <Text style={styles.followupBadgeText}>
                      {futureFollowups.length.toString().padStart(2, '0')}
                    </Text>
                  </View>
                  <Text style={styles.followupText}>Future Followup</Text>
                  <Ionicons name="chevron-forward" size={18} color="#000" />
                </TouchableOpacity>
                
                {/* Missed Followups */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('AllFollowups', {
                    data: missedFollowups,
                    activities: followups,
                    activeTab: 'missed',
                  })}
                  style={styles.followupItem}>
                  <View style={[styles.followupBadge, { backgroundColor: 'rgb(245, 225, 250)' }]}>
                    <Text style={styles.followupBadgeText}>
                      {missedFollowups.length.toString().padStart(2, '0')}
                    </Text>
                  </View>
                  <Text style={styles.followupText}>Missed Followup</Text>
                  <Ionicons name="chevron-forward" size={18} color="#000" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
        
        {isLoading && <Loader />}
      </ScrollView>
      
      {/* Floating Action Button */}
      {showCRMCard && (
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateActivity')}
          style={styles.floatingButton}>
          <Text style={styles.floatingButtonText}>+</Text>
        </TouchableOpacity>
      )}
    </Provider>
  );
};

// Styles remain the same as in the previous CrmScreen version
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(240, 241, 245, 1)',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '8%',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 20,
    color: '#000',
    fontFamily: 'K2D-Medium',
    marginBottom: 5,
  },
  chartSubtitle: {
    color: 'rgba(48, 48, 48, 1)',
    fontSize: 11,
    marginBottom: 15,
    fontFamily: 'K2D-Medium',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 4,
    borderRadius: 6,
    marginBottom: 20,
    height: 40,
  },
  tab: {
    backgroundColor: 'transparent',
    height: 25,
    paddingHorizontal: 15,
    borderRadius: 6,
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#fff',
  },
  tabText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'K2D-Regular',
  },
  activeTabText: {
    color: '#000',
    fontFamily: 'K2D-SemiBold',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'K2D-Medium',
    color: '#000',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  leadsContainer: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    flexWrap: 'wrap',
  },
  leadCard: {
    backgroundColor: '#fff',
    width: '48%',
    borderRadius: 6,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 3,
    height: 105,
  },
  leadContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  leadIconWrapper: {
    backgroundColor: '#fff',
    height: 25,
    width: 25,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    elevation: 3,
    marginRight: 10,
  },
  leadTitle: {
    fontSize: 15,
    color: '#000',
    fontFamily: 'K2D-SemiBold',
    flex: 1,
  },
  badge: {
    borderRadius: 20,
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#555',
    fontSize: 12,
    fontFamily: 'K2D-SemiBold',
  },
  leadSubtitle: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'K2D-Regular',
  },
  followupsContainer: {
    backgroundColor: 'rgba(246, 246, 246, 1)',
    padding: 10,
    borderRadius: 6,
  },
  followupItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
  },
  followupBadge: {
    width: 25,
    height: 25,
    borderRadius: 6,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  followupBadgeText: {
    color: "#555",
    fontFamily: "K2D-SemiBold",
    fontSize: 12,
  },
  followupText: {
    fontSize: 15,
    fontFamily: 'K2D-Medium',
    color: '#000',
    flex: 1,
  },
  viewAllButton: {
    backgroundColor: '#000',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewAllButtonText: {
    color: '#fff',
    fontFamily: 'K2D-SemiBold',
    fontSize: 13,
  },
  addButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    elevation: 3,
    backgroundColor: '#2F4FE3',
    borderRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontFamily: 'K2D-SemiBold',
    fontSize: 13,
  },
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