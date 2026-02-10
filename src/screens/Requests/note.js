import {
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import React, {useMemo, useState} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import dayjs from 'dayjs';
import ReqHeader from '../../components/ReqHeader';
import {usePayment} from '../../hooks/ApprovalHooks/useApproval';
import {useNavigation} from '@react-navigation/native';

const WFStatusList = ({route}) => {
  const {title, data = []} = route.params;
  const navigation = useNavigation();
  const {data: payment = []} = usePayment();

  // Map payment by Record_ID
  const paymentMap = useMemo(() => {
    const map = {};
    payment.forEach(p => (map[p.id] = p));
    return map;
  }, [payment]);

  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelect = id => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
    );
  };

  const approveSelected = ids => {
    if (!ids.length) return;
    Alert.alert('Approved', `Approved: ${ids.join(', ')}`);
    setSelectedIds([]);
    setMultiSelectMode(false);
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="assignment" size={56} color="#E74C3C77" />
      <Text style={styles.emptyTitle}>No Records Found</Text>
      <Text style={styles.emptySubtitle}>
        There are no {title?.toLowerCase()} workflow items right now.
      </Text>
    </View>
  );

  const getProcessIcon = name => {
    if (!name) return 'account-tree';
    name = name.toLowerCase();
    if (name.includes('payment')) return 'payments';
    if (name.includes('invoice')) return 'receipt-long';
    if (name.includes('order')) return 'shopping-cart';
    return 'assignment';
  };

  // WF STATUS MAP
  const wfLabel = {
    OS: 'Pending L1',
    DR: 'Draft',
    AP: 'Approved',
    RJ: 'Rejected',
  };

  // FILTER BAR
  const FilterBar = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterRow}>
      {['All Types', 'PKR 10,000 - 500,000', 'Pending'].map(item => (
        <TouchableOpacity key={item} style={styles.filterChip}>
          <Text style={styles.filterText}>{item}</Text>
          <MaterialIcons name="keyboard-arrow-down" size={18} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // TABS
  const Tabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabRow}>
      <Text style={styles.tabActive}>My Turn 3</Text>
      <Text style={styles.tab}>Escalated 2</Text>
      <Text style={styles.tab}>Auto-Approved</Text>
      <Text style={styles.tab}>SLA Breach 2</Text>
    </ScrollView>
  );

  return (
    <>
      <StatusBar translucent barStyle="dark-content" />
      <ReqHeader title={title} />

      {/* FILTERS */}
      <FilterBar />
      <Tabs />

      <FlatList
        data={data}
        keyExtractor={item => String(item.Record_ID)}
        contentContainerStyle={[styles.listContainer, !data.length && {flex: 1}]}
        ListEmptyComponent={EmptyState}
        renderItem={({item}) => {
          const recordId = item.Record_ID;
          const processName = item.AD_WF_Process_ID?.identifier;
          const processIcon = getProcessIcon(processName);
          const amount = Number(item.TotalLines || 0);
          const businessPartner = item.party_name || '—';
          const trxDate = item.docdate
            ? dayjs(item.docdate).format('DD MMM YYYY')
            : '—';

          const wfState = item.WFState?.id;
          const statusLabel = wfLabel[wfState] || 'Pending';

          // SLA CALCULATION (24h SLA)
          const created = dayjs(item.Created);
          const deadline = created.add(24, 'hour');
          const diffMin = deadline.diff(dayjs(), 'minute');

          let slaText = 'SLA Breached';
          if (diffMin > 0) {
            slaText = `${Math.floor(diffMin / 60)}h ${diffMin % 60}m remaining`;
          }

          const selected = selectedIds.includes(recordId);

          return (
            <View style={styles.rowWrap}>
              {/* CHECKBOX */}
              {multiSelectMode && (
                <TouchableOpacity
                  onPress={() => toggleSelect(recordId)}
                  style={styles.checkboxWrapper}>
                  <MaterialIcons
                    name={selected ? 'check-box' : 'check-box-outline-blank'}
                    size={24}
                    color={selected ? '#2F4FE3' : '#aaa'}
                  />
                </TouchableOpacity>
              )}

              {/* MAIN CARD */}
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.card}
                onPress={() => {
                  setMultiSelectMode(true);
                  toggleSelect(recordId);
                }}>
                {/* LEFT BAR */}
                <View style={styles.statusBar} />

                <View style={styles.cardBody}>
                  {/* HEADER */}
                  <View style={styles.headerRow}>
                    <View style={styles.headerLeft}>
                      <MaterialIcons name={processIcon} size={18} />
                      <Text style={styles.processTitle}>{processName}</Text>
                    </View>
                    <Text style={styles.amountText}>
                      PKR {amount.toLocaleString()}
                    </Text>
                  </View>

                  {/* RECORD + STATUS */}
                  <View style={styles.subRow}>
                    <Text style={styles.recordText}>#{recordId}</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{statusLabel}</Text>
                    </View>
                  </View>

                  {/* BUSINESS */}
                  <View style={styles.metaRow}>
                    <MaterialIcons name="business" size={16} />
                    <Text style={styles.metaText}>{businessPartner}</Text>
                  </View>

                  {/* USER + DATE */}
                  <View style={styles.metaRow}>
                    <MaterialIcons name="person" size={16} />
                    <Text style={styles.metaText}>
                      {item.CreatedBy?.identifier} • {trxDate}
                    </Text>
                  </View>

                  {/* SLA */}
                  <View
                    style={[
                      styles.slaBadge,
                      {backgroundColor: diffMin < 0 ? '#FFE5E5' : '#EEF3FF'},
                    ]}>
                    <Text
                      style={[
                        styles.slaText,
                        {color: diffMin < 0 ? '#E74C3C' : '#2F4FE3'},
                      ]}>
                      ⏳ {slaText}
                    </Text>
                  </View>

                  {/* ACTION BUTTONS SCROLL */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.actionRow}>
                    <TouchableOpacity style={styles.approveBtn}>
                      <MaterialIcons name="check" size={18} color="#fff" />
                      <Text style={styles.btnText}>Approve</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.rejectBtn}>
                      <MaterialIcons name="close" size={18} />
                      <Text>Reject</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.forwardBtn}>
                      <MaterialIcons name="arrow-forward" size={18} />
                      <Text>Forward</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.changeBtn}>
                      <Text>Request Changes</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* MULTI APPROVE BUTTON */}
      {multiSelectMode && selectedIds.length > 0 && (
        <TouchableOpacity
          style={styles.multiApproveBtn}
          onPress={() => approveSelected(selectedIds)}>
          <MaterialIcons name="done-all" size={18} color="#fff" />
          <Text style={styles.multiApproveText}>
            Approve ({selectedIds.length})
          </Text>
        </TouchableOpacity>
      )}
    </>
  );
};

export default WFStatusList;
const styles = StyleSheet.create({
  listContainer: {padding: 12},

  rowWrap: {flexDirection: 'row', alignItems: 'center'},

  card: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 14,
    elevation: 3,
    overflow: 'hidden',
  },

  statusBar: {width: 4, backgroundColor: '#2F4FE3'},

  cardBody: {flex: 1, padding: 14},

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {flexDirection: 'row', alignItems: 'center', gap: 6},

  processTitle: {fontSize: 16, fontWeight: '700'},
  amountText: {fontSize: 16, fontWeight: '700', color: '#27AE60'},

  subRow: {flexDirection: 'row', gap: 8, marginTop: 4},
  recordText: {fontSize: 12, color: '#777'},
  badge: {
    backgroundColor: '#2F4FE3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {color: '#fff', fontSize: 11},

  metaRow: {flexDirection: 'row', gap: 6, marginTop: 6},
  metaText: {fontSize: 13, color: '#555'},

  slaBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  slaText: {fontSize: 12, fontWeight: '600'},

  actionRow: {flexDirection: 'row', gap: 10, marginTop: 12},

  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2F4FE3',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  btnText: {color: '#fff', fontWeight: '600'},

  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  forwardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  changeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  checkboxWrapper: {paddingRight: 8},

  filterRow: {flexDirection: 'row', gap: 10, padding: 10},
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
  },
  filterText: {fontSize: 13, fontWeight: '600'},

  tabRow: {flexDirection: 'row', gap: 18, paddingHorizontal: 10},
  tab: {fontSize: 13, color: '#888'},
  tabActive: {fontSize: 13, fontWeight: '700', color: '#2F4FE3'},

  multiApproveBtn: {
    position: 'absolute',
    bottom: 20,
    left: '5%',
    right: '5%',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2F4FE3',
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 5,
  },
  multiApproveText: {color: '#fff', fontSize: 16, fontWeight: '700'},

  emptyContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  emptyTitle: {fontSize: 16, fontWeight: '600'},
  emptySubtitle: {fontSize: 13, color: '#888', textAlign: 'center'},
});
