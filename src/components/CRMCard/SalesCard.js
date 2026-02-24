// components/CRMCard/MinimalOpportunityCard.js - Status top, amount middle, probability bottom with dynamic currency
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import theme from '../../constants/CRMTheme/CRMTheme';

const { Colors, Typography, Layout, Spacing } = theme;
const { scale, verticalScale } = Layout;

const OpportunityCard = ({ 
  opportunity,
  onPress,
  showStatus = true,
  showAmount = true,
}) => {
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
    ? new Date(expectedCloseDate).toLocaleDateString('en-PK', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
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

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress && onPress(opportunity)}
      activeOpacity={0.7}
    >
      {/* Left Section - Icon and Main Info */}
      <View style={styles.leftSection}>
        <View style={[styles.iconContainer, { backgroundColor: statusColor + '20' }]}>
          <MaterialCommunityIcons 
            name="star" 
            size={scale(20)} 
            color={statusColor} 
          />
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.opportunityName} numberOfLines={1}>
            {opportunityName}
          </Text>
          <View style={styles.subInfoRow}>
            <MaterialCommunityIcons name="office-building" size={scale(12)} color={Colors.textTertiary} />
            <Text style={styles.subInfoText} numberOfLines={1}>
              {businessPartner}
            </Text>
          </View>
          <View style={styles.subInfoRow}>
            <MaterialCommunityIcons name="account" size={scale(12)} color={Colors.textTertiary} />
            <Text style={styles.subInfoText} numberOfLines={1}>
              {leadName}
            </Text>
          </View>
        </View>
      </View>

      {/* Right Section - Status at top, Amount middle, Probability bottom */}
      <View style={styles.rightSection}>
        {/* Status at top */}
        {showStatus && (
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {status}
            </Text>
          </View>
        )}
        
        {/* Amount in middle - with dynamic currency from opportunity */}
        {showAmount && (
          <Text style={styles.amount}>{formattedAmount}</Text>
        )}
        
        {/* Probability with bar at bottom */}
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
        
        {/* Expected Closing Date at bottom right */}
        <View style={styles.dateContainer}>
          <MaterialCommunityIcons name="calendar" size={scale(10)} color={Colors.textTertiary} />
          <Text style={styles.dateLabel}>Expected closing date:</Text>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
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
  leftSection: {
    flexDirection: 'row',
    flex: 1,
  },
  iconContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: Layout.borderRadius.sm || 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm || 8,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  opportunityName: {
    fontSize: Typography.fontSize.small || 12,
    fontFamily: Typography.fontFamily.semiBold || 'K2D-SemiBold',
    color: Colors.textPrimary || '#333333',
    marginBottom: Spacing.xxs || 2,
  },
  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs || 2,
    marginBottom: Spacing.xxs || 1,
  },
  subInfoText: {
    fontSize: Typography.fontSize.xsmall || 10,
    fontFamily: Typography.fontFamily.regular || 'K2D-Regular',
    color: Colors.textSecondary || '#666666',
    flex: 1,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minWidth: scale(130),
  },
  
  // Status Badge at top
  statusBadge: {
    paddingHorizontal: Spacing.xs || 4,
    paddingVertical: Spacing.xxs || 1,
    borderRadius: Layout.borderRadius.round || 20,
    marginBottom: Spacing.xxs || 2,
  },
  statusText: {
    fontSize: Typography.fontSize.xsmall || 8,
    fontFamily: Typography.fontFamily.medium || 'K2D-Medium',
  },
  
  // Amount in middle - with dynamic currency
  amount: {
    fontSize: Typography.fontSize.small || 12,
    fontFamily: Typography.fontFamily.bold || 'K2D-Bold',
    color: Colors.primary || '#2F4FE3',
    marginBottom: Spacing.xxs || 2,
  },
  
  // Probability at bottom
  probabilityContainer: {
    width: '100%',
    marginBottom: Spacing.xxs || 1,
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
  
  // Expected Closing Date at bottom right
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs || 2,
    marginTop: Spacing.xxs || 1,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  dateLabel: {
    fontSize: Typography.fontSize.xsmall || 8,
    fontFamily: Typography.fontFamily.regular || 'K2D-Regular',
    color: Colors.textTertiary || '#999999',
  },
  dateText: {
    fontSize: Typography.fontSize.xsmall || 8,
    fontFamily: Typography.fontFamily.regular || 'K2D-Regular',
    color: Colors.textTertiary || '#999999',
  },
});

export default OpportunityCard;