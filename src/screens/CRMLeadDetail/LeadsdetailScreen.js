import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import CRMCard from '../../components/CRMCard/CRMCard';
import { useFollowups } from '../../hooks/CRMhooks/useCRM';
import moment from 'moment';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';

const LeadDetailsScreen = ({ navigation, route }) => {
  const { data: lead } = route.params;
  const [collapsed, setCollapsed] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const { data: followups = [], isLoading } = useFollowups();

  const leadFollowups = useMemo(
    () =>
      followups.filter(
        f => (f.AD_User_ID?.id || f.AD_User_ID) === lead.id
      ),
    [followups, lead.id]
  );

  // Filter followups based on selected tab
  const filteredFollowups = useMemo(() => {
    const today = moment().startOf('day');
    let filtered = [...leadFollowups];

    // Apply time filter
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

    // Sort by date (newest first)
    return filtered.sort((a, b) =>
      moment(b.StartDate || b.Created) - moment(a.StartDate || a.Created)
    );
  }, [leadFollowups, activeFilter]);

  const renderFollowupCard = ({ item }) => {
    const isComplete = item.IsComplete;
    const activityType = item.ContactActivityType?.identifier || 'Task';
    const activityIcon = getActivityIcon(activityType);
    
    // Get priority for this follow-up
    const priority = getFollowupPriority(item);

    return (
      <TouchableOpacity
        style={styles.followupCard}
        activeOpacity={0.9}
        onPress={() => {
          navigation.navigate('AddActivity', {
            data: item,
            mode: 'edit',
            leadData: lead
          });
        }}
      >
        {/* Card with left border and black border */}
        <View style={[
          styles.cardContent,
          { 
            borderLeftWidth: 1, 
            borderLeftColor: getActivityColor(activityType),
            borderColor: '#4b4848', // Black border
          }
        ]}>

          {/* Header Row - Activity Type on left, Status on right */}
          <View style={styles.cardHeader}>
            <View style={styles.typeRow}>
              <View style={[styles.iconContainer, { backgroundColor: getActivityBgColor(activityType) }]}>
                {activityIcon}
              </View>
              <Text style={styles.typeText}>
                {activityType}
              </Text>
            </View>

            {/* Right side: Status */}
            <View style={styles.rightSide}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: isComplete ? '#E6F4EA' : '#FDEAEA' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: isComplete ? '#2E7D32' : '#C62828' }
                ]}>
                  {isComplete ? 'Complete' : 'Pending'}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText} numberOfLines={2}>
              {item.Description || 'No description provided'}
            </Text>
          </View>

          {/* Bottom Row: Dates and Priority in same row */}
          <View style={styles.bottomRow}>
            {/* Dates on left with minimized spacing */}
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
                    {moment(item.EndDate).format('DD MMM YY')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Priority on far right - NOW RENDERING TEXT */}
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

  // Helper function to get follow-up priority
  const getFollowupPriority = (item) => {
    // This is a dummy implementation - you can replace with actual logic
    // Using item.id to make priority consistent for each item
    const priorities = ['High', 'Medium', 'Low'];
    const priorityIndex = item.id % 3; // Using modulo to get consistent priority per item
    return priorities[priorityIndex];
  };

  // Helper function to get priority color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#EA4747'; // Red for high
      case 'medium': return '#E7CD4C'; // Yellow for medium
      case 'low': return '#26BDCE'; // Blue for low
      default: return '#EA4747';
    }
  };

  // Helper functions for activity styling
  const getActivityColor = (type) => {
    switch (type?.toUpperCase()) {
      case 'EMAIL': return '#4F46E5';
      case 'PHONE': return '#0EA5E9';
      case 'MEETING': return '#F59E0B';
      case 'TASK': return '#EC4899';
      default: return '#6366F1';
    }
  };

  const getActivityBgColor = (type) => {
    switch (type?.toUpperCase()) {
      case 'EMAIL': return '#EEF2FF';
      case 'PHONE': return '#F0F9FF';
      case 'MEETING': return '#FEF3C7';
      case 'TASK': return '#FCE7F3';
      default: return '#F5F3FF';
    }
  };

  const getActivityIcon = (type) => {
    const iconColor = getActivityColor(type);
    switch (type?.toUpperCase()) {
      case 'EMAIL':
        return <MaterialIcons name="email" size={14} color={iconColor} />;
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

  // Define tab colors for active state
  const getTabColor = (tabId) => {
    switch (tabId) {
      case 'missed':
        return '#EF4444'; // Red for missed
      case 'today':
        return '#3B82F6'; // Blue for today
      case 'completed':
        return '#10B981'; // Green for completed
      case 'future':
        return '#F59E0B'; // Yellow/Orange for future
      case 'all':
      default:
        return '#8B5CF6'; // Purple for all
    }
  };

  // Filter tabs with tick icons
  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'today', label: 'Today' },
    { id: 'future', label: 'Future' },
    { id: 'missed', label: 'Missed' },
    { id: 'completed', label: 'Completed' },
  ];

  // Filter Tab component with same border for all
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

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Follow-Ups"
        LeftIcon="arrow-left"
        LeftPress={() => navigation.goBack()}
        RightIcon="plus" // Adding pen/plus icon in header
        RightPress={() =>
          navigation.navigate('AddActivity', {
            data: lead,
            mode: 'create',
          })
        }
        MessageNameIcon="edit" // You can also use this for a pen icon
        MessageOnPress={() =>
          navigation.navigate('AddActivity', {
            data: lead,
            mode: 'create',
          })
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* LEAD CARD */}
        <CRMCard
          header={lead.AD_Org_ID?.identifier || lead.AD_Client_ID?.identifier}
          name={lead.Name}
          email={lead.EMail}
          cellNo={lead.Phone}
          dateText={lead.Updated}
          interactionType={lead.LastActivityType}
          Description={lead?.Description}
          count={lead.ActivityCount || 0}
          status={lead.LeadStatus?.identifier}
          leadId={lead.id}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          phone={() => Linking.openURL(`tel:${lead.Phone}`)}
          mail={() => Linking.openURL(`mailto:${lead.EMail}`)}
          actOnPress={() =>
            navigation.navigate('AddActivity', {
              data: lead,
              mode: 'create',
            })
          }
          onPress={() =>
            navigation.navigate('EditLead', {
              lead,
            })
          }
        />

        {/* FOLLOW UPS SECTION */}
        <View>
          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Follow-ups</Text>
          </View>

          {/* Scrollable Filter Tabs - Shows 3 tabs width, others scroll */}
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

          {/* Follow-ups List */}
          {isLoading ? (
            <ActivityIndicator size="small" color="#2F4FE3" style={styles.loader} />
          ) : filteredFollowups.length > 0 ? (
            <FlatList
              data={filteredFollowups}
              renderItem={renderFollowupCard}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
              ListHeaderComponent={() => (
                <Text style={styles.activeFilterText}>
                  {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Follow-ups
                </Text>
              )}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="event-note" size={40} color="#E5E7EB" />
              <Text style={styles.emptyText}>
                No {activeFilter !== 'all' ? activeFilter + ' ' : ''}follow-ups
              </Text>
              <Text style={styles.emptySubText}>
                Tap the pen icon in header to add follow-up
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEBEB',
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 20,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'K2D-Bold',
    color: '#333',
  },
  tabsContainer: {
    marginBottom: 12,
  },
  tabsContent: {
    paddingRight: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Tab styling - Fixed width to show ~3 tabs at a time
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB', // Same border for active and inactive
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
    minWidth: 120, // Width to show ~3 tabs on screen
  },
  filterTabActive: {
    backgroundColor: '#FFFFFF',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    // Border remains same as inactive
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
    backgroundColor: '#6B7280', // dark grey
  },
  filterText: {
    fontSize: 12,
    fontFamily: 'K2D-Medium',
  },
  filterTextActive: {
    fontFamily: 'K2D-SemiBold',
    // Color will be set dynamically based on tab
  },
  filterTextInactive: {
    color: '#6B7280', // grey text for inactive
  },
  listContent: {
    paddingTop: 8,
  },
  activeFilterText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'K2D-SemiBold',
    marginBottom: 12,
    paddingLeft: 4,
  },
  followupCard: {
    marginBottom: 12,
  },
  cardContent: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 12,
    borderWidth: 0.5, // Black border width
    borderColor: '#807e7e', // Black border color
    borderLeftWidth: 0.5,
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
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
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
  // Description
  descriptionContainer: {
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 12,
    color: '#555',
    fontFamily: 'K2D-Regular',
    lineHeight: 16,
  },
  // Bottom Row: Dates and Priority in same row
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
  // Priority on the right side of bottom row
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
  loader: {
    padding: 20,
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
});

export default LeadDetailsScreen;