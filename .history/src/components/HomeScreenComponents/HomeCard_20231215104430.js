
import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';

const { height, width } = Dimensions.get('window');

const HomeCard = ({ iconName, txt, iconColor, iconBackgroundColor }) => {
    return (
        <TouchableOpacity style={styles.container}>
            <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
                <MaterialCommunityIcons name={iconName} size={30} color={iconColor} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.text}>{txt}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default HomeCard;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        height: height / 6,
        width: width / 2.5,
        backgroundColor: '#fff',
        borderRadius: 20,
        elevation: 3,
    },
    iconContainer: {
        position: 'absolute',
        top: 25,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        padding: 5,
    },
    textContainer: {
        position: 'absolute',
        bottom: 20,
        borderRadius: 20,
        height: height / 24,
        width: width / 3.8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 16,
        color: '#000',
        fontFamily: 'K2D-Regular',
    },
});





