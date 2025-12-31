import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import {Portal, Modal} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import EvilIcons from 'react-native-vector-icons/EvilIcons';

const Filter = ({
  visible,
  onClose,
  fromDate,
  toDate,
  setFromDate,
  setToDate,
  applyFilter,
  resetFilter,
  showFromDatePicker,
  setShowFromDatePicker,
  showToDatePicker,
  setShowToDatePicker,
}) => {
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

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onClose} contentContainerStyle={styles.modalContainer}>
        <View style={{}}>
          
          {/* Close Btn */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <FontAwesome name="times" size={20} color="black" />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.drawerTop}>
            <Text style={styles.headerTitle}>Filter</Text>
          </View>

          {/* From Date */}
          <Text style={styles.sectionTitle}>From Date *</Text>
          <View style={styles.dateInput}>
            <Text style={styles.dateText}>{fromDate?.toDateString?.() || 'Select Date'}</Text>

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
            <Text style={styles.dateText}>{toDate?.toDateString?.() || 'Select Date'}</Text>

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
          <TouchableOpacity style={styles.applyButton} onPress={applyFilter}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>

          {/* Reset Button */}
          <TouchableOpacity style={styles.resetButton} onPress={resetFilter}>
            <Text style={styles.resetButtonText}>Reset Date</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
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
  headerTitle: {
    fontSize: 30,
    color: 'white',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
    zIndex: 1000,
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
  dateText: {
    color: 'black',
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
});

export default Filter;
