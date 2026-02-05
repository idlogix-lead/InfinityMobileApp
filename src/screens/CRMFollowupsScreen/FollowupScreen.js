// screens/CRM/FollowupScreen.js
import React, { useState, useMemo } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useFollowups, useUpdateFollowup } from '../../hooks/CRMhooks/useCRM';
import moment from 'moment';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const FollowupScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Hooks
  const { 
    data: allFollowups = [], 
    isLoading: isLoadingFollowups,
    refetch: refetchFollowups,
    error: followupsError 
  } = useFollowups();

  // Update followup mutation
  const updateFollowupMutation = useUpdateFollowup();

  // Category mappings
  const categoryMap = {
    EM: 'Email',
    PC: 'Phone Call',
    ME: 'Meeting',
    TA: 'Task',
  };

  // Filter followups based on selected tab - EXACT SAME LOGIC AS LeadDetailsScreen
  const filteredFollowups = useMemo(() => {
    if (!allFollowups.length) return [];
    
    const today = moment().startOf('day');
    let filtered = [...allFollowups];

    // Apply time filter - EXACT SAME LOGIC
    if (activeFilter === 'today') {
      filtered = filtered.filter(item => {
        const start = moment(item.StartDate);
        const end = item.EndDate ? moment(item.EndDate) : start;
        return (
          start.isSameOrBefore(today, 'day') &&
          end.isSameOrAfter(today, 'day') &&
          item.IsComplete === false
        );
      });
    } else if (activeFilter === 'future') {
      filtered = filtered.filter(item => {
        const start = moment(item.StartDate);
        return start.isAfter(today, 'day') && item.IsComplete === false;
      });
    } else if (activeFilter === 'missed') {
      filtered = filtered.filter(item => {
        const end = item.EndDate ? moment(item.EndDate) : moment(item.StartDate);
        return end.isBefore(today, 'day') && item.IsComplete === false;
      });
    } else if (activeFilter === 'completed') {
      filtered = filtered.filter(item => {
        return item.IsComplete === true;
      });
    } else {
      // 'all' - show all activities
      filtered = filtered;
    }

    // Sort by date (newest first) - EXACT SAME SORTING
    return filtered.sort((a, b) =>
      moment(b.StartDate || b.Created) - moment(a.StartDate || a.Created)
    );
  }, [allFollowups, activeFilter]);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchFollowups();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Update followup field
  const updateFollowupField = (id, field, value) => {
    updateFollowupMutation.mutate({ 
      id, 
      updates: { [field]: value } 
    });
  };

  // Handle navigation to lead details
  const handleCardPress = (followup) => {
    const leadId = followup.AD_User_ID?.id || followup.AD_User_ID;
    
    if (!leadId) {
      Alert.alert('Error', 'Lead information not available');
      return;
    }

    const leadData = {
      id: leadId,
      Name: followup.AD_User_ID?.Name || followup.AD_User_ID?.identifier || 'Unknown Lead',
    };
    
    navigation.navigate('LeadsDetail', { data: leadData });
  };

  // Helper function to get activity type name
  const getActivityTypeName = (typeCode) => {
    return categoryMap[typeCode] || typeCode || 'Task';
  };

  // Helper function to get activity color
  const getActivityColor = (type) => {
    const typeName = getActivityTypeName(type).toUpperCase();
    switch (typeName) {
      case 'EMAIL': return '#4F46E5';
      case 'PHONE CALL': return '#0EA5E9';
      case 'PHONE': return '#0EA5E9';
      case 'MEETING': return '#F59E0B';
      case 'TASK': return '#EC4899';
      default: return '#6366F1';
    }
  };

  const getActivityBgColor = (type) => {
    const typeName = getActivityTypeName(type).toUpperCase();
    switch (typeName) {
      case 'EMAIL': return '#EEF2FF';
      case 'PHONE CALL': return '#F0F9FF';
      case 'PHONE': return '#F0F9FF';
      case 'MEETING': return '#FEF3C7';
      case 'TASK': return '#FCE7F3';
      default: return '#F5F3FF';
    }
  };

  const getActivityIcon = (type) => {
    const iconColor = getActivityColor(type);
    const typeName = getActivityTypeName(type).toUpperCase();
    switch (typeName) {
      case 'EMAIL':
        return <MaterialIcons name="email" size={14} color={iconColor} />;
      case 'PHONE CALL':
      case 'PHONE':
        return <MaterialIcons name="phone" size={14} color={iconColor} />;
      case 'MEETING':
        return <MaterialIcons name="people" size={14} color={iconColor} />;
      case 'TASK':
        return <MaterialIcons name="task-alt" size={14} color={iconColor} />;
      default:
        return <MaterialIcons name="event" size={14} color={iconColor} />;
    }
  };

  // Helper function to get follow-up priority - EXACT SAME LOGIC
  const getFollowupPriority = (item) => {
    const priorities = ['High', 'Medium', 'Low'];
    const priorityIndex = item.id % 3; // Using modulo to get consistent priority per item
    return priorities[priorityIndex];
  };

  // Helper function to get priority color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#EA4747';
      case 'medium': return '#E7CD4C';
      case 'low': return '#26BDCE';
      default: return '#EA4747';
    }
  };

  // Define tab colors for active state - EXACT SAME
  const getTabColor = (tabId) => {
    switch (tabId) {
      case 'missed':
        return '#EF4444';
      case 'today':
        return '#3B82F6';
      case 'completed':
        return '#10B981';
      case 'future':
        return '#F59E0B';
      case 'all':
      default:
        return '#8B5CF6';
    }
  };

  // Filter tabs with tick icons - EXACT SAME
  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'today', label: 'Today' },
    { id: 'future', label: 'Future' },
    { id: 'missed', label: 'Missed' },
    { id: 'completed', label: 'Completed' },
  ];

  // Filter Tab component - EXACT SAME
  const FilterTab = ({ tab, active, onPress }) => {
    const tabColor = getTabColor(tab.id);
    
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.filterTab,
          active && styles.filterTabActive,
        ]}
      >
        {/* Tick Icon Container */}
        <View style={[
          styles.tickContainer,
          active ? { backgroundColor: tabColor } : styles.tickContainerInactive
        ]}>
          <MaterialIcons 
            name="check" 
            size={12} 
            color="#FFFFFF" 
          />
        </View>
        
        {/* Tab Text */}
        <Text style={[
          styles.filterText,
          active ? [styles.filterTextActive, { color: tabColor }] : styles.filterTextInactive
        ]}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFollowupCard = ({ item }) => {
    const isComplete = item.IsComplete;
    const activityType = item.ContactActivityType?.identifier || 'Task';
    const activityIcon = getActivityIcon(activityType);
    const priority = getFollowupPriority(item);
    const leadName = item.AD_User_ID?.Name || item.AD_User_ID?.identifier || 'Unknown Lead';

    return (
      <TouchableOpacity
        style={styles.followupCard}
        activeOpacity={0.9}
        onPress={() => handleCardPress(item)}
      >
        <View style={[
          styles.cardContent,
          { 
            borderLeftWidth: 1, 
            borderLeftColor: getActivityColor(activityType),
            borderColor: '#4b4848',
          }
        ]}>
          {/* Header Row - Lead Name and Status */}
          <View style={styles.cardHeader}>
            <View style={styles.typeRow}>
              <View style={[styles.iconContainer, { backgroundColor: getActivityBgColor(activityType) }]}>
                {activityIcon}
              </View>
              <View style={styles.leadInfo}>
                <Text style={styles.leadName} numberOfLines={1}>
                  {leadName}
                </Text>
                <Text style={styles.typeText}>
                  {getActivityTypeName(activityType)}
                </Text>
              </View>
            </View>

            {/* Right side: Status */}
            <View style={styles.rightSide}>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  updateFollowupField(item.id, 'IsComplete', !item.IsComplete);
                }}
                style={[
                  styles.statusBadge,
                  { backgroundColor: isComplete ? '#E6F4EA' : '#FDEAEA' }
                ]}
              >
                <Text style={[
                  styles.statusText,
                  { color: isComplete ? '#2E7D32' : '#C62828' }
                ]}>
                  {isComplete ? 'Complete' : 'Pending'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText} numberOfLines={2}>
              {item.Description || 'No description provided'}
            </Text>
          </View>

          {/* Bottom Row: Dates and Priority */}
          <View style={styles.bottomRow}>
            {/* Dates on left */}
            <View style={styles.datesContainer}>
              <View style={styles.dateRow}>
                <View style={styles.dateItem}>
                  <MaterialIcons name="calendar-today" size={12} color="#666" />
                  <Text style={styles.dateLabel}>Start: </Text>
                  <Text style={styles.dateValue}>
                    {moment(item.StartDate).format('DD MMM YY')}
                  </Text>
                </View>
                <Text style={styles.dateSeparator}>|</Text>
                <View style={styles.dateItem}>
                  <MaterialIcons name="calendar-today" size={12} color="#666" />
                  <Text style={styles.dateLabel}>End: </Text>
                  <Text style={styles.dateValue}>
                    {item.EndDate ? moment(item.EndDate).format('DD MMM YY') : 'N/A'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Priority on right */}
            <View style={styles.priorityContainer}>
              <View style={styles.priorityRow}>
                <View style={[styles.priorityBox, { backgroundColor: getPriorityColor(priority) }]} />
                <Text style={styles.priorityText}>{priority}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Loading state
  if (isLoadingFollowups && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Follow ups</Text>
          </View>
          
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#2F4FE3" />
            <Text style={styles.loadingText}>Loading followups...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Follow ups</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2F4FE3']}
              tintColor="#2F4FE3"
            />
          }
        >
          {/* Scrollable Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsContainer}
            contentContainerStyle={styles.tabsContent}
          >
            {filterTabs.map((tab) => (
              <FilterTab
                key={tab.id}
                tab={tab}
                active={activeFilter === tab.id}
                onPress={() => setActiveFilter(tab.id)}
              />
            ))}
          </ScrollView>

          {/* Active Filter Text */}
          <Text style={styles.activeFilterText}>
            {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Follow-ups
          </Text>

          {/* Follow-ups List - MATCH LEADDETAILSSCREEN STRUCTURE */}
          {filteredFollowups.length > 0 ? (
            <FlatList
              data={filteredFollowups}
              renderItem={renderFollowupCard}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false} // IMPORTANT: Match LeadDetailsScreen
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="event-note" size={40} color="#E5E7EB" />
              <Text style={styles.emptyText}>
                No {activeFilter !== 'all' ? activeFilter + ' ' : ''}follow-ups
              </Text>
              <Text style={styles.emptySubText}>
                All follow-ups will appear here
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EDEBEB',
  },
  container: {
    flex: 1,
    backgroundColor: '#EDEBEB',
  },
  scrollContent: {
    padding: 5,
    paddingBottom: 20,
  },
  // Title Styles
  titleContainer: {
    paddingHorizontal: 5,
    paddingTop: 5,
    paddingBottom: 8,
    backgroundColor: '#EDEBEB',
  },
  title: {
    fontSize: 24,
    fontFamily: 'K2D-Bold',
    color: '#333',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    fontFamily: 'K2D-Regular',
  },
  // Tabs Styles
  tabsContainer: {
    marginBottom: 12,
  },
  tabsContent: {
    paddingRight: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
    minWidth: 120,
  },
  filterTabActive: {
    backgroundColor: '#FFFFFF',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tickContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  tickContainerInactive: {
    backgroundColor: '#6B7280',
  },
  filterText: {
    fontSize: 12,
    fontFamily: 'K2D-Medium',
  },
  filterTextActive: {
    fontFamily: 'K2D-SemiBold',
  },
  filterTextInactive: {
    color: '#6B7280',
  },
  activeFilterText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'K2D-SemiBold',
    marginBottom: 12,
    paddingLeft: 4,
  },
  // List Styles - UPDATED TO MATCH LEADDETAILSSCREEN
  listContent: {
    paddingTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'K2D-Medium',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 12,
    color: '#BBB',
    fontFamily: 'K2D-Regular',
    textAlign: 'center',
  },
  // Card Styles
  followupCard: {
    marginBottom: 12,
  },
  cardContent: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 12,
    borderWidth: 0.5,
    borderColor: '#807e7e',
    borderLeftWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leadInfo: {
    flex: 1,
    marginLeft: 8,
  },
  leadName: {
    fontSize: 14,
    fontFamily: 'K2D-SemiBold',
    color: '#333',
    marginBottom: 2,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeText: {
    fontSize: 13,
    fontFamily: 'K2D-SemiBold',
    color: '#333',
  },
  rightSide: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'K2D-SemiBold',
  },
  descriptionContainer: {
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 12,
    color: '#555',
    fontFamily: 'K2D-Regular',
    lineHeight: 16,
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
    marginHorizontal: 8,
    color: '#999',
    fontSize: 10,
  },
  dateLabel: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'K2D-Regular',
    marginLeft: 4,
    marginRight: 2,
  },
  dateValue: {
    fontSize: 11,
    color: '#333',
    fontFamily: 'K2D-SemiBold',
  },
  priorityContainer: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBox: {
    width: 10,
    height: 10,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'K2D-Medium',
  },
});

export default FollowupScreen;