import { Image, StyleSheet, Text, TextInput, View, TouchableOpacity, ActivityIndicator, FlatList, Modal, TouchableWithoutFeedback, Dimensions, Alert, ToastAndroid, KeyboardAvoidingView, ScrollView, Keyboard } from 'react-native'
import React, { useEffect, useState } from 'react'
import ChatHeader from '../../components/ChatScreenComponents/ChatHeader'
import AsyncStorage from '@react-native-async-storage/async-storage'
import CustomHeader from '../../components/CustomHeader'
import axios from 'axios'
import { Picker } from '@react-native-picker/picker';



const { height, width } = Dimensions.get('window');

const ChatScreen = ({ navigation, route }) => {
  const { taskNo, request_id } = route.params;
  console.log(request_id, 'request_id')

  const [isLoading, setIsLoading] = useState(false)
  const [SMS, setSMS] = useState([])
  const [loginUser, setLoginUser] = useState('')
  const [pickerData, setPickerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedResponseText, setSelectedResponseText] = useState('');
  const [error, setError] = useState('');
  const [inputText, setInputText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [text, setText] = useState('');


  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  console.log(SMS, 'MessageShowInScreen')
  //  Modal Data POST_API
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
        return isoDate.split(".")[0] + "Z"; // Removes milliseconds and adds 'Z'
      };
      console.log(formatDate,'formatDateTime')
      if (!text.trim() === '' || !inputText.trim() === '') {
        Alert.alert("Empty Input", "TextInput cannot be empty"); // Show alert
        return;
      }
      setText('');
      setInputText('')

      const payload = {
        id: taskNo,
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
        IsActive: "true",
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
          id: taskNo,
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
        Result:inputText,
      };
      console.log(payload, "InfinityPOSTPayloadData");
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
    } catch (error) {
      console.error(error, "Error in passdata1:");
    } finally {
      // setSelectedResponseText("");
      setInputText("")
      // ChatScreenShowDataGETAPI();
      setIsLoading(false);
    }
  };

  // GET API Call in 
  const fetchModalData = async () => {
    setLoading(true);
    try {
      const protocol = await AsyncStorage.getItem('protocol');
      const host = await AsyncStorage.getItem('host');
      const port = await AsyncStorage.getItem('port');
      const token = await AsyncStorage.getItem('token');

      if (!protocol || !host || !port || !token) {
        console.error('❌ Missing values from AsyncStorage');
        setLoading(false);
        return;
      }

      const url = `${protocol}://${host}:${port}/api/v1/models/R_StandardResponse`;
      // console.log('🌍 API URL:', url);

      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      // console.log('✅ API Response:', response?.data?.records);

      // Ensure response is an array
      if (Array.isArray(response?.data?.records)) {
        // ✅ Map API response to correct structure
        const formattedData = response?.data?.records.map((item) => ({
          id: item.id,
          Name: item.Name,
          ResponseText: item.ResponseText,
        }));

        setPickerData(formattedData);
      } else {
        console.error('❌ Expected an array but got:', typeof response.data);
      }
    } catch (error) {
      console.error('⚠️ API Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAPIData = async (protocol, host, port, userId, token) => {
    try {
      // const url = `${protocol}://${host}:${port}/api/v1/models/R_RequestUpdate?$filter=R_Request_ID eq 1000019`;
      const url = `${protocol}://${host}:${port}/api/v1/models/R_RequestUpdate?$filter=R_Request_ID eq ${request_id}`;
      console.log(url, 'ChatSrnDataGET')
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log(response?.data, 'AllMessageShow')
      const json = await response.json();

      setSMS(json.records)
      setIsLoading(false)
    } catch (error) {
      console.error(error);
      setIsLoading(false)
    }


  }

  const navigateBack = async () => {
    setIsLoading(true)
    const unsubscribe = navigation.addListener('focus', async () => {
      const protocol = await AsyncStorage.getItem('protocol')
      const host = await AsyncStorage.getItem('host')
      const port = await AsyncStorage.getItem('port')
      const userId = await AsyncStorage.getItem('userId')
      setLoginUser(userId)
      const token = await AsyncStorage.getItem('token')
      getAPIData(protocol, host, port, userId, token)
    });
    return unsubscribe
  }

  useEffect(() => {
    if (selectedResponse?.ResponseText) {
      setInputText(selectedResponse.ResponseText); // Set initial value
    }
  }, [selectedResponse]);

  useEffect(() => {
    fetchModalData();
  }, [])

  useEffect(() => {
    console.log("Updated Picker Data:", pickerData);
  }, [pickerData]);

  useEffect(() => {
    navigateBack()
  }, [navigation])


  // const renderItem = ({ item }) => {
  //   const textColor = item.CreatedBy.id == loginUser ? '#800000' : 'black';
  //   const resultColor = item.CreatedBy.id == loginUser ? '#800000' : 'black';
  //   const content = item.CreatedBy.id == loginUser ? 'flex-end' : null;
  //   const marName = item.CreatedBy.id == loginUser ? '0.5%' : null;
  //   const marForResultMessage = item.CreatedBy.id == loginUser ? '60%' : null;
  //   // const borderBottomLeftRadius = item.CreatedBy.id == loginUser ? 15 : null
  //   // const borderTopRightRadius = item.CreatedBy.id == loginUser ? 15 : null
  //   // const borderTopLeftRadius = item.CreatedBy.id == loginUser ? 15 : null
  //   const currentDateTime = new Date().toLocaleString();
  //   return (
  //     <View style={[styles.itemContainer, { alignItems: content ,marginBottom:"2%" }]}>
  //       <Text style={[styles.lableStyle, { color: textColor, marginRight: marName }, { fontWeight: '800', fontSize: 16,   }]}>
  //         {item.CreatedBy.identifier}
  //       </Text>
  //       <View style={[styles.messageCon,
  //       {
  //         // borderColor: textColor,
  //         // borderBottomLeftRadius: borderBottomLeftRadius,
  //         // borderTopLeftRadius: borderTopLeftRadius,
  //         // borderTopRightRadius: borderTopLeftRadius
  //       }]}>
  //         <Text style={ { color: resultColor,marginLeft: marForResultMessage  }}>
  //           {item.Result}
  //         </Text>
  //         <Text style={{ color: '#808080', fontSize: 12, marginLeft: marForResultMessage, }}>
  //           {currentDateTime}
  //         </Text>
          
  //       </View>
  //     </View>
  //   );
  // };

  const formatDateTime = dateTimeString => {
    console.log('Original Date String:', dateTimeString);
    const deviceWidth = Dimensions.get('window').width;
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
    };
    return new Date(dateTimeString).toLocaleString('en-US', options);
};

  const renderItem = ({ item }) => {
    const isSender = item.CreatedBy.id == loginUser;
    const textColor = isSender ? '#800000' : 'black';
    const bgColor = isSender ? '#FFE5E5' : '#F0F0F0'; // Different background for sender & receiver
    const alignMessage = isSender ? 'flex-end' : 'flex-start';
    const alignText = isSender ? 'right' : 'left';

    const currentDateTime = new Date().toLocaleString();

    return (
      <View style={[styles.itemContainer, { alignItems: alignMessage }]}>
        <Text style={[styles.lableStyle, { color: textColor }]}>
          {item.CreatedBy.identifier}
        </Text>  

        <View style={[styles.messageCon, { backgroundColor: bgColor, alignSelf: alignMessage }]}>
          <Text style={{ color: textColor, textAlign: alignText }}>
            {item.Result}
          </Text>
          <Text style={{ color: '#808080', fontSize: 12, textAlign: alignText }}>
          {formatDateTime(item?.Created)}
          </Text>
        </View>      
      </View> 
    );
};





  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'Android' ? 'padding' : 'height'}
        style={{ flex: 1, }}
      >

        {isLoading && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
            <ActivityIndicator size="large" color="#0050C0" />
          </View>
        )}

        {!isLoading && (
          <View style={{ flex: 1 }} >
            {/* <ChatHeader onPress={() => navigation.goBack()} /> */}
            <CustomHeader title="Chat" MessageNameIcon="new-message" />
            <View style={styles.container}>
              <View style={styles.chatContainer}>
                <FlatList
                  data={SMS}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.id.toString()}
                />
              </View>

              {/* Ye TextInput hai */}
              <View style={styles.txtInpuCon}>
                {/* By-Default message Show */}
                {/* <FlatList
                horizontal
                data={pickerData}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{
                      height: "35%",
                      marginHorizontal: 2,
                      padding: 4,
                      backgroundColor: "gray",
                      borderRadius: 10,
                      marginTop: "5%",
                      borderWidth: 0.5,
                      borderColor: '#fff',
                      // backgroundColor:"red"

                    }}
                    onPress={() => {
                      setSelectedResponse(item);
                      setModalVisible(true);
                    }}
                  >
                    <Text style={{ color: "black" }}>{item.Name}</Text>
                  </TouchableOpacity>
                )}
              /> */}

                <FlatList
                  horizontal
                  data={pickerData}
                  keyExtractor={(item) => item.id.toString()}
                  // keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ flexGrow: 1 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={{
                        height: 30, 
                        marginHorizontal: 2,
                        padding: 4,
                        // backgroundColor: "gray",
                        backgroundColor: "white",
                        borderRadius: 15,
                        marginTop: 5, // 👈 Use fixed margin instead of percentage
                        borderWidth: 0.5,
                        borderColor: "#fff",
                      }}
                      onPress={() => {
                        setSelectedResponse(item);
                        setModalVisible(true);
                      }}
                    >
                      <Text style={{color:"black"}}>{item.Name}</Text>
                    </TouchableOpacity>
                  )}
                />

                <View style={{
                  height: '20%',
                  alignItems: 'center',
                  justifyContent: 'center',

                  // backgroundColor: "red",
                }}>
                  <View style={[styles.input, isKeyboardVisible && {marginTop:"5%"}]}>
                    <TextInput style={styles.txtInput}
                      placeholder='Type Here'
                      placeholderTextColor="black"
                      value={inputText}
                      onChangeText={setInputText}
                    />
                    <TouchableOpacity onPress={() => { passdata1() }}>
                      <Image source={require('../../asserts/ChatAssets/sendBtn.png')} style={styles.sendBtn} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View> 
          </View>
        )}


        <Modal visible={modalVisible} transparent animationType="slide">
          <TouchableWithoutFeedback onPress={() =>
             setModalVisible(false) }>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <TouchableWithoutFeedback>
                <View style={styles.modalView} >
                  <TextInput
                    multiline={true}
                    // textAlignVertical="top"
                    textAlignVertical='auto'
                    style={styles.inputCon}
                    value={inputText}
                    onChangeText={(text) => setInputText(text)}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible(false);
                      passdata1(inputText);
                    }}
                    style={styles.saveBtn}
                  >
                    <Text style={styles.saveBtnTxt}>Send</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </KeyboardAvoidingView>
    </>
  )
}

export default ChatScreen

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1D4167',
    flex: 1,
  },
  chatContainer: {
    backgroundColor: 'white',
    // backgroundColor: 'gray',
    height: '82%',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15
  },
  txtInpuCon: {
    height: '13%',
    // backgroundColor:"red"
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  input: {
    backgroundColor: "#fff",
    width: '85%',
    height: 35,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  sendBtn: {
    height: 22,
    width: 20,
    marginRight: 6
  },
  txtInput: {
    width: '89%',
    borderRadius: 10,
    height: 40,
    color: 'black',
    fontFamily: 'K2D-Regular',
  },
  // itemContainer: {
  //   paddingLeft: 10,
  //   paddingRight: 10,
  //   paddingBottom: 9,
  //   // backgroundColor: '#f5f5f5',
  //   backgroundColor: '#fff',
  //     padding: 10,
  //     width: "92%",
  //     alignSelf: "center",
  //     borderRadius: 20
  // },
  itemContainer: {
    padding: 10,
    width: "92%",
    alignSelf: "center",
    borderRadius: 20,
  },
  itemText: {
    fontSize: 14,
  },
  // messageCon: {
  //   width: '70%',
  //   // borderWidth: 1,
  //   // marginTop: 5,
  //   height: 35,
  //   justifyContent: 'center',
  //   // backgroundColor:"black"
  // },
  messageCon: {
    maxWidth: '70%',  // Max width for message
    minWidth: '30%',  // Min width for small messages
    padding: 8,
    borderRadius: 10,
    marginVertical: 5,
    justifyContent: 'center',
  },
  saveBtn: {
    // backgroundColor: '#00B0F0',
    backgroundColor: '#fff',
    height: height / 20,
    width: width / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: '3%',
    borderRadius: 10,
    alignSelf: 'center',
    borderWidth:1
  },
  saveBtnTxt: {
    fontSize: 16,
    // color: 'white',
    color: '#000',
    fontFamily: 'K2D-Regular'
  },
  modalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1
  },
  modalView: {
    backgroundColor: '#00B0F0',
    height: '45%',
    width: '95%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15
  },
  inputCon: {
    borderColor: '#000',
    // borderColor: '#00B0F0',
    borderWidth: 1,
    marginTop: 5,
    borderRadius: 10,
    // height: 40,
    justifyContent: 'center',
    textAlign: "center",
    width: "90%",
    backgroundColor: "#FFF",
    height: 120,
    color: "#000"
  },
  
// container: {
//   // flex: 1,
//   backgroundColor: '#f5f5f5',
//   padding: 10,
//   width: "92%",
//   alignSelf: "center",
//   borderRadius: 20
// },
// responseAPIStyle: {
//   marginBottom: 16,
//   padding: 12,
//   backgroundColor: "#fff",
//   borderRadius: 8,
//   shadowColor: "#000",
//   shadowOpacity: 0.1,
//   shadowOffset: { width: 0, height: 2 },
//   shadowRadius: 4,
//   elevation: 2,
// },
lableStyle: {
  fontWeight: "600",
  fontSize: 12,
  color: "#333",
},
// ChatClientStyles: {
//   color: "gray", paddingLeft: '23%',
//   fontSize: 20,
//   color: '#000000',
//   fontWeight: '600',
// },
// noDataContainer: {
//   alignItems: 'center',
//   justifyContent: 'center',
//   marginTop: 20,
// },
// noDataText: {
//   fontSize: 20,
//   color: 'black',
//   fontStyle: 'italic',
//   fontWeight:"bold"
// },

})







//  <View style={[styles.container,{backgroundColor:"red"}]}>
//                     <View>
//                         {/* New code */}
//                         {recordsData && recordsData.length > 0 ? (
//                             recordsData.map((record, index) => (
//                                 <View key={index} style={styles.responseAPIStyle}>
//                                     <Text
//                                         style={[
//                                             styles.lableStyle,
//                                             { fontWeight: '800', fontSize: 16, marginBottom: '4%', color: 'blue' },
//                                         ]}
//                                     >
//                                         {record?.createdBy}
//                                     </Text>
//                                     <Text style={styles.lableStyle}>{record?.result}</Text>
//                                     <View>
//                                         <Text style={{ color: '#333', alignSelf: 'flex-end' }}>
//                                             {record.createdTime}
//                                         </Text>
//                                     </View>
//                                 </View>
//                             ))
//                         ) : (
//                             <View style={styles.noDataContainer}>
//                                 <Text style={styles.noDataText}>No conversation here</Text>
//                             </View>
//                         )}
//                     </View>

                    
//                     <View>

//                         <ScrollView style={styles.messagesContainer} ref={scrollViewRef}>
//                             {Array.isArray(getmassages) &&
//                                 getmassages.map((msg, index) => (
//                                     <View key={index}>
//                                         <View
//                                             style={[
//                                                 styles.messageBubble,
//                                                 isSupport ? styles.supportMessage : styles.userMessage,
//                                             ]}>
//                                             <View style={{ flexDirection: 'row' }}>
//                                                 <Ionicons
//                                                     name="person-circle-outline"
//                                                     color="#6ed1f5"
//                                                     size={20}
//                                                 />
//                                                 <Text style={styles.username}>{msg?.message?.sender?.name}</Text>
//                                             </View>
//                                             {msg.type && msg.type == 'text_msg' && (
//                                                 <View>
//                                                     <Text style={styles.messageText}>{msg.message.text_msg}</Text>
//                                                     <View style={{ marginLeft: 'auto', paddingTop: 10 }}>
//                                                         <Text style={styles.messageText1}>
//                                                             {formatDateTime(msg.message.created_at)}
//                                                         </Text>
//                                                     </View>
//                                                     {
//                                                         console.log(msg, "ksm")
//                                                     }
//                                                 </View>
//                                             )}
//                                             {msg.type && msg.type == 'audio' && (
//                                                 <View>
//                                                     {console.log(AudioPlayer, 'AudioPlayer')}
//                                                     <AudioPlayer uri={`${baseURL}/api/storage/${msg.message.voice_msg_path}`} />
//                                                     <View style={{ marginLeft: 'auto', paddingTop: 10 }}>
//                                                         <Text style={styles.messageText1}>
//                                                             {formatDateTime(msg.message.created_at)}

//                                                         </Text>
//                                                     </View>
//                                                 </View>
//                                             )}
//                                             {msg.type && msg.type == 'image' && (
//                                                 <View>
//                                                     <Showimage uri={`${baseURL}/api/storage/${msg.message.attachment_path}`} />
//                                                     <View style={{ marginLeft: 'auto', paddingTop: 10 }}>
//                                                         <Text style={styles.messageText1}>
//                                                             {formatDateTime(msg.message.created_at)}

//                                                         </Text>
//                                                     </View>
//                                                 </View>
//                                             )}
//                                         </View>
//                                     </View>
//                                 ))}
//                             <View style={{ height: 20 }}></View>
//                         </ScrollView>
//                     </View>
//                 </View> 



// container: {
//   // flex: 1,
//   backgroundColor: '#f5f5f5',
//   padding: 10,
//   width: "92%",
//   alignSelf: "center",
//   borderRadius: 20
// },
// responseAPIStyle: {
//   marginBottom: 16,
//   padding: 12,
//   backgroundColor: "#fff",
//   borderRadius: 8,
//   shadowColor: "#000",
//   shadowOpacity: 0.1,
//   shadowOffset: { width: 0, height: 2 },
//   shadowRadius: 4,
//   elevation: 2,
// },
// lableStyle: {
//   fontWeight: "600",
//   fontSize: 12,
//   color: "#333",
// },
// ChatClientStyles: {
//   color: "gray", paddingLeft: '23%',
//   fontSize: 20,
//   color: '#000000',
//   fontWeight: '600',
// },
// noDataContainer: {
//   alignItems: 'center',
//   justifyContent: 'center',
//   marginTop: 20,
// },
// noDataText: {
//   fontSize: 20,
//   color: 'black',
//   fontStyle: 'italic',
//   fontWeight:"bold"
// },