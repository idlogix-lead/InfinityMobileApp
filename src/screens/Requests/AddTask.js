import React, {useState, useMemo, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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
} from '../../api/requests.api';
import {useAuthStore} from '../../store/authStore';

const PRIORITIES = [
  {id: '1', label: 'Urgent', color: '#E74C3C'},
  {id: '3', label: 'High', color: '#E67E22'},
  {id: '5', label: 'Medium', color: '#3498DB'},
  {id: '7', label: 'Low', color: '#2ECC71'},
  {id: '4', label: 'Minor', color: '#95A5A6'},
];

// stable project color
const projectColor = id => {
  const colors = ['#6C5CE7', '#00B894', '#0984E3', '#D63031', '#E84393'];
  return colors[id % colors.length];
};

const AddTask = ({navigation, isModal = false, onClose}) => {
  const queryClient = useQueryClient();

  const {userId, userName} = useAuthStore();

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

  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [showRequestTypeDropdown, setShowRequestTypeDropdown] = useState(false);

  // ==============================
  // FETCH DROPDOWNS USING REACT QUERY
  // ==============================
  const {data: requestTypes = []} = useQuery(['requestTypes'], fetchRequestTyp);
  const {data: categories = []} = useQuery(['categories'], fetchRequestCat);
  const {data: groups = []} = useQuery(['groups'], fetchRequestGrp);
  const {data: projects = []} = useQuery(['projects'], fetchRequestpro);
  const {data: salesUsers = []} = useQuery(['salesUsers'], fetchUsers);

  // ==============================
  // FILTERED LISTS
  // ==============================
  // useEffect(() => {
  //   if (!selectedSalesRep && salesUsers.length > 0 && userId) {
  //     const loggedInUser = salesUsers.find(
  //       u => Number(u.id) === Number(userId),
  //     );

  //     if (loggedInUser) {
  //       setSelectedSalesRep(loggedInUser);
  //     }
  //   }
  // }, [salesUsers, userId]);
  useEffect(() => {
    if (!selectedSalesRep && userId && userName) {
      setSelectedSalesRep({
        id: Number(userId),
        Name: userName,
      });
    }
  }, [userId, userName]);

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

  // ==============================
  // CREATE TASK MUTATION
  // ==============================
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
      StartDate: startDate.toISOString().split('T')[0] + 'T00:00:00Z',
      StartTime: combineDateAndTime(startDate, startTime),
      EndTime: endDate.toISOString(),
      R_RequestType_ID: {id: selectedRequestType.id},
      R_Category_ID: {id: selectedCategory.id},
      R_Group_ID: {id: selectedGroup.id},
      Priority: {id: priority.id},
      C_Project_ID: {id: selectedProject.id},
    };

    mutation.mutate(payload);
  };

  const combineDateAndTime = (date, time) => {
    const combined = new Date(date);
    combined.setHours(time.getHours());
    combined.setMinutes(time.getMinutes());
    combined.setSeconds(0);
    combined.setMilliseconds(0);
    return combined.toISOString();
  };

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
    setStartDate(new Date());
    setStartTime(new Date());
    setEndDate(new Date());
  };

  // ==============================
  // RENDER
  // ==============================
  return (
    <>
      <ReqHeader title={'Create Request'} />
      <ScrollView
        style={styles.container}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled">
        {/* PRIORITY */}
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
            <MaterialIcons name="check-circle-outline" size={15} color="#555" />
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
                      <Text style={[styles.priorityLabel, {color: p.color}]}>
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
              onPress={() => setShowSalesRepDropdown(!showSalesRepDropdown)}>
              <View style={styles.iconWrapper}>
                <MaterialIcons name="person-outline" size={24} color="#555" />
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
            onPress={() => setShowEndDatePicker(true)}
            style={styles.row}>
            <View style={styles.iconWrapper}>
              <MaterialIcons name="calendar-today" size={15} color="#777" />
            </View>
            <View style={{}}>
              <Text style={styles.rowLabel}> End Date</Text>
              <Text style={styles.rowValue}>
                {endDate ? endDate.toDateString() : 'Please select'}
              </Text>
            </View>
          </TouchableOpacity>

          {showEndDatePicker && (
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
          )}
        </View>
        <View style={[styles.row, {paddingHorizontal: '2%'}]}>
          <TouchableOpacity
            onPress={() => setShowStartDatePicker(true)}
            style={styles.row}>
            <View style={styles.iconWrapper}>
              <MaterialIcons name="calendar-today" size={15} color="#777" />
            </View>
            <View style={{}}>
              <Text style={styles.rowLabel}>Start Date</Text>
              <Text style={styles.rowValue}>
                {' '}
                {startDate ? startDate.toDateString() : 'Please select'}
              </Text>
            </View>
          </TouchableOpacity>
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                if (event.type === 'set' && selectedDate)
                  setStartDate(selectedDate);
                setShowStartDatePicker(false);
              }}
            />
          )}
          <TouchableOpacity
            onPress={() => setShowStartTimePicker(true)}
            style={styles.row}>
            <View style={styles.iconWrapper}>
              <MaterialIcons name="schedule" size={24} color="#555" />
            </View>
            <View>
              <Text style={styles.rowLabel}>Start Time</Text>
              <Text style={styles.rowValue}>
                {startTime
                  ? startTime.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Please select'}
              </Text>
            </View>
          </TouchableOpacity>
          {showStartTimePicker && (
            <DateTimePicker
              value={startTime}
              mode="time"
              is24Hour
              display="default"
              onChange={(event, selectedTime) => {
                if (event.type === 'set' && selectedTime)
                  setStartTime(selectedTime);
                setShowStartTimePicker(false);
              }}
            />
          )}
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

        {/* SUBMIT */}
        <TouchableOpacity style={styles.button} onPress={handleCreateTask}>
          <Text style={styles.buttonText}>
            {mutation.isLoading ? 'Creating...' : 'Create Task'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

// === STYLES ===
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff', paddingHorizontal: '5%'},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: '1%',
  },
  inputRow: {flexDirection: 'row', alignItems: 'center'},
  input: {
    flex: 1,
    fontSize: 20,
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
    height: 30,
    width: 30,
    borderRadius: 15,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#777',
    justifyContent: 'center',
    alignItems: 'center',
    right: 7,
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
});

export default AddTask;
