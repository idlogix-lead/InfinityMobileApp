import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const ApprovalCard = ({ Qty, Unit, Rate, AmtExTax, Tax, TaxAmt, AmtIncTax }) => {
    return (
        <View>
            <View style={styles.CardView}>
                <Text style={styles.ItemName}>Item Name</Text>
                <View style={styles.BottomView}>
                    <View style={styles.InnerCntainer}>
                        <Text style={styles.TopTxt}>Qty</Text>
                        <Text style={styles.TopTxt}>{Qty}</Text>
                    </View>
                    <View style={styles.InnerCntainer}>
                        <Text style={styles.TopTxt}>Unit</Text>
                        <Text style={styles.TopTxt}>{Unit}</Text>
                    </View>
                    <View style={styles.InnerCntainer}>
                        <Text style={styles.TopTxt}>Rate</Text>
                        <Text style={styles.TopTxt}>{Rate}</Text>
                    </View>
                    <View style={styles.InnerCntainer}>
                        <Text style={styles.TopTxt}>Amt Exc Tax</Text>
                        <Text style={styles.TopTxt}>{AmtExTax}</Text>
                    </View>
                </View>
                <View style={styles.BottomView}>
                    <View style={styles.InnerCntainer}>
                        <Text style={styles.TopTxt}>Tax</Text>
                        <Text style={styles.TopTxt}>{Tax}</Text>
                    </View>
                    <View style={styles.InnerCntainer}>
                        <Text style={styles.TopTxt}>Tax amt</Text>
                        <Text style={styles.TopTxt}>{TaxAmt}</Text>
                    </View>
                    <View style={styles.InnerCntainer}>
                        <Text style={styles.TopTxt}>Amt Inc Tax</Text>
                        <Text style={styles.TopTxt}>{AmtIncTax}</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default ApprovalCard

const styles = StyleSheet.create({
    CardView: {
        marginTop: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: 'gray',
        zIndex: 1,
        width: '95%',
        alignSelf: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    ItemName: {
        color: '#000',
        fontFamily: 'K2D-Bold',
        fontSize: 18,
        marginLeft: 10,
    },
    BottomView: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    InnerCntainer: {
        padding: 7,
        alignItems: 'center',
    },
    TopTxt: {
        color: '#000',
        fontFamily: 'K2D-Regular',
        fontSize: 16
    },
})