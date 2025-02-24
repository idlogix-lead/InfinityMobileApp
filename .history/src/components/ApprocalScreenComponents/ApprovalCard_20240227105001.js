import { StyleSheet, Text, View, ScrollView } from 'react-native'
import React from 'react'

const ApprovalCard = () => {
    return (
        <ScrollView>
            <View style={styles.Container}>
                <View style={styles.SrNo}>
                    <Text style={styles.TopTxt}>Sr.#</Text>
                    <Text style={styles.styleTxt}>1</Text>
                </View>
                <View style={styles.SrNo}>
                    <Text style={styles.TopTxt}>Sr.#</Text>
                    <Text style={styles.styleTxt}>1</Text>
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
        width:'10%',
        justifyContent: 'center',
    },
    TopTxt: {
        paddingLeft:5,
        borderLeftWidth:1,
        borderColor:'gray',
        fontFamily: 'K2D-Regular',
        color: 'gray',
    },
    styleTxt:{
        color:'#000',
        fontSize:16,
        padding:5,
    },
})