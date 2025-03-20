import { StyleSheet, Text, View, BackHandler, TextInput, Image, ActivityIndicator, FlatList, Modal, TouchableOpacity, Pressable, ScrollView } from 'react-native'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChartCards from '../../components/RequestScreenComponents/ChartCards';
import moment from 'moment';
import CustomHeader from '../../components/CustomHeader';
import ItemList from '../../components/RequestScreenComponents/ItemList';
import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/dist/FontAwesome';
import Entypo from 'react-native-vector-icons/dist/Entypo';
import ToggleSwitch from 'toggle-switch-react-native'
import RBSheet from "react-native-raw-bottom-sheet";
import CalendarPicker from 'react-native-calendar-picker';
import { Picker } from '@react-native-picker/picker';
import MultiSelect from 'react-native-multiple-select';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import TeamTaskCreateNewReq from '../RequestScreens/TeamTaskCreateNewReq';


const ShowTeamTask = () => {

    const navigation = useNavigation();


    const multiSelect = useRef(null);

    const bottomSheetRef = useRef();
    const [assignedName, setAssignedName] = useState('');
    const [selectedStatus, setSelectedStatus] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [showAllTasks, setShowAllTasks] = useState(false);
    const [userId, setUserId] = useState(null);
    const [data, setData] = useState([])
    const [recordLengths, setRecordLengths] = useState([]);
    const [currMonth, setCurrMonth] = useState([])
    const [prevMonth, setPrevMonth] = useState([])
    const [fCloseCurrMonth, setFCloseCurrMonth] = useState([])
    const tempResultPre = [];
    let tempResultCurr = []
    const [chartData, setChartData] = useState(false)
    const [fCloseCurrMonthModal, setFCloseCurrMonthModal] = useState(0)
    const [currMonthModal, setCurrMonthModal] = useState(0)
    let [pendingList, setPendingList] = useState()
    const [show, setShow] = useState(false)
    const [itemId, setItemId] = useState()
    const [showCalendarStart, setShowCalendarStart] = useState(false);
    const [startDate, setStartDate] = useState(null)
    const [showCalendarEnd, setShowCalendarEnd] = useState(false);
    const [endDate, setEndDate] = useState(null)
    const [showRBSheet, setShowRBSheet] = useState(false);
    const [filteredData, setFilteredData] = useState(data);
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    // console.log(filteredData,'AllDataInTaskTrick')

    const [pickerData, setPickerData] = useState([]);

    // 
    const statuses = [
        { id: "open", label: "Open", color: "#FFA500" },
        { id: "waiting", label: "Waiting", color: "#FFD700" },
        { id: "close", label: "Close", color: "#FF0000" },
        { id: "complete", label: "Complete", color: "#008000" },
    ];

    // Status Color set
    const statusColors = {
        "Open": "#FFA500",
        "Waiting on Customers/Others": "#FFD700",
        "Closed": "#FF0000",
        "Final Close": "#008000"
    };

    // filter Status API Calling
    const updateFilteredData = async (selectedStatuses) => {
        if (selectedStatuses.length === 0) {
            // If no status is selected, show all data
            getAPIData();
            return;
        }

        setIsLoading(true);

        const token = await AsyncStorage.getItem('token');
        const protocol = await AsyncStorage.getItem('protocol');
        const host = await AsyncStorage.getItem('host');
        const port = await AsyncStorage.getItem('port');
        const Id = await AsyncStorage.getItem("userId");

        // API URL Mapping for each status
        const statusAPIs = {
            open: `${protocol}://${host}:${port}/api/v1/models/mbl_request_view_v?$filter= Supervisor_ID eq ${Id} and R_Status_ID eq 1000000`,
            waiting: `${protocol}://${host}:${port}/api/v1/models/mbl_request_view_v?$filter= Supervisor_ID eq ${Id} and R_Status_ID eq 1000001`,
            close: `${protocol}://${host}:${port}/api/v1/models/mbl_request_view_v?$filter= Supervisor_ID eq ${Id} and R_Status_ID eq 1000002`,
            complete: `${protocol}://${host}:${port}/api/v1/models/mbl_request_view_v?$filter= Supervisor_ID eq ${Id} and R_Status_ID eq 1000003`
        };

        let allData = [];

        try {
            // Fetch data for selected statuses
            for (const status of selectedStatuses) {
                if (statusAPIs[status]) {
                    const response = await fetch(statusAPIs[status], {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    const data = await response.json();
                    allData = [...allData, ...data.records]; // Merge data from different status APIs
                }
            }

            // Sorting data by Created date
            const sortedData = allData.sort((a, b) => new Date(b.Created) - new Date(a.Created));
            setFilteredData(sortedData);
        } catch (error) {
            alert(error);
        } finally {
            setIsLoading(false);
        }
    };

    // new code for ALL API calling
    const handleStatusSelection = (id) => {
        setSelectedStatuses((prevSelected) => {
            const newSelection = prevSelected.includes(id)
                ? prevSelected.filter((status) => status !== id) // Remove if already selected
                : [...prevSelected, id]; // Add if not selected

            updateFilteredData(newSelection); // Call API accordingly
            return newSelection;
        });
    };


    const getAPIData = async () => {
        setIsLoading(true)
        const token = await AsyncStorage.getItem('token')
        const protocol = await AsyncStorage.getItem('protocol')
        const host = await AsyncStorage.getItem('host')
        const port = await AsyncStorage.getItem('port')
        const Id = await AsyncStorage.getItem("userId")
        setUserId(Id);
        let idArray = []
        const teamTaskURL = `${protocol}://${host}:${port}/api/v1/models/mbl_request_view_v?$filter=Supervisor_ID eq ${Id}`;
        console.log(teamTaskURL, 'teamtaskURL')
        //   fetch(`${protocol}://${host}:${port}/api/v1/models/mbl_request_view_v?$filter=Supervisor_ID eq ${Id} OR SalesRep_ID eq ${Id}`,
        fetch(`${protocol}://${host}:${port}/api/v1/models/mbl_request_view_v?$filter=Supervisor_ID eq ${Id}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                return response.json();
            })
            .then(data => {
                const sortedData = data.records.sort((a, b) =>
                    new Date(b.Created) - new Date(a.Created)
                );
                setData(sortedData);
                // console.log('Parsed Data:', JSON.stringify(data));
                const uniqueNames = [...new Set(sortedData.map(item => item.user_name))];
                setPickerData(uniqueNames);

                for (let i = 0; i < sortedData.length; i++) {
                    idArray.push(sortedData[i].id)
                }

                idArray.push(Id)
                setData([...data.records])

                fetchBasedOnId(idArray, protocol, host, port, Id, token)
                setShow(false)

            })
            .catch(error => {
                alert(error)
                setIsLoading(false)
            });
        setIsLoading(false)
    }

    const fetchBasedOnId = async (idArray, protocol, host, port, userId, token) => {

        idArray = [userId];
        const promises = idArray.map(id =>
            fetch(`${protocol}://${host}:${port}/api/v1/models/R_Request?$filter=SalesRep_ID eq ${id} AND CreatedBy eq ${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => response.json())


                .catch(error => {
                    console.error(error);
                    // return [];
                })
        );
        Promise.all(promises).then(results => {
            const concatAll = results.reduce((acc, curr) => {
                return [...acc, ...curr.records];
            }, []);

            // console.log(concatAll,"ConCatAll");

            let tempResult = [];
            idArray.forEach(id => {
                const count = concatAll.length;
                tempResult.push(count);
            });
            setRecordLengths(tempResult);

            fetchMonth(concatAll, idArray);

        });
    }

    const fetchMonth = async (concatAll, idArray) => {
        const lastDayOfPreviousMonth = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
        const firstDayOfCurrMonth = moment().subtract('months').startOf('month').format('YYYY-MM-DD');
        const lastDayOfCurrMonth = moment().subtract('months').endOf('month').format('YYYY-MM-DD');

        let tempResultPre = [];
        idArray.forEach(id => {
            const count = concatAll.filter(item => {
                return item.StartTime?.slice(0, 10) <= lastDayOfPreviousMonth;
            }).length; // Previous Month count for your tasks
            tempResultPre.push(count);
        });
        setPrevMonth(tempResultPre);

        let tempResultCurr = [];
        idArray.forEach(id => {
            const count = concatAll.filter(item => {
                return item.StartTime?.slice(0, 10) >= firstDayOfCurrMonth && item.StartTime?.slice(0, 10) <= lastDayOfCurrMonth;
            }).length; // Current Month count for your tasks
            tempResultCurr.push(count);
        });
        setCurrMonth(tempResultCurr);

        let fCloseCurr = [];
        idArray.forEach(id => {
            const count = concatAll.filter(item => {
                return item.R_Status_ID.id === 1000003 &&
                    item.StartTime?.slice(0, 10) >= firstDayOfCurrMonth && item.StartTime?.slice(0, 10) <= lastDayOfCurrMonth;
            }).length; // Final Close of Current Month count for your tasks
            fCloseCurr.push(count);
        });
        setFCloseCurrMonth(fCloseCurr);

        setIsLoading(false);
    }


    const navigateBack = () => {
        const unsubscribe = navigation.addListener('focus', () => {
            getAPIData()

        });
        return unsubscribe;
    }

    useEffect(() => {
        navigateBack()
        const backAction = () => {
            navigation.goBack()
            return true;
        };
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );
        return () => backHandler.remove();
    }, [navigation])

    const chartModal = (id) => {
        setFCloseCurrMonthModal(fCloseCurrMonth[id])
        setCurrMonthModal(currMonth[id])
        setChartData(true)
    }

    const openBottomSheet = () => {
        if (bottomSheetRef.current) {
            bottomSheetRef.current.open();
        }
    };

    const modalView = async ({ item }) => {
        let id = item.id
        setItemId(id)
        setShow(!show)
    }

    const updateData = async (statusId, txt) => {
        const protocol = await AsyncStorage.getItem('protocol')
        const host = await AsyncStorage.getItem('host')
        const port = await AsyncStorage.getItem('port')
        const token = await AsyncStorage.getItem('token')
        const userId = await AsyncStorage.getItem('userId')

        fetch(`${protocol}://${host}:${port}/api/v1/models/R_Request/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                "R_Status_ID": { "id": `${statusId}`, "identifier": txt, "model-name": "r_status" }
            })
        })
            .then(response => response.json())
            .then(data => {
                setIsLoading(true)
                getAPIData(protocol, host, port, userId)
            })
            .catch(error => {
                // Handle the error
            });

    }

    const modalClose = async (txt, id) => {
        if (txt === "Open") {
            let statusId = 1000000
            updateData(statusId, txt)
        } else if (txt === "Close") {
            let statusId = 1000002
            updateData(statusId, txt)
        } else if (txt === 'Waiting') {
            let statusId = 1000001
            updateData(statusId, txt)
        } else {
            let statusId = 1000003
            updateData(statusId, txt)
        }
    }

    const getReport = async (id) => {
        const protocol = await AsyncStorage.getItem('protocol')
        const host = await AsyncStorage.getItem('host')
        const port = await AsyncStorage.getItem('port')
        const token = await AsyncStorage.getItem('token')
        fetch(`${protocol}://${host}:${port}/api/v1/models/R_Request/${id}/attachments`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then((response) => response.json())
            .then(data => {
                let records = data.attachments
                if (records.length === 1) {
                    const decodedString = atob(records[0].contentType)
                    if (records[0].contentType.startsWith('image/')) {
                        setImageAPI(decodedString)
                        setModalVisible(true)
                    } else if (records[0].contentType === 'application/pdf') {
                        setPdfAPI(decodedString)
                    } else {
                    }
                } else {
                    const lastItem = records[data.length - 1]
                }
            })
            .catch((err) => console.log(err))
    }

    const onDateChangeStart = (date) => {
        const formattedDate = moment.utc(date).format("YYYY-MM-DD");
        if (formattedDate > endDate) {
            alert('This Date must be smaller then end date')
        } else {
            setStartDate(formattedDate);
            setShowCalendarStart(false);
            //  getAPIData(formattedDate, endDate)
        }
    };

    const onDateChangeEnd = (date) => {
        const formattedDate = moment.utc(date).format("YYYY-MM-DD");
        if (formattedDate < startDate) {
            alert('This Date must be greater then start date')
        } else {
            setEndDate(formattedDate);
            setShowCalendarEnd(false);
            //  getAPIData(startDate, formattedDate)
        }
    }
    useEffect(() => {
        const filtered = data.filter(item => {
            const isNameMatched = !assignedName || item?.user_name.includes(assignedName);
            let isStatusMatched = false;

            if (selectedStatus.length > 0) {
                isStatusMatched = selectedStatus.some(status => {
                    if (status.value === 'FinalClose') {
                        // return item?.R_Status_ID?.toLowerCase() === 'finalClose';
                        return item?.R_Status_ID?.id === 1000003;
                    } else if (status.value === 'Close') {
                        return item?.R_Status_ID?.id === 1000002;
                    } else {
                        return item?.R_Status_ID?.identifier.toLowerCase().includes(status.value.toLowerCase());
                    }
                });
            } else {
                isStatusMatched = true;
            }
            const isOwnTask = showAllTasks ? item?.SalesRep_ID?.id == userId : true;
            const itemStartDate = moment(item?.StartDate, 'DD-MM-YYYY');
            const itemEndDate = moment(item?.EndTime, 'DD-MM-YYYY');
            const selectedStartDate = startDate ? moment(startDate, 'DD-MM-YYYY') : null;
            const selectedEndDate = endDate ? moment(endDate, 'DD-MM-YYYY') : null;
            const isStartDateMatched = !selectedStartDate || itemStartDate.isSameOrAfter(selectedStartDate);
            const isEndDateMatched = !selectedEndDate || itemEndDate.isSameOrBefore(selectedEndDate);
            return isNameMatched && isStatusMatched && isOwnTask && isStartDateMatched && isEndDateMatched;
        });

        setFilteredData(filtered);
    }, [showAllTasks, selectedStatus, assignedName, startDate, endDate, data]);



    const items = [{
        id: 2,
        name: 'Open',
        value: 'Open'
    }, {
        id: 3,
        name: 'Close',
        value: 'Close'
    },
    {
        id: 4,
        name: 'Waiting',
        value: 'Waiting'
    }, {
        id: 5,
        name: 'FinalClose',
        value: 'FinalClose'
    },
    ];

    const onSelectedItemsChange = (selectedStatusIds) => {
        const updatedStatuses = items.filter(item => selectedStatusIds.includes(item.id));
        setSelectedStatus(prevStatuses => {

            const newStatuses = [...prevStatuses];

            updatedStatuses.forEach(updatedStatus => {
                const index = newStatuses.findIndex(status => status.id === updatedStatus.id);
                if (index !== -1) {
                    newStatuses.splice(index, 1);
                } else {
                    newStatuses.push(updatedStatus);
                }
            });

            return newStatuses;
        });
    };

    useFocusEffect(
            useCallback(() => {
                // Jab bhi screen wapas aaye, selectedStatuses ko empty kar do
                setSelectedStatuses([]);
                updateFilteredData([]); // API se saara data show karwana
            }, [])
        );

    return (
        <>
            {isLoading && (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color="#0050C0" />
                </View>
            )}
            {!isLoading && (
                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    {/* Fixed Color show */}
                    {/* <View style={[styles.containerColor, { width: "90%", alignSelf: "center", marginTop:"3%" }]}>
                        <View style={styles.statusContainer}>
                            <TouchableOpacity style={styles.item}>
                                <View style={[styles.statusBoxColor, { backgroundColor: '#FFA500' }]} />
                                <Text style={[styles.statusTextColor, { color: 'black' }]}>Open</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.item}>
                                <View style={[styles.statusBoxColor, { backgroundColor: '#FFD700' }]} />
                                <Text style={[styles.statusTextColor, { color: 'black' }]}>Waiting</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.item}>
                                <View style={[styles.statusBoxColor, { backgroundColor: '#FF0000' }]} />
                                <Text style={[styles.statusTextColor, { color: 'black' }]}>Close</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.item}>
                                <View style={[styles.statusBoxColor, { backgroundColor: '#008000' }]} />
                                <Text style={[styles.statusTextColor, { color: 'black' }]}>Complete</Text>
                            </TouchableOpacity>
                        </View>
                    </View> */}


                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        {statuses.map((status) => (
                            <TouchableOpacity
                                key={status.id}
                                style={{ alignItems: "center", padding: 10 }}
                                onPress={() => handleStatusSelection(status.id)}
                            >
                                <View
                                    style={{
                                        width: 20,
                                        height: 20,
                                        backgroundColor: status.color,
                                        justifyContent: "center",
                                        alignItems: "center",
                                        borderRadius: 5,
                                    }}
                                >
                                    {selectedStatuses.includes(status.id) && (
                                        <FontAwesome name="check" size={18} color="white" />
                                    )}
                                </View>
                                <Text style={{ color: "black", marginTop: 5 }}>{status.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Status Modal  */}
                    <Modal
                        visible={show}
                        animationType="slide"
                        transparent={true}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalView}>
                                <Text style={styles.txt}>Set Status</Text>
                                <TouchableOpacity onPress={() => modalClose('Open', 1000000)} style={styles.txtContainer}>
                                    <Text style={styles.txt}>Open</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => modalClose('Waiting', 1000001)} style={styles.txtContainer}>
                                    <Text style={styles.txt}>Waiting</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => modalClose('Close', 1000002)} style={styles.txtContainer}>
                                    <Text style={styles.txt}>Close</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => modalClose('Final Close', 1000003)} style={styles.txtContainer}>
                                    <Text style={styles.txt}>Final Close</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { setShow(!show) }} style={styles.btn}>
                                    <Text style={styles.txtBtn}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                    <FlatList
                        data={filteredData}
                        renderItem={(item) => {
                            // console.log(filteredData,44444)
                            const status = item?.item?.R_Status_ID?.identifier.split("_")[1]; // Ensure status exists
                            const backgroundColorDot = statusColors[status] || "#000";
                            return (
                                <ItemList
                                    employName={item.item.user_name ? item.item.user_name : 'My Task'}
                                    Idnumber={item?.item?.id}
                                    name={item.item.Name}
                                    startDate={moment(item.item.StartDate).format("DD-MM-YYYY")}
                                    endDate={moment(item.item.EndTime).format("DD-MM-YYYY")}
                                    onPress={() => navigation.navigate('RequestDetails', { id: item.item.id })}
                                    onPressMain={() => navigation.navigate('RequestDetails', { id: item.item.id })}
                                    // status={item?.item?.R_Status_ID?.identifier.split("_")[1]}
                                    status={status}
                                    backgroundColorDot={backgroundColorDot}
                                    onPressModal={() => modalView(item)}
                                    statusArrow={require('../../asserts/RequestAsserts/downArrow.png')}
                                    onPressReport={() => getReport(item.item.id)}
                                />
                            )
                        }}
                    />
                    <TouchableOpacity
                        style={styles.floatingButton}
                        onPress={() => { navigation.navigate('TeamTaskCreateNewReq') }}>
                        <MaterialCommunityIcons name='plus' size={30} color='#fff' />
                    </TouchableOpacity>
                    <RBSheet
                        ref={bottomSheetRef}
                        height={510}
                        openDuration={250}
                        closeOnDragDown={true}
                        closeOnPressMask={false}
                        customStyles={{
                            container: {
                                borderTopRightRadius: 30,
                                borderTopLeftRadius: 30,

                            }
                        }}
                    >
                        <View style={styles.filterContainer}>
                            <Text style={styles.filterTitle}>Filter</Text>

                            <View style={{ marginTop: 10 }}>
                                <Text style={{ fontSize: 18, color: '#000' }}>Assigned</Text>
                                <View style={{ borderWidth: 1, marginTop: 5, borderRadius: 10, justifyContent: 'center' }} >
                                    <Picker
                                        selectedValue={assignedName}
                                        style={{ height: 40, width: 320 }}
                                        onValueChange={(itemValue, itemIndex) => setAssignedName(itemValue)}
                                    >
                                        <Picker.Item label="Select a name" value="" />
                                        {pickerData.map((item, index) => (
                                            <Picker.Item label={item} value={item} key={index} />
                                        ))}
                                    </Picker>
                                </View>

                            </View>
                            <View style={{ marginTop: 5 }}>
                                <Text style={{ fontSize: 18, color: '#000' }}>Date</Text>
                                <View style={{ flexDirection: 'row', marginTop: 5, marginBottom: 5, justifyContent: 'space-between' }}>
                                    <TouchableOpacity style={styles.fromBtn} onPress={() => setShowCalendarStart(true)}>
                                        <View style={{ width: '80%', borderWidth: 1, alignItems: 'center', justifyContent: 'center', height: 30, borderRadius: 5 }} >
                                            <Text style={styles.txt}>{startDate ? moment(startDate).format("DD-MM-YYYY") : "Start Date"}</Text>
                                        </View>
                                        <MaterialCommunityIcons name='calendar-month-outline' size={26} color='#00B0F0' style={styles.calender} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.toBtn} onPress={() => setShowCalendarEnd(true)}>
                                        <View style={{ width: '80%', borderWidth: 1, alignItems: 'center', justifyContent: 'center', height: 30, borderRadius: 5 }}>
                                            <Text style={styles.txt}>{endDate ? moment(endDate).format("DD-MM-YYYY") : 'End Date'}</Text>
                                        </View>
                                        <MaterialCommunityIcons name='calendar-month-outline' size={26} color='#00B0F0' style={styles.calender} />
                                    </TouchableOpacity>

                                </View>
                            </View>

                            <View style={{ marginTop: 5 }}>
                                <Text style={{ fontSize: 18, color: '#000' }}>Status</Text>
                                <MultiSelect
                                    // hideTags
                                    items={items}
                                    searchIcon={true}
                                    uniqueKey="id"
                                    ref={multiSelect}
                                    onSelectedItemsChange={onSelectedItemsChange}
                                    selectedItems={selectedStatus}
                                    selectText="Status"
                                    searchInputPlaceholderText="Search Items..."
                                    onChangeInput={(text) => console.log(text)}
                                    altFontFamily="ProximaNova-Light"
                                    tagRemoveIconColor="#CCC"
                                    tagBorderColor="#CCC"
                                    tagTextColor="#CCC"
                                    selectedItemTextColor="#CCC"
                                    selectedItemIconColor="#CCC"
                                    itemTextColor="#000"
                                    displayKey="name"
                                    searchInputStyle={{ color: '#CCC' }}
                                    submitButtonColor="#00B0F0"
                                    submitButtonText="Add"
                                    styleTextDropdown={false}

                                />
                                {/* </View> */}
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                    {selectedStatus.map((status) => (
                                        <TouchableOpacity
                                            key={status.id}
                                            style={{
                                                flexDirection: 'row',
                                                backgroundColor: 'lightgray',
                                                borderRadius: 20,
                                                padding: 6,
                                                marginRight: 8,
                                                marginBottom: 8,
                                                alignItems: 'center',

                                            }}
                                            onPress={() => {
                                                const updatedStatus = selectedStatus.filter(item => item.id === status.id);
                                                onSelectedItemsChange(updatedStatus.map(item => item.id));
                                            }}
                                        >
                                            {console.log(status.name, "NAME")}
                                            <Text style={{ color: '#000', marginRight: 5 }}>{status.name}</Text>
                                            <Entypo name='cross' size={18} color='#000' />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => bottomSheetRef.current.close()} style={{ backgroundColor: '#00B0F0', width: '50%', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 10, marginTop: 30 }}>
                                <Text style={{ color: '#fff' }}>Close</Text>
                            </TouchableOpacity>


                        </View>

                    </RBSheet>

                    <Modal visible={showCalendarStart} animationType="slide" transparent={true}>
                        <View style={styles.blurView}  >
                            <View style={styles.modal}>
                                <CalendarPicker
                                    onDateChange={onDateChangeStart}
                                    previousTitleStyle={{ color: 'white', marginLeft: 15, fontFamily: 'K2D-Regular' }}
                                    nextTitleStyle={{ color: 'white', marginRight: 15, fontFamily: 'K2D-Regular' }}
                                    textStyle={{
                                        color: 'white',
                                        fontFamily: 'K2D-Regular'
                                    }}
                                    customDatesStyles={{
                                        color: 'white',
                                        fontFamily: 'K2D-Regular'
                                    }}
                                />
                                <TouchableOpacity style={styles.closeBtn} onPress={() => setShowCalendarStart(false)}>
                                    <Text style={styles.close}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                    {/* end date model */}
                    <Modal visible={showCalendarEnd} animationType="slide" transparent={true}>
                        <View style={styles.blurView}  >
                            <View style={styles.modal}>
                                <CalendarPicker
                                    onDateChange={onDateChangeEnd}
                                    previousTitleStyle={{ color: 'white', marginLeft: 15, fontFamily: 'K2D-Regular' }}
                                    nextTitleStyle={{ color: 'white', marginRight: 15, fontFamily: 'K2D-Regular' }}
                                    textStyle={{
                                        color: 'white',
                                        fontFamily: 'K2D-Regular'
                                    }}
                                    customDatesStyles={{
                                        color: 'white',
                                        fontFamily: 'K2D-Regular'
                                    }}
                                />
                                <TouchableOpacity onPress={() => setShowCalendarEnd(false)} style={styles.closeBtn}>
                                    <Text style={{ color: 'black' }}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </View>
            )}
        </>
    )
}

export default ShowTeamTask

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: 'rgba(38, 70, 83, 0.5)',
        flex: 1,
        alignItems: 'center',
        justifyContent: "center"
    },
    modalView: {
        backgroundColor: '#00B0F0',
        height: '30%',
        width: '85%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10
    },
    fromBtn: {
        width: '45%',
        flexDirection: 'row',
        height: 35,
        alignItems: 'center',

    },
    txt: {
        color: 'gray',
        fontSize: 14,
        fontFamily: 'K2D-Bold'
    },
    toBtn: {
        width: '45%',
        alignItems: 'center',
        flexDirection: 'row',
        height: 35,

    },
    image: {
        height: '80%',
        width: '30%'
    },
    modalTxt: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'K2D-Regular'
    },
    floatingButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        // backgroundColor: '#00B0F0',
        backgroundColor: "#002E62",
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
    filterContainer: {
        marginHorizontal: 20

    },
    filterTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        fontFamily: 'K2D',
        color: '#000'

    },

    blurView: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modal: {
        width: '90%',
        backgroundColor: '#00B0F0',
        borderRadius: 20,
        alignItems: 'center'
    },
    closeBtn: {
        backgroundColor: 'white',
        height: '10%',
        width: '40%',
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20
    },
    calender: {
        width: '30%',
        alignItems: 'center',
        marginLeft: 10
    },
    close: {
        color: '#800000',
        fontSize: 16,
        fontFamily: 'K2D-Regular'
    },
    statusContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    // Container for each individual status item (box + text)
    item: {
        alignItems: "center",

    },
    statusBoxColor: {
        padding: 10,
        borderRadius: 5,
        marginBottom: 5, // thoda gap text ke liye
    },
    statusTextColor: {
        fontWeight: 'bold',
    },
})