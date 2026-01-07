// screens/SalesOppertunity/SalesOpper.js
import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text
} from 'react-native';
import { useSalesOpportunities } from '../../hooks/CRMhooks/useCRM';
import SalesChart from '../../components/CRMSearch/CRMChart/SalesChart';
import SalesStages from './SalesStages';

const SalesOpper = ({
  todayFollowups,
  futureFollowups,
  missedFollowups,
}) => {
  const { 
    data: salesOpportunities = [], 
    isLoading, 
    error 
  } = useSalesOpportunities();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading sales data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error loading sales data</Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ marginVertical: '4%' }}>
        <SalesChart
          data={[1950, 2089, 3267, 5789, 4234, 3000, 2200]}
          days={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
        />
      </View>
      <View style={{ marginVertical: '0%' }}>
        <SalesStages salesData={salesOpportunities} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default SalesOpper;