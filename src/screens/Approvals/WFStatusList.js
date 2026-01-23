import {
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useMemo} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import dayjs from 'dayjs';
import ReqHeader from '../../components/ReqHeader';
import {usePayment} from '../../hooks/ApprovalHooks/useApproval';
import { useNavigation } from '@react-navigation/native';


const WFStatusList = ({route}) => {
  const {title, data = []} = route.params;
  const navigation = useNavigation();

  const {data: payment = []} = usePayment();

  const paymentMap = useMemo(() => {
    const map = {};
    payment.forEach(p => {
      map[p.id] = p;
    });
    return map;
  }, [payment]);

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="assignment" size={56} color="#E74C3C77" />
      <Text style={styles.emptyTitle}>No Records Found</Text>
      <Text style={styles.emptySubtitle}>
        There are no {title.toLowerCase()} workflow items right now.
      </Text>
    </View>
  );

  const getProcessIcon = processName => {
    if (!processName) return 'account-tree';

    const name = processName.toLowerCase();

    if (name.includes('payment')) return 'payments';
    if (name.includes('invoice')) return 'receipt-long';
    if (name.includes('order')) return 'shopping-cart';
    if (name.includes('request')) return 'assignment';
    if (name.includes('approval')) return 'fact-check';

    return 'account-tree';
  };

  return (
    <>
      <StatusBar translucent={true} barStyle={'dark-content'} />
      <ReqHeader title={title} />

      <FlatList
        data={data}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={[
          styles.listContainer,
          data.length === 0 && {flex: 1},
        ]}
        ListEmptyComponent={EmptyState}
        renderItem={({item}) => {
          const isCompleted = title === 'Completed';
          const processName = item.AD_WF_Process_ID?.identifier;
          const recordId = item.Record_ID;

          const processIcon = getProcessIcon(processName);
          // 🔗 MATCH PAYMENT
          const pay = paymentMap[item.Record_ID];

          const createdBy = pay?.CreatedBy?.identifier || '—';
          const createdOn = pay?.Created
            ? dayjs(pay.Created).format('DD MMM YYYY')
            : '—';

          // const trxDate = pay?.DateTrx
          //   ? dayjs(pay.DateTrx).format('DD MMM YYYY')
          //   : '—';
          const trxDate = item.docdate
            ? dayjs(item.docdate).format('DD MMM YYYY')
            : '—';

          // const businessPartner = pay?.C_BPartner_ID?.identifier || '—';
          const businessPartner = item.party_name || '—';

          // const amount = pay?.PayAmt ?? item.TotalLines ?? 0;
          // const amount = Number(pay?.PayAmt ?? item.TotalLines ?? 0);
          const amount = Number(item.TotalLines ?? 0);

          // const trxType = pay?.TrxType?.identifier || '—';

          const trxType = item.IsSOTrx ? 'Sales' : 'Purchase';

          const trxColor = item.IsSOTrx ? '#2C3E90' : '#2C3E30';
          const barColor = item.IsSOTrx ? '#2C3E90' : '#2C3E50';

          return (
            <View style={styles.itemCard}>
              {/* LEFT STATUS BAR */}
              <View
                style={[
                  styles.statusBar,
                  {backgroundColor: barColor},
                  //   {backgroundColor: isCompleted ? '#27AE60' : '#F39C12'},
                ]}
              />

              <View style={styles.cardContent}>
                {/* HEADER */}
                <View style={styles.headerRow}>
                  <View style={styles.headerLeft}>
                    <View style={styles.iconWrapper}>
                      <MaterialIcons
                        name={processIcon}
                        size={20}
                        color="#000"
                      />
                    </View>

                    <Text style={styles.process}>{processName}</Text>
                  </View>

                  <Text style={styles.amount}>
                    PKR {amount.toLocaleString()}
                  </Text>
                </View>

                {/* SUB HEADER */}
                <Text style={styles.subText}>
                  #{recordId}{' '}
                  <Text style={{color: trxColor, fontWeight: '800'}}>
                    • {trxType}{' '}
                  </Text>
                  • {trxDate}
                </Text>

                {/* BUSINESS PARTNER */}
                <View style={styles.metaRow}>
                  <View style={styles.iconWrapper}>
                    <MaterialIcons name="business" size={16} color="#000" />
                  </View>
                  <Text style={styles.metaText}>{businessPartner}</Text>
                </View>

                {/* CREATED INFO */}
                <View style={styles.metaRow}>
                  <View style={styles.iconWrapper}>
                    <MaterialIcons
                      name="person-outline"
                      size={16}
                      color="#000"
                    />
                  </View>

                  <Text style={styles.metaText}>
                    {item.CreatedBy?.identifier} •{' '}
                    {dayjs(item.Created).format('DD MMM YYYY')}
                  </Text>
                </View>

                {/* ACTION */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.actionBtn}
                  onPress={() => Alert.alert('Under Development')}
                  >
                  <MaterialIcons
                    name={isCompleted ? 'check-circle' : 'pending-actions'}
                    size={16}
                    color="#fff"
                  />
                  <Text style={styles.actionText}>
                    {isCompleted ? 'Approved' : 'Approve'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </>
  );
};

export default WFStatusList;
const styles = StyleSheet.create({
  listContainer: {
    padding: '5%',
  },

  rowBet: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  infoText: {
    marginLeft: 6,
    fontSize: 15,
    color: '#333',
    fontFamily: 'K2D-SemiBold',
  },

  statusBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 10,
  },

  statusText: {
    marginLeft: 6,
    fontSize: 12,
    fontFamily: 'K2D-Medium',
  },

  label: {
    fontSize: 13,
    color: '#555',
    fontFamily: 'K2D-Regular',
  },

  iconWrapper: {
    padding: 8,
    backgroundColor: '#fff',
    elevation: 3,
    borderRadius: 20,
  },

  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 14,
    elevation: 2,
    overflow: 'hidden',
  },

  statusBar: {
    width: 4,
    backgroundColor: '#2F4FE3',
  },

  cardContent: {
    flex: 1,
    padding: 14,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  process: {
    fontSize: 15,
    fontFamily: 'K2D-SemiBold',
    // color: '#2C3E50',
    color: '#000',
  },

  amount: {
    fontSize: 15,
    fontFamily: 'K2D-MediumItalic',
    // fontStyle:'italic',
    color: '#27AE60',
    // color: '#2F4FE3',
  },

  subText: {
    marginTop: 4,
    fontSize: 12,
    color: '#777',
    fontFamily: 'K2D-Medium',
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },

  metaText: {
    fontSize: 13,
    color: '#444',
    fontFamily: 'K2D-Regular',
  },

  actionBtn: {
    marginTop: 12,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#2F4FE3',
  },

  actionText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#fff',
    fontFamily: 'K2D-Medium',
  },

  /* EMPTY STATE */
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'K2D-Medium',
    color: '#333',
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },
});
