import { StyleSheet, Text, View, Dimensions, BackHandler, ActivityIndicator, PermissionsAndroid, TouchableOpacity,Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import TopHeader from '../../components/HomeScreenComponents/TopHeader'
import NameContainer from '../../components/HomeScreenComponents/NameContainer'
import HomeCard from '../../components/HomeScreenComponents/HomeCard'
import HomeNotifyCard from '../../components/HomeScreenComponents/HomeNotifyCard'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Entypo from 'react-native-vector-icons/Entypo';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios'




const currentDate = new Date();
const options = { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' };
const formattedDate = currentDate.toLocaleDateString('en-US', options);


const HomeScreen = ({ navigation, route }) => {
  const { tokenOk, token, roleId } = route.params
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const [approvalNum, setApprovalNum] = useState()
  const [protocol, setProtocol] = useState()
  const [reqNum, setReqNum] = useState()
  const [host, setHost] = useState()
  const [clientName, setClientName] = useState('')
  const [port, setPort] = useState()
  const [checkinout, setCheckinout] = useState(false);
  const [location, setLocation] = useState(null);
  const [partnerId, setPartnerId] = useState(null);
  const [years, setYears] = useState([]);
  const [Status,setStatus]=useState(null)


  const getName = async () => {
    const value = await AsyncStorage.getItem('userName');
    const protocol = await AsyncStorage.getItem('protocol')
    setClientName(await AsyncStorage.getItem('clientNameSelected'))
    const host = await AsyncStorage.getItem('host')
    const port = await AsyncStorage.getItem('port')
    const userId = await AsyncStorage.getItem('userId')
    setProtocol(protocol)
    setHost(host)
    setPort(port)
    setName(value)
    getApprovalNum(protocol, host, port)
    getReqNum(protocol, host, port, userId)
    getAtsNum(protocol, host, port, userId)
  }


  const handleBackButton = () => {
    BackHandler.exitApp();
    return true;
  }

  const getApprovalNum = async (protocol, host, port) => {
    setIsLoading(true)
    await fetch(`${protocol}://${host}:${port}/api/v1/models/mbl_workflow_v?$filter= AD_Role_ID eq ${roleId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        // console.log("Data",JSON.stringify(data),"Data")
        setApprovalNum(data['array-count'])
        setIsLoading(false)
      })
      .catch(error => {
        console.error(error)
        setIsLoading(false)
      });
  }

  const getReqNum = async (protocol, host, port, userId) => {
    fetch(`${protocol}://${host}:${port}/api/v1/models/R_Request?$filter=CreatedBy eq ${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {

        let record = data.records
        const filteredData = record.filter(record => record.R_Status_ID.id !== 1000003);
        const lengthOfFilteredData = filteredData.length;
        // setReqNum(lengthOfFilteredData)
      })
      .catch(error => console.error(error));
  }

  const getAtsNum = async (protocol, host, port, userId) => {
    fetch(`${protocol}://${host}:${port}/api/v1/models/mbl_request_view_v?$filter=Supervisor_ID eq ${userId} OR SalesRep_ID eq ${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        return response.json();
      })
      .then(data => {

        let record = data.records
        setReqNum(record.length)


      })
      .catch(error => {
        console.log(error)
        setIsLoading(false)
      });
    setIsLoading(false)

  }

  const Approval = async () => {
    setIsLoading(true)
    await fetch(`${protocol}://${host}:${port}/api/v1/models/mbl_workflow_v?$filter= AD_Role_ID eq ${roleId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        const dataArray = data.records
        const tableIdsToSupplyChain = [702, 259, 319];
        const filteredArraySupply = dataArray.filter(obj => tableIdsToSupplyChain.includes(obj.AD_Table_ID.id));

        const tableIdsAccount = [335, 318, 224]
        const filteredArrayAccount = dataArray.filter(obj => tableIdsAccount.includes(obj.AD_Table_ID.id));
        // navigation.navigate('ApprovalScreens', { token, filteredArraySupply, filteredArrayAccount, tokenOk, roleId })
        navigation.navigate('AllApprovalList')
        setIsLoading(false)
      })
      .catch(error => {
        console.error(error)
        navigation.navigate('ApprovalScreens')
        setIsLoading(false)
      });
  }
  const FindBusinessPrtId = async () => {
    const token = await AsyncStorage.getItem('token');
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const Id = await AsyncStorage.getItem("userId");
    console.log("token", token, "token")

    try {
      const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/AD_User?$filter=AD_User_ID eq ${Id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        console.log(response?.data?.records[0]?.C_BPartner_ID?.id,'ad')
      setPartnerId(response?.data?.records[0]?.C_BPartner_ID?.id)

    } catch (error) {
      console.error('Error efe:', error);
    }
  };
  const handleAttendance = async (Status) => {
    // setCheckinout(!checkinout);
    // console.log(location);
    setLocation(null)

    const date = new Date();
    const token = await AsyncStorage.getItem('token')
    const protocol = await AsyncStorage.getItem('protocol')
    const host = await AsyncStorage.getItem('host')
    const port = await AsyncStorage.getItem('port')
    const Id = await AsyncStorage.getItem("userId")
    const clientid = await AsyncStorage.getItem('clientId');
    const org_id = await AsyncStorage.getItem('organizationId');
    // Format current date as YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0];

    // Format current time as HH:mm:ss in 24-hour format
    // const formattedTime = date.toTimeString().split(' ')[0];

console.log(date,'date')
    // console.log('tkn', token)
    const formattedTime = date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    });
    const formattedDateTime = date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      // hour: '2-digit',
      // minute: '2-digit',
      hour12: false
    });
    const formattedDateTime2 = date.toLocaleString('en-US', {
      // year: 'numeric',
      // month: '2-digit',
      // day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    try {
      console.log(date,'first')
      const payload = {
        "AD_Client_ID": parseInt(clientid),
        "AD_Org_ID": parseInt(org_id),
        "C_BPartner_ID": parseInt(partnerId),
        'C_Year_ID': { 'id': "1000014", 'identifier': "2024" },
        // 'C_Year_ID': { 'id': `${years.value}`, 'identifier': `${years.label}` },
        "MyConDate": `${formattedDateTime} ${formattedDateTime2}`,
        "AttDate": formattedDate,
        "AttTime": formattedTime,
        "AttStatus": Status,
        "AttActivity": "000",
        "latitude": location?.latitude,
        "longitude": location?.longitude
      }
      console.log(payload, "payload");
      setIsLoading(true);
      const response = await axios.post(`${protocol}://${host}:${port}/api/v1/models/HR_Daily_Attend`, payload,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },

        })
      // console.log(token,'too')
      // console.log(response.data,'res')
      // setAttendanceRecords(response.data.records);
      if (response.data) {
        setLocation(null)
        if(Status==="IN"){
          Alert.alert('Check-In Successful', 'Your check-in has been successfully recorded.');
        }else{
          Alert.alert('Check-Out Successful', 'Your check-Out has been successfully recorded.');
        }
        
      }
    } catch (error) {
      console.log('Error', error)
    } finally {
      setLocation(null)
       await handleGetAttendance();
      setIsLoading(false);
    }


  }

  const handleGetAttendance = async () => {
    const date = new Date();
    const token = await AsyncStorage.getItem('token');
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const Id = await AsyncStorage.getItem("userId");
    const clientid = await AsyncStorage.getItem('clientId');
    const org_id = await AsyncStorage.getItem('organizationId');
  
    try {
      // $top=1 ensures only the latest record is fetched
      const filterQuery = `$filter=AD_Client_ID eq ${clientid} and AD_Org_ID eq ${org_id} and C_BPartner_ID eq ${partnerId}`;
      console.log(filterQuery,'dd')
      setIsLoading(true);
      const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/HR_Daily_Attend?$orderby=Created desc&$top=1&${filterQuery}`,
        { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
  
      console.log(response?.data.record, 'records');
      if(response?.data?.records[0]?.AttStatus?.identifier === 'IN'){
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


  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        console.log("Location:", latitude, longitude); // You can remove this or replace it with any other logic
      },
      (error) => {
        console.log(error.code, error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };
  const requestLocationPermission = async (Status) => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "This app needs access to your location",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setStatus(Status)
        getCurrentLocation();
      } else {
        console.log("Location permission denied");
        Alert.alert('Location permission denied', 'Go on App settings and turn on Location');
      }
    } else {
      getCurrentLocation();
    }
  };
  const extractCurrentYearData = (data, currentYear) => {
    const currentYearLabel = `${currentYear - 1}/${currentYear.toString().slice(-2)}`;
    return data.find(item => item.label === currentYearLabel);
  };
  const getYearId = async () => {
    setIsLoading(true);
    const token = await AsyncStorage.getItem('token');
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    try {
      const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/C_Year`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      // console.log(response.data.records,'dd')
      const extractedData = response?.data?.records.map(item => ({
        label: item?.FiscalYear,
        value: item?.id
      }));
      const reversedData = extractedData.reverse();
      const current_year = new Date().getFullYear();
      const currentYearData = extractCurrentYearData(reversedData, current_year);
      setYears(currentYearData);
      // console.log(currentYearData,"reversedData");
    } catch (error) {
      console.error('Error Year Id:', error);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {

    FindBusinessPrtId();
    // getCurrentLocation();
    getYearId();

  }, []);
  useEffect(()=>{

    handleGetAttendance();

  },[partnerId])
  useEffect(()=>{
    if (location!==null) {
      handleAttendance(Status)
    }

  },[location])


  const navigateBack = () => {
    const unsubscribe = navigation.addListener('focus', () => {
      getName()
    });

    return unsubscribe;
  }

  useEffect(() => {
    getName()
    navigateBack()
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
    };
  }, [navigation])

  return (
    <>
      {isLoading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#0050C0" />
        </View>
      )}
      {!isLoading && (
        <View style={{ flex: 1 }}>


          <View style={styles.headerView}>
            <View style={{ width: '100%', marginTop: 30 }}>
              <View style={{ flexDirection: 'row', width: '100%' }}>
                <View style={{ width: '20%' }}></View>
                <View style={{ width: '60%', alignSelf: 'center' }}><Text style={{ textAlign: 'center', fontSize: 36, color: 'white', fontFamily: 'K2D-BoldItalic' }}>Infinity</Text></View>
                <View style={{ width: '20%', flexDirection: 'row', alignItems: "center", justifyContent: 'center' }}>

                </View>
              </View>
            </View>


            <View style={{ flexDirection: 'row' }} >
              <View style={styles.titleContainer}>
                <View style={{ flexDirection: 'row', width: '100%' }}>
                  <Text style={styles.title}>Hello, {name}</Text>

                </View>
                <View style={{ flexDirection: 'row', width: '100%' }}>
                  <Text style={styles.dateTitle}>{formattedDate}</Text>
                  <View style={styles.markBtn}>
                    {checkinout ? (
                      <TouchableOpacity onPress={() => { requestLocationPermission("IN") }} style={[{ backgroundColor: '#00B0F0' }, styles.markBtn2]}>
                        <Entypo name="login" size={15} color="#fff" />
                        <Text style={{ color: '#fff',fontSize:12 }}>Check In</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity onPress={() => { requestLocationPermission("OUT") }} style={[{ backgroundColor: '#00B0F0' }, styles.markBtn2]}>
                        <Entypo name="log-out" size={15} color="#fff" />
                        <Text style={{ color: '#fff',fontSize:12 }}>Check Out</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

              </View>
            </View>


          </View>
          <View style={styles.CardContainer}>
            <View style={styles.Card}>
              <HomeCard
                // onPress={() => navigation.navigate('ReportMain')}
                iconName="file-document-outline"
                txt="Reports"
                iconColor="#ba87e0"
                iconBackgroundColor="#e8e4eb"
              />
              <HomeCard
                iconName="cash"
                txt="Transaction"
                iconColor="#11d124"
                iconBackgroundColor="#e3f5d0"
              />

            </View>
            <View style={{ flexDirection: 'row', width: '85%', justifyContent: 'space-between', marginTop: 30 }}>

              <HomeCard
                onPress={() => navigation.navigate('EmployeePortal')}
                iconName="atom-variant"
                txt="Employee Portal"
                iconColor="#44a0e3"
                iconBackgroundColor="#d8e7ed"
              />


              <HomeNotifyCard
                iconName="check-circle-outline"
                txt="Approvals"
                iconColor="#b05546"
                iconBackgroundColor="#eddbd8"
                num={approvalNum}
                // clickHandler={() => Approval()}
              />
            </View>
            <View style={{ flexDirection: 'row', width: '85%', justifyContent: 'space-between', marginTop: 30 }}>
              <HomeNotifyCard
                iconName="database"
                txt="ATS"
                iconColor="green"
                iconBackgroundColor="#defce0"
                num={reqNum}
                // clickHandler={() => navigation.navigate('AllTaskScreen', { token })}
              />

              <HomeCard
                iconName="bell-circle-outline"
                txt="Notification"
                iconColor="#ded731"
                iconBackgroundColor="#f5f4da"
              />
            </View>
            {/* <TouchableOpacity>
              <View style={{ backgroundColor: 'red', height: 70, width: 90, alignItems: "center", justifyContent: "center" }}>
                <Text>
                  Attandance
                </Text>
              </View>
            </TouchableOpacity> */}
          </View>
        </View>

        // <View style={{ flex: 1, backgroundColor: 'white' }}>
        //   <TopHeader />
        //   <NameContainer name={name} clientName={clientName} />
        //   <View style={{ alignItems: 'center', marginTop: 5 }}>
        //     <View style={{ width: '95%' }}>
        //       <Text style={styles.txt}>Driving Force Of Your Business</Text>
        //     </View>
        //   </View>
        //   <View style={{ alignItems: 'center', marginTop: 20,backgroundColor:'#fff',height:'70%',width:'100%',borderTopLeftRadius:30,borderTopRightRadius:30,elevation:4 }}>
        //     <View style={{ width: '95%', justifyContent: 'center', alignItems: 'center', marginTop: 20, }}>

        //       <View style={{ flexDirection: 'row', width: '85%', justifyContent: 'space-between', }}>
        //         <HomeCard source={require('../../asserts/HomeScreenAssets/CardAssets/Report.png')} txt="Reports" />
        //         <HomeCard source={require('../../asserts/HomeScreenAssets/CardAssets/Transaction.png')} txt="Transaction" />
        //       </View>

        //       <View style={{ flexDirection: 'row', width: '85%', justifyContent: 'space-between', marginTop: 30 }}>
        //         <HomeCard source={require('../../asserts/HomeScreenAssets/CardAssets/Male.png')} txt="Portal" />
        //         <HomeNotifyCard source={require('../../asserts/HomeScreenAssets/CardAssets/Approval.png')}
        //           txt="Approvals"
        //           num={approvalNum}
        //           clickHandler={() => Approval()}
        //         />
        //       </View>

        //       <View style={{ flexDirection: 'row', width: '85%', justifyContent: 'space-between', marginTop: 30 }}>
        //         <HomeNotifyCard source={require('../../asserts/HomeScreenAssets/CardAssets/Volume.png')}
        //           txt="ATS"
        //           clickHandler={() => navigation.navigate('UserList', { token })}
        //           num={reqNum}
        //         />
        //         <HomeNotifyCard source={require('../../asserts/HomeScreenAssets/CardAssets/Alarm.png')} txt="Notification" />
        //       </View>
        //     </View>
        //   </View>
        // </View>
      )}
    </>

  )
}

export default HomeScreen

const styles = StyleSheet.create({
  txt: {
    fontSize: 20,
    color: '#000000',
    fontFamily: 'K2D-Bold'
  },
  headerView:
  {
    flex: 1,
    backgroundColor: '#0050C0',
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
  titleContainer:
  {

    paddingHorizontal: 20,
    // flexDirection:'row'
  },
  title:
  {
    color: 'white',
    fontSize: 22,
    marginBottom: 3,
    fontFamily: 'K2D-Bold'
  },
  dateTitle: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'K2D'
  },
  CardContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    bottom: 40
  },
  Card: {
    flexDirection: 'row',
    width: '85%',
    justifyContent: 'space-between',
  },
  markBtn: {
    height: 40,
    width: 100,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 'auto',
    borderRadius: 10,
    flexDirection: 'row',
    paddingHorizontal: 10
  },
  markBtn2: {
    height: 40,
    width: 90,
    alignItems: 'center',
    justifyContent: 'space-between',
    // marginLeft:'auto',
    borderRadius: 10,
    flexDirection: 'row',
    paddingHorizontal: 6,
    // fontSize:10
  },
})