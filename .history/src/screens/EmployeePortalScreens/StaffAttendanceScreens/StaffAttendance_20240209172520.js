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
})