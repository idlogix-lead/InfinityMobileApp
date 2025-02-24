import { StyleSheet, Text, View } from 'react-native'
import React,{useState, useEffect} from 'react'
import axios from 'axios';
import CustomHeader from '../../../components/CustomHeader'
import AsyncStorage from '@react-native-async-storage/async-storage';

const DetailedLeave = () => {
  const [partnerId, setPartnerId] = useState(null);
  const [requestInfo, setRequestInfo] = useState([]);
  const [applyFilter, setApplyFilter] = useState();
  const [isLoading, setIsLoading] = useState(false);
  

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

  const LeaveRequestInfo = async () => {
    setIsLoading(true);
    const token = await AsyncStorage.getItem('token');
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');

    try {
      const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/HR_EmpLev_Posting?$filter=C_BPartner_ID eq ${partnerId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      // console.log(response.data.records)
      setRequestInfo(response.data.records)
    } catch (error) {
      console.error('Error :', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    FindBusinessPrtId();
  }, []);
  useEffect(() => {
    if (partnerId) {
      LeaveRequestInfo();
    }
  }, [applyFilter, partnerId]);
  return (
    <View>
      <CustomHeader title={'Leave Detail'}/>
    </View>
  )
}

export default DetailedLeave

const styles = StyleSheet.create({})