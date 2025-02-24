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

                <View style={styles.SrNo}>
                    <Text>S.r#</Text>
                </View>
                <View style={{ width: '100%', backgroundColor: 'purple', height: '20%', alignItems: 'center' }}>
                    <Text>Item Name</Text>
                </View>
                <View style={{ width: '100%', backgroundColor: 'blue', height: '10%', alignItems: 'center' }}>
                    <Text>Qty</Text>
                </View>
                <View style={{ width: '100%', backgroundColor: 'yellow', height: '10%', alignItems: 'center' }}>
                    <Text>Unit</Text>
                </View>
                <View style={{ width: '100%', backgroundColor: 'orange', height: '10%', alignItems: 'center' }}>
                    <Text>Rate</Text>
                </View>
                <View style={{ width: '100%', backgroundColor: 'green', height: '10%', alignItems: 'center' }}>
                    <Text>Amt Exc Tax</Text>
                </View>
                <View style={{ width: '100%', backgroundColor: 'gray', height: '10%', alignItems: 'center' }}>
                    <Text>Tax</Text>
                </View>
                <View style={{ width: '100%', backgroundColor: 'red', height: '10%', alignItems: 'center' }}>
                    <Text>Tax Amt</Text>
                </View>
                <View style={{ width: '100%', backgroundColor: 'orange', height: '10%', alignItems: 'center' }}>
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
        backgroundColor: 'red',
        height: '5%',
        width: '100%',
        alignItems: 'center',
        borderLeftWidth:1,
        borderColor:'#000',
    },
})