// components/CRMCard/DifferentiatedFollowupCard.js - REMOVED type badge

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import moment from 'moment';
import theme from '../../constants/CRMTheme/CRMTheme';

const { Colors, Typography, Layout } = theme;
const { scale, verticalScale, spacing } = Layout;

// Category mappings for activity types
const categoryMap = {
  EM: 'Email',
  PC: 'Phone Call',
  ME: 'Meeting',
  TA: 'Task',
};

// Helper function to get activity color
const getActivityColor = (activityType) => {
  const typeName = categoryMap[activityType] || activityType || 'Task';
  switch (typeName?.toUpperCase()) {
    case 'EMAIL': return '#4F46E5';
    case 'PHONE CALL': return '#0EA5E9';
    case 'PHONE': return '#0EA5E9';
    case 'MEETING': return '#F59E0B';
    case 'TASK': return '#EC4899';
    default: return '#6366F1';
  }
};

// Helper function to get activity background color
const getActivityBgColor = (activityType) => {
  const typeName = categoryMap[activityType] || activityType || 'Task';
  switch (typeName?.toUpperCase()) {
    case 'EMAIL': return '#EEF2FF';
    case 'PHONE CALL': return '#F0F9FF';
    case 'PHONE': return '#F0F9FF';
    case 'MEETING': return '#FEF3C7';
    case 'TASK': return '#FCE7F3';
    default: return '#F5F3FF';
  }
};

// Helper function to get activity icon
const getActivityIcon = (activityType, iconColor) => {
  const typeName = categoryMap[activityType] || activityType || 'Task';
  switch (typeName?.toUpperCase()) {
    case 'EMAIL':
      return <MaterialIcons name="email" size={scale(14)} color={iconColor} />;
    case 'PHONE CALL':
    case 'PHONE':
      return <MaterialIcons name="phone" size={scale(14)} color={iconColor} />;
    case 'MEETING':
      return <MaterialIcons name="people" size={scale(14)} color={iconColor} />;
    case 'TASK':
      return <MaterialIcons name="task-alt" size={scale(14)} color={iconColor} />;
    default:
      return <MaterialIcons name="event" size={scale(14)} color={iconColor} />;
  }
};

const FollowupCard = ({ 
  item,
  onPress,
  onStatusToggle,
  onEdit,
  onActivityPress,
}) => {
  const isComplete = item.IsComplete;
  const activityType = item.ContactActivityType?.identifier || 'Task';
  const entityName = item.entityName || 'Unknown';
  const companyName = item.companyName || '';
  
  const activityColor = getActivityColor(activityType);
  const activityBgColor = getActivityBgColor(activityType);

  // Handle card press - navigate to appropriate detail screen
  const handleCardPress = () => {
    if (onPress) {
      onPress(item);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={handleCardPress}
    >
      <View style={[
        styles.cardContent,
        { 
          borderLeftColor: activityColor,
          borderLeftWidth: 3,
        }
      ]}>
        {/* Header Row */}
        <View style={styles.cardHeader}>
          <View style={styles.typeRow}>
            {/* Activity Icon */}
            <View style={[styles.iconContainer, { backgroundColor: activityBgColor }]}>
              {getActivityIcon(activityType, activityColor)}
            </View>
            
            <View style={styles.infoContainer}>
              {/* Entity Name (Lead/Opportunity) */}
              <Text style={styles.entityName} numberOfLines={1}>
                {entityName}
              </Text>
              
              {/* Activity Type and Company Name */}
              <View style={styles.activityRow}>
                <Text style={styles.activityType}>
                  {categoryMap[activityType] || activityType}
                </Text>
                {companyName && companyName !== 'No Company' && (
                  <>
                    <Text style={styles.separator}>•</Text>
                    <Text style={styles.companyName} numberOfLines={1}>
                      {companyName}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>

          {/* Right side: Status and Actions */}
          <View style={styles.rightSide}>
            {/* Status Badge */}
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onStatusToggle && onStatusToggle(item.id, !isComplete);
              }}
              style={[
                styles.statusBadge,
                { backgroundColor: isComplete ? Colors.successLight : Colors.errorLight }
              ]}
            >
              <Text style={[
                styles.statusText,
                { color: isComplete ? Colors.success : Colors.error }
              ]}>
                {isComplete ? 'Complete' : 'Pending'}
              </Text>
            </TouchableOpacity>

            {/* Action Icons Row */}
            <View style={styles.actionIcons}>
              {/* Edit Icon */}
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onEdit && onEdit(item);
                }}
                style={styles.actionButton}
              >
                <MaterialCommunityIcons 
                  name="pencil" 
                  size={scale(16)} 
                  color={Colors.textSecondary} 
                />
              </TouchableOpacity>

              {/* Add Activity Icon */}
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  if (onActivityPress) {
                    onActivityPress(item);
                  }
                }}
                style={styles.actionButton}
              >
                <View style={styles.addActivity}>
                  <Ionicons
                    name="alarm-outline"
                    size={scale(16)}
                    color={Colors.textPrimary}
                  />
                  <AntDesign
                    name="pluscircle"
                    size={scale(8)}
                    color={Colors.textPrimary}
                    style={styles.plus}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Description */}
        {item.Description ? (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText} numberOfLines={2}>
              {item.Description}
            </Text>
          </View>
        ) : null}

        {/* Bottom Row: Dates */}
        <View style={styles.bottomRow}>
          <View style={styles.datesContainer}>
            <View style={styles.dateRow}>
              <View style={styles.dateItem}>
                <MaterialIcons name="calendar-today" size={scale(12)} color={Colors.textSecondary} />
                <Text style={styles.dateLabel}>Start: </Text>
                <Text style={styles.dateValue}>
                  {moment(item.StartDate).format('DD MMM YY')}
                </Text>
              </View>
              <Text style={styles.dateSeparator}>|</Text>
              <View style={styles.dateItem}>
                <MaterialIcons name="calendar-today" size={scale(12)} color={Colors.textSecondary} />
                <Text style={styles.dateLabel}>End: </Text>
                <Text style={styles.dateValue}>
                  {item.EndDate ? moment(item.EndDate).format('DD MMM YY') : 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* Sales Rep Indicator */}
          {item.SalesRep_ID?.identifier && (
            <View style={styles.salesRepContainer}>
              <MaterialCommunityIcons name="account-tie" size={scale(10)} color={Colors.textTertiary} />
              <Text style={styles.salesRepText} numberOfLines={1}>
                {item.SalesRep_ID.identifier}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  cardContent: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.md,
    padding: spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.borderDark,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(8),
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: scale(28),
    height: scale(28),
    borderRadius: Layout.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  infoContainer: {
    flex: 1,
  },
  entityName: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  activityType: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  separator: {
    color: Colors.textTertiary,
    fontSize: Typography.fontSize.small,
  },
  companyName: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    flex: 1,
  },
  rightSide: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: verticalScale(3),
    borderRadius: Layout.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  statusText: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.semiBold,
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.xxs,
  },
  addActivity: {
    position: 'relative',
  },
  plus: {
    position: 'absolute',
    right: -scale(4),
    bottom: -scale(4),
    backgroundColor: Colors.cardBackground,
    borderRadius: scale(8),
  },
  descriptionContainer: {
    marginBottom: spacing.md,
  },
  descriptionText: {
    fontSize: Typography.fontSize.small,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: Typography.lineHeight.small,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datesContainer: {
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateSeparator: {
    marginHorizontal: spacing.sm,
    color: Colors.textTertiary,
    fontSize: Typography.fontSize.xsmall,
  },
  dateLabel: {
    fontSize: Typography.fontSize.xsmall,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.regular,
    marginLeft: spacing.xs,
    marginRight: spacing.xxs,
  },
  dateValue: {
    fontSize: Typography.fontSize.xsmall,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.semiBold,
  },
  salesRepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    maxWidth: scale(100),
  },
  salesRepText: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary,
  },
});

export default FollowupCard;