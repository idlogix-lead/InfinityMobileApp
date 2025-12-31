import {
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  BackHandler,
  Animated,
  Alert,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import Foundation from 'react-native-vector-icons/Foundation';
import Octicons from 'react-native-vector-icons/Octicons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
// import {BarChart} from 'react-native-chart-kit';
import {Svg, Text as SvgText} from 'react-native-svg';
import Loader from '../../components/Loader';
import moment from 'moment';
import {useFocusEffect} from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const CrmScreen = ({navigation}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [totalLength, setTotalLength] = useState([]);
  const [apiCall, setApiCall] = useState([]);
  const [salesCall, setSalesCall] = useState([]);
  const [newLeadsLength, setNewLeadsLength] = useState([]);
  const [newLeadsData, setNewLeadsData] = useState([]);
  const [convertedLeadsData, setConvertedLeadsData] = useState([]);
  const [expireLeadsData, setExpireLeadsData] = useState([]);
  const [totalLeadsData, setTotalLeadsData] = useState([]);
  const [todayCollapsed, setTodayCollapsed] = useState(true);
  const [futureCollapsed, setFutureCollapsed] = useState(true);
  const [missedCollapsed, setMissedCollapsed] = useState(true);

  const todayAnim = useRef(new Animated.Value(0)).current;
  const futureAnim = useRef(new Animated.Value(0)).current;
  const missedAnim = useRef(new Animated.Value(0)).current;

  // Total Leanth API calls
  //   const TotalLeadAPI = async () => {
  //     const protocol = await AsyncStorage.getItem('protocol');
  //     const host = await AsyncStorage.getItem('host');
  //     const port = await AsyncStorage.getItem('port');
  //     const userId = await AsyncStorage.getItem('userId');
  //     const token = await AsyncStorage.getItem('token');

  //     try {
  //       setIsLoading(true);
  //       const URL = `${protocol}://${host}:${port}/api/v1/models/AD_User?$filter=IsSalesLead eq true and SalesRep_ID eq ${userId}`;
  //       const response = await axios.get(URL, {
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       // Log and store response
  //       if (response.data?.records?.length) {
  //         console.log(
  //           'response ...........',
  //           response.data?.records.map(item => item.id),
  //         );
  //         const allLeads = response.data.records;

  //         const totalLeads = allLeads;
  //         const newleads = allLeads.filter(lead => lead?.LeadStatus?.id === 'N');
  //         const converted = allLeads.filter(lead => lead?.LeadStatus?.id === 'C');
  //         const expire = allLeads.filter(lead => lead?.LeadStatus?.id === 'E');

  //         setTotalLeadsData(totalLeads);
  //         setNewLeadsData(newleads);
  //         setConvertedLeadsData(converted);
  //         setExpireLeadsData(expire);
  //         setTotalLength(response.data['row-count']);
  //         setNewLeadsLength(newleads.length);

  //         console.log(expire, 'converted data show...............');
  //       } else {
  //         console.log('No records found.');
  //       }
  //     } catch (error) {
  //       console.log(error, 'CRM data get error');
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  // Followups API Call
  //   const FollowupsAPI = async () => {
  //     const protocol = await AsyncStorage.getItem('protocol');
  //     const host = await AsyncStorage.getItem('host');
  //     const port = await AsyncStorage.getItem('port');
  //     // const userId = await AsyncStorage.getItem('userId');
  //     const token = await AsyncStorage.getItem('token');

  //     try {
  //       const URL = `${protocol}://${host}:${port}/api/v1/models/C_ContactActivity`;
  //       const response = await axios.get(URL, {
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       // Log and store response
  //       if (response.data?.records) {
  //         setApiCall(response.data.records);
  //         // console.log('API response:', response.data.records[0]);
  //         console.log('Followups API response:', response.data.records);
  //       } else {
  //         console.warn(' Second API No records found.');
  //       }
  //     } catch (error) {
  //       console.log(error, 'Followup data get error');
  //     }
  //   };
  // Delete Activity API Call
  //   const deleteActivity = async id => {
  //     const protocol = await AsyncStorage.getItem('protocol');
  //     const host = await AsyncStorage.getItem('host');
  //     const port = await AsyncStorage.getItem('port');
  //     const token = await AsyncStorage.getItem('token');

  //     try {
  //       const URL = `${protocol}://${host}:${port}/api/v1/models/C_ContactActivity/${id}`;
  //       await axios.delete(URL, {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       Alert.alert('Deleted', 'Activity deleted successfully!');
  //       // Refresh the list after deletion
  //       FollowupsAPI();
  //     } catch (error) {
  //       console.log('Delete error:', error.response?.data || error.message);
  //       Alert.alert('Error', 'Something went wrong while deleting.');
  //     }
  //   };

  // Sale Graph API
  //   const salesAPI = async () => {
  //     const protocol = await AsyncStorage.getItem('protocol');
  //     const host = await AsyncStorage.getItem('host');
  //     const port = await AsyncStorage.getItem('port');
  //     // const userId = await AsyncStorage.getItem('userId');
  //     const token = await AsyncStorage.getItem('token');

  //     try {
  //       const URL = `${protocol}://${host}:${port}/api/v1/models/C_Opportunity`;
  //       const response = await axios.get(URL, {
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       // Log and store response
  //       if (response.data?.records) {
  //         setSalesCall(response.data.records);
  //         // console.log('API response:', response.data.records[0]);
  //         console.log('Sales Opportunity API response:', response.data.records);
  //       } else {
  //         console.warn('Third API No records found.');
  //       }
  //     } catch (error) {
  //       console.log(error, 'Graph API data get error');
  //     }
  //   };

  //   useFocusEffect(
  //     React.useCallback(() => {
  //       // useEffect(() => {
  //       TotalLeadAPI();
  //       FollowupsAPI();
  //       salesAPI();
  //     }, []),
  //   );

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, []);

  const handleBackPress = () => {
    navigation.goBack();
  };

  // OpportunityAmt Function
  const totalOpportunity = salesCall.reduce((sum, item) => {
    const amount = parseFloat(item?.OpportunityAmt) || 0;
    return sum + amount;
  }, 0);

  const monthlyOpportunities = [
    20.5, 35.2, 50.1, 45.3, 60.8, 75.0, 80.9, 55.2, 90.1, 40.4, 65.6, 70.3,
  ];
  // FollowUps toggle function
  const toggleSection = (collapsed, setCollapsed, anim) => {
    setCollapsed(!collapsed);
    Animated.timing(anim, {
      toValue: collapsed ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const getRotation = anim =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

  // Followups filter
  //   const today = moment().startOf('day');

  //   const todayFollowups = apiCall.filter(item => {
  //     const start = moment(item.StartDate);
  //     const end = item.EndDate ? moment(item.EndDate) : start; // fallback if no EndDate
  //     return (
  //       start.isSameOrBefore(today, 'day') &&
  //       end.isSameOrAfter(today, 'day') &&
  //       item.IsComplete === false
  //     );
  //   });

  //   const futureFollowups = apiCall.filter(item => {
  //     const start = moment(item.StartDate);
  //     return start.isAfter(today, 'day') && item.IsComplete === false;
  //   });

  //   const missedFollowups = apiCall.filter(item => {
  //     const end = item.EndDate ? moment(item.EndDate) : moment(item.StartDate);
  //     return end.isBefore(today, 'day') && item.IsComplete === false;
  //   });
  //   // FollowUPs Card
  //   const renderFollowupCard = item => (
  //     <View key={item?.id} style={styles.followupCard}>
  //       {/* Activity Task Text */}
  //       <View style={styles.cardHeader}>
  //         <Text style={styles.taskTitle}>
  //           {item.ContactActivityType.identifier}
  //         </Text>
  //         {/* Task Edit Button */}
  //         <TouchableOpacity
  //           onPress={() =>
  //             navigation.navigate('CrmActivitySrn', {data: item, mode: 'edit'})
  //           }>
  //           <Feather name="edit-3" size={20} color={'#a135b1'} />
  //         </TouchableOpacity>
  //       </View>
  //       <Text style={{color: 'gray'}}>{item.AD_User_ID.identifier}</Text>
  //       <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
  //         {/* Created Date */}
  //         <View style={{flexDirection: 'row', marginTop: 7}}>
  //           <Text style={{marginTop: 8}}>
  //             <AntDesign name="calendar" size={19} color={'#82ced9'} />
  //           </Text>
  //           <View style={styles.date}>
  //             <Text style={{color: '#000', fontWeight: 'bold', fontSize: 13}}>
  //               Created Date
  //             </Text>
  //             <Text style={styles.dateText}>
  //               {moment(item.Created).format('DD MMM YYYY')}
  //             </Text>
  //           </View>
  //         </View>
  //         {/* Delete Button */}
  //         <TouchableOpacity
  //           style={{marginTop: 15}}
  //           onPress={() =>
  //             Alert.alert(
  //               'Confirm Delete',
  //               'Are you sure you want to delete this activity?',
  //               [
  //                 {text: 'Cancel', style: 'cancel'},
  //                 {text: 'Delete', onPress: () => deleteActivity(item.id)},
  //               ],
  //             )
  //           }>
  //           <MaterialCommunityIcons name="delete" size={25} color={'#000'} />
  //         </TouchableOpacity>
  //       </View>
  //       {/* Start Date */}
  //       <View style={{flexDirection: 'row'}}>
  //         <View style={{flexDirection: 'row', marginTop: 7}}>
  //           <Text style={{marginTop: 8}}>
  //             <AntDesign name="calendar" size={19} color={'#82ced9'} />
  //           </Text>
  //           <View style={styles.date}>
  //             <Text style={{color: '#000', fontWeight: 'bold', fontSize: 13}}>
  //               Start Date
  //             </Text>
  //             <Text style={styles.dateText}>
  //               {moment(item.StartDate).format('DD MMM YYYY')}
  //             </Text>
  //           </View>
  //         </View>
  //         {/* End Date */}
  //         <View style={{flexDirection: 'row', marginTop: 7, marginLeft: 17}}>
  //           <Text style={{marginTop: 8}}>
  //             <AntDesign name="calendar" size={19} color={'#82ced9'} />
  //           </Text>
  //           <View style={styles.date}>
  //             <Text style={{color: '#000', fontWeight: 'bold', fontSize: 13}}>
  //               End Date
  //             </Text>
  //             <Text style={styles.dateText}>
  //               {moment(item.EndDate).format('DD MMM YYYY')}
  //             </Text>
  //           </View>
  //         </View>
  //       </View>
  //       {/* Description */}
  //       <View style={{marginTop: 7}}>
  //         <Text
  //           style={{
  //             color: '#000',
  //             marginRight: 7,
  //             fontWeight: 'bold',
  //             fontSize: 14,
  //           }}>
  //           Description:
  //         </Text>
  //         <Text
  //           style={{color: '#000', fontSize: 13}}
  //           numberOfLines={1}
  //           ellipsizeMode="tail">
  //           {item.Description}
  //         </Text>
  //       </View>
  //     </View>
  //   );

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <TouchableOpacity onPress={handleBackPress} style={{marginRight: 5}}>
            <Ionicons name="chevron-back" size={25} color={'black'} />
          </TouchableOpacity>
          <Image
            source={require('../../asserts/Crm/7084424.png')}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.username}>Umer Maqbool</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Feather name="bell" size={25} color={'black'} />
        </TouchableOpacity>
      </View>

      {/* Sales Chart Section */}
      {/* <View>
        <View style={styles.salesContainer}>
          <View style={styles.SaleCard}>
            <View>
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={{
                    backgroundColor: '#69c9ca',
                    height: 36,
                    width: 36,
                    borderRadius: 18,
                    textAlign: 'center',
                    marginTop: -5,
                    paddingTop: 5,
                  }}>
                  <Foundation name="dollar" size={25} color={'#fff'} />
                </Text>
                <Text style={styles.salesTitle}>Total Sales</Text>
              </View>
              <Text style={styles.salesAmount}>
                Rs: {totalOpportunity.toFixed(2)}
              </Text>
            </View>
            <View style={styles.opportunityValue}>
              <Text style={{color: '#000'}}>
                Rs: {totalOpportunity.toFixed(2)}
              </Text>
            </View>
          </View>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            API K sath graph
            <BarChart
              data={{
                labels: [
                  'Jan',
                  'Feb',
                  'Mar',
                  'Apr',
                  'May',
                  'Jun',
                  'Jul',
                  'Aug',
                  'Sep',
                  'Oct',
                  'Nov',
                  'Dec',
                ],
                datasets: [
                  {
                    data: monthlyOpportunities,
                  },
                ],
              }}
              width={screenWidth * 2}
              height={210}
              yAxisLabel="Rs: "
              chartConfig={{
                backgroundGradientFrom: '#f4fafa',
                backgroundGradientTo: '#f4fafa',
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                barPercentage: 0.5,
              }}
              withInnerLines={true}
              withVerticalLabels={true}
              showBarTops={true}
              style={styles.chart}
              decorator={() => {
                return monthlyOpportunities.map((value, index) => {
                  const barWidth = (screenWidth * 2) / 12;
                  return (
                    <Svg
                      key={index}
                      height="250"
                      width={screenWidth * 2}
                      style={{position: 'absolute'}}>
                      <SvgText
                        x={barWidth * index + barWidth / 2}
                        y={250 - value * 2 - 10} // Adjust the position above bar
                        fontSize="12"
                        fill="black"
                        textAnchor="middle">
                        {value.toFixed(0)}
                      </SvgText>
                    </Svg>
                  );
                });
              }}
            />
          </ScrollView>
        </View>
      </View> */}

      {/* Leads Section */}
      <View style={styles.leadsContainer}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(
              'CrmTotal',
              //     , {
              //     totalLeads: totalLeadsData,
              //   }
            );
          }}
          style={styles.leadCard}>
          <View style={{flexDirection: 'row'}}>
            <Image
              style={styles.leadImage}
              source={require('../../asserts/Crm/newleads.png')}
            />
            <View>
              <Text style={styles.leadText}>Total</Text>
              <Text style={styles.leadText}>Leads</Text>
            </View>
          </View>
          <Text style={styles.leadNumber}>{totalLength}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(
              'CrmNew',
              //     , {
              //     newLeads: newLeadsData,
              //   }
            );
          }}
          style={[styles.leadCard, {backgroundColor: '#ebecf9'}]}>
          <View style={{flexDirection: 'row'}}>
            <Image
              style={styles.leadImage}
              source={require('../../asserts/Crm/leads.png')}
            />
            <View>
              <Text style={styles.leadText}>New</Text>
              <Text style={styles.leadText}>Leads</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginLeft: '30%',
                backgroundColor: '#fff',
                height: 30,
                width: 30,
                borderRadius: 15,
                justifyContent: 'center',
                paddingTop: 2,
              }}>
              <Text>
                <Ionicons name="add-outline" size={25} color={'black'} />
              </Text>
              {/* <Text style={{color: 'black', width: '60%'}}>Add New Leads</Text> */}
            </View>
          </View>
          <Text style={styles.leadNumber}>{newLeadsLength}</Text>
        </TouchableOpacity>
      </View>

      {/* Converted & Expire Leads Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(
              'CrmConverted',
              //     , {
              //     convertedLeads: convertedLeadsData,
              //   }
            );
          }}
          style={[styles.leadCard, {backgroundColor: '#d4edda'}]}>
          <View style={{flexDirection: 'row'}}>
            <View style={styles.buttonIcon}>
              <Octicons name="sync" size={20} color={'black'} />
            </View>
            <View>
              <Text
                style={{
                  color: '#000',
                  marginLeft: 5,
                  fontWeight: 'bold',
                  fontSize: 15,
                }}>
                Converted
              </Text>
              <Text
                style={{
                  color: '#000',
                  marginLeft: 5,
                  fontWeight: 'bold',
                  fontSize: 15,
                }}>
                Leads
              </Text>
            </View>
          </View>
          {/* <Entypo name="chevron-right" size={20} color={'black'} /> */}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(
              'CrmExpire',
              //     , {
              //     expireLeads: expireLeadsData,
              //   }
            );
          }}
          style={[styles.leadCard, {backgroundColor: '#f8d7da'}]}>
          <View style={{flexDirection: 'row'}}>
            <View style={styles.buttonIcon}>
              <MaterialCommunityIcons name="cancel" size={21} color={'black'} />
            </View>
            <View>
              <Text style={{color: '#000', marginLeft: 5, fontWeight: 'bold'}}>
                Expire
              </Text>
              <Text style={{color: '#000', marginLeft: 5, fontWeight: 'bold'}}>
                Leads
              </Text>
            </View>
          </View>
          {/* <Entypo name="chevron-right" size={20} color={'black'} /> */}
        </TouchableOpacity>
      </View>

      {/* Follow-ups Section */}

      <Text
        style={{
          fontSize: 20,
          fontWeight: 'bold',
          marginLeft: 10,
          marginBottom: 3,
          color: '#000',
        }}>
        Followups
      </Text>

      <ScrollView style={{backgroundColor: '#f8f8f8', padding: 10}}>
        {/* Today FollowUp */}
        <TouchableOpacity
          onPress={() =>
            toggleSection(todayCollapsed, setTodayCollapsed, todayAnim)
          }
          style={styles.toggleBtn}>
          <Text style={styles.toggleTitle}>Today's Followup</Text>
          <Animated.View
            style={{
              transform: [{rotate: getRotation(todayAnim)}],
            }}>
            <AntDesign name="down" size={15} color={'#000'} />
          </Animated.View>
        </TouchableOpacity>
        {/* {!todayCollapsed && todayFollowups.map(renderFollowupCard)} */}

        {/* Future FollowUp */}
        <TouchableOpacity
          onPress={() =>
            toggleSection(futureCollapsed, setFutureCollapsed, futureAnim)
          }
          style={styles.toggleBtn}>
          <Text style={styles.toggleTitle}>Future Followup</Text>
          <Animated.View
            style={{
              transform: [{rotate: getRotation(futureAnim)}],
            }}>
            <AntDesign name="down" size={15} color={'#000'} />
          </Animated.View>
        </TouchableOpacity>
        {/* {!futureCollapsed && futureFollowups.map(renderFollowupCard)} */}

        {/* Missed FillowUp */}
        <TouchableOpacity
          onPress={() =>
            toggleSection(missedCollapsed, setMissedCollapsed, missedAnim)
          }
          style={styles.toggleBtn}>
          <Text style={styles.toggleTitle}>Missed Followup</Text>
          <Animated.View
            style={{
              transform: [{rotate: getRotation(missedAnim)}],
            }}>
            <AntDesign name="down" size={15} color={'#000'} />
          </Animated.View>
        </TouchableOpacity>

        {/* {!missedCollapsed && missedFollowups.map(renderFollowupCard)} */}
      </ScrollView>

      {isLoading ? <Loader /> : null}
    </View>
  );
};
export default CrmScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    marginTop: 25,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  welcomeText: {
    fontSize: 12,
    color: '#b3b3b3',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  salesContainer: {
    backgroundColor: '#f4fafa',
    borderRadius: 10,
    margin: 10,
    borderWidth: 2,
    borderColor: 'gray',
    marginTop: -5,
  },
  SaleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingLeft: 20,
  },
  opportunityValue: {
    height: 29,
    borderRadius: 15,
    backgroundColor: '#f9def4',
    right: 10,
    padding: 5,
    paddingLeft: 10,
    paddingRight: 10,
  },
  salesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  salesAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  chart: {
    alignSelf: 'center',
  },
  leadsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  leadCard: {
    backgroundColor: '#ece3f0',
    padding: 10,
    borderRadius: 10,
    width: '45%',
    height: '100%',
  },
  leadImage: {
    backgroundColor: '#fff',
    height: 30,
    width: 30,
    borderRadius: 15,
    marginTop: 5,
    marginRight: 5,
  },
  leadText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
  },
  leadNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 3,
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    height: 80,
  },
  convertedButton: {
    backgroundColor: '#d4edda',
    padding: 10,
    borderRadius: 20,
    height: 39,
    width: 177,
    flexDirection: 'row',
  },
  buttonIcon: {
    backgroundColor: '#fff',
    height: 22,
    width: 22,
    borderRadius: 11,
    paddingLeft: 1,
    marginTop: 8,
  },
  cancelledButton: {
    backgroundColor: '#f8d7da',
    padding: 10,
    borderRadius: 20,
    height: 39,
    width: 177,
    flexDirection: 'row',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 10,
    color: '#000',
  },
  sectionTitleText: {
    color: 'black',
    fontStyle: 'italic',
    marginLeft: 10,
  },
  toggleBtn: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  followupCard: {
    backgroundColor: '#f3f3f3',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#dcdcdc',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
  },
  date: {
    paddingLeft: 5,
  },
  dateText: {
    color: 'gray',
    fontSize: 14,
  },
});
