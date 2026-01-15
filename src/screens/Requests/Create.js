import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Create = () => {
  const [clients, setClients] = useState([]);
  const [salesReps, setSalesReps] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [dueTypes, setDueTypes] = useState([]);
  const [requestTypes, setRequestTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [formData, setFormData] = useState({
    AD_Client_ID: null,
    AD_Org_ID: null,
    Priority: null,
    DueType: null,
    Summary: '',
    SalesRep_ID: null,
    R_RequestType_ID: null,
    R_Status_ID: null,
    StartDate: new Date(),
    StartTime: new Date(),
    CloseDate: new Date(),
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showCloseDatePicker, setShowCloseDatePicker] = useState(false);

  // Example: fetch dropdown options (clients, priorities, etc.)
  useEffect(() => {
    // Mock: you can replace this with actual API fetch
    setClients([{id: 1000000, identifier: 'Starlet Innovations Pvt Ltd'}]);
    setSalesReps([{id: 1000000, identifier: 'STIAdmin'}]);
    setPriorities([
      {id: '3', identifier: 'High'},
      {id: '1', identifier: 'Low'},
    ]);
    setDueTypes([{id: '5', identifier: 'Due'}]);
    setRequestTypes([{id: 1000000, identifier: 'Personal Tasks'}]);
    setStatuses([{id: 1000003, identifier: '9_Final Close'}]);
  }, []);

  const handleDateChange = (event, selectedDate, field) => {
    if (selectedDate) {
      setFormData({...formData, [field]: selectedDate});
    }
    setShowStartDatePicker(false);
    setShowStartTimePicker(false);
    setShowCloseDatePicker(false);
  };

  const submitTask = async () => {
    try {
      // Transform data to match API
      const token = await AsyncStorage.getItem('token');
      const payload = {
        ...formData,
        StartDate: formData.StartDate.toISOString(),
        StartTime: formData.StartTime.toISOString(),
        CloseDate: formData.CloseDate.toISOString(),
        RequestAmt: 0.0,
        IsActive: true,
      };

      const response = await axios.post(
        'http://116.58.53.114:9999/api/v1/models/R_Request',
        payload,
        {headers: {Authorization: `Bearer ${token}`}},
      );

      Alert.alert('Success', 'Task created successfully!');
      console.log(response.data);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to create task');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Client */}
      <Text style={styles.label}>Client</Text>
      <TextInput
        style={styles.input}
        value={formData.AD_Client_ID?.identifier || ''}
        placeholder="Select Client"
      />

      {/* Organization */}
      <Text style={styles.label}>Organization</Text>
      <TextInput
        style={styles.input}
        value={formData.AD_Org_ID?.identifier || ''}
        placeholder="Select Organization"
      />

      {/* Priority */}
      <Text style={styles.label}>Priority</Text>
      <TextInput
        style={styles.input}
        value={formData.Priority?.identifier || ''}
        placeholder="Select Priority"
      />

      {/* Due Type */}
      <Text style={styles.label}>Due Type</Text>
      <TextInput
        style={styles.input}
        value={formData.DueType?.identifier || ''}
        placeholder="Select Due Type"
      />

      {/* Summary */}
      <Text style={styles.label}>Summary</Text>
      <TextInput
        style={[styles.input, {height: 100}]}
        multiline
        value={formData.Summary}
        onChangeText={text => setFormData({...formData, Summary: text})}
        placeholder="Enter Summary"
      />

      {/* Sales Rep */}
      <Text style={styles.label}>Sales Rep</Text>
      <TextInput
        style={styles.input}
        value={formData.SalesRep_ID?.identifier || ''}
        placeholder="Select Sales Rep"
      />

      {/* Request Type */}
      <Text style={styles.label}>Request Type</Text>
      <TextInput
        style={styles.input}
        value={formData.R_RequestType_ID?.identifier || ''}
        placeholder="Select Request Type"
      />

      {/* Status */}
      <Text style={styles.label}>Status</Text>
      <TextInput
        style={styles.input}
        value={formData.R_Status_ID?.identifier || ''}
        placeholder="Select Status"
      />

      {/* Start Date */}
      <Text style={styles.label}>Start Date</Text>
      <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
        <TextInput
          style={styles.input}
          value={formData.StartDate.toDateString()}
          editable={false}
        />
      </TouchableOpacity>
      {showStartDatePicker && (
        <DateTimePicker
          value={formData.StartDate}
          mode="date"
          display="default"
          onChange={(e, date) => handleDateChange(e, date, 'StartDate')}
        />
      )}

      {/* Start Time */}
      <Text style={styles.label}>Start Time</Text>
      <TouchableOpacity onPress={() => setShowStartTimePicker(true)}>
        <TextInput
          style={styles.input}
          value={formData.StartTime.toLocaleTimeString()}
          editable={false}
        />
      </TouchableOpacity>
      {showStartTimePicker && (
        <DateTimePicker
          value={formData.StartTime}
          mode="time"
          display="default"
          onChange={(e, date) => handleDateChange(e, date, 'StartTime')}
        />
      )}

      {/* Close Date */}
      <Text style={styles.label}>Close Date</Text>
      <TouchableOpacity onPress={() => setShowCloseDatePicker(true)}>
        <TextInput
          style={styles.input}
          value={formData.CloseDate.toDateString()}
          editable={false}
        />
      </TouchableOpacity>
      {showCloseDatePicker && (
        <DateTimePicker
          value={formData.CloseDate}
          mode="date"
          display="default"
          onChange={(e, date) => handleDateChange(e, date, 'CloseDate')}
        />
      )}

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={submitTask}>
        <Text style={styles.buttonText}>Create Task</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Create;

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fff',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginTop: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    marginTop: 25,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
