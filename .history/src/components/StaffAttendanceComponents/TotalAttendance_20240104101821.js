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
      <View style={styles.TopView}>
                    <View style={[styles.TopBox, { width: '28%', }]}>
                        <View style={[styles.StatusView, { borderColor: '#00B0F0', backgroundColor: '#d0edf7' }]}>
                            <Text style={styles.StatusTxt}>{TotalAttendance.total_employees}</Text>
                        </View>
                        <Text style={styles.StatusTxt}>Total Employees</Text>
                    </View>
                    <View style={styles.TopBox}>
                        <View style={[styles.StatusView, { borderColor: '#FFFF00', backgroundColor: '#f2f2c7' }]}>
                            <Text style={styles.StatusTxt}>{TotalAttendance.presents}</Text>
                        </View>
                        <Text style={styles.StatusTxt}>Present</Text>
                    </View>
                    <View style={styles.TopBox}>
                        <View style={[styles.StatusView, { borderColor: '#FFC0CB', backgroundColor: '#f5dfe3' }]}>
                            <Text style={styles.StatusTxt}>{TotalAttendance.absents}</Text>
                        </View>
                        <Text style={styles.StatusTxt}>Absent</Text>
                    </View>
                    <View style={styles.TopBox}>
                        <View style={[styles.StatusView, { borderColor: '#5DFB5D', backgroundColor: '#d5f2d5' }]}>
                            <Text style={styles.StatusTxt}>{TotalAttendance.leaves}</Text>
                        </View>
                        <Text style={styles.StatusTxt}>Leave</Text>
                    </View>
                </View>
    </View>
  )
}

export default TotalAttendance

const styles = StyleSheet.create({})