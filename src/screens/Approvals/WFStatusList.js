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
  TextInput,
  Keyboard,
  ScrollView,
} from 'react-native';
import React, {useMemo, useState, useEffect} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import dayjs from 'dayjs';
import ReqHeader from '../../components/ReqHeader';
import {useWFAct} from '../../hooks/ApprovalHooks/useApproval';
import {useNavigation} from '@react-navigation/native';
import {Dropdown} from 'react-native-element-dropdown';
import {Swipeable} from 'react-native-gesture-handler';
import {Animated} from 'react-native';

const COLORS = {
  bg2: '#77DD7722',
  bg: '#F2FBF5',
  lightBg: '#E9F5DB',
  card: '#FFFFFF',
  border: '#D8EFE0',
  mint: '#E6F7ED',
  primary: '#4CAF7D',
  darkGreen: '#2E7D57',
  pastelGreen: '#77DD77',
  textDark: '#1F2D2A',
  textLight: '#5F7D75',
  dangerBg: '#FFEAEA',
  dangerText: '#C62828',
};

const WFStatusList = ({route}) => {
  const {title} = route.params;
  const {data: data = []} = useWFAct();
  const navigation = useNavigation();

  // UI STATES
  const [activeTab, setActiveTab] = useState('UNAPPROVED');
  const [search, setSearch] = useState('');

  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // FILTER STATES
  const [docTypeFilter, setDocTypeFilter] = useState('All Doc Type');
  const [wfStatusFilter, setWfStatusFilter] = useState('All Status');
  const [roleFilter, setRoleFilter] = useState('All Role');

  // BACK HANDLER
  useEffect(() => {
    const backAction = () => {
      if (multiSelectMode) {
        setMultiSelectMode(false);
        setSelectedIds([]);
        return true; // prevent default behavior
      }
      return false; // allow default behavior
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [multiSelectMode]);

  // DROPDOWN DATA
  const docTypes = useMemo(() => {
    const types = data.map(i => i.C_DocType_ID?.identifier).filter(Boolean);
    return ['All Doc Type', ...new Set(types)];
  }, [data]);

  const wfStatusList = useMemo(() => {
    const status = data.map(i => i.WFState?.identifier).filter(Boolean);
    return ['All Status', ...new Set(status)];
  }, [data]);

  const roleList = useMemo(() => {
    const roles = data.map(i => i.AD_Role_ID?.identifier).filter(Boolean);
    return ['All Role', ...new Set(roles)];
  }, [data]);

  const filteredForCount = useMemo(() => {
    return data.filter(item => {
      const docType = item.C_DocType_ID?.identifier;
      const wfState = item.WFState?.identifier;
      const role = item.AD_Role_ID?.identifier;
      const partner = item.party_name?.toLowerCase() || '';
      const process = item.AD_WF_Process_ID?.identifier?.toLowerCase() || '';

      if (roleFilter !== 'All Role' && role !== roleFilter) return false;
      if (docTypeFilter !== 'All Doc Type' && docType !== docTypeFilter)
        return false;
      if (wfStatusFilter !== 'All Status' && wfState !== wfStatusFilter)
        return false;

      if (
        search &&
        !partner.includes(search.toLowerCase()) &&
        !process.includes(search.toLowerCase())
      )
        return false;

      return true;
    });
  }, [data, roleFilter, docTypeFilter, wfStatusFilter, search]);

  // TAB FILTER
  const tabFilteredData = useMemo(() => {
    return filteredForCount.filter(item => {
      if (activeTab === 'APPROVED')
        return (
          item.Processed === true && item.WFState?.identifier === 'Completed'
        );
      return item.Processed === false;
    });
  }, [filteredForCount, activeTab]);

  // TAB FILTER COUNT
  const unapprovedCount = filteredForCount.filter(
    item => item.Processed === false,
  ).length;
  const approvedCount = filteredForCount.filter(
    item => item.Processed === true && item.WFState?.identifier === 'Completed',
  ).length;

  // SEARCH + FILTER
  const filteredData = useMemo(() => {
    const filtered = tabFilteredData.filter(item => {
      const docType = item.C_DocType_ID?.identifier;
      const wfState = item.WFState?.identifier;
      const role = item.AD_Role_ID?.identifier;
      const partner = item.party_name?.toLowerCase() || '';
      const process = item.AD_WF_Process_ID?.identifier?.toLowerCase() || '';

      if (roleFilter !== 'All Role' && role !== roleFilter) return false;
      if (docTypeFilter !== 'All Doc Type' && docType !== docTypeFilter)
        return false;
      if (wfStatusFilter !== 'All Status' && wfState !== wfStatusFilter)
        return false;

      if (
        search &&
        !partner.includes(search.toLowerCase()) &&
        !process.includes(search.toLowerCase())
      )
        return false;

      return true;
    });

    // Sort by docdate descending (most recent first)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.docdate).getTime();
      const dateB = new Date(b.docdate).getTime();
      return dateB - dateA; // most recent first
    });
  }, [tabFilteredData, docTypeFilter, wfStatusFilter, roleFilter, search]);

  // MULTI SELECT
  const toggleSelect = id => {
    if (selectedIds.includes(id))
      setSelectedIds(selectedIds.filter(i => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const approveSelected = () => {
    Alert.alert('Approved', `${selectedIds.length} records approved`);
    setSelectedIds([]);
    setMultiSelectMode(false);
  };

  const rejectSelected = () => {
    Alert.alert('Rejected', `${selectedIds.length} records rejected`);
    setSelectedIds([]);
    setMultiSelectMode(false);
  };

  const approveSingle = item => {
    Alert.alert('Approved', `Record ${item.Record_ID} approved`);
  };

  const rejectSingle = item => {
    Alert.alert('Rejected', `Record ${item.Record_ID} rejected`);
  };

  const getProcessIcon = name => {
    if (!name) return 'account-tree';
    name = name.toLowerCase();
    if (name.includes('order')) return 'shopping-cart';
    if (name.includes('invoice')) return 'receipt-long';
    if (name.includes('payment')) return 'payments';
    return 'assignment';
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
    <View style={{flex: 1, backgroundColor: COLORS.bg2}}>
      <StatusBar
        translucent
        barStyle="dark-content"
        backgroundColor={COLORS.bg2}
      />
      {/* <ReqHeader title={title} /> */}
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
          Apprrovals
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('approvalNotification')}>
          <MaterialIcons name="notifications" color={'#000'} size={25} />
        </TouchableOpacity>
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{flex: 1, backgroundColor: COLORS.bg2}}>
          {/* FILTERS */}
          <View style={{paddingHorizontal: 12, paddingVertical: 8}}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterBar}>
                {[roleList, docTypes, wfStatusList].map((list, index) => (
                  <Dropdown
                    key={index}
                    style={styles.filterDropdown}
                    containerStyle={styles.dropdownContainer}
                    //  TEXT COLORS
                    selectedTextStyle={styles.dropdownSelectedText}
                    placeholderStyle={styles.dropdownPlaceholder}
                    itemTextStyle={styles.dropdownItemText}
                    ScrollViewProps={{
                      showVerticalScrollIndicator: false,
                      nestedScrollEnabled: true,
                    }}
                    dropdownPosition="bottom"
                    maxHeight={220}
                    data={list.map(v => ({label: v, value: v}))}
                    labelField="label"
                    valueField="value"
                    value={[roleFilter, docTypeFilter, wfStatusFilter][index]}
                    onChange={i =>
                      index === 0
                        ? setRoleFilter(i.value)
                        : index === 1
                        ? setDocTypeFilter(i.value)
                        : setWfStatusFilter(i.value)
                    }
                  />
                ))}
              </View>
            </ScrollView>
            {/* SEARCH */}
            <View style={styles.searchBox}>
              <MaterialIcons name="search" size={20} color="#000" />
              <TextInput
                placeholder="Search..."
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
              />
            </View>
            {/* APPROVED AND UNAPPROVED TABS */}
            <View style={styles.tabRow}>
              <TouchableOpacity
                onPress={() => setActiveTab('UNAPPROVED')}
                style={[
                  styles.tabBtn,
                  activeTab === 'UNAPPROVED' && styles.tabActive,
                ]}>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'UNAPPROVED' && styles.tabActiveText,
                  ]}>
                  Unapproved ({unapprovedCount})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab('APPROVED')}
                style={[
                  styles.tabBtn,
                  activeTab === 'APPROVED' && styles.tabActive,
                ]}>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'APPROVED' && styles.tabActiveText,
                  ]}>
                  Approved ({approvedCount})
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* EMPTY HANDLER */}
          {filteredData.length === 0 ? (
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconWrap}>
                <MaterialIcons name="inbox" size={80} color="#77DD77" />
              </View>
              <Text style={styles.emptyTitle}>No Approvals Found</Text>
              <Text style={styles.emptySub}>
                You don’t have any tasks. Try adjusting filters or check later.
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredData}
              keyExtractor={(i, index) => String(i.Record_ID) + index}
              contentContainerStyle={{padding: 12, marginBottom: 100}}
              renderItem={({item}) => {
                const process = item.AD_WF_Process_ID?.identifier;
                const icon = getProcessIcon(process);
                const date = dayjs(item.docdate).format('DD MMM YYYY');
                const isSelected = selectedIds.includes(item.Record_ID);
                const amount = Number(item.TotalLines ?? 0);

                const renderRightActions = (progress, dragX) => {
                  const scale = dragX.interpolate({
                    inputRange: [-100, 0],
                    outputRange: [1, 0],
                    extrapolate: 'clamp',
                  });
                  return (
                    <Animated.View
                      style={{
                        justifyContent: 'center',
                        marginRight: 10,
                        transform: [{scale}],
                      }}>
                      <View
                        style={{
                          backgroundColor: '#EF4444',
                          padding: 20,
                          borderRadius: 8,
                        }}>
                        <Text style={{color: '#fff', fontWeight: 'bold'}}>
                          Reject
                        </Text>
                      </View>
                    </Animated.View>
                  );
                };

                const renderLeftActions = (progress, dragX) => {
                  const scale = dragX.interpolate({
                    inputRange: [0, 100],
                    outputRange: [0, 1],
                    extrapolate: 'clamp',
                  });
                  return (
                    <Animated.View
                      style={{
                        justifyContent: 'center',
                        marginLeft: 10,
                        transform: [{scale}],
                      }}>
                      <View
                        style={{
                          backgroundColor: '#22C55E',
                          padding: 20,
                          borderRadius: 8,
                        }}>
                        <Text style={{color: '#fff', fontWeight: 'bold'}}>
                          Approve
                        </Text>
                      </View>
                    </Animated.View>
                  );
                };
                return (
                  <Swipeable
                    renderLeftActions={renderLeftActions}
                    renderRightActions={renderRightActions}
                    onSwipeableLeftOpen={() => approveSingle(item)}
                    onSwipeableRightOpen={() => rejectSingle(item)}>
                    <View style={styles.card}>
                      <View style={styles.cardContent}>
                        {/* CHECKBOX */}
                        {multiSelectMode && (
                          <TouchableOpacity
                            onPress={() => toggleSelect(item.Record_ID)}
                            style={styles.checkbox}>
                            <MaterialIcons
                              name={
                                isSelected
                                  ? 'check-box'
                                  : 'check-box-outline-blank'
                              }
                              size={22}
                              // color="#2F4FE3"
                              color={'#222'}
                            />
                          </TouchableOpacity>
                        )}

                        {/* ICON */}
                        <View style={styles.iconWrap}>
                          <MaterialIcons name={icon} size={18} color="#000" />
                        </View>

                        {/* TEXT */}
                        <TouchableOpacity
                          style={{flex: 1}}
                          onPress={() =>
                            navigation.navigate('WFDetail', {item})
                          }
                          onLongPress={() => {
                            setMultiSelectMode(true);
                            toggleSelect(item.Record_ID);
                          }}>
                          <Text style={styles.title}>{process}</Text>
                          <Text style={[styles.sub, {fontSize: 12}]}>
                            Amount • PKR {amount}
                          </Text>
                          <Text style={styles.sub}>
                            {item.party_name} {'  '}• {'  '}
                            <Text style={styles.date}>{date}</Text>
                          </Text>
                        </TouchableOpacity>

                        {/* FORWARD ARROW */}
                        {/* <MaterialIcons
                          name="arrow-forward-ios"
                          size={18}
                          color="#222"
                        /> */}
                      </View>

                      {/* FOOTER BUTTONS */}
                      {!multiSelectMode && (
                        <View style={styles.cardFooter}>
                          <TouchableOpacity
                            style={styles.approveBtn}
                            onPress={() => approveSingle(item)}>
                            {/* <MaterialIcons
                              name="check"
                              size={16}
                              color="#555"
                            /> */}
                            <Text style={styles.approveText}>Approve</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.rejectBtn}
                            onPress={() => rejectSingle(item)}>
                            {/* <MaterialIcons
                              name="close"
                              size={16}
                              color="#555"
                            /> */}
                            <Text style={styles.rejectText}>Reject</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </Swipeable>
                );
              }}
            />
          )}

          {/* MULTI ACTION BAR */}
          {multiSelectMode && selectedIds.length > 0 && (
            <View style={styles.multiBar}>
              <TouchableOpacity
                style={styles.multiApprove}
                onPress={approveSelected}>
                <Text style={styles.multiText}>
                  Approve ({selectedIds.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.multiReject}
                onPress={rejectSelected}>
                <Text style={styles.multiText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default WFStatusList;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  filterBar: {
    paddingHorizontal: '3%',
    gap: 8,
    flexDirection: 'row',
    marginVertical: 4,
  },
  filterDropdown: {
    height: 38,
    backgroundColor: '#FFFFFF',
    // backgroundColor: COLORS.pastelGreen,
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    // borderColor: '#E2E8F0',
    borderColor: COLORS.border,
    justifyContent: 'center',
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.05,
    // shadowRadius: 4,
    // elevation: 2,
  },

  dropdownContainer: {
    borderRadius: 12,
    elevation: 10,
    zIndex: 9999,
    backgroundColor: '#fff',
  },

  dropdownSelectedText: {
    // color: '#0F172A',
    color: COLORS.textDark,
    fontSize: 13,
    fontFamily: 'K2D-SemiBold',
  },

  dropdownPlaceholder: {
    color: COLORS.textLight, // placeholder gray
    fontSize: 13,
    fontFamily: 'K2D-Medium',
  },

  dropdownItemText: {
    color: '#666', //  OPTIONS TEXT GRAY
    fontSize: 13,
    fontFamily: 'K2D-Medium',
    lineHeight: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    marginTop: 12,
    height: 44,
    borderWidth: 1,
    // borderColor: '#E2E8F0',
    borderColor: COLORS.border,
    // shadowColor: '#000',
    shadowColor: COLORS.darkGreen,
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.05,
    // shadowRadius: 4,
    // elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.textLight,
    fontFamily: 'K2D-Medium',
  },
  tabRow: {
    flexDirection: 'row',
    marginTop: 16,
    // backgroundColor: '#E2E8F0',
    backgroundColor: COLORS.mint,
    borderRadius: 50,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 50,
  },

  tabActive: {
    // backgroundColor: '#FFFFFF',
    backgroundColor: COLORS.pastelGreen,
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
  },

  tabText: {fontSize: 13, color: COLORS.textDark, fontFamily: 'K2D-SemiBold'},
  tabActiveText: {
    color: COLORS.textDark,
    fontFamily: 'K2D-SemiBold',
    fontSize: 13,
  },

  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    marginTop: '30%',
  },

  emptyIconWrap: {
    backgroundColor: '#E2E8F0',
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },

  emptyTitle: {
    fontSize: 18,
    color: '#0F172A',
    fontFamily: 'K2D-SemiBold',
    marginBottom: 6,
    textAlign: 'center',
  },

  emptySub: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'K2D-Medium',
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },

  cardContent: {flexDirection: 'row', alignItems: 'center'},

  checkbox: {marginRight: 8},
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  title: {
    fontSize: 15,
    fontFamily: 'K2D-SemiBold',
    color: '#0F172A',
  },

  sub: {
    fontSize: 13,
    fontFamily: 'K2D-Medium',
    color: '#64748B',
    marginTop: 2,
  },

  date: {
    fontSize: 12,
    fontFamily: 'K2D-Medium',
    color: '#94A3B8',
  },

  actionCol: {flexDirection: 'column', marginLeft: 8},

  cardFooter: {
    flexDirection: 'row',
    marginTop: 14,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    gap: 12,
    // paddingHorizontal: '15%',
  },
  approveBtn: {
    // flex: 1,
    // backgroundColor: '#DCFCE7',
    backgroundColor: COLORS.darkGreen,
    paddingVertical: 3,
    paddingHorizontal: '5%',
    height: 35,
    borderRadius: 20,
    alignItems: 'center',
  },

  approveText: {
    // color: '#16A34A',
    color: COLORS.mint,
    fontFamily: 'K2D-SemiBold',
    fontSize: 13,
    textAlignVertical: 'center',
    textAlign: 'center',
  },

  rejectBtn: {
    // flex: 1,
    // backgroundColor: '#FEE2E2',
    backgroundColor: COLORS.dangerText,
    paddingHorizontal: '7%',
    paddingVertical: 3,
    borderRadius: 20,
    height: 35,

    alignItems: 'center',
  },

  rejectText: {
    // color: '#DC2626',
    color: COLORS.dangerBg,
    fontFamily: 'K2D-SemiBold',
    fontSize: 13,
  },
  multiBar: {
    position: 'absolute',
    bottom: 5,
    // left: 20,
    // right: 20,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    // borderRadius: 16,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    gap: 10,
  },
  multiApprove: {
    flex: 1,
    // backgroundColor: '#16A34A',
    backgroundColor: COLORS.darkGreen,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 10,
  },

  multiReject: {
    flex: 1,
    // backgroundColor: '#DC2626',
    backgroundColor: COLORS.dangerText,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 10,
  },

  multiText: {
    color: '#FFFFFF',
    fontFamily: 'K2D-SemiBold',
    fontSize: 14,
  },
});
