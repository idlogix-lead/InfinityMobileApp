import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
  Alert,
  FlatList,
  BackHandler,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DocumentPicker from 'react-native-document-picker';
import io from 'socket.io-client';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReqHeader from '../../components/ReqHeader';
import {Picker} from '@react-native-picker/picker';

import {useTaskStore} from '../../store/requestStore';
import {
  useTaskUpdates,
  useStandardResponses,
  useSendTaskMessage,
  useUpdateTask,
  useTaskById,
  useBPartner,
  useUsers,
  useProjects,
  useAssets,
  useCampaigns,
  useRMA,
  useReqStatus,
} from '../../hooks/useRequests';
import Create from './Create';
import moment from 'moment';

const TaskDetail = ({route}) => {
  // const {task} = route.params;
  const navigation = useNavigation();

  // ZUSTAND STORE STATES

  const task = useTaskStore(state => state.selectedTask);
  const setTask = useTaskStore(state => state.setSelectedTask);

  const updates = useTaskStore(state => state.updates);
  const setUpdates = useTaskStore(state => state.setUpdates);
  const addUpdate = useTaskStore(state => state.addUpdate);
  const selectedActivity = useTaskStore(state => state.selectedActivity);
  const setSelectedActivity = useTaskStore(state => state.setSelectedActivity);
  const standardResponses = useTaskStore(state => state.standardResponses);
  const setStandardResponses = useTaskStore(
    state => state.setStandardResponses,
  );

  // LOCAL STATES
  const [localReaction, setLocalReaction] = useState({});
  const [bottomReactionFor, setBottomReactionFor] = useState(null);

  const [showActivity, setShowActivity] = useState(true);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [message, setMessage] = useState('');
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [subtaskName, setSubtaskName] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [subtasks, setSubtasks] = useState([
    {id: 1, title: 'Call customer for clarification', done: false},
    {id: 2, title: 'Prepare quotation', done: true},
  ]);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [reactionPickerFor, setReactionPickerFor] = useState(null);
  const [showReferences, setShowReferences] = useState(false);
  // const [showHistory, setShowHistory] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);

  // values: null | 'campaign' | 'asset' GLOBAL DROPDOWN CONTROL
  const [openDropdown, setOpenDropdown] = useState(null);

  // ---------------- BUSINESS PARTNER SEARCHABLE ----------------
  const [bpSearch, setBpSearch] = useState(''); // typed text
  const [filteredBPs, setFilteredBPs] = useState([]);

  // ---------------- User SEARCHABLE ----------------

  const [filteredUsers, setFilteredUsers] = useState([]);

  // ---------------- PROJECTS SEARCHABLE ----------------

  const [filteredProjects, setFilteredProjects] = useState([]);

  // ---------------- Assets SEARCHABLE ----------------

  const [filteredAssets, setFilteredAssets] = useState([]);

  // ---------------- Campaigns SEARCHABLE ----------------
  const [campaignsDropdownVisible, setCampaignsDropdownVisible] =
    useState(false);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);

  // ---------------- RMA SEARCHABLE ----------------
  const [filteredRMA, setFilteredRMA] = useState([]);

  // -------------------- API HOOKS --------------------
  const {data: fetchedTask, refetch: refetchTask} = useTaskById(
    route.params.task.id,
  );

  const {data: fetchedUpdates} = useTaskUpdates(task?.id);
  const {data: fetchedResponses} = useStandardResponses();
  const {data: bpartner} = useBPartner();
  const {data: users} = useUsers();
  const {data: projects} = useProjects();
  const {data: reqStatus} = useReqStatus();

  const {data: assets} = useAssets();
  const {data: campaigns} = useCampaigns();
  const {data: rma} = useRMA();

  const {mutateAsync: sendTaskMessageApi} = useSendTaskMessage();
  const {mutateAsync: updateTask} = useUpdateTask();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (openDropdown) {
          setOpenDropdown(null);
          return true; // block screen back
        }
        return false;
      },
    );

    return () => backHandler.remove();
  }, [openDropdown]);

  // -------------------- SOCKET --------------------
  useEffect(() => {
    const initSocket = async () => {
      const protocol = await AsyncStorage.getItem('protocol');
      const host = await AsyncStorage.getItem('host');
      const port = await AsyncStorage.getItem('port');

      socketRef.current = io(`${protocol}://${host}:${port}`, {
        transports: ['websocket'],
      });

      socketRef.current.on('connect', () => {
        socketRef.current.emit('joinTask', {taskId: task.id});
      });

      socketRef.current.on('taskUpdate', update => {
        addUpdate(update);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({animated: true});
        }, 100);
      });
    };

    initSocket();

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // -------------------- MESSAGES --------------------
  const sendMessage = async () => {
    if (!message.trim()) return;

    const tempMessage = {
      id: Date.now(),
      Result: message,
      Created: new Date().toISOString(),
      CreatedBy: {identifier: 'You'},
    };

    // 🔹 Optimistic UI (instant)
    addUpdate(tempMessage);
    setMessage('');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({animated: true});
    }, 100);

    try {
      await sendTaskMessageApi({
        taskId: task.id,
        message: tempMessage.Result,
      });

      socketRef.current?.emit('refreshTask', {taskId: task.id});
    } catch (e) {
      Alert.alert('Error', 'Message not sent');
    }
  };

  const toggleSubtask = id => {
    setSubtasks(prev =>
      prev.map(item => (item.id === id ? {...item, done: !item.done} : item)),
    );
  };

  const openFileManager = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      const file = res[0];
      const newAttachment = {
        id: Date.now(),
        name: file.name,
        uri: file.uri,
        type: file.type,
        size: file.size,
      };
      setAttachments(prev => [...prev, newAttachment]);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) console.log('Picker error:', err);
    }
  };

  const getAvatarColor = (identifier, uniqueId) => {
    const colors = [
      '#3498DB',
      '#E67E22',
      '#2ECC71',
      '#9B59B6',
      '#F39C12',
      '#1ABC9C',
      '#FF6B6B',
      '#6C5B7B',
      '#355C7D',
    ];
    if (!identifier) return '#ccc';
    const str = identifier + (uniqueId || '');
    let hash = 0;
    for (let i = 0; i < str.length; i++)
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const ReferenceField = ({label, value}) => (
    <View style={styles.referenceContainer}>
      <Text style={styles.referenceLabel}>{label}</Text>
      <View style={styles.referenceValueBox}>
        <Text style={styles.referenceValueText}>{value ?? '—'}</Text>
      </View>
    </View>
  );

  const handleReaction = (updateId, emoji) => {
    setLocalReaction(prev => ({
      ...prev,
      [updateId]: emoji, // one reaction per message
    }));
    setReactionPickerFor(null);
  };

  useEffect(() => {
    setUpdates([]); // 💥 reset old comments
  }, [task?.id]);
  const safeUpdates = updates.filter(
    u => u?.R_Request_ID?.id === task?.id || u?.taskId === task?.id,
  );

  // ✅ SAFE INITIAL STATE (FIXED)
  const [editableTask, setEditableTask] = useState({
    Summary: '',
    Priority: '',
    Created: '',
    CreatedBy: '',
    Updated: '',
    UpdatedBy: '',
    StartDate: null,
    StartTime: null,
    EndTime: null,
    CloseDate: null,
    LastResult: '',
    Organization: '',
    Client: '',
    BussinessPartner: null,
    BussinessPartnerName: '',
    UserContact: '',
    Project: '',
    Asset: '',
    Order: '',
    InvoiceID: '',
    Product: '',
    Payment: '',
    ShipmentReceipt: '',
    RMA: '',
    Campaign: '',
    DateLastAction: null,
    LastAlert: '',
    ChangeRequest: '',
    RequestInvoice: '',
    RequestAmt: '',
    Status: '',
  });

  // -------------------- SYNC FETCHED TASK --------------------

  useEffect(() => {
    // Sync fetched task
    if (fetchedTask) {
      setTask(fetchedTask);

      setEditableTask({
        Summary: fetchedTask.Summary || '',
        Created: fetchedTask.Created || '',
        CreatedBy: fetchedTask.CreatedBy?.identifier || 'N/A',
        Updated: fetchedTask.Updated || '',
        UpdatedBy: fetchedTask.UpdatedBy?.identifier || 'N/A',
        DateLastAction: fetchedTask.DateLastAction || null,
        LastAlert: fetchedTask.LastAlert || '',
        RequestInvoice: fetchedTask.RequestInvoice || '',
        ChangeRequest: fetchedTask.ChangeRequest || '',
        Priority: fetchedTask.Priority || '',
        StartDate: fetchedTask.StartDate || null,
        StartTime: fetchedTask.StartTime || null,
        EndTime: fetchedTask.EndTime || null,
        CloseDate: fetchedTask.CloseDate || null,
        LastResult: fetchedTask.LastResult || '',
        Organization: fetchedTask.AD_Org_ID?.identifier || 'N/A',
        Client: fetchedTask.AD_Client_ID?.identifier || 'N/A',
        // BussinessPartner: fetchedTask.C_BPartner_ID?.identifier || 'N/A',
        BussinessPartner: fetchedTask.C_BPartner_ID?.id || null,
        BussinessPartnerName: fetchedTask.C_BPartner_ID?.identifier || '',

        UserContact: fetchedTask.AD_User_ID?.identifier || 'N/A',
        Project: fetchedTask.C_Project_ID?.identifier || 'N/A',
        Asset: fetchedTask.A_Asset_ID?.identifier || 'N/A',
        Order: fetchedTask.C_Order_ID?.identifier || 'N/A',
        InvoiceID: fetchedTask.C_Invoice_ID?.identifier || 'N/A',
        Product: fetchedTask.M_Product_ID?.identifier || 'N/A',
        Payment: fetchedTask.C_Payment_ID?.identifier || 'N/A',
        ShipmentReceipt: fetchedTask.M_InOut_ID?.identifier || 'N/A',
        RMA: fetchedTask.M_RMA_ID?.identifier || 'N/A',
        Campaign: fetchedTask.C_Campaign_ID?.identifier || 'N/A',
        RequestAmt: fetchedTask.RequestAmt || '',
        Status: fetchedTask.R_Status_ID?.identifier || '',
      });
    }

    // Sync fetched updates
    if (fetchedUpdates) setUpdates(fetchedUpdates);

    // Sync fetched standard responses
    if (fetchedResponses) setStandardResponses(fetchedResponses);

    // Sync business partner info if needed
    if (bpartner) {
      setEditableTask(prev => ({
        ...prev,
        BussinessPartner: bpartner?.identifier || prev.BussinessPartner,
      }));
    }
  }, [fetchedTask, fetchedUpdates, fetchedResponses, bpartner]);

  // Sync filter whenever user types or bpartner list changes
  // useEffect(() => {
  //   if (!bpartner) return;

  //   const text = bpSearch.trim().toLowerCase();

  //   if (!text) {
  //     setFilteredBPs(bpartner);
  //     return;
  //   }

  //   const startsWithMatches = [];
  //   const includesMatches = [];

  //   bpartner.forEach(bp => {
  //     const name = (bp.identifier || '').toLowerCase();

  //     if (name.startsWith(text)) {
  //       startsWithMatches.push(bp);
  //     } else if (name.includes(text)) {
  //       includesMatches.push(bp);
  //     }
  //   });

  //   // 🔥 START matches first, phir includes
  //   setFilteredBPs([...startsWithMatches, ...includesMatches]);
  // }, [bpSearch, bpartner]);

  // Set initial selected BP
  // useEffect(() => {
  //   if (bpartner && editableTask.BussinessPartner) {
  //     const selectedBP = bpartner.find(
  //       bp => bp.id === editableTask.BussinessPartner,
  //     );
  //     if (selectedBP) setBpSearch(selectedBP.identifier);
  //   }
  // }, [bpartner, editableTask.BussinessPartner]);
  useEffect(() => {
    if (!bpartner || !editableTask.BussinessPartner) return;

    const selectedBP = bpartner.find(
      bp => bp.id === editableTask.BussinessPartner,
    );

    if (selectedBP) {
      setBpSearch(selectedBP.identifier);
    }
  }, [bpartner, editableTask.BussinessPartner]);

  // -------------------- AUTO SAVE TASK --------------------
  const autoSaveTask = async () => {
    // check what changed
    const isSameLastResult = editableTask.LastResult === task.LastResult;
    const isSameSummary = editableTask.Summary === task.Summary;
    const isSameCloseDate =
      (!editableTask.CloseDate && !task.CloseDate) ||
      editableTask.CloseDate === task.CloseDate;
    const isSameEndTime =
      (!editableTask.EndTime && !task.EndTime) ||
      editableTask.EndTime === task.EndTime;
    const isSameRequestAmt = editableTask.RequestAmt === task.RequestAmt;

    // nothing changed
    if (
      isSameLastResult &&
      isSameSummary &&
      isSameCloseDate &&
      isSameEndTime &&
      isSameRequestAmt
    )
      return;

    try {
      // always include CloseDate, even if null
      const payload = {
        LastResult: editableTask.LastResult,
        Summary: editableTask.Summary,
        CloseDate: editableTask.CloseDate || null,
        EndTime: moment(editableTask.EndTime).format(
          'YYYY-MM-DD[T]HH:mm:ss[Z]',
        ),

        RequestAmt: editableTask.RequestAmt || null,
      };

      await updateTask({taskId: task.id, payload});

      // update local store for instant UI
      setTask(prev => ({
        ...prev,
        LastResult: editableTask.LastResult,
        Summary: editableTask.Summary,
        CloseDate: editableTask.CloseDate || null,
      }));

      refetchTask(); // sync with backend
    } catch (err) {
      console.log('AutoSave Error:', err);
      Alert.alert('Error', 'Auto save failed');
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => setOpenDropdown(null)}
      accessible={false}>
      <View style={{flex: 1}}>
        {/* <ReqHeader title="Task Details" /> */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="chevron-left" size={30} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task Details</Text>
          <TouchableOpacity onPress={() => setHistoryModalVisible(true)}>
            <MaterialIcons name="settings" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{paddingBottom: 120}}
          // keyboardShouldPersistTaps="handled"
          keyboardShouldPersistTaps="always">
          <View style={styles.descRow}>
            <TextInput
              value={editableTask.Summary}
              onChangeText={text =>
                setEditableTask(prev => ({...prev, Summary: text}))
              }
              onBlur={autoSaveTask}
              placeholder="Summary here"
              multiline
              style={[
                styles.inlineAutoInput,
                {fontFamily: 'K2D-Bold', fontSize: 18},
              ]}
            />
          </View>
          <View style={[styles.divider, {backgroundColor: '#ccc'}]} />

          {/* CREATOR & DUE */}
          <View style={styles.betweenRow}>
            <View>
              <View style={[styles.iconLabelRow, {}]}>
                <View style={styles.iconWrapper}>
                  <MaterialIcons name="person" size={16} color="#000" />
                </View>
                <View>
                  <Text style={styles.label}> Created By</Text>
                  <Text style={[styles.value, {bottom: 5}]}>
                    {editableTask.CreatedBy}
                  </Text>
                </View>
              </View>
            </View>
            <View>
              <View style={styles.iconLabelRow}>
                <View style={styles.iconWrapper}>
                  <MaterialIcons name="event" size={16} color="#000" />
                </View>
                <View>
                  <Text style={styles.label}> Due Date</Text>
                  <TouchableOpacity onPress={() => setShowDueDatePicker(true)}>
                    <Text style={[styles.value, {bottom: 5}]}>
                      {editableTask.EndTime
                        ? new Date(editableTask.EndTime).toLocaleDateString(
                            'en-GB',
                            {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            },
                          )
                        : '—'}
                    </Text>

                    {showDueDatePicker && (
                      <DateTimePicker
                        value={
                          editableTask.EndTime
                            ? new Date(editableTask.EndTime)
                            : new Date()
                        }
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={async (event, selectedDate) => {
                          setShowDueDatePicker(false);
                          if (!selectedDate) return;

                          const isoDate = selectedDate.toISOString();

                          // 1️⃣ Update local UI immediately
                          setEditableTask(prev => ({
                            ...prev,
                            EndTime: isoDate,
                          }));

                          // 2️⃣ Auto-save to backend
                          await autoSaveTask();
                        }}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* ORGANIZATION & CLIENT */}
          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: '5%',
              paddingVertical: '3%',
              alignItems: 'center',
            }}>
            <View style={styles.iconLabelRow}>
              <View style={styles.iconWrapper}>
                <MaterialIcons
                  name="corporate-fare"
                  size={16}
                  // color="#3498DB"
                  color={'#000'}
                />
              </View>
              <Text style={styles.value}> Organization: </Text>
            </View>
            <Text style={styles.label}>{editableTask.Organization}</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: '5%',
              alignItems: 'center',
            }}>
            <View style={styles.iconLabelRow}>
              <View style={styles.iconWrapper}>
                <MaterialIcons name="group" size={16} color="#000" />
              </View>
              <Text style={styles.value}> Client: </Text>
            </View>
            <Text style={styles.label}>{editableTask.Client}</Text>
          </View>

          <View style={[styles.divider, {marginVertical: 5}]} />

          {/* DESCRIPTION */}
          <View style={styles.descRow}>
            <Text style={styles.descLabel}>Description</Text>

            <TextInput
              value={editableTask.LastResult}
              onChangeText={text =>
                setEditableTask(prev => ({...prev, LastResult: text}))
              }
              onBlur={autoSaveTask}
              placeholder="Description here"
              multiline
              style={styles.inlineAutoInput}
            />
          </View>
          <View style={[styles.divider, {backgroundColor: '#ccc'}]} />

          {/* REFERENCES */}
          <View style={styles.sectionContainerRef}>
            <TouchableOpacity
              style={styles.sectionHeaderRef}
              onPress={() => setShowReferences(prev => !prev)}>
              <Text style={styles.asanaTitle}>References</Text>
              <MaterialIcons
                name={
                  showReferences ? 'keyboard-arrow-up' : 'keyboard-arrow-down'
                }
                size={24}
                color="#555"
              />
            </TouchableOpacity>
            {showReferences && (
              <View style={styles.sectionBodyRef}>
                {/* BUSINESS PARTNER */}
                <View style={styles.referenceContainer}>
                  <Text style={styles.referenceLabel}>Business Partner</Text>

                  {/* <TextInput
                    value={bpSearch}
                    placeholder={
                      editableTask.BussinessPartner || 'Select Business Partner'
                    }
                    placeholderTextColor="#333"
                    style={styles.bpInput}
                    onFocus={() => {
                      setOpenDropdown('bp'); // ✅ global key
                      setFilteredBPs(bpartner || []);
                    }}
                    onChangeText={text => {
                      setBpSearch(text);
                      setOpenDropdown('bp');

                      const filtered = !text
                        ? bpartner || []
                        : bpartner.filter(bp =>
                            (bp.identifier || '')
                              .toLowerCase()
                              .includes(text.toLowerCase()),
                          );

                      setFilteredBPs(filtered);
                    }}
                  /> */}

                  <TextInput
                    value={bpSearch || ''} // ✅ NEVER undefined
                    placeholder={
                      editableTask.BussinessPartnerName ||
                      'Select Business Partner'
                    }
                    placeholderTextColor="#333"
                    style={styles.bpInput}
                    onFocus={() => {
                      setOpenDropdown('bp');
                      setFilteredBPs(bpartner || []);
                    }}
                    onChangeText={text => {
                      const safeText = text || '';
                      setBpSearch(safeText);
                      setOpenDropdown('bp');

                      const filtered = !safeText
                        ? bpartner || []
                        : bpartner.filter(bp =>
                            (bp.identifier || '')
                              .toLowerCase()
                              .includes(safeText.toLowerCase()),
                          );

                      setFilteredBPs(filtered);
                    }}
                  />

                  {openDropdown === 'bp' && filteredBPs.length > 0 && (
                    <FlatList
                      data={filteredBPs}
                      keyExtractor={item => item.id.toString()}
                      style={styles.bpDropdownFix}
                      nestedScrollEnabled={true}
                      keyboardShouldPersistTaps="handled"
                      renderItem={({item}) => (
                        <TouchableOpacity
                          style={styles.bpDropdownItem}
                          // onPress={async () => {
                          //   // ✅ UI
                          //   setBpSearch(item.identifier);
                          //   setOpenDropdown(null); // ✅ close on select

                          //   setEditableTask(prev => ({
                          //     ...prev,
                          //     BussinessPartner: item.id,
                          //   }));

                          //   try {
                          //     await updateTask({
                          //       taskId: task.id,
                          //       payload: {C_BPartner_ID: item.id},
                          //     });

                          //     setTask(prev => ({
                          //       ...prev,
                          //       C_BPartner_ID: {
                          //         id: item.id,
                          //         identifier: item.identifier,
                          //       },
                          //     }));

                          //     refetchTask();
                          //   } catch (err) {
                          //     Alert.alert(
                          //       'Error',
                          //       'Failed to update Business Partner',
                          //     );
                          //   }
                          // }}
                          onPress={async () => {
                            // ✅ UI FIRST
                            setBpSearch(item.identifier);
                            setOpenDropdown(null);

                            setEditableTask(prev => ({
                              ...prev,
                              BussinessPartner: item.id, // ✅ ID ONLY
                              BussinessPartnerName: item.identifier, // ✅ display
                            }));

                            try {
                              await updateTask({
                                taskId: task.id,
                                payload: {C_BPartner_ID: item.id},
                              });

                              setTask(prev => ({
                                ...prev,
                                C_BPartner_ID: {
                                  id: item.id,
                                  identifier: item.identifier,
                                },
                              }));

                              refetchTask();
                            } catch (err) {
                              Alert.alert(
                                'Error',
                                'Failed to update Business Partner',
                              );
                            }
                          }}>
                          <Text style={styles.bpDropdownItemText}>
                            {item.Name}
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  )}
                </View>

                {/* USER CONTACT */}
                <View style={styles.referenceContainer}>
                  <Text style={styles.referenceLabel}>User Contact</Text>

                  <TextInput
                    value={editableTask.UserContactSearch || ''}
                    placeholder={editableTask.UserContact || 'Select User'}
                    placeholderTextColor="#333"
                    style={styles.bpInput}
                    onFocus={() => {
                      setOpenDropdown('user'); // ✅ global key
                      setFilteredUsers(users || []);
                    }}
                    onChangeText={text => {
                      setEditableTask(prev => ({
                        ...prev,
                        UserContactSearch: text,
                      }));
                      setOpenDropdown('user');

                      const filtered = !text
                        ? users || []
                        : users.filter(user =>
                            (user.Name || '')
                              .toLowerCase()
                              .includes(text.toLowerCase()),
                          );

                      setFilteredUsers(filtered);
                    }}
                  />

                  {openDropdown === 'user' && filteredUsers.length > 0 && (
                    <FlatList
                      data={filteredUsers}
                      keyExtractor={item => item.id.toString()}
                      style={styles.bpDropdown}
                      keyboardShouldPersistTaps="handled"
                      renderItem={({item}) => (
                        <TouchableOpacity
                          style={styles.bpDropdownItem}
                          onPress={async () => {
                            // ✅ UI state
                            setEditableTask(prev => ({
                              ...prev,
                              UserContact: item.Name,
                              UserContactSearch: item.Name,
                            }));

                            setOpenDropdown(null); // ✅ close on select

                            try {
                              await updateTask({
                                taskId: task.id,
                                payload: {AD_User_ID: item.id},
                              });

                              setTask(prev => ({
                                ...prev,
                                AD_User_ID: {
                                  id: item.id,
                                  identifier: item.Name,
                                },
                              }));

                              refetchTask();
                            } catch (err) {
                              Alert.alert(
                                'Error',
                                'Failed to update User Contact',
                              );
                            }
                          }}>
                          <Text style={styles.bpDropdownItemText}>
                            {item.Name}
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  )}
                </View>

                {/* PROJECT */}

                <View style={styles.referenceContainer}>
                  <Text style={styles.referenceLabel}>Project</Text>

                  <TextInput
                    value={editableTask.ProjectSearch || ''}
                    placeholder={editableTask.Project || 'Select Project'}
                    placeholderTextColor="#333"
                    style={styles.bpInput}
                    onFocus={() => {
                      setOpenDropdown('project'); // ✅ global
                      setFilteredProjects(projects || []);
                    }}
                    onChangeText={text => {
                      setEditableTask(prev => ({...prev, ProjectSearch: text}));
                      setOpenDropdown('project');

                      const filtered = !text
                        ? projects || []
                        : projects.filter(p =>
                            `${p.Value}_${p.Name}`
                              .toLowerCase()
                              .includes(text.toLowerCase()),
                          );

                      setFilteredProjects(filtered);
                    }}
                  />

                  {openDropdown === 'project' &&
                    filteredProjects.length > 0 && (
                      <FlatList
                        data={filteredProjects}
                        keyExtractor={item => item.id.toString()}
                        style={styles.bpDropdown}
                        keyboardShouldPersistTaps="handled"
                        renderItem={({item}) => (
                          <TouchableOpacity
                            style={styles.bpDropdownItem}
                            onPress={async () => {
                              const identifier = `${item.Value}_${item.Name}`;

                              // ✅ UI state
                              setEditableTask(prev => ({
                                ...prev,
                                Project: identifier,
                                ProjectSearch: identifier,
                              }));

                              setOpenDropdown(null); // ✅ close on select

                              try {
                                await updateTask({
                                  taskId: task.id,
                                  payload: {C_Project_ID: item.id},
                                });

                                setTask(prev => ({
                                  ...prev,
                                  C_Project_ID: {
                                    id: item.id,
                                    identifier,
                                  },
                                }));

                                refetchTask();
                              } catch (err) {
                                Alert.alert(
                                  'Error',
                                  'Failed to update Project',
                                );
                              }
                            }}>
                            <Text style={styles.bpDropdownItemText}>
                              {item.Name}
                            </Text>
                          </TouchableOpacity>
                        )}
                      />
                    )}
                </View>
                {/* STATUS */}
                <View style={styles.referenceContainer}>
                  <Text style={styles.referenceLabel}>Status</Text>

                  <TextInput
                    value={editableTask.StatusSearch || ''}
                    placeholder={editableTask.Status || 'Select Status'}
                    placeholderTextColor="#333"
                    style={styles.bpInput}
                    onFocus={() => {
                      setOpenDropdown('status');
                    }}
                    onChangeText={text => {
                      setEditableTask(prev => ({
                        ...prev,
                        StatusSearch: text,
                      }));
                      setOpenDropdown('status');
                    }}
                  />

                  {openDropdown === 'status' && reqStatus?.length > 0 && (
                    <FlatList
                      data={reqStatus}
                      keyExtractor={item => item.id.toString()}
                      style={styles.bpDropdown}
                      keyboardShouldPersistTaps="handled"
                      renderItem={({item}) => {
                        const identifier = `${item.SeqNo}_${item.Name}`;

                        return (
                          <TouchableOpacity
                            style={styles.bpDropdownItem}
                            onPress={async () => {
                              // ✅ UI UPDATE
                              setEditableTask(prev => ({
                                ...prev,
                                Status: identifier,
                                StatusSearch: identifier,
                              }));

                              setOpenDropdown(null);

                              try {
                                // ✅ BACKEND UPDATE (only id)
                                await updateTask({
                                  taskId: task.id,
                                  payload: {
                                    R_Status_ID: item.id,
                                  },
                                });

                                // ✅ LOCAL STORE UPDATE (full object)
                                setTask(prev => ({
                                  ...prev,
                                  R_Status_ID: {
                                    propertyLabel: 'Status',
                                    id: item.id,
                                    identifier,
                                    'model-name': 'r_status',
                                  },
                                }));

                                refetchTask();
                              } catch (err) {
                                Alert.alert('Error', 'Failed to update Status');
                              }
                            }}>
                            <Text style={styles.bpDropdownItemText}>
                              {identifier}
                            </Text>
                          </TouchableOpacity>
                        );
                      }}
                    />
                  )}
                </View>

                <ReferenceField label="Asset" value={editableTask.Asset} />
                {/* ASSET */}
                <View style={styles.referenceContainer}>
                  <Text style={styles.referenceLabel}>Asset</Text>

                  <TextInput
                    value={editableTask.AssetSearch || ''}
                    placeholder={editableTask.Asset || 'Select Asset'}
                    placeholderTextColor="#333"
                    style={styles.bpInput}
                    onFocus={() => {
                      setOpenDropdown('asset'); // ✅ global control
                      setFilteredAssets(assets || []);
                    }}
                    onChangeText={text => {
                      setEditableTask(prev => ({...prev, AssetSearch: text}));
                      setOpenDropdown('asset');

                      const filtered = !text
                        ? assets || []
                        : assets.filter(a =>
                            `${a.Value}_${a.Name}`
                              .toLowerCase()
                              .includes(text.toLowerCase()),
                          );

                      setFilteredAssets(filtered);
                    }}
                  />

                  {openDropdown === 'asset' && filteredAssets.length > 0 && (
                    <FlatList
                      data={filteredAssets}
                      keyExtractor={item => item.id.toString()}
                      style={styles.bpDropdown}
                      keyboardShouldPersistTaps="handled"
                      renderItem={({item}) => (
                        <TouchableOpacity
                          style={styles.bpDropdownItem}
                          onPress={async () => {
                            const identifier = `${item.Value}_${item.Name}`;

                            // ✅ UI state
                            setEditableTask(prev => ({
                              ...prev,
                              Asset: identifier,
                              AssetSearch: identifier,
                            }));

                            setOpenDropdown(null); // ✅ close on select

                            try {
                              await updateTask({
                                taskId: task.id,
                                payload: {A_Asset_ID: item.id},
                              });

                              setTask(prev => ({
                                ...prev,
                                A_Asset_ID: {
                                  id: item.id,
                                  identifier,
                                },
                              }));

                              refetchTask();
                            } catch (err) {
                              Alert.alert('Error', 'Failed to update Asset');
                            }
                          }}>
                          <Text style={styles.bpDropdownItemText}>
                            {item.Name}
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  )}
                </View>

                <ReferenceField label="Order" value={editableTask.Order} />
                <ReferenceField
                  label="Invoice"
                  value={editableTask.InvoiceID}
                />
                <ReferenceField label="Product" value={editableTask.Product} />
                <ReferenceField label="Payment" value={editableTask.Payment} />
                <ReferenceField
                  label="Shipment / Receipt"
                  value={editableTask.ShipmentReceipt}
                />
                <ReferenceField label="RMA" value={editableTask.RMA} />
                <View style={styles.referenceContainer}>
                  <Text style={styles.referenceLabel}>RMA</Text>

                  <TextInput
                    value={editableTask.RMASearch || ''}
                    placeholder={editableTask.RMA || 'Select RMA'}
                    placeholderTextColor="#333"
                    style={styles.bpInput}
                    onFocus={() => {
                      setOpenDropdown('rma'); // ✅ global control
                      setFilteredRMA(rma || []);
                    }}
                    onChangeText={text => {
                      setEditableTask(prev => ({...prev, RMASearch: text}));
                      setOpenDropdown('rma');

                      const filtered = !text
                        ? rma || []
                        : rma.filter(a =>
                            `${a.id}_${a.DocumentNo}`
                              .toLowerCase()
                              .includes(text.toLowerCase()),
                          );

                      setFilteredRMA(filtered);
                    }}
                  />

                  {openDropdown === 'rma' && filteredRMA.length > 0 && (
                    <FlatList
                      data={filteredRMA}
                      keyExtractor={item => item.id.toString()}
                      style={styles.bpDropdown}
                      keyboardShouldPersistTaps="handled"
                      renderItem={({item}) => (
                        <TouchableOpacity
                          style={styles.bpDropdownItem}
                          onPress={async () => {
                            const identifier = `${item.id}_${item.DocumentNo}`;

                            // ✅ UI state
                            setEditableTask(prev => ({
                              ...prev,
                              rma: identifier,
                              RMASearch: identifier,
                            }));

                            setOpenDropdown(null); // ✅ close on select

                            try {
                              await updateTask({
                                taskId: task.id,
                                payload: {M_RMA_ID: item.id},
                              });

                              setTask(prev => ({
                                ...prev,
                                M_RMA_ID: {
                                  id: item.id,
                                  identifier,
                                },
                              }));

                              refetchTask();
                            } catch (err) {
                              Alert.alert('Error', 'Failed to update RMA');
                            }
                          }}>
                          <Text style={styles.bpDropdownItemText}>
                            {item.DocumentNo}
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  )}
                </View>

                <View style={styles.referenceContainer}>
                  <Text style={styles.referenceLabel}>Request Amount</Text>

                  <TextInput
                    value={editableTask.RequestAmt?.toString() || ''}
                    onChangeText={text => {
                      // sirf numbers allow
                      const numeric = text.replace(/[^0-9.]/g, '');
                      setEditableTask(prev => ({
                        ...prev,
                        RequestAmt: numeric,
                      }));
                    }}
                    onBlur={autoSaveTask}
                    keyboardType="numeric"
                    placeholder="Enter amount"
                    style={styles.bpInput} // same style reuse
                  />
                </View>

                <View style={styles.referenceContainer}>
                  <Text style={styles.referenceLabel}>Campaign</Text>

                  <TextInput
                    value={editableTask.CampaignSearch || ''}
                    placeholder={editableTask.Campaign || 'Select Campaign'}
                    placeholderTextColor="#333"
                    style={styles.bpInput}
                    onFocus={() => {
                      setOpenDropdown('campaign'); // ✅ only this dropdown
                      setFilteredCampaigns(campaigns || []);
                    }}
                    onChangeText={text => {
                      setEditableTask(prev => ({
                        ...prev,
                        CampaignSearch: text,
                      }));
                      setOpenDropdown('campaign');

                      const filtered = !text
                        ? campaigns || []
                        : campaigns.filter(c =>
                            `${c.Value}_${c.Name}`
                              .toLowerCase()
                              .includes(text.toLowerCase()),
                          );

                      setFilteredCampaigns(filtered);
                    }}
                  />

                  {openDropdown === 'campaign' &&
                    filteredCampaigns.length > 0 && (
                      <FlatList
                        data={filteredCampaigns}
                        keyExtractor={item => item.id.toString()}
                        style={styles.bpDropdown}
                        keyboardShouldPersistTaps="handled"
                        renderItem={({item}) => (
                          <TouchableOpacity
                            style={styles.bpDropdownItem}
                            onPress={async () => {
                              const identifier = `${item.Value}_${item.Name}`;

                              // ✅ UI state
                              setEditableTask(prev => ({
                                ...prev,
                                Campaign: identifier,
                                CampaignSearch: identifier,
                              }));

                              setOpenDropdown(null); // ✅ CLOSE ON SELECT

                              try {
                                await updateTask({
                                  taskId: task.id,
                                  payload: {C_Campaign_ID: item.id},
                                });

                                setTask(prev => ({
                                  ...prev,
                                  C_Campaign_ID: {
                                    id: item.id,
                                    identifier,
                                  },
                                }));

                                refetchTask();
                              } catch (err) {
                                Alert.alert(
                                  'Error',
                                  'Failed to update Campaign',
                                );
                              }
                            }}>
                            <Text style={styles.bpDropdownItemText}>
                              {item.Name}
                            </Text>
                          </TouchableOpacity>
                        )}
                      />
                    )}
                </View>
              </View>
            )}
          </View>

          <View style={[styles.divider, {backgroundColor: '#ccc'}]} />

          {/* SUBTASKS */}
          <View style={styles.section}>
            <View style={styles.asanaHeader}>
              <Text style={styles.asanaTitle}>Subtasks</Text>
              <TouchableOpacity
                style={styles.asanaPlusBtn}
                onPress={() => setShowSubtaskModal(true)}>
                <MaterialIcons name="add" size={18} color="#666" />
              </TouchableOpacity>
            </View>
            {subtasks.length === 0 && (
              <View style={styles.asanaEmptyRow}>
                <MaterialIcons
                  name="radio-button-unchecked"
                  size={18}
                  color="#bbb"
                />
                <Text style={styles.asanaPlaceholder}>Add subtask</Text>
              </View>
            )}
            {subtasks.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.asanaSubtaskRow}
                onPress={() => toggleSubtask(item.id)}>
                <MaterialIcons
                  name={item.done ? 'check-circle' : 'radio-button-unchecked'}
                  size={20}
                  color={item.done ? '#3498DB' : '#bbb'}
                />
                <Text
                  style={[
                    styles.asanaSubtaskText,
                    item.done && styles.doneText,
                  ]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ATTACHMENTS */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Attachments</Text>
            </View>
            <TouchableOpacity
              style={styles.addAttachmentBox}
              onPress={openFileManager}>
              <MaterialIcons name="add" size={18} color="#555" />
              <Text style={styles.addAttachmentText}>Add Attachment</Text>
            </TouchableOpacity>
            {attachments.length === 0 ? (
              <Text style={styles.noAttachment}>No attachments added</Text>
            ) : (
              attachments.map(file => (
                <TouchableOpacity key={file.id} style={styles.attachmentCard}>
                  <MaterialIcons
                    name={
                      file.type?.includes('image')
                        ? 'image'
                        : file.type?.includes('pdf')
                        ? 'picture-as-pdf'
                        : 'insert-drive-file'
                    }
                    size={20}
                    color="#2F4FE3"
                  />
                  <Text style={styles.fileName}>{file.name}</Text>
                  <MaterialIcons
                    name="check-circle"
                    size={18}
                    color="#2ECC71"
                  />
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* ACTIVITY */}
          <View style={styles.activityContainer}>
            <TouchableOpacity
              style={styles.activityHeader}
              onPress={() => setShowActivity(prev => !prev)}>
              <Text style={styles.activityTitle}>All activity</Text>
              <MaterialIcons
                // name="keyboard-arrow-down"
                name={
                  showActivity ? 'keyboard-arrow-up' : 'keyboard-arrow-down'
                }
                size={20}
                color="#555"
              />
            </TouchableOpacity>

            {showActivity && (
              <>
                {safeUpdates.length === 0 ? (
                  // ✅ Empty state
                  <View style={styles.emptyState}>
                    <Image
                      source={require('../../asserts/RequestAsserts/emptyComments.jpeg')}
                      style={{height: 200, width: 200}}
                    />
                    <Text style={styles.emptyText}>
                      No activity yet. All updates will {'\n'} appear here.
                    </Text>
                  </View>
                ) : (
                  safeUpdates.map(item => (
                    <View key={item.id} style={styles.activityItem}>
                      <View
                        style={[
                          styles.avatar,
                          {
                            backgroundColor: getAvatarColor(
                              item.CreatedBy?.identifier,
                              item.CreatedBy?.id,
                            ),
                          },
                        ]}>
                        <Text style={styles.avatarText}>
                          {item.CreatedBy?.identifier
                            ?.split(' ')
                            .map(w => w[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase() || 'FN'}
                        </Text>
                      </View>

                      <View style={styles.activityContent}>
                        <View style={styles.nameRow}>
                          <Text style={styles.userName}>
                            {item.CreatedBy?.identifier || 'User'}
                          </Text>
                          <Text style={styles.actionText}>
                            {' '}
                            added a comment
                          </Text>
                        </View>

                        <Text style={styles.timeText}>
                          {new Date(item.Created).toLocaleString()}
                        </Text>
                        {item.Result && (
                          <View style={styles.messageRow}>
                            {/* MESSAGE */}
                            <View style={styles.messageBubble}>
                              <Text style={styles.messageText}>
                                {item.Result}
                              </Text>

                              {/* Reaction emoji attached */}
                              {localReaction[item.id] && (
                                <View style={styles.reactionBubble}>
                                  <Text style={styles.reactionBubbleTxt}>
                                    {localReaction[item.id]}
                                  </Text>
                                </View>
                              )}
                            </View>

                            {/* REACT BUTTON */}
                            <TouchableOpacity
                              style={styles.reactInlineBtn}
                              onPress={() => setBottomReactionFor(item.id)}>
                              <Text style={styles.reactionText}>🙂</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                      {bottomReactionFor && (
                        <View style={styles.bottomReactionBar}>
                          {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
                            <TouchableOpacity
                              key={emoji}
                              onPress={() => {
                                handleReaction(bottomReactionFor, emoji);
                                setBottomReactionFor(null);
                              }}>
                              <Text style={styles.bottomEmoji}>{emoji}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}

                      <TouchableOpacity
                        onPress={() => {
                          setSelectedActivity(item);
                          setShowOptionsModal(true);
                        }}>
                        <MaterialIcons
                          name="more-horiz"
                          size={20}
                          color="#999"
                          style={{marginTop: 4}}
                        />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </>
            )}
          </View>

          {/* HISTORY MODAL */}
          <Modal
            visible={historyModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setHistoryModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.bottomSheet}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Task History</Text>
                  <Pressable onPress={() => setHistoryModalVisible(false)}>
                    <MaterialIcons name="close" size={24} color="#555" />
                  </Pressable>
                </View>

                <ScrollView
                  contentContainerStyle={{paddingBottom: 20}}
                  showsVerticalScrollIndicator={false}>
                  <ReferenceField
                    label="Created"
                    value={dayjs(editableTask.Created).format('YYYY-MM-DD')}
                  />
                  <ReferenceField
                    label="Created By"
                    value={editableTask.CreatedBy?.identifier || 'N/A'}
                  />
                  <ReferenceField
                    label="Updated"
                    value={dayjs(editableTask.Updated).format('YYYY-MM-DD')}
                  />
                  <ReferenceField
                    label="Updated By"
                    value={editableTask.UpdatedBy?.identifier || 'N/A'}
                  />
                  <ReferenceField
                    label="Last action"
                    value={dayjs(editableTask.DateLastAction || 'N/A').format(
                      'YYYY-MM-DD',
                    )}
                  />
                  <ReferenceField
                    label="Last Alert"
                    value={editableTask.LastAlert || 'N/A'}
                  />
                  <ReferenceField
                    label="Change Request"
                    value={editableTask.ChangeRequest || 'N/A'}
                  />
                  <ReferenceField
                    label="Result"
                    value={editableTask.LastResult || 'N/A'}
                  />
                  <ReferenceField
                    label="Request Invoice"
                    value={editableTask.RequestInvoice || 'N/A'}
                  />
                </ScrollView>
              </View>
            </View>
          </Modal>
        </ScrollView>

        {/* FIXED CHAT INPUT */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.fixedChatWrapper}>
          {/* STANDARD RESPONSES INLINE */}
          {standardResponses.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              style={styles.standardInlineContainer}
              contentContainerStyle={{paddingHorizontal: 24, gap: 8}}>
              {standardResponses.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.standardChip}
                  onPress={() => {
                    setMessage(item.ResponseText || item.Name);
                    inputRef.current?.focus();
                  }}>
                  <Text style={styles.standardChipText}>{item.Name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* INPUT ROW */}
          <View style={styles.fixedChatInput}>
            <View style={styles.inputWrapper}>
              <TextInput
                ref={inputRef}
                placeholder="Ask a question or post an update..."
                value={message}
                onChangeText={setMessage} // ✅ simple typing
                style={styles.fixedInput}
                multiline
                placeholderTextColor={'#ccc'}
              />

              {/* SEND BUTTON */}
              <TouchableOpacity onPress={sendMessage} style={{marginLeft: 8}}>
                <MaterialIcons name="send" size={22} color="#2F4FE3" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default TaskDetail;

// -------------------- STYLES --------------------
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F9F8F6', padding: '6%'},
  header: {
    paddingTop: '10%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '4%',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'K2D-Regular',
    color: '#222',
  },
  title: {
    fontSize: 18,
    fontFamily: 'K2D-Bold',
    color: '#333',
    marginBottom: '0%',
  },
  subTitle: {fontSize: 14, color: '#555'},
  updatesHeader: {
    fontSize: 16,
    fontFamily: 'K2D-Bold',
    color: '#555',
    paddingVertical: '5%',
  },
  noUpdate: {textAlign: 'center', color: '#777', paddingVertical: '10%'},
  updateCard: {
    padding: 12,
    marginBottom: 4,
    width: '100%',
  },

  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  updateUser: {
    fontSize: 12,
    fontFamily: 'K2D-SemiBold',
    color: '#2F4FE3',
    marginLeft: 6,
    flexShrink: 1,
  },

  updateDate: {
    fontSize: 10,
    color: '#999',
  },

  updateText: {
    fontSize: 14,
    color: '#444',
    fontFamily: 'K2D-Medium',
    lineHeight: 20,
    flexWrap: 'wrap',
  },
  iconLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconWrapper: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 4,
    right: 10,
  },

  label: {
    fontSize: 13,
    color: '#888',
    fontFamily: 'K2D-Medium',
  },

  value: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'K2D-SemiBold',
    textAlign: 'center',
  },
  descLabel: {
    color: '#333',
    fontSize: 15,
    fontFamily: 'K2D-Medium',
    lineHeight: 20,
  },
  desTxt: {
    color: '#555',
    fontSize: 13,
    fontFamily: 'K2D-Medium',
    lineHeight: 20,
  },

  betweenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: '5%',
  },
  descRow: {
    // paddingHorizontal:'5%',
    // paddingVertical: '5%',
  },
  section: {
    marginBottom: '2%',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 14,
    fontFamily: 'K2D-Bold',
    color: '#333',
  },

  attachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    elevation: 2,
  },

  fileName: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: '#333',
    fontFamily: 'K2D-Medium',
  },

  addAttachmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: '3%',
    backgroundColor: '#eee',
    marginBottom: 8,
  },

  addAttachmentText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#555',
    fontFamily: 'K2D-Bold',
  },

  noAttachment: {
    fontSize: 12,
    color: '#999',
    marginTop: 1,
    fontFamily: 'K2D-Medium',
  },

  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  addSubtaskBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: '3%',
    backgroundColor: '#eee',
    marginBottom: 8,
  },

  addSubtaskText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#555',
    fontFamily: 'K2D-Bold',
  },

  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
  },

  subtaskText: {
    marginLeft: 10,
    fontSize: 13,
    color: '#333',
    fontFamily: 'K2D-Medium',
  },
  //ONLINE CHAT
  chatInputRow: {
    position: 'absolute',
    bottom: 2,
    left: '5%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: '5%',
    width: '97%',
    elevation: 5,
  },
  chatInput: {
    flex: 1,
    height: 100,
    fontFamily: 'K2D-Medium',
    color: '#333',
  },
  updatesContainer: {
    minHeight: 200, // fixed height
    marginVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    padding: 6,
    bottom: 10,
  },
  inlineInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
    elevation: 2,
  },
  inlinePlaceholder: {
    marginLeft: 10,
    fontSize: 13,
    color: '#aaa',
    fontFamily: 'K2D-Medium',
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  asanaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  asanaTitle: {
    fontSize: 14,
    fontFamily: 'K2D-Bold',
    color: '#333',
  },

  asanaPlusBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dotted',
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },

  asanaEmptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },

  asanaPlaceholder: {
    marginLeft: 10,
    fontSize: 13,
    color: '#aaa',
    fontFamily: 'K2D-Medium',
  },

  asanaSubtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: '1%',
  },

  asanaSubtaskText: {
    marginLeft: 10,
    fontSize: 13,
    color: '#333',
    fontFamily: 'K2D-Medium',
  },

  doneText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },

  modalInput: {
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'K2D-Medium',
    marginBottom: 16,
  },

  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  modalRowText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#444',
    fontFamily: 'K2D-Medium',
  },

  createBtn: {
    backgroundColor: '#3498DB',
    alignSelf: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },

  createBtnText: {
    color: '#fff',
    fontFamily: 'K2D-Bold',
    fontSize: 14,
  },

  chatShadow: {
    height: 3,
    backgroundColor: '#000',
    opacity: 0.02,
  },

  fixedChatInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '5%',
    paddingVertical: '4%',

    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 3,
    borderRadius: 30,
    paddingHorizontal: '5%',
  },

  fixedInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    fontFamily: 'K2D-Medium',
    color: '#333',
    paddingRight: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    paddingHorizontal: '10%',
    marginTop: '-5%',
    paddingVertical: '5%',
  },

  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  activityContainer: {
    paddingVertical: 10,
  },

  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '7%',
  },

  activityTitle: {
    fontSize: 14,
    fontFamily: 'K2D-Bold',
    color: '#333',
    marginRight: 4,
  },

  activityItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E3ECFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  avatarText: {
    fontSize: 15,
    fontFamily: 'K2D-Medium',
    color: '#fff',
  },

  activityContent: {
    flex: 1,
    marginBottom: '15%',
  },

  nameRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  userName: {
    fontSize: 13,
    fontFamily: 'K2D-Bold',
    color: '#2F4FE3',
  },

  actionText: {
    fontSize: 13,
    color: '#555',
    fontFamily: 'K2D-Medium',
  },

  timeText: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },

  messageText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'K2D-Medium',
  },

  reactionChip: {
    // backgroundColor: '#F2F3F5',
    alignSelf: 'flex-start',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 6,
  },

  reactionText: {
    fontSize: 12,
    color: '#555',
    fontFamily: 'K2D-Medium',
  },

  optionsModal: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  bottomOptionsModal: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  optionBtn: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'K2D-Medium',
  },
  suggestionsContainer: {
    position: 'absolute',
    // bottom: 60,
    left: 0,
    right: 0,
    maxHeight: 150,
    paddingHorizontal: '7%',
    marginTop: '-10%',
    // backgroundColor:'#fff',
    // paddingVertical:'2%',
    // backgroundColor: '#fff',
    // borderTopWidth: 0,
    // borderBottomLeftRadius: 10,
    // borderBottomRightRadius: 10,
    // shadowColor: '#000',
    // shadowOpacity: 0.1,
    // shadowRadius: 5,
    // elevation: 5,
    zIndex: 999,
  },

  suggestionItem: {
    // backgroundColor: '#F2F3F5',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 2,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },

  suggestionText: {
    fontSize: 13,
    fontFamily: 'K2D-Bold',
    color: '#2F4FE3',
  },

  suggestionSubText: {
    fontSize: 12,
    fontFamily: 'K2D-Medium',
    color: '#555',
  },
  standardItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  standardTitle: {
    fontSize: 14,
    fontFamily: 'K2D-Bold',
    color: '#333',
  },
  standardSubText: {
    fontSize: 12,
    fontFamily: 'K2D-Medium',
    color: '#777',
    marginTop: 4,
  },
  messageBubble: {
    backgroundColor: '#eee',
    padding: '5%',
    borderRadius: 10,
    // marginTop: 4,
    maxWidth: '85%',
    position: 'relative',
  },

  fixedChatWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
  },

  standardInlineContainer: {
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingVertical: 6,
    backgroundColor: '#F5F7FA',
  },

  standardChip: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  standardChipText: {
    fontSize: 13,
    color: '#2F4FE3',
    fontWeight: '600',
  },
  // reference style
  referenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderColor: '#E5E5E5',
  },

  sectionContainerRef: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
  },
  sectionHeaderRef: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '3%',
    backgroundColor: '#F6F7F9',
  },
  sectionTitleRef: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
  sectionBodyRef: {
    padding: 12,
  },

  // Reference Field
  referenceContainer: {
    marginBottom: 12,
  },
  referenceLabel: {
    fontSize: 13,
    color: '#000',
    marginBottom: 6,
    fontFamily: 'K2D-Medium',
  },
  referenceValueBox: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
  },
  referenceValueText: {
    fontSize: 13,
    color: '#333',
    fontFamily: 'K2D-Regular',
    lineHeight: 22,
  },
  rowRef: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {fontSize: 16, fontFamily: 'K2D-Bold', color: '#333'},
  inlineAutoInput: {
    fontSize: 14,
    color: '#555',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderColor: 'transparent',
  },

  inlineAutoInputFocused: {
    borderColor: '#2F4FE3',
    color: '#555',
  },
  bpInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 5,
    fontSize: 13,
    backgroundColor: '#fff',
    fontFamily: 'K2D-Regular',
    color: '#333',
  },
  bpDropdown: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginTop: 2,
    backgroundColor: '#fff',
    zIndex: 1000, // ensure it's on top
    color: '#555',
  },
  bpDropdownFix: {
    maxHeight: 220, // ✅ REQUIRED
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 6,
    elevation: 5,
  },

  bpDropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    color: '#555',
  },
  bpDropdownItemText: {
    fontSize: 16,
    color: '#555',
  },
  emptyState: {
    // paddingVertical: '5%',
    // bottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: '10%',
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#777',
    // marginTop: '3%',
    top: '-15%',
    marginBottom: '5%',
    textAlign: 'center',
    fontFamily: 'K2D-Medium',
  },
  // REACTION STYLING

  reactionBubbleTxt: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'K2D-Medium',
  },
  messageWrapper: {
    alignSelf: 'flex-start',
    marginTop: 6,
  },

  reactionPopup: {
    position: 'absolute',
    top: -40,
    left: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 20,
    elevation: 6,
    zIndex: 999,
  },
  emoji: {fontSize: 20, marginHorizontal: 6},
  bottomReactionBar: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    elevation: 3,
  },

  bottomEmoji: {
    fontSize: 28,
    marginHorizontal: 10,
  },

  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '5%',
  },

  // messageBubble: {
  //   backgroundColor: '#F2F2F2',
  //   padding: 10,
  //   borderRadius: 12,
  //   maxWidth: '75%',
  //   position: 'relative',
  // },

  reactInlineBtn: {
    marginLeft: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  reactionBubble: {
    position: 'absolute',
    bottom: -20,
    left: 15,
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 18,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});
