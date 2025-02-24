import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Alert, Modal } from 'react-native'
import React, { useState, useEffect } from 'react'
import CustomHeader from '../../../components/CustomHeader'
import AnnualLeaveCard from '../../../components/LeaveStatusComponents/AnnualLeaveCard'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CalendarPicker from 'react-native-calendar-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

const AnnualLeave = () => {
    const [client, setClient] = useState('')
    const [organization, setOrganization] = useState('')
    const [BPartner, setBPartner] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [LeaveType, setLeaveType] = useState('')
    const [documentStatus, setDocumentStatus] = useState('')
    const [description, setDescription] = useState('')
    const [docType, setDocType] = useState('')
    const [docNumber, setDocNumber] = useState('')
    const [year, setYear] = useState('')
    const [partnerId, setPartnerId] = useState(null);
    const [showCalendarStart, setShowCalendarStart] = useState(false);

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
            setPartnerId(response?.data?.records[0]?.C_BPartner_ID?.id)

        } catch (error) {
            console.error('Error :', error);
        }
    };

    const SaveData = async () => {
        const token = await AsyncStorage.getItem('token');
        const protocol = await AsyncStorage.getItem('protocol');
        const host = await AsyncStorage.getItem('host');
        const port = await AsyncStorage.getItem('port');
        const Id = await AsyncStorage.getItem("userId");
        const clientId = await AsyncStorage.getItem('clientId');
        const organizationId = await AsyncStorage.getItem('organizationId');

        try {
            const response = await axios.post(`${protocol}://${host}:${port}/api/v1/models/HR_EmpLev_Posting`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: ({
                        'AD_Client_ID': { 'id': clientId, 'identifier': client },
                        'AD_Org_ID': { 'id': organizationId, 'identifier': organization },
                        'C_BPartner_ID': { 'id': partnerId, 'identifier': BPartner },
                        'StartDate': startDate,
                        'EndDate': endDate,
                        'HR_LevTypes_ID': { 'id': '', 'identifier': LeaveType },
                        'DocStatus': { 'id': 'DR', 'identifier': documentStatus },
                        'Description': description,
                        'C_DocType_ID': { 'id': '', 'identifier': docType },
                        'C_DocTypeTarget_ID': { 'id': '', 'identifier': docNumber },
                        'C_Year_ID': { 'id': '', 'identifier': year },
                    }),
                });

        } catch (error) {
            console.error('Error :', error);
        }
    };



    const Save = async () => {
        if (client === '') {
            Alert.alert('Client cannot be empty')
        } else if (organization === '') {
            Alert.alert('Organization cannot be empty')
        } else if (BPartner === '') {
            Alert.alert('Bussiness Partner cannot be empty')
        } else if (startDate === '') {
            Alert.alert('start data cannot be empty')
        } else if (endDate === '') {
            Alert.alert('End data cannot be empty')
        } else if (LeaveType === '') {
            Alert.alert('Leave Type cannot be empty')
        } else if (documentStatus === '') {
            Alert.alert('Document Status cannot be empty')
        } else if (description === '') {
            Alert.alert('Description cannot be empty')
        } else if (docType === '') {
            Alert.alert('Document Type cannot be empty')
        } else if (docNumber === '') {
            Alert.alert('Document Number cannot be empty')
        } else if (docNumber === '') {
            Alert.alert('Year cannot be empty')
        } else {
            SaveData()
        }
    }

    useEffect(() => {
        FindBusinessPrtId();
    }, []);

    const onDateChangeStart = (date) => {
        setStartDate(date);
        setShowCalendarStart(false);
    };

    return (
        <View style={{ flex: 1, }}>
            <CustomHeader title='Annual Leave' />

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

            <ScrollView >
                <View style={{ marginBottom: '7%' }}>
                    {/* <AnnualLeaveCard
                        Txt={'Client'}
                        value={client}
                        onTextChange={setClient}
                    />
                    <AnnualLeaveCard
                        Txt={'Organization'}
                        value={organization}
                        onTextChange={setOrganization}
                    />
                    <AnnualLeaveCard
                        Txt={'Bussiness Partner'}
                        value={BPartner}
                        onTextChange={setBPartner}
                    /> */}
                    {/* <AnnualLeaveCard
                        Txt={'Start Date'}
                        value={startDate}
                        onTextChange={setStartDate}
                    /> */}
                    <TouchableOpacity onPress={() => setShowCalendarStart(true)} style={styles.startDate}>
                        {startDate && (
                            <Text style={styles.inside}>
                                {startDate.toString()}
                            </Text>
                        )}
                        {!startDate && (
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: '88%',backgroundColor:'red' }}>
                                    <Text style={styles.inside}>
                                        Selected Start Date
                                    </Text>
                                </View>
                                {/* <Image source={require('../../asserts/RequestAsserts/calendar.png')} style={styles.calender} /> */}
                                <MaterialCommunityIcons name='calendar-month-outline' size={26} color='#00B0F0' style={styles.calender} />
                            </View>
                        )}
                    </TouchableOpacity>
                    <AnnualLeaveCard
                        Txt={'End Date'}
                        value={endDate}
                        onTextChange={setEndDate}
                    />
                    <AnnualLeaveCard
                        Txt={'Leave Type'}
                        value={LeaveType}
                        onTextChange={setLeaveType}
                    />
                    {/* <AnnualLeaveCard
                        Txt={'Document Status'}
                        value={documentStatus}
                        onTextChange={setDocumentStatus}
                    /> */}
                    <AnnualLeaveCard
                        Txt={'Description'}
                        value={description}
                        onTextChange={setDescription}
                    />
                    {/* <AnnualLeaveCard
                        Txt={'Document Type'}
                        value={docType}
                        onTextChange={setDocType}
                    /> */}
                    {/* <AnnualLeaveCard
                        Txt={'Document Number'}
                        value={docNumber}
                        onTextChange={setDocNumber}
                    /> */}
                    <AnnualLeaveCard
                        Txt={'Year'}
                        value={year}
                        onTextChange={setYear}
                    />

                    <TouchableOpacity style={styles.btnSave} onPress={() => Save()}>
                        <Text style={[styles.topTxt, { color: 'white' }]}>Save</Text>
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
    topTxt: {
        color: '#0070C0',
        fontSize: 16,
        fontFamily: 'K2D-Regular',
    },
    startDate:{
        height:40,
        width:'85%',
        alignSelf:'center',
        marginTop:'3%',
        borderWidth:2,
        borderColor:'#00B0F0',
        borderRadius:5,
    },
    inside: {
        marginLeft: 10,
        color: 'gray',
        fontFamily: 'K2D',
      },
})