import { StyleSheet, Text, View, TextInput } from 'react-native'
import React from 'react'

const AnnualLeaveCard = ({ Txt,value, onTextChange,placeholder }) => {
    return (
        <View style={styles.Container}>
            <Text style={styles.Txxt}>{Txt}</Text>
            <View style={styles.TxtInputCtnr}>
                <TextInput
                    style={styles.TxtInput}
                    value={value}
                    onChangeText={onTextChange}
                    placeholder={placeholder}
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
        marginTop: '3%'
    },
    Txxt: {
        color: '#0070C0',
        fontSize: 16,
        fontFamily: 'K2D-Regular',
        width: '85%',
    },
    TxtInputCtnr: {
        borderWidth: 2,
        borderColor: '#00B0F0',
        borderRadius: 5,
        height: 40,
    },
    TxtInput: {
        color: 'red',
        marginLeft:5,
    },
})