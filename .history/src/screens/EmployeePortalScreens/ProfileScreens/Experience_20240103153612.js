import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import moment from 'moment';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import SalarySlipCardView from '../../../components/EmployeePortalComponents/SalarySlipComponents/SalarySlipCardView';
import Loader from '../../../components/Loader';

const Experience = () => {
  const [experienceData, setExperienceData] = useState([]);
  const [isLoading, setIsLoading] = useState(false)

  const getEmployeeExp = async () => {
    setIsLoading(true);
    const token = await AsyncStorage.getItem('token');
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const Id = await AsyncStorage.getItem("userId");

    try {
      const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/hr_emp_exp_v?$filter=ad_user_id eq ${Id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      // console.log(JSON.stringify(response.data),'fffff')

      if (response.data && response.data.records) {
        setExperienceData(response.data.records);
      }
    } catch (error) {
      console.error('Error fetching experience data:', error);
    }finally{
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getEmployeeExp();
  }, []);

  return (
    <ScrollView style={{ flex: 1, }}>
      <View style={{marginBottom:50}}>
      <Text style={styles.textHeading}>Experience of Employee</Text>
      {experienceData.map((item, index) => (
        <View key={index} style={styles.containerView}>

          <SalarySlipCardView
            Icon={<FontAwesome5 name='graduation-cap' color='#0050C0' size={25} />}
            TitleText={'Company Name'}
            Txt={item.Company}
          />
          <SalarySlipCardView
            Icon={<MaterialCommunityIcons name='badge-account' color='#0050C0' size={25} />}
            TitleText={'Designation'}
            Txt={item.Desigation}
          />
          <SalarySlipCardView
            Icon={<MaterialCommunityIcons name='cash-fast' color='#0050C0' size={25} />}
            TitleText={'Salary Drawn'}
            Txt={item.Salary_Drawn}
          />
          <SalarySlipCardView
            Icon={<MaterialCommunityIcons name='calendar' color='#0050C0' size={25} />}
            TitleText={'Start Date'}
            Txt={moment(item.StartDate).format('YYYY-MM-DD')}
          />

        </View>
      ))}
      </View>
      {isLoading ? <Loader /> : null}
    </ScrollView>
  );
};

export default Experience;

const styles = StyleSheet.create({
  textHeading: {
    color: '#000',
    fontFamily: 'K2D-Bold',
    fontSize: 20,
    padding: 10,
  },
  containerView: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
    marginTop: 5,
  },
});
