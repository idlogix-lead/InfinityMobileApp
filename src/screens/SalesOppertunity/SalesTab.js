// components/CRMSearch/SalesTab.js - Custom component for Sales tab
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CenterCircularChart from '../../components/CRMSearch/CRMChart/SalesChart';

const SalesTab = ({
  navigation,
  salesSummary,
  salesOpportunities,
  circularChartData,
  circularChartLabels,
  isRefreshing,
  handleSalesSummaryPress,
  handleSalesBlueCardPress,
}) => {
  // Render sales summary cards
  const renderSalesSummaryCards = () => {
    return (
      <View style={styles.leadCardsContainer}>
        {/* Total Opportunities Card */}
        <TouchableOpacity 
          style={styles.salesCard}
          onPress={() => handleSalesSummaryPress('total')}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <View style={[styles.cardIconContainer, {backgroundColor: '#f0f9ff'}]}>
                <Ionicons name="briefcase" size={20} color="#0369a1" />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardCount}>Total Opportunities</Text>
                <Text style={[styles.cardNumber, {color: '#0369a1'}]}>
                  {salesSummary.totalSales}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#111111" />
          </View>
        </TouchableOpacity>

        {/* Won Opportunities Card */}
        <TouchableOpacity 
          style={styles.salesCard}
          onPress={() => handleSalesSummaryPress('won')}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <View style={[styles.cardIconContainer, {backgroundColor: '#f0fdf4'}]}>
                <MaterialIcons name="emoji-events" size={20} color="#16a34a" />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardCount}>Won</Text>
                <Text style={[styles.cardNumber, {color: '#16a34a'}]}>
                  {salesSummary.wonSales}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#111111" />
          </View>
        </TouchableOpacity>

        {/* In Progress Card */}
        <TouchableOpacity 
          style={styles.salesCard}
          onPress={() => handleSalesSummaryPress('progress')}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <View style={[styles.cardIconContainer, {backgroundColor: '#fffbeb'}]}>
                <Ionicons name="timer" size={20} color="#f59e0b" />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardCount}>In Progress</Text>
                <Text style={[styles.cardNumber, {color: '#f59e0b'}]}>
                  {salesSummary.inProgressSales}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#111111" />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Render sales blue card with different message
  const renderSalesBlueCard = () => {
    return (
      <View style={styles.blueCardContainer}>
        <View style={styles.salesBlueCard}>
          <View style={styles.blueCardContent}>
            <View style={styles.blueCardTextContainer}>
              <Text style={styles.blueCardTitle}>Sales Tip</Text>
              <Text style={styles.blueCardDescription}>
                Focus on high-value opportunities for better ROI
              </Text>
            </View>
            
            {/* Rectangular white button */}
            <TouchableOpacity 
              style={styles.rectangularButton}
              activeOpacity={0.8}
              onPress={handleSalesBlueCardPress}
            >
              <Text style={styles.rectangularButtonText}>View</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.contentContainer}>
      <View style={{ marginVertical: '4%' }}>
        {/* Center Circular Chart for Sales */}
        <CenterCircularChart
          data={circularChartData}
          labels={circularChartLabels}
          isRefreshing={isRefreshing}
        />

        {/* Sales Blue Card */}
        {renderSalesBlueCard()}

        {/* Sales Summary Cards */}
        {renderSalesSummaryCards()}

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  // Blue Card with Rectangular Button Styles
  blueCardContainer: {
    marginTop: 10,
    marginBottom: 12,
  },
  salesBlueCard: {
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
  salesCard: {
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
});

export default SalesTab;