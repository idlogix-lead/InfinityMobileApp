import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import SalarySlipCardView from '../../../components/EmployeePortalComponents/SalarySlipComponents/SalarySlipCardView';
import Loader from '../../../components/Loader';

const Education = () => {
  const [educationData, setEducationData] = useState([]);
  const [isLoading, setIsLoading] = useState(false)

  const getEducationData = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');
      const protocol = await AsyncStorage.getItem('protocol');
      const host = await AsyncStorage.getItem('host');
      const port = await AsyncStorage.getItem('port');
      const Id = await AsyncStorage.getItem("userId");

      const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/hr_education_v?$filter=ad_user_id eq ${Id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      console.log(JSON.stringify(response.data),'tt')

      if (response.data && response.data.records) {
        setEducationData(response.data.records);
        // console.log(educationData, 'ddd');
      }
    } catch (error) {
      console.error('Error fetching education data:', error);
    }finally{
      setIsLoading(false);
    }
  };


  useEffect(() => {
    getEducationData();
  }, []);

  const getIconForRecord = (index) => {
    const icons = [
      'school',
      'graduation-cap',
      'book',
    ];

    const selectedIcon = icons[index % icons.length];
    return selectedIcon;
  };


  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{marginBottom:50}}>
      <Text style={styles.textHeading}>Educational Information</Text>
      {educationData.map((item, index) => (
        <View key={index} style={styles.containerView}>

          <SalarySlipCardView
            Icon={<FontAwesome5 name='graduation-cap' color='#0050C0' size={22} />}
            TitleText={'Degree Title'}
            Txt={item.Degree_Title}
          />
          <SalarySlipCardView
            Icon={<FontAwesome5 name='school' color='#0050C0' size={22} />}
            TitleText={'Institute Name'}
            Txt={item.Institute_Name}
          />
          {/* <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row' }}>
              <View style={styles.iconView}>
                <FontAwesome5 name='graduation-cap' color='#0050C0' size={15} />
              </View>
              <Text style={styles.textTop}>Degree Title: </Text>
              <Text style={styles.textBottom}> {item.Degree_Title}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
            <View style={styles.iconView}>
                <FontAwesome5 name='school' color='#0050C0' size={15} />
              </View>
              <Text style={styles.textTop}>Institute Name: </Text>
              <Text style={styles.textBottom}>{item.Institute_Name}</Text>
            </View>
          </View> */}
        </View>
      ))}
      </View>
      {isLoading ? <Loader /> : null}
    </ScrollView>
  );
};

export default Education;

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
  },
  // iconView: {
  //   width: '15%',
  //   alignItems: 'center',
  //   padding: 5
  //   // justifyContent: 'center',
  //   // alignItems: 'center',
  // },
  // textTop: {
  //   color: '#000',
  //   fontFamily: 'K2D-Regular',
  //   fontSize: 16,
  // },
  // textBottom: {
  //   color: '#000',
  //   fontFamily: 'K2D-Bold',
  //   fontSize: 16,
  //   width: '60%',
  // },
});
