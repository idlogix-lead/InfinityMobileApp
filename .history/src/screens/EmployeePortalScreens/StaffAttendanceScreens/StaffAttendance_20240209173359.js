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
    
    const [dateFilterOpen, setDateFilterOpen] = useState(false);
    const [employeeFilterOpen, setEmployeeFilterOpen] = useState(false);
    const [departmentFilterOpen, setDepartmentFilterOpen] = useState(false);
    const [subDepartmentFilterOpen, setSubDepartmentFilterOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');

    const [searchDepartment, setSearchDepartment] = useState('');

    const [selectedStartDate, setSelectedStartDate] = useState(null);
    const [selectedEndDate, setSelectedEndDate] = useState(null);


    


    const onChangeSearch = query => {
        setSearchQuery(query);
        // applyFilters(query, searchDepartment, searchSubDepartment, selectedStartDate, selectedEndDate);
    };
    const onSearchDepartmentChange = query => {
        setSearchDepartment(query);
    };

    const onDateChange = (date, type) => {
        if (type === 'END_DATE') {
            setSelectedEndDate(date);
        } else {
            setSelectedStartDate(date);
        }
    };

    const openBottomSheet = () => {
        if (bottomSheetRef.current) {
            bottomSheetRef.current.open();
        }
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
                                        // onPress={() => applyFilters(searchQuery, searchDepartment, searchSubDepartment, selectedStartDate, selectedEndDate)}
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
                            style={[styles.ButtonView,]}

                        >
                            <Text style={[styles.ButtonTxt,]}>
                                Un Processed
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.ButtonView,]}
                        >
                            <Text style={[styles.ButtonTxt,]}>
                                Processed
                            </Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
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