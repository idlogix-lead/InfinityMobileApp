// screens/CRM/GenericLeadScreen.js
import React, { useState, useMemo, useCallback } from 'react';
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
} from 'react-native';
import { Provider, Portal } from 'react-native-paper';
import CustomHeader from '../../components/CustomHeader';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import CRMCard from '../../components/CRMCard/CRMCard';
import { useLeads, useFollowups, useLeadStatistics, useSearchLeads } from '../../hooks/CRMhooks/useCRM';
import { useLeadActions } from '../../hooks/CRMhooks/useLeadActions';
import moment from 'moment';
import { debounce } from 'lodash';

const GenericLead = ({ 
  navigation, 
  screenTitle = "Leads",
  leadFilter = {},
  showFilterButton = true
}) => {
  // State
  const [filterVisible, setFilterVisible] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [selectStatus, setSelectStatus] = useState('select');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Hooks
  const { 
    data: leads = [], 
    isLoading: isLoadingLeads,
    refetch: refetchLeads,
    error: leadsError 
  } = useLeads(leadFilter);
  
  const { 
    data: followups = [], 
    isLoading: isLoadingFollowups,
    refetch: refetchFollowups 
  } = useFollowups();
  
  const {
    data: statistics = { total: 0, todayLeads: 0, monthLeads: 0 },
    refetch: refetchStats
  } = useLeadStatistics();

  // Search hook - enabled when search query has at least 2 characters
  const { 
    data: searchResults = [], 
    isLoading: isLoadingSearch,
    refetch: refetchSearch 
  } = useSearchLeads(searchQuery, searchQuery.length >= 2);

  const { handleMail, handlePhone, handleWhatsApp } = useLeadActions();

  // Apply filter function
  const applyFilter = () => {
    setFilterVisible(false);
    refetchLeads();
  };
  
  // Reset filter
  const resetFilter = () => {
    setFromDate(new Date());
    setToDate(new Date());
    setSelectStatus('select');
    setFilterVisible(false);
    refetchLeads();
  };
  
  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchLeads(),
        refetchFollowups(),
        refetchStats()
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

  // Handle search with debounce - trigger search after 2+ characters
  const handleSearchInput = useCallback(
    debounce((text) => {
      if (text.length >= 2) {
        setIsSearching(true);
      } else {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  // Handle text input change
  const handleTextChange = (text) => {
    setSearchQuery(text);
    handleSearchInput(text);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  // Determine which data to display
  const displayData = useMemo(() => {
    if (searchQuery.length >= 2 && searchResults.length > 0) {
      return searchResults;
    }
    if (searchQuery.length >= 2 && !isLoadingSearch && searchResults.length === 0) {
      return []; // Return empty array for "no results" state
    }
    return leads;
  }, [leads, searchResults, searchQuery, isLoadingSearch]);

  // Calculate stats based on current leads (excluding search mode)
  const stats = useMemo(() => {
    if (isSearching) {
      // When searching, show search-specific stats
      return {
        todayLeads: 0,
        monthLeads: 0,
        totalLeads: displayData.length,
      };
    }

    if (!Array.isArray(leads)) {
      return {
        todayLeads: 0,
        monthLeads: 0,
        totalLeads: 0,
      };
    }
    
    const todayLeads = leads.filter(lead => 
      moment(lead.Created).isSame(moment(), 'day')
    ).length;
    
    const monthLeads = leads.filter(lead => 
      moment(lead.Created).isSame(moment(), 'month')
    ).length;
    
    return {
      todayLeads,
      monthLeads,
      totalLeads: leads.length,
    };
  }, [leads, displayData, isSearching]);

  const renderLeadCard = (item) => {
    const userActivity = followups.filter(
      act => act?.AD_User_ID?.id === item?.id
    );
    
    const lastActivity = [...userActivity].sort(
      (a, b) => new Date(b.Created) - new Date(a.Created)
    )[0];
    
    const lastActivityType = lastActivity?.ContactActivityType?.identifier || 'N/A';
    const activityCount = userActivity.length;
    
    return (
      <View style={{ marginHorizontal: 10, marginVertical: 5 }}>
        <TouchableOpacity 
          style={{ marginHorizontal: 10, marginVertical: 5 }}
          onPress={() => {
            navigation.navigate('LeadsDetail', { data: item });
          }}
          activeOpacity={0.7}
        >
          <CRMCard
            leadId={item.id}
            header={item.AD_Org_ID?.identifier || item.AD_Client_ID?.identifier}
            name={item?.Name}
            email={item?.EMail}
            cellNo={item?.Phone}
            count={activityCount}
            interactionType={lastActivityType}
            status={item?.LeadStatus?.identifier}
            Description={item?.Description}
            mail={() => handleMail(item?.EMail)}
            phone={() => handlePhone(item?.Phone)}
            whatsapp={() => handleWhatsApp(item?.Phone)}
            dateText={item?.Updated || item?.Created}
            actOnPress={() => {
              navigation.navigate('ActivityList', {
                data: item,
                mode: 'create',
              });
            }}
            onPress={() => {
              navigation.navigate('LeadEdit', { data: item });
            }}
          />
        </TouchableOpacity>
      </View>
    );
  };

  // Loading state
  if (isLoadingLeads && !searchQuery) {
    return (
      <View style={styles.loadingContainer}>
        <CustomHeader 
          title={screenTitle}
          RightIcon={showFilterButton ? "filter" : undefined}
          RightPress={showFilterButton ? () => setFilterVisible(true) : undefined}
        />
        <View style={styles.loadingContent}>
          <Text style={styles.loadingText}>Loading leads...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (leadsError && !searchQuery) {
    return (
      <View style={styles.errorContainer}>
        <CustomHeader 
          title={screenTitle}
          RightIcon={showFilterButton ? "filter" : undefined}
          RightPress={showFilterButton ? () => setFilterVisible(true) : undefined}
        />
        <View style={styles.errorContent}>
          <MaterialIcons name="error-outline" size={48} color="#F44336" />
          <Text style={styles.errorText}>Failed to load leads</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={refetchLeads}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <Provider>
      <>
        {/* Filter Modal */}
        {filterVisible && (
          <Portal>
            <Modal
              visible={filterVisible}
              transparent
              animationType="slide"
              onRequestClose={() => setFilterVisible(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Filter Leads</Text>
                    <TouchableOpacity
                      onPress={() => setFilterVisible(false)}
                      style={styles.closeButton}>
                      <FontAwesome name="times" size={24} color="#000" />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Status Picker */}
                  <Text style={styles.sectionTitle}>Select Status</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={selectStatus}
                      onValueChange={setSelectStatus}
                      style={styles.picker}>
                      <Picker.Item label="-- Select --" value="select" />
                      <Picker.Item label="New" value="New" />
                      <Picker.Item label="Working" value="Working" />
                      <Picker.Item label="Converted" value="Converted" />
                      <Picker.Item label="Expired" value="Expired" />
                    </Picker>
                  </View>
                  
                  {/* From Date */}
                  <Text style={styles.sectionTitle}>From Date</Text>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowFromDatePicker(true)}>
                    <Text style={styles.dateText}>{fromDate.toDateString()}</Text>
                    <EvilIcons name="calendar" size={25} color="#000" />
                  </TouchableOpacity>
                  
                  {showFromDatePicker && (
                    <DateTimePicker
                      value={fromDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, date) => {
                        setShowFromDatePicker(false);
                        if (date) setFromDate(date);
                      }}
                    />
                  )}
                  
                  {/* To Date */}
                  <Text style={styles.sectionTitle}>To Date</Text>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowToDatePicker(true)}>
                    <Text style={styles.dateText}>{toDate.toDateString()}</Text>
                    <EvilIcons name="calendar" size={25} color="#000" />
                  </TouchableOpacity>
                  
                  {showToDatePicker && (
                    <DateTimePicker
                      value={toDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, date) => {
                        setShowToDatePicker(false);
                        if (date) setToDate(date);
                      }}
                    />
                  )}
                  
                  {/* Action Buttons */}
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={[styles.button, styles.resetButton]}
                      onPress={resetFilter}>
                      <Text style={styles.resetButtonText}>Reset</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.button, styles.applyButton]}
                      onPress={applyFilter}>
                      <Text style={styles.applyButtonText}>Apply Filter</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </Portal>
        )}
        
        {/* Custom Header with Filter */}
        <CustomHeader
          title={screenTitle}
          RightIcon={showFilterButton ? "filter" : undefined}
          RightPress={showFilterButton ? () => setFilterVisible(true) : undefined}
        />
        
        {/* Main Content */}
        <View style={{ flex: 1 }}>
          <View style={styles.main}>
            {/* Stats Section - Always visible, above search bar */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <View style={styles.statIconWrapper}>
                  <MaterialIcons
                    name="article"
                    size={20}
                    color="rgba(38, 189, 206, 1)"
                  />
                </View>
                <Text style={styles.statLabel}>Today Leads</Text>
                <Text style={styles.statValue}>{stats.todayLeads}</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={styles.statIconWrapper}>
                  <MaterialIcons
                    name="calendar-month"
                    size={20}
                    color="rgba(234, 71, 71, 1)"
                  />
                </View>
                <Text style={styles.statLabel}>This Month</Text>
                <Text style={styles.statValue}>{stats.monthLeads}</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={styles.statIconWrapper}>
                  <MaterialCommunityIcons
                    name="file-account"
                    size={20}
                    color="rgba(231, 205, 76, 1)"
                  />
                </View>
                <Text style={styles.statLabel}>All Leads</Text>
                <Text style={styles.statValue}>{stats.totalLeads}</Text>
              </View>
            </View>
            
            {/* Search Bar - Below stats cards */}
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search leads by name, email, or phone..."
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={handleTextChange}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </TouchableOpacity>
                )}
              </View>
              {searchQuery.length >= 2 && isLoadingSearch && (
                <View style={styles.searchLoading}>
                  <Text style={styles.searchLoadingText}>Searching...</Text>
                </View>
              )}
            </View>
            
            {/* Search Results Header - Only shows when actively searching */}
            {searchQuery.length >= 2 && (
              <View style={styles.searchHeader}>
                <Text style={styles.searchHeaderText}>
                  {isLoadingSearch ? 'Searching...' : `Search Results (${displayData.length})`}
                </Text>
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={clearSearch} style={styles.clearSearchButton}>
                    <Text style={styles.clearSearchText}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            
            {/* Search Hint - Shows when typing less than 2 characters */}
            {searchQuery.length > 0 && searchQuery.length < 2 && (
              <View style={styles.searchHint}>
                <Text style={styles.searchHintText}>
                  Type at least 2 characters to search...
                </Text>
              </View>
            )}
            
            {/* Leads List */}
            <FlatList
              data={displayData}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              renderItem={({ item }) => renderLeadCard(item)}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  {searchQuery.length >= 2 ? (
                    <>
                      <Ionicons name="search" size={60} color="#ccc" />
                      <Text style={styles.emptyText}>
                        {isLoadingSearch 
                          ? 'Searching...'
                          : `No leads found for "${searchQuery}"`
                        }
                      </Text>
                      {searchQuery.length >= 2 && !isLoadingSearch && (
                        <TouchableOpacity onPress={clearSearch} style={styles.emptyActionButton}>
                          <Text style={styles.emptyActionText}>Clear Search</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  ) : searchQuery.length > 0 ? (
                    <>
                      <Ionicons name="search" size={60} color="#ccc" />
                      <Text style={styles.emptyText}>
                        Type at least 2 characters to search
                      </Text>
                    </>
                  ) : (
                    <>
                      <MaterialIcons name="group" size={60} color="#ccc" />
                      <Text style={styles.emptyText}>No leads found</Text>
                      <Text style={styles.emptySubText}>
                        Start by adding your first lead
                      </Text>
                    </>
                  )}
                </View>
              }
              contentContainerStyle={[
                styles.listContent,
                (searchQuery.length >= 2) && styles.listContentSearch
              ]}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#2F4FE3']}
                  tintColor="#2F4FE3"
                />
              }
            />
          </View>
          
          {/* Floating Action Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('AddLeads')}
            style={styles.floatingButton}>
            <Text style={styles.floatingButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </>
    </Provider>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    marginTop: -22,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'K2D-Medium',
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'K2D-Medium',
    color: '#F44336',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2F4FE3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontFamily: 'K2D-SemiBold',
    fontSize: 16,
  },
  // Stats Styles
  statsContainer: {
    backgroundColor: '#F5F5F5',
    height: 110,
    marginTop: '5%',
    marginHorizontal: 22,
    marginBottom: 16, // Space between stats and search bar
    flexDirection: 'row',
    elevation: 10,
    shadowColor: '#000',
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.10)',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconWrapper: {
    marginBottom: 8,
  },
  statLabel: {
    fontFamily: 'K2D-Medium',
    fontSize: 13,
    color: '#000',
    textAlign: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontFamily: 'K2D-SemiBold',
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
  },
  // Search Styles - Below stats cards
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'K2D-Regular',
    color: '#333',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  searchLoading: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  searchLoadingText: {
    fontSize: 14,
    fontFamily: 'K2D-Regular',
    color: '#666',
    fontStyle: 'italic',
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 8,
  },
  searchHeaderText: {
    fontSize: 16,
    fontFamily: 'K2D-SemiBold',
    color: '#333',
  },
  clearSearchButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
  },
  clearSearchText: {
    fontSize: 14,
    fontFamily: 'K2D-Medium',
    color: '#666',
  },
  searchHint: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFF8E1',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFECB3',
  },
  searchHintText: {
    fontSize: 14,
    fontFamily: 'K2D-Regular',
    color: '#FF8F00',
    textAlign: 'center',
  },
  // List Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'K2D-Medium',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontFamily: 'K2D-Regular',
    marginTop: 8,
  },
  emptyActionButton: {
    marginTop: 20,
    backgroundColor: '#2F4FE3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyActionText: {
    color: '#fff',
    fontFamily: 'K2D-SemiBold',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  listContentSearch: {
    paddingTop: 0,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#2F4FE3',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  floatingButtonText: {
    color: '#fff',
    fontFamily: 'K2D-Bold',
    fontSize: 20,
  },
  // Filter Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'K2D-SemiBold',
    color: '#000',
  },
  closeButton: {
    padding: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'K2D-Medium',
    color: '#000',
    marginTop: 15,
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
  },
  picker: {
    height: 50,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  dateText: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'K2D-Regular',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  resetButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  applyButton: {
    backgroundColor: '#2F4FE3',
  },
  resetButtonText: {
    color: '#333',
    fontFamily: 'K2D-SemiBold',
    fontSize: 16,
  },
  applyButtonText: {
    color: '#fff',
    fontFamily: 'K2D-SemiBold',
    fontSize: 16,
  },
});

export default GenericLead;