import { StyleSheet, Text, View, ScrollView } from 'react-native'
import React from 'react'

const ApprovalCard = () => {
    return (
        <ScrollView style={{ flex: 1, }}>
            <View style={styles.Headerstyle}>
                <Text style={styles.HeaderTxt}>S.r#</Text>
                {/* <Text style={[styles.HeaderTxt, { width: '30%', }]}>Item Name</Text> */}
            </View>
            <View>

            </View>
            <View style={styles.BottomBorder}>


                {/* <View style={[styles.SrNo,{}]}>
                    <Text style={styles.TxtColor}>S.r#</Text>
                </View>
                <View style={[styles.SrNo,{}]}>
                    <Text style={styles.TxtColor}>Item Name</Text>
                </View>
                <View style={[styles.SrNo,{}]}>
                    <Text style={styles.TxtColor}>Qty</Text>
                </View>
                <View style={[styles.SrNo,{}]}>
                    <Text style={styles.TxtColor}>Unit</Text>
                </View>
                <View style={[styles.SrNo,{}]}>
                    <Text style={styles.TxtColor}>Rate</Text>
                </View>
                <View style={[styles.SrNo,{}]}>
                    <Text style={styles.TxtColor}>Amt Exc Tax</Text>
                </View>
                <View style={[styles.SrNo,{}]}>
                    <Text style={styles.TxtColor}>Tax</Text>
                </View>
                <View style={[styles.SrNo,{}]}>
                    <Text style={styles.TxtColor}>Tax Amt</Text>
                </View>
                <View style={[styles.SrNo,{borderBottomWidth:0}]}>
                    <Text style={styles.TxtColor}>Amt Inc Tax</Text>
                </View> */}
            </View>
        </ScrollView>
    )
}

export default ApprovalCard

const styles = StyleSheet.create({
    BottomBorder: {
        borderWidth: 1,
        backgroundColor: 'red',
        alignSelf: 'center',
    },
    Headerstyle: {
        height: '100%',
        marginTop: 10,
        width: '98%',
        alignSelf: 'center',
    },
    HeaderTxt: {
        width: '10%',
        height: '100%',
        borderLeftWidth: 1,
        borderColor: 'gray',
        fontFamily: 'K2D-Regular',
        color: 'gray',
        paddingLeft: 5,
    },
    SrNo: {
        height: '11%',
        width: '100%',
        borderBottomWidth: 1,
        justifyContent: 'center',
        borderRightWidth: 1,
    },
    TxtColor: {
        color: '#000',
        padding: 10,
        fontFamily: 'K2D-Regular',
    },
})