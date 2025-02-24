import { StyleSheet, Text, View, Dimensions, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';
const { height, width } = Dimensions.get('window');

const HomeNotifyCard = ({ iconName, txt, num, clickHandler,iconColor, iconBackgroundColor }) => {
    return (
        <TouchableOpacity style={styles.container} onPress={clickHandler}>

            <View style={styles.notify}>
                <Text style={styles.notifyTxt}>{num}</Text>
            </View>


            <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
                <MaterialCommunityIcons name={iconName} size={30} color={iconColor} />
            </View>

            <View style={styles.textContainer}>
                <Text style={styles.text}>{txt}</Text>
            </View>

        </TouchableOpacity>
    )
}

export default HomeNotifyCard

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        height: height / 6,
        width: width / 2.5,
        backgroundColor: '#fff',
        borderRadius: 20,
        elevation: 3,
    },
    circle: {
        width: width / 3.5,
        height: height / 7,
        borderRadius: 100,
        borderColor: '#800000',
        borderWidth: 1
    },
    textContainer: {
        position: 'absolute',
        bottom: 20,
        borderRadius: 20,
        height: height / 24,
        width: width / 3.8,
        alignItems: 'center',
        justifyContent: 'center'
    },
    text: {
        fontSize: 16,
        color: '#000',
        fontFamily: 'K2D-Regular'
    },
    imageCon: {
        height: height / 30,
        width: width / 15,
        bottom: height / 9,
        position: 'absolute',
        top: 30,
    },
    notify: {
        height: height / 23,
        width: width / 11.5,
        backgroundColor: '#00B0F0',
        bottom: height / 7,
        position: 'absolute',
        right: -4,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center'
    },
    notifyTxt: {
        color: 'white',
        fontFamily: 'K2D-Regular',
        fontSize: 12
    },
    iconContainer: {
        position: 'absolute',
        top: 25,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        padding: 5,
    },
})