import React, {useState, useMemo, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Calendar} from 'react-native-calendars';
// import DatePicker from 'react-native-date-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useQuery, useMutation, useQueryClient} from 'react-query';
import ReqHeader from '../../components/ReqHeader';
import {
  fetchRequestTyp,
  fetchRequestCat,
  fetchRequestGrp,
  fetchRequestpro,
  fetchUsers,
  createTask,
} from '../../services/api/requests.api';
import {useAuthStore} from '../../store/authStore';
import moment from 'moment';

// import {Portal} from 'react-native-paper';

const PRIORITIES = [
  {id: '1', label: 'Urgent', color: '#E74C3C'},
  {id: '3', label: 'High', color: '#E67E22'},
  {id: '5', label: 'Medium', color: '#3498DB'},
  {id: '7', label: 'Low', color: '#2ECC71'},
  {id: '4', label: 'Minor', color: '#95A5A6'},
];

const projectColor = id => {
  const colors = ['#6C5CE7', '#00B894', '#0984E3', '#D63031', '#E84393'];
  return colors[id % colors.length];
};

const AddTask = ({navigation, isModal = false, onClose, visible}) => {
  const queryClient = useQueryClient();
  const {userId, userName} = useAuthStore();

  // ===================== STATE =====================
  const [summary, setSummary] = useState('');
  const [selectedRequestType, setSelectedRequestType] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [priority, setPriority] = useState(PRIORITIES[1]);

  const [selectedProject, setSelectedProject] = useState(null);
  const [projectSearch, setProjectSearch] = useState('');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  const [selectedSalesRep, setSelectedSalesRep] = useState(null);
  const [salesRepSearch, setSalesRepSearch] = useState('');
  const [showSalesRepDropdown, setShowSalesRepDropdown] = useState(false);

  // 🔥 Stable date states
  // const [startDate, setStartDate] = useState(() => new Date());
  // const [startTime, setStartTime] = useState(() => new Date());
  // const [endDate, setEndDate] = useState(() => new Date());

  // const [pickerMode, setPickerMode] = useState(null);
  // const [pickerKey, setPickerKey] = useState(0); // force rerender fix

  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [showRequestTypeDropdown, setShowRequestTypeDropdown] = useState(false);

  // Dates as ISO string (stable for API + Calendar)
  const [startDate, setStartDate] = useState(moment().format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));
  const [startTime, setStartTime] = useState(new Date());

  const [calendarType, setCalendarType] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [tempDate, setTempDate] = useState(null);

  // More menu modal
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Repeat
  const [repeatOption, setRepeatOption] = useState('None');
  const [showRepeatMenu, setShowRepeatMenu] = useState(false);
  const [availableMoreOptions, setAvailableMoreOptions] = useState([
    'Start Time',
    'Repeat',
  ]);

  const [showStartTime, setShowStartTime] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);

  // Time picker modal
  const [openTimePicker, setOpenTimePicker] = useState(false);

  // ===================== FETCH DROPDOWNS =====================
  const {data: requestTypes = []} = useQuery(['requestTypes'], fetchRequestTyp);
  const {data: categories = []} = useQuery(['categories'], fetchRequestCat);
  const {data: groups = []} = useQuery(['groups'], fetchRequestGrp);
  const {data: projects = []} = useQuery(['projects'], fetchRequestpro);
  const {data: salesUsers = []} = useQuery(['salesUsers'], fetchUsers);

  // ===================== DEFAULT SALES REP =====================
  useEffect(() => {
    if (!selectedSalesRep && userId && userName) {
      setSelectedSalesRep({
        id: Number(userId),
        Name: userName,
      });
    }
  }, [userId, userName]);
  useEffect(() => {
    if (showCalendar) {
      setTempDate(calendarType === 'start' ? startDate : endDate);
    }
  }, [showCalendar, calendarType]);
  const markedDates = useMemo(() => {
    return tempDate
      ? {
          [tempDate]: {selected: true, selectedColor: '#2F4FE3'},
        }
      : {};
  }, [tempDate]);

  // ===================== FILTERS =====================
  const filteredSalesUsers = useMemo(() => {
    let list = salesUsers.filter(u =>
      u.Name?.toLowerCase().includes(salesRepSearch.toLowerCase()),
    );
    if (selectedSalesRep) {
      list = [
        selectedSalesRep,
        ...list.filter(u => u.id !== selectedSalesRep.id),
      ];
    }
    return list;
  }, [salesUsers, salesRepSearch, selectedSalesRep]);

  const filteredProjects = useMemo(() => {
    let list = projects.filter(p =>
      p.Name?.toLowerCase().includes(projectSearch.toLowerCase()),
    );
    if (selectedProject) {
      list = [
        selectedProject,
        ...list.filter(p => p.id !== selectedProject.id),
      ];
    }
    return list;
  }, [projects, projectSearch, selectedProject]);

  // ===================== FORMAT DATE =====================
  // const formatDate = date =>
  //   new Date(date).toLocaleDateString('en-GB', {
  //     day: '2-digit',
  //     month: 'short',
  //     year: 'numeric',
  //   });

  const formatDate = date => (date ? moment(date).format('DD MMM YYYY') : '');

  // ===================== DATE TIME PICKER =====================
  // const handleDateChange = (event, selected) => {
  //   if (event.type === 'set' && selected) {
  //     if (pickerMode === 'startDate') setStartDate(selected);
  //     if (pickerMode === 'endDate') setEndDate(selected);
  //     if (pickerMode === 'startTime') setStartTime(selected);
  //   }
  //   // Only close picker if user pressed "OK" or "Cancel"
  //   if (event.type === 'dismissed' || event.type === 'set') {
  //     setPickerMode(null);
  //   }
  // };

  // ===================== RESET FORM =====================
  // const resetForm = () => {
  //   setSummary('');
  //   setSelectedRequestType(null);
  //   setSelectedCategory(null);
  //   setSelectedGroup(null);
  //   setPriority(PRIORITIES[1]);
  //   setSelectedProject(null);
  //   setProjectSearch('');
  //   setSelectedSalesRep(null);
  //   setSalesRepSearch('');
  //   setStartDate(new Date());
  //   setStartTime(new Date());
  //   setEndDate(new Date());
  // };
  const resetForm = () => {
    setSummary('');
    setSelectedRequestType(null);
    setSelectedCategory(null);
    setSelectedGroup(null);
    setPriority(PRIORITIES[1]);
    setSelectedProject(null);
    setProjectSearch('');
    setSelectedSalesRep(null);
    setSalesRepSearch('');

    setStartDate(moment().format('YYYY-MM-DD'));
    setEndDate(moment().format('YYYY-MM-DD'));
    setStartTime(new Date());
  };

  // ===================== MUTATION =====================
  const mutation = useMutation(createTask, {
    onSuccess: () => {
      queryClient.invalidateQueries(['myRequests']);
      Alert.alert('Success', 'Task created successfully');
      resetForm();
      if (isModal) onClose();
      else navigation.goBack();
    },
    onError: () => Alert.alert('Error', 'Task not created'),
  });

  const combineDateAndTime = (dateString, time) => {
    const d = moment(dateString);
    d.set({
      hour: time.getHours(),
      minute: time.getMinutes(),
      second: 0,
    });
    return d.toISOString();
  };

  const handleCreateTask = () => {
    if (
      !summary ||
      !selectedRequestType ||
      !selectedCategory ||
      !selectedGroup ||
      !selectedProject
    ) {
      Alert.alert('Error', 'Fill all fields');
      return;
    }

    const payload = {
      Summary: summary,
      SalesRep_ID: {id: selectedSalesRep.id, identifier: selectedSalesRep.Name},
      StartDate: moment(startDate).format('YYYY-MM-DD[T]00:00:00[Z]'),
      StartTime: combineDateAndTime(startDate, startTime),
      EndTime: moment(endDate).format('YYYY-MM-DD[T]HH:mm:ss[Z]'),
      R_RequestType_ID: {id: selectedRequestType.id},
      R_Category_ID: {id: selectedCategory.id},
      R_Group_ID: {id: selectedGroup.id},
      Priority: {id: priority.id},
      C_Project_ID: {id: selectedProject.id},
    };
    //     const payload = {
    //   Summary: summary,
    //   SalesRep_ID: {id: selectedSalesRep.id},
    //   StartDate: moment(startDate).startOf('day').toISOString(),
    //   StartTime: combineDateAndTime(startDate, startTime),
    //   EndTime: moment(endDate).endOf('day').toISOString(),

    //   R_RequestType_ID: {id: selectedRequestType.id},
    //   R_Category_ID: {id: selectedCategory.id},
    //   R_Group_ID: {id: selectedGroup.id},
    //   Priority: {id: priority.id},
    //   C_Project_ID: {id: selectedProject.id},
    // };

    mutation.mutate(payload);
  };

  // ==============================
  // RENDER
  // ==============================
  return (
    <>
      {/* <ReqHeader title={'Create Request'} /> */}
      {/* {!isModal && <ReqHeader title={'Create Request'} />} */}

      <View style={styles.sheetOverlay}>
        <View style={styles.sheetContainer}>
          <View style={styles.dragIndicator} />
          <ScrollView
            style={styles.container}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled">
            {/* PRIORITY */}
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
              }}>
              <MaterialIcons name="close" size={25} color={'#555'} />
            </TouchableOpacity>
            <View
              style={[
                styles.row,
                {
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: 15,
                  paddingTop: 10,
                },
              ]}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <MaterialIcons
                  name="check-circle-outline"
                  size={15}
                  color="#555"
                />
                <Text style={[styles.rowText, {color: '#555'}]}>Task</Text>
              </View>

              <View style={styles.priorityMini}>
                <TouchableOpacity
                  onPress={() => setShowPriorityDropdown(!showPriorityDropdown)}
                  style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                  <View
                    style={[
                      styles.priorityCircle,
                      {backgroundColor: priority.color},
                    ]}
                  />
                  <Text style={styles.priorityMiniLabel}>Priority</Text>
                </TouchableOpacity>

                {showPriorityDropdown && (
                  <View style={styles.priorityPopup}>
                    {PRIORITIES.map(p => {
                      const isSelected = priority.id === p.id;

                      return (
                        <TouchableOpacity
                          key={p.id}
                          onPress={() => {
                            setPriority(p);
                            setShowPriorityDropdown(false);
                          }}
                          style={styles.priorityOption}>
                          <Text
                            style={[styles.priorityLabel, {color: p.color}]}>
                            {p.label}
                          </Text>

                          {/* <View
                               style={[
                                 styles.priorityCircle,
                                 {backgroundColor: p.color},
                                 isSelected && styles.prioritySelectedCircle,
                               ]}
                             /> */}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>

            {/* TASK NAME */}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Task name..."
                value={summary}
                onChangeText={setSummary}
                placeholderTextColor="#999"
              />
            </View>

            {/* ASSIGNED SALES REP */}
            {/* Assigned User & Due Date */}
            <View style={[styles.row, {paddingHorizontal: '2%'}]}>
              {/* <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <MaterialIcons name="person-outline" size={24} color="#2F4FE3" />
                    <Text style={{marginLeft: 8, color: '#000'}}>{assignedUser}</Text>
                  </View> */}
              <View style={styles.dropdownRowPro}>
                <TouchableOpacity
                  style={styles.dropdownHeaderPro}
                  onPress={() =>
                    setShowSalesRepDropdown(!showSalesRepDropdown)
                  }>
                  <View style={styles.iconWrapper}>
                    <MaterialIcons
                      name="person-outline"
                      size={20}
                      color="#000"
                    />
                  </View>
                  <View>
                    <Text style={styles.rowLabel}>Assigned to</Text>
                    <Text style={styles.rowValue}>
                      {selectedSalesRep
                        ? selectedSalesRep.Name
                        : 'Select Sales Rep'}
                    </Text>
                  </View>
                </TouchableOpacity>
                {showSalesRepDropdown && (
                  <View style={styles.dropdownBoxPro}>
                    <TextInput
                      placeholder={
                        selectedSalesRep
                          ? selectedSalesRep.Name
                          : 'Search Sales Rep'
                      }
                      value={salesRepSearch}
                      onChangeText={setSalesRepSearch}
                      style={styles.searchInput}
                    />
                    <ScrollView
                      style={{maxHeight: 220}}
                      nestedScrollEnabled
                      keyboardShouldPersistTaps="handled">
                      {filteredSalesUsers.map(u => (
                        <TouchableOpacity
                          key={u.id}
                          style={styles.dropdownItemPro}
                          onPress={() => {
                            setSelectedSalesRep(u);
                            setShowSalesRepDropdown(false);
                          }}>
                          <Text style={styles.dropdownTextPro}>{u.Name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <TouchableOpacity
                // onPress={() => setShowEndDatePicker(true)}
                // onPress={() => setPickerMode('endDate')}
                onPress={() => {
                  setCalendarType('end');
                  setTempDate(endDate);
                  setShowCalendar(true);
                }}
                style={styles.row}>
                <View style={styles.iconWrapper}>
                  <MaterialIcons name="calendar-today" size={18} color="#000" />
                </View>
                <View style={{}}>
                  <Text style={styles.rowLabel}> Due Date</Text>
                  <Text style={styles.rowValue}>
                    {/* {endDate ? endDate.toDateString() : 'Please select'} */}
                    {formatDate(endDate)}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                if (event.type === 'set' && selectedDate)
                  setEndDate(selectedDate);
                setShowEndDatePicker(false);
              }}
            />
          )} */}
            </View>

            {/* PROJECT */}
            <View style={styles.dropdownRowPro}>
              <TouchableOpacity
                style={styles.dropdownHeaderPro}
                onPress={() => setShowProjectDropdown(!showProjectDropdown)}>
                {selectedProject && (
                  <View
                    style={[
                      styles.projectDot,
                      {backgroundColor: projectColor(selectedProject.id)},
                    ]}
                  />
                )}
                <View style={[styles.row, {justifyContent: 'flex-start'}]}>
                  <MaterialIcons name="add" size={25} color={'#444'} />
                  <Text style={[styles.rowText, {color: '#999'}]}>
                    {selectedProject ? selectedProject.Name : 'Select Project'}
                  </Text>
                </View>
              </TouchableOpacity>
              {showProjectDropdown && (
                <View style={styles.dropdownBoxPro}>
                  <TextInput
                    placeholder="Search project"
                    style={styles.searchInput}
                    value={projectSearch}
                    onChangeText={setProjectSearch}
                  />
                  <ScrollView
                    style={{maxHeight: 220}}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled">
                    {filteredProjects.map(p => (
                      <TouchableOpacity
                        key={p.id}
                        style={styles.dropdownItemPro}
                        onPress={() => {
                          setSelectedProject(p);
                          setShowProjectDropdown(false);
                          setProjectSearch('');
                        }}>
                        <View
                          style={[
                            styles.projectDot,
                            {backgroundColor: projectColor(p.id)},
                          ]}
                        />
                        <Text style={styles.dropdownTextPro}>{p.Name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* REQUEST TYPE */}
            <View style={styles.dropdownRow}>
              <TouchableOpacity
                onPress={() =>
                  setShowRequestTypeDropdown(!showRequestTypeDropdown)
                }>
                <View style={[styles.row, {justifyContent: 'flex-start'}]}>
                  <MaterialIcons name="add" size={25} color={'#444'} />
                  <Text style={[styles.rowText, {color: '#999'}]}>
                    {selectedRequestType
                      ? selectedRequestType.Name || selectedRequestType.uid
                      : 'Select Request Type'}
                  </Text>
                </View>
              </TouchableOpacity>
              {showRequestTypeDropdown &&
                requestTypes.map(rt => (
                  <TouchableOpacity
                    key={rt.id}
                    onPress={() => {
                      setSelectedRequestType(rt);
                      setShowRequestTypeDropdown(false);
                    }}
                    style={styles.dropdownItem}>
                    <Text style={[styles.dropdownTextPro, {color: '#2F4FE3'}]}>
                      {rt.Name || rt.uid}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>

            {/* CATEGORY */}
            <View style={styles.dropdownRowPro}>
              <TouchableOpacity
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}>
                <View style={[styles.row, {justifyContent: 'flex-start'}]}>
                  <MaterialIcons name="add" size={25} color={'#444'} />
                  <Text style={[styles.rowText, {color: '#999'}]}>
                    {selectedCategory
                      ? selectedCategory.Name || selectedCategory.identifier
                      : 'Select Category'}
                  </Text>
                </View>
              </TouchableOpacity>
              {showCategoryDropdown &&
                categories.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => {
                      setSelectedCategory(cat);
                      setShowCategoryDropdown(false);
                    }}
                    style={styles.dropdownItem}>
                    <Text style={[styles.dropdownTextPro, {color: '#2F4FE3'}]}>
                      {cat.Name || cat.identifier}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>

            {/* GROUP */}
            <View style={styles.dropdownRowPro}>
              <TouchableOpacity
                onPress={() => setShowGroupDropdown(!showGroupDropdown)}>
                <View style={[styles.row, {justifyContent: 'flex-start'}]}>
                  <MaterialIcons name="add" size={25} color={'#444'} />
                  <Text style={[styles.rowText, {color: '#999'}]}>
                    {selectedGroup
                      ? selectedGroup.Name || selectedGroup.identifier
                      : 'Select Group'}
                  </Text>
                </View>
              </TouchableOpacity>
              {showGroupDropdown &&
                groups.map(grp => (
                  <TouchableOpacity
                    key={grp.id}
                    onPress={() => {
                      setSelectedGroup(grp);
                      setShowGroupDropdown(false);
                    }}
                    style={styles.dropdownItem}>
                    <Text style={[styles.dropdownTextPro, {color: '#2F4FE3'}]}>
                      {grp.Name || grp.identifier}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
            {/* <Portal>
          {pickerMode && (
            <DateTimePicker
              value={
                pickerMode === 'startDate'
                  ? startDate
                  : pickerMode === 'endDate'
                  ? endDate
                  : startTime
              }
              mode={pickerMode === 'startTime' ? 'time' : 'date'}
              display="default"
              onChange={handleDateChange}
            />
          )}
        </Portal> */}

            {/* SUBMIT */}
            <TouchableOpacity style={styles.button} onPress={handleCreateTask}>
              <Text style={styles.buttonText}>
                {mutation.isLoading ? 'Creating...' : 'Create Task'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
      {/* ================= MORE OPTIONS MODAL ================= */}
      <Modal
        visible={showMoreMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMoreMenu(false)}>
        <TouchableOpacity
          style={styles.moreOverlay}
          activeOpacity={1}
          onPressOut={() => setShowMoreMenu(false)}>
          <View style={styles.moreBoxUp}>
            {availableMoreOptions.includes('Start Time') && (
              <TouchableOpacity
                style={styles.moreItem}
                onPress={() => {
                  setShowMoreMenu(false);
                  setOpenTimePicker(true);

                  // Show Start Time pill
                  setShowStartTime(true);

                  // Remove from More Options
                  setAvailableMoreOptions(prev =>
                    prev.filter(option => option !== 'Start Time'),
                  );
                }}>
                <MaterialIcons name="schedule" size={20} color="#2F4FE3" />
                <Text style={styles.moreItemText}>Start Time</Text>
              </TouchableOpacity>
            )}

            {availableMoreOptions.includes('Repeat') && (
              <TouchableOpacity
                style={styles.moreItem}
                onPress={() => {
                  setShowMoreMenu(false);
                  setShowRepeatMenu(true);

                  // Show Repeat pill
                  setShowRepeat(true);

                  // Remove from More Options
                  setAvailableMoreOptions(prev =>
                    prev.filter(option => option !== 'Repeat'),
                  );
                }}>
                <MaterialIcons name="repeat" size={20} color="#2F4FE3" />
                <Text style={styles.moreItemText}>Repeat: {repeatOption}</Text>
              </TouchableOpacity>
            )}

            {/* Cancel */}
            <TouchableOpacity
              style={[styles.moreItem, {justifyContent: 'center'}]}
              onPress={() => setShowMoreMenu(false)}
              onClose={() => navigation.goBack()}>
              <Text style={{color: '#E74C3C', fontWeight: '600'}}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      {/* ================= REPEAT MODAL ================= */}
      <Modal visible={showRepeatMenu} transparent animationType="slide">
        <View style={styles.repeatOverlay}>
          <View style={styles.repeatBox}>
            {['None', 'Daily', 'Weekly', 'Monthly'].map(item => (
              <TouchableOpacity
                key={item}
                style={styles.repeatItem}
                onPress={() => {
                  setRepeatOption(item);
                  setShowRepeatMenu(false);
                }}>
                <Text style={{fontSize: 16}}>{item}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.repeatItem}
              onPress={() => setShowRepeatMenu(false)}>
              <Text style={{color: '#E74C3C', fontFamily: 'K2D-Bold'}}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* ================= GOOGLE TASKS STYLE CALENDAR MODAL ================= */}
      <Modal
        visible={showCalendar}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCalendar(false)}>
        <View style={styles.calendarModal}>
          <View style={styles.calendarBox}>
            {/* Header */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              {/* <Text style={styles.dueTitle}>Due date</Text> */}

              <View style={{width: 60}} />
            </View>
            <View
              style={{
                backgroundColor: '#eee',
                padding: '2%',
                borderRadius: 8,
                marginVertical: '2%',
              }}>
              <Text style={styles.dueTitle}>Due Date</Text>
            </View>

            {/* Quick Buttons */}
            <View style={styles.quickRow}>
              {['Today', 'Tomorrow', 'Next Monday'].map(label => {
                const date =
                  label === 'Today'
                    ? moment()
                    : label === 'Tomorrow'
                    ? moment().add(1, 'day')
                    : moment().day(8);

                return (
                  <TouchableOpacity
                    key={label}
                    style={styles.quickBtn}
                    onPress={() => setTempDate(date.format('YYYY-MM-DD'))}>
                    <Text style={styles.quickText}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Calendar */}
            <Calendar
              current={tempDate || moment().format('YYYY-MM-DD')}
              onDayPress={day => setTempDate(day.dateString)}
              enableSwipeMonths
              hideExtraDays
              disableMonthChange
              markedDates={markedDates}
              theme={{
                selectedDayBackgroundColor: '#2F4FE3',
                todayTextColor: '#2F4FE3',
                arrowColor: '#000',
              }}
            />

            <View style={{marginBottom: 12, gap: 10}}>
              {showStartTime && startTime && (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: '3%',
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    backgroundColor: '#F0F4FF',
                    minWidth: 120,
                    justifyContent: 'space-between',
                  }}
                  onPress={() => setOpenTimePicker(true)}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                    }}>
                    <MaterialIcons name="schedule" size={18} color="#2F4FE3" />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: '#2F4FE3',
                      }}>
                      Start Time
                    </Text>
                  </View>
                  <Text
                    style={{fontSize: 14, fontWeight: '600', color: '#000'}}>
                    {moment(startTime).format('HH:mm')}
                  </Text>
                </TouchableOpacity>
              )}

              {showRepeat && repeatOption !== 'None' && (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: '3%',
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    backgroundColor: '#FFF4E5',
                    minWidth: 120,
                    justifyContent: 'space-between',
                  }}
                  onPress={() => setShowRepeatMenu(true)}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                    }}>
                    <MaterialIcons name="repeat" size={18} color="#E67E22" />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: '#E67E22',
                      }}>
                      Repeat
                    </Text>
                  </View>
                  <Text
                    style={{fontSize: 14, fontWeight: '600', color: '#000'}}>
                    {repeatOption}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Footer */}
            <View style={styles.calendarFooter}>
              <TouchableOpacity
                onPress={() => setShowMoreMenu(true)}
                style={[
                  styles.moreBtn,
                  availableMoreOptions.length === 0 && {opacity: 0.5}, // visually disabled
                ]}
                disabled={availableMoreOptions.length === 0} // actually disabled
              >
                <Text style={styles.moreText}>More</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.doneBtn}
                onPress={() => {
                  if (calendarType === 'start') setStartDate(tempDate);
                  if (calendarType === 'end') setEndDate(tempDate);
                  setShowCalendar(false);
                }}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* ================= TIME PICKER MODAL ================= */}
      {openTimePicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedTime) => {
            if (event.type === 'set' && selectedTime)
              setStartTime(selectedTime);
            setOpenTimePicker(false);
          }}
        />
      )}
    </>
  );
};

// === STYLES ===
const styles = StyleSheet.create({
  // container: {flex: 1, backgroundColor: '#F9F8F6', paddingHorizontal: '5%'},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: '1%',
  },
  inputRow: {flexDirection: 'row', alignItems: 'center'},
  input: {
    flex: 1,
    fontSize: 25,
    paddingVertical: '2%',
    color: '#555',
    fontFamily: 'K2D-SemiBold',
  },
  dropdownRow: {marginVertical: 12},
  dropdownRowPro: {marginVertical: 12},
  dropdownHeaderPro: {flexDirection: 'row', alignItems: 'center', gap: 8},
  dropdownBoxPro: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  dropdownItemPro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
  },
  dropdownTextPro: {color: '#000'},
  searchInput: {
    borderBottomWidth: 1,
    margin: 8,
    paddingVertical: 4,
    color: '#555',
  },
  rowLabel: {
    fontSize: 15,
    marginLeft: 2,
    fontFamily: 'K2D-Medium',
    color: '#555',
  },
  rowValue: {
    fontSize: 15,
    marginLeft: 2,
    fontFamily: 'K2D-Medium',
    color: '#000',
  },
  iconWrapper: {
    // height: 30,
    // width: 30,
    // borderRadius: 15,
    // borderStyle: 'dashed',
    // borderWidth: 1,
    // borderColor: '#777',
    // justifyContent: 'center',
    // alignItems: 'center',
    // right: 7,
    padding: 8,
    backgroundColor: '#fff',
    elevation: 4,
    borderRadius: 20,
    // gap: 5
  },
  projectDot: {width: 10, height: 10, borderRadius: 5},
  button: {
    backgroundColor: '#2F4FE3',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonText: {color: '#fff', fontWeight: '600', fontSize: 16},
  priorityMini: {alignItems: 'center', flexDirection: 'row', gap: 5},
  priorityMiniLabel: {fontSize: 14, color: '#555', fontFamily: 'K2D-Medium'},
  priorityPopup: {
    position: 'absolute',
    left: '95%',
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    zIndex: 999,
    flexDirection: 'row',
  },
  priorityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  priorityLabel: {fontSize: 10, fontWeight: '500'},
  priorityCircle: {width: 14, height: 14, borderRadius: 8},
  dropdownItem: {
    padding: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
  },
  // Calendar Modal

  cancelBtn: {
    width: 60,
  },
  dueLabel: {
    fontFamily: 'K2D-Bold',
    textAlign: 'center',
    fontSize: 16,
    color: '#000',
  },
  quickFilters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  filterBtn: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  filterText: {
    color: '#2F4FE3',
    fontWeight: '500',
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  monthYear: {
    fontWeight: 'bold',
  },
  calendarBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  calendarModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },

  calendarBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    elevation: 10,
  },

  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  cancelText: {
    color: '#2F4FE3',
    fontSize: 16,
    fontFamily: 'K2D-SemiBold',
  },

  dueTitle: {
    fontSize: 16,
    fontFamily: 'K2D-Bold',
    textAlign: 'center',
    color: '#555',
  },

  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: '2%',
  },

  quickBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },

  quickText: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'K2D-Regular',
  },

  calendarFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  moreBtn: {
    backgroundColor: '#eee',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
    width: '47%',
  },
  moreText: {
    // color: '#2F4FE3',
    color: '#333',
    fontFamily: 'K2D-SemiBold',
    fontSize: 15,
    textAlign: 'center',
  },

  doneBtn: {
    backgroundColor: '#2F4FE3',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
    width: '47%',
  },

  doneText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'K2D-SemiBold',
    textAlign: 'center',
  },
  moreOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-start', // top overlay
  },
  repeatOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center', // top overlay
    alignItems: 'center',
  },

  moreBoxUp: {
    position: 'absolute',
    bottom: 80, // distance above the More button in the calendar
    left: 16, // align with More button horizontally
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 10,
  },

  moreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 15,
  },

  moreItemText: {
    fontSize: 16,
    fontWeight: '500',
  },

  repeatBox: {
    backgroundColor: '#fff',
    padding: '2%',
    borderRadius: 8,
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  repeatItem: {
    paddingVertical: '2%',
    color: '#555',
    fontFamily: 'K2D-Medium',
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)', // dim background
    justifyContent: 'flex-end',
  },

  sheetContainer: {
    backgroundColor: '#F9F8F6',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 10,
    maxHeight: '92%',
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    paddingHorizontal: '5%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginVertical: 8,
  },

  closeBtn: {
    alignSelf: 'flex-end',
    paddingRight: 16,
    paddingBottom: 10,
  },
});

export default AddTask;
