import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import SearchHeader from './SearchHeader';
import {useRoute} from '@react-navigation/native';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const MissedFollowUp = () => {
  const route = useRoute();
  const {data} = route.params;

  const [followups, setFollowups] = useState(data || []);
  const [editingId, setEditingId] = useState(null);
  const [tempDescription, setTempDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeItemId, setActiveItemId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const activityTypeLabelMap = {
    EM: 'Email',
    PC: 'Phone Call',
    ME: 'Meeting',
    TA: 'Task',
  };

  const updateFollowupField = async (id, field, value) => {
    try {
      // Update local state immediately
      setFollowups(prev =>
        prev.map(f => (f.id === id ? {...f, [field]: value} : f)),
      );

      // Call API to save
      const protocol = await AsyncStorage.getItem('protocol');
      const host = await AsyncStorage.getItem('host');
      const port = await AsyncStorage.getItem('port');
      const token = await AsyncStorage.getItem('token');

      const URL = `${protocol}://${host}:${port}/api/v1/models/C_ContactActivity/${id}`;

      await axios.put(
        URL,
        {[field]: value},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('Updated followup', id, field, value);
    } catch (error) {
      console.log(
        'Error updating followup:',
        error.response?.data || error.message,
      );
      Alert.alert('Failed to update followup');
    }
  };

  const renderFollowUpCard = ({item}) => {
    const name = item.AD_User_ID?.identifier;
    const status = item.IsActive ? 'Open' : 'Pending';
    const schedule = moment(item.EndDate).format('DD MMM YYYY');
    const followUpCode = item.ContactActivityType?.identifier;
    const followUpType =
      activityTypeLabelMap[followUpCode] || followUpCode || '-';

    return (
      <View style={styles.card}>
        <Text style={styles.label}>
          Lead Name: <Text style={styles.value}>{name}</Text>
        </Text>
        <Text style={styles.label}>
          Status: <Text style={styles.status}>{status}</Text>
        </Text>

        {/* Complete / Incomplete */}
        <TouchableOpacity
          onPress={() =>
            updateFollowupField(item.id, 'IsComplete', !item.IsComplete)
          }
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 2,
          }}>
          <Text
            style={{
              marginLeft: 0,
              color: item.IsComplete ? 'gray' : 'black',
              fontFamily: 'K2D-Medium',
              fontSize: 13,
            }}>
            {item.IsComplete ? 'Complete' : 'Incomplete'}
            <Text style={styles.label}> : </Text>
          </Text>
          <View
            style={{
              width: 20,
              height: 20,
              borderWidth: 1,
              borderColor: item.IsComplete ? '#000' : '#000',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 4,
            }}>
            <Text
              style={{
                color: item.IsComplete ? '#555' : '#555',
                fontFamily: 'K2D-Medium',
                bottom: '25%',
              }}>
              {item.IsComplete ? '✔' : '✖'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Scheduled Date */}
        <View style={{marginTop: 10, marginBottom: 10, position: 'relative'}}>
          <View style={styles.verticalLineContainer}>
            <View style={styles.dot} />
            <View style={styles.verticalDottedLine} />
            <View style={styles.dot} />
          </View>
          <View style={styles.infoContainer}>
            <TouchableOpacity
              onPress={() => {
                setActiveItemId(item.id);
                setSelectedDate(new Date(item.EndDate));
                setShowDatePicker(true);
              }}>
              <View style={styles.infoContainer}>
                <Text style={[styles.subLabel, {paddingHorizontal: '4%'}]}>
                  Scheduled Time:
                </Text>
                <Text style={[styles.subValue, {paddingHorizontal: '3%'}]}>
                  {schedule}
                </Text>
              </View>
            </TouchableOpacity>
            {showDatePicker && activeItemId === item.id && (
              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                display="calendar"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (event.type === 'set' && date) {
                    const formattedDate = moment(date)
                      .utc()
                      .format('YYYY-MM-DDTHH:mm:ss[Z]');
                    updateFollowupField(activeItemId, 'EndDate', formattedDate);
                  }
                }}
              />
            )}
          </View>

          {/* Follow-up Type */}
          <View style={styles.infoContainer}>
            <Text
              style={[
                styles.subLabel,
                {paddingHorizontal: '4%', paddingTop: '3%'},
              ]}>
              Follow-up type:
            </Text>
            <Text
              style={[
                styles.subValue,
                {
                  color: 'rgba(21, 68, 137, 1)',
                  backgroundColor: '#f0f0f0',
                  elevation: 2,
                  paddingHorizontal: '3%',
                  borderRadius: 5,
                },
              ]}>
              {followUpType}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={{}}>
          <Text style={styles.quickNote}>Description</Text>
          <TextInput
            value={editingId === item.id ? tempDescription : item.Description}
            editable
            multiline
            onFocus={() => {
              setEditingId(item.id);
              setTempDescription(item.Description);
            }}
            onChangeText={text => setTempDescription(text)}
            onBlur={() => {
              setEditingId(null);
              if (tempDescription !== item.Description) {
                updateFollowupField(item.id, 'Description', tempDescription);
              }
            }}
            style={styles.description}
            placeholder="Enter description"
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SearchHeader />
      <Text style={styles.title}>Missed Follow-ups</Text>
      <FlatList
        data={followups} // 👈 updated state
        renderItem={renderFollowUpCard}
        keyExtractor={item => item.id}
        contentContainerStyle={{paddingBottom: 30}}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default MissedFollowUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f1f5',
    paddingHorizontal: 20,
    paddingTop: '5%',
  },
  title: {
    fontSize: 20,
    fontFamily: 'K2D-SemiBold',
    marginVertical: 10,
    color: '#262626',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 3,
    padding: 12,
    marginBottom: '5%',
    elevation: 4,
  },
  label: {
    fontFamily: 'K2D-Medium',
    fontSize: 12,
    color: '#000',
    marginBottom: 2,
  },
  value: {fontFamily: 'K2D-Regular', color: '#7d7d7d', fontSize: 13},
  status: {fontFamily: 'K2D-Regular', fontSize: 15, color: '#999'},
  infoContainer: {flexDirection: 'row', alignItems: 'center', left: '8%'},
  subLabel: {color: '#000', fontFamily: 'K2D-Medium', fontSize: 13},
  subValue: {color: '#7d7d7d', fontFamily: 'K2D-Regular', fontSize: 11},
  quickNote: {
    color: '#000',
    fontFamily: 'K2D-Medium',
    fontSize: 13,
    marginTop: 10,
  },
  description: {
    borderBottomWidth: 0.5,
    borderColor: '#aaa',
    marginTop: 4,
    paddingVertical: 3,
    color: '#000',
    fontFamily: 'K2D-Regular',
    fontSize: 11,
    paddingHorizontal: '2%',
  },
  verticalLineContainer: {
    position: 'absolute',
    left: 2,
    top: '12%',
    height: 35,
    alignItems: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(21, 69, 140, 1)',
  },
  verticalDottedLine: {
    width: 1,
    height: 30,
    borderLeftWidth: 1,
    borderStyle: 'dotted',
    borderColor: 'rgba(21, 69, 140, 1)',
  },
});
