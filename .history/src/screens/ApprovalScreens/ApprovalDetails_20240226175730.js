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
                    <Text>S.r#</Text>
                </View>
                <View style={[styles.SrNo,{}]}>
                    <Text>Item Name</Text>
                </View>
                <View style={[styles.SrNo,{}]}>
                    <Text>Qty</Text>
                </View>
                <View style={[styles.SrNo,{}]}>
                    <Text>Unit</Text>
                </View>
                <View style={[styles.SrNo,{}]}>
                    <Text>Rate</Text>
                </View>
                <View style={[styles.SrNo,{}]}>
                    <Text>Amt Exc Tax</Text>
                </View>
                <View style={[styles.SrNo,{}]}>
                    <Text>Tax</Text>
                </View>
                <View style={[styles.SrNo,{}]}>
                    <Text>Tax Amt</Text>
                </View>
                <View style={[styles.SrNo,{}]}>
                    <Text>Amt Inc Tax</Text>
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
        borderWidth: 1,
        marginTop: 10,
        width: '98%',
        height: '72%',
        alignSelf: 'center',
        // flexDirection: 'row',
    },
    SrNo: {
        height: '5%',
        width: '100%', 
    },
})