import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Experience = () => {
  return (
    <View>
      <Text style={{color:'#000'}}>Experience</Text>
    </View>
  )
}

export default Experience

const styles = StyleSheet.create({
  TextHeading:{
    color:'#000',
    fontFamily:'K2D-Bold',
    fontSize:20,
    marginTop:5,
  },
  ContainerView:{
    flexDirection:'row',
    padding:10,
    width:'90%',
    alignSelf:'center',
    // marginTop:5,
  },
  IconView:{
    width:'20%',
    justifyContent:'center',
    alignItems:'center',
  },
  TextTop:{
    color:'#000',
    fontFamily:'K2D-Regular',
    fontSize:16
  },
  TextBottom:{
    color:'#000',
    fontFamily:'K2D-Bold',
    fontSize:16
  },
})