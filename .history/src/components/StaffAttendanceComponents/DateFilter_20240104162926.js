import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import CalendarPicker from 'react-native-calendar-picker';

const DateFilter = ({ processedData, unprocessedData, onFilterApply }) => {
    const [selectedStartDate, setSelectedStartDate] = useState(null);
    const [selectedEndDate, setSelectedEndDate] = useState(null);

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

    const filterData = () => {
        const filteredProcessed = processedData.filter(item =>
            isDateInRange(item.AttDate, selectedStartDate, selectedEndDate)
        );
        const filteredUnprocessed = unprocessedData.filter(item =>
            isDateInRange(item.attendance_date, selectedStartDate, selectedEndDate)
        );

        // Pass the filtered data back to the parent component
        onFilteredData({
            processed: filteredProcessed,
            unprocessed: filteredUnprocessed
        });
    };

    const isDateInRange = (dateString, startDate, endDate) => {
        const date = new Date(dateString);
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : start;
        return date >= start && date <= end;
    };
    

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
            <TouchableOpacity onPress={() => {filterData()}}
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