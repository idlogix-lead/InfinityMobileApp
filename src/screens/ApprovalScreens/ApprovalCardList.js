import {
    StyleSheet, Text, View, Dimensions, FlatList, TouchableOpacity, ActivityIndicator,
    BackHandler, Alert, Modal, Image
} from 'react-native'
import React, { useEffect, useState } from 'react'
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window')
const ApprovalCardList = ({ route, navigation }) => {
    const { newArray, token, monthDate, tabelId, IsSOTrx } = route.params
    console.log(newArray,"NEWSSARRAYY")
    // const {token} = route.params
    if (newArray.length > 0) {
        dateStr = newArray[0].Created;
    } else {
        dateStr = 0
    }
    const [amount, setAmount] = useState(0)
    const [isLoading, setIsLoading] = useState(false);
    const [dumyArray, setDumyArray] = useState(newArray)
    const [protocol, setProtocol] = useState()
    const [host, setHost] = useState()
    const [port, setPort] = useState()
    const [authAllModal, setAuthAllModal] = useState(false)
    const [modalFilter, setModalFilter] = useState(false)
    const [selectedButton, setSelectedButton] = useState('None');
    const [filterbtnCheck, setFilterbtnCheck] = useState(null)

    async function getItemFromStorage() {
        try {
            roleId = await AsyncStorage.getItem('roleId');
            setProtocol(await AsyncStorage.getItem('protocol'));
            setHost(await AsyncStorage.getItem('host'));
            setPort(await AsyncStorage.getItem('port'));
        } catch (error) {
            alert('Error retrieving data from storage:', error);
        }
    }

    const auth = (item, protocol, host, port) => {
        let itemToRemove = item.AD_WF_Activity_ID.id
        setIsLoading(true)
        Alert.alert(
            'Confirmation',
            'Are you sure you want to approved this transection?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => {
                        setIsLoading(false)
                    }
                },
                {
                    text: 'OK',
                    onPress: () => {
                        fetch(`${protocol}://${host}:${port}/api/v1/workflow/approve/${item.AD_WF_Activity_ID.id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: {
                                "message": "This is the end, my only friend"
                            }
                        }).then(() => {
                            const popArray = dumyArray.filter((item) => item.AD_WF_Activity_ID.id !== itemToRemove);
                            setDumyArray(popArray)
                            const total = popArray.reduce((accumulator, currentValue) => {
                                return accumulator + currentValue.TotalLines;

                            }, 0);
                            setAmount(total)
                            setIsLoading(false)
                        })
                    }
                }
            ]
        );
    }

    const reject = (item, protocol, host, port) => {
        let itemToRemove = item.AD_WF_Activity_ID.id
        setIsLoading(true)
        Alert.alert(
            'Confirmation',
            'Are you sure you want to approved this transection?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => {
                        setIsLoading(false)
                    }
                },
                {
                    text: 'OK',
                    onPress: () => {
                        fetch(`${protocol}://${host}:${port}/api/v1/workflow/reject/${item.AD_WF_Activity_ID.id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: {
                                "message": "This is the end, my only friend"
                            }
                        }).then(() => {
                            const popArray = dumyArray.filter((item) => item.AD_WF_Activity_ID.id !== itemToRemove);
                            setDumyArray(popArray)
                            const total = popArray.reduce((accumulator, currentValue) => {
                                return accumulator + currentValue.TotalLines;

                            }, 0);
                            setAmount(total)
                            setIsLoading(false)
                        })
                    }
                }
            ]
        );

    }

    const sumAmountFun = () => {
        const total = dumyArray.reduce((accumulator, currentValue) => {
            return accumulator + currentValue.TotalLines;
        }, 0);
        setAmount(total)
    }

    const authAll = async () => {
        setIsLoading(true)
        const protocol = await AsyncStorage.getItem('protocol')
        const host = await AsyncStorage.getItem('host')
        const port = await AsyncStorage.getItem('port')
        const token = await AsyncStorage.getItem('token')
        for (let i = 0; i < dumyArray.length; i++) {
            const itemToRemove = dumyArray[i].AD_WF_Activity_ID.id;
            await fetch(`${protocol}://${host}:${port}/api/v1/workflow/approve/${itemToRemove}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: 'This is the end, my only friend'
                })
            });
            // dumyArray.splice(i, 1)
        }
        setDumyArray([]);
        setAmount(0)
        setAuthAllModal(false)
        setIsLoading(false)
    }

    const filterArray = (txt, num) => {
        setSelectedButton(txt)
        if (num === 0) {
            setDumyArray(newArray)
            const total = dumyArray.reduce((accumulator, currentValue) => {
                return accumulator + currentValue.TotalLines;

            }, 0);
            setAmount(total)
            setModalFilter(false)
        } else if (num === 1000009) {
            const filterArray = newArray.filter(data => data.C_DocType_ID.id === num)
            const total = filterArray.reduce((accumulator, currentValue) => {
                return accumulator + currentValue.TotalLines;

            }, 0);
            setAmount(total)
            setDumyArray(filterArray)
            setModalFilter(false)
        } else {
            const filterArray = newArray.filter(data => data.C_DocType_ID.id === num)
            const total = filterArray.reduce((accumulator, currentValue) => {
                return accumulator + currentValue.TotalLines;

            }, 0);
            setAmount(total)
            setDumyArray(filterArray)
            setModalFilter(false)
        }
    }

    const getDetail = async (str, id, party) => {
        const protocol = await AsyncStorage.getItem('protocol')
        const host = await AsyncStorage.getItem('host')
        const port = await AsyncStorage.getItem('port')
        const token = await AsyncStorage.getItem('token')
        const url = `${protocol}://${host}:${port}/api/v1/models/${str}/${id}`
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        fetch(url, {
            method: 'GET',
            headers: headers
        })
            .then(response => response.json())
            .then(data => {
                if (str === 'C_Payment') {
                    let array = []
                    const dateObject = { "Date": data.DateTrx }
                    const partyObject = { "Party Name": data.C_BPartner_ID.identifier }
                    const amountObject = { "Amount": data.PayAmt }
                    const charge = { "Charge/Invoice No": 0 }
                    array.push(dateObject, partyObject, amountObject, charge)
                    navigation.navigate('PendingDetails', { array, str })
                    setIsLoading(false)
                } else if (str === 'M_RequisitionLine') {
                    let array = []
                    const srNo = { "SrNo": data.id }
                    const serviceCode = { "ServiceCode": data.M_Product_ID.id }
                    const serviceName = { "ServiceName": data.M_Product_ID.identifier }
                    const UOM = { "UOM": data.C_UOM_ID.identifier }
                    const QTY = { "QTY": data.Qty }
                    const rate = { "rate": data.PriceActual }
                    const AMTExcGST = { "AMTExcGST": data.Qty * data.PriceActual }
                    const GST = { "GST": 0 }
                    const AMTIncGST = { "AMTIncGST": (data.Qty * data.PriceActual) + 0 }
                    array.push(srNo, serviceCode, serviceName, UOM, QTY, rate, AMTExcGST, GST, AMTIncGST)
                    navigation.navigate('PendingDetails', { array, str })
                    setIsLoading(false)
                } else if (str === 'C_InvoiceLine') {
                    let array = []
                    const srNo = { "SrNo": data.id }
                    const serviceCode = { "ServiceCode": data.M_Product_ID.id }
                    const serviceName = { "ServiceName": data.M_Product_ID.identifier }
                    const UOM = { "UOM": data.C_UOM_ID.identifier }
                    const QTY = { "QTY": data.QtyInvoiced }
                    const rate = { "rate": data.PriceActual }
                    const AMTExcGST = { "AMTExcGST": data.QtyInvoiced * data.PriceActual }
                    const GST = { "GST": 0 }
                    const AMTIncGST = { "AMTIncGST": (data.QtyInvoiced * data.PriceActual) + 0 }
                    array.push(srNo, serviceCode, serviceName, UOM, QTY, rate, AMTExcGST, GST, AMTIncGST)
                    navigation.navigate('PendingDetails', { array, str })
                    setIsLoading(false)
                } else if (str === "C_OrderLine") {
                    let array = []
                    const srNo = { "SrNo": data.id }
                    const serviceCode = { "ServiceCode": data.M_Product_ID.id }
                    const serviceName = { "ServiceName": data.M_Product_ID.identifier }
                    const UOM = { "UOM": data.C_UOM_ID.identifier }
                    const QTY = { "QTY": data.QtyInvoiced }
                    const rate = { "rate": data.PriceActual }
                    const AMTExcGST = { "AMTExcGST": data.QtyInvoiced * data.PriceActual }
                    const GST = { "GST": 0 }
                    const AMTIncGST = { "AMTIncGST": (data.QtyInvoiced * data.PriceActual) + 0 }
                    array.push(srNo, serviceCode, serviceName, UOM, QTY, rate, AMTExcGST, GST, AMTIncGST)
                    navigation.navigate('PendingDetails', { array, str })
                    setIsLoading(false)
                } else {
                    console.log(str)
                    setIsLoading(false)
                }
                // navigation.navigate('PendingDetails', data)
                // Process the data as needed
            })
            .catch(error => {
                alert(error);
                setIsLoading(false)
                // Handle the error
            });
    }

    const pressDetail = (item) => {
        const parts = item.AD_Table_ID.identifier.split('_');
        if (parts.length > 2) {
            let partsData = (parts.slice(0, 2).join('_'))
            if (partsData === "C_Payment") {
                setIsLoading(true)
                getDetail(partsData, item.Record_ID, item.party_name,)
            } else {
                setIsLoading(true)
                getDetail(partsData + "Line", item.Record_ID)
            }
        } else {
            console.log(str)
        }
    }

    const getFilterCheck = async () => {
        const getItem = await AsyncStorage.getItem('filterCheck')
        console.log(getItem)
        if (getItem) {
            setFilterbtnCheck(getItem)
        }
    }

    useEffect(() => {
        sumAmountFun()
        getItemFromStorage()
        getFilterCheck()
        const backAction = () => {
            navigation.goBack()
            return true;
        };
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );
        return () => backHandler.remove();

    }, [])

    const Item = ({ AmountPrice, partyName, item, authHandler, rejectHandler, onPressDetails }) => (
        <View style={styles.container}>
            <View style={styles.item}>
                <View style={styles.cardContent}>
                    <View style={styles.partyCon}>
                        <Text style={{ ...styles.headingTxt, color: 'black' }}>Party</Text>
                        <Text style={styles.headingTxt}>{partyName}</Text>
                    </View>
                    <View style={styles.dateCon}>
                        <Text style={{ ...styles.headingTxt, color: 'black' }}>Amount</Text>
                        <Text style={styles.headingTxt}>{AmountPrice}</Text>
                    </View>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <View style={styles.btnCon}>
                        <TouchableOpacity style={styles.authorized} onPress={authHandler}>
                            <Text style={styles.authorizedTxt}>Authorized</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.reject} onPress={rejectHandler}>
                            <Text style={styles.rejectTxt}>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.details} onPress={onPressDetails}>
                            <Text style={styles.headingTxt}>Details</Text>
                            <Image style={styles.collapse} source={require('../../asserts/PendingPaymentAssets/Collapse.png')} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    )


    return (
        <>
            {isLoading &&
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color="#0050C0" />
                </View>}
            {!isLoading &&
                <View style={{ flex: 1, backgroundColor: 'white' }}>

                    <Modal visible={authAllModal} animationType="slide" transparent={true}>
                        <View style={styles.blurView}>
                            <View style={styles.modalView}>
                                <Text style={styles.heading}>
                                    Confirmation
                                </Text>
                                <View style={styles.confirmTxt}>
                                    <Text style={styles.confirm}>
                                        Are you sure you want to authorize all payments of amount {amount} Rs?
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end', width: '90%', marginTop: 15 }}>
                                    <TouchableOpacity style={{ marginRight: 40 }} onPress={() => setAuthAllModal(false)}>
                                        <Text style={styles.confirmBtn}>No</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ marginRight: 10 }} onPress={() => authAll()}>
                                        <Text style={styles.confirmBtn}>Yes</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>


                    <Modal visible={modalFilter} animationType="slide" transparent={true}>
                        <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                            <View style={styles.modalFilter}>
                                <View style={styles.topContent}>
                                    <Text style={styles.sortBy}>Filters</Text>
                                    <TouchableOpacity onPress={() => setModalFilter(false)}>
                                        <Image source={require('../../asserts/ApprovalAndDoucementAssets/close.png')} style={styles.crossImage} />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity style={styles.contentBtn} onPress={() => filterArray('None', 0)}>
                                    <Text style={styles.txtContent}>None</Text>
                                    {selectedButton === 'None' && <Image source={require('../../asserts/ApprovalAndDoucementAssets/tick.png')} style={styles.tickImage} />}
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.contentBtn} onPress={() => filterArray('Bank Receipt', 1000009)}>
                                    <Text style={styles.txtContent}>Bank Receipt</Text>
                                    {selectedButton === "Bank Receipt" && <Image source={require('../../asserts/ApprovalAndDoucementAssets/tick.png')} style={styles.tickImage} />}
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.contentBtn} onPress={() => filterArray('Cash Receipt', 1000050)}>
                                    <Text style={styles.txtContent}>Cash Receipt</Text>
                                    {selectedButton === "Cash Receipt" && <Image source={require('../../asserts/ApprovalAndDoucementAssets/tick.png')} style={styles.tickImage} />}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                    <View style={styles.header}>
                        <TouchableOpacity style={styles.headerBtnCon} onPress={() => navigation.goBack()}>
                            <Image
                                source={require('../../asserts/PendingPaymentAssets/arrow.png')}
                                style={styles.headerImage}
                            />
                        </TouchableOpacity>
                        <View style={styles.headerTxtCon}>
                            <Text style={styles.headertxt}>Pending Purchase Order</Text>
                        </View>
                    </View>


                    <View style={{ alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '90%' }}>
                            <View>
                                <Text style={styles.amounttxt}>Date: {moment(monthDate.date).format("D MMM YYYY")}</Text>
                                <Text style={styles.amounttxt}>Total Amount: {amount.toLocaleString('en-IN')} Rs</Text>
                                <Text style={styles.amounttxt}>Number of pending payments: {dumyArray.length}</Text>
                            </View>
                            {filterbtnCheck != null ? (
                                <TouchableOpacity
                                    style={{ flexDirection: "row", marginTop: 10, alignItems: 'center', height: "40%" }}
                                    onPress={() => setModalFilter(true)}
                                >
                                    <Image source={require('../../asserts/ApprovalAndDoucementAssets/filterbtn.png')} style={styles.filterImage} />
                                    <Text style={styles.filterTxt}>filters</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    </View>

                    <FlatList
                        data={dumyArray}
                        renderItem={({ item }) =>
                            <Item AmountPrice={item.TotalLines}
                                partyName={item.party_name}
                                authHandler={() => auth(item, protocol, host, port)}
                                rejectHandler={() => reject(item, protocol, host, port)}
                                onPressDetails={() =>
                                    pressDetail(item)
                                }
                            />
                        }
                        keyExtractor={item => item.AD_WF_Activity_ID.id}
                    />
                    <View style={{ height: '8%', width: '100%', alignItems: 'center', }}>
                        <TouchableOpacity
                            style={styles.authBtn}
                            onPress={() => setAuthAllModal(!authAllModal)}
                        >
                            <Text style={styles.authorizedTxt}>Authorized All</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            }
        </>
    )
}

export default ApprovalCardList

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#800000',
        width: width,
        height: height / 10,
        alignItems: 'center',
        // justifyContent: 'flex-end',
        flexDirection: 'row'
    },
    headertxt: {
        color: 'white',
        fontSize: 23,
        fontFamily: 'K2D-Regular'
    },
    headerTxtCon: {
        width: width / 1.3,
        alignItems: 'center'
    },
    headerImage: {
        height: height / 14,
        width: width / 7,
        marginTop: 18,
        marginLeft: 10
    },
    headerBtnCon: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerBtnFilterCon: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    amountCon: {
        width: width,
        height: height / 25,
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    amounttxt: {
        color: '#800000',
        fontSize: 15,
        fontFamily: 'K2D-ExtraBold'
    },
    container: {
        alignItems: 'center'
    },
    item: {
        backgroundColor: 'white',
        borderRadius: 10,
        elevation: 5,
        shadowColor: 'black',
        width: '90%',
        marginTop: 20,
        height: height / 6,
        marginBottom: 10,
        shadowOpacity: 0.5,
        shadowRadius: 20,
        shadowOffset: {
            width: 0,
            height: 30,
        }
    },
    headingTxt: {
        color: '#800000',
    },
    cardContent: {
        flexDirection: 'row',
    },
    dateCon: {
        width: '25%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    partyCon: {
        width: '65%',
        alignItems: 'center',
        justifyContent: 'center',
        height: height / 12
    },
    btnCon: {
        height: height / 20,
        width: '85%',
        flexDirection: 'row'
    },
    authorized: {
        backgroundColor: 'rgba(128, 0, 0, 0.4)',
        height: height / 20,
        width: '30%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        borderColor: '#800000',
        borderWidth: 1,
        marginRight: 15
    },
    authorizedTxt: {
        fontFamily: 'K2D-ExtraBold'
    },
    reject: {
        // backgroundColor: 'rgba(0, 0, 0, 0.7)',
        height: height / 20,
        width: '20%',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15
    },
    rejectTxt: {
        color: 'rgba(0, 0, 0, 0.7)',
        fontFamily: 'K2D-ExtraBold'
    },
    details: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '40%',
        justifyContent: 'flex-end'
    },
    collapse: {
        height: height / 28,
        width: width / 14
    },
    authBtn: {
        backgroundColor: 'rgba(128, 0, 0, 0.4)',
        height: height / 20,
        width: '40%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        borderColor: '#800000',
        borderWidth: 1,
        marginRight: 15
    },
    blurView: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalView: {
        backgroundColor: 'white',
        height: '23%',
        width: '90%',
        borderRadius: 10
    },
    heading: {
        color: "black",
        fontSize: 20,
        fontFamily: 'K2D-Bold',
        marginLeft: 10
    },
    confirmTxt: {
        width: '90%',
        marginLeft: 20,
        marginTop: 7
    },
    confirm: {
        color: 'black',
        fontSize: 16,
        fontFamily: 'K2D-Medium'
    },
    confirmBtn: {
        color: '#800000',
        fontSize: 16,
        fontFamily: 'K2D-Medium'
    },
    modalFilter: {
        backgroundColor: 'white',
        height: '25%',
        width: '100%',
        alignItems: "center",
        justifyContent: 'center',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    topContent: {
        flexDirection: 'row',
        width: '80%',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    crossImage: {
        height: 30,
        width: 30
    },
    sortBy: {
        fontSize: 20,
        fontFamily: 'K2D-Bold',
        color: 'black'
    },
    filterImage: {
        height: 20,
        width: 35,
        marginRight: 5
    },
    filterTxt: {
        color: '#800000',
        fontSize: 16,
        fontFamily: 'K2D-Bold'
    },
    contentBtn: {
        flexDirection: "row",
        width: '80%',
        justifyContent: "space-between",
        marginTop: 5
    },
    tickImage: {
        height: 30,
        width: 30
    },
    txtContent: {
        fontSize: 16,
        color: '#800000',
        fontFamily: 'K2D-Bold'
    }
})
