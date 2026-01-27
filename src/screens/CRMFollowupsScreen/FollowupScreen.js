// screens/CRM/FollowupScreen.js
import React, { useState, useMemo } from 'react';
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
  Alert,
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
import { useFollowups, useUpdateFollowup } from '../../hooks/useCRM';
import moment from 'moment';

const FollowupScreen = ({ navigation }) => {
  // State
  const [filterVisible, setFilterVisible] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [selectStatus, setSelectStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [tempDescription, setTempDescription] = useState('');

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

  // Filter and sort followups
  const filteredFollowups = useMemo(() => {
    if (!allFollowups.length) return [];

    // First filter by status
    let statusFiltered = allFollowups;
    if (selectStatus === 'completed') {
      statusFiltered = allFollowups.filter(item => item.IsComplete);
    } else if (selectStatus === 'pending') {
      statusFiltered = allFollowups.filter(item => !item.IsComplete);
    }

    // Then filter by date range
    let dateFiltered = statusFiltered;
    if (fromDate && toDate) {
      dateFiltered = statusFiltered.filter(item => {
        const itemDate = moment(item.StartDate);
        return itemDate.isBetween(
          moment(fromDate).startOf('day'), 
          moment(toDate).endOf('day'),
          null,
          '[]'
        );
      });
    }

    // Then filter by search
    let searchFiltered = dateFiltered;
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase();
      searchFiltered = dateFiltered.filter(item => {
        const leadName = item.AD_User_ID?.Name || item.AD_User_ID?.identifier || '';
        const description = item.Description || '';
        const activityType = categoryMap[item.ContactActivityType?.identifier] || '';
        
        return leadName.toLowerCase().includes(searchTerm) ||
               description.toLowerCase().includes(searchTerm) ||
               activityType.toLowerCase().includes(searchTerm);
      });
    }

    // Finally sort by date (soonest first)
    return searchFiltered.sort((a, b) => moment(a.StartDate) - moment(b.StartDate));
  }, [allFollowups, selectStatus, fromDate, toDate, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!Array.isArray(allFollowups)) {
      return {
        todayFollowups: 0,
        totalFollowups: 0,
        pendingFollowups: 0,
      };
    }
    
    const todayFollowups = allFollowups.filter(item => 
      moment(item.StartDate).isSame(moment(), 'day')
    ).length;
    
    const pendingFollowups = allFollowups.filter(item => 
      !item.IsComplete
    ).length;
    
    return {
      todayFollowups,
      totalFollowups: allFollowups.length,
      pendingFollowups,
    };
  }, [allFollowups]);

  // Apply filter function
  const applyFilter = () => {
    setFilterVisible(false);
    refetchFollowups();
  };
  
  // Reset filter
  const resetFilter = () => {
    setFromDate(new Date());
    setToDate(new Date());
    setSelectStatus('all');
    setFilterVisible(false);
    refetchFollowups();
  };
  
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

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Update followup field
  const updateFollowupField = (id, field, value) => {
    updateFollowupMutation.mutate({ 
      id, 
      updates: { [field]: value } 
    });
  };

  // Handle navigation to lead details - SIMPLE VERSION
  const handleCardPress = (followup) => {
    console.log('Card pressed, navigating...');
    
    const leadId = followup.AD_User_ID?.id || followup.AD_User_ID;
    
    if (!leadId) {
      Alert.alert('Error', 'Lead information not available');
      return;
    }

    // Simple lead data
    const leadData = {
      id: leadId,
      Name: followup.AD_User_ID?.Name || followup.AD_User_ID?.identifier || 'Unknown Lead',
    };
    
    console.log('Navigating with data:', leadData);
    navigation.navigate('LeadDetails', { data: leadData });
  };

  // Simple card render - MINIMAL TOUCHABLE
  const renderFollowupCard = ({ item }) => {
    const leadName = item.AD_User_ID?.Name || item.AD_User_ID?.identifier || 'Unknown Lead';
    const date = item.StartDate ? moment(item.StartDate).format('DD MMM YYYY') : '-';
    const followUpCode = item.ContactActivityType?.identifier;
    const followUpType = categoryMap[followUpCode] || followUpCode || '-';

    return (
      <View style={styles.cardContainer}>
        {/* Main touchable area - ONLY THIS TOUCHES FOR NAVIGATION */}
        <TouchableOpacity
          onPress={() => handleCardPress(item)}
          style={styles.cardTouchable}
          activeOpacity={0.7}>
          
          <View style={styles.cardContent}>
            {/* Row 1 */}
            <View style={styles.cardRow}>
              <Text style={styles.leadName}>{leadName}</Text>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  updateFollowupField(item.id, 'IsComplete', !item.IsComplete);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={[
                  styles.statusBadge,
                  { backgroundColor: item.IsComplete ? '#4CAF50' : '#FF9800' },
                ]}>
                <Text style={styles.statusText}>
                  {item.IsComplete ? 'Complete' : 'Pending'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Row 2 */}
            <View style={styles.cardRow}>
              <View>
                <Text style={styles.cardLabel}>Type</Text>
                <Text style={styles.cardValue}>{followUpType}</Text>
              </View>
              <View>
                <Text style={styles.cardLabel}>Date</Text>
                <Text style={styles.cardValue}>{date}</Text>
              </View>
            </View>
            
            {/* Description */}
            <View style={styles.descriptionSection}>
              <Text style={styles.cardLabel}>Description</Text>
              {editingId === item.id ? (
                <TextInput
                  value={tempDescription}
                  onChangeText={setTempDescription}
                  onBlur={() => {
                    if (tempDescription !== item.Description) {
                      updateFollowupField(item.id, 'Description', tempDescription);
                    }
                    setEditingId(null);
                  }}
                  onSubmitEditing={() => {
                    if (tempDescription !== item.Description) {
                      updateFollowupField(item.id, 'Description', tempDescription);
                    }
                    setEditingId(null);
                  }}
                  autoFocus
                  multiline
                  style={styles.descriptionInput}
                  placeholder="Enter description"
                  onPressIn={(e) => {
                    e.stopPropagation(); // Prevent card press when editing
                  }}
                />
              ) : (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation(); // Don't navigate when clicking description
                    setEditingId(item.id);
                    setTempDescription(item.Description || '');
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={styles.descriptionText} numberOfLines={2}>
                    {item.Description || 'Tap to add description...'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Loading state
  if (isLoadingFollowups) {
    return (
      <View style={styles.container}>
        <CustomHeader 
          title="Follow-ups"
          RightIcon="filter"
          RightPress={() => setFilterVisible(true)}
        />
        <View style={styles.loadingContent}>
          <Text style={styles.loadingText}>Loading followups...</Text>
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
                    <Text style={styles.modalTitle}>Filter Follow-ups</Text>
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
                      <Picker.Item label="All Follow-ups" value="all" />
                      <Picker.Item label="Completed" value="completed" />
                      <Picker.Item label="Pending" value="pending" />
                    </Picker>
                  </View>
                  
                  {/* From Date */}
                  <Text style={styles.sectionTitle}>From Date</Text>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowFromDatePicker(true)}>
                    <Text style={styles.dateText}>
                      {moment(fromDate).format('DD MMM YYYY')}
                    </Text>
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
                    <Text style={styles.dateText}>
                      {moment(toDate).format('DD MMM YYYY')}
                    </Text>
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
        
        {/* Custom Header */}
        <CustomHeader
          title="Follow-ups"
          RightIcon="filter"
          RightPress={() => setFilterVisible(true)}
        />
        
        {/* Main Content */}
        <View style={{ flex: 1 }}>
          <View style={styles.main}>
            {/* Stats Section */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <View style={[styles.statIconWrapper, { backgroundColor: 'rgba(38, 189, 206, 0.2)' }]}>
                  <MaterialIcons
                    name="today"
                    size={20}
                    color="rgba(38, 189, 206, 1)"
                  />
                </View>
                <Text style={styles.statLabel}>Today</Text>
                <Text style={styles.statValue}>{stats.todayFollowups}</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={[styles.statIconWrapper, { backgroundColor: 'rgba(234, 71, 71, 0.2)' }]}>
                  <MaterialIcons
                    name="pending-actions"
                    size={20}
                    color="rgba(234, 71, 71, 1)"
                  />
                </View>
                <Text style={styles.statLabel}>Pending</Text>
                <Text style={styles.statValue}>{stats.pendingFollowups}</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={[styles.statIconWrapper, { backgroundColor: 'rgba(231, 205, 76, 0.2)' }]}>
                  <MaterialCommunityIcons
                    name="calendar-check"
                    size={20}
                    color="rgba(231, 205, 76, 1)"
                  />
                </View>
                <Text style={styles.statLabel}>Total</Text>
                <Text style={styles.statValue}>{stats.totalFollowups}</Text>
              </View>
            </View>
            
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search followups..."
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            {/* Followups List */}
            <FlatList
              data={filteredFollowups}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              renderItem={renderFollowupCard}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="event-note" size={60} color="#ccc" />
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'No followups found' : 'No follow-ups scheduled yet'}
                  </Text>
                </View>
              }
              contentContainerStyle={styles.listContent}
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
        </View>
      </>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  main: {
    flex: 1,
    marginTop: -22,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  // Stats Styles
  statsContainer: {
    backgroundColor: '#F5F5F5',
    height: 110,
    marginTop: '5%',
    marginHorizontal: 22,
    marginBottom: 16,
    flexDirection: 'row',
    elevation: 10,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#000',
    textAlign: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  // Search Styles
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
    color: '#333',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  // Card Styles - SIMPLIFIED
  cardContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardTouchable: {
    padding: 16,
  },
  cardContent: {
    // Container for card content
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leadName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  cardLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  descriptionSection: {
    marginTop: 8,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#000',
    minHeight: 60,
    marginTop: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#444',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    lineHeight: 20,
    marginTop: 4,
  },
  // List Styles
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  listContent: {
    paddingBottom: 20,
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
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
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
    fontWeight: '600',
    fontSize: 16,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default FollowupScreen;