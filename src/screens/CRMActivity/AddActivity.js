import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
  Keyboard,
  Alert,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from 'react-native-vector-icons/AntDesign';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {TextInput} from 'react-native-paper';
import {useFocusEffect} from '@react-navigation/native';
import CustomHeader from '../../components/CustomHeader';

const CrmActivitySrn = ({route, navigation}) => {
  const {data, mode} = route.params;
  console.log(data, mode, 'data and mode in CrmActivitySrn\\\\\\\\,,;....');

  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [activityCollapsed, setActivityCollapsed] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState('Selected Activity');
  const [description, setDescription] = useState('');

  const activityAnim = useRef(new Animated.Value(0)).current;

  // Mapping of activity labels to backend IDs
  const activityTypeMap = {
    Email: 'EM',
    Phone: 'PC',
    Meeting: 'ME',
    Task: 'TA',
  };

  const formatDate = date => {
    return date.toISOString().split('.')[0] + 'Z'; // remove milliseconds
  };

  const handleSave = async () => {
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const token = await AsyncStorage.getItem('token');

    const selectedActivityId = activityTypeMap[selectedActivity];

    const basePayload = {
      StartDate: formatDate(fromDate),
      EndDate: formatDate(toDate),
      Description: description.trim() || 'No description provided',
      IsComplete: isComplete,
    };

    // Only include ContactActivityType when creating (not editing)
    const payload =
      mode === 'edit'
        ? basePayload
        : {
            ...basePayload,
            ContactActivityType: {id: selectedActivityId},
            AD_User_ID: data,
          };
    // console.log(AD_User_ID, 'AD_User_ID data check ;/////');

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    try {
      if (mode === 'edit') {
        const URL = `${protocol}://${host}:${port}/api/v1/models/C_ContactActivity/${data.id}`;
        await axios.put(URL, payload, {headers});
        Alert.alert(
          'Updated',
          'Activity updated successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ],
          {cancelable: false},
        );
      } else {
        const URL = `${protocol}://${host}:${port}/api/v1/models/C_ContactActivity`;
        await axios.post(URL, payload, {headers});
        Alert.alert(
          'Saved',
          'Activity saved successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ],
          {cancelable: false},
        );
        console.log(payload, 'payload in CrmActivitySrn////////////');
      }

      // Reset form after save
      setFromDate(new Date());
      setToDate(new Date());
      setShowFromDatePicker(false);
      setShowToDatePicker(false);
      setIsComplete(false);
      setActivityCollapsed(true);
      setSelectedActivity('Selected Activity');
      setDescription('');
    } catch (error) {
      console.log('Save error:', error.response?.data || error.message);
      Alert.alert('Error', 'Something went wrong while saving.');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      // useEffect(() => {
      if (mode === 'edit' && data) {
        console.log('useEffect called with:', mode, data);
        setSelectedActivity(getActivityLabel(data.ContactActivityType?.id));
        setFromDate(new Date(data.StartDate));
        setToDate(new Date(data.EndDate));
        setDescription(data.Description);
        setIsComplete(data.IsComplete);
      }
    }, [mode, data]),
  );

  useEffect(() => {
    if (mode === 'edit' && data) {
      const start = new Date(data.StartDate);
      const end = new Date(data.EndDate);
      console.log('Setting from edit data:', start, end);
      setFromDate(start);
      setToDate(end);
    }
  }, [mode, data]);

  const getActivityLabel = id => {
    const entry = Object.entries(activityTypeMap).find(
      ([, value]) => value === id,
    );
    return entry?.[0] || 'Selected Activity';
  };

  const toggleSection = (collapsed, setCollapsed, anim) => {
    setCollapsed(!collapsed);
    Animated.timing(anim, {
      toValue: collapsed ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const getRotation = anim =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

  const handleToDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowToDatePicker(false);
    }

    if (event?.type === 'set' || selectedDate) {
      const currentDate = selectedDate || toDate;
      setToDate(currentDate);
    }
  };

  const handleFromDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowFromDatePicker(false);
    }

    if (event?.type === 'set' || selectedDate) {
      const currentDate = selectedDate || fromDate;
      setFromDate(currentDate);
    }
  };

  const selectActivity = type => {
    setSelectedActivity(type);
    setActivityCollapsed(true);
  };
  console.log('Selected Activity:', selectedActivity);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}
      keyboardVerticalOffset={80}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{flexGrow: 1, paddingBottom: 20}}
          keyboardShouldPersistTaps="handled">
          <View style={{flex: 1}}>
            <CustomHeader title={'Activity'} />

            {/* Activity */}
            <View style={styles.activityWrapper}>
              <View style={styles.activity}>
                <Text style={{fontFamily:'K2D-SemiBold',color:'#000'}}>
                  Activity Type
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  toggleSection(
                    activityCollapsed,
                    setActivityCollapsed,
                    activityAnim,
                  )
                }
                style={styles.dateInput}>
                <Text style={{color: 'gray',fontFamily:'K2D-Regular'}}>
                  {selectedActivity === 'Selected Activity'
                    ? 'Selected Activity'
                    : selectedActivity}
                </Text>
                <Animated.View
                  style={{transform: [{rotate: getRotation(activityAnim)}]}}>
                  <AntDesign name="down" size={15} color={'#000'} />
                </Animated.View>
              </TouchableOpacity>

              {!activityCollapsed && (
                <View style={styles.activityContainer}>
                  {Object.keys(activityTypeMap).map(type => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => selectActivity(type)}
                      style={styles.activityButton}>
                      <Text style={styles.activityButtonText}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Start Date */}
              <Text style={styles.sectionTitle}>Start Date *</Text>
              <View style={styles.dateInput}>
                <Text style={{color: 'black'}}>{fromDate.toDateString()}</Text>
                <TouchableOpacity onPress={() => setShowFromDatePicker(true)}>
                  <EvilIcons name="calendar" size={25} color={'#2F4FE3'} />
                </TouchableOpacity>
              </View>
              {showFromDatePicker && (
                <DateTimePicker
                  key={fromDate.toString()}
                  value={fromDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleFromDateChange}
                />
              )}

              {/* End Date */}
              <Text style={styles.sectionTitle}>End Date *</Text>
              <View style={styles.dateInput}>
                <Text style={{color: 'black'}}>{toDate.toDateString()}</Text>
                <TouchableOpacity onPress={() => setShowToDatePicker(true)}>
                  <EvilIcons name="calendar" size={25} color={'#2F4FE3'} />
                </TouchableOpacity>
              </View>
              {showToDatePicker && (
                <DateTimePicker
                  key={toDate.toString()}
                  value={toDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleToDateChange}
                />
              )}

              {/* Description */}
              <Text style={styles.sectionTitle}>Description:</Text>
              <TextInput
                multiline
                placeholder="Enter description...."
                style={styles.description}
                value={description}
                onChangeText={setDescription}
              />

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 18,
                }}>
                {/* Complete Checkbox */}
                <TouchableOpacity
                  onPress={() => setIsComplete(!isComplete)}
                  style={styles.checkboxRow}>
                  <Icon
                    name={isComplete ? 'check-box' : 'check-box-outline-blank'}
                    size={24}
                    color="#000"
                  />
                  <Text style={styles.completeText}>Complete</Text>
                </TouchableOpacity>

                {/* Save Button */}
                <TouchableOpacity
                  onPress={handleSave}
                  style={styles.saveButton}>
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default CrmActivitySrn;

const styles = StyleSheet.create({
  activity: {padding: 10},
  activityWrapper:{
    backgroundColor:'#fff',
    marginTop:'15%',
    paddingVertical:'10%',
    paddingHorizontal:'5%',
    width:'90%',
    marginLeft:'5%',
    borderRadius: 6,
    elevation:6,
    shadowColor: '#000'
  },
  activityContainer: {paddingHorizontal: 20, marginBottom: 10},
  activityButton: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  activityButtonText: {color: '#000'},
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'K2D-SemiBold',
    color: '#000',
    paddingHorizontal: 10,
    marginTop: 15,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginHorizontal: 10,
    marginTop: 8,
    backgroundColor: '#fff',
  },
  description: {
    margin: 10,
    backgroundColor: '#fff',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  completeText: {
    color: '#000',
    marginLeft: 8,
    fontFamily:'K2D-SemiBold'
  },
  saveButton: {
    backgroundColor: '#2F4FE3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginRight: 10,
  },
  saveText: {
    color: '#fff',
    fontFamily: 'K2D-Bold',
  },
});
