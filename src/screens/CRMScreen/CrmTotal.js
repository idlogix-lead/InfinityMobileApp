import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Portal, Modal, Provider} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomHeader from '../../components/CustomHeader';
import CRMCard from '../../components/CRMCard/CRMCard';
import Filter from '../../components/Filter';
import moment from 'moment';
import {Picker} from '@react-native-picker/picker';

const CrmTotal = ({navigation, route}) => {
  const {totalLeads, activity} = route.params;
  // const {activity} = route.params;
  const [filteredData, setFilteredData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [selectStatus, setSelectStatus] = useState('select');

  //
  // const activityLength = activity.length;
  //today lead count

  const todayLeadsCount = totalLeads
    ? totalLeads.filter(lead => moment(lead.Created).isSame(moment(), 'day'))
        .length
    : 0;

  // this month lead count
  const monthLeadsCount = totalLeads
    ? totalLeads.filter(lead => moment(lead.Created).isSame(moment(), 'month'))
        .length
    : 0;

  useEffect(() => {
    setFilteredData(totalLeads);
  }, [totalLeads]);
  console.log('leads', totalLeads);

  useEffect(() => {
    setActivityData(activity);
  }, [activity]);
  console.log('activities', activity);

  const handleMail = email => {
    if (!email) {
      Alert.alert('Error', 'Email address not found.');
      return;
    }
    Linking.openURL(`mailto:${email}`);
  };

  const handlePhone = phone => {
    if (!phone) {
      Alert.alert('Error', 'Phone number not found.');
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = phone => {
    if (!phone) {
      Alert.alert('Error', 'WhatsApp number not found.');
      return;
    }
    let formattedPhone = phone.trim();
    formattedPhone = formattedPhone.replace(/[^0-9]/g, '');

    if (formattedPhone.startsWith('92')) {
      // Correct format
    } else if (formattedPhone.startsWith('0')) {
      formattedPhone = '92' + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('0092')) {
      formattedPhone = formattedPhone.replace('0092', '92');
    } else {
      Alert.alert('Error', 'Invalid phone number format.');
      return;
    }
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}`;
    Linking.openURL(whatsappUrl).catch(() =>
      Alert.alert('Error', 'Cannot open WhatsApp.'),
    );
  };

  const handleFromDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || fromDate;
    setShowFromDatePicker(Platform.OS === 'ios');
    setFromDate(currentDate);
  };

  const handleToDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || toDate;
    setShowToDatePicker(Platform.OS === 'ios');
    setToDate(currentDate);
  };

  // const applyDateFilter = () => {
  //   const filtered = totalLeads.filter(item => {
  //     const itemDate = new Date(item.Created || item.Date || item.createdAt);

  // Reset time parts to compare only dates
  // const from = new Date(fromDate);
  // from.setHours(0, 0, 0, 0);

  //     const to = new Date(toDate);
  //     to.setHours(23, 59, 59, 999);

  //     return itemDate >= from && itemDate <= to;
  //   });

  //   setFilteredData(filtered);
  //   setFilterVisible(false);
  // };

  // const applyDateFilter = () => {
  //   const filtered = totalLeads.filter(item => {
  //     const itemDate = new Date(item.Created || item.Date || item.createdAt);

  //     // STATUS MATCH
  //     let matchStatus = true;
  //     if (selectStatus !== 'select') {
  //       matchStatus =
  //         item?.LeadStatus?.identifier?.toLowerCase() ===
  //         selectStatus.toLowerCase();
  //     }

  //     // DATE MATCH
  //     const from = new Date(fromDate);
  //     from.setHours(0, 0, 0, 0);

  //     const to = new Date(toDate);
  //     to.setHours(23, 59, 59, 999);

  //     const matchDate = itemDate >= from && itemDate <= to;

  //     return matchStatus && matchDate;
  //   });

  //   setFilteredData(filtered);
  //   setFilterVisible(false);
  // };
  const applyDateFilter = () => {
    // FIRST: If only status is selected and date not changed → status-only filter
    const isDefaultFrom = fromDate.toDateString() === new Date().toDateString();
    const isDefaultTo = toDate.toDateString() === new Date().toDateString();

    // Only STATUS filter (no date)
    if (selectStatus !== 'select' && isDefaultFrom && isDefaultTo) {
      const statusFiltered = totalLeads.filter(item => {
        return (
          item?.LeadStatus?.identifier?.toLowerCase() ===
          selectStatus.toLowerCase()
        );
      });

      setFilteredData(statusFiltered);
      setFilterVisible(false);
      return; // IMPORTANT — stop here
    }

    // OTHERWISE: Apply both DATE + STATUS normally
    const filtered = totalLeads.filter(item => {
      const itemDate = new Date(item.Created || item.Date || item.createdAt);

      // STATUS MATCH
      let matchStatus = true;
      if (selectStatus !== 'select') {
        matchStatus =
          item?.LeadStatus?.identifier?.toLowerCase() ===
          selectStatus.toLowerCase();
      }

      // DATE MATCH
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);

      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);

      const matchDate = itemDate >= from && itemDate <= to;

      return matchStatus && matchDate;
    });

    setFilteredData(filtered);
    setFilterVisible(false);
  };

  // const activityListData = activity.filter(
  //   item => totalLeads.item?.AD_User_ID?.id === activity.item?.AD_User_ID?.id,
  // );

  // const activityLength = activityListData.length;

  // console.log('activityData', activityListData, activityLength);

  // const activityListData = activity.filter(actItem =>
  //   totalLeads.some(
  //     leadItem => leadItem?.AD_User_ID?.id === actItem?.AD_User_ID?.id,
  //   ),
  // );

  // const activityLength = activityListData.length;

  // console.log('activityData', activityListData, activityLength);

  return (
    <Provider>
      {filterVisible && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setFilterVisible(false)}
        />
      )}
      <View style={{flex: 1}}>
        {/* <CustomHeader title="Total Leads"/> */}
        <CustomHeader
          title="Total Leads"
          RightIcon="filter"
          RightPress={() => setFilterVisible(true)}
        />

        <View style={styles.main}>
          {/* Filter Button */}
          {/* <View style={{flexDirection:'row',justifyContent:'space-between'}}>

             <View
            style={{
              backgroundColor: '#ccc',
              height: 100,
              marginTop: 10,
              marginHorizontal: 10,
              flexDirection: 'row',
            }}>
            <View style={{marginLeft: 20, marginTop: 20}}>
              <Text style={{fontSize: 18, color: '#000'}}>Today Leads</Text>
              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: 23,
                  color: '#000',
                  textAlign: 'center',
                }}>
                5
              </Text>
            </View>
            <View style={{marginLeft: 20, marginTop: 20}}>
              <Text style={{fontSize: 18, color: '#000'}}>This Month</Text>
              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: 23,
                  color: '#000',
                  textAlign: 'center',
                }}>
                42
              </Text>
            </View>
            <View style={{marginLeft: 20, marginTop: 20}}>
              <Text style={{fontSize: 18, color: '#000'}}>Conversion</Text>
              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: 23,
                  color: '#000',
                  textAlign: 'center',
                }}>
                18%
              </Text>
            </View>
          </View>

            <TouchableOpacity
            style={{alignSelf: 'flex-end', top: 15, right: 15,paddingVertical:10}}
            onPress={() => setFilterVisible(true)}>
            <FontAwesome name="filter" size={25} color={'black'} />
          </TouchableOpacity>
          </View> */}
          {/* <TouchableOpacity
            style={{alignSelf: 'flex-end', top: 15, right: 15,paddingVertical:10}}
            onPress={() => setFilterVisible(true)}>
            <FontAwesome name="filter" size={25} color={'black'} />
          </TouchableOpacity> */}

          {/* <TouchableOpacity
  style={{alignSelf: 'flex-end', top: 15, right: 15,paddingVertical:10}}
  onPress={() => setFilterVisible(true)}>
  <FontAwesome name="filter" size={25} color={'black'} />
</TouchableOpacity> */}

          {/* <TouchableOpacity
            onPress={() => navigation.navigate('AddLeads')}
            style={styles.addButton}>
            <Text>
              <Ionicons name="add-outline" size={25} color={'black'} />
            </Text>
            <Text style={{color: '#000', marginLeft: 8, margin: 2}}>
              Add Lead
            </Text>
          </TouchableOpacity> */}

          {/* j */}
          <View
            style={{
              backgroundColor: '#F5F5F5',
              height: 110,
              marginTop: '5%',
              marginHorizontal: 22,
              flexDirection: 'row',
              elevation: 10,
              shadowColor: '#000',
              borderRadius: 3,
              borderWidth: 0.5,
              borderColor: 'rgba(0, 0, 0, 0.10)',
            }}>
            <View style={{marginLeft: '10%', marginTop: 20}}>
              <View
                style={{alignItems: 'center', height: 20, marginBottom: '7%'}}>
                <MaterialIcons
                  name="article"
                  size={20}
                  color="rgba(38, 189, 206, 1)"
                />
              </View>
              <Text style={styles.filterTxt}>Today Leads</Text>
              <Text style={styles.filterTxt}>{todayLeadsCount}</Text>
            </View>
            <View style={{marginLeft: 20, marginTop: 20}}>
              <View style={{alignItems: 'center', marginBottom: '7%'}}>
                <MaterialIcons
                  name="calendar-month"
                  size={20}
                  color={'rgba(234, 71, 71, 1)'}
                />
              </View>
              <Text style={styles.filterTxt}>This Month</Text>
              <Text style={styles.filterTxt}>{monthLeadsCount}</Text>
            </View>
            <View style={{marginLeft: 20, marginTop: 20}}>
              <View
                style={{alignItems: 'center', height: 20, marginBottom: '7%'}}>
                <MaterialCommunityIcons
                  name="file-account"
                  size={20}
                  color={'rgba(231, 205, 76, 1)'}
                />
              </View>
              <Text style={styles.filterTxt}>All Leads</Text>
              <Text style={styles.filterTxt}>{totalLeads.length}</Text>
            </View>
          </View>

          {/* Card */}
          {/* <FlatList
            data={filteredData}
            
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <CRMCard
                header={'KM-UJHUGIGF'}
                name={item?.Name}
                id={item?.id}
                count={activityLength}
                Description={item?.Description}
                status={item?.LeadStatus?.identifier}
                email={item?.EMail}
                mail={() => handleMail(item?.EMail)}
                phone={() => handlePhone(item?.Phone)}
                whatsapp={() => handleWhatsApp(item?.Phone)}
                dateText={item?.Created}
                actOnPress={() => {
                  navigation.navigate('ActivityList', {
                    data: item,
                    act: item,
                  });
                }}
                onPress={() => {
                  navigation.navigate('LeadsDetails', {data: item});
                }}
              />
            )}
            // ager data show nhi ho
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No leads found for the selected date range
                </Text>
              </View>
            }
          /> */}
          <FlatList
            data={filteredData}
            act={activityData}
            // act={activity}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => {
              // activity filter
              const userActivity = activity.filter(
                act => act?.AD_User_ID?.id === item?.id,
              );
              // Sort by Created date (assuming it's act.Created)
              const lastActivity = userActivity.sort(
                (a, b) => new Date(b.Created) - new Date(a.Created),
              )[0];

              // Now display the type
              const lastActivityType =
                lastActivity?.ContactActivityType?.identifier || 'N/A';
                // total length
              const activityCount = userActivity.length;

              return (
                <CRMCard
                  // header={'KM-UJHUGIGF'}
                  header={item.AD_Org_ID.identifier}
                  name={item?.Name}
                  id={item?.id}
                  interactionType={lastActivityType}
                  count={activityCount}
                  Description={item?.Description}
                  status={item?.LeadStatus?.identifier}
                  email={item?.EMail}
                  cellNo={item?.Phone}
                  mail={() => handleMail(item?.EMail)}
                  phone={() => handlePhone(item?.Phone)}
                  whatsapp={() => handleWhatsApp(item?.Phone)}
                  dateText={item?.Created}
                  actOnPress={() => {
                    navigation.navigate('ActivityList', {
                      data: item,
                      act: item,
                    });
                  }}
                  onPress={() => {
                    navigation.navigate('LeadsDetails', {data: item});
                  }}
                />
              );
            }}
          />
        </View>
        {/* fillter Drawer */}
        <Portal>
          <Modal
            visible={filterVisible}
            onDismiss={() => setFilterVisible(false)}
            contentContainerStyle={styles.modalContainer}>
            <View style={{flex: 1}}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setFilterVisible(false)}>
                <FontAwesome name="times" size={20} color="#fff" />
              </TouchableOpacity>
              <View style={styles.drawerTop}>
                <Text
                  style={{fontSize: 30, color: 'white', textAlign: 'center'}}>
                  Filter
                </Text>
              </View>

              {/* statusPicker */}
              <Text style={styles.sectionTitle}>Select Status</Text>
              <View style={styles.pickerWrap}>
                <Picker
                  selectedValue={selectStatus}
                  onValueChange={value => {
                    setSelectStatus(value);
                  }}
                  style={styles.picker}
                  mode="dropdown"
                  accessibilityLabel="Status picker">
                  <Picker.Item label="-- choose --" value="select" />
                  <Picker.Item label="New" value="new" />
                  <Picker.Item label="Working" value="working" />
                  <Picker.Item label="Converted" value="converted" />
                  {/* <Picker.Item label="Expiry" value="expiry" /> */}
                </Picker>
              </View>

              {/* From Date */}

              {/* <StatusPicker /> */}
              <Text style={styles.sectionTitle}>From Date *</Text>
              <View style={styles.dateInput}>
                <View>
                  <Text style={{color: 'black'}}>
                    {fromDate.toDateString()}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowFromDatePicker(true)}>
                  <EvilIcons name="calendar" size={25} color={'black'} />
                </TouchableOpacity>
              </View>
              {showFromDatePicker && (
                <DateTimePicker
                  value={fromDate}
                  mode="date"
                  display="default"
                  onChange={handleFromDateChange}
                />
              )}

              {/* To Date */}
              <Text style={styles.sectionTitle}>To Date *</Text>
              <View style={styles.dateInput}>
                <View>
                  <Text style={{color: 'black'}}>{toDate.toDateString()}</Text>
                </View>
                <TouchableOpacity onPress={() => setShowToDatePicker(true)}>
                  <EvilIcons name="calendar" size={25} color={'black'} />
                </TouchableOpacity>
              </View>
              {showToDatePicker && (
                <DateTimePicker
                  value={toDate}
                  mode="date"
                  display="default"
                  onChange={handleToDateChange}
                />
              )}

              {/* Apply Button */}
              <TouchableOpacity
                style={styles.applyButton}
                onPress={applyDateFilter}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>

              {/* Reset Button */}
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  const today = new Date();
                  setFromDate(today);
                  setToDate(today);
                  setFilteredData(totalLeads);
                  setFilterVisible(false);
                }}>
                <Text style={styles.resetButtonText}>Reset Date</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </Portal>

        {/* {isLoading ? <Loader /> : null} */}
      </View>
      <TouchableOpacity
        onPress={() => navigation.navigate('AddLeads')}
        style={{
          backgroundColor: '#2F4FE3',

          height: 50,
          width: 50,
          borderRadius: 25,
          position: 'absolute', // 👈 fixed karne ke liye
          bottom: 20, // screen ke bottom se distance
          right: 20, // ya left: 20 kar sakte ho
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 5, // Android shadow
          shadowColor: '#000', // iOS shadow
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.3,
          shadowRadius: 3,
        }}>
        <Text style={{color: '#fff', fontFamily: 'K2D-Bold', fontSize: 20}}>
          +
        </Text>
      </TouchableOpacity>
    </Provider>
  );
};

export default CrmTotal;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    marginTop: -22,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 0,
    marginLeft: '20%',
    height: '100%',
  },
  drawerTop: {
    width: '100%',
    height: '10%',
    backgroundColor: '#2F4FE3',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 15,
    color: '#000',
    marginLeft: 15,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '95%',
    alignSelf: 'center',
  },
  applyButton: {
    backgroundColor: '#2F4FE3',
    padding: 15,
    borderRadius: 5,
    margin: 20,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 5,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  resetButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: 'lightgreen',
    height: '5%',
    width: '80%',
    // marginTop: 17,
    alignSelf: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingTop: 4,
    borderRadius: 7,
  },
  filterTxt: {
    fontFamily: 'K2D-Medium',
    fontSize: 15,
    color: '#000',
    textAlign: 'center',
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
    color: 'gray',
  },
  pickerWrap: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    width: '95%',
    marginLeft: '2%',
    justifyContent: 'center',
    paddingHorizontal: '2%',
    marginTop: '2%',
  },

  picker: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'K2D-Medium',
    width: '100%',
  },
});
