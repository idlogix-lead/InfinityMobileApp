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

const AttendenceStatus = ({ navigation }) => {
    const bottomSheetRef = useRef();
    const [isLoading, setIsLoading] = useState(false);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [selectedStartDate, setSelectedStartDate] = useState(null);
    const [selectedEndDate, setSelectedEndDate] = useState(null);
    const [isFilterApplied, setIsFilterApplied] = useState(false);
    const [filteredAttendanceRecords, setFilteredAttendanceRecords] = useState([]);
    const [showCurrentMonthOnly, setShowCurrentMonthOnly] = useState(true);

    // console.log(selectedStartDate)
    // console.log(selectedEndDate)
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);

    console.log(firstDayOfMonth);
    setSelectedStartDate(firstDayOfMonth);
    const openBottomSheet = () => {
        if (bottomSheetRef.current) {
            bottomSheetRef.current.open();
        }
    };

    const getTotalAttendence = async () => {
        const token = await AsyncStorage.getItem('token')
        const protocol = await AsyncStorage.getItem('protocol')
        const host = await AsyncStorage.getItem('host')
        const port = await AsyncStorage.getItem('port')
        const Id = await AsyncStorage.getItem("userId")
        try {
            setIsLoading(true);
            const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/HR_Processed_Attendance_V?$filter=ad_user_id eq ${Id}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
            // console.log(response.data.records, 'success')
            setAttendanceRecords(response.data.records);
            // if (showCurrentMonthOnly) {
            //     setFilteredAttendanceRecords(getCurrentMonthRecords(response.data.records));
            //     setIsFilterApplied(true);
            // }

        } catch (error) {
            console.log('Error', error)
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        // setIsFilterApplied(false);
        getTotalAttendence();
    }, [])

    {/*Current Month display Data Logic */ }
    // const isCurrentMonth = (dateString) => {
    //     const recordDate = new Date(dateString);
    //     const currentDate = new Date();
    //     return recordDate.getMonth() === currentDate.getMonth() &&
    //         recordDate.getFullYear() === currentDate.getFullYear();
    // };
    // const getCurrentMonthRecords = (records) => {
    //     return records.filter(record => isCurrentMonth(record.AttDate));
    // };

    {/*Display Time format*/ }
    function formatTime(timeString) {
        if (!timeString) return 'null';

        const timeParts = timeString.split(':');
        return `${timeParts[0]}:${timeParts[1]}`;
    }

    {/*Date Filteration Logic*/ }
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

    // const filterAttendanceRecords = () => {
    //     setIsFilterApplied(true);
    //     let filteredRecords = [];

    //     if (selectedStartDate && selectedEndDate) {
    //         // Filter for a range of dates
    //         const startDate = new Date(selectedStartDate);
    //         const endDate = new Date(selectedEndDate);
    //         filteredRecords = attendanceRecords.filter(record => {
    //             const recordDate = new Date(record.AttDate);
    //             return recordDate >= startDate && recordDate <= endDate;
    //         });
    //     } else if (selectedStartDate) {
    //         // Filter for a single date
    //         const selectedDate = new Date(selectedStartDate);
    //         filteredRecords = attendanceRecords.filter(record => {
    //             const recordDate = new Date(record.AttDate);
    //             return recordDate.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0];
    //         });
    //     }

    //     setFilteredAttendanceRecords(filteredRecords);
    //     bottomSheetRef.current.close();
    // };
    // const dataToRender = isFilterApplied ? filteredAttendanceRecords : attendanceRecords;


    const renderItem = ({ item }) => (
        <View style={styles.cardContainer}>
            <View style={styles.TopView}>
                <Text style={styles.dateTxt}>{item.AttDate}</Text>
                <View style={styles.liveRoll}>
                    <Text style={{ color: '#fff', fontFamily: 'K2D-Regular' }}>{item.att_status}</Text>
                </View>
            </View>
            <View style={[styles.bottomView, { marginTop: 5 }]}>
                <View style={styles.InnerContainer}>
                    <View style={{ padding: 5 }}>
                        <AntDesign name='login' size={20} color='#0050C0' />
                    </View>
                    <View>
                        <Text style={styles.titleTxt}>Check In</Text>
                        <Text style={styles.dateTxt}>{item.intime ? formatTime(item.intime) : 'null'}</Text>
                    </View>
                </View>
                <View style={styles.InnerContainer}>
                    <View style={{ padding: 5 }}>
                        <AntDesign name='logout' size={20} color='#0050C0' />
                    </View>
                    <View>
                        <Text style={styles.titleTxt}>Check Out</Text>
                        <Text style={styles.dateTxt}>{item.outtime ? formatTime(item.outtime) : 'null'}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.bottomView}>
                <View style={styles.InnerContainer}>
                    <View style={{ padding: 5 }}>
                        <FontAwesome name='building' size={20} color='#0050C0' />
                    </View>
                    <View>
                        <Text style={styles.titleTxt}>Department</Text>
                        <Text style={styles.dateTxt}>{item.department ? item.department : 'null'}</Text>
                    </View>
                </View>
                <View style={styles.InnerContainer}>
                    <View style={{ padding: 5 }}>
                        <FontAwesome name='building' size={20} color='#0050C0' />
                    </View>
                    <View>
                        <Text style={styles.titleTxt}>Sub-Department</Text>
                        <Text style={styles.dateTxt}>{item.subdepartment ? item.subdepartment : 'null'}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.StatusView}>
                <Text style={styles.StatusTxt}>{item.late ? 'Late' : 'On Time'}</Text>
            </View>
        </View>
    );

    return (
        <View style={{ flex: 1 }}>
            <CustomHeader title={'Attendance Status'} RightIcon="filter-variant" RightPress={openBottomSheet} />

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
                    <TouchableOpacity
                        // onPress={filterAttendanceRecords}
                        style={styles.button} >

                        <Text style={styles.buttonText}>Find</Text>
                    </TouchableOpacity>
                </View>
            </RBSheet>

            {/* {dataToRender.length > 0 ? ( */}
            <FlatList
                // data={dataToRender}
                data={attendanceRecords}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
            />
            {/* ) : isFilterApplied ? (
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={[styles.filterCalenderText, { fontSize: 25, marginTop: '5%' }]}>No Result</Text>
                </View>
            ) : null} */}

            {isLoading ? <Loader /> : null}
        </View>
    )
}

export default AttendenceStatus

const styles = StyleSheet.create({
    cardContainer: {
        width: '90%',
        backgroundColor: '#fff',
        alignSelf: 'center',
        marginTop: 13,
        borderRadius: 10,
        elevation: 3,
        borderLeftColor: '#00B0F0',
        borderLeftWidth: 4,
        paddingLeft: 10,
        paddingTop: 10,
        paddingBottom: 5,
    },
    TopView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    liveRoll: {
        backgroundColor: '#00B0F0',
        justifyContent: 'center',
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderTopLeftRadius: 20,
    },
    dateTxt: {
        color: '#000',
        fontFamily: 'K2D-Regular',
        width: 125,
    },
    bottomView: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    InnerContainer: {
        width: '50%',
        flexDirection: 'row',
    },
    titleTxt: {
        color: '#0050C0',
        fontFamily: 'K2D-Bold',
    },
    filterContainer: {
        padding: 16,
    },
    filterTitle: {
        fontSize: 30,
        marginBottom: 5,
        alignSelf: 'center',
        color: '#000',
        fontFamily: 'K2D-Bold',
    },
    filterCalenderText: {
        fontSize: 16,
        marginBottom: 16,
        marginLeft: 20,
        color: '#000',
        fontFamily: 'K2D-Bold',
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
    StatusView: {
        width: '90%',
        alignSelf: 'center',
        alignItems: 'flex-end'
    },
    StatusTxt: {
        fontFamily: 'K2D-Bold',
        color: '#000',
    },
})