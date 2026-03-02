// screens/CRM/GenericLeadScreen.js - FIXED version with LeadEdit pattern

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  Platform,
  RefreshControl,
  TextInput,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Provider, Menu, Divider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from 'react-query';
import CustomHeader from '../../components/CustomHeader';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CRMCard from '../../components/CRMCard/CRMCard';
import {
  useFollowups,
  useLeadStatistics,
  useSearchLeads,
  useLeadStatuses,
} from '../../hooks/CRMhooks/useCRM';
import { useLeadActions } from '../../hooks/CRMhooks/useLeadActions';
import moment from 'moment';
import { debounce } from 'lodash';

// Import single theme file
import theme from '../../constants/CRMTheme/CRMTheme';
import CalendarModal from '../../components/RequestScreenComponents/Calendar/CalendarModal';

// Destructure theme for easy access
const { Colors, Typography, Layout } = theme;
const { scale, verticalScale, spacing } = Layout;

const GenericLead = ({ navigation, route }) => {
  // Get pre-filtered leads and screen title from navigation params
  const { leads: initialLeads = [], screenTitle: paramTitle, statusId: paramStatusId } = route.params || {};

  // Use paramTitle from route.params
  const actualScreenTitle = paramTitle || 'Leads';

  // ADDED: State to track if component is mounted (like LeadEdit)
  const [isMounted, setIsMounted] = useState(false);

  // ADDED: useEffect to set mounted state after first render (like LeadEdit)
  useEffect(() => {
    setIsMounted(true);
    return () => {
      // Cleanup if needed
    };
  }, []);

  // Fetch dynamic lead statuses
  const { data: leadStatuses = [] } = useLeadStatuses();

  // State
  const [filterVisible, setFilterVisible] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [selectedStatusId, setSelectedStatusId] = useState(paramStatusId || 'select');
  const [selectedStatusName, setSelectedStatusName] = useState('select');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [localSearchResults, setLocalSearchResults] = useState([]);
  const [freshLeads, setFreshLeads] = useState(initialLeads);

  // Sorting state
  const [sortBy, setSortBy] = useState('latest');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  const [calendarMode, setCalendarMode] = useState('from');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectDate, setSelectDate] = useState(null);

  // Hooks
  const queryClient = useQueryClient();

  const {
    data: followups = [],
    isLoading: isLoadingFollowups,
    refetch: refetchFollowups,
  } = useFollowups();

  const {
    data: statistics = { total: 0, todayLeads: 0, monthLeads: 0 },
    refetch: refetchStats,
  } = useLeadStatistics();

  const {
    data: searchResults = [],
    isLoading: isLoadingSearch,
    refetch: refetchSearch,
  } = useSearchLeads(searchQuery, searchQuery.length >= 2);

  const { handleMail, handlePhone, handleWhatsApp } = useLeadActions();

  // ============================================
  // DYNAMIC STATUS OPTIONS
  // ============================================

  // Generate status options dynamically from leadStatuses
  const statusOptions = useMemo(() => {
    const options = [
      { label: '-- All Statuses --', value: 'select', id: 'select' },
    ];

    leadStatuses.forEach(status => {
      options.push({
        label: status.name,
        value: status.name,
        id: status.id,
        color: status.color
      });
    });

    return options;
  }, [leadStatuses]);

  // Get status name by ID
  const getStatusNameById = useCallback((id) => {
    const status = leadStatuses.find(s => s.id === id);
    return status?.name || id;
  }, [leadStatuses]);

  // Get status ID by name
  const getStatusIdByName = useCallback((name) => {
    const status = leadStatuses.find(s => s.name === name);
    return status?.id || name;
  }, [leadStatuses]);

  // ============================================
  // CACHE ACCESS
  // ============================================

  // Get fresh leads directly from cache (no API call)
  const getFreshLeadsFromCache = useCallback(() => {
    // Try to get from main leads cache
    const cachedLeads = queryClient.getQueryData(['leads']);
    if (Array.isArray(cachedLeads) && cachedLeads.length > 0) {
      return cachedLeads;
    }

    // Try to get from any leads query as fallback
    const allQueries = queryClient.getQueryCache().findAll(['leads']);
    for (const query of allQueries) {
      if (Array.isArray(query.state.data)) {
        return query.state.data;
      }
    }

    return initialLeads; // Fallback to initial leads
  }, [queryClient, initialLeads]);

  // FIXED: Update freshLeads when cache changes - using mounted check
  useEffect(() => {
    const updateLeadsFromCache = () => {
      if (!isMounted) return; // Check mounted state
      const leads = getFreshLeadsFromCache();
      setFreshLeads(leads);
    };

    // Subscribe to query cache changes for real-time updates
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      // When any leads query is updated, refresh our data
      if (event?.query?.queryKey?.[0] === 'leads') {
        // Use setTimeout to ensure this doesn't happen during render
        setTimeout(updateLeadsFromCache, 0);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient, getFreshLeadsFromCache, isMounted]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Invalidate queries to trigger background refetch
      queryClient.invalidateQueries(['leads']);
      queryClient.invalidateQueries(['lead-statistics']);

      // Also update from cache immediately
      const leads = getFreshLeadsFromCache();
      if (isMounted) {
        setFreshLeads(leads);
      }

      return () => {
        // Cleanup if needed
      };
    }, [queryClient, getFreshLeadsFromCache, isMounted]),
  );

  // Get the latest lead data from cache by ID
  const getLatestLeadData = useCallback(
    leadId => {
      if (!leadId) return null;

      // Try to get from main leads cache
      const cachedLeads = queryClient.getQueryData(['leads']);
      if (Array.isArray(cachedLeads)) {
        const cachedLead = cachedLeads.find(
          lead => lead.id === leadId || lead.AD_User_ID?.id === leadId,
        );
        if (cachedLead) return cachedLead;
      }

      // Try to get from status-specific caches
      const cachedLeadsByStatus = queryClient.getQueryData(['leads-by-status']);
      if (Array.isArray(cachedLeadsByStatus)) {
        const cachedLead = cachedLeadsByStatus.find(
          lead => lead.id === leadId || lead.AD_User_ID?.id === leadId,
        );
        if (cachedLead) return cachedLead;
      }

      return null;
    },
    [queryClient],
  );

  // ============================================
  // DYNAMIC SORT OPTIONS
  // ============================================

  // Sort options - now includes dynamic status sorting
  const sortOptions = useMemo(() => {
    const baseOptions = [
      { id: 'latest', label: 'Latest to Old', icon: 'arrow-down' },
      { id: 'oldest', label: 'Old to Latest', icon: 'arrow-up' },
      { id: 'nameAZ', label: 'By Name A to Z', icon: 'sort-alphabetical-ascending' },
      { id: 'nameZA', label: 'By Name Z to A', icon: 'sort-alphabetical-descending' },
    ];

    // Add dynamic status sort options
    leadStatuses.forEach(status => {
      baseOptions.push({
        id: `status_${status.id}`,
        label: `${status.name} First`,
        icon: 'format-list-bulleted',
        statusId: status.id,
        statusName: status.name
      });
    });

    return baseOptions;
  }, [leadStatuses]);

  // ============================================
  // FILTERING LOGIC
  // ============================================

  // Apply screen-specific filter (based on which card was clicked)
  const screenFilteredLeads = useMemo(() => {
    if (!Array.isArray(freshLeads) || freshLeads.length === 0) {
      return [];
    }

    // Get the latest data from cache for all leads
    let filtered = freshLeads.map(lead => {
      const cachedLead = getLatestLeadData(lead.id);
      return cachedLead || lead;
    });

    // Apply filter based on screen title or status ID
    if (paramStatusId) {
      // If we have a specific status ID, filter by that
      filtered = filtered.filter(lead => lead?.statusId === paramStatusId);
    } else if (actualScreenTitle.includes('Converted')) {
      filtered = filtered.filter(lead => lead?.statusId === 'C');
    } else if (actualScreenTitle.includes('Working')) {
      filtered = filtered.filter(lead => lead?.statusId === 'W');
    } else if (actualScreenTitle.includes('New')) {
      filtered = filtered.filter(lead => lead?.statusId === 'N');
    } else if (actualScreenTitle.includes('Expired')) {
      filtered = filtered.filter(lead => lead?.statusId === 'E');
    }

    return filtered;
  }, [freshLeads, actualScreenTitle, paramStatusId, getLatestLeadData]);

  // Apply additional modal filters
  const modalFilteredLeads = useMemo(() => {
    if (!screenFilteredLeads.length) return [];

    let filtered = [...screenFilteredLeads];

    // Apply status filter from modal using status ID
    if (selectedStatusId && selectedStatusId !== 'select') {
      filtered = filtered.filter(lead => {
        const leadStatusId = lead?.statusId;
        return leadStatusId === selectedStatusId;
      });
    }

    // Apply date filters
    if (fromDate) {
      const start = new Date(fromDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(lead => {
        const leadDate = new Date(
          lead.Created || lead.Updated || lead.createdDate,
        );
        return leadDate >= start;
      });
    }

    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(lead => {
        const leadDate = new Date(
          lead.Created || lead.Updated || lead.createdDate,
        );
        return leadDate <= end;
      });
    }

    return filtered;
  }, [screenFilteredLeads, selectedStatusId, fromDate, toDate]);

  // Sort leads based on selected sorting option
  const sortedLeads = useMemo(() => {
    if (!modalFilteredLeads.length) return [];

    const sorted = [...modalFilteredLeads];

    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return moment(b.Created || b.createdDate).valueOf() - moment(a.Created || a.createdDate).valueOf();

        case 'oldest':
          return moment(a.Created || a.createdDate).valueOf() - moment(b.Created || b.createdDate).valueOf();

        case 'nameAZ':
          const nameA = (a.Name || '').toLowerCase();
          const nameB = (b.Name || '').toLowerCase();
          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;
          return 0;

        case 'nameZA':
          const nameAZ = (a.Name || '').toLowerCase();
          const nameBZ = (b.Name || '').toLowerCase();
          if (nameAZ > nameBZ) return -1;
          if (nameAZ < nameBZ) return 1;
          return 0;

        default:
          // Handle dynamic status sorting
          if (sortBy.startsWith('status_')) {
            const statusId = sortBy.replace('status_', '');
            if (a.statusId === statusId && b.statusId !== statusId) return -1;
            if (a.statusId !== statusId && b.statusId === statusId) return 1;
          }
          return moment(b.Created || b.createdDate).valueOf() - moment(a.Created || a.createdDate).valueOf();
      }
    });

    return sorted;
  }, [modalFilteredLeads, sortBy]);

  // Enhanced search function
  const performSearch = useCallback(
    query => {
      if (!query || query.trim() === '') {
        setLocalSearchResults([]);
        return;
      }

      const searchTerm = query.toLowerCase().trim();

      const results = sortedLeads.filter(lead => {
        const name = (lead.Name || '').toLowerCase();
        const companyName = (lead.companyName || lead.BPName || '').toLowerCase();
        const orgName = (lead.organizationName || lead.AD_Org_ID?.identifier || '').toLowerCase();
        const clientName = (lead.clientName || lead.AD_Client_ID?.identifier || '').toLowerCase();
        const statusName = (lead.statusName || '').toLowerCase();
        const email = (lead.email || lead.EMail || '').toLowerCase();
        const phone = (lead.phone || lead.Phone || '').toLowerCase();

        return (
          name.includes(searchTerm) ||
          companyName.includes(searchTerm) ||
          orgName.includes(searchTerm) ||
          clientName.includes(searchTerm) ||
          statusName.includes(searchTerm) ||
          email.includes(searchTerm) ||
          phone.includes(searchTerm)
        );
      });

      setLocalSearchResults(results);
    },
    [sortedLeads],
  );

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce(query => {
      performSearch(query);
    }, 300),
    [performSearch],
  );

  // Handle text change with debounce
  const handleTextChange = text => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setLocalSearchResults([]);
    debouncedSearch.cancel();
  };

  // Apply filter function
  const applyFilter = () => {
    setFilterVisible(false);
    if (searchQuery.trim() !== '') {
      performSearch(searchQuery);
    }
  };

  // Reset filter
  const resetFilter = () => {
    setFromDate(null);
    setToDate(null);
    setSelectedStatusId('select');
    setSelectedStatusName('select');
    setSearchQuery('');
    setLocalSearchResults([]);
    setFilterVisible(false);
    setSortBy('latest');
    debouncedSearch.cancel();
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Invalidate queries to trigger background refetch
      await queryClient.invalidateQueries(['leads']);
      await queryClient.invalidateQueries(['lead-statistics']);
      await queryClient.invalidateQueries(['lead-statuses']);
      await refetchFollowups();
      await refetchStats();

      if (searchQuery.length >= 2) {
        await refetchSearch();
      }

      // Update from cache immediately
      const leads = getFreshLeadsFromCache();
      if (isMounted) {
        setFreshLeads(leads);
      }
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Determine which data to display
  const displayData = useMemo(() => {
    if (searchQuery && searchQuery.trim() !== '') {
      return localSearchResults;
    }
    return sortedLeads;
  }, [sortedLeads, localSearchResults, searchQuery]);

  // Format date for display
  const formatDate = date => {
    if (!date) return '';
    return moment(date).format('DD MMM YYYY');
  };

  // Render lead card with live data
  const renderLeadCard = ({ item }) => {
    // Get the latest lead data from cache
    const liveLead = getLatestLeadData(item.id) || item;

    const userActivity = followups.filter(
      act => act?.AD_User_ID?.id === liveLead?.id,
    );

    const lastActivity = [...userActivity].sort(
      (a, b) => new Date(b.Created) - new Date(a.Created),
    )[0];

    const lastActivityType =
      lastActivity?.ContactActivityType?.identifier || 'N/A';
    const activityCount = userActivity.length;

    // Get status color from leadStatuses
    const statusColor = leadStatuses.find(s => s.id === liveLead.statusId)?.color || Colors.primary;

    return (
      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={styles.cardTouchable}
          onPress={() => {
            navigation.navigate('LeadsDetail', { data: liveLead });
          }}
          activeOpacity={0.7}>
          <CRMCard
            leadId={liveLead.id}
            header={
              liveLead.organizationName ||
              liveLead.AD_Org_ID?.identifier ||
              liveLead.clientName ||
              liveLead.AD_Client_ID?.identifier
            }
            name={liveLead?.Name}
            email={liveLead?.email || liveLead?.EMail}
            cellNo={liveLead?.phone || liveLead?.Phone}
            count={activityCount}
            interactionType={lastActivityType}
            status={liveLead?.statusName || liveLead?.LeadStatus?.identifier}
            statusColor={statusColor}
            Description={liveLead?.Description}
            company={
              liveLead.companyName ||
              liveLead.BPName ||
              liveLead.clientName ||
              liveLead.AD_Client_ID?.identifier ||
              liveLead.organizationName ||
              liveLead.AD_Org_ID?.identifier
            }
            mail={() => handleMail(liveLead?.EMail)}
            phone={() => handlePhone(liveLead?.Phone)}
            dateText={liveLead?.Updated || liveLead?.Created}
            actOnPress={() => {
              navigation.navigate('AddActivity', {
                data: liveLead,
                mode: 'create',
              });
            }}
            onPress={() => {
              navigation.navigate('LeadEdit', { data: liveLead });
            }}
          />
        </TouchableOpacity>
      </View>
    );
  };

  // Loading state
  if (!initialLeads || initialLeads.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <CustomHeader
          title={actualScreenTitle}
          RightIcon="filter"
          RightPress={() => setFilterVisible(true)}
        />
        <View style={styles.loadingContent}>
          <MaterialIcons name="group" size={scale(60)} color={Colors.border} />
          <Text style={styles.loadingText}>No leads found</Text>
          <Text style={styles.emptySubText}>{actualScreenTitle}</Text>
        </View>
      </View>
    );
  }

  return (
    <Provider>
      <SafeAreaView style={styles.safeArea}>
        {/* Filter Modal */}
        <Modal
          visible={filterVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setFilterVisible(false)}
          hardwareAccelerated={true}
          statusBarTranslucent={false}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Filter {actualScreenTitle}
                </Text>
                <TouchableOpacity
                  onPress={() => setFilterVisible(false)}
                  style={styles.closeButton}>
                  <FontAwesome
                    name="times"
                    size={scale(24)}
                    color={Colors.textPrimary}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>
                {/* Dynamic Status Picker */}
                <Text style={styles.sectionTitle}>Filter by Status</Text>
                <View style={styles.customPickerContainer}>
                  {statusOptions.map(option => (
                    <TouchableOpacity
                      key={option.id || option.value}
                      style={[
                        styles.statusOption,
                        selectedStatusId === option.id &&
                        styles.statusOptionSelected,
                      ]}
                      onPress={() => {
                        setSelectedStatusId(option.id);
                        setSelectedStatusName(option.value);
                      }}>
                      <View style={styles.statusOptionLeft}>
                        {option.color && (
                          <View style={[styles.statusDot, { backgroundColor: option.color }]} />
                        )}
                        <Text
                          style={[
                            styles.statusOptionText,
                            selectedStatusId === option.id &&
                            styles.statusOptionTextSelected,
                          ]}>
                          {option.label}
                        </Text>
                      </View>
                      {selectedStatusId === option.id && (
                        <MaterialIcons
                          name="check"
                          size={scale(20)}
                          color={Colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* From Date */}
                <Text style={styles.sectionTitle}>From Date (Optional)</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => {
                    setCalendarMode('from');
                    setShowCalendar(true);
                  }}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.dateText,
                      !fromDate && styles.datePlaceholder,
                    ]}>
                    {fromDate ? formatDate(fromDate) : 'Select start date'}
                  </Text>
                  <EvilIcons
                    name="calendar"
                    size={scale(25)}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>

                {/* To Date */}
                <Text style={styles.sectionTitle}>To Date (Optional)</Text>
                <View style={styles.dateInput}>
                  <Text
                    style={[
                      styles.dateText,
                      !toDate && styles.datePlaceholder,
                    ]}>
                    {toDate ? formatDate(toDate) : 'Select end date'}
                  </Text>

                  {/* Calendar Icon only triggers calendar */}
                  <TouchableOpacity
                    onPress={() => {
                      setCalendarMode('to');
                      setShowCalendar(true);
                    }}
                    activeOpacity={0.7}
                    style={{ paddingLeft: scale(8) }}>
                    <EvilIcons
                      name="calendar"
                      size={scale(25)}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.resetButton]}
                    onPress={resetFilter}
                    activeOpacity={0.7}>
                    <Text style={styles.resetButtonText}>Reset</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.applyButton]}
                    onPress={applyFilter}
                    activeOpacity={0.7}>
                    <Text style={styles.applyButtonText}>Apply Filter</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Calendar Modal */}
        <CalendarModal
          visible={showCalendar}
          initialDate={calendarMode === 'from' ? fromDate : selectDate}
          onClose={() => setShowCalendar(false)}
          onSelectDate={date => {
            if (calendarMode === 'from') setFromDate(date);
            else {
              setSelectDate(date);
              setToDate(date);
            }
            setShowCalendar(false);
          }}
          title={calendarMode === 'from' ? 'From Date' : 'To Date'}
        />

        {/* Custom Header with Filter and Sort */}
        <CustomHeader
          title={actualScreenTitle}
          RightIcon="filter"
          RightPress={() => setFilterVisible(true)}
        />

        {/* Main Content */}
        <View style={styles.container}>
          <View style={styles.main}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Ionicons
                  name="search"
                  size={scale(20)}
                  color={Colors.textSecondary}
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder={`Search ${actualScreenTitle.toLowerCase()}...`}
                  placeholderTextColor={Colors.textTertiary}
                  value={searchQuery}
                  onChangeText={handleTextChange}
                  returnKeyType="search"
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={clearSearch}
                    style={styles.clearButton}>
                    <Ionicons
                      name="close-circle"
                      size={scale(20)}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* Sort Dropdown Button */}
              <Menu
                visible={sortMenuVisible}
                onDismiss={() => setSortMenuVisible(false)}
                anchor={
                  <TouchableOpacity
                    style={styles.sortButton}
                    onPress={() => setSortMenuVisible(true)}>
                    <MaterialCommunityIcons
                      name="sort"
                      size={scale(20)}
                      color={Colors.primary}
                    />
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={scale(16)}
                      color={Colors.primary}
                    />
                  </TouchableOpacity>
                }
                style={styles.sortMenu}>
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

            {/* Search and Sort Info */}
            <View style={styles.filterSortInfo}>
              {searchQuery.length > 0 ? (
                <View style={styles.searchHeader}>
                  <View>
                    <Text style={styles.searchHeaderText}>
                      {displayData.length} matching leads found
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={clearSearch}
                    style={styles.clearSearchButton}>
                    <Text style={styles.clearSearchText}>Clear Search</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.sortInfoRow}>
                  <View style={styles.sortInfoContainer}>
                    <Text style={styles.totalCountText}>
                      {displayData.length} leads
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Leads List */}
            <FlatList
              data={displayData}
              keyExtractor={(item, index) =>
                `${item.id || index}`
              }
              renderItem={renderLeadCard}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  {searchQuery.length > 0 ? (
                    <>
                      <Ionicons
                        name="search"
                        size={scale(60)}
                        color={Colors.border}
                      />
                      <Text style={styles.emptyText}>
                        No leads found for "{searchQuery}"
                      </Text>
                      <Text style={styles.emptySubText}>
                        Searched in: Name, Company, Organization, Status, Email, Phone
                      </Text>
                      <TouchableOpacity
                        onPress={clearSearch}
                        style={styles.emptyActionButton}>
                        <Text style={styles.emptyActionText}>Clear Search</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <MaterialIcons
                        name="group"
                        size={scale(60)}
                        color={Colors.border}
                      />
                      <Text style={styles.emptyText}>
                        {modalFilteredLeads.length === 0 && selectedStatusId !== 'select'
                          ? `No ${selectedStatusName} leads found`
                          : `No leads found`}
                      </Text>
                      <Text style={styles.emptySubText}>
                        Try changing your filter or sort settings
                      </Text>
                    </>
                  )}
                </View>
              }
              contentContainerStyle={[
                styles.listContent,
                searchQuery.length > 0 && styles.listContentSearch,
              ]}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[Colors.primary]}
                  tintColor={Colors.primary}
                />
              }
              showsVerticalScrollIndicator={false}
            />
          </View>

          {/* Floating Action Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('AddLeads')}
            style={styles.floatingButton}
            activeOpacity={0.8}>
            <Text style={styles.floatingButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Provider>
  );
};

// All styles remain exactly the same
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  main: {
    flex: 1,
    marginTop: verticalScale(10),
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    marginTop: spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
    gap: spacing.md,
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
    justifyContent: 'center',
    backgroundColor: Colors.buttonSecondary,
    width: scale(44),
    height: scale(35),
    borderRadius: Layout.borderRadius.xl,
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
  filterSortInfo: {
    marginBottom: spacing.xxs,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: Colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    marginBottom: spacing.xs,
  },
  searchHeaderText: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  clearSearchButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: verticalScale(6),
    backgroundColor: Colors.backgroundDark,
    borderRadius: Layout.borderRadius.xl,
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  sortInfoContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: verticalScale(6),
    borderRadius: Layout.borderRadius.md,
  },
  totalCountText: {},
  cardContainer: {
    marginHorizontal: spacing.xs,
    marginVertical: spacing.xxs,
  },
  cardTouchable: {},
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxxl,
    minHeight: verticalScale(300),
  },
  emptyText: {
    fontSize: Typography.fontSize.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontFamily: Typography.fontFamily.medium,
    marginTop: spacing.lg,
  },
  emptySubText: {
    fontSize: Typography.fontSize.small,
    color: Colors.textTertiary,
    textAlign: 'center',
    fontFamily: Typography.fontFamily.regular,
    marginTop: spacing.sm,
    maxWidth: '80%',
  },
  emptyActionButton: {
    marginTop: spacing.xl,
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
  listContent: {
    paddingHorizontal: spacing.xs,
    paddingBottom: verticalScale(40),
  },
  listContentSearch: {
    paddingTop: 0,
  },
  floatingButton: {
    position: 'absolute',
    bottom: Layout.floatingButton.bottom,
    right: Layout.floatingButton.right,
    backgroundColor: Colors.primary,
    width: Layout.floatingButton.size,
    height: Layout.floatingButton.size,
    borderRadius: Layout.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 1000,
  },
  floatingButtonText: {
    color: Colors.textInverse,
    fontFamily: Typography.fontFamily.bold,
    fontSize: scale(28),
    lineHeight: scale(30),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Layout.borderRadius.xl,
    borderTopRightRadius: Layout.borderRadius.xl,
    padding: spacing.xl,
    maxHeight: Layout.modal.maxHeight,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    fontSize: Typography.fontSize.h3,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  customPickerContainer: {
    marginBottom: spacing.xl,
    borderRadius: Layout.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: verticalScale(14),
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundDark,
    backgroundColor: Colors.background,
  },
  statusOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
    marginRight: spacing.sm,
  },
  statusOptionSelected: {
    backgroundColor: Colors.infoLight,
  },
  statusOptionText: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },
  statusOptionTextSelected: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.semiBold,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.lg,
    padding: verticalScale(14),
    marginBottom: spacing.lg,
    backgroundColor: Colors.background,
  },
  dateText: {
    fontSize: Typography.fontSize.medium,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.regular,
  },
  datePlaceholder: {
    color: Colors.textTertiary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  button: {
    flex: 1,
    padding: verticalScale(16),
    borderRadius: Layout.borderRadius.lg,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  resetButton: {
    backgroundColor: Colors.buttonSecondary,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  applyButton: {
    backgroundColor: Colors.buttonPrimary,
  },
  resetButtonText: {
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.medium,
  },
  applyButtonText: {
    color: Colors.textInverse,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.medium,
  },
});

export default GenericLead;