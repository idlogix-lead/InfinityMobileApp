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
import {Portal, Modal, Provider} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomHeader from '../../components/CustomHeader';
import CRMCard from '../../components/CRMCard/CRMCard';

const CrmTotal = ({navigation, route}) => {
  const {totalLeads} = route.params;
  const [filteredData, setFilteredData] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  useEffect(() => {
    setFilteredData(totalLeads);
  }, [totalLeads]);

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

  const applyDateFilter = () => {
    const filtered = totalLeads.filter(item => {
      const itemDate = new Date(item.Created || item.Date || item.createdAt);

      // Reset time parts to compare only dates
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);

      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);

      return itemDate >= from && itemDate <= to;
    });

    setFilteredData(filtered);
    setFilterVisible(false);
  };

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
        <CustomHeader title={'Total Leads'} />
        <View style={styles.main}>
          {/* Filter Button */}
          <TouchableOpacity
            style={{alignSelf: 'flex-end', top: 15, right: 15}}
            onPress={() => setFilterVisible(true)}>
            <FontAwesome name="filter" size={25} color={'black'} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('AddLeads')}
            style={styles.addButton}>
            <Text>
              <Ionicons name="add-outline" size={25} color={'black'} />
            </Text>
            <Text style={{color: '#000', marginLeft: 8, margin: 2}}>
              Add Lead
            </Text>
          </TouchableOpacity>

          {/* j */}
          <View
            style={{
              backgroundColor: '#ccc',
              height: 100,
              marginTop: 10,
              marginHorizontal: 10,
              flexDirection: 'row',
            }}>
            <View>
              <Text>Today Leads</Text>
              <Text>5</Text>
            </View>
          </View>

          {/* Card */}
          <FlatList
            data={filteredData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <CRMCard
                header={'KM-UJHUGIGF'}
                name={item?.Name}
                // id={item?.id}
                email={item?.EMail}
                mail={() => handleMail(item?.EMail)}
                phone={() => handlePhone(item?.Phone)}
                whatsapp={() => handleWhatsApp(item?.Phone)}
                dateText={item?.Created}
                actOnPress={() => {
                  navigation.navigate('ActivityList', {
                    data: item,
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
                <FontAwesome name="times" size={20} color="black" />
              </TouchableOpacity>
              <View style={styles.drawerTop}>
                <Text
                  style={{fontSize: 30, color: 'white', textAlign: 'center'}}>
                  Filter
                </Text>
              </View>

              {/* From Date */}
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
    backgroundColor: '#82CED9',
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
    backgroundColor: '#82CED9',
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
});
