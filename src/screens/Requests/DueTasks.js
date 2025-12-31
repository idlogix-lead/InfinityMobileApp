import {StyleSheet, Text, View, FlatList, TouchableOpacity} from 'react-native';
import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';

const DueTasks = ({route}) => {
  const {data} = route.params || {};
  const navigation = useNavigation();

  if (!data || data.length === 0) {
    return (
      <>
        <View style={[styles.header, {paddingTop:'7%'}]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back-ios" size={20} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Due Tasks</Text>
          <View style={{width: 20}} />
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No due tasks found</Text>
        </View>
      </>
    );
  }

  const handleTaskPress = task => {
    navigation.navigate('TaskDetail', {task});
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Due Tasks</Text>
        <View style={{width: 20}} />
      </View>

      <FlatList
        data={data}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{padding: 12}}
        renderItem={({item}) => (
          <TouchableOpacity onPress={() => handleTaskPress(item)}>
            <TaskCard item={item} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default DueTasks;

const TaskCard = ({item}) => {
  const isOverdue = item.DueType?.identifier === 'Overdue';

  return (
    <View style={[styles.card, isOverdue && styles.overdueCard]}>
      <View style={styles.headerRow}>
        <Text style={styles.docNo}>#{item.DocumentNo}</Text>
        <View
          style={[
            styles.dueBadge,
            {backgroundColor: isOverdue ? '#C0392B' : '#E74C3C'},
          ]}>
          <Text style={styles.dueText}>
            {item.DueType?.identifier || 'Due'}
          </Text>
        </View>
      </View>

      <Text style={styles.summary}>{item.Summary}</Text>

      <Info icon="priority-high" color="#E67E22">
        Priority: {item.PriorityUser?.identifier}
      </Info>
      <Info icon="flag" color="#3498DB">
        Status: {item.R_Status_ID?.identifier}
      </Info>
      <Info icon="person" color="#2ECC71">
        Assigned: {item.SalesRep_ID?.identifier}
      </Info>
    </View>
  );
};

const Info = ({icon, color, children}) => (
  <View style={styles.infoRow}>
    <MaterialIcons name={icon} size={16} color={color} />
    <Text style={styles.infoText}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F7FA'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  title: {fontSize: 18, fontFamily: 'K2D-Bold', color: '#000'},
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  overdueCard: {borderLeftWidth: 5, borderLeftColor: '#C0392B'},
  headerRow: {flexDirection: 'row', justifyContent: 'space-between'},
  docNo: {fontSize: 14, fontFamily: 'K2D-Medium', color: '#555'},
  dueBadge: {paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12},
  dueText: {color: '#fff', fontSize: 12, fontFamily: 'K2D-Bold'},
  summary: {fontSize: 16, fontFamily: 'K2D-SemiBold', marginVertical: 8},
  infoRow: {flexDirection: 'row', alignItems: 'center', marginTop: 6},
  infoText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#555',
    fontFamily: 'K2D-Medium',
  },
  empty: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  emptyText: {color: '#777', fontSize: 14},
});
