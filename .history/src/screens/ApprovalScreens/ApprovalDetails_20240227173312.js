import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import CustomHeader from '../../components/CustomHeader'
import ApprovalCard from '../../components/ApprocalScreenComponents/ApprovalCard'

const ApprovalDetails = ({ route }) => {
    const { recordId, tableId } = route.params;

    useEffect(() => {
    }, [recordId, tableId]);


    let mobelname = 'C_payment';

    if (tableId = 335)
        mobelname = 'C_payment';
    else if (tableId = 318)
        mobelname = 'C_invoice';
    else if (tableId = 333)
        mobelname = 'C_InvoiceLine';
    else if (tableId = 702)
        mobelname = 'M_Requisition';
    else if (tableId = 703)
        mobelname = 'M_RequisitionLine';

    // const response = await fetch(`${protocol}://${host}:${port}/api/v1/models/${mobelname}?$filter=${mobelname}_ID eq ${recordId}`, {

    return (
        <View style={{ flex: 1 }} >
            <CustomHeader title={'Approval Details'} />

            <View style={styles.TopBorderStyle}>
                <View style={styles.TopLeftBorder}>
                </View>
                <View ></View>
            </View>

            <ApprovalCard />

        </View >
    )
}

export default ApprovalDetails

const styles = StyleSheet.create({
    TopBorderStyle: {
        borderWidth: 0.5,
        borderColor: 'gray',
        marginTop: 10,
        height: '10%',
        width: '98%',
        alignSelf: 'center',
    },
    TopLeftBorder: {
        width: '49%',
        borderRightWidth: 0.5,
        borderLeftColor: 'gray',
        height: '100%',
    },

})