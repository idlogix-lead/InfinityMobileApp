import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomHeader from '../../components/CustomHeader'

const BasicInformation = () => {
  return (
    <View style={{flex:1,}}>
        <Text style={styles.TextHeading}>Personal Information</Text>

    </View>
  )
}

export default BasicInformation

const styles = StyleSheet.create({
  TextHeading:{
    
  },
})