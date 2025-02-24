import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const ApprovalCard = ({ItemName, Qty, Unit, Rate, AmtExTax, Tax, TaxAmt, AmtIncTax }) => {
    return (
        <View>
            <View style={styles.CardView}>
                <Text style={styles.ItemName}>{ItemName}</Text>
                <View style={styles.BottomView}>
                    <View style={styles.InnerCntainer}>
                        <Text style={styles.TopTxt}>Qty</Text>
                        <Text style={styles.InnerTxt}>{Qty}</Text>
                    </View>
                    <View style={styles.InnerCntainer}>
                        <Text style={styles.TopTxt}>Unit</Text>
                        <Text style={styles.InnerTxt}>{Unit}</Text>
                    </View>
                    <View style={styles.InnerCntainer}>
                        <Text style={styles.TopTxt}>Rate</Text>
                        <Text style={styles.InnerTxt}>{Rate}</Text>
                    </View>
                    <View style={styles.InnerCntainer}>
                        <Text style={styles.TopTxt}>Tax</Text>
                        <Text style={styles.InnerTxt}>{Tax}</Text>
                    </View>
                </View>
                <View style={{borderBottomWidth:0.2,width:'80%',alignSelf:'center',color:'gray'}}></View>
                <View style={styles.BottomView}>
                    <View style={styles.InnerCntainer}>
                        <Text style={styles.TopTxt}>Amt Exc Tax</Text>
                        <Text style={styles.InnerTxt}>{AmtExTax}</Text>
                    </View>
                    <View style={styles.InnerCntainer}>
                        <Text style={styles.TopTxt}>Tax amt</Text>
                        <Text style={styles.InnerTxt}>{TaxAmt}</Text>
                    </View>
                    <View style={styles.InnerCntainer}>
                        <Text style={styles.TopTxt}>Amt Inc Tax</Text>
                        <Text style={styles.InnerTxt}>{AmtIncTax}</Text>
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
        color: '#0050C0',
        fontFamily: 'K2D-Regular',
        fontSize: 16
    },
    InnerTxt: {
        color: '#000',
        fontFamily: 'K2D-Regular',
        fontSize: 16
    },
})