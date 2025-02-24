import { StyleSheet, Text, View, ScrollView } from 'react-native'
import React from 'react'

const ApprovalCard = () => {
    return (
        <ScrollView>
            <View style={styles.Container}>
                <View style={styles.SrNo}>
                    <Text style={styles.TopTxt}>Sr.#</Text>
                    <Text></Text>
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
    },
    TopTxt: {
        paddingLeft:5,
        borderLeftWidth:1,
        borderColor:'gray',
        fontFamily: 'K2D-Regular',
        color: 'gray',
    },
})