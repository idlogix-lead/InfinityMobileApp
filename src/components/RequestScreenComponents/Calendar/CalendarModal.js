import React, { useState, useMemo, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';

const CalendarModal = ({
  visible,
  onClose,
  initialDate,
  onSelectDate,
  title,
  minDate, // Added minDate prop for validation
}) => {
  // Helper function to format any date input to YYYY-MM-DD string
  const formatDateToString = (date) => {
    if (!date) return moment().format('YYYY-MM-DD');
    
    // If it's a Date object
    if (date instanceof Date) {
      return moment(date).format('YYYY-MM-DD');
    }
    
    // If it's already a string, ensure it's in YYYY-MM-DD format
    if (typeof date === 'string') {
      // Check if it's a valid date string
      const parsed = moment(date);
      if (parsed.isValid()) {
        return parsed.format('YYYY-MM-DD');
      }
    }
    
    // Default to today
    return moment().format('YYYY-MM-DD');
  };

  // Helper function to format minDate
  const formatMinDate = (date) => {
    if (!date) return undefined;
    
    if (date instanceof Date) {
      return moment(date).format('YYYY-MM-DD');
    }
    
    if (typeof date === 'string') {
      const parsed = moment(date);
      if (parsed.isValid()) {
        return parsed.format('YYYY-MM-DD');
      }
    }
    
    return undefined;
  };

  const [tempDate, setTempDate] = useState(formatDateToString(initialDate));

  useEffect(() => {
    setTempDate(formatDateToString(initialDate));
  }, [initialDate, visible]);

  const markedDates = useMemo(() => {
    return tempDate
      ? { [tempDate]: { selected: true, selectedColor: '#2F4FE3' } }
      : {};
  }, [tempDate]);

  const handleDone = () => {
    // Return the date in the format expected by parent
    // You can return as Date object or string based on parent's expectation
    onSelectDate(tempDate); // Returns YYYY-MM-DD string
    onClose();
  };

  // Validate if date is allowed (not before minDate)
  const isDateAllowed = (date) => {
    if (!minDate) return true;
    const minDateStr = formatMinDate(minDate);
    return moment(date).isSameOrAfter(moment(minDateStr), 'day');
  };

  const handleDayPress = (day) => {
    if (isDateAllowed(day.dateString)) {
      setTempDate(day.dateString);
    } else {
      // Optional: Show alert or feedback
      Alert.alert('Invalid Date', 'Selected date cannot be before start date.');
    }
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
            <View style={{ width: 60 }} />
          </View>
          
          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title || 'Select Date'}</Text>
          </View>

          {/* Quick Buttons */}
          <View style={styles.quickRow}>
            {['Today', 'Tomorrow', 'Next Monday'].map(label => {
              let date;
              if (label === 'Today') {
                date = moment();
              } else if (label === 'Tomorrow') {
                date = moment().add(1, 'day');
              } else {
                // Next Monday
                date = moment().day(8); // Next Monday
              }

              const dateStr = date.format('YYYY-MM-DD');
              const isDisabled = !isDateAllowed(dateStr);

              return (
                <TouchableOpacity
                  key={label}
                  style={[
                    styles.quickBtn,
                    isDisabled && styles.quickBtnDisabled
                  ]}
                  onPress={() => !isDisabled && setTempDate(dateStr)}
                  disabled={isDisabled}>
                  <Text style={[
                    styles.quickText,
                    isDisabled && styles.quickTextDisabled
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Calendar */}
          <Calendar
            current={tempDate}
            onDayPress={handleDayPress}
            enableSwipeMonths
            hideExtraDays
            markedDates={markedDates}
            minDate={formatMinDate(minDate)}
            theme={{
              selectedDayBackgroundColor: '#2F4FE3',
              todayTextColor: '#2F4FE3',
              arrowColor: '#000',
              disabledDayTextColor: '#d9e1e8',
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
  titleContainer: {
    backgroundColor: '#eee',
    padding: '2%',
    borderRadius: 8,
    marginVertical: '2%',
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
    backgroundColor: '#fff',
  },
  quickBtnDisabled: {
    borderColor: '#f0f0f0',
    backgroundColor: '#f9f9f9',
  },
  quickText: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'K2D-Regular',
  },
  quickTextDisabled: {
    color: '#ccc',
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
  doneText: { color: '#fff', fontWeight: '600' },
});