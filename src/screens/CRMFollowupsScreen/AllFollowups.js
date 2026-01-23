import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

const AllFollowUp = () => {
  const route = useRoute();
  const {data = [], activities = [], activeTab = 'all'} = route.params || {};
  const navigation = useNavigation();
  
  // State declarations
  const [followups, setFollowups] = useState(data);
  const [allActivities, setAllActivities] = useState(activities);
  const [activeFilter, setActiveFilter] = useState(activeTab); // Use the passed activeTab
  const [editingId, setEditingId] = useState(null);
  const [tempDescription, setTempDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeItemId, setActiveItemId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchDate, setSearchDate] = useState(null);
  const [showSearchDatePicker, setShowSearchDatePicker] = useState(false);

  // Helper function to extract searchable strings
  const extractAllStrings = obj => {
    let result = [];
    const traverse = value => {
      if (typeof value === 'string') {
        result.push(value.toLowerCase());
      } else if (Array.isArray(value)) {
        value.forEach(traverse);
      } else if (typeof value === 'object' && value !== null) {
        Object.values(value).forEach(traverse);
      }
    };
    traverse(obj);
    return result;
  };

  // Constants
  const categoryFilterMap = {
    call: 'phone call',
    email: 'email',
    meeting: 'meeting',
    task: 'task',
  };

  const categoryMap = {
    EM: 'Email',
    PC: 'Phone Call',
    ME: 'Meeting',
    TA: 'Task',
  };

  const today = moment().startOf('day');

  // Sort all activities when we have them, otherwise use passed data
  const allFollowups = useMemo(() => {
    const source = allActivities.length > 0 ? allActivities : followups;
    return [...source].sort((a, b) => 
      moment(a.StartDate || a.Created) - moment(b.StartDate || b.Created)
    );
  }, [allActivities, followups]);

  // Filter logic for tabs
  const timeFilteredFollowups = useMemo(() => {
    if (activeFilter === 'today') {
      return allFollowups.filter(item => {
        const start = moment(item.StartDate);
        const end = item.EndDate ? moment(item.EndDate) : start;
        return (
          start.isSameOrBefore(today, 'day') &&
          end.isSameOrAfter(today, 'day') &&
          item.IsComplete === false
        );
      });
    } else if (activeFilter === 'future') {
      return allFollowups.filter(item => {
        const start = moment(item.StartDate);
        return start.isAfter(today, 'day') && item.IsComplete === false;
      });
    } else if (activeFilter === 'missed') {
      return allFollowups.filter(item => {
        const end = item.EndDate ? moment(item.EndDate) : moment(item.StartDate);
        return end.isBefore(today, 'day') && item.IsComplete === false;
      });
    } else {
      // 'all' - show all incomplete activities
      return allFollowups.filter(item => item.IsComplete === false);
    }
  }, [allFollowups, activeFilter, today]);

  // Prepare followups for search
  const preparedFollowups = useMemo(() => {
    return timeFilteredFollowups.map(item => ({
      ...item,
      _searchText: extractAllStrings(item).join(' '),
      _startDay: moment(item.StartDate).format('YYYY-MM-DD'),
      _endDay: item.EndDate ? moment(item.EndDate).format('YYYY-MM-DD') : null,
    }));
  }, [timeFilteredFollowups]);

  // Final filtered list with search and category filters
  const filteredFollowups = useMemo(() => {
    const text = searchText.toLowerCase().trim();
    const date = searchDate ? moment(searchDate).format('YYYY-MM-DD') : null;

    return preparedFollowups.filter(item => {
      // Text search
      const matchesText = text === '' ? true : item._searchText.includes(text);

      // Category filter
      const activityIdentifier = 
        item.ContactActivityType?.identifier?.toLowerCase() || '';
      const matchesCategory = 
        categoryFilter === 'all' 
          ? true 
          : activityIdentifier.includes(categoryFilterMap[categoryFilter]);

      // Date search
      const matchesDate = date 
        ? item._startDay === date || item._endDay === date 
        : true;

      return matchesText && matchesCategory && matchesDate;
    });
  }, [preparedFollowups, searchText, searchDate, categoryFilter]);

  // Update followup API function
  const updateFollowupField = async (id, field, value) => {
    try {
      setFollowups(prev =>
        prev.map(f => (f.id === id ? {...f, [field]: value} : f))
      );
      
      if (allActivities.length > 0) {
        setAllActivities(prev =>
          prev.map(f => (f.id === id ? {...f, [field]: value} : f))
        );
      }

      const protocol = await AsyncStorage.getItem('protocol');
      const host = await AsyncStorage.getItem('host');
      const port = await AsyncStorage.getItem('port');
      const token = await AsyncStorage.getItem('token');

      const URL = `${protocol}://${host}:${port}/api/v1/models/C_ContactActivity/${id}`;

      await axios.put(
        URL,
        {[field]: value},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      Alert.alert('Failed to update followup');
    }
  };

  // Render followup card
  const renderFollowUpCard = ({item, index}) => {
    const name = item.AD_User_ID?.identifier || '-';
    const date = item.StartDate
      ? moment(item.StartDate).format('DD MMM YYYY')
      : '-';
    const followUpCode = item.ContactActivityType?.identifier;
    const followUpType = categoryMap[followUpCode] || followUpCode || '-';
    const phone = item.Phone || '+88 01234567890';
    const organization = item.AD_Org_ID?.identifier;

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: index % 2 === 0 ? '#f3f0ff' : '#ffffff',
          },
        ]}>
        {/* ROW 1 */}
        <View style={styles.rowBetween}>
          <Text style={styles.typeText}>Type: {followUpType}</Text>
        </View>

        {/* ROW 2 */}
        <View style={styles.rowBetween}>
          <View style={{flex: 1, width: '48%'}}>
            <Text style={styles.smallLabel}>Date</Text>
            <TouchableOpacity
              onPress={() => {
                setActiveItemId(item.id);
                setSelectedDate(new Date(item.EndDate || item.StartDate));
                setShowDatePicker(true);
              }}>
              <View style={styles.infoContainer}>
                <Text style={styles.boldText}>{date}</Text>
              </View>
            </TouchableOpacity>
            {showDatePicker && activeItemId === item.id && (
              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                display="calendar"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (event.type === 'set' && date) {
                    const formattedDate = moment(date)
                      .utc()
                      .format('YYYY-MM-DDTHH:mm:ss[Z]');
                    updateFollowupField(activeItemId, 'EndDate', formattedDate);
                  }
                }}
              />
            )}
          </View>

          <View style={{flex: 1, width: '48%', justifyContent: 'flex-end', alignItems: 'flex-end'}}>
            <Text style={styles.smallLabel}>Person</Text>
            <Text style={styles.boldText}>{name}</Text>
          </View>
        </View>

        {/* ROW 3 */}
        <View style={styles.rowBetween}>
          <View style={{flex: 1, width: '48%'}}>
            <Text style={styles.smallLabel}>Organization</Text>
            <Text style={styles.companyText}>{organization}</Text>
          </View>

          <View style={{flex: 1, width: '48%', justifyContent: 'flex-end', alignItems: 'flex-end'}}>
            <Text style={styles.smallLabel}>Status</Text>
            <TouchableOpacity
              onPress={() =>
                updateFollowupField(item.id, 'IsComplete', !item.IsComplete)
              }
              style={[
                styles.statusBadge,
                {
                  backgroundColor: item.IsComplete ? '#e6f4ea' : '#fdecea',
                },
              ]}>
              <Text
                style={{
                  color: item.IsComplete ? '#2e7d32' : '#c62828',
                  fontFamily: 'K2D-SemiBold',
                  fontSize: 12,
                }}>
                {item.IsComplete ? 'Complete' : 'Incomplete'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* DESCRIPTION */}
        <View style={{marginTop: 8}}>
          <Text style={styles.smallLabel}>Description</Text>
          <TextInput
            value={editingId === item.id ? tempDescription : item.Description}
            editable
            multiline
            onFocus={() => {
              setEditingId(item.id);
              setTempDescription(item.Description);
            }}
            onChangeText={text => setTempDescription(text)}
            onBlur={() => {
              setEditingId(null);
              if (tempDescription !== item.Description) {
                updateFollowupField(item.id, 'Description', tempDescription);
              }
            }}
            style={styles.description}
            placeholder="Enter description"
          />
        </View>
      </View>
    );
  };

  // Filter button component
  const FilterBtn = ({title, active, onPress, variant = 'filled'}) => {
    const isOutline = variant === 'outline';

    return (
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.filterBtn,
          isOutline
            ? {
                backgroundColor: active ? '#154489' : 'transparent',
                borderRadius: 20,
                paddingVertical: 4,
                height: 30,
              }
            : {
                backgroundColor: active ? '#154489' : '#dcdcdc',
              },
        ]}>
        <Text
          style={{
            color: active ? '#fff' : isOutline ? '#154489' : '#555',
            fontFamily: 'K2D-SemiBold',
            fontSize: 13,
          }}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#000" />
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Follow-ups</Text>

      {/* TIME FILTER BUTTONS */}
      <View style={styles.filterRow}>
        {['all', 'today', 'future', 'missed'].map(item => (
          <FilterBtn
            key={item}
            title={item.toUpperCase()}
            active={activeFilter === item}
            onPress={() => {
              setActiveFilter(item);
              setCategoryFilter('all');
            }}
          />
        ))}
      </View>

      {/* SEARCH ROW */}
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search activities..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
          style={styles.searchInput}
        />
        <TouchableOpacity
          onPress={() => setShowSearchDatePicker(true)}
          style={styles.dateBtn}>
          <MaterialIcons name="calendar-today" size={20} color="#154489" />
        </TouchableOpacity>
        {showSearchDatePicker && (
          <DateTimePicker
            value={searchDate || new Date()}
            mode="date"
            display="calendar"
            onChange={(event, date) => {
              setShowSearchDatePicker(false);
              if (event.type === 'set' && date) {
                setSearchDate(moment(date).startOf('day'));
              }
            }}
          />
        )}
      </View>

      {/* CATEGORY FILTER ROW */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalFilterRow}>
        {['all', 'call', 'email', 'meeting', 'task'].map(cat => (
          <FilterBtn
            key={cat}
            title={cat.toLowerCase()}
            active={categoryFilter === cat}
            onPress={() => setCategoryFilter(cat)}
            variant="outline"
          />
        ))}
      </ScrollView>

      {/* FOLLOWUPS LIST */}
      <FlatList
        data={filteredFollowups}
        renderItem={renderFollowUpCard}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No followups found for "{activeFilter}" filter
            </Text>
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
    top: '6%',
    paddingVertical: '7%',
    paddingHorizontal: '3%',
  },
  title: {
    fontSize: 20,
    fontFamily: 'K2D-SemiBold',
    marginVertical: 10,
    color: '#000',
  },
  card: {
    backgroundColor: '#fff',
    padding: '7%',
    marginBottom: 12,
    borderRadius: 6,
    elevation: 3,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  searchInput: {
    flex: 1,
    color: '#555',
    fontFamily: 'K2D-Regular',
  },
  dateBtn: {
    paddingLeft: 10,
    paddingVertical: 6,
  },
  horizontalFilterRow: {
    height: 40,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 6,
    marginHorizontal: 5,
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
    backgroundColor: '#d4f5d6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  description: {
    borderBottomWidth: 0.5,
    borderColor: '#aaa',
    paddingVertical: 3,
    color: '#000',
    fontFamily: 'K2D-Regular',
    fontSize: 11,
    paddingHorizontal: '2%',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'K2D-Regular',
    textAlign: 'center',
  },
});

export default AllFollowUp;