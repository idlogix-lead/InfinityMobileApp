// screens/CRM/GenericLeadScreen.js - RESPONSIVE WITH SINGLE THEME
import React, {useState, useMemo, useCallback, useEffect} from 'react';
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
import {Provider, Menu, Divider} from 'react-native-paper';
import {useFocusEffect} from '@react-navigation/native';
import {useQueryClient} from 'react-query';
import CustomHeader from '../../components/CustomHeader';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CRMCard from '../../components/CRMCard/CRMCard';
import {
  useFollowups,
  useLeadStatistics,
  useSearchLeads,
} from '../../hooks/CRMhooks/useCRM';
import {useLeadActions} from '../../hooks/CRMhooks/useLeadActions';
import moment from 'moment';
import {debounce} from 'lodash';

// Import single theme file
import theme from '../../constants/CRMTheme/CRMTheme';
import CalendarModal from '../../components/RequestScreenComponents/Calendar/CalendarModal';

// Destructure theme for easy access
const {Colors, Typography, Layout} = theme;
const {scale, verticalScale, spacing} = Layout;

const GenericLead = ({navigation, route}) => {
  // Get pre-filtered leads from navigation params
  const {leads: preFilteredLeads = [], screenTitle: paramTitle} =
    route.params || {};

  // Use paramTitle from route.params
  const actualScreenTitle = paramTitle || 'Leads';

  // State
  const [filterVisible, setFilterVisible] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [selectStatus, setSelectStatus] = useState('select');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLeads, setFilteredLeads] = useState(preFilteredLeads);
  const [localSearchResults, setLocalSearchResults] = useState([]);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Sorting state
  const [sortBy, setSortBy] = useState('latest'); // Default sort option
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));
  const [calendarMode, setCalendarMode] = useState('from'); // 'from' or 'to'
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
    data: statistics = {total: 0, todayLeads: 0, monthLeads: 0},
    refetch: refetchStats,
  } = useLeadStatistics();

  const {
    data: searchResults = [],
    isLoading: isLoadingSearch,
    refetch: refetchSearch,
  } = useSearchLeads(searchQuery, searchQuery.length >= 2);

  const {handleMail, handlePhone, handleWhatsApp} = useLeadActions();

  // Sort options
  const sortOptions = [
    {id: 'latest', label: 'Latest to Old', icon: 'arrow-down'},
    {id: 'oldest', label: 'Old to Latest', icon: 'arrow-up'},
    {id: 'nameAZ', label: 'By Name A to Z', icon: 'sort-alphabetical-ascending'},
    {id: 'nameZA', label: 'By Name Z to A', icon: 'sort-alphabetical-descending'},
    {id: 'statusNew', label: 'Status: New First', icon: 'star'},
    {id: 'statusWorking', label: 'Status: Working First', icon: 'progress-clock'},
    {id: 'statusConverted', label: 'Status: Converted First', icon: 'check-circle'},
    {id: 'statusExpired', label: 'Status: Expired First', icon: 'clock-alert'},
  ];

  // Get current sort option display
  const currentSortOption = sortOptions.find(option => option.id === sortBy) || sortOptions[0];

  // Subscribe to query cache changes for real-time updates
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe(event => {
      // When any leads query is updated, force a re-render
      if (event?.query?.queryKey?.[0] === 'leads') {
        setForceUpdate(prev => prev + 1);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Refetch leads data when screen is focused
      queryClient.invalidateQueries(['leads']);
      queryClient.invalidateQueries(['lead-statistics']);
      return () => {
        // Cleanup if needed
      };
    }, [queryClient]),
  );

  // Get the latest lead data from cache
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
      const statuses = ['New', 'Working', 'Converted', 'Expired'];
      for (const status of statuses) {
        const cachedStatusLeads = queryClient.getQueryData(['leads', {status}]);
        if (Array.isArray(cachedStatusLeads)) {
          const cachedLead = cachedStatusLeads.find(
            lead => lead.id === leadId || lead.AD_User_ID?.id === leadId,
          );
          if (cachedLead) return cachedLead;
        }
      }

      return null;
    },
    [queryClient],
  );

  // Apply local filtering whenever filters change
  useEffect(() => {
    if (!Array.isArray(preFilteredLeads) || preFilteredLeads.length === 0) {
      setFilteredLeads([]);
      return;
    }

    // Get the latest data from cache for all leads
    let filtered = preFilteredLeads.map(lead => {
      const cachedLead = getLatestLeadData(lead.id);
      return cachedLead || lead;
    });

    // Apply status filter from modal
    if (selectStatus && selectStatus !== 'select') {
      const statusMap = {
        New: 'N',
        new: 'N',
        Working: 'W',
        working: 'W',
        Converted: 'C',
        converted: 'C',
        Expired: 'E',
        expired: 'E',
      };

      const statusId = statusMap[selectStatus] || selectStatus;

      filtered = filtered.filter(lead => {
        const leadStatusId = lead?.LeadStatus?.id;
        return leadStatusId === statusId;
      });
    }

    // Apply date filters
    if (fromDate) {
      const start = new Date(fromDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(lead => {
        const leadDate = new Date(
          lead.Created || lead.Updated || lead.CreatedDate,
        );
        return leadDate >= start;
      });
    }

    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(lead => {
        const leadDate = new Date(
          lead.Created || lead.Updated || lead.CreatedDate,
        );
        return leadDate <= end;
      });
    }

    setFilteredLeads(filtered);
  }, [
    preFilteredLeads,
    selectStatus,
    fromDate,
    toDate,
    forceUpdate,
    getLatestLeadData,
  ]);

  // Sort leads based on selected sorting option
  const sortedLeads = useMemo(() => {
    if (!filteredLeads.length) return [];

    const sorted = [...filteredLeads];

    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          // Newest first (descending)
          return moment(b.Created || b.CreatedDate).valueOf() - moment(a.Created || a.CreatedDate).valueOf();

        case 'oldest':
          // Oldest first (ascending)
          return moment(a.Created || a.CreatedDate).valueOf() - moment(b.Created || b.CreatedDate).valueOf();

        case 'nameAZ':
          // A to Z
          const nameA = (a.Name || '').toLowerCase();
          const nameB = (b.Name || '').toLowerCase();
          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;
          return 0;

        case 'nameZA':
          // Z to A
          const nameAZ = (a.Name || '').toLowerCase();
          const nameBZ = (b.Name || '').toLowerCase();
          if (nameAZ > nameBZ) return -1;
          if (nameAZ < nameBZ) return 1;
          return 0;

        case 'statusNew':
          // New first, then by date
          if (a.LeadStatus?.id === 'N' && b.LeadStatus?.id !== 'N') return -1;
          if (a.LeadStatus?.id !== 'N' && b.LeadStatus?.id === 'N') return 1;
          // If same status, sort by date (newest first)
          return moment(b.Created || b.CreatedDate).valueOf() - moment(a.Created || a.CreatedDate).valueOf();

        case 'statusWorking':
          // Working first, then by date
          if (a.LeadStatus?.id === 'W' && b.LeadStatus?.id !== 'W') return -1;
          if (a.LeadStatus?.id !== 'W' && b.LeadStatus?.id === 'W') return 1;
          return moment(b.Created || b.CreatedDate).valueOf() - moment(a.Created || a.CreatedDate).valueOf();

        case 'statusConverted':
          // Converted first, then by date
          if (a.LeadStatus?.id === 'C' && b.LeadStatus?.id !== 'C') return -1;
          if (a.LeadStatus?.id !== 'C' && b.LeadStatus?.id === 'C') return 1;
          return moment(b.Created || b.CreatedDate).valueOf() - moment(a.Created || a.CreatedDate).valueOf();

        case 'statusExpired':
          // Expired first, then by date
          if (a.LeadStatus?.id === 'E' && b.LeadStatus?.id !== 'E') return -1;
          if (a.LeadStatus?.id !== 'E' && b.LeadStatus?.id === 'E') return 1;
          return moment(b.Created || b.CreatedDate).valueOf() - moment(a.Created || a.CreatedDate).valueOf();

        default:
          return moment(b.Created || b.CreatedDate).valueOf() - moment(a.Created || a.CreatedDate).valueOf();
      }
    });

    return sorted;
  }, [filteredLeads, sortBy]);

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
        const companyName = (lead.BPName || '').toLowerCase();
        const orgName = (lead.AD_Org_ID?.identifier || '').toLowerCase();
        const clientName = (lead.AD_Client_ID?.identifier || '').toLowerCase();

        return (
          name.includes(searchTerm) ||
          companyName.includes(searchTerm) ||
          orgName.includes(searchTerm) ||
          clientName.includes(searchTerm)
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
    setSelectStatus('select');
    setFilteredLeads(preFilteredLeads);
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
      await Promise.all([
        queryClient.invalidateQueries(['leads']),
        queryClient.invalidateQueries(['lead-statistics']),
        refetchFollowups(),
        refetchStats(),
      ]);
      if (searchQuery.length >= 2) {
        await refetchSearch();
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

  // Status options for custom picker
  const statusOptions = [
    {label: '-- All Statuses --', value: 'select'},
    {label: 'New', value: 'New'},
    {label: 'Working', value: 'Working'},
    {label: 'Converted', value: 'Converted'},
    {label: 'Expired', value: 'Expired'},
  ];

  // Format date for display
  const formatDate = date => {
    if (!date) return '';
    return moment(date).format('DD MMM YYYY');
  };

  // Updated renderLeadCard with live data and leadId
  const renderLeadCard = item => {
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

    return (
      <View style={styles.cardContainer} key={`${liveLead.id}-${forceUpdate}`}>
        <TouchableOpacity
          style={styles.cardTouchable}
          onPress={() => {
            navigation.navigate('LeadsDetail', {data: liveLead});
          }}
          activeOpacity={0.7}>
          <CRMCard
            leadId={liveLead.id} // CRITICAL: Always pass leadId for cache lookup
            header={
              liveLead.AD_Org_ID?.identifier ||
              liveLead.AD_Client_ID?.identifier
            }
            name={liveLead?.Name}
            email={liveLead?.EMail}
            cellNo={liveLead?.Phone}
            count={activityCount}
            interactionType={lastActivityType}
            status={liveLead?.LeadStatus?.identifier}
            Description={liveLead?.Description}
            company={
              liveLead.BPName ||
              liveLead.AD_Client_ID?.identifier ||
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
              navigation.navigate('LeadEdit', {data: liveLead});
            }}
          />
        </TouchableOpacity>
      </View>
    );
  };

  // Loading state
  if (!preFilteredLeads || preFilteredLeads.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <CustomHeader
          title={actualScreenTitle}
          RightIcon="filter"
          RightPress={() => setFilterVisible(true)}
        />
        <View style={styles.loadingContent}>
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
                {/* Status Picker */}
                <Text style={styles.sectionTitle}>Filter by Status</Text>
                <View style={styles.customPickerContainer}>
                  {statusOptions.map(option => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.statusOption,
                        selectStatus === option.value &&
                          styles.statusOptionSelected,
                      ]}
                      onPress={() => setSelectStatus(option.value)}>
                      <Text
                        style={[
                          styles.statusOptionText,
                          selectStatus === option.value &&
                            styles.statusOptionTextSelected,
                        ]}>
                        {option.label}
                      </Text>
                      {selectStatus === option.value && (
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
                    style={{paddingLeft: scale(8)}}>
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
                    {filteredLeads.length} leads
                  </Text>
                  </View>
                 
                </View>
              )}
            </View>

            {/* Leads List */}
            <FlatList
              data={displayData}
              keyExtractor={(item, index) =>
                `${item.id || index}-${forceUpdate}`
              }
              renderItem={({item}) => renderLeadCard(item)}
              extraData={forceUpdate}
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
                        Searched in: Name, Company and Organization
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
                        {filteredLeads.length === 0 && selectStatus !== 'select'
                          ? `No ${selectStatus.toLowerCase()} leads found in ${actualScreenTitle}`
                          : `No leads found in ${actualScreenTitle}`}
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
    height: scale(44),
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: {width: 0, height: 1},
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
  searchQueryText: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginTop: spacing.xxs,
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
    backgroundColor: Colors.infoLight,
    paddingHorizontal: spacing.md,
    paddingVertical: verticalScale(6),
    borderRadius: Layout.borderRadius.md,
  },
  sortInfoText: {
    fontSize: Typography.fontSize.xsmall,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.medium,
  },
  totalCountText: {
    fontSize: Typography.fontSize.xsmall,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.medium,
  },
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
    shadowOffset: {width: 0, height: 2},
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
    shadowOffset: {width: 0, height: 1},
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
  calendarModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModalContent: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 10,
    padding: 10,
  },
  calendarCloseButton: {
    marginTop: 10,
    alignSelf: 'center',
    padding: 10,
  },
});

export default GenericLead;