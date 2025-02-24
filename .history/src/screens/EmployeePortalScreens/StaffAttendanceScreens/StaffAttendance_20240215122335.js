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
    const [activeButton, setActiveButton] = useState('unprocessed');
    const [processed, setProcessed] = useState([]);
    const [Unprocessed, setUnProcessed] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [dateFilterOpen, setDateFilterOpen] = useState(false);
    const [employeeFilterOpen, setEmployeeFilterOpen] = useState(false);
    const [departmentFilterOpen, setDepartmentFilterOpen] = useState(false);
    const [subDepartmentFilterOpen, setSubDepartmentFilterOpen] = useState(false);
    const [filteredProcessed, setFilteredProcessed] = useState([]);
    const [filteredUnprocessed, setFilteredUnprocessed] = useState([]);
    const [employeeSuggestions, setEmployeeSuggestions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchDepartment, setSearchDepartment] = useState('');
    const [departmentSuggestions, setDepartmentSuggestions] = useState([]);
    const [searchSubDepartment, setSearchSubDepartment] = useState('');
    const [subDepartmentSuggestions, setSubDepartmentSuggestions] = useState([]);
    const [filteredSubDepartmentSuggestions, setFilteredSubDepartmentSuggestions] = useState([]);
    const [selectedStartDate, setSelectedStartDate] = useState(null);
    const [selectedEndDate, setSelectedEndDate] = useState(null);
    const [isFilterApplied, setIsFilterApplied] = useState(false);
    const [currentMonthProcessed, setCurrentMonthProcessed] = useState([]);
    const [currentMonthUnprocessed, setCurrentMonthUnprocessed] = useState([]);
console.log(searchQuery)


    const onDateChange = (date, type) => {
        if (type === 'END_DATE') {
            setSelectedEndDate(date);
        } else {
            setSelectedStartDate(date);
        }
    };

    const applyFilters = (filterQuery, filterDepartment, filterSubDepartment, startDate, endDate) => {
        let newFilteredProcessed = [...processed];
        let newFilteredUnprocessed = [...Unprocessed];

        // Filter by Employee Name
        if (filterQuery) {
            newFilteredProcessed = newFilteredProcessed.filter(item =>
                item.business_partner.toLowerCase().includes(filterQuery.toLowerCase())
            );
            newFilteredUnprocessed = newFilteredUnprocessed.filter(item =>
                item.business_partner.toLowerCase().includes(filterQuery.toLowerCase())
            );
        }

        // Filter by Date Range
        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = endDate ? new Date(endDate) : new Date(start);
            end.setHours(23, 59, 59, 999);

            newFilteredProcessed = newFilteredProcessed.filter(item => {
                const itemDate = new Date(item.AttDate);
                return itemDate >= start && itemDate <= end;
            });
            newFilteredUnprocessed = newFilteredUnprocessed.filter(item => {
                const itemDate = new Date(item.attendance_date);
                return itemDate >= start && itemDate <= end;
            });
        }

        // Filter by Department
        if (filterDepartment) {
            newFilteredProcessed = newFilteredProcessed.filter(item =>
                item.department.toLowerCase().includes(filterDepartment.toLowerCase())
            );
            newFilteredUnprocessed = newFilteredUnprocessed.filter(item =>
                item.department.toLowerCase().includes(filterDepartment.toLowerCase())
            );
        }

        // Filter by Sub Department
        if (filterSubDepartment) {
            newFilteredProcessed = newFilteredProcessed.filter(item =>
                item.subdepartment && item.subdepartment.toLowerCase().includes(filterSubDepartment.toLowerCase())
            );
            newFilteredUnprocessed = newFilteredUnprocessed.filter(item =>
                item.subdepartment && item.subdepartment.toLowerCase().includes(filterSubDepartment.toLowerCase())
            );
        }

        setFilteredProcessed(newFilteredProcessed);
        setFilteredUnprocessed(newFilteredUnprocessed);

        setIsFilterApplied(true);
    };


    const onChangeSearch = query => {
        setSearchQuery(query);
        applyFilters(query, searchDepartment, searchSubDepartment, selectedStartDate, selectedEndDate);
    };
    const onSearchDepartmentChange = query => {
        setSearchDepartment(query);
        applyFilters(searchQuery, query);
    };

    const onSuggestionSelect = (selectedName) => {
        setSearchQuery(selectedName);
        setEmployeeSuggestions([]);
        applyFilters(selectedName, searchDepartment, searchSubDepartment);
    };

    const onDepartmentSuggestionSelect = (selectedDepartment, selectedDepartmentId) => {
        setSearchDepartment(selectedDepartment);
        setDepartmentSuggestions([]);
        setSearchSubDepartment('');

        const filteredSubDepts = subDepartmentSuggestions.filter(subDept =>
            subDept.HR_Department_ID && subDept.HR_Department_ID.id === selectedDepartmentId
        );
        setFilteredSubDepartmentSuggestions(filteredSubDepts);

        applyFilters(searchQuery, selectedDepartment, '');
    };

    const OnSearchSubDepartment = (selectedSubDepartment) => {
        setSearchSubDepartment(selectedSubDepartment);
        applyFilters(searchQuery, searchDepartment, selectedSubDepartment);
    };

    {/* for Bottom Sheet*/ }
    const openBottomSheet = () => {
        if (bottomSheetRef.current) {
            bottomSheetRef.current.open();
        }
    };
    const handleButtonPress = (button) => {
        setActiveButton(button);
    };


    {/* For Processed data*/ }
    const getProcessedAttandance = async () => {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('token')
        const protocol = await AsyncStorage.getItem('protocol')
        const host = await AsyncStorage.getItem('host')
        const port = await AsyncStorage.getItem('port')
        try {
            const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/HR_Processed_Attendance_V`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
            setProcessed(response.data.records);
            const currentMonthData = getCurrentMonthRecords(response.data.records);
            setCurrentMonthProcessed(currentMonthData);
        } catch (error) {
            console.log('Error', error)
        } finally {
            setIsLoading(false);
        }
    }

    {/* For Un Processed data*/ }
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
            const currentMonthData = getCurrentMonthRecords(response.data.records);
            setCurrentMonthUnprocessed(currentMonthData);
        } catch (error) {
            console.log('Error', error)
        } finally {
            setIsLoading(false);
        }
    }

    {/*Empolyee Filter  Api*/ }
    const getEmployeeName = async () => {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('token')
        const protocol = await AsyncStorage.getItem('protocol')
        const host = await AsyncStorage.getItem('host')
        const port = await AsyncStorage.getItem('port')
        try {
            const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/C_BPartner`,
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
            const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/HR_Department`,
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
            const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/HR_SubDepartment`,
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

    useEffect(() => {
        getEmployeeName();
        getDepartmentTable();
        getProcessedAttandance();
        getUnProcessedAttandance();
        getSubDepartmentTable();
    }, [])



    {/* For Display Time format*/ }
    function formatTime(timeString) {
        if (!timeString) return 'null';

        const timeParts = timeString.split(':');
        return `${timeParts[0]}:${timeParts[1]}`;
    }

    const getCurrentMonthRecords = (data) => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        return data.filter(item => {
            const itemDate = new Date(item.attendance_date || item.AttDate);
            return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
        });
    }


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
                                    {searchQuery.length > 0 && (
                                        <View style={styles.EmployeeFilterView}>
                                            <FlatList
                                                data={employeeSuggestions.filter(item =>
                                                    item.Name.toLowerCase().includes(searchQuery.toLowerCase())
                                                )}
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
                                                    <TouchableOpacity onPress={() => onDepartmentSuggestionSelect(item.Name, item.id)}>
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
                                            data={filteredSubDepartmentSuggestions}
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
                                    data={searchQuery || searchDepartment || selectedStartDate || (selectedStartDate && selectedEndDate) ? filteredUnprocessed : currentMonthUnprocessed}
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
                                />
                            </View>
                        )}

                        {activeButton === 'processed' && (
                            <View style={styles.contentContainer}>
                                <FlatList
                                    data={searchQuery || searchDepartment || selectedStartDate || (selectedStartDate && selectedEndDate) ? filteredProcessed : currentMonthProcessed}
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
        // backgroundColor: 'red',
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