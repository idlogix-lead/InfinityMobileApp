import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomHeader from '../../components/CustomHeader'

const ApprovalDetails = () => {
  return (
    <View style={{flex:1}}>
      <CustomHeader title={'Approval Details'}/>

      <View style={styles.BorderStyle}>

      </View>
    </View>
  )
}

export default ApprovalDetails

const styles = StyleSheet.create({
    BorderStyle:{
        borderWidth:1,
    },
})