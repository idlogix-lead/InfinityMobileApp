// CalendarStrip.jsx
import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';

const {width} = Dimensions.get('window');

const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// helper: returns Date object shifted by days
const shiftDate = (base, shift) => {
  const d = new Date(base);
  d.setDate(d.getDate() + shift);
  return d;
};

const formatDayNumber = d => `${d.getDate()}`; // 1..31
const formatMonthYear = d =>
  d.toLocaleString(undefined, {month: 'long', year: 'numeric'});
const formatWeekdayLetter = d =>
  d.toLocaleString(undefined, {weekday: 'short'}).charAt(0);

const SalesCalendar = ({
  initialDate = new Date(),
  onDateSelected = () => {},
  weekRange = 7, // number of days shown (7)
}) => {
  const [selected, setSelected] = useState(
    new Date(
      initialDate.getFullYear(),
      initialDate.getMonth(),
      initialDate.getDate(),
    ),
  );

  // compute start of week such that selected is in center (if possible)
  const days = useMemo(() => {
    // center index (for 7 -> 3)
    const center = Math.floor(weekRange / 2);
    const arr = [];
    for (let i = -center; i <= weekRange - center - 1; i++) {
      arr.push(shiftDate(selected, i));
    }
    return arr;
  }, [selected, weekRange]);

  const handlePrev = () => {
    // move selected one week back
    const prev = shiftDate(selected, -7);
    setSelected(prev);
    onDateSelected(prev);
  };

  const handleNext = () => {
    const next = shiftDate(selected, 7);
    setSelected(next);
    onDateSelected(next);
  };

  const handleSelect = date => {
    setSelected(date);
    onDateSelected(date);
  };

  const renderItem = ({item}) => {
    const isSelected =
      item.getFullYear() === selected.getFullYear() &&
      item.getMonth() === selected.getMonth() &&
      item.getDate() === selected.getDate();

    return (
      <TouchableOpacity
        style={styles.dayContainer}
        activeOpacity={0.7}
        onPress={() => handleSelect(item)}>
        <Text
          style={[styles.weekLetter, isSelected && styles.weekLetterSelected]}>
          {formatWeekdayLetter(item)}
        </Text>

        <View
          style={[styles.dateCircle, isSelected && styles.dateCircleSelected]}>
          <Text
            style={[
              styles.dateNumber,
              isSelected && styles.dateNumberSelected,
            ]}>
            {formatDayNumber(item)}
          </Text>
        </View>

        <Text
          style={[styles.monthLabel, isSelected && styles.monthLabelSelected]}>
          {/* optional small dot or kcal in your design; keeping blank for minimal look */}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* header: month + arrows */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.arrowBtn} onPress={handlePrev}>
          <Text style={styles.arrowText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.monthText}>{formatMonthYear(selected)}</Text>

        <TouchableOpacity style={styles.arrowBtn} onPress={handleNext}>
          <Text style={styles.arrowText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* date row */}
      <View style={styles.stripWrapper}>
        <FlatList
          data={days}
          horizontal
          keyExtractor={d => d.toISOString()}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.flatContent}
        />
      </View>
    </View>
  );
}
export default SalesCalendar;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    elevation:1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f7f4',
  },
  arrowText: {
    fontSize: 20,
    color: '#333',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  stripWrapper: {
    // card-like white area
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 6,
  },

  flatContent: {
    paddingHorizontal: 4,
    alignItems: 'center',
  },

  dayContainer: {
    width: Math.min((width - 80) / 7, 72),
    alignItems: 'center',
    marginHorizontal: 6,
  },

  weekLetter: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
    fontWeight: '500',
  },
  weekLetterSelected: {
    color: '#2e7d32', // green-ish when selected
    fontWeight: '700',
  },

  dateCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f6f6f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  dateCircleSelected: {
    backgroundColor: '#dff7da', // light green like picture
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  dateNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dateNumberSelected: {
    color: '#1b5e20', // darker green for selected number
  },

  monthLabel: {
    fontSize: 10,
    color: '#aaa',
  },
  monthLabelSelected: {
    color: '#2e7d32',
  },
});
