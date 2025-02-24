import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import React from 'react'

const PendingDetailHeader = ({onPressBack}) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => onPressBack()}>
                <Image source={require('../../asserts/PendingDetailsAssets/backArrow.png')} style={styles.imageBack} />
            </TouchableOpacity>
            <View style={{width:'75%',height:'50%',alignItems:'center',justifyContent:'center'}}>
                <Text style={styles.headerTxt}>Pending Details</Text>
            </View>
        </View>
    )
}

export default PendingDetailHeader

const styles = StyleSheet.create({
    container: {
        height: 80,
        alignItems: 'center',
        flexDirection: 'row'
    },
    imageBack: {
        height: 40,
        width: 60
    },
    headerTxt:{
        color:"#800000",
        fontSize:20,
        fontWeight:'700',
        fontFamily:"K2D-Regular"
    }
})