import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

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
          <View style={styles.iconView}>
            {/* Icons or images can be added here */}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.textTop}>Company Name: {item.Company}</Text>
            <Text style={styles.textBottom}>Designation: {item.Desigation}</Text>
            {/* Additional information like Start Date, End Date, and Salary Drawn can be added here */}
          </View>
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
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  iconView: {
    width: '20%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textTop: {
    color: '#000',
    fontFamily: 'K2D-Regular',
    fontSize: 16
  },
  textBottom: {
    color: '#000',
    fontFamily: 'K2D-Bold',
    fontSize: 16
  },
});
