import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const SalarySlipCardView = ({Icon,TitleText,Txt}) => {
  return (
    <View style={styles.ContainerView}>
    <View style={styles.IconView}>
        {Icon}
    </View>
    <View>
      <Text style={styles.TextTop}>{TitleText}</Text>
      <Text style={styles.TextBottom}>{Txt}</Text>
    </View>
  </View>
  )
}

export default SalarySlipCardView

const styles = StyleSheet.create({
    ContainerView:{
        flexDirection:'row',
        // padding:10,
        width:'90%',
        alignSelf:'center',
        marginTop:10,
      },
      IconView:{
        width:'15%',
        justifyContent:'center',
        // alignItems:'center',
      },
      TextTop:{
        color:'#000',
        fontFamily:'K2D-Regular',
        fontSize:16,
      },
      TextBottom:{
        color:'#000',
        fontFamily:'K2D-Bold',
        fontSize:16,
        width:300,
        backgroundColor:'red'
      },
})