import { ScrollView, StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import CustomHeader from '../../../components/CustomHeader'
import AntDesign from 'react-native-vector-icons/AntDesign'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import RBSheet from "react-native-raw-bottom-sheet";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CalendarPicker from 'react-native-calendar-picker';
import Loader from '../../../components/Loader'

const AttendenceStatus = () => {
    const bottomSheetRef = useRef();

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
                            // onDateChange={onDateChange}
                        />
                    </View>
                    <TouchableOpacity 
                    // onPress={filterAttendanceRecords}
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