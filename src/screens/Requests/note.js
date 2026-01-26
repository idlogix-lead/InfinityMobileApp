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

import {useTaskStore} from '../../store/requestStore';
import {
  useTaskUpdates,
  useStandardResponses,
  useSendTaskMessage,
  useUpdateTask,
  useTaskById,
} from '../../hooks/useRequests';

const Task = ({route}) => {
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

  // -------------------- API HOOKS --------------------
  const {data: fetchedTask, refetch: refetchTask} = useTaskById(
    route.params.task.id,
  );

  const {data: fetchedUpdates} = useTaskUpdates(task?.id);
  const {data: fetchedResponses} = useStandardResponses();

  const {mutateAsync: sendTaskMessageApi} = useSendTaskMessage();
  const {mutateAsync: updateTask} = useUpdateTask();

  useEffect(() => {
    if (fetchedUpdates) setUpdates(fetchedUpdates);
    if (fetchedResponses) setStandardResponses(fetchedResponses);
  }, [fetchedUpdates, fetchedResponses]);

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

  // -------------------- SYNC FETCHED TASK --------------------
  useEffect(() => {
    if (fetchedTask) {
      setTask(fetchedTask);
      setEditableTask({
        Summary: fetchedTask.Summary || '',
        Priority: fetchedTask.Priority || '',
        StartDate: fetchedTask.StartDate || null,
        StartTime: fetchedTask.StartTime || null,
        CloseDate: fetchedTask.CloseDate || null,
        LastResult: fetchedTask.LastResult || '',
      });
    }
  }, [fetchedTask]);

  useEffect(() => {
    if (fetchedUpdates) setUpdates(fetchedUpdates);
    if (fetchedResponses) setStandardResponses(fetchedResponses);
  }, [fetchedUpdates, fetchedResponses]);

  const autoSaveDescription = async () => {
    if (editableTask.LastResult === task.LastResult) return;

    try {
      await updateTask({
        taskId: task.id,
        payload: {LastResult: editableTask.LastResult},
      });

      refetchTask();
    } catch {
      Alert.alert('Error', 'Auto save failed');
    }
  };

  // ✅ SAFE INITIAL STATE (FIXED)
  const [editableTask, setEditableTask] = useState({
    Summary: '',
    Priority: '',
    StartDate: null,
    StartTime: null,
    CloseDate: null,
    LastResult: '',
  });

  return (
    <View style={{flex: 1}}>
      {/* <ReqHeader title="Task Details" /> */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#555" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        <TouchableOpacity onPress={() => setHistoryModalVisible(true)}>
          <MaterialIcons name="settings" size={24} color="#555" />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{paddingBottom: 120}}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{task.Summary}</Text>
        <View style={[styles.divider, {backgroundColor: '#ccc'}]} />

        {/* CREATOR & DUE */}
        <View style={styles.betweenRow}>
          <View>
            <View style={styles.iconLabelRow}>
              <MaterialIcons name="person" size={16} color="#3498DB" />
              <Text style={styles.label}> Created By</Text>
            </View>
            <Text style={styles.value}>
              {task.CreatedBy?.identifier || '—'}
            </Text>
          </View>
          <View>
            <View style={styles.iconLabelRow}>
              <MaterialIcons name="event" size={16} color="#E67E22" />
              <Text style={styles.label}> Due Date</Text>
            </View>
            <Text style={styles.value}>
              {task.CloseDate
                ? new Date(task.CloseDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : '—'}
            </Text>
          </View>
        </View>

        {/* ORGANIZATION & CLIENT */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: '5%',
            paddingTop: '3%',
            alignItems: 'center',
          }}>
          <View style={styles.iconLabelRow}>
            <MaterialIcons name="corporate-fare" size={16} color="#3498DB" />
            <Text style={styles.value}> Organization: </Text>
          </View>
          <Text style={styles.label}>
            {task.AD_Org_ID?.identifier || 'N/A'}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: '5%',
            alignItems: 'center',
          }}>
          <View style={styles.iconLabelRow}>
            <MaterialIcons name="group" size={16} color="#E67E22" />
            <Text style={styles.value}> Client: </Text>
          </View>
          <Text style={styles.label}>
            {task.AD_Client_ID?.identifier || 'N/A'}
          </Text>
        </View>

        <View style={[styles.divider, {marginVertical: 5}]} />

        {/* DESCRIPTION */}
        {/* DESCRIPTION */}
        <View style={styles.descRow}>
          <Text style={styles.descLabel}>Description</Text>

          <TextInput
            value={editableTask.LastResult}
            onChangeText={text =>
              setEditableTask(prev => ({...prev, LastResult: text}))
            }
            onBlur={autoSaveDescription}
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
              <ReferenceField
                label="Business Partner"
                value={task.C_BPartner_ID?.identifier || 'N/A'}
              />
              <ReferenceField
                label="User Contact"
                value={task.AD_User_ID?.identifier || 'N/A'}
              />
              <ReferenceField
                label="Project"
                value={task.C_Project_ID?.identifier || 'N/A'}
              />
              <ReferenceField
                label="Asset"
                value={task.A_Asset_ID?.identifier || 'N/A'}
              />
              <ReferenceField
                label="Order"
                value={task.C_Order_ID?.identifier || 'N/A'}
              />
              <ReferenceField
                label="Invoice"
                value={task.C_Invoice_ID?.identifier || 'N/A'}
              />
              <ReferenceField
                label="Product"
                value={task.M_Product_ID?.identifier || 'N/A'}
              />
              <ReferenceField
                label="Payment"
                value={task.C_Payment_ID?.identifier || 'N/A'}
              />
              <ReferenceField
                label="Shipment / Receipt"
                value={task.M_InOut_ID?.identifier || 'N/A'}
              />
              <ReferenceField
                label="RMA"
                value={task.M_RMA_ID?.identifier || 'N/A'}
              />
              <ReferenceField label="Request Amount" value={task.RequestAmt} />
              <ReferenceField
                label="Campaign"
                value={task.C_Campaign_ID?.identifier || 'N/A'}
              />
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
                style={[styles.asanaSubtaskText, item.done && styles.doneText]}>
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
                <MaterialIcons name="check-circle" size={18} color="#2ECC71" />
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* ACTIVITY */}
        <View style={styles.activityContainer}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>All activity</Text>
            <MaterialIcons name="keyboard-arrow-down" size={20} color="#555" />
          </View>
          {updates.map(item => (
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
                  <Text style={styles.actionText}> added a comment</Text>
                </View>

                <Text style={styles.timeText}>
                  {new Date(item.Created).toLocaleString()}
                </Text>

                {item.Result && (
                  <View style={styles.messageBubble}>
                    <Text style={styles.messageText}>{item.Result}</Text>
                  </View>
                )}

                <View style={styles.reactionChip}>
                  <TouchableOpacity
                    onPress={() =>
                      setReactionPickerFor(
                        reactionPickerFor === item.id ? null : item.id,
                      )
                    }>
                    <Text style={styles.reactionText}>🙂 React</Text>
                  </TouchableOpacity>
                </View>
                {reactionPickerFor === item.id && (
                  <View style={styles.reactionPopup}>
                    {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
                      <TouchableOpacity
                        key={emoji}
                        onPress={() => {
                          console.log('Reacted', emoji, 'to', item.id);
                          setReactionPickerFor(null);
                        }}>
                        <Text style={styles.emoji}>{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

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
          ))}
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
                  value={dayjs(task.Created).format('YYYY-MM-DD')}
                />
                <ReferenceField
                  label="Created By"
                  value={task.CreatedBy?.identifier || 'N/A'}
                />
                <ReferenceField
                  label="Updated"
                  value={dayjs(task.Updated).format('YYYY-MM-DD')}
                />
                <ReferenceField
                  label="Updated By"
                  value={task.UpdatedBy?.identifier || 'N/A'}
                />
                <ReferenceField
                  label="Last action"
                  value={dayjs(task.DateLastAction || 'N/A').format(
                    'YYYY-MM-DD',
                  )}
                />
                <ReferenceField
                  label="Last Alert"
                  value={task.LastAlert || 'N/A'}
                />
                <ReferenceField
                  label="Change Request"
                  value={task.ChangeRequest || 'N/A'}
                />
                <ReferenceField
                  label="Result"
                  value={task.LastResult || 'N/A'}
                />
                <ReferenceField
                  label="Request Invoice"
                  value={task.RequestInvoice || 'N/A'}
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
  );
};

export default Task;

// -------------------- STYLES --------------------
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F7FA', padding: '6%'},
  header: {
    paddingTop: '10%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '4%',
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
    // marginBottom: 8,
    color: '#555',
    paddingVertical: '5%',
  },
  noUpdate: {textAlign: 'center', color: '#777', paddingVertical: '10%'},
  updateCard: {
    // backgroundColor: '#fff',
    // borderRadius: 16,
    padding: 12,
    marginBottom: 4,
    width: '100%',
    // elevation: 1,
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
    // marginBottom: 2,
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
  standardChipText: {
    fontSize: 13,
    color: '#2F4FE3',
    fontWeight: '600',
  },

  betweenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginTop: 12,
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
    // marginLeft: 6,
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
    // borderWidth: 1,
    // borderStyle: 'dashed',
    // borderColor: '#2F4FE3',
    // borderRadius: 10,
    // paddingVertical: '3%',
    // alignItems: 'center',
    // justifyContent: 'center',
    // marginVertical: 10,
    // backgroundColor: '#eee',
    // flexDirection:'row'
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 1,
    // borderStyle: 'dashed',
    // borderColor: '#2ECC71',
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
    // borderWidth: 1,
    // borderStyle: 'dashed',
    // borderColor: '#2ECC71',
    borderRadius: 10,
    paddingVertical: '3%',
    backgroundColor: '#eee',
    marginBottom: 8,
  },

  addSubtaskText: {
    marginLeft: 6,
    fontSize: 13,
    // color: '#2ECC71',
    color: '#555',
    fontFamily: 'K2D-Bold',
  },

  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
    // elevation: 2,
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
    // top:10,
    left: '5%',
    // right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    // borderRadius: 30,
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
    minHeight: 200, // 🔒 fixed height
    marginVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    padding: 6,
    // marginBottom: 20
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
    // backgroundColor: '#fff',
    borderRadius: 10,
    padding: '1%',
    // marginTop: 6,
    // elevation: 1,
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
  fixedChatWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  chatShadow: {
    height: 3,
    backgroundColor: '#000',
    opacity: 0.02,
  },

  fixedChatInput: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#fff',
    paddingHorizontal: '5%',
    paddingVertical: '4%',
    // bottom: 15,
    width: '100%',

    // borderTopWidth: 1,
    // borderTopColor: '#e0e0e0',
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
    // backgroundColor: '#fff',
    // elevation: 3,
    // borderRadius: 30,
    // paddingHorizontal: '10%',
  },
  actionRow: {
    flexDirection: 'row',
    // justifyContent: 'space-around',
    gap: 20,
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    paddingHorizontal: '10%',
    marginTop: '-5%',
    paddingVertical: '5%',
    // paddingVertical: 8,
    // borderTopWidth: 1,
    // borderColor: '#eee',
  },

  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // actionText: {
  //   marginLeft: 6,
  //   fontSize: 12,
  //   color: '#555',
  //   fontFamily: 'K2D-Medium',
  // },
  activityContainer: {
    paddingVertical: 10,
  },

  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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

  messageBubble: {
    backgroundColor: '#F2F3F5',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 6,
    maxWidth: '90%',
  },

  messageText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'K2D-Medium',
  },

  reactionChip: {
    backgroundColor: '#F2F3F5',
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
  // avatar: {
  //   width: 40,
  //   height: 40,
  //   borderRadius: 20,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  // avatarText: {color: '#fff', fontWeight: 'bold'},

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
  optionBtn: {padding: 10},
  reactionPopup: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 25,
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  emoji: {fontSize: 20, marginHorizontal: 5},
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
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
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
  },
});







import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomHeader from '../../components/CustomHeader';

const PRIORITIES = [
  {id: '1', label: 'Urgent', color: '#E74C3C'},
  {id: '3', label: 'High', color: '#E67E22'},
  {id: '5', label: 'Medium', color: '#3498DB'},
  {id: '7', label: 'Low', color: '#2ECC71'},
  {id: '4', label: 'Minor', color: '#95A5A6'},
];

// stable project color
const projectColor = id => {
  const colors = ['#6C5CE7', '#00B894', '#0984E3', '#D63031', '#E84393'];
  return colors[id % colors.length];
};

const AddTask = ({navigation, isModal = false, onClose}) => {
  const [creating, setCreating] = useState(false);

  const [summary, setSummary] = useState('');
  const [assignedUser, setAssignedUser] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [requestTypes, setRequestTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [group, setGroup] = useState([]);
  const [priority, setPriority] = useState(PRIORITIES[1]);
  const [selectedRequestType, setSelectedRequestType] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [token, setToken] = useState('');

  // PROJECT
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');

  // DROPDOWNS
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [showRequestTypeDropdown, setShowRequestTypeDropdown] = useState(false);

  //SALESREP_ID
  const [salesUsers, setSalesUsers] = useState([]);
  const [selectedSalesRep, setSelectedSalesRep] = useState(null);
  const [showSalesRepDropdown, setShowSalesRepDropdown] = useState(false);
  const [salesRepSearch, setSalesRepSearch] = useState('');
  //Dates
  const [startDate, setStartDate] = useState(new Date()); // StartDate
  const [startTime, setStartTime] = useState(new Date()); // StartTime (time picker)
  const [closeDate, setCloseDate] = useState(new Date()); // CloseDate

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showCloseDatePicker, setShowCloseDatePicker] = useState(false);

  const LAST_SALES_REP = 'LAST_SALES_REP';

  useEffect(() => {
    const load = async () => {
      setToken(await AsyncStorage.getItem('token'));

      const userName = await AsyncStorage.getItem('userName');
      const userId = await AsyncStorage.getItem('userId');

      const lastSalesRep = await AsyncStorage.getItem(LAST_SALES_REP);

      if (lastSalesRep) {
        setSelectedSalesRep(JSON.parse(lastSalesRep));
      } else {
        setSelectedSalesRep({
          id: userId,
          Name: userName,
          identifier: userName,
        });
      }
      const last = await AsyncStorage.getItem('LAST_PROJECT');
      if (last) setSelectedProject(JSON.parse(last));
    };
    load();
  }, []);

  // FETCH DATA
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      const headers = {Authorization: `Bearer ${token}`};

      const [rt, cat, grp, proj, users] = await Promise.all([
        axios.get('http://116.58.53.114:9999/api/v1/models/R_RequestType', {
          headers,
        }),
        axios.get('http://116.58.53.114:9999/api/v1/models/R_Category', {
          headers,
        }),
        axios.get('http://116.58.53.114:9999/api/v1/models/R_Group', {
          headers,
        }),
        axios.get('http://116.58.53.114:9999/api/v1/models/C_Project', {
          headers,
        }),
        axios.get('http://116.58.53.114:9999/api/v1/models/AD_User', {
          headers,
        }),
      ]);

      setRequestTypes(rt.data.records || []);
      setCategories(cat.data.records || []);
      setGroup(grp.data.records || []);
      setProjects(proj.data.records || []);
      setSalesUsers(users.data.records || []);
    };

    fetchData().catch(() => Alert.alert('Error', 'Failed to load dropdowns'));
  }, [token]);

  // SEARCH SalesUsers + RECENT LOGIC

  const filteredSalesUsers = useMemo(() => {
    let list = salesUsers.filter(u =>
      u.Name?.toLowerCase().includes(salesRepSearch.toLowerCase()),
    );

    // ⭐ logged-in user top pe
    if (selectedSalesRep) {
      list = [
        selectedSalesRep,
        ...list.filter(u => u.id !== selectedSalesRep.id),
      ];
    }

    return list;
  }, [salesUsers, salesRepSearch, selectedSalesRep]);

  // SEARCH + RECENT LOGIC
  const filteredProjects = useMemo(() => {
    let list = projects.filter(p =>
      p.Name.toLowerCase().includes(projectSearch.toLowerCase()),
    );

    if (selectedProject) {
      list = [
        selectedProject,
        ...list.filter(p => p.id !== selectedProject.id),
      ];
    }

    return list;
  }, [projects, projectSearch, selectedProject]);

  useEffect(() => {
    if (selectedProject) setSelectedProject(selectedProject);
  }, [selectedProject]);

  // CREATE TASK
  const handleCreateTask = async () => {
    if (creating) return;

    if (
      !summary ||
      !selectedRequestType ||
      !selectedCategory ||
      !selectedGroup ||
      !selectedProject
    ) {
      Alert.alert('Error', 'Fill all fields');
      return;
    }

    setCreating(true);

    await AsyncStorage.setItem('LAST_PROJECT', JSON.stringify(selectedProject));

    // format dates as ISO strings
    const payload = {
      Summary: summary,
      SalesRep_ID: {
        id: selectedSalesRep.id,
        identifier: selectedSalesRep.Name,
      },
      // StartDate only date part
      StartDate: startDate.toISOString().split('T')[0] + 'T00:00:00Z',
      // StartTime combined with date (full ISO)
      StartTime: combineDateAndTime(startDate, startTime),
      // CloseDate full ISO
      CloseDate: closeDate.toISOString(),
      R_RequestType_ID: {id: selectedRequestType.id},
      R_Category_ID: {id: selectedCategory.id},
      R_Group_ID: {id: selectedGroup.id},
      Priority: {id: priority.id},
      C_Project_ID: {id: selectedProject.id},
    };

    try {
      const res = await axios.post(
        'http://116.58.53.114:9999/api/v1/models/R_Request',
        payload,
        {headers: {Authorization: `Bearer ${token}`}},
      );

      Alert.alert('Success', 'Task created successfully');
      resetForm();

      if (isModal) {
        onClose();
      } else {
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Task not created');
    } finally {
      setCreating(false);
    }
  };

  // Combine date and time to ISO string
  const combineDateAndTime = (date, time) => {
    const combined = new Date(date);
    combined.setHours(time.getHours());
    combined.setMinutes(time.getMinutes());
    combined.setSeconds(0);
    combined.setMilliseconds(0);
    return combined.toISOString();
  };


  const resetForm = () => {
    setSummary('');
    setSelectedRequestType(null);
    setSelectedCategory(null);
    setSelectedGroup(null);

    setPriority(PRIORITIES[1]); // default High (ya jo chaho)

    setProjectSearch('');
    setShowProjectDropdown(false);

    setSalesRepSearch('');
    setShowSalesRepDropdown(false);

    setStartDate(new Date());
    setStartTime(new Date());
    setCloseDate(new Date());
  };

  return (
    <>
      {/* {!isModal && <CustomHeader title={'Create Request'} />} */}

      <ScrollView
        style={styles.container}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View
          style={[
            styles.row,
            {
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 15,
              paddingTop: 10,
            },
          ]}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <MaterialIcons name="check-circle-outline" size={15} color="#555" />
            <Text style={[styles.rowText, {color: '#555'}]}>Task</Text>
          </View>

          <View style={styles.priorityMini}>
            <TouchableOpacity
              onPress={() => setShowPriorityDropdown(!showPriorityDropdown)}
              style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
              <View
                style={[
                  styles.priorityCircle,
                  {backgroundColor: priority.color},
                ]}
              />
              <Text style={styles.priorityMiniLabel}>Priority</Text>
            </TouchableOpacity>

            {showPriorityDropdown && (
              <View style={styles.priorityPopup}>
                {PRIORITIES.map(p => {
                  const isSelected = priority.id === p.id;

                  return (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => {
                        setPriority(p);
                        setShowPriorityDropdown(false);
                      }}
                      style={styles.priorityOption}>
                      <Text style={[styles.priorityLabel, {color: p.color}]}>
                        {p.label}
                      </Text>

                      {/* <View
                        style={[
                          styles.priorityCircle,
                          {backgroundColor: p.color},
                          isSelected && styles.prioritySelectedCircle,
                        ]}
                      /> */}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* Task Name */}
        <View style={styles.inputRow}>
          {/* <MaterialIcons name="subject" size={24} color="#2F4FE3" /> */}
          <TextInput
            style={styles.input}
            placeholder="Task name..."
            value={summary}
            onChangeText={setSummary}
            placeholderTextColor="#999"
          />
        </View>

        {/* Assigned User & Due Date */}
        <View style={[styles.row, {paddingHorizontal: '2%'}]}>
          {/* <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <MaterialIcons name="person-outline" size={24} color="#2F4FE3" />
            <Text style={{marginLeft: 8, color: '#000'}}>{assignedUser}</Text>
          </View> */}
          <View style={styles.dropdownRowPro}>
            <TouchableOpacity
              style={styles.dropdownHeaderPro}
              onPress={() => setShowSalesRepDropdown(!showSalesRepDropdown)}>
              <View style={styles.iconWrapper}>
                <MaterialIcons name="person-outline" size={24} color="#555" />
              </View>
              <View>
                <Text style={styles.rowLabel}>Assigned to</Text>
                <Text style={styles.rowValue}>
                  {selectedSalesRep ? selectedSalesRep.Name : assignedUser}
                </Text>
              </View>
            </TouchableOpacity>

            {showSalesRepDropdown && (
              <View style={styles.dropdownBoxPro}>
                <TextInput
                  placeholder="Search Sales Rep"
                  value={salesRepSearch}
                  onChangeText={setSalesRepSearch}
                  style={styles.searchInput}
                  placeholderTextColor="#ccc"
                />

                <ScrollView
                  style={{maxHeight: 220}}
                  nestedScrollEnabled={true}
                  keyboardShouldPersistTaps="handled">
                  {filteredSalesUsers.map(u => (
                    <TouchableOpacity
                      key={u.id}
                      style={styles.dropdownItemPro}
                      onPress={async () => {
                        setSelectedSalesRep(u);
                        await AsyncStorage.setItem(
                          'LAST_SALES_REP',
                          JSON.stringify(u),
                        );
                        setShowSalesRepDropdown(false);
                      }}>
                      <Text style={styles.dropdownTextPro}>{u.Name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={() => setShowCloseDatePicker(true)}
            style={styles.row}>
            <View style={styles.iconWrapper}>
              <MaterialIcons name="calendar-today" size={15} color="#777" />
            </View>
            <View style={{}}>
              <Text style={styles.rowLabel}> End Date</Text>
              <Text style={styles.rowValue}>
                {closeDate ? closeDate.toDateString() : 'Please select'}
              </Text>
            </View>
          </TouchableOpacity>

          {showCloseDatePicker && (
            <DateTimePicker
              value={closeDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                if (event.type === 'set' && selectedDate)
                  setCloseDate(selectedDate);
                setShowCloseDatePicker(false);
              }}
            />
          )}
        </View>
        <View style={[styles.row, {paddingHorizontal: '2%'}]}>
          <TouchableOpacity
            onPress={() => setShowStartDatePicker(true)}
            style={styles.row}>
            <View style={styles.iconWrapper}>
              <MaterialIcons name="calendar-today" size={15} color="#777" />
            </View>
            <View style={{}}>
              <Text style={styles.rowLabel}>Start Date</Text>
              <Text style={styles.rowValue}>
                {' '}
                {startDate ? startDate.toDateString() : 'Please select'}
              </Text>
            </View>
          </TouchableOpacity>
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                if (event.type === 'set' && selectedDate)
                  setStartDate(selectedDate);
                setShowStartDatePicker(false);
              }}
            />
          )}
          <TouchableOpacity
            onPress={() => setShowStartTimePicker(true)}
            style={styles.row}>
            <View style={styles.iconWrapper}>
              <MaterialIcons name="schedule" size={24} color="#555" />
            </View>
            <View>
              <Text style={styles.rowLabel}>Start Time</Text>
              <Text style={styles.rowValue}>
                {startTime
                  ? startTime.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Please select'}
              </Text>
            </View>
          </TouchableOpacity>
          {showStartTimePicker && (
            <DateTimePicker
              value={startTime}
              mode="time"
              is24Hour
              display="default"
              onChange={(event, selectedTime) => {
                if (event.type === 'set' && selectedTime)
                  setStartTime(selectedTime);
                setShowStartTimePicker(false);
              }}
            />
          )}
        </View>

        {/* Request Type */}
        <View style={styles.dropdownRow}>
          <TouchableOpacity
            onPress={() =>
              setShowRequestTypeDropdown(!showRequestTypeDropdown)
            }>
            <View style={[styles.row, {justifyContent: 'flex-start'}]}>
              <MaterialIcons name="add" size={25} color={'#444'} />
              <Text style={[styles.rowText, {color: '#999'}]}>
                {/* Request Type{' '} */}
                {selectedRequestType
                  ? selectedRequestType.Name || selectedRequestType.uid
                  : 'Select Request type'}
              </Text>
            </View>
          </TouchableOpacity>

          {showRequestTypeDropdown &&
            requestTypes.map(rt => (
              <TouchableOpacity
                key={rt.id}
                onPress={() => {
                  setSelectedRequestType(rt);
                  setShowRequestTypeDropdown(false);
                }}
                style={styles.dropdownItem}>
                <Text style={[styles.dropdownText, {color: '#2F4FE3'}]}>
                  {rt.Name || rt.uid}
                </Text>
              </TouchableOpacity>
            ))}
        </View>

        {/* Category */}
        <View style={styles.dropdownRowPro}>
          <TouchableOpacity
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}>
            <View
              style={[
                styles.row,
                {justifyContent: 'flex-start', paddingVertical: 0},
              ]}>
              <MaterialIcons name="add" size={25} color={'#444'} />
              <Text style={[styles.rowText, {color: '#999'}]}>
                {/* Category:{' '} */}
                {selectedCategory
                  ? selectedCategory.Name || selectedCategory.identifier
                  : 'Select Category'}
              </Text>
            </View>
          </TouchableOpacity>
          {showCategoryDropdown &&
            categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => {
                  setSelectedCategory(cat);
                  setShowCategoryDropdown(false);
                }}
                style={styles.dropdownItem}>
                <Text style={[styles.dropdownText, {color: '#2F4FE3'}]}>
                  {cat.Name || cat.identifier}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
        {/* Group */}
        <View style={styles.dropdownRowPro}>
          <TouchableOpacity
            onPress={() => setShowGroupDropdown(!showGroupDropdown)}>
            <View style={[styles.row, {justifyContent: 'flex-start'}]}>
              <MaterialIcons name="add" size={25} color={'#444'} />
              <Text style={[styles.rowText, {color: '#999'}]}>
                {/* Group:{' '} */}
                {selectedGroup
                  ? selectedGroup.Name || selectedGroup.identifier
                  : 'Select Group'}
              </Text>
            </View>
          </TouchableOpacity>
          {showGroupDropdown &&
            group.map(grp => (
              <TouchableOpacity
                key={grp.id}
                onPress={() => {
                  setSelectedGroup(grp);
                  setShowGroupDropdown(false);
                }}
                style={styles.dropdownItem}>
                <Text style={[styles.dropdownText, {color: '#2F4FE3'}]}>
                  {grp.Name || grp.identifier}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
        {/* PROJECT */}
        <View style={styles.dropdownRowPro}>
          <TouchableOpacity
            style={styles.dropdownHeaderPro}
            onPress={() => setShowProjectDropdown(!showProjectDropdown)}>
            {selectedProject && (
              <View
                style={[
                  styles.projectDot,
                  {backgroundColor: projectColor(selectedProject.id)},
                ]}
              />
            )}
            <View style={[styles.row, {justifyContent: 'flex-start'}]}>
              <MaterialIcons name="add" size={25} color={'#444'} />
              <Text style={[styles.rowText, {color: '#999'}]}>
                {selectedProject ? selectedProject.Name : 'Select Project'}
              </Text>
            </View>
          </TouchableOpacity>

          {showProjectDropdown && (
            <View style={styles.dropdownBoxPro}>
              <TextInput
                placeholder="Search project"
                style={styles.searchInput}
                value={projectSearch}
                onChangeText={setProjectSearch}
                placeholderTextColor={'#ccc'}
                cursorColor={'#2F4FE3'}
              />

              <ScrollView
                style={{maxHeight: 220}}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled">
                {filteredProjects.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.dropdownItemPro}
                    onPress={() => {
                      setSelectedProject(p);
                      setShowProjectDropdown(false);
                      setProjectSearch('');
                    }}>
                    <View
                      style={[
                        styles.projectDot,
                        {backgroundColor: projectColor(p.id)},
                      ]}
                    />
                    <Text style={styles.dropdownTextPro}>{p.Name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Submit */}
        <TouchableOpacity style={styles.button} onPress={handleCreateTask}>
          <Text style={styles.buttonText}>
            {creating ? 'Creating...' : 'Create Tasks'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff', paddingHorizontal: '5%'},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // marginVertical: 12,
    paddingVertical: '1%',
  },
  rowText: {
    fontSize: 15,
    marginLeft: 2,
    fontFamily: 'K2D-Medium',
    color: '#000',
  },
  rowLabel: {
    fontSize: 15,
    marginLeft: 2,
    fontFamily: 'K2D-Medium',
    color: '#555',
  },
  rowValue: {
    fontSize: 15,
    marginLeft: 2,
    fontFamily: 'K2D-Medium',
    color: '#000',
  },
  iconWrapper: {
    height: 30,
    width: 30,
    borderRadius: 15,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#777',
    justifyContent: 'center',
    alignItems: 'center',
    right: 7,
  },
  inputRow: {flexDirection: 'row', alignItems: 'center'},
  input: {
    flex: 1,
    // marginLeft: 8,
    // borderBottomWidth: 1,
    // borderColor: '#ccc',
    fontSize: 20,
    paddingVertical: '2%',
    color: '#555',
    fontFamily: 'K2D-SemiBold',
  },
  dropdownRow: {marginVertical: 12},
  dropdownItem: {
    padding: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
  },
  button: {
    backgroundColor: '#2F4FE3',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonText: {color: '#fff', fontWeight: '600', fontSize: 16},
  dropdownText: {
    fontSize: 16,
    color: '#000',
  },
  priorityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  prioritySelectedRow: {
    borderColor: '#2F4FE3',
    backgroundColor: '#F4F6FF',
  },

  //   summaryRow: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'space-between',
  //   marginVertical: 12,
  // },

  // summaryInput: {
  //   flex: 1,
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   marginRight: 12,
  // },

  priorityMini: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },

  priorityMiniLabel: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'K2D-Medium',
    // marginBottom: 4,
    // right:'10%'
  },

  priorityPopup: {
    position: 'absolute',
    // right: '2%',
    // top: 20,
    left: '95%',

    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    zIndex: 999,
    flexDirection: 'row',
  },

  priorityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },

  priorityLabel: {
    fontSize: 10,
    fontWeight: '500',
  },

  priorityCircle: {
    width: 14,
    height: 14,
    borderRadius: 8,
  },

  prioritySelectedCircle: {
    borderWidth: 2,
    borderColor: '#2F4FE3',
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  dropdownBox: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 4,
  },
  dropdownRowPro: {marginVertical: 12},
  dropdownHeaderPro: {flexDirection: 'row', alignItems: 'center', gap: 8},
  dropdownBoxPro: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  dropdownItemPro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
  },
  dropdownTextPro: {color: '#000'},
  projectDot: {width: 10, height: 10, borderRadius: 5},
  searchInput: {
    borderBottomWidth: 1,
    margin: 8,
    paddingVertical: 4,
    color: '#555',
  },
});

export default AddTask;


import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReqHeader from '../../components/ReqHeader';
import {useTaskStore} from '../../store/useTaskStore';
import {
  fetchRequestTypes,
  fetchCategories,
  fetchGroups,
  fetchProjects,
  fetchSalesUsers,
  createTask,
} from '../../services/api/requests.api';

const PRIORITIES = [
  {id: '1', label: 'Urgent', color: '#E74C3C'},
  {id: '3', label: 'High', color: '#E67E22'},
  {id: '5', label: 'Medium', color: '#3498DB'},
  {id: '7', label: 'Low', color: '#2ECC71'},
  {id: '4', label: 'Minor', color: '#95A5A6'},
];

const projectColor = id => {
  const colors = ['#6C5CE7', '#00B894', '#0984E3', '#D63031', '#E84393'];
  return colors[id % colors.length];
};

const AddTask = ({navigation, isModal = false, onClose}) => {
  const queryClient = useQueryClient();
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);

  const {
    summary,
    setSummary,
    selectedRequestType,
    setSelectedRequestType,
    selectedCategory,
    setSelectedCategory,
    selectedGroup,
    setSelectedGroup,
    priority,
    setPriority,
    selectedProject,
    setSelectedProject,
    selectedSalesRep,
    setSelectedSalesRep,
    startDate,
    setStartDate,
    startTime,
    setStartTime,
    endDate,
    setEndDate,
    resetForm,
  } = useTaskStore();

  // 🔹 Fetch all dropdowns
  const {data: requestTypes = []} = useQuery(['requestTypes'], fetchRequestTypes);
  const {data: categories = []} = useQuery(['categories'], fetchCategories);
  const {data: groups = []} = useQuery(['groups'], fetchGroups);
  const {data: projects = []} = useQuery(['projects'], fetchProjects);
  const {data: salesUsers = []} = useQuery(['salesUsers'], fetchSalesUsers);

  const filteredSalesUsers = useMemo(() => {
    if (!selectedSalesRep) return salesUsers;
    return [
      selectedSalesRep,
      ...salesUsers.filter(u => u.id !== selectedSalesRep.id),
    ];
  }, [salesUsers, selectedSalesRep]);

  const filteredProjects = useMemo(() => {
    if (!selectedProject) return projects;
    return [selectedProject, ...projects.filter(p => p.id !== selectedProject.id)];
  }, [projects, selectedProject]);

  // 🔹 Mutation to create task
  const {mutate: createTaskMutate, isLoading: creating} = useMutation(createTask, {
    onSuccess: () => {
      Alert.alert('Success', 'Task created');
      resetForm();
      queryClient.invalidateQueries(['projects']); // optional refetch
      if (isModal) onClose();
      else navigation.goBack();
    },
    onError: () => Alert.alert('Error', 'Task not created'),
  });

  const combineDateAndTime = (date, time) => {
    const combined = new Date(date);
    combined.setHours(time.getHours());
    combined.setMinutes(time.getMinutes());
    combined.setSeconds(0);
    combined.setMilliseconds(0);
    return combined.toISOString();
  };

  const handleCreateTask = async () => {
    if (!summary || !selectedRequestType || !selectedCategory || !selectedGroup || !selectedProject) {
      Alert.alert('Error', 'Fill all fields');
      return;
    }

    await AsyncStorage.setItem('LAST_PROJECT', JSON.stringify(selectedProject));

    const payload = {
      Summary: summary,
      SalesRep_ID: {id: selectedSalesRep.id, identifier: selectedSalesRep.Name},
      StartDate: startDate.toISOString().split('T')[0] + 'T00:00:00Z',
      StartTime: combineDateAndTime(startDate, startTime),
      EndTime: endDate.toISOString(),
      R_RequestType_ID: {id: selectedRequestType.id},
      R_Category_ID: {id: selectedCategory.id},
      R_Group_ID: {id: selectedGroup.id},
      Priority: {id: priority.id},
      C_Project_ID: {id: selectedProject.id},
    };

    createTaskMutate(payload);
  };

  return (
    <>
      <ReqHeader title="Create Request" />
      <ScrollView style={{flex: 1, padding: '5%'}} keyboardShouldPersistTaps="handled">
        {/* Task Name */}
        <TextInput
          placeholder="Task Name..."
          value={summary}
          onChangeText={setSummary}
          style={{borderBottomWidth: 1, borderColor: '#ccc', fontSize: 18, padding: 8}}
        />

        {/* Priority */}
        <TouchableOpacity onPress={() => setPriority(PRIORITIES[2])} style={{marginVertical: 10}}>
          <Text>Priority: {priority.label}</Text>
        </TouchableOpacity>

        {/* Request Type Dropdown */}
        <TouchableOpacity onPress={() => setSelectedRequestType(requestTypes[0])}>
          <Text>Request Type: {selectedRequestType?.Name || 'Select'}</Text>
        </TouchableOpacity>

        {/* Category Dropdown */}
        <TouchableOpacity onPress={() => setSelectedCategory(categories[0])}>
          <Text>Category: {selectedCategory?.Name || 'Select'}</Text>
        </TouchableOpacity>

        {/* Group Dropdown */}
        <TouchableOpacity onPress={() => setSelectedGroup(groups[0])}>
          <Text>Group: {selectedGroup?.Name || 'Select'}</Text>
        </TouchableOpacity>

        {/* Project Dropdown */}
        <TouchableOpacity onPress={() => setSelectedProject(projects[0])}>
          <Text>Project: {selectedProject?.Name || 'Select'}</Text>
        </TouchableOpacity>

        {/* Sales Rep */}
        <TouchableOpacity onPress={() => setSelectedSalesRep(salesUsers[0])}>
          <Text>Sales Rep: {selectedSalesRep?.Name || 'Select'}</Text>
        </TouchableOpacity>

        {/* Dates */}
        <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
          <Text>Start Date: {startDate.toDateString()}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowStartTimePicker(true)}>
          <Text>Start Time: {startTime.toLocaleTimeString()}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
          <Text>End Date: {endDate.toDateString()}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCreateTask}
          style={{backgroundColor: '#2F4FE3', padding: 12, borderRadius: 8, marginTop: 20}}>
          <Text style={{color: '#fff', fontWeight: '600'}}>{creating ? 'Creating...' : 'Create Task'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

export default AddTask;

