import { StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'

const SmallInput = ({ txt, placeholder, value, onChangeText,width,marginLeft }) => {
    return (
        <View style={{width:width,marginLeft:marginLeft}}>
            <Text style={styles.txt}>{txt}</Text>
            <View style={styles.inputCon}>
                <TextInput
                style={{padding:2,}}
                    placeholder={placeholder}
                    placeholderTextColor="black"
                    fontFamily="K2D-Regular"
                    value={value}
                    onChangeText={onChangeText}
                    fontSize={16}
                    color="black"
                    multiline={true}
                />
            </View>
        </View>
    )
}

export default SmallInput

const styles = StyleSheet.create({
    inputCon: {
        borderColor: '#00B0F0',
        borderWidth: 1,
        marginTop: 5,
        borderRadius: 10,
        height:40,
    },
    txt: {
        fontSize: 14,
        fontFamily: 'K2D-Regular',
        color: '#0070C0'
    }
})