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
  Modal,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';

const PRIORITIES = [
  {id: '1', label: 'Urgent', color: '#E74C3C', icon: 'priority-high'},
  {id: '3', label: 'High', color: '#E67E22', icon: 'trending-up'},
  {id: '5', label: 'Medium', color: '#3498DB', icon: 'remove'},
  {id: '7', label: 'Low', color: '#2ECC71', icon: 'trending-down'},
  {id: '4', label: 'Minor', color: '#95A5A6', icon: 'low-priority'},
];

const Requests = () => {
  const [loading, setLoading] = useState(true);
  const [allRequests, setAllRequests] = useState([]);
  const [userName, setUserName] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [dueTasks, setDueTasks] = useState([]);
  const today = dayjs().startOf('day');
  const [activeSection, setActiveSection] = useState('today');
  const [sectionModal, setSectionModal] = useState(false);
  const navigation = useNavigation();
  const SECTIONS = [
    {key: 'overdue', label: 'Overdue', icon: 'warning'},
    {key: 'today', label: 'Today', icon: 'today'},
    {key: 'upcoming', label: 'Upcoming', icon: 'event'},
    {key: 'later', label: 'Later', icon: 'schedule'},
  ];

  useEffect(() => {
    fetchMyRequests();
    getUserName();
  }, []);

  /* ⏰ Clock */
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

  /* 🔔 Due tasks */
  useEffect(() => {
    const today = new Date();
    const due = allRequests.filter(item => {
      if (!item.EndTime) return false;
      return new Date(item.EndTime) >= today;
    });
    setDueTasks(due);
  }, [allRequests]);

  const getUserName = async () => {
    const name = await AsyncStorage.getItem('userName');
    setUserName(name || '');
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Morning';
    if (h < 17) return 'Afternoon';
    if (h < 21) return 'Evening';
    return 'Night';
  };

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

  const getPriorityCount = id =>
    allRequests.filter(i => i?.PriorityUser?.id === id).length;

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#2F4FE3"
        style={{flex: 1, justifyContent: 'center'}}
      />
    );
  }
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

  const sectionDataMap = {
    overdue,
    today: todayTasks,
    upcoming,
    later,
  };

  const activeData = sectionDataMap[activeSection] || [];

  /* ---------------- UI HELPERS ---------------- */

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

  const EmptyState = ({title, subtitle, buttonText}) => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="assignment" size={56} color="#E74C3C77" />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>

      <TouchableOpacity style={styles.emptyBtn}>
        <Text style={styles.emptyBtnText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back-ios" size={20} color={'#000'} />
          </TouchableOpacity>
          <Text style={styles.requestTitle}>My Requests </Text>
          <View style={{width: '10%'}} />
          {/* <View style={{marginTop: '5%'}}>
          <Text style={styles.requestTitle}>My Requests </Text>
          <Text style={styles.requestSubitle}>
            Track and manage your assigned requests
          </Text>
        </View> */}
        </View>

        {/* Top Card */}
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
            Good {getGreeting()}
            <Text style={styles.userName}>, {userName}</Text>
          </Text>
          {/* <Text style={styles.userName}>{userName}</Text> */}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.actionsRow}>
            {PRIORITIES.map(p => (
              <TouchableOpacity
                key={p.id}
                style={styles.actionItem}
                onPress={() =>
                  navigation.navigate('PriorityRequests', {
                    priorityId: p.id,
                    priorityLabel: p.label,
                    data: allRequests.filter(i => i?.PriorityUser?.id === p.id),
                  })
                }>
                <View
                  style={[
                    styles.iconWrapper,
                    {backgroundColor: p.color + '25'},
                  ]}>
                  <MaterialIcons name={p.icon} size={30} color={p.color} />

                  {getPriorityCount(p.id) > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {getPriorityCount(p.id)}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.actionText}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Time Card */}
        <View style={styles.timeCard}>
          <View>
            <Text style={styles.shiftTitle}>Ongoing Shift</Text>
            <Text
              style={[
                styles.timeNow,
                {
                  backgroundColor: '#2F4FE3',
                  borderRadius: 22,
                  alignItems: 'center',
                  textAlign: 'center',
                  fontSize: 13,
                  paddingVertical: 6,
                  color: '#fff',
                  marginTop: '3%',
                },
              ]}>
              {getGreeting()}
            </Text>
          </View>
          <View>
            <Text style={styles.shiftTitle}>Started at 09:00 am </Text>
            <Text style={styles.timeNow}>{currentTime}</Text>
          </View>
        </View>

        {/* Due Tasks */}
        <TouchableOpacity
          style={styles.dueCard}
          onPress={() => navigation.navigate('DueTasks', {data: dueTasks})}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={styles.dueCircle}>
              <MaterialIcons
                name="assignment-late"
                size={25}
                color={'#2F4FE3'}
              />
            </View>

            {/* <View style={styles.dueCircle}>
            <Text style={styles.dueCount}>{dueTasks.length}</Text>
          </View> */}
            <View style={{marginLeft: 14}}>
              <Text style={styles.dueTitle}>
                {dueTasks.length} Tasks are due Tomorrow
              </Text>
              {/* <Text style={styles.dueSubtitle}>are due Tomorrow</Text> */}
            </View>
          </View>
          <MaterialIcons name="arrow-forward-ios" size={18} color={'#2F4FE3'} />
        </TouchableOpacity>

        {/* All Requests */}
        {/* <FlatList
        data={allRequests}
        keyExtractor={i => i.id.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.Summary}</Text>
            <Text style={styles.label}>
              Priority: {item.PriorityUser?.identifier}
            </Text>
            <Text style={styles.label}>
              Status: {item.R_Status_ID?.identifier}
            </Text>
            <Text style={styles.label}>Doc: {item.DocumentNo}</Text>
          </View>
        )}
      /> */}
        {/* ---------------- MY TASKS ---------------- */}
        {/* <View style={styles.sectionWrapper}>
        <Text style={styles.mainHeader}>My Tasks</Text>
        <Section title="Overdue" data={overdue} />
        <Section title="Today" data={todayTasks} />
        <Section title="Upcoming" data={upcoming} />
        <Section title="Later" data={later} />
      </View> */}
        <View style={styles.sectionWrapper}>
          <View style={styles.myTasksHeader}>
            <Text style={styles.mainHeader}>My Tasks</Text>

            <TouchableOpacity
              style={styles.sectionPicker}
              onPress={() => setSectionModal(true)}>
              <Text style={styles.sectionPickerText}>
                {SECTIONS.find(s => s.key === activeSection)?.label}
              </Text>
              <MaterialIcons name="expand-more" size={22} color="#555" />
            </TouchableOpacity>
          </View>
          {activeData.length === 0 ? (
            <EmptyState
              title={`No ${
                SECTIONS.find(s => s.key === activeSection)?.label
              } tasks`}
              subtitle="You’re all caught up. Tasks with due dates will appear here."
              buttonText="Create a task"
            />
          ) : (
            activeData.map(item => <TaskItem key={item.uid} item={item} />)
          )}
        </View>

        {/* ---------------- RECENTS ---------------- */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.mainHeader}>Recents</Text>
          {/* {recents.map(item => (
            <TaskItem key={item.uid + '_r'} item={item} showStatus />
          ))} */}
          {recents.map(item => (
            <TouchableOpacity
              key={item.uid + '_r'}
              onPress={() =>
                navigation.navigate('PriorityRequests', {
                  priorityLabel: item?.PriorityUser?.identifier || '—',
                  data: allRequests.filter(i => i.uid === item.uid), // single item
                  scrollToTaskId: item.uid,
                })
              }>
              <TaskItem item={item} showStatus />
            </TouchableOpacity>
          ))}
        </View>

        {/* <View style={styles.sectionWrapper}>
  <Text style={styles.mainHeader}>Recents</Text>

  {recents.length > 0 ? (
    recents.map(item => (
      <TaskItem key={item.uid + '_r'} item={item} showStatus />
    ))
  ) : (
    <EmptyState
      message="No recent tasks yet"
      buttonText="Create Task"
      onPress={() => navigation.navigate('CreateRequest')} // or wherever you want
    />
  )}
</View> */}
      </ScrollView>
      <Modal
        visible={sectionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setSectionModal(false)}>
        {/* Overlay */}
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSectionModal(false)}>
          {/* Bottom Sheet */}
          <Pressable style={styles.modalBox}>
            {/* Drag Indicator */}
            <View style={styles.dragIndicator} />

            {SECTIONS.map(sec => (
              <TouchableOpacity
                key={sec.key}
                style={styles.modalItem}
                onPress={() => {
                  setActiveSection(sec.key);
                  setSectionModal(false);
                }}>
                <MaterialIcons name={sec.icon} size={20} color="#2F4FE3" />
                <Text style={styles.modalText}>{sec.label}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default Requests;

const styles = StyleSheet.create({
  container: {flex: 1, padding: '5%', backgroundColor: '#F5F7FA'},
  header: {
    paddingVertical: '8%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestTitle: {fontSize: 20, color: '#000', fontFamily: 'K2D-Medium'},
  requestSubitle: {
    color: 'rgba(48, 48, 48, 1)',
    fontSize: 11,
    marginBottom: 15,
    fontFamily: 'K2D-Medium',
  },
  // topCard: {
  //   // backgroundColor: '#fff',
  //   borderRadius: 6,
  //   padding: 16,
  //   marginBottom: 16,
  //   alignItems: 'center',
  //   // elevation: 5,
  //   paddingVertical: '10%',
  //   borderWidth: 1,
  //   borderColor: '#ccc',
  //   position: 'relative',
  // },
  // profileImage: {
  //   width: 60,
  //   height: 60,
  //   borderRadius: 30,
  //   position: 'absolute',
  //   // marginBottom: '15%',
  //   top: '-15%',
  //   borderWidth: 1,
  //   borderColor: '#ccc',
  // },
  topCard: {
    borderRadius: 20,
    // padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    paddingVertical: '10%',
    borderWidth: 1,
    borderColor: '#ccc',
    position: 'relative',
    marginTop: '5%',
  },

  profileBorder: {
    width: 60,
    height: 62,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: '#ccc',
    position: 'absolute',
    top: '-18%',
    backgroundColor: '#fff', // IMPORTANT → card se clean cut
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  greeting: {
    fontSize: 14,
    color: '#777',
    paddingTop: '5%',
    fontFamily: 'K2D-SemiBold',
  },
  userName: {
    fontSize: 18,
    fontFamily: 'K2D-Bold',
    marginTop: '5%',
    color: '#333',
  },
  actionsRow: {flexDirection: 'row', paddingTop: '5%'},
  actionItem: {minWidth: 60, alignItems: 'center', marginVertical: 6},
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'K2D-Medium',
    color: '#444',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#E74C3C',
    // backgroundColor: '#2F4FE3',

    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {color: '#fff', fontSize: 10},
  timeCard: {
    // backgroundColor: '#fff',
    paddingHorizontal: '8%',
    paddingVertical: '7%',
    borderRadius: 20,
    marginBottom: '5%',
    // elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  shiftTitle: {color: '#777', fontFamily: 'K2D-SemiBold'},
  timeNow: {fontSize: 18, fontFamily: 'K2D-Bold', color: '#333'},
  dueCard: {
    // backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingVertical: '7%',
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    // elevation: 2,
    alignItems: 'center',
  },
  dueCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    // backgroundColor: '#E74C3C',
    backgroundColor: '#3498DB33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dueCount: {color: '#fff', fontSize: 18},
  dueTitle: {fontSize: 15, color: '#555', fontFamily: 'K2D-SemiBold'},
  dueSubtitle: {fontSize: 13, color: '#777'},
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  title: {fontSize: 15, fontWeight: '600'},
  label: {fontSize: 13, color: '#555'},
  mainHeader: {
    fontSize: 20,
    // fontWeight: '600',
    fontFamily: 'K2D-SemiBold',
    marginVertical: '3%',
    color: '#333',
  },

  sectionWrapper: {
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // padding: 16,
    paddingVertical: '2%',
    paddingHorizontal: '5%',
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    // elevation: 2,
    // alignItems: 'center',
  },
  section: {marginBottom: 12},

  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
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
  myTasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  sectionPicker: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionPickerText: {
    fontSize: 14,
    fontFamily: 'K2D-Medium',
    color: '#555',
  },

  /* EMPTY STATE */
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },

  emptyTitle: {
    fontSize: 16,
    fontFamily: 'K2D-SemiBold',
    color: '#333',
    marginTop: 12,
  },

  emptySubtitle: {
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
    marginVertical: 8,
    maxWidth: 240,
  },

  emptyBtn: {
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    // backgroundColor: '#2F4FE3',
    backgroundColor: '#eee',
    width: '100%',
  },

  emptyBtnText: {
    color: '#333',
    fontSize: 13,
    fontFamily: 'K2D-Medium',
    textAlign: 'center',
  },

  /* MODAL */
  // modalOverlay: {
  //   flex: 1,
  //   backgroundColor: 'rgba(0,0,0,0.3)',
  //   justifyContent: 'flex-end',
  //   alignItems: 'center',
  // },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end', // 👈 bottom
  },

  modalBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    width: '100%', // 👈 Asana style
    paddingVertical: 12,
    paddingBottom: 24,
  },

  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },

  modalText: {
    fontSize: 14,
    fontFamily: 'K2D-Medium',
  },

  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D0D0D0',
    alignSelf: 'center',
    marginBottom: 10,
  },
});
