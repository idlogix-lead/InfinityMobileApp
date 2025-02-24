import { StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const UpperCard = () => {

  const [partnerId, setPartnerId] = useState(null);
  const [leaveData, setLeaveData] = useState([]);
  const [latestYear, setLatestYear] = useState('');

  const FindBusinessPrtId = async () => {
    const token = await AsyncStorage.getItem('token');
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const Id = await AsyncStorage.getItem("userId");

    try {
      const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/AD_User?$filter=AD_User_ID eq ${Id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      setPartnerId(response?.data?.records[0]?.C_BPartner_ID?.id)

    } catch (error) {
      console.error('Error :', error);
    }
  };


  const LeaveResponseApi = async () => {
    const token = await AsyncStorage.getItem('token');
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const Id = await AsyncStorage.getItem("userId");

    try {
      const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/HR_EmpLev_Bal?$filter=C_BPartner_ID eq ${partnerId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const latestYear = response.data.records.reduce((maxYear, record) => {
          return Math.max(maxYear, new Date(record.Created).getFullYear());
        }, 0);
    
        // Filter records for the latest year
        const latestYearRecords = response.data.records.filter(record => {
          return new Date(record.Created).getFullYear() === latestYear;
        });
    
        // Map to get the required data
        const leaveData = latestYearRecords.map(record => {
          return {
            type: record.HR_LevTypes_ID.identifier,
            availed: record.Availed,
            openBal: record.Open_Bal
          };
        });
    
        setLatestYear(latestYear.toString());
        setLeaveData(leaveData);
    

    } catch (error) {
      console.error('Error :', error);
    }
  };

  useEffect(() => {
    FindBusinessPrtId();
  }, []);

  useEffect(() => {
    LeaveResponseApi();
  }, [partnerId]);


  const getBackgroundColor = (type) => {
    switch (type) {
      case 'Annual Leaves':
        return '#D4EEF8';
      case 'Medical Leaves':
        return '#A9FFCB';
      case 'Casual Leaves':
        return '#D3C3FF';
      default:
        return '#fff';
    }
  };

  return (
    <View style={styles.MainContainer}>
    {leaveData.map((data, index) => (
      <View key={index} style={[styles.CardView, { backgroundColor: getBackgroundColor(data.type) }]}>
        <Text style={[styles.Txt, {fontSize:20}]}>{data.availed}/{data.openBal}</Text>
        <Text style={styles.Txt}>{data.type}</Text>
      </View>
    ))}
  </View>
  )
}

export default UpperCard

const styles = StyleSheet.create({
  MainContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    // backgroundColor:'purple',
    marginTop: '4%',
    width: '95%',
    alignSelf: 'center',
  },
  CardView: {
    height: 90,
    width: 100,
    backgroundColor: '#fff',
    borderRadius: 10,
    zIndex: 1,
    justifyContent:'center'
  },
  Txt: {
    color: '#000',
    fontFamily: 'K2D-Regular',
    alignSelf: 'center',
  },
})