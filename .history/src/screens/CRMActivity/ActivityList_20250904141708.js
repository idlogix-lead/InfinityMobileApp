// import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
// import React from 'react';
// import CustomHeader from '../../components/CustomHeader';
// import Ionicons from 'react-native-vector-icons/Ionicons';

// const ActivityList = ({navigation}) => {
//   return (
//     <View style={{flex: 1}}>
//       <CustomHeader title="Activity List" />
//       <TouchableOpacity
//         onPress={() => {
//           navigation.navigate('AddActivity', {
//             data: data?.id,
//             mode: 'create',
//           });
//           //   console.log('Navigating with:', data?.id);
//         }}
//         style={styles.addButton}>
//         <Text>
//           <Ionicons name="add-outline" size={25} color={'black'} />
//         </Text>
//         <Text style={{color: '#000', marginLeft: 8, margin: 2}}>
//           Add Activity
//         </Text>
//       </TouchableOpacity>
//       <Text style={{color: '#000'}}>ActivityList</Text>
//     </View>
//   );
// };

// export default ActivityList;

// const styles = StyleSheet.create({
//   addButton: {
//     backgroundColor: 'lightgreen',
//     height: '5%',
//     width: '95%',
//     marginTop: 17,
//     alignSelf: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//     paddingTop: 4,
//     borderRadius: 7,
//   },
// });

import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomHeader from '../../components/CustomHeader';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import moment from 'moment';
import Loader from '../../components/Loader';
import {useFocusEffect} from '@react-navigation/native';

const ActivityList = ({route, navigation}) => {
  const {data} = route.params;

  // const id1 = data?.id;
  // console.log(data.id, 'data in activity list/////////////');

  const [apiCall, setApiCall] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const FollowupsAPI = async () => {
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const userId = await AsyncStorage.getItem('userId');
    const token = await AsyncStorage.getItem('token');

    try {
      setIsLoading(true);
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
        const filteredData = response.data.records.filter(
          item => item.AD_User_ID?.id === data.id,
        );

        const sortedData = filteredData.sort(
          (a, b) => new Date(b.Created) - new Date(a.Created),
        );

        setApiCall(sortedData);
        // console.log('Followups API response:', sortedData);
      } else {
        console.warn(' Second API No records found.');
      }
    } catch (error) {
      console.log(error, 'Followup data get error');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      FollowupsAPI();
    }, []),
  );

  const renderFollowupCard = item => {
    const backgroundColor = item.IsComplete ? '#1E7643' : '#F1192F'; // Green or Red

    return (
      <View key={item?.id} style={styles.followupContainer}>
        {/* Top Colored Box */}
        <View style={[styles.topBox, {backgroundColor}]} />

        {/* Card Detail */}
        <View style={styles.detailBox}>
          {/* Activity Task Text */}
          <View style={styles.cardHeader}>
            <Text style={styles.taskTitle}>
              {item.ContactActivityType.identifier}
            </Text>
            {!item.IsComplete && (
              <TouchableOpacity
                style={{marginRight: 8}}
                onPress={() =>
                  navigation.navigate('CrmActivitySrn', {
                    data: item,
                    mode: 'edit',
                  })
                }>
                <Feather name="edit-3" size={20} color={'#a135b1'} />
              </TouchableOpacity>
            )}
          </View>

          <Text style={{color: 'gray'}}>{item.AD_User_ID.identifier}</Text>

          {/* Dates */}
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            {/* Created Date */}
            <View style={{flexDirection: 'row', marginTop: 7}}>
              <Text style={{marginTop: 8}}>
                <AntDesign name="calendar" size={19} color={'#82ced9'} />
              </Text>
              <View style={styles.date}>
                <Text style={{color: '#000', fontWeight: 'bold', fontSize: 13}}>
                  Created Date
                </Text>
                <Text style={styles.dateText}>
                  {moment(item.Created).format('DD MMM YYYY')}
                </Text>
              </View>
            </View>
          </View>

          {/* Start and End Dates */}
          <View style={{flexDirection: 'row'}}>
            <View style={{flexDirection: 'row', marginTop: 7}}>
              <Text style={{marginTop: 8}}>
                <AntDesign name="calendar" size={19} color={'#82ced9'} />
              </Text>
              <View style={styles.date}>
                <Text style={{color: '#000', fontWeight: 'bold', fontSize: 13}}>
                  Start Date
                </Text>
                <Text style={styles.dateText}>
                  {moment(item.StartDate).format('DD MMM YYYY')}
                </Text>
              </View>
            </View>

            <View style={{flexDirection: 'row', marginTop: 7, marginLeft: 17}}>
              <Text style={{marginTop: 8}}>
                <AntDesign name="calendar" size={19} color={'#82ced9'} />
              </Text>
              <View style={styles.date}>
                <Text style={{color: '#000', fontWeight: 'bold', fontSize: 13}}>
                  End Date
                </Text>
                <Text style={styles.dateText}>
                  {moment(item.EndDate).format('DD MMM YYYY')}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={{marginTop: 7}}>
            <Text
              style={{
                color: '#000',
                marginRight: 7,
                fontWeight: 'bold',
                fontSize: 14,
              }}>
              Description:
            </Text>
            <Text
              style={{color: '#000', fontSize: 13}}
              numberOfLines={1}
              ellipsizeMode="tail">
              {item.Description || 'No Description'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{flex: 1}}>
      <CustomHeader title={'Activity List'} />
      {/* Button */}
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('CrmActivitySrn', {
            data: data?.id,
            mode: 'create',
          });
          console.log('Navigating with:', data?.id);
        }}
        style={styles.addButton}>
        <Text>
          <Ionicons name="add-outline" size={25} color={'black'} />
        </Text>
        <Text style={{color: '#000', marginLeft: 8, margin: 2}}>
          Add Activity
        </Text>
      </TouchableOpacity>

      <FlatList
        data={apiCall}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => renderFollowupCard(item)}
      />
      {isLoading ? <Loader /> : null}
    </View>
  );
};

export default ActivityList;

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: 'lightgreen',
    height: '5%',
    width: '95%',
    marginTop: 17,
    alignSelf: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingTop: 4,
    borderRadius: 7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  followupContainer: {
    marginTop: 5,
    // marginBottom: 10,
    marginVertical: 5,
  },
  topBox: {
    height: 50,
    width: 60,
    borderBottomLeftRadius: 5,
    borderTopRightRadius: 5,
    marginLeft: '2%',
  },
  detailBox: {
    width: '95%',
    alignSelf: 'center',
    backgroundColor: '#FBFBFB',
    padding: 5,
    borderRadius: 5,
    borderTopLeftRadius: 0,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginTop: -48,
    marginLeft: 2,
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
