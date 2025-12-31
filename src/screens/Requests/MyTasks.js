import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';

/* ---------------- PRIORITIES ---------------- */
const PRIORITIES = [
  {id: '1', label: 'Urgent', color: '#E74C3C', icon: 'priority-high'},
  {id: '3', label: 'High', color: '#E67E22', icon: 'trending-up'},
  {id: '5', label: 'Medium', color: '#3498DB', icon: 'remove'},
  {id: '7', label: 'Low', color: '#2ECC71', icon: 'trending-down'},
  {id: '4', label: 'Minor', color: '#95A5A6', icon: 'low-priority'},
];

const Requests = () => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [allRequests, setAllRequests] = useState([]);
  const [userName, setUserName] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  const today = dayjs().startOf('day');

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    fetchMyRequests();
    getUserName();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  /* ---------------- API ---------------- */

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const protocol = await AsyncStorage.getItem('protocol');
      const host = await AsyncStorage.getItem('host');
      const port = await AsyncStorage.getItem('port');
      const userId = Number(await AsyncStorage.getItem('userId'));

      const res = await axios.get(
        `${protocol}://${host}:${port}/api/v1/models/R_Request`,
        {headers: {Authorization: `Bearer ${token}`}},
      );

      const my = res?.data?.records?.filter(r => r?.SalesRep_ID?.id === userId);

      setAllRequests(my || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = async () => {
    const name = await AsyncStorage.getItem('userName');
    setUserName(name || '');
  };

  /* ---------------- ASANA STYLE LOGIC ---------------- */

  const activeTasks = allRequests.filter(
    t => t.R_Status_ID?.identifier !== '9_Final Close',
  );

  const overdue = activeTasks.filter(
    t => t.DateCompletePlan && dayjs(t.DateCompletePlan).isBefore(today),
  );

  const todayTasks = activeTasks.filter(
    t => t.DateCompletePlan && dayjs(t.DateCompletePlan).isSame(today, 'day'),
  );

  const upcoming = activeTasks.filter(
    t => t.DateCompletePlan && dayjs(t.DateCompletePlan).isAfter(today),
  );

  const later = activeTasks.filter(t => !t.DateCompletePlan);

  const recents = [...allRequests]
    .sort(
      (a, b) =>
        new Date(b.Updated || b.DateLastAction) -
        new Date(a.Updated || a.DateLastAction),
    )
    .slice(0, 5);

  /* ---------------- UI HELPERS ---------------- */

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Morning';
    if (h < 17) return 'Afternoon';
    if (h < 21) return 'Evening';
    return 'Night';
  };

  const TaskItem = ({item, showStatus}) => (
    <TouchableOpacity style={styles.taskItem}>
      <View style={styles.left}>
        <View style={styles.checkbox} />
        <Text style={styles.taskTitle} numberOfLines={2}>
          {item.Summary}
        </Text>
      </View>
      <View style={styles.right}>
        {showStatus && (
          <Text style={styles.status}>{item.R_Status_ID?.identifier}</Text>
        )}
        {item.DateCompletePlan && (
          <Text style={styles.date}>
            {dayjs(item.DateCompletePlan).format('DD MMM')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const Section = ({title, data}) => {
    if (!data.length) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {data.map(item => (
          <TaskItem key={item.uid} item={item} />
        ))}
      </View>
    );
  };

  /* ---------------- LOADER ---------------- */

  if (loading) {
    return <ActivityIndicator size="large" color="#2F4FE3" style={{flex: 1}} />;
  }

  /* ---------------- RENDER ---------------- */

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={20} color={'#333'}/>
        </TouchableOpacity>
        <Text style={styles.requestTitle}>My Requests</Text>
        <View style={{width: 20}} />
      </View>

      {/* TOP CARD */}
      <View style={styles.topCard}>
        <View style={styles.profileBorder}>
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
            }}
            style={styles.profileImage}
          />
        </View>

        <Text style={styles.userName}>
          Good {getGreeting()}, {userName}
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {PRIORITIES.map(p => (
            <View key={p.id} style={styles.priorityItem}>
              <MaterialIcons name={p.icon} size={26} color={p.color} />
              <Text style={styles.priorityText}>{p.label}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* ---------------- MY TASKS ---------------- */}
      <Text style={styles.mainHeader}>My Tasks</Text>
      <Section title="Overdue" data={overdue} />
      <Section title="Today" data={todayTasks} />
      <Section title="Upcoming" data={upcoming} />
      <Section title="Later" data={later} />

      {/* ---------------- RECENTS ---------------- */}
      <Text style={styles.mainHeader}>Recents</Text>
      {recents.map(item => (
        <TaskItem key={item.uid + '_r'} item={item} showStatus />
      ))}
    </ScrollView>
  );
};

export default Requests;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F7FA', padding: 16},

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  requestTitle: {fontSize: 20, fontWeight: '600'},

  topCard: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 20,
  },

  profileBorder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#ccc',
    position: 'absolute',
    top: -32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileImage: {width: 58, height: 58, borderRadius: 29},

  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },

  mainHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 12,
  },

  section: {marginBottom: 16},

  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#777',
    marginBottom: 6,
  },

  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
  },

  left: {flexDirection: 'row', flex: 1, gap: 10},

  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#aaa',
  },

  taskTitle: {flex: 1, fontSize: 14},

  right: {alignItems: 'flex-end'},

  date: {fontSize: 12, color: '#777'},

  status: {fontSize: 12, color: '#999'},

  priorityItem: {
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 10,
  },

  priorityText: {fontSize: 12},
});
