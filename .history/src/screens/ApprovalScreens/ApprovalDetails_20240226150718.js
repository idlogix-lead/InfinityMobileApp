import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomHeader from '../../components/CustomHeader'

const ApprovalDetails = () => {
  return (
    <View style={{flex:1}}>
      <CustomHeader title={'Approval Details'}/>

      <View style={styles.TopBorderStyle}>
        <View style={}></View>

      </View>
    </View>
  )
}

export default ApprovalDetails

const styles = StyleSheet.create({
    TopBorderStyle:{
        borderWidth:1,
        borderColor:'#000',
        marginTop:10,
        height:100,
        width:'90%',
        alignSelf:'center',
    },
})