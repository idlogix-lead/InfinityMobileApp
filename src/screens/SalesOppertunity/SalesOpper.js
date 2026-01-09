// screens/SalesOppertunity/SalesOpper.js
import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useSalesOpportunities } from '../../hooks/CRMhooks/useCRM';
import SalesChart from '../../components/CRMSearch/CRMChart/SalesChart';
import SalesStages from './SalesStages';

const SalesOpper = () => {
  const { 
    data: salesOpportunities, 
    isLoading, 
    error,
    refetch,
    isRefetching 
  } = useSalesOpportunities();

  // Debug logging
  console.log('🔍 SalesOpper Component State:', {
    isLoading,
    error: error?.message,
    dataLength: salesOpportunities?.length,
    dataType: typeof salesOpportunities,
    isArray: Array.isArray(salesOpportunities)
  });

  // Handle loading state
  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading Sales Opportunities...</Text>
      </View>
    );
  }

  // Handle error state
  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Ensure data is an array (safety check)
  const safeSalesData = Array.isArray(salesOpportunities) ? salesOpportunities : [];
  
  // Handle empty data state
  if (safeSalesData.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.emptyText}>No sales opportunities found</Text>
        <Text style={styles.emptySubtext}>
          This could be because:
          {"\n"}1. You don't have any opportunities assigned to you
          {"\n"}2. Your filter criteria is too restrictive
          {"\n"}3. You don't have permission to view opportunities
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={isRefetching} 
          onRefresh={refetch}
          colors={['#4A90E2']}
        />
      }
    >
      <View style={{ marginVertical: '4%' }}>
        <SalesChart
          data={[1950, 2089, 3267, 5789, 4234, 3000, 2200]}
          days={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
        />
      </View>
      
      <View style={{ marginVertical: '0%' }}>
        <SalesStages 
          salesData={safeSalesData} 
          onRefresh={refetch}
        />
      </View>
      
      {/* Debug info (remove in production) */}
      <View style={styles.debugContainer}>
        <Text style={styles.debugText}>
          Opportunities: {safeSalesData.length}
        </Text>
        {safeSalesData.length > 0 && (
          <Text style={styles.debugText}>
            First opportunity: {JSON.stringify(safeSalesData[0]?.Name || 'N/A')}
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  debugContainer: {
    backgroundColor: '#F5F5F5',
    padding: 10,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
});

export default SalesOpper;