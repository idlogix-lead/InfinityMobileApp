import { StyleSheet, Text, View,TouchableOpacity } from 'react-native'
import React from 'react'

const PortalCards = ({text,onPress, icon}) => {
  return (
    <TouchableOpacity onPress={onPress}
    style={styles.Container}>
        <Text style={styles.TextBox}>{text}</Text>
        <View style={styles.IconBox}>
            {icon}
        </View>
    </TouchableOpacity>
  )
}

export default PortalCards

const styles = StyleSheet.create({
    Container:{
        height:70,
        width:'90%',
        backgroundColor:'#fff',
        alignSelf:'center',
        borderRadius:5,
        marginTop:20,
        borderBottomWidth:3,
        borderBottomColor:'#00b0f0',
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center'
    },
    TextBox:{
        width:'80%',
        padding:10,
        color:'#000',
        fontFamily:'K2D-BoldItalic',
        fontSize:16
    },
    IconBox:{
        width:'20%',
        justifyContent:'center',
        alignItems:'center'
    },
})