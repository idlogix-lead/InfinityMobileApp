import { StyleSheet, Text, View, ScrollView } from 'react-native'
import React from 'react'

const ApprovalCard = () => {
    return (
        <ScrollView>
            <View style={styles.Container}>
                <View style={styles.SrNo}>
                    <Text style={styles.TopTxt}>Sr.#</Text>
                    <Text style={styles.TopTxt}>Item Name</Text>
                    <Text style={styles.TopTxt}>Qty</Text>
                    <Text style={styles.TopTxt}>Unit</Text>
                    <Text style={styles.TopTxt}>Rate</Text>
                    <Text style={styles.TopTxt}>Amt Exc Tax</Text>
                    <Text style={styles.TopTxt}>Tax%</Text>
                    <Text style={styles.TopTxt}>Tax amt</Text>
                    <Text style={[styles.TopTxt,{borderBottomWidth:0}]}>Amt Inc Tax</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.DataView}></View>

                </ScrollView>
            </View>

        </ScrollView>
    )
}

export default ApprovalCard

const styles = StyleSheet.create({
    Container: {
        padding: 10,
        flexDirection: 'row',
    },
    SrNo: {
        borderWidth: 1,
        borderColor: 'gray',
        width: 100,
    },
    TopTxt: {
        paddingLeft: 5,
        borderBottomWidth:1,
        borderColor: 'gray',
        fontFamily: 'K2D-Regular',
        color: 'gray',
        marginTop: 10,
    },
    styleTxt: {
        color: '#000',
        fontSize: 16,
        padding: 5,
        borderColor: 'gray',
    },
    DataView:{
        borderWidth: 1,
        borderColor: 'gray',
        width: 100,
    },
})