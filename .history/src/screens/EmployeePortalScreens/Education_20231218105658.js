import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'react-native-axios';

const Education = () => {
  const [educationData, setEducationData] = useState([]);

  const getEductionData = async () => {
    const token = await AsyncStorage.getItem('token');
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const userId = await AsyncStorage.getItem("userId"); // Fetch the user ID from AsyncStorage

    try {
      const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/hr_education_v`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      // Filter the response data to get records for the specific user
      const filteredData = response.data.records.filter(record => record.AD_User_ID && record.AD_User_ID.id.toString() === userId);

      console.log(filteredData , 'records')
      setEducationData(filteredData); // Update the state with filtered data
    } catch (error) {
      console.log('Error', error);
    }
  };

  useEffect(() => {
    getEductionData();
  }, []);

  return (
    <View style={{ flex: 1 }}>
  <Text style={styles.TextHeading}>Educational Information</Text>
  
  {educationData.map((item, index) => (
    <React.Fragment key={index}>
      <View style={styles.ContainerView}>
        <View style={styles.IconView}>
          {/* Icon can be placed here */}
        </View>
        <View>
          <Text style={styles.TextTop}>Degree Title</Text>
          <Text style={styles.TextBottom}>{item.Degree_Title}</Text>
        </View>
      </View>
      <View style={styles.ContainerView}>
        <View style={styles.IconView}>
          {/* Icon can be placed here */}
        </View>
        <View>
          <Text style={styles.TextTop}>Institute Name</Text>
          <Text style={styles.TextBottom}>{item.Institute_Name}</Text>
        </View>
      </View>
      <View style={styles.ContainerView}>
        <View style={styles.IconView}>
          {/* Icon can be placed here */}
        </View>
        <View>
          <Text style={styles.TextTop}>Pass Year</Text>
          <Text style={styles.TextBottom}>{item.Pass_Year}</Text>
        </View>
      </View>
    </React.Fragment>
  ))}
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