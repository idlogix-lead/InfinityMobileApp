import {View, Text, StyleSheet, FlatList, StatusBar, BackHandler, TouchableOpacity} from 'react-native';
import React, { useEffect } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ReqHeader from '../../components/ReqHeader';
import { useNavigation } from '@react-navigation/native';

const notifications = [
  {
    id: '1',
    title: 'Approval Request',
    message: 'Purchase Order #12345 needs your approval',
    time: '2 min ago',
    type: 'approval',
  },
  {
    id: '2',
    title: 'Workflow Completed',
    message: 'Finance review completed successfully',
    time: '1 hour ago',
    type: 'success',
  },
  {
    id: '3',
    title: 'Action Required',
    message: 'Manager approval pending',
    time: '3 hours ago',
    type: 'warning',
  },
];

const ApprovalNotification = () => {
    const navigation = useNavigation();
  const renderItem = ({item}) => (
    <View style={styles.card}>
      <View
        style={[
          styles.iconBox,
          item.type === 'success' && styles.successBox,
          item.type === 'warning' && styles.warningBox,
        ]}>
        <MaterialIcons
          name={
            item.type === 'success'
              ? 'check-circle'
              : item.type === 'warning'
              ? 'warning'
              : 'notifications'
          }
          size={24}
          color="#fff"
        />
      </View>

      <View style={{flex: 1}}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </View>
  );
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />

      {/* <ReqHeader title="Notifications" /> */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: '5%',
          paddingTop: '10%',
          backgroundColor:'#77DD7722'
        }}>
        <TouchableOpacity onPress={handleBackPress}>
          <MaterialIcons name="chevron-left" size={30} color={'#000'} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 20,
            color: '#222',
            fontFamily: 'K2D-Medium',
          }}>
          {' '}
          Notifications
        </Text>
        {/* <TouchableOpacity
          onPress={() => navigation.navigate('approvalNotification')}>
          <MaterialIcons name="notifications" color={'#000'} size={25} />
        </TouchableOpacity> */}
        <View style={{}} />
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.container}
      />
    </>
  );
};

export default ApprovalNotification;

const styles = StyleSheet.create({
  container: {
    padding: 14,
    backgroundColor: '#77DD7722',
    flexGrow: 1,
  },

  card: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 22,
    marginBottom: 14,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },

  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  successBox: {
    backgroundColor: '#16A34A',
  },

  warningBox: {
    backgroundColor: '#F59E0B',
  },

  title: {
    fontSize: 15,
    fontFamily: 'K2D-SemiBold',
    color: '#111827',
  },

  message: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },

  time: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
  },
});
