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
    </View>
  )
}

export default AttendenceStatus

const styles = StyleSheet.create({})