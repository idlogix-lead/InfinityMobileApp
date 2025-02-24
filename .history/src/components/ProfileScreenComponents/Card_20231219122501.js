import { Image, StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native'
import React from 'react'


const { width, height } = Dimensions.get('window')
const Card = ({ source, txt, handlePress }) => {
    return (
        <TouchableOpacity style={styles.container} onPress={handlePress}>
            <View style={styles.imageCon} >
                <Image source={source} style={styles.iconCon} />
            </View>
            <View style={styles.txtCon}>
                <Text style={styles.txt}>{txt}</Text>
            </View>
            <View style={styles.endIcon}>
                <Image source={require('../../asserts/ProfieScreenAssets/ExpandArrow.png')} />
            </View>
        </TouchableOpacity>
    )
}

export default Card

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginTop: 10,
        width: '90%',
        justifyContent: 'center'
    },
    txtCon: {
        justifyContent: 'center',
        marginLeft: 10,
        width: '77%'
    },
    txt: {
        fontSize: 20,
        fontFamily: 'K2D-Regular',
        color: 'black'
    },
    endIcon: {
        justifyContent: 'center'
    },
    imageCon: {
        justifyContent: 'center'
    },
    iconCon: {
        height: height / 20,
        width: width / 10
    }
})