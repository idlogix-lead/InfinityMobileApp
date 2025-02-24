import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'

const ModalStatus = ({ width, marginLeft, txt, status,widthStatus,source,onPress,marginTop }) => {
    return (
        <View style={{ width: width, marginLeft: marginLeft, marginTop: marginTop}}>
            <Text style={styles.txt}>{txt}</Text>
            <TouchableOpacity style={styles.inputCon} onPress={onPress}>
                <View style={{width:widthStatus}}>
                    <Text style={styles.status}>{status}</Text>
                </View>
                <Image source={source} style={styles.image} />
            </TouchableOpacity>
        </View>
    )
}

export default ModalStatus

const styles = StyleSheet.create({
    txt: {
        fontSize: 14,
        fontFamily: 'K2D-Regular',
        color: '#0070C0'
    },
    inputCon: {
        borderColor: '#00B0F0',
        borderWidth: 1,
        marginTop: 5,
        borderRadius: 10,
        flexDirection: 'row',
        height:40,
        // padding:5,
    },
    status: {
        fontSize: 16,
        color: 'black',
        paddingTop: 10,
        paddingBottom: 10,
        marginLeft: 3
    },
    image: {
        height: 30,
        width: 15,
        marginTop: 5
    }
})