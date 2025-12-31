import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';
import EarningChart from '../../components/CRMSearch/CRMChart/EarningChart';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SalesChart from '../../components/CRMSearch/CRMChart/SalesChart';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import SalesStages from './SalesStages';


const SalesOpper = ({
  todayFollowups,
  futureFollowups,
  missedFollowups,
  salesCall,
}) => {
  // const [salesCall, setSalesCall] = useState([]);
  const navigation = useNavigation();

  // const salesAPI = async () => {
  //   const protocol = await AsyncStorage.getItem('protocol');
  //   const host = await AsyncStorage.getItem('host');
  //   const port = await AsyncStorage.getItem('port');
  //   // const userId = await AsyncStorage.getItem('userId');
  //   const token = await AsyncStorage.getItem('token');

  //   try {
  //     const URL = `${protocol}://${host}:${port}/api/v1/models/C_Opportunity`;
  //     const response = await axios.get(URL, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     // Log and store response
  //     if (response.data?.records) {
  //       setSalesCall(response.data.records);
  //       // console.log('API response:', response.data.records[0]);
  //       console.log('Sales Opportunity API response:', response.data.records);
  //     } else {
  //       console.warn('Third API No records found.');
  //     }
  //   } catch (error) {
  //     console.log(error, 'Graph API data get error');
  //   }
  // };
  // useFocusEffect(
  //   React.useCallback(() => {
  //     salesAPI();
  //   }, []),
  // );
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* <View style={{marginVertical: '4%'}}>
        <SaleStage />
      </View> */}

      <View style={{marginVertical: '4%'}}>
        <SalesChart
          data={[1950, 2089, 3267, 5789, 4234, 3000, 2200]}
          days={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
        />
      </View>
      <View style={{marginVertical: '0%'}}>
        <SalesStages />
      </View>
      {/* <Text style={styles.sectionTitle}>Leads Section</Text>
      <View style={styles.leadsContainer}>
        <TouchableOpacity
          style={styles.leadCard}
          onPress={() => {
            navigation.navigate('SalesInitial', {
              initial: salesCall,
            });
          }}>

          <View style={styles.leadWrapperTop}>
            
            <View style={styles.leadIconWrapper}>
              <MaterialIcons name="update" size={15} color="#000" />
            </View>
            <Text style={styles.leadTitle}>Initial Stage</Text>
          </View>
          <View style={styles.leadWrapperEnd}>
            <Text style={styles.leadSub}>Numbers of open leads</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{salesCall.length}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.leadCard}
          onPress={() => {
            Alert.alert('Info', 'This section is under development');
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
              <MaterialIcons name="gps-not-fixed" size={15} color="#000" />
            </View>
            <Text style={styles.leadTitle}>New Leads</Text>
          </View>

          <View style={styles.leadWrapperEnd}>
            <Text style={styles.leadSub}>Numbers of open leads</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>00</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.leadCard}
          onPress={() => {
            Alert.alert('Info', 'This section is under development');
          }}>
          <View style={styles.leadWrapperTop}>
            <View style={[styles.leadIconWrapper, {height: 23, width: 23}]}>
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
            <View style={styles.badge}>
              <Text style={styles.badgeText}>00</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.leadCard}
          onPress={() => {
            Alert.alert('Info', 'This section is under development');
          }}>
          <View style={styles.leadWrapperTop}>
            <View style={styles.leadIconWrapper}>
              <MaterialIcons name="diversity-2" size={15} color="#000" />
            </View>
            <Text style={styles.leadTitle}>Total Leads</Text>
          </View>
          <View style={styles.leadWrapperEnd}>
            <Text style={styles.leadSub}>Numbers of open leads</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                00
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View> */}
      {/* <Text style={styles.sectionTitle}>Followups</Text> */}
      {/* <ScrollView
        style={{
          backgroundColor: 'rgba(246, 246, 246, 1)',
          paddingHorizontal: '7%',
          paddingVertical: '2%',
        }}> */}
        {/* Today FollowUp */}
        {/* <TouchableOpacity
          style={[
            styles.toggleBtn,
            {borderLeftWidth: 3, borderLeftColor: '#1f5dd4'},
          ]}>
          <Text
            style={styles.toggleTitle}
            onPress={() =>
              navigation.navigate('TodayFollowups', {data: todayFollowups})
            }>
            Today's Followup
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#000" />
        </TouchableOpacity> */}

        {/* Future FollowUp */}
        {/* <TouchableOpacity
          style={[
            styles.toggleBtn,
            {borderLeftWidth: 3, borderLeftColor: 'gray'},
          ]}>
          <Text
            style={styles.toggleTitle}
            onPress={() =>
              navigation.navigate('FutureFollowups', {data: futureFollowups})
            }>
            Future Followup
          </Text>

         
          <Ionicons name="chevron-forward" size={18} color="#000" />
        </TouchableOpacity> */}

        {/* Missed FillowUp */}
        {/* <TouchableOpacity
          style={[
            styles.toggleBtn,
            {borderLeftWidth: 3, borderLeftColor: 'rgb(236, 108, 108)'},
          ]}>
          <Text
            style={styles.toggleTitle}
            onPress={() =>
              navigation.navigate('MissedFollowups', {data: missedFollowups})
            }>
            Missed Followup
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#000" />
        </TouchableOpacity> */}
      {/* </ScrollView> */}
    </ScrollView>
  );
};

export default SalesOpper;

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'K2D-Medium',
    color: '#000',
    marginTop: 20,
    marginBottom: 8,
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
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
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
  badgeText: {color: '#fff', fontSize: 10, fontFamily: 'Inter_20pt-SemiBold'},
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
});
