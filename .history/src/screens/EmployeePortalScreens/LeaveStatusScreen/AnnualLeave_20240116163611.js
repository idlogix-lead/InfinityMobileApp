import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomHeader from '../../../components/CustomHeader'
import AnnualLeaveCard from '../../../components/LeaveStatusComponents/AnnualLeaveCard'

const AnnualLeave = () => {
    return (
        <ScrollView style={{flex:1,}}>
            <View style={{marginBottom:'5%'}}>
                <CustomHeader title='Annual Leave' />
                <AnnualLeaveCard
                    Txt={'Client'}
                />
                <AnnualLeaveCard
                    Txt={'Organization'}
                />
                <AnnualLeaveCard
                    Txt={'Bussiness Partner'}
                />
                <AnnualLeaveCard
                    Txt={'Start Date'}
                />
                <AnnualLeaveCard
                    Txt={'End Date'}
                />
                <AnnualLeaveCard
                    Txt={'Leave Type'}
                />
                <AnnualLeaveCard
                    Txt={'Document Status'}
                />
                <AnnualLeaveCard
                    Txt={'Description'}
                />
                <AnnualLeaveCard
                    Txt={'Document Type'}
                />
                <AnnualLeaveCard
                    Txt={'Document Number'}
                />
                <AnnualLeaveCard
                    Txt={'Year'}
                />
            </View>
        </ScrollView>
    )
}

export default AnnualLeave

const styles = StyleSheet.create({})