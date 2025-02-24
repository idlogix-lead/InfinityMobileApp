import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios';
import Loader from '../../../components/Loader';
import { Picker } from '@react-native-picker/picker';
import CustomHeader from '../../../components/CustomHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import SalarySlipCardView from '../../../components/EmployeePortalComponents/SalarySlipComponents/SalarySlipCardView'

const SalarySlip = () => {

  const size = 26;
  const color = '#0050c0';
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const [receiptData, setReceiptData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const togglePickerVisibility = () => {
    setIsPickerVisible(!isPickerVisible);
  };

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
      // console.log(records,'vvv')
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
      <CustomHeader title='Salary Slip' RightIcon="filter-variant" RightPress={togglePickerVisibility} />






      <View>
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.textHeading}>HR Payroll movement</Text>
          <Picker
            selectedValue={selectedMonth}
            onValueChange={(itemValue, itemIndex) => setSelectedMonth(itemValue)}
            style={{ width: '40%', color: '#000' }}
          >
            {months.map((month, index) => (
              <Picker.Item key={index} label={month} value={month} />
            ))}
          </Picker>
        </View>
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
  filterContainer: {
    padding: 16,
    // backgroundColor:'green'
  },
  filterTitle: {
    fontSize: 30,
    marginBottom: 5,
    alignSelf: 'center',
    color: '#000',
    fontFamily: 'K2D-Bold',
  },
  filterCalenderText: {
    fontSize: 16,
    marginBottom: 16,
    marginLeft: 20,
    color: '#000',
    fontFamily: 'K2D-Bold',
  },
  button: {
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
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
})