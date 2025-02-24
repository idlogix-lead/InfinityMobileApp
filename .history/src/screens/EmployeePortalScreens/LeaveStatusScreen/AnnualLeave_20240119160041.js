import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Alert, Modal } from 'react-native'
import React, { useState, useEffect } from 'react'
import CustomHeader from '../../../components/CustomHeader'
import AnnualLeaveCard from '../../../components/LeaveStatusComponents/AnnualLeaveCard'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CalendarPicker from 'react-native-calendar-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';

const AnnualLeave = () => {
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [documentStatus, setDocumentStatus] = useState('')
    const [description, setDescription] = useState('')
    const [partnerId, setPartnerId] = useState(null);
    const [showCalendarStart, setShowCalendarStart] = useState(false);
    const [showCalendarEnd, setShowCalendarEnd] = useState(false);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [selectedLeaveType, setSelectedLeaveType] = useState(null);
    const [years, setYears] = useState([]);
    const [selectedYearId, setSelectedYearId] = useState(null);
    const [selectedYearLabel, setSelectedYearLabel] = useState('');
    const [employeeId, setEmployeeId] = useState('')


    {/* Variables for payload*/ }
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString();
    const ptnrId = partnerId?.C_BPartner_ID?.id;
    const ptnrName = partnerId?.C_BPartner_ID?.identifier;
    const orgName = partnerId?.AD_Org_ID?.identifier;
    const orgId = partnerId?.AD_Org_ID?.id;

    const FindBusinessPrtId = async () => {
        const token = await AsyncStorage.getItem('token');
        const protocol = await AsyncStorage.getItem('protocol');
        const host = await AsyncStorage.getItem('host');
        const port = await AsyncStorage.getItem('port');
        const Id = await AsyncStorage.getItem("userId");
        try {
            const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/AD_User?$filter=AD_User_ID eq ${Id}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
            setPartnerId(response?.data?.records[0])
        }
        catch (error) {
            console.error('Error  PartnerID:', error);
        }
    };

    const getYearId = async () => {
        const token = await AsyncStorage.getItem('token');
        const protocol = await AsyncStorage.getItem('protocol');
        const host = await AsyncStorage.getItem('host');
        const port = await AsyncStorage.getItem('port');

        try {
            const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/C_Year`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const extractedData = response.data.records.map(item => ({
                label: item.FiscalYear,
                value: item.id
            }));
            setYears(extractedData);
        } catch (error) {
            console.error('Error Year Id:', error);
        }
    };


    const LeaveRequestInfo = async () => {
        const token = await AsyncStorage.getItem('token');
        const protocol = await AsyncStorage.getItem('protocol');
        const host = await AsyncStorage.getItem('host');
        const port = await AsyncStorage.getItem('port');

        try {
            const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/HR_LevTypes`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const extractedData = response.data.records.map(item => ({
                label: item.Name,
                value: item.id
            }));
            setLeaveTypes(extractedData);
        } catch (error) {
            console.error('Error :', error);
        }
    };

    const getBasicInfo = async () => {
        const token = await AsyncStorage.getItem('token')
        const protocol = await AsyncStorage.getItem('protocol')
        const host = await AsyncStorage.getItem('host')
        const port = await AsyncStorage.getItem('port')
        const Id = await AsyncStorage.getItem("userId")
        try {
          const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/hr_employee_v?$filter=ad_user_id eq ${Id}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            })
          setEmployeeId(response?.data?.records[0]?.id);
        } catch (error) {
          console.log('Error', error)
        }
      }
    
      useEffect(() => {
        getBasicInfo();
      }, [])

    const SaveData = async () => {
        const clientName = await AsyncStorage.getItem('clientName');
        const token = await AsyncStorage.getItem('token');
        const value = await AsyncStorage.getItem('userName');
        const protocol = await AsyncStorage.getItem('protocol');
        const host = await AsyncStorage.getItem('host');
        const port = await AsyncStorage.getItem('port');
        const Id = await AsyncStorage.getItem("userId");
        const clientId = await AsyncStorage.getItem('clientId');

        try {
            const response = await axios.post(`${protocol}://${host}:${port}/api/v1/models/HR_EmpLev_Posting`,
            body: (
                {
                    "id": 1057609,
                    "uid": "be40ccfe-ae24-4ad6-a6f6-787075c013c1",
                    "AD_Client_ID": {
                        "propertyLabel": "",
                        "id": 1000000,
                        "identifier": "Starlet Innovations Pvt Ltd",
                        "model-name": "ad_client"
                    },
                    "AD_Org_ID": {
                        "propertyLabel": "",
                        "id": 1000000,
                        "identifier": "Starlet Innovation Pvt Ltd",
                        "model-name": "ad_org"
                    },
                    "Created": "2024-01-19T15:30:57Z",
                    "CreatedBy": {
                        "propertyLabel": "",
                        "id": 1000004,
                        "identifier": "Umar.Maqbool",
                        "model-name": "ad_user"
                    },
                    "Updated": "2024-01-19T15:30:57Z",
                    "UpdatedBy": {
                        "propertyLabel": "",
                        "id": 1000004,
                        "identifier": "Umar.Maqbool",
                        "model-name": "ad_user"
                    },
                    "IsActive": true,
                    "C_Year_ID": {
                        "propertyLabel": "",
                        "id": 1000004,
                        "identifier": "2023/24",
                        "model-name": "c_year"
                    },
                    "C_BPartner_ID": {
                        "propertyLabel": "",
                        "id": 1000660,
                        "identifier": "Umar Maqbool",
                        "model-name": "c_bpartner"
                    },
                    "HR_LevTypes_ID": {
                        "propertyLabel": "",
                        "id": 1000010,
                        "identifier": "Present",
                        "model-name": "hr_levtypes"
                    },
                    "StartDate": "2024-01-19",
                    "EndDate": "2024-01-20",
                    "HR_Employee_ID": {
                        "propertyLabel": "",
                        "id": 1000637,
                        "identifier": "-1",
                        "model-name": "hr_employee"
                    },
                    "Description": "Thank you for your",
                    "leave_minutes": 0,
                    "is_updating": false,
                    "nduration1": 0,
                    "DocumentNo": "1000016",
                    "DocStatus": {
                        "propertyLabel": "",
                        "id": "DR",
                        "identifier": "<DR>",
                        "model-name": "ad_ref_list"
                    },
                    "Processed": false,
                    "C_DocTypeTarget_ID": {
                        "propertyLabel": "",
                        "id": 1000059,
                        "identifier": "<1000059>",
                        "model-name": "c_doctype"
                    },
                    "IsApproved": true,
                    "model-name": "hr_emplev_posting"
                }),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    
                    //     {
                    //     'HR_Employee_ID': employeeId,
                    //     'AD_Client_ID': { 'id': clientId, 'identifier': clientName },
                    //     'AD_Org_ID': { 'id': orgId, 'identifier': orgName },
                    //     'C_BPartner_ID': { 'id': ptnrId, 'identifier': ptnrName },
                    //     "IsActive": true,
                    //     "Created": formattedDate,
                    //     "CreatedBy": { "id": parseInt(Id), "identifier": value, "model-name": "ad_user" },
                    //     "Updated": "",
                    //     "UpdatedBy": { "id": parseInt(Id), "identifier": value, "model-name": "ad_user", "propertyLabel": "Updated By" },
                    //     'StartDate': startDate,
                    //     'EndDate': endDate,
                    //     'HR_LevTypes_ID': { 'id': selectedLeaveType, 'identifier': leaveTypes.find(type => type.value === selectedLeaveType)?.label || '' },
                    //     // 'DocStatus': { 'id': 'DR', 'identifier': documentStatus },
                    //     'Description': description,
                    //     'C_Year_ID': { 'id': selectedYearId, 'identifier': selectedYearLabel },
                    // }
                    // ),
                },
                console.log(response,'ggggg')
                );

        } catch (error) {
            console.error('Error :', error);
        }
    };



    const Save = async () => {
        // if (client === '') {
        //     Alert.alert('Client cannot be empty')
        // } else if (organization === '') {
        //     Alert.alert('Organization cannot be empty')
        // } else if (BPartner === '') {
        //     Alert.alert('Bussiness Partner cannot be empty')
        // } else 
        if (startDate === null) {
            Alert.alert('start data cannot be empty')
        } else if (endDate === null) {
            Alert.alert('End data cannot be empty')
            // } else if (LeaveType === '') {
            //     Alert.alert('Leave Type cannot be empty')
            // } else if (documentStatus === '') {
            //     Alert.alert('Document Status cannot be empty')
            // } else if (description === '') {
            //     Alert.alert('Description cannot be empty')
            // } else if (docType === '') {
            //     Alert.alert('Document Type cannot be empty')
            // } else if (docNumber === '') {
            //     Alert.alert('Document Number cannot be empty')
            // } else if (docNumber === '') {
            //     Alert.alert('Year cannot be empty')
        } else {
            SaveData()
        }
    }

    useEffect(() => {
        FindBusinessPrtId();
        getYearId();
    }, []);
    useEffect(() => {
        if (partnerId) {
            LeaveRequestInfo();
        }
    }, [partnerId]);

    const onDateChangeStart = (date) => {
        setStartDate(date);
        setShowCalendarStart(false);
    };
    const onDateChangeEnd = (date) => {
        setEndDate(date);
        setShowCalendarEnd(false);
    };

    return (
        <View style={{ flex: 1, }}>
            <CustomHeader title='Annual Leave' />
            {/* Start Date Modal */}
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
                        />
                        <TouchableOpacity onPress={() => setShowCalendarEnd(false)} style={styles.closeBtn}>
                            <Text style={{ color: 'black' }}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <ScrollView >
                <View style={{ marginBottom: '7%' }}>

                    <Text style={styles.topTxt}>Select End Date</Text>
                    <TouchableOpacity onPress={() => setShowCalendarStart(true)} style={styles.startDate}>
                        {startDate && (
                            <Text style={styles.inside}>
                                {startDate.toString()}
                            </Text>
                        )}
                        {!startDate && (
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: '88%', justifyContent: 'center' }}>
                                    <Text style={styles.inside}>
                                        Selected Start Date
                                    </Text>
                                </View>
                                <MaterialCommunityIcons name='calendar-month-outline' size={26} color='#00B0F0' style={styles.calender} />
                            </View>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.topTxt}>Select End Date</Text>
                    <TouchableOpacity onPress={() => setShowCalendarEnd(true)} style={styles.startDate}>
                        {endDate && (
                            <Text style={styles.inside}>
                                {endDate.toString()}
                            </Text>
                        )}
                        {!endDate && (
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: '88%', justifyContent: 'center' }}>
                                    <Text style={styles.inside}>
                                        Selected End Date
                                    </Text>
                                </View>
                                <MaterialCommunityIcons name='calendar-month-outline' size={26} color='#00B0F0' style={styles.calender} />
                            </View>
                        )}
                    </TouchableOpacity>


                    <Text style={styles.topTxt}>Leave Type</Text>
                    <View style={styles.startDate}>
                        <Picker
                            style={{ color: 'gray' }}
                            dropdownIconColor={'#0070C0'}
                            selectedValue={selectedLeaveType}
                            onValueChange={(itemValue, itemIndex) =>
                                setSelectedLeaveType(itemValue)
                            }>
                            {leaveTypes.map((type, index) => (
                                <Picker.Item key={index} label={type.label} value={type.value} />
                            ))}
                        </Picker>

                    </View>

                    <Text style={styles.topTxt}>Year</Text>
                    <View style={styles.startDate}>
                        <Picker
                            style={{ color: 'gray' }}
                            dropdownIconColor={'#0070C0'}
                            selectedValue={selectedYearId}
                            onValueChange={(itemValue, itemIndex) => {
                                setSelectedYearId(itemValue);
                                const selectedYear = years.find(year => year.value === itemValue);
                                setSelectedYearLabel(selectedYear ? selectedYear.label : '');
                            }}>
                            {years.map((year, index) => (
                                <Picker.Item key={index} label={year.label} value={year.value} />
                            ))}
                        </Picker>

                    </View>

                    <AnnualLeaveCard
                        placeholder='Description'
                        Txt={'Description'}
                        value={description}
                        onTextChange={setDescription}
                    />

                    <TouchableOpacity style={styles.btnSave} onPress={() => Save()}>
                        <Text style={[styles.BtnTxt, { color: 'white' }]}>Save</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )
}

export default AnnualLeave

const styles = StyleSheet.create({
    btnSave: {
        backgroundColor: '#00B0F0',
        height: 40,
        width: '50%',
        alignSelf: 'center',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
    },
    BtnTxt: {
        color: '#0070C0',
        fontSize: 16,
        fontFamily: 'K2D-Regular',
    },
    startDate: {
        height: 40,
        width: '85%',
        alignSelf: 'center',
        borderWidth: 2,
        borderColor: '#00B0F0',
        borderRadius: 5,
        justifyContent: 'center',
    },
    inside: {
        marginLeft: 10,
        color: 'gray',
        fontFamily: 'K2D',
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
    close: {
        color: '#00B0F0',
        fontSize: 16,
        fontFamily: 'K2D-Regular'
    },
    modal: {
        width: '90%',
        backgroundColor: '#0070C0',
        borderRadius: 20,
        alignItems: 'center'
    },
    blurView: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    topTxt: {
        color: '#0070C0',
        fontSize: 16,
        fontFamily: 'K2D-Regular',
        width: '85%',
        alignSelf: 'center',
        marginTop: '3%',
    },
})