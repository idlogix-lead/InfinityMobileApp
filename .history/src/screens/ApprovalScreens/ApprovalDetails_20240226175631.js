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
                <View style={{ width: '100%', backgroundColor: 'purple', height: '8%', }}>
                    <Text>Item Name</Text>
                </View>
                <View style={{ width: '100%', backgroundColor: 'blue', height: '8%',}}>
                    <Text>Qty</Text>
                </View>
                <View style={{ width: '100%', backgroundColor: 'yellow', height: '8%', }}>
                    <Text>Unit</Text>
                </View>
                <View style={{ width: '100%', backgroundColor: 'orange', height: '8%', }}>
                    <Text>Rate</Text>
                </View>
                <View style={{ width: '100%', backgroundColor: 'green', height: '8%', }}>
                    <Text>Amt Exc Tax</Text>
                </View>
                <View style={{ width: '100%', backgroundColor: 'gray', height: '8%',}}>
                    <Text>Tax</Text>
                </View>
                <View style={{ width: '100%', backgroundColor: 'red', height: '8%', }}>
                    <Text>Tax Amt</Text>
                </View>
                <View style={{ width: '100%', backgroundColor: 'orange', height: '8%', }}>
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