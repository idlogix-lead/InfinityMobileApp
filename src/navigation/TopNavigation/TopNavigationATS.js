// import { StyleSheet, Text, View, BackHandler, TextInput, ActivityIndicator, FlatList, TouchableOpacity, Image, Modal } from 'react-native'
// import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
// import ShowTeamTask from '../../screens/AllTaskScreen/ShowTeamTask';
// import AllTaskScreen from '../../screens/AllTaskScreen/AllTaskScreen';
// import React, { useState, useEffect, useRef } from 'react'
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import ChartCards from '../../components/RequestScreenComponents/ChartCards';
// import CalendarPicker from 'react-native-calendar-picker';
// import moment from 'moment';
// import CustomHeader from '../../components/CustomHeader';
// import RBSheet from "react-native-raw-bottom-sheet";
// import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';
// import { Picker } from '@react-native-picker/picker';


// const TapTab = createMaterialTopTabNavigator();

// const TopNavigationATS = () => {


//     const bottomSheetRef = useRef();

//     // const [showAllTasks, setShowAllTasks] = useState(false);
//     // const [selectedStatus, setSelectedStatus] = useState([])
//     // const [assignedName, setAssignedName] = useState('');

//     // const [isLoading, setIsLoading] = useState(false)
//     // const [data, setData] = useState([])
//     // const [recordLengths, setRecordLengths] = useState([]);
//     // const [unCompleteNum, setUnCompleteNum] = useState(0)
//     // const [completeNum, setCompleteNum] = useState(0)
//     // const [showCalendarStart, setShowCalendarStart] = useState(false);
//     // const [startDate, setStartDate] = useState('')
//     // const [showCalendarEnd, setShowCalendarEnd] = useState(false);
//     // const [endDate, setEndDate] = useState('')
//     // const [filteredData, setFilteredData] = useState([]);
//     // const [userNames, setUserNames] = useState([]);
//     // const [selectedUserName, setSelectedUserName] = useState('');




//     // const getAPIData = async (selectedFirstDay, selectedLastDay) => {
//     //     setIsLoading(true)
//     //     const token = await AsyncStorage.getItem('token')
//     //     const protocol = await AsyncStorage.getItem('protocol')
//     //     const host = await AsyncStorage.getItem('host')
//     //     const port = await AsyncStorage.getItem('port')
//     //     const userId = await AsyncStorage.getItem('userId')
//     //     const url = '`${protocol}://${host}:${port}/api/v1/models/mbl_request_view_v?$filter=Supervisor_ID eq ${userId} OR SalesRep_ID eq ${userId}`';
//     //     console.log(url,'TopNavigation')
//     //     setStartDate(selectedFirstDay)
//     //     setEndDate(selectedLastDay)
//     //     let idArray = []
//     //     fetch(`${protocol}://${host}:${port}/api/v1/models/mbl_request_view_v?$filter=Supervisor_ID eq ${userId} OR SalesRep_ID eq ${userId}`, {
//     //         method: 'GET',
//     //         headers: {
//     //             'Content-Type': 'application/json',
//     //             'Authorization': `Bearer ${token}`
//     //         }
//     //     })
//     //         .then(response => response.json())
//     //         .then(data => {
//     //             // console.log(JSON.stringify(data), "Dataaaaa")

//     //             const names = [...new Set(data.records.map(item => item.user_name))];
//     //             setUserNames(names);

//     //             for (let i = 0; i < data.records.length; i++) {
//     //                 idArray.push(data.records[i].id)
//     //             }
//     //             // const endCard = { uid: userId, Name: 'My Task', id: parseInt(userId) }
//     //             setData([...data.records])
//     //             fetchBasedOnId(idArray, protocol, host, port, userId, token, selectedFirstDay, selectedLastDay)

//     //         })
//     //         .catch(error => {
//     //             alert(error)
//     //             setIsLoading(false)
//     //         });

//     // }

//     // const fetchBasedOnId = async (idArray, protocol, host, port, userId, token, selectedFirstDay, selectedLastDay) => {
//     //     // idArray.push(endCard.id)
//     //     const promises = idArray.map(id =>
//     //         fetch(`${protocol}://${host}:${port}/api/v1/models/R_Request?$filter=SalesRep_ID eq ${id} AND CreatedBy eq ${userId}`, {
//     //             method: 'GET',
//     //             headers: {
//     //                 'Content-Type': 'application/json',
//     //                 'Authorization': `Bearer ${token}`
//     //             }
//     //         })
//     //             .then(response => response.json())

//     //             .catch(error => {
//     //                 console.error(error);
//     //             })
//     //     );
//     //     Promise.all(promises).then(results => {
//     //         let tempResultCurr = []
//     //         const dummyArray = results.reduce((acc, obj) => {
//     //             return acc.concat(obj.records);

//     //         }, []);

//     //         idArray.forEach((id) => {
//     //             const count = dummyArray.filter((item) => {
//     //                 return item.SalesRep_ID.id === id &&
//     //                     item.StartTime.slice(0, 10) >= selectedFirstDay &&
//     //                     item.StartTime.slice(0, 10) <= selectedLastDay;
//     //             }).length;
//     //             tempResultCurr.push(count)
//     //         });

//     //         setRecordLengths(tempResultCurr)
//     //         fetchunComplete(dummyArray, idArray, selectedFirstDay, selectedLastDay)
//     //     }).catch((err) => {
//     //         setIsLoading(false)
//     //     })
//     // }

//     // const fetchunComplete = async (dummyArray, idArray, selectedFirstDay, selectedLastDay) => {
//     //     let tempResult = []
//     //     let tempResultCom = []
//     //     const filterCompleteRecords = dummyArray.filter(item => item.R_Status_ID.id === 1000003);
//     //     idArray.forEach((id) => {
//     //         const count = dummyArray.filter((item) => {
//     //             return item.SalesRep_ID.id === id &&
//     //                 item.R_Status_ID.id === 1000003 &&
//     //                 item.StartTime.slice(0, 10) >= selectedFirstDay &&
//     //                 item.StartTime.slice(0, 10) <= selectedLastDay;
//     //         }).length;
//     //         tempResult.push(count)
//     //     });

//     //     idArray.forEach((id) => {
//     //         const count = dummyArray.filter((item) => {
//     //             return item.SalesRep_ID.id === id &&
//     //                 item.R_Status_ID.id !== 1000003 &&
//     //                 item.StartTime.slice(0, 10) >= selectedFirstDay &&
//     //                 item.StartTime.slice(0, 10) <= selectedLastDay;
//     //         }).length;
//     //         tempResultCom.push(count)
//     //     });

//     //     setCompleteNum(tempResult)
//     //     setUnCompleteNum(tempResultCom)
//     //     setIsLoading(false)
//     // }

//     // const navigateBack = () => {
//     //     const firstDayOfCurrMonth = moment().subtract('months').startOf('month').format('YYYY-MM-DD');
//     //     const lastDayOfCurrMonth = moment().subtract('months').endOf('month').format('YYYY-MM-DD');
//     //     const unsubscribe = navigation.addListener('focus', () => {
//     //         getAPIData(firstDayOfCurrMonth, lastDayOfCurrMonth)
//     //     });
//     //     return unsubscribe;
//     // }

//     // useEffect(() => {
//     //     navigateBack()
//     //     const backAction = () => {
//     //         navigation.goBack()
//     //         return true;
//     //     };
//     //     const backHandler = BackHandler.addEventListener(
//     //         "hardwareBackPress",
//     //         backAction
//     //     );
//     //     return () => backHandler.remove();
//     // }, [navigation])



//     // const onDateChangeStart = (date) => {
//     //     const formattedDate = moment.utc(date).format("YYYY-MM-DD");
//     //     if (formattedDate > endDate) {
//     //         alert('This Date must be smaller then end date')
//     //     } else {
//     //         setStartDate(formattedDate);
//     //         setShowCalendarStart(false);
//     //         // getAPIData(formattedDate, endDate)
//     //     }
//     // };

//     // const onDateChangeEnd = (date) => {
//     //     const formattedDate = moment.utc(date).format("YYYY-MM-DD");
//     //     if (formattedDate < startDate) {
//     //         alert('This Date must be greater then start date')
//     //     } else {
//     //         setEndDate(formattedDate);
//     //         setShowCalendarEnd(false);
//     //         // getAPIData(startDate, formattedDate)
//     //     }
//     // }

//     // const openBottomSheet = () => {
//     //     if (bottomSheetRef.current) {
//     //         bottomSheetRef.current.open();
//     //     }
//     // };
//     // const CloseBottomSheet = () => {
//     //     if (bottomSheetRef.current) {
//     //         bottomSheetRef.current.close()
//     //     }
//     // }
//     // const applyFilter = (filterName) => {
//     //     const filtered = chartCardData.filter(item => item.name.toLowerCase().includes(filterName.toLowerCase()));
//     //     setFilteredData(filtered);
//     // };
//     // const aggregatedData = data.reduce((acc, currentItem) => {
//     //     const userName = currentItem.user_name;
//     //     if (!acc[userName]) {
//     //         acc[userName] = {
//     //             assignedCount: 0,
//     //             completedCount: 0,
//     //             pendingCount: 0,
//     //         };
//     //     }
//     //     acc[userName].assignedCount++;
//     //     if (currentItem.R_Status_ID.id == 1000003) {
//     //         acc[userName].completedCount++;
//     //     } else {
//     //         acc[userName].pendingCount++;
//     //     }
//     //     return acc;
//     // }, {});

//     // const chartCardData = Object.keys(aggregatedData).map(userName => ({
//     //     name: userName,
//     //     assigned: aggregatedData[userName].assignedCount,
//     //     completed: aggregatedData[userName].completedCount,
//     //     pending: aggregatedData[userName].pendingCount,

//     // }));

//     // useEffect(() => {
//     //     const filtered = data.filter(item => {
//     //         const isNameMatched = !assignedName || item?.user_name.includes(assignedName);
//     //         let isStatusMatched = false;

//     //         if (selectedStatus.length > 0) {
//     //             isStatusMatched = selectedStatus.some(status => {
//     //                 if (status.value === 'FinalClose') {
//     //                     // return item?.R_Status_ID?.toLowerCase() === 'finalClose';
//     //                     return item?.R_Status_ID?.id === 1000003;
//     //                 } else if (status.value === 'Close') {
//     //                     return item?.R_Status_ID?.id === 1000002;
//     //                 } else {
//     //                     return item?.R_Status_ID?.identifier.toLowerCase().includes(status.value.toLowerCase());
//     //                 }
//     //             });
//     //         } else {
//     //             isStatusMatched = true;
//     //         }
//     //         const isOwnTask = showAllTasks ? item?.SalesRep_ID?.id == userId : true;
//     //         const itemStartDate = moment(item?.StartDate, 'DD-MM-YYYY');
//     //         const itemEndDate = moment(item?.EndTime, 'DD-MM-YYYY');
//     //         const selectedStartDate = startDate ? moment(startDate, 'DD-MM-YYYY') : null;
//     //         const selectedEndDate = endDate ? moment(endDate, 'DD-MM-YYYY') : null;
//     //         const isStartDateMatched = !selectedStartDate || itemStartDate.isSameOrAfter(selectedStartDate);
//     //         const isEndDateMatched = !selectedEndDate || itemEndDate.isSameOrBefore(selectedEndDate);
//     //         return isNameMatched && isStatusMatched && isOwnTask && isStartDateMatched && isEndDateMatched;
//     //     });

//     //     setFilteredData(filtered);
//     // }, [showAllTasks, selectedStatus, assignedName, startDate, endDate, data]);

//     // useEffect(() => {
//     //     console.log("Filtered Data:", filteredData);
//     //     console.log("Chart Card Data:", chartCardData);
//     // }, [filteredData, chartCardData]);


//     return (
//         <View style={{ flex: 1 }}>
//             {/* CustomHeader */}
//             <CustomHeader title=" ATS" RightIcon="filter-variant" />

//             {/* Performance Screen COde*/}
//             {/* <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center' }}>
//                 <RBSheet
//                     ref={bottomSheetRef}
//                     height={370}
//                     openDuration={250}
//                     closeOnDragDown={true}
//                     closeOnPressMask={false}
//                     customStyles={{
//                         container: {
//                             padding: 10,
//                             borderTopRightRadius: 30,
//                             borderTopLeftRadius: 30,

//                         }
//                     }}
//                 >
//                     <View style={styles.filterContainer}>
//                         <Text style={styles.filterTitle}>Filter</Text>
//                         <View style={{ marginTop: 20 }}>
//                             <Text style={{ fontSize: 18, color: '#000', }}>Name</Text>

//                             <View style={{ borderWidth: 1, paddingLeft: 10, borderRadius: 10, marginTop: 10 }}>

//                                 <Picker
//                                     selectedValue={selectedUserName}
//                                     onValueChange={(itemValue) => {
//                                         setSelectedUserName(itemValue);
//                                         applyFilter(itemValue);
//                                     }}
//                                 >
//                                     <Picker.Item label="Select a name" value="" />
//                                     {userNames.map((name, index) => (
//                                         <Picker.Item key={index} label={name} value={name} />
//                                     ))}
//                                 </Picker>
//                             </View>
//                         </View>
//                         <View style={{ marginTop: 20 }}>
//                             <Text style={{ fontSize: 18, color: '#000', }}>Date</Text>

//                             <View style={{ flexDirection: 'row', marginTop: 10, marginBottom: 5, justifyContent: 'space-between' }}>
//                                 <TouchableOpacity style={styles.fromBtn} onPress={() => setShowCalendarStart(true)}>
//                                     <View style={{ width: '80%', borderWidth: 1, alignItems: 'center', justifyContent: 'center', height: 30, borderRadius: 5 }} >
//                                         <Text style={styles.txt}>{startDate ? startDate : "Start Date"}</Text>
//                                     </View>
//                                     <MaterialCommunityIcons name='calendar-month-outline' size={26} color='#00B0F0' style={styles.calender} />
//                                 </TouchableOpacity>
//                                 <TouchableOpacity style={styles.toBtn} onPress={() => setShowCalendarEnd(true)}>
//                                     <View style={{ width: '80%', borderWidth: 1, alignItems: 'center', justifyContent: 'center', height: 30, borderRadius: 5 }}>
//                                         <Text style={styles.txt}>{endDate ? endDate : 'End Date'}</Text>
//                                     </View>
//                                     <MaterialCommunityIcons name='calendar-month-outline' size={26} color='#00B0F0' style={styles.calender} />

//                                 </TouchableOpacity>

//                             </View>
//                         </View>

//                         <TouchableOpacity
//                             style={{ backgroundColor: '#00B0F0', width: '50%', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 10, marginTop: 30 }}
//                             onPress={CloseBottomSheet}
//                         >
//                             <Text style={{ color: '#fff' }}>Close</Text>
//                         </TouchableOpacity>

//                     </View>
//                 </RBSheet>
//                 <Modal visible={showCalendarStart} animationType="slide" transparent={true}>
//                     <View style={styles.blurView}  >
//                         <View style={styles.modal}>
//                             <CalendarPicker
//                                 onDateChange={onDateChangeStart}
//                                 previousTitleStyle={{ color: 'white', marginLeft: 15, fontFamily: 'K2D-Regular' }}
//                                 nextTitleStyle={{ color: 'white', marginRight: 15, fontFamily: 'K2D-Regular' }}
//                                 textStyle={{
//                                     color: 'white',
//                                     fontFamily: 'K2D-Regular'
//                                 }}
//                                 customDatesStyles={{
//                                     color: 'white',
//                                     fontFamily: 'K2D-Regular'
//                                 }}
//                             />
//                             <TouchableOpacity style={styles.closeBtn} onPress={() => setShowCalendarStart(false)}>
//                                 <Text style={styles.close}>Close</Text>
//                             </TouchableOpacity>
//                         </View>
//                     </View>
//                 </Modal>
//                 <Modal visible={showCalendarEnd} animationType="slide" transparent={true}>
//                     <View style={styles.blurView}  >
//                         <View style={styles.modal}>
//                             <CalendarPicker
//                                 onDateChange={onDateChangeEnd}
//                                 previousTitleStyle={{ color: 'white', marginLeft: 15, fontFamily: 'K2D-Regular' }}
//                                 nextTitleStyle={{ color: 'white', marginRight: 15, fontFamily: 'K2D-Regular' }}
//                                 textStyle={{
//                                     color: 'white',
//                                     fontFamily: 'K2D-Regular'
//                                 }}
//                                 customDatesStyles={{
//                                     color: 'white',
//                                     fontFamily: 'K2D-Regular'
//                                 }}
//                             />
//                             <TouchableOpacity onPress={() => setShowCalendarEnd(false)} style={styles.closeBtn}>
//                                 <Text style={{ color: 'black' }}>Close</Text>
//                             </TouchableOpacity>
//                         </View>
//                     </View>
//                 </Modal>
//                 <FlatList
//                     data={filteredData.length > 0 ? filteredData : chartCardData}
//                     renderItem={({ item }) => {
//                         const progressPercentage = (item.completed / item.assigned) || 0;
//                         return (
//                             <ChartCards
//                                 name={item.name}
//                                 firstTop="Assigned"
//                                 secTop="Completed"
//                                 thirdTop="Pending"
//                                 percentageNum={progressPercentage}
//                                 total={item.assigned}
//                                 comp={item.completed}
//                                 unComp={item.pending}
//                             />
//                         );
//                     }}
//                 />
//             </View> */}







//             {/* TopTab Navigator */}
//             <TapTab.Navigator
//                 screenOptions={{
//                     tabBarLabelStyle: { fontSize: 14 },
//                     tabBarIndicatorStyle: { backgroundColor: '#0050C0' },
//                     tabBarStyle: {
//                         backgroundColor: '#f9f9f9',
//                         elevation: 2,
//                     },
//                 }}
//             >
//                 <TapTab.Screen name="AllTaskScreen" component={AllTaskScreen} />
//                 <TapTab.Screen name="ShowTeamTask" component={ShowTeamTask} />
//             </TapTab.Navigator>
//         </View>
//     );
// };

// export default TopNavigationATS;

// const styles = StyleSheet.create({
//     Header: {
//         backgroundColor: '#0050C0',
//         paddingVertical: 10,
//         paddingHorizontal: 20,
//     },
//     fromBtn: {
//         width: '40%',
//         flexDirection: 'row',
//         height: 35,
//         alignItems: 'center',
//     },
//     toBtn: {
//         width: '40%',
//         marginLeft: 10,
//         flexDirection: 'row',
//         height: 35
//     },
//     image: {
//         height: '80%',
//         width: '30%'
//     },
//     txt: {
//         color: 'black',
//         fontSize: 15,
//         fontFamily: 'K2D-Bold'
//     },
//     blurView: {
//         alignItems: 'center',
//         justifyContent: 'center',
//         flex: 1,
//         backgroundColor: 'rgba(0,0,0,0.5)'
//     },
//     filterContainer: {
//         marginHorizontal: 20

//     },
//     filterTitle: {
//         fontSize: 26,
//         fontWeight: 'bold',
//         fontFamily: 'K2D',
//         color: '#000'

//     },
//     modal: {
//         width: '90%',
//         backgroundColor: '#800000',
//         borderRadius: 20,
//         alignItems: 'center'
//     },
//     closeBtn: {
//         backgroundColor: 'white',
//         height: '10%',
//         width: '40%',
//         marginTop: 20,
//         alignItems: 'center',
//         justifyContent: 'center',
//         borderRadius: 20
//     },
//     calender: {
//         width: '30%',
//         alignItems: 'center',
//         marginLeft: 10
//     },
//     close: {
//         color: '#800000',
//         fontSize: 16,
//         fontFamily: 'K2D-Regular'
//     },

// });





// import { StyleSheet, Text, View, BackHandler, TextInput, ActivityIndicator, FlatList, TouchableOpacity, Image, Modal } from 'react-native';
// import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
// import ShowTeamTask from '../../screens/AllTaskScreen/ShowTeamTask';
// import AllTaskScreen from '../../screens/AllTaskScreen/AllTaskScreen';
// import React, { useState, useEffect, useRef } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import ChartCards from '../../components/RequestScreenComponents/ChartCards';
// import CalendarPicker from 'react-native-calendar-picker';
// import moment from 'moment';
// import CustomHeader from '../../components/CustomHeader';
// import RBSheet from "react-native-raw-bottom-sheet";
// import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';
// import { Picker } from '@react-native-picker/picker';

// const TapTab = createMaterialTopTabNavigator();

// const TopNavigationATS = () => {
//     const bottomSheetRef = useRef();
//     const [showAllTasks, setShowAllTasks] = useState(false);
//     const [selectedStatus, setSelectedStatus] = useState([]);
//     const [assignedName, setAssignedName] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
//     const [data, setData] = useState([]);
//     const [recordLengths, setRecordLengths] = useState([]);
//     const [unCompleteNum, setUnCompleteNum] = useState(0);
//     const [completeNum, setCompleteNum] = useState(0);
//     const [showCalendarStart, setShowCalendarStart] = useState(false);
//     const [startDate, setStartDate] = useState('');
//     const [showCalendarEnd, setShowCalendarEnd] = useState(false);
//     const [endDate, setEndDate] = useState('');
//     const [filteredData, setFilteredData] = useState([]);
//     const [userNames, setUserNames] = useState([]);
//     const [selectedUserName, setSelectedUserName] = useState('');

//     const getAPIData = async (selectedFirstDay, selectedLastDay) => {
//         setIsLoading(true);
//         const token = await AsyncStorage.getItem('token');
//         const protocol = await AsyncStorage.getItem('protocol');
//         const host = await AsyncStorage.getItem('host');
//         const port = await AsyncStorage.getItem('port');
//         const userId = await AsyncStorage.getItem('userId');
//         setStartDate(selectedFirstDay);
//         setEndDate(selectedLastDay);
//         let idArray = [];
//         fetch(`${protocol}://${host}:${port}/api/v1/models/mbl_request_view_v?$filter=Supervisor_ID eq ${userId} OR SalesRep_ID eq ${userId}`, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`
//             }
//         })
//             .then(response => response.json())
//             .then(data => {
//                 console.log(JSON.stringify(data), "Dataaaaa");
//                 const names = [...new Set(data.records.map(item => item.user_name))];
//                 setUserNames(names);
//                 for (let i = 0; i < data.records.length; i++) {
//                     idArray.push(data.records[i].id);
//                 }
//                 setData([...data.records]);
//                 fetchBasedOnId(idArray, protocol, host, port, userId, token, selectedFirstDay, selectedLastDay);
//             })
//             .catch(error => {
//                 alert(error);
//                 setIsLoading(false);
//             });
//     };

//     const fetchBasedOnId = async (idArray, protocol, host, port, userId, token, selectedFirstDay, selectedLastDay) => {
//         const promises = idArray.map(id =>
//             fetch(`${protocol}://${host}:${port}/api/v1/models/R_Request?$filter=SalesRep_ID eq ${id} AND CreatedBy eq ${userId}`, {
//                 method: 'GET',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`
//                 }
//             })
//                 .then(response => response.json())
//                 .catch(error => {
//                     console.error(error);
//                 })
//         );
//         Promise.all(promises).then(results => {
//             let tempResultCurr = [];
//             const dummyArray = results.reduce((acc, obj) => {
//                 return acc.concat(obj.records);
//             }, []);
//             idArray.forEach((id) => {
//                 const count = dummyArray.filter((item) => {
//                     return item.SalesRep_ID.id === id &&
//                         item.StartTime.slice(0, 10) >= selectedFirstDay &&
//                         item.StartTime.slice(0, 10) <= selectedLastDay;
//                 }).length;
//                 tempResultCurr.push(count);
//             });
//             setRecordLengths(tempResultCurr);
//             fetchunComplete(dummyArray, idArray, selectedFirstDay, selectedLastDay);
//         }).catch((err) => {
//             setIsLoading(false);
//         });
//     };

//     const fetchunComplete = async (dummyArray, idArray, selectedFirstDay, selectedLastDay) => {
//         let tempResult = [];
//         let tempResultCom = [];
//         const filterCompleteRecords = dummyArray.filter(item => item.R_Status_ID.id === 1000003);
//         idArray.forEach((id) => {
//             const count = dummyArray.filter((item) => {
//                 return item.SalesRep_ID.id === id &&
//                     item.R_Status_ID.id === 1000003 &&
//                     item.StartTime.slice(0, 10) >= selectedFirstDay &&
//                     item.StartTime.slice(0, 10) <= selectedLastDay;
//             }).length;
//             tempResult.push(count);
//         });
//         idArray.forEach((id) => {
//             const count = dummyArray.filter((item) => {
//                 return item.SalesRep_ID.id === id &&
//                     item.R_Status_ID.id !== 1000003 &&
//                     item.StartTime.slice(0, 10) >= selectedFirstDay &&
//                     item.StartTime.slice(0, 10) <= selectedLastDay;
//             }).length;
//             tempResultCom.push(count);
//         });
//         setCompleteNum(tempResult);
//         setUnCompleteNum(tempResultCom);
//         setIsLoading(false);
//     };

//     const onDateChangeStart = (date) => {
//         const formattedDate = moment.utc(date).format("YYYY-MM-DD");
//         if (formattedDate > endDate) {
//             alert('This Date must be smaller than end date');
//         } else {
//             setStartDate(formattedDate);
//             setShowCalendarStart(false);
//         }
//     };

//     const onDateChangeEnd = (date) => {
//         const formattedDate = moment.utc(date).format("YYYY-MM-DD");
//         if (formattedDate < startDate) {
//             alert('This Date must be greater than start date');
//         } else {
//             setEndDate(formattedDate);
//             setShowCalendarEnd(false);
//         }
//     };

//     const openBottomSheet = () => {
//         if (bottomSheetRef.current) {
//             bottomSheetRef.current.open();
//         }
//     };

//     const CloseBottomSheet = () => {
//         if (bottomSheetRef.current) {
//             bottomSheetRef.current.close();
//         }
//     };

//     const applyFilter = (filterName) => {
//         const filtered = chartCardData.filter(item => item.name.toLowerCase().includes(filterName.toLowerCase()));
//         setFilteredData(filtered);
//     };

//     const aggregatedData = data.reduce((acc, currentItem) => {
//         const userName = currentItem.user_name;
//         if (!acc[userName]) {
//             acc[userName] = {
//                 assignedCount: 0,
//                 completedCount: 0,
//                 pendingCount: 0,
//             };
//         }
//         acc[userName].assignedCount++;
//         if (currentItem.R_Status_ID.id == 1000003) {
//             acc[userName].completedCount++;
//         } else {
//             acc[userName].pendingCount++;
//         }
//         return acc;
//     }, {});

//     const chartCardData = Object.keys(aggregatedData).map(userName => ({
//         name: userName,
//         assigned: aggregatedData[userName].assignedCount,
//         completed: aggregatedData[userName].completedCount,
//         pending: aggregatedData[userName].pendingCount,
//     }));

//     useEffect(() => {
//         const filtered = data.filter(item => {
//             const isNameMatched = !assignedName || item?.user_name.includes(assignedName);
//             let isStatusMatched = false;
//             if (selectedStatus.length > 0) {
//                 isStatusMatched = selectedStatus.some(status => {
//                     if (status.value === 'FinalClose') {
//                         return item?.R_Status_ID?.id === 1000003;
//                     } else if (status.value === 'Close') {
//                         return item?.R_Status_ID?.id === 1000002;
//                     } else {
//                         return item?.R_Status_ID?.identifier.toLowerCase().includes(status.value.toLowerCase());
//                     }
//                 });
//             } else {
//                 isStatusMatched = true;
//             }
//             const isOwnTask = showAllTasks ? item?.SalesRep_ID?.id == userId : true;
//             const itemStartDate = moment(item?.StartDate, 'DD-MM-YYYY');
//             const itemEndDate = moment(item?.EndTime, 'DD-MM-YYYY');
//             const selectedStartDate = startDate ? moment(startDate, 'DD-MM-YYYY') : null;
//             const selectedEndDate = endDate ? moment(endDate, 'DD-MM-YYYY') : null;
//             const isStartDateMatched = !selectedStartDate || itemStartDate.isSameOrAfter(selectedStartDate);
//             const isEndDateMatched = !selectedEndDate || itemEndDate.isSameOrBefore(selectedEndDate);
//             return isNameMatched && isStatusMatched && isOwnTask && isStartDateMatched && isEndDateMatched;
//         });
//         setFilteredData(filtered);
//     }, [showAllTasks, selectedStatus, assignedName, startDate, endDate, data]);

//     return (
//         <View style={{ flex: 1,}}>
//             <CustomHeader title=" ATS" RightIcon="filter-variant" />
//             <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center' }}>
//                 <RBSheet
//                     ref={bottomSheetRef}
//                     height={370}
//                     openDuration={250}
//                     closeOnDragDown={true}
//                     closeOnPressMask={false}
//                     customStyles={{
//                         container: {
//                             padding: 10,
//                             borderTopRightRadius: 30,
//                             borderTopLeftRadius: 30,
//                         }
//                     }}
//                 >
//                     <View style={styles.filterContainer}>
//                         <Text style={styles.filterTitle}>Filter</Text>
//                         <View style={{ marginTop: 20 }}>
//                             <Text style={{ fontSize: 18, color: '#000', }}>Name</Text>
//                             <View style={{ borderWidth: 1, paddingLeft: 10, borderRadius: 10, marginTop: 10 }}>
//                                 <Picker
//                                     selectedValue={selectedUserName}
//                                     onValueChange={(itemValue) => {
//                                         setSelectedUserName(itemValue);
//                                         applyFilter(itemValue);
//                                     }}
//                                 >
//                                     <Picker.Item label="Select a name" value="" />
//                                     {userNames.map((name, index) => (
//                                         <Picker.Item key={index} label={name} value={name} />
//                                     ))}
//                                 </Picker>
//                             </View>
//                         </View>
//                         <View style={{ marginTop: 20 }}>
//                             <Text style={{ fontSize: 18, color: '#000', }}>Date</Text>
//                             <View style={{ flexDirection: 'row', marginTop: 10, marginBottom: 5, justifyContent: 'space-between' }}>
//                                 <TouchableOpacity style={styles.fromBtn} onPress={() => setShowCalendarStart(true)}>
//                                     <View style={{ width: '80%', borderWidth: 1, alignItems: 'center', justifyContent: 'center', height: 30, borderRadius: 5 }} >
//                                         <Text style={styles.txt}>{startDate ? startDate : "Start Date"}</Text>
//                                     </View>
//                                     <MaterialCommunityIcons name='calendar-month-outline' size={26} color='#00B0F0' style={styles.calender} />
//                                 </TouchableOpacity>
//                                 <TouchableOpacity style={styles.toBtn} onPress={() => setShowCalendarEnd(true)}>
//                                     <View style={{ width: '80%', borderWidth: 1, alignItems: 'center', justifyContent: 'center', height: 30, borderRadius: 5 }}>
//                                         <Text style={styles.txt}>{endDate ? endDate : 'End Date'}</Text>
//                                     </View>
//                                     <MaterialCommunityIcons name='calendar-month-outline' size={26} color='#00B0F0' style={styles.calender} />
//                                 </TouchableOpacity>
//                             </View>
//                         </View>
//                         <TouchableOpacity
//                             style={{ backgroundColor: '#00B0F0', width: '50%', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 10, marginTop: 30 }}
//                             onPress={CloseBottomSheet}
//                         >
//                             <Text style={{ color: '#fff' }}>Close</Text>
//                         </TouchableOpacity>
//                     </View>
//                 </RBSheet>

//                 <Modal visible={showCalendarStart} animationType="slide" transparent={true}>
//                     <View style={styles.blurView}>
//                         <View style={styles.modal}>
//                             <CalendarPicker
//                                 onDateChange={onDateChangeStart}
//                                 previousTitleStyle={{ color: 'white', marginLeft: 15, fontFamily: 'K2D-Regular' }}
//                                 nextTitleStyle={{ color: 'white', marginRight: 15, fontFamily: 'K2D-Regular' }}
//                                 textStyle={{
//                                     color: 'white',
//                                     fontFamily: 'K2D-Regular'
//                                 }}
//                                 customDatesStyles={{
//                                     color: 'white',
//                                     fontFamily: 'K2D-Regular'
//                                 }}
//                             />
//                             <TouchableOpacity style={styles.closeBtn} onPress={() => setShowCalendarStart(false)}>
//                                 <Text style={styles.close}>Close</Text>
//                             </TouchableOpacity>
//                         </View>
//                     </View>
//                 </Modal>

//                 <Modal visible={showCalendarEnd} animationType="slide" transparent={true}>
//                     <View style={styles.blurView}>
//                         <View style={styles.modal}>
//                             <CalendarPicker
//                                 onDateChange={onDateChangeEnd}
//                                 previousTitleStyle={{ color: 'white', marginLeft: 15, fontFamily: 'K2D-Regular' }}
//                                 nextTitleStyle={{ color: 'white', marginRight: 15, fontFamily: 'K2D-Regular' }}
//                                 textStyle={{
//                                     color: 'white',
//                                     fontFamily: 'K2D-Regular'
//                                 }}
//                                 customDatesStyles={{
//                                     color: 'white',
//                                     fontFamily: 'K2D-Regular'
//                                 }}
//                             />
//                             <TouchableOpacity onPress={() => setShowCalendarEnd(false)} style={styles.closeBtn}>
//                                 <Text style={{ color: 'black' }}>Close</Text>
//                             </TouchableOpacity>
//                         </View>
//                     </View>
//                 </Modal>

//                 <FlatList
//                     data={filteredData.length > 0 ? filteredData : chartCardData}
//                     renderItem={({ item }) => {
//                         const progressPercentage = (item.completed / item.assigned) || 0;
//                         return (
//                             <ChartCards
//                                 name={item.name}
//                                 firstTop="Assigned"
//                                 secTop="Completed"
//                                 thirdTop="Pending"
//                                 percentageNum={progressPercentage}
//                                 total={item.assigned}
//                                 comp={item.completed}
//                                 unComp={item.pending}
//                             />
//                         );
//                     }}
//                     keyExtractor={(item, index) => index.toString()}
//                     contentContainerStyle={{ paddingBottom: 20 }}
//                 />
//             </View>

//             <TapTab.Navigator
//                 screenOptions={{
//                     tabBarLabelStyle: { fontSize: 14 },
//                     tabBarIndicatorStyle: { backgroundColor: '#0050C0' },
//                     tabBarStyle: {
//                         backgroundColor: '#f9f9f9',
//                         elevation: 2,
//                     },
//                 }}
//             >
//                 <TapTab.Screen name="AllTaskScreen" component={AllTaskScreen} />
//                 <TapTab.Screen name="ShowTeamTask" component={ShowTeamTask} />
//             </TapTab.Navigator>
//         </View>
//     );
// };

// export default TopNavigationATS;

// const styles = StyleSheet.create({
//     Header: {
//         backgroundColor: '#0050C0',
//         paddingVertical: 10,
//         paddingHorizontal: 20,
//     },
//     fromBtn: {
//         width: '40%',
//         flexDirection: 'row',
//         height: 35,
//         alignItems: 'center',
//     },
//     toBtn: {
//         width: '40%',
//         marginLeft: 10,
//         flexDirection: 'row',
//         height: 35
//     },
//     image: {
//         height: '80%',
//         width: '30%'
//     },
//     txt: {
//         color: 'black',
//         fontSize: 15,
//         fontFamily: 'K2D-Bold'
//     },
//     blurView: {
//         alignItems: 'center',
//         justifyContent: 'center',
//         flex: 1,
//         backgroundColor: 'rgba(0,0,0,0.5)'
//     },
//     filterContainer: {
//         marginHorizontal: 20
//     },
//     filterTitle: {
//         fontSize: 26,
//         fontWeight: 'bold',
//         fontFamily: 'K2D',
//         color: '#000'
//     },
//     modal: {
//         width: '90%',
//         backgroundColor: '#800000',
//         borderRadius: 20,
//         alignItems: 'center'
//     },
//     closeBtn: {
//         backgroundColor: 'white',
//         height: '10%',
//         width: '40%',
//         marginTop: 20,
//         alignItems: 'center',
//         justifyContent: 'center',
//         borderRadius: 20
//     },
//     calender: {
//         width: '30%',
//         alignItems: 'center',
//         marginLeft: 10
//     },
//     close: {
//         color: '#800000',
//         fontSize: 16,
//         fontFamily: 'K2D-Regular'
//     }
// });



















// import React, { useState, useEffect, useRef } from 'react';
// import { StyleSheet, Text, View, ActivityIndicator, FlatList, TouchableOpacity, Modal } from 'react-native';
// import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import ChartCards from '../../components/RequestScreenComponents/ChartCards';
// import CalendarPicker from 'react-native-calendar-picker';
// import moment from 'moment';
// import CustomHeader from '../../components/CustomHeader';
// import RBSheet from 'react-native-raw-bottom-sheet';
// import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';
// import { Picker } from '@react-native-picker/picker';
// import AllTaskScreen from '../../screens/AllTaskScreen/AllTaskScreen';
// import ShowTeamTask from '../../screens/AllTaskScreen/ShowTeamTask';

// const TapTab = createMaterialTopTabNavigator();

// const TopNavigationATS = () => {
//     const bottomSheetRef = useRef();
//     const [isLoading, setIsLoading] = useState(false);
//     const [data, setData] = useState([]);
//     const [filteredData, setFilteredData] = useState([]);
//     const [userNames, setUserNames] = useState([]);
//     const [selectedUserName, setSelectedUserName] = useState('');
//     const [startDate, setStartDate] = useState('');
//     const [endDate, setEndDate] = useState('');
//     const [showCalendarStart, setShowCalendarStart] = useState(false);
//     const [showCalendarEnd, setShowCalendarEnd] = useState(false);

//     // Fetch data from API
//     const getAPIData = async (selectedFirstDay, selectedLastDay) => {
//         setIsLoading(true);
//         try {
//             const token = await AsyncStorage.getItem('token');
//             const protocol = await AsyncStorage.getItem('protocol');
//             const host = await AsyncStorage.getItem('host');
//             const port = await AsyncStorage.getItem('port');
//             const userId = await AsyncStorage.getItem('userId');

//             const response = await fetch(
//                 `${protocol}://${host}:${port}/api/v1/models/mbl_request_view_v?$filter=Supervisor_ID eq ${userId} OR SalesRep_ID eq ${userId}`,
//                 {
//                     method: 'GET',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         Authorization: `Bearer ${token}`,
//                     },
//                 }
//             );

//             const result = await response.json();
//             const names = [...new Set(result.records.map((item) => item.user_name))];
//             setUserNames(names);
//             setData(result.records);
//             setFilteredData(result.records);
//         } catch (error) {
//             console.error('Error fetching data:', error);
//             alert('Failed to fetch data. Please try again.');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const applyFilter = (filterName) => {
//         const filtered = chartCardData.filter(item =>
//             (item.name || "").toLowerCase().includes(filterName.toLowerCase())
//         );
//         setFilteredData(filtered);
//     };

//     const aggregatedData = data.reduce((acc, currentItem) => {
//         const userName = currentItem.user_name;
//         if (!acc[userName]) {
//             acc[userName] = {
//                 assignedCount: 0,
//                 completedCount: 0,
//                 pendingCount: 0,
//             };
//         }
//         acc[userName].assignedCount++;
//         if (currentItem.R_Status_ID.id == 1000003) {
//             acc[userName].completedCount++;
//         } else {
//             acc[userName].pendingCount++;
//         }
//         return acc;
//     }, {});

//     const chartCardData = Object.keys(aggregatedData).map(userName => ({
//         name: userName,
//         assigned: aggregatedData[userName].assignedCount,
//         completed: aggregatedData[userName].completedCount,
//         pending: aggregatedData[userName].pendingCount,

//     }));

//     console.log(chartCardData, chartCardData)

//     // Open bottom sheet
//     const openBottomSheet = () => {
//         bottomSheetRef.current?.open();
//     };

//     useEffect(() => {
//         const firstDayOfMonth = moment().startOf('month').format('YYYY-MM-DD');
//         const lastDayOfMonth = moment().endOf('month').format('YYYY-MM-DD');
//         getAPIData(firstDayOfMonth, lastDayOfMonth);
//     }, []);



//     // useEffect(() => {
//     //     // console.log("Filtered Data:", filteredData);
//     //     console.log("Chart Card Data123123:", chartCardData);
//     // }, [filteredData, chartCardData]);

//     return (
//         <View style={{ flex: 1, }}>
//             <CustomHeader title="ATS" />
//             <View style={{
//                 //  backgroundColor: 'white'

//                 // marginBottom:"10%"


//                  }}>
//                 {isLoading ? (
//                     <ActivityIndicator size="large" color="#0000ff" />
//                 ) : (
//                     <FlatList
//                         data={chartCardData}
//                         keyExtractor={(item, index) => index.toString()}
//                         renderItem={({ item }) => {
//                             const progressPercentage = (item.completed / item.assigned) || 0;
//                             return (
//                                 <ChartCards
//                                     name={item.name}
//                                     firstTop="Assigned"
//                                     secTop="Completed"
//                                     thirdTop="Pending"
//                                     percentageNum={progressPercentage}
//                                     total={item.assigned}
//                                     comp={item.completed}
//                                     unComp={item.pending}
//                                 />
//                             );
//                         }}
//                     />
//                 )}
//             </View>
//             {/* Top Tab Navigator */}
//             <TapTab.Navigator
//                 screenOptions={{
//                     tabBarLabelStyle: { fontSize: 14 },
//                     tabBarIndicatorStyle: { backgroundColor: '#0050C0' },
//                     tabBarStyle: {
//                         backgroundColor: '#f9f9f9',
//                         elevation: 2,
//                     },
//                 }}
//             >
//                 <TapTab.Screen name="My Task" component={AllTaskScreen} />
//                 <TapTab.Screen name="Team Task" component={ShowTeamTask} />
//             </TapTab.Navigator>
//         </View>
//     );
// };

// export default TopNavigationATS;

// const styles = StyleSheet.create({
//     filterContainer: {
//         marginHorizontal: 20,
//     },
//     filterTitle: {
//         fontSize: 26,
//         fontWeight: 'bold',
//         color: '#000',
//     },
//     fromBtn: {
//         width: '40%',
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     toBtn: {
//         width: '40%',
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     dateInput: {
//         width: '80%',
//         borderWidth: 1,
//         alignItems: 'center',
//         justifyContent: 'center',
//         height: 30,
//         borderRadius: 5,
//     },
//     txt: {
//         color: 'black',
//         fontSize: 15,
//     },
//     blurView: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: 'rgba(0,0,0,0.5)',
//     },
//     modal: {
//         width: '90%',
//         backgroundColor: '#fff',
//         borderRadius: 20,
//         padding: 20,
//     },
//     closeBtn: {
//         marginTop: 20,
//         alignItems: 'center',
//     },
//     close: {
//         color: '#000',
//         fontSize: 16,
//     },
//     closeButton: {
//         backgroundColor: '#00B0F0',
//         width: '50%',
//         alignSelf: 'center',
//         alignItems: 'center',
//         justifyContent: 'center',
//         padding: 10,
//         borderRadius: 10,
//         marginTop: 30,
//     },
// });



import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, ActivityIndicator, FlatList } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChartCards from '../../components/RequestScreenComponents/ChartCards';
import CustomHeader from '../../components/CustomHeader';
import AllTaskScreen from '../../screens/AllTaskScreen/AllTaskScreen';
import ShowTeamTask from '../../screens/AllTaskScreen/ShowTeamTask';
import { useFocusEffect } from '@react-navigation/native';

const TapTab = createMaterialTopTabNavigator();

const TopNavigationATS = () => {
    const [myTaskData, setMyTaskData] = useState([]);
    const [teamTaskData, setTeamTaskData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('My Task'); // Track active tab

    const getAPIData = async () => {
        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const protocol = await AsyncStorage.getItem('protocol');
            const host = await AsyncStorage.getItem('host');
            const port = await AsyncStorage.getItem('port');
            const userId = await AsyncStorage.getItem('userId');

            const myTaskResponse = await fetch(
                `${protocol}://${host}:${port}/api/v1/models/mbl_request_view_v?$filter=SalesRep_ID eq ${userId}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const myTaskResult = await myTaskResponse.json();

            const teamTaskResponse = await fetch(
                `${protocol}://${host}:${port}/api/v1/models/mbl_request_view_v?$filter=Supervisor_ID eq ${userId}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const teamTaskResult = await teamTaskResponse.json();

            setMyTaskData(myTaskResult.records || []);
            setTeamTaskData(teamTaskResult.records || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to fetch data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // useEffect(() => {
    //     getAPIData();
    // }, []);

    useFocusEffect(
        useCallback(()=>{
            getAPIData();

        },[])
    )

    const processChartData = (data) => {
        return data.reduce((acc, currentItem) => {
            const userName = currentItem.user_name;
            if (!acc[userName]) {
                acc[userName] = {
                    assignedCount: 0,
                    completedCount: 0,
                    pendingCount: 0,
                };
            }
            acc[userName].assignedCount++;
            if (currentItem.R_Status_ID?.id == 1000003) {
                acc[userName].completedCount++;
            } else {
                acc[userName].pendingCount++;
            }
            return acc;
        }, {});
    };

    const myTaskChartData = Object.keys(processChartData(myTaskData)).map(userName => ({
        name: userName,
        assigned: processChartData(myTaskData)[userName].assignedCount,
        completed: processChartData(myTaskData)[userName].completedCount,
        pending: processChartData(myTaskData)[userName].pendingCount,
    }));

    const teamTaskChartData = Object.keys(processChartData(teamTaskData)).map(userName => ({
        name: userName,
        assigned: processChartData(teamTaskData)[userName].assignedCount,
        completed: processChartData(teamTaskData)[userName].completedCount,
        pending: processChartData(teamTaskData)[userName].pendingCount,
    }));

    return (
        <View style={{ flex: 1 }}>
            <CustomHeader title="ATS" />
            <View>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <FlatList
                        data={activeTab === 'My Task' ? myTaskChartData : teamTaskChartData}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => {
                            const progressPercentage = (item.completed / item.assigned) || 0;
                            return (
                                <ChartCards
                                    name={item.name}
                                    firstTop="Assigned"
                                    secTop="Completed"
                                    thirdTop="Pending"
                                    percentageNum={progressPercentage}
                                    total={item.assigned}
                                    comp={item.completed}
                                    unComp={item.pending}
                                />
                            );
                        }}
                    />
                )}
            </View>

            <TapTab.Navigator
                screenOptions={{
                    tabBarLabelStyle: { fontSize: 14 },
                    tabBarIndicatorStyle: { backgroundColor: '#0050C0' },
                    tabBarStyle: { backgroundColor: '#f9f9f9', elevation: 2 },
                }}
                screenListeners={{
                    state: (e) => {
                        const index = e.data.state.index;
                        setActiveTab(e.data.state.routeNames[index]); // Update activeTab based on tab change
                    }
                }}
            >
                <TapTab.Screen
                    name="My Task"
                    component={AllTaskScreen}
                    initialParams={{ data: myTaskData }}
                />
                <TapTab.Screen
                    name="Team Task"
                    component={ShowTeamTask}
                    initialParams={{ data: teamTaskData }}
                />
            </TapTab.Navigator>
        </View>
    );
};

export default TopNavigationATS;
