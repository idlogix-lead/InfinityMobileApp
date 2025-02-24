import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React,{useState} from 'react'
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

    return (
        <ScrollView style={{flex:1,}}>
            <View style={{marginBottom:'7%'}}>
                <CustomHeader title='Annual Leave' />
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
            </View>
        </ScrollView>
    )
}

export default AnnualLeave

const styles = StyleSheet.create({})