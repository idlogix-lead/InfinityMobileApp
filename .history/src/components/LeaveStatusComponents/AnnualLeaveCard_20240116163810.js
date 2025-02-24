import { StyleSheet, Text, View, TextInput } from 'react-native'
import React from 'react'

const AnnualLeaveCard = ({ Txt, onTextChange }) => {
    return (
        <View style={styles.Container}>
            <Text style={styles.Txxt}>{Txt}</Text>
            <View style={styles.TxtInputCtnr}>
                <TextInput
                    style={styles.TxtInput}
                    onChangeText={onTextChange}
                />
            </View>
        </View>
    )
}

export default AnnualLeaveCard

const styles = StyleSheet.create({
    Container: {
        width: '85%',
        alignSelf: 'center',
        marginTop: '2%'
    },
    Txxt: {
        color: '#0050C0',
        fontFamily: 'K2D-Bold',
        fontSize: 16
    },
    TxtInputCtnr: {
        borderWidth: 1,
        borderColor: '#0050C0',
        borderRadius: 5,
        height: 40,
    },
    TxtInput: {
        color: '#000',
    },
})