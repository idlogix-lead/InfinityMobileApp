import { StyleSheet, Text, View, BackHandler, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import TopHeader from '../../components/ApprocalScreenComponents/TopHeader';
import HomeNotifyCard from '../../components/HomeScreenComponents/HomeNotifyCard'
import AsyncStorage from '@react-native-async-storage/async-storage';


const FinancialByDoc = ({ route, navigation }) => {
    const { token } = route.params
    const [paymentNum, setPaymentNum] = useState(0)
    const [venderNum, setVenderNum] = useState(0)
    const [customerNum, setCustomerNum] = useState(0)
    const [receiptNum, setReceiptNum] = useState(0)
    const [isLoading, setIsLoading] = useState(false);

    let roleId

    const getRoleId = async () => {
        const value = await AsyncStorage.getItem('roleId');
        roleId = value
        const protocol = await AsyncStorage.getItem('protocol')
        const host = await AsyncStorage.getItem('host')
        const port = await AsyncStorage.getItem('port')
        getPayment(protocol,host,port)
    }

    const getPayment = async (protocol,host,port) => {
        await fetch(`${protocol}://${host}:${port}/api/v1/models/mbl_workflow_v?$filter= AD_Role_ID eq ${roleId} AND AD_Table_ID eq 335 AND IsSOTrx eq false`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then((data) => {
                console.log(JSON.stringify(data),"FinancialByDoc")
                setPaymentNum(data["array-count"])
                getReceipt(protocol,host,port)
            })
    }

    const getReceipt = async (protocol,host,port) => {
        await fetch(`${protocol}://${host}:${port}/api/v1/models/mbl_workflow_v?$filter= AD_Role_ID eq ${roleId} AND AD_Table_ID eq 335 AND IsSOTrx eq true`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then((data) => {
                console.log(data.records)
                setReceiptNum(data["array-count"])
                getVendor(protocol,host,port)
            })
    }

    const getVendor = async (protocol,host,port) => {
        await fetch(`${protocol}://${host}:${port}/api/v1/models/mbl_workflow_v?$filter= AD_Role_ID eq ${roleId} AND AD_Table_ID eq 318 AND IsSOTrx eq false`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then((data) => {
                setVenderNum(data["array-count"])
                getCustomer(protocol,host,port)
            })
    }

    const getCustomer = async (protocol,host,port) => {
        await fetch(`${protocol}://${host}:${port}/api/v1/models/mbl_workflow_v?$filter= AD_Role_ID eq ${roleId} AND AD_Table_ID eq 318 AND IsSOTrx eq true`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then((data) => {
                setCustomerNum(data["array-count"])
                setIsLoading(false)
            })
    }


    const navigateBack = () => {
        const unsubscribe = navigation.addListener('focus', () => {
            setIsLoading(true)
            getRoleId()
        });

        return unsubscribe;
    }

    useEffect(() => {
        navigateBack()
        const backAction = () => {
            navigation.goBack()
            return true;
        };
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );
        return () => backHandler.remove();
    }, [navigation])


    return (
        <>
            {isLoading && (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color="#0050C0" />
                </View>
            )}
            {!isLoading && (
                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    <TopHeader txt='Document Approval' handlePress={() => navigation.goBack()} />
                    <View style={styles.card}>
                        <View style={{ flexDirection: 'row', width: '80%', justifyContent: 'space-between' }}>
                            <HomeNotifyCard
                                source={require('../../asserts/ApprovalAndDoucementAssets/purchase.jpg')}
                                txt="Payment"
                                num={paymentNum}
                                clickHandler={() => {
                                    if (paymentNum === 0) {
                                        console.log('not exist')
                                    } else {
                                        let tabelId = 335
                                        let IsSOTrx = false
                                        navigation.navigate('ApprovalByDate', { token, tabelId, IsSOTrx })
                                    }
                                }}
                            />
                            <HomeNotifyCard
                                source={require('../../asserts/ApprovalAndDoucementAssets/sale.jpg')}
                                txt="Invoice Vender"
                                num={venderNum}
                                clickHandler={() => {
                                    if (venderNum === 0) {
                                        console.log('not exist')
                                    } else {
                                        let tabelId = 318
                                        let IsSOTrx = false
                                        navigation.navigate('ApprovalByDate', { token, tabelId, IsSOTrx })
                                    }
                                }
                                }
                            />
                        </View>

                        <View style={{ flexDirection: 'row', width: '80%', justifyContent: 'space-between', marginTop: '10%' }}>
                            <HomeNotifyCard
                                source={require('../../asserts/ApprovalAndDoucementAssets/material.jpg')}
                                txt="Invoice Customer"
                                num={customerNum}
                                clickHandler={() => {
                                    if (customerNum === 0) {
                                        console.log('not exist')
                                    } else {
                                        let tabelId = 318
                                        let IsSOTrx = true
                                        navigation.navigate('ApprovalByDate', { token, tabelId, IsSOTrx })
                                    }
                                }
                                }
                            />
                            <HomeNotifyCard
                                source={require('../../asserts/ApprovalAndDoucementAssets/shipment.jpg')}
                                txt="Receipt"
                                num={receiptNum}
                                clickHandler={() => {
                                    if (receiptNum === 0) {
                                        console.log('not exist')
                                    } else {
                                        let tabelId = 335
                                        let IsSOTrx = true
                                        navigation.navigate('ApprovalByDate', { token, tabelId, IsSOTrx })
                                    }
                                }
                                }
                            />
                        </View>
                    </View>
                </View>
            )}
        </>
    )
}

export default FinancialByDoc

const styles = StyleSheet.create({
    card: {
        marginTop: '13%',
        justifyContent: 'center',
        alignItems: 'center'
    }
})