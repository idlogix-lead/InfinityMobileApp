import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const ApprovalCard = () => {
  return (
    <View style={styles.CardView}>
        <Text style={styles.ItemName}>Item Name</Text>
    </View>
  )
}

export default ApprovalCard

const styles = StyleSheet.create({
    CardView:{
        backgroundColor:'red',
        padding:10,
        borderBottomWidth:1,
        color:'gray'
    },
    ItemName:{
        color:'#000',
        fontFamily:'K2D-Regular',
        fontSize:18
    },
})