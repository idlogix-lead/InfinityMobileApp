import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Image, Modal, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import TopNavigation from '../../navigation/TopNavigation/TopNavigation';
import CalendarPicker from 'react-native-calendar-picker';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomHeader from '../../components/CustomHeader';
const { height, width } = Dimensions.get('window');


const RequestList = ({ navigation, route }) => {
  const [showCalendarStart, setShowCalendarStart] = useState(false);
  const [startDate, setStartDate] = useState(null)
  const [showCalendarEnd, setShowCalendarEnd] = useState(false);
  const [endDate, setEndDate] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  let firstDayOfCurrMonth, lastDayOfCurrMonth

  const onDateChangeStart = async (date) => {
    const formattedDate = moment.utc(date).format("DD-MM-YYYY");
    const formattedDateUpdate = moment(formattedDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
    const endDateUpdated = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
    if (formattedDateUpdate > endDateUpdated) {
      alert('Start date must be smaller then end date')
    } else {
      setStartDate(formattedDate);
      setShowCalendarStart(false)
    }
  };

  const onDateChangeEnd = async (date) => {
    const formattedDate = moment.utc(date).format("DD-MM-YYYY");
    const formattedDateUpdate = moment(formattedDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
    const startDateUpdated = moment(startDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
    if (formattedDateUpdate < startDateUpdated) {
      alert('Start date must be greater then end date')
    } else {
      setEndDate(formattedDate);
      setShowCalendarEnd(false)
    }
  }

  const getAPIData = async (protocol, host, port, userId, token, id, firstDayOfCurrMonth) => {
    fetch(`${protocol}://${host}:${port}/api/v1/models/R_Request?$filter=SalesRep_ID eq ${id} AND CreatedBy eq ${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log("Data",data,"DATA")
        let records = data.records
        const dateObjects = records.map(item => new Date(item.StartTime));
        console.log('dateObjects',dateObjects,"dateObjects")
        console.log("Data",data,"DATAAAAAAA")
        const smallestDate = new Date(Math.min(...dateObjects));
        const prevDate = moment(smallestDate).format('DD-MM-YYYY');
        setStartDate(prevDate)
        setEndDate(firstDayOfCurrMonth)
        setIsLoading(false)
        // const lastDayOfPrevMonth = moment().subtract(1, 'month').endOf('month').format('DD-MM-YYYY');
      })
      .catch(error => console.error(error));
  }

  useEffect(() => {
    setIsLoading(true)
    console.log('you are arrive on request list screen')
    const unsubscribe = navigation.addListener('focus', async () => {
      const monthCheck = await AsyncStorage.getItem('txtPrev')
      if (monthCheck) {
        firstDayOfCurrMonth = moment().subtract('month').startOf('month').format('DD-MM-YYYY');
        const protocol = await AsyncStorage.getItem('protocol')
        const host = await AsyncStorage.getItem('host')
        const port = await AsyncStorage.getItem('port')
        const userId = await AsyncStorage.getItem('userId')
        const token = await AsyncStorage.getItem('token')
        const id = await AsyncStorage.getItem('idClient')
        getAPIData(protocol, host, port, userId, token, id, firstDayOfCurrMonth)

      } else {
        firstDayOfCurrMonth = moment().subtract('months').startOf('month').format('DD-MM-YYYY');
        lastDayOfCurrMonth = moment().subtract('months').endOf('month').format('DD-MM-YYYY');
        setStartDate(firstDayOfCurrMonth)
        setEndDate(lastDayOfCurrMonth)
        setIsLoading(false)
      }
    });
    return unsubscribe;
  }, [])

  return (
    <>
      {isLoading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#0050C0" />
        </View>
      )}
      {!isLoading && (
        <>
        <View>
          <CustomHeader title='Request List' />
        </View>
        <View style={{flex:1, backgroundColor: 'white' }}>
          <Modal visible={showCalendarStart} animationType="slide" transparent={true}>
            <View style={styles.blurView}  >
              <View style={styles.modal}>
                <CalendarPicker
                  onDateChange={onDateChangeStart}
                  previousTitleStyle={{ color: 'white', marginLeft: 15, fontFamily: 'K2D-Regular' }}
                  nextTitleStyle={{ color: 'white', marginRight: 15, fontFamily: 'K2D-Regular' }}
                  textStyle={{
                    color: 'white',
                    fontFamily: 'K2D-Regular'
                  }}
                  customDatesStyles={{
                    color: 'white',
                    fontFamily: 'K2D-Regular'
                  }}
                />
                <TouchableOpacity style={styles.closeBtn} onPress={() => setShowCalendarStart(false)}>
                  <Text style={styles.close}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* end date model */}
          <Modal visible={showCalendarEnd} animationType="slide" transparent={true}>
            <View style={styles.blurView}  >
              <View style={styles.modal}>
                <CalendarPicker
                  onDateChange={onDateChangeEnd}
                  previousTitleStyle={{ color: 'white', marginLeft: 15, fontFamily: 'K2D-Regular' }}
                  nextTitleStyle={{ color: 'white', marginRight: 15, fontFamily: 'K2D-Regular' }}
                  textStyle={{
                    color: 'white',
                    fontFamily: 'K2D-Regular'
                  }}
                  customDatesStyles={{
                    color: 'white',
                    fontFamily: 'K2D-Regular'
                  }}
                />
                <TouchableOpacity onPress={() => setShowCalendarEnd(false)} style={styles.closeBtn}>
                  <Text style={{ color: 'black' }}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* <View style={styles.headerCont}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image source={require('../../asserts/RequestAsserts/leftArrow.png')} style={styles.backArrow} />
            </TouchableOpacity>
            <View style={{ width: '42%' }}>
              <Text style={styles.user}>Task List</Text>
            </View>
            <TouchableOpacity style={styles.add} onPress={() => navigation.navigate('CreateNewReq')}>
              <Image source={require('../../asserts/RequestAsserts/Plus.png')} style={styles.plusImage} />
            </TouchableOpacity>
          </View> */}

          <View style={{ flexDirection: 'row', marginBottom: 5, justifyContent: 'center'  }}>
            <TouchableOpacity style={styles.fromBtn}
              onPress={() => setShowCalendarStart(true)}
            >
              <View style={{ width: '70%' }} >
                <Text style={styles.txt}>{startDate}</Text>
              </View>
              <Image source={require('../../asserts/taskDetailAssets/calendar.png')} style={styles.image} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toBtn}
              onPress={() => setShowCalendarEnd(true)}
            >
              <View style={{ width: '70%' }}>
                <Text style={styles.txt}>{endDate}</Text>
              </View>
              <Image source={require('../../asserts/taskDetailAssets/calendar.png')} style={styles.image} />
            </TouchableOpacity>
          </View>
          <TopNavigation startDate={startDate} endDate={endDate} />
        </View>
        </>
      )}
    </>
  )
}

export default RequestList

const styles = StyleSheet.create({
  headerCont: {
    width: width,
    backgroundColor: '#800000',
    height: '12%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 15
  },
  backArrow: {
    height: height / 15,
    width: width / 7.5,
    marginLeft: 20,
  },
  user: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'K2D-Regular',
    bottom: 12,
    marginLeft: 15,
  },
  add: {
    backgroundColor: 'white',
    bottom: 12,
    height: height / 16,
    width: width / 8,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '20%'
  },
  plusImage: {
    height: '60%',
    width: '70%',
    marginRight: 7
  },
  fromBtn: {
    width: '40%',
    flexDirection: 'row',
    height: 35,
    alignItems: 'center',
  },
  toBtn: {
    width: '40%',
    marginLeft: 10,
    flexDirection: 'row',
    height: 35
  },
  image: {
    height: '80%',
    width: '30%'
  },
  txt: {
    color: 'black',
    fontSize: 15,
    fontFamily: 'K2D-Bold'
  },
  blurView: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modal: {
    width: '90%',
    backgroundColor: '#800000',
    borderRadius: 20,
    alignItems: 'center'
  },
  closeBtn: {
    backgroundColor: 'white',
    height: '10%',
    width: '40%',
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20
  },
  close: {
    color: '#800000',
    fontSize: 16,
    fontFamily: 'K2D-Regular'
  },

})