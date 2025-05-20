import {StyleSheet, Text, View, ScrollView} from 'react-native';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import SalarySlipCardView from '../../../components/EmployeePortalComponents/SalarySlipComponents/SalarySlipCardView';
import Loader from '../../../components/Loader';

const BasicInformation = () => {
  const size = 30;
  const color = '#0050C0';

  const [employeeData, setEmployeeData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const getBasicInfo = async () => {
    setIsLoading(true);
    const token = await AsyncStorage.getItem('token');
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const Id = await AsyncStorage.getItem('userId');
    console.log(Id, 'id');
    try {
      const response = await axios.get(
        `${protocol}://${host}:${port}/api/v1/models/hr_employee_v?$filter=ad_user_id eq ${Id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setEmployeeData(response.data.records[0]);
    } catch (error) {
      console.log('Error', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getBasicInfo();
  }, []);

  return (
    <ScrollView style={{flex: 1}}>
      <View style={{marginBottom: 50}}>
        <Text style={styles.TextHeading}>Personal Information</Text>

        <SalarySlipCardView
          // Icon={<MaterialIcons name='person' size={size} color={color} />}
          image={require('../../asserts/EmployeProfile/gardianName.png')}
          TitleText={'Gaurdian Name'}
          Txt={employeeData.Father_Name ? employeeData.Father_Name : 'null'}
        />
        <SalarySlipCardView
          Icon={<MaterialIcons name="transgender" size={size} color={color} />}
          TitleText={'Gender'}
          Txt={
            employeeData?.Gender?.identifier
              ? employeeData?.Gender?.identifier
              : 'null'
          }
        />
        <SalarySlipCardView
          Icon={
            <MaterialCommunityIcons
              name="calendar-account"
              size={size}
              color={color}
            />
          }
          TitleText={'Date of Birth'}
          Txt={employeeData.Date_Birth ? employeeData.Date_Birth : 'null'}
        />
        <SalarySlipCardView
          Icon={<MaterialIcons name="bloodtype" size={size} color={color} />}
          TitleText={'Blood_Group'}
          Txt={
            employeeData?.Blood_Group?.identifier
              ? employeeData?.Blood_Group?.identifier
              : 'null'
          }
        />
        <SalarySlipCardView
          Icon={<FontAwesome5 name="praying-hands" size={size} color={color} />}
          TitleText={'Religion'}
          Txt={
            employeeData?.Religion?.identifier
              ? employeeData?.Religion?.identifier
              : 'null'
          }
        />

        <Text style={styles.TextHeading}>Company Information</Text>

        <SalarySlipCardView
          Icon={<MaterialIcons name="fingerprint" size={size} color={color} />}
          TitleText={'NationalCode'}
          Txt={employeeData.NationalCode ? employeeData.NationalCode : 'null'}
        />
        <SalarySlipCardView
          Icon={
            <MaterialCommunityIcons name="calendar" size={size} color={color} />
          }
          TitleText={'Date_Cnicissue'}
          Txt={
            employeeData.Date_Cnicissue ? employeeData.Date_Cnicissue : 'null'
          }
        />
        <SalarySlipCardView
          Icon={<MaterialIcons name="event" size={size} color={color} />}
          TitleText={'Date_Cnicexpire'}
          Txt={
            employeeData.Date_Cnicexpire ? employeeData.Date_Cnicexpire : 'null'
          }
        />
        <SalarySlipCardView
          Icon={
            <MaterialCommunityIcons name="heart" size={size} color={color} />
          }
          TitleText={'MaritalStatus'}
          Txt={
            employeeData?.MaritalStatus?.identifier
              ? employeeData?.MaritalStatus?.identifier
              : 'null'
          }
        />
        <SalarySlipCardView
          Icon={<MaterialIcons name="assignment" size={size} color={color} />}
          TitleText={'LICCode'}
          Txt={employeeData.liccode ? employeeData.liccode : 'null'}
        />
        <SalarySlipCardView
          Icon={
            <MaterialCommunityIcons name="calendar" size={size} color={color} />
          }
          TitleText={'Date_LicExpire'}
          Txt={
            employeeData.date_licexpire ? employeeData.date_licexpire : 'null'
          }
        />
        <SalarySlipCardView
          Icon={<MaterialIcons name="business" size={size} color={color} />}
          TitleText={'HR_Department_ID'}
          Txt={
            employeeData?.HR_Department_ID?.identifier
              ? employeeData?.HR_Department_ID?.identifier
              : 'null'
          }
        />
        <SalarySlipCardView
          Icon={<MaterialIcons name="work" size={size} color={color} />}
          TitleText={'HR_Job_ID'}
          Txt={
            employeeData?.HR_Job_ID?.identifier
              ? employeeData?.HR_Job_ID?.identifier
              : 'null'
          }
        />
        <SalarySlipCardView
          Icon={
            <MaterialCommunityIcons name="calendar" size={size} color={color} />
          }
          TitleText={'Start Date'}
          Txt={employeeData.StartDate ? employeeData.StartDate : 'null'}
        />
        <SalarySlipCardView
          Icon={<MaterialIcons name="event" size={size} color={color} />}
          TitleText={'End Date'}
          Txt={employeeData.EndDate ? employeeData.EndDate : 'null'}
        />
      </View>
      {isLoading ? <Loader /> : null}
    </ScrollView>
  );
};

export default BasicInformation;

const styles = StyleSheet.create({
  TextHeading: {
    color: '#000',
    fontFamily: 'K2D-Bold',
    fontSize: 20,
    padding: 10,
  },
  ContainerView: {
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
    marginTop: 10,
  },
});
