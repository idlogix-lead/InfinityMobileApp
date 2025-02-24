import { StyleSheet, Text, View, ScrollView } from 'react-native'
import React from 'react'
import CustomHeader from '../../../components/CustomHeader'
import SalarySlipCardView from '../../../components/EmployeePortalComponents/SalarySlipComponents/SalarySlipCardView'

const SalarySlip = () => {
    return (
        <ScrollView style={{ flex: 1 }}>
            <CustomHeader title='Salary Slip' />
            <View>
                <Text style={styles.textHeading}>HR Payroll movement</Text>
                <View>
                    <SalarySlipCardView
                     Icon={''}
                     TitleText={'Gross Salary'}
                     Txt={'hdf'}
                    />
                    <SalarySlipCardView
                     Icon={''}
                     TitleText={'Deduction'}
                     Txt={''}
                    />
                    <SalarySlipCardView
                     Icon={''}
                     TitleText={'Allowance'}
                     Txt={''}
                    />
                    <SalarySlipCardView
                     Icon={''}
                     TitleText={'Tax'}
                     Txt={''}
                    />
                    <SalarySlipCardView
                     Icon={''}
                     TitleText={'Net Salary'}
                     Txt={''}
                    />
                </View>
            </View>
        </ScrollView>
    )
}

export default SalarySlip

const styles = StyleSheet.create({
    textHeading: {
        color: '#000',
        fontFamily: 'K2D-Bold',
        fontSize: 20,
        padding: 10,
    },
})