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
  return (
    <View style={{ flex: 1, }}>
            <CustomHeader title={'Staff Attendance'} RightIcon="filter-variant" RightPress={openBottomSheet} />
    </View>
  )
}

export default StaffAttendance

const styles = StyleSheet.create({})