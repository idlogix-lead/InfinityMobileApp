import { StyleSheet, Text, View } from 'react-native'
import React,{useState, useEffect} from 'react'
import CustomHeader from '../../../components/CustomHeader'

const DetailedLeave = ({ route }) => {

  const { record } = route.params;

  return (
    <View>
      <CustomHeader title={'Leave Detail'}/>

      <View>
      <Text>{record.Description}</Text>
      </View>
    </View>
  )
}

export default DetailedLeave

const styles = StyleSheet.create({})