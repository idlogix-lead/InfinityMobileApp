import { StyleSheet, Text, View, BackHandler, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import TopHeader from '../../components/ApprocalScreenComponents/TopHeader'
import HomeNotifyCard from '../../components/HomeScreenComponents/HomeNotifyCard'
import AsyncStorage from '@react-native-async-storage/async-storage';

const ApprovalByDoc = ({ navigation, route }) => {
    const { token } = route.params
    const [purchaseNum, setPurchaseNum] = useState(0)
    const [saleNum, setSaleNum] = useState(0)
    const [materialNum, setMaterialNum] = useState(0)
    const [shipmentNum, setShipmentNum] = useState(0)
    const [reqNum, setReqNum] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
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

    const getRoleId = async () => {
        const roleId = await AsyncStorage.getItem('roleId');
        const protocol = await AsyncStorage.getItem('protocol')
        const host = await AsyncStorage.getItem('host')
        const port = await AsyncStorage.getItem('port')
        getPurchase(protocol, host, port, roleId)
    }

    const getPurchase = async (protocol, host, port, roleId) => {
        const headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
        try {
            const request1 = new Request(`${protocol}://${host}:${port}/api/v1/models/mbl_workflow_v?$filter= AD_Role_ID eq ${roleId} AND AD_Table_ID eq 259 AND IsSOTrx eq false`, {
                method: 'GET',
                headers,
            });

            const request2 = new Request(`${protocol}://${host}:${port}/api/v1/models/mbl_workflow_v?$filter= AD_Role_ID eq ${roleId} AND AD_Table_ID eq 259 AND IsSOTrx eq true`, {
                method: 'GET',
                headers,
            });

            const request3 = new Request(`${protocol}://${host}:${port}/api/v1/models/mbl_workflow_v?$filter= AD_Role_ID eq ${roleId} AND AD_Table_ID eq 319 AND IsSOTrx eq false`, {
                method: 'GET',
                headers,
            });

            const request4 = new Request(`${protocol}://${host}:${port}/api/v1/models/mbl_workflow_v?$filter= AD_Role_ID eq ${roleId} AND AD_Table_ID eq 319 AND IsSOTrx eq true`, {
                method: 'GET',
                headers,
            });

            const request5 = new Request(`${protocol}://${host}:${port}/api/v1/models/mbl_workflow_v?$filter= AD_Role_ID eq ${roleId} AND AD_Table_ID eq 702`, {
                method: 'GET',
                headers,
            });
            Promise.all([
                fetch(request1),
                fetch(request2),
                fetch(request3),
                fetch(request4),
                fetch(request5),
            ])
                .then(responses => Promise.all(responses.map(response => response.json())))
                .then(data => {
                    // Do something with the data
                    setPurchaseNum(data[0].records.length)
                    setSaleNum(data[1].records.length)
                    setMaterialNum(data[2].records.length)
                    setShipmentNum(data[3].records.length)
                    setReqNum(data[4].records.length)
                    setIsLoading(false)
                })
                .catch(error => {
                    console.error(error);
                });

        } catch (error) {
            console.error(error);
        }
    }


    return (

        <>
            {isLoading && (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color="#0050C0" />
                </View>
            )}
            {!isLoading && (
                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    <TopHeader txt='Document Type' handlePress={() =>
                        navigation.goBack()} />
                    <View style={styles.card}>
                        <View style={{ flexDirection: 'row', width: '80%', justifyContent: 'space-between' }}>
                            <HomeNotifyCard
                                source={require('../../asserts/ApprovalAndDoucementAssets/purchase.jpg')}
                                txt="Purchase Order"
                                num={purchaseNum}
                                clickHandler={() => {
                                    if (purchaseNum === 0) {
                                        alert('No data available')
                                    } else {
                                        let tabelId = 259
                                        let IsSOTrx = false
                                        navigation.navigate('ApprovalByDate', { token, tabelId, IsSOTrx })
                                    }
                                }}
                            />
                            <HomeNotifyCard
                                source={require('../../asserts/ApprovalAndDoucementAssets/sale.jpg')}
                                txt="Sales Order"
                                num={saleNum}
                                clickHandler={() => {
                                    if (saleNum === 0) {
                                        alert('No data available')
                                    } else {
                                        let tabelId = 259
                                        let IsSOTrx = true
                                        navigation.navigate('ApprovalByDate', { token, tabelId, IsSOTrx })
                                    }
                                }}
                            />
                        </View>

                        <View style={{ flexDirection: 'row', width: '80%', justifyContent: 'space-between', marginTop: '10%' }}>
                            <HomeNotifyCard
                                source={require('../../asserts/ApprovalAndDoucementAssets/material.jpg')}
                                txt="Material Receipt"
                                num={materialNum}
                                clickHandler={() => {
                                    if (materialNum === 0) {
                                        alert('No data available')
                                    } else {
                                        let tabelId = 319
                                        let IsSOTrx = false
                                        navigation.navigate('ApprovalByDate', { token, tabelId, IsSOTrx })
                                    }
                                }}
                            />
                            <HomeNotifyCard
                                source={require('../../asserts/ApprovalAndDoucementAssets/shipment.jpg')}
                                txt="Shipment"
                                num={shipmentNum}
                                clickHandler={() => {
                                    if (shipmentNum === 0) {
                                        alert('No data available')
                                    } else {
                                        let tabelId = 319
                                        let IsSOTrx = true
                                        navigation.navigate('ApprovalByDate', { token, tabelId, IsSOTrx })
                                    }
                                }}
                            />
                        </View>

                        <View style={{ flexDirection: 'row', width: '80%', justifyContent: 'space-between', marginTop: '10%' }}>
                            <HomeNotifyCard
                                source={require('../../asserts/ApprovalAndDoucementAssets/requisition.jpg')}
                                txt="Requisition"
                                num={reqNum}
                                clickHandler={() => {
                                    if (reqNum === 0) {
                                        Alert('No data available')
                                    } else {
                                        let tabelId = 702
                                        let IsSOTrx = false
                                        navigation.navigate('ApprovalByDate', { token, tabelId, IsSOTrx })
                                    }
                                }}
                            />
                        </View>
                    </View>
                </View>
            )}
        </>
    )
}

export default ApprovalByDoc

const styles = StyleSheet.create({
    card: {
        marginTop: '13%',
        justifyContent: 'center',
        alignItems: 'center'
    }
})