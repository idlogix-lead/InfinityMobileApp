import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import CustomHeader from '../../components/CustomHeader'
import ApprovalCard from '../../components/ApprocalScreenComponents/ApprovalCard'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Loader from '../../components/Loader';

const ApprovalDetails = ({ route }) => {
    const { recordId, tableId } = route.params;
    const [paymentDetails, setPaymentDetails] = useState([])
    const [paymentDetailsLine, setPaymentDetailsLine] = useState([])
    const [modelName, setModelName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const FetchDetails = async () => {
        try {
            setIsLoading(true);
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
        } finally {
            setIsLoading(false);
        }

    };

    useEffect(() => {
        FetchDetails();
    }, [recordId, tableId]);

    return (
        <View style={{ flex: 1 }} >
            <CustomHeader title={'Approval Details'} />

            {modelName === 'C_payment' && (
                <View style={styles.TopBorderStyle}>
                    <Text style={styles.TitleTxt}>{paymentDetails[0]?.C_DocType_ID?.identifier}</Text>
                    <View style={styles.InsideView}>
                        <Text style={styles.HeadTxt}>Business Partner: </Text>
                        <Text style={[styles.TopTxt,{fontFamily:'K2D-Bold'}]}>{paymentDetails[0]?.C_BPartner_ID.identifier}</Text>
                    </View>
                    {/* <View style={styles.InsideView}>
                        <Text style={styles.HeadTxt}>Client Name: </Text>
                        <Text style={styles.TopTxt}>{paymentDetails[0]?.AD_Client_ID?.identifier}</Text>
                    </View>
                    <View style={styles.InsideView}>
                        <Text style={styles.HeadTxt}>Organization Name: </Text>
                        <Text style={styles.TopTxt}>{paymentDetails[0]?.AD_Org_ID?.identifier}</Text>
                    </View> */}
                    <View style={{ flexDirection: 'row' }}>
                        <View style={styles.TopLeftBorder}>
                            <View style={styles.InsideView}>
                                <Text style={styles.HeadTxt}>DocNo#: </Text>
                                <Text style={styles.TopTxt}>{paymentDetails[0]?.DocumentNo}</Text>
                            </View>
                        </View>
                        <View style={styles.TopLeftBorder}>
                            <View style={styles.InsideView}>
                                <Text style={styles.HeadTxt}>Date: </Text>
                                <Text style={styles.TopTxt}>{paymentDetails[0]?.DateTrx}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            )}

            {(modelName === 'C_Invoice' || modelName === 'C_Order') && (
                <View style={styles.TopBorderStyle}>
                    <Text style={styles.TitleTxt}>{paymentDetails[0]?.IsSOTrx ? 'Invoive Customer' : 'Invoice Vendor'}</Text>
                    <Text style={[styles.TopTxt, { fontSize: 18, textAlign: 'center',fontFamily:'K2D-Regular',marginTop:-10 }]}>{paymentDetails[0]?.C_DocType_ID?.identifier}</Text>
                    <View style={{ flexDirection: 'row',marginTop:5 }}>
                        <View style={styles.TopLeftBorder}>
                            <Text style={[styles.TopTxt,{fontFamily:'K2D-Bold'}]}>{paymentDetails[0]?.C_BPartner_ID?.identifier}</Text>
                            <View style={styles.InsideView}>
                                <Text style={styles.HeadTxt}>DocNo#: </Text>
                                <Text style={styles.TopTxt}>{paymentDetails[0]?.DocumentNo}</Text>
                            </View>
                            <View style={styles.InsideView}>
                                <Text style={styles.HeadTxt}>Date: </Text>
                                <Text style={styles.TopTxt}>{paymentDetails[0]?.DateInvoiced || paymentDetails[0]?.DateDoc}</Text>
                            </View>
                        </View>
                        <View style={styles.TopLeftBorder}>
                            {/* <Text style={styles.TopTxt}>{paymentDetails[0]?.IsSOTrx ? 'Invoive Customer' : 'Invoice Vendor'}</Text> */}
                            <View style={styles.InsideView}>
                                <Text style={styles.HeadTxt}>Exc Amt: </Text>
                                <Text style={styles.TopTxt}>{parseInt(paymentDetails[0]?.TotalLines)}</Text>
                            </View>
                            <View style={styles.InsideView}>
                                <Text style={styles.HeadTxt}>Inc Amt: </Text>
                                <Text style={styles.TopTxt}>{parseInt(paymentDetails[0]?.GrandTotal)}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            )}
            {modelName === 'M_Requisition' && (
                <View style={styles.TopBorderStyle}>
                    <Text style={styles.TitleTxt}>{paymentDetails[0]?.C_DocType_ID?.identifier}</Text>
                    <View style={styles.InsideView}>
                        <Text style={styles.HeadTxt}>DocNo#: </Text>
                        <Text style={styles.TopTxt}>{paymentDetails[0]?.DocumentNo}</Text>
                    </View>
                    <View style={styles.InsideView}>
                        <Text style={styles.HeadTxt}>Date: </Text>
                        <Text style={styles.TopTxt}>{paymentDetails[0]?.DateDoc}</Text>
                    </View>
                    <View style={styles.InsideView}>
                        <Text style={styles.HeadTxt}>Exc Amt: </Text>
                        <Text style={styles.TopTxt}>{paymentDetails[0]?.TotalLines}</Text>
                    </View>
                </View>
            )}

            {modelName === 'C_payment' && (
                <FlatList
                    data={paymentDetails}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => {
                        return (
                            <View style={styles.CardView}>
                                <View style={styles.InsideView}>
                                    <Text style={styles.HeadTxt}>Payment Amount: </Text>
                                    <Text style={styles.TopTxt}>{item?.PayAmt}</Text>
                                </View>
                                <View style={styles.InsideView}>
                                    <Text style={styles.HeadTxt}>BankAccount: </Text>
                                    <Text style={styles.TopTxt}>{item?.C_BankAccount_ID?.identifier}</Text>
                                </View>
                                <View style={styles.InsideView}>
                                    <Text style={styles.HeadTxt}>Description: </Text>
                                    <Text style={styles.TopTxt}>{item?.Description}</Text>
                                </View>
                            </View>
                        );
                    }}
                />
            )}
            {modelName === 'M_Requisition' && (
                <FlatList
                    data={paymentDetailsLine || []}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        return (
                            <View style={styles.CardView}>
                                <Text style={styles.ItemName}>{item.M_Product_ID?.identifier || item.C_Charge_ID?.identifier || ''}</Text>
                                <View style={{ flexDirection: 'row', marginLeft: 10, }}>
                                    <Text style={styles.HeadTxt}>Business Partner: </Text>
                                    <Text style={styles.TopTxt}>{item.C_BPartner_ID?.identifier}</Text>
                                </View>
                                <View style={styles.BottomView}>
                                    <View style={styles.InnerCntainer}>
                                        <Text style={styles.HeadTxt}>Qty</Text>
                                        <Text style={styles.TopTxt}>{item.Qty}</Text>
                                    </View>
                                    <View style={styles.InnerCntainer}>
                                        <Text style={styles.HeadTxt}>Unit</Text>
                                        <Text style={styles.TopTxt}>{item.C_UOM_ID.identifier ? item.C_UOM_ID.identifier : ''}</Text>
                                    </View>
                                    <View style={styles.InnerCntainer}>
                                        <Text style={styles.HeadTxt}>Rate</Text>
                                        <Text style={styles.TopTxt}>{item.PriceActual ? item.PriceActual : ''}</Text>
                                    </View>
                                    <View style={styles.InnerCntainer}>
                                        <Text style={styles.HeadTxt}>Amt Exc Tax</Text>
                                        <Text style={styles.TopTxt}>{item.LineNetAmt ? item.LineNetAmt : ''}</Text>
                                    </View>
                                </View>

                            </View>
                        )
                    }}
                />

            )}

            {(modelName === 'C_Invoice' || modelName === 'C_Order') && (
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
            )}
            {isLoading ? <Loader /> : null}
        </View >
    )
}

export default ApprovalDetails

const styles = StyleSheet.create({
    TopBorderStyle: {
        borderWidth: 0.5,
        borderColor: 'gray',
        // marginTop: 10,
        width: '100%',
        alignSelf: 'center',
        backgroundColor: '#f5f5f5',
        padding: 10,
        // flexDirection: 'row',
    },
    TopLeftBorder: {
        width: '49%',
        borderLeftColor: 'gray',
        // height: '100%',
    },
    HeadTxt: {
        fontFamily: 'K2D-Regular',
        color: '#0050C0',
        fontSize: 16,
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
    ItemName: {
        color: '#000',
        fontFamily: 'K2D-Bold',
        fontSize: 18,
        marginLeft: 10,
    },
    BottomView: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: 10,
    },
    TitleTxt:{
        color: '#000',
        fontFamily: 'K2D-Bold',
        fontSize: 22,
        textAlign:'center',
    },
})