import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect,useState } from 'react'
import CustomHeader from '../../components/CustomHeader'
import ApprovalCard from '../../components/ApprocalScreenComponents/ApprovalCard'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const ApprovalDetails = ({ route }) => {
    const { recordId, tableId } = route.params;
    const [paymentDetails, setPaymentDetails] = useState(null)

    console.log(paymentDetails,'eswa')


    const FetchDetails = async () => {
        try {
            const protocol = await AsyncStorage.getItem('protocol');
            const host = await AsyncStorage.getItem('host');
            const port = await AsyncStorage.getItem('port');
            const token = await AsyncStorage.getItem('token');

            let mobelname = 'C_payment';

            if (tableId === 335)
                mobelname = 'C_payment';
            else if (tableId === 318)
                mobelname = 'C_invoice';
            else if (tableId === 333)
                mobelname = 'C_InvoiceLine';
            else if (tableId === 702)
                mobelname = 'M_Requisition';
            else if (tableId === 703)
                mobelname = 'M_RequisitionLine';

            const URL = `${protocol}://${host}:${port}/api/v1/models/${mobelname}?$filter=${mobelname}_ID eq ${recordId}`
            console.log(URL)

            const response = await axios.get(URL, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.data && response.data.length > 0) {
                setPaymentDetails(response.data[0]);
            }
        } catch (error) {
            console.error('Error:', error);
        }

    };

    useEffect(() => {
        FetchDetails();
    }, [recordId, tableId]);

    return (
        <View style={{ flex: 1 }} >
            <CustomHeader title={'Approval Details'} />

            <View style={styles.TopBorderStyle}>
                <View style={styles.TopLeftBorder}>
                </View>
                <View ></View>
            </View>

            {paymentDetails && (
                <ApprovalCard
                    ItemName={paymentDetails.DocumentNo}
                    // Qty={paymentDetails.PayAmt.toString()}
                    // Unit={paymentDetails.C_TenderType_ID?.identifier || ''}
                    // Rate={paymentDetails.TrxType?.identifier || ''}
                    // AmtExTax={paymentDetails.DiscountAmt.toString()}
                    // Tax={paymentDetails.TaxAmt.toString()}
                    // TaxAmt={paymentDetails.WriteOffAmt.toString()}
                    // AmtIncTax={paymentDetails.PayAmt.toString()}
                />
            )}

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