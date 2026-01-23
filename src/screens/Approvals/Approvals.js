import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ReqHeader from '../../components/ReqHeader';
import {useWFAct} from '../../hooks/ApprovalHooks/useApproval';
import {useNavigation} from '@react-navigation/native';
import {useAuthStore} from '../../store/authStore';

const Approvals = () => {
  const navigation = useNavigation();
  const {data: wfActivity = []} = useWFAct();
  // const {roleId, userId} = useAuthStore();
  const userName = useAuthStore(state => state.userName);
  const roleId = useAuthStore(state => state.roleId);
  const userId = useAuthStore(state => state.userId);

  const myApprovals = wfActivity.filter(
    r => Number(r.AD_WF_Responsible_ID?.id) === Number(userId),
  );

  const completedList = myApprovals.filter(item => item.WFState?.id === 'CC');

  const suspendedList = myApprovals.filter(item => item.WFState?.id === 'OS');

  console.log('WF RAW:', wfActivity.length);
  console.log('User ID:', userId);
  console.log('MY APPROVALS:', myApprovals.length);

  return (
    <>
      <ReqHeader title="Approvals" />

      <ScrollView style={styles.container}>
        <Text style={styles.title}>Workflow Status</Text>

        <View style={styles.cardRow}>
          {/* COMPLETED */}
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('WFStatusList', {
                title: 'Completed',
                data: completedList,
              })
            }>
            <MaterialIcons name="check-circle" size={36} color="#27AE60" />
            <Text style={styles.cardLabel}>Completed</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{completedList.length}</Text>
            </View>
          </TouchableOpacity>

          {/* SUSPENDED */}
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('WFStatusList', {
                title: 'Suspended',
                data: suspendedList,
              })
            }>
            <MaterialIcons
              name="pause-circle-filled"
              size={36}
              color="#F39C12"
            />
            <Text style={styles.cardLabel}>Suspended</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{suspendedList.length}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
};

export default Approvals;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: '5%',
    backgroundColor: '#F9F8F6',
  },
  title: {
    fontSize: 20,
    fontFamily: 'K2D-SemiBold',
    marginBottom: 20,
    color: '#333',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: '2%',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 3,
  },
  cardLabel: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'K2D-Medium',
  },
  badge: {
    marginTop: 6,
    backgroundColor: '#E74C3C',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'K2D-Bold',
  },
});
