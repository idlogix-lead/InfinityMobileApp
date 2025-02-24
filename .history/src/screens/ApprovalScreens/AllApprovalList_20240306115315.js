import React, { useEffect, useState, useRef } from 'react'
import {
    StyleSheet, Text, FlatList, View, TouchableOpacity, Image, Dimensions, TextInput, Alert, ActivityIndicator,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/dist/MaterialIcons';
import RBSheet from "react-native-raw-bottom-sheet";
import CalendarPicker from 'react-native-calendar-picker';
import Toast from 'react-native-toast-message';
import CustomHeader from '../../components/CustomHeader';


const { width, height } = Dimensions.get('window')

const currentDate = new Date();
const options = { day: '2-digit', month: 'short', year: 'numeric' };
const formattedDate = currentDate.toLocaleDateString('en-US', options);

const AllApprovalList = ({ navigation }) => {

    const bottomSheetRef = useRef();

    const [approvalItems, setApprovalItems] = useState([]);
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [documentFilter, setDocumentFilter] = useState('');
    const [noItemsMatch, setNoItemsMatch] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedStartDate, setSelectedStartDate] = useState(null);
    const [selectedEndDate, setSelectedEndDate] = useState(null);
    const [totalAmount, setTotalAmount] = useState(0);
    const [filterButtonPressed, setFilterButtonPressed] = useState(false);

    const [dumyArray, setDumyArray] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [protocol, setProtocol] = useState()
    const [host, setHost] = useState()
    const [port, setPort] = useState()
    const [token, setToken] = useState()
    const [filteredItems, setFilteredItems] = useState([]);
    const [isRBVisible, setIsRBVisible] = useState(false);

    console.log(filteredItems)

    const openBottomSheet = () => {
        if (bottomSheetRef.current) {
            bottomSheetRef.current.open();
        }
    };

    const showSuccessMessage = () => {
        Toast.show({
            type: 'success',
            text1: 'Authorized'
        });
    }
    const showRejectMessage = () => {
        Toast.show({
            type: 'error',
            text1: 'Rejected',

        });
    }
    const fetchApprovalItems = async () => {
        try {
            const protocol = await AsyncStorage.getItem('protocol');
            const host = await AsyncStorage.getItem('host');
            const port = await AsyncStorage.getItem('port');
            const roleId = await AsyncStorage.getItem('roleId');
            const token = await AsyncStorage.getItem('token');

            const response = await fetch(`${protocol}://${host}:${port}/api/v1/models/mbl_workflow_v?$filter=AD_Role_ID eq ${roleId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                // console.log(JSON.stringify(data), 'data')
                // console.log(JSON.stringify(data.records.map(item => item.AD_Table_ID)), "CheckDAta")
                setApprovalItems(data);
                // console.log(approvalItems, "APPPROVAL ITMESS")

            } else {
                console.error('Failed to fetch approval items');
            }
        } catch (error) {
            console.error('Error retrieving data from storage:', error);
        }

    };

    const onDateChange = (date) => {

        console.log("selectedStartDate:", selectedStartDate);
        console.log("selectedEndDate:", selectedEndDate);

        const formattedDate = date ? date.toISOString().split('T')[0] : null;
        if (!selectedStartDate) {
            // If selectedStartDate is not set, set it
            setSelectedStartDate(formattedDate);
            setSelectedEndDate(null); // Reset selectedEndDate
        } else if (selectedStartDate && !selectedEndDate) {

            setSelectedEndDate(formattedDate);
        } else {

            setSelectedStartDate(formattedDate);
            setSelectedEndDate(null);
        }
    };




    async function getItemFromStorage() {
        try {
            roleId = await AsyncStorage.getItem('roleId');
            setProtocol(await AsyncStorage.getItem('protocol'));
            setHost(await AsyncStorage.getItem('host'));
            setPort(await AsyncStorage.getItem('port'));
            setToken(await AsyncStorage.getItem('token'))
        } catch (error) {
            Alert.alert('Error retrieving data from storage:', error);
        }
    }
    const auth = (item, protocol, host, port, token) => {
        let itemToRemove = item.AD_WF_Activity_ID.id;
        setIsLoading(true);

        Alert.alert(
            'Confirmation',
            'Are you sure you want to approved this transection?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => {
                        setIsLoading(false)
                    }
                },
                {
                    text: 'OK',
                    onPress: () => {
                        const url = `${protocol}://${host}:${port}/api/v1/workflow/approve/${item.AD_WF_Activity_ID.id}`
                        console.log(url, 'url')
                        fetch(url, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: {
                                "message": "This is the end, my only friend"
                            }
                        }).then(() => {
                            const popArray = dumyArray.filter((item) => item.AD_WF_Activity_ID.id !== itemToRemove);
                            // console.log(popArray,'popArray')
                            setDumyArray(popArray)
                            const total = popArray.reduce((accumulator, currentValue) => {
                                return accumulator + currentValue.TotalLines;

                            }, 0);
                            setIsLoading(false)
                            showSuccessMessage()

                        })
                    }
                }
            ]
        );
    }

    const reject = (item, protocol, host, port) => {
        let itemToRemove = item.AD_WF_Activity_ID.id
        setIsLoading(true);
        Alert.alert(
            'Confirmation',
            'Are you sure you want to reject this transection?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => {

                    }
                },
                {
                    text: 'OK',
                    onPress: () => {
                        fetch(`${protocol}://${host}:${port}/api/v1/workflow/reject/${item.AD_WF_Activity_ID.id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: {
                                "message": "This is the end, my only friend"
                            }
                        }).then(() => {
                            const popArray = dumyArray.filter((item) => item.AD_WF_Activity_ID.id !== itemToRemove);
                            setDumyArray(popArray)
                            const total = popArray.reduce((accumulator, currentValue) => {
                                return accumulator + currentValue.TotalLines;
                            }, 0);
                            setIsLoading(false)
                            showRejectMessage()
                        })
                    }
                }
            ]
        );
    }
    useEffect(() => {
        fetchApprovalItems();
        getItemFromStorage()

    }, []);

    useEffect(() => {
        if (approvalItems.records) {
            setDumyArray(approvalItems.records);
        }
    }, [approvalItems.records]);

    const onDateCheck = (date, type) => {
        const formattedDate = date.toISOString().split('T')[0];
        console.log(formattedDate)
    }

    useEffect(() => {
        if (filteredItems && filteredItems.length > 0) {
            const total = calculateTotalAmount(filteredItems);
            setTotalAmount(total);
        } else if (dumyArray && dumyArray.length > 0) {
            const total = calculateTotalAmount(dumyArray);
            setTotalAmount(total);
        } else {
            setTotalAmount(0);
        }
    }, [filteredItems, dumyArray]);

    const originalData = dumyArray;
    const applyDateFilter = () => {
        console.log("Filtering with - selectedStartDate:", selectedStartDate);
        console.log("Filtering with - selectedEndDate:", selectedEndDate);

        let dataToFilter = originalData;

        // console.log(originalData,'originalData')

        if (selectedStartDate || selectedEndDate) {
            if (selectedStartDate && selectedEndDate) {
                // Filter by date range
                const startDate = new Date(selectedStartDate);
                const endDate = new Date(selectedEndDate);
                endDate.setDate(endDate.getDate() + 1);
                dataToFilter = dataToFilter.filter((item) => {
                    const itemDate = new Date(item.docdate);
                    return itemDate >= startDate && itemDate < endDate;
                });
            } else if (selectedStartDate) {
                // Filter by a single date
                const formattedStartDate = new Date(selectedStartDate);
                const formattedEndDate = new Date(selectedStartDate);
                formattedEndDate.setDate(formattedEndDate.getDate() + 1);
                dataToFilter = dataToFilter.filter((item) => {
                    const itemDate = new Date(item.docdate);
                    return itemDate >= formattedStartDate && itemDate < formattedEndDate;
                });
            }

            if (dataToFilter.length === 0) {
                setFilteredItems([]);
                setNoItemsMatch(true); // Set state to indicate no items match
            } else {
                setFilteredItems(dataToFilter);
                setNoItemsMatch(false); // Reset state if items match the filter
            }
        } else {
            // No date selected, show all items
            setFilteredItems(originalData);
            setNoItemsMatch(false); // Reset state for no match
        }
    };

    const toggleRBVisibility = () => {
        setIsRBVisible(!isRBVisible);
    };



    const handleFindPress = () => {
        applyDateFilter();
        toggleRBVisibility();
        setFilterButtonPressed(true);
        if (bottomSheetRef.current) {
            bottomSheetRef.current.close();
        }
    };


    const calculateTotalAmount = (data) => {
        return data.reduce((accumulator, currentValue) => {
            return accumulator + (currentValue.TotalLines || 0);
        }, 0);
    };

    return (
        <>
            {isLoading &&
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', }}>
                    <ActivityIndicator size="large" color="#0050C0" />
                </View>}
            {!isLoading &&
                <View style={styles.mainContainer}>
                    <CustomHeader title="All Approvals" />
                    <View style={{ flexDirection: 'row', marginTop: 10, backgroundColor: "white", width: '95%', alignSelf: 'center', borderRadius: 5, padding: 10 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ color: 'black', fontWeight: 'bold', fontFamily: 'K2D-Regular' }}>Date:{" "}</Text>
                            <Text style={{ color: 'black' }}>{formattedDate}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', marginLeft: 30 }}>
                            <Text style={{ color: 'black', fontWeight: 'bold', fontFamily: 'K2D-Regular' }}>Total Amount: {" "}</Text>
                            <Text style={{ color: 'black' }}>{totalAmount}</Text>
                        </View>
                    </View>
                    {
                        noItemsMatch ? <Text style={{ color: 'black', textAlign: 'center', marginTop: 20, fontSize: 22 }}>No Approval </Text> : <FlatList
                            data={filteredItems.length > 0 ? filteredItems : dumyArray}
                            // data={filteredItems}
                            contentContainerStyle={{ paddingBottom: 100 }}
                            keyExtractor={(item) => item.AD_WF_Activity_ID.id.toString()}

                            renderItem={({ item }) => (
                                <View style={styles.container}>
                                    <View style={styles.item}>
                                        <View style={styles.cardContent}>
                                            <View style={styles.partyCon}>
                                                <Text style={{ ...styles.headingTxt, color: 'black' }}>Party</Text>
                                                <Text style={[styles.headingTxt, { marginTop: 5, paddingLeft: 5 }]}>{item.party_name ? item.party_name : 'None'}</Text>
                                            </View>
                                            <View style={styles.dateCon}>
                                                <Text style={{ ...styles.headingTxt, color: 'black' }}>Amount</Text>
                                                <Text style={[styles.headingTxt, { marginTop: 5 }]}>{item.TotalLines ? item.TotalLines : 'None'}</Text>
                                                {/* <Text style={[styles.headingTxt,{marginTop:5}]}>{item?.record_id ? item?.record_id : 'None'}</Text> */}
                                            </View>
                                        </View>
                                        <View >
                                            <View style={styles.btnCon}>
                                                <TouchableOpacity style={styles.authorized} onPress={() => auth(item, protocol, host, port, token)}>
                                                    <Text style={styles.authorizedTxt}>Authorized</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={styles.reject} onPress={() => reject(item, protocol, host, port, token)}>
                                                    <Text style={styles.rejectTxt}>Reject</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={styles.details} onPress={() => { navigation.navigate('ApprovalDetails',{tableId: item.AD_Table_ID.id,recordId:item.Record_ID}) }}>
                                                    <Text style={[styles.headingTxt, { fontFamily: 'K2D-Bold' }]}>Details</Text>

                                                    <MaterialIcons name='keyboard-arrow-right' size={24} color='#fff' />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            )}
                        />
                    }




                    {!filterButtonPressed && filteredItems.length === 0 ? (
                        <TouchableOpacity
                            style={styles.floatingButton}
                            onPress={openBottomSheet}
                        >
                            <MaterialCommunityIcons name='filter-outline' size={30} color='#fff' />
                        </TouchableOpacity>
                    ) : null}

                    <RBSheet
                        ref={bottomSheetRef}
                        height={500}
                        openDuration={250}
                        closeOnDragDown={true}
                        closeOnPressMask={false}
                        customStyles={{
                            container: {
                                justifyContent: "center",
                                alignItems: "center",
                                borderTopRightRadius: 30,
                                borderTopLeftRadius: 30,

                            }
                        }}
                    >
                        <View style={styles.filterContainer}>
                            <Text style={styles.filterTitle}>Filter</Text>
                            {/* <TextInput
                                style={styles.input}
                                placeholder="Filter by Department"
                                value={departmentFilter}
                                onChangeText={(text) => setDepartmentFilter(text)}
                            /> */}
                            {/* <TextInput
                                style={styles.input}
                                placeholder="Filter by Document"
                                value={documentFilter}
                                onChangeText={(text) => setDocumentFilter(text)}
                            /> */}
                            <Text style={styles.filterCalenderText}>Filter by Date Wise</Text>
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
                            <TouchableOpacity style={styles.button} onPress={handleFindPress}>
                                <Text style={styles.buttonText}>Find</Text>
                            </TouchableOpacity>
                        </View>

                    </RBSheet>
                    <Toast />
                </View>
            }
        </>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1
    },
    container: {
        alignItems: 'center',
    },
    header: {
        backgroundColor: '#0050C0',
        width: width,
        height: height / 10,
        alignItems: 'center',
        flexDirection: 'row'
    },
    headertxt: {
        color: 'white',
        fontSize: 23,
        fontFamily: 'K2D-Regular'
    },
    headerTxtCon: {
        width: width / 1.3,
        alignItems: 'center'
    },
    headerImage: {
        height: height / 14,
        width: width / 7,
        marginTop: 18,
        marginLeft: 10
    },
    headerBtnCon: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    item: {
        backgroundColor: 'white',
        borderRadius: 10,
        borderLeftWidth: 2,
        borderLeftColor: '#0070C0',
        elevation: 5,
        shadowColor: 'black',
        width: '90%',
        marginTop: 10,
        height: height / 6,
        marginBottom: 3,
        shadowOpacity: 0.5,
        shadowRadius: 20,
        shadowOffset: {
            width: 0,
            height: 30,
        }
    },
    cardContent: {
        flexDirection: 'row',

    },
    dateCon: {
        width: '60%',
        alignItems: 'center',
        justifyContent: 'center',

    },
    partyCon: {
        width: '40%',
        alignItems: 'center',
        justifyContent: 'center',
        height: height / 12,

    },
    headingTxt: {
        color: '#0050C0',
    },
    btnCon: {
        height: height / 20,
        width: '85%',
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginTop: 10,
    },
    authorized: {
        backgroundColor: '#dbfcf0',
        height: height / 26,
        width: '35%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        borderColor: 'lightgreen',
        borderWidth: 1,
        marginRight: 15
    },
    authorizedTxt: {
        fontFamily: 'K2D',
        color: 'green',
        fontSize: 12

    },
    reject: {
        backgroundColor: '#ebd5d1',
        height: height / 26,
        width: '30%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        borderColor: 'red',
        borderWidth: 1,
        marginRight: 15
    },
    rejectTxt: {
        color: 'red',
        fontFamily: 'K2D',
        fontSize: 12
    },
    details: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '40%',
        justifyContent: 'flex-end'
    },
    collapse: {
        height: height / 20,
        width: width / 12
    },

    floatingButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#00B0F0',
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
    filterContainer: {
        // padding: 16,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 12,
        padding: 8,
    },
    filterTitle: {
        fontSize: 30,
        fontFamily: 'K2D-Bold',
        marginBottom: 16,
        alignSelf: 'center',
        color: '#000'
    },
    filterCalenderText: {
        fontSize: 16,
        fontFamily: 'K2D-Bold',
        marginBottom: 16,
        marginLeft: 20,
        color: '#000',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16,
        paddingHorizontal: 16,
        marginHorizontal: 20
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
        marginBottom: 20


    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default AllApprovalList;
