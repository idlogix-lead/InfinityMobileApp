import React, {useState, useMemo, useEffect} from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Calendar} from 'react-native-calendars';
import moment from 'moment';

const CalendarModal = ({
  visible,
  onClose,
  initialDate,
  onSelectDate,
  title,
}) => {
  const [tempDate, setTempDate] = useState(
    initialDate || moment().format('YYYY-MM-DD'),
  );

  useEffect(() => {
    setTempDate(initialDate || moment().format('YYYY-MM-DD'));
  }, [initialDate, visible]);

  const markedDates = useMemo(() => {
    return tempDate
      ? {[tempDate]: {selected: true, selectedColor: '#2F4FE3'}}
      : {};
  }, [tempDate]);

  const handleDone = () => {
    onSelectDate(tempDate);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            {/* <Text style={styles.title}>{title || 'Select Date'}</Text> */}
            <View style={{width: 60}} />
          </View>
          <View
            style={{
              backgroundColor: '#eee',
              padding: '2%',
              borderRadius: 8,
              marginVertical: '2%',
            }}>
            <Text style={styles.title}>{title || 'Select Date'}</Text>
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
            current={tempDate}
            onDayPress={day => setTempDate(day.dateString)}
            enableSwipeMonths
            hideExtraDays
            markedDates={markedDates}
            theme={{
              selectedDayBackgroundColor: '#2F4FE3',
              todayTextColor: '#2F4FE3',
              arrowColor: '#000',
            }}
          />

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CalendarModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    elevation: 10,
  },
  header: {
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
  title: {
    fontSize: 16,
    fontFamily: 'K2D-Bold',
    textAlign: 'center',
    color: '#555',
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 12,
  },
  doneBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#2F4FE3',
    borderRadius: 6,
  },
  doneText: {color: '#fff', fontWeight: '600'},
});
