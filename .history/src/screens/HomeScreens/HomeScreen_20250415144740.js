// import { StyleSheet, Text, View, Dimensions, BackHandler, ActivityIndicator, PermissionsAndroid, TouchableOpacity, Alert, StatusBar, Image, ImageBackground } from 'react-native'
// import React, { useCallback, useEffect, useState } from 'react'
// import TopHeader from '../../components/HomeScreenComponents/TopHeader'
// import NameContainer from '../../components/HomeScreenComponents/NameContainer'
// import HomeCard from '../../components/HomeScreenComponents/HomeCard'
// import HomeNotifyCard from '../../components/HomeScreenComponents/HomeNotifyCard'
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Entypo from 'react-native-vector-icons/Entypo';
// import Geolocation from 'react-native-geolocation-service';
// import axios from 'axios'
// import moment from 'moment'
// import TopNavigationATS from '../../navigation/TopNavigation/TopNavigationATS'
// import NotificationSrn from '../NotificationSrn/NotificationSrn'
// import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native'

// const currentDate = new Date();

// const options = { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' };
// const formattedDate = currentDate.toLocaleDateString('en-US', options);

// const HomeScreen = ({ navigation, route }) => {

//  const { tokenOk, token, roleId } = route.params
//   const [name, setName] = useState('')
//   const [isLoading, setIsLoading] = useState(false);
//   const [approvalNum, setApprovalNum] = useState()
//   const [protocol, setProtocol] = useState()
//   const [reqNum, setReqNum] = useState()
//   const [host, setHost] = useState()
//   const [clientName, setClientName] = useState('')
//   const [port, setPort] = useState()
//   const [checkinout, setCheckinout] = useState(false);
//   const [location, setLocation] = useState(null);
//   const [partnerId, setPartnerId] = useState(null);
//   const [years, setYears] = useState([]);
//   const [Status, setStatus] = useState(null)
//   const [notificationCount, setNotificationCount] = useState()

//   // const C_BPartnerID = async () => {
//   //   const protocol = await AsyncStorage.getItem('protocol');
//   //   const host = await AsyncStorage.getItem('host');
//   //   const port = await AsyncStorage.getItem('port');
//   //   const token = await AsyncStorage.getItem('token');
//   //   const userId = await AsyncStorage.getItem('userId');

//   //   console.log(userId, 'userIdForC_BPartnerID');

//   //   try {
//   //       setIsLoading(true);
//   //       const URL = `${protocol}://${host}:${port}/api/v1/models/ad_user?$filter=ad_user_id eq ${userId}`;
//   //       // console.log(URL, "URLForC_BPartnerID");
//   //       const response = await axios.get(URL, {
//   //           headers: {
//   //               'Content-Type': 'application/json',
//   //               'Authorization': token ? `Bearer ${token.trim()}` : '', // Ensure token is properly formatted
//   //           },
//   //       });

//   //       // console.log(response.data?.records, 'C_BpartnerIDForResponse');

//   //       // Check if response has records
//   //       if (response.data?.records?.length > 0) {
//   //           const userData = response.data.records[0]; // First record

//   //           // Extracting required values
//   //           const partnerId = userData?.C_BPartner_ID?.id?.toString() || '';
//   //           const email = userData?.EMail || '';
//   //           const emailUser = userData?.EMailUser || '';

//   //           // Storing in AsyncStorage
//   //           await AsyncStorage.setItem('C_BPartner_ID', partnerId);
//   //           await AsyncStorage.setItem('EMail', email);
//   //           await AsyncStorage.setItem('EMailUser', emailUser);
//   //           console.log(partnerId,'HomeSrnCBPartnerID')

//   //           console.log('User data saved successfully in AsyncStorage!');
//   //       } else {
//   //           console.warn('No user data found in API response.');
//   //       }

//   //   } catch (error) {
//   //       console.error(error.response ? error.response.data : error.message, 'ErrorForC_BParnterID');
//   //   } finally {
//   //       setIsLoading(false);
//   //   }
//   // };

//   //   useEffect(() => {
//   //     C_BPartnerID();
//   //   }, [])

// // Notification Un-Read API Calling

// const notificationAllDataGet = async () => {
//   const token = await AsyncStorage.getItem('token');
//   const protocol = await AsyncStorage.getItem('protocol');
//   const host = await AsyncStorage.getItem('host');
//   const port = await AsyncStorage.getItem('port');
//   const userId = await AsyncStorage.getItem("userId");
//   const organizationId = await AsyncStorage.getItem('organizationId');
//   console.log(organizationId,'organizationId')

//   try {
//       setIsLoading(true);
//       const URL = `${protocol}://${host}:${port}/api/v1/models/AD_Note?$filter=AD_User_ID eq ${userId}`;
//       // const URL = `${protocol}://${host}:${port}/api/v1/models/AD_Note?$filter=AD_User_ID eq ${userId} and AD_Org_ID eq ${organizationId}`;
//       // console.log(URL, 'URLForNotification');

//       const response = await axios.get(URL, {
//           headers: {
//               'Content-Type': 'application/json',
//               'Authorization': token ? `Bearer ${token.trim()}` : '',
//           },
//       });

//       const sortedData = response?.data?.records?.sort((a, b) => new Date(b.Created) - new Date(a.Created));
//       // console.log(sortedData, 'NotificationHomeSrn');

//       // Count unprocessed notifications (Processed: false)
//       const unprocessedCount = sortedData?.filter(item => item.Processed === false).length;
//       setNotificationCount(unprocessedCount)
//       console.log(unprocessedCount, 'Unprocessed Notification Count');

//       // setNotificationData(sortedData);
//       // setUnprocessedNotificationCount(unprocessedCount); // Uncomment if using state
//   } catch (error) {
//       console.log(error, 'NotificationAPIGETAllData');
//   } finally {
//       setIsLoading(false);
//   }
// };

//   const getName = async () => {
//     const value = await AsyncStorage.getItem('userName');
//     const protocol = await AsyncStorage.getItem('protocol')
//     setClientName(await AsyncStorage.getItem('clientNameSelected'))
//     const host = await AsyncStorage.getItem('host')
//     const port = await AsyncStorage.getItem('port')
//     const userId = await AsyncStorage.getItem('userId')
//     console.log(userId, 'userIDForo1289ey8723t6r8')
//     setProtocol(protocol)
//     setHost(host)
//     setPort(port)
//     setName(value)
//     getApprovalNum(protocol, host, port)
//     getReqNum(protocol, host, port, userId)
//     getAtsNum(protocol, host, port, userId)
//   }

//   const handleBackButton = () => {
//     BackHandler.exitApp();
//     return true;
//   }

//   const getApprovalNum = async (protocol, host, port) => {
//     setIsLoading(true)
//     await fetch(`${protocol}://${host}:${port}/api/v1/models/mbl_workflow_v?$filter= AD_Role_ID eq ${roleId}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       }
//     })
//       .then(response => response.json())
//       .then(data => {
//         // console.log("Data",JSON.stringify(data),"Data")
//         setApprovalNum(data['array-count'])
//         setIsLoading(false)
//       })
//       .catch(error => {
//         console.error(error)
//         setIsLoading(false)
//       });
//   }

//   const getReqNum = async (protocol, host, port, userId) => {
//     fetch(`${protocol}://${host}:${port}/api/v1/models/R_Request?$filter=CreatedBy eq ${userId}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       }
//     })
//       .then(response => response.json())
//       .then(data => {

//         let record = data.records
//         const filteredData = record.filter(record => record.R_Status_ID.id !== 1000003);
//         // const lengthOfFilteredData = filteredData.length;
//         // setReqNum(lengthOfFilteredData)
//       })
//       .catch(error => console.error(error));
//   }

//   const getAtsNum = async (protocol, host, port, userId) => {
//     // fetch(`${protocol}://${host}:${port}/api/v1/models/mbl_request_view_v?$filter=Supervisor_ID eq ${userId} OR SalesRep_ID eq ${userId}`,
//     fetch(`${protocol}://${host}:${port}/api/v1/models/mbl_request_view_v?$filter= SalesRep_ID eq ${userId} and R_Status_ID eq 1000001`,
//       {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         }
//       })
//       .then(response => {
//         return response.json();
//       })
//       .then(data => {

//         let record = data.records
//         setReqNum(record?.length)

//       })
//       .catch(error => {
//         console.log(error)
//         setIsLoading(false)
//       });
//     setIsLoading(false)

//   }

//   const Approval = async () => {
//     setIsLoading(true)
//     await fetch(`${protocol}://${host}:${port}/api/v1/models/mbl_workflow_v?$filter= AD_Role_ID eq ${roleId}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       }
//     })
//       .then(response => response.json())
//       .then(data => {
//         const dataArray = data.records
//         const tableIdsToSupplyChain = [702, 259, 319];
//         const filteredArraySupply = dataArray.filter(obj => tableIdsToSupplyChain.includes(obj.AD_Table_ID.id));

//         const tableIdsAccount = [335, 318, 224]
//         const filteredArrayAccount = dataArray.filter(obj => tableIdsAccount.includes(obj.AD_Table_ID.id));
//         // navigation.navigate('ApprovalScreens', { token, filteredArraySupply, filteredArrayAccount, tokenOk, roleId })
//         navigation.navigate('AllApprovalList')
//         setIsLoading(false)
//       })
//       .catch(error => {
//         console.error(error)
//         navigation.navigate('ApprovalScreens')
//         setIsLoading(false)
//       });
//   }
//   const FindBusinessPrtId = async () => {
//     const token = await AsyncStorage.getItem('token');
//     const protocol = await AsyncStorage.getItem('protocol');
//     const host = await AsyncStorage.getItem('host');
//     const port = await AsyncStorage.getItem('port');
//     const Id = await AsyncStorage.getItem("userId");
//     console.log("token", token, "token")

//     try {
//       const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/AD_User?$filter=AD_User_ID eq ${Id}`,
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`
//           }
//         });
//       // console.log(response?.data?.records[0]?.C_BPartner_ID?.id,'ad')
//       setPartnerId(response?.data?.records[0]?.C_BPartner_ID?.id)

//     } catch (error) {
//       console.error('Error efe:', error);
//     }
//   };
//   const handleAttendance = async (Status) => {
//     // setCheckinout(!checkinout);
//     // console.log(location);
//     setIsLoading(true);
//     setLocation(null)

//     const date = new Date();
//     const token = await AsyncStorage.getItem('token')
//     const protocol = await AsyncStorage.getItem('protocol')
//     const host = await AsyncStorage.getItem('host')
//     const port = await AsyncStorage.getItem('port')
//     const Id = await AsyncStorage.getItem("userId")
//     const clientid = await AsyncStorage.getItem('clientId');
//     const org_id = await AsyncStorage.getItem('organizationId');
//     // Format current date as YYYY-MM-DD

//     // Format current time as HH:mm:ss in 24-hour format
//     // const formattedTime = date.toTimeString().split(' ')[0];

//     // console.log(date,'date')
//     // console.log('tkn', token)
//     // const formattedTime = date.toLocaleString('en-US', {
//     //   hour: 'numeric',
//     //   minute: 'numeric',
//     //   second: 'numeric',
//     //   hour12: true
//     // });
//     const formattedDate = date.toISOString().split('T')[0];
//     const formattedTime = date.toISOString().split('T')[1].slice(0, 8) + 'Z';

//     const formattedDateTime = date.toISOString().split('T')[0].replace(/-/g, '/')
//     // const formattedDateTime = date.toLocaleString('en-US', {
//     //   year: 'numeric',
//     //   month: '2-digit',
//     //   day: '2-digit',
//     //   // hour: '2-digit',
//     //   // minute: '2-digit',
//     //   hour12: false
//     // });
//     const formattedDateTime2 = date.toLocaleString('en-US', {
//       // year: 'numeric',
//       // month: '2-digit',
//       // day: '2-digit',
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: false
//     });
//     try {

//       const payload = {
//         "AD_Client_ID": parseInt(clientid),
//         "AD_Org_ID": parseInt(org_id),
//         "C_BPartner_ID": parseInt(partnerId),
//         'C_Year_ID': { 'id': "1000014", 'identifier': "2024" },
//         // 'C_Year_ID': { 'id': `${years.value}`, 'identifier': `${years.label}` },
//         "MyConDate": `${formattedDateTime} ${formattedDateTime2}`,
//         "AttDate": formattedDate,
//         "AttTime": formattedTime,
//         "AttStatus": Status,
//         "AttActivity": "000",
//         "latitude": location?.latitude,
//         "longitude": location?.longitude
//       }
//       console.log(payload, "payload");

//       const response = await axios.post(`${protocol}://${host}:${port}/api/v1/models/HR_Daily_Attend`, payload,
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`
//           },

//         })
//       // console.log(token,'too')
//       console.log(response.data, 'res')
//       // setAttendanceRecords(response.data.records);
//       if (response.data) {
//         setLocation(null)
//         if (Status === "IN") {
//           Alert.alert('Check-In Successful', 'Your check-in has been successfully recorded.');
//         } else {
//           Alert.alert('Check-Out Successful', 'Your check-Out has been successfully recorded.');
//         }

//       }
//     } catch (error) {
//       console.log('Error', error)
//     } finally {
//       setLocation(null)
//       await handleGetAttendance();
//       setIsLoading(false);
//     }

//   }

//   const handleGetAttendance = async () => {
//     const date = new Date();
//     const token = await AsyncStorage.getItem('token');
//     const protocol = await AsyncStorage.getItem('protocol');
//     const host = await AsyncStorage.getItem('host');
//     const port = await AsyncStorage.getItem('port');
//     const Id = await AsyncStorage.getItem("userId");
//     const clientid = await AsyncStorage.getItem('clientId');
//     const org_id = await AsyncStorage.getItem('organizationId');

//     try {
//       // $top=1 ensures only the latest record is fetched
//       const filterQuery = `$filter=AD_Client_ID eq ${clientid} and AD_Org_ID eq ${org_id} and C_BPartner_ID eq ${partnerId}`;
//       // console.log(filterQuery,'dd')
//       setIsLoading(true);
//       const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/HR_Daily_Attend?$orderby=Created desc&$top=1&${filterQuery}`,
//         {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`
//           },
//         });
//       const attendanceRecord = response?.data?.records[0];
//       // console.log(response?.data?.records[0])

//       const [year, month, day] = attendanceRecord?.AttDate.split('-').map(Number);

//       const [hour, minute, second] = attendanceRecord?.AttTime.split(':').map(Number);

//       const lastAttDate = new Date(Date.UTC(year, month - 1, day, hour, minute));

//       const currentTime = new Date();
//       const hoursPassed = (currentTime - lastAttDate) / 1000 / 60 / 60;

//       if (response?.data?.records[0]?.AttStatus?.identifier === 'IN') {
//         if (hoursPassed >= 23) {
//           await requestLocationPermission("OUT")
//           return
//           //ok
//         }
//         setCheckinout(false);
//       } else {
//         setCheckinout(true);
//       }
//     } catch (error) {
//       console.log('Error in get', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // const handleGetAttendance = async () => {
//   //   const date = new Date();
//   //   const token = await AsyncStorage.getItem('token');
//   //   const protocol = await AsyncStorage.getItem('protocol');
//   //   const host = await AsyncStorage.getItem('host');
//   //   const port = await AsyncStorage.getItem('port');
//   //   const Id = await AsyncStorage.getItem("userId");
//   //   const clientid = await AsyncStorage.getItem('clientId');
//   //   const org_id = await AsyncStorage.getItem('organizationId');

//   //   try {
//   //     // $top=1 ensures only the latest record is fetched
//   //     const filterQuery = `$filter=AD_Client_ID eq ${clientid} and AD_Org_ID eq ${org_id} and C_BPartner_ID eq ${partnerId}`;
//   //     // console.log(filterQuery,'dd')
//   //     setIsLoading(true);
//   //     const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/HR_Daily_Attend?$orderby=Created desc&$top=1&${filterQuery}`,
//   //       {
//   //         method: 'GET',
//   //         headers: {
//   //           'Content-Type': 'application/json',
//   //           'Authorization': `Bearer ${token}`
//   //         },
//   //       });

//   //     // console.log(response?.data.record, 'records');
//   //     // console.log(response?.data?.records[0], "response?.data?.records[0]")
//   //     const attendanceRecord = response?.data?.records[0];

//   //     if (attendanceRecord) {
//   //       const lastAttDate = new Date(attendanceRecord.AttDate);
//   //       const lastAttTime = attendanceRecord.AttTime.split(':');
//   //       lastAttDate.setHours(lastAttTime[0], lastAttTime[1], lastAttTime[2]);

//   //       const hoursPassed = (date - lastAttDate) / 1000 / 60 / 60;

//   //       if (attendanceRecord.AttStatus?.identifier === 'IN' && hoursPassed > 1) {
//   //         requestLocationPermission("OUT");
//   //         setCheckinout(false);
//   //       } else {
//   //         setCheckinout(false);
//   //       }
//   //     } else {
//   //       setCheckinout(true);
//   //     }
//   //   } catch (error) {
//   //     console.log('Error in get', error);
//   //   } finally {
//   //     setIsLoading(false);
//   //   }
//   // };

//   // Miss Noor n bola tha phir ye Function Comment kiya hai"ye Function BY_Default Location pick kr rh hai
//   // useEffect(() => {

//   //   FindBusinessPrtId();
//   //   // getCurrentLocation();
//   //   getYearId();

//   // }, []);

//   // const getCurrentLocation = () => {
//   //   Geolocation.getCurrentPosition(
//   //     (position) => {
//   //       const { latitude, longitude } = position.coords;
//   //       setLocation({ latitude, longitude });
//   //       console.log("Location:", latitude, longitude); // You can remove this or replace it with any other logic
//   //     },
//   //     (error) => {
//   //       console.log(error.code, error.message);
//   //     },
//   //     { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
//   //   );
//   // };
//   // const requestLocationPermission = async (Status) => {
//   //   if (Platform.OS === 'android') {
//   //     const granted = await PermissionsAndroid.request(
//   //       PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//   //       {
//   //         title: "Location Permission",
//   //         message: "This app needs access to your location",
//   //         buttonNeutral: "Ask Me Later",
//   //         buttonNegative: "Cancel",
//   //         buttonPositive: "OK"
//   //       }
//   //     );
//   //     if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//   //       setStatus(Status)
//   //       getCurrentLocation();
//   //     } else {
//   //       console.log("Location permission denied");
//   //       Alert.alert('Location permission denied', 'Go on App settings and turn on Location');
//   //     }
//   //   } else {
//   //     getCurrentLocation();
//   //   }
//   // };

//   const extractCurrentYearData = (data, currentYear) => {
//     const currentYearLabel = `${currentYear - 1}/${currentYear.toString().slice(-2)}`;
//     return data.find(item => item.label === currentYearLabel);
//   };
//   const getYearId = async () => {
//     setIsLoading(true);
//     const token = await AsyncStorage.getItem('token');
//     const protocol = await AsyncStorage.getItem('protocol');
//     const host = await AsyncStorage.getItem('host');
//     const port = await AsyncStorage.getItem('port');
//     try {
//       const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/C_Year`, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         }
//       });
//       // console.log(response.data.records,'dd')
//       const extractedData = response?.data?.records.map(item => ({
//         label: item?.FiscalYear,
//         value: item?.id
//       }));
//       const reversedData = extractedData.reverse();
//       const current_year = new Date().getFullYear();
//       const currentYearData = extractCurrentYearData(reversedData, current_year);
//       setYears(currentYearData);
//       // console.log(currentYearData,"reversedData");
//     } catch (error) {
//       console.error('Error Year Id:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (partnerId) {
//       handleGetAttendance();
//     }
//   }, [partnerId])

//   useEffect(() => {
//     if (location !== null) {
//       handleAttendance(Status)
//     }

//   }, [location])

//   const navigateBack = () => {
//     const unsubscribe = navigation.addListener('focus', () => {
//       getName()
//     });

//     return unsubscribe;
//   }

//   useEffect(() => {
//     getName()
//     navigateBack()
//     BackHandler.addEventListener('hardwareBackPress', handleBackButton);
//     return () => {
//       BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
//     };
//   }, [navigation])

//   // Notification ALI Calling UseEffect
//   useEffect(()=>{
//     notificationAllDataGet()
//   },[])

//   const isFocused = useIsFocused();

//   useEffect(() => {
//     if (isFocused) {
//       console.log('pressedMe')
//       notificationAllDataGet(); // Call the function when the screen is focused
//     }
//   }, [isFocused]);

//   return (
//     <>
//       {isLoading && (
//         <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//           <ActivityIndicator size="large" color="#0050C0" />
//         </View>
//       )}
//       {!isLoading && (
//         <View style={{ flex: 1 }}>
//           <StatusBar translucent={true} backgroundColor="transparent" />

//           <View style={styles.headerView}>
//             <ImageBackground
//               source={require('../../asserts/HomeScreenAssets/HeaderImage/Group474.png')}
//               style={{ width: "100%", height: "110%" }}>

//               <View style={{ width: '100%', marginTop: 30 }}>
//                 <View style={{ flexDirection: 'row', width: '100%' }}>
//                   <View style={{ width: '20%' }}></View>
//                   <View style={{ width: '70%', marginTop: "4%", }}>
//                     {/* <Text style={{ textAlign: 'center', fontSize: 36, color: 'white', fontFamily: 'K2D-BoldItalic' }}>Infinity</Text> */}

//                     <Image
//                       source={require('../../asserts/HomeScreenAssets/HeaderImage/whiteicon.png')}
//                       style={{ width: 76, height: 70, alignSelf: "center" }}
//                     />
//                   </View>
//                   <View style={{ width: '20%', flexDirection: 'row', alignItems: "center", justifyContent: 'center' }}>
//                   </View>
//                 </View>
//               </View>
//               <View style={{ flexDirection: 'row' }} >
//                 <View style={styles.titleContainer}>
//                   <View style={{ flexDirection: 'row', width: '100%' }}>
//                     <Text style={styles.title}>Hello, {name}</Text>

//                   </View>
//                   <View style={{ flexDirection: 'row', width: '100%' }}>
//                     <Text style={styles.dateTitle}>{formattedDate}</Text>
//                     <View style={styles.markBtn}>
//                       {checkinout ? (
//                         <TouchableOpacity onPress={() => { requestLocationPermission("IN") }} style={[{ backgroundColor: '#00B0F0' }, styles.markBtn2]}>
//                           <Entypo name="login" size={15} color="#fff" />
//                           <Text style={{ color: '#fff', fontSize: 12 }}>Check In</Text>
//                         </TouchableOpacity>
//                       ) : (
//                         <TouchableOpacity onPress={() => { requestLocationPermission("OUT") }} style={[{ backgroundColor: "#DCDADA", }, styles.markBtn2]}>
//                           <Entypo name="log-out" size={15}
//                             color="black"
//                           //  color="#fff"
//                           />
//                           <Text style={{ color: 'black', fontSize: 12 }}>Check Out</Text>
//                         </TouchableOpacity>
//                       )}
//                     </View>
//                   </View>

//                 </View>
//               </View>

//             </ImageBackground>
//           </View>

//           <View style={styles.CardContainer}>
//             <View style={styles.Card}>
//               <HomeCard
//                 // onPress={() => navigation.navigate('ReportMain')}
//                 iconName="file-document-outline"
//                 txt="Reports"
//                 iconColor="#ba87e0"
//                 iconBackgroundColor="#e8e4eb"
//               />
//               <HomeCard
//                 iconName="cash"
//                 txt="Transaction"
//                 iconColor="#11d124"
//                 iconBackgroundColor="#e3f5d0"
//               />

//             </View>
//             <View style={{ flexDirection: 'row', width: '85%', justifyContent: 'space-between', marginTop: 30 }}>

//               <HomeCard
//                 onPress={() => navigation.navigate('EmployeePortal')}
//                 iconName="atom-variant"
//                 txt="Employee Portal"
//                 iconColor="#44a0e3"
//                 iconBackgroundColor="#d8e7ed"
//               />

//               <HomeNotifyCard
//                 iconName="check-circle-outline"
//                 txt="Approvals"
//                 iconColor="#b05546"
//                 iconBackgroundColor="#eddbd8"
//                 num={approvalNum}
//                 clickHandler={() => Approval()}
//               />
//             </View>
//             <View style={{ flexDirection: 'row', width: '85%', justifyContent: 'space-between', marginTop: 30 }}>
//               <HomeNotifyCard
//                 iconName="database"
//                 // txt="ATS"
//                 txt="Request"
//                 iconColor="green"
//                 iconBackgroundColor="#defce0"
//                 num={reqNum}
//                 clickHandler={() => navigation.navigate('TopNavigationATS', { token })}
//               />

//               {/* <HomeCard
//                 iconName="bell-circle-outline"
//                 // txt="ATS"
//                 txt="Notification"
//                 iconColor="#ded731"
//                  iconBackgroundColor="#f5f4da"
//                  num={notificationCount}
//                 // num={reqNum}
//                 // clickHandler={() => navigation.navigate('TopNavigationATS', { token })}
//                 onPress={()=>navigation.navigate('NotificationSrn')}
//               /> */}
//               <HomeNotifyCard
//                 iconName="bell-circle-outline"
//                 // txt="ATS"
//                 txt="Notification"
//                 iconColor="#ded731"
//                  iconBackgroundColor="#f5f4da"
//                  num={notificationCount}
//                 clickHandler={()=>navigation.navigate('NotificationSrn')}
//               />
//             </View>
//             {/* <TouchableOpacity>
//               <View style={{ backgroundColor: 'red', height: 70, width: 90, alignItems: "center", justifyContent: "center" }}>
//                 <Text>
//                   Attandance
//                 </Text>
//               </View>
//             </TouchableOpacity> */}
//           </View>

//         </View>

//         // <View style={{ flex: 1, backgroundColor: 'white' }}>
//         //   <TopHeader />
//         //   <NameContainer name={name} clientName={clientName} />
//         //   <View style={{ alignItems: 'center', marginTop: 5 }}>
//         //     <View style={{ width: '95%' }}>
//         //       <Text style={styles.txt}>Driving Force Of Your Business</Text>
//         //     </View>
//         //   </View>
//         //   <View style={{ alignItems: 'center', marginTop: 20,backgroundColor:'#fff',height:'70%',width:'100%',borderTopLeftRadius:30,borderTopRightRadius:30,elevation:4 }}>
//         //     <View style={{ width: '95%', justifyContent: 'center', alignItems: 'center', marginTop: 20, }}>

//         //       <View style={{ flexDirection: 'row', width: '85%', justifyContent: 'space-between', }}>
//         //         <HomeCard source={require('../../asserts/HomeScreenAssets/CardAssets/Report.png')} txt="Reports" />
//         //         <HomeCard source={require('../../asserts/HomeScreenAssets/CardAssets/Transaction.png')} txt="Transaction" />
//         //       </View>

//         //       <View style={{ flexDirection: 'row', width: '85%', justifyContent: 'space-between', marginTop: 30 }}>
//         //         <HomeCard source={require('../../asserts/HomeScreenAssets/CardAssets/Male.png')} txt="Portal" />
//         //         <HomeNotifyCard source={require('../../asserts/HomeScreenAssets/CardAssets/Approval.png')}
//         //           txt="Approvals"
//         //           num={approvalNum}
//         //           clickHandler={() => Approval()}
//         //         />
//         //       </View>

//         //       <View style={{ flexDirection: 'row', width: '85%', justifyContent: 'space-between', marginTop: 30 }}>
//         //         <HomeNotifyCard source={require('../../asserts/HomeScreenAssets/CardAssets/Volume.png')}
//         //           txt="ATS"
//         //           clickHandler={() => navigation.navigate('UserList', { token })}
//         //           num={reqNum}
//         //         />
//         //         <HomeNotifyCard source={require('../../asserts/HomeScreenAssets/CardAssets/Alarm.png')} txt="Notification" />
//         //       </View>
//         //     </View>
//         //   </View>
//         // </View>
//       )}
//     </>

//   )
// }

// export default HomeScreen

// const styles = StyleSheet.create({
//   txt: {
//     fontSize: 20,
//     color: '#000000',
//     fontFamily: 'K2D-Bold'
//   },
//   headerView:
//   {
//     flex: 1,
//     // backgroundColor: '#0050C0',
//     // backgroundColor: "#002E62",
//     borderBottomRightRadius: 10,
//     borderBottomLeftRadius: 10,
//   },
//   titleContainer:
//   {

//     paddingHorizontal: 20,
//     // flexDirection:'row'
//   },
//   title:
//   {
//     color: 'white',
//     fontSize: 22,
//     marginBottom: 3,
//     fontFamily: 'K2D-Bold'
//   },
//   dateTitle: {
//     color: 'white',
//     fontSize: 16,
//     fontFamily: 'K2D'
//   },
//   CardContainer: {
//     flex: 2,
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'relative',
//     // bottom: 40
//   },
//   Card: {
//     flexDirection: 'row',
//     width: '85%',
//     justifyContent: 'space-between',
//   },
//   markBtn: {
//     height: 40,
//     width: 100,
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginLeft: 'auto',
//     borderRadius: 10,
//     flexDirection: 'row',
//     paddingHorizontal: 10
//   },
//   markBtn2: {
//     height: 40,
//     width: 90,
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     // marginLeft:'auto',
//     borderRadius: 10,
//     flexDirection: 'row',
//     paddingHorizontal: 6,
//     // fontSize:10
//   },
// })

// New Home Screen for ChatGPT

import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Dimensions,
  BackHandler,
  ActivityIndicator,
  PermissionsAndroid,
  TouchableOpacity,
  Alert,
  StatusBar,
  Image,
  ImageBackground,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import TopHeader from '../../components/HomeScreenComponents/TopHeader';
import NameContainer from '../../components/HomeScreenComponents/NameContainer';
import HomeCard from '../../components/HomeScreenComponents/HomeCard';
import HomeNotifyCard from '../../components/HomeScreenComponents/HomeNotifyCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Entypo from 'react-native-vector-icons/Entypo';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import moment from 'moment';
import TopNavigationATS from '../../navigation/TopNavigation/TopNavigationATS';
import NotificationSrn from '../NotificationSrn/NotificationSrn';
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import ApprovalScreens from '../ApprovalScreens/ApprovalScreens';

const transactions = [
  {
    amount: '$54.67',
    name: 'Sharlin Jason',
    date: '1-2-2025',
    status: 'Pending',
  },
  {
    amount: '$54.67',
    name: 'Sharlin Jason',
    date: '1-2-2025',
    status: 'Complete',
  },
  {
    amount: '$54.67',
    name: 'Sharlin Jason',
    date: '1-2-2025',
    status: 'Complete',
  },
];

const HomeScreen = ({route}) => {
  const navigation = useNavigation();

  const {tokenOk, token, roleId} = route.params;
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [approvalNum, setApprovalNum] = useState();
  const [protocol, setProtocol] = useState();
  const [reqNum, setReqNum] = useState();
  const [host, setHost] = useState();
  const [clientName, setClientName] = useState('');
  const [port, setPort] = useState();
  const [checkinout, setCheckinout] = useState(false);
  const [location, setLocation] = useState(null);
  const [partnerId, setPartnerId] = useState(null);
  const [years, setYears] = useState([]);
  const [Status, setStatus] = useState(null);
  const [notificationCount, setNotificationCount] = useState();

  const categories = [
    {
      title: 'Reports',
      icon: 'file-document-outline',
      color: '#fff',
      backgroundcolor: '#7FD7C7',
      // onPress: () => navigation.navigate('ReportMain'),
    },
    {
      title: 'Approval',
      icon: 'check-decagram',
      color: '#fff',
      backgroundcolor: '#FFC774',
      // onPress: Approval, // ✅ function directly pass karo
      onPress: () => navigation.navigate('AllApprovalList', getApprovalNum()),
    },
    {
      title: 'Employee Portal',
      icon: 'account-group',
      color: '#fff',
      backgroundcolor: '#3A3E59',
      onPress: () => navigation.navigate('EmployeePortal'),
    },
    {
      title: 'Request',
      icon: 'file-send',
      color: '#fff',
      backgroundcolor: '#ED6B5B',
      onPress: () => navigation.navigate('TopNavigationATS', {token}),
    },
  ];

  // const C_BPartnerID = async () => {
  //   const protocol = await AsyncStorage.getItem('protocol');
  //   const host = await AsyncStorage.getItem('host');
  //   const port = await AsyncStorage.getItem('port');
  //   const token = await AsyncStorage.getItem('token');
  //   const userId = await AsyncStorage.getItem('userId');

  //   console.log(userId, 'userIdForC_BPartnerID');

  //   try {
  //       setIsLoading(true);
  //       const URL = `${protocol}://${host}:${port}/api/v1/models/ad_user?$filter=ad_user_id eq ${userId}`;
  //       // console.log(URL, "URLForC_BPartnerID");
  //       const response = await axios.get(URL, {
  //           headers: {
  //               'Content-Type': 'application/json',
  //               'Authorization': token ? `Bearer ${token.trim()}` : '', // Ensure token is properly formatted
  //           },
  //       });

  //       // console.log(response.data?.records, 'C_BpartnerIDForResponse');

  //       // Check if response has records
  //       if (response.data?.records?.length > 0) {
  //           const userData = response.data.records[0]; // First record

  //           // Extracting required values
  //           const partnerId = userData?.C_BPartner_ID?.id?.toString() || '';
  //           const email = userData?.EMail || '';
  //           const emailUser = userData?.EMailUser || '';

  //           // Storing in AsyncStorage
  //           await AsyncStorage.setItem('C_BPartner_ID', partnerId);
  //           await AsyncStorage.setItem('EMail', email);
  //           await AsyncStorage.setItem('EMailUser', emailUser);
  //           console.log(partnerId,'HomeSrnCBPartnerID')

  //           console.log('User data saved successfully in AsyncStorage!');
  //       } else {
  //           console.warn('No user data found in API response.');
  //       }

  //   } catch (error) {
  //       console.error(error.response ? error.response.data : error.message, 'ErrorForC_BParnterID');
  //   } finally {
  //       setIsLoading(false);
  //   }
  // };

  //   useEffect(() => {
  //     C_BPartnerID();
  //   }, [])

  // // Notification Un-Read API Calling

  const notificationAllDataGet = async () => {
    const token = await AsyncStorage.getItem('token');
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const userId = await AsyncStorage.getItem('userId');
    const organizationId = await AsyncStorage.getItem('organizationId');
    console.log(token, 'token.............');

    try {
      setIsLoading(true);
      const URL = `${protocol}://${host}:${port}/api/v1/models/AD_Note?$filter=AD_User_ID eq ${userId}`;
      // const URL = `${protocol}://${host}:${port}/api/v1/models/AD_Note?$filter=AD_User_ID eq ${userId} and AD_Org_ID eq ${organizationId}`;
      // console.log(URL, 'URLForNotification');

      const response = await axios.get(URL, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token.trim()}` : '',
        },
      });

      const sortedData = response?.data?.records?.sort(
        (a, b) => new Date(b.Created) - new Date(a.Created),
      );
      // console.log(sortedData, 'NotificationHomeSrn');

      // Count unprocessed notifications (Processed: false)
      const unprocessedCount = sortedData?.filter(
        item => item.Processed === false,
      ).length;
      setNotificationCount(unprocessedCount);
      console.log(unprocessedCount, 'Unprocessed Notification Count');

      // setNotificationData(sortedData);
      // setUnprocessedNotificationCount(unprocessedCount); // Uncomment if using state
    } catch (error) {
      console.log(error, 'NotificationAPIGETAllData');
    } finally {
      setIsLoading(false);
    }
  };

  const getName = async () => {
    const value = await AsyncStorage.getItem('userName');
    const protocol = await AsyncStorage.getItem('protocol');
    setClientName(await AsyncStorage.getItem('clientNameSelected'));
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const userId = await AsyncStorage.getItem('userId');
    console.log(userId, 'userIDForo1289ey8723t6r8');
    setProtocol(protocol);
    setHost(host);
    setPort(port);
    setName(value);
    getApprovalNum(protocol, host, port);
    getReqNum(protocol, host, port, userId);
    getAtsNum(protocol, host, port, userId);
  };

  const handleBackButton = () => {
    BackHandler.exitApp();
    return true;
  };

  const getApprovalNum = async (protocol, host, port) => {
    setIsLoading(true);
    await fetch(
      `${protocol}://${host}:${port}/api/v1/models/mbl_workflow_v?$filter= AD_Role_ID eq ${roleId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )
      .then(response => response.json())
      .then(data => {
        // console.log("Data",JSON.stringify(data),"Data")
        setApprovalNum(data['array-count']);
        setIsLoading(false);
      })
      .catch(error => {
        console.error(error);
        setIsLoading(false);
      });
  };

  const getReqNum = async (protocol, host, port, userId) => {
    fetch(
      `${protocol}://${host}:${port}/api/v1/models/R_Request?$filter=CreatedBy eq ${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )
      .then(response => response.json())
      .then(data => {
        let record = data.records;
        const filteredData = record.filter(
          record => record.R_Status_ID.id !== 1000003,
        );
        // const lengthOfFilteredData = filteredData.length;
        // setReqNum(lengthOfFilteredData)
      })
      .catch(error => console.error(error));
  };

  const getAtsNum = async (protocol, host, port, userId) => {
    // fetch(`${protocol}://${host}:${port}/api/v1/models/mbl_request_view_v?$filter=Supervisor_ID eq ${userId} OR SalesRep_ID eq ${userId}`,
    fetch(
      `${protocol}://${host}:${port}/api/v1/models/mbl_request_view_v?$filter= SalesRep_ID eq ${userId} and R_Status_ID eq 1000001`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )
      .then(response => {
        return response.json();
      })
      .then(data => {
        let record = data.records;
        setReqNum(record?.length);
      })
      .catch(error => {
        console.log(error);
        setIsLoading(false);
      });
    setIsLoading(false);
  };

  const Approval = async () => {
    setIsLoading(true);
    await fetch(
      `${protocol}://${host}:${port}/api/v1/models/mbl_workflow_v?$filter= AD_Role_ID eq ${roleId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )
      .then(response => response.json())
      .then(data => {
        const dataArray = data.records;
        const tableIdsToSupplyChain = [702, 259, 319];
        const filteredArraySupply = dataArray.filter(obj =>
          tableIdsToSupplyChain.includes(obj.AD_Table_ID.id),
        );

        const tableIdsAccount = [335, 318, 224];
        const filteredArrayAccount = dataArray.filter(obj =>
          tableIdsAccount.includes(obj.AD_Table_ID.id),
        );
        // navigation.navigate('ApprovalScreens', { token, filteredArraySupply, filteredArrayAccount, tokenOk, roleId })
        navigation.navigate('AllApprovalList');
        setIsLoading(false);
      })
      .catch(error => {
        console.error(error);
        navigation.navigate('ApprovalScreens');
        setIsLoading(false);
      });
  };
  const FindBusinessPrtId = async () => {
    const token = await AsyncStorage.getItem('token');
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const Id = await AsyncStorage.getItem('userId');
    console.log('token', token, 'token');

    try {
      const response = await axios.get(
        `${protocol}://${host}:${port}/api/v1/models/AD_User?$filter=AD_User_ID eq ${Id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      // console.log(response?.data?.records[0]?.C_BPartner_ID?.id,'ad')
      setPartnerId(response?.data?.records[0]?.C_BPartner_ID?.id);
    } catch (error) {
      console.error('Error efe:', error);
    }
  };
  // const handleAttendance = async (Status) => {
  // setCheckinout(!checkinout);
  // console.log(location);
  // setIsLoading(true);
  // setLocation(null)

  //     const date = new Date();
  //     const token = await AsyncStorage.getItem('token')
  //     const protocol = await AsyncStorage.getItem('protocol')
  //     const host = await AsyncStorage.getItem('host')
  //     const port = await AsyncStorage.getItem('port')
  //     const Id = await AsyncStorage.getItem("userId")
  //     const clientid = await AsyncStorage.getItem('clientId');
  //     const org_id = await AsyncStorage.getItem('organizationId');
  //     // Format current date as YYYY-MM-DD

  //     // Format current time as HH:mm:ss in 24-hour format
  //     // const formattedTime = date.toTimeString().split(' ')[0];

  //     // console.log(date,'date')
  //     // console.log('tkn', token)
  //     // const formattedTime = date.toLocaleString('en-US', {
  //     //   hour: 'numeric',
  //     //   minute: 'numeric',
  //     //   second: 'numeric',
  //     //   hour12: true
  //     // });
  //     const formattedDate = date.toISOString().split('T')[0];
  //     const formattedTime = date.toISOString().split('T')[1].slice(0, 8) + 'Z';

  //     const formattedDateTime = date.toISOString().split('T')[0].replace(/-/g, '/')
  //     // const formattedDateTime = date.toLocaleString('en-US', {
  //     //   year: 'numeric',
  //     //   month: '2-digit',
  //     //   day: '2-digit',
  //     //   // hour: '2-digit',
  //     //   // minute: '2-digit',
  //     //   hour12: false
  //     // });
  //     const formattedDateTime2 = date.toLocaleString('en-US', {
  //       // year: 'numeric',
  //       // month: '2-digit',
  //       // day: '2-digit',
  //       hour: '2-digit',
  //       minute: '2-digit',
  //       hour12: false
  //     });
  //     try {

  //       const payload = {
  //         "AD_Client_ID": parseInt(clientid),
  //         "AD_Org_ID": parseInt(org_id),
  //         "C_BPartner_ID": parseInt(partnerId),
  //         'C_Year_ID': { 'id': "1000014", 'identifier': "2024" },
  //         // 'C_Year_ID': { 'id': `${years.value}`, 'identifier': `${years.label}` },
  //         "MyConDate": `${formattedDateTime} ${formattedDateTime2}`,
  //         "AttDate": formattedDate,
  //         "AttTime": formattedTime,
  //         "AttStatus": Status,
  //         "AttActivity": "000",
  //         "latitude": location?.latitude,
  //         "longitude": location?.longitude
  //       }
  //       console.log(payload, "payload");

  //       const response = await axios.post(`${protocol}://${host}:${port}/api/v1/models/HR_Daily_Attend`, payload,
  //         {
  //           method: 'POST',
  //           headers: {
  //             'Content-Type': 'application/json',
  //             'Authorization': `Bearer ${token}`
  //           },

  //         })
  //       // console.log(token,'too')
  //       console.log(response.data, 'res')
  //       // setAttendanceRecords(response.data.records);
  //       if (response.data) {
  //         setLocation(null)
  //         if (Status === "IN") {
  //           Alert.alert('Check-In Successful', 'Your check-in has been successfully recorded.');
  //         } else {
  //           Alert.alert('Check-Out Successful', 'Your check-Out has been successfully recorded.');
  //         }

  //       }
  //     } catch (error) {
  //       console.log('Error', error)
  //     } finally {
  //       setLocation(null)
  //       await handleGetAttendance();
  //       setIsLoading(false);
  //     }

  //   }

  const handleGetAttendance = async () => {
    const date = new Date();
    const token = await AsyncStorage.getItem('token');
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const Id = await AsyncStorage.getItem('userId');
    const clientid = await AsyncStorage.getItem('clientId');
    const org_id = await AsyncStorage.getItem('organizationId');

    try {
      // $top=1 ensures only the latest record is fetched
      const filterQuery = `$filter=AD_Client_ID eq ${clientid} and AD_Org_ID eq ${org_id} and C_BPartner_ID eq ${partnerId}`;
      // console.log(filterQuery,'dd')
      setIsLoading(true);
      const response = await axios.get(
        `${protocol}://${host}:${port}/api/v1/models/HR_Daily_Attend?$orderby=Created desc&$top=1&${filterQuery}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const attendanceRecord = response?.data?.records[0];
      // console.log(response?.data?.records[0])

      const [year, month, day] =
        attendanceRecord?.AttDate.split('-').map(Number);

      const [hour, minute, second] =
        attendanceRecord?.AttTime.split(':').map(Number);

      const lastAttDate = new Date(
        Date.UTC(year, month - 1, day, hour, minute),
      );

      const currentTime = new Date();
      const hoursPassed = (currentTime - lastAttDate) / 1000 / 60 / 60;

      if (response?.data?.records[0]?.AttStatus?.identifier === 'IN') {
        if (hoursPassed >= 23) {
          await requestLocationPermission('OUT');
          return;
          //ok
        }
        setCheckinout(false);
      } else {
        setCheckinout(true);
      }
    } catch (error) {
      console.log('Error in get', error);
    } finally {
      setIsLoading(false);
    }
  };

  //   // const handleGetAttendance = async () => {
  //   //   const date = new Date();
  //   //   const token = await AsyncStorage.getItem('token');
  //   //   const protocol = await AsyncStorage.getItem('protocol');
  //   //   const host = await AsyncStorage.getItem('host');
  //   //   const port = await AsyncStorage.getItem('port');
  //   //   const Id = await AsyncStorage.getItem("userId");
  //   //   const clientid = await AsyncStorage.getItem('clientId');
  //   //   const org_id = await AsyncStorage.getItem('organizationId');

  //   //   try {
  //   //     // $top=1 ensures only the latest record is fetched
  //   //     const filterQuery = `$filter=AD_Client_ID eq ${clientid} and AD_Org_ID eq ${org_id} and C_BPartner_ID eq ${partnerId}`;
  //   //     // console.log(filterQuery,'dd')
  //   //     setIsLoading(true);
  //   //     const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/HR_Daily_Attend?$orderby=Created desc&$top=1&${filterQuery}`,
  //   //       {
  //   //         method: 'GET',
  //   //         headers: {
  //   //           'Content-Type': 'application/json',
  //   //           'Authorization': `Bearer ${token}`
  //   //         },
  //   //       });

  //   //     // console.log(response?.data.record, 'records');
  //   //     // console.log(response?.data?.records[0], "response?.data?.records[0]")
  //   //     const attendanceRecord = response?.data?.records[0];

  //   //     if (attendanceRecord) {
  //   //       const lastAttDate = new Date(attendanceRecord.AttDate);
  //   //       const lastAttTime = attendanceRecord.AttTime.split(':');
  //   //       lastAttDate.setHours(lastAttTime[0], lastAttTime[1], lastAttTime[2]);

  //   //       const hoursPassed = (date - lastAttDate) / 1000 / 60 / 60;

  //   //       if (attendanceRecord.AttStatus?.identifier === 'IN' && hoursPassed > 1) {
  //   //         requestLocationPermission("OUT");
  //   //         setCheckinout(false);
  //   //       } else {
  //   //         setCheckinout(false);
  //   //       }
  //   //     } else {
  //   //       setCheckinout(true);
  //   //     }
  //   //   } catch (error) {
  //   //     console.log('Error in get', error);
  //   //   } finally {
  //   //     setIsLoading(false);
  //   //   }
  //   // };

  //   // Miss Noor n bola tha phir ye Function Comment kiya hai"ye Function BY_Default Location pick kr rh hai
  //   // useEffect(() => {

  //   //   FindBusinessPrtId();
  //   //   // getCurrentLocation();
  //   //   getYearId();

  //   // }, []);

  //   // const getCurrentLocation = () => {
  //   //   Geolocation.getCurrentPosition(
  //   //     (position) => {
  //   //       const { latitude, longitude } = position.coords;
  //   //       setLocation({ latitude, longitude });
  //   //       console.log("Location:", latitude, longitude); // You can remove this or replace it with any other logic
  //   //     },
  //   //     (error) => {
  //   //       console.log(error.code, error.message);
  //   //     },
  //   //     { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
  //   //   );
  //   // };
  //   // const requestLocationPermission = async (Status) => {
  //   //   if (Platform.OS === 'android') {
  //   //     const granted = await PermissionsAndroid.request(
  //   //       PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  //   //       {
  //   //         title: "Location Permission",
  //   //         message: "This app needs access to your location",
  //   //         buttonNeutral: "Ask Me Later",
  //   //         buttonNegative: "Cancel",
  //   //         buttonPositive: "OK"
  //   //       }
  //   //     );
  //   //     if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //   //       setStatus(Status)
  //   //       getCurrentLocation();
  //   //     } else {
  //   //       console.log("Location permission denied");
  //   //       Alert.alert('Location permission denied', 'Go on App settings and turn on Location');
  //   //     }
  //   //   } else {
  //   //     getCurrentLocation();
  //   //   }
  //   // };

  const extractCurrentYearData = (data, currentYear) => {
    const currentYearLabel = `${currentYear - 1}/${currentYear
      .toString()
      .slice(-2)}`;
    return data.find(item => item.label === currentYearLabel);
  };
  const getYearId = async () => {
    setIsLoading(true);
    const token = await AsyncStorage.getItem('token');
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    try {
      const response = await axios.get(
        `${protocol}://${host}:${port}/api/v1/models/C_Year`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      // console.log(response.data.records,'dd')
      const extractedData = response?.data?.records.map(item => ({
        label: item?.FiscalYear,
        value: item?.id,
      }));
      const reversedData = extractedData.reverse();
      const current_year = new Date().getFullYear();
      const currentYearData = extractCurrentYearData(
        reversedData,
        current_year,
      );
      setYears(currentYearData);
      // console.log(currentYearData,"reversedData");
    } catch (error) {
      console.error('Error Year Id:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (partnerId) {
      handleGetAttendance();
    }
  }, [partnerId]);

  useEffect(() => {
    if (location !== null) {
      handleAttendance(Status);
    }
  }, [location]);

  const navigateBack = () => {
    const unsubscribe = navigation.addListener('focus', () => {
      getName();
    });

    return unsubscribe;
  };

  useEffect(() => {
    getName();
    navigateBack();
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
    };
  }, [navigation]);

  // Notification ALI Calling UseEffect
  useEffect(() => {
    notificationAllDataGet();
  }, []);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      console.log('pressedMe');
      notificationAllDataGet(); // Call the function when the screen is focused
    }
  }, [isFocused]);

  // Header Currnet Date
  const newDate = () => {
    const today = new Date();
    const options = {year: 'numeric', month: 'long', day: 'numeric'};
    return today.toLocaleDateString(undefined, options);
  };

  // const renderCategory = ({ title, icon, color, backgroundcolor, onPress }) => (
  //   <TouchableOpacity style={styles.categoryBox} key={title} onPress={onPress}>
  //     <MaterialCommunityIcons name={icon} size={30} color={color} style={{ backgroundColor: backgroundcolor, padding: "5%", paddingHorizontal: "4%", borderRadius: 10 }} />
  //     <Text style={styles.categoryText}>{title}</Text>
  //   </TouchableOpacity>
  // );
  const renderCategory = ({title, icon, color, backgroundcolor, onPress}) => (
    <TouchableOpacity style={styles.categoryBox} onPress={onPress} key={title}>
      <MaterialCommunityIcons
        name={icon}
        size={30}
        color={color}
        style={{
          backgroundColor: backgroundcolor,
          padding: '5%',
          paddingHorizontal: '4%',
          borderRadius: 10,
        }}
      />
      <Text style={styles.categoryText}>{title}</Text>
    </TouchableOpacity>
  );

  const renderTransaction = ({item}) => (
    <View style={[styles.transactionBox, {backgroundColor: '#ECECEC'}]}>
      <Text style={styles.amount}>{item.amount}</Text>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.dateTransaction}>{item.date}</Text>
      </View>
      <View
        style={[
          styles.status,
          item.status === 'Complete'
            ? styles.statusComplete
            : styles.statusPending,
        ]}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.bellIconViewStyle}>
          <TouchableOpacity>
            <Icon name="menu" size={40} color="#fff" />
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={styles.notificationBellViewStyle}
            onPress={() => navigation.navigate('NotificationSrn')}
          >
            <Icon
              name="notifications-outline"
              size={24}
              color="#000"
              style={{ alignSelf: "center" }}
            />
          </TouchableOpacity> */}
          <View style={{position: 'relative'}}>
            <TouchableOpacity
              style={styles.notificationBellViewStyle}
              onPress={() => navigation.navigate('NotificationSrn')}>
              <Icon
                name="notifications-outline"
                size={24}
                color="#000"
                style={{alignSelf: 'center'}}
              />
            </TouchableOpacity>

            {notificationCount > 0 && <View style={styles.redDot} />}
          </View>
        </View>

        {/* Umar.Maqbool and ICON */}
        <View style={styles.profileInfo}>
          <Image
            source={require('../../asserts/HomeScreenAssets/HeaderImage/whiteicon.png')}
            style={{width: 76, height: 70, alignSelf: 'center'}}
          />
          <Text
            style={[
              styles.name,
              {fontSize: 20, marginTop: '4%', color: '#fff'},
            ]}>
            {name}
          </Text>
          <Text style={styles.subtitle}>United Actros Developers</Text>
        </View>

        {/* Date in Home Screen */}
        <View
          style={{
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            marginTop: '10%',
          }}>
          <Text style={styles.dateNewScreen}>{newDate()}</Text>
        </View>
      </View>

      {/* Category List View */}
      <View>
        <Text style={styles.wordCategoriesStyle}> Categories </Text>
      </View>
      <View style={styles.categories}>{categories.map(renderCategory)}</View>

      {/* Transaction Header AND "View ALL" */}
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionTitle}>Transaction</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderTransaction}
        contentContainerStyle={{paddingBottom: 40}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  header: {
    // backgroundColor: '#3E63DD',
    backgroundColor: '#2F4FE3',
    // flexDirection: 'row',
    // alignItems: 'center',
    // justifyContent: 'space-between',
    padding: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    height: '36%',
  },
  bellIconViewStyle: {
    // backgroundColor: "green",
    flexDirection: 'row',
    marginTop: '5%',
    justifyContent: 'space-between',
  },
  notificationBellViewStyle: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  redDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
    borderWidth: 1,
    borderColor: '#fff', // white border for better visibility
    zIndex: 10,
  },
  profileInfo: {
    alignItems: 'center',
    // backgroundColor:"red"
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#D1D5DB',
    fontSize: 16,
    fontWeight: '500',
  },
  wordCategoriesStyle: {
    color: 'black',
    width: '90%',
    alignSelf: 'center',
    marginTop: '4%',
    fontSize: 18,
    fontWeight: 'bold',
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    // marginVertical: 16,
  },
  categoryBox: {
    width: '40%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    alignItems: 'center',
    elevation: 2,
    flexDirection: 'row',
  },
  categoryText: {
    marginTop: 8,
    fontWeight: '600',
    color: '#000',
    paddingLeft: '1%',
    // backgroundColor:"pink",
    width: '73%',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginVertical: 8,
    alignItems: 'center',
    backgroundColor: '#DBE6FF',
    padding: '3%',
    borderRadius: 5,
  },
  transactionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2F4FE3',
  },
  viewAll: {
    color: '#2F4FE3',
    fontWeight: '600',
  },
  dateTransaction: {
    // alignSelf: 'flex-end',
    // marginTop: 8,
    marginRight: 16,
    fontSize: 12,
    // color: '#374151',
    color: '#939393',
  },
  transactionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  amount: {
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 16,
    color: '#000',
  },
  name: {
    fontWeight: '600',
    color: '#000',
  },
  dateNewScreen: {
    // color: '#6B7280',
    fontSize: 16,
    color: '#fff',
  },
  status: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusPending: {
    backgroundColor: '#F1C424',
  },
  statusComplete: {
    backgroundColor: '#29DF8F',
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default HomeScreen;
