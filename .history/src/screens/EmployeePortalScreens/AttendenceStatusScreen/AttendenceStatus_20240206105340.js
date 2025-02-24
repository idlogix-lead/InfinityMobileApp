import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomHeader from '../../../components/CustomHeader';
import RBSheet from "react-native-raw-bottom-sheet";

const AttendenceStatus = () => {

    const openBottomSheet = () => {
        if (bottomSheetRef.current) {
            bottomSheetRef.current.open();
        }
    };

  return (
    <View>
        <CustomHeader title={'Attendance Status'} RightIcon="filter-variant" RightPress={openBottomSheet}/>

        <RBSheet
                ref={bottomSheetRef}
                openDuration={250}
                closeOnDragDown={true}
                closeOnPressMask={false}
                customStyles={{
                    container: {
                        borderTopRightRadius: 30,
                        borderTopLeftRadius: 30,
                        height: '70%',
                    }
                }}
            >
                <View style={styles.filterContainer}>
                    <Text style={styles.filterTitle}>Filter</Text>

                    <Text style={styles.filterCalenderText}>Filter by Date Wise</Text>
                    <View style={styles.calendarPosition}>
                        <CalendarPicker
                            startFromMonday={true}
                            allowRangeSelection={true}
                            todayBackgroundColor="#e6ffe6"
                            selectedDayColor="#66ff33"
                            selectedDayTextColor="#000000"
                            scaleFactor={375}
                            textStyle={{
                                fontFamily: 'Cochin',
                                color: '#000000',
                            }}
                            onDateChange={onDateChange}
                        />
                    </View>
                    <TouchableOpacity onPress={filterAttendanceRecords}
                        style={styles.button} >

                        <Text style={styles.buttonText}>Find</Text>
                    </TouchableOpacity>
                </View>
            </RBSheet>
    </View>
  )
}

export default AttendenceStatus

const styles = StyleSheet.create({})