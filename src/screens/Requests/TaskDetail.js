import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Linking,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DocumentPicker from 'react-native-document-picker';
import io from 'socket.io-client';
import DateTimePicker from '@react-native-community/datetimepicker';

const TaskDetail = ({route}) => {
  const {task} = route.params;
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [attachments, setAttachments] = useState([]);
  const [message, setMessage] = useState('');
  const flatListRef = useRef(null);
  const socketRef = useRef(null);
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [subtaskName, setSubtaskName] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const inputRef = useRef(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [reactionPickerFor, setReactionPickerFor] = useState(null);

  const [subtasks, setSubtasks] = useState([
    {id: 1, title: 'Call customer for clarification', done: false},
    {id: 2, title: 'Prepare quotation', done: true},
  ]);
  const toggleSubtask = id => {
    setSubtasks(prev =>
      prev.map(item => (item.id === id ? {...item, done: !item.done} : item)),
    );
  };

  const dummyAttachments = [
    {id: 1, name: 'Invoice.pdf'},
    {id: 2, name: 'Screenshot.png'},
    {id: 3, name: 'Requirement.docx'},
  ];

  const openFileManager = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      const file = res[0];

      const newAttachment = {
        id: Date.now(), // temporary id
        name: file.name,
        uri: file.uri,
        type: file.type,
        size: file.size,
      };

      setAttachments(prev => [...prev, newAttachment]);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled picker');
      } else {
        console.log('Picker error:', err);
      }
    }
  };

  // useEffect(() => {
  //   fetchUpdates();
  // }, []);
  /* -------------------- INITIAL LOAD -------------------- */
  useEffect(() => {
    fetchUpdates();
    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  /* -------------------- FETCH OLD CHAT -------------------- */
  // const fetchUpdates = async () => {
  //   try {
  //     const token = await AsyncStorage.getItem('token');
  //     const protocol = await AsyncStorage.getItem('protocol');
  //     const host = await AsyncStorage.getItem('host');
  //     const port = await AsyncStorage.getItem('port');

  //     const res = await axios.get(
  //       `${protocol}://${host}:${port}/api/v1/models/R_RequestUpdate?filter=[["R_Request_ID.id","=",${task.id}]]`,
  //       {headers: {Authorization: `Bearer ${token}`}},
  //     );

  //     setUpdates(res.data.records || []);
  //   } catch (e) {
  //     console.log('fetchUpdates error:', e);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchUpdates = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const protocol = await AsyncStorage.getItem('protocol');
      const host = await AsyncStorage.getItem('host');
      const port = await AsyncStorage.getItem('port');
      const userId = await AsyncStorage.getItem('userId');
      const clientId = await AsyncStorage.getItem('clientId');

      const res = await axios.get(
        `${protocol}://${host}:${port}/api/v1/models/R_RequestUpdate?filter=[["R_Request_ID.id","=",${task.id}],"and",["CreatedBy.id","=",${userId}]]`,
        {headers: {Authorization: `Bearer ${token}`}},
      );

      setUpdates(res.data.records || []);
    } catch (e) {
      console.log('fetchUpdates error:', e);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- SOCKET -------------------- */
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

    // ✅ ONLY append saved record from backend
    // socketRef.current.on('taskUpdate', update => {
    //   setUpdates(prev => {
    //     if (prev.find(u => u.id === update.id)) return prev;
    //     return [...prev, update];
    //   });
    socketRef.current.on('taskUpdate', update => {
      setUpdates(prev => {
        if (prev.find(u => u.id === update.id)) return prev;
        return [...prev, update];
      });

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100);
    });
  };

  /* -------------------- SEND MESSAGE (HYBRID) -------------------- */
  // const sendMessage = async () => {
  //   if (!message.trim()) return;

  //   try {
  //     const token = await AsyncStorage.getItem('token');
  //     const protocol = await AsyncStorage.getItem('protocol');
  //     const host = await AsyncStorage.getItem('host');
  //     const port = await AsyncStorage.getItem('port');

  //     // ✅ 1. SAVE TO DATABASE
  //     await axios.post(
  //       `${protocol}://${host}:${port}/api/v1/models/R_RequestUpdate`,
  //       {
  //         R_Request_ID: {id: task.id},
  //         Result: message,
  //       },
  //       {headers: {Authorization: `Bearer ${token}`}},
  //     );

  //     // ✅ 2. NOTIFY OTHERS (backend will emit saved record)
  //     socketRef.current?.emit('refreshTask', {taskId: task.id});

  //     setMessage('');
  //   } catch (e) {
  //     console.log('sendMessage error:', e);
  //     Alert.alert('Error', 'Message not sent');
  //   }
  // };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const tempMessage = {
      id: Date.now(), // temporary id
      Result: message,
      Created: new Date().toISOString(),
      CreatedBy: {identifier: 'You'},
    };

    // ✅ INSTANT UI UPDATE
    setUpdates(prev => [...prev, tempMessage]);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({animated: true});
    }, 100);

    setMessage('');

    try {
      const token = await AsyncStorage.getItem('token');
      const protocol = await AsyncStorage.getItem('protocol');
      const host = await AsyncStorage.getItem('host');
      const port = await AsyncStorage.getItem('port');

      await axios.post(
        `${protocol}://${host}:${port}/api/v1/models/R_RequestUpdate`,
        {
          R_Request_ID: {id: task.id},
          Result: tempMessage.Result,
        },
        {headers: {Authorization: `Bearer ${token}`}},
      );

      socketRef.current?.emit('refreshTask', {taskId: task.id});
    } catch (e) {
      console.log('sendMessage error:', e);
      Alert.alert('Error', 'Message not sent');
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

    const str = identifier + (uniqueId || ''); // combine with unique ID
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <View style={{flex: 1}}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{paddingBottom: 120}}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back-ios" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{task.Summary}</Text>
        {/* <View style={styles.divider} /> */}
        <View style={[styles.divider, {backgroundColor: '#ccc'}]} />

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
              {task.EndTime
                ? new Date(task.EndTime).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : '—'}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, {marginVertical: 5}]} />
        <View style={styles.descRow}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text style={styles.descLabel}>Description</Text>
            <MaterialIcons name="edit" size={18} color={'#555'} />
          </View>
          <Text style={styles.label}>
            {task.LastResult || 'Description here'}
          </Text>
        </View>
        <View style={[styles.divider, {backgroundColor: '#ccc'}]} />

        {/* Subtasks */}
        <View style={styles.section}>
          {/* Header */}
          <View style={styles.asanaHeader}>
            <Text style={styles.asanaTitle}>Subtasks</Text>

            <TouchableOpacity
              style={styles.asanaPlusBtn}
              onPress={() => setShowSubtaskModal(true)}>
              <MaterialIcons name="add" size={18} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Empty state input (ONLY when no subtasks) */}
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

          {/* Subtask list */}
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

        <View style={[styles.divider, {backgroundColor: '#ccc'}]} />

        {/* Attachments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {/* <MaterialIcons name="attach-file" size={18} color="#3498DB" /> */}
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
        <View style={[styles.divider, {backgroundColor: '#ccc'}]} />

        {/* Updates */}
        {/* <View style={{marginBottom: 20}}>
          <Text style={styles.updatesHeader}>Comments</Text>
          {loading ? (
            <Text>Loading...</Text>
          ) : updates.length === 0 ? (
            <Text style={styles.noUpdate}>No updates yet</Text>
          ) : (
            <View style={styles.updatesContainer}>
              {updates.map(item => (
                <View key={item.id} style={styles.updateCard}>
                  <View style={styles.updateHeader}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <MaterialIcons name="person" size={16} color="#3498DB" />
                      <Text style={styles.updateUser}>
                        {item.CreatedBy?.identifier || 'Unknown'}
                      </Text>
                    </View>
                    <Text style={styles.updateDate}>
                      {new Date(item.Created).toLocaleString()}
                    </Text>
                  </View>
                  <Text style={styles.updateText}>{item.Result}</Text>
                </View>
              ))}
            </View>
          )}
        </View> */}
        <View style={styles.activityContainer}>
          {/* HEADER */}
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>All activity</Text>
            <MaterialIcons name="keyboard-arrow-down" size={20} color="#555" />
          </View>

          {updates.map(item => (
            <View key={item.id} style={styles.activityItem}>
              {/* LEFT AVATAR */}
              {/* <View
                style={[
                  styles.avatar,
                  {backgroundColor: getAvatarColor(item.CreatedBy?.identifier)},
                ]}>
                <Text style={styles.avatarText}>
                  {item.CreatedBy?.identifier
                    ?.split(' ')
                    .map(w => w[0])
                    .slice(0, 2) // take first two words
                    .join(' ') // join them with a space
                    .toUpperCase() || 'FN'}
                </Text>
              </View> */}
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

              {/* RIGHT CONTENT */}
              <View style={styles.activityContent}>
                {/* NAME + ACTION */}
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>
                    {item.CreatedBy?.identifier || 'User'}
                  </Text>
                  <Text style={styles.actionText}> added a comment</Text>
                </View>

                {/* TIME */}
                <Text style={styles.timeText}>
                  {new Date(item.Created).toLocaleString()}
                </Text>

                {/* MESSAGE BUBBLE */}
                {item.Result && (
                  <View style={styles.messageBubble}>
                    <Text style={styles.messageText}>{item.Result}</Text>
                  </View>
                )}

                {/* REACTION */}
                <View style={styles.reactionChip}>
                  {/* <Text style={styles.reactionText}>🙂 React</Text> */}
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
                          // handle react
                          console.log('Reacted', emoji, 'to', item.id);
                          setReactionPickerFor(null);
                        }}>
                        <Text style={styles.emoji}>{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* MORE ICON */}
              {/* <MaterialIcons
                name="more-horiz"
                size={20}
                color="#999"
                style={{marginTop: 4}}
              /> */}
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
      </ScrollView>

      {/* Chat input fixed */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.fixedChatWrapper}>
        {/* TOP SHADOW */}
        <View style={styles.chatShadow} />

        {/* INPUT ROW */}
        <View style={styles.fixedChatInput}>
          <TextInput
            ref={inputRef}
            placeholder="Ask a question or post an update..."
            value={message}
            onChangeText={setMessage}
            style={styles.fixedInput}
            placeholderTextColor="#aaa"
            multiline
          />

          <TouchableOpacity onPress={sendMessage}>
            <MaterialIcons name="send" size={22} color="#2F4FE3" />
          </TouchableOpacity>
        </View>

        {/* ACTION ROW */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={openFileManager}>
            <MaterialIcons name="attach-file" size={22} color="#999" />
            {/* <Text style={styles.actionText}>Attachment</Text> */}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => inputRef.current?.focus()}>
            <MaterialIcons name="emoji-emotions" size={22} color="#999" />
            <Text style={styles.actionText}></Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* <View style={styles.chatInputRow}>
          <TextInput
            placeholder="Ask a question or post an update..."
            value={message}
            onChangeText={setMessage}
            style={styles.chatInput}
            placeholderTextColor="#ccc"
          />
          <TouchableOpacity onPress={sendMessage}>
            <MaterialIcons name="send" size={22} color="#2F4FE3" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView> */}
      <Modal
        visible={showSubtaskModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSubtaskModal(false)}>
        {/* OUTSIDE TAP TO CLOSE */}
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSubtaskModal(false)}
        />

        {/* BOTTOM SHEET */}
        <View style={styles.bottomSheet}>
          {/* TITLE */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Task</Text>
            <MaterialIcons name="check" size={18} color="#3498DB" />
          </View>

          {/* INPUT */}
          <TextInput
            placeholder="Subtask name"
            value={subtaskName}
            onChangeText={setSubtaskName}
            style={styles.modalInput}
            placeholderTextColor="#999"
          />

          {/* ASSIGNED */}
          <TouchableOpacity style={styles.modalRow}>
            <MaterialIcons name="person-outline" size={20} color="#666" />
            <Text style={styles.modalRowText}>Assigned</Text>
          </TouchableOpacity>

          {/* DUE DATE */}
          <TouchableOpacity
            style={styles.modalRow}
            onPress={() => setShowDatePicker(true)}>
            <MaterialIcons name="event" size={20} color="#666" />
            <Text style={styles.modalRowText}>
              {dueDate ? new Date(dueDate).toLocaleDateString() : 'Due date'}
            </Text>
          </TouchableOpacity>

          {/* CREATE BUTTON */}
          {/* <TouchableOpacity
            style={styles.createBtn}
            onPress={() => {
              // create subtask logic later
              setShowSubtaskModal(false);
            }}>
            <Text style={styles.createBtnText}>Create</Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => {
              if (!subtaskName.trim()) {
                Alert.alert('Required', 'Please enter subtask name');
                return;
              }

              const newSubtask = {
                id: Date.now(),
                title: subtaskName,
                done: false,
                dueDate,
              };

              setSubtasks(prev => [...prev, newSubtask]);

              // reset
              setSubtaskName('');
              setDueDate(null);
              setShowSubtaskModal(false);
            }}>
            <Text style={styles.createBtnText}>Create</Text>
          </TouchableOpacity>
        </View>
        {showDatePicker && (
          <DateTimePicker
            value={dueDate ? new Date(dueDate) : new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDueDate(selectedDate.toISOString());
              }
            }}
          />
        )}
      </Modal>
      <Modal
        visible={showOptionsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOptionsModal(false)}>
        {/* OUTSIDE TAP TO CLOSE */}
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowOptionsModal(false)}
        />

        {/* BOTTOM FIXED OPTIONS */}
        <View style={styles.bottomOptionsModal}>
          <TouchableOpacity
            style={styles.optionBtn}
            onPress={() => {
              console.log('Pin to top:', selectedActivity);
              setShowOptionsModal(false);
            }}>
            <Text style={styles.optionText}>Pin to top</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionBtn}
            onPress={() => {
              console.log('Copy comment:', selectedActivity);
              setShowOptionsModal(false);
            }}>
            <Text style={styles.optionText}>Copy comment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionBtn}
            onPress={() => {
              console.log('Edit comment:', selectedActivity);
              setShowOptionsModal(false);
            }}>
            <Text style={styles.optionText}>Edit comment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionBtn}
            onPress={() => {
              console.log('Delete comment:', selectedActivity);
              setShowOptionsModal(false);
            }}>
            <Text style={styles.optionText}>Delete comment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionBtn}
            onPress={() => {
              console.log('Copy comment link:', selectedActivity);
              setShowOptionsModal(false);
            }}>
            <Text style={styles.optionText}>Copy comment link</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default TaskDetail;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F7FA', padding: '6%'},
  header: {paddingVertical: '4%'},
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

  betweenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginTop: 12,
    paddingHorizontal: '10%',
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
    // marginTop: 3,
    // fontSize: 13,
    // color: '#2F4FE3',
    // color: '#555',
    // fontFamily: 'K2D-Bold',
    // paddingHorizontal: '2%',
    // textAlign: 'center',
    marginLeft: 6,
    fontSize: 13,
    // color: '#2ECC71',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },

  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 16,
    fontFamily: 'K2D-Bold',
    color: '#333',
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
    backgroundColor: '#fff',
    paddingHorizontal: '5%',
    paddingVertical: '7%',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },

  fixedInput: {
    flex: 1,
    minHeight: 50,
    maxHeight: 100,
    fontFamily: 'K2D-Medium',
    color: '#333',
    paddingRight: 10,
  },
  actionRow: {
    flexDirection: 'row',
    // justifyContent: 'space-around',
    gap: 20,
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    paddingHorizontal: '5%',
    marginTop: '-7%',
    // paddingVertical: 8,
    // borderTopWidth: 1,
    // borderColor: '#eee',
  },

  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#555',
    fontFamily: 'K2D-Medium',
  },
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
    fontSize: 12,
    fontFamily: 'K2D-Bold',
    color: '#2F4FE3',
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {color: '#fff', fontWeight: 'bold'},
  modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.3)'},
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
});
