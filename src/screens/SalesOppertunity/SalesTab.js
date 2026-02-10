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

const SalesTab = ({
  navigation,
  salesSummary,
  leads = [], // Changed from salesOpportunities to leads
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

  // Render leads list (using leads data from CrmScreen)
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
          <TouchableOpacity
            key={lead.id || index}
            style={styles.leadListItem}
            onPress={() => navigation.navigate('LeadsDetail', { data: lead })}
            activeOpacity={0.7}
          >
            <View style={styles.listItemContent}>
              <View style={styles.listItemLeft}>
                <View style={styles.listItemIcon}>
                  <Ionicons name="person" size={18} color="#2F4FE3" />
                </View>
                <View style={styles.listItemTextContainer}>
                  <Text style={styles.leadName} numberOfLines={1}>
                    {lead.Name || lead.ContactName || 'Unnamed Lead'}
                  </Text>
                  <Text style={styles.leadDetails} numberOfLines={1}>
                    {lead.LeadStatus?.identifier || 'No Status'} • 
                    {lead.EMail || lead.Email || 'No Email'}
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#999" />
            </View>
            {index < Math.min(leads.length - 1, 4) && (
              <View style={styles.listSeparator} />
            )}
          </TouchableOpacity>
        ))}
        
        {leads.length > 5 && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('GenericLead', { 
              leads: leads,
              screenTitle: "All Leads"
            })}
          >
            <Text style={styles.viewAllText}>View All Leads ({leads.length})</Text>
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

     

        {/* Leads List Section */}
        <View style={styles.leadsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sales Opportunities</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('GenericLead', { 
                leads: leads,
                screenTitle: "All Leads"
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
  // Leads Section
  leadsSection: {
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
  // Leads List
  leadsListContainer: {
    paddingVertical: 8,
  },
  leadListItem: {
    paddingHorizontal: 16,
  },
  listItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listItemTextContainer: {
    flex: 1,
  },
  leadName: {
    fontSize: 16,
    fontFamily: 'K2D-Medium',
    color: '#333',
    marginBottom: 4,
  },
  leadDetails: {
    fontSize: 14,
    fontFamily: 'K2D-Regular',
    color: '#666',
  },
  listSeparator: {
    height: 1,
    backgroundColor: '#f5f5f5',
    marginLeft: 44, // Align with text (icon width + margin)
  },
  viewAllButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fafafa',
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