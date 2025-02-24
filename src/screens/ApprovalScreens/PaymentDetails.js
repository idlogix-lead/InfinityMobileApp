import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const PaymentDetails = ({ code, name }) => {
    return (
        <View style={{ alignItems: 'center', marginTop: 20 }}>
            <View style={styles.container}>
                <View>
                    <Text style={styles.txtCode}>{code}</Text>
                </View>
                <View style={{width:'60%',alignItems:'flex-end'}}>
                    <Text style={{...styles.txtCode,color:"black",fontSize:13}}>{name}</Text>
                </View>
            </View>
        </View>
    )
}

export default PaymentDetails

const styles = StyleSheet.create({
    container: {
        width: '80%',
        height: 35,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    txtCode:{
        fontSize:16,
        color:"#800000",
        fontFamily:'K2D-Medium'
    }
})