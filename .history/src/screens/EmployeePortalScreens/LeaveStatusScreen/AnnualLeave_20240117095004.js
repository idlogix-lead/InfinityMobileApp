import { ScrollView, StyleSheet, Text, View, TouchableOpacity,Alert } from 'react-native'
import React, { useState } from 'react'
import CustomHeader from '../../../components/CustomHeader'
import AnnualLeaveCard from '../../../components/LeaveStatusComponents/AnnualLeaveCard'

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

    const SaveData = async () => {

    }

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
        }else if (docNumber === '') {
            Alert.alert('Document Number cannot be empty')
        }else if (docNumber === '') {
            Alert.alert('Year cannot be empty')
        }else{
            SaveData()
        }

    }

    return (
        <View style={{ flex: 1, }}>
            <CustomHeader title='Annual Leave' />

            <ScrollView >
                <View style={{ marginBottom: '7%' }}>
                    <AnnualLeaveCard
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
                    />
                    <AnnualLeaveCard
                        Txt={'Start Date'}
                        value={startDate}
                        onTextChange={setStartDate}
                    />
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
                    <AnnualLeaveCard
                        Txt={'Document Status'}
                        value={documentStatus}
                        onTextChange={setDocumentStatus}
                    />
                    <AnnualLeaveCard
                        Txt={'Description'}
                        value={description}
                        onTextChange={setDescription}
                    />
                    <AnnualLeaveCard
                        Txt={'Document Type'}
                        value={docType}
                        onTextChange={setDocType}
                    />
                    <AnnualLeaveCard
                        Txt={'Document Number'}
                        value={docNumber}
                        onTextChange={setDocNumber}
                    />
                    <AnnualLeaveCard
                        Txt={'Year'}
                        value={year}
                        onTextChange={setYear}
                    />

                    <TouchableOpacity style={styles.btnSave} onPress={()=>Save()}>
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
})