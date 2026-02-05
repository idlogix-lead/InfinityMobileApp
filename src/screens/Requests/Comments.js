import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import dayjs from 'dayjs';

import {useSendTaskMessage, useMyComments} from '../../hooks/useRequests';
import {useAuthStore} from '../../store/authStore';

const Comments = () => {
  const userName = useAuthStore(state => state.userName);

  const [replyText, setReplyText] = useState('');
  const [replyingToTask, setReplyingToTask] = useState(null);

  // ✅ Fetch mentioned comments directly
  const {data: comments = [], isLoading, refetch} = useMyComments(userName);
  const {mutateAsync: sendTaskMessageApi} = useSendTaskMessage();

  // ================= SEND REPLY =================
  const handleSendReply = async taskId => {
    if (!replyText.trim()) return;

    try {
      await sendTaskMessageApi({
        taskId,
        message: replyText,
      });

      setReplyText('');
      setReplyingToTask(null);
      refetch();
    } catch (err) {
      console.log('Reply Error:', err);
    }
  };

  // ================= HIGHLIGHT @USERNAME =================
  const renderCommentText = text => {
    const regex = /@\w+/g;
    const parts = text.split(regex);
    const matches = text.match(regex);

    return (
      <Text style={styles.commentText}>
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {part}
            {matches?.[i] && (
              <Text style={styles.mentionText}>{matches[i]}</Text>
            )}
          </React.Fragment>
        ))}
      </Text>
    );
  };

  // ================= RENDER COMMENT =================
  const renderItem = ({item}) => {
    const taskId = item.R_Request_ID?.id;

    return (
      <View style={styles.commentCard}>
        <View style={styles.commentHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.CreatedBy?.identifier?.[0] || 'U'}
            </Text>
          </View>

          <View style={{flex: 1, marginLeft: 10}}>
            <Text style={styles.commentUser}>
              {item.CreatedBy?.identifier || 'User'}
            </Text>
            <Text style={styles.commentTime}>
              {dayjs(item.Created).format('DD MMM YYYY, hh:mm A')}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              setReplyingToTask(replyingToTask === taskId ? null : taskId)
            }>
            <MaterialIcons name="reply" size={20} color="#2F4FE3" />
          </TouchableOpacity>
        </View>

        {renderCommentText(item.Result)}

        {/* ================= Reply Box ================= */}
        {replyingToTask === taskId && (
          <View style={styles.replyBox}>
            <TextInput
              style={styles.replyInput}
              placeholder="Reply..."
              value={replyText}
              onChangeText={setReplyText}
              multiline
            />
            <TouchableOpacity onPress={() => handleSendReply(taskId)}>
              <MaterialIcons name="send" size={22} color="#2F4FE3" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // ================= LOADING =================
  if (isLoading)
    return (
      <ActivityIndicator size="large" color="#2F4FE3" style={{marginTop: 50}} />
    );

  return (
    <View style={styles.container}>
      <FlatList
        data={comments}
        keyExtractor={item => item.uid}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Image
              source={require('../../asserts/RequestAsserts/emptyComments.jpeg')}
              style={{height: 200, width: 200}}
            />
            <Text style={styles.emptySubtitle}>
              @username mentions will appear here
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default Comments;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
    // backgroundColor: '#f9f9f9',
  },
  commentCard: {
    backgroundColor: '#F9F8F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  commentHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 6},
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2F4FE3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {color: '#fff', fontWeight: 'bold', fontSize: 14},
  commentUser: {fontWeight: '600', fontSize: 14, color: '#333'},
  commentTime: {fontSize: 11, color: '#999'},
  commentText: {fontSize: 14, color: '#333', marginTop: 4, lineHeight: 20},
  mentionText: {color: '#2F4FE3', fontWeight: '600'},
  replyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  replyInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 4,
    color: '#333',
    fontFamily: 'K2D-Medium',
  },
  sendBtn: {
    // backgroundColor: '#2F4FE3',
    paddingVertical: 6,
    // paddingHorizontal: 14,
    // borderRadius: 6,
    // marginLeft: 6,
  },
  sendText: {color: '#fff', fontWeight: '600'},
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '20%',
    paddingHorizontal: 20,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#777',
    marginTop: 10,
    textAlign: 'center',
  },
});
