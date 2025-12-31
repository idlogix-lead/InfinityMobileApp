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
  ImageBackground,
  StatusBar,
  FlatList,
  Linking,
  Switch,
  TextInput,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import Entypo from 'react-native-vector-icons/Entypo';
import Foundation from 'react-native-vector-icons/Foundation';
import Octicons from 'react-native-vector-icons/Octicons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import CheckBox from '@react-native-community/checkbox';
// import {BarChart} from 'react-native-chart-kit';
import {Svg, Text as SvgText} from 'react-native-svg';
import Loader from '../../components/Loader';
import moment from 'moment';
import {useFocusEffect} from '@react-navigation/native';
import {set} from 'date-fns';
import {BarChart} from 'react-native-chart-kit';
import ExpandableSearch from '../../components/CRMSearch/ExpandableSearch';
import EarningChart from '../../components/CRMSearch/CRMChart/EarningChart';
import FollowupSection from '../../components/CRMFollowups/FollowupSection';
import {color} from 'react-native-elements/dist/helpers';
import MissedFollowUp from '../CRMFollowupsScreen/MissedFollowup';
import CRMCard from '../../components/CRMCard/CRMCard';
import {Provider} from 'react-native-paper';
import SalesCalendar from '../../components/CRMSalesCalendar/SalesCalendar';
import SalesOpper from '../SalesOppertunity/SalesOpper';
import CompleteCheck from '../../components/CRMCard/CompleteCheck';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Picker} from '@react-native-picker/picker';
import AddOppor from '../SalesOppertunity/AddOpper';

const screenWidth = Dimensions.get('window').width;

const CrmScreen = ({navigation}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [totalLength, setTotalLength] = useState([]);
  const [apiCall, setApiCall] = useState([]);
  const [activityCount, setActivityCount] = useState(false);
  const [salesCall, setSalesCall] = useState([]);
  const [newLeadsLength, setNewLeadsLength] = useState([]);
  const [convertedLeadLength, setConvertedLeadLength] = useState(0);
  const [expiryLeadLength, setExpiryLeadLength] = useState(0);
  const [workingLeadLength, setWorkingLeadLength] = useState(0);
  const [newLeadsData, setNewLeadsData] = useState([]);
  const [convertedLeadsData, setConvertedLeadsData] = useState([]);
  const [expireLeadsData, setExpireLeadsData] = useState([]);
  const [workingLeadsData, setWorkingLeadsData] = useState([]);
  const [workingCollapsed, setWorkingCollapsed] = useState([]);
  const [totalCollapsed, setTotalCollapsed] = useState([]);

  const [newCollapsed, setNewCollapsed] = useState([]);
  const [convertedCollapsed, setConvertedCollapsed] = useState([]);

  const [totalLeadsData, setTotalLeadsData] = useState([]);
  const [todayCollapsed, setTodayCollapsed] = useState(true);
  const [futureCollapsed, setFutureCollapsed] = useState(true);
  const [missedCollapsed, setMissedCollapsed] = useState(true);
  const [userName, setUserName] = useState('');
  const [showNewLeadsOnSamePage, setShowNewLeadsOnSamePage] = useState(false);
  const [showSalesCard, setShowSalesCard] = useState(false);
  const [showCRMCard, setShowCRMCard] = useState(true);
  const [showOverviewCard, setShowOverviewCard] = useState(false);

  const [filteredData, setFilteredData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [active, setActive] = useState('Leads');

  const todayAnim = useRef(new Animated.Value(0)).current;
  const futureAnim = useRef(new Animated.Value(0)).current;
  const missedAnim = useRef(new Animated.Value(0)).current;

  const workingAnim = useRef(new Animated.Value(0)).current;
  const totalAnim = useRef(new Animated.Value(0)).current;

  const newAnim = useRef(new Animated.Value(0)).current;
  const convertedAnim = useRef(new Animated.Value(0)).current;

  // In parent component
  const [followups, setFollowups] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [tempName, setTempName] = useState('');
  const [tempDescription, setTempDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeItemId, setActiveItemId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [tempFollowUp, setTempFollowUp] = useState('');

  const activityTypeLabelMap = {
    EM: 'Email', 
    PC: 'Phone Call',
    ME: 'Meeting',
    TA: 'Task',
  };
  const activityTypeOptions = [
    {label: 'Email', value: 'EM'},
    {label: 'Phone call', value: 'PC'},
    {label: 'Meeting', value: 'ME'},
    {label: 'Task', value: 'TA'},
  ];
  // After API call
  useEffect(() => {
    setFollowups(apiCall); // store API response in editable state
  }, [apiCall]);

  // Total Leanth API calls
  const TotalLeadAPI = async () => {
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const userId = await AsyncStorage.getItem('userId');
    const token = await AsyncStorage.getItem('token');
    const value = await AsyncStorage.getItem('userName');

    setUserName(value);
    try {
      setIsLoading(true);
      const URL = `${protocol}://${host}:${port}/api/v1/models/AD_User?$filter=IsSalesLead eq true and SalesRep_ID eq ${userId}`;
      const response = await axios.get(URL, {
        // method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      // Log and store response
      if (response.data?.records?.length) {
        console.log(
          'response ...........',
          response.data?.records.map(item => item.id),
        );
        const allLeads = response.data.records;

        const totalLeads = allLeads;
        const newleads = allLeads.filter(lead => lead?.LeadStatus?.id === 'N');
        const converted = allLeads.filter(lead => lead?.LeadStatus?.id === 'C');
        const expire = allLeads.filter(lead => lead?.LeadStatus?.id === 'E');
        const working = allLeads.filter(lead => lead?.LeadStatus.id === 'W');

        setTotalLeadsData(totalLeads);
        setNewLeadsData(newleads);
        setConvertedLeadsData(converted);
        setWorkingLeadsData(working);
        setExpireLeadsData(expire);
        setTotalLength(response.data['row-count']);
        setNewLeadsLength(newleads.length);
        setConvertedLeadLength(converted.length);
        setExpiryLeadLength(expire.length);
        setWorkingLeadLength(working.length);

        console.log(expire, 'converted data show...............');
      } else {
        console.log('No records found.');
      }
    } catch (error) {
      console.log(error, 'CRM data get error');
    } finally {
      setIsLoading(false);
    }
  };
  // Followups API Call
  const FollowupsAPI = async () => {
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    // const userId = await AsyncStorage.getItem('userId');
    const token = await AsyncStorage.getItem('token');

    try {
      const URL = `${protocol}://${host}:${port}/api/v1/models/C_ContactActivity`;
      const response = await axios.get(URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      // Log and store response
      if (response.data?.records) {
        setApiCall(response.data.records);
        // console.log('API response:', response.data.records[0]);
        console.log('Followups API response:', response.data.records);
      } else {
        console.warn(' Second API No records found.');
      }
    } catch (error) {
      console.log(error, 'Followup data get error');
    }
  };
  // update FOLLOWUPS
  const updateFollowupField = async (id, field, value) => {
    try {
      // Update local state
      setFollowups(prev =>
        prev.map(f => (f.id === id ? {...f, [field]: value} : f)),
      );

      // Call API to save
      const protocol = await AsyncStorage.getItem('protocol');
      const host = await AsyncStorage.getItem('host');
      const port = await AsyncStorage.getItem('port');
      const token = await AsyncStorage.getItem('token');

      const URL = `${protocol}://${host}:${port}/api/v1/models/C_ContactActivity/${id}`;

      await axios.put(
        URL,
        {[field]: value}, // only sending the updated field
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('Updated followup', id, field, value);
    } catch (error) {
      console.log(
        'Error updating followup:',
        error.response.data || error.message,
      );
      Alert.alert('Failed to update followup');
    }
  };

  // Delete Activity API Call
  const deleteActivity = async id => {
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const token = await AsyncStorage.getItem('token');

    try {
      const URL = `${protocol}://${host}:${port}/api/v1/models/C_ContactActivity/${id}`;
      await axios.delete(URL, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert('Deleted', 'Activity deleted successfully!');
      // Refresh the list after deletion
      FollowupsAPI();
    } catch (error) {
      console.log('Delete error:', error.response?.data || error.message);
      Alert.alert('Error', 'Something went wrong while deleting.');
    }
  };

  // Sale Graph API
  const salesAPI = async () => {
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    // const userId = await AsyncStorage.getItem('userId');
    const token = await AsyncStorage.getItem('token');

    try {
      const URL = `${protocol}://${host}:${port}/api/v1/models/C_Opportunity`;
      const response = await axios.get(URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      // Log and store response
      if (response.data?.records) {
        setSalesCall(response.data.records);
        // console.log('API response:', response.data.records[0]);
        console.log('Sales Opportunity API response:', response.data.records);
      } else {
        console.warn('Third API No records found.');
      }
    } catch (error) {
      console.log(error, 'Graph API data get error');
    }
  };

  // FILTER FOR STAGES
  const stages = [
    ...new Set(salesCall.map(item => item.C_SalesStage_ID?.identifier)),
  ];
  const stageWiseData = {};

  stages.forEach(stage => {
    stageWiseData[stage] = salesCall.filter(
      item => item?.C_SalesStage_ID?.identifier === stage,
    );
  });
  // console.log(stageWiseData, 'Stage wise data..............');

  useFocusEffect(
    React.useCallback(() => {
      // useEffect(() => {
      TotalLeadAPI();
      FollowupsAPI();
      salesAPI();
    }, []),
  );

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
  // const totalOpportunity = salesCall.reduce((sum, item) => {
  //   const amount = parseFloat(item?.OpportunityAmt) || 0;
  //   return sum + amount;
  // }, 0);

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
  const today = moment().startOf('day');

  const sortFollowups = apiCall.sort((a, b) => {
    const endA = a.EndDate ? moment(a.EndDate) : moment(a.StartDate);
    const endB = b.EndDate ? moment(b.EndDate) : moment(b.StartDate);
    // Descending order: recent EndDate first
    return endB.valueOf() - endA.valueOf();
  });

  const todayFollowups = sortFollowups.filter(item => {
    const start = moment(item.StartDate);
    const end = item.EndDate ? moment(item.EndDate) : start; // fallback if no EndDate
    return (
      start.isSameOrBefore(today, 'day') &&
      end.isSameOrAfter(today, 'day') &&
      item.IsComplete === false
    );
  });

  const futureFollowups = sortFollowups.filter(item => {
    const start = moment(item.StartDate);
    return start.isAfter(today, 'day') && item.IsComplete === false;
  });

  const missedFollowups = sortFollowups.filter(item => {
    const end = item.EndDate ? moment(item.EndDate) : moment(item.StartDate);
    return end.isBefore(today, 'day') && item.IsComplete === false;
  });
  // View all
  const completedFollowups = sortFollowups.filter(
    item => item.IsComplete === true,
  );

  const completedCount = completedFollowups.length;
  // console.log('All activities : ', completedCount);

  // Local state to handle checkbox toggle
  const [isComplete, setIsComplete] = useState(apiCall.IsComplete);

  const toggleComplete = () => {
    setIsComplete(!isComplete);
    // Optional: call API to save the updated complete status
    // axios.post('/update-complete', { id: item.id, IsComplete: !isComplete })
  };

  const renderFollowUpCard = item => {
    const name = item.AD_User_ID?.identifier;
    const status = item.IsActive ? 'Open' : 'Pending';
    const schedule = moment(item.EndDate).format('DD MMM YYYY');
    const followUpCode = item.ContactActivityType?.identifier;
    const followUpType =
      activityTypeLabelMap[followUpCode] || followUpCode || '-';

    return (
      <View style={styles.card}>
        <Text style={styles.label}>
          Lead Name: <Text style={styles.value}>{name}</Text>
        </Text>
        <Text style={styles.label}>
          Status: <Text style={styles.status}>{status}</Text>
        </Text>

        {/* Complete / Incomplete */}
        <TouchableOpacity
          onPress={() =>
            updateFollowupField(item.id, 'IsComplete', !item.IsComplete)
          }
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 2,
          }}>
          <Text
            style={{
              marginLeft: 0,
              color: item.IsComplete ? 'gray' : 'black',
              fontFamily: 'K2D-Medium',
              fontSize: 13,
            }}>
            {item.IsComplete ? 'Complete' : 'Incomplete'}
            <Text style={styles.label}> : </Text>
          </Text>
          <View
            style={{
              width: 20,
              height: 20,
              borderWidth: 1,
              borderColor: item.IsComplete ? '#000' : '#000',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 4,
            }}>
            <Text
              style={{
                color: item.IsComplete ? '#555' : '#555',
                fontFamily: 'K2D-Medium',
                bottom: '25%',
              }}>
              {item.IsComplete ? '✔' : '✖'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Scheduled Date */}
        <View style={{marginTop: 10, marginBottom: 10, position: 'relative'}}>
          <View style={styles.verticalLineContainer}>
            <View style={styles.dot} />
            <View style={styles.verticalDottedLine} />
            <View style={styles.dot} />
          </View>
          <View style={styles.infoContainer}>
            <TouchableOpacity
              onPress={() => {
                setActiveItemId(item.id);
                setSelectedDate(new Date(item.EndDate));
                setShowDatePicker(true);
              }}>
              <View style={styles.infoContainer}>
                <Text style={[styles.subLabel, {paddingHorizontal: '4%'}]}>
                  Scheduled Time:
                </Text>
                <Text style={[styles.subValue, {paddingHorizontal: '0%'}]}>
                  {schedule}
                </Text>
              </View>
            </TouchableOpacity>

            {showDatePicker && activeItemId === item.id && (
              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                display="calendar"
                onChange={(event, date) => {
                  setShowDatePicker(false);

                  if (event.type === 'set' && date) {
                    const formattedDate = moment(date)
                      .utc()
                      .format('YYYY-MM-DDTHH:mm:ss[Z]');

                    // 1️⃣ Update local state immediately
                    setFollowups(prev =>
                      prev.map(f =>
                        f.id === activeItemId
                          ? {...f, EndDate: formattedDate}
                          : f,
                      ),
                    );

                    // 2️⃣ Save to backend
                    updateFollowupField(activeItemId, 'EndDate', formattedDate);
                  }
                }}
              />
            )}
          </View>

          {/* Follow-up Type */}
          <View style={styles.infoContainer}>
            <Text
              style={[
                styles.subLabel,
                {paddingHorizontal: '4%', paddingTop: '3%'},
              ]}>
              Follow-up type:
            </Text>
            <Text
              style={[
                styles.subValue,
                {
                  color: 'rgba(21, 68, 137, 1)',
                  backgroundColor: '#f0f0f0',
                  elevation: 2,
                  paddingHorizontal: '3%',
                  borderRadius: 5,
                  marginTop: '4%',
                },
              ]}>
              {followUpType}
            </Text>
          </View>
        </View>
        {/* Description - Auto Save */}
        <View style={{}}>
          <Text style={styles.quickNote}>Description</Text>
          <TextInput
            value={editingId === item.id ? tempDescription : item.Description}
            editable
            multiline
            onFocus={() => {
              setEditingId(item.id);
              setTempDescription(item.Description);
            }}
            onChangeText={text => {
              setTempDescription(text);
              updateFollowupField(item.id, 'Description', text); // auto save while typing
            }}
            style={styles.description}
            placeholder="Enter description"
          />
        </View>
      </View>
    );
  };

  const cols = [
    {
      title: 'Leads',
      align: 'flex-start',
      // dotColor: 'rgba(234, 71, 71, 1)',
      content: (
        <View style={styles.statusRow}>
          {/* <Text style={styles.value}>Leads Summary</Text> */}
        </View>
      ),
    },
    {
      title: 'Sales Oppertunity',
      align: 'center',
      // dotColor: 'rgba(231, 205, 76, 1)',
      content: (
        <View style={styles.statusRow}>
          {/* <Text style={styles.value}>Oppertunity Flow</Text> */}
        </View>
      ),
    },
    {
      title: 'Overview',
      align: 'flex-end',
      // dotColor: 'rgba(38, 189, 206, 1)',
      // content: <Text style={styles.value}>View Reports</Text>
    },
  ];

  const userInfo = [
    {
      id: 1,
      username: 'John Doe',
      role: 'Bidder',
      email: 'john@example.com',
    },
    {
      id: 2,
      username: 'John ',
      role: 'Bidder',
      email: 'john@example.com',
    },
  ];
  const handleMail = email => {
    if (!email) {
      Alert.alert('Error', 'Email address not found.');
      return;
    }
    Linking.openURL(`mailto:${email}`);
  };

  const handlePhone = phone => {
    if (!phone) {
      Alert.alert('Error', 'Phone number not found.');
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  const renderLeadCard = item => {
    // activity filter
    const userActivity = apiCall.filter(
      act => act?.AD_User_ID?.id === item?.id,
    );
    // Sort by Created date (assuming it's act.Created)
    const lastActivity = userActivity.sort(
      (a, b) => new Date(b.Created) - new Date(a.Created),
    )[0];

    // Now display the type
    const lastActivityType =
      lastActivity?.ContactActivityType?.identifier || 'N/A';
    // total length
    const activityCount = userActivity.length;
    return (
      <View style={{flex: 1, width: 350, right: '5%'}}>
        <CRMCard
          name={item.Name}
          header={item.AD_Client_ID.identifier}
          status={item?.LeadStatus?.identifier}
          email={item?.EMail}
          count={activityCount}
          cellNo={item?.Phone}
          Description={item?.Description}
          interactionType={lastActivityType}
          mail={() => handleMail(item?.EMail)}
          phone={() => handlePhone(item?.Phone)}
          dateText={item?.Updated}
          actOnPress={() => {
            navigation.navigate('ActivityList', {
              data: item,
              mode: 'create',
            });
          }}
          onPress={() => {
            navigation.navigate('LeadsDetails', {data: item});
          }}
        />
      </View>
    );
  };
  const tabStyle = name => ({
    backgroundColor: active === name ? '#fff' : 'transparent',
    height: 25,
    paddingHorizontal: 15,
    borderRadius: 6,
  });

  const textStyle = name => ({
    color: active === name ? '#000' : '#fff',
    fontFamily: active === name ? 'K2D-SemiBold' : 'K2D-Regular',
  });
  const getStageProgress = stage => {
    if (!stage) return 0;

    const name = stage.toLowerCase();

    if (name.includes('initial')) return 33;
    if (name.includes('medium')) return 66;
    if (name.includes('done') || name.includes('final')) return 100;

    return 0;
  };

  return (
    <Provider>
      <ScrollView showsVerticalScrollIndicator={false}>
        <StatusBar barStyle={'dark-content'} />
        <View style={styles.container}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <TouchableOpacity
                onPress={handleBackPress}
                style={{marginRight: 5}}>
                <Ionicons name="chevron-back" size={25} color={'#000'} />
              </TouchableOpacity>
            </View>
            {/* <ExpandableSearch /> */}
            {showCRMCard && (
        <TouchableOpacity
          onPress={() => navigation.navigate('AddLeads')}
          style={styles.addBtns}>
          <Text
            style={[styles.viewAllText, {color:'#fff'}]}>
            Add Lead
          </Text>
        </TouchableOpacity>
      )}
      {showSalesCard && (
        <TouchableOpacity
          onPress={() => navigation.navigate('AddSaleOppor')}
          style={styles.addBtns}>
          <Text
            style={[styles.viewAllText, {color:'#fff'}]}>
            Add Oppertunity
          </Text>
        </TouchableOpacity>
      )}

          </View>

          {/* CRM Chart */}

          <TouchableOpacity onPress={handleBackPress}>
            <Text style={styles.chartTitle}>CRM Board</Text>

            <Text style={styles.chartSubitle}>
              Manage leads and opportunities to drive business growth .
            </Text>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#000',
              padding: 4,
              borderRadius: 6,
              marginBottom: '0%',
              paddingHorizontal: '5%',
              height: 40,
            }}>
            {/* LEADS */}
            <TouchableOpacity
              onPress={() => {
                setActive('Leads');
                setShowCRMCard(true); // Leads card open
                setShowSalesCard(false);
                setShowOverviewCard(false);
              }}
              style={[tabStyle('Leads')]}>
              <Text
                style={[
                  textStyle('Leads'),
                  {fontSize: 13, fontFamily: 'K2D-Regular'},
                ]}>
                Leads
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setActive('SalesOpportunity');
                // setShowSalesCard(prev => !prev);
                setShowSalesCard(true); // Sales card open
                setShowCRMCard(false);
                setShowOverviewCard(false);
              }}
              style={tabStyle('SalesOpportunity')}>
              <Text
                style={[
                  textStyle('SalesOpportunity'),
                  {fontSize: 13, fontFamily: 'K2D-Regular'},
                ]}>
                Sales Opportunity
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setActive('Overview');
                setShowOverviewCard(true);
                setShowCRMCard(false);
                setShowSalesCard(false);
              }}
              style={tabStyle('Overview')}>
              <Text
                style={[
                  textStyle('Overview'),
                  {fontSize: 13, fontFamily: 'K2D-Regular'},
                ]}>
                Overview
              </Text>
            </TouchableOpacity>
          </View>
          {/* {showOverviewCard && <AddOppor />} */}
          {showSalesCard && (
            <SalesOpper
              todayFollowups={todayFollowups}
              futureFollowups={futureFollowups}
              missedFollowups={missedFollowups}
              salesCall={salesCall}
            />
          )}
          {!totalCollapsed && totalLeadsData.map(renderLeadCard)}
          {showCRMCard && (
            <View style={{marginVertical: '4%'}}>
              <EarningChart
                data={[1950, 2089, 3267, 5789, 4234, 3000, 2200]}
                days={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
              />

              <Text style={[styles.sectionTitle, {paddingVertical: '2%'}]}>Leads Summary</Text>
              <View style={styles.leadsContainer}>
                <TouchableOpacity
                  style={styles.leadCard}
                  onPress={() => {
                    navigation.navigate('CrmWorking', {
                      workingLeads: workingLeadsData,
                      activity: apiCall,
                    });
                  }}>
                  <View style={styles.leadWrapperTop}>
                    <View style={styles.leadIconWrapper}>
                      <MaterialIcons name="update" size={15} color="#000" />
                    </View>
                    <Text style={styles.leadTitle}>Working Leads</Text>
                  </View>
                  <View style={styles.leadWrapperEnd}>
                    <Text style={styles.leadSub}>Numbers of open leads</Text>
                    <View
                      style={[
                        styles.badge,
                        {backgroundColor: '#DBEAFE', elevation: 3},
                      ]}>
                      <Text style={[styles.badgeText, {color: '#555'}]}>
                        {workingLeadLength.toString().padStart(2, '0')}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.leadCard}
                  onPress={() => {
                    navigation.navigate('CrmNew', {
                      newLeads: newLeadsData,
                      activity: apiCall,
                    });
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      position: 'absolute',
                      width: '100%',
                      paddingHorizontal: '70%',
                      marginTop: '-11%',
                    }}></View>
                  <View style={styles.leadWrapperTop}>
                    <View style={styles.leadIconWrapper}>
                      <MaterialIcons
                        name="gps-not-fixed"
                        size={15}
                        color="#000"
                      />
                    </View>
                    <Text style={styles.leadTitle}>New Leads</Text>
                  </View>

                  <View style={styles.leadWrapperEnd}>
                    <Text style={styles.leadSub}>Numbers of open leads</Text>
                    <View
                      style={[
                        styles.badge,
                        {backgroundColor: 'rgb(245, 225, 250)', elevation: 3},
                      ]}>
                      <Text style={[styles.badgeText, {color: '#555'}]}>
                        {newLeadsLength.toString().padStart(2, '0')}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.leadCard}
                  onPress={() => {
                    navigation.navigate('CrmConverted', {
                      convertedLeads: convertedLeadsData,
                      activity: apiCall,
                    });
                  }}>
                  <View style={styles.leadWrapperTop}>
                    <View
                      style={[styles.leadIconWrapper, {height: 23, width: 23}]}>
                      <MaterialIcons name="sync" size={15} color="#000" />
                    </View>
                    <Text style={[styles.leadTitle, {fontSize: 13}]}>
                      Converted Leads
                    </Text>
                  </View>
                  <View style={styles.leadWrapperEnd}>
                    <Text style={[styles.leadSub, {width: '80%'}]}>
                      Total Converted Leads
                    </Text>
                    <View
                      style={[
                        styles.badge,
                        {backgroundColor: '#DCFCE7', elevation: 3},
                      ]}>
                      <Text style={[styles.badgeText, {color: '#555'}]}>
                        {convertedLeadLength.toString().padStart(2, '0')}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.leadCard}
                  onPress={() => {
                    navigation.navigate('CrmTotal', {
                      totalLeads: totalLeadsData,
                      activity: apiCall,
                    });
                  }}>
                  <View style={styles.leadWrapperTop}>
                    <View style={styles.leadIconWrapper}>
                      <MaterialIcons
                        name="diversity-2"
                        size={15}
                        color="#000"
                      />
                    </View>
                    <Text style={styles.leadTitle}>Total Leads</Text>
                  </View>
                  <View style={styles.leadWrapperEnd}>
                    <Text style={styles.leadSub}>Numbers of open leads</Text>
                    <View
                      style={[
                        styles.badge,
                        {backgroundColor: '#FEF3C7', elevation: 3},
                      ]}>
                      <Text style={[styles.badgeText, {color: '#555'}]}>
                        {totalLength.toString().padStart(2, '0')}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
           
            </View>
          )}
         {!showOverviewCard && (
            <>
            <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <View>
                  <Text style={styles.sectionTitle}>Followups</Text>
                </View>
                <View style={{paddingRight: '3%'}}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('AllFollowups', {
                        data: sortFollowups,
                      })
                    }
                    style={styles.viewAllBtn}>
                    <Text style={styles.viewAllText}>My All Activities</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView
                style={{
                  backgroundColor: 'rgba(246, 246, 246, 1)',
                  paddingHorizontal: '1%',
                  paddingVertical: '2%',
                }}>
                {/* Today FollowUp */}
                <TouchableOpacity
                  onPress={() => {
                    // if (todayFollowups.length <= 2) {
                    //   toggleSection(
                    //     todayCollapsed,
                    //     setTodayCollapsed,
                    //     todayAnim,
                    //   );
                    // } else {
                    //   navigation.navigate('TodayFollowups', {
                    //     data: todayFollowups,
                    //     activeTab: 'today',
                    //   });
                    // }
                    navigation.navigate('AllFollowups', {
                      data: todayFollowups,
                      activeTab: 'today',
                    })
                  }}
                  style={styles.toggleBtn}>
                    <View
                    style={styles.fWrapper}>
                    <View style={[styles.fBadge, {backgroundColor:'#FEF3C7'}]}>
                      <Text style={styles.followBadgeTxt}>
                        {todayFollowups.length.toString().padStart(2, '0')}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.toggleTitle}>Today's Followup</Text>
                  <Animated.View
                    style={{
                      transform: [{rotate: getRotation(todayAnim)}],
                    }}>
                    <Ionicons name="chevron-forward" size={18} color="#000" />
                  </Animated.View>
                </TouchableOpacity>
                {!todayCollapsed && todayFollowups.map(renderFollowUpCard)}
                {/* ✅ DATE PICKER — RIGHT PLACE */}
                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate || new Date()}
                    mode="date"
                    display="calendar"
                    onChange={(event, date) => {
                      setShowDatePicker(false);

                      if (event.type === 'set' && date) {
                        const formattedDate = moment(date)
                          .utc()
                          .format('YYYY-MM-DDTHH:mm:ss[Z]');

                        updateFollowupField(
                          activeItemId,
                          'EndDate',
                          formattedDate,
                        );
                      }
                    }}
                  />
                )}

                {/* Future FollowUp */}
                <TouchableOpacity
                  onPress={() => {
                    // if (futureFollowups.length <= 2) {
                    //   toggleSection(
                    //     futureCollapsed,
                    //     setFutureCollapsed,
                    //     futureAnim,
                    //   );
                    // } else {
                    //   navigation.navigate('AllFollowups', {
                    //     data: futureFollowups,
                    //     activeTab: 'future',
                    //   });
                    // }
                    navigation.navigate('AllFollowups', {
                      data: futureFollowups,
                      activeTab: 'future',
                    })
                  }}
                  style={styles.toggleBtn}>
                    <View
                    style={styles.fWrapper}>
                    <View style={[styles.fBadge, {backgroundColor:"#DBEAFE"}]}>
                      <Text style={styles.followBadgeTxt}>
                        {futureFollowups.length.toString().padStart(2, 0)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.toggleTitle}>Future Followup</Text>
                  <Animated.View
                    style={{
                      transform: [{rotate: getRotation(futureAnim)}],
                    }}>
                    <Ionicons name="chevron-forward" size={18} color="#000" />
                  </Animated.View>
                </TouchableOpacity>
                {!futureCollapsed && futureFollowups.map(renderFollowUpCard)}
                {/* ✅ DATE PICKER — RIGHT PLACE */}
                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate || new Date()}
                    mode="date"
                    display="calendar"
                    onChange={(event, date) => {
                      setShowDatePicker(false);

                      if (event.type === 'set' && date) {
                        const formattedDate = moment(date)
                          .utc()
                          .format('YYYY-MM-DDTHH:mm:ss[Z]');

                        updateFollowupField(
                          activeItemId,
                          'EndDate',
                          formattedDate,
                        );
                      }
                    }}
                  />
                )}

                {/* Missed FillowUp */}
                <TouchableOpacity
                  onPress={() => {
                    if (missedFollowups.length <= 2) {
                      toggleSection(
                        missedCollapsed,
                        setMissedCollapsed,
                        missedAnim,
                      );
                    } else {
                      navigation.navigate('AllFollowups', {
                        data: missedFollowups,
                        activeTab: 'missed',
                      });
                    }
                  }}
                  style={styles.toggleBtn}>
                  <View
                    style={styles.fWrapper}>
                    <View style={[styles.fBadge, {backgroundColor:'rgb(245, 225, 250)'}]}>
                      <Text style={styles.followBadgeTxt}>
                        {missedFollowups.length.toString().padStart(2, 0)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.toggleTitle}>Missed Followup</Text>
                  <Animated.View
                    style={{
                      transform: [{rotate: getRotation(missedAnim)}],
                    }}>
                    <Ionicons name="chevron-forward" size={18} color="#000" />
                  </Animated.View>
                </TouchableOpacity>

                {!missedCollapsed && missedFollowups.map(renderFollowUpCard)}
                {/* ✅ DATE PICKER — RIGHT PLACE */}
                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate || new Date()}
                    mode="date"
                    display="calendar"
                    onChange={(event, date) => {
                      setShowDatePicker(false);

                      if (event.type === 'set' && date) {
                        const formattedDate = moment(date)
                          .utc()
                          .format('YYYY-MM-DDTHH:mm:ss[Z]');

                        updateFollowupField(
                          activeItemId,
                          'EndDate',
                          formattedDate,
                        );
                      }
                    }}
                  />
                )}
              </ScrollView>
           </>
         )}
              
        </View>
        {isLoading ? <Loader /> : null}
      </ScrollView>
      {/* <TouchableOpacity
        onPress={() => navigation.navigate('AddLeads')}
        style={styles.floatingButton}>
        <Text
          style={{
            color: '#fff',
            fontFamily: 'K2D-Bold',
            fontSize: 25,
            alignItems: 'center',
          }}>
          +
        </Text>
      </TouchableOpacity> */}
   
      {showCRMCard && (
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateActivity')}
          style={styles.floatingButton}>
          <Text
            style={{
              color: '#fff',
              fontFamily: 'K2D-Bold',
              fontSize: 20,
            }}>
            +
          </Text>
        </TouchableOpacity>
      )}
      {showSalesCard && (
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateActivity')}
          style={styles.floatingButton}>
          <Text
            style={{
              color: '#fff',
              fontFamily: 'K2D-Bold',
              fontSize: 20,
            }}>
            +
          </Text>
        </TouchableOpacity>
      )}
    </Provider>
  );
};
export default CrmScreen;

const styles = StyleSheet.create({
  container: {
    // backgroundColor: '#2F4FE2'
    flex: 1,
    backgroundColor: 'rgba(240, 241, 245, 1)',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    // padding: 20,
    // marginTop: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '8%',
  },
  chartTitle: {fontSize: 20, color: '#000', fontFamily: 'K2D-Medium'},
  chartSubitle: {
    color: 'rgba(48, 48, 48, 1)',
    fontSize: 11,
    marginBottom: 15,
    fontFamily: 'K2D-Medium',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'K2D-Medium',
    color: '#000',
    marginTop: 20,
    marginBottom: 8,
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
    fontSize: 20,
    color: '#fff',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
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
  opportunity: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(246, 246, 246, 1)',
    borderRadius: 6,
    padding: 14,
    marginVertical: '6%',
    marginBottom: '5%',
  },
  opportunityText: {fontFamily: 'K2D-Medium', fontSize: 15, color: '#000'},
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
    // justifyContent: 'flex-start',
    gap: 10,
    width: '100%',
    // backgroundColor: 'rgba(246, 246, 246, 1)',
    // paddingHorizontal: '2%',
    // paddingVertical: '4%',
    flexWrap: 'wrap',
  },
  leadCard: {
    backgroundColor: '#fff',
    width: '48%',
    borderRadius: 6,
    // paddingHorizontal: '4%',
    // paddingVertical: '2%',
    // height:40,
    // justifyContent: 'center',
    padding: 5,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 3,
    height: 105,
  },
  leadWrapperTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '4%',
  },
  leadWrapperEnd: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '15%',
    paddingHorizontal: '5%',
  },
  leadIconWrapper: {
    backgroundColor: '#fff',
    height: 25,
    width: 25,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    elevation: 3,
  },
  badge: {
    backgroundColor: '#1f5dd4',
    borderRadius: 20,
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    // paddingHorizontal: 5
  },
  leadTitle: {
    fontSize: 15,
    color: '#000',
    fontFamily: 'K2D-SemiBold',
    marginRight: '20%',
    marginTop: '3%',
    paddingHorizontal: '3%',
  },
  leadSub: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'K2D-Regular',
    width: '70%',
  },
  badgeText: {color: '#fff', fontSize: 12, fontFamily: 'K2D-SemiBold'},
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
    fontSize: 15,
    // fontWeight: 'bold',
    fontFamily: 'K2D-Medium',
    color: '#000',
    flex: 1,
  },
  viewAllText: {
    color: '#fff',
    fontFamily: 'K2D-SemiBold',
    fontSize: 13,
  },
  viewAllBtn: {
    backgroundColor: '#000',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    elevation: 2,
    top: '2%',
  },
  followupCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    height: 50,
    // borderWidth:.5,
    // borderColor:'rgba(0, 0, 0, 0.15)',
    padding: 14,
    marginBottom: 20,
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 3,
    padding: 12,
    marginBottom: '5%',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.10)',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    marginBottom: 5,
  },
  label: {
    fontFamily: 'K2D-Medium',
    fontSize: 12,
    color: 'rgba(0, 0, 0, 1)',
    marginBottom: 2,
  },
  value: {
    fontFamily: 'K2D-Regular',
    color: 'rgba(125, 125, 125, 1)',
    fontSize: 13,
  },
  status: {
    fontFamily: 'K2D-Regular',
    fontSize: 15,
    color: 'rgba(153, 153, 153, 1)',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: 1,
    left: '8%',
  },
  subLabel: {
    color: 'rgba(0, 0, 0, 1)',
    fontFamily: 'K2D-Medium',
    fontSize: 13,
    // marginRight: '3%',
  },
  subValue: {
    color: 'rgba(125, 125, 125, 1)',
    fontFamily: 'K2D-Regular',
    fontSize: 11,
  },
  followUpTypeContainer: {
    flexDirection: 'row',
    gap: 5,
    // paddingHorizontal:'4%',

    marginLeft: '4%',
    backgroundColor: 'rgba(243, 243, 243, 1)',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  followTypeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followTypeText: {
    marginLeft: 5,
    color: 'rgba(21, 68, 137, 1)',
    fontFamily: 'K2D-Medium',
    fontSize: 12,
  },
  quickNote: {
    color: '#000',
    fontFamily: 'K2D-Medium',
    fontSize: 13,
    marginTop: 10,
  },
  optional: {
    color: 'rgba(157, 157, 157, 1)',
    fontFamily: 'K2D-Regular',
    fontSize: 11,
  },
  description: {
    borderBottomWidth: 0.5,
    borderColor: 'rgba(170, 170, 170, 1)',
    marginTop: 4,
    paddingVertical: 3,
    color: 'rgba(157, 157, 157, 1)',
    fontFamily: 'K2D-Regular',
    fontSize: 11,
    paddingHorizontal: '2%',
  },
  verticalLineContainer: {
    position: 'absolute',
    left: 2,
    top: '32%',
    height: 45,
    alignItems: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(21, 69, 140, 1)',
  },
  verticalDottedLine: {
    width: 1,
    height: 35,
    borderLeftWidth: 1,
    borderStyle: 'dotted',
    borderColor: 'rgba(21, 69, 140, 1)',
  },
  forwardIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
  },
  bottomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: '40%',
    // width: '90%',
    gap: 10,
    paddingHorizontal: '3%',
    backgroundColor: 'white',
  },
  gridBox: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    marginBottom: '2%',
    elevation: 5,
  },
  gridIconWrapper: {
    backgroundColor: '#fff',
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    elevation: 6,
    shadowColor: '#333',
  },
  gridLabel: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: 'K2D-SemiBold',
    color: '#000',
    textAlign: 'center',
  },
  gridSubLabel: {
    // marginTop: 6,
    fontSize: 11,
    fontFamily: 'K2D-Medium',
    color: '#555',
    textAlign: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20, // distance from bottom
    right: 20, // distance from right
    backgroundColor: '#2F4FE3',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // shadow on Android
    shadowColor: '#000', // shadow on iOS
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginTop: 4,
    // borderTopWidth: 0.5,
    // borderTopColor: "#ddd",
    paddingTop: '1%',
    marginBottom: '0%',
    paddingHorizontal: '3%',
  },
  //   col: {
  //     flex: 1,
  //     alignItems: "flex-start",
  //   },
  label: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 1)',
    fontFamily: 'K2D-Medium',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '3%',
    justifyContent: 'space-between',
  },
  dot: {
    // width: 8,
    // height: 8,
    // borderRadius: 4,
    // marginRight: 4,
  },
  col: {
    flex: 1,
  },
  dottedLine: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(170, 170, 170, 1)',
    marginVertical: 10,
    position: 'relative',
  },
  smallDot: {
    width: 7,
    height: 10,
    borderRadius: 6,
    position: 'absolute',
    marginTop: '-3%',
  },

  // sales card
  cardOverlay: {
    // position: 'absolute',
    // top: 0, left: 0, right: 0, bottom: 0,
    // backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '2%',
    gap: 10,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 6,
    width: '100%',
    elevation: 1,
    borderWidth: 0.5,
    borderColor: '#ccc',
    marginBottom: '5%',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgb(252, 252, 249)',
    paddingHorizontal: 10,
    elevation: 2,
  },
  verticalLineContainer: {
    position: 'absolute',
    left: 2,
    top: '12%',
    height: 35,
    alignItems: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(21, 69, 140, 1)',
  },
  verticalDottedLine: {
    width: 1,
    height: 30,
    borderLeftWidth: 1,
    borderStyle: 'dotted',
    borderColor: 'rgba(21, 69, 140, 1)',
  },
  fBadge: {
    backgroundColor: '#E0E0E0',
    width: 25,
    height: 25,
    borderRadius: 6,
    elevation: 3,
    // marginTop: '10%',
    alignItems: 'center',
    marginRight: '4%',
    justifyContent: 'center',
  },
  followBadgeTxt:{
    color:"#555",
    fontFamily:"K2D-SemiBold",
    textAlign:'center',
    fontSize: 12
  },
  fWrapper:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
  },
  addBtns:{
     paddingHorizontal:'5%', paddingVertical:'1%',elevation:3,backgroundColor:'#2F4FE3', borderRadius: 4
  },
});
