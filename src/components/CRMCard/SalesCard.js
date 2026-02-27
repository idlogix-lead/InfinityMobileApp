// components/CRMCard/MinimalOpportunityCard.js - Status top, amount middle, probability bottom with dynamic currency
// UPDATED: Added phone and mail icons matching CRMCard
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import theme from '../../constants/CRMTheme/CRMTheme';
import moment from 'moment';

const { Colors, Typography, Layout, Spacing } = theme;
const { scale, verticalScale } = Layout;

const OpportunityCard = ({ 
  opportunity,
  onPress,
  onActivityPress,
  showStatus = true,
  showAmount = true,
}) => {
  const navigation = useNavigation();

  // Extract opportunity data with fallbacks for both original and transformed data
  const opportunityName = opportunity?.Name || 
                         opportunity?.DocumentNo || 
                         'Unnamed Opportunity';
  
  const opportunityAmount = opportunity?.OpportunityAmt || 
                           opportunity?.Amount || 
                           0;
  
  const probability = opportunity?.Probability || 0;
  
  const expectedCloseDate = opportunity?.ExpectedCloseDate || 
                           opportunity?.CloseDate;

  // Extract business partner
  const businessPartner = 
    opportunity?.businessPartnerName || 
    opportunity?.C_BPartner_ID?.identifier || 
    opportunity?.BusinessPartner || 
    'No Company';

  // Extract lead/contact name
  const leadName = 
    opportunity?.userName || 
    opportunity?.AD_User_ID?.identifier || 
    opportunity?.ContactName || 
    'Unknown Contact';

  // Extract contact info for phone and email
  const leadEmail = opportunity?.AD_User_ID?.EMail || opportunity?.ContactEmail;
  const leadPhone = opportunity?.AD_User_ID?.Phone || opportunity?.ContactPhone;

  // Extract lead/contact ID for navigation
  const leadId = opportunity?.AD_User_ID?.id || opportunity?.userId;

  // Extract lead/contact data for activity creation
  const leadData = {
    id: leadId,
    Name: leadName,
    EMail: leadEmail,
    Phone: leadPhone,
    BPName: businessPartner,
  };

  // Get status
  const status = 
    opportunity?.C_OpportunityStatus?.identifier || 
    opportunity?.OpportunityStatus || 
    'Open';

  // Extract currency code from the opportunity data
  const currencyCode = 
    opportunity?.currencyCode || // From transformed data
    opportunity?.C_Currency_ID?.ISO_Code || // Original nested with ISO_Code
    opportunity?.C_Currency_ID?.identifier || // Original nested with identifier
    'PKR'; // Default to PKR if not found

  // Format amount with the currency from the opportunity
  const formattedAmount = new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(opportunityAmount);

  // Format date
  const formattedDate = expectedCloseDate 
    ? moment(expectedCloseDate).format('DD MMM YYYY')
    : 'No date';

  // Format relative time for activity
  const relativeTime = expectedCloseDate 
    ? moment(expectedCloseDate).fromNow()
    : 'No date';

  // Get status color
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('won')) return Colors.success || '#10B981';
    if (statusLower.includes('lost')) return Colors.error || '#EF4444';
    if (statusLower.includes('progress')) return Colors.warning || '#F59E0B';
    if (statusLower.includes('open')) return Colors.info || '#3B82F6';
    return Colors.textSecondary || '#6B7280';
  };

  const statusColor = getStatusColor(status);

  // Handle phone press
  const handlePhonePress = (e) => {
    e.stopPropagation();
    if (leadPhone) {
      Linking.openURL(`tel:${leadPhone}`);
    } else {
      Alert.alert('Info', 'No phone number available');
    }
  };

  // Handle email press
  const handleEmailPress = (e) => {
    e.stopPropagation();
    if (leadEmail) {
      Linking.openURL(`mailto:${leadEmail}`);
    } else {
      Alert.alert('Info', 'No email address available');
    }
  };

  // Handle activity icon press - navigates to Add Activity form
  const handleActivityPress = (e) => {
    e.stopPropagation(); // Prevent triggering the card's onPress
    
    if (onActivityPress) {
      // If custom onActivityPress is provided, use it
      onActivityPress(opportunity, leadData);
    } else if (leadId) {
      // Default behavior: navigate to AddActivity with lead data
      navigation.navigate('AddActivity', {
        data: leadData,
        mode: 'create',
        onGoBack: () => {
          // Optional: Add any refresh logic here
          console.log('Activity added for opportunity:', opportunity.id);
        }
      });
    } else {
      console.warn('Cannot add activity: No lead ID found');
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress && onPress(opportunity)}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        {/* Left Section - Avatar/Icon */}
        <View style={[styles.iconContainer, { backgroundColor: statusColor + '20' }]}>
          <MaterialCommunityIcons 
            name="star" 
            size={scale(20)} 
            color={statusColor} 
          />
        </View>

        {/* Center Section - Name, Company, Last Activity */}
        <View style={styles.center}>
          
          <Text style={styles.company} numberOfLines={1}>
            {businessPartner}
          </Text>
          <Text style={styles.lastText} numberOfLines={1}>
            Lead: {leadName} · Expected: {relativeTime}
          </Text>
        </View>

        {/* Right Section - Status Badge and Icons */}
        <View style={styles.right}>
          {/* Status Badge */}
          {showStatus && (
            <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: statusColor },
                ]}
              />
              <Text style={[styles.badgeText, { color: statusColor }]}>
                {status}
              </Text>
            </View>
          )}

          {/* Icon Row - Phone, Mail, Activity - Matching CRMCard */}
          <View style={styles.iconRow}>
            {/* Phone Icon */}
            {leadPhone && (
              <TouchableOpacity onPress={handlePhonePress} style={styles.iconButton}>
                <Ionicons
                  name="call-outline"
                  size={Layout.iconSize.sm}
                  color={Colors.textPrimary}
                />
              </TouchableOpacity>
            )}

            {/* Email Icon */}
            {leadEmail && (
              <TouchableOpacity onPress={handleEmailPress} style={styles.iconButton}>
                <Ionicons
                  name="mail-outline"
                  size={Layout.iconSize.sm}
                  color={Colors.textPrimary}
                />
              </TouchableOpacity>
            )}

            {/* Activity Icon with Plus */}
            <TouchableOpacity 
              onPress={handleActivityPress} 
              style={styles.iconButton}
            >
              <View style={styles.addActivity}>
                <Ionicons
                  name="alarm-outline"
                  size={Layout.iconSize.sm}
                  color={Colors.textPrimary}
                />
                <AntDesign
                  name="pluscircle"
                  size={scale(10)}
                  color={Colors.textPrimary}
                  style={styles.plus}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bottom Row - Amount and Probability */}
      <View style={styles.bottomRow}>
        {showAmount && (
          <Text style={styles.amount}>{formattedAmount}</Text>
        )}
        
        {probability > 0 && (
          <View style={styles.probabilityContainer}>
            <View style={styles.probabilityHeader}>
              <View style={styles.probabilityBarContainer}>
                <View 
                  style={[
                    styles.probabilityBar, 
                    { width: `${probability}%`, backgroundColor: statusColor }
                  ]} 
                />
              </View>
              <Text style={styles.probabilityText}>{probability}%</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground || '#FFFFFF',
    borderRadius: Layout.borderRadius.md || 6,
    padding: Spacing.sm || 8,
    marginVertical: Spacing.xxs || 2,
    marginHorizontal: Spacing.xs || 4,
    borderWidth: 1,
    borderColor: Colors.borderLight || '#F0F0F0',
    
    // Shadow for iOS
    shadowColor: Colors.shadow || '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    
    // Elevation for Android
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: Layout.borderRadius.round || 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm || 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  center: {
    flex: 1,
    marginRight: Spacing.xs,
  },
  opportunityName: {
    fontSize: Typography.fontSize.medium || 14,
    fontFamily: Typography.fontFamily.semiBold || 'K2D-SemiBold',
    color: Colors.textPrimary || '#333333',
    marginBottom: Spacing.xxs || 2,
  },
  company: {
    fontSize: Typography.fontSize.medium || 14,
    fontFamily: Typography.fontFamily.semiBold || 'K2D-SemiBold',
    color: Colors.textPrimary || '#33333333',
    marginBottom: Spacing.xxs || 2,
  },
  lastText: {
    fontSize: Typography.fontSize.xsmall || 10,
    fontFamily: Typography.fontFamily.regular || 'K2D-Regular',
    color: Colors.textTertiary || '#999999',
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  
  // Status Badge - Matching CRMCard exactly
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm || 8,
    paddingVertical: Spacing.xxs || 2,
    borderRadius: Layout.borderRadius.round || 20,
    marginBottom: Spacing.xs || 4,
  },
  badgeText: {
    fontSize: Typography.fontSize.xsmall || 10,
    fontFamily: Typography.fontFamily.medium || 'K2D-Medium',
  },
  dot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    marginRight: Spacing.xxs || 2,
  },
  
  // Icon Row - Matching CRMCard exactly
  iconRow: {
    flexDirection: 'row',
    gap: Spacing.md || 12,
    marginTop: Spacing.md || 12,
  },
  iconButton: {
    padding: Spacing.xxs || 2,
  },
  addActivity: {
    position: 'relative',
  },
  plus: {
    position: 'absolute',
    right: -scale(5),
    bottom: -scale(5),
    backgroundColor: Colors.cardBackground || '#FFFFFF',
    borderRadius: scale(10),
  },
  
  // Bottom Row - Amount and Probability
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm || 8,
    paddingTop: Spacing.xs || 4,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight || '#F0F0F0',
  },
  
  // Amount
  amount: {
    fontSize: Typography.fontSize.small || 12,
    fontFamily: Typography.fontFamily.bold || 'K2D-Bold',
    color: Colors.primary || '#2F4FE3',
  },
  
  // Probability
  probabilityContainer: {
    flex: 1,
    marginLeft: Spacing.sm || 8,
  },
  probabilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.xxs || 2,
  },
  probabilityBarContainer: {
    width: scale(60),
    height: scale(4),
    backgroundColor: Colors.borderLight || '#F0F0F0',
    borderRadius: Layout.borderRadius.round || 20,
    overflow: 'hidden',
  },
  probabilityBar: {
    height: '100%',
    borderRadius: Layout.borderRadius.round || 20,
  },
  probabilityText: {
    fontSize: Typography.fontSize.xsmall || 10,
    fontFamily: Typography.fontFamily.bold || 'K2D-Bold',
    color: Colors.primary || '#2F4FE3',
    minWidth: scale(30),
    textAlign: 'right',
  },
});

export default OpportunityCard;