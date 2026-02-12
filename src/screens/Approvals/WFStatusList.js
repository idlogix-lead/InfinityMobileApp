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
} from 'react-native';
import React, {useMemo, useState, useEffect} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import dayjs from 'dayjs';
import ReqHeader from '../../components/ReqHeader';
import {useWFAct} from '../../hooks/ApprovalHooks/useApproval';
import {useNavigation} from '@react-navigation/native';
import {ScrollView} from 'react-native-gesture-handler';
import {Dropdown} from 'react-native-element-dropdown';

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

  // TAB FILTER
  const tabFilteredData = useMemo(() => {
    return data.filter(item => {
      if (activeTab === 'APPROVED')
        return (
          item.Processed === true && item.WFState?.identifier === 'Completed'
        );
      return item.Processed === false;
    });
  }, [data, activeTab]);

  // SEARCH + FILTER
  const filteredData = useMemo(() => {
    return tabFilteredData.filter(item => {
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

  return (
    <>
      <StatusBar translucent barStyle="dark-content" />
      <ReqHeader title={title} />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{flex: 1, backgroundColor: '#F7F8FA'}}>
          {/* FILTERS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterBar}>
            {[roleList, docTypes, wfStatusList].map((list, index) => (
              <Dropdown
                style={styles.filterDropdown}
                containerStyle={styles.dropdownContainer}
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
          </ScrollView>
          {/* SEARCH */}
          <View style={styles.searchBox}>
            <MaterialIcons name="search" size={20} color="#888" />
            <TextInput
              placeholder="Search..."
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>

          {/* TABS */}
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
                Unapproved
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
                Approved
              </Text>
            </TouchableOpacity>
          </View>

          {/* EMPTY HANDLER */}
          {filteredData.length === 0 ? (
            <View style={styles.emptyBox}>
              <MaterialIcons name="inbox" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No approvals found</Text>
            </View>
          ) : (
            <FlatList
              data={filteredData}
              keyExtractor={i => String(i.Record_ID)}
              contentContainerStyle={{padding: 12}}
              renderItem={({item}) => {
                const process = item.AD_WF_Process_ID?.identifier;
                const icon = getProcessIcon(process);
                const date = dayjs(item.docdate).format('DD MMM YYYY');
                const isSelected = selectedIds.includes(item.Record_ID);

                return (
                  <View style={styles.card}>
                    {/* CHECKBOX */}
                    {multiSelectMode && (
                      <TouchableOpacity
                        onPress={() => toggleSelect(item.Record_ID)}
                        style={styles.checkbox}>
                        <MaterialIcons
                          name={
                            isSelected ? 'check-box' : 'check-box-outline-blank'
                          }
                          size={22}
                          color="#2F4FE3"
                        />
                      </TouchableOpacity>
                    )}

                    {/* ICON */}
                    <View style={styles.iconWrap}>
                      <MaterialIcons name={icon} size={18} color="#2F4FE3" />
                    </View>

                    {/* TEXT */}
                    <TouchableOpacity
                      style={{flex: 1}}
                      onPress={() =>
                        navigation.navigate('WFDetailScreen', {item})
                      }
                      onLongPress={() => {
                        setMultiSelectMode(true);
                        toggleSelect(item.Record_ID);
                      }}>
                      <Text style={styles.title}>{process}</Text>
                      <Text style={styles.sub}>{item.party_name}</Text>
                      <Text style={styles.date}>{date}</Text>
                    </TouchableOpacity>

                    {/* ACTION BUTTONS */}
                    <View style={styles.actionCol}>
                      <TouchableOpacity
                        style={styles.approveBtn}
                        onPress={() => approveSingle(item)}>
                        <MaterialIcons name="check" size={18} color="#fff" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.rejectBtn}
                        onPress={() => rejectSingle(item)}>
                        <MaterialIcons name="close" size={18} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
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
    </>
  );
};

export default WFStatusList;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  dropdownContainer: {
    borderRadius: 12,
    elevation: 8,
    zIndex: 9999, // Android fix
    position: 'absolute', // prevent pushing layout
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal:"5%",
    marginHorizontal: '5%',
    bottom:6,
    elevation: 2,
    height: 40,
  },
  searchInput: {flex: 1, marginLeft: 8, fontSize: 14},

  tabRow: {flexDirection: 'row', paddingHorizontal: 12, marginBottom: 6},
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#EEE',
    marginRight: 8,
  },
  tabActive: {backgroundColor: '#2F4FE3'},
  tabText: {fontSize: 13, color: '#555'},
  tabActiveText: {color: '#fff', fontWeight: '700'},
  filterBar: {
    paddingHorizontal: 12,
    // marginBottom: 4, // small spacing only
  },
  filterDropdown: {
    height: 36,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    elevation: 2,
    marginRight: 8,
  },

  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {fontSize: 16, color: '#999', marginTop: 10},

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },

  checkbox: {marginRight: 8},

  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F2F5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  title: {fontSize: 15, fontWeight: '600'},
  sub: {fontSize: 13, color: '#555'},
  date: {fontSize: 12, color: '#999'},

  actionCol: {flexDirection: 'column', marginLeft: 8},
  approveBtn: {
    backgroundColor: '#22C55E',
    padding: 6,
    borderRadius: 6,
    marginBottom: 6,
  },
  rejectBtn: {backgroundColor: '#EF4444', padding: 6, borderRadius: 6},

  multiBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 10,
  },
  multiApprove: {
    flex: 1,
    backgroundColor: '#22C55E',
    padding: 14,
    alignItems: 'center',
  },
  multiReject: {
    flex: 1,
    backgroundColor: '#EF4444',
    padding: 14,
    alignItems: 'center',
  },
  multiText: {color: '#fff', fontWeight: '700'},
});
