import React from 'react';
import {View, Text, FlatList, TouchableOpacity} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import dayjs from 'dayjs';
import ReqHeader from '../../components/ReqHeader';

const TaskStatus = ({route, navigation}) => {
  const {title, project, tasks} = route.params;

  const TaskItem = ({item}) => (
    <TouchableOpacity
      style={{
        padding: 14,
        borderBottomWidth: 1,
        borderColor: '#eee',
      }}
      onPress={() =>
        navigation.navigate('TaskDetail', {task: item})
      }>
      <Text style={{fontSize: 15, fontWeight: '600'}}>
        {item.Summary}
      </Text>

      <Text style={{color: '#777', marginTop: 4}}>
        Status: {item.R_Status_ID?.identifier}
      </Text>

      {item.StartDate && (
        <Text style={{color: '#999', marginTop: 2}}>
          Start: {dayjs(item.StartDate).format('DD MMM YYYY')}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <ReqHeader title={`${project.name} • ${title}`} />

      <FlatList
        data={tasks}
        keyExtractor={item => item.uid}
        renderItem={TaskItem}
        ListEmptyComponent={
          <Text style={{textAlign: 'center', marginTop: 40}}>
            No {title} tasks found
          </Text>
        }
      />
    </>
  );
};

export default TaskStatus;
