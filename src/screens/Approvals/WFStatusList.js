import {
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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

  const paymentMap = useMemo(() => {
    const map = {};
    payment.forEach(p => {
      map[p.id] = p;
    });
    return map;
  }, [payment]);

  //  NEW: multi-select state
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelect = recordId => {
    if (selectedIds.includes(recordId)) {
      setSelectedIds(selectedIds.filter(i => i !== recordId));
    } else {
      setSelectedIds([...selectedIds, recordId]);
    }
  };

  // multi-select approve
  const approveSelected = ids => {
    if (!ids || ids.length === 0) return;

    Alert.alert(
      'Approved',
      `Approved ${ids.length} item(s): ${ids.join(', ')}`,
    );

    // clear selection only if multi-select
    if (multiSelectMode) {
      setSelectedIds([]);
      setMultiSelectMode(false);
    }
  };

  // single card approve
  const approveSingle = recordId => {
    approveSelected([recordId]);
  };

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
        keyExtractor={(item, index) => `${item.Record_ID}-${index}`}
        contentContainerStyle={[
          styles.listContainer,
          data.length === 0 && {flex: 1},
        ]}
        ListEmptyComponent={EmptyState}
        renderItem={({item}) => {
          const processName = item.AD_WF_Process_ID?.identifier;
          const recordId = item.Record_ID;
          const processIcon = getProcessIcon(processName);
          const pay = paymentMap[item.Record_ID];
          const trxDate = item.docdate
            ? dayjs(item.docdate).format('DD MMM YYYY')
            : '—';
          const businessPartner = item.party_name || '—';
          const amount = Number(item.TotalLines ?? 0);
          const trxType = item.IsSOTrx ? 'Sales' : 'Purchase';
          const trxColor = item.IsSOTrx ? '#2C3E90' : '#2C3E30';
          const barColor = item.IsSOTrx ? '#2C3E90' : '#2C3E50';

          const selected = selectedIds.includes(recordId);

          return (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {/*  CHECKBOX OUTSIDE CARD */}
              {multiSelectMode && (
                <TouchableOpacity
                  style={styles.checkboxWrapper}
                  onPress={() => toggleSelect(recordId)}>
                  <MaterialIcons
                    name={selected ? 'check-box' : 'check-box-outline-blank'}
                    size={24}
                    color={selected ? '#2F4FE3' : '#aaa'}
                  />
                </TouchableOpacity>
              )}

              {/* CARD */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.itemCard, {flex: 1}]}
                onPress={() => {
                  if (multiSelectMode) {
                    // agar already multi-select mode hai, tap pe disable
                    setMultiSelectMode(false);
                    setSelectedIds([]);
                  } else {
                    // normal single tap → enable multi-select for this card
                    setMultiSelectMode(true);
                    toggleSelect(recordId);
                  }
                }}>
                {/* LEFT STATUS BAR */}
                <View style={[styles.statusBar, {backgroundColor: barColor}]} />

                <View style={styles.cardContent}>
                  {/* HEADER */}
                  <View style={styles.headerRow}>
                    <View style={styles.headerLeft}>
                      <View style={styles.iconWrapper}>
                        <MaterialIcons
                          name={processIcon}
                          size={16}
                          color="#000"
                        />
                      </View>
                      <Text
                        style={styles.process}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        {processName}
                      </Text>
                    </View>
                    <Text style={styles.amount}>
                      PKR {amount.toLocaleString()}
                    </Text>
                  </View>
                  <Text style={styles.subText}>
                    #{recordId}{' '}
                    <Text style={{color: trxColor, fontWeight: '800'}}>
                      • {trxType}{' '}
                    </Text>
                    • {trxDate}
                  </Text>
                  <View style={styles.metaRow}>
                    <View style={styles.iconWrapper}>
                      <MaterialIcons name="business" size={16} color="#000" />
                    </View>
                    <Text style={styles.metaText}>{businessPartner}</Text>
                  </View>
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
                  {/* 🔹 CARD APPROVE BUTTON */}
                  <TouchableOpacity
                    style={[
                      styles.cardApproveBtn,
                      multiSelectMode && {backgroundColor: '#aaa'},
                    ]}
                    disabled={multiSelectMode}
                    onPress={() => !multiSelectMode && approveSingle(recordId)}>
                    <MaterialIcons
                      name={
                        multiSelectMode ? 'check-circle-outline' : 'task-alt'
                      }
                      size={16}
                      color="#fff"
                      style={{marginRight: 6}}
                    />
                    <Text style={styles.cardApproveText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* 🔹 MULTI-SELECT APPROVE BUTTON */}
      {multiSelectMode && selectedIds.length > 0 && (
        <TouchableOpacity
          style={styles.multiApproveBtn}
          onPress={() => approveSelected(selectedIds)}>
          <MaterialIcons
            name="done-all"
            size={18}
            color="#fff"
            style={{marginRight: 6}}
          />
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
  listContainer: {padding: '5%'},
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 14,
    elevation: 2,
    overflow: 'hidden',
    alignItems: 'center',
  },
  statusBar: {width: 4, backgroundColor: '#2F4FE3'},
  cardContent: {flex: 1, padding: 14},
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'nowrap', // make sure content stays in one line
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1, // allows text to shrink if needed
  },
  process: {
    fontSize: 15,
    fontFamily: 'K2D-SemiBold',
    color: '#000',
    flexShrink: 1, // ensures process name wraps or shrinks
  },
  amount: {
    fontSize: 15,
    fontFamily: 'K2D-MediumItalic',
    color: '#27AE60',
    marginLeft: 8, // optional spacing from left content
  },

  subText: {
    marginTop: 4,
    fontSize: 12,
    color: '#777',
    fontFamily: 'K2D-Medium',
  },
  metaRow: {flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6},
  metaText: {fontSize: 13, color: '#444', fontFamily: 'K2D-Regular'},
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
  checkboxWrapper: {
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8, // space between checkbox and card
  },
  iconWrapper: {
    padding: 8,
    backgroundColor: '#fff',
    elevation: 4,
    borderRadius: 20,
  },
  cardApproveBtn: {
    marginTop: 12,
    alignSelf: 'flex-end',
    flexDirection: 'row', // icon + text in row
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#2F4FE3',
    borderRadius: 20,
    elevation: 2,
  },
  cardApproveText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'K2D-Medium',
  },
  multiApproveBtn: {
    position: 'absolute',
    bottom: 20,
    left: '5%',
    right: '5%',
    flexDirection: 'row', // icon + text in row
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2F4FE3',
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 4,
  },
  multiApproveText: {color: '#fff', fontSize: 16, fontFamily: 'K2D-Medium'},
});
