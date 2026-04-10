// components/CRMCard/MinimalOpportunityCard.js - FIXED: always allow Add Activity even without lead ID

import React, { useState, useEffect } from 'react';
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
import { useQueryClient } from 'react-query';
import theme from '../../constants/CRMTheme/CRMTheme';
import moment from 'moment';
import { useAuthStore } from '../../store/authStore';

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
  const queryClient = useQueryClient();
  const authState = useAuthStore();
  
  // State for fetched lead data
  const [leadData, setLeadData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Extract opportunity data
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

  // Extract lead/contact ID
  const leadId = opportunity?.AD_User_ID?.id || opportunity?.userId;

  // Get status
  const status = 
    opportunity?.C_OpportunityStatus?.identifier || 
    opportunity?.OpportunityStatus || 
    'Open';

  // Extract currency code
  const currencyCode = 
    opportunity?.currencyCode ||
    opportunity?.C_Currency_ID?.ISO_Code ||
    opportunity?.C_Currency_ID?.identifier ||
    'PKR';

  // Format amount
  const formattedAmount = new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(opportunityAmount);

  // Format relative time
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

  // ============================================
  // FETCH LEAD DATA FROM API
  // ============================================
  useEffect(() => {
    const fetchLeadData = async () => {
      if (!leadId) {
        console.log('⚠️ No lead ID found in opportunity');
        return;
      }

      setLoading(true);
      
      try {
        // Try to get from cache first
        const cachedLeads = queryClient.getQueryData(['leads']);
        if (Array.isArray(cachedLeads)) {
          const cachedLead = cachedLeads.find(lead => 
            lead.id === leadId || lead.AD_User_ID?.id === leadId
          );
          if (cachedLead) {
            console.log('✅ Found lead in cache:', cachedLead.Name);
            setLeadData({
              name: cachedLead.Name || cachedLead.name,
              email: cachedLead.EMail || cachedLead.email,
              phone: cachedLead.Phone || cachedLead.phone,
            });
            setLoading(false);
            return;
          }
        }

        // If not in cache, fetch from API
        const token = authState?.token;
        const serverConfig = authState?.serverConfig;

        if (!token || !serverConfig) {
          console.log('❌ Auth data missing');
          setLoading(false);
          return;
        }

        const baseUrl = `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.port}/api/v1`;
        const url = `${baseUrl}/models/AD_User/${leadId}`;

        console.log('🔍 Fetching lead data from:', url);

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Lead data fetched:', data.Name);
          setLeadData({
            name: data.Name,
            email: data.EMail || '',
            phone: data.Phone || '',
          });
          
          // Update the cache with this lead data
          queryClient.setQueryData(['lead', leadId], data);
        } else {
          console.log('❌ Failed to fetch lead data:', response.status);
        }
      } catch (error) {
        console.error('Error fetching lead data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadData();
  }, [leadId, queryClient, authState]);

  // Use fetched lead data or fallback to opportunity data
  const leadName = leadData?.name || 
                   opportunity?.AD_User_ID?.identifier || 
                   opportunity?.userName ||
                   opportunity?.ContactName || 
                   'Unknown Contact';
  
  const leadEmail = leadData?.email || '';
  const leadPhone = leadData?.phone || '';

  // Debug log
  console.log('🔍 OpportunityCard - Lead data:', {
    leadId,
    leadName,
    leadEmail: leadEmail || 'EMPTY',
    leadPhone: leadPhone || 'EMPTY',
    businessPartner
  });

  // Handle phone press
  const handlePhonePress = (e) => {
    e.stopPropagation();
    if (leadPhone) {
      Linking.openURL(`tel:${leadPhone}`).catch(() => {
        Alert.alert('Error', 'Cannot open phone app');
      });
    } else {
      Alert.alert('Info', 'No phone number available');
    }
  };

  // Handle email press
  const handleEmailPress = (e) => {
    e.stopPropagation();
    if (leadEmail) {
      Linking.openURL(`mailto:${leadEmail}`).catch(() => {
        Alert.alert('Error', 'Cannot open email app');
      });
    } else {
      Alert.alert('Info', 'No email address available');
    }
  };

  // Handle activity icon press – always allow navigation, even without leadId
  const handleActivityPress = (e) => {
    e.stopPropagation();
    
    const leadDataForActivity = {
      id: leadId,  // may be undefined
      Name: leadName,
      EMail: leadEmail,
      Phone: leadPhone,
      BPName: businessPartner,
      // Include full opportunity for context
      opportunity: opportunity,
    };

    if (onActivityPress) {
      onActivityPress(opportunity, leadDataForActivity);
    } else {
      // Always navigate to AddActivity, regardless of leadId presence
      navigation.navigate('AddActivity', {
        data: leadDataForActivity,
        mode: 'create',
      });
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

        {/* Center Section - Company, Lead, Expected Date */}
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

          {/* Icon Row - Show icons if data exists */}
          <View style={styles.iconRow}>
            {/* Phone Icon */}
            {leadPhone ? (
              <TouchableOpacity onPress={handlePhonePress} style={styles.iconButton}>
                <Ionicons
                  name="call-outline"
                  size={Layout.iconSize.sm}
                  color={Colors.textPrimary}
                />
              </TouchableOpacity>
            ) : null}

            {/* Email Icon */}
            {leadEmail ? (
              <TouchableOpacity onPress={handleEmailPress} style={styles.iconButton}>
                <Ionicons
                  name="mail-outline"
                  size={Layout.iconSize.sm}
                  color={Colors.textPrimary}
                />
              </TouchableOpacity>
            ) : null}

            {/* Activity Icon – always visible */}
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

// Styles remain exactly the same
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
  company: {
    fontSize: Typography.fontSize.medium || 14,
    fontFamily: Typography.fontFamily.semiBold || 'K2D-SemiBold',
    color: Colors.textPrimary || '#333333',
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
  
  // Status Badge
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
  
  // Icon Row
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
  
  // Bottom Row
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