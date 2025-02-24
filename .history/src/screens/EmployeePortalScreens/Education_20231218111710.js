import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Education = () => {
  const [educationData, setEducationData] = useState(null);

  const getEducationData = async () => {
    const token = await AsyncStorage.getItem('token');
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const userId = await AsyncStorage.getItem('userId'); // Changed variable name to userId for consistency

    try {
      const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/hr_education_v`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      // Filter the response data for the specific user
      const userEducationData = response.data.filter(item => item.userId === userId);
      setEducationData(userEducationData);
      console.log(userEducationData, 'bbb');

    } catch (error) {
      console.log('Error', error);
    }
  };

  useEffect(() => {
    getEducationData();
  }, []);

  return (
    <View style={{ flex: 1 }}>

      <Text style={styles.TextHeading}>Educational Information</Text>

      <View style={styles.ContainerView}>
        <View style={styles.IconView}>

        </View>
        <View>
          <Text style={styles.TextTop}>Degree Title</Text>
          <Text style={styles.TextBottom}></Text>
        </View>
      </View>
      <View style={styles.ContainerView}>
        <View style={styles.IconView}>

        </View>
        <View>
          <Text style={styles.TextTop}>Institute Name</Text>
          <Text style={styles.TextBottom}></Text>
        </View>
      </View>
      <View style={styles.ContainerView}>
        <View style={styles.IconView}>

        </View>
        <View>
          <Text style={styles.TextTop}>Pass Year</Text>
          <Text style={styles.TextBottom}></Text>
        </View>
      </View>
    </View>
  )
}

export default Education

const styles = StyleSheet.create({
  TextHeading: {
    color: '#000',
    fontFamily: 'K2D-Bold',
    fontSize: 20,
    padding: 10,
  },
  ContainerView: {
    flexDirection: 'row',
    padding: 10,
    width: '90%',
    alignSelf: 'center',
    // marginTop:5,
  },
  IconView: {
    width: '20%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  TextTop: {
    color: '#000',
    fontFamily: 'K2D-Regular',
    fontSize: 16
  },
  TextBottom: {
    color: '#000',
    fontFamily: 'K2D-Bold',
    fontSize: 16
  },
})