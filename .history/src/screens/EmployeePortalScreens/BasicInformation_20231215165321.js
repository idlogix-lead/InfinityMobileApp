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
            <Text style={styles.TextTop}>Gaurdian Name</Text>
            <Text style={styles.TextBottom}>Gaurdian Name</Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>

          </View>
          <View>
            <Text style={styles.TextTop}>Gaurdian Name</Text>
            <Text style={styles.TextBottom}>Gaurdian Name</Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>

          </View>
          <View>
            <Text style={styles.TextTop}>Gaurdian Name</Text>
            <Text style={styles.TextBottom}>Gaurdian Name</Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>

          </View>
          <View>
            <Text style={styles.TextTop}>Gaurdian Name</Text>
            <Text style={styles.TextBottom}>Gaurdian Name</Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>

          </View>
          <View>
            <Text style={styles.TextTop}>Gaurdian Name</Text>
            <Text style={styles.TextBottom}>Gaurdian Name</Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>

          </View>
          <View>
            <Text style={styles.TextTop}>Gaurdian Name</Text>
            <Text style={styles.TextBottom}>Gaurdian Name</Text>
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
    width:'90%',
    alignSelf:'center',
    marginTop:5,
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
  },
})