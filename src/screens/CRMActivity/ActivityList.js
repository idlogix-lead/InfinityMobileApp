// screens/CRM/ActivityList.js
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useQuery } from 'react-query';
import moment from 'moment';
import CustomHeader from '../../components/CustomHeader';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Loader from '../../components/Loader';
import { useCRMStore } from '../../store/crmStore';
import { useFollowups, useLeadActivities } from '../../hooks/CRMhooks/useCRM';

const ActivityList = ({ route, navigation }) => {
  const { data: leadData } = route.params;
  
  // Use React Query hook
  const { 
    data: activities = [], 
    isLoading, 
    refetch 
  } = useLeadActivities(leadData?.id, true);
  
  // Add refetch on focus
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refetch();
    });
    return unsubscribe;
  }, [navigation, refetch]);

  // Filter activities for this lead
  const leadActivities = React.useMemo(() => {
    if (!Array.isArray(activities)) return [];
    
    return activities
      .filter(item => item?.AD_User_ID?.id === leadData?.id)
      .sort((a, b) => new Date(b.Created) - new Date(a.Created));
  }, [activities, leadData?.id]);

  const renderFollowupCard = (item) => {
    const isComplete = item.IsComplete;
    const activityType = item.ContactActivityType?.identifier;
    const activityIcon = getActivityIcon(activityType);

    return (
      <TouchableOpacity 
        key={item?.id} 
        style={styles.followupContainer}
        activeOpacity={0.8}
        onPress={() => {
          navigation.navigate('AddActivity', {
            data: item,
            mode: 'edit',
          });
        }}
      >
        {/* Card with Left Border */}
        <View style={[
          styles.detailBox,
          { borderLeftWidth: 4, borderLeftColor: getActivityBorderColor(activityType) }
        ]}>
          
          {/* Activity Header with Icon */}
          <View style={styles.cardHeader}>
            <View style={styles.activityHeader}>
              <View style={[styles.activityIconContainer, { backgroundColor: getActivityIconColor(activityType) }]}>
                {activityIcon}
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.taskTitle}>
                  {activityType || 'No Type'}
                </Text>
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: isComplete ? '#10B981' : '#EF4444' } // Green for complete, Red for pending
                ]}>
                  <Text style={styles.statusIndicatorText}>
                    {isComplete ? 'Complete' : 'Pending'}
                  </Text>
                </View>
              </View>
            </View>
            
            {!item.IsComplete && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={(e) => {
                  e.stopPropagation();
                  navigation.navigate('AddActivity', {
                    data: item,
                    mode: 'edit',
                  });
                }}
              >
                <Feather name="edit-3" size={20} color={'#7C3AED'} />
              </TouchableOpacity>
            )}
          </View>

          {/* Lead Name */}
          <View style={styles.leadContainer}>
            <MaterialIcons name="person" size={16} color={'#6B7280'} />
            <Text style={styles.leadName} numberOfLines={1}>
              {item.AD_User_ID?.identifier || leadData?.Name || 'Unknown'}
            </Text>
          </View>

          {/* Start and End Dates */}
          <View style={styles.datesContainer}>
            <View style={styles.dateItem}>
              <View style={styles.dateIconContainer}>
                <AntDesign name="calendar" size={16} color={'#3B82F6'} />
              </View>
              <View style={styles.dateTextContainer}>
                <Text style={styles.labelTxt}>Start Date</Text>
                <Text style={styles.dateText}>
                  {moment(item.StartDate).format('DD MMM YYYY')}
                </Text>
              </View>
            </View>

            <View style={styles.dateDivider} />

            <View style={styles.dateItem}>
              <View style={styles.dateIconContainer}>
                <AntDesign name="calendar" size={16} color={'#3B82F6'} />
              </View>
              <View style={styles.dateTextContainer}>
                <Text style={styles.labelTxt}>End Date</Text>
                <Text style={styles.dateText}>
                  {moment(item.EndDate).format('DD MMM YYYY')}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.labelTxt}>Description:</Text>
            <Text style={styles.descriptionText} numberOfLines={2} ellipsizeMode="tail">
              {item.Description || 'No Description'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Helper function to get activity border color
  const getActivityBorderColor = (activityType) => {
    switch (activityType?.toUpperCase()) {
      case 'EMAIL':
        return '#4F46E5'; // Indigo
      case 'PHONE':
        return '#0EA5E9'; // Sky blue
      case 'MEETING':
        return '#F59E0B'; // Amber
      case 'TASK':
        return '#EC4899'; // Pink
      default:
        return '#6366F1'; // Violet
    }
  };

  // Helper function to get activity icon color
  const getActivityIconColor = (activityType) => {
    switch (activityType?.toUpperCase()) {
      case 'EMAIL':
        return '#EEF2FF'; // Light indigo
      case 'PHONE':
        return '#F0F9FF'; // Light sky blue
      case 'MEETING':
        return '#FEF3C7'; // Light amber
      case 'TASK':
        return '#FCE7F3'; // Light pink
      default:
        return '#F5F3FF'; // Light violet
    }
  };

  // Helper function to get activity icon
  const getActivityIcon = (activityType) => {
    const iconColor = getActivityIconTextColor(activityType);
    switch (activityType?.toUpperCase()) {
      case 'EMAIL':
        return <MaterialIcons name="email" size={20} color={iconColor} />;
      case 'PHONE':
        return <MaterialIcons name="phone" size={20} color={iconColor} />;
      case 'MEETING':
        return <MaterialIcons name="people" size={20} color={iconColor} />;
      case 'TASK':
        return <MaterialIcons name="task-alt" size={20} color={iconColor} />;
      default:
        return <MaterialIcons name="event" size={20} color={iconColor} />;
    }
  };

  // Helper function to get icon text color
  const getActivityIconTextColor = (activityType) => {
    switch (activityType?.toUpperCase()) {
      case 'EMAIL':
        return '#4F46E5'; // Indigo
      case 'PHONE':
        return '#0EA5E9'; // Sky blue
      case 'MEETING':
        return '#F59E0B'; // Amber
      case 'TASK':
        return '#EC4899'; // Pink
      default:
        return '#6366F1'; // Violet
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader 
        title={'Activity List'} 
        onBackPress={() => navigation.goBack()}
      />

      {/* Add Activity Button */}
      <View style={styles.headerActions}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('AddActivity', {
              data: leadData,
              mode: 'create',
            });
          }}
          style={styles.addButton}
        >
          <View style={styles.addButtonIcon}>
            <Ionicons name="add-outline" size={22} color={'#FFFFFF'} />
          </View>
          <Text style={styles.addButtonText}>Add Activity</Text>
        </TouchableOpacity>
      </View>

      {/* Activity Count */}
      <View style={styles.countContainer}>
        <View style={styles.countContent}>
          <MaterialIcons name="list-alt" size={20} color={'#3B82F6'} />
          <Text style={styles.countText}>
            {leadActivities.length} {leadActivities.length === 1 ? 'Activity' : 'Activities'} Found
          </Text>
        </View>
      </View>

      {/* Activities List */}
      {isLoading ? (
        <Loader />
      ) : leadActivities.length > 0 ? (
        <FlatList
          data={leadActivities}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item }) => renderFollowupCard(item)}
          contentContainerStyle={styles.listContent}
          refreshing={isLoading}
          onRefresh={refetch}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <MaterialIcons name="event-note" size={60} color={'#E5E7EB'} />
          </View>
          <Text style={styles.emptyText}>No activities found</Text>
          <Text style={styles.emptySubText}>
            Tap "Add Activity" to create your first activity
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  addButtonIcon: {
    marginRight: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'K2D-SemiBold',
  },
  countContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    marginTop: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  countContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countText: {
    fontSize: 14,
    color: '#475569',
    fontFamily: 'K2D-Medium',
    marginLeft: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  followupContainer: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  detailBox: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4, // This will be overridden by inline style
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  taskTitle: {
    fontSize: 18,
    fontFamily: 'K2D-Bold',
    color: '#1F2937',
    marginRight: 10,
  },
  statusIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIndicatorText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'K2D-SemiBold',
  },
  editButton: {
    padding: 6,
    backgroundColor: '#F5F3FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  leadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  leadName: {
    fontSize: 14,
    color: '#4B5563',
    fontFamily: 'K2D-Medium',
    marginLeft: 8,
    flex: 1,
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  dateTextContainer: {
    flex: 1,
  },
  dateDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  labelTxt: {
    color: '#6B7280',
    fontSize: 12,
    fontFamily: 'K2D-Medium',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateText: {
    color: '#1F2937',
    fontSize: 14,
    fontFamily: 'K2D-SemiBold',
  },
  descriptionContainer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  descriptionText: {
    color: '#4B5563',
    fontSize: 14,
    fontFamily: 'K2D-Regular',
    marginTop: 4,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    color: '#9CA3AF',
    fontFamily: 'K2D-SemiBold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'K2D-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ActivityList;