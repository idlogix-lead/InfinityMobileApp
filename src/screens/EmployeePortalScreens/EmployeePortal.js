import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StatusBar,
} from 'react-native';
import React, {useEffect, useState} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import {Picker} from '@react-native-picker/picker';
import Loader from '../../components/Loader';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';

import CustomHeader from '../../components/CustomHeader';
import PortalCards from '../../components/EmployeePortalComponents/PortalCards';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LeaveStatus from './LeaveStatusScreen/LeaveStatus';
import UpperCard from '../../components/LeaveStatusComponents/UpperCard';

const EmployeePortal = ({navigation}) => {
  const [partnerId, setPartnerId] = useState(null);
  const [requestInfo, setRequestInfo] = useState([]);
  const [applyFilter, setApplyFilter] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshData, setRefreshData] = useState(false);

  const FindBusinessPrtId = async () => {
    const token = await AsyncStorage.getItem('token');
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const Id = await AsyncStorage.getItem('userId');

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
      setPartnerId(response?.data?.records[0]?.C_BPartner_ID?.id);
    } catch (error) {
      console.error('Error :', error);
    }
  };

  const LeaveRequestInfo = async () => {
    setIsLoading(true);
    const token = await AsyncStorage.getItem('token');
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');

    let startDate = new Date();
    let endDate = new Date();

    if (applyFilter === 'Last 7 Days') {
      startDate.setDate(endDate.getDate() - 7);
    } else if (applyFilter === 'Last month') {
      startDate.setMonth(endDate.getMonth() - 1);
    } else {
      startDate = new Date('2000-01-01');
    }

    const formattedStartDate = startDate.toISOString().split('T')[0];
    // console.log(formattedStartDate,'formattedStartDate')
    const formattedEndDate = endDate.toISOString().split('T')[0];
    // console.log(formattedEndDate,'formattedEndDate')

    const filter = `startdate ge ${formattedStartDate} and enddate le ${formattedEndDate}`;

    const orderby = `EndDate desc`;
    // console.log(filter,'filterInLeaveStatus')

    try {
      const urlInLeaveStatusShow = `${protocol}://${host}:${port}/api/v1/models/HR_EmpLev_Posting?$filter=C_BPartner_ID eq ${partnerId} and ${filter}&$orderby=${orderby}`;
      console.log(urlInLeaveStatusShow, 'jkdfvkj');
      const response = await axios.get(
        `${protocol}://${host}:${port}/api/v1/models/HR_EmpLev_Posting?$filter=C_BPartner_ID eq ${partnerId}&$orderby=${orderby}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // console.log(response?.data?.records,'LeaveStatusListShow')

      const displayReverse = response?.data?.records;
      const extratReverse = displayReverse;
      // const extratReverse = displayReverse.reverse();
      setRequestInfo(extratReverse);
    } catch (error) {
      console.error('Error :', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLeaveRequestInfo = async () => {
    setIsLoading(true);
    await LeaveRequestInfo();
    setIsLoading(false);
  };

  useEffect(() => {
    FindBusinessPrtId();
  }, []);
  useEffect(() => {
    if (partnerId) {
      LeaveRequestInfo();
    }
  }, [applyFilter, partnerId]);

  const activityList = [
    {
      id: 1,
      title: 'Activity name',
      type: 'Activity Type',
      description: 'No Descriprtion Provided',
    },
    {
      id: 2,
      title: 'Activity name',
      type: 'Activity Type',
      description: 'No Descriprtion Provided',
    },
    {
      id: 3,
      title: 'Activity name',
      type: 'Activity Type',
      description: 'No Descriprtion Provided',
    },
  ];

  return (
    <View style={{flex: 1, justifyContent: 'center', paddingHorizontal: '3%'}}>
      <StatusBar barStyle={'dark-content'} translucent={true} />
      {/* <CustomHeader
        title="Employee Portal"
        RightIcon="account"
        RightPress={() => navigation.navigate('EmployeeProfileTopNavigation')}
      /> */}
      <View style={{top: '6%', height: 50}}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{paddingHorizontal: '5%'}}>
          <Icon name="arrow-back" size={25} color={'#000'} />
        </TouchableOpacity>
      </View>
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
              {/* <Text style={styles.name}>Name:</Text> */}
              <Text style={styles.name}>Muhammad Anwar</Text>
              {/* <Text style={{color: 'gray', marginLeft: 20}}>{id}</Text> */}
            </View>
            <View style={{flexDirection: 'row', marginTop: -5}}>
              {/* <Text style={{color: 'black'}}>Company:</Text> */}
              <Text style={styles.company}>Hr Manager</Text>
            </View>

            {/* <View style={{flexDirection: 'row', marginTop: -5}}>
              
              <Text style={styles.company}>2 leaves</Text>
            </View> */}
          </View>
        </View>
        {/* notification */}
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

          {/* {notificationCount > 0 && <View style={styles.redDot} />} */}
        </View>
      </View>
      <View style={{height: 150}}>
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

      <View>
        <Text
          style={[
            styles.sectionTitle,
            {paddingHorizontal: '5%', marginBottom: '5%'},
          ]}>
          Today's Activity
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{}}>
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 10,
            alignItems: 'center',
            // backgroundColor: 'gray',
            height: 120,
            // marginTop: '40%',
          }}>
          {activityList.map(item => (
            <View
              key={item.id}
              style={{
                width: 180,
                height: 120,
                padding: 12,
                backgroundColor: '#fff',
                elevation: 4,
                borderRadius: 10,
                marginRight: 10,
                justifyContent: 'center',
              }}>
              <Text
                style={[
                  styles.activityCardTxt,
                  {fontFamily: 'K2D-Bold', color: '#333'},
                ]}>
                {item.title}
              </Text>
              <Text style={styles.activityCardTxt}>{item.type}</Text>
              <Text style={[styles.activityCardTxt]}>{item.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.leaveBalance}>
        <View>
          <Text style={styles.leaveBalanceTxt}>Current Leave Balance</Text>
        </View>
        <View
          style={{
            height: 25,
            width: 25,
            borderRadius: 15,
            backgroundColor: '#2F4FE3',
            // elevation: 6,
            // shadowColor: '#000',
            justifyContent: 'center',
          }}>
          <Text
            style={[
              styles.leaveBalanceTxt,
              {
                color: '#fff',
                textAlign: 'center',
                fontSize: 12,
                fontFamily: 'K2D-Bold',
              },
            ]}>
            02
          </Text>
        </View>

        {/* <Text style={styles.sectionTitle}>Current Leave Balance : </Text> */}
      </View>

      {/* Attendense Status section */}
      <View style={{padding: 10, top: '-5%'}}>
        <Text style={styles.sectionTitle}>Today Attendance</Text>

        <View style={styles.attendenceStatusWrapper}>
          <View style={styles.attendenceStatusCard}>
            <View
              style={{
                flexDirection: 'row',
                paddingTop: '6%',
                paddingHorizontal: '10%',
              }}>
             <View
                style={{
                  backgroundColor: 'rgb(229, 241, 254)',
                  padding: 4,
                  borderRadius: 4,
                }}>
                <Icon
                  name="exit-outline"
                  size={18}
                  color={'#rgba(43, 135, 234, 1)'}
                />
              </View>
              <Text style={styles.attendenseHeader}>CheckIn</Text>
            </View>
            <View style={{paddingHorizontal: '10%', paddingVertical: '3%'}}>
              <Text style={styles.attendenseTxt}>09:05:56 am</Text>
              <Text style={[styles.checkTime, {paddingTop: '2%'}]}>
                On Time
              </Text>
            </View>
          </View>
          <View style={styles.attendenceStatusCard}>
            <View
              style={{
                flexDirection: 'row',
                paddingTop: '6%',
                paddingHorizontal: '10%',
              }}>
              <View
                style={{
                  backgroundColor: 'rgb(229, 241, 254)',
                  padding: 4,
                  borderRadius: 4,
                }}>
                <Icon
                  name="exit-outline"
                  size={18}
                  color={'#rgba(43, 135, 234, 1)'}
                />
              </View>
              <Text style={styles.attendenseHeader}>Check Out</Text>
            </View>
            <View style={{paddingHorizontal: '10%', paddingVertical: '3%'}}>
              <Text style={styles.attendenseTxt}>09:05:56 am</Text>
              <Text style={[styles.checkTime, {paddingTop: '2%'}]}>
                Go Home
              </Text>
            </View>
          </View>
        </View>
      </View>
      {/* <View style={styles.portalCardWrapper}>
        <PortalCards
          onPress={() => navigation.navigate('SalarySlip')} 1
          text="Salary Slip"
          image={require('../../asserts/EmployePortal/saleryslip.png')}
          // icon={<AntDesign name="right" size={20} color="#000" />}
        />
        <PortalCards
          onPress={() => navigation.navigate('AttendenceStatus')} x
          text="Attendence Status"
          image={require('../../asserts/EmployePortal/attendenceStatus.png')}
          // icon={<AntDesign name="right" size={20} color="#000" />}
        />
        <PortalCards
          onPress={() => navigation.navigate('StaffAttendance')} 2
          text="Staff Attendence"
          image={require('../../asserts/EmployePortal/staffAttendence.png')}
          // icon={<AntDesign name="right" size={20} color="#000" />}
        />
        <PortalCards
          onPress={() => navigation.navigate('LeaveStatus')} render below
          text="Leave Status"
          image={require('../../asserts/EmployePortal/leaveStatus.png')}
          // icon={<AntDesign name="right" size={20} color="#000" />}
        />
        <PortalCards
          text="Score Card"
          image={require('../../asserts/EmployePortal/scoreCard.png')} 3
          // icon={<AntDesign name="right" size={20} color="#000" />}
        />
        <PortalCards
          onPress={() => navigation.navigate('EmployeeProfileTopNavigation')} on header
          text="Profile"
          image={require('../../asserts/EmployePortal/profile.png')}
          // icon={<AntDesign name="right" size={20} color="#000" />}
        />
      </View> */}

      {/* leave status */}

      {/* <View
        style={{
          marginTop: '-5%',
          bottom: 20,
          position: 'relative',
          alignItems: 'center',
        }}> */}
      {/* <View style={styles.TopView}>
          <Text style={styles.TopTxt}>Leave Request Info</Text> */}
      {/* this piccker is change in filter */}
      {/* <View style={styles.PickerContainer}>
          <Picker
            style={styles.PickerContent}
            selectedValue={applyFilter}
            dropdownIconColor={'#000'}
            onValueChange={(itemValue, itemIndex) => setApplyFilter(itemValue)}>
            <Picker.Item label="All" value="All" />
            <Picker.Item label="Last month" value="Last month" />
            <Picker.Item label="Last 7 Days" value="Last 7 Days" />
          </Picker>
        </View> */}
      {/* <Menu>
            <MenuTrigger>
              <MaterialIcons name="filter-alt" size={28} color="#2F4FE3" />
            </MenuTrigger>

            <MenuOptions>
              <MenuOption onSelect={() => setApplyFilter('All')}>
                <Text style={{padding: 8, color: '#000'}}>All</Text>
              </MenuOption>

              <MenuOption onSelect={() => setApplyFilter('Last month')}>
                <Text style={{padding: 8, color: '#000'}}>Last month</Text>
              </MenuOption>

              <MenuOption onSelect={() => setApplyFilter('Last 7 Days')}>
                <Text style={{padding: 8, color: '#000'}}>Last 7 Days</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
        </View> */}

      {/* <View style={styles.BottomContainer}>
          <View style={styles.BottomHeader}>
            <View style={{width: '27%', alignItems: 'center'}}>
              <Text style={styles.HeaderTxt}>From</Text>
            </View>
            <View style={{width: '27%', alignItems: 'center'}}>
              <Text style={styles.HeaderTxt}>To</Text>
            </View>
            <View style={{width: '22%', alignItems: 'center'}}>
              <Text style={styles.HeaderTxt}>Type</Text>
            </View>
            <View style={{width: '20%', alignItems: 'center'}}>
              <Text style={styles.HeaderTxt}>Status</Text>
            </View>
          </View>
          <View style={{height: '73%'}}>
            <FlatList
              data={requestInfo}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <View style={styles.RowTxt}>
                  <Text style={[styles.respTxt, {width: '27%'}]}>
                    {item.StartDate}
                  </Text>
                  <Text style={[styles.respTxt, {width: '27%'}]}>
                    {item.EndDate}
                  </Text>
                  <Text style={[styles.respTxt, {width: '22%'}]}>
                    {item.HR_LevTypes_ID?.identifier}
                  </Text>
                  <Text style={[styles.respTxt, {width: '20%'}]}>
                    {item.DocStatus?.identifier}
                  </Text>

                  <Menu style={{justifyContent: 'center'}}>
                    <MenuTrigger>
                      <MaterialCommunityIcons
                        name="dots-vertical"
                        size={23}
                        color="#000"
                      />
                    </MenuTrigger>

                    <MenuOptions style={styles.popupContainer}>
                      {item.DocStatus?.identifier === 'Drafted' ? (
                        <MenuOption
                          onSelect={() =>
                            navigation.navigate('AnnualLeave', {
                              record: item,
                              isEdit: true,
                              refreshLeaveRequestInfo,
                            })
                          }>
                          <Text style={styles.PopupTxt}>Edit</Text>
                        </MenuOption>
                      ) : (
                        <MenuOption
                          onSelect={() =>
                            navigation.navigate('DetailedLeave', {record: item})
                          }>
                          <Text style={styles.PopupTxt}>Details</Text>
                        </MenuOption>
                      )}
                    </MenuOptions>
                  </Menu>
                </View>
              )}
            />
          </View>
        </View> */}
      {/* </View> */}

      <TouchableOpacity
        onPress={() =>
          navigation.navigate('AnnualLeave', {refreshLeaveRequestInfo})
        }
        style={styles.floatingButton}>
        <MaterialCommunityIcons name="plus" size={15} color="#fff" />
      </TouchableOpacity>

      {isLoading ? <Loader /> : null}
    </View>
  );
};

export default EmployeePortal;

const styles = StyleSheet.create({
  portalCardWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: '5%',
    justifyContent: 'space-between',
    marginTop: '10%',
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
  },
  activityCardTxt: {
    fontFamily: 'K2D-Regular',
    fontSize: 13,
    color: 'gray',
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
    width: '30%',
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
    fontSize: 15,
    fontFamily: 'K2D-Medium',
    color: '#333',
    textAlign: 'center',
  },
  leaveBalance: {
    // backgroundColor:'#ccc',
    flexDirection: 'row',
    height: 50,
    top: '-15%',
    paddingHorizontal: '5%',
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 6,
    width: '95%',
    left: 10,
  },
  leaveBalanceTxt: {
    fontFamily: 'K2D-Medium',
    fontSize: 15,
    color: 'rgba(60, 60, 60, 1)',
    alignItems: 'center',
  },

  // attendese status
  attendenseStatusTitle: {
    // top: 10,
    color: '#000',
    paddingBottom: 5,
  },
  attendenseHeader: {
    color: '#333',
    paddingHorizontal: '10%',
    fontFamily: 'K2D-Bold',
    textAlignVertical: 'center',
    letterSpacing:1,
    fontSize: 13,
  },
  attendenseTxt: {
    color: '#000',
    fontFamily: 'K2D-Bold',
    fontSize: 16,
  },
  checkTime: {
    color: '#333',
    fontFamily: 'K2D-Bold',
    fontSize: 13,
  },
  attendenceStatusWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: '3%',
  },
  attendenceStatusCard: {
    width: '48%',
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 6,
    // elevation: 1,
    shadowColor: '#000',
    // padding: '5%'
  },

  TopView: {
    width: '90%',
    height: 50,
    alignSelf: 'center',
    marginTop: '-0%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '3%',
  },
  TopTxt: {
    color: '#000',
    fontFamily: 'K2D-Bold',
    fontSize: 15,
  },
  PickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: '40%',
    height: 40,
    borderRadius: 6,
  },
  PickerContent: {
    height: '20%',
    color: '#000',
    // fontSize: 12
  },
  BottomContainer: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    elevation: 6,
    shadowColor: '#000',
    borderRadius: 6,
    height: 250,
  },
  BottomHeader: {
    flexDirection: 'row',
    height: '20%',
    backgroundColor: '#fff',
    marginTop: '-2%',
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 6,
    borderTopLeftRadius: 6,
  },
  HeaderTxt: {
    fontFamily: 'K2D-Bold',
    color: '#000',
    fontSize: 16,
    paddingLeft: 4,
  },
  respTxt: {
    color: '#000',
    fontFamily: 'K2D-Regular',
    fontSize: 14,
    textAlign: 'center',
    paddingTop: 10,
    textAlignVertical: 'center',
  },
  RowTxt: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
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
  popupContainer: {
    // paddingLeft: 10,
    position: 'absolute',
    top: 25,
    right: 18,
    backgroundColor: '#e1e2e3',
    borderRadius: 5,
  },
  PopupTxt: {
    color: '#000',
    fontFamily: 'K2D-Regular',
    fontSize: 16,
    paddingHorizontal: 15,
  },
});
