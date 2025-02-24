import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Education = () => {
  const [educationData, setEducationData] = useState(null);

  const getEductionData = async () => {
    const token = await AsyncStorage.getItem('token')
    const protocol = await AsyncStorage.getItem('protocol')
    const host = await AsyncStorage.getItem('host')
    const port = await AsyncStorage.getItem('port')
    const Id = await AsyncStorage.getItem("userId")
    console.log(Id, 'id')
    try {
      const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/hr_education_v?$filter=c_bpartner_id eq ${Id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
      // console.log('Full response ',response.data)
      //   const filteredData = response.data.records.filter(record => record.AD_User_ID === userId);
      // console.log(filteredData, 'cc');
    } catch (error) {
      console.log('Error', error)
    }
  }

  useEffect(() => {
    getEductionData();
  }, [])

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