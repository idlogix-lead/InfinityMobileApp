import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useWFAct} from '../../hooks/ApprovalHooks/useApproval';
import {useAuthStore} from '../../store/authStore';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  BackHandler,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StatusBar,
  Image,
  ScrollView,
  Platform,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import { useQuery, useQueryClient } from 'react-query';
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

  const {data: wfActivity = []} = useWFAct();
  const {roleId, userId} = useAuthStore();

  const myApprovals = wfActivity.filter(
    r => Number(r.AD_WF_Responsible_ID?.id) === Number(userId),
  );

  const completedList = myApprovals.filter(item => item.WFState?.id === 'CC');

  const suspendedList = myApprovals.filter(item => item.WFState?.id === 'OS');

  console.log('WF RAW:', wfActivity.length);
  console.log('User ID:', userId);
  console.log('MY APPROVALS:', myApprovals.length);

  // Get auth data from Zustand store
  const token = useAuthStore(state => state.token);
  const tokenOk = useAuthStore(state => state.tokenOk);
  // const roleId = useAuthStore(state => state.roleId);
  // const userId = useAuthStore(state => state.userId);

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
    warehouseName: storeWarehouseName,
  } = useAuthStore(state => ({
    userName: state.userName,
    clientName: state.clientName,
    clientId: state.clientId,
    roleName: state.roleName,
    organizationName: state.organizationName,
    warehouseName: state.warehouseName,
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
    console.log(
      'Token for notifications:',
      storedToken ? 'Present' : 'Missing',
    );

    try {
      setIsLoading(true);
      const URL = `${protocol}://${host}:${port}/api/v1/models/AD_Note?$filter=AD_User_ID eq ${storedUserId}`;

      const response = await axios.get(URL, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token.trim()}` : '',
        },
        timeout: 10000,
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
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const dataArray = data.records || [];
      
      const tableIdsToSupplyChain = [702, 259, 319];
      const filteredArraySupply = dataArray.filter(obj =>
        tableIdsToSupplyChain.includes(obj.AD_Table_ID?.id),
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
        // navigation.navigate('ApprovalScreens');
        navigation.navigate('Approval', {
          screen: 'ApprovalScreens',
          params: {
            filteredArraySupply: [],
            filteredArrayAccount: [],
            token,
            tokenOk,
            roleId,
          },
        });

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
      console.error('Approval navigation error:', error.message);
      
      navigation.navigate('AllApprovalList', {
        filteredArraySupply: [],
        filteredArrayAccount: [],
        token,
        roleId,
      });
    }
  }, [apiFunctions, roleId, token, navigation, queryClient]);

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
  }, []);

  // Refresh data when screen is focused
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
  const weekday = new Intl.DateTimeFormat('en-US', {weekday: 'long'}).format(
    currentDate,
  );

  const monthDayYear = currentDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // If QueryClient is not available, show a loading state
  if (!queryClient) {
    return (
      <View style={styles.container}>
        <StatusBar 
          barStyle="dark-content"
          backgroundColor="#ffffff"
          translucent={false}
        />
        <ActivityIndicator size="large" color="#2B87EA" style={styles.loadingContainer} />
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle={'dark-content'}
      />

      {/* COMPACT HEADER - Username and Notification in same row */}
      <View style={styles.header}>
        {/* Single Row with Username and Notification */}
        <View style={styles.headerRow}>
          {/* Username with Profile Navigation */}
          <TouchableOpacity
            style={styles.usernameContainer}
            onPress={() => navigation.navigate('ProfileScreen')}
            activeOpacity={0.7}>
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
              onPress={() => navigation.navigate('NotificationSrn')}>
              <Icon name="notifications-outline" size={24} color="#000" />
              {notificationCount > 0 && (
                <View style={[styles.notificationBadge, {
                  minWidth: getResponsiveSize(20),
                  height: getResponsiveSize(20),
                  borderRadius: getResponsiveSize(10)
                }]}>
                  <Text style={[styles.badgeText, {fontSize: getResponsiveSize(11)}]}>
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Blue Card */}
        <View style={[styles.blueCard, {
          borderRadius: getResponsiveSize(15),
          marginTop: getResponsiveHeight(15),
          padding: getResponsiveSize(20),
          height: getResponsiveHeight(145),
          width: SCREEN_WIDTH * 0.9,
          alignSelf: 'center',
        }]}>
          <Image
            source={require('../../asserts/HomeScreenAssets/CardAssets/card.png')}
            style={styles.cardBackground}
          />
          <Text style={[styles.cardTitle, {fontSize: getResponsiveSize(17), lineHeight: getResponsiveHeight(30)}]}>
            <Text style={styles.cardTitleMain}>Sales </Text>
            <Text style={styles.cardTitleSub}>Performance</Text>
          </Text>
          <Text style={[styles.cardTitle2, {fontSize: getResponsiveSize(17), lineHeight: getResponsiveHeight(20)}]}>
            <Text style={styles.cardTitleMain}>Command </Text>
            <Text style={styles.cardTitleSub}>Center</Text>
          </Text>
          <View style={styles.cardBottomRow}>
            <Text style={[styles.cardSubtitle, {fontSize: getResponsiveSize(13), marginTop: getResponsiveHeight(10)}]}>
              Track Operations in Real-Time
            </Text>
            <TouchableOpacity style={[styles.analyticsBtn, {
              borderRadius: getResponsiveSize(20),
              marginTop: getResponsiveHeight(12),
              paddingHorizontal: getResponsiveSize(15),
              paddingVertical: getResponsiveHeight(8)
            }]}>
              <Text style={[styles.analyticsBtnTxt, {fontSize: getResponsiveSize(13)}]}>
                View Analytics
              </Text>
            </TouchableOpacity>
          </View>
        </View>

      {/* Quick Stats Row */}
      <View style={styles.topRow}>
        <View style={styles.iconBox}>
          <View style={styles.iconWrapper}>
            <MaterialIcons name="sync" size={18} color="rgba(59, 99, 125, 1)" />
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

        {/* <TouchableOpacity
          style={styles.gridBox}
          // onPress={async () => {
          //   const approvalData = await getApprovalNum();
          //   navigation.navigate('AllApprovalList', {data: approvalData});
          
          // }}
          onPress={() => navigation.navigate('WFStatusList', {title:'Suspended})}>
          <View style={styles.gridIconWrapper}>
            <MaterialIcons
              name="task-alt"
              size={33}
              color="rgba(43, 135, 234, 1)"
            />
          </View>
          <Text style={styles.gridLabel}>Approval</Text>
        </TouchableOpacity> */}

        <TouchableOpacity
          style={styles.gridBox}
          onPress={() =>
            navigation.navigate('WFStatusList', {
              title: 'Suspended',
              data: suspendedList,
            })
          }>
          <View style={styles.gridIconWrapper}>
            <MaterialIcons
              name="task-alt"
              size={33}
              color="rgba(43, 135, 234, 1)"
            />
            {suspendedList.length > 0 && (
              <View style={styles.badgeHome}>
                <Text style={styles.badgeTextHome}>{suspendedList.length}</Text>
              </View>
            )}
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
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // COMPACT HEADER STYLES
  header: {
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingBottom: SCREEN_HEIGHT * 0.02,
    backgroundColor: '#f8f9ff',
    borderBottomLeftRadius: SCREEN_WIDTH * 0.06,
    borderBottomRightRadius: SCREEN_WIDTH * 0.06,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  username: {
    fontWeight: '900',
    color: '#000',
    fontFamily: 'K2D-Bold',
  },
  chevronIcon: {
    marginLeft: SCREEN_WIDTH * 0.02,
    marginTop: SCREEN_WIDTH * 0.01,
  },
  notificationBell: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: SCREEN_WIDTH * 0.01,
    right: SCREEN_WIDTH * 0.01,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    paddingHorizontal: SCREEN_WIDTH * 0.01,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'K2D-Bold',
  },

  // BLUE CARD - Positioned closer to header
  blueCard: {
    backgroundColor: 'rgba(43, 135, 234, 1)',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  cardBackground: {
    position: 'absolute',
    // width: '100%',
    // height: '100%',
    resizeMode: 'cover',
  },
  cardTitle: {
    letterSpacing: 0.1,
  },
  cardTitle2: {
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
  },
  cardSubtitle: {
    color: 'rgba(234, 234, 234, 1)',
    fontFamily: 'KaushanScript-Regular',
  },
  analyticsBtn: {
    backgroundColor: '#fff',
    elevation: 6,
  },
  analyticsBtnTxt: {
    color: 'rgba(0, 0, 0, 1)',
    fontFamily: 'K2D-Medium',
  },

  // Quick Stats Row
  topRow: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(240, 240, 240, 1)',
  },
  iconWrapper: {
    backgroundColor: 'rgba(236, 247, 253, 1)',
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
    color: 'rgba(106, 106, 106, 1)',
    fontFamily: 'K2D-Medium',
  },

  // Categories Section
  sectionTitleContainer: {
    width: SCREEN_WIDTH * 0.9,
    alignSelf: 'center',
    marginTop: SCREEN_HEIGHT * 0.02,
  },
  sectionTitle: {
    color: 'black',
    fontFamily: 'K2D-Bold',
  },

  // Grid Layout
  bottomGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  gridBox: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(240, 240, 240, 1)',
    position: 'relative',
  },
  gridIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLabel: {
    fontFamily: 'K2D-SemiBold',
    color: '#333',
  },
  badgeHome: {
    position: 'absolute',
    top: -2,
    right: 5,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: '10%',
    paddingVertical: '3%',
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTextHome: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default HomeScreen;
