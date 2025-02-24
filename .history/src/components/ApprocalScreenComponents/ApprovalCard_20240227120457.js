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
                    <Text style={[styles.TopTxt,{}]}>Amt Inc Tax</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.DataView}>
                        <Text style={styles.styleTxt}>wdanklmx</Text>
                        <Text style={styles.styleTxt}>wds</Text>
                        <Text style={styles.styleTxt}>1</Text>
                        <Text style={styles.styleTxt}>1</Text>
                        <Text style={styles.styleTxt}>1</Text>
                        <Text style={styles.styleTxt}>1</Text>
                        <Text style={styles.styleTxt}>1</Text>
                        <Text style={styles.styleTxt}>1</Text>
                        <Text style={styles.styleTxt}>1</Text>
                    </View>
                    <View style={styles.DataView}>
                        <Text style={styles.styleTxt}>wdanklmx</Text>
                        <Text style={styles.styleTxt}>wds</Text>
                        <Text style={styles.styleTxt}>1</Text>
                        <Text style={styles.styleTxt}>1</Text>
                        <Text style={styles.styleTxt}>1</Text>
                        <Text style={styles.styleTxt}>1</Text>
                        <Text style={styles.styleTxt}>1</Text>
                        <Text style={styles.styleTxt}>1</Text>
                        <Text style={styles.styleTxt}>1</Text>
                    </View>
                </ScrollView>
            </View>

        </ScrollView>
    )
}

export default ApprovalCard

const styles = StyleSheet.create({
    Container: {
        paddingTop: 10,
        flexDirection: 'row',
    },
    SrNo: {
        borderColor: 'gray',
        width: 105,
    },
    TopTxt: {
        paddingLeft: 5,
        borderBottomWidth:0.5,
        borderColor: 'gray',
        fontFamily: 'K2D-Regular',
        fontSize:16,
        color: '#00B0F0',
        paddingVertical:15,
        paddingLeft: 10,
    },
    styleTxt: {
        paddingLeft: 5,
        borderBottomWidth:0.5,
        borderColor: 'gray',
        fontFamily: 'K2D-Regular',
        color: 'gray',
        fontSize:16,
        paddingVertical:15,
    },
    DataView:{
        borderWidth: 0.5,
        borderColor: 'gray',
        
    },
})