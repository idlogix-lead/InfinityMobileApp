import { Image, StyleSheet, Text, View, Dimensions } from 'react-native'
import React from 'react'

const { height, width } = Dimensions.get('window');
const CardCompanyInformation = ({ Icon, secondtext, topText, }) => {
    return (
        <View style={{ flexDirection: 'row',alignItems:'center',width:'95%',marginTop:25,alignSelf:'center' }} >
           {Icon && <View style={styles.images}>{Icon}</View>}
            <View style={{marginLeft:10}}>
                <Text style={styles.topText}>{topText}</Text>
                <Text style={styles.topText}>{secondtext}</Text>
            </View>
        </View>
    )
}

export default CardCompanyInformation

const styles = StyleSheet.create({
    topText: {
        color: 'black',
        fontSize: 16,
        fontFamily: 'K2D-Regular'
    },
    images: {
        height: height / 16,
        width: width / 8,
        alignItems:'center',
        justifyContent:'center',
    }
})