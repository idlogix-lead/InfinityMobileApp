
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import CustomHeader from '../../components/CustomHeader';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationComponent from '../../components/NotificationComponent/NotificationComponent';
import { FlatList } from 'react-native';

const NotificationSrn = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [notificationData, setNotificationData] = useState([]);
    console.log(notificationData.length, 'notificationData')
    const [unprocessedData, setUnprocessedData] = useState([]);
    console.log(unprocessedData.length, 'unprocessedData')
    const [showUnprocessed, setShowUnprocessed] = useState(false); // State to manage if UnRead is clicked


    // const notificationAllDataGet = async () => {
    //     const token = await AsyncStorage.getItem('token');
    //     const protocol = await AsyncStorage.getItem('protocol');
    //     const host = await AsyncStorage.getItem('host');
    //     const port = await AsyncStorage.getItem('port');
    //     const organizationId = await AsyncStorage.getItem('organizationId');
    //     console.log(organizationId, 'organizationId')
    //     const userId = await AsyncStorage.getItem("userId");
    //     console.log(userId, 'nsdihid')

    //     try {
    //         setIsLoading(true);
    //         // const URL = `${protocol}://${host}:${port}/api/v1/models/AD_Note?$filter=AD_User_ID eq ${userId} and AD_Org_ID eq ${organizationId}`;
    //         const URL = `${protocol}://${host}:${port}/api/v1/models/AD_Note?$filter=AD_User_ID eq ${userId}`;
    //         console.log(URL, 'URLForNotification');

    //         const response = await axios.get(URL, {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': token ? `Bearer ${token.trim()}` : '',
    //             },
    //         });

    //         // Sorting notifications based on Created date (latest first)
    //         const sortedData = response?.data?.records?.sort((a, b) => new Date(b.Created) - new Date(a.Created));

    //         setNotificationData(sortedData);

    //     } catch (error) {
    //         console.log(error, 'NotificationAPIGETAllData');
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };



    const notificationAllDataGet = async () => {
        const token = await AsyncStorage.getItem('token');
        const protocol = await AsyncStorage.getItem('protocol');
        const host = await AsyncStorage.getItem('host');
        const port = await AsyncStorage.getItem('port');
        const organizationId = await AsyncStorage.getItem('organizationId');
        console.log(organizationId, 'organizationId');
        const userId = await AsyncStorage.getItem("userId");
        console.log(userId, 'nsdihid');

        try {
            setIsLoading(true);
            // const URL = `${protocol}://${host}:${port}/api/v1/models/AD_Note?$filter=AD_User_ID eq ${userId} and AD_Org_ID eq ${organizationId}`;
            const URL = `${protocol}://${host}:${port}/api/v1/models/AD_Note?$filter=AD_User_ID eq ${userId}`;
            console.log(URL, 'URLForNotification');

            const response = await axios.get(URL, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token.trim()}` : '',
                },
            });

            // Sorting notifications based on Created date (latest first)
            const sortedData = response?.data?.records?.sort((a, b) => new Date(b.Created) - new Date(a.Created));

            // Filtering notifications with 'Processed' as false
            const unprocessedData = sortedData.filter(notification => notification.Processed === false);

            // Set the filtered and sorted data to state
            setNotificationData(sortedData);  // For all notifications

            // Optionally, store or use the unprocessed data in a separate state if needed
            setUnprocessedData(unprocessedData);  // Assuming you have setUnprocessedData state for unprocessed notifications

        } catch (error) {
            console.log(error, 'NotificationAPIGETAllData');
        } finally {
            setIsLoading(false);
        }
    };




    const markNotificationsAsRead = async () => {
        // const token = await AsyncStorage.getItem('token');
        const protocol = await AsyncStorage.getItem('protocol');
        const host = await AsyncStorage.getItem('host');
        const port = await AsyncStorage.getItem('port');
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            console.log("No token found!");
            return;
        }

        try {
            const unreadNotifications = notificationData.filter((item) => !item.Processed);

            if (unreadNotifications.length > 0) {
                const updatePromises = unreadNotifications.map((notification) => {
                    const updateURL = `${protocol}://${host}:${port}/api/v1/models/AD_Note/${notification.id}`;
                    console.log(updateURL, 'BackHomeScreenNotification')

                    return axios.put(updateURL,
                        { "Processed": true },
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': token ? `Bearer ${token.trim()}` : '',
                            },
                        }
                    );
                });

                await Promise.all(updatePromises);
                console.log('All notifications marked as read');

                // Refresh notification list
                notificationAllDataGet();
            }
        } catch (error) {
            console.log(error, 'Error updating notifications');
            console.log('bell Icon Press')
        }
    };


    // Singla notification click un_read
    const markSingleNotificationAsRead = async (notificationId) => {
        const protocol = await AsyncStorage.getItem('protocol');
        const host = await AsyncStorage.getItem('host');
        const port = await AsyncStorage.getItem('port');
        const token = await AsyncStorage.getItem('token');

        if (!token) {
            console.log("No token found!");
            return;
        }

        try {
            const updateURL = `${protocol}://${host}:${port}/api/v1/models/AD_Note/${notificationId}`;
            console.log(updateURL, 'Single Notification Read');

            await axios.put(updateURL,
                { "Processed": true },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token.trim()}` : '',
                    },
                }
            );

            console.log(`Notification ${notificationId} marked as read.`);

            // Refresh notification list (optional, or manually update in local state)
            notificationAllDataGet();

        } catch (error) {
            console.log(error, 'Error updating single notification');
        }
    };


    useEffect(() => {
        notificationAllDataGet();
    }, []);

    return (


        <View style={styles.container}>
            <CustomHeader
                title='Notification'
                RightIcon={'bell'}
                RightPress={() => { markNotificationsAsRead() }}
            />

            <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", width: "98%" }}>
                

            <View style={{ flexDirection: "row" }}>
                {/* View All Button */}
                <TouchableOpacity
                    style={[
                        styles.unreadButton,
                        {
                            borderWidth: showUnprocessed ? 0 : 1.1,
                            borderColor: showUnprocessed ? 'transparent' : 'black',
                            borderRadius: 10,
                        },
                    ]}
                    onPress={() => setShowUnprocessed(false)}
                >
                    <Text style={styles.buttonText}>View All</Text>
                    <View style={[styles.unreadIndicator, { justifyContent: "center", alignItems: "center" }]}>
                        <Text style={{ fontSize: 8, color: "white" }}>{notificationData.length}</Text>
                    </View>
                </TouchableOpacity>

                {/* UnRead Button */}
                <TouchableOpacity
                    style={[
                        styles.unreadButton,
                        {
                            borderWidth: showUnprocessed ? 1.1 : 0,
                            borderColor: showUnprocessed ? 'black' : 'transparent',
                            borderRadius: 10,
                        },
                    ]}
                    onPress={() => setShowUnprocessed(true)}
                >
                    <Text style={styles.buttonText}>UnRead</Text>
                    <View style={[styles.unreadIndicator, { justifyContent: "center", alignItems: "center" }]}>
                        <Text style={{ fontSize: 8, color: "white" }}>{unprocessedData.length}</Text>
                    </View>
                </TouchableOpacity>
            </View>


            {/* Mark all as read */}
            <TouchableOpacity
                style={{
                    // justifyContent: "center"
                    // alignItems: "center",
                    // backgroundColor:"yellow"

                }}
                onPress={() => { markNotificationsAsRead() }}
            >
                <Text style={{ color: '#00B0F0', fontWeight: "500", fontSize: 16 }}>Mark all as read</Text>
            </TouchableOpacity>
        </View>

            {/* Notifications list */ }
    {
        isLoading ? (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text>Loading Notifications...</Text>
            </View>
        ) : showUnprocessed && unprocessedData.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 20 }}>
                <Text style={{ fontSize: 16, color: 'gray' }}>No unread notifications</Text>
            </View>
        ) : (
            <FlatList
                data={showUnprocessed ? unprocessedData : notificationData}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <NotificationComponent
                        created={item.Created}
                        reference={item.Reference}
                        textMsg={item.TextMsg}
                        backgroundColor={item.Processed ? 'white' : '#D3D3D3'}
                        NotificationOnPress={() => markSingleNotificationAsRead(item.id)}
                    />
                )}
            />
        )
    }
        </View >





    );
};

export default NotificationSrn;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unreadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0', // Light gray background
        padding: 5,
        borderRadius: 20,
        margin: 5,
        width: "32%"
    },
    buttonText: {
        color: '#333', // Dark text
        marginRight: 8,
    },
    unreadIndicator: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#00B0F0',
    },
});
