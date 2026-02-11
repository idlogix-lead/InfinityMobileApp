// components/CRMSearch/SalesTab.js - Custom component for Sales tab
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CenterCircularChart from '../../components/CRMSearch/CRMChart/SalesChart';
import CRMCard from '../../components/CRMCard/CRMCard';

const SalesTab = ({
  navigation,
  salesSummary,
  leads = [],
  circularChartData,
  circularChartLabels,
  isRefreshing,
  handleSalesSummaryPress,
  handleSalesBlueCardPress,
}) => {
  // Combined single card with individual touchable opacities
  const renderCombinedOpportunityCard = () => {
    return (
      <View style={styles.combinedCard}>
        {/* Total Opportunities Card */}
        <TouchableOpacity 
          style={styles.opportunityItem}
          onPress={() => handleSalesSummaryPress('total')}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <View style={[styles.cardIconContainer, {backgroundColor: '#f0f9ff'}]}>
                <Ionicons name="briefcase" size={22} color="#000000" />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardCount}>Total Opportunities</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#111111" />
          </View>
        </TouchableOpacity>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Won Opportunities Card */}
        <TouchableOpacity 
          style={styles.opportunityItem}
          onPress={() => handleSalesSummaryPress('won')}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <View style={[styles.cardIconContainer, {backgroundColor: '#f0fdf4'}]}>
                <MaterialIcons name="emoji-events" size={22} color="#000000" />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardCount}>Won</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#111111" />
          </View>
        </TouchableOpacity>

        {/* Separator */}
        <View style={styles.separator} />

        {/* In Progress Card */}
        <TouchableOpacity 
          style={styles.opportunityItem}
          onPress={() => handleSalesSummaryPress('progress')}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <View style={[styles.cardIconContainer, {backgroundColor: '#fffbeb'}]}>
                <Ionicons name="timer" size={22} color="#000000" />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardCount}>In Progress</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#111111" />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Render leads list using CRMCard component
  const renderLeadsList = () => {
    if (!leads || leads.length === 0) {
      return (
        <View style={styles.emptyLeadsContainer}>
          <MaterialIcons name="people" size={40} color="#ccc" />
          <Text style={styles.emptyLeadsText}>No leads found</Text>
        </View>
      );
    }

    return (
      <View style={styles.leadsListContainer}>
        {leads.slice(0, 5).map((lead, index) => (
          <View key={lead.id || index} style={styles.cardContainer}>
            <TouchableOpacity 
              style={styles.cardTouchable}
              onPress={() => navigation.navigate('LeadsDetail', { data: lead })}
              activeOpacity={0.7}
            >
              <CRMCard
                leadId={lead.id}
                header={lead.AD_Org_ID?.identifier || lead.AD_Client_ID?.identifier}
                name={lead?.Name || lead?.ContactName}
                email={lead?.EMail || lead?.Email}
                cellNo={lead?.Phone}
                status={lead?.LeadStatus?.identifier}
                Description={lead?.Description}
                company={lead.BPName || lead.AD_Client_ID?.identifier || lead.AD_Org_ID?.identifier}
                mail={() => {
                  const email = lead?.EMail || lead?.Email;
                  if (email) {
                    // Handle mail action
                    console.log('Mail to:', email);
                  }
                }}
                phone={() => {
                  const phone = lead?.Phone;
                  if (phone) {
                    // Handle phone action
                    console.log('Call:', phone);
                  }
                }}
                dateText={lead?.Updated || lead?.Created}
                actOnPress={() => {
                  navigation.navigate('AddActivity', {
                    data: lead,
                    mode: 'create',
                  });
                }}
                onPress={() => {
                  navigation.navigate('LeadEdit', { data: lead });
                }}
              />
            </TouchableOpacity>
          </View>
        ))}
        
        {leads.length > 5 && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('GenericLead', { 
              leads: leads,
              screenTitle: "All Sales Opportunities"
            })}
          >
            <Text style={styles.viewAllText}>View All Opportunities ({leads.length})</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#2F4FE3" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.contentContainer}>
      <View style={{ marginVertical: '4%' }}>
        {/* Center Circular Chart for Sales */}
        <CenterCircularChart
          data={circularChartData}
          labels={circularChartLabels}
          isRefreshing={isRefreshing}
        />

        {/* Sales Opportunities Section with CRMCard */}
        <View style={styles.opportunitiesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sales Opportunities</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('GenericLead', { 
                leads: leads,
                screenTitle: "All Sales Opportunities"
              })}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {renderLeadsList()}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  // Combined Card Styles
  combinedCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  opportunityItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
  },
  // Card Content Styles
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
    width: 40,
    height: 40,
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
    fontSize: 18,
    fontFamily: 'K2D-Medium',
    color: '#333',
  },
  // Opportunities Section - Updated for CRMCard
  opportunitiesSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 5,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'K2D-Bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'K2D-Medium',
    color: '#2F4FE3',
  },
  // Leads List - CRMCard Container Styles (minimized margins)
  leadsListContainer: {
    paddingVertical: 8,
  },
  cardContainer: {
    marginHorizontal: 4, // Reduced from spacing.xs (4px)
    marginVertical: 2, // Reduced from spacing.xxs (2px)
  },
  cardTouchable: {
    // No additional margins
  },
  viewAllButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fafafa',
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'K2D-Medium',
    color: '#2F4FE3',
    marginRight: 8,
  },
  emptyLeadsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  emptyLeadsText: {
    fontSize: 16,
    fontFamily: 'K2D-Medium',
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default SalesTab;