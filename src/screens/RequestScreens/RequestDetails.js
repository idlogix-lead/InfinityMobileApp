import { StyleSheet, Text, View, ActivityIndicator, FlatList, TouchableOpacity, Image, Modal, ScrollView, Dimensions, PermissionsAndroid, ToastAndroid, Platform, Animated, TextInput, PixelRatio } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import TopHeader from '../../components/RequestScreenComponents/TopHeader';
import SmallInput from '../../components/RequestScreenComponents/SmallInput';
import Calender from '../../components/RequestScreenComponents/Calender';
import CalendarPicker from 'react-native-calendar-picker';
import moment, { isDate } from 'moment';
import ModalStatus from '../../components/RequestScreenComponents/ModalStatus';
import NonEditAble from '../../components/RequestScreenComponents/NonEditAble';
import CustomHeader from '../../components/CustomHeader';
import RNFS from 'react-native-fs';
import Entypo from 'react-native-vector-icons/dist/Entypo';
import FontAwesome from 'react-native-vector-icons/dist/FontAwesome';
import AntDesign from 'react-native-vector-icons/dist/AntDesign';
import Ionicons from 'react-native-vector-icons/dist/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { TouchableWithoutFeedback } from 'react-native';
import axios from 'axios';
import { format } from 'date-fns';

const { height, width } = Dimensions.get('window');
const deviceWidth = Dimensions.get('window').width;


const RequestDetails = ({ navigation, route }) => {
  // console.log(route.params, "data")
  const [isLoading, setIsLoading] = useState(false)
  const { id } = route.params
  // console.log(id)


  const scrollViewRef = useRef();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isSupport = true;


  const [message, setMessage] = useState('');
  const [taskName, setTaskName] = useState('')
  const [assignedBy, setassignedBy] = useState('')
  const [request, setRequest] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)
  const [showCalendarEnd, setShowCalendarEnd] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState('')
  const [dueType, setDueType] = useState('')
  const [attachmentName, setAttachmentName] = useState('')
  const [priority, setPriority] = useState('')
  const [summary, setSummary] = useState('')
  const [clientName, setClientName] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [show, setShow] = useState(false)
  const [dueTypeModal, setDueTypeModal] = useState(false)
  const [priorityModal, setPriorityModal] = useState(false)
  const [subdata, setSubData] = useState([])
  const [assignedTo, setAssignedTo] = useState('')
  const [assignedToModal, setAssignedToModal] = useState(false)
  const [filterRecordsId, setFilterRecordsId] = useState()
  const [subOrdinateID, setSubOrdinateID] = useState(0)
  const [statusID, setStatusID] = useState(0)
  const [documentNo, setDocumentNo] = useState(0)
  const [dueID, setDueID] = useState('')
  const [priorityID, setpriorityID] = useState('')
  const [requestID, setRequestID] = useState()
  const [unique_ID, setUniqueID] = useState()
  const [expanded, setExpanded] = useState(false);
  const [isComponentVisible, setComponentVisible] = useState(false);
  const [recordsData, setRecordsData] = useState([]);
  const [getmassages, setGetmassages] = useState([]);
  const [showVoiceView, setShowVoiceView] = useState(false);
  const [SMS, setSMS] = useState([])
  const [selectedStatus, setSelectedStatus] = useState("Status");


  // console.log(documentNo, 'documentNoInRequestSrn')

  let dateDummyStart, dateDummyEnd


  const firstTwoChars = assignedBy.split(" ")[0]?.slice(0, 2).toUpperCase() || "";

  console.log(unique_ID, 'unique_ID')

  // console.log(requestID,'requestID')
  // console.log(attachmentName,'attachment')


  // Put Request in TaskDetail

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
          "PriorityUser": { "id": '5', "identifier": 'medium', "model-name": "ad_ref_list" },
          // "PriorityUser": { "id": pickerKey.toString(), "identifier": priority, "model-name": "ad_ref_list" },
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
      console.log(body,'ece')

      const requestData = await requestResponse.json();
      // setStartDate(null);
      setEndDate(null);
      setSummary('');
      // setPriority(priorityData[0]);
      setAssigned(requestData[0]);
      setName('');
      let newDocId = requestData.id;
      // console.log('newDocId', newDocId);

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
      // const attachmentData = await attachmentResponse.json();
      const attachmentData = await attachmentResponse;
      // console.log(attachmentData);

      navigation.goBack();

    } catch (error) {
      console.log(error);
      // alert(error,'Eeeeeeeeeeee');
      setIsLoading(false);
    }
    finally {
      setIsLoading(false);
    }
  };

  const modalCloseStatus = (status) => {
    setSelectedStatus(status); 
    setShow(false);
    StatusChangePostCall()
  };


  const handleBackPress = () => {
    navigation.goBack();
  };


  useEffect(() => {
    if (unique_ID) {
      console.log("Calling getAPIData1 with unique_ID:", unique_ID);
      ChatScreenShowDataGETAPI();
    }
  }, [unique_ID]);




  // all message show in screen

  const ChatScreenShowDataGETAPI = async () => {
    const protocol = await AsyncStorage.getItem("protocol");
    const host = await AsyncStorage.getItem("host");
    const port = await AsyncStorage.getItem("port");
    const token = await AsyncStorage.getItem("token");

    setIsLoading(true);
    if (!unique_ID) {
      console.warn("unique_ID is undefined, skipping API call");
      return;  // Agar unique_ID undefined ho to API call na karein
    }
    try {


      if (!protocol || !host || !port || !token) {
        console.error("Missing required values from AsyncStorage.");
        setIsLoading(false);
        return;
      }

      if (!unique_ID) {
        console.error("ID is undefined. Cannot make API call.");
        setIsLoading(false);
        return;
      }

      const url = `${protocol}://${host}:${port}/api/v1/models/R_RequestUpdate?$filter=R_Request_ID eq ${unique_ID}`;
      console.log(url, "R_RequestUpdateURLCheck");

      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const records = response?.data?.records || [];
      if (records.length > 0) {
        const mappedData = records.map((record) => ({
          createdTime: record.Created
            ? format(new Date(record.Created), "MMM d, yyyy, h:mm a") // Format date
            : "N/A",
          createdBy: record.CreatedBy?.identifier || "N/A",
          result: record.Result || "N/A",
          createdRaw: record.Created || null, // Add raw date for sorting
        }));

        // Sort data based on createdRaw field (descending order)
        const sortedData = mappedData.sort((a, b) => {
          return new Date(b.createdRaw) - new Date(a.createdRaw);
        });

        setRecordsData(sortedData);
      } else {
        console.log("No records found in API response.");
        setRecordsData([]);
      }
    } catch (error) {
      console.error(
        error.response?.data || error.message,
        "ChatScreenShowDataGETAPI Error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const StatusChangePostCall = async () => {
    try {
      // Retrieve AsyncStorage values
      const protocol = await AsyncStorage.getItem("protocol");
      const host = await AsyncStorage.getItem("host");
      const port = await AsyncStorage.getItem("port");
      const token = await AsyncStorage.getItem("token");
      const clientId = await AsyncStorage.getItem("clientId");
      const organizationId = await AsyncStorage.getItem("organizationId");
      const roleId = await AsyncStorage.getItem("roleId");
      const roleNameSelected = await AsyncStorage.getItem("roleNameSelected");
      const userId = await AsyncStorage.getItem("userId");
      const userName = await AsyncStorage.getItem("userName");
      const usersData = await AsyncStorage.getItem("usersData");
      const warehouseId = await AsyncStorage.getItem("warehouseId");
      const warehouseNameSelected = await AsyncStorage.getItem("warehouseNameSelected");

      // Check for required values
      if (!protocol || !host || !port || !token) {
        console.error("Missing required values from AsyncStorage.");
        return;
      }
      const formatDate = (date) => {
        const isoDate = date.toISOString();
        return isoDate.split(".")[0] + "Z";
      };
      console.log(formatDate, 'formatDateTime')
      // setText('');
      // setInputText('')

      const payload = {
        id: unique_ID,
        // uid: "e77425fc-4907-4b55-8f57-73e0826d35c2",
        AD_Client_ID: {
          propertyLabel: "Tenant",
          id: clientId ? parseInt(clientId) : null,
          identifier: "UActros",
          "model-name": "ad_client",
        },
        AD_Org_ID: {
          propertyLabel: "Organization",
          id: organizationId ? parseInt(organizationId) : null,
          identifier: "United Actros General Trading",
          "model-name": "ad_org",
        },
        // IsActive: "true",
        // IsActive: "Y",
        Created: formatDate(new Date()),
        CreatedBy: {
          propertyLabel: "Created By",
          id: userId ? parseInt(userId) : null,
          identifier: userName || "Admin",
          "model-name": "ad_user",
        },
        Updated: formatDate(new Date()),
        UpdatedBy: {
          propertyLabel: "Updated By",
          id: userId ? parseInt(userId) : null,
          identifier: userName || "Admin",
          "model-name": "ad_user",
        },
        R_Request_ID: {
          propertyLabel: "Request",
          id: unique_ID,
          identifier: "-1_1000002",
          "model-name": "r_request",
        },
        ConfidentialTypeEntry: {
          propertyLabel: "Entry Confidentiality",
          id: "I",
          identifier: "Internal",
          "model-name": "ad_ref_list",
        },
        QtySpent: 0,
        QtyInvoiced: 0,
        // Result: selectedResponseText,
        // Result: message,
        status:selectedStatus,
      };
      console.log(payload, "InfinityERPPOSTPayloadData");
      const url = `${protocol}://${host}:${port}/api/v1/models/R_RequestUpdate`;
      // const url = `${protocol}://${host}:${port}/api/v1/models/R_RequestUpdate?$filter=R_Request_ID eq ${request_id}`;
      // console.log(url, "APIURLForChatSrn");
      // API Call
      setIsLoading(true);
      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response?.data, "APIResponseForChatSrn:");
      // alert("Chat Message successfully delivered")
      ToastAndroid.show("Chat Message successfully delivered", ToastAndroid.SHORT);
      console.log("Chat Message successfully delivered");
      setMessage('')
    } catch (error) {
      console.error(error, "Error in passdata1:");
    } finally {
      // setSelectedResponseText("");
      // setInputText("")
      // ChatScreenShowDataGETAPI();
      setIsLoading(false);
      setMessage('')
      ChatScreenShowDataGETAPI();
    }
  };




  //  POST call in Message
  const passdata1 = async () => {
    try {
      // Retrieve AsyncStorage values
      const protocol = await AsyncStorage.getItem("protocol");
      const host = await AsyncStorage.getItem("host");
      const port = await AsyncStorage.getItem("port");
      const token = await AsyncStorage.getItem("token");
      const clientId = await AsyncStorage.getItem("clientId");
      const organizationId = await AsyncStorage.getItem("organizationId");
      const roleId = await AsyncStorage.getItem("roleId");
      const roleNameSelected = await AsyncStorage.getItem("roleNameSelected");
      const userId = await AsyncStorage.getItem("userId");
      const userName = await AsyncStorage.getItem("userName");
      const usersData = await AsyncStorage.getItem("usersData");
      const warehouseId = await AsyncStorage.getItem("warehouseId");
      const warehouseNameSelected = await AsyncStorage.getItem("warehouseNameSelected");

      // Check for required values
      if (!protocol || !host || !port || !token) {
        console.error("Missing required values from AsyncStorage.");
        return;
      }
      const formatDate = (date) => {
        const isoDate = date.toISOString();
        return isoDate.split(".")[0] + "Z";
      };
      console.log(formatDate, 'formatDateTime')
      // setText('');
      // setInputText('')

      const payload = {
        id: unique_ID,
        // uid: "e77425fc-4907-4b55-8f57-73e0826d35c2",
        AD_Client_ID: {
          propertyLabel: "Tenant",
          id: clientId ? parseInt(clientId) : null,
          identifier: "UActros",
          "model-name": "ad_client",
        },
        AD_Org_ID: {
          propertyLabel: "Organization",
          id: organizationId ? parseInt(organizationId) : null,
          identifier: "United Actros General Trading",
          "model-name": "ad_org",
        },
        // IsActive: "true",
        // IsActive: "Y",
        Created: formatDate(new Date()),
        CreatedBy: {
          propertyLabel: "Created By",
          id: userId ? parseInt(userId) : null,
          identifier: userName || "Admin",
          "model-name": "ad_user",
        },
        Updated: formatDate(new Date()),
        UpdatedBy: {
          propertyLabel: "Updated By",
          id: userId ? parseInt(userId) : null,
          identifier: userName || "Admin",
          "model-name": "ad_user",
        },
        R_Request_ID: {
          propertyLabel: "Request",
          id: unique_ID,
          identifier: "-1_1000002",
          "model-name": "r_request",
        },
        ConfidentialTypeEntry: {
          propertyLabel: "Entry Confidentiality",
          id: "I",
          identifier: "Internal",
          "model-name": "ad_ref_list",
        },
        QtySpent: 0,
        QtyInvoiced: 0,
        // Result: selectedResponseText,
        Result: message,
      };
      console.log(payload, "InfinityERPPOSTPayloadData");
      const url = `${protocol}://${host}:${port}/api/v1/models/R_RequestUpdate`;
      // const url = `${protocol}://${host}:${port}/api/v1/models/R_RequestUpdate?$filter=R_Request_ID eq ${request_id}`;
      // console.log(url, "APIURLForChatSrn");
      // API Call
      setIsLoading(true);
      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response?.data, "APIResponseForChatSrn:");
      // alert("Chat Message successfully delivered")
      ToastAndroid.show("Chat Message successfully delivered", ToastAndroid.SHORT);
      console.log("Chat Message successfully delivered");
      setMessage('')
    } catch (error) {
      console.error(error, "Error in passdata1:");
    } finally {
      // setSelectedResponseText("");
      // setInputText("")
      // ChatScreenShowDataGETAPI();
      setIsLoading(false);
      setMessage('')
      ChatScreenShowDataGETAPI();
    }
  };



  // Take Photo
  const takePhoto = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.3,
      selectionLimit: 1,
    };

    launchCamera(options, response => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        console.log('Camera Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const source = {
          uri: response.assets[0].uri,
          type: response.assets[0].type,
          name: response.assets[0].fileName || `image-${Date.now()}.jpg`,
        };
        uploadFileToTask(
          response.assets[0].uri,
          response.assets[0].type,
          response.assets[0].fileName,
        );
      }
    });
  };

  // Image Pick
  const pickImage = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.3,
      selectionLimit: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets) {
        const sources = response.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName || `image-${Date.now()}.jpg`,
        }));
        console.log(response.assets[0].uri, "image")
        uploadFileToTask(
          response.assets[0].uri,
          response.assets[0].type,
          response.assets[0].fileName,
        );
        console.log('Source we get', sources);

      }
    });
  };

  // UseRef Hook  for ALL data show in screen
  const getallmassages = async () => {
    const protocol = await AsyncStorage.getItem("Protocol")
    const IPAddress = await AsyncStorage.getItem("IpAddress")
    const Port = await AsyncStorage.getItem("port")
    const token = await AsyncStorage.getItem("auth_token")

    console.log(protocol, IPAddress, Port, token)

    setIsLoading(true);
    try {

      // const url = `${protocol}://${IPAddress}:${Port}/api/chat/${id}`;

      const url = `${protocol}://${IPAddress}:${Port}/api/v1/models/R_RequestUpdate?$filter=R_Request_ID eq ${unique_ID}`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log(response?.data.chats, 'TextMessage')
      const NewMessages = response?.data.chats.map(message => {
        if (message.attachment_path !== null) {
          return {
            type: "image",
            message: message
          };
        } else if (message.voice_msg_path !== null) {
          return {
            type: "audio",
            message: message
          };
        } else {
          return {
            type: "text_msg",
            message: message
          }
        }
      });
      console.log(NewMessages, "massa")


      if (response.data) {
        setGetmassages(NewMessages);

      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };




  const getAPIData = async (protocol, host, port, userId, id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const value = await AsyncStorage.getItem('userName');

      let response = await fetch(`${protocol}://${host}:${port}/api/v1/models/R_Request`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      let data = await response.json();
      let records = data.records;
      // console.log(records,'AllResponseData')

      const filterRecords = records.filter(item => item.id === id);
      console.log(filterRecords, 'GETForTaskScreen')
      setDocumentNo(filterRecords[0].DocumentNo)
      setStatusID(filterRecords[0].R_Status_ID.id)
      setSubOrdinateID(filterRecords[0].SalesRep_ID.id)
      setpriorityID(filterRecords[0].PriorityUser.id)
      setDueID(filterRecords[0].DueType.id)
      setFilterRecordsId(filterRecords[0].R_Status_ID.id)
      setTaskName(filterRecords[0].Name)
      setassignedBy(filterRecords[0].CreatedBy.identifier)
      setRequest(filterRecords[0].id)
      // setUniqueID(filterRecords[0]?.R_RequestType_ID?.id)
      setUniqueID(filterRecords[0]?.id)
      console.log(unique_ID, 'unique_IDMoazzamBiag')
      // let dateStart = moment(filterRecords[0].StartDate).format('YYYY-DD-MM')
      let dateStart = moment(filterRecords[0].StartDate).format('DD-MM-YYYY')
      let dateEnd = moment(filterRecords[0].EndTime).format('DD-MM-YYYY')
      setStartDate(dateStart)
      setEndDate(dateEnd)
      setStatus(filterRecords[0].R_Status_ID.identifier.split("_")[1])
      setDueType(filterRecords[0].DueType.identifier)
      setPriority(filterRecords[0].PriorityUser.identifier)
      setSummary(filterRecords[0].Summary)
      setClientName(filterRecords[0].AD_Client_ID.identifier)
      setOrganizationName(filterRecords[0].AD_Org_ID.identifier)
      setAssignedTo(filterRecords[0].SalesRep_ID.identifier)

      if (filterRecords.length > 0) {
        const requestId = filterRecords[0].id;
        setRequestID(requestId);

        try {
          response = await fetch(`${protocol}://${host}:${port}/api/v1/models/R_Request/${requestId}/attachments`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          const attachmentsData = await response.json();

          const attachments = attachmentsData.attachments;

          if (attachments && attachments.length > 0) {
            const firstAttachmentName = attachments[0].name;
            setAttachmentName(firstAttachmentName);
          } else {
            console.log('No attachments found');
          }
        } catch (err) {
          console.error("Error fetching attachments: ", err);
        }
      } else {
        console.log('No records found with the provided ID');
      }
      const url = `${protocol}://${host}:${port}/api/v1/models/AD_User?$filter=Supervisor_ID eq ${userId}`;
      // console.log(url, 'urlForTaskScreen')
      response = await fetch(`${protocol}://${host}:${port}/api/v1/models/AD_User?$filter=Supervisor_ID eq ${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      data = await response.json();
      const array1 = [{ Name: value, id: userId }];
      records = data.records;

      const newArray = array1.concat(records);
      // console.log(newArray,'ewrf')
      setSubData(newArray);
      setIsLoading(false);

    } catch (error) {
      console.error(error);
      setIsLoading(false);
      alert(error.message);
    }
  };









  const requestStoragePermission = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "Storage Permission Required",
            message: "This app needs access to your storage to download files."
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const downloadFile = async () => {
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const token = await AsyncStorage.getItem('token');

    const permissionGranted = await requestStoragePermission();
    if (!permissionGranted) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Storage Permission Not Granted', ToastAndroid.SHORT);
      }
      return;
    }

    const fileUrl = `${protocol}://${host}:${port}/api/v1/models/R_Request/${requestID}/attachments/${attachmentName}`;
    const localFilePath = `${RNFS.DownloadDirectoryPath}/${attachmentName}`;

    try {
      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error fetching file: ${response.status}`);
      }

      const actualFileUrl = response.url;

      if (Platform.OS === 'android') {
        ToastAndroid.show('Download started', ToastAndroid.SHORT);
      }

      await RNFS.downloadFile({
        fromUrl: actualFileUrl,
        toFile: localFilePath,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        background: true
      }).promise;

      const fileExists = await RNFS.exists(localFilePath);
      if (fileExists) {
        if (Platform.OS === 'android') {
          ToastAndroid.show('Download completed', ToastAndroid.SHORT);
        }
      } else {
        throw new Error('File downloaded but does not exist at the expected path');
      }
    } catch (error) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Error in download', ToastAndroid.SHORT);
      }
    }
  };

  // const downloadFile = async () => {
  //   const protocol = await AsyncStorage.getItem('protocol');
  //   const host = await AsyncStorage.getItem('host');
  //   const port = await AsyncStorage.getItem('port');
  //   const token = await AsyncStorage.getItem('token'); 

  //   const permissionGranted = await requestStoragePermission();
  //   if (!permissionGranted) {
  //     console.log('Storage Permission Not Granted');
  //     return;
  //   }

  //   const fileUrl = `${protocol}://${host}:${port}/api/v1/models/R_Request/${requestID}/attachments/${attachmentName}`;
  //   console.log(fileUrl,'fileurl')

  //   try {
  //     const response = await fetch(fileUrl, {
  //       method:'GET',
  //       headers: {
  //         'Authorization': `Bearer ${token}` 
  //       }
  //     });

  //     if (!response.ok) {
  //       console.error(`Error fetching file: ${response.status}`);
  //       return;
  //     }

  //     const actualFileUrl = response.url;
  //     const localFilePath = `${RNFS.DownloadDirectoryPath}/${attachmentName}`;

  //     // RNFS.mkdir(`${RNFS.DownloadDirectoryPath}/MyDirectory`)
  //     console.log(localFilePath,'local')

  //     const downloadResult = await RNFS.downloadFile({
  //       fromUrl: actualFileUrl,
  //       toFile: localFilePath,
  //       headers: {
  //         'Authorization': `Bearer ${token}` 
  //       },
  //       background: true,
  //       begin: (res) => {
  //         console.log('Download started', res);
  //       },
  //       progress: (res) => {
  //         console.log(`${(res.bytesWritten / res.contentLength).toFixed(2) * 100}%`);
  //       },
  //     }).promise.then(response => {
  //       console.log('77777777777777777777777file download', response)
  //     }).catch((error)=>{
  //       console.log('error',error.message)
  //     });


  //     console.log('=========================',fileUrl)

  //     const fileExists = await RNFS.exists(localFilePath);
  //     if (fileExists) {
  //       console.log('File downloaded and exists at:', localFilePath);
  //       const targetlocation = `${RNFS.DownloadDirectoryPath}/${attachmentName}`;
  //         RNFS.moveFile(localFilePath, targetlocation);
  //       if (Platform.OS === 'android') {
  //       }
  //     } else {
  //       console.error('File downloaded but does not exist at the expected path:', localFilePath);
  //     }
  //   } catch (error) {
  //     console.error('Error downloading file:', error);
  //   }
  // };




  // const getAPIData = async (protocol, host, port, userId, id) => {
  //   const token = await AsyncStorage.getItem('token')
  //   const value = await AsyncStorage.getItem('userName');
  //   fetch(`${protocol}://${host}:${port}/api/v1/models/R_Request`, {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Authorization': `Bearer ${token}`
  //     }
  //   })
  //     .then(response => response.json())
  //     .then(data => {
  //       let records = data.records
  //       const filterRecords = records.filter(item => item.id === id);
  //       setStatusID(filterRecords[0].R_Status_ID.id)
  //       setSubOrdinateID(filterRecords[0].SalesRep_ID.id)
  //       setpriorityID(filterRecords[0].PriorityUser.id)
  //       setDueID(filterRecords[0].DueType.id)
  //       setFilterRecordsId(filterRecords[0].R_Status_ID.id)
  //       setTaskName(filterRecords[0].Name)
  //       setassignedBy(filterRecords[0].CreatedBy.identifier)
  //       setRequest(filterRecords[0].id)
  //       let dateStart = moment(filterRecords[0].StartDate).format('YYYY-DD-MM')
  //       let dateEnd = moment(filterRecords[0].EndTime).format('YYYY-DD-MM')
  //       setStartDate(dateStart)
  //       setEndDate(dateEnd)
  //       setStatus(filterRecords[0].R_Status_ID.identifier.split("_")[1])
  //       setDueType(filterRecords[0].DueType.identifier)
  //       setPriority(filterRecords[0].PriorityUser.identifier)
  //       setSummary(filterRecords[0].Summary)
  //       setClientName(filterRecords[0].AD_Client_ID.identifier)
  //       setOrganizationName(filterRecords[0].AD_Org_ID.identifier)
  //       setAssignedTo(filterRecords[0].SalesRep_ID.identifier)
  //       fetch(`${protocol}://${host}:${port}/api/v1/models/AD_User?$filter=Supervisor_ID eq ${userId}`, {
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Authorization': `Bearer ${token}`
  //         }
  //       })
  //         .then(response => response.json())
  //         .then(data => {
  //           const array1 = [{ Name: value, Name: value, id: userId }]
  //           let records = data.records
  //           const newArray = array1.concat(records)
  //           setSubData(newArray)
  //           setIsLoading(false)
  //         })
  //         .catch(error => {
  //           console.error(error)
  //           setIsLoading(false)
  //         });
  //     })
  //     .catch(error => {
  //       alert(error)
  //       setIsLoading(false)
  //     });
  // }

  const navigateBack = () => {
    setIsLoading(true)
    const unsubscribe = navigation.addListener('focus', async () => {
      const protocol = await AsyncStorage.getItem('protocol')
      const host = await AsyncStorage.getItem('host')
      const port = await AsyncStorage.getItem('port')
      const userId = await AsyncStorage.getItem('userId')
      getAPIData(protocol, host, port, userId, id)
    });
    return unsubscribe;
  }

  const modalClose = (txt, id) => {
    setStatusID(id)
    setStatus(txt)
    setShow(false)
  }

  const modalDueType = (txt, id) => {
    setDueType(txt)
    setDueID(id)
    setDueTypeModal(false)
  }

  const modalClosePriority = (txt, id) => {
    setPriority(txt)
    setpriorityID(id)
    setPriorityModal(false)
  }

  const selectSub = (txt, id) => {
    setSubOrdinateID(id)
    setAssignedTo(txt)
    setAssignedToModal(false)
  }

  // const saveButton = async () => {
  //   let startDateDummy, endDateDummy
  //   const parsedStartDate = moment(startDate, 'YYYY-DD-MM');
  //   startDateDummy = moment(parsedStartDate).format('YYYY-MM-DD[T]HH:mm:ss[Z]')
  //   const parsedEndDate = moment(endDate, 'YYYY-DD-MM');
  //   endDateDummy = moment(parsedEndDate).format('YYYY-MM-DD[T]HH:mm:ss[Z]')
  //   const protocol = await AsyncStorage.getItem('protocol')
  //   const host = await AsyncStorage.getItem('host')
  //   const port = await AsyncStorage.getItem('port')
  //   const token = await AsyncStorage.getItem('token')
  //   const userId = await AsyncStorage.getItem('userId')

  //   console.log('dueID', dueID, "dueType", dueType)
  //   fetch(`${protocol}://${host}:${port}/api/v1/models/R_Request/${id}`, {
  //     method: 'PUT',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Authorization': `Bearer ${token}`,
  //     },
  //     body: JSON.stringify({
  //       "Name": taskName,
  //       "StartDate": startDate,
  //       "EndTime": endDate,
  //       "Summary": summary,
  //       "PriorityUser": { "id": priorityID, "identifier": priority, "model-name": "ad_ref_list" },
  //       "DueType": { "id": dueID, "identifier": dueType, "model-name": "ad_ref_list" },
  //       "SalesRep_ID": { "id": subOrdinateID, "identifier": assignedTo, "model-name": "ad_user" },
  //       "R_Status_ID": { "id": statusID, "identifier": status, "model-name": "r_status" }
  //       // "DueType": { "id": dueID, "identifier": dueType, "model-name": "ad_ref_list" },
  //       // "PriorityUser": { "id": priorityID, "identifier": priority, "model-name": "ad_ref_list" },
  //       // "R_Status_ID": { "id": statusID, "identifier": status, "model-name": "r_status" },
  //       // "SalesRep_ID": { "id": subOrdinateID, "identifier": assignedTo, "model-name": "ad_user" },
  //       // "Summary": summary,
  //       // "EndTime": endDate,
  //       // "Name": taskName,
  //       // "StartTime": startDate
  //     })
  //   })
  //     .then(response => {
  //       return response.json();
  //     })
  //     .then(data => {
  //       console.log(data)
  //       setIsLoading(true)
  //       getAPIData(protocol, host, port, userId, id)
  //     })
  //     .catch(error => {
  //       // Handle the error
  //       alert(error)
  //       setIsLoading(false)
  //       // ...
  //     });
  // }

  const saveButton = async () => {
    try {
      let startDateDummy, endDateDummy;
      const parsedStartDate = moment(startDate, 'YYYY-DD-MM');
      startDateDummy = moment(parsedStartDate).format('YYYY-MM-DD[T]HH:mm:ss[Z]');
      const parsedEndDate = moment(endDate, 'YYYY-DD-MM');
      endDateDummy = moment(parsedEndDate).format('YYYY-MM-DD[T]HH:mm:ss[Z]');
      const protocol = await AsyncStorage.getItem('protocol');
      const host = await AsyncStorage.getItem('host');
      const port = await AsyncStorage.getItem('port');
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');

      // console.log('dueID', dueID, "dueType", dueType);

      const response = await fetch(`${protocol}://${host}:${port}/api/v1/models/R_Request/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          "Name": taskName,
          "StartDate": startDate,
          "EndTime": endDate,
          "Summary": summary,
          "PriorityUser": { "id": priorityID, "identifier": priority, "model-name": "ad_ref_list" },
          "DueType": { "id": dueID, "identifier": dueType, "model-name": "ad_ref_list" },
          "SalesRep_ID": { "id": subOrdinateID, "identifier": assignedTo, "model-name": "ad_user" },
          "R_Status_ID": { "id": statusID, "identifier": status, "model-name": "r_status" }
        })
      });

      const data = await response.json();
      // console.log(data, 'vvv');
      setIsLoading(true);
      getAPIData(protocol, host, port, userId, id);
    } catch (error) {
      console.error(error);
      alert(error);
      setIsLoading(false);
    }
  };

  // saveButton();


  useEffect(() => {
    navigateBack()
  }, [navigation])

  useEffect(() => {
  }, [getmassages]);

  // useEffect(() => {
  //   if (showVoiceView) {
  //     fadeAnim.setValue(0);
  //     const animation = Animated.loop(
  //       Animated.sequence([
  //         Animated.timing(fadeAnim, {
  //           toValue: 1,
  //           duration: 1000,
  //           useNativeDriver: true,
  //         }),
  //         Animated.timing(fadeAnim, {
  //           toValue: 0,
  //           duration: 1000,
  //           useNativeDriver: true,
  //         }),
  //       ]),
  //     );
  //     animation.start();
  //     return () => animation.stop();
  //   }
  // }, [showVoiceView, fadeAnim]);
  // useEffect(() => {
  //   if (showVoiceView) {
  //     const timerID = setInterval(function run() {
  //       onStartRecord();
  //       clearInterval(timerID);
  //     }, 1000);
  //   }
  // }, [showVoiceView]);

  return (
    <>
      {isLoading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
          <ActivityIndicator size="large" color="#0050C0" />
        </View>
      )}
      {!isLoading && (
        <>
        <View style={{flex:1, backgroundColor:"#fff"}}>
          {/* <CustomHeader title="Task Detail" RightIcon='chat-processing-outline' RightPress={() => navigation.navigate('ChatScreen',{taskNo:documentNo, request_id:unique_ID})} /> */}

          <View style={styles.headerContainer}>
            <View style={styles.innerHeaderContainerStyle}>

              <TouchableOpacity style={styles.BackHandlerStyle} onPress={() => { handleBackPress() }}>
                <Entypo name='chevron-left' size={18} color='#000' />
              </TouchableOpacity>


              <TouchableOpacity style={styles.statusContainer} onPress={() => setShow(true)}>
                <AntDesign name='edit' size={20} color='#000' />
                <Text style={{ color: "black", marginLeft: 5, fontSize: 16, fontWeight: 600 }}>{selectedStatus}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={{ flex: 1, }} showsHorizontalScrollIndicator={false}>




            <Modal
              visible={show}
              animationType="slide"
              transparent={true}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalView}>
                  <Text style={styles.txt}>Set Status</Text>
                  <TouchableOpacity onPress={() => modalCloseStatus('Open', 1000000)} style={styles.txtContainer}>
                    <Text style={styles.txt}>Open</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => modalCloseStatus('Waiting', 1000001)} style={styles.txtContainer}>
                    <Text style={styles.txt}>Waiting</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => modalCloseStatus('Close', 1000002)} style={styles.txtContainer}>
                    <Text style={styles.txt}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => modalCloseStatus('Final Close', 1000003)} style={styles.txtContainer}>
                    <Text style={styles.txt}>Final Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setShow(!show) }} style={styles.btn}>
                    <Text style={styles.txtBtn}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* <View style={{ alignItems: 'center'}}>
              <Modal visible={showCalendar} animationType="slide" transparent={true}>
                <View style={styles.blurView}  >
                  <View style={styles.modal}>
                    <CalendarPicker
                      onDateChange={(date) => {
                        dateDummyStart = moment(date).format('YYYY-MM-DD[T]HH:mm:ss[Z]')
                        setStartDate(moment(dateDummyStart).format('DD-MM-YYYY'))
                        setShowCalendar(false)
                      }}
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
                    <TouchableOpacity style={styles.closeBtn} onPress={() => setShowCalendar(false)}>
                      <Text style={styles.close}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
              <Modal visible={showCalendarEnd} animationType="slide" transparent={true}>
                <View style={styles.blurView}  >
                  <View style={styles.modal}>
                    <CalendarPicker
                      onDateChange={(date) => {
                        dateDummyEnd = moment(date).format('YYYY-MM-DD[T]HH:mm:ss[Z]')
                        setEndDate(moment(dateDummyEnd).format('DD-MM-YYYY'))
                        setShowCalendarEnd(false)
                      }}
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
                    <TouchableOpacity style={styles.closeBtn} onPress={() => setShowCalendarEnd(false)}>
                      <Text style={styles.close}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              <Modal
                visible={show} 
                animationType="slide" 
                transparent={true} 
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
                visible={dueTypeModal}
                animationType="slide"
                transparent={true}
              >
                <View style={{ backgroundColor: 'rgba(0,0,0,0.5)', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <View style={styles.modalViewDue}>
                    <Text style={styles.txt}>Set Type</Text>
                    <TouchableOpacity onPress={() => modalDueType('Due', '5')} style={styles.txtContainer}>
                      <Text style={styles.txt}>Due</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => modalDueType('Overdue', '3')} style={styles.txtContainer}>
                      <Text style={styles.txt}>Overdue</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => modalDueType('Scheduled', '7')} style={styles.txtContainer}>
                      <Text style={styles.txt}>Scheduled</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setDueTypeModal(false) }} style={styles.btn}>
                      <Text style={styles.txtBtn}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>

              </Modal>

              <Modal
                visible={priorityModal} 
                animationType="slide" 
                transparent={true} >
                <View style={styles.modalContainer}>
                  <View style={styles.modalViewPrior}>
                    <Text style={styles.txt}>Set Priority</Text>
                    <TouchableOpacity onPress={() => modalClosePriority('High', '3')} style={styles.txtContainer}>
                      <Text style={styles.txt}>High</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => modalClosePriority('Low', '7')} style={styles.txtContainer}>
                      <Text style={styles.txt}>Low</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => modalClosePriority('Medium', '5')} style={styles.txtContainer}>
                      <Text style={styles.txt}>Medium</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => modalClosePriority('Minor', '9')} style={styles.txtContainer}>
                      <Text style={styles.txt}>Minor</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => modalClosePriority('Urgent', '1')} style={styles.txtContainer}>
                      <Text style={styles.txt}>Urgent</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setPriorityModal(false) }} style={styles.btn}>
                      <Text style={styles.txtBtn}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

            
              <Modal
                visible={assignedToModal} 
                animationType="slide" 
                transparent={true}
              >
                <View style={styles.modalContainer}>
                  <View style={styles.modalViewAssigned}>
                    <Text style={styles.txt}>Select Sub Ordinate</Text>
                    <FlatList
                      data={subdata}
                      renderItem={({ item }) =>
                        <TouchableOpacity style={styles.item} onPress={() => selectSub(item.Name, item.id)}>
                          <Text style={styles.title}>{item.Name}</Text>
                        </TouchableOpacity>
                      }
                      keyExtractor={item => item.id}
                    />
                    <TouchableOpacity onPress={() => { setAssignedToModal(false) }} style={styles.btn}>
                      <Text style={styles.txtBtn}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>

              </Modal>
              <View style={styles.formCon}>


                <View style={{ flexDirection: 'row' }}>
                  <SmallInput
                    txt="Task Name"
                    // placeholder={taskName}
                    value={taskName}
                    onChangeText={(txt) => setTaskName(txt)}
                    width='40%'
                  />
                  <ModalStatus
                    txt="Assigned To"
                    width="57%"
                    status={assignedTo}
                    widthStatus="85%"
                    marginLeft={10}
                    source={require('../../asserts/taskDetailAssets/arrow.png')}
                    onPress={() => setAssignedToModal(true)}
                  />

                </View>

                
                <View style={{ flexDirection: 'row' }}>
                  <NonEditAble
                    txt="Assigned By"
                    width='40%'
                    value={assignedBy} />
                  <NonEditAble
                    txt="Request"
                    width='57%'
                    value={request}
                    marginLeft={10} />
                </View>

                <View style={{ flexDirection: 'row' }}>
                  <Calender
                    dateTxt={startDate}
                    width="40%"
                    widthDate="72%"
                    txt="Start Date"
                    showCalendarPress={() => setShowCalendar(true)}
                  />
                  <Calender
                    width="57%"
                    dateTxt={endDate}
                    marginLeft={10}
                    widthDate='75%'
                    txt="End Date"
                    showCalendarPress={() => setShowCalendarEnd(true)}
                  />
                </View>

               
                <View style={{ flexDirection: 'row' }}>
                  <ModalStatus
                    txt="Status"
                    width="40%"
                    status={status}
                    widthStatus="82%"
                    source={require('../../asserts/taskDetailAssets/arrow.png')}
                    onPress={() => setShow(true)}
                    marginTop={10}
                  />
                  <ModalStatus
                    txt="Due type"
                    width="57%"
                    status={dueType}
                    widthStatus="85%"
                    marginLeft={10}
                    source={require('../../asserts/taskDetailAssets/arrow.png')}
                    onPress={() => setDueTypeModal(true)}
                    marginTop={10}
                  />
                </View>

             
                <View style={{ flexDirection: 'row' }}>
                  <ModalStatus
                    txt="Priority"
                    width="40%"
                    status={priority}
                    widthStatus="82%"
                    source={require('../../asserts/taskDetailAssets/arrow.png')}
                    onPress={() => setPriorityModal(true)}
                    marginTop={10}
                  />
                  <ModalStatus
                    txt="Attachments"
                    width="57%"
                    status={attachmentName}
                    onPress={() => downloadFile()}
                    widthStatus="85%"
                    marginLeft={10}
                    source={require('../../asserts/taskDetailAssets/attach.png')}
                    marginTop={10}
                  />
                </View>

               
                <View >
                  <NonEditAble
                    txt="Client"
                    width='100%'
                    value={clientName} />
                  <NonEditAble
                    txt="Organization"
                    width='100%'
                    value={organizationName}
                    />
                </View>

                <SmallInput
                  txt="Summary"
                  // placeholder="Summary"
                  value={summary}
                  onChangeText={(txt) => setSummary(txt)}
                  width='100%'
                />
                <TouchableOpacity style={styles.saveBtn} onPress={() => saveButton()}>
                  <Text style={styles.saveBtnTxt} >Save</Text>
                </TouchableOpacity>

              </View>
            </View> */}

            <View>
              {/* Button Task Detail*/}
              <View style={styles.taskStatusContianer}>
                <Text style={styles.txtTaskDetailStyle}>Task Details</Text>
              </View>


              {/* Task Name Conatianer */}
              {/* <View style={{ marginTop: "1%", width: "90%", flexDirection:"row",alignSelf: "center",  }}>
             
                <Text style={[styles.descriptionWordStyle,{}]}>Task Name:</Text>
                <Text style={[styles.descriptionTxtStyle, {alignSelf:"center", marginTop:"-1%", paddingLeft:"1%"}]}>{taskName}</Text>
              </View> */}

              <View style={{
                marginTop: '1%',
                width: '90%',
                flexDirection: 'row',
                alignSelf: 'center',
                // flexWrap: 'wrap',
              }}>
                {/* Heading Task Name */}
                <Text style={styles.txtStyle}>Task Name:</Text>
                <Text style={{
                  width: '65%',
                  color: 'black',
                  fontSize: PixelRatio.get() <= 2 ? 14 : 16, // Adjust font size based on pixel density
                  fontWeight: '600',
                  // marginTop: '3%',
                  paddingLeft: '1%'
                }}>{taskName}</Text>
              </View>

              {/* Container For Creater by and Assigned To */}
              <View style={styles.containerStyle}>
                <View style={{ flexDirection: "row" }}>
                  {/* <AntDesign name='user' size={20} color='#000' /> */}
                  <View style={{width:"22%", backgroundColor:"#FB999A", borderRadius:40,justifyContent:"center", alignItems:"center"}}> 
                    <Text style={{ fontSize:14, color:"black", fontWeight:600 }}>{firstTwoChars}</Text>
                 </View>
                 <View style={{paddingLeft:"3%"}}>
                    <Text style={styles.txtStyle}>Created</Text>
                    <Text style={[styles.txtStyle, { color: "black", fontWeight: 500, }]}>{assignedBy}</Text>
                  </View>
                 </View>
                 {/* Assigned To */}
                 <View>
                  <Text style={styles.txtStyle}>Assigned To</Text>
                  <Text style={[styles.txtStyle, { color: "black", fontWeight: 500, }]}>{assignedTo}</Text>
                </View>
              </View>


              {/* Date Container */}
              <View style={[styles.containerStyle,{marginTop:"5%"}]} >
                {/* Start Date Container */}
                <TouchableOpacity >
                  <View style={styles.DateContainer}>
                    <AntDesign name='calendar' size={24} color='#000' style={{ alignSelf: "center" }} />
                    <View style={{paddingLeft:"5%"}}>
                      <Text style={[styles.txtStyle, { paddingLeft: "3%" }]}>Start Date</Text>
                      <Text style={[styles.txtStyle, { color: "black", fontWeight: 500, paddingLeft: 4 }]}>{startDate}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                {/* End Date */}
                <TouchableOpacity >
                  <View style={styles.DateContainer}>
                    <AntDesign name='calendar' size={24} color='#000' style={{ alignSelf: "center" }} />
                    <View style={{paddingLeft:"5%"}} >
                      <Text style={[styles.txtStyle, { paddingLeft: "3%" }]}>End Date</Text>
                      <Text style={[styles.txtStyle, { color: "black", fontWeight: 500, paddingLeft: 4 }]}>{endDate}</Text>
                    </View>
                  </View>
                </TouchableOpacity>

              </View>
              {/* Description Container */}

              {/* <View style={styles.sameContainer}> */}
              <View style={styles.sameContainer}>
                <Text style={styles.txtStyle}>Description:</Text>
                <Text style={[styles.txtStyle, { color: "black", fontWeight: 500, paddingLeft: "4%" }]}> {summary}</Text>
              </View>

              {/* Attachment View */}

              <View style={styles.sameContainer}>
                <Text style={styles.txtStyle}>Attachments:</Text>

                {/* Attachment Button */}
                <TouchableOpacity style={[styles.attachmentBox, { marginLeft: "4%" }]} onPress={() => downloadFile()}>
                  <AntDesign name="plus" size={32} color="black" />
                </TouchableOpacity>
              </View>

              {/* Create this Task */}
              <View style={styles.sameContainer}>
                {/* <Text style={styles.descriptionWordStyle}>{assignedTo} created this task</Text> */}
                <Text style={styles.txtStyle}>{assignedTo} created this task</Text>
              </View>
            </View>

            {/*Message screen Start*/}
            {/* <ScrollView  style={{flex:1}}> */}
            <View style={{ flexDirection: "row", width: "95%", paddingLeft: "5%", justifyContent: "space-between", }}>
              <Text style={{ color: "black", alignSelf: "center", marginTop: 5, fontSize: 16, fontWeight: "700", }}>Conversation </Text>
              {/* <TouchableOpacity style={{ height: "80%", width: "10%", backgroundColor: "#82CED9", marginTop: 5, borderRadius: 5, flexDirection: "row", }} onPress={() => setShowModal(true)}>
                  <MaterialCommunityIcons
                    name={'message-reply-text'}
                    size={30}
                    color="#f5f5f5"
                    style={{ paddingLeft: 3, marginTop: "3%" }}
                  />
                </TouchableOpacity> */}
            </View>

            {/* this code for start the CHART screen here */}
            <View style={[styles.container]}>
              <View>
                {/* Old Code */}
                {/* {recordsData.map((record, index) => (
                            <View key={index} style={[styles.responseAPIStyle,{backgroundColor:"red"}]}>

                                <Text style={[styles.lableStyle, { fontWeight: "800", fontSize: 16, marginBottom: "4%", color: "blue" }]} > {record?.createdBy}</Text>
                                <Text style={styles.lableStyle}>{record?.result}</Text>
                                <View>
                                    <Text style={{ color: "#333", alignSelf: "flex-end" }}>{record.createdTime} </Text>
                                </View>
                            </View>
                        ))} */}
                {/* New code */}
                {recordsData && recordsData.length > 0 ? (
                  recordsData.map((record, index) => (
                    <View key={index} style={styles.responseAPIStyle}>
                      <Text
                        style={[
                          styles.lableStyle,
                          {
                            fontWeight: '800', fontSize: 16, marginBottom: '4%',
                            //  color: 'blue'
                            color: '#002E62'
                          },
                        ]}
                      >
                        {record?.createdBy}
                      </Text>
                      <Text style={styles.lableStyle}>{record?.result}</Text>
                      <View>
                        <Text style={{ color: '#333', alignSelf: 'flex-end' }}>
                          {record.createdTime}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  // <View style={styles.noDataContainer}>
                  <View style={styles.responseAPIStyle}>
                    <Text style={[styles.noDataText,{alignSelf:"center"}]}>No conversation here</Text>
                  </View>
                )}
              </View>

              {/* <View style={{ marginTop: recordsData.length > 0 ? "48%" : "128%", }}> */}
              <View>

                <ScrollView style={[styles.messagesContainer, {}]} ref={scrollViewRef} contentContainerStyle={{ padding: 20 }} >
                  {Array.isArray(getmassages) &&
                    getmassages.map((msg, index) => (
                      <View key={index}>
                        <View
                          style={[
                            styles.messageBubble,
                            isSupport ? styles.supportMessage : styles.userMessage,
                          ]}>
                          <View style={{ flexDirection: 'row' }}>
                            <Ionicons
                              name="person-circle-outline"
                              color="#6ed1f5"
                              size={20}
                            />
                            <Text style={styles.username}>{msg?.message?.sender?.name}</Text>
                          </View>
                          {msg.type && msg.type == 'text_msg' && (
                            <View>
                              <Text style={[styles.messageText]}>{msg.message.text_msg}</Text>
                              <View style={{ marginLeft: 'auto', paddingTop: 10 }}>
                                <Text style={styles.messageText1}>
                                  {formatDateTime(msg.message.created_at)}
                                </Text>
                              </View>
                              {
                                console.log(msg, "ksm")
                              }
                            </View>
                          )}
                          {msg.type && msg.type == 'audio' && (
                            <View>
                              {console.log(AudioPlayer, 'AudioPlayer')}
                              <AudioPlayer uri={`${baseURL}/api/storage/${msg.message.voice_msg_path}`} />
                              <View style={{ marginLeft: 'auto', paddingTop: 10 }}>
                                <Text style={styles.messageText1}>
                                  {formatDateTime(msg.message.created_at)}

                                </Text>
                              </View>
                            </View>
                          )}
                          {msg.type && msg.type == 'image' && (
                            <View>
                              <Showimage uri={`${baseURL}/api/storage/${msg.message.attachment_path}`} />
                              <View style={{ marginLeft: 'auto', paddingTop: 10 }}>
                                <Text style={styles.messageText1}>
                                  {formatDateTime(msg.message.created_at)}

                                </Text>
                              </View>
                            </View>
                          )}
                        </View>
                      </View>
                    ))}
                  <View style={{ height: 20, }}></View>
                </ScrollView>
              </View>
            </View>



            {/* </ScrollView> */}


          </ScrollView >



          {/* Message Text View is here */}
          <View style={{
            width: '100%', // Adjust width
            // padding: 10,
            backgroundColor: 'white',
            borderRadius: 10,
            elevation: 10,
            // backgroundColor: "red",
            position: 'absolute',
            bottom: 0,
            alignSelf: "center"
          }}>
            <View style={styles.inputContainer}>
              <View style={styles.form_col_2}>
                {/* {showVoiceView && (
                  <View style={styles.voiceviev_cont}>
                    <View style={styles.voiceview_row}>
                      <View style={styles.voicecol_1}>
                        <Text style={{ textAlign: 'center', color: '#000' }}>
                          {recordTime}
                        </Text>
                      </View>
                      <View style={styles.voicecol_2}>
                        <Animated.Text
                          style={{
                            color: '#000',
                            fontWeight: 'bold',
                            opacity: fadeAnim,
                          }}
                        >
                          Recording...
                        </Animated.Text>
                      </View>
                    </View>
                  </View>
                )} */}
                {/* <TouchableOpacity
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      paddingLeft: 10,
                    }}
                    onPress={pickImage}
                  >
                    <Entypo name="attachment" size={20} color={'#568086'} />
                  </TouchableOpacity> */}
                <TextInput
                  placeholder="Send Message"
                  placeholderTextColor={'#000'}
                  style={styles.text_input_2}
                  onChangeText={(text) => setMessage(text)}
                  value={message}
                />
                {/* <TouchableOpacity onPress={takePhoto}>
                    <View
                      style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 44,
                        right: '15%',
                      }}
                    >
                      <FontAwesome name={'camera'} size={20} color={'#a0a0a0'} />
                    </View>
                  </TouchableOpacity> */}
              </View>
              {/* {message && message.length > 0 && ( */}
              <View style={styles.sendButton}>
                <TouchableOpacity style={styles.sendButtonText} onPress={() => {
                  if (!message.trim()) {
                    alert("Please enter a message before sending.");
                    return;
                  }
                  passdata1();
                }}


                >
                  <MaterialCommunityIcons name={'send'} size={20} color={'#fff'} />
                </TouchableOpacity>
              </View>
              {/* )} */}
              {/* {!showVoiceView && message.length === 0 && (
                <TouchableWithoutFeedback
                  onPress={() => setShowVoiceView(true)}
                  style={styles.sendButton}
                >
                  <View style={styles.sendButton}>
                    <FontAwesome name={'microphone'} size={20} color={'#fff'} />
                   
                  </View>
                </TouchableWithoutFeedback>
              )}
              {showVoiceView && (
                <View style={{ marginLeft: 10 }}>
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={() => {
                      setShowVoiceView(false);
                      onStopRecord();
                    }}
                  >
                    <FontAwesome name={'send'} size={20} color={'#fff'} />
                  </TouchableOpacity>
                </View>
              )} */}
              {/* Close Modal Button */}
              {/* <TouchableOpacity
                            style={styles.closeModalButton}
                            onPress={() => setShowModal(false)}
                        >
                            <Text style={styles.closeModalText}>Close</Text>
                        </TouchableOpacity> */}
            </View>
          </View>


          </View>
        </>
      )
      }
    </>
  )
}

export default RequestDetails

const styles = StyleSheet.create({
  headerContainer: { flexDirection: "row", justifyContent: "flex-end", alignSelf: "center" },
  innerHeaderContainerStyle: { flexDirection: "row", width: "95%", alignSelf: "center", justifyContent: "space-between", alignItems: "center", marginTop: "10%" },
  BackHandlerStyle: {
    backgroundColor: "#fff",
    width: "10%",
    aspectRatio: 1,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10
  },
  statusContainer: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 10
  },
  taskStatusContianer: {
    marginTop: "8%",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    paddingLeft: "5%"
  },
  txtTaskDetailStyle: {
    padding: 14,
    backgroundColor: "#002E62",
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 500,
    elevation: 10,
    color: "#fff"
  },
  sameContainer: { marginTop: "5%", width: "95%", alignSelf: "center" },
  txtStyle: { paddingLeft: '1%', color: "gray", fontSize: 16 },
  containerStyle: { width: "95%", marginTop: "2%", alignSelf: "center", flexDirection: "row", justifyContent: 'space-between' },
  DateContainer: {
    flexDirection: "row",
    // backgroundColor: "#ededed",
    backgroundColor: "#FAFAFA",
    padding: 1,
    borderRadius: 30,
    paddingHorizontal: 10,
    elevation: 10,
  },
  descriptionTxtStyle: { width: "95%", alignSelf: "center", color: "black", fontSize: 14, },
  descriptionWordStyle: { width: "95%", color: "black", fontSize: 16, fontWeight: 600, },
  attchmentcontainer: {
    width: "95%",
    alignSelf: "center"
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  attachmentBox: {
    width: 100,
    height: 90,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'black',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: "3%",
    // width:"90%",
    // alignSelf:"center"
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form_col_2: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    width: '80%',
    borderRadius: 100,
    backgroundColor: '#fff',
    position: 'relative',
  },
  voiceviev_cont: {
    position: 'absolute',
    backgroundColor: '#fefefe',
    width: '100%',
    zIndex: 2,
    height: 55,
    borderRadius: 100,
  },
  voiceview_row: {
    flexDirection: 'row',
  },
  voicecol_1: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '20%',
    height: 55,
  },
  voicecol_2: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%',
    height: 55,
  },
  sendButton: {
    // backgroundColor: '#00A978',
    // backgroundColor: '#568086',
    backgroundColor: '#00B0F0',
    borderRadius: 100,
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  sendButtonText: {
    color: 'white',
  },
  container: {
    // flex: 1,
    // backgroundColor: '#f5f5f5',
    // backgroundColor: '#E6E6E6',
    padding: 10,
    width: "100%",
    alignSelf: "center",
    // borderRadius: 20,
    // backgroundColor:"red"

  },
  responseAPIStyle: {
    marginBottom: 16,
    padding: 12,
    // backgroundColor: "#fff",
    backgroundColor: "#F7F7F7",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  lableStyle: {
    fontWeight: "600",
    fontSize: 12,
    color: "#333",
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  noDataText: {
    fontSize: 20,
    color: 'black',
    fontStyle: 'italic',
    fontWeight: "bold"
  },

  text_input_2: {
    width: deviceWidth / 6,
    flex: 1,
    color: '#000',
    // paddingLeft: 10
  },
  username: {
    color: '#6ed1f5',
    fontWeight: '500',
    fontSize: 16,
  },
  messagesContainer: {
    // flex: 2,
    // padding: 5,
    // backgroundColor:"yellow"
  },















  // formCon: {
  //   width: '94%'
  // },
  // blurView: {
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   flex: 1,
  //   backgroundColor: 'rgba(0,0,0,0.5)'
  // },
  // modal: {
  //   width: '90%',
  //   backgroundColor: '#00B0F0',
  //   borderRadius: 20,
  //   alignItems: 'center'
  // },
  // closeBtn: {
  //   backgroundColor: 'white',
  //   height: '10%',
  //   width: '40%',
  //   marginTop: 20,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   borderRadius: 20
  // },
  // close: {
  //   color: '#00B0F0',
  //   fontSize: 16,
  //   fontFamily: 'K2D-Regular'
  // },

  modalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1
  },
  modalView: {
    // backgroundColor: '#00B0F0',
    backgroundColor: '#002E62',
    height: '50%',
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15
  },
  modalViewDue: {
    backgroundColor: '#00B0F0',
    height: '40%',
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15
  },
  modalViewPrior: {
    backgroundColor: '#00B0F0',
    height: '55%',
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15
  },
  modalViewAssigned: {
    backgroundColor: '#00B0F0',
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
    color: '#00B0F0',
    fontSize: 20,
    fontFamily: 'K2D-Regular'
  },
  // item: {
  //   alignItems: 'center',
  //   justifyContent: 'center'
  // },
  // title: {
  //   fontSize: 24,
  //   color: 'white',
  //   fontFamily: 'K2D-Regular'
  // },
  // saveBtn: {
  //   backgroundColor: '#00B0F0',
  //   height: height / 20,
  //   width: width / 2,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   marginVertical: '3%',
  //   borderRadius: 10,
  //   alignSelf: 'center'
  // },
  // saveBtnTxt: {
  //   fontSize: 16,
  //   color: 'white',
  //   fontFamily: 'K2D-Regular'
  // }
})