import React, {useRef, useEffect, useState} from 'react';
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
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReqHeader from '../../components/ReqHeader';

const PriorityRequests = ({route}) => {
  const {priorityLabel, data, scrollToTaskId} = route.params || {};
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

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
  useEffect(() => {
    const loadData = async () => {
      const token = await AsyncStorage.getItem('token');
      const protocol = await AsyncStorage.getItem('protocol');
      const host = await AsyncStorage.getItem('host');
      const port = await AsyncStorage.getItem('port');
      try {
        const config = {
          headers: {Authorization: `Bearer ${token}`},
        };

        const [catRes, grpRes] = await Promise.all([
          axios.get(
            `${protocol}://${host}:${port}/api/v1/models/R_Category`,
            config,
          ),
          axios.get(
            `${protocol}://${host}:${port}/api/v1/models/R_Group`,
            config,
          ),
        ]);

        setCategories(catRes.data.records || []);
        setGroups(grpRes.data.records || []);
      } catch (e) {
        console.log('Fetch error:', e);
      }
    };

    loadData();
  }, []);

  const renderItem = ({item}) => {
    const isOpen = expandedId === item.uid;

    const status = item?.R_Status_ID?.identifier || '—';
    const priority = item?.Priority?.identifier || priorityLabel;

    const category = item?.R_RequestType_ID?.identifier || 'N/A';
    const categoryName =
      categories.find(c => c.id === item?.R_RequestType_ID?.id)?.Name || '—';

    const groupName = groups.length > 0 ? groups[0].Name : '—';

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => setExpandedId(isOpen ? null : item.uid)}>
        {/* ===== HEADER (always visible) ===== */}
        <View style={styles.cardHeader}>
          <MaterialIcons
            name={isOpen ? 'arrow-drop-down' : 'arrow-right'}
            size={26}
            color="#555"
          />

          <Text
            style={[styles.title, {paddingHorizontal: '1%'}]}
            numberOfLines={1}>
            #{item.DocumentNo}
          </Text>
        </View>
        {isOpen && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('TaskDetail', {task: item, priorityLabel})
            }
            style={{paddingLeft: '3%', justifyContent: 'center'}}>
            <View style={styles.divider} />
            <View style={[styles.row, {justifyContent: 'space-between'}]}>
              <Text
                style={[
                  styles.value,
                  {fontFamily: 'K2D-SemiBold', color: '#333', width: '60%'},
                ]}
                numberOfLines={4}>
                {item.Summary}
              </Text>
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityText}>{category}</Text>
              </View>
            </View>
            <View style={styles.row}>
              <MaterialIcons name="person" size={16} color="#3498DB" />
              <Text style={styles.value}>
                {item?.SalesRep_ID?.identifier || '—'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Category:</Text>
              <Text style={styles.value}>{categoryName}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Group:</Text>
              <Text style={styles.value}>{groupName}</Text>
            </View>

            <View style={styles.statusRow}>
              <View style={[styles.valueHolder, {backgroundColor: '#E8F0FE'}]}>
                <Text style={[styles.value, {color: '#1A73E8'}]}>{status}</Text>
              </View>

              <View
                style={[styles.valueHolder, {backgroundColor: '#FFF4CC77'}]}>
                <Text style={[styles.value, {color: '#8A6D00'}]}>
                  {priority}
                </Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.dateText}>
                Closed:{' '}
                {item.EndTime
                  ? new Date(item.EndTime).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </Text>
              <MaterialIcons
                name="arrow-forward-ios"
                size={15}
                color={'#555'}
              />
            </View>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ReqHeader title={`${priorityLabel} Requests`} />

      <FlatList
        ref={flatListRef}
        data={data}
        keyExtractor={i => i.uid} // uid matches your data
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 30, marginTop: 30}}
        ListEmptyComponent={<Text style={styles.empty}>No requests found</Text>}
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
  container: {flex: 1, backgroundColor: '#F5F7FA'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '9%',
    top: '2%',
    justifyContent: 'space-between',
    paddingHorizontal: '5%',
  },
  heading: {
    fontSize: 18,
    fontFamily: 'K2D-Bold',
    color: '#000',
    // paddingVertical: '5%',
  },
  card: {
    backgroundColor: '#fff',
    // borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: '5%',
    // marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  title: {
    fontSize: 17,
    fontFamily: 'K2D-Medium',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    backgroundColor: '#3498DB33',
    // backgroundColor: '#2F4FE366',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  priorityText: {fontSize: 12, color: '#2F4FE3', fontFamily: 'K2D-Bold'},
  divider: {height: 1, backgroundColor: '#ccc', marginVertical: 10},
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 10,
  },
  row: {flexDirection: 'row', alignItems: 'center', marginBottom: 6},

  valueHolder: {
    backgroundColor: '#E74C3C33',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  value: {fontSize: 13, color: '#555', marginLeft: 8, fontFamily: 'K2D-Medium'},
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginTop: 8,
    paddingVertical: '3%',
  },
  dateText: {fontSize: 12, color: '#888', fontFamily: 'K2D-Medium'},
  empty: {
    textAlign: 'center',
    marginTop: 50,
    color: '#777',
    fontFamily: 'K2D-Medium',
  },
  infoRow: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'center',
    bottom: 4,
  },
  label: {
    // fontWeight: 'bold',
    fontFamily: 'K2D-SemiBold',
    color: '#333',
    // width: 60,
    fontSize: 14,
  },
  // value: {
  //   color: '#555',
  // },
});
