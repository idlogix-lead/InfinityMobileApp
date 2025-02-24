import { StyleSheet, Text, View,TextInput } from 'react-native'
import React from 'react'

const AnnualLeaveCard = () => {
  return (
    <View style={styles.Container}>
      <Text style={styles.Txt}>Card</Text>
      <View style={styles.TxtInputCtnr}>
        <TextInput/>
      </View>
    </View>
  )
}

export default AnnualLeaveCard

const styles = StyleSheet.create({
    Container:{
        width:'85%',
        backgroundColor:'red',
        alignSelf:'center',
        marginTop:'5%'
    },
    Txt:{
        color:'#000',
        fontFamily:'K2D-Bold',
        fontSize:16
    },
    TxtInputCtnr:{
        borderWidth:1,
        borderColor:'#000',
        borderRadius:10,
        height:40,
    },
})