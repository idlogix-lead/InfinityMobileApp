import { StyleSheet, Text, View, Image, Dimensions } from 'react-native'
import React from 'react'

const { height, width } = Dimensions.get('window');
const NameContainer = ({name,clientName}) => {
    return (
        <View style={{ alignItems: 'center' }}>
            <View style={styles.container}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Text style={styles.nameTxt}>{name}</Text>
                    <Image
                        style={{ marginRight: 10 }}
                        source={require('../../asserts/HomeScreenAssets/secondContainer/MaleUser.png')} />
                </View>
                <Text style={styles.secondTxt}>{clientName}</Text>
            </View>
        </View>
    )
}

export default NameContainer

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(128, 0, 0, 0.65)',
        width: '97%',
        height: height / 9,
        marginTop: 10,
        borderRadius: 10
    },
    secondTxt: {
        color: 'white',
        fontSize: 20,
        fontFamily: 'K2D-BoldItalic',
        marginLeft: 10
    },
    nameTxt: {
        color: 'white',
        fontSize: 20,
        fontFamily: 'K2D-BoldItalic',
        marginRight: 5 
    }
})