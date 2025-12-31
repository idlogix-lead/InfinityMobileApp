import React, {useState} from 'react';
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
import SearchHeader from './SearchHeader';
import {useNavigation, useRoute} from '@react-navigation/native';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import {useMemo} from 'react';

const AllFollowUp = () => {
  const route = useRoute();
  const {data, activeTab} = route.params;
  const navigation = useNavigation();
  const [followups, setFollowups] = useState(data || []);
  const [activeFilter, setActiveFilter] = useState(activeTab || 'all'); // today | future | missed
  const [editingId, setEditingId] = useState(null);
  const [tempDescription, setTempDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeItemId, setActiveItemId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [searchDate, setSearchDate] = useState(null);
  const [showSearchDatePicker, setShowSearchDatePicker] = useState(false);

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

  const sortFollowups = [...followups].sort(
    (a, b) => moment(a.StartDate) - moment(b.StartDate),
  );

  /* ================= FILTER LOGIC (AS YOU GAVE) ================= */

  const todayFollowups = sortFollowups.filter(item => {
    const start = moment(item.StartDate);
    const end = item.EndDate ? moment(item.EndDate) : start;
    return (
      start.isSameOrBefore(today, 'day') &&
      end.isSameOrAfter(today, 'day') &&
      item.IsComplete === false
    );
  });

  const futureFollowups = sortFollowups.filter(item => {
    const start = moment(item.StartDate);
    return start.isAfter(today, 'day') && item.IsComplete === false;
  });

  const missedFollowups = sortFollowups.filter(item => {
    const end = item.EndDate ? moment(item.EndDate) : moment(item.StartDate);
    return end.isBefore(today, 'day') && item.IsComplete === false;
  });

  const timeFilteredFollowups =
    activeFilter === 'today'
      ? todayFollowups
      : activeFilter === 'future'
      ? futureFollowups
      : activeFilter === 'missed'
      ? missedFollowups
      : // : sortFollowups.filter(item => item.IsComplete === false); // 👈 ALL
        sortFollowups;

  const preparedFollowups = useMemo(() => {
    return timeFilteredFollowups.map(item => ({
      ...item,
      _searchText: extractAllStrings(item).join(' '),
      _startDay: moment(item.StartDate).format('YYYY-MM-DD'),
      _endDay: item.EndDate ? moment(item.EndDate).format('YYYY-MM-DD') : null,
    }));
  }, [timeFilteredFollowups]);

  // const filteredFollowups = timeFilteredFollowups.filter(item => {
  //   // 🔍 SEARCH
  //   const search = searchText.toLowerCase();
  //   const name = item.AD_User_ID?.identifier?.toLowerCase() || '';
  //   const desc = item.Description?.toLowerCase() || '';
  //   const type = item.ContactActivityType?.identifier?.toLowerCase() || '';

  //   const matchesSearch =
  //     name.includes(search) || desc.includes(search) || type.includes(search);

  //   // 🟦 CATEGORY (3rd ROW – EXACTLY LIKE 1st ROW)
  //   const activityIdentifier =
  //     item.ContactActivityType?.identifier?.toLowerCase() || '';

  //   const matchesCategory =
  //     categoryFilter === 'all'
  //       ? true
  //       : activityIdentifier.includes(categoryFilterMap[categoryFilter]);

  //   return matchesSearch && matchesCategory;
  // });

  // const filteredFollowups = timeFilteredFollowups.filter(item => {
  //   // 🔍 SEARCH (GLOBAL STRING SEARCH)
  //   const search = searchText.toLowerCase().trim();
  //   const allStrings = extractAllStrings(item);

  //   const matchesSearch =
  //     search === '' ? true : allStrings.some(str => str.includes(search));

  //   // 🟦 CATEGORY FILTER
  //   const activityIdentifier =
  //     item.ContactActivityType?.identifier?.toLowerCase() || '';

  //   const matchesCategory =
  //     categoryFilter === 'all'
  //       ? true
  //       : activityIdentifier.includes(categoryFilterMap[categoryFilter]);

  //   return matchesSearch && matchesCategory;
  // });

  const filteredFollowups = useMemo(() => {
    const text = searchText.toLowerCase().trim();
    const date = searchDate ? moment(searchDate).format('YYYY-MM-DD') : null;

    return preparedFollowups.filter(item => {
      // 🔍 TEXT SEARCH
      const matchesText = text === '' ? true : item._searchText.includes(text);

      // 🟦 CATEGORY
      const activityIdentifier =
        item.ContactActivityType?.identifier?.toLowerCase() || '';

      const matchesCategory =
        categoryFilter === 'all'
          ? true
          : activityIdentifier.includes(categoryFilterMap[categoryFilter]);

      // 📅 DATE SEARCH
      const matchesDate = date
        ? item._startDay === date || item._endDay === date
        : true;

      return matchesText && matchesCategory && matchesDate;
    });
  }, [preparedFollowups, searchText, searchDate, categoryFilter]);

  /* =============================================================== */

  const updateFollowupField = async (id, field, value) => {
    try {
      setFollowups(prev =>
        prev.map(f => (f.id === id ? {...f, [field]: value} : f)),
      );

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
        },
      );
    } catch (error) {
      Alert.alert('Failed to update followup');
    }
  };

  // const renderFollowUpCard = ({item, index}) => {
  //   const name = item.AD_User_ID?.identifier;
  //   const status = item.IsActive ? 'Open' : 'Pending';
  //   const schedule = item.EndDate
  //     ? moment(item.EndDate).format('DD MMM YYYY')
  //     : '-';
  //   const followUpCode = item.ContactActivityType?.identifier;
  //   const followUpType = categoryMap[followUpCode] || followUpCode || '-';

  //   return (
  //     <View
  //       style={[
  //         styles.card,
  //         {
  //           backgroundColor: index % 2 === 0 ? '#fff' : 'rgb(245, 245, 255)',
  //         },
  //       ]}>
  //       <Text style={styles.label}>
  //         Lead Name: <Text style={styles.value}>{name}</Text>
  //       </Text>
  //       <Text style={styles.label}>
  //         Status: <Text style={styles.status}>{status}</Text>
  //       </Text>

  //       {/* Complete / Incomplete */}
  //       <TouchableOpacity
  //         onPress={() =>
  //           updateFollowupField(item.id, 'IsComplete', !item.IsComplete)
  //         }
  //         style={{
  //           flexDirection: 'row',
  //           alignItems: 'center',
  //           marginVertical: 2,
  //         }}>
  //         <Text
  //           style={{
  //             marginLeft: 0,
  //             color: item.IsComplete ? 'gray' : 'black',
  //             fontFamily: 'K2D-Medium',
  //             fontSize: 13,
  //           }}>
  //           {item.IsComplete ? 'Complete' : 'Incomplete'}
  //           <Text style={styles.label}> : </Text>
  //         </Text>
  //         <View
  //           style={{
  //             width: 20,
  //             height: 20,
  //             borderWidth: 1,
  //             borderColor: item.IsComplete ? '#000' : '#000',
  //             justifyContent: 'center',
  //             alignItems: 'center',
  //             borderRadius: 4,
  //           }}>
  //           <Text
  //             style={{
  //               color: item.IsComplete ? '#555' : '#555',
  //               fontFamily: 'K2D-Medium',
  //               bottom: '25%',
  //             }}>
  //             {item.IsComplete ? '✔' : '✖'}
  //           </Text>
  //         </View>
  //       </TouchableOpacity>

  //       {/* Scheduled Date */}
  //       <View style={{marginTop: 10, marginBottom: 10, position: 'relative'}}>
  //         <View style={styles.verticalLineContainer}>
  //           <View style={styles.dot} />
  //           <View style={styles.verticalDottedLine} />
  //           <View style={styles.dot} />
  //         </View>
  //         <View style={styles.infoContainer}>
  //           <TouchableOpacity
  //             onPress={() => {
  //               setActiveItemId(item.id);
  //               setSelectedDate(new Date(item.EndDate));
  //               setShowDatePicker(true);
  //             }}>
  //             <View style={styles.infoContainer}>
  //               <Text style={[styles.subLabel, {paddingHorizontal: '4%'}]}>
  //                 Scheduled Time:
  //               </Text>
  //               <Text style={[styles.subValue, {paddingHorizontal: '0%'}]}>
  //                 {schedule}
  //               </Text>
  //             </View>
  //           </TouchableOpacity>
  //           {showDatePicker && activeItemId === item.id && (
  //             <DateTimePicker
  //               value={selectedDate || new Date()}
  //               mode="date"
  //               display="calendar"
  //               onChange={(event, date) => {
  //                 setShowDatePicker(false);
  //                 if (event.type === 'set' && date) {
  //                   const formattedDate = moment(date)
  //                     .utc()
  //                     .format('YYYY-MM-DDTHH:mm:ss[Z]');
  //                   updateFollowupField(activeItemId, 'EndDate', formattedDate);
  //                 }
  //               }}
  //             />
  //           )}
  //         </View>

  //         {/* Follow-up Type */}
  //         <View style={styles.infoContainer}>
  //           <Text
  //             style={[
  //               styles.subLabel,
  //               {paddingHorizontal: '4%', paddingTop: '3%'},
  //             ]}>
  //             Follow-up type:
  //           </Text>
  //           <Text
  //             style={[
  //               styles.subValue,
  //               {
  //                 color: 'rgba(21, 68, 137, 1)',
  //                 backgroundColor: '#f0f0f0',
  //                 elevation: 2,
  //                 paddingHorizontal: '3%',
  //                 top: '2%',
  //                 borderRadius: 5,
  //               },
  //             ]}>
  //             {followUpType}
  //           </Text>
  //         </View>
  //       </View>

  //       {/* Description */}
  //       <View style={{}}>
  //         <Text style={styles.quickNote}>Description</Text>
  //         <TextInput
  //           value={editingId === item.id ? tempDescription : item.Description}
  //           editable
  //           multiline
  //           onFocus={() => {
  //             setEditingId(item.id);
  //             setTempDescription(item.Description);
  //           }}
  //           onChangeText={text => setTempDescription(text)}
  //           onBlur={() => {
  //             setEditingId(null);
  //             if (tempDescription !== item.Description) {
  //               updateFollowupField(item.id, 'Description', tempDescription);
  //             }
  //           }}
  //           style={styles.description}
  //           placeholder="Enter description"
  //         />
  //       </View>
  //     </View>
  //   );
  // };

  const renderFollowUpCard = ({item, index}) => {
    const name = item.AD_User_ID?.identifier || '-';
    // const date = moment(item.StartDate).format('DD MM YYYY');
    const date = item.StartDate
      ? moment(item.StartDate).format('DD MMM YYYY')
      : '-';
    const followUpCode = item.ContactActivityType?.identifier;
    const followUpType = categoryMap[followUpCode] || followUpCode || '-';
    const phone = item.Phone || '+88 01234567890'; // agar API me ho
    const status = item.IsComplete ? 'complete' : 'InComplete';
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

          {/* <View style={styles.phonePill}>
            <MaterialIcons name="call" size={14} color="#fff" />
            <Text style={styles.phoneText}>{phone}</Text>
          </View> */}
        </View>

        {/* ROW 2 */}
        <View style={styles.rowBetween}>
          <View style={{flex:1, width:'48%'}}> 
          
            <Text style={styles.smallLabel}>Date</Text>
            {/* <Text style={styles.boldText}>{date}</Text> */}
            <TouchableOpacity
              onPress={() => {
                setActiveItemId(item.id);
                setSelectedDate(new Date(item.EndDate));
                setShowDatePicker(true);
              }}>
              <View style={styles.infoContainer}>
                {/* <Text style={[styles.subLabel, {paddingHorizontal: '4%'}]}>
                  Scheduled Time:
                </Text> */}
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

          <View style={{flex:1, width:'48%', justifyContent:'flex-end',alignItems:'flex-end'}}> 
            <Text style={styles.smallLabel}>Person</Text>
            <Text style={styles.boldText}>{name}</Text>
          </View>
        </View>

        {/* ROW 3 */}
        <View style={styles.rowBetween}>
          <View style={{flex:1, width:'48%'}}>
            <Text style={styles.smallLabel}>Organization</Text>
            <Text style={styles.companyText}>{organization}</Text>
          </View>

          <View style={{flex:1, width:'48%', justifyContent:'flex-end',alignItems:'flex-end'}}> 
          
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

        {/* DESCRIPTION (Address ki jagah) */}
        <View style={{marginTop: 8}}>
          <Text style={styles.smallLabel}>Description</Text>
          {/* <Text style={styles.descriptionText}>
            {item.Description || 'No description'}
          </Text> */}
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

  return (
    <View style={styles.container}>
      {/* <SearchHeader /> */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#000" />
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Follow-ups</Text>

      {/* FILTER BUTTONS */}
      {/* <View style={styles.filterRow}>
        <FilterBtn
          title="All"
          active={activeFilter === 'all'}
          onPress={() => setActiveFilter('all')}
        />
        <FilterBtn
          title="Today"
          active={activeFilter === 'today'}
          onPress={() => setActiveFilter('today')}
        />
        <FilterBtn
          title="Future"
          active={activeFilter === 'future'}
          onPress={() => setActiveFilter('future')}
        />
        <FilterBtn
          title="Missed"
          active={activeFilter === 'missed'}
          onPress={() => setActiveFilter('missed')}
        />
      </View> */}
      {/* ROW 1 – TIME FILTER */}
      <View style={styles.filterRow}>
        {['all', 'today', 'future', 'missed'].map(item => (
          <FilterBtn
            key={item}
            title={item.toUpperCase()}
            active={activeFilter === item}
            // onPress={() => setActiveFilter(item)}
            onPress={() => {
              setActiveFilter(item);
              setCategoryFilter('all');
            }}
          />
        ))}
      </View>

      {/* ROW 2 – SEARCH */}
      {/* <View style={styles.searchBox}>
        <TextInput
          placeholder="Search activities..."
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
          placeholderTextColor="#999"
          style={{color: '#555'}}
        />
      </View> */}
      {/* ROW 2 – SEARCH + DATE FILTER */}
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

      {/* ROW 3 – CATEGORY */}
      {/* ROW 3 – CATEGORY (HORIZONTAL SCROLL) */}
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
            variant="outline" // 🔥 DIFFERENT STYLE ONLY FOR ROW 3
          />
        ))}
      </ScrollView>

      <FlatList
        data={filteredFollowups}
        renderItem={renderFollowUpCard}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

/* ================= FILTER BUTTON ================= */

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

/* ================= STYLES ================= */

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
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 6,
  },
  label: {
    fontFamily: 'K2D-Medium',
    fontSize: 12,
    color: '#000',
    marginBottom: 2,
  },
  value: {fontFamily: 'K2D-Regular', color: '#7d7d7d', fontSize: 13},
  status: {fontFamily: 'K2D-Regular', fontSize: 15, color: '#999'},
  infoContainer: {flexDirection: 'row', alignItems: 'center', left: '8%'},
  subLabel: {color: '#000', fontFamily: 'K2D-Medium', fontSize: 13},
  subValue: {color: '#7d7d7d', fontFamily: 'K2D-Regular', fontSize: 11},
  quickNote: {
    color: '#000',
    fontFamily: 'K2D-Medium',
    fontSize: 13,
    marginTop: 10,
  },
  description: {
    borderBottomWidth: 0.5,
    borderColor: '#aaa',
    // marginTop: 4,
    paddingVertical: 3,
    color: '#000',
    fontFamily: 'K2D-Regular',
    fontSize: 11,
    paddingHorizontal: '2%',
  },
  verticalLineContainer: {
    position: 'absolute',
    left: 2,
    top: '12%',
    height: 35,
    alignItems: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(21, 69, 140, 1)',
  },
  verticalDottedLine: {
    width: 1,
    height: 30,
    borderLeftWidth: 1,
    borderStyle: 'dotted',
    borderColor: 'rgba(21, 69, 140, 1)',
  },
  searchBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginVertical: 10,
  },
  horizontalFilterRow: {
    // flexDirection: 'row',
    // paddingVertical: 6,
    height: 40,
    marginBottom: '20%',
    // zIndex:999,
    // gap: 5,
    alignItems: 'center',
    justifyContent: 'center',
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

  phonePill: {
    flexDirection: 'row',
    backgroundColor: '#6a5acd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignItems: 'center',
  },

  phoneText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 12,
    fontFamily: 'K2D-Medium',
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
    // alignSelf: 'center',
  },

  statusText: {
    fontSize: 11,
    color: '#2e7d32',
    fontFamily: 'K2D-SemiBold',
  },

  descriptionText: {
    fontSize: 12,
    color: '#444',
    fontFamily: 'K2D-Regular',
    marginTop: 2,
  },
});

export default AllFollowUp;
