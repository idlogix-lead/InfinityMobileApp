import React, {useRef, useState, useEffect} from 'react';
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
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';
import Comments from './Comments';
import AddTask from './AddTask';
import {Modalize} from 'react-native-modalize';
import ReqHeader from '../../components/ReqHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useRequestStore} from '../../store/requestStore';
import {useMyRequests, useMyProjects} from '../../hooks/useRequests';
import {useAuthStore} from '../../store/authStore';

const PRIORITIES = [
  {id: '1', label: 'Urgent', color: '#E74C3C', icon: 'priority-high'},
  {id: '3', label: 'High', color: '#E67E22', icon: 'trending-up'},
  {id: '5', label: 'Medium', color: '#3498DB', icon: 'remove'},
  {id: '7', label: 'Low', color: '#2ECC71', icon: 'trending-down'},
  {id: '4', label: 'Minor', color: '#95A5A6', icon: 'low-priority'},
];

const PROJECT_COLORS = [
  '#E74C3C',
  '#8E44AD',
  '#3498DB',
  '#16A085',
  '#F39C12',
  '#2ECC71',
  '#D35400',
];

const SECTIONS = [
  {key: 'overdue', label: 'Overdue', icon: 'schedule'},
  {key: 'today', label: 'Today', icon: 'today'},
  {key: 'upcoming', label: 'Upcoming', icon: 'calendar-today'},
  {key: 'later', label: 'Later', icon: 'event'},
];

const Requests = () => {
  const navigation = useNavigation();
  const {userId, userName} = useAuthStore();

  const today = dayjs().startOf('day');
  const tomorrow = dayjs().add(1, 'day').startOf('day');
  const todayDate = dayjs().format('ddd, DD MMMM');

  const createTaskModalRef = useRef(null);

  const {
    activeSection,
    setActiveSection,
    selectedProject,
    setSelectedProject,
    sectionModal,
    projectPickerVisible,
    openSectionModal,
    closeSectionModal,
  } = useRequestStore();

  const [projectModal, setProjectModal] = useState(false);
  const openProjectModal = () => setProjectModal(true);
  const closeProjectModal = () => setProjectModal(false);

  // const [userName, setUserName] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [projectFilter, setProjectFilter] = useState('recents');
  const [essentialProjectModal, setEssentialProjectModal] = useState(false);

  const openEssentialProjectModal = () => setEssentialProjectModal(true);
  const closeEssentialProjectModal = () => setEssentialProjectModal(false);

  const {
    data: allRequests = [],
    isLoading,
    refetch: refetchRequests,
  } = useMyRequests();
  const {data: projects = [], isLoading: projectLoading} = useMyProjects();

  const starredProjects = projects.filter(p => p.isStarred);

  /* ------------------- HELPER FUNCTIONS ------------------- */
  const buildMyTasksPayload = allRequests => {
    const today = dayjs().startOf('day');
    const active = allRequests.filter(
      t => t.R_Status_ID?.identifier !== '9_Final Close',
    );

    return {
      todayTasks: active.filter(
        t =>
          t.DateCompletePlan && dayjs(t.DateCompletePlan).isSame(today, 'day'),
      ),
      nextWeekTasks: active.filter(
        t =>
          t.DateCompletePlan &&
          dayjs(t.DateCompletePlan).isAfter(today) &&
          dayjs(t.DateCompletePlan).isBefore(today.add(7, 'day')),
      ),
      laterTasks: active.filter(t => !t.DateCompletePlan),
    };
  };

  const activeTask =
    allRequests?.filter(t => t.R_Status_ID?.identifier !== '9_Final Close') ||
    [];

  const recentLimitDays = 7;

  const recents = activeTask
    .filter(t => {
      const activityDate = t.Updated || t.Created || t.DateLastAction;
      if (!activityDate) return false;

      return dayjs(activityDate).isAfter(
        dayjs().subtract(recentLimitDays, 'day'),
        'day',
      );
    })
    .sort((a, b) => {
      const aDate = dayjs(a.Updated || a.Created || a.DateLastAction);
      const bDate = dayjs(b.Updated || b.Created || b.DateLastAction);
      return bDate.diff(aDate);
    });

  // const {recentlyAssigned: recents} = buildMyTasksPayload(allRequests);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Morning';
    if (h < 17) return 'Afternoon';
    if (h < 21) return 'Evening';
    return 'Night';
  };

  const getPriorityCount = id =>
    allRequests.filter(i => i?.Priority?.id === id).length;

  const getProjectColor = id => {
    if (!id) return PROJECT_COLORS[0];
    let hash = 0;
    for (let i = 0; i < id.length; i++)
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    return PROJECT_COLORS[Math.abs(hash) % PROJECT_COLORS.length];
  };

  // const openCreateTaskModal = () => createTaskModalRef.current?.open();
  // const closeCreateTaskModal = () => createTaskModalRef.current?.close();
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  const openCreateTaskModal = () => {
    setIsCreateTaskOpen(true);
    createTaskModalRef.current?.open();
  };

  const closeCreateTaskModal = () => {
    setIsCreateTaskOpen(false);
    createTaskModalRef.current?.close();
  };

  /* ------------------- USER & CLOCK ------------------- */
  // useEffect(() => {
  //   AsyncStorage.getItem('userName').then(name => setUserName(name || ''));
  // }, []);

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

  /* ------------------- TASK FILTERS ------------------- */
  const activeTasks = allRequests.filter(
    t => t.R_Status_ID?.identifier !== '9_Final Close',
  );
  const overdue = activeTasks.filter(
    t => t.StartDate && dayjs(t.StartDate).isBefore(today, 'day'),
  );
  const todayTasks = activeTasks.filter(
    t => t.StartDate && dayjs(t.StartDate).isSame(today, 'day'),
  );
  const upcoming = activeTasks.filter(
    t => t.StartDate && dayjs(t.StartDate).isSame(tomorrow, 'day'),
  );
  const later = activeTasks.filter(
    t => !t.StartDate || dayjs(t.StartDate).isAfter(tomorrow, 'day'),
  );

  const sectionDataMap = {overdue, today: todayTasks, upcoming, later};
  const activeData = sectionDataMap[activeSection] || [];

  const dueTasks = allRequests.filter(
    item => item.EndTime && dayjs(item.EndTime).isSame(tomorrow, 'day'),
  );

  const projectTasks = selectedProject
    ? allRequests.filter(t => t.C_Project_ID?.id === selectedProject.id)
    : [];

  // const todayProjectIds = allRequests
  //   .filter(t => {
  //     const activityDate = t.Updated || t.Created || t.DateLastAction;
  //     return activityDate && dayjs(activityDate).isSame(today, 'day');
  //   })
  //   .map(t => t.C_Project_ID?.id)
  //   .filter(Boolean);

  // const recentProjects = projects.filter(p => todayProjectIds.includes(p.id));
  const last7DaysProjectIds = allRequests
    .filter(t => {
      const activityDate = t.Updated || t.Created || t.DateLastAction;
      return (
        activityDate &&
        dayjs(activityDate).isAfter(dayjs().subtract(7, 'day'), 'day')
      );
    })
    .map(t => t.C_Project_ID?.id)
    .filter(Boolean);

  const recentProjects = projects.filter(p =>
    last7DaysProjectIds.includes(p.id),
  );

  const categorizeProjectTasks = (tasks, projectId) => {
    // Filter tasks for this project only
    const projectTasks = tasks.filter(t => t.C_Project_ID?.id === projectId);

    const today = dayjs().startOf('day');

    const counts = {
      Completed: 0,
      Overdue: 0,
      Due: 0,
    };

    projectTasks.forEach(t => {
      if (t.R_Status_ID?.identifier === '9_Final Close') {
        counts.Completed += 1;
      } else if (t.DueType?.identifier === 'Due') {
        counts.Due += 1;
      } else if (t.StartDate && dayjs(t.StartDate).isBefore(today, 'day')) {
        counts.Overdue += 1;
      }
    });

    return counts;
  };

  const getProjectTasksByStatus = (tasks, projectId) => {
    const today = dayjs().startOf('day');

    const projectTasks = tasks.filter(t => t.C_Project_ID?.id === projectId);

    return {
      Completed: projectTasks.filter(
        t => t.R_Status_ID?.identifier === '9_Final Close',
      ),
      Overdue: projectTasks.filter(t => t.DueType?.identifier === 'Overdue'),

      Due: projectTasks.filter(t => t.DueType?.identifier === 'Due'),

      // Overdue: projectTasks.filter(
      //   t =>
      //     t.R_Status_ID?.identifier !== '9_Final Close' &&
      //     t.StartDate &&
      //     dayjs(t.StartDate).isBefore(today, 'day'),
      // ),
    };
  };

  const getGlobalTasksByStatus = tasks => {
    const today = dayjs().startOf('day');

    return {
      Completed: tasks.filter(
        t => t.R_Status_ID?.identifier === '9_Final Close',
      ),
      Due: tasks.filter(
        t =>
          t.R_Status_ID?.identifier !== '9_Final Close' &&
          t.DueType?.identifier === 'Due',
      ),

      Overdue: tasks.filter(
        t =>
          t.R_Status_ID?.identifier !== '9_Final Close' &&
          t.DueType?.identifier === 'Overdue',
      ),
    };
  };

  /* ------------------- ITEM COMPONENTS ------------------- */
  const TaskItem = ({item, showStatus}) => (
    <TouchableOpacity
      style={styles.taskItem}
      onPress={() => navigation.navigate('TaskDetail', {task: item})}>
      <View style={styles.left}>
        <MaterialIcons name="check-circle-outline" color={'#777'} size={20} />
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

  const ProjectItem = ({item}) => {
    const bgColor = getProjectColor(item.id);
    return (
      <TouchableOpacity
        style={styles.projectItem}
        onPress={() => Alert.alert('under development')}>
        <View
          style={[
            styles.projectIconWrapper,
            {backgroundColor: bgColor + '22'},
          ]}>
          <MaterialIcons name="list" size={20} color={bgColor} />
        </View>
        <Text style={styles.projectTitle}>{item.name}</Text>
        {/* <MaterialIcons name="chevron-right" size={22} color="#000" /> */}
      </TouchableOpacity>
    );
  };

  const EmptyState = ({title, subtitle, buttonText}) => (
    <View style={styles.emptyContainer}>
      {/* <MaterialIcons name="assignment" size={56} color="#E74C3C77" /> */}
      <View
        style={{
          height: 50,
          width: 50,
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Image
          source={require('../../asserts/RequestAsserts/emptyTask.png')}
          style={{height: 150, width: 150}}
        />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
      <TouchableOpacity
        style={styles.emptyBtn}
        onPress={() => navigation.navigate('AddTask')}>
        <Text style={styles.emptyBtnText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );

  const ProjectEmptyState = ({title, subtitle}) => (
    <View style={styles.emptyContainer}>
      {/* <MaterialIcons name="folder-open" size={56} color="#2F4FE355" /> */}
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Image
          source={require('../../asserts/RequestAsserts/emptyProject.png')}
          style={{height: 150, width: 150}}
        />
      </View>
      <Text style={[styles.emptyTitle, {marginTop: '-10%'}]}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );

  /* ------------------- LOADING ------------------- */
  if (isLoading)
    return (
      <ActivityIndicator
        size="large"
        color="#2F4FE3"
        style={{flex: 1, justifyContent: 'center'}}
      />
    );

  return (
    <>
      <ReqHeader title={'Requests'} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <StatusBar barStyle="dark-content" />

        {/* HEADER */}
        <View>
          {/* <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems:'center'}}>
            <Text style={styles.dateText}>{todayDate}</Text>
            

          </View> */}

          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={{paddingRight: '2%'}}>
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                }}
                style={styles.profileImage}
              />
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('ProfileScreen')}>
              <Text style={styles.userName}>
                Good {getGreeting()}
                <Text style={styles.userName}>
                  , {'\n'}
                  {userName}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
          {/* <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
            <TouchableOpacity style={{}} onPress={() => navigation.navigate('Create')}>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 13,
                  fontFamily: 'K2D-Medium',

                  backgroundColor: '#2F4FE3',
                  // width: '25%',
                  textAlign: 'center',
                  paddingHorizontal: '2%',
                }}>
                Create Task
              </Text>
            </TouchableOpacity>
          </View> */}
        </View>

        {/* PRIORITY TASKS */}
        {/* 
        <View style={styles.topCard}>
          <Text style={styles.mainHeader}>Priority Tasks</Text>
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
                    data: allRequests.filter(i => i?.Priority?.id === p.id),
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
        </View> */}

        {/* TIME CARD */}
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
            <Text style={styles.shiftTitle}>Started at 09:00 am</Text>
            <Text style={styles.timeNow}>{currentTime}</Text>
          </View>
        </View>

        {/* DUE TASKS */}
        {/* <TouchableOpacity
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
            <Text style={[styles.dueTitle, {marginLeft: 12}]}>
              {dueTasks.length} Tasks are due Tomorrow
            </Text>
          </View>
          <MaterialIcons name="arrow-forward-ios" size={18} color={'#2F4FE3'} />
        </TouchableOpacity> */}
        {/* MY TASKS */}
        <View style={styles.sectionWrapper}>
          <View style={styles.myTasksHeader}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('MyTasks', buildMyTasksPayload(allRequests))
              }>
              <Text style={styles.mainHeader}>My Tasks</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sectionPicker}
              onPress={openSectionModal}>
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
            <FlatList
              data={activeData}
              keyExtractor={item => item.uid}
              renderItem={({item}) => <TaskItem item={item} />}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* GLOBAL BY STATUS CARD */}
        <View style={styles.sectionWrapper}>
          <View style={styles.myTasksHeader}>
            <Text style={styles.mainHeader}>By Status</Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: '3%',
            }}>
            {Object.entries(getGlobalTasksByStatus(allRequests)).map(
              ([label, tasks]) => (
                <TouchableOpacity
                  key={label}
                  style={styles.essentialRow}
                  onPress={() =>
                    navigation.navigate('TaskStatus', {
                      title: label,
                      tasks,
                    })
                  }>
                  <Text style={styles.essentialText}>{label}</Text>
                  <Text style={styles.essentialTxtLen}>{tasks.length}</Text>
                </TouchableOpacity>
              ),
            )}
          </View>
        </View>

        {/* ESSENTIALS & BY STATUS */}
        {/* <View style={styles.sectionWrapper}>
          {!selectedProject ? (
            // When no project is selected
            <>
              <View style={styles.myTasksHeader}>
                <Text style={styles.mainHeader}>Essentials</Text>
                <TouchableOpacity onPress={openEssentialProjectModal}>
                  <MaterialIcons name="more-horiz" size={20} color="#999" />
                </TouchableOpacity>
              </View>
              <ProjectEmptyState
                title="No project selected"
                subtitle="Select a project to view its tasks and essentials."
              />
            </>
          ) : (
            // When a project IS selected
            <>
              <View style={styles.myTasksHeader}>
                <Text style={styles.mainHeader}>Essentials</Text>
                <TouchableOpacity onPress={openEssentialProjectModal}>
                  <MaterialIcons name="more-horiz" size={22} color="#555" />
                </TouchableOpacity>
              </View>
              <Text style={[styles.mainHeader, {fontSize: 15}]}>
                {selectedProject?.name}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: '3%',
                }}>
                {Object.entries(
                  getProjectTasksByStatus(allRequests, selectedProject?.id),
                ).map(([label, tasks]) => (
                  <TouchableOpacity
                    key={label}
                    style={styles.essentialRow}
                    onPress={() =>
                      navigation.navigate('TaskStatus', {
                        title: label,
                        project: selectedProject,
                        tasks,
                      })
                    }>
                    <Text style={styles.essentialText}>{label}</Text>
                    <Text style={styles.essentialTxtLen}>{tasks.length}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {projectTasks?.length === 0 && (
                <ProjectEmptyState
                  title="No tasks in this project"
                  subtitle="Tasks related to this project will appear here."
                />
              )}
            </>
          )}
        </View> */}

        {/* RECENTS */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.mainHeader}>Recents</Text>
          {recents.length === 0 ? (
            <EmptyState
              title="No recent tasks"
              subtitle="Tasks with activity in the past 7 days will appear here."
              buttonText="Create a task"
            />
          ) : (
            <FlatList
              data={recents}
              keyExtractor={item => item.uid + '_r'}
              renderItem={({item}) => <TaskItem item={item} />}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* PROJECTS */}
        <View style={styles.sectionWrapper}>
          <View style={styles.myTasksHeader}>
            <Text style={styles.mainHeader}>Projects</Text>
            <TouchableOpacity
              style={styles.sectionPicker}
              onPress={openProjectModal}>
              <Text style={styles.sectionPickerText}>
                {projectFilter === 'recents' ? 'Recents' : 'Starred'}
              </Text>
              <MaterialIcons name="expand-more" size={22} color="#555" />
            </TouchableOpacity>
          </View>

          {projectLoading ? (
            <ActivityIndicator size="small" color="#2F4FE3" />
          ) : projectFilter === 'recents' ? (
            recentProjects.length === 0 ? (
              <ProjectEmptyState
                title="No recent projects today"
                subtitle="Projects with activity today will appear here."
              />
            ) : (
              recentProjects.map(p => (
                <View key={p.id} style={{paddingRight: '5%'}}>
                  <ProjectItem item={p} />
                </View>
              ))
            )
          ) : starredProjects.length === 0 ? (
            <ProjectEmptyState
              title="No starred projects"
              subtitle="Star projects to access them quickly from here."
            />
          ) : (
            starredProjects.map(p => (
              <View key={p.id} style={{paddingRight: '5%'}}>
                <ProjectItem item={p} />
              </View>
            ))
          )}

          <TouchableOpacity
            style={[styles.emptyBtn, {marginBottom: '5%'}]}
            onPress={() => navigation.navigate('AllProjects')}>
            <Text style={styles.emptyBtnText}>See all projects</Text>
          </TouchableOpacity>
        </View>
        {/* COMMENTS */}
        <View style={[styles.sectionWrapper, {marginBottom: '15%'}]}>
          <Text style={styles.mainHeader}>Comments mentioning me</Text>
          <Comments />
        </View>
      </ScrollView>

      <TouchableOpacity
        // onPress={() => navigation.navigate('AddTask')}
        onPress={openCreateTaskModal}
        style={styles.floatingButton}>
        <Text
          style={{
            color: '#fff',
            fontFamily: 'K2D-Bold',
            fontSize: 20,
          }}>
          +
        </Text>
      </TouchableOpacity>

      {/* MODALS */}
      {/* SECTION MODAL */}
      <Modal
        visible={sectionModal}
        transparent
        animationType="slide"
        onRequestClose={closeSectionModal}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeSectionModal}>
          <Pressable style={styles.modalBox}>
            <View style={styles.dragIndicator} />
            <Text
              style={[
                styles.sectionTitle,
                {fontSize: 17, paddingHorizontal: '5%'},
              ]}>
              My Task
            </Text>
            {SECTIONS.map(sec => (
              <TouchableOpacity
                key={sec.key}
                style={styles.modalItem}
                onPress={() => {
                  setActiveSection(sec.key);
                  closeSectionModal();
                }}>
                <MaterialIcons name={sec.icon} size={20} color="#555" />
                <Text style={styles.modalText}>{sec.label}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </TouchableOpacity>
      </Modal>

      {/* PROJECT MODAL */}
      <Modal
        visible={projectModal}
        transparent
        animationType="slide"
        onRequestClose={closeProjectModal}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeProjectModal}>
          <Pressable style={styles.modalBox}>
            <View style={styles.dragIndicator} />
            <Text
              style={[
                styles.sectionTitle,
                {fontSize: 17, paddingHorizontal: '5%'},
              ]}>
              Projects
            </Text>
            {['recents', 'starred'].map(type => (
              <TouchableOpacity
                key={type}
                style={styles.modalItem}
                onPress={() => {
                  setProjectFilter(type);
                  closeProjectModal();
                }}>
                <Text style={styles.modalText}>
                  {type === 'recents' ? 'Recents' : 'Starred'}
                </Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </TouchableOpacity>
      </Modal>
      {/* Essential Modal */}
      <Modal
        visible={essentialProjectModal}
        transparent
        animationType="slide"
        onRequestClose={closeEssentialProjectModal}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeEssentialProjectModal}>
          <Pressable style={styles.modalBox}>
            <View style={styles.dragIndicator} />
            <Text
              style={[
                styles.sectionTitle,
                {fontSize: 17, paddingHorizontal: '5%'},
              ]}>
              Select Project
            </Text>
            <ScrollView>
              {projects.map(project => (
                <TouchableOpacity
                  key={project.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedProject(project);
                    closeEssentialProjectModal();
                  }}>
                  <Text style={styles.modalText}>{project.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </TouchableOpacity>
      </Modal>

      {/* CREATE TASK MODAL */}
      <Modalize
        ref={createTaskModalRef}
        modalHeight={500}
        withHandle
        scrollViewProps={{
          nestedScrollEnabled: true,
          keyboardShouldPersistTaps: 'handled',
        }}>
        <AddTask
          isModal
          visible={isCreateTaskOpen}
          onClose={closeCreateTaskModal}
        />
      </Modalize>
    </>
  );
};

/* ------------------- STYLES ------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: '5%',
    backgroundColor: '#F9F8F6',
    marginBottom: 5,
  },
  header: {
    paddingTop: '8%',
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
  createBtn: {
    backgroundColor: '#2F4FE3',
    paddingHorizontal: '2%',
    paddingVertical: '1%',
    borderRadius: 8,
  },
  createBtnTxt: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'K2D-SemiBold',
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
    // alignItems: 'center',
    paddingHorizontal: '3%',
    // paddingVertical: '10%',
    borderWidth: 1,
    borderColor: '#ccc',
    position: 'relative',
    marginTop: '2%',
    backgroundColor: '#fff',
  },

  profileBorder: {
    width: 60,
    height: 62,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: '#ccc',
    position: 'absolute',
    top: '-18%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    bottom: '1%',
  },
  dateText: {
    fontSize: 15,
    color: '#555',
    marginTop: 4,
    fontFamily: 'K2D-Medium',
    paddingHorizontal: '15%',
  },

  greeting: {
    fontSize: 20,
    color: '#777',
    paddingTop: '5%',
    fontFamily: 'K2D-SemiBold',
  },
  userName: {
    fontSize: 20,
    letterSpacing: 2,
    fontFamily: 'K2D-Bold',
    marginTop: '-3%',
    color: '#333',
  },
  actionsRow: {flexDirection: 'row', paddingTop: '5%'},
  actionItem: {
    minWidth: 60,
    alignItems: 'center',
    marginVertical: 6,
    color: '#555',
  },
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
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
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
  title: {fontSize: 15, fontWeight: '600', color: '#333'},
  label: {fontSize: 13, color: '#555'},
  mainHeader: {
    fontSize: 20,
    // fontWeight: '600',
    fontFamily: 'K2D-Medium',
    marginTop: '3%',
    color: '#000',
  },

  sectionWrapper: {
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // padding: 16,
    paddingVertical: '2%',
    paddingHorizontal: '5%',
    borderRadius: 20,
    marginBottom: '5%',
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
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
    paddingVertical: '2%',
    // borderBottomWidth: 0.5,
    // borderColor: '#ddd',
    // color: '#000',
    alignItems: 'center',
  },

  left: {flexDirection: 'row', flex: 1, gap: 15, alignItems: 'center'},

  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#aaa',
  },

  taskTitle: {flex: 1, fontSize: 14, color: '#000', fontFamily: 'K2D-Medium'},

  right: {alignItems: 'flex-end', paddingHorizontal: '4%'},

  date: {fontSize: 12, color: '#777'},

  status: {fontSize: 12, color: '#999'},

  priorityItem: {
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 10,
    color: '#555',
  },

  priorityText: {fontSize: 12, color: '#555'},
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
    backgroundColor: '#fff',
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
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
    width: '100%',
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
    color: '#000',
  },

  dragIndicator: {
    width: 40,

    height: 4,
    borderRadius: 2,
    backgroundColor: '#D0D0D0',
    alignSelf: 'center',
    marginBottom: 10,
  },

  projectIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: '2%',
    // borderBottomWidth: 0.5,
    // borderColor: '#E5E5E5',
  },

  projectTitle: {
    fontSize: 15,
    fontFamily: 'K2D-Medium',
    color: '#000',
  },

  projectMeta: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  projectEssentialsLabel: {
    fontSize: 13,
    fontFamily: 'K2D-SemiBold',
    color: '#777',
    marginTop: 8,
    marginBottom: 6,
  },

  essentialRow: {
    // flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '5%',
    gap: 5,
    backgroundColor: '#eee',
    // paddingHorizontal: '5%',
    borderRadius: 12,
    width: '32%',
  },

  essentialText: {
    fontSize: 14,
    fontFamily: 'K2D-Medium',
    color: '#000',
  },
  essentialTxtLen: {
    fontSize: 14,
    fontFamily: 'K2D-Medium',
    color: '#555',
  },
  createTaskBtn: {
    backgroundColor: '#2F4FE3',
    alignItems: 'center',
    marginTop: '5%',
    marginBottom: '5%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderRadius: 8,
    width: '25%',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20, // distance from bottom
    right: 20, // distance from right
    backgroundColor: '#2F4FE3',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // shadow on Android
    shadowColor: '#000', // shadow on iOS
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default Requests;
