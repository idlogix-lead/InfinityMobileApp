// components/CRMSearch/SalesTab.js - Updated with better data display
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CenterCircularChart from '../../components/CRMSearch/CRMChart/SalesChart';
import OpportunityCard from '../../components/CRMCard/SalesCard';

const SalesTab = ({
  navigation,
  salesOpportunities = [],
  circularChartData,
  circularChartLabels,
  isRefreshing,
}) => {
  // Log received opportunities
  React.useEffect(() => {
    console.log('📊 SalesTab received opportunities:', {
      count: salesOpportunities.length,
      data: salesOpportunities.map(opp => ({
        id: opp.id,
        docNo: opp.DocumentNo,
        amount: opp.OpportunityAmt,
        stage: opp.salesStageName || opp.C_SalesStage_ID?.identifier
      }))
    });
  }, [salesOpportunities]);

  // Render opportunities list
  const renderOpportunitiesList = () => {
    if (!salesOpportunities || salesOpportunities.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="briefcase-off" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No sales opportunities found</Text>
          <Text style={styles.emptySubText}>Pull down to refresh or create a new opportunity</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('AddSaleOppor')}
          >
            <Text style={styles.createButtonText}>Create Opportunity</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.opportunitiesListContainer}>
        {salesOpportunities.map((opportunity, index) => {
          // Ensure we have a unique key
          const key = opportunity.id || `opp-${index}-${opportunity.DocumentNo || Date.now()}`;
          
          return (
            <View key={key} style={styles.opportunityCardWrapper}>
              <OpportunityCard 
                opportunity={opportunity}
                onPress={(opp) => navigation.navigate('SalesDetail', { data: opp })}
                showLeadInfo={true}
                compact={false}
              />
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.contentContainer}>
      <View style={styles.container}>
        {/* Center Circular Chart for Sales */}
        <CenterCircularChart
          data={circularChartData}
          labels={circularChartLabels}
          isRefreshing={isRefreshing}
        />

        {/* Sales Opportunities List */}
        <View style={styles.opportunitiesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Sales Opportunities</Text>
            <Text style={styles.countText}>{salesOpportunities.length} total</Text>
          </View>
          
          {renderOpportunitiesList()}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,

  },
  container: {
    marginVertical: '4%',
  },
  opportunitiesSection: {
    backgroundColor: '#fff',
  
    borderRadius: 8,
    marginHorizontal: 2,
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
  countText: {
    fontSize: 14,
    fontFamily: 'K2D-Medium',
    color: '#666',
  },
  opportunitiesListContainer: {
    paddingVertical: 8,
  },
  opportunityCardWrapper: {
    marginHorizontal: 12,
    marginVertical: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'K2D-Medium',
    color: '#999',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    fontFamily: 'K2D-Regular',
    color: '#999',
    marginBottom: 16,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#2F4FE3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  createButtonText: {
    fontSize: 14,
    fontFamily: 'K2D-SemiBold',
    color: '#fff',
  },
});

export default SalesTab;