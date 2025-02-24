import { StyleSheet, Text, View, TouchableOpacity, FlatList, ScrollView } from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import CustomHeader from '../../../components/CustomHeader'
import RBSheet from "react-native-raw-bottom-sheet";
import UnProceedCard from '../../../components/StaffAttendanceComponents/UnProceedCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Loader from '../../../components/Loader';
import CalendarPicker from 'react-native-calendar-picker';
import { Searchbar } from 'react-native-paper';
import TotalAttendance from '../../../components/StaffAttendanceComponents/TotalAttendance';
import AntDesign from 'react-native-vector-icons/AntDesign'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

const StaffAttendance = () => {
    const bottomSheetRef = useRef();

    

    const openBottomSheet = () => {
        if (bottomSheetRef.current) {
            bottomSheetRef.current.open();
        }
    };
    return (
        <View style={{ flex: 1, }}>
            <CustomHeader title={'Staff Attendance'} RightIcon="filter-variant" RightPress={openBottomSheet} />

            <View>
                <TotalAttendance />
                <View style={{ height: '81%' }}>
                    <View style={styles.TopButtons}>
                        <TouchableOpacity
                            style={[styles.ButtonView,]}

                        >
                            <Text style={[styles.ButtonTxt,]}>
                                Un Processed
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.ButtonView,]}
                        >
                            <Text style={[styles.ButtonTxt,]}>
                                Processed
                            </Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </View>
    )
}

export default StaffAttendance

const styles = StyleSheet.create({
    TopButtons: {
        width: '70%',
        height: 38,
        backgroundColor: '#ccc',
        alignSelf: 'center',
        marginTop: '6%',
        borderRadius: 30,
        flexDirection: 'row',
    },
    ButtonView: {
        width: '50%',
        height: 38,
        backgroundColor: '#ccc',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ButtonTxt: {
        color: '#000',
        fontFamily: 'K2D-Regular',
    },
    activeButton: {
        backgroundColor: '#00B0F0',
    },
    activeButtonText: {
        color: '#fff',
    },
})