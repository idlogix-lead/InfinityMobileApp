import { StyleSheet, Text, View } from 'react-native'
import React,{useEffect,useState} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'react-native-axios'

const Experience = () => {

  const getEmployeExp = async () => {
    const token = await AsyncStorage.getItem('token')
        const protocol = await AsyncStorage.getItem('protocol')
        const host = await AsyncStorage.getItem('host')
        const port = await AsyncStorage.getItem('port')
    try {
      const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/hr_emp_exp_v`,
      {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    console.log(response.data,'eee');
    } catch (error) {
      console.log('Error', error)
    }
  }

  useEffect(()=>{
    getEmployeExp();
  },[])


  return (
    <View style={{ flex: 1 }}>

      <Text style={styles.TextHeading}>Experience of Employee</Text>

      <View style={styles.ContainerView}>
        <View style={styles.IconView}>

        </View>
        <View>
          <Text style={styles.TextTop}>Company Name</Text>
          <Text style={styles.TextBottom}></Text>
        </View>
      </View>
      <View style={styles.ContainerView}>
        <View style={styles.IconView}>

        </View>
        <View>
          <Text style={styles.TextTop}>Designation</Text>
          <Text style={styles.TextBottom}></Text>
        </View>
      </View>
      <View style={styles.ContainerView}>
        <View style={styles.IconView}>

        </View>
        <View>
          <Text style={styles.TextTop}>Experience</Text>
          <Text style={styles.TextBottom}></Text>
        </View>
      </View>
      <View style={styles.ContainerView}>
        <View style={styles.IconView}>

        </View>
        <View>
          <Text style={styles.TextTop}>Start Date</Text>
          <Text style={styles.TextBottom}></Text>
        </View>
      </View>
      <View style={styles.ContainerView}>
        <View style={styles.IconView}>

        </View>
        <View>
          <Text style={styles.TextTop}>End Date</Text>
          <Text style={styles.TextBottom}></Text>
        </View>
      </View>
      <View style={styles.ContainerView}>
        <View style={styles.IconView}>

        </View>
        <View>
          <Text style={styles.TextTop}>Salary Drawn</Text>
          <Text style={styles.TextBottom}></Text>
        </View>
      </View>

    </View>
  )
}

export default Experience

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