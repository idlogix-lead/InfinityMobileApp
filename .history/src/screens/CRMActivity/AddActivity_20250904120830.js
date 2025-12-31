import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import React, {useState, useRef} from 'react';
import CustomHeader from '../../components/CustomHeader';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from 'react-native-date-picker';

const AddActivity = () => {
  const [activityCollapsed, setActivityCollapsed] = useState(true);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [description, setDescription] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const activityAnim = useRef(new Animated.Value(0)).current;

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
  return (
    <View style={{flex: 1}}>
      <CustomHeader title={'Add Activity'} />
      {/* Activity */}
      <View style={styles.activity}>
        <Text style={{color: '#000', fontSize: 15, fontWeight: 'bold'}}>
          Activity Type
        </Text>
      </View>

      <TouchableOpacity
        onPress={() =>
          toggleSection(activityCollapsed, setActivityCollapsed, activityAnim)
        }
        style={styles.dateInput}>
        <Animated.View
          style={{transform: [{rotate: getRotation(activityAnim)}]}}>
          <AntDesign name="down" size={20} color={'#000'} />
        </Animated.View>
      </TouchableOpacity>

      {/* Start Date */}
      <Text style={{fontWeight: 'bold', marginTop: 20, color: '#000'}}>
        Start Date
      </Text>
      <TouchableOpacity onPress={() => setShowStartPicker(true)}>
        <Text style={{color: '#000'}}>{startDate.toDateString()}</Text>
      </TouchableOpacity>
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartPicker(false);
            if (selectedDate) setStartDate(selectedDate);
          }}
        />
      )}

      {/* End Date */}
      <Text style={{fontWeight: 'bold', marginTop: 20, color: '#000'}}>
        End Date
      </Text>
      <TouchableOpacity onPress={() => setShowEndPicker(true)}>
        <Text style={{color: '#000'}}>{endDate.toDateString()}</Text>
      </TouchableOpacity>
      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowEndPicker(false);
            if (selectedDate) setEndDate(selectedDate);
          }}
        />
      )}

      {/* Description */}
      <Text style={{fontWeight: 'bold', marginTop: 20, color: '#000'}}>
        Description
      </Text>
      <TextInput
        placeholder="Enter description..."
        placeholderTextColor="#888"
        value={description}
        onChangeText={setDescription}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          borderRadius: 5,
          marginTop: 5,
        }}
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
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddActivity;

const styles = StyleSheet.create({
  activity: {
    padding: 10,
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  completeText: {
    color: '#000',
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginRight: 10,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
