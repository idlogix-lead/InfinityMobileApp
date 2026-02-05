import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
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
import {useQuery, useQueryClient} from 'react-query';
import axios from 'axios';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useAuthStore} from '../../store/authStore';
import {useWFAct} from '../../hooks/ApprovalHooks/useApproval';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Calculate responsive values based on screen dimensions
const getResponsiveSize = size => {
  return (SCREEN_WIDTH / 375) * size;
};

const getResponsiveHeight = size => {
  return (SCREEN_HEIGHT / 812) * size;
};

// Create a separate function for API calls
const createApiFunctions = (token, serverConfig) => {
  if (
    !token ||
    !serverConfig?.protocol ||
    !serverConfig?.host ||
    !serverConfig?.port
  ) {
    throw new Error('Missing authentication or server configuration');
  }

  const baseUrl = `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.port}/api/v1`;

  return {
    fetchNotificationCount: async userId => {
      const URL = `${baseUrl}/models/AD_Note?$filter=AD_User_ID eq ${userId}`;

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

      return unprocessedCount || 0;
    },

    fetchApprovalCount: async roleId => {
      const url = `${baseUrl}/models/mbl_workflow_v?$filter= AD_Role_ID eq ${roleId}`;

      const response = await fetch(url, {
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
      return data['array-count'] || 0;
    },

    fetchRequestCount: async userId => {
      const url = `${baseUrl}/models/mbl_request_view_v?$filter= SalesRep_ID eq ${userId} and R_Status_ID eq 1000001`;

      const response = await fetch(url, {
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
      return data.records?.length || 0;
    },

    fetchApprovalData: async roleId => {
      const url = `${baseUrl}/models/mbl_workflow_v?$filter= AD_Role_ID eq ${roleId}`;

      const response = await fetch(url, {
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
        tableIdsAccount.includes(obj.AD_Table_ID?.id),
      );

      return {
        filteredArraySupply,
        filteredArrayAccount,
        count: data['array-count'] || 0,
      };
    },
  };
};

const HomeScreen = ({route}) => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const {data: wfActivity = []} = useWFAct();

  // Get auth data from Zustand store
  const {
    token,
    userId,
    roleId,
    userName,
    serverConfig,
    isCompleteAuthenticated,
  } = useAuthStore(state => ({
    token: state.token,
    userId: state.userId,
    roleId: state.roleId,
    userName: state.userName,
    serverConfig: state.serverConfig,
    isCompleteAuthenticated: state.isCompleteAuthenticated,
  }));

  // APPROVAL FROM WFAct
  const myApprovals = wfActivity.filter(
    r => Number(r.AD_WF_Responsible_ID?.id) === Number(userId),
  );
  const suspendedList = myApprovals.filter(item => item.WFState?.id === 'OS');
  const OSCount = suspendedList.length;

  // Check if we have all required authentication
  const isAuthenticated =
    isCompleteAuthenticated &&
    !!token &&
    !!userId &&
    !!roleId &&
    !!serverConfig?.protocol;

  // Create API functions only when authenticated
  const apiFunctions = React.useMemo(() => {
    if (isAuthenticated) {
      return createApiFunctions(token, serverConfig);
    }
    return null;
  }, [isAuthenticated, token, serverConfig]);

  // React Query hooks for data fetching
  const {
    data: notificationCount = 0,
    isLoading: isNotificationsLoading,
    isError: isNotificationsError,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => apiFunctions?.fetchNotificationCount(userId),
    enabled: !!apiFunctions && !!userId,
    refetchOnWindowFocus: true,
    staleTime: 30000,
    cacheTime: 60000,
  });

  const {
    data: approvalCount = 0,
    isLoading: isApprovalsLoading,
    isError: isApprovalsError,
    refetch: refetchApprovals,
  } = useQuery({
    queryKey: ['approvals', roleId],
    queryFn: () => apiFunctions?.fetchApprovalCount(roleId),
    enabled: !!apiFunctions && !!roleId,
    refetchOnWindowFocus: true,
    staleTime: 30000,
    cacheTime: 60000,
  });

  const {
    data: requestCount = 0,
    isLoading: isRequestsLoading,
    isError: isRequestsError,
    refetch: refetchRequests,
  } = useQuery({
    queryKey: ['requests', userId],
    queryFn: () => apiFunctions?.fetchRequestCount(userId),
    enabled: !!apiFunctions && !!userId,
    refetchOnWindowFocus: true,
    staleTime: 30000,
    cacheTime: 60000,
  });

  // Combined loading state
  const isLoading =
    isNotificationsLoading || isApprovalsLoading || isRequestsLoading;

  // Refresh all data
  const handleRefresh = () => {
    if (queryClient) {
      refetchNotifications();
      refetchApprovals();
      refetchRequests();
    }
  };

  // Grid modules data - 2 per row
  const gridModules = React.useMemo(
    () => [
      {
        id: 1,
        title: 'CRM',
        icon: 'all-inclusive',
        color: 'rgba(43, 135, 234, 1)',
        onPress: () => navigation.navigate('CrmScreen'),
      },
      {
        id: 2,
        title: 'Approval',
        icon: 'task-alt',
        color: 'rgba(43, 135, 234, 1)',
        count: OSCount,
        onPress: () =>
          navigation.navigate('WFStatusList', {
            title: 'Suspended',
            data: suspendedList,
          }),
      },

      {
        id: 3,
        title: 'Requests',
        icon: 'git-pull-request-outline',
        color: 'rgba(43, 135, 234, 1)',
        count: requestCount,
        onPress: () => navigation.navigate('Requests'),
      },
      {
        id: 4,
        title: 'Employee Portal',
        icon: 'polyline',
        color: 'rgba(43, 135, 234, 1)',
        onPress: () => navigation.navigate('EmployeePortal'),
      },
    ],
    [requestCount, OSCount, navigation],
  );

  // Back handler
  useEffect(() => {
    const handleBackButton = () => {
      BackHandler.exitApp();
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', handleBackButton);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
    };
  }, []);

  // Refresh data when screen is focused
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused && isAuthenticated && queryClient) {
      // Invalidate and refetch all queries
      queryClient.invalidateQueries(['notifications', userId]);
      queryClient.invalidateQueries(['approvals', roleId]);
      queryClient.invalidateQueries(['requests', userId]);
    }
  }, [isFocused, isAuthenticated, queryClient, userId, roleId]);

  // If QueryClient is not available, show a loading state
  if (!queryClient) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#ffffff"
          translucent={false}
        />
        <ActivityIndicator
          size="large"
          color="#2B87EA"
          style={styles.loadingContainer}
        />
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content" // Light icons (dark-content for light background)
        backgroundColor="#ffffff" // White background
        translucent={false} // Not translucent
      />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={['#2B87EA']}
            tintColor="#2B87EA"
            enabled={isAuthenticated}
          />
        }>
        {/* Loading Overlay - only show if manually refreshing */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#2B87EA" />
          </View>
        )}

        {/* Header Section */}
        <View style={[styles.header, {paddingTop: getResponsiveHeight(20)}]}>
          <View style={styles.headerRow}>
            {/* Username */}
            <TouchableOpacity
              style={styles.usernameContainer}
              onPress={() => navigation.navigate('ProfileScreen')}
              activeOpacity={0.7}>
              <Text
                style={[styles.username, {fontSize: getResponsiveSize(26)}]}>
                {userName || 'User'}
              </Text>
              <Icon
                name="chevron-forward-outline"
                size={getResponsiveSize(16)}
                color="#666"
                style={styles.chevronIcon}
              />
            </TouchableOpacity>

            {/* Notification Bell */}
            <TouchableOpacity
              style={[
                styles.notificationBell,
                {
                  width: getResponsiveSize(45),
                  height: getResponsiveSize(45),
                  borderRadius: getResponsiveSize(22.5),
                },
              ]}
              onPress={() => navigation.navigate('NotificationSrn')}>
              <Icon
                name="notifications-outline"
                size={getResponsiveSize(24)}
                color="#000"
              />
              {notificationCount > 0 && (
                <View
                  style={[
                    styles.notificationBadge,
                    {
                      minWidth: getResponsiveSize(20),
                      height: getResponsiveSize(20),
                      borderRadius: getResponsiveSize(10),
                    },
                  ]}>
                  <Text
                    style={[
                      styles.badgeText,
                      {fontSize: getResponsiveSize(11)},
                    ]}>
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Blue Card */}
        <View
          style={[
            styles.blueCard,
            {
              borderRadius: getResponsiveSize(15),
              marginTop: getResponsiveHeight(15),
              padding: getResponsiveSize(20),
              height: getResponsiveHeight(145),
              width: SCREEN_WIDTH * 0.9,
              alignSelf: 'center',
            },
          ]}>
          <Image
            source={require('../../asserts/HomeScreenAssets/CardAssets/card.png')}
            style={styles.cardBackground}
          />
          <Text
            style={[
              styles.cardTitle,
              {
                fontSize: getResponsiveSize(17),
                lineHeight: getResponsiveHeight(30),
              },
            ]}>
            <Text style={styles.cardTitleMain}>Sales </Text>
            <Text style={styles.cardTitleSub}>Performance</Text>
          </Text>
          <Text
            style={[
              styles.cardTitle2,
              {
                fontSize: getResponsiveSize(17),
                lineHeight: getResponsiveHeight(20),
              },
            ]}>
            <Text style={styles.cardTitleMain}>Command </Text>
            <Text style={styles.cardTitleSub}>Center</Text>
          </Text>
          <View style={styles.cardBottomRow}>
            <Text
              style={[
                styles.cardSubtitle,
                {
                  fontSize: getResponsiveSize(13),
                  marginTop: getResponsiveHeight(10),
                },
              ]}>
              Track Operations in Real-Time
            </Text>
            <TouchableOpacity
              style={[
                styles.analyticsBtn,
                {
                  borderRadius: getResponsiveSize(20),
                  marginTop: getResponsiveHeight(12),
                  paddingHorizontal: getResponsiveSize(15),
                  paddingVertical: getResponsiveHeight(8),
                },
              ]}>
              <Text
                style={[
                  styles.analyticsBtnTxt,
                  {fontSize: getResponsiveSize(13)},
                ]}>
                View Analytics
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats Row */}
        <View
          style={[
            styles.topRow,
            {
              borderRadius: getResponsiveSize(12),
              marginTop: getResponsiveHeight(20),
              paddingVertical: getResponsiveHeight(18),
              width: SCREEN_WIDTH * 0.9,
              alignSelf: 'center',
            },
          ]}>
          <View style={styles.iconBox}>
            <View
              style={[
                styles.iconWrapper,
                {
                  height: getResponsiveSize(48),
                  width: getResponsiveSize(48),
                  borderRadius: getResponsiveSize(24),
                },
              ]}>
              <MaterialIcons
                name="sync"
                size={getResponsiveSize(18)}
                color="rgba(59, 99, 125, 1)"
              />
            </View>
            <Text
              style={[
                styles.iconLabel,
                {
                  fontSize: getResponsiveSize(13),
                  marginTop: getResponsiveHeight(10),
                },
              ]}>
              Analytics
            </Text>
          </View>
          <View style={styles.iconBox}>
            <View
              style={[
                styles.iconWrapper,
                {
                  backgroundColor: 'rgba(248, 233, 229, 1)',
                  height: getResponsiveSize(48),
                  width: getResponsiveSize(48),
                  borderRadius: getResponsiveSize(24),
                },
              ]}>
              <MaterialIcons
                name="assignment"
                size={getResponsiveSize(18)}
                color="rgba(183, 113, 85, 1)"
              />
            </View>
            <Text
              style={[
                styles.iconLabel,
                {
                  fontSize: getResponsiveSize(13),
                  marginTop: getResponsiveHeight(10),
                },
              ]}>
              Sales
            </Text>
          </View>
          <View style={styles.iconBox}>
            <View
              style={[
                styles.iconWrapper,
                {
                  backgroundColor: 'rgba(252, 238, 255, 1)',
                  height: getResponsiveSize(48),
                  width: getResponsiveSize(48),
                  borderRadius: getResponsiveSize(24),
                },
              ]}>
              <MaterialIcons
                name="gpp-maybe"
                size={getResponsiveSize(22)}
                color="rgba(185, 139, 184, 1)"
              />
            </View>
            <Text
              style={[
                styles.iconLabel,
                {
                  fontSize: getResponsiveSize(13),
                  marginTop: getResponsiveHeight(10),
                },
              ]}>
              Reports
            </Text>
          </View>
          <View style={styles.iconBox}>
            <View
              style={[
                styles.iconWrapper,
                {
                  backgroundColor: 'rgba(239, 254, 233, 1)',
                  height: getResponsiveSize(48),
                  width: getResponsiveSize(48),
                  borderRadius: getResponsiveSize(24),
                },
              ]}>
              <View
                style={[
                  styles.circle,
                  {
                    width: getResponsiveSize(20),
                    height: getResponsiveSize(20),
                    borderRadius: getResponsiveSize(10),
                    borderColor: 'rgba(91, 159, 70, 1)',
                  },
                ]}>
                <Icon
                  name="pencil"
                  size={getResponsiveSize(12)}
                  color="rgba(91, 159, 70, 1)"
                />
              </View>
            </View>
            <Text
              style={[
                styles.iconLabel,
                {
                  fontSize: getResponsiveSize(13),
                  marginTop: getResponsiveHeight(10),
                },
              ]}>
              Accounts
            </Text>
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.sectionTitleContainer}>
          <Text
            style={[
              styles.sectionTitle,
              {
                fontSize: getResponsiveSize(22),
                marginBottom: getResponsiveHeight(15),
              },
            ]}>
            Categories
          </Text>
        </View>

        {/* Grid Layout - 2 modules per row */}
        <View
          style={[
            styles.gridContainer,
            {
              paddingHorizontal: getResponsiveSize(15),
              marginBottom: getResponsiveHeight(40),
            },
          ]}>
          {/* First Row */}
          <View style={styles.gridRow}>
            {gridModules.slice(0, 2).map(module => (
              <TouchableOpacity
                key={module.id}
                style={[
                  styles.gridBox,
                  {
                    width: (SCREEN_WIDTH - getResponsiveSize(45)) / 2,
                    height: getResponsiveHeight(150),
                    borderRadius: getResponsiveSize(12),
                  },
                ]}
                onPress={module.onPress}>
                <View
                  style={[
                    styles.gridIconWrapper,
                    {
                      height: getResponsiveSize(70),
                      width: getResponsiveSize(70),
                      borderRadius: getResponsiveSize(35),
                      backgroundColor: 'rgba(90, 141, 238, 0.1)',
                    },
                  ]}>
                  {module.icon.includes('git-pull-request-outline') ? (
                    <Icon
                      name={module.icon}
                      size={getResponsiveSize(28)}
                      color={module.color}
                    />
                  ) : (
                    <MaterialIcons
                      name={module.icon}
                      size={getResponsiveSize(33)}
                      color={module.color}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.gridLabel,
                    {
                      fontSize: getResponsiveSize(16),
                      marginTop: getResponsiveHeight(8),
                    },
                  ]}>
                  {module.title}
                </Text>
                {module.count > 0 && (
                  <View
                    style={[
                      styles.gridBadge,
                      {
                        minWidth: getResponsiveSize(22),
                        height: getResponsiveSize(22),
                        borderRadius: getResponsiveSize(11),
                      },
                    ]}>
                    <Text
                      style={[
                        styles.gridBadgeText,
                        {fontSize: getResponsiveSize(12)},
                      ]}>
                      {module.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Second Row */}
          <View style={[styles.gridRow, {marginTop: getResponsiveHeight(15)}]}>
            {gridModules.slice(2, 4).map(module => (
              <TouchableOpacity
                key={module.id}
                style={[
                  styles.gridBox,
                  {
                    width: (SCREEN_WIDTH - getResponsiveSize(45)) / 2,
                    height: getResponsiveHeight(150),
                    borderRadius: getResponsiveSize(12),
                  },
                ]}
                onPress={module.onPress}>
                <View
                  style={[
                    styles.gridIconWrapper,
                    {
                      height: getResponsiveSize(70),
                      width: getResponsiveSize(70),
                      borderRadius: getResponsiveSize(35),
                      backgroundColor: 'rgba(90, 141, 238, 0.1)',
                    },
                  ]}>
                  {module.icon.includes('git-pull-request-outline') ? (
                    <Icon
                      name={module.icon}
                      size={getResponsiveSize(28)}
                      color={module.color}
                    />
                  ) : (
                    <MaterialIcons
                      name={module.icon}
                      size={getResponsiveSize(33)}
                      color={module.color}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.gridLabel,
                    {
                      fontSize: getResponsiveSize(16),
                      marginTop: getResponsiveHeight(8),
                    },
                  ]}>
                  {module.title}
                </Text>
                {module.count > 0 && (
                  <View
                    style={[
                      styles.gridBadge,
                      {
                        minWidth: getResponsiveSize(22),
                        height: getResponsiveSize(22),
                        borderRadius: getResponsiveSize(11),
                      },
                    ]}>
                    <Text
                      style={[
                        styles.gridBadgeText,
                        {fontSize: getResponsiveSize(12)},
                      ]}>
                      {module.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },

  // Loading Overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },

  // Header Styles
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

  // Blue Card
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

  // Grid Layout - 2 per row
  gridContainer: {
    width: '100%',
  },
  gridRow: {
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
    textAlign: 'center',
  },
  gridBadge: {
    position: 'absolute',
    top: getResponsiveSize(10),
    right: getResponsiveSize(50),
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  gridBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'K2D-Bold',
  },
});

export default HomeScreen;
