import { StyleSheet, Text, View, BackHandler, ActivityIndicator, FlatList, Modal, TouchableOpacity, Pressable } from 'react-native'
import React, { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChartCards from '../../components/RequestScreenComponents/ChartCards';
import moment from 'moment';


const Subordinates = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState([])
    const [recordLengths, setRecordLengths] = useState([]);
    const [currMonth, setCurrMonth] = useState([])
    const [prevMonth, setPrevMonth] = useState([])
    const [fCloseCurrMonth, setFCloseCurrMonth] = useState([])
    const tempResultPre = [];
    let tempResultCurr = []
    const [chartData, setChartData] = useState(false)
    const [fCloseCurrMonthModal, setFCloseCurrMonthModal] = useState(0)
    const [currMonthModal, setCurrMonthModal] = useState(0)

    const getAPIData = async () => {
        setIsLoading(true)
        const token = await AsyncStorage.getItem('token')
        const protocol = await AsyncStorage.getItem('protocol')
        const host = await AsyncStorage.getItem('host')
        const port = await AsyncStorage.getItem('port')
        const userId = await AsyncStorage.getItem('userId')
        let idArray = []
        fetch(`${protocol}://${host}:${port}/api/v1/models/AD_User?$filter=Supervisor_ID eq ${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {

                // |My Subordinate Tasks                
                // for (let i = 0; i < data.records.length; i++) {
                //     idArray.push(data.records[i].id)
                // }

                //|My own Tasks
                 idArray.push(userId)
                const endCard = { uid: userId, Name: 'My Task', id: parseInt(userId) }
                setData([endCard])
                fetchBasedOnId(idArray, endCard, protocol, host, port, userId, token)
               

            })
            .catch(error => {
                alert(error)
                setIsLoading(false)
            });
        setIsLoading(false)
    }
    const fetchBasedOnId = async (idArray, endCard, protocol, host, port, userId, token) => {
        
        idArray = [userId];
        // idArray.push(endCard.id)
        // AND CreatedBy eq ${userId}
        const promises = idArray.map(id =>
            fetch(`${protocol}://${host}:${port}/api/v1/models/R_Request?$filter=SalesRep_ID eq ${id} `, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => response.json())
                .catch(error => {
                    console.error(error);
                    // return [];
                })
        );
        Promise.all(promises).then(results => {
            const concatAll = results.reduce((acc, curr) => {
                return [...acc, ...curr.records];
            }, []);
            // const filterRecords = concatAll.filter(item => item.R_Status_ID.id !== 1000003);
            let tempResult = [];
        idArray.forEach(id => {
            const count = concatAll.length; // Total count for your tasks
            tempResult.push(count);
        });
        setRecordLengths(tempResult);

        fetchMonth(concatAll, idArray);
    });
    }

    const fetchMonth = async (concatAll, idArray) => {
        const lastDayOfPreviousMonth = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
        const firstDayOfCurrMonth = moment().subtract('months').startOf('month').format('YYYY-MM-DD');
        const lastDayOfCurrMonth = moment().subtract('months').endOf('month').format('YYYY-MM-DD');
    
        let tempResultPre = [];
        idArray.forEach(id => {
            const count = concatAll.filter(item => {
                return item.StartTime?.slice(0, 10) <= lastDayOfPreviousMonth;
            }).length; // Previous Month count for your tasks
            tempResultPre.push(count);
        });
        setPrevMonth(tempResultPre);
    
        let tempResultCurr = [];
        idArray.forEach(id => {
            const count = concatAll.filter(item => {
                return item.StartTime?.slice(0, 10) >= firstDayOfCurrMonth && item.StartTime?.slice(0, 10) <= lastDayOfCurrMonth;
            }).length; // Current Month count for your tasks
            tempResultCurr.push(count);
        });
        setCurrMonth(tempResultCurr);
    
        let fCloseCurr = [];
        idArray.forEach(id => {
            const count = concatAll.filter(item => {
                return item.R_Status_ID.id === 1000003 &&
                    item.StartTime?.slice(0, 10) >= firstDayOfCurrMonth && item.StartTime?.slice(0, 10) <= lastDayOfCurrMonth;
            }).length; // Final Close of Current Month count for your tasks
            fCloseCurr.push(count);
        });
        setFCloseCurrMonth(fCloseCurr);
    
        setIsLoading(false);
    }

    // const fetchMonth = async (concatAll, idArray) => {
    //     const lastDayOfPreviousMonth = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
    //     const firstDayOfCurrMonth = moment().subtract('months').startOf('month').format('YYYY-MM-DD');
    //     const lastDayOfCurrMonth = moment().subtract('months').endOf('month').format('YYYY-MM-DD');

    //     idArray.forEach((id) => {
    //         const count = concatAll.filter((item) => {
    //             return item.SalesRep_ID.id === id &&
    //                 item.StartTime?.slice(0, 10) <= lastDayOfPreviousMonth;
    //         }).length;
    //         tempResultPre.push(count)
    //     });

    //     setPrevMonth(tempResultPre)

    //     idArray.forEach((id) => {
    //         const count = concatAll.filter((item) => {
    //             return item.SalesRep_ID.id === id &&
    //                 item.StartTime?.slice(0, 10) >= firstDayOfCurrMonth &&
    //                 item.StartTime?.slice(0, 10) <= lastDayOfCurrMonth;
    //         }).length;
    //         tempResultCurr.push(count)
    //     });

    //     let fCloseCurr = []
    //     idArray.forEach((id) => {
    //         const count = concatAll.filter((item) => {
    //             return item.SalesRep_ID.id === id &&
    //                 item.R_Status_ID.id === 1000003 &&
    //                 item.StartTime?.slice(0, 10) >= firstDayOfCurrMonth &&
    //                 item.StartTime?.slice(0, 10) <= lastDayOfCurrMonth;
    //         }).length;
    //         fCloseCurr.push(count)
    //     })

    //     setFCloseCurrMonth(fCloseCurr)
    //     setCurrMonth(tempResultCurr)
    //     setIsLoading(false)
    // }
    const navigateBack = () => {
        const unsubscribe = navigation.addListener('focus', () => {
            getAPIData()
        });
        return unsubscribe;
    }

    const totalPress = async (id) => {
        await AsyncStorage.setItem('idClient', id.toString()).then(async () => {
            await AsyncStorage.removeItem('txtPrev').then(async () => {
                await AsyncStorage.removeItem('txtCurr').then(() => {
                    navigation.navigate('RequestList')
                })
            })
        })
    }

    const getPrevMonth = async (id, txt) => {
        await AsyncStorage.setItem('idClient', id.toString()).then(async () => {
            await AsyncStorage.setItem('txtPrev', txt).then(async () => {
                await AsyncStorage.removeItem('txtCurr').then(() => {
                    navigation.navigate('RequestList')
                })
            })
        })
    }

    const getCurrMonth = async (id, txt) => {
        await AsyncStorage.setItem('idClient', id.toString()).then(async () => {
            await AsyncStorage.setItem('txtCurr', txt).then(async () => {
                await AsyncStorage.removeItem('txtPrev').then(async () => {
                    navigation.navigate('RequestList')
                })
            })
        })
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

    const chartModal = (id) => {
        setFCloseCurrMonthModal(fCloseCurrMonth[id])
        setCurrMonthModal(currMonth[id])
        setChartData(true)
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
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={chartData}
                        onRequestClose={() => setChartData(false)}
                    >
                        <Pressable style={styles.modalContainer} onPress={() => setChartData(false)}>
                            <View style={styles.modalView}>
                                <Text style={styles.modalTxt}>Final close of current month = {fCloseCurrMonthModal}</Text>
                                <Text style={styles.modalTxt}>Task assign in current month = {currMonthModal}</Text>

                            </View>
                        </Pressable>
                    </Modal>
                    <FlatList
                        data={data}
                        renderItem={({ item }) => <ChartCards
                            name={item.Name}
                            firstTop="Total"
                            secTop="Previous"
                            thirdTop="Current Month"
                            total={recordLengths[data.indexOf(item)]}
                            comp={prevMonth[data.indexOf(item)]}
                            unComp={currMonth[data.indexOf(item)]}
                            onPressFirst={() => totalPress(item.id)}
                            onPressSecond={() => getPrevMonth(item.id, 'prev')}
                            onPressThird={() => getCurrMonth(item.id, 'curr')}
                            percentageNum={fCloseCurrMonth[data.indexOf(item)] / currMonth[data.indexOf(item)]}
                            pressChart={() => chartModal(data.indexOf(item))}
                        />}
                    />
                </View>
            )}
        </>
    )
}

export default Subordinates

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: 'rgba(38, 70, 83, 0.5)',
        flex: 1,
        alignItems: 'center',
        justifyContent: "center"
    },
    modalView: {
        backgroundColor: '#B44357',
        height: '22%',
        width: '85%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10
    },
    modalTxt: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'K2D-Regular'
    }
})