import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const TotalAttendance = () => {

        {/* for Total Attendance Api*/ }
        const getTotalAttendence = async () => {
            setIsLoading(true);
            const token = await AsyncStorage.getItem('token')
            const protocol = await AsyncStorage.getItem('protocol')
            const host = await AsyncStorage.getItem('host')
            const port = await AsyncStorage.getItem('port')
            const Id = await AsyncStorage.getItem("userId")
            try {
                const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/hr_totalattend_v`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    })
                    let sortedRecords = response.data.records.sort((a, b) => new Date(b.AttDate) - new Date(a.AttDate));
                    setTotalAttendance(sortedRecords[0] || {});
            } catch (error) {
                console.log('Error', error)
            } finally {
                setIsLoading(false);
            }
        }

        useEffect(() => {
            getTotalAttendence();
        }, [])
  return (
    <View>
      <Text>TotalAttendance</Text>
    </View>
  )
}

export default TotalAttendance

const styles = StyleSheet.create({})