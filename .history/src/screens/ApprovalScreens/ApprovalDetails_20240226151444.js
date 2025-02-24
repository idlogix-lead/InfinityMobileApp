import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomHeader from '../../components/CustomHeader'

const ApprovalDetails = () => {
  return (
    <View style={{flex:1}}>
      <CustomHeader title={'Approval Details'}/>

      <View style={styles.TopBorderStyle}>
        <View style={styles.TopLeftBorder}>
        </View>
        <View ></View>
      </View>

      <View style={styles.BottomBorder}>

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
        width:'98%',
        alignSelf:'center',
    },
    TopLeftBorder:{
        width:'49%',
        borderRightWidth:1,
        borderLeftColor:'#000',
        height:98,
    },
    BottomBorder:{
        borderTopWidth:1,
        borderLeftWidth:1,
        borderRightWidth:1,
        marginTop:10,
        width:'98%',
        height:300,
        alignSelf: 'center',
    },
})