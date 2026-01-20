import React from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import {useMyProjects, useMyRequests} from '../../hooks/useRequests';
import {useNavigation} from '@react-navigation/native';
import ReqHeader from '../../components/ReqHeader';

const AllProjects = () => {
  const navigation = useNavigation();
  const {data: projects = [], isLoading: projectsLoading} = useMyProjects();
  const {data: allRequests = []} = useMyRequests();

  if (projectsLoading) return <Text>Loading...</Text>;

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
    <View style={{flex: 1, backgroundColor: '#F9F8F6'}}>
      <ReqHeader title={'All Projects'} />
      <FlatList
        data={projects}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.projectItem}
            onPress={() => handleProjectPress(item)}>
            <Text style={styles.projectTitle}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  projectItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  projectTitle: {fontSize: 16, fontWeight: '500', color:'#555'},
});

export default AllProjects;
