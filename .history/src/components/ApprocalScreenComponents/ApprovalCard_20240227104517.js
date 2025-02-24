import { StyleSheet, Text, View, ScrollView } from 'react-native'
import React from 'react'

const ApprovalCard = () => {
    return (
        <ScrollView>
            <View style={styles.Container}>
                <View style={styles.SrNo}>
                    <Text style={styles.TopTxt}>Sr.#</Text>
                </View>
            </View>

        </ScrollView>
    )
}

export default ApprovalCard

const styles = StyleSheet.create({
    Container:{
        padding:10,
    },
    SrNo: {
        borderLeftWidth:1,
        borderColor:'gray',
        paddingLeft:5,
    },
    TopTxt: {
        fontFamily: 'K2D-Regular',
        color: '#000',
    },
})