import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import CalendarPicker from 'react-native-calendar-picker';

const DateFilter = ({ onDateSelected, onClose }) => {
    const [selectedStartDate, setSelectedStartDate] = useState(null);
    const [selectedEndDate, setSelectedEndDate] = useState(null);
    const [isFilterApplied, setIsFilterApplied] = useState(false);
    const [filteredAttendanceRecords, setFilteredAttendanceRecords] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);

    const onDateChange = (date) => {
        const formattedDate = date ? date.toISOString().split('T')[0] : null;
        if (!selectedStartDate) {
            setSelectedStartDate(formattedDate);
        } else if (selectedStartDate && !selectedEndDate) {
            setSelectedEndDate(formattedDate);
        } else {
            setSelectedStartDate(formattedDate);
            setSelectedEndDate(null);
        }
    };

    const handleFindClick = () => {
        setIsFilterApplied(true);
        let filteredRecords = [];

        if (selectedStartDate && selectedEndDate) {
            // Filter for a range of dates
            const startDate = new Date(selectedStartDate);
            const endDate = new Date(selectedEndDate);
            filteredRecords = attendanceRecords.filter(record => {
                const recordDate = new Date(record.AttDate);
                return recordDate >= startDate && recordDate <= endDate;
            });
        } else if (selectedStartDate) {
            // Filter for a single date
            const selectedDate = new Date(selectedStartDate);
            filteredRecords = attendanceRecords.filter(record => {
                const recordDate = new Date(record.AttDate);
                return recordDate.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0];
            });
        }

        setFilteredAttendanceRecords(filteredRecords);
    };
    const dataToRender = isFilterApplied ? filteredAttendanceRecords : attendanceRecords;

    return (
        <View style={styles.Container}>
            <View style={styles.calendarPosition}>
                <CalendarPicker
                    startFromMonday={true}
                    allowRangeSelection={true}
                    todayBackgroundColor="#e6ffe6"
                    selectedDayColor="#66ff33"
                    selectedDayTextColor="#000000"
                    scaleFactor={420}
                    textStyle={{
                        fontFamily: 'Cochin',
                        color: '#000000',
                    }}
                    onDateChange={onDateChange}
                />
            </View>
            <TouchableOpacity onPress={handleFindClick}
                style={styles.button} >
                <Text style={styles.buttonText}>Find</Text>
            </TouchableOpacity>
        </View>
    )
}

export default DateFilter

const styles = StyleSheet.create({
    Container: {
        padding: 10,
    },
    calendarPosition: {
    },
    button: {
        backgroundColor: '#00B0F0',
        borderRadius: 8,
        height: 40,
        width: 200,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        alignSelf: 'center',
        marginBottom: 20,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
})