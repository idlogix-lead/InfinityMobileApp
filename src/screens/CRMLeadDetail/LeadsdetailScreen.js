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
  Modal,
  RefreshControl,
} from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import CRMCard from '../../components/CRMCard/CRMCard';
import { useFollowups } from '../../hooks/CRMhooks/useCRM';
import moment from 'moment';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const LeadDetailsScreen = ({ navigation, route }) => {
  const { data: lead } = route.params;
  const [collapsed, setCollapsed] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('startDate'); // 'startDate', 'endDate', 'status'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'
  const [showSortModal, setShowSortModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: followups = [], isLoading, refetch: refetchFollowups } = useFollowups();

  const leadFollowups = useMemo(
    () =>
      followups.filter(
        f => (f.AD_User_ID?.id || f.AD_User_ID) === lead.id
      ),
    [followups, lead.id]
  );

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

    return filtered;
  }, [leadFollowups, activeFilter]);

  // Sort followups based on selected sorting option
  const sortedFollowups = useMemo(() => {
    if (!filteredFollowups.length) return [];

    const sorted = [...filteredFollowups];

    sorted.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'startDate':
          aValue = moment(a.StartDate || a.Created);
          bValue = moment(b.StartDate || b.Created);
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;

        case 'endDate':
          aValue = a.EndDate ? moment(a.EndDate) : moment(a.StartDate || a.Created);
          bValue = b.EndDate ? moment(b.EndDate) : moment(b.StartDate || b.Created);
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;

        case 'status':
          // Sort by completion status (completed first or pending first)
          if (a.IsComplete === b.IsComplete) {
            // If same status, sort by start date
            aValue = moment(a.StartDate || a.Created);
            bValue = moment(b.StartDate || b.Created);
            return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
          }
          return sortOrder === 'asc' 
            ? (a.IsComplete ? -1 : 1) // Completed first
            : (a.IsComplete ? 1 : -1); // Pending first

        default:
          // Default sort by start date
          aValue = moment(a.StartDate || a.Created);
          bValue = moment(b.StartDate || b.Created);
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

    return sorted;
  }, [filteredFollowups, sortBy, sortOrder]);

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

  // Get sort option display name
  const getSortOptionName = (option) => {
    switch (option) {
      case 'startDate': return 'Start Date';
      case 'endDate': return 'End Date';
      case 'status': return 'Status';
      default: return 'Start Date';
    }
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Sort options
  const sortOptions = [
    { id: 'startDate', label: 'Start Date', icon: 'calendar-clock' },
    { id: 'endDate', label: 'End Date', icon: 'calendar-arrow-right' },
    { id: 'status', label: 'Status', icon: 'check-circle' },
  ];

  // Filter tabs
  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'today', label: 'Today' },
    { id: 'future', label: 'Future' },
    { id: 'missed', label: 'Missed' },
    { id: 'completed', label: 'Completed' },
  ];

  // Filter Tab component
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
        <View style={[
          styles.cardContent,
          { 
            borderLeftWidth: 1, 
            borderLeftColor: getActivityColor(activityType),
            borderColor: '#4b4848',
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

          {/* Bottom Row: Dates Only */}
          <View style={styles.bottomRow}>
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
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Lead"
        LeftIcon="arrow-left"
        LeftPress={() => navigation.goBack()}
        RightIcon="plus"
        RightPress={() =>
          navigation.navigate('AddActivity', {
            data: lead,
            mode: 'create',
          })
        }
        MessageNameIcon="edit"
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2F4FE3']}
            tintColor="#2F4FE3"
          />
        }
      >
        {/* LEAD CARD - Now clickable to go to LeadEdit */}
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => navigation.navigate('LeadEdit', { data: lead })}
        >
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
            // Remove the onPress prop from CRMCard since we're wrapping it with TouchableOpacity
          />
        </TouchableOpacity>

        {/* FOLLOW UPS SECTION */}
        <View style={styles.sectionContainer}>
          {/* Section Header with Sort Button */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Follow-ups</Text>
            <TouchableOpacity 
              style={styles.sortButton}
              onPress={() => setShowSortModal(true)}
            >
              <MaterialCommunityIcons name="sort" size={20} color="#2F4FE3" />
              <Text style={styles.sortButtonText}>Sort</Text>
              <MaterialIcons 
                name={sortOrder === 'asc' ? 'arrow-upward' : 'arrow-downward'} 
                size={14} 
                color="#2F4FE3" 
              />
            </TouchableOpacity>
          </View>

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

          {/* Active Filter and Sort Info */}
          <View style={styles.filterSortInfo}>
            <Text style={styles.activeFilterText}>
              {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Follow-ups
            </Text>
            <View style={styles.currentSortInfo}>
              <Text style={styles.sortInfoText}>
                Sorted by: {getSortOptionName(sortBy)} ({sortOrder === 'asc' ? 'Asc' : 'Desc'})
              </Text>
            </View>
          </View>

          {/* Follow-ups List */}
          {isLoading ? (
            <ActivityIndicator size="small" color="#2F4FE3" style={styles.loader} />
          ) : sortedFollowups.length > 0 ? (
            <FlatList
              data={sortedFollowups}
              renderItem={renderFollowupCard}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="event-note" size={40} color="#E5E7EB" />
              <Text style={styles.emptyText}>
                No {activeFilter !== 'all' ? activeFilter + ' ' : ''}follow-ups
              </Text>
              <Text style={styles.emptySubText}>
                Tap the + icon in header to add follow-up
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort Follow-ups</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            {/* Sort Options */}
            <ScrollView style={styles.sortOptionsList}>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.sortOptionItem,
                    sortBy === option.id && styles.sortOptionItemSelected
                  ]}
                  onPress={() => {
                    setSortBy(option.id);
                    setShowSortModal(false);
                  }}
                >
                  <View style={styles.sortOptionContent}>
                    <MaterialCommunityIcons 
                      name={option.icon} 
                      size={20} 
                      color={sortBy === option.id ? '#2F4FE3' : '#666'} 
                    />
                    <Text style={[
                      styles.sortOptionText,
                      sortBy === option.id && styles.sortOptionTextSelected
                    ]}>
                      {option.label}
                    </Text>
                  </View>
                  {sortBy === option.id && (
                    <MaterialIcons 
                      name="check" 
                      size={20} 
                      color="#2F4FE3" 
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* Sort Order Toggle */}
            <View style={styles.sortOrderContainer}>
              <Text style={styles.sortOrderLabel}>Sort Order:</Text>
              <TouchableOpacity 
                style={styles.sortOrderButton}
                onPress={toggleSortOrder}
              >
                <Text style={styles.sortOrderText}>
                  {sortOrder === 'asc' ? 'Ascending (Oldest First)' : 'Descending (Newest First)'}
                </Text>
                <MaterialIcons 
                  name={sortOrder === 'asc' ? 'arrow-upward' : 'arrow-downward'} 
                  size={18} 
                  color="#2F4FE3" 
                />
              </TouchableOpacity>
            </View>
            
            {/* Close Button */}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowSortModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  sectionContainer: {
    marginTop: 16,
  },
  // Section Header with Sort Button
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'K2D-Bold',
    color: '#333',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sortButtonText: {
    fontSize: 12,
    fontFamily: 'K2D-SemiBold',
    color: '#2F4FE3',
  },
  // Filter and Sort Info
  filterSortInfo: {
    marginBottom: 12,
  },
  activeFilterText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'K2D-SemiBold',
    marginBottom: 4,
    paddingLeft: 4,
  },
  currentSortInfo: {
    backgroundColor: '#F0F5FF',
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginLeft: 4,
  },
  sortInfoText: {
    fontSize: 11,
    color: '#2F4FE3',
    fontFamily: 'K2D-Medium',
  },
  // Tabs Styles
  tabsContainer: {
    marginBottom: 8,
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
  // List Styles
  listContent: {
    paddingTop: 4,
  },
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'K2D-Bold',
    color: '#333',
  },
  sortOptionsList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  sortOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sortOptionItemSelected: {
    backgroundColor: '#f0f7ff',
    borderLeftWidth: 3,
    borderLeftColor: '#2F4FE3',
  },
  sortOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sortOptionText: {
    fontSize: 15,
    fontFamily: 'K2D-Medium',
    color: '#333',
  },
  sortOptionTextSelected: {
    color: '#2F4FE3',
    fontFamily: 'K2D-SemiBold',
  },
  sortOrderContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  sortOrderLabel: {
    fontSize: 14,
    fontFamily: 'K2D-Medium',
    color: '#666',
    marginBottom: 8,
  },
  sortOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sortOrderText: {
    fontSize: 14,
    fontFamily: 'K2D-Medium',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  closeButton: {
    backgroundColor: '#2F4FE3',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontFamily: 'K2D-SemiBold',
    fontSize: 16,
  },
});

export default LeadDetailsScreen;