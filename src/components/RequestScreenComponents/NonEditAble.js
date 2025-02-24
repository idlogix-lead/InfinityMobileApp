import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const NonEditAble = ({ txt, value,width,marginLeft }) => {
  return (
    <View style={{width:width,marginLeft:marginLeft}}>
            <Text style={styles.txt}>{txt}</Text>
            <View style={styles.inputCon}>
                <Text style={styles.insideTxt}>{value}</Text>
            </View>
        </View>
  )
}

export default NonEditAble

const styles = StyleSheet.create({
    inputCon: {
        borderColor: '#00B0F0',
        borderWidth: 1,
        marginTop: 5,
        borderRadius: 10,
        height:40,
        justifyContent:'center'
    },
    txt: {
        fontSize: 14,
        fontFamily: 'K2D-Regular',
        color: '#0070C0'
    },
    insideTxt:{
        fontSize:16,
        color:'black',
        fontFamily:'K2D-Regular',
        marginLeft:5
    }
})