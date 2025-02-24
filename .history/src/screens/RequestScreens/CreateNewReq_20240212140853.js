import {
  StyleSheet, Text, TextInput, View, TouchableOpacity, Modal, Image, ActivityIndicator,
  ScrollView, Platform, FlatList
} from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import TopHeader from '../../components/RequestScreenComponents/TopHeader'
import CalendarPicker from 'react-native-calendar-picker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import { decode as atob, encode as btoa } from 'base-64';
import CustomHeader from '../../components/CustomHeader';
import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import base64 from 'base-64';
import Loader from '../../components/Loader';
import RBSheet from 'react-native-raw-bottom-sheet';

const CreateNewReq = ({ navigation }) => {
  const rbSheetRef = useRef();
  const [startDate, setStartDate] = useState(new Date())
  const [name, setName] = useState('')
  const [endDate, setEndDate] = useState(null)
  const [showCalendarStart, setShowCalendarStart] = useState(false);
  const [showCalendarEnd, setShowCalendarEnd] = useState(false);
  const [priority, setPriority] = useState()
  const [isLoading, setIsLoading] = useState(false);
  const [subdata, setSubData] = useState([])
  const [assigned, setAssigned] = useState()
  const [summary, setSummary] = useState('');
  const [clientId, setClientId] = useState()
  const [organizationId, seOrganizationId] = useState()
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString();
  const priorityData = [
    { label: 'Select Priority', value: 'Select Priority', id: 0 },
    { label: 'High', value: 'High', id: 3 },
    { label: 'Low', value: 'Low', id: 7 },
    { label: 'Medium', value: 'Medium', id: 5 },
    { label: 'Minor', value: 'Minor', id: 9 },
    { label: 'Urgent', value: 'Urgent', id: 1 }
  ]
  const [pickerKey, setPickerKey] = useState()
  const [subOrdinateKey, setSubOrdinateKey] = useState()
  const [attachmentData, setAttachmentData] = useState('Select attachment')
  const [attachment, setAttachment] = useState({ name: '', data: '' })

  let AD_Org_ID, AD_Role_ID


  const getAPIData = async (protocol, host, port, userId) => {
    const token = await AsyncStorage.getItem('token')
    const value = await AsyncStorage.getItem('userName');
    setClientId(await AsyncStorage.getItem('clientId'))
    seOrganizationId(await AsyncStorage.getItem('organizationId'))
    fetch(`${protocol}://${host}:${port}/api/v1/models/AD_User?$filter=Supervisor_ID eq ${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        const array1 = [{ Name: 'Select SubOrdinate', Name: 'Select SubOrdinate' }, { Name: value, Name: value, id: userId }]
        let records = data.records
        const newArray = array1.concat(records)
        setSubData(newArray)
        setIsLoading(false)
      })
      .catch(error => console.error(error));
  }

  const navigateBack = () => {
    // setIsLoading(true);
    const unsubscribe = navigation.addListener('focus', async () => {
      const protocol = await AsyncStorage.getItem('protocol')
      const host = await AsyncStorage.getItem('host')
      const port = await AsyncStorage.getItem('port')
      const userId = await AsyncStorage.getItem('userId')
      setStartDate(null)
      setEndDate(null)
      setPriority()
      setAssigned()
      setSummary('')
      getAPIData(protocol, host, port, userId)
    });
    return unsubscribe;
  }

  useEffect(() => {
    navigateBack()
  }, [navigation])

  const onDateChangeStart = (date) => {
    // setStartDate(date);
    // setShowCalendarStart(false);
    // setStartDate(new date())
  };

  const onDateChangeEnd = (date) => {
    setEndDate(date);
    setShowCalendarEnd(false);
  };

  const saveData = async () => {
    try {
      const clientName = await AsyncStorage.getItem('clientName');
      const value = await AsyncStorage.getItem('userName');
      const userId = await AsyncStorage.getItem('userId');
      const protocol = await AsyncStorage.getItem('protocol');
      const host = await AsyncStorage.getItem('host');
      const port = await AsyncStorage.getItem('port');
      const token = await AsyncStorage.getItem('token');
      const roleId = await AsyncStorage.getItem('roleId');
      const clientId = await AsyncStorage.getItem('clientId');

      setIsLoading(true);
      const rolesResponse = await fetch(`${protocol}://${host}:${port}/api/v1/auth/roles?client=${clientId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const rolesData = await rolesResponse.json();
      const AD_Role_ID = rolesData.roles.find(item => item.id == roleId);

      const orgResponse = await fetch(`${protocol}://${host}:${port}/api/v1/auth/organizations?client=${clientId}&role=${roleId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const orgData = await orgResponse.json();
      const AD_Org_ID = orgData.organizations.find(item => item.id == organizationId);


      const requestResponse = await fetch(`${protocol}://${host}:${port}/api/v1/models/R_Request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          "AD_Client_ID": { "id": parseInt(clientId), "identifier": clientName },
          "AD_Org_ID": { "id": AD_Org_ID.id, "identifier": AD_Org_ID.name },
          "AD_Role_ID": { "id": AD_Role_ID.id, "identifier": AD_Role_ID.name },
          "CloseDate": "",
          "ConfidentialType": { "id": "I", "identifier": "internal", "model-name": "ad_ref_list" },
          "ConfidentialTypeEntry": { "id": "I", "identifier": "internal", "model-name": "ad_ref_list" },
          "Created": formattedDate,
          "CreatedBy": { "id": parseInt(userId), "identifier": value, "model-name": "ad_user" },
          "DateLastAction": "",
          "DueType": { "id": "5", "identifier": "Due", "model-name": "ad_ref_list" },
          "IsActive": true,
          "IsEscalated": false,
          "IsInvoiced": false,
          "IsSelfService": false,
          "NextAction": { "id": "F", "identifier": "Follow up", "model-name": "ad_ref_list", "propertyLabel": "Next action" },
          "PriorityUser": { "id": pickerKey.toString(), "identifier": priority, "model-name": "ad_ref_list" },
          "Processed": false,
          "QtyInvoiced": 0,
          "QtyPlan": 0,
          "QtySpent": 0,
          "R_RequestType_ID": { "id": 1000000, "identifier": "Personal Tasks", "model-name": "r_requesttype", "propertyLabel": "Request Type" },
          "R_Status_ID": { "id": 1000000, "identifier": "9_open", "model-name": "r_status" },
          "RequestAmt": 0,
          "SalesRep_ID": { "id": subOrdinateKey, "identifier": assigned, "model-name": "ad_user" },
          "StartDate": moment(startDate).format('YYYY-MM-DD[T]HH:mm:ss[Z]'),
          "Summary": summary,
          "Updated": "",
          "UpdatedBy": { "id": parseInt(userId), "identifier": value, "model-name": "ad_user", "propertyLabel": "Updated By" },
          "id": parseInt(userId),
          "model-name": "r_request",
          "uid": "8e38b9fa-1ec2-4783-a661-475f4ea8d458",
          "EndTime": moment(endDate).format('YYYY-MM-DD[T]HH:mm:ss[Z]'),
          "Name": name,
          "StartTime": moment(startDate).format('YYYY-MM-DD[T]HH:mm:ss[Z]')
        }),
      });
      const requestData = await requestResponse.json();
      setStartDate(null);
      setEndDate(null);
      setSummary('');
      setPriority(priorityData[0]);
      setAssigned(requestData[0]);
      setName('');
      let newDocId = requestData.id;
      console.log('newDocId', newDocId);

      // Handle attachments
      const attachmentResponse = await fetch(`${protocol}://${host}:${port}/api/v1/models/R_Request/${newDocId}/attachments`, {
        method: 'POST',
        body: JSON.stringify(attachment),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'same-origin',
      });
      const attachmentData = await attachmentResponse.json();
      console.log(attachmentData);

    } catch (error) {
      console.error(error);
      // alert(error,'Eeeeeeeeeeee');
      setIsLoading(false);
    }
    finally {
      setIsLoading(false);
    }
  };


  const Save = async () => {
    if (startDate === null) {
      alert('Start Date cannot be empty')
    } else if (endDate === null) {
      alert('End data cannot be empty')
    } else if (!priority) {
      alert('Please Select the priority')
    } else if (!assigned) {
      alert('Please select the SubOrdinate')
    } else if (summary.trim() === '') {
      alert('Please Enter the Summary')
    }
    else if (startDate.toISOString().substring(0, 10) < formattedDate.substring(0, 10)) {
      alert('Start date must greater then or equal to current date')
    } else if (endDate.toISOString().substring(0, 10) < formattedDate.substring(0, 10)) {
      alert('End date must greater then or equal to current date')
    } else if (endDate.toISOString().substring(0, 10) < startDate.toISOString().substring(0, 10)) {
      alert('End date must be greater then or equal to start date')
    } else if (pickerKey === 0) {
      alert('Please select the priority')
    } else if (subOrdinateKey === 0) {
      alert('Please Select the Subordinate')
    } else if (name.trim() === '') {
      alert('Please enter the task name')
    }
    else if (attachmentData === 'Select attachment') {
      alert('Please add the attachment')
    }
    else {
      saveData()
    }
  }

  const getID = async (itemIndex, itemValue) => {
    setAssigned(itemValue)
    const protocol = await AsyncStorage.getItem('protocol')
    const host = await AsyncStorage.getItem('host')
    const port = await AsyncStorage.getItem('port')
    const userId = await AsyncStorage.getItem('userId')
    const token = await AsyncStorage.getItem('token')
    fetch(`${protocol}://${host}:${port}/api/v1/models/AD_User?$filter=Supervisor_ID eq ${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        if (itemIndex === 0) {
          setSubOrdinateKey(0)
        } else (
          setSubOrdinateKey(subdata[itemIndex].id)
        )
      })
      .catch(error => console.error(error));
  }

  async function pickDocument() {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      const fileUri = result[0].uri;
      console.log(result);

      RNFS.readFile(fileUri, 'base64')
        .then((base64Data) => {
          setAttachment({ name: result[0].name, data: base64Data });
          setAttachmentData(result[0].name);
        })
        .catch((error) => {
          console.error("Error reading file: ", error);
        });
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
        console.log("User cancelled the document picker");
      } else {
        console.error("Document Picker Error: ", err);
      }
    }
  }


  // const getID = async (itemIndex, itemValue) => {
  //   setAssigned(itemValue)
  //   const protocol = await AsyncStorage.getItem('protocol')
  //   const host = await AsyncStorage.getItem('host')
  //   const port = await AsyncStorage.getItem('port')
  //   const userId = await AsyncStorage.getItem('userId')
  //   const token = await AsyncStorage.getItem('token')
  //   fetch(`${protocol}://${host}:${port}/api/v1/models/AD_User?$filter=Supervisor_ID eq ${userId}`, {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Authorization': `Bearer ${token}`
  //     }
  //   })
  //     .then(response => response.json())
  //     .then(data => {
  //       if (itemIndex === 0) {
  //         setSubOrdinateKey(0)
  //       } else (
  //         setSubOrdinateKey(subdata[itemIndex].id)
  //       )
  //     })
  //     .catch(error => console.error(error));
  // }

  // async function pickDocument() {
  //   try {
  //     const result = await DocumentPicker.pick({
  //       type: [DocumentPicker.types.allFiles],
  //     });
  //     const fileUri = result[0].uri
  //     console.log(result)
  //     RNFS.readFile(fileUri, 'base64')
  //       .then((dataResponce) => {
  //         const base64Data = btoa(dataResponce);
  //         setAttachment({ name: result[0].name, data: base64Data })
  //         setAttachmentData(result[0].name)
  //       })
  //       .catch((error) => {
  //         console.log(error);
  //       });
  //   } catch (err) {
  //     if (DocumentPicker.isCancel(err)) {

  //     } else {
  //       // Error!
  //     }
  //   }
  // }

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader title="Create New Task" />
      <View style={{ flex: 1, backgroundColor: '#fff ' }}>

        {/* Start Date modal */}
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
              />
              <TouchableOpacity onPress={() => setShowCalendarEnd(false)} style={styles.closeBtn}>
                <Text style={{ color: 'black' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Textinput */}
        <ScrollView style={{ flex: 1 }}>
          <View style={styles.inputContainer}>
            <Text style={styles.PrivateTxt}>Private To you</Text>
            <View style={styles.name}>
              <TextInput
                style={{ color: '#000', fontSize: 20, fontFamily: 'K2D-Regular', }}
                placeholder='Task Name...'
                placeholderTextColor={'gray'}
                onChangeText={text => setName(text)}
                value={name}
              />
            </View>

            <View style={{ flexDirection: 'row' }}>
              {/* <View style={{ width: '50%', }}>
                <Text style={styles.topTxt}>Assigned To</Text>
                <Picker
                  selectedValue={assigned}
                  onValueChange={(itemValue, itemIndex) => (
                    getID(itemIndex, itemValue)
                  )}
                  dropdownIconColor={'gray'}
                  style={styles.pickerItem}
                >
                  {subdata.map(option => (
                    <Picker.Item
                      label={option.Name}
                      value={option.Name}
                    />
                  ))}
                </Picker>
              </View> */}
              <View style={{ width: '50%' }}>
                <Text style={styles.topTxt}>Assigned To</Text>
                <TouchableOpacity
                  style={styles.buttonStyle}
                  onPress={() => rbSheetRef.current.open()}>
                  <Text>{assigned || "Select Subordinate"}</Text>
                </TouchableOpacity>
              </View>
              <RBSheet
                ref={rbSheetRef}
                closeOnDragDown={true}
                closeOnPressMask={true}
                customStyles={{
                  wrapper: {
                    backgroundColor: "transparent"
                  },
                  draggableIcon: {
                    backgroundColor: "#000"
                  }
                }}
              >
                <FlatList
                  data={subdata}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.sheetButton}
                      onPress={() => {
                        getID(item.id, item.Name); // Assuming getID function can handle setting the selected value
                        rbSheetRef.current.close();
                      }}>
                      <Text>{item.Name}</Text>
                    </TouchableOpacity>
                  )}
                />
              </RBSheet>

              <TouchableOpacity onPress={() => setShowCalendarEnd(true)} style={{ width: '50%', flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ borderWidth: 1, padding: 5, borderRadius: 30, height: 32, width: 32, borderColor: 'gray', borderStyle: 'dashed' }}>
                  <MaterialCommunityIcons name='calendar-month-outline' size={20} color='gray' />
                </View>
                <View>
                  {endDate && (
                    <Text style={[styles.topTxt, { paddingLeft: 10 }]}>
                      {moment(endDate).format('YYYY-MM-DD')}
                    </Text>
                  )}
                  {!endDate && (
                    <View style={{ flexDirection: 'row' }}>
                      <View style={{ width: '88%' }}>
                        <Text style={[styles.topTxt, { paddingLeft: 10 }]}>Due Date</Text>
                      </View>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            <View>
              <TextInput
                style={styles.summary}
                placeholder='Description'
                placeholderTextColor={'gray'}
                onChangeText={text => setSummary(text)}
                value={summary}
                multiline={true}
              />
            </View>
          </View>








          {/* 
          <Text style={styles.topTxt}>Select Start Date</Text>
          <TouchableOpacity onPress={() => setShowCalendarStart(true)} style={styles.startDate}>
            {startDate && (
              <Text style={styles.inside}>
                {startDate.toString()}
              </Text>
            )}
            {!startDate && (
              <View style={{ flexDirection: 'row' }}>
                <View style={{ width: '88%' }}>
                  <Text style={styles.inside}>
                    Selected Start Date
                  </Text>
                </View>
                <MaterialCommunityIcons name='calendar-month-outline' size={26} color='#00B0F0' style={styles.calender} />
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.topTxt}>Select End Date</Text>
          <TouchableOpacity onPress={() => setShowCalendarEnd(true)} style={styles.startDate}>
            {endDate && (
              <Text style={styles.inside}>
                {endDate.toString()}
              </Text>
            )}
            {!endDate && (
              <View style={{ flexDirection: 'row' }}>
                <View style={{ width: '88%' }}>
                  <Text style={styles.inside}>
                    Selected End Date
                  </Text>
                </View>
                <MaterialCommunityIcons name='calendar-month-outline' size={26} color='#00B0F0' style={styles.calender} />
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.topTxt}>Priority</Text>
          <View style={styles.startDate}>
            <Picker
              selectedValue={priority}
              onValueChange={(itemValue, itemIndex) => {
                const selectedOption = priorityData[itemIndex];
                setPriority(itemValue);
                setPickerKey(selectedOption.id);
              }}
              dropdownIconColor={'#00B0F0'}
              style={styles.pickerItem}
            >
              {priorityData.map(option => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.topTxt}>Assigned To</Text>
          <View style={styles.startDate}>
            <Picker
              selectedValue={assigned}
              onValueChange={(itemValue, itemIndex) => (
                getID(itemIndex, itemValue)
              )}
              dropdownIconColor={'#00B0F0'}
              style={styles.pickerItem}

            >
              {subdata.map(option => (
                <Picker.Item
                  // key={option.value}
                  label={option.Name}
                  value={option.Name}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.topTxt}>Attachments</Text>
          <TouchableOpacity style={styles.attachmentStyle} onPress={() => pickDocument()} >
            <View style={{ width: '85%', marginLeft: 10 }}>
              <Text style={styles.attachmentTxt}>{attachmentData}</Text>
            </View>
            <Image source={require('../../asserts/taskDetailAssets/attach.png')} style={styles.imageAttach} />
          </TouchableOpacity>

          <Text style={styles.topTxt}>Summary</Text>
          <View style={styles.summary}>
            <TextInput
              style={{ color: 'gray' }}
              onChangeText={text => setSummary(text)}
              value={summary}
            />
          </View> */}

          {/* <TouchableOpacity style={styles.btnSave} onPress={() => Save()}>
            <Text style={[styles.topTxt, { color: 'white' }]}>Save</Text>
          </TouchableOpacity> */}
        </ScrollView>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', zIndex: 2, padding: 10, paddingBottom: 20 }}>

          <TouchableOpacity style={styles.attachmentStyle} onPress={() => pickDocument()} >
            {/* <View style={{ width: '85%', marginLeft: 10 }}>
  <Text style={styles.attachmentTxt}>{attachmentData}</Text>
</View> */}
            <Image source={require('../../asserts/taskDetailAssets/attach.png')} style={styles.imageAttach} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnSave} onPress={() => Save()}>
            <Text style={[styles.topTxt, {}]}>Create</Text>
          </TouchableOpacity>
        </View>
      </View>
      {isLoading ? <Loader /> : null}
    </View>
  )
}

export default CreateNewReq

const styles = StyleSheet.create({
  inputContainer: {
    // width: '90%',
    padding: 10,
    // flex: 1,
  },
  startDate: {
    borderWidth: 1,
    borderColor: '#00B0F0',
    height: '5%',
    justifyContent: 'center',
    marginTop: 5,
    borderRadius: 10,
    marginBottom: 5
  },
  topTxt: {
    color: 'gray',
    fontSize: 16,
    fontFamily: 'K2D-Regular',
  },
  inside: {
    marginLeft: 10,
    color: 'gray',
    fontFamily: 'K2D',
  },
  modal: {
    width: '90%',
    backgroundColor: '#0070C0',
    borderRadius: 20,
    alignItems: 'center'
  },
  blurView: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)'
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
    color: '#00B0F0',
    fontSize: 16,
    fontFamily: 'K2D-Regular'
  },
  pickerItem: {
    color: 'gray',
    fontFamily: "K2D-Regular",
    fontWeight: 'bold'

  },
  calender: {
    height: '100%',
    width: '7%',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    // marginLeft: '45%'

  },
  btnSave: {
    paddingRight: 20
    // backgroundColor: '#00B0F0',
    // height: '5%',
    // width: '50%',
    // alignSelf: 'center',
    // borderRadius: 10,
    // alignItems: 'center',
    // justifyContent: 'center',
    // marginBottom: '100%'
  },
  summary: {
    fontSize: 18,
    fontFamily: 'K2D-Regular',
    paddingLeft: 10,
    color: '#000'
    // borderWidth: 1,
    // borderColor: '#00B0F0',
    // height: '12%',
    // marginTop: 5,
    // borderRadius: 10,
    // marginBottom: 15
  },
  name: {
    // borderWidth: 1,
    // borderColor: '#00B0F0',
    // height: '5%',
    marginTop: 5,
    // borderRadius: 10,
    // marginBottom: 5,
    // backgroundColor:'red'
  },
  attachmentStyle: {
    paddingLeft: 10,
    // borderWidth: 1,
    // borderColor: '#00B0F0',
    // height: '5%',
    // marginTop: 5,
    // borderRadius: 10,
    // marginBottom: 5,
    // flexDirection: "row",
    // alignItems: 'center'
  },
  imageAttach: {
    height: 30,
    width: 30,
    // height: '55%',
    // width: '6%'
  },
  attachmentTxt: {
    color: 'gray',
    fontFamily: "K2D-Regular"
  },
  PrivateTxt: {
    color: 'gray',
    fontSize: 15,
    fontFamily: 'K2D-Regular',
  },
}) 