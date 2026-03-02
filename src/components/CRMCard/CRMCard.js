// components/CRMCard/CRMCard.js
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import { useQueryClient } from 'react-query';

// Import CRMTheme
import theme from '../../constants/CRMTheme/CRMTheme';

// Destructure theme
const { Colors, Typography, Layout, Spacing } = theme;
const { scale, verticalScale } = Layout;

const STATUS_CONFIG = {
  New: {
    barColor: Colors.statusNew,
    badgeText: 'New',
    badgeBg: '#EAF8F0',
    badgeColor: Colors.statusNew,
    showDot: true,
  },
  Working: {
    barColor: Colors.statusWorking,
    badgeText: 'Working',
    badgeBg: '#FFF3E0',
    badgeColor: Colors.statusWorking,
    showDot: true,
  },
  Converted: {
    barColor: Colors.statusConverted,
    badgeText: 'Converted',
    badgeBg: '#EEF1FF',
    badgeColor: Colors.statusConverted,
    showDot: false,
    showCheck: true,
  },
  Expired: {
    barColor: Colors.statusExpired,
    badgeText: 'Expired',
    badgeBg: '#FDECEC',
    badgeColor: Colors.statusExpired,
    showDot: true,
  },
};

const CRMCard = ({
  leadId,
  name,
  header,
  status: propStatus = 'New',
  interactionType,
  dateText,
  phone,
  mail,
  actOnPress,
  onPress,
  email,
  count,
  Description,
  company,
}) => {
  const queryClient = useQueryClient();
  const [currentStatus, setCurrentStatus] = useState(propStatus);

  // Subscribe to query cache changes
  useEffect(() => {
    const updateStatusFromCache = () => {
      if (!leadId) return;

      // Try to get from main leads cache
      const cachedLeads = queryClient.getQueryData(['leads']);
      if (Array.isArray(cachedLeads)) {
        const cachedLead = cachedLeads.find(lead => 
          lead.id === leadId || lead.AD_User_ID?.id === leadId
        );
        if (cachedLead?.LeadStatus?.identifier) {
          setCurrentStatus(cachedLead.LeadStatus.identifier);
          return;
        }
      }

      // Try to get from status-specific caches
      const statuses = ['New', 'Working', 'Converted', 'Expired'];
      for (const status of statuses) {
        const cachedStatusLeads = queryClient.getQueryData(['leads', { status }]);
        if (Array.isArray(cachedStatusLeads)) {
          const cachedLead = cachedStatusLeads.find(lead => 
            lead.id === leadId || lead.AD_User_ID?.id === leadId
          );
          if (cachedLead?.LeadStatus?.identifier) {
            setCurrentStatus(cachedLead.LeadStatus.identifier);
            return;
          }
        }
      }
      
      setCurrentStatus(propStatus);
    };

    // Initial update
    updateStatusFromCache();

    // Subscribe to query cache changes
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.query?.queryKey?.[0] === 'leads') {
        updateStatusFromCache();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [leadId, queryClient, propStatus]);

  const statusUI = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.New;
  
  // Determine if there's any activity
  const hasActivity = interactionType && interactionType !== 'No Activity' && interactionType !== 'N/A';
  const hasDate = dateText;

  return (
    <TouchableOpacity 
      style={styles.cardContainer}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.card}>
        <View style={styles.row}>
          
          <Image
            source={{
              uri: 'https://randomuser.me/api/portraits/men/1.jpg',
            }}
            style={styles.avatar}
          />

          <View style={styles.center}>
            <View style={styles.nameContainer}>
              <Text style={styles.name} numberOfLines={1}>
                {name || 'No Name'}
              </Text>
            </View>
            <Text style={styles.company} numberOfLines={1}>
              {header || company || 'No Company'}
            </Text>

            <Text style={styles.lastText}>
              {hasActivity ? (
                <>Last: {interactionType} · {dateText ? moment(dateText).fromNow() : 'No Date'}</>
              ) : (
                <Text style={styles.noActivityText}>No activity yet</Text>
              )}
            </Text>
          </View>

          <View style={styles.right}>
            <View
              style={[
                styles.badge,
                { backgroundColor: statusUI.badgeBg },
              ]}>
              {statusUI.showDot && (
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: statusUI.badgeColor },
                  ]}
                />
              )}
              {statusUI.showCheck && (
                <AntDesign
                  name="checkcircle"
                  size={scale(14)}
                  color={statusUI.badgeColor}
                  style={styles.checkIcon}
                />
              )}
              <Text
                style={[
                  styles.badgeText,
                  { color: statusUI.badgeColor },
                ]}>
                {statusUI.badgeText}
              </Text>
            </View>

            <View style={styles.iconRow}>
              {phone && (
                <TouchableOpacity onPress={phone} style={styles.iconButton}>
                  <Ionicons
                    name="call-outline"
                    size={Layout.iconSize.sm}
                    color={Colors.textPrimary}
                  />
                </TouchableOpacity>
              )}

              {mail && (
                <TouchableOpacity onPress={mail} style={styles.iconButton}>
                  <Ionicons
                    name="mail-outline"
                    size={Layout.iconSize.sm}
                    color={Colors.textPrimary}
                  />
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={actOnPress} style={styles.iconButton}>
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
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: Spacing.xs,
    marginVertical: Spacing.xxs,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.md,
    elevation: 3,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  avatar: {
    width: Layout.iconSize.xxl * 1.5, // Larger image (48px)
    height: Layout.iconSize.xxl * 1.5, // Larger image (48px)
    borderRadius: Layout.borderRadius.round,
    marginRight: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  center: {
    flex: 1,
    marginRight: Spacing.xs,
  },
 
  name: {
    fontSize: Typography.fontSize.large, // Larger font
    fontFamily: Typography.fontFamily.bold, // Bold font
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeight.large,
  },
  company: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxs,
  },
  lastText: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary,
  },
  noActivityText: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Layout.borderRadius.round,
    marginBottom: Spacing.xs,
  },
  badgeText: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.medium,
  },
  dot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    marginRight: Spacing.xxs,
  },
  checkIcon: {
    marginRight: Spacing.xxs,
  },
  iconRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  iconButton: {
    padding: Spacing.xxs,
  },
  addActivity: {
    position: 'relative',
  },
  plus: {
    position: 'absolute',
    right: -scale(5),
    bottom: -scale(5),
    backgroundColor: Colors.cardBackground,
    borderRadius: scale(10),
  },
});

export default CRMCard;