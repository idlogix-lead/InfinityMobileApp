import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const BasicInformation = () => {
  console.log('Basic Information is rendering'); 
  return (
    <View style={{flex:1}}>
        <Text style={styles.TextHeading}>Personal Information</Text>

    </View>
  )
}

export default BasicInformation

const styles = StyleSheet.create({
  TextHeading:{
    color:'#000'
  },
})