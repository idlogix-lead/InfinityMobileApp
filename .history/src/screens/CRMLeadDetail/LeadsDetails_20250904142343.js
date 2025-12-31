import {ScrollView, StyleSheet, Text, View, Dimensions} from 'react-native';
import React, {useState} from 'react';
import CustomHeader from '../../components/CustomHeader';

const {width} = Dimensions.get('window');

const LeadsDetails = ({route}) => {
  const {data} = route.params;

  // Component for each detail item
  const DetailItem = ({label, value}) => {
    const [contentHeight, setContentHeight] = useState(0);
    const needsScroll = contentHeight > 80; // ~4 lines height
    return (
      // Bottom Additional Details Components
      <View>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.card, needsScroll && styles.scrollableCard]}>
          <View
            onLayout={e => setContentHeight(e.nativeEvent.layout.height)}
            style={needsScroll && {maxHeight: 120}}>
            {needsScroll ? (
              <ScrollView
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}>
                <Text style={styles.value}>{value || 'N/A'}</Text>
              </ScrollView>
            ) : (
              <Text style={styles.value} numberOfLines={4}>
                {value || 'N/A'}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader title={'Leads Details'} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top 1 Card */}
        <View style={styles.firstCard}>
          <View style={styles.infoBlock}>
            <Text style={styles.firstCardLabel}>Name:</Text>
            <Text style={styles.value}>{data?.Name || 'N/A'}</Text>
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.firstCardLabel}>Email:</Text>
            <Text style={styles.value}>{data?.EMail || 'N/A'}</Text>
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.firstCardLabel}>Phone #</Text>
            <Text style={styles.value}>{data?.Phone || 'N/A'}</Text>
          </View>
        </View>

        {/* Additional Details */}
        {[
          {label: 'Description', value: data?.Description},
          {label: 'Customer', value: data?.BPName},
          {label: 'Code', value: data?.Value},
          {label: 'Identifier', value: data?.AD_Org_ID?.identifier},
          {label: 'SalesRep', value: data?.SalesRep_ID?.identifier},
          {label: 'IsActive', value: data?.IsActive ? 'Yes' : 'No'},
          {label: 'IsSalesLead', value: data?.IsSalesLead ? 'Yes' : 'No'},
          {label: 'IsVendorLead', value: data?.IsVendorLead ? 'Yes' : 'No'},
          {label: 'Birthday', value: data?.Birthday || 'N/A'},
          {label: 'Comments', value: data?.Comments || 'N/A'},
          {label: 'Source', value: data?.LeadSource?.propertyLabel || 'N/A'},
          {label: 'SourceDesc', value: data?.LeadSourceDescription || 'N/A'},
          {label: 'Status', value: data?.LeadStatus?.propertyLabel || 'N/A'},
          {label: 'StatusDesc', value: data?.LeadStatusDescription || 'N/A'},
        ].map((item, index) => (
          <DetailItem key={index} label={item.label} value={item.value} />
        ))}
      </ScrollView>
    </View>
  );
};

export default LeadsDetails;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  firstCard: {
    width: width * 0.95,
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    marginVertical: 10,
  },
  firstCardLabel: {
    color: '#333',
    width: width * 0.4,
  },
  infoBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 15,
    marginBottom: 3,
    fontStyle: 'italic',
  },
  value: {
    color: '#555',
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: 'white',
    width: width * 0.95,
    alignSelf: 'center',
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    marginBottom: 10,
    minHeight: 60,
    maxHeight: 120, // Fixed height with internal scrolling
  },
  scrollView: {
    flex: 1,
  },
});
