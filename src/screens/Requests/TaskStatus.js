import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import ReqHeader from '../../components/ReqHeader';
import {
  useReqStatus,
  useUpdateTask,
  useGroups,
  useCategories,
} from '../../hooks/useRequests';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

const TaskStatus = ({route}) => {
  const {title, tasks} = route.params;
  const navigation = useNavigation();

  const {data: reqStatus = []} = useReqStatus();
  const {data: categories = []} = useCategories();
  const {data: groups = []} = useGroups();

  const {mutateAsync: updateTask} = useUpdateTask();

  const [expandedId, setExpandedId] = useState(null);
  const [openStatusFor, setOpenStatusFor] = useState(null);
  const [openEndTimeFor, setOpenEndTimeFor] = useState(null);

  // ✅ SAME AS TaskDetail
  const [editableTasks, setEditableTasks] = useState({});

  // ---------------- INIT EDITABLE TASKS ----------------
  useEffect(() => {
    if (!tasks?.length) return;

    const initial = {};
    tasks.forEach(task => {
      initial[task.uid] = {
        Status: task.R_Status_ID?.identifier || '',
        StatusSearch: task.R_Status_ID?.identifier || '',
        EndTime: task.EndTime || null,
      };
    });

    setEditableTasks(initial);
  }, [tasks]);

  // ---------------- HELPER ----------------
  const updateEditableTask = (uid, updates) => {
    setEditableTasks(prev => ({
      ...prev,
      [uid]: {
        ...prev[uid],
        ...updates,
      },
    }));
  };

  // ---------------- STATUS UPDATE ----------------
  const handleUpdateStatus = async (task, statusItem) => {
    const identifier = `${statusItem.SeqNo}_${statusItem.Name}`;

    // 1️⃣ UI FIRST
    updateEditableTask(task.uid, {
      Status: identifier,
      StatusSearch: identifier,
    });

    setOpenStatusFor(null);

    try {
      // 2️⃣ API
      await updateTask({
        taskId: task.id,
        payload: {R_Status_ID: statusItem.id},
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  // ---------------- END DATE UPDATE ----------------
  const handleUpdateEndTime = async (task, selectedDate) => {
    if (!selectedDate) return;

    const iso = moment(selectedDate).format('YYYY-MM-DD[T]HH:mm:ss[Z]');

    // 1️⃣ UI FIRST
    updateEditableTask(task.uid, {EndTime: iso});
    setOpenEndTimeFor(null);

    try {
      // 2️⃣ API
      await updateTask({
        taskId: task.id,
        payload: {EndTime: iso},
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to update end date');
    }
  };

  // ---------------- RENDER ITEM ----------------
  const renderItem = ({item}) => {
    const isOpen = expandedId === item.uid;
    const editable = editableTasks[item.uid] || {};

    const status = editable.Status || '—';
    const priority = item?.Priority?.identifier || '—';
    const RequestType = item?.R_RequestType_ID?.identifier || '—';
    const category =
      categories.find(c => c.id === item?.R_Category_ID?.id)?.Name || '—';

    const group = groups.find(g => g.id === item?.R_Group_ID?.id)?.Name || '—';

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => setExpandedId(isOpen ? null : item.uid)}>
        {/* HEADER */}
        <View style={styles.cardHeader}>
          <MaterialIcons
            name={isOpen ? 'arrow-drop-down' : 'arrow-right'}
            size={26}
            color="#555"
          />
          <Text style={styles.title} numberOfLines={1}>
            #{item.DocumentNo}
          </Text>
        </View>

        {/* EXPANDED */}
        {isOpen && (
          <TouchableOpacity
            onPress={() => navigation.navigate('TaskDetail', {task: item})}>
            <View>
              <View style={styles.divider} />

              <View style={styles.rowBetween}>
                <Text style={styles.summary} numberOfLines={4}>
                  {item.Summary}
                </Text>

                <View style={styles.priorityBadge}>
                  <Text style={styles.priorityText}>{RequestType}</Text>
                </View>
              </View>

              {/* CATEGORY & GROUP */}
              <View>
                <Text style={styles.cgValue}>
                  Category: <Text style={styles.cgLabel}>{category}</Text>
                </Text>
                <Text style={styles.cgValue}>
                  Group: <Text style={styles.cgLabel}>{group}</Text>
                </Text>
              </View>

              {/* STATUS + PRIORITY */}
              <View style={styles.statusRow}>
                <View>
                  <TouchableOpacity
                    style={[styles.valueHolder, {backgroundColor: '#E8F0FE'}]}
                    onPress={() =>
                      setOpenStatusFor(
                        openStatusFor === item.uid ? null : item.uid,
                      )
                    }>
                    <Text style={[styles.value, {color: '#1A73E8'}]}>
                      {status}
                    </Text>
                  </TouchableOpacity>

                  {openStatusFor === item.uid && (
                    <View style={styles.inlineDropdown}>
                      {reqStatus.map(st => (
                        <TouchableOpacity
                          key={st.id}
                          style={styles.inlineOption}
                          onPress={() => handleUpdateStatus(item, st)}>
                          <Text style={styles.inlineOptionText}>
                            {st.SeqNo}_{st.Name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View
                  style={[styles.valueHolder, {backgroundColor: '#FFF4CC'}]}>
                  <Text style={[styles.value, {color: '#8A6D00'}]}>
                    {priority}
                  </Text>
                </View>
              </View>

              {/* END DATE */}
              <View style={styles.footer}>
                <TouchableOpacity
                  onPress={() =>
                    setOpenEndTimeFor(
                      openEndTimeFor === item.uid ? null : item.uid,
                    )
                  }>
                  <Text style={styles.dateText}>
                    Closed:{' '}
                    {editable.EndTime
                      ? new Date(editable.EndTime).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Set date'}
                  </Text>
                </TouchableOpacity>

                {openEndTimeFor === item.uid && (
                  <DateTimePicker
                    value={
                      editable.EndTime ? new Date(editable.EndTime) : new Date()
                    }
                    mode="date"
                    display="default"
                    onChange={(e, d) => d && handleUpdateEndTime(item, d)}
                  />
                )}

                <MaterialIcons
                  name="arrow-forward-ios"
                  size={15}
                  color="#555"
                  onPress={() =>
                    navigation.navigate('TaskDetail', {task: item})
                  }
                />
              </View>
            </View>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ReqHeader title={`${title} Tasks`} />

      <FlatList
        data={tasks}
        keyExtractor={item => item.uid}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 30, marginTop: 20}}
        ListEmptyComponent={
          <Text style={styles.empty}>No {title} tasks found</Text>
        }
      />
    </View>
  );
};

export default TaskStatus;

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F9F8F6'},
  card: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: '7%',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontFamily: 'K2D-Medium',
    color: '#000',
    marginLeft: 6,
    flex: 1,
  },
  cgLabel: {
    fontSize: 13,
    color: '#888',
    fontFamily: 'K2D-Medium',
  },

  cgValue: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'K2D-SemiBold',
    // textAlign: 'center',
  },
  divider: {height: 1, backgroundColor: '#E5E5E5', marginVertical: 10},
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summary: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'K2D-SemiBold',
    color: '#333',
    marginRight: 10,
  },
  priorityBadge: {
    backgroundColor: '#3498DB33',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  priorityText: {
    fontSize: 12,
    color: '#2F4FE3',
    fontFamily: 'K2D-Bold',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  valueHolder: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  value: {
    fontSize: 13,
    fontFamily: 'K2D-Medium',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'K2D-Medium',
  },
  inlineDropdown: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  inlineOption: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  inlineOptionText: {
    fontSize: 13,
    fontFamily: 'K2D-Medium',
    color: '#333',
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    color: '#777',
    fontFamily: 'K2D-Medium',
  },
});
