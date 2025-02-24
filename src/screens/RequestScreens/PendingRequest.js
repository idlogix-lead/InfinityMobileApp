import { StyleSheet, Text, View, ActivityIndicator, FlatList, TouchableOpacity, Modal, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import ItemList from '../../components/RequestScreenComponents/ItemList';
import { useNavigation } from '@react-navigation/native';
import { decode as atob, encode as btoa } from 'base-64';

const PendingRequest = ({ startDate, endDate }) => {
  const [isLoading, setIsLoading] = useState(false);
  let [pendingList, setPendingList] = useState()
  const [show, setShow] = useState(false)
  const [itemId, setItemId] = useState()
  const navigation = useNavigation();
  const [imageAPI, setImageAPI] = useState('')
  const [pdfAPI, setPdfAPI] = useState('')
  const [modalVisible, setModalVisible] = useState(false);

  
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
        // console.log("PEndingDATA",JSON.stringify(data),"PendingDTA")
        let records = data.records
        const filterRecords = records.filter(item => item.R_Status_ID.id === 1000000 || item.R_Status_ID.id === 1000001);
        const endDateUpdated = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
        const startDateUpdated = moment(startDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
        // console.log("PEndingDATA",JSON.stringify(data),"PendingDTA")
        const datesFilter =
          filterRecords.filter
            (item => moment(item.StartTime).format('YYYY-MM-DD') >= (startDateUpdated)
              && moment(item.StartTime).format('YYYY-MM-DD') <= (endDateUpdated))
              // console.log("PEndingDATA",JSON.stringify(data),"PendingDTA")
        setPendingList(datesFilter)
        setShow(false)
        setIsLoading(false)
        // console.log("PEndingDATA",JSON.stringify(data),"PendingDTA")
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
    return unsubscribe;
  }

  useEffect(() => {
    navigateBack()
  }, [navigation, startDate, endDate])

  const modalView = async ({ item }) => {
    let id = item.id
    setItemId(id)
    setShow(!show)
  }

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
      .then(response => response.json())
      .then(data => {
        console.log(data,"Sucess")
        setIsLoading(true)
        getAPIData(protocol, host, port, userId)
      })
      .catch(error => {
        // Handle the error
      });

  }

  const modalClose = async (txt, id) => {
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

  const getReport = async (id) => {
    const protocol = await AsyncStorage.getItem('protocol')
    const host = await AsyncStorage.getItem('host')
    const port = await AsyncStorage.getItem('port')
    const token = await AsyncStorage.getItem('token')
    fetch(`${protocol}://${host}:${port}/api/v1/models/R_Request/${id}/attachments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }).then((response) => response.json())
      .then(data => {
        let records = data.attachments
        if (records.length === 1) {
          const decodedString = atob(records[0].contentType)
          if (records[0].contentType.startsWith('image/')) {
            setImageAPI(decodedString)
            setModalVisible(true)
          } else if (records[0].contentType === 'application/pdf') {
            setPdfAPI(decodedString)
          } else {
          }
        } else {
          const lastItem = records[data.length - 1]
        }
      })
      .catch((err) => console.log(err))
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
            visible={show} 
            animationType="slide" 
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


          <Modal
            animationType="slide"
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={{ flex: 1, backgroundColor: 'red' }}>
              <Text style={{ color: 'black' }}>This is a modal!</Text>
              <Text style={{ color: 'black' }}>{imageAPI}</Text>
              <Image source={{ uri: imageAPI }} />
              <Text style={{ color: 'black' }}>{pdfAPI}</Text>
            </View>
          </Modal>


          {/* <RequestListHeader /> */}
          <FlatList
            data={pendingList}
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
                  onPressReport={() => getReport(item.item.id)}
                />
              )
            }}
          />
        </View>
      )}
    </>
  )
}

export default PendingRequest

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