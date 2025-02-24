import { StyleSheet, Text, View, ScrollView } from 'react-native'
import React from 'react'
import CustomHeader from '../../../components/CustomHeader'

const SalarySlip = () => {
  return (
    <ScrollView style={{flex:1}}>
        <CustomHeader title='Salary Slip'/>
    </ScrollView>
  )
}

export default SalarySlip

const styles = StyleSheet.create({})