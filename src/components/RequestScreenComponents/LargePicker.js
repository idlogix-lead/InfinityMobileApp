import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Picker } from '@react-native-picker/picker';


const largePicker = ({ txt, mapData, onValueChange }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.txt}>{txt}</Text>
            <View style={styles.inputCon}>
                <Picker
                    // selectedValue={priority}
                    onValueChange={onValueChange}
                    dropdownIconColor={'#800000'}
                    style={styles.pickerItem}
                >
                    {mapData.map(option => (
                        <Picker.Item
                            key={option.value}
                            label={option.label}
                            value={option.value}
                        />
                    ))}

                </Picker>
            </View>
        </View>
    )
}

export default largePicker

const styles = StyleSheet.create({
    container: {
        width: '57%',
        marginLeft: 10
    },
    txt: {
        fontSize: 14,
        fontFamily: 'K2D-Regular',
        color: '#800000'
    },
    inputCon: {
        borderColor: '#800000',
        borderWidth: 1,
        marginTop: 5,
        borderRadius: 10
    },
    pickerItem: {
        color: 'black',
        fontSize: 14,
        fontFamily: 'K2D-Regular',
    }
})
