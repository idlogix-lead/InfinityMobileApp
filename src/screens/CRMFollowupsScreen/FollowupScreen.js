// screens/CRM/FollowupScreen.js
import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  Modal,
  TextInput,
} from 'react-native';
import { useFollowups, useUpdateFollowup } from '../../hooks/CRMhooks/useCRM';
import moment from 'moment';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { debounce } from 'lodash';

// Import theme
import theme from '../../constants/CRMTheme/CRMTheme';

// Destructure theme for easy access
const { Colors, Typography, Layout } = theme;
const { scale, verticalScale, spacing } = Layout;

const FollowupScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('startDate'); // 'startDate', 'endDate', 'status'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'
  const [showSortModal, setShowSortModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [localSearchResults, setLocalSearchResults] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);

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

  // Enhanced search function
  const performSearch = useCallback((query, followupsToSearch) => {
    if (!query || query.trim() === '') {
      setLocalSearchResults([]);
      return;
    }
    
    const searchTerm = query.toLowerCase().trim();
    
    // Search in followups
    const results = followupsToSearch.filter(followup => {
      // 1. Lead Name
      const leadName = (followup.AD_User_ID?.Name || followup.AD_User_ID?.identifier || '').toLowerCase();
      
      // 2. Company Name
      const companyName = (followup.AD_User_ID?.BPName || '').toLowerCase();
      
      // 3. Organization Name
      const orgName = (followup.AD_User_ID?.AD_Org_ID?.identifier || '').toLowerCase();
      
      // 4. Description
      const description = (followup.Description || '').toLowerCase();
      
      // 5. Activity Type
      const activityType = (getActivityTypeName(followup.ContactActivityType?.identifier) || '').toLowerCase();
      
      // Search across all fields
      return leadName.includes(searchTerm) || 
             companyName.includes(searchTerm) ||
             orgName.includes(searchTerm) ||
             description.includes(searchTerm) ||
             activityType.includes(searchTerm);
    });
    
    setLocalSearchResults(results);
  }, []);

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((query, followupsToSearch) => {
      performSearch(query, followupsToSearch);
    }, 300),
    [performSearch]
  );

  // Handle text change with debounce
  const handleTextChange = (text) => {
    setSearchQuery(text);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setLocalSearchResults([]);
    debouncedSearch.cancel();
  };

  // Filter followups based on selected tab
  const filteredFollowups = useMemo(() => {
    if (!allFollowups.length) return [];
    
    const today = moment().startOf('day');
    let filtered = [...allFollowups];

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
  }, [allFollowups, activeFilter]);

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

  // Determine which data to display
  const displayData = useMemo(() => {
    // If there's a search query, show local search results
    if (searchQuery && searchQuery.trim() !== '') {
      return localSearchResults;
    }
    
    // No search query, show sorted followups
    return sortedFollowups;
  }, [sortedFollowups, localSearchResults, searchQuery]);

  // Trigger search when sortedFollowups or searchQuery changes
  useEffect(() => {
    if (searchQuery && searchQuery.trim() !== '') {
      debouncedSearch(searchQuery, sortedFollowups);
    } else {
      setLocalSearchResults([]);
    }
  }, [searchQuery, sortedFollowups, debouncedSearch]);

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
    
    navigation.navigate('LeadEdit', { data: leadData });
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

  // Define tab colors for active state
  const getTabColor = (tabId) => {
    switch (tabId) {
      case 'missed':
        return Colors.error;
      case 'today':
        return Colors.info;
      case 'completed':
        return Colors.success;
      case 'future':
        return Colors.warning;
      case 'all':
      default:
        return Colors.primary;
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

  // Sort options (simplified)
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
            size={scale(12)} 
            color={Colors.textInverse} 
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
            borderColor: Colors.borderDark,
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
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading followups...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        >
          {/* SEARCH AND SORT IN ONE ROW */}
          <View style={styles.searchContainer}>
            <View style={[
              styles.searchInputContainer,
              searchFocused && styles.searchInputContainerFocused
            ]}>
              <Ionicons 
                name="search" 
                size={scale(20)} 
                color={Colors.textSecondary} 
                style={styles.searchIcon} 
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search follow-ups by lead name, company..."
                placeholderTextColor={Colors.textTertiary}
                value={searchQuery}
                onChangeText={handleTextChange}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={scale(20)} color={Colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
            
            {/* Sort Button next to search */}
            <TouchableOpacity 
              style={styles.sortButton}
              onPress={() => setShowSortModal(true)}
            >
              <MaterialCommunityIcons name="sort" size={scale(20)} color={Colors.primary} />
              <Text style={styles.sortButtonText}>Sort</Text>
              <MaterialIcons 
                name={sortOrder === 'asc' ? 'arrow-upward' : 'arrow-downward'} 
                size={scale(14)} 
                color={Colors.primary} 
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

          {/* Search and Sort Info */}
          <View style={styles.filterSortInfo}>
            {searchQuery.length > 0 ? (
              <View style={styles.searchHeader}>
                <View>
                  <Text style={styles.searchHeaderText}>
                    {displayData.length} matching follow-ups found
                  </Text>
                </View>
                <TouchableOpacity onPress={clearSearch} style={styles.clearSearchButton}>
                  <Text style={styles.clearSearchText}>Clear Search</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.sortInfoRow}>
                <Text style={styles.activeFilterText}>
                  {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Follow-ups
                </Text>
                <View style={styles.currentSortInfo}>
                  <Text style={styles.sortInfoText}>
                    Sorted by: {getSortOptionName(sortBy)} ({sortOrder === 'asc' ? 'Asc' : 'Desc'})
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Follow-ups List */}
          {displayData.length > 0 ? (
            <FlatList
              data={displayData}
              renderItem={renderFollowupCard}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <View style={styles.emptyContainer}>
              {searchQuery.length > 0 ? (
                <>
                  <Ionicons name="search" size={scale(40)} color={Colors.border} />
                  <Text style={styles.emptyText}>
                    No follow-ups found for "{searchQuery}"
                  </Text>
                  <Text style={styles.emptySubText}>
                    Searched in: Lead name, company, organization, description, and activity type
                  </Text>
                  <TouchableOpacity onPress={clearSearch} style={styles.emptyActionButton}>
                    <Text style={styles.emptyActionText}>Clear Search</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <MaterialIcons name="event-note" size={scale(40)} color={Colors.border} />
                  <Text style={styles.emptyText}>
                    No {activeFilter !== 'all' ? activeFilter + ' ' : ''}follow-ups
                  </Text>
                  <Text style={styles.emptySubText}>
                    All follow-ups will appear here
                  </Text>
                </>
              )}
            </View>
          )}
        </ScrollView>
      </View>

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
                <MaterialIcons name="close" size={scale(24)} color={Colors.textPrimary} />
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
                      size={scale(20)} 
                      color={sortBy === option.id ? Colors.primary : Colors.textSecondary} 
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
                      size={scale(20)} 
                      color={Colors.primary} 
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
                  size={scale(18)} 
                  color={Colors.primary} 
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: spacing.sm,
    paddingBottom: spacing.md,
  },
  // Title Styles
  titleContainer: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: Typography.fontSize.h2,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  // SEARCH AND SORT ROW STYLES
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: spacing.xm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: Layout.borderRadius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: verticalScale(6),
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchInputContainerFocused: {
    borderColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.input,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  clearButton: {
    padding: spacing.xs,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.buttonSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: spacing.xs,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sortButtonText: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.primary,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.fontSize.medium,
    color: Colors.textSecondary,
    marginTop: spacing.md,
    fontFamily: Typography.fontFamily.regular,
  },
  // Filter and Sort Info
  filterSortInfo: {
    marginBottom: spacing.md,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    backgroundColor: Colors.infoLight,
    borderRadius: Layout.borderRadius.md,
    marginBottom: spacing.xs,
    marginHorizontal: spacing.xs,
  },
  searchHeaderText: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.primary,
  },
  searchQueryText: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginTop: spacing.xxs,
  },
  clearSearchButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: verticalScale(6),
    backgroundColor: Colors.backgroundLight,
    borderRadius: Layout.borderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  clearSearchText: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  sortInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  activeFilterText: {
    fontSize: Typography.fontSize.medium,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.semiBold,
    marginBottom: spacing.xs,
  },
  currentSortInfo: {
    backgroundColor: Colors.infoLight,
    paddingHorizontal: spacing.md,
    paddingVertical: verticalScale(4),
    borderRadius: Layout.borderRadius.md,
  },
  sortInfoText: {
    fontSize: Typography.fontSize.xsmall,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.medium,
  },
  // Tabs Styles
  tabsContainer: {
    marginBottom: spacing.md,
  },
  tabsContent: {
    paddingRight: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: verticalScale(8),
    borderRadius: Layout.borderRadius.xl,
    backgroundColor: Colors.backgroundLight,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
    minWidth: scale(105),
  },
  filterTabActive: {
    backgroundColor: Colors.backgroundLight,
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tickContainer: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  tickContainerInactive: {
    backgroundColor: Colors.textTertiary,
  },
  filterText: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.medium,
  },
  filterTextActive: {
    fontFamily: Typography.fontFamily.semiBold,
  },
  filterTextInactive: {
    color: Colors.textTertiary,
  },
  // List Styles
  listContent: {
    paddingTop: spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: Typography.fontSize.medium,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.medium,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: Typography.fontSize.small,
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyActionButton: {
    marginTop: spacing.lg,
    backgroundColor: Colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: verticalScale(12),
    borderRadius: Layout.borderRadius.lg,
  },
  emptyActionText: {
    color: Colors.textInverse,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.medium,
  },
  // Card Styles
  followupCard: {
    marginBottom: spacing.sm,
  },
  cardContent: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.md,
    padding: spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.borderDark,
    borderLeftWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(10),
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leadInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  leadName: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  iconContainer: {
    width: scale(24),
    height: scale(24),
    borderRadius: Layout.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeText: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
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
  },
  statusText: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.semiBold,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.backgroundLight,
    borderTopLeftRadius: Layout.borderRadius.xl,
    borderTopRightRadius: Layout.borderRadius.xl,
    padding: spacing.xl,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    fontSize: Typography.fontSize.h3,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  sortOptionsList: {
    maxHeight: verticalScale(200),
    marginBottom: spacing.xl,
  },
  sortOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(14),
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  sortOptionItemSelected: {
    backgroundColor: Colors.infoLight,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  sortOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sortOptionText: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
  },
  sortOptionTextSelected: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.semiBold,
  },
  sortOrderContainer: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.lg,
  },
  sortOrderLabel: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    marginBottom: spacing.sm,
  },
  sortOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: verticalScale(12),
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  sortOrderText: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  closeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: verticalScale(14),
    borderRadius: Layout.borderRadius.lg,
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.textInverse,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.medium,
  },
});

export default FollowupScreen;