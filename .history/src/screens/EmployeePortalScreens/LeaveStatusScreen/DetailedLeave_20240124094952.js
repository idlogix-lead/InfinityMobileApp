import { StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import CustomHeader from '../../../components/CustomHeader'

const DetailedLeave = ({ route }) => {

  const { record } = route.params;

  // console.log(record, 'ff')

  return (
    <View>
      <CustomHeader title={'Leave Detail'} />

      <View>
        <Text style={{ color: '#000' }}>{record.Description}</Text>
        <Text style={{ color: '#000' }}>{record?.AD_Client_ID?.identifier}</Text>
        <Text style={{ color: '#000' }}>{record?.C_BPartner_ID?.identifier}</Text>
      </View>
    </View>
  )
}

export default DetailedLeave

const styles = StyleSheet.create({})