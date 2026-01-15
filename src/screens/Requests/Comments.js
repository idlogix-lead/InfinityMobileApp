import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import axios from 'axios';
import dayjs from 'dayjs';

const Comments = ({requestId}) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    getUserName();
    fetchComments();
  }, []);

  const getUserName = async () => {
    const name = await AsyncStorage.getItem('userName');
    setUserName(name || '');
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(
        `http://116.58.53.114:9999/api/v1/models/R_RequestUpdate`,
        {headers: {Authorization: `Bearer ${token}`}},
      );

      // Filter comments where current user is mentioned
      //   const filtered = res.data.records.filter(c =>
      //     c.Result?.toLowerCase().includes(userName.toLowerCase()),
      //   );
      const filtered = res.data.records.filter(c =>
        c.Result?.match(new RegExp(`@${userName}\\b`, 'i')),
      );

      setComments(filtered);
    } catch (e) {
      console.log('Fetch Comments Error:', e);
    } finally {
      setLoading(false);
    }
  };

  const postReply = async () => {
    if (!replyText) return;

    try {
      const token = await AsyncStorage.getItem('token');
      const payload = {
        R_Request_ID: requestId,
        Result: replyText,
        Parent_ID: replyingTo?.id || null,
      };

      await axios.post(
        `http://116.58.53.114:9999/api/v1/models/R_RequestUpdate`,
        payload,
        {headers: {Authorization: `Bearer ${token}`}},
      );

      setReplyText('');
      setReplyingTo(null);
      fetchComments();
    } catch (e) {
      console.log('Post Reply Error:', e);
    }
  };

  const renderItem = ({item}) => (
    <View style={styles.commentItem}>
      <Text style={styles.commentText}>{item.Result}</Text>
      <Text style={styles.commentTime}>
        {dayjs(item.Created).format('DD MMM YYYY, hh:mm A')}
      </Text>
      <TouchableOpacity
        onPress={() => setReplyingTo(item)}
        style={styles.replyBtn}>
        <Text style={styles.replyBtnText}>Reply</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color="#2F4FE3" />;

  return (
    <View style={styles.container}>
      <FlatList
        data={comments}
        keyExtractor={item => item.uid}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons
              name="comments-disabled"
              color={'#E74C3C77'}
              size={60}
            />
            <Text style={styles.emptyTitle}>No comments mentioning you</Text>
            <Text style={styles.emptySubtitle}>
              Comments where you are mentioned with @username will appear here.
            </Text>
          </View>
        }
      />

      {/* <View style={styles.inputWrapper}>
        {replyingTo && (
          <Text style={styles.replyingToText}>
            Replying to: {replyingTo.Result}
          </Text>
        )}
        <TextInput
          style={styles.input}
          value={replyText}
          onChangeText={setReplyText}
          placeholder="Write a reply..."
        />
        <TouchableOpacity style={styles.sendBtn} onPress={postReply}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );
};

export default Comments;

const styles = StyleSheet.create({
  container: {flex: 1},
  commentItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  commentText: {fontSize: 14, color: '#333', marginBottom: 6},
  commentTime: {fontSize: 11, color: '#999'},
  replyBtn: {marginTop: 6},
  replyBtnText: {color: '#2F4FE3', fontSize: 12},
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  input: {flex: 1, paddingVertical: 8, fontSize: 14},
  sendBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#2F4FE3',
    borderRadius: 6,
  },
  sendText: {color: '#fff', fontSize: 14},
  replyingToText: {fontSize: 12, color: '#555', marginBottom: 4},
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '15%', // optional: move it a bit down
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#777',
    marginTop: '3%',
    marginBottom:'5%',
    textAlign: 'center',
  },
});
