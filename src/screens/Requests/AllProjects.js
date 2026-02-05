import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import {useMyProjects, useMyRequests} from '../../hooks/useRequests';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ReqHeader from '../../components/ReqHeader';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

const TABS = ['All', 'Recents', 'Starred'];
const isToday = dateString => {
  if (!dateString) return false;

  const date = new Date(dateString);
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const AllProjects = () => {
  const navigation = useNavigation();
  const {data: projects = [], isLoading} = useMyProjects();
  const {data: allRequests = []} = useMyRequests();

  const [activeTab, setActiveTab] = useState('All');

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // const filteredProjects = React.useMemo(() => {
  //   if (activeTab === 'All') {
  //     return projects;
  //   }

  //   if (activeTab === 'Recents') {
  //     // projects jinke andar aaj ki request ho
  //     return projects.filter(project =>
  //       allRequests.some(
  //         req => req.C_Project_ID?.id === project.id && isToday(req.Created),
  //       ),
  //     );
  //   }

  //   if (activeTab === 'Starred') {
  //     // future use
  //     return [];
  //   }

  //   return projects;
  // }, [activeTab, projects, allRequests]);

  const isWithinLast7Days = date => {
    if (!date) return false;

    const startDate = dayjs().subtract(6, 'day').startOf('day');
    const endDate = dayjs().endOf('day');

    return dayjs(date).isBetween(startDate, endDate, 'day', '[]');
  };

  const filteredProjects = useMemo(() => {
    if (activeTab === 'All') {
      return projects;
    }

    if (activeTab === 'Recents') {
      // projects jinke andar last 7 days me koi request ho
      return projects.filter(project =>
        allRequests.some(req => {
          const activityDate = req.Updated || req.Created || req.DateLastAction;

          return (
            req.C_Project_ID?.id === project.id &&
            isWithinLast7Days(activityDate)
          );
        }),
      );
    }

    if (activeTab === 'Starred') {
      // future use
      return [];
    }

    return projects;
  }, [activeTab, projects, allRequests]);

  const handleProjectPress = project => {
    const projectTasks = allRequests.filter(
      t => t.C_Project_ID?.id === project.id,
    );
    navigation.navigate('ProjectTasksScreen', {
      project,
      tasks: projectTasks,
    });
  };

  return (
    <>
      <ReqHeader title={'Projects'} />
      <SafeAreaView style={styles.container}>
        {/* TABS */}
        <View style={styles.tabsContainer}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={styles.tabItem}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}>
                {tab}
              </Text>
              {activeTab === tab && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.divider} />

        {/* PROJECT LIST */}
        <FlatList
          data={filteredProjects}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{paddingBottom: 120}}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.projectRow}
              // onPress={() => handleProjectPress(item)}
              onPress={() =>
                Alert.alert('Will be implemented in future updates')
              }>
              <View style={styles.projectIcon}>
                <Ionicons name="list" size={18} color="#2F4FE3" />
              </View>

              <Text style={styles.projectTitle}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />

        {/* FLOATING BUTTON */}
        <TouchableOpacity style={styles.fab}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.fabText}>New project</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </>
  );
};

export default AllProjects;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F8F6',
  },

  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* HEADER */
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  backText: {
    fontSize: 16,
    color: '#111',
    marginLeft: 2,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: '#111',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    // marginVertical: 10,
    top: -10,
  },

  /* TABS */
  tabsContainer: {
    flexDirection: 'row',
    // borderBottomWidth: 1,
    // borderBottomColor: '#eee',
    width: '60%',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabText: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'K2D-Medium',
  },
  activeTabText: {
    color: '#111',
    fontWeight: '600',
  },
  activeIndicator: {
    marginTop: 6,
    height: 2,
    width: '60%',
    backgroundColor: '#111',
    borderRadius: 2,
  },

  /* PROJECT ROW */
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    // borderBottomColor: '#f0f0f0',
    borderBottomColor: '#f0e0f0',
    // width: '90%',
    left: 5,
  },
  projectIcon: {
    height: 34,
    width: 34,
    borderRadius: 10,
    // backgroundColor: '#D9A7EB',
    backgroundColor: '#B9C4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  projectTitle: {
    fontSize: 16,
    color: '#111',
    marginRight: '12%',
    lineHeight: 25,
  },

  /* FAB */
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5A3C',
    paddingHorizontal: 18,
    height: 46,
    borderRadius: 24,
    elevation: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
});
