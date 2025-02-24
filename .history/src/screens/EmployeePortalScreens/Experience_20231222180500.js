import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import moment from 'moment';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import SalarySlipCardView from '../../components/EmployeePortalComponents/SalarySlipComponents/SalarySlipCardView';
const Experience = () => {
  const [experienceData, setExperienceData] = useState([]);

  const getEmployeeExp = async () => {
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

      if (response.data && response.data.records) {
        setExperienceData(response.data.records);
      }
    } catch (error) {
      console.error('Error fetching experience data:', error);
    }
  };

  useEffect(() => {
    getEmployeeExp();
  }, []);

  return (
    <ScrollView style={{ flex: 1 }}>
      <Text style={styles.textHeading}>Experience of Employee</Text>
      {experienceData.map((item, index) => (
        <View key={index} style={styles.containerView}>

<SalarySlipCardView
          Icon={ <FontAwesome5 name='graduation-cap' color='#0050C0' size={15} />}
          TitleText={'Company Name'}
          Txt={item.Company}
          />
<SalarySlipCardView
          Icon={ <MaterialCommunityIcons name='badge-account' color='#0050C0' size={20} />}
          TitleText={'Designation'}
          Txt={item.Desigation}
          />
<SalarySlipCardView
          Icon={ <MaterialCommunityIcons name='cash-fast' color='#0050C0' size={20} />}
          TitleText={'Salary Drawn'}
          Txt={item.Salary_Drawn}
          />
<SalarySlipCardView
          Icon={<MaterialCommunityIcons name='calendar' color='#0050C0' size={20} />}
          TitleText={'Start Date'}
          Txt={moment(item.Created).format('YYYY-MM-DD')}
          />


          {/* <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row' }}>
            <View style={styles.iconView}>
                <FontAwesome5 name='graduation-cap' color='#0050C0' size={15} />
              </View>
              <Text style={styles.textTop}>Company Name: </Text>
              <Text style={styles.textBottom}> {item.Company}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
            <View style={styles.iconView}>
                <MaterialCommunityIcons name='badge-account' color='#0050C0' size={20} />
              </View>
              <Text style={styles.textTop}>Designation: </Text>
              <Text style={styles.textBottom}>{item.Desigation}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={styles.iconView}>
                <MaterialCommunityIcons name='cash-fast' color='#0050C0' size={20} />
              </View>
              <Text style={styles.textTop}>Salary Drawn: </Text>
              <Text style={styles.textBottom}>{item.Salary_Drawn}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={styles.iconView}>
                <MaterialCommunityIcons name='calendar' color='#0050C0' size={20} />
              </View>
              <Text style={styles.textTop}>Start Date: </Text>
              <Text style={styles.textBottom}>{moment(item.Created).format('YYYY-MM-DD')}</Text>
            </View>
          </View> */}
        </View>
      ))}
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
    marginTop:5,
  },
  iconView: {
    width: '15%',
    alignItems:'center',
    padding:5,
    // alignItems: 'center',
  },
  textTop: {
    color: '#000',
    fontFamily: 'K2D-Regular',
    fontSize: 16
  },
  textBottom: {
    color: '#000',
    fontFamily: 'K2D-Bold',
    fontSize: 16,
    width: '60%',
  },
});
