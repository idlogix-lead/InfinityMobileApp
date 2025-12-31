import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const SInitial = ({ route }) => {
  const { opportunities } = route.params;

  const renderOpportunity = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Document No: <Text style={styles.cardValue}>
        {item.DocumentNo || 'N/A'}</Text></Text>
      <Text style={styles.cardLabel}>Client: <Text style={styles.cardValue}>
        {item.C_BPartner_ID?.identifier || 'N/A'}</Text></Text>
      <Text style={styles.cardLabel}>Amount: <Text style={styles.cardValue}>
        {item.OpportunityAmt || 'N/A'}</Text></Text>
      <Text style={styles.cardLabel}>Expected Close: <Text style={styles.cardValue}>
        {item.ExpectedCloseDate || 'N/A'}</Text></Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Opportunities</Text>

      <FlatList
        data={opportunities}
        keyExtractor={item => item.id.toString()}
        renderItem={renderOpportunity}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#f5f5f5' },
  heading: { fontSize: 20, fontWeight: 'bold', marginVertical: 10, color: '#333' },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
  },
  cardLabel:{
    fontSize: 13,
    color: '#000',
    marginVertical: 2,
    fontFamily:'K2D-Medium',
  },
    cardValue:{
    fontSize: 14,
    color: '#555',
    marginVertical: 2,
    fontFamily: 'K2D-SemiBold',
  }
});

export default SInitial;
