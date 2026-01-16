// screens/FollowupsScreen.js
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCRMStore } from '../../store/crmStore';
import { useFollowups, useUpdateFollowup } from '../../hooks/CRMhooks/useCRM';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Loader from '../../components/Loader';

const FollowupScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get followup states from store
  const {
    followupActiveTab,
    followupCategoryFilter,
    followupSearchText,
    followupSearchDate,
    editingId,
    tempDescription,
    activeItemId,
    showDatePicker,
    selectedDate,
    
    setFollowupActiveTab,
    setFollowupCategoryFilter,
    setFollowupSearchText,
    setFollowupSearchDate,
    setEditingId,
    setTempDescription,
    setActiveItemId,
    setShowDatePicker,
    setSelectedDate,
    resetFollowupFilters,
  } = useCRMStore();
  
  // Fetch all followups
  const { 
    data: allFollowups = [], 
    isLoading, 
    error,
    refetch 
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
  
  const categoryFilterMap = {
    call: 'phone call',
    email: 'email',
    meeting: 'meeting',
    task: 'task',
    all: '',
  };
  
  // Date calculations
  const today = moment().startOf('day');
  
  // Filter and sort followups
  const processedFollowups = useMemo(() => {
    if (!allFollowups.length) return [];
    
    // Sort by date
    const sortedFollowups = [...allFollowups].sort((a, b) => 
      moment(a.StartDate) - moment(b.StartDate)
    );
    
    // Categorize by time
    const todayFollowups = sortedFollowups.filter(item => {
      const start = moment(item.StartDate);
      const end = item.EndDate ? moment(item.EndDate) : start;
      return (
        start.isSameOrBefore(today, 'day') &&
        end.isSameOrAfter(today, 'day') &&
        item.IsComplete === false
      );
    });
    
    const futureFollowups = sortedFollowups.filter(item => {
      const start = moment(item.StartDate);
      return start.isAfter(today, 'day') && item.IsComplete === false;
    });
    
    const missedFollowups = sortedFollowups.filter(item => {
      const end = item.EndDate ? moment(item.EndDate) : moment(item.StartDate);
      return end.isBefore(today, 'day') && item.IsComplete === false;
    });
    
    // Get followups based on active tab
    let timeFiltered = sortedFollowups;
    switch (followupActiveTab) {
      case 'today':
        timeFiltered = todayFollowups;
        break;
      case 'future':
        timeFiltered = futureFollowups;
        break;
      case 'missed':
        timeFiltered = missedFollowups;
        break;
      case 'all':
      default:
        timeFiltered = sortedFollowups.filter(item => item.IsComplete === false);
        break;
    }
    
    // Add searchable fields
    const prepared = timeFiltered.map(item => ({
      ...item,
      _searchText: extractAllStrings(item).join(' '),
      _startDay: moment(item.StartDate).format('YYYY-MM-DD'),
      _endDay: item.EndDate ? moment(item.EndDate).format('YYYY-MM-DD') : null,
      _activityType: item.ContactActivityType?.identifier?.toLowerCase() || '',
    }));
    
    // Apply search and filters
    const searchText = followupSearchText.toLowerCase().trim();
    const searchDate = followupSearchDate ? moment(followupSearchDate).format('YYYY-MM-DD') : null;
    const category = followupCategoryFilter;
    
    return prepared.filter(item => {
      // Text search
      const matchesText = searchText === '' || item._searchText.includes(searchText);
      
      // Category filter
      const matchesCategory = category === 'all' || 
        item._activityType.includes(categoryFilterMap[category] || '');
      
      // Date search
      const matchesDate = !searchDate || 
        item._startDay === searchDate || 
        item._endDay === searchDate;
      
      return matchesText && matchesCategory && matchesDate;
    });
  }, [allFollowups, followupActiveTab, followupSearchText, followupSearchDate, followupCategoryFilter]);
  
  // Helper function to extract all strings from object
  const extractAllStrings = (obj) => {
    let result = [];
    const traverse = (value) => {
      if (typeof value === 'string') result.push(value.toLowerCase());
      else if (Array.isArray(value)) value.forEach(traverse);
      else if (typeof value === 'object' && value !== null) Object.values(value).forEach(traverse);
    };
    traverse(obj);
    return result;
  };
  
  // Update followup field
  const updateFollowupField = async (id, field, value) => {
    try {
      updateFollowupMutation.mutate({ id, updates: { [field]: value } });
    } catch (error) {
      Alert.alert('Error', 'Failed to update followup');
    }
  };
  
  // Handle description save
  const handleDescriptionSave = (itemId, newDescription) => {
    if (newDescription !== undefined) {
      updateFollowupField(itemId, 'Description', newDescription);
    }
    setEditingId(null);
  };
  
  // Render followup card
  const renderFollowUpCard = ({ item, index }) => {
    const name = item.AD_User_ID?.identifier || '-';
    const date = item.StartDate ? moment(item.StartDate).format('DD MMM YYYY') : '-';
    const followUpCode = item.ContactActivityType?.identifier;
    const followUpType = categoryMap[followUpCode] || followUpCode || '-';
    const organization = item.AD_Org_ID?.identifier;
    
    return (
      <View style={[styles.card, { backgroundColor: index % 2 === 0 ? '#f3f0ff' : '#ffffff' }]}>
        {/* ROW 1 */}
        <View style={styles.rowBetween}>
          <Text style={styles.typeText}>Type: {followUpType}</Text>
        </View>
        
        {/* ROW 2 */}
        <View style={styles.rowBetween}>
          <View style={{ flex: 1, width: '48%' }}>
            <Text style={styles.smallLabel}>Date</Text>
            <TouchableOpacity
              onPress={() => {
                setActiveItemId(item.id);
                setSelectedDate(new Date(item.EndDate || item.StartDate));
                setShowDatePicker(true);
              }}>
              <Text style={styles.boldText}>{date}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={{ flex: 1, width: '48%', alignItems: 'flex-end' }}>
            <Text style={styles.smallLabel}>Person</Text>
            <Text style={styles.boldText}>{name}</Text>
          </View>
        </View>
        
        {/* ROW 3 */}
        <View style={styles.rowBetween}>
          <View style={{ flex: 1, width: '48%' }}>
            <Text style={styles.smallLabel}>Organization</Text>
            <Text style={styles.companyText}>{organization}</Text>
          </View>
          
          <View style={{ flex: 1, width: '48%', alignItems: 'flex-end' }}>
            <Text style={styles.smallLabel}>Status</Text>
            <TouchableOpacity
              onPress={() => updateFollowupField(item.id, 'IsComplete', !item.IsComplete)}
              style={[styles.statusBadge, { backgroundColor: item.IsComplete ? '#e6f4ea' : '#fdecea' }]}>
              <Text style={{ color: item.IsComplete ? '#2e7d32' : '#c62828' }}>
                {item.IsComplete ? 'Complete' : 'Incomplete'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* DESCRIPTION */}
        <View style={{ marginTop: 8 }}>
          <Text style={styles.smallLabel}>Description</Text>
          {editingId === item.id ? (
            <TextInput
              value={tempDescription}
              onChangeText={setTempDescription}
              onBlur={() => handleDescriptionSave(item.id, tempDescription)}
              onSubmitEditing={() => handleDescriptionSave(item.id, tempDescription)}
              autoFocus
              multiline
              style={styles.descriptionInput}
            />
          ) : (
            <TouchableOpacity onPress={() => {
              setEditingId(item.id);
              setTempDescription(item.Description || '');
            }}>
              <Text style={styles.descriptionText}>
                {item.Description || 'Tap to add description...'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Date Picker */}
        {showDatePicker && activeItemId === item.id && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (event.type === 'set' && date) {
                const formattedDate = moment(date).utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
                updateFollowupField(activeItemId, 'EndDate', formattedDate);
              }
            }}
          />
        )}
      </View>
    );
  };
  
  if (isLoading) {
    return <Loader />;
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading followups</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          resetFollowupFilters();
          navigation.goBack();
        }}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Follow-ups</Text>
        <View style={{ width: 20 }} /> {/* Spacer for alignment */}
      </View>
      
      {/* Time Filter Tabs */}
      <View style={styles.filterRow}>
        {['all', 'today', 'future', 'missed'].map(item => (
          <TouchableOpacity
            key={item}
            style={[styles.filterButton, followupActiveTab === item && styles.activeFilterButton]}
            onPress={() => setFollowupActiveTab(item)}>
            <Text style={[styles.filterButtonText, followupActiveTab === item && styles.activeFilterButtonText]}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Search and Date Filter */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#999" />
          <TextInput
            placeholder="Search followups..."
            value={followupSearchText}
            onChangeText={setFollowupSearchText}
            style={styles.searchInput}
            placeholderTextColor="#999"
          />
        </View>
        
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setFollowupSearchDate(followupSearchDate ? null : new Date())}>
          <MaterialIcons 
            name={followupSearchDate ? "calendar-today" : "date-range"} 
            size={20} 
            color={followupSearchDate ? "#154489" : "#999"} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {['all', 'call', 'email', 'meeting', 'task'].map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryButton, followupCategoryFilter === cat && styles.activeCategoryButton]}
            onPress={() => setFollowupCategoryFilter(cat)}>
            <Text style={[styles.categoryButtonText, followupCategoryFilter === cat && styles.activeCategoryButtonText]}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {processedFollowups.length} followup{processedFollowups.length !== 1 ? 's' : ''} found
        </Text>
        {followupActiveTab !== 'all' && (
          <TouchableOpacity onPress={() => setFollowupActiveTab('all')}>
            <Text style={styles.clearFilterText}>Clear filter</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Followups List */}
      <FlatList
        data={processedFollowups}
        renderItem={renderFollowUpCard}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="event-note" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No followups found</Text>
            <Text style={styles.emptySubtext}>Try changing your filters</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f1f5',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingTop: 50,
  },
  title: {
    fontSize: 20,
    fontFamily: 'K2D-SemiBold',
    color: '#000',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
  },
  activeFilterButton: {
    backgroundColor: '#154489',
  },
  filterButtonText: {
    color: '#555',
    fontFamily: 'K2D-SemiBold',
    fontSize: 13,
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#555',
    fontFamily: 'K2D-Regular',
    fontSize: 14,
  },
  dateButton: {
    marginLeft: 8,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  categoryScroll: {
    marginBottom: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#154489',
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  activeCategoryButton: {
    backgroundColor: '#154489',
  },
  categoryButtonText: {
    color: '#154489',
    fontFamily: 'K2D-SemiBold',
    fontSize: 12,
  },
  activeCategoryButtonText: {
    color: '#fff',
  },
  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsText: {
    color: '#666',
    fontFamily: 'K2D-Regular',
    fontSize: 13,
  },
  clearFilterText: {
    color: '#154489',
    fontFamily: 'K2D-SemiBold',
    fontSize: 13,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  typeText: {
    fontFamily: 'K2D-SemiBold',
    color: '#6a5acd',
    fontSize: 13,
  },
  smallLabel: {
    fontSize: 11,
    color: '#888',
    fontFamily: 'K2D-Regular',
  },
  boldText: {
    fontSize: 13,
    fontFamily: 'K2D-SemiBold',
    color: '#000',
  },
  companyText: {
    fontSize: 13,
    fontFamily: 'K2D-Medium',
    color: '#000',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
    fontFamily: 'K2D-Regular',
    fontSize: 13,
    color: '#000',
  },
  descriptionText: {
    fontSize: 13,
    color: '#444',
    fontFamily: 'K2D-Regular',
    marginTop: 4,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'K2D-Medium',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'K2D-Regular',
    marginTop: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#154489',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryText: {
    color: '#fff',
    fontFamily: 'K2D-SemiBold',
  },
});

export default FollowupScreen;