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

    const [isLoading, setIsLoading] = useState(false);
    const [activeButton, setActiveButton] = useState('unprocessed');
    const [processed, setProcessed] = useState([]);
    const [Unprocessed, setUnProcessed] = useState([]);

    const [dateFilterOpen, setDateFilterOpen] = useState(false);
    const [employeeFilterOpen, setEmployeeFilterOpen] = useState(false);
    const [departmentFilterOpen, setDepartmentFilterOpen] = useState(false);
    const [subDepartmentFilterOpen, setSubDepartmentFilterOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [employeeSuggestions, setEmployeeSuggestions] = useState([]);

    const [selectedStartDate, setSelectedStartDate] = useState('2023-12-01');
    const [selectedEndDate, setSelectedEndDate] = useState('2023-12-15');

    const [searchDepartment, setSearchDepartment] = useState('');
    const [departmentSuggestions, setDepartmentSuggestions] = useState([]);

    const [searchSubDepartment, setSearchSubDepartment] = useState('');
    const [subDepartmentSuggestions, setSubDepartmentSuggestions] = useState([]);

    const [currentMonthProcessed, setCurrentMonthProcessed] = useState([]);
    const [currentMonthUnprocessed, setCurrentMonthUnprocessed] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMorePages, setHasMorePages] = useState(true);
    const [skip, setSkip] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    
    const page_size = 10;
    {/* For Processed data*/ }
    const getProcessedAttandance = async (page) => {
        setIsLoading(true);
        setIsLoadingMore(true);
        const token = await AsyncStorage.getItem('token')
        const protocol = await AsyncStorage.getItem('protocol')
        const host = await AsyncStorage.getItem('host')
        const port = await AsyncStorage.getItem('port')

        let queryParams = `$filter=`;
        let conditions = [];
        if (searchQuery) {
            conditions.push(`business_partner eq '${searchQuery}'`);
        }
        if (searchDepartment) {
            conditions.push(`department eq '${searchDepartment}'`);
        }
        if (searchSubDepartment) {
            conditions.push(`subdepartment eq '${searchSubDepartment}'`);
        }
        if (selectedStartDate && selectedEndDate) {
            conditions.push(`AttDate ge ${selectedStartDate} and AttDate le ${selectedEndDate}`);
        }
        queryParams += conditions.join(' and ');

        // console.log(page,'d')
         const skip = (currentPage - 1) * page_size; 
        // setSkip(newSkip);

        try {
            const response = await axios.get( `${protocol}://${host}:${port}/api/v1/models/HR_Processed_Attendance_V?${queryParams}&$top=${page_size}&$skip=${skip}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })

                setTotalPages(Math.ceil(response.data['row-count'] / page_size));
                console.log(response.data['row-count'],'row_count')
                console.log(totalPages,'pages')
            setProcessed((prevData) => [...prevData, ...response.data.records]);
            // setCurrentPage(page);

            if(currentPage+1<totalPages)
             {
                setCurrentPage(currentPage+1);
                getProcessedAttandance(currentPage);
            }

            
             if (response.data.records.length < 10) {
                setHasMorePages(false);
            }
        } catch (error) {
            console.log('Error', error)
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }

    {/* For UnProcessed data*/ }
    const getUnProcessedAttandance = async () => {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('token')
        const protocol = await AsyncStorage.getItem('protocol')
        const host = await AsyncStorage.getItem('host')
        const port = await AsyncStorage.getItem('port')

        try {
            const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/HR_UnProcessed_Attendance_V`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
            setUnProcessed(response.data.records);
        } catch (error) {
            console.log('Error', error)
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getEmployeeName();
        getDepartmentTable();
        getSubDepartmentTable();
        getProcessedAttandance();
        getUnProcessedAttandance();
    }, [])

    {/*Empolyee Filter  Api*/ }
    const getEmployeeName = async () => {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('token')
        const protocol = await AsyncStorage.getItem('protocol')
        const host = await AsyncStorage.getItem('host')
        const port = await AsyncStorage.getItem('port')
        try {
            const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/C_BPartner?$select=Name,IsEmployee`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
            const employeeData = response.data.records.filter(item => item.IsEmployee === true);
            setEmployeeSuggestions(employeeData);
        } catch (error) {
            console.log('Error', error)
        } finally {
            setIsLoading(false);
        }
    }

    {/*Department Filter Api */ }
    const getDepartmentTable = async () => {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('token')
        const protocol = await AsyncStorage.getItem('protocol')
        const host = await AsyncStorage.getItem('host')
        const port = await AsyncStorage.getItem('port')
        const Id = await AsyncStorage.getItem("userId")
        try {
            const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/HR_Department?$select=Name`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
            setDepartmentSuggestions(response.data.records);
        } catch (error) {
            console.log('Error', error)
        } finally {
            setIsLoading(false);
        }
    }
    {/*Sub Department Filter Api */ }
    const getSubDepartmentTable = async () => {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('token')
        const protocol = await AsyncStorage.getItem('protocol')
        const host = await AsyncStorage.getItem('host')
        const port = await AsyncStorage.getItem('port')
        try {
            const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/HR_SubDepartment?$select=Name`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
            setSubDepartmentSuggestions(response.data.records);
        } catch (error) {
            console.log('Error', error)
        } finally {
            setIsLoading(false);
        }
    }


    function formatTime(timeString) {
        if (!timeString) return 'null';

        const timeParts = timeString.split(':');
        return `${timeParts[0]}:${timeParts[1]}`;
    }

    const onSuggestionSelect = (selectedName) => {
        setSearchQuery(selectedName);
        setEmployeeSuggestions([]);
        applyFilters();
    };


    const onChangeSearch = async (query) => {
        setSearchQuery(query);

        if (query.length >= 3) {
            // Call the API to get employee suggestions based on the query
            const token = await AsyncStorage.getItem('token');
            const protocol = await AsyncStorage.getItem('protocol');
            const host = await AsyncStorage.getItem('host');
            const port = await AsyncStorage.getItem('port');
            const url = `${protocol}://${host}:${port}/api/v1/models/C_BPartner?$select=Name,IsEmployee&$filter=contains(Name,'${query}') and IsEmployee eq true`;
            console.log(query,'q');
            console.log(url,'url');
            try {
                const response = await axios.get(url,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                console.log(response.data.records)
                setEmployeeSuggestions(response.data.records);
            } catch (error) {
                console.log('Error', error);
            }
        } else {
            setEmployeeSuggestions([]);
        }
    };


    const onSearchDepartmentChange = query => {
        setSearchDepartment(query);
    };

    const onDepartmentSuggestionSelect = (selectedDepartment, selectedDepartmentId) => {
        setSearchDepartment(selectedDepartment);
        setDepartmentSuggestions([]);
        setSearchSubDepartment('');
        applyFilters();
    };

    const OnSearchSubDepartment = (selectedSubDepartment) => {
        setSearchSubDepartment(selectedSubDepartment);
        applyFilters();
    };

    const onDateChange = (date, type) => {
        const formattedDate = date ? date.toISOString().split('T')[0] : null;
        if (type === 'END_DATE') {
            setSelectedEndDate(formattedDate);
        } else {
            setSelectedStartDate(formattedDate);
        }
    };
    const applyFilters = () => {
        getProcessedAttandance();
    }
    useEffect(() => {
        applyFilters();
    }, [searchQuery, searchDepartment, searchSubDepartment, selectedStartDate, selectedEndDate]);


    const handleButtonPress = (button) => {
        setActiveButton(button);
    }

    const openBottomSheet = () => {
        if (bottomSheetRef.current) {
            bottomSheetRef.current.open();
        }
    };

    const renderNoResultMessage = () => {
        const isCurrentMonthDataEmpty = activeButton === 'unprocessed'
            ? currentMonthUnprocessed.length === 0
            : currentMonthProcessed.length === 0;

        return isCurrentMonthDataEmpty && (
            <View style={styles.noResultContainer}>
                <Text style={styles.noResultText}>No Result</Text>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, }}>
            <CustomHeader title={'Staff Attendance'} RightIcon="filter-variant" RightPress={openBottomSheet} />

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
                    <ScrollView>
                        <View style={{ marginBottom: 100 }}>
                            <TouchableOpacity onPress={() => setEmployeeFilterOpen(!employeeFilterOpen)}>
                                <Text style={styles.FilteredTxt}>Employee Name</Text>
                            </TouchableOpacity>
                            {employeeFilterOpen && (
                                <View>
                                    <Searchbar
                                        style={styles.searchBar}
                                        placeholder="Search Employee Name"
                                        onChangeText={onChangeSearch}
                                        value={searchQuery}
                                    />
                                    {searchQuery.length >= 3 && (
                                        <View style={styles.EmployeeFilterView}>
                                            <FlatList
                                                data={employeeSuggestions}
                                                keyExtractor={(item, index) => `${item.id}_${index}`}
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity onPress={() => onSuggestionSelect(item.Name)}>
                                                        <View>
                                                            <Text style={styles.EmployeFilterTxt}>{item.Name}</Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                )}
                                            />
                                        </View>
                                    )}
                                </View>
                            )}

                            <TouchableOpacity onPress={() => setDateFilterOpen(!dateFilterOpen)}>
                                <Text style={styles.FilteredTxt}>Date</Text>
                            </TouchableOpacity>
                            {dateFilterOpen && (
                                <View style={styles.CalendarContainer}>
                                    <View>
                                        <CalendarPicker
                                            startFromMonday={true}
                                            allowRangeSelection={true}
                                            todayBackgroundColor="#e6ffe6"
                                            selectedDayColor="#66ff33"
                                            selectedDayTextColor="#000000"
                                            scaleFactor={420}
                                            textStyle={{
                                                fontFamily: 'Cochin',
                                                color: '#000000',
                                            }}
                                            onDateChange={onDateChange}
                                        />
                                    </View>
                                    <TouchableOpacity
                                        style={styles.FindButton}
                                        onPress={() => applyFilters(searchQuery, searchDepartment, searchSubDepartment, selectedStartDate, selectedEndDate)}
                                    >
                                        <Text style={styles.FindButtonText}>Find</Text>
                                    </TouchableOpacity>

                                </View>
                            )}
                            <TouchableOpacity onPress={() => setDepartmentFilterOpen(!departmentFilterOpen)}>
                                <Text style={styles.FilteredTxt}>Department</Text>
                            </TouchableOpacity>
                            {departmentFilterOpen && (
                                <View>
                                    <Searchbar
                                        style={styles.searchBar}
                                        placeholder="Search Department"
                                        onChangeText={onSearchDepartmentChange}
                                        value={searchDepartment}
                                    />
                                    {searchDepartment.length > 0 && (
                                        <View style={styles.DepartmentFilterView}>
                                            <FlatList
                                                data={departmentSuggestions.filter(item =>
                                                    item.Name.toLowerCase().includes(searchDepartment.toLowerCase())
                                                )}
                                                keyExtractor={(item, index) => `${item.id}_${index}`}
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity
                                                        onPress={() => onDepartmentSuggestionSelect(item.Name, item.id)}
                                                    >
                                                        <Text style={styles.EmployeFilterTxt}>{item.Name}</Text>
                                                    </TouchableOpacity>

                                                )}
                                            />
                                        </View>
                                    )}
                                </View>
                            )}

                            <TouchableOpacity onPress={() => setSubDepartmentFilterOpen(!subDepartmentFilterOpen)}>
                                <Text style={styles.FilteredTxt}>Sub Department</Text>
                            </TouchableOpacity>
                            {subDepartmentFilterOpen && searchDepartment && (
                                <View>
                                    <Searchbar
                                        style={styles.searchBar}
                                        placeholder="Search Sub Department"
                                        onChangeText={OnSearchSubDepartment}
                                        value={searchSubDepartment}
                                        editable={!!searchDepartment}
                                    />
                                    <View style={styles.EmployeeFilterView}>
                                        <FlatList
                                            data={subDepartmentSuggestions}
                                            keyExtractor={(item, index) => `${item.id}_${index}`}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity onPress={() => OnSearchSubDepartment(item.Name)}>
                                                    <Text style={styles.EmployeFilterTxt}>{item.Name}</Text>
                                                </TouchableOpacity>
                                            )}
                                        />
                                    </View>
                                </View>
                            )}
                        </View>
                    </ScrollView>
                </View>
            </RBSheet>

            <View>
                <TotalAttendance />
                <View style={{ height: '81%' }}>
                    <View style={styles.TopButtons}>
                        <TouchableOpacity
                            style={[styles.ButtonView, activeButton === 'unprocessed' && styles.activeButton]}
                            onPress={() => handleButtonPress('unprocessed')}>
                            <Text style={[styles.ButtonTxt, activeButton === 'unprocessed' && styles.activeButtonText]}>
                                Un Processed
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.ButtonView, activeButton === 'processed' && styles.activeButton]}
                            onPress={() => handleButtonPress('processed')}>
                            <Text style={[styles.ButtonTxt, activeButton === 'processed' && styles.activeButtonText]}>
                                Processed
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ height: '88%' }}>
                        {activeButton === 'unprocessed' && (
                            <View style={styles.contentContainer}>
                                <FlatList
                                    data={Unprocessed}
                                    keyExtractor={(item, index) => `${item.id}_${index}`}
                                    ListEmptyComponent={renderNoResultMessage}
                                    renderItem={({ item }) => (
                                        <UnProceedCard
                                            date={item.attendance_date ? item.attendance_date : 'null'}
                                            liveRoll={item.business_partner ? item.business_partner : 'null'}
                                            Table={'Status'}
                                            Icon={<MaterialCommunityIcons name='account-check' size={23} color='#0050C0' />}
                                            CheckInTxt={item.attendance_time ? formatTime(item.attendance_time) : 'null'}
                                            CheckOutTxt={item?.Status?.id ? item?.Status?.id : 'null'}
                                            DepartmentTxt={item.department ? item.department : 'null'}
                                            SubDepartmentTxt={item.subdepartment ? item.subdepartment : 'null'}
                                        />
                                    )}
                                    onEndReached={() => {
                                        if (!isLoading && !isLoadingMore && hasMorePages) {
                                            getProcessedAttandance(currentPage + 1);
                                        }
                                    }}
                                    onEndReachedThreshold={0.1}
                                />
                            </View>
                        )}

                        {activeButton === 'processed' && (
                            <View style={styles.contentContainer}>
                                <FlatList
                                    data={processed}
                                    keyExtractor={(item, index) => `${item.id}_${index}`}
                                    ListEmptyComponent={renderNoResultMessage}
                                    renderItem={({ item }) => (
                                        <UnProceedCard
                                            date={item.AttDate ? item.AttDate : 'null'}
                                            liveRoll={item.business_partner ? item.business_partner : 'null'}
                                            CheckInTxt={item.intime ? formatTime(item.intime) : 'null'}
                                            Icon={<AntDesign name='logout' size={20} color='#0050C0' />}
                                            Table={'Check Out'}
                                            CheckOutTxt={item.outtime ? formatTime(item.outtime) : 'null'}
                                            DepartmentTxt={item.department ? item.department : 'null'}
                                            SubDepartmentTxt={item.subdepartment ? item.subdepartment : 'null'}
                                        />
                                    )}
                                />
                            </View>
                        )}
                    </View>
                </View>
            </View>
            {isLoading ? <Loader /> : null}
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
    contentContainer: {
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    filterContainer: {
        padding: 16,
        paddingTop: 0,
    },
    filterTitle: {
        fontSize: 30,
        marginBottom: 5,
        alignSelf: 'center',
        color: '#000',
        fontFamily: 'K2D-Bold',
    },
    FilteredTxt: {
        color: '#000',
        fontFamily: 'K2D-Bold',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        padding: 10,
        fontSize: 18,
    },
    EmployeeFilterView: {
        paddingLeft: 20,
        height: 150,
        marginBottom: 10,
    },
    EmployeFilterTxt: {
        fontFamily: 'K2D-Regular',
        color: '#000'
    },
    searchBar: {
        height: 40,
        width: '86%',
        marginTop: 12,
        alignSelf: 'center',
        marginBottom: 10,
        borderRadius: 5,
        backgroundColor: "#ebe8e8",
        elevation: 0,
    },
    CalendarContainer: {
        padding: 10,
    },
    FindButton: {
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
    FindButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    noResultText: {
        fontSize: 22,
        fontFamily: 'K2D-Bold',
        alignSelf: 'center',
        color: '#000',
        marginBottom: '15%'
    },
})