import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '../../../components/Loader';
import { Picker } from '@react-native-picker/picker';
import CustomHeader from '../../../components/CustomHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SalarySlipCardView from '../../../components/EmployeePortalComponents/SalarySlipComponents/SalarySlipCardView';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const SalarySlip = () => {
  const [receiptData, setReceiptData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [pickerResponse, setPickerResponse] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedPeriodData, setSelectedPeriodData] = useState({});

  const size = 26;
  const color = '#0050c0';

  const SalarySlipData = async () => {
    setIsLoading(true);
    const token = await AsyncStorage.getItem('token');
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const Id = await AsyncStorage.getItem('userId');
  
    try {
      const response = await axios.get(
        `${protocol}://${host}:${port}/api/v1/models/hr_payroll_movement_v?$filter=ad_user_id eq ${Id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const latestDate = response.data.records.reduce((max, record) => {
        const recordDate = new Date(record.StartDate);
        return recordDate > max ? recordDate : max;
      }, new Date(0));
  
      // Calculate the start of the month for the latest date
      const latestMonthStart = new Date(latestDate.getFullYear(), latestDate.getMonth(), 1);
  
      // Calculate the start of the month that is 11 months before the latest month (to include 12 months total)
      const twelveMonthsAgoStart = new Date(latestMonthStart.getFullYear(), latestMonthStart.getMonth() - 11, 1);
  
      // Filter the records to only include those within the 12-month period
      const recentRecords = response.data.records.filter(record => {
        const recordDate = new Date(record.StartDate);
        return recordDate >= twelveMonthsAgoStart && recordDate <= latestDate;
      });
  
      // Sort the records
      const sortedResponse = recentRecords.sort((a, b) => {
        const startDateA = new Date(a.StartDate);
        const startDateB = new Date(b.StartDate);
        return startDateB - startDateA;
      });
  
      setPickerResponse(sortedResponse);
  
      if (sortedResponse.length > 0) {
        const latestMonth = sortedResponse[0]?.HR_Period_ID.identifier || '';
        setSelectedPeriod(latestMonth);
        setSelectedPeriodData(sortedResponse[0] || {});
      }
  
    } catch (error) {
      console.log('Error', error);
    } 
    finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    SalarySlipData();
  }, []);
  

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader title="Salary Slip" />
      <View style={styles.PickerContainer}>
        <Picker
          style={styles.PickerStyle}
          dropdownIconColor={'#000'}
          selectedValue={selectedPeriod}
          onValueChange={(itemValue, itemIndex) => {
            setSelectedPeriod(itemValue);
            const selectedData = pickerResponse.find(
              (item) => item.HR_Period_ID.identifier === itemValue
            );
            setSelectedPeriodData(selectedData || {});
          }}
        >
          {pickerResponse.map((item) => (
            <Picker.Item
              key={item.HR_Period_ID.identifier}
              label={item.HR_Period_ID.identifier}
              value={item.HR_Period_ID.identifier}
            />
          ))}
        </Picker>
      </View>
      <View>
        <Text style={styles.textHeading}>HR Payroll movement</Text>
        <View>
          <SalarySlipCardView
            Icon={<MaterialCommunityIcons name="account-cash" size={size} color={color} />}
            TitleText={'Gross Salary'}
            Txt={selectedPeriodData.p_gross}
          />
          <SalarySlipCardView
            Icon={<MaterialCommunityIcons name="cash-minus" size={size} color={color} />}
            TitleText={'Deduction'}
            Txt={selectedPeriodData.total_deductions}
          />
          <SalarySlipCardView
            Icon={<MaterialCommunityIcons name="cash-plus" size={size} color={color} />}
            TitleText={'Allowance'}
            Txt={selectedPeriodData.total_additions}
          />
          <SalarySlipCardView
            Icon={<MaterialCommunityIcons name="form-select" size={size} color={color} />}
            TitleText={'Tax'}
            Txt={selectedPeriodData.tax}
          />
          <SalarySlipCardView
            Icon={<MaterialCommunityIcons name="currency-inr" size={size} color={color} />}
            TitleText={'Net Salary'}
            Txt={selectedPeriodData.p_net}
          />
        </View>
      </View>
      {isLoading ? <Loader /> : null}
    </View>
  );
};

export default SalarySlip;

const styles = StyleSheet.create({
  textHeading: {
    color: '#000',
    fontFamily: 'K2D-Bold',
    fontSize: 20,
    padding: 10,
  },
  PickerContainer: {
    borderWidth: 1,
    width: '90%',
    alignSelf: 'center',
    marginTop: '3%',
    borderRadius: 7,
  },
  PickerStyle: {
    color: '#000',
  },
});
