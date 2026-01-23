// src/screens/EmployeePortal/EmployeePortal.js
import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  BackHandler,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuthStore } from '../../store/authStore';
import {
  useUserInfo,
  useTodayAttendance,
  useLeaveBalance,
  useActivities,
} from '../../hooks/useEmployeePortal';
import Loader from '../../components/Loader';

const EmployeePortal = ({ navigation, route }) => {
  // Get user info from auth store
  const userName = useAuthStore(state => state.userName);
  const roleName = useAuthStore(state => state.roleName);
  
  // Fetch user info
  const { 
    data: userInfo, 
    isLoading: userInfoLoading 
  } = useUserInfo();
  
  // Fetch data
  const { 
    data: todayAttendance, 
    isLoading: attendanceLoading 
  } = useTodayAttendance(true);
  
  const { 
    data: leaveBalance, 
    isLoading: balanceLoading 
  } = useLeaveBalance(true);
  
  const { 
    data: activities = [], 
    isLoading: activitiesLoading 
  } = useActivities(true);
  
  const isLoading = userInfoLoading || attendanceLoading || 
                    balanceLoading || activitiesLoading;

  // Handle back button press
  useEffect(() => {
    const backAction = () => {
      // Check if we can go back in navigation stack
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      } else {
        // If this is the first screen, ask user if they want to exit
        Alert.alert(
          'Exit App',
          'Do you want to exit the application?',
          [
            {
              text: 'Cancel',
              onPress: () => null,
              style: 'cancel',
            },
            {
              text: 'Exit',
              onPress: () => BackHandler.exitApp(),
            },
          ],
          { cancelable: false }
        );
        return true;
      }
    };

    // Add event listener for hardware back button
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    // Clean up the event listener
    return () => backHandler.remove();
  }, [navigation]);

  // Function to handle back navigation
  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // If no previous screen, navigate to home or dashboard
      // You can change this to wherever your app's home screen is
      navigation.navigate('Dashboard'); // Or 'Home', 'Main', etc.
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: '#fff', paddingHorizontal: '3%'}}>
      <StatusBar barStyle={'dark-content'} translucent={true} />
      
      {/* Back Button */}
      <View style={{height: 50, justifyContent: 'center', marginTop: 30}}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={{paddingHorizontal: '5%'}}>
          <Icon name="arrow-back" size={25} color={'#000'} />
        </TouchableOpacity>
      </View>
      
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
            }}
            style={styles.avatar}
          />
          <View>
            <View style={{flexDirection: 'row', marginTop: 0}}>
              <Text style={styles.name}>{userInfo?.Name || userName || 'Muhammad Anwar'}</Text>
            </View>
            <View style={{flexDirection: 'row', marginTop: -5}}>
              <Text style={styles.company}>{userInfo?.Title?.identifier || roleName || 'Hr Manager'}</Text>
            </View>
          </View>
        </View>
        
        {/* Notification Bell */}
        <View style={{position: 'relative'}}>
          <TouchableOpacity
            style={styles.notificationBellViewStyle}
            onPress={() => navigation.navigate('NotificationSrn')}>
            <Icon
              name="notifications-outline"
              size={20}
              color="#000"
              style={{alignSelf: 'center'}}
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Quick Actions Grid */}
      <View style={{marginBottom: 10}}>
        <View style={styles.bottomGrid}>
          <TouchableOpacity
            style={[styles.gridBox, {backgroundColor: 'rgb(253, 242, 248)'}]}
            onPress={() => navigation.navigate('SalarySlip')}>
            <View style={styles.gridIconWrapper}>
              <MaterialCommunityIcons
                name="file-document-outline"
                size={25}
                color=" rgb(246, 151, 203)"
              />
            </View>
            <Text style={styles.gridLabel}>Salary {'\n'}Slip</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.gridBox, {backgroundColor: 'rgb(253, 254, 240)'}]}
            onPress={() => navigation.navigate('AttendenceStatus')}>
            <View style={styles.gridIconWrapper}>
              <MaterialCommunityIcons
                name="clipboard-check-outline"
                size={25}
                color="rgb(226, 236, 94)"
              />
            </View>
            <Text style={styles.gridLabel}>Attandence Status</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.gridBox, {backgroundColor: 'rgb(229, 241, 254)'}]}
            onPress={() => navigation.navigate('StaffAttendance')}>
            <View style={styles.gridIconWrapper}>
              <MaterialCommunityIcons
                name="badge-account-outline"
                size={25}
                color="rgba(43, 135, 234, 1)"
              />
            </View>
            <Text style={styles.gridLabel}>Staff Attendence</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Today's Activity Header */}
      <View style={{marginBottom: 10}}>
        <Text style={[styles.sectionTitle, {paddingHorizontal: '5%'}]}>
          Today's Activity
        </Text>
      </View>
      
      {/* Activities Scroll */}
      <View style={{height: 140, marginBottom: 15}}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{flexDirection: 'row', paddingHorizontal: 10}}>
            {activities.map((item, index) => (
              <View
                key={index}
                style={styles.activityCard}>
                <Text style={[styles.activityCardTxt, {fontFamily: 'K2D-Bold', color: '#333'}]}>
                  {item.title}
                </Text>
                <Text style={styles.activityCardTxt}>{item.type}</Text>
                <Text style={[styles.activityCardTxt]}>{item.description}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
      
      {/* Leave Balance */}
      <View style={[styles.leaveBalance, {marginHorizontal: '5%', marginBottom: 15}]}>
        <View>
          <Text style={styles.leaveBalanceTxt}>Current Leave Balance</Text>
        </View>
        <View style={styles.leaveBalanceBadge}>
          <Text style={styles.leaveBalanceBadgeText}>
            {leaveBalance?.balance || 2}
          </Text>
        </View>
      </View>

      {/* Today's Attendance - In Cards Side by Side (No Scroll) */}
      <View style={{paddingHorizontal: '5%', marginBottom: 20}}>
        <Text style={styles.sectionTitle}>Today Attendance</Text>
        <View style={styles.attendanceCardsContainer}>
          {/* Check In Card */}
          <View style={styles.attendanceCard}>
            <View style={styles.attendanceCardHeader}>
              <View style={styles.attendanceCardIcon}>
                <Icon
                  name="enter-outline"
                  size={18}
                  color={'#rgba(43, 135, 234, 1)'}
                />
              </View>
              <Text style={[styles.attendanceCardTitle, {fontFamily: 'K2D-Bold', color: '#333'}]}>
                Check In
              </Text>
            </View>
            
            {/* Card Content */}
            <View style={styles.attendanceCardContent}>
              <Text style={styles.attendanceCardTime}>
                {todayAttendance?.checkInTime || '09:05:56 am'}
              </Text>
              <Text style={styles.attendanceCardStatus}>
                On Time
              </Text>
            </View>
          </View>
          
          {/* Check Out Card */}
          <View style={styles.attendanceCard}>
            <View style={styles.attendanceCardHeader}>
              <View style={styles.attendanceCardIcon}>
                <Icon
                  name="exit-outline"
                  size={18}
                  color={'#rgba(43, 135, 234, 1)'}
                />
              </View>
              <Text style={[styles.attendanceCardTitle, {fontFamily: 'K2D-Bold', color: '#333'}]}>
                Check Out
              </Text>
            </View>
            
            {/* Card Content */}
            <View style={styles.attendanceCardContent}>
              <Text style={styles.attendanceCardTime}>
                {todayAttendance?.checkOutTime || '--:--:--'}
              </Text>
              <Text style={styles.attendanceCardStatus}>
                Go Home
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('AnnualLeave')
        }
        style={styles.floatingButton}>
        <MaterialCommunityIcons name="plus" size={15} color="#fff" />
      </TouchableOpacity>

      {isLoading && <Loader />}
    </View>
  );
};

export default EmployeePortal;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: '5%',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  name: {
    fontSize: 15,
    fontFamily: 'K2D-SemiBold',
    color: 'rgba(60, 60, 60, 1)',
  },
  company: {
    fontSize: 15,
    fontFamily: 'K2D-Regular',
    color: 'rgba(125, 125, 125, 1)',
  },
  notificationBellViewStyle: {
    width: 35,
    height: 35,
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
  sectionTitle: {
    fontFamily: 'K2D-Bold',
    fontSize: 15,
    color: '#000',
    marginBottom: 10,
  },
  activityCard: {
    width: 180,
    height: 120,
    padding: 12,
    backgroundColor: '#fff',
    elevation: 4,
    borderRadius: 10,
    marginRight: 10,
    justifyContent: 'center',
  },
  activityCardTxt: {
    fontFamily: 'K2D-Regular',
    fontSize: 13,
    color: 'gray',
  },
  bottomGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: '3%',
    backgroundColor: 'white',
  },
  gridBox: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    elevation: 5,
  },
  gridIconWrapper: {
    backgroundColor: '#fff',
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#333',
  },
  gridLabel: {
    marginTop: 6,
    fontSize: 15,
    fontFamily: 'K2D-Medium',
    color: '#333',
    textAlign: 'center',
  },
  leaveBalance: {
    flexDirection: 'row',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 6,
    paddingHorizontal: 15,
  },
  leaveBalanceTxt: {
    fontFamily: 'K2D-Medium',
    fontSize: 15,
    color: 'rgba(60, 60, 60, 1)',
  },
  leaveBalanceBadge: {
    height: 25,
    width: 25,
    borderRadius: 15,
    backgroundColor: '#2F4FE3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaveBalanceBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'K2D-Bold',
  },

  // Attendance Cards Container
  attendanceCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  // Attendance Card
  attendanceCard: {
    width: '48%',
    height: 120,
    padding: 12,
    backgroundColor: '#fff',
    elevation: 4,
    borderRadius: 10,
    justifyContent: 'space-between',
  },
  attendanceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  attendanceCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgb(229, 241, 254)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  attendanceCardTitle: {
    fontSize: 14,
    fontFamily: 'K2D-Bold',
    color: '#333',
  },
  attendanceCardContent: {
    // Empty for styling structure
  },
  attendanceCardTime: {
    fontSize: 16,
    fontFamily: 'K2D-Bold',
    color: '#000',
    marginBottom: 4,
  },
  attendanceCardStatus: {
    fontSize: 13,
    fontFamily: 'K2D-Bold',
    color: '#333',
  },

  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#2F4FE3',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
  },
});