import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  InteractionManager,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';

const PriorityRequests = ({route}) => {
  const {priorityLabel, data, scrollToTaskId} = route.params || {};
  const navigation = useNavigation();
  const flatListRef = useRef();

  useEffect(() => {
    if (scrollToTaskId && flatListRef.current && data?.length) {
      const index = data.findIndex(item => item.uid === scrollToTaskId);
      if (index >= 0) {
        InteractionManager.runAfterInteractions(() => {
          try {
            flatListRef.current.scrollToIndex({
              index,
              animated: true,
              viewPosition: 0.5, // center the item
            });
          } catch (e) {
            console.log('Scroll error:', e);
          }
        });
      }
    }
  }, [scrollToTaskId, data]);

  const renderItem = ({item}) => {
    const status = item?.R_Status_ID?.identifier || '—';
    const priority = item?.PriorityUser?.identifier || priorityLabel;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.card}
        onPress={() =>
          navigation.navigate('TaskDetail', {task: item, priorityLabel})
        }>
        <View style={styles.cardHeader}>
          <Text style={styles.title} numberOfLines={1}>
            {item.Summary}
          </Text>

          <View style={styles.priorityBadge}>
            <Text style={styles.priorityText}>{priority}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <MaterialIcons name="description" size={16} color="#E67E22" />
          <Text style={styles.value}>Doc #{item.DocumentNo}</Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="track-changes" size={16} color="#2ECC71" />
          <Text style={styles.value}>{status}</Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="person" size={16} color="#3498DB" />
          <Text style={styles.value}>
            {item?.SalesRep_ID?.identifier || '—'}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.dateText}>
            Closed: {item.CloseDate?.slice(0, 10) || '—'}
          </Text>
          <MaterialIcons name="chevron-right" size={22} color="#2F4FE3" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#000" />
        </TouchableOpacity>
        <View style={{width: 20}} />
      </View>

      <Text style={styles.heading}>{priorityLabel} Requests</Text>

      <FlatList
        ref={flatListRef}
        data={data}
        keyExtractor={i => i.uid} // uid matches your data
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 30}}
        ListEmptyComponent={
          <Text style={styles.empty}>No requests found</Text>
        }
        getItemLayout={(data, index) => ({
          length: 140, // approximate height of each card
          offset: 140 * index,
          index,
        })}
      />
    </View>
  );
};

export default PriorityRequests;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F7FA', paddingHorizontal: '6%'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '7%',
    top: '7%',
    justifyContent: 'space-between',
  },
  heading: {
    fontSize: 18,
    fontFamily: 'K2D-Bold',
    color: '#000',
    paddingVertical: '5%',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: '5%',
    marginBottom: 14,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontFamily: 'K2D-SemiBold',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    backgroundColor: '#3498DB33',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  priorityText: {fontSize: 12, color: '#2F4FE3', fontFamily: 'K2D-Bold'},
  divider: {height: 1, backgroundColor: '#ccc', marginVertical: 10},
  row: {flexDirection: 'row', alignItems: 'center', marginBottom: 6},
  value: {fontSize: 13, color: '#555', marginLeft: 8, fontFamily: 'K2D-Medium'},
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  dateText: {fontSize: 12, color: '#888', fontFamily: 'K2D-Medium'},
  empty: {
    textAlign: 'center',
    marginTop: 50,
    color: '#777',
    fontFamily: 'K2D-Medium',
  },
});
