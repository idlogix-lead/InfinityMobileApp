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
import React, {useRef, useState} from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from 'react-native-vector-icons/AntDesign';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {TextInput} from 'react-native-paper';
import CustomHeader from '../../components/CustomHeader';

const CrmActivitySrn = ({route, navigation}) => {
  //   const {data} = route.params; // AD_User_ID

  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [activityCollapsed, setActivityCollapsed] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState('Selected Activity');
  const [description, setDescription] = useState('');

  const activityAnim = useRef(new Animated.Value(0)).current;

  const activityTypeMap = {
    Email: 'EM',
    Phone: 'PC',
    Meeting: 'ME',
    Task: 'TA',
  };

  const formatDate = date => date.toISOString().split('.')[0] + 'Z';

  const handleSave = async () => {
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const token = await AsyncStorage.getItem('token');

    if (selectedActivity === 'Selected Activity') {
      Alert.alert('Error', 'Please select an Activity Type.');
      return;
    }

    const selectedActivityId = activityTypeMap[selectedActivity];

    const payload = {
      StartDate: formatDate(fromDate),
      EndDate: formatDate(toDate),
      Description: description.trim() || 'No description provided',
      IsComplete: isComplete,
      ContactActivityType: {id: selectedActivityId},
    //   AD_User_ID: data,
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    try {
      const URL = `${protocol}://${host}:${port}/api/v1/models/C_ContactActivity`;
      await axios.post(URL, payload, {headers});
      Alert.alert('Saved', 'Activity saved successfully!', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);

      // Reset form
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
    if (Platform.OS === 'android') setShowToDatePicker(false);
    if (event?.type === 'set' && selectedDate) setToDate(selectedDate);
  };

  const handleFromDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowFromDatePicker(false);
    if (event?.type === 'set' && selectedDate) setFromDate(selectedDate);
  };

  const selectActivity = type => {
    setSelectedActivity(type);
    setActivityCollapsed(true);
  };

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

            <View style={styles.activityWrapper}>
              <Text style={{fontFamily: 'K2D-SemiBold', color: '#000'}}>
                Activity Type
              </Text>

              <TouchableOpacity
                onPress={() =>
                  toggleSection(
                    activityCollapsed,
                    setActivityCollapsed,
                    activityAnim,
                  )
                }
                style={styles.dateInput}>
                <Text style={{color: 'gray', fontFamily: 'K2D-Regular'}}>
                  {selectedActivity}
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
                  value={fromDate}
                  mode="date"
                  display="default"
                  onChange={handleFromDateChange}
                />
              )}

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
                  value={toDate}
                  mode="date"
                  display="default"
                  onChange={handleToDateChange}
                />
              )}

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
                <TouchableOpacity
                  onPress={() => setIsComplete(!isComplete)}
                  style={styles.checkboxRow}>
                  <Icon
                    name={isComplete ? 'check-box' : 'check-box-outline-blank'}
                    size={24}
                    color="#000"
                  />
                  <Text style={styles.completeText}>
                    Mark "Complete if you have already completed the Activity
                    before creation.
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default CrmActivitySrn;

const styles = StyleSheet.create({
  activityWrapper: {
    backgroundColor: '#fff',
    marginTop: '15%',
    paddingVertical: '10%',
    paddingHorizontal: '5%',
    width: '90%',
    marginLeft: '5%',
    borderRadius: 6,
    elevation: 6,
    shadowColor: '#000',
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
  description: {margin: 10, backgroundColor: '#fff'},
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  completeText: {
    color: '#555',
    marginLeft: 8,
    fontFamily: 'K2D-SemiBold',
    fontSize: 12,
    width:'90%'
  },
  saveButton: {
    backgroundColor: '#2F4FE3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    top: 10
  },
  saveText: {color: '#fff', fontFamily: 'K2D-Bold'},
});
