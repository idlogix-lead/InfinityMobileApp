import { StyleSheet, Text, View,TextInput } from 'react-native'
import React from 'react'

const AnnualLeaveCard = () => {
  return (
    <View style={styles.Container}>
      <Text style={styles.Txt}>Card</Text>
    </View>
  )
}

export default AnnualLeaveCard

const styles = StyleSheet.create({
    Container:{
        width:'90%',
    },
    Txt:{
        color:'#000',
        fontFamily:'K2D-Bold',
        fontSize:16
    },
})