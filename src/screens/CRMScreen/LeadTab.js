import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import EarningChart from '../../components/CRMSearch/CRMChart/EarningChart';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const LeadTab = ({
  leads = [],
  navigation,
  isRefreshing = false,
  handleLeadSummaryPress,
  totalLeads,
  convertedLeads,
  workingLeads,
  newLeads
}) => {
  
  // Combined single card with individual touchable opacities
  const renderCombinedLeadCard = () => {
    return (
      <View style={styles.combinedCard}>
        {/* Total Leads Card */}
        <TouchableOpacity 
          style={styles.leadItem}
          onPress={() => handleLeadSummaryPress('total')}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <View style={[styles.cardIconContainer, {backgroundColor: '#f0f9ff'}]}>
                <MaterialIcons name="web" size={22} color="#000000" />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardCount}>Total Leads</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#111111" />
          </View>
        </TouchableOpacity>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Converted Leads Card */}
        <TouchableOpacity 
          style={styles.leadItem}
          onPress={() => handleLeadSummaryPress('converted')}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <View style={[styles.cardIconContainer, {backgroundColor: '#f0fdf4'}]}>
                <MaterialIcons name="swap-horiz" size={22} color="#000000" />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardCount}>Converted</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#111111" />
          </View>
        </TouchableOpacity>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Working Leads Card */}
        <TouchableOpacity 
          style={styles.leadItem}
          onPress={() => handleLeadSummaryPress('working')}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <View style={[styles.cardIconContainer, {backgroundColor: '#fffbeb'}]}>
                <Ionicons name="time" size={22} color="#000000" />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardCount}>Working</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#111111" />
          </View>
        </TouchableOpacity>

        {/* Separator */}
        <View style={styles.separator} />
      </View>
    );
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.contentContainer}>
        <View style={{ marginVertical: '4%' }}>
          {/* Earning Chart */}
          <EarningChart
            data={[1950, 2089, 3267, 5789, 4234, 3000, 2200]}
            days={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
            isRefreshing={isRefreshing}
          />

          {/* Combined Lead Card */}
          {renderCombinedLeadCard()}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  // Combined Card Styles
  combinedCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  leadItem: {
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 12,
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
});

export default LeadTab;