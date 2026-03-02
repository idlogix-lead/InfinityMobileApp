import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  BackHandler,
} from 'react-native';
import React, { useEffect } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import dayjs from 'dayjs';
import ReqHeader from '../../components/ReqHeader';
import WFTimeline from '../../components/ApprocalScreenComponents/WFTimeLine';
import { useNavigation } from '@react-navigation/native';

const WFDetail = ({route}) => {
  const {item} = route.params;
  const navigation = useNavigation();

  const workflowSteps = [
    {
      id: 1,
      step: 'Created',
      user: 'Ali Khan',
      date: '12 Feb 2026 10:30',
      status: 'done',
    },
    {
      id: 2,
      step: 'Manager Approval',
      user: 'Sara Malik',
      date: '12 Feb 2026 11:00',
      status: 'done',
    },
    {id: 3, step: 'Finance Review', user: '', date: '', status: 'pending'},
    {id: 4, step: 'Final Approval', user: '', date: '', status: 'upcoming'},
  ];

  const amount = Number(item.TotalLines ?? 0);
  const date = dayjs(item.docdate).format('DD MMM YYYY');
  const created = dayjs(item.Created).format('DD MMM YYYY, hh:mm A');
  const updated = dayjs(item.Updated).format('DD MMM YYYY, hh:mm A');

  const approveSingle = () => {
    alert(`Approved Record ${item.Record_ID}`);
  };

  const rejectSingle = () => {
    alert(`Rejected Record ${item.Record_ID}`);
  };
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
      {/* <ReqHeader title="Approval Detail" /> */}
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
          Approval Detail
        </Text>
        {/* <TouchableOpacity
                onPress={() => navigation.navigate('approvalNotification')}>
                <MaterialIcons name="notifications" color={'#000'} size={25} />
              </TouchableOpacity> */}
        <View style={{}} />
      </View>

      <ScrollView style={styles.container}>
        {/* ================= HEADER SUMMARY CARD ================= */}
        <View style={styles.summaryCard}>
          <View style={styles.iconWrap}>
            <MaterialIcons name="assignment" size={26} color="#000" />
          </View>

          <View style={{flex: 1}}>
            <Text style={styles.process}>
              {item.AD_WF_Process_ID?.identifier}
            </Text>
            <Text style={styles.party}>{item.party_name}</Text>
            <Text style={styles.amount}>PKR {amount.toLocaleString()}</Text>
            <Text style={styles.date}>{date}</Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              item.Processed ? styles.statusApproved : styles.statusPending,
            ]}>
            <Text style={styles.statusText}>
              {item.Processed ? 'Approved' : item.WFState?.identifier}
            </Text>
          </View>
        </View>

        <WFTimeline steps={workflowSteps} />

        {/* ================= DOCUMENT INFO ================= */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Document Info</Text>

          <InfoRow label="Document No" value={item.DocumentNo} />
          <InfoRow
            label="Document Type"
            value={item.C_DocType_ID?.identifier}
          />
          <InfoRow label="Record ID" value={item.Record_ID} />
          {/* <InfoRow label="Table" value={item.AD_Table_ID?.identifier} /> */}
          <InfoRow label="Sales Order" value={item.IsSOTrx ? 'Yes' : 'No'} />
        </View>

        {/* ================= WORKFLOW INFO ================= */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workflow Info</Text>

          <InfoRow label="Workflow" value={item.AD_Workflow_ID?.identifier} />
          <InfoRow
            label="Activity"
            value={item.AD_WF_Activity_ID?.identifier}
          />
          <InfoRow
            label="Responsible"
            value={item.AD_WF_Responsible_ID?.identifier}
          />
          <InfoRow label="Role" value={item.AD_Role_ID?.identifier} />
          <InfoRow label="Status" value={item.WFState?.identifier} />
          <InfoRow label="Priority" value={String(item.Priority)} />
        </View>

        {/* ================= META INFO ================= */}
        <View style={[styles.section, {marginBottom: '10%'}]}>
          <Text style={styles.sectionTitle}>Meta Info</Text>

          <InfoRow label="Client" value={item.AD_Client_ID?.identifier} />
          <InfoRow label="Organization" value={item.AD_Org_ID?.identifier} />
          <InfoRow label="Created By" value={item.CreatedBy?.identifier} />
          <InfoRow label="Created On" value={created} />
          <InfoRow label="Updated By" value={item.UpdatedBy?.identifier} />
          <InfoRow label="Updated On" value={updated} />
        </View>

        {/* ================= ACTION BUTTONS ================= */}
      </ScrollView>
      {!item.Processed && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.approveBtn} onPress={approveSingle}>
            <MaterialIcons name="check" size={20} color="#fff" />
            <Text style={styles.actionText}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rejectBtn} onPress={rejectSingle}>
            <MaterialIcons name="close" size={20} color="#fff" />
            <Text style={styles.actionText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{height: 20}} />
    </>
  );
};

export default WFDetail;

/* ================= SMALL COMPONENT ================= */
const InfoRow = ({label, value}) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || '-'}</Text>
  </View>
);

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#77DD7722',
    padding: 12,
  },

  /* SUMMARY CARD */
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    marginBottom: 14,
    // borderTopColor: '#77DD77',
    // borderTopWidth: 5,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    // backgroundColor: '#F2F5FF',
    backgroundColor: '#E6F7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  process: {
    fontSize: 16,
    fontFamily: 'K2D-SemiBold',
    color: '#222',
  },
  party: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'K2D-Medium',
  },
  amount: {
    fontSize: 18,
    fontFamily: 'K2D-Bold',
    color: '#000',
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusApproved: {backgroundColor: '#22C55E'},
  statusPending: {backgroundColor: '#F59E0B'},
  statusText: {color: '#fff', fontSize: 12, fontFamily: 'K2D-SemiBold'},

  /* SECTIONS */
  section: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'K2D-SemiBold',
    color: '#000',
    marginBottom: 8,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 0.4,
    borderColor: '#eee',
  },
  label: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'K2D-Medium',
  },
  value: {
    fontSize: 13,
    color: '#222',
    fontFamily: 'K2D-SemiBold',
    maxWidth: '60%',
    textAlign: 'right',
  },

  /* ACTION BUTTONS */
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    paddingHorizontal: 12,
  },
  approveBtn: {
    flex: 1,
    backgroundColor: '#2E7D57',
    padding: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#C62828',
    padding: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'K2D-SemiBold',
  },
});
