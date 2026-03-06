// LeadTab.js - UPDATED to show all statuses dynamically with original styling

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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const LeadTab = ({
  leads = [],
  navigation,
  isRefreshing = false,
  handleLeadSummaryPress,
  handleStatusCardPress,
  totalLeads,
  statusSummaries = [], // All status summaries from CrmScreen
}) => {
  
  // Get icon for status based on name - ALL ICONS BLACK
  const getStatusIcon = (statusName) => {
    const iconMap = {
      'New': { family: 'Ionicons', name: 'star' },
      'Working': { family: 'Ionicons', name: 'time' },
      'Converted': { family: 'MaterialIcons', name: 'swap-horiz' },
      'Expired': { family: 'MaterialCommunityIcons', name: 'clock-outline' },
      'Qualified': { family: 'MaterialIcons', name: 'check-circle' },
      'Lost': { family: 'MaterialIcons', name: 'close-circle' },
      'Contacted': { family: 'Ionicons', name: 'call' },
      'Meeting': { family: 'Ionicons', name: 'calendar' },
      'Proposal': { family: 'MaterialIcons', name: 'description' },
      'Negotiation': { family: 'MaterialCommunityIcons', name: 'handshake' },
      'Demo': { family: 'Ionicons', name: 'videocam' },
      'Follow-up': { family: 'Ionicons', name: 'repeat' },
      'Not Interested': { family: 'MaterialIcons', name: 'block' },
      'Customer': { family: 'Ionicons', name: 'people' },
    };
    
    // Return mapped icon or default
    return iconMap[statusName] || { 
      family: 'MaterialIcons', 
      name: 'label'
    };
  };

  // Render icon based on family - ALL BLACK (#000000)
  const renderIcon = (iconInfo) => {
    const { family, name } = iconInfo;
    const iconColor = '#000000'; // FORCE BLACK COLOR
    const iconSize = 22;
    
    switch(family) {
      case 'Ionicons':
        return <Ionicons name={name} size={iconSize} color={iconColor} />;
      case 'MaterialIcons':
        return <MaterialIcons name={name} size={iconSize} color={iconColor} />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons name={name} size={iconSize} color={iconColor} />;
      default:
        return <MaterialIcons name={name} size={iconSize} color={iconColor} />;
    }
  };

  // Get background color for icon based on status name (matching original style)
  const getIconBackgroundColor = (statusName) => {
    const bgMap = {
      'New': '#f0f9ff',      // Light blue
      'Working': '#fffbeb',   // Light yellow
      'Converted': '#f0fdf4', // Light green
      'Expired': '#fef2f2',   // Light red
      'Qualified': '#f3e8ff', // Light purple
      'Lost': '#fef2f2',      // Light red
      'Contacted': '#e6f7ff', // Light cyan
      'Meeting': '#fff7e6',   // Light orange
      'Proposal': '#e6f3ff',  // Light blue
      'Negotiation': '#f3e8ff', // Light purple
      'Demo': '#e6f7ff',       // Light cyan
      'Follow-up': '#fff1e6',  // Light peach
      'Not Interested': '#f0f0f0', // Light gray
      'Customer': '#e6ffe6',   // Light green
    };
    
    return bgMap[statusName] || '#f5f5f5'; // Default light gray
  };

  // Render main card with all statuses
  const renderCombinedLeadCard = () => {
    return (
      <View style={styles.combinedCard}>
        {/* Total Leads Card - Always first */}
        <TouchableOpacity 
          style={styles.leadItem}
          onPress={() => handleLeadSummaryPress('total')}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <View style={[styles.cardIconContainer, { backgroundColor: '#f0f9ff' }]}>
                <MaterialIcons name="web" size={22} color="#000000" />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardCount}>Total Leads</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#111111" />
          </View>
        </TouchableOpacity>

        {/* Render all statuses dynamically */}
        {statusSummaries.map((status, index) => {
          const iconInfo = getStatusIcon(status.name);
          const backgroundColor = getIconBackgroundColor(status.name);
          
          return (
            <React.Fragment key={status.id}>
              <View style={styles.separator} />
              <TouchableOpacity 
                style={styles.leadItem}
                onPress={() => {
                  if (handleStatusCardPress) {
                    handleStatusCardPress(status);
                  } else {
                    handleLeadSummaryPress(status.id);
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardLeft}>
                    <View style={[styles.cardIconContainer, { backgroundColor }]}>
                      {renderIcon(iconInfo)}
                    </View>
                    <View style={styles.cardTextContainer}>
                      <Text style={styles.cardCount}>{status.name}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#111111" />
                </View>
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
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

          {/* Combined Lead Card with all statuses */}
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
    borderWidth: 1,
    borderColor: '#000000',
  },
  cardTextContainer: {
    flex: 1,
  },
  cardCount: {
    fontSize: 18,
    fontFamily: 'K2D-Medium',
    color: '#333',
  },
});

export default LeadTab;