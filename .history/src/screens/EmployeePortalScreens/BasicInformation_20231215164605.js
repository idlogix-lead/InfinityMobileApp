import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const BasicInformation = () => {
  
  return (
    <View style={{flex:1}}>
        <Text style={styles.TextHeading}>Personal Information</Text>

        <View style={styles.ContainerView}>
          <View style={styles.IconView}>

          </View>
          <View>
            <Text>Gaurdian Name</Text>
            <Text>Gaurdian Name</Text>
          </View>
        </View>

    </View>
  )
}

export default BasicInformation

const styles = StyleSheet.create({
  TextHeading:{
    color:'#000',
    fontFamily:'K2D-Bold',
    fontSize:20
  },
  ContainerView:{
    flexDirection:'row',
    padding:10,
    backgroundColor:'red',
    width:'90%',
    alignSelf:'center',
  },
  IconView:{
    width:'10%'
  },
})