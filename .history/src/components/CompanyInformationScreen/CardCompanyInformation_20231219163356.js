import { Image, StyleSheet, Text, View, Dimensions } from 'react-native'
import React from 'react'

const { height, width } = Dimensions.get('window');
const CardCompanyInformation = ({ source, secondtext, topText, }) => {
    return (
        <View style={{ flexDirection: 'row',alignItems:'center',width:'85%',marginTop:25 }} >
            <View>
                <Image source={source} style={styles.images} />
            </View>
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
        fontSize: 20,
        fontFamily: 'K2D-Regular'
    },
    images: {
        height: height / 16,
        width: width / 8
    }
})