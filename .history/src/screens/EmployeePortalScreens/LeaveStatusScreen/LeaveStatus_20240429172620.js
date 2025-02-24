import { StyleSheet, Text, TouchableOpacity, View, FlatList, } from 'react-native'
import React, { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CustomHeader from '../../../components/CustomHeader'
import UpperCard from '../../../components/LeaveStatusComponents/UpperCard'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { Picker } from '@react-native-picker/picker';
import Loader from '../../../components/Loader';
import { Menu, MenuOptions, MenuOption, MenuTrigger, } from 'react-native-popup-menu';

const LeaveStatus = ({ navigation }) => {
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
    const Id = await AsyncStorage.getItem("userId");

    try {
      const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/AD_User?$filter=AD_User_ID eq ${Id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      setPartnerId(response?.data?.records[0]?.C_BPartner_ID?.id)

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
    const formattedEndDate = endDate.toISOString().split('T')[0];

    const filter = `startdate ge ${formattedStartDate} and enddate le ${formattedEndDate}`;

    try {
      const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/HR_EmpLev_Posting?$filter=C_BPartner_ID eq ${partnerId} and ${filter} `,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        console.log(response.data,'data')
      const displayReverse = response?.data?.records;
      const extratReverse = displayReverse.reverse();
      setRequestInfo(extratReverse)
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

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader title='Leave Status' />
      <UpperCard />

      <View style={styles.TopView}>
        <Text style={styles.TopTxt}>Leave Request Info</Text>
        <View style={styles.PickerContainer}>
          <Picker
            style={styles.PickerContent}
            selectedValue={applyFilter}
            dropdownIconColor={'#000'}
            onValueChange={(itemValue, itemIndex) =>
              setApplyFilter(itemValue)
            }>
            <Picker.Item label="All" value="All" />
            <Picker.Item label="Last month" value="Last month" />
            <Picker.Item label="Last 7 Days" value="Last 7 Days" />
          </Picker>
        </View>
      </View>

      <View style={styles.BottomContainer}>
        <View style={styles.BottomHeader}>
          <View style={{ width: '27%', alignItems: 'center' }}>
            <Text style={styles.HeaderTxt}>From</Text>
          </View>
          <View style={{ width: '27%', alignItems: 'center' }}>
            <Text style={styles.HeaderTxt}>To</Text>
          </View>
          <View style={{ width: '22%', alignItems: 'center' }}>
            <Text style={styles.HeaderTxt}>Type</Text>
          </View>
          <View style={{ width: '20%', alignItems: 'center' }}>
            <Text style={styles.HeaderTxt}>Status</Text>
          </View>
        </View>
        <View style={{ height: '73%' }}>
          <FlatList
            data={requestInfo}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.RowTxt}>
                <Text style={[styles.respTxt, { width: '27%' }]}>{item.StartDate}</Text>
                <Text style={[styles.respTxt, { width: '27%' }]}>{item.EndDate}</Text>
                <Text style={[styles.respTxt, { width: '22%' }]}>{item.HR_LevTypes_ID?.identifier}</Text>
                <Text style={[styles.respTxt, { width: '20%' }]}>{item.DocStatus?.identifier}</Text>

                <Menu style={{ justifyContent: 'center' }} >
                  <MenuTrigger>
                    <MaterialCommunityIcons name='dots-vertical' size={23} color='#000' />
                  </MenuTrigger>

                  <MenuOptions style={styles.popupContainer}>
                    {
                      item.DocStatus?.identifier === 'Drafted' ? (
                        <MenuOption onSelect={() => navigation.navigate('AnnualLeave', { record: item, isEdit: true, refreshLeaveRequestInfo})}>
                          <Text style={styles.PopupTxt}>Edit</Text>
                        </MenuOption>
                      ) : (
                        <MenuOption onSelect={() => navigation.navigate('DetailedLeave', { record: item })}>
                          <Text style={styles.PopupTxt}>Details</Text>
                        </MenuOption>
                      )
                    }
                  </MenuOptions>
                </Menu>
              </View>
            )}
          />
        </View>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('AnnualLeave', { refreshLeaveRequestInfo })}
        style={styles.floatingButton}
      >
        <MaterialCommunityIcons name='plus' size={30} color='#fff' />
      </TouchableOpacity>

      {isLoading ? <Loader /> : null}
    </View>
  )
}

export default LeaveStatus

const styles = StyleSheet.create({
  TopView: {
    width: '90%',
    height: '7%',
    alignSelf: 'center',
    marginTop: '5%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  TopTxt: {
    color: '#000',
    fontFamily: 'K2D-Bold',
    fontSize: 18,
  },
  PickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: '40%',
    height: 40,
  },
  PickerContent: {
    height: '50%',
    color: '#000',
  },
  BottomContainer: {
    width: '90%',
    alignSelf: 'center',
  },
  BottomHeader: {
    flexDirection: 'row',
    height: 35,
    backgroundColor: '#e1e2e3',
    marginTop: '2%'
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
    textAlignVertical: 'center'
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
    backgroundColor: '#00B0F0',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
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
    paddingHorizontal:15,
  },
})