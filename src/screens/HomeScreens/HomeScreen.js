import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
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
  ScrollView,
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
import { useAuthStore } from '../../store/authStore';

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

  // Get auth data from Zustand store
  const token = useAuthStore(state => state.token);
  const tokenOk = useAuthStore(state => state.tokenOk);
  const roleId = useAuthStore(state => state.roleId);
  const userId = useAuthStore(state => state.userId);
  
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

  // Get user info from Zustand store
  const { 
    userName: storeUserName, 
    clientName: storeClientName,
    clientId: storeClientId,
    roleName: storeRoleName,
    organizationName: storeOrgName,
    warehouseName: storeWarehouseName
  } = useAuthStore(state => ({
    userName: state.userName,
    clientName: state.clientName,
    clientId: state.clientId,
    roleName: state.roleName,
    organizationName: state.organizationName,
    warehouseName: state.warehouseName
  }));

  const categories = [
    {
      title: 'CRM',
      icon: 'all-inclusive',
      color: 'rgba(43, 135, 234, 1)',
      backgroundcolor: 'rgba(90, 141, 238, 0.1)',
      onPress: () => navigation.navigate('CrmScreen'),
    },
    {
      title: 'Approval',
      icon: 'check-decagram',
      color: 'rgba(43, 135, 234, 1)',
      backgroundcolor: 'rgba(90, 141, 238, 0.1)',
      onPress: async () => {
        const approvalData = await getApprovalNum();
        navigation.navigate('AllApprovalList', {data: approvalData});
      },
    },
    {
      title: 'Employee Portal',
      icon: 'account-group',
      color: 'rgba(43, 135, 234, 1)',
      backgroundcolor: 'rgba(90, 141, 238, 0.1)',
      onPress: () => navigation.navigate('EmployeePortal'),
    },
    {
      title: 'Request',
      icon: 'file-send',
      color: 'rgba(43, 135, 234, 1)',
      backgroundcolor: 'rgba(90, 141, 238, 0.1)',
      onPress: () => navigation.navigate('TopNavigationATS', {token}),
    },
  ];

  const notificationAllDataGet = async () => {
    const storedToken = token;
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const storedUserId = userId;
    const organizationId = await AsyncStorage.getItem('organizationId');
    console.log('Token for notifications:', storedToken ? 'Present' : 'Missing');

    try {
      setIsLoading(true);
      const URL = `${protocol}://${host}:${port}/api/v1/models/AD_Note?$filter=AD_User_ID eq ${storedUserId}`;
      
      const response = await axios.get(URL, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: storedToken ? `Bearer ${storedToken.trim()}` : '',
        },
      });

      const sortedData = response?.data?.records?.sort(
        (a, b) => new Date(b.Created) - new Date(a.Created),
      );

      const unprocessedCount = sortedData?.filter(
        item => item.Processed === false,
      ).length;
      setNotificationCount(unprocessedCount);
      console.log(unprocessedCount, 'Unprocessed Notification Count');

    } catch (error) {
      console.log(error, 'NotificationAPIGETAllData');
    } finally {
      setIsLoading(false);
    }
  };

  const getName = async () => {
    const value = await AsyncStorage.getItem('userName');
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const storedUserId = userId;
    console.log('UserID for API calls:', storedUserId);
    setProtocol(protocol);
    setHost(host);
    setPort(port);
    setName(value);
    getApprovalNum(protocol, host, port);
    getReqNum(protocol, host, port, storedUserId);
    getAtsNum(protocol, host, port, storedUserId);
  };

  const handleBackButton = () => {
    BackHandler.exitApp();
    return true;
  };

  const getApprovalNum = async (protocol, host, port) => {
    if (!token || !roleId) {
      console.error('Missing token or roleId for approval API');
      return;
    }
    
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
        setApprovalNum(data['array-count']);
        setIsLoading(false);
      })
      .catch(error => {
        console.error(error);
        setIsLoading(false);
      });
  };

  const getReqNum = async (protocol, host, port, userId) => {
    if (!token) {
      console.error('Missing token for request API');
      return;
    }
    
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
      })
      .catch(error => console.error(error));
  };

  const getAtsNum = async (protocol, host, port, userId) => {
    if (!token) {
      console.error('Missing token for ATS API');
      return;
    }
    
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
    if (!token || !roleId) {
      console.error('Missing token or roleId for approval navigation');
      return;
    }
    
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
    const storedToken = token;
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const storedUserId = userId;

    try {
      const response = await axios.get(
        `${protocol}://${host}:${port}/api/v1/models/AD_User?$filter=AD_User_ID eq ${storedUserId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${storedToken}`,
          },
        },
      );
      setPartnerId(response?.data?.records[0]?.C_BPartner_ID?.id);
    } catch (error) {
      console.error('Error fetching business partner ID:', error);
    }
  };

  const handleGetAttendance = async () => {
    const date = new Date();
    const storedToken = token;
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const storedUserId = userId;
    const clientid = await AsyncStorage.getItem('clientId');
    const org_id = await AsyncStorage.getItem('organizationId');

    try {
      const filterQuery = `$filter=AD_Client_ID eq ${clientid} and AD_Org_ID eq ${org_id} and C_BPartner_ID eq ${partnerId}`;
      setIsLoading(true);
      const response = await axios.get(
        `${protocol}://${host}:${port}/api/v1/models/HR_Daily_Attend?$orderby=Created desc&$top=1&${filterQuery}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${storedToken}`,
          },
        },
      );
      const attendanceRecord = response?.data?.records[0];

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

  const extractCurrentYearData = (data, currentYear) => {
    const currentYearLabel = `${currentYear - 1}/${currentYear
      .toString()
      .slice(-2)}`;
    return data.find(item => item.label === currentYearLabel);
  };
  
  const getYearId = async () => {
    setIsLoading(true);
    const storedToken = token;
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    try {
      const response = await axios.get(
        `${protocol}://${host}:${port}/api/v1/models/C_Year`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${storedToken}`,
          },
        },
      );
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
    if (token && userId) {
      getName();
      FindBusinessPrtId();
      getYearId();
    }
    
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
    };
  }, [navigation, token, userId]);

  // Notification ALI Calling UseEffect
  useEffect(() => {
    if (token && userId) {
      notificationAllDataGet();
    }
  }, [token, userId]);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused && token && userId) {
      console.log('pressedMe');
      notificationAllDataGet();
    }
  }, [isFocused, token, userId]);

  // Header Current Date
  const currentDate = new Date();
  const day = currentDate.getDate();
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(currentDate);

  const monthDayYear = currentDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Helper function to get ordinal suffix dynamically
  const getOrdinalSuffix = day => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <StatusBar translucent={true} backgroundColor="transparent" />
      
      {/* COMPACT HEADER - Username and Notification in same row */}
      <View style={styles.header}>
        {/* Single Row with Username and Notification */}
        <View style={styles.headerRow}>
          {/* Username with Profile Navigation */}
          <TouchableOpacity 
            style={styles.usernameContainer}
            onPress={() => navigation.navigate('ProfileScreen')}
            activeOpacity={0.7}
          >
            <Text style={styles.username}>
              {storeUserName || name || 'User'}
            </Text>
            <Icon 
              name="chevron-forward-outline" 
              size={16} 
              color="#666" 
              style={styles.chevronIcon}
            />
          </TouchableOpacity>
          
          {/* Notification Bell */}
          <View style={styles.notificationContainer}>
            <TouchableOpacity
              style={styles.notificationBell}
              onPress={() => navigation.navigate('NotificationSrn')}
            >
              <Icon
                name="notifications-outline"
                size={24}
                color="#000"
              />
              {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Blue Card - Moved closer to header */}
      <View style={styles.blueCard}>
        <Image
          source={require('../../asserts/HomeScreenAssets/CardAssets/card.png')}
          style={styles.cardBackground}
        />
        <Text style={styles.cardTitle}>
          <Text style={styles.cardTitleMain}>Sales </Text>
          <Text style={styles.cardTitleSub}>Performance</Text>
        </Text>
        <Text style={styles.cardTitle2}>
          <Text style={styles.cardTitleMain}>Command </Text>
          <Text style={styles.cardTitleSub}>Center</Text>
        </Text>
        <View style={styles.cardBottomRow}>
          <Text style={styles.cardSubtitle}>Track Operations in Real-Time</Text>
          <TouchableOpacity style={styles.analyticsBtn}>
            <Text style={styles.analyticsBtnTxt}>View Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats Row */}
      <View style={styles.topRow}>
        <View style={styles.iconBox}>
          <View style={styles.iconWrapper}>
            <MaterialIcons
              name="sync"
              size={18}
              color="rgba(59, 99, 125, 1)"
            />
          </View>
          <Text style={styles.iconLabel}>Analytics</Text>
        </View>
        <View style={styles.iconBox}>
          <View
            style={[
              styles.iconWrapper,
              {backgroundColor: 'rgba(248, 233, 229, 1)'},
            ]}>
            <MaterialIcons
              name="assignment"
              size={18}
              color="rgba(183, 113, 85, 1)"
            />
          </View>
          <Text style={styles.iconLabel}>Sales</Text>
        </View>
        <View style={styles.iconBox}>
          <View
            style={[
              styles.iconWrapper,
              {backgroundColor: 'rgba(252, 238, 255, 1)'},
            ]}>
            <MaterialIcons
              name="gpp-maybe"
              size={22}
              color="rgba(185, 139, 184, 1)"
            />
          </View>
          <Text style={styles.iconLabel}>Reports</Text>
        </View>
        <View style={styles.iconBox}>
          <View
            style={[
              styles.iconWrapper,
              {backgroundColor: 'rgba(239, 254, 233, 1)'},
            ]}>
            <View
              style={[
                styles.circle,
                {
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderColor: 'rgba(91, 159, 70, 1)',
                },
              ]}>
              <Icon name="pencil" size={12} color="rgba(91, 159, 70, 1)" />
            </View>
          </View>
          <Text style={styles.iconLabel}>Accounts</Text>
        </View>
      </View>
      
      {/* Categories Section */}
      <View>
        <Text style={styles.sectionTitle}>Categories</Text>
      </View>

      {/* Grid Layout for Categories */}
      <View style={styles.bottomGrid}>
        <TouchableOpacity
          style={styles.gridBox}
          onPress={() => navigation.navigate('CrmScreen')}>
          <View style={styles.gridIconWrapper}>
            <MaterialIcons
              name="all-inclusive"
              size={33}
              color="rgba(43, 135, 234, 1)"
            />
          </View>
          <Text style={styles.gridLabel}>CRM</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.gridBox}
          onPress={async () => {
            const approvalData = await getApprovalNum();
            navigation.navigate('AllApprovalList', {data: approvalData});
          }}>
          <View style={styles.gridIconWrapper}>
            <MaterialIcons
              name="task-alt"
              size={33}
              color="rgba(43, 135, 234, 1)"
            />
          </View>
          <Text style={styles.gridLabel}>Approval</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.gridBox}
          onPress={() => navigation.navigate('Requests')}>
          <View style={styles.gridIconWrapper}>
            <Icon
              name="git-pull-request-outline"
              size={28}
              color="rgba(43, 135, 234, 1)"
            />
          </View>
          <Text style={styles.gridLabel}>Requests</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridBox}
          onPress={() => navigation.navigate('EmployeePortal')}>
          <View style={styles.gridIconWrapper}>
            <MaterialIcons
              name="polyline"
              size={28}
              color="rgba(43, 135, 234, 1)"
            />
          </View>
          <Text style={styles.gridLabel}>Employee Portal</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  
  // COMPACT HEADER STYLES
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#f8f9ff',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  username: {
    fontSize: 26,
    fontWeight: '900',
    color: '#000',
    fontFamily: 'K2D-Bold',
  },
  chevronIcon: {
    marginLeft: 8,
    marginTop: 3,
  },
  notificationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBell: {
    width: 45,
    height: 45,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22.5,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: '#FF3B30',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'K2D-Bold',
  },
  
  // BLUE CARD - Positioned closer to header
  blueCard: {
    backgroundColor: 'rgba(43, 135, 234, 1)',
    borderRadius: 15,
    marginTop: 15, // Reduced from 20 to bring it closer
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    height: 145,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: '2%',
    width: '90%',
    marginLeft: '5%',
  },
  cardBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardTitle: {
    fontSize: 17,
    lineHeight: 30,
    letterSpacing: 0.1,
  },
  cardTitle2: {
    fontSize: 17,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  cardTitleMain: {
    color: '#fff', 
    fontFamily: 'K2D-SemiBold',
  },
  cardTitleSub: {
    color: '#cce1ff', 
    fontFamily: 'K2D-Light',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 13,
  },
  cardSubtitle: {
    fontSize: 13,
    color: 'rgba(234, 234, 234, 1)',
    letterSpacing: 0.1,
    marginTop: 10,
    fontFamily: 'KaushanScript-Regular',
  },
  analyticsBtn: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: 12,
    paddingHorizontal: 15,
    paddingVertical: 8,
    elevation: 6,
  },
  analyticsBtnTxt: {
    color: 'rgba(0, 0, 0, 1)',
    fontFamily: 'K2D-Medium',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  
  // Quick Stats Row
  topRow: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingVertical: 18,
    elevation: 3,
    marginBottom: '2%',
    width: '90%',
    marginLeft: '5%',
    borderWidth: 1,
    borderColor: 'rgba(240, 240, 240, 1)',
  },
  iconWrapper: {
    backgroundColor: 'rgba(236, 247, 253, 1)',
    height: 48,
    width: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    alignItems: 'center',
  },
  iconLabel: {
    marginTop: 10,
    fontSize: 13,
    color: 'rgba(106, 106, 106, 1)',
    fontFamily: 'K2D-Medium',
  },
  
  // Categories Section
  sectionTitle: {
    color: 'black',
    width: '90%',
    alignSelf: 'center',
    marginTop: '6%',
    fontSize: 22,
    fontFamily: 'K2D-Bold',
    marginBottom: 15,
  },
  
  // Grid Layout
  bottomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 40,
    gap: 20,
    paddingHorizontal: '3%',
  },
  gridBox: {
    width: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
    marginBottom: '2%',
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(240, 240, 240, 1)',
  },
  gridIconWrapper: {
    backgroundColor: 'rgba(90, 141, 238, 0.1)',
    height: 70,
    width: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gridLabel: {
    marginTop: 8,
    fontSize: 16,
    fontFamily: 'K2D-SemiBold',
    color: '#333',
  },
});

export default HomeScreen;