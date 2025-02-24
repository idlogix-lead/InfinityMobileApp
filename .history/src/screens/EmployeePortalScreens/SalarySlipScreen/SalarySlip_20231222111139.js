import { StyleSheet, Text, View, ScrollView } from 'react-native'
import React,{useEffect,useState} from 'react'
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomHeader from '../../../components/CustomHeader'
import SalarySlipCardView from '../../../components/EmployeePortalComponents/SalarySlipComponents/SalarySlipCardView'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
const SalarySlip = () => {
    const [receiptData, setReceiptData] =useState({})

    let size = 25,
    let color = '#000000',
    const SalarySlipData = async () => {
        const token = await AsyncStorage.getItem('token')
            const protocol = await AsyncStorage.getItem('protocol')
            const host = await AsyncStorage.getItem('host')
            const port = await AsyncStorage.getItem('port')
            const Id = await AsyncStorage.getItem("userId")
        try {
          const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/hr_payroll_movement_v?$filter=ad_user_id eq ${Id}`,
          {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        setReceiptData(response.data.records[0])
        // console.log(response.data.records[0],'mmm');
        } catch (error) {
          console.log('Error', error)
        }
      }
    
      useEffect(()=>{
        SalarySlipData();
      },[])

    return (
        <ScrollView style={{ flex: 1 }}>
            <CustomHeader title='Salary Slip' />
            <View>
                <Text style={styles.textHeading}>HR Payroll movement</Text>
                <View>
                    <SalarySlipCardView
                     Icon={''}
                     TitleText={'Gross Salary'}
                     Txt={receiptData.p_gross}
                    />
                    <SalarySlipCardView
                     Icon={''}
                     TitleText={'Deduction'}
                     Txt={receiptData.total_deductions}
                    />
                    <SalarySlipCardView
                     Icon={''}
                     TitleText={'Allowance'}
                     Txt={receiptData.total_additions}
                    />
                    <SalarySlipCardView
                     Icon={''}
                     TitleText={'Tax'}
                     Txt={receiptData.tax}
                    />
                    <SalarySlipCardView
                     Icon={<MaterialCommunityIcons name='cash-check' size={size} color={color}/>}
                     TitleText={'Net Salary'}
                     Txt={receiptData.p_net}
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