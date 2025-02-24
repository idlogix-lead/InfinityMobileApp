import {
    StyleSheet, Text, View, BackHandler, ActivityIndicator, Image, Dimensions, FlatList, Pressable
} from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import TopHeader from '../../components/RequestScreenComponents/TopHeader';

const { height, width } = Dimensions.get('window');

const RequestScreen = ({ navigation, route }) => {

    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState([])
    const [recordLengths, setRecordLengths] = useState([]);
    const [itemForCom, setItemForCom] = useState([])
    let token


    const getAPIData = async () => {
        setIsLoading(true)
        token = await AsyncStorage.getItem('token')
        const protocol = await AsyncStorage.getItem('protocol')
        const host = await AsyncStorage.getItem('host')
        const port = await AsyncStorage.getItem('port')
        const userId = await AsyncStorage.getItem('userId')
        let idArray = []
        let lengths
        let newArray = []
        fetch(`${protocol}://${host}:${port}/api/v1/models/AD_User?$filter=Supervisor_ID eq ${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(async (data) => {
                for (let i = 0; i < data.records.length; i++) {
                    idArray.push(data.records[i].id)
                }
                const endCard = { uid: userId, Name: 'My Task', id: parseInt(userId) };
                setData([...data.records, endCard]);
                const promises = idArray.map(id =>
                    fetch(`${protocol}://${host}:${port}/api/v1/models/R_Request?$filter=SalesRep_ID eq ${id} AND CreatedBy eq ${userId}`, {
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
                    lengths = results.map(result => result.records.length);
                }).then(() => {
                    fetch(`${protocol}://${host}:${port}/api/v1/models/R_Request?$filter=SalesRep_ID eq ${userId} AND CreatedBy eq ${userId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    })
                        .then(response => response.json())
                        .then(async (data) => {
                            let records = data.records.length
                            lengths.push(records)
                            let dummyArray = [...idArray, data.records[0].SalesRep_ID.id]
                            const apiCallPromises = dummyArray.map(id => {
                                return fetch(`${protocol}://${host}:${port}/api/v1/models/R_Request?$filter=SalesRep_ID eq ${id} AND CreatedBy eq ${userId}`, {
                                    method: 'GET',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                    }
                                })
                                    .then(response => response.json())
                                    .then(data => {
                                        // Return the data for the current ID
                                        let records = data.records
                                        const filterRecords = records.filter(item => item.R_Status_ID.id !== 1000003);
                                        return filterRecords.length;
                                    })
                                    .catch(error => {
                                        console.error(error);
                                    });
                            });

                            // Use Promise.all() to wait for all Promises to resolve
                            Promise.all(apiCallPromises)
                                .then(results => {
                                    setRecordLengths(results); // Output: An array of the data for each ID
                                    setIsLoading(false)
                                })
                                .catch(error => {
                                    alert(error);
                                    setIsLoading(false)
                                });

                        })
                        .catch(error => {
                            console.error(error);
                            // return [];
                        })
                });
            })
            .catch(error => {
                alert(error)
                setIsLoading(false)
            });
    }


    const navigateBack = () => {
        const unsubscribe = navigation.addListener('focus', () => {
            getAPIData()
        });
        return unsubscribe;
    }

    const handlePress = async (id) => {
        await AsyncStorage.setItem('idClient', id.toString()).then(() => {
            navigation.navigate('RequestList')
        })
    }

    const Item = ({ name, id, count }) => (
        <Pressable style={styles.itemCon} onPress={() => handlePress(id)}>
            <View style={styles.item}>
                <View style={styles.countCon}>
                    <Text style={styles.itemName}>{count}</Text>
                </View>
                <Image source={require('../../asserts/RequestAsserts/User.png')} style={styles.itemImage} />
                <Text style={styles.itemName}>{name}</Text>
            </View>
        </Pressable>
    );

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
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
                    <ActivityIndicator size="large" color="#0050C0" />
                </View>
            )}
            {!isLoading && (
                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    {/* top header */}
                    <TopHeader txt='User' onPress={() => navigation.goBack()} />

                    {/* list */}
                    <FlatList
                        data={data}
                        renderItem={({ item }) => <Item name={item.Name} id={item.id} count={recordLengths[data.indexOf(item)]} />}
                        keyExtractor={(item) => item.uid}
                        numColumns={2}
                        contentContainerStyle={styles.flatList}
                    />
                </View>
            )}
        </>
    )
}

export default RequestScreen

const styles = StyleSheet.create({
    headerCont: {
        width: width,
        backgroundColor: '#800000',
        height: '12%',
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 15
    },
    backArrow: {
        height: height / 15,
        width: width / 7.5,
        marginLeft: 20,
    },
    user: {
        color: 'white',
        fontSize: 24,
        fontFamily: 'K2D-Regular',
        bottom: 12,
        marginLeft: 15,
    },
    item: {
        backgroundColor: 'white',
        height: height / 5,
        width: width / 2.5,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        elevation: 10
    },
    itemCon: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '50%',
        marginTop: 15,
        marginBottom: 15
    },
    itemImage: {
        height: height / 16,
        width: width / 8
    },
    itemName: {
        color: 'black',
        fontSize: 15,
        fontFamily: 'K2D-Regular',
        marginTop: 10
    },
    countCon: {
        alignItems: 'flex-end',
        width: '85%',
        bottom: 15,
    }
})