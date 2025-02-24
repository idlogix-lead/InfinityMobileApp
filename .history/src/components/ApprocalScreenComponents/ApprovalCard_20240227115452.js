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
                    <View style={styles.DataView}>
                        <Text style={styles.styleTxt}>wdanklmjksldfax</Text>
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
        paddingVertical:10,
    },
    styleTxt: {
        paddingLeft: 5,
        borderBottomWidth:1,
        borderColor: 'gray',
        fontFamily: 'K2D-Regular',
        color: '#000',
        marginTop: 10,
        paddingVertical:10,
    },
    DataView:{
        borderWidth: 0.5,
        borderColor: 'gray',
        
    },
})