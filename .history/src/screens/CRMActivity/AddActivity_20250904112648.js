import {StyleSheet, Text, TouchableOpacity, View, Animated} from 'react-native';
import React, {useState, useRef} from 'react';
import CustomHeader from '../../components/CustomHeader';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
// import RNPickerSelect from 'react-native-picker-select';
// import CheckBox from '@react-native-community/checkbox';

const AddActivity = () => {
  const [activityCollapsed, setActivityCollapsed] = useState(true);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [description, setDescription] = useState('');
  const [complete, setComplete] = useState(false);
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
      <Text style={{fontWeight: 'bold', marginTop: 20}}>Start Date</Text>
      <TouchableOpacity onPress={() => setShowStartPicker(true)}>
        <Text>{startDate.toDateString()}</Text>
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
      <Text style={{fontWeight: 'bold', marginTop: 20}}>End Date</Text>
      <TouchableOpacity onPress={() => setShowEndPicker(true)}>
        <Text>{endDate.toDateString()}</Text>
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
      <Text style={{fontWeight: 'bold', marginTop: 20}}>Description</Text>
      <TextInput
        placeholder="Enter description..."
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
      <View style={{marginTop: 20}}>
        <Button
          title="Save"
          onPress={() => {
            console.log({
              activityType,
              startDate,
              endDate,
              description,
              complete,
            });
          }}
        />
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
});
