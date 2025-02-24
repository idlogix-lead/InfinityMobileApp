import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Image } from 'react-native'
import React from 'react'
const { height, width } = Dimensions.get('window');

const TopHeader = ({ txt, onPress, source, onPressChat }) => {
    return (
        <View style={styles.headerCont}>
            <TouchableOpacity onPress={onPress}>
                <Image source={require('../../asserts/RequestAsserts/leftArrow.png')} style={styles.backArrow} />
            </TouchableOpacity>
            <Text style={styles.user}>{txt}</Text>
            <TouchableOpacity style={{ width: width / 2.8, alignItems: 'flex-end' }} onPress={onPressChat}>
                <Image source={source} style={styles.chat} />
            </TouchableOpacity>
        </View>

    )
}

export default TopHeader

const styles = StyleSheet.create({
    headerCont: {
        width: width,
        backgroundColor: '#800000',
        height: '12%',
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 15
    },
    backArrow: {
        height: height / 15,
        width: width / 7.5,
        marginLeft: 20,
    },
    user: {
        color: 'white',
        fontSize: 24,
        fontFamily: 'K2D-Regular',
        bottom: 12,
        marginLeft: 15,
    },
    chat: {
        height: height / 20,
        width: width / 10,
        marginBottom: 15
    }
})