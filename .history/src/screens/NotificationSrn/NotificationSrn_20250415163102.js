// import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
// import React, { useEffect, useRef, useState } from 'react';
// import CustomHeader from '../../components/CustomHeader';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import NotificationComponent from '../../components/NotificationComponent/NotificationComponent';
// import { FlatList } from 'react-native';

// const NotificationSrn = () => {
//     const [isLoading, setIsLoading] = useState(false);
//     const [notificationData, setNotificationData] = useState([]);
//     console.log(notificationData.length, 'NotificationDataLength')
//     const [unprocessedData, setUnprocessedData] = useState([]);
//     console.log(unprocessedData.length, 'unprocessedDataLength')
//     const [showUnprocessed, setShowUnprocessed] = useState(false);
//     const [currentPage, setCurrentPage] = useState(0)

//     const flatListRef = useRef(null);

//     // const notificationAllDataGet = async () => {
//     //     const token = await AsyncStorage.getItem('token');
//     //     const protocol = await AsyncStorage.getItem('protocol');
//     //     const host = await AsyncStorage.getItem('host');
//     //     const port = await AsyncStorage.getItem('port');
//     //     const organizationId = await AsyncStorage.getItem('organizationId');
//     //     console.log(organizationId, 'organizationId')
//     //     const userId = await AsyncStorage.getItem("userId");
//     //     console.log(userId, 'nsdihid')

//     //     try {
//     //         setIsLoading(true);
//     //         // const URL = `${protocol}://${host}:${port}/api/v1/models/AD_Note?$filter=AD_User_ID eq ${userId} and AD_Org_ID eq ${organizationId}`;
//     //         const URL = `${protocol}://${host}:${port}/api/v1/models/AD_Note?$filter=AD_User_ID eq ${userId}`;
//     //         console.log(URL, 'URLForNotification');

//     //         const response = await axios.get(URL, {
//     //             headers: {
//     //                 'Content-Type': 'application/json',
//     //                 'Authorization': token ? `Bearer ${token.trim()}` : '',
//     //             },
//     //         });

//     //         // Sorting notifications based on Created date (latest first)
//     //         const sortedData = response?.data?.records?.sort((a, b) => new Date(b.Created) - new Date(a.Created));

//     //         setNotificationData(sortedData);

//     //     } catch (error) {
//     //         console.log(error, 'NotificationAPIGETAllData');
//     //     } finally {
//     //         setIsLoading(false);
//     //     }
//     // };

//     // const notificationAllDataGet = async () => {
//     //     const token = await AsyncStorage.getItem('token');
//     //     const protocol = await AsyncStorage.getItem('protocol');
//     //     const host = await AsyncStorage.getItem('host');
//     //     const port = await AsyncStorage.getItem('port');
//     //     const organizationId = await AsyncStorage.getItem('organizationId');
//     //     // console.log(organizationId, 'organizationId');organizationId
//     //     const userId = await AsyncStorage.getItem("userId");
//     //     // console.log(userId, 'nsdihid');

//     //     try {
//     //         setIsLoading(true);
//     //         // const URL = `${protocol}://${host}:${port}/api/v1/models/AD_Note?$filter=AD_User_ID eq ${userId} and AD_Org_ID eq ${organizationId}`;
//     //         // const URL = `${protocol}://${host}:${port}/api/v1/models/AD_Note?$filter=AD_User_ID eq ${userId}`;
//     //         const nextPage = currentPage + 1;
//     //         console.log(nextPage, 'PaginationPage')
//     //         const URL = `${protocol}://${host}:${port}/api/v1/models/AD_Note?$top=100&$skip=${nextPage}&$filter=AD_User_ID eq ${userId}`;
//     //         // console.log(URL, 'URLForNotification');

//     //         const response = await axios.get(URL, {
//     //             headers: {
//     //                 'Content-Type': 'application/json',
//     //                 'Authorization': token ? `Bearer ${token.trim()}` : '',
//     //             },
//     //         });

//     //         // Sorting notifications based on Created date (latest first)
//     //         const sortedData = response?.data?.records?.sort((a, b) => new Date(b.Created) - new Date(a.Created));
//     //         // console.log(sortedData, 'jefbvi')

//     //         // Filtering notifications with 'Processed' as false
//     //         const unprocessedData = sortedData.filter(notification => notification.Processed === false);

//     //         // Set the filtered and sorted data to state
//     //         setIsLoading(false)
//     //         // setNotificationData([...sortedData, ...sortedData]);
//     //         setNotificationData(prevData => [...prevData, ...sortedData]);
//     //         setCurrentPage(nextPage)

//     //         // Optionally, store or use the unprocessed data in a separate state if needed
//     //         setUnprocessedData(unprocessedData);  // Assuming you have setUnprocessedData state for unprocessed notifications

//     //     } catch (error) {

//     //         console.log(error, 'NotificationAPIGETAllData');
//     //         setIsLoading(false)
//     //     } finally {
//     //         setIsLoading(false);
//     //     }
//     // };

//     const notificationAllDataGet = async () => {
//         if (isLoading) return;

//         const token = await AsyncStorage.getItem('token');
//         const protocol = await AsyncStorage.getItem('protocol');
//         const host = await AsyncStorage.getItem('host');
//         const port = await AsyncStorage.getItem('port');
//         const userId = await AsyncStorage.getItem("userId");

//         try {
//             setIsLoading(true);

//             const pageSize = 100;
//             const skip = currentPage * pageSize;

//             const URL = `${protocol}://${host}:${port}/api/v1/models/AD_Note?$top=${pageSize}&$skip=${skip}&$filter=AD_User_ID eq ${userId}`;

//             const response = await axios.get(URL, {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': token ? `Bearer ${token.trim()}` : '',
//                 },
//             });

//             const records = response?.data?.records ?? [];

//             // Return early if no more data
//             if (records.length === 0) {
//                 return;
//             }

//             const sortedData = records.sort((a, b) => new Date(b.Created) - new Date(a.Created));
//             const unprocessedDataChunk = sortedData.filter(notification => notification.Processed === false);

//             // Append new data without causing re-render of the whole list
//             setNotificationData(prevData => [...prevData, ...sortedData]);
//             setUnprocessedData(prevData => [...prevData, ...unprocessedDataChunk]);

//             setCurrentPage(prevPage => prevPage + 1);

//         } catch (error) {
//             console.log(error, 'NotificationAPIGETAllData');
//         } finally {
//             setIsLoading(false);
//         }
//     }

//     const markNotificationsAsRead = async () => {
//         // const token = await AsyncStorage.getItem('token');
//         const protocol = await AsyncStorage.getItem('protocol');
//         const host = await AsyncStorage.getItem('host');
//         const port = await AsyncStorage.getItem('port');
//         const token = await AsyncStorage.getItem('token');
//         if (!token) {
//             console.log("No token found!");
//             return;
//         }

//         try {
//             const unreadNotifications = notificationData.filter((item) => !item.Processed);

//             if (unreadNotifications.length > 0) {
//                 const updatePromises = unreadNotifications.map((notification) => {
//                     const updateURL = `${protocol}://${host}:${port}/api/v1/models/AD_Note/${notification.id}`;
//                     console.log(updateURL, 'BackHomeScreenNotification')

//                     return axios.put(updateURL,
//                         { "Processed": true },
//                         {
//                             headers: {
//                                 'Content-Type': 'application/json',
//                                 'Authorization': token ? `Bearer ${token.trim()}` : '',
//                             },
//                         }
//                     );
//                 });

//                 await Promise.all(updatePromises);
//                 console.log('All notifications marked as read');

//                 // Refresh notification list
//                 notificationAllDataGet();
//             }
//         } catch (error) {
//             console.log(error, 'Error updating notifications');
//             console.log('bell Icon Press')
//         }
//     };

//     // Singla notification click un_read
//     const markSingleNotificationAsRead = async (notificationId) => {
//         const protocol = await AsyncStorage.getItem('protocol');
//         const host = await AsyncStorage.getItem('host');
//         const port = await AsyncStorage.getItem('port');
//         const token = await AsyncStorage.getItem('token');

//         if (!token) {
//             console.log("No token found!");
//             return;
//         }

//         try {
//             const updateURL = `${protocol}://${host}:${port}/api/v1/models/AD_Note/${notificationId}`;
//             console.log(updateURL, 'Single Notification Read');

//             await axios.put(updateURL,
//                 { "Processed": true },
//                 {
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': token ? `Bearer ${token.trim()}` : '',
//                     },
//                 }
//             );

//             console.log(`Notification ${notificationId} marked as read.`);

//             // Refresh notification list (optional, or manually update in local state)
//             notificationAllDataGet();

//         } catch (error) {
//             console.log(error, 'Error updating single notification');
//         }
//     };

//     useEffect(() => {
//         notificationAllDataGet();
//     }, []);

//     return (

//         <View style={styles.container}>
//             <CustomHeader
//                 title='Notification'
//                 RightIcon={'bell'}
//                 RightPress={() => { markNotificationsAsRead() }}
//             />

//             <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", width: "98%" }}>

//                 <View style={{ flexDirection: "row" }}>
//                     {/* View All Button */}
//                     <TouchableOpacity
//                         style={[
//                             styles.unreadButton,
//                             {
//                                 borderWidth: showUnprocessed ? 0 : 1.1,
//                                 borderColor: showUnprocessed ? 'transparent' : 'black',
//                                 borderRadius: 10,
//                             },
//                         ]}
//                         onPress={() => setShowUnprocessed(false)}
//                     >
//                         <Text style={styles.buttonText}>View all</Text>
//                         <View style={[styles.unreadIndicator, { justifyContent: "center", alignItems: "center" }]}>
//                             <Text style={{ fontSize: 8, color: "white" }}>{notificationData.length}</Text>
//                         </View>
//                     </TouchableOpacity>

//                     {/* UnRead Button */}
//                     <TouchableOpacity
//                         style={[
//                             styles.unreadButton,
//                             {
//                                 borderWidth: showUnprocessed ? 1.1 : 0,
//                                 borderColor: showUnprocessed ? 'black' : 'transparent',
//                                 borderRadius: 10,
//                             },
//                         ]}
//                         onPress={() => setShowUnprocessed(true)}
//                     >
//                         <Text style={styles.buttonText}>Unread</Text>
//                         <View style={[styles.unreadIndicator, { justifyContent: "center", alignItems: "center" }]}>
//                             <Text style={{ fontSize: 8, color: "white" }}>{unprocessedData.length}</Text>
//                         </View>
//                     </TouchableOpacity>
//                 </View>

//                 {/* Mark all as read */}
//                 <TouchableOpacity
//                     style={{
//                         // justifyContent: "center"
//                         // alignItems: "center",
//                         // backgroundColor:"yellow"

//                     }}
//                     onPress={() => { markNotificationsAsRead() }}
//                 >
//                     <Text style={{ color: '#00B0F0', fontWeight: "500", fontSize: 16 }}>Mark all as read</Text>
//                 </TouchableOpacity>
//             </View>

//             {/* Notifications list */}
//             {
//                 isLoading ? (
//                     <View style={styles.loaderContainer}>
//                         <ActivityIndicator size="large" color="#007bff" />
//                         <Text>Loading Notifications...</Text>
//                     </View>
//                 ) : showUnprocessed && unprocessedData.length === 0 ? (
//                     <View style={{ alignItems: 'center', marginTop: 20 }}>
//                         <Text style={{ fontSize: 16, color: 'gray' }}>No unread notifications</Text>
//                     </View>
//                 ) : (
//                     // <FlatList
//                     //     data={showUnprocessed ? unprocessedData : notificationData}
//                     //     keyExtractor={(item) => item.id.toString()}
//                     //     renderItem={({ item }) => (
//                     //         <NotificationComponent
//                     //             created={item.Created}
//                     //             reference={item.Reference}
//                     //             textMsg={item.TextMsg}
//                     //             backgroundColor={item.Processed ? 'white' : '#D3D3D3'}
//                     //             NotificationOnPress={() => markSingleNotificationAsRead(item.id)}
//                     //             onEndReached={notificationAllDataGet}
//                     //             onEndReachedThreshold={.1}
//                     //             ListFooterComponent= {
//                     //                 <View style={{width:"90%", height:60, justifyContent:"center", alignItems:"center"}}>
//                     //                   {isLoading &&   <ActivityIndicator size={'large'} /> }

//                     //                 </View>
//                     //             }

//                     //         />
//                     //     )}
//                     // />

//                     <FlatList
//                         ref={flatListRef}  // Assign ref to FlatList
//                         data={showUnprocessed ? unprocessedData : notificationData}
//                         keyExtractor={(item, index) => `${item.id}-${index}`}
//                         renderItem={({ item }) => (
//                             <NotificationComponent
//                                 created={item.Created}
//                                 reference={item.Reference}
//                                 textMsg={item.TextMsg}
//                                 backgroundColor={item.Processed ? 'white' : '#D3D3D3'}
//                             />
//                         )}
//                         ItemSeparatorComponent={() => <View style={{ height: 5 }} />}
//                         onEndReached={() => {
//                             if (!isLoading) {
//                                 notificationAllDataGet();
//                             }
//                         }}
//                         onEndReachedThreshold={0.5}
//                         maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
//                         ListFooterComponent={() => (
//                             isLoading ? (
//                                 <View style={{ width: "90%", height: 60, justifyContent: "center", alignItems: "center" }}>
//                                     <ActivityIndicator size={'large'} />
//                                 </View>
//                             ) : null
//                         )}
//                         removeClippedSubviews={true}
//                         initialNumToRender={100}
//                         maxToRenderPerBatch={100}
//                         windowSize={100}
//                         // This prevents FlatList from resetting scroll position on pagination
//                         extraData={notificationData}
//                     />

//                 )
//             }
//         </View >

//     );
// };

// export default NotificationSrn;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#fff',
//     },
//     loaderContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     unreadButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: '#f0f0f0', // Light gray background
//         padding: 5,
//         borderRadius: 20,
//         margin: 5,
//         width: "32%"
//     },
//     buttonText: {
//         color: '#333', // Dark text
//         marginRight: 8,
//     },
//     unreadIndicator: {
//         width: 20,
//         height: 20,
//         borderRadius: 10,
//         backgroundColor: '#00B0F0',
//     },
// });

import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import CustomHeader from '../../components/CustomHeader';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationComponent from '../../components/NotificationComponent/NotificationComponent';
import {FlatList} from 'react-native';

const NotificationSrn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [notificationData, setNotificationData] = useState([]);
  const [unprocessedData, setUnprocessedData] = useState([]);
  const [showUnprocessed, setShowUnprocessed] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true);

  const flatListRef = useRef(null);

  const notificationAllDataGet = async () => {
    if (isLoading || !hasMoreData) return;

    const token = await AsyncStorage.getItem('token');
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const userId = await AsyncStorage.getItem('userId');

    try {
      setIsLoading(true);

      const pageSize = 100;
      const skip = currentPage * pageSize;

      const URL = `${protocol}://${host}:${port}/api/v1/models/AD_Note?$top=${pageSize}&$skip=${skip}&$filter=AD_User_ID eq ${userId}`;

      const response = await axios.get(URL, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token.trim()}` : '',
        },
      });

      const records = response?.data?.records ?? [];

      // If no records returned, we've reached the end
      if (records.length === 0) {
        setHasMoreData(false);
        return;
      }

      const sortedData = records.sort(
        (a, b) => new Date(b.Created) - new Date(a.Created),
      );
      const unprocessedDataChunk = sortedData.filter(
        notification => notification.Processed === false,
      );

      // Use functional updates to avoid dependency on current state
      setNotificationData(prevData => {
        // Combine and deduplicate data
        const combined = [...prevData, ...sortedData];
        const uniqueIds = new Set();
        return combined.filter(item => {
          if (!uniqueIds.has(item.id)) {
            uniqueIds.add(item.id);
            return true;
          }
          return false;
        });
      });

      setUnprocessedData(prevData => [...prevData, ...unprocessedDataChunk]);
      setCurrentPage(prevPage => prevPage + 1);
    } catch (error) {
      console.log(error, 'NotificationAPIGETAllData');
    } finally {
      setIsLoading(false);
    }
  };

  const markNotificationsAsRead = async () => {
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.log('No token found!');
      return;
    }

    try {
      const unreadNotifications = notificationData.filter(
        item => !item.Processed,
      );

      if (unreadNotifications.length > 0) {
        const updatePromises = unreadNotifications.map(notification => {
          const updateURL = `${protocol}://${host}:${port}/api/v1/models/AD_Note/${notification.id}`;
          return axios.put(
            updateURL,
            {Processed: true},
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: token ? `Bearer ${token.trim()}` : '',
              },
            },
          );
        });

        await Promise.all(updatePromises);

        // Update local state instead of refetching
        setNotificationData(
          prevData => prevData.map(item => ({...item, Processed: true})),
          setUnprocessedData([]),
        );
      }
    } catch (error) {
      console.log(error, 'Error updating notifications');
    }
  };

  const markSingleNotificationAsRead = async notificationId => {
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      console.log('No token found!');
      return;
    }

    try {
      const updateURL = `${protocol}://${host}:${port}/api/v1/models/AD_Note/${notificationId}`;
      await axios.put(
        updateURL,
        {Processed: true},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token.trim()}` : '',
          },
        },
      );

      // Update local state instead of refetching
      setNotificationData(prevData =>
        prevData.map(item =>
          item.id === notificationId ? {...item, Processed: true} : item,
        ),
      );
      setUnprocessedData(prevData =>
        prevData.filter(item => item.id !== notificationId),
      );
    } catch (error) {
      console.log(error, 'Error updating single notification');
    }
  };

  useEffect(() => {
    notificationAllDataGet();
  }, []);

  const displayedData = showUnprocessed ? unprocessedData : notificationData;

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Notification"
        RightIcon={'bell-outline'}
        RightPress={markNotificationsAsRead}
      />

      <View style={styles.headerControls}>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[
              styles.unreadButton,
              {
                borderWidth: showUnprocessed ? 0 : 1.1,
                borderColor: showUnprocessed ? 'transparent' : 'black',
                borderRadius: 20,
                backgroundColor: '#2F4FE3',
              },
            ]}
            onPress={() => setShowUnprocessed(false)}>
            <Text style={[styles.buttonText, {color: '#fff'}]}>View all</Text>
            <View style={[styles.unreadIndicator, {backgroundColor: '#fff'}]}>
              <Text style={styles.indicatorText}>
                {notificationData.length}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.unreadButton,
              {
                borderWidth: showUnprocessed ? 1.1 : 0,
                borderColor: showUnprocessed ? 'black' : 'transparent',
                borderRadius: 10,
              },
            ]}
            onPress={() => setShowUnprocessed(true)}>
            <Text style={styles.buttonText}>Unread</Text>
            <View style={styles.unreadIndicator}>
              <Text style={styles.indicatorText}>{unprocessedData.length}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={markNotificationsAsRead}>
          <Text style={styles.markAllRead}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      {isLoading && displayedData.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text>Loading Notifications...</Text>
        </View>
      ) : displayedData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {showUnprocessed ? 'No unread notifications' : 'No notifications'}
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={displayedData}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <NotificationComponent
              created={item.Created}
              reference={item.Reference}
              textMsg={item.TextMsg}
              backgroundColor={item.Processed ? 'white' : '#D3D3D3'}
              NotificationOnPress={() => markSingleNotificationAsRead(item.id)}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          onEndReached={() => notificationAllDataGet()}
          onEndReachedThreshold={1}
          ListFooterComponent={
            isLoading && displayedData.length > 0 ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" />
              </View>
            ) : null
          }
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          windowSize={21}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '98%',
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  filterButtons: {
    flexDirection: 'row',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: 'gray',
  },
  unreadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 5,
    // borderRadius: 40,
    margin: 5,
    width: '33%',
  },
  buttonText: {
    color: '#333',
    marginRight: 4,
  },
  unreadIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00B0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorText: {
    fontSize: 8,
    color: 'white',
  },
  markAllRead: {
    color: '#00B0F0',
    fontWeight: '500',
    fontSize: 16,
  },
  separator: {
    height: 5,
  },
  footerLoader: {
    width: '90%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NotificationSrn;
