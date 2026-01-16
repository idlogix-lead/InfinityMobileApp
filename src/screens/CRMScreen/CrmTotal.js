// screens/CRM/CrmTotal.js
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Portal } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import GenericLead from './GenericLead';
import CustomHeader from '../../components/CustomHeader';

const CrmTotal = ({ route, navigation }) => {
  const { leads: totalLeads = [] } = route.params || {};
  const [filterVisible, setFilterVisible] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [selectStatus, setSelectStatus] = useState('select');
  const [filteredLeads, setFilteredLeads] = useState(totalLeads);
  
  // Apply filter function
  const applyFilter = () => {
    let filtered = [...totalLeads];
    
    // Apply status filter
    if (selectStatus !== 'select') {
      filtered = filtered.filter(item => 
        item?.LeadStatus?.identifier?.toLowerCase() === selectStatus.toLowerCase()
      );
    }
    
    // Apply date filter if dates are not today
    const isDefaultFrom = fromDate.toDateString() === new Date().toDateString();
    const isDefaultTo = toDate.toDateString() === new Date().toDateString();
    
    if (!isDefaultFrom || !isDefaultTo) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.Created);
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        
        return itemDate >= from && itemDate <= to;
      });
    }
    
    setFilteredLeads(filtered);
    setFilterVisible(false);
  };
  
  // Reset filter
  const resetFilter = () => {
    setFromDate(new Date());
    setToDate(new Date());
    setSelectStatus('select');
    setFilteredLeads(totalLeads);
    setFilterVisible(false);
  };
  
  // Create modified route with filtered leads
  const modifiedRoute = {
    ...route,
    params: {
      ...route.params,
      leads: filteredLeads,
    },
  };
  
  return (
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
                    <Picker.Item label="New" value="new" />
                    <Picker.Item label="Working" value="working" />
                    <Picker.Item label="Converted" value="converted" />
                    <Picker.Item label="Expired" value="expired" />
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
      <View style={{ flex: 1 }}>
        <CustomHeader
          title="Total Leads"
          RightIcon="filter"
          RightPress={() => setFilterVisible(true)}
        />
        
        {/* Modified GenericLead with filtered data */}
        <GenericLead
          navigation={navigation}
          route={modifiedRoute}
          screenTitle="Total Leads"
        />
      </View>
    </>
  );
};

const styles = {
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
};

export default CrmTotal;