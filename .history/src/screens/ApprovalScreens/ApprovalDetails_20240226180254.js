import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomHeader from '../../components/CustomHeader'

const ApprovalDetails = () => {
    return (
        <View style={{ flex: 1 }}>
            <CustomHeader title={'Approval Details'} />

            <View style={styles.TopBorderStyle}>
                <View style={styles.TopLeftBorder}>
                </View>
                <View ></View>
            </View>

            <View style={styles.BottomBorder}>

                <View style={[styles.SrNo,{}]}>
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
                <View style={[styles.SrNo,{}]}>
                    <Text style={styles.TxtColor}>Amt Inc Tax</Text>
                </View>
            </View>

        </View>
    )
}

export default ApprovalDetails

const styles = StyleSheet.create({
    TopBorderStyle: {
        borderWidth: 1,
        borderColor: '#000',
        marginTop: 10,
        height: '10%',
        width: '98%',
        alignSelf: 'center',
    },
    TopLeftBorder: {
        width: '49%',
        borderRightWidth: 1,
        borderLeftColor: '#000',
        height: '100%',
    },
    BottomBorder: {
        // borderWidth: 1,
        borderTopWidth:1,
        borderLeftWidth:1,
        borderRightWidth:1,
        marginTop: 10,
        width: '98%',
        height: '65%',
        alignSelf: 'center',
        // flexDirection: 'row',
    },
    SrNo: {
        height: '10%',
        width: '100%', 
        borderBottomWidth:1,
        justifyContent:'center',
    },
    TxtColor:{
        color:'#000',
        padding:10,
        fontWeight:'bold',
    },
})