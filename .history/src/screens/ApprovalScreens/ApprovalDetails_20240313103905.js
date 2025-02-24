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
    const [modelName, setModelName] = useState('');

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

            setModelName(mobelname);

            const URL = `${protocol}://${host}:${port}/api/v1/models/${mobelname}?$filter=${mobelname}_ID eq ${recordId}`
            console.log(URL)

            const response = await axios.get(URL, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            // console.log(response.data.records, 'data')
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

    const hasRequiredData = paymentDetails.length > 0 && paymentDetails[0].C_DocType_ID && paymentDetails[0].C_BPartner_ID && paymentDetails[0].DocumentNo && (paymentDetails[0].DateInvoiced || paymentDetails[0].DateDoc) && paymentDetails[0].TotalLines != null && paymentDetails[0].GrandTotal != null;

    return (
        <View style={{ flex: 1 }} >
            <CustomHeader title={'Approval Details'} />

            {modelName === 'C_payment' && (
                <View style={styles.TopBorderStyle}>
                    <Text style={[styles.TopTxt, { fontSize: 20, textAlign: 'center' }]}>{paymentDetails[0].C_DocType_ID.identifier}</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={styles.TopLeftBorder}>
                            <Text style={styles.TopTxt}>{paymentDetails[0].C_BPartner_ID.identifier}</Text>
                            <View style={styles.InsideView}>
                                <Text style={styles.HeadTxt}>DocNo#: </Text>
                                <Text style={styles.TopTxt}>{paymentDetails[0].DocumentNo}</Text>
                            </View>
                            <View style={styles.InsideView}>
                                <Text style={styles.HeadTxt}>Date: </Text>
                                <Text style={styles.TopTxt}>{paymentDetails[0].DateTrx}</Text>
                            </View>
                        </View>
                        <View style={styles.TopLeftBorder}>
                            <Text style={styles.TopTxt}>{paymentDetails[0]?.AD_Client_ID?.identifier}</Text>
                            <Text style={styles.TopTxt}>{paymentDetails[0]?.AD_Org_ID?.identifier}</Text>
                            <View style={styles.InsideView}>
                                <Text style={styles.HeadTxt}>DocType: </Text>
                                <Text style={styles.TopTxt}>{paymentDetails[0]?.C_DocType_ID?.identifier || 'None'}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            )}

            {paymentDetails.length > 0 && (
                // {modelName === 'C_Invoice' ||modelName === 'C_Order' && ( 
                <View style={styles.TopBorderStyle}>
                    <Text style={[styles.TopTxt, { fontSize: 20, textAlign: 'center' }]}>{paymentDetails[0].C_DocType_ID.identifier}</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={styles.TopLeftBorder}>
                            <Text style={styles.TopTxt}>{paymentDetails[0].C_BPartner_ID.identifier}</Text>
                            <View style={styles.InsideView}>
                                <Text style={styles.HeadTxt}>DocNo#: </Text>
                                <Text style={styles.TopTxt}>{paymentDetails[0].DocumentNo}</Text>
                            </View>
                            <View style={styles.InsideView}>
                                <Text style={styles.HeadTxt}>Date: </Text>
                                <Text style={styles.TopTxt}>{paymentDetails[0].DateInvoiced || paymentDetails[0].DateDoc}</Text>
                            </View>
                        </View>
                        <View style={styles.TopLeftBorder}>
                            <Text style={styles.TopTxt}>{paymentDetails[0].IsSOTrx ? 'Invoive Customer' : 'Invoice Vendor'}</Text>
                            <View style={styles.InsideView}>
                                <Text style={styles.HeadTxt}>Exc Amt: </Text>
                                <Text style={styles.TopTxt}>{paymentDetails[0].TotalLines}</Text>
                            </View>
                            <View style={styles.InsideView}>
                                <Text style={styles.HeadTxt}>Inc Amt: </Text>
                                <Text style={styles.TopTxt}>{paymentDetails[0].GrandTotal}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            )}

            {modelName === 'C_payment' && (
                <FlatList
                    data={paymentDetails}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => {
                        // console.log(item,'trew')
                        return (
                            <View style={styles.CardView}>
                                <Text style={styles.TopTxt}>Payment Amount: {item?.PayAmt}</Text>
                                <Text style={styles.TopTxt}>Bank Account: {item?.C_BankAccount_ID?.identifier}</Text>
                                <Text style={styles.TopTxt}>Description: {item?.Description}</Text>
                            </View>
                        );
                    }}
                />
            )}

            <FlatList
                data={paymentDetailsLine || []}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const taxRateMatch = item.C_Tax_ID.identifier.match(/(\d+)/);
                    const taxRate = taxRateMatch ? parseFloat(taxRateMatch[0]) : 0;
                    const TaxAmount = (item.LineNetAmt * taxRate) / 100;
                    console.log(item)
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
        fontFamily: 'K2D-Bold',
        fontSize: 16
    },
    HeadTxt: {
        fontFamily: 'K2D-Regular',
        color: '#0050C0',
        fontSize: 16
    },
    CardView: {
        marginTop: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: 'gray',
        zIndex: 1,
        width: '95%',
        alignSelf: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
    },
    TopTxt: {
        color: '#000',
        fontFamily: 'K2D-Regular',
        fontSize: 16
    },
    InsideView: {
        flexDirection: 'row',
        alignItems: 'center'
    },

})