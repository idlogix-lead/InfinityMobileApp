// screens/CRM/GenericLeadScreen.js
import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { Provider, Portal } from 'react-native-paper';
import CustomHeader from '../../components/CustomHeader';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import CRMCard from '../../components/CRMCard/CRMCard';
import { useFollowups } from '../../hooks/CRMhooks/useCRM';
import { useLeadActions } from '../../hooks/CRMhooks/useLeadActions';
import moment from 'moment';

const GenericLead = ({ 
  navigation, 
  route, 
  screenTitle = "Leads",
  leadFilter,
  statsConfig,
  showFilterButton = true // Add this prop to control filter visibility
}) => {
  const [filterVisible, setFilterVisible] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [selectStatus, setSelectStatus] = useState('select');
  const [filteredLeads, setFilteredLeads] = useState([]);
  
  const { data: followups = [] } = useFollowups();
  const { handleMail, handlePhone, handleWhatsApp } = useLeadActions();
  
  // Get leads from route params
  const originalLeads = route.params?.leads || [];
  const activities = route.params?.activities || followups;
  
  // Initialize filteredLeads with original leads on first render
  React.useEffect(() => {
    if (originalLeads.length > 0 && filteredLeads.length === 0) {
      setFilteredLeads(originalLeads);
    }
  }, [originalLeads]);
  
  // Apply filter function
  const applyFilter = () => {
    let filtered = [...originalLeads];
    
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
    setFilteredLeads(originalLeads);
    setFilterVisible(false);
  };
  
  // Calculate stats based on filtered leads
  const stats = useMemo(() => {
    const leadsToUse = filteredLeads.length > 0 ? filteredLeads : originalLeads;
    
    if (!leadsToUse.length) {
      return {
        todayLeads: 0,
        monthLeads: 0,
        totalLeads: 0,
      };
    }
    
    const todayLeads = leadsToUse.filter(lead => 
      moment(lead.Created).isSame(moment(), 'day')
    ).length;
    
    const monthLeads = leadsToUse.filter(lead => 
      moment(lead.Created).isSame(moment(), 'month')
    ).length;
    
    return {
      todayLeads,
      monthLeads,
      totalLeads: leadsToUse.length,
    };
  }, [filteredLeads, originalLeads]);
  
  const renderLeadCard = (item) => {
    const userActivity = activities.filter(
      act => act?.AD_User_ID?.id === item?.id
    );
    
    const lastActivity = [...userActivity].sort(
      (a, b) => new Date(b.Created) - new Date(a.Created)
    )[0];
    
    const lastActivityType = lastActivity?.ContactActivityType?.identifier || 'N/A';
    const activityCount = userActivity.length;
    
    return (
      <View style={{ marginHorizontal: 10, marginVertical: 5 }}>
        <CRMCard
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
            navigation.navigate('LeadsDetails', { data: item });
          }}
        />
      </View>
    );
  };
  
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
        
        {/* Custom Header with Filter Button */}
        <CustomHeader
          title={screenTitle}
          RightIcon={showFilterButton ? "filter" : undefined}
          RightPress={showFilterButton ? () => setFilterVisible(true) : undefined}
        />
        
        {/* Main Content */}
        <View style={{ flex: 1 }}>
          <View style={styles.main}>
            {/* Stats Section */}
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
            
            {/* Leads List */}
            <FlatList
              data={filteredLeads.length > 0 ? filteredLeads : originalLeads}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              renderItem={({ item }) => renderLeadCard(item)}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No leads found
                  </Text>
                </View>
              }
              contentContainerStyle={styles.listContent}
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
  statsContainer: {
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'K2D-Medium',
  },
  listContent: {
    paddingBottom: 20,
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