import { ImageBackground, StyleSheet, Text, View, Dimensions, TouchableOpacity, TextInput } from 'react-native'
import React from 'react'
import { Image } from 'react-native-elements'

const { width, height } = Dimensions.get('window')

const TopHeader = ({ txt, handlePress }) => {
    return (
        <View style={styles.topImage}>
            <View style={{ flexDirection: 'row', width: '90%', alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity
                    onPress={handlePress}
                    style={{ height: height / 15, marginTop: 20 }}>
                    <Image source={require('../../asserts/ApprovalAndDoucementAssets/LeftArrow.png')} style={styles.backImage} />
                </TouchableOpacity>
                <View style={{ width: '86%', alignItems: 'center' }}>
                    <Text style={styles.txtStyle}>{txt}</Text>
                </View>
            </View>

            <View style={styles.inputCon}>
                <TextInput
                    placeholder='Search'
                    placeholderTextColor='#808080'
                    style={styles.input} />
            </View>
        </View>
    )
}

export default TopHeader

const styles = StyleSheet.create({
    topImage: {
        backgroundColor: '#800000',
        width: width,
        height: height / 5,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    backImage: {
        height: height / 17,
        width: width / 8.5
    },
    txtStyle: {
        color: 'white',
        fontSize: 20,
        fontFamily: 'K2D-Bold',
        marginRight: 40,

    },
    inputCon: {
        width: '85%',
    },
    input: {
        color: 'black',
        fontFamily: 'K2D-Regular',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 5,
    }
})