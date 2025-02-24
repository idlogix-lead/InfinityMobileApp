import { StyleSheet, Text, View, ActivityIndicator, FlatList, Modal, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import ItemList from '../../components/RequestScreenComponents/ItemList';
import { useNavigation } from '@react-navigation/native';

const CloseRequest = ({  startDate, endDate }) => {
  const [isLoading, setIsLoading] = useState(false);
  let [closeList, setCloseList] = useState()
  const [show, setShow] = useState(false)
  const [itemId, setItemId] = useState()
  const navigation = useNavigation();

  const getAPIData = async (protocol, host, port, userId, startDate, endDate) => {
    const token = await AsyncStorage.getItem('token')
    const id = await AsyncStorage.getItem('idClient')
    fetch(`${protocol}://${host}:${port}/api/v1/models/R_Request?$filter=SalesRep_ID eq ${id} AND CreatedBy eq ${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        let records = data.records
        const filterRecords = records.filter(item => item.R_Status_ID.id === 1000002);
        const endDateUpdated = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
        const startDateUpdated = moment(startDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
        const datesFilter =
          filterRecords.filter
            (item => moment(item.StartTime).format('YYYY-MM-DD') >= (startDateUpdated)
              && moment(item.StartTime).format('YYYY-MM-DD') <= (endDateUpdated))
        setCloseList(datesFilter)
        setIsLoading(false)
      })
      .catch(error => console.error(error));
  }

  const navigateBack = async () => {
    setIsLoading(true)
    const unsubscribe = navigation.addListener('focus', async () => {
    const protocol = await AsyncStorage.getItem('protocol')
    const host = await AsyncStorage.getItem('host')
    const port = await AsyncStorage.getItem('port')
    const userId = await AsyncStorage.getItem('userId')
    getAPIData(protocol, host, port, userId, startDate, endDate)
    });
    return unsubscribe
  }

  useEffect(() => {
    navigateBack()
  }, [navigation, startDate, endDate])

  const updateData = async (statusId, txt) => {
    const protocol = await AsyncStorage.getItem('protocol')
    const host = await AsyncStorage.getItem('host')
    const port = await AsyncStorage.getItem('port')
    const token = await AsyncStorage.getItem('token')
    const userId = await AsyncStorage.getItem('userId')
    fetch(`${protocol}://${host}:${port}/api/v1/models/R_Request/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        "R_Status_ID": { "id": `${statusId}`, "identifier": txt, "model-name": "r_status" }
      })
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        setIsLoading(true)
        getAPIData(protocol, host, port, userId)
        setShow(!show)
        // Handle the response data
        // ...
      })
      .catch(error => {
        // Handle the error
        alert(error)
        setIsLoading(false)
        // ...
      });
  }

  const modalClose = async (txt) => {
    if (txt === "Open") {
      let statusId = 1000000
      updateData(statusId, txt)
    } else if (txt === "Close") {
      let statusId = 1000002
      updateData(statusId, txt)
    } else if (txt === 'Waiting') {
      let statusId = 1000001
      updateData(statusId, txt)
    } else {
      let statusId = 1000003
      updateData(statusId, txt)
    }
  }

  const modalView = async ({ item }) => {
    let id = item.id
    setItemId(id)
    setShow(!show)
  }

  return (
    <>
      {isLoading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
          <ActivityIndicator size="large" color="#0050C0" />
        </View>
      )}
      {!isLoading && (
        <View style={{ flex: 1, backgroundColor: 'white' }}>

          <Modal
            visible={show} // set visibility based on state
            animationType="slide" // set the animation type
            transparent={true} // make the modal transparent
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalView}>
                <Text style={styles.txt}>Set Status</Text>
                <TouchableOpacity onPress={() => modalClose('Open', 1000000)} style={styles.txtContainer}>
                  <Text style={styles.txt}>Open</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => modalClose('Waiting', 1000001)} style={styles.txtContainer}>
                  <Text style={styles.txt}>Waiting</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => modalClose('Close', 1000002)} style={styles.txtContainer}>
                  <Text style={styles.txt}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => modalClose('Final Close', 1000003)} style={styles.txtContainer}>
                  <Text style={styles.txt}>Final Close</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setShow(!show) }} style={styles.btn}>
                  <Text style={styles.txtBtn}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <FlatList
            data={closeList}
            renderItem={(item) => {
              return (
                <ItemList
                  name={item.item.Name}
                  startDate={moment(item.item.StartTime).format("DD-MM-YYYY")}
                  endDate={moment(item.item.EndTime).format("DD-MM-YYYY")}
                  onPress={() => navigation.navigate('RequestDetails', { id: item.item.id })}
                  status={item.item.R_Status_ID.identifier.split("_")[1]}
                  onPressModal={() => modalView(item)}
                  statusArrow={require('../../asserts/RequestAsserts/downArrow.png')}
                />
              )
            }}
          />
        </View>
      )}
    </>
  )
}

export default CloseRequest

const styles = StyleSheet.create({
  modalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1
  },
  modalView: {
    backgroundColor: '#800000',
    height: '50%',
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15
  },
  txtContainer: {
    height: '12%',
    width: '80%',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  txt: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'K2D-Regular'
  },
  btn: {
    backgroundColor: 'white',
    height: '12%',
    width: '80%',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20
  },
  txtBtn: {
    color: '#800000',
    fontSize: 20,
    fontFamily: 'K2D-Regular'
  },

})