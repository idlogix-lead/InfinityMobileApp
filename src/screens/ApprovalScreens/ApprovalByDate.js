import { Image, StyleSheet, Text, View, Dimensions, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window')

const ApprovalByDate = ({ navigation, route }) => {
    const { token, tabelId, IsSOTrx } = route.params
    const [refresh, setRefresh] = useState(false);
    let newArray = []
    const [formattedData, setFormattedData] = useState()
    const [passData, setPassData] = useState()
    const [mergedDatesArray, setMergedDatesArray] = useState()

    const getName = async () => {
        const roleId = await AsyncStorage.getItem('roleId')
        const protocol = await AsyncStorage.getItem('protocol')
        const host = await AsyncStorage.getItem('host')
        const port = await AsyncStorage.getItem('port')

        APICall(roleId, protocol, host, port)
    }

    const APICall = async (roleId, protocol, host, port) => {
        await fetch(`${protocol}://${host}:${port}/api/v1/models/mbl_workflow_v?$filter= AD_Role_ID eq ${roleId} AND AD_Table_ID eq ${tabelId} AND IsSOTrx eq ${IsSOTrx}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then((data) => {
                console.log(JSON.stringify(data),'ApprovalByDate')
                let arrayData = data.records
                const createdArray = arrayData.map(item => item.Created.split("T")[0]);
                const mergedDatesArray = createdArray.reduce((acc, date) => {
                    const existingDate = acc.find((d) => d.date === date);
                    if (existingDate) {
                        existingDate.count++;
                    } else {
                        acc.push({ date, count: 1 });
                    }
                    return acc;
                }, []);

                const resultArray = mergedDatesArray.map(({ date, count }) => ({
                    date,
                    count,
                }));

                const formatted = resultArray.map((item) => {
                    const date = new Date(item.date);
                    const formattedDate = date.toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "long",
                    });
                    return { count: item.count, date: formattedDate };
                });
                setFormattedData(formatted)
                setMergedDatesArray(mergedDatesArray)
                setPassData(arrayData)
                setRefresh(false)
            })
    }

    const navigateBack = () => {
        const unsubscribe = navigation.addListener('focus', () => {
            setRefresh(true)
            getName()
        });
        return unsubscribe;
    }

    useEffect(() => {
        navigateBack()
    }, [navigation]);

    const detailsCard = ({ index }) => {
        newArray = []
        passData.forEach((obj) => {
            let object = obj.Created.split("T")[0]
            if (mergedDatesArray[index].date === object) {
                newArray.push(obj)
            }
        })
        let monthDate = mergedDatesArray[index]
        console.log(mergedDatesArray[index])
        navigation.navigate('ApprovalCardList', { newArray, token, monthDate,tabelId, IsSOTrx })
    }

    const renderItem = ({ item, index }) => (
        <TouchableOpacity
            style={{ alignItems: 'center', borderBottomColor: 'black', borderBottomWidth: 1, marginTop: 10 }}
            onPress={() => detailsCard({ index })}
        >
            <View style={styles.tableTopHead}>
                <Text style={styles.itemTxt}>{item.date}</Text>
                <View style={styles.countCon}>
                    <Text style={styles.itemTxt}>{item.count}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <>
            {refresh && (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color="#0050C0" />
                </View>)}
            {!refresh && (
                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    {/* Top header */}
                    <View style={styles.txtContainer}>
                        <TouchableOpacity style={styles.headerImageCon} onPress={() => navigation.goBack()}>
                            <Image source={require('../../asserts/PendingPaymentAssets/leftArrow.png')} style={styles.headerImage} />
                        </TouchableOpacity>
                        <View style={styles.headingCon}>
                            <Text style={styles.heading}>Pending Approvals Date Wise</Text>
                        </View>
                    </View>

                    {/* List */}
                    <View style={{ alignItems: 'center' }}>
                        <View style={styles.tableTopHead}>
                            <Text style={styles.tabelTop}>Date</Text>
                            <Text style={styles.tabelTop}>Total</Text>
                        </View>
                    </View>

                    <FlatList
                        data={formattedData}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </View>
            )}
        </>
    )
}

export default ApprovalByDate

const styles = StyleSheet.create({
    txtContainer: {
        width: width,
        height: height / 12,
        alignItems: 'center',
        // justifyContent: 'flex-end',
        flexDirection: 'row'
    },
    heading: {
        fontSize: 20,
        color: '#000000',
        fontFamily: 'K2D-ExtraBold'
    },
    headerImageCon:{
    },
    headerImage:{
        height:height/16,
        width:width/8,
        marginLeft:10,
        marginRight:10,
        marginTop:5
    },
    tabelTop: {
        color: '#800000',
        fontSize: 20,
        fontFamily: 'K2D-ExtraBold'
    },
    tableTopHead: {
        flexDirection: 'row',
        width: '90%',
        justifyContent: 'space-between',
        marginTop: 15
    },
    itemTxt: {
        color: 'black',
        fontSize: 15,
        fontFamily: 'K2D-ExtraBold'
    },
    countCon: {
        width: '15%',
        alignItems: 'center',
        justifyContent: 'center'
    }
})