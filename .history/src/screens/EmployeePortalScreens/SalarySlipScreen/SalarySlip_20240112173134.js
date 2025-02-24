import { StyleSheet, Text, View, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import Loader from '../../../components/Loader';
import { Picker } from '@react-native-picker/picker';
import CustomHeader from '../../../components/CustomHeader'
import AsyncStorage from '@react-native-async-storage/async-storage';
import SalarySlipCardView from '../../../components/EmployeePortalComponents/SalarySlipComponents/SalarySlipCardView'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

const SalarySlip = () => {
  const [receiptData, setReceiptData] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState();

  const size = 26;
  const color = '#0050c0';

  const SalarySlipData = async () => {
    setIsLoading(true);
    const token = await AsyncStorage.getItem('token');
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const Id = await AsyncStorage.getItem("userId");

    try {
      const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/hr_payroll_movement_v?$filter=ad_user_id eq ${Id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      let records = response.data.records;
      records.sort((a, b) => {
        let endDateA = new Date(a.EndDate);
        let endDateB = new Date(b.EndDate);
        return endDateB - endDateA;
      });

      setReceiptData(records[0] || {});
    } catch (error) {
      console.log('Error', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    SalarySlipData();
  }, [])


  return (
    <View style={{ flex: 1 }}>
      <CustomHeader title='Salary Slip'  />
      <View>
      <Picker style={styles.PickerContainer}
            
          >
            <Picker.Item label="Java" value="java" />
            <Picker.Item label="JavaScript" value="js" />
          </Picker>
      </View>
      <View>
        <Text style={styles.textHeading}>HR Payroll movement</Text>
        <View>
          <SalarySlipCardView
            Icon={<MaterialCommunityIcons name='account-cash' size={size} color={color} />}
            TitleText={'Gross Salary'}
            Txt={receiptData.p_gross}
          />
          <SalarySlipCardView
            Icon={<MaterialCommunityIcons name='cash-minus' size={size} color={color} />}
            TitleText={'Deduction'}
            Txt={receiptData.total_deductions}
          />
          <SalarySlipCardView
            Icon={<MaterialCommunityIcons name='cash-plus' size={size} color={color} />}
            TitleText={'Allowance'}
            Txt={receiptData.total_additions}
          />
          <SalarySlipCardView
            Icon={<MaterialCommunityIcons name='form-select' size={size} color={color} />}
            TitleText={'Tax'}
            Txt={receiptData.tax}
          />
          <SalarySlipCardView
            Icon={<MaterialCommunityIcons name='currency-inr' size={size} color={color} />}
            TitleText={'Net Salary'}
            Txt={receiptData.p_net}
          />
        </View>
      </View>
      {isLoading ? <Loader /> : null}
    </View>
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
  PickerContainer:{
    borderWidth:2,
    borderColor:'#ccc',
  },
})