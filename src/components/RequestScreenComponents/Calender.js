import { StyleSheet, Text, TouchableOpacity, View, Image, Modal } from 'react-native'
import React, { useState } from 'react'
import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';

const Calender = ({ width, dateTxt, marginLeft, widthDate, txt, showCalendar, closeBtnPress, showCalendarPress, onDateChange }) => {
    // const [selectDate,setSelectedDate] = useState('')
    return (
        <View style={{ width: width, marginTop: 10, marginLeft: marginLeft }}>
            <Text style={styles.txt}>{txt}</Text>
            <TouchableOpacity style={styles.btnCalender} onPress={showCalendarPress}>
                <View style={{ width: widthDate}}>
                    <Text style={styles.date}>{dateTxt}</Text>
                </View>
                <MaterialCommunityIcons name='calendar-month-outline' size={26} color='fff' style={styles.image} />
                {/* <Image source={require('../../asserts/taskDetailAssets/calendar.png')} style={styles.image} /> */}
            </TouchableOpacity>
        </View>
    )
}

export default Calender

const styles = StyleSheet.create({
    txt: {
        fontSize: 14,
        fontFamily: 'K2D-Regular',
        color: '#0070C0'
    },
    btnCalender: {
        borderColor: "#00B0F0",
        borderWidth: 1,
        borderRadius: 10,
        flexDirection: 'row',
        height:45,
        alignItems:'center'
    },
    date: {
        fontSize: 15,
        color: 'black',
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 2,
        fontFamily: 'K2D-Regular',
    },
    image: {
        height: '60%',
        width: '30%',
        color:'#0050C0'
        
       
        
    },
   })