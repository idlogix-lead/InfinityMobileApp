import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import CalendarPicker from 'react-native-calendar-picker';

const DateFilter = ({ onDateSelected, onClose }) => {
    const [selectedStartDate, setSelectedStartDate] = useState(null);
    const [selectedEndDate, setSelectedEndDate] = useState(null);

    const onDateChange = (date, type) => {
        // Debugging log
        console.log("Date picked: ", date, " Type: ", type);

        const formattedDate = date ? date.toISOString().split('T')[0] : null;
        if (type === 'END_DATE') {
            setSelectedEndDate(formattedDate);
        } else {
            setSelectedStartDate(formattedDate);
            setSelectedEndDate(null); // Reset end date when start date is picked
        }
    };

    const handleFindClick = () => {
        console.log("Selected Start Date: ", selectedStartDate, " End Date: ", selectedEndDate); // Debugging log

        if (onDateSelected) {
            onDateSelected(selectedStartDate, selectedEndDate);
        }
        if (onClose) {
            onClose(); // Callback to close the bottom sheet
        }
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