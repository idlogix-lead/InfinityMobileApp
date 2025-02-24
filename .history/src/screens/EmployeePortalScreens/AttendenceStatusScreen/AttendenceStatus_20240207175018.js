import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native'
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
    const [sDate, setSDate] = useState(getParsedDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
    const [eDate, setEDate] = useState(getParsedDate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)));
    const [skipRecord, setSkipRecord] = useState(0);

    const page_size = 500;

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
            console.log(sDate,'strt')
            console.log(eDate,'end')
            setIsLoading(true);
            const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/HR_Processed_Attendance_V?$filter=ad_user_id eq ${Id} and AttDate ge ${sDate} and AttDate le ${eDate}&$skip=${skipRecord}&top=${page_size}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
            // console.log(response.data.records, 'success')
            setAttendanceRecords(response.data.records);
        } catch (error) {
            console.log('Error', error)
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getTotalAttendence();
    }, [sDate, eDate]);


    {/*Display Time format*/ }
    function formatTime(timeString) {
        if (!timeString) return 'null';

        const timeParts = timeString.split(':');
        return `${timeParts[0]}:${timeParts[1]}`;
    }

    function getParsedDate(date) {
        let dd = date.getDate();
        let mm = date.getMonth() + 1;
        let yyyy = date.getFullYear();
        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;
        return `${yyyy}-${mm}-${dd}`;
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
    
    const filterAttendanceRecords = () => {
        setSkipRecord(0);
        
        console.log(selectedStartDate,'selectedStartDate')
        console.log(selectedEndDate,'selectedEndDate')

        if (selectedStartDate && selectedEndDate) {
            setSDate(selectedStartDate);
            setEDate(selectedEndDate);
        } else if (selectedStartDate) {
            setSDate(selectedStartDate);
            setEDate(selectedStartDate);
        }
        getTotalAttendence();
        bottomSheetRef.current.close();
    };


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
                        onPress={filterAttendanceRecords}
                        style={styles.button} >

                        <Text style={styles.buttonText}>Find</Text>
                    </TouchableOpacity>
                </View>
            </RBSheet>
            {isLoading ? <Loader /> : attendanceRecords.length > 0 ? (
                <FlatList
                    data={attendanceRecords}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                />
            ) : (
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={[styles.filterCalenderText, { fontSize: 25, marginTop: '5%' }]}>No Result</Text>
                </View>
            )}
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