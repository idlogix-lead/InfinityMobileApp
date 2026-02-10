import {
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  BackHandler,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import React, {useMemo, useState, useEffect} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import dayjs from 'dayjs';
import ReqHeader from '../../components/ReqHeader';
import {usePayment, useWFAct} from '../../hooks/ApprovalHooks/useApproval';
import {useNavigation} from '@react-navigation/native';
import {ScrollView} from 'react-native-gesture-handler';
import {Dropdown} from 'react-native-element-dropdown';

const WFStatusList = ({route}) => {
  // const {title, data = []} = route.params;
  const {title} = route.params;
  const {data: data = []} = useWFAct();
  const navigation = useNavigation();
  // const {data: payment = []} = usePayment();
  const [multiSelectMode, setMultiSelectMode] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [expandedCardId, setExpandedCardId] = useState(null);

  // FILTER STATES
  const [docTypeFilter, setDocTypeFilter] = useState('All Doc Type');
  const [amountFilter, setAmountFilter] = useState('');
  const [wfStatusFilter, setWfStatusFilter] = useState('All Status');
  const [roleFilter, setRoleFilter] = useState('All Role');

  // BACK HANDLER FOR ANDROID
  // useEffect(() => {
  //   const onBackPress = () => {
  //     if (multiSelectMode) {
  //       setMultiSelectMode(false);
  //       setSelectedIds([]);
  //       return true; // prevent default back action
  //     }
  //     return false; // allow default back action
  //   };

  //   BackHandler.addEventListener('hardwareBackPress', onBackPress);
  //   return () =>
  //     BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  // }, [multiSelectMode]);

    useEffect(() => {
    const onBackPress = () => {
      if (expandedCardId) {
        setExpandedCardId(null);
        return true; // prevent default back action
      }
      return false; // allow default back action
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, [expandedCardId]);

  // OUTSIDE TAP HANDLER
  // const handleOutsidePress = () => {
  //   if (multiSelectMode) {
  //     setMultiSelectMode(false);
  //     setSelectedIds([]);
  //   }
  // };

  const handleOutsidePress = () => {
    if (expandedCardId) {
      setExpandedCardId(null);
    }
  };

  // Document Types
  const docTypes = useMemo(() => {
    const types = data.map(i => i.C_DocType_ID?.identifier).filter(Boolean);
    return ['All Doc Type', ...new Set(types)];
  }, [data]);

  // WF Status
  const wfStatusList = useMemo(() => {
    const status = data.map(i => i.WFState?.identifier).filter(Boolean);
    return ['All Status', ...new Set(status)];
  }, [data]);

  // select Ranges
  const amountRanges = [
    {label: 'All', min: 0, max: Infinity},
    {label: '0 - 10K', min: 0, max: 10000},
    {label: '10K - 50K', min: 10000, max: 50000},
    {label: '50K - 100K', min: 50000, max: 100000},
    {label: '100K+', min: 100000, max: Infinity},
  ];

  // Roles
  const roleList = useMemo(() => {
    const roles = data.map(i => i.AD_Role_ID?.identifier).filter(Boolean);
    return ['All Role', ...new Set(roles)];
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const amount = Number(item.TotalLines ?? 0);
      const docType = item.C_DocType_ID?.identifier;
      const wfState = item.WFState?.identifier;
      const role = item.AD_Role_ID?.identifier;

      // Role Filter
      if (roleFilter !== 'All Role' && role !== roleFilter) return false;
      // Doc Type Filter
      if (docTypeFilter !== 'All Doc Type' && docType !== docTypeFilter)
        return false;

      // WF Status Filter
      if (wfStatusFilter !== 'All Status' && wfState !== wfStatusFilter)
        return false;

      // Amount Filter
      const range = amountRanges.find(r => r.label === amountFilter);
      if (range && (amount < range.min || amount > range.max)) return false;

      return true;
    });
  }, [data, docTypeFilter, wfStatusFilter, amountFilter, roleFilter]);

  // const paymentMap = useMemo(() => {
  //   const map = {};
  //   payment.forEach(p => {
  //     map[p.id] = p;
  //   });
  //   return map;
  // }, [payment]);

  //  NEW: multi-select state

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

      <Text style={styles.heading}>Configured rule-base approval workflow</Text>

      <TouchableWithoutFeedback onPress={handleOutsidePress}>
        <View style={{flex: 1}}>
          {/* ===== FILTER BAR FIXED LAYOUT ===== */}

          <View style={styles.filterWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.filterBar}>
              {/* ROLE FILTER */}
              <Dropdown
                style={styles.filterDropdown}
                containerStyle={[styles.dropdownContainer,{width: 95}]}
                data={roleList.map(r => ({label: r, value: r}))}
                labelField="label"
                valueField="value"
                value={roleFilter}
                onChange={item => setRoleFilter(item.value)}
                placeholder="Role"
                selectedTextStyle={styles.dropdownSelectedText}
                placeholderStyle={styles.dropdownPlaceholder}
                itemTextStyle={styles.dropdownItemText}
              />

              {/* DOC TYPE */}
              <Dropdown
                style={styles.filterDropdown}
                containerStyle={[styles.dropdownContainer,{width: 130}]}
                data={docTypes.map(d => ({label: d, value: d}))}
                labelField="label"
                valueField="value"
                value={docTypeFilter}
                onChange={item => setDocTypeFilter(item.value)}
                placeholder="Doc Type"
                //  TEXT COLORS
                selectedTextStyle={styles.dropdownSelectedText}
                placeholderStyle={styles.dropdownPlaceholder}
                itemTextStyle={styles.dropdownItemText}
              />

              {/* AMOUNT */}
              {/* <Dropdown
                style={styles.filterDropdown}
                containerStyle={styles.dropdownContainer}
                data={amountRanges.map(a => ({label: a.label, value: a.label}))}
                labelField="label"
                valueField="value"
                value={amountFilter}
                onChange={item => setAmountFilter(item.value)}
                placeholder="Select Amount Range"
                //  TEXT COLORS
                selectedTextStyle={styles.dropdownSelectedText}
                placeholderStyle={styles.dropdownSelectedText}
                itemTextStyle={styles.dropdownItemText}
              /> */}

              {/* WF STATUS */}
              <Dropdown
                style={styles.filterDropdown}
                containerStyle={styles.dropdownContainer}
                data={wfStatusList.map(s => ({label: s, value: s}))}
                labelField="label"
                valueField="value"
                value={wfStatusFilter}
                onChange={item => setWfStatusFilter(item.value)}
                placeholder="Status"
                //  TEXT COLORS
                selectedTextStyle={styles.dropdownSelectedText}
                placeholderStyle={styles.dropdownPlaceholder}
                itemTextStyle={styles.dropdownItemText}
              />
            </ScrollView>
          </View>

          <FlatList
            data={filteredData}
            keyExtractor={(item, index) => `${item.Record_ID}-${index}`}
            contentContainerStyle={[
              styles.listContainer,
              filteredData.length === 0 && {flex: 1},
            ]}
            ListEmptyComponent={EmptyState}
            renderItem={({item}) => {
              const processName = item.AD_WF_Process_ID?.identifier;
              const recordId = item.Record_ID;
              const processIcon = getProcessIcon(processName);
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
                        name={
                          selected ? 'check-box' : 'check-box-outline-blank'
                        }
                        size={24}
                        color={selected ? '#2F4FE3' : '#aaa'}
                      />
                    </TouchableOpacity>
                  )}

                  {/* CARD */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.itemCard, {flex: 1}]}
                    onLongPress={() => {
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
                    <View
                      style={[styles.statusBar, {backgroundColor: barColor}]}
                    />

                    <View style={styles.cardContent}>
                      {/* HEADER */}
                      <TouchableOpacity
                        onPress={() => {
                          if (expandedCardId === recordId) {
                            setExpandedCardId(null); // collapse if already expanded
                          } else {
                            setExpandedCardId(recordId); // expand this card
                          }
                        }}
                        style={styles.headerRow}>
                        <View style={styles.headerLeft}>
                          <View style={styles.iconWrapper}>
                            <MaterialIcons
                              name={processIcon}
                              size={16}
                              color={'#000'}
                            />
                          </View>
                          <Text
                            style={styles.process}
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            {processName}
                          </Text>
                        </View>
                        {/* AMOUNT + ARROW */}
                        <View
                          style={{flexDirection: 'row', alignItems: 'center'}}>
                          <Text style={styles.amount}>
                            PKR {amount.toLocaleString()}
                          </Text>

                          <MaterialIcons
                            name={
                              expandedCardId === recordId
                                ? 'keyboard-arrow-up'
                                : 'keyboard-arrow-down'
                            }
                            size={22}
                            color="#555"
                            style={{marginLeft: 4}}
                          />
                        </View>
                        {/* <Text style={styles.amount}>
                      PKR {amount.toLocaleString()}
                    </Text> */}
                      </TouchableOpacity>
                      {expandedCardId === recordId && (
                        <>
                          {/* <View style={styles.hRow} /> */}
                          <Text style={styles.subText}>
                            #{recordId}{' '}
                            <Text style={{color: trxColor, fontWeight: '800'}}>
                              • {trxType}{' '}
                            </Text>
                            • {trxDate}
                          </Text>
                          <View style={styles.metaRow}>
                            <View style={styles.iconWrapper}>
                              <MaterialIcons
                                name="business"
                                size={16}
                                color="#000"
                              />
                            </View>
                            <Text style={styles.metaText}>
                              {businessPartner}
                            </Text>
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
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.actionRow}>
                            <TouchableOpacity
                              style={[
                                styles.cardApproveBtn,
                                multiSelectMode &&
                                  selectedIds.length > 1 && {
                                    backgroundColor: '#aaa',
                                  },
                              ]}
                              disabled={
                                multiSelectMode && selectedIds.length > 1
                              } // disable only if multi-select & >1 selected
                              onPress={() => approveSingle(recordId)}>
                              <MaterialIcons
                                name={
                                  multiSelectMode
                                    ? 'check-circle-outline'
                                    : 'task-alt'
                                }
                                size={16}
                                color="#fff"
                                style={{marginRight: 6}}
                              />
                              <Text style={styles.cardApproveText}>
                                Approve
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.cardBtn}>
                              <View style={styles.iconWrapperCardBtn}>
                                <MaterialIcons
                                  name="close"
                                  size={18}
                                  color="#E53935"
                                />
                              </View>
                              <Text style={styles.cardBtnTxt}>Reject</Text>
                            </TouchableOpacity>

                            {/* <TouchableOpacity style={styles.cardBtn}>
                              <View style={styles.iconWrapperCardBtn}>
                                <MaterialIcons
                                  name="arrow-forward"
                                  size={18}
                                  color="#1E88E5"
                                />
                              </View>
                              <Text style={styles.cardBtnTxt}>Forward</Text>
                            </TouchableOpacity> */}

                            <TouchableOpacity style={styles.cardBtn}>
                              <View style={styles.iconWrapperCardBtn}>
                                <MaterialIcons
                                  name="chat"
                                  size={16}
                                  color="#444"
                                />
                              </View>
                              <Text style={styles.cardBtnTxt}>
                                Request Changes
                              </Text>
                            </TouchableOpacity>
                          </ScrollView>
                        </>
                      )}
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
        </View>
      </TouchableWithoutFeedback>
    </>
  );
};

export default WFStatusList;

const styles = StyleSheet.create({
  heading: {
    color: '#333',
    fontFamily: 'K2D-Medium',
    fontSize: 15,
    textAlign: 'center',
    marginTop: '3%',
    letterSpacing: 0.5,
  },
  listContainer: {padding: '5%'},
  statusBar: {width: 4, backgroundColor: '#2F4FE3'},
  process: {
    fontSize: 15,
    fontFamily: 'K2D-SemiBold',
    color: '#000',
    flexShrink: 1, // ensures process name wraps or shrinks
  },
  amount: {
    fontSize: 15,
    fontFamily: 'K2D-MediumItalic',
    color: '#058007',
    marginLeft: 8, // optional spacing from left content
  },

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
  iconWrapper: {
    padding: 8,
    backgroundColor: '#fff',
    elevation: 4,
    borderRadius: 20,
  },
  cardApproveBtn: {
    marginTop: 6,
    // alignSelf: 'flex-end',
    flexDirection: 'row', // icon + text in row
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#2F4FE3',
    borderRadius: 15,
    elevation: 2,
  },
  cardApproveText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'K2D-Medium',
  },
  cardBtn: {
    marginTop: 6,
    // alignSelf: 'flex-end',
    flexDirection: 'row', // icon + text in row
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 2,
  },
  cardBtnTxt: {
    color: '#333',
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

  filterWrapper: {
    height: 56, // 🔥 FIXED HEIGHT
    // backgroundColor: '#fff',
    // elevation: 4,
    justifyContent: 'center',
    marginTop: '3%',
    paddingHorizontal: '2%',
  },

  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
  },

  filterDropdown: {
    // width: 130,
    height: 40, // 🔥 Compact dropdown
    // borderColor: '#ddd',
    // borderWidth: 1,
    borderRadius: 18,
    // paddingHorizontal: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    elevation: 3,
  },

  dropdownContainer: {
    borderRadius: 12,
    elevation: 10,
    zIndex: 9999,
    top: 2,
    // width: 130,
  },
  dropdownSelectedText: {
    color: '#000', // selected text white
    fontSize: 15,
    fontFamily: 'K2D-SemiBold',
    textAlign: 'center',
    // right: 1,
  },

  dropdownPlaceholder: {
    color: '#555', // placeholder gray
    fontSize: 13,
    fontFamily: 'K2D-Medium',
  },

  dropdownItemText: {
    color: '#666', //  OPTIONS TEXT GRAY
    fontSize: 13,
    fontFamily: 'K2D-Medium',
    lineHeight: 20,
  },
  iconWrapperCardBtn: {
    right: 5,
  },
  hRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: '2%',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10, // 🔹 was 14 → smaller spacing between cards
    elevation: 2,
    overflow: 'hidden',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    padding: 10, // 🔹 was 14 → less vertical space inside card
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: 4, // 🔹 was 0 → slightly tighter
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // 🔹 was 6 → tighter spacing between icon & text
    flexShrink: 1,
  },
  metaRow: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4}, // 🔹 was 6 & marginTop 6 → smaller
  subText: {
    marginTop: 2,
    fontSize: 12,
    color: '#777',
    fontFamily: 'K2D-Medium',
  }, // tighter
  checkboxWrapper: {
    paddingHorizontal: 4, // 🔹 was 8 → smaller
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4, // 🔹 was 8 → smaller space between checkbox & card
  },
  actionRow: {flexDirection: 'row', gap: 8, paddingBottom: 2}, // tighter
});
