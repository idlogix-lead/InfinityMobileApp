import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const BasicInformation = () => {
  
  return (
    <View style={{flex:1}}>

      <View style={{height:200,backgroundColor:'red'}}>
        
      </View>
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