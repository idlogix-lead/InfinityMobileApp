// screens/CRM/FollowupScreen.js - UPDATED with pending/completed sorting options

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Text,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import { useFollowups, useUpdateFollowup } from '../../hooks/CRMhooks/useCRM';
import moment from 'moment';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Menu, Divider } from 'react-native-paper';
import { debounce } from 'lodash';

// Import the followup card
import FollowupCard from '../../components/CRMCard/FollowUpCard';

// Import theme
import theme from '../../constants/CRMTheme/CRMTheme';

// Destructure theme for easy access
const { Colors, Typography, Layout } = theme;
const { scale, verticalScale, spacing } = Layout;

const FollowupScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // today, future, missed, completed
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'leads', 'opportunities'
  const [showTypeFilterModal, setShowTypeFilterModal] = useState(false);
  const [sortBy, setSortBy] = useState('latest');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
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

  // Sort options - UPDATED with pending/completed options
  const sortOptions = [
    { id: 'latest', label: 'Latest to Old', icon: 'arrow-down' },
    { id: 'oldest', label: 'Old to Latest', icon: 'arrow-up' },
    { id: 'nameAZ', label: 'By Name A to Z', icon: 'sort-alphabetical-ascending' },
    { id: 'nameZA', label: 'By Name Z to A', icon: 'sort-alphabetical-descending' },
    { id: 'pendingToCompleted', label: 'Pending to Completed', icon: 'arrow-up-bold' },
    { id: 'completedToPending', label: 'Completed to Pending', icon: 'arrow-down-bold' },
    { id: 'completedFirst', label: 'Completed First', icon: 'check-circle' },
    { id: 'pendingFirst', label: 'Pending First', icon: 'clock-outline' },
  ];

  // Get current sort option display
  const currentSortOption = useMemo(() => {
    return sortOptions.find(option => option.id === sortBy) || sortOptions[0];
  }, [sortBy, sortOptions]);

  // Enhanced search function
  const performSearch = useCallback((query, followupsToSearch) => {
    if (!query || query.trim() === '') {
      setLocalSearchResults([]);
      return;
    }
    
    const searchTerm = query.toLowerCase().trim();
    
    const results = followupsToSearch.filter(followup => {
      const entityName = getDisplayName(followup).toLowerCase();
      const companyName = getCompanyName(followup).toLowerCase();
      const description = (followup.Description || '').toLowerCase();
      const activityType = (getActivityTypeName(followup.ContactActivityType?.identifier) || '').toLowerCase();
      
      return entityName.includes(searchTerm) || 
             companyName.includes(searchTerm) ||
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

  // Determine item type (lead or opportunity)
  const getItemType = (item) => {
    if (item.C_Opportunity_ID?.id) {
      return 'opportunity';
    } else if (item.AD_User_ID?.id) {
      return 'lead';
    }
    return 'unknown';
  };

  // Get display name (lead name or opportunity name)
  const getDisplayName = (item) => {
    if (item.C_Opportunity_ID?.id) {
      return item.C_Opportunity_ID?.Name || item.C_Opportunity_ID?.identifier || 'Unknown Opportunity';
    } else {
      return item.AD_User_ID?.Name || item.AD_User_ID?.identifier || 'Unknown Lead';
    }
  };

  // Get company name
  const getCompanyName = (item) => {
    if (item.C_Opportunity_ID?.id) {
      return item.C_Opportunity_ID?.C_BPartner_ID?.identifier || 
             item.C_BPartner_ID?.identifier || 
             'No Company';
    } else {
      return item.AD_User_ID?.BPName || 
             item.AD_User_ID?.C_BPartner_ID?.identifier || 
             'No Company';
    }
  };

  // Transform followup item for the card component
  const transformForCard = (item) => {
    return {
      ...item,
      type: getItemType(item),
      entityName: getDisplayName(item),
      companyName: getCompanyName(item),
      entityId: getItemType(item) === 'opportunity' ? item.C_Opportunity_ID?.id : item.AD_User_ID?.id,
      entityData: getItemType(item) === 'opportunity' ? item.C_Opportunity_ID : item.AD_User_ID,
    };
  };

  // Filter by type (leads/opportunities)
  const typeFilteredFollowups = useMemo(() => {
    if (typeFilter === 'all') {
      return allFollowups;
    } else if (typeFilter === 'leads') {
      return allFollowups.filter(item => 
        item.AD_User_ID?.id && !item.C_Opportunity_ID?.id
      );
    } else if (typeFilter === 'opportunities') {
      return allFollowups.filter(item => 
        item.C_Opportunity_ID?.id
      );
    }
    return allFollowups;
  }, [allFollowups, typeFilter]);

  // Filter followups based on selected tab (today, future, missed, completed)
  const filteredFollowups = useMemo(() => {
    if (!typeFilteredFollowups.length) return [];
    
    const today = moment().startOf('day');
    let filtered = [...typeFilteredFollowups];

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
    }

    return filtered;
  }, [typeFilteredFollowups, activeFilter]);

  // Sort followups based on selected sorting option - UPDATED with new options
  const sortedFollowups = useMemo(() => {
    if (!filteredFollowups.length) return [];

    const sorted = [...filteredFollowups];

    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return moment(b.StartDate || b.Created).valueOf() - moment(a.StartDate || a.Created).valueOf();
        case 'oldest':
          return moment(a.StartDate || a.Created).valueOf() - moment(b.StartDate || b.Created).valueOf();
        case 'nameAZ':
          const nameA = getDisplayName(a).toLowerCase();
          const nameB = getDisplayName(b).toLowerCase();
          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;
          return 0;
        case 'nameZA':
          const nameAZ = getDisplayName(a).toLowerCase();
          const nameBZ = getDisplayName(b).toLowerCase();
          if (nameAZ > nameBZ) return -1;
          if (nameAZ < nameBZ) return 1;
          return 0;
        case 'pendingToCompleted':
          // First sort by status: pending first, then completed
          if (a.IsComplete !== b.IsComplete) {
            return a.IsComplete ? 1 : -1; // Pending (false) comes before Completed (true)
          }
          // Then sort by date (latest first) within each status group
          return moment(b.StartDate || b.Created).valueOf() - moment(a.StartDate || a.Created).valueOf();
        case 'completedToPending':
          // First sort by status: completed first, then pending
          if (a.IsComplete !== b.IsComplete) {
            return a.IsComplete ? -1 : 1; // Completed (true) comes before Pending (false)
          }
          // Then sort by date (latest first) within each status group
          return moment(b.StartDate || b.Created).valueOf() - moment(a.StartDate || a.Created).valueOf();
        case 'completedFirst':
          if (a.IsComplete === b.IsComplete) {
            return moment(b.StartDate || b.Created).valueOf() - moment(a.StartDate || a.Created).valueOf();
          }
          return a.IsComplete ? -1 : 1;
        case 'pendingFirst':
          if (a.IsComplete === b.IsComplete) {
            return moment(b.StartDate || b.Created).valueOf() - moment(a.StartDate || a.Created).valueOf();
          }
          return a.IsComplete ? 1 : -1;
        default:
          return moment(b.StartDate || b.Created).valueOf() - moment(a.StartDate || a.Created).valueOf();
      }
    });

    return sorted;
  }, [filteredFollowups, sortBy]);

  // Transform sorted followups for the card component
  const cardData = useMemo(() => {
    return sortedFollowups.map(item => transformForCard(item));
  }, [sortedFollowups]);

  // Transform search results for the card component
  const searchCardData = useMemo(() => {
    return localSearchResults.map(item => transformForCard(item));
  }, [localSearchResults]);

  // Determine which data to display
  const displayData = useMemo(() => {
    if (searchQuery && searchQuery.trim() !== '') {
      return searchCardData;
    }
    return cardData;
  }, [cardData, searchCardData, searchQuery]);

  // Trigger search when sortedFollowups or searchQuery changes
  useEffect(() => {
    if (searchQuery && searchQuery.trim() !== '') {
      debouncedSearch(searchQuery, sortedFollowups);
    } else {
      setLocalSearchResults([]);
    }
  }, [searchQuery, sortedFollowups, debouncedSearch]);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchFollowups();
      // Clear search when refreshing
      clearSearch();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchFollowups]);

  // Handle status toggle
  const handleStatusToggle = (id, newStatus) => {
    updateFollowupMutation.mutate({ 
      id, 
      updates: { IsComplete: newStatus } 
    }, {
      onSuccess: () => {
        // Refetch to update the list
        refetchFollowups();
      },
      onError: (error) => {
        Alert.alert('Error', 'Failed to update status');
      }
    });
  };

  // Handle edit
  const handleEdit = (item) => {
    navigation.navigate('AddActivity', {
      data: item,
      mode: 'edit',
    });
  };

  // Handle add activity from card
  const handleAddActivity = (item) => {
    const isOpportunity = item.type === 'opportunity';
    const entityId = item.entityId;
    const entityName = item.entityName;
    
    if (isOpportunity) {
      // Navigate to add activity for opportunity
      navigation.navigate('AddActivity', {
        data: {
          id: entityId,
          Name: entityName,
          isOpportunity: true,
          opportunityId: entityId,
          businessPartnerId: item.entityData?.C_BPartner_ID?.id,
          businessPartnerName: item.companyName,
        },
        mode: 'create',
        sourceType: 'opportunity',
      });
    } else {
      // Navigate to add activity for lead
      navigation.navigate('AddActivity', {
        data: {
          id: entityId,
          Name: entityName,
          businessPartnerId: item.entityData?.C_BPartner_ID?.id,
          businessPartnerName: item.companyName,
        },
        mode: 'create',
        sourceType: 'lead',
      });
    }
  };

  // Handle navigation to appropriate detail screen
  const handleCardPress = (item) => {
    const isOpportunity = item.type === 'opportunity';
    const entityId = item.entityId;
    const entityData = item.entityData;
    
    if (isOpportunity) {
      if (entityId && entityData) {
        navigation.navigate('SalesOpportunityFollowupDetail', { 
          data: entityData,
          followupData: item 
        });
      } else {
        Alert.alert('Error', 'Opportunity information not available');
      }
    } else {
      if (entityId) {
        navigation.navigate('LeadsDetail', { 
          data: { id: entityId, Name: item.entityName },
          followupData: item 
        });
      } else {
        Alert.alert('Error', 'Lead information not available');
      }
    }
  };

  // Helper function to get activity type name
  const getActivityTypeName = (typeCode) => {
    return categoryMap[typeCode] || typeCode || 'Task';
  };

  // Get type filter label
  const getCurrentTypeFilterLabel = () => {
    const typeFilterOptions = [
      { id: 'all', label: 'All Items', icon: 'format-list-bulleted' },
      { id: 'leads', label: 'Leads Only', icon: 'account-group' },
      { id: 'opportunities', label: 'Opportunities Only', icon: 'chart-line' },
    ];
    const option = typeFilterOptions.find(opt => opt.id === typeFilter);
    return option ? option.label : 'All Items';
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

  // Filter tabs
  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'today', label: 'Today' },
    { id: 'future', label: 'Future' },
    { id: 'missed', label: 'Missed' },
    { id: 'completed', label: 'Completed' },
  ];

  // Type filter options
  const typeFilterOptions = [
    { id: 'all', label: 'All Items', icon: 'format-list-bulleted' },
    { id: 'leads', label: 'Leads Only', icon: 'account-group' },
    { id: 'opportunities', label: 'Opportunities Only', icon: 'chart-line' },
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
        
        <Text style={[
          styles.filterText,
          active ? [styles.filterTextActive, { color: tabColor }] : styles.filterTextInactive
        ]}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    );
  };

  // Loading state
  if (isLoadingFollowups && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
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
        {/* SEARCH, TYPE FILTER, AND SORT IN ONE ROW */}
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
              placeholder="Search by name, company..."
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
          
          {/* Type Filter Button */}
          <TouchableOpacity 
            style={[
              styles.filterButton,
              typeFilter !== 'all' && styles.filterButtonActive
            ]}
            onPress={() => setShowTypeFilterModal(true)}
          >
            <MaterialCommunityIcons 
              name="filter" 
              size={scale(20)} 
              color={typeFilter !== 'all' ? Colors.textInverse : Colors.primary} 
            />
            <MaterialCommunityIcons 
              name="chevron-down" 
              size={scale(16)} 
              color={typeFilter !== 'all' ? Colors.textInverse : Colors.primary} 
            />
          </TouchableOpacity>

          {/* Sort Dropdown */}
          <Menu
            visible={sortMenuVisible}
            onDismiss={() => setSortMenuVisible(false)}
            anchor={
              <TouchableOpacity 
                style={styles.sortButton}
                onPress={() => setSortMenuVisible(true)}
              >
                <MaterialCommunityIcons name="sort" size={scale(20)} color={Colors.primary} />
                <MaterialCommunityIcons name="chevron-down" size={scale(16)} color={Colors.primary} />
              </TouchableOpacity>
            }
            style={styles.sortMenu}
          >
            {sortOptions.map((option, index) => (
              <React.Fragment key={option.id}>
                <Menu.Item
                  onPress={() => {
                    setSortBy(option.id);
                    setSortMenuVisible(false);
                  }}
                  title={option.label}
                  titleStyle={[
                    styles.menuItemTitle,
                    sortBy === option.id && styles.menuItemSelected
                  ]}
                  left={() => (
                    <MaterialCommunityIcons 
                      name={option.icon} 
                      size={scale(18)} 
                      color={sortBy === option.id ? Colors.primary : Colors.textSecondary} 
                    />
                  )}
                  right={() => sortBy === option.id && (
                    <MaterialIcons name="check" size={scale(18)} color={Colors.primary} />
                  )}
                />
                {index < sortOptions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Menu>
        </View>

        {/* Type Filter Modal */}
        <Modal
          visible={showTypeFilterModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowTypeFilterModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowTypeFilterModal(false)}
          >
            <View style={styles.filterModalContent}>
              <View style={styles.filterModalHeader}>
                <Text style={styles.filterModalTitle}>Filter Follow Ups</Text>
                <TouchableOpacity onPress={() => setShowTypeFilterModal(false)}>
                  <MaterialIcons name="close" size={scale(24)} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              {typeFilterOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.filterOption,
                    typeFilter === option.id && styles.filterOptionSelected
                  ]}
                  onPress={() => {
                    setTypeFilter(option.id);
                    setShowTypeFilterModal(false);
                  }}
                >
                  <MaterialCommunityIcons 
                    name={option.icon} 
                    size={scale(20)} 
                    color={typeFilter === option.id ? Colors.primary : Colors.textSecondary} 
                  />
                  <Text style={[
                    styles.filterOptionText,
                    typeFilter === option.id && styles.filterOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {typeFilter === option.id && (
                    <MaterialIcons name="check" size={scale(20)} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Scrollable Filter Tabs - Horizontal ScrollView */}
        <View style={styles.tabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
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
        </View>

        {/* Search and Filter Info */}
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
              <View style={styles.filterInfoContainer}>
                <MaterialCommunityIcons 
                  name="filter" 
                  size={scale(16)} 
                  color={typeFilter !== 'all' ? Colors.primary : Colors.textSecondary} 
                />
                <Text style={[
                  styles.activeFilterText,
                  typeFilter !== 'all' && styles.activeFilterHighlight
                ]}>
                  {getCurrentTypeFilterLabel()}
                </Text>
                <Text style={styles.filterSeparator}>•</Text>
                <Text style={styles.activeFilterText}>
                  {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
                </Text>
              </View>
  
            </View>
          )}
        </View>

        {/* Follow-ups List with Pull to Refresh - USING FollowupCard */}
        <FlatList
          data={displayData}
          renderItem={({ item }) => (
            <FollowupCard
              item={item}
              onPress={handleCardPress}
              onStatusToggle={handleStatusToggle}
              onEdit={handleEdit}
              onActivityPress={handleAddActivity}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
              title="Pull to refresh"
              titleColor={Colors.textSecondary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {searchQuery.length > 0 ? (
                <>
                  <Ionicons name="search" size={scale(40)} color={Colors.border} />
                  <Text style={styles.emptyText}>
                    No follow-ups found for "{searchQuery}"
                  </Text>
                  <Text style={styles.emptySubText}>
                    Searched in: Name, company, description, and activity type
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
                    {typeFilter !== 'all' 
                      ? `No ${getCurrentTypeFilterLabel().toLowerCase()} found`
                      : 'All follow-ups will appear here'}
                  </Text>
                </>
              )}
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

// Keep all the existing styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.buttonSecondary,
    width: scale(44),
    height: scale(35),
    borderRadius: Layout.borderRadius.xxl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.buttonSecondary,
    width: scale(44),
    height: scale(35),
    borderRadius: Layout.borderRadius.xxl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sortMenu: {
    marginTop: verticalScale(40),
  },
  menuItemTitle: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.regular,
  },
  menuItemSelected: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.semiBold,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModalContent: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.lg,
    width: '80%',
    maxWidth: 400,
    padding: spacing.lg,
    elevation: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  filterModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  filterModalTitle: {
    fontSize: Typography.fontSize.h4,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginBottom: spacing.xs,
    gap: spacing.md,
  },
  filterOptionSelected: {
    backgroundColor: Colors.infoLight,
  },
  filterOptionText: {
    flex: 1,
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  filterOptionTextSelected: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.semiBold,
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
    paddingHorizontal: spacing.sm,
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
  },
  searchHeaderText: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.primary,
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
  filterInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  filterSeparator: {
    color: Colors.textTertiary,
    fontSize: Typography.fontSize.medium,
    marginHorizontal: spacing.xs,
  },
  activeFilterText: {
    fontSize: Typography.fontSize.small,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.medium,
  },
  activeFilterHighlight: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.semiBold,
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
    paddingHorizontal: spacing.sm,
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
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
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
});

export default FollowupScreen;