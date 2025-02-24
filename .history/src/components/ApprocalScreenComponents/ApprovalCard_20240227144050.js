import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const ApprovalCard = () => {
  return (
    <View style={styles.CardView}>
        <Text>Item Name</Text>
    </View>
  )
}

export default ApprovalCard

const styles = StyleSheet.create({
    CardView:{
        backgroundColor:'red',
    },
})