import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import CustomHeader from '../../components/CustomHeader'
import ApprovalCard from '../../components/ApprocalScreenComponents/ApprovalCard'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const ApprovalDetails = ({ route }) => {
    const { recordId, tableId } = route.params;
    const [paymentDetails, setPaymentDetails] = useState([])
    const [paymentDetailsLine, setPaymentDetailsLine] = useState([])

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
                mobelname = 'C_Invoice';
            else if (tableId === 259)
                mobelname = 'C_Order';
            else if (tableId === 702)
                mobelname = 'M_Requisition';

            const URL = `${protocol}://${host}:${port}/api/v1/models/${mobelname}?$filter=${mobelname}_ID eq ${recordId}`
            console.log(URL)

            const response = await axios.get(URL, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            console.log(response.data.records, 'data')
            setPaymentDetails(response.data.records)

            if (mobelname === 'C_Invoice' || mobelname === 'M_Requisition' || mobelname === 'C_Order') {
                const lineModelName = `${mobelname}Line`;

                const lineURL = `${protocol}://${host}:${port}/api/v1/models/${lineModelName}?$filter=${mobelname}_ID eq ${recordId}`;
                console.log(lineURL)
                const lineResponse = await axios.get(lineURL, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                setPaymentDetailsLine(lineResponse.data.records);
                // console.log(JSON.stringify(lineResponse.data.records))
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

            {paymentDetails.length > 0 && (
                <View style={styles.TopBorderStyle}>
                    <View>
                        
                    </View>
                    <View style={{flexDirection:'row'}}>
                        <View style={styles.TopLeftBorder}>
                            <Text style={styles.TopTxt}>{paymentDetails[0].C_BPartner_ID.identifier}</Text>
                            <Text style={styles.TopTxt}>DocNo#: {paymentDetails[0].DocumentNo}</Text>
                            <Text style={styles.TopTxt}>Date: {paymentDetails[0].DateInvoiced}</Text>
                            <Text style={styles.TopTxt}>Doc: {paymentDetails[0].C_DocType_ID.identifier}</Text>
                        </View>
                        <View style={styles.TopLeftBorder}>
                            <Text style={styles.TopTxt}>Exc Amt: {paymentDetails[0].TotalLines}</Text>
                            <Text style={styles.TopTxt}>Inc Amt: {paymentDetails[0].GrandTotal}</Text>
                            <Text style={styles.TopTxt}>{paymentDetails[0].IsSOTrx ? 'Invoive Customer' : 'Invoice Vendor'}</Text>
                        </View>
                    </View>
                </View>
            )}

            <FlatList
                data={paymentDetailsLine || []}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const taxRateMatch = item.C_Tax_ID.identifier.match(/(\d+)/);
                    const taxRate = taxRateMatch ? parseFloat(taxRateMatch[0]) : 0;
                    const TaxAmount = (item.LineNetAmt * taxRate) / 100;
                    // console.log(item)
                    return (
                        <ApprovalCard
                            ItemName={item.M_Product_ID?.identifier || item.C_Charge_ID?.identifier || ''}
                            Qty={item.QtyInvoiced || item.QtyOrdered}
                            Unit={item.C_UOM_ID.identifier ? item.C_UOM_ID.identifier : ''}
                            Rate={item.PriceActual ? item.PriceActual : ''}
                            AmtExTax={item.LineNetAmt ? item.LineNetAmt : ''}
                            Tax={item.C_Tax_ID.identifier ? item.C_Tax_ID.identifier : ''}
                            TaxAmt={TaxAmount}
                            AmtIncTax={item.LineNetAmt + TaxAmount}
                        />

                    )
                }}
            />

        </View >
    )
}

export default ApprovalDetails

const styles = StyleSheet.create({
    TopBorderStyle: {
        borderWidth: 0.5,
        borderColor: 'gray',
        marginTop: 10,
        width: '98%',
        alignSelf: 'center',
        backgroundColor: '#fff',
        padding: 10,
        // flexDirection: 'row',
    },
    TopLeftBorder: {
        width: '49%',
        borderLeftColor: 'gray',
        // height: '100%',
    },
    TopTxt: {
        color: '#000',
        fontFamily: 'K2D-Regular',
        fontSize: 16
    },

})