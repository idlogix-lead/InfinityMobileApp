import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, {useState} from 'react';
import CustomHeader from '../../components/CustomHeader';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {Menu, Provider, Modal} from 'react-native-paper';

const {width} = Dimensions.get('window');

const LeadsDetails = ({route}) => {
  const {data} = route.params;

  // Dropdown states
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [showBasicInfo, setShowBasicInfo] = useState(true);
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);
  const [showOtherInfo, setShowOtherInfo] = useState(false);

  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [bpMenuVisible, setBpMenuVisible] = useState(false);
  const [orgMenuVisible, setOrgMenuVisible] = useState(false);
  const [leadSourceMenuVisible, setLeadSourceMenuVisible] = useState(false);
  const [leadSourceModalVisible, setLeadSourceModalVisible] = useState(false);
  const [salesRepMenuVisible, setSalesRepMenuVisible] = useState(false);

  const leadStatusOptions = [
    {id: 'N', label: 'New'},
    {id: 'W', label: 'Working'},
    {id: 'E', label: 'Expire'},
    {id: 'C', label: 'Converted'},
  ];
  const businessPartnerOptions = [
    {id: 1000000, label: 'UActros'},
    {id: 2000000, label: 'Galaxy Corp'},
  ];
  const organizationOptions = [
    {id: 1000001, label: 'Kuwait Mall'},
    {id: 1000000, label: 'DHA Mall'},
  ];
  const leadSourceOptions = [
    {id: 'CC', label: 'Cold Call'},
    {id: 'E', label: 'Email'},
    {id: 'P', label: 'Phone'},
  ];
  const salesRepOptions = [{id: 1000117, label: 'Muhammad Anwar'}];

  // Editable fields for basic info
  const [name, setName] = useState(data?.Name || '');
  const [email, setEmail] = useState(data?.EMail || '');
  const [phone, setPhone] = useState(data?.Phone || '');
  const [address, setAddress] = useState('N/A');
  // for more info
  const [phone2, setPhone2] = useState(data?.Phone2 || '');
  const [birthday, setBirthday] = useState(data?.Birthday || '2025-12-19');
  const [salesLead, setSalesLead] = useState(
    data?.IsSalesLead ? 'true' : 'false' || '',
  );
  const [vendorLead, setVendorLead] = useState(
    data?.IsVendorLead ? 'true' : 'false' || '',
  );
  const [bussinessPartner, setBussinessPartner] = useState(
    data?.AD_Client_ID?.identifier || '',
  );
  const [bussinessPartnerID, setBussinessPartnerID] = useState(
    data?.AD_Client_ID?.id || '',
  );
  const [position, setPosition] = useState('');
  const [organization, setOrganization] = useState(
    data?.AD_Org_ID?.identifier || '',
  );
  const [organizationID, setOrganizationID] = useState(
    data?.AD_Org_ID?.id || '',
  );
  const [description, setDescription] = useState(data?.Description || '');
  const [active, setActive] = useState(data?.IsActive ? 'true' : 'false' || '');
  const [statusID, setStatusID] = useState(
    data?.LeadStatus?.id || 'enter N/C/W/E',
  );
  const [status, setStatus] = useState(data?.LeadStatus?.identifier || '');
  const [searchKey, setSearchKey] = useState(data?.Value || '');

  const [salesRep, setSalesRep] = useState(data?.SalesRep_ID.identifier || '');
  const [salesRepID, setSalesRepID] = useState(data?.SalesRep_ID.id || '');

  // Company Info
  const [companyName, setCompanyName] = useState(data?.BPName || '');
  const [companyAddress, setCompanyAddress] = useState('XYZ');

  // OtherInfo
  const [compaign, setCompaign] = useState('');
  const [leadSource, setLeadSource] = useState(
    data?.LeadSource?.identifier || 'N/A',
  );
  const [leadSourceID, setLeadSourceID] = useState(
    data?.LeadSource?.id || 'N/A',
  );
  const [leadSourceDesc, setLeadSourceDesc] = useState(
    data?.LeadSourceDescription || '',
  );
  const [leadStatusDesc, setLeadStatusDesc] = useState(
    data?.LeadStatusDescription || '',
  );
  const [comments, setComments] = useState(data?.Comments || '');

  const LeadDetailApi = async () => {
    try {
      const protocol = await AsyncStorage.getItem('protocol');
      const host = await AsyncStorage.getItem('host');
      const port = await AsyncStorage.getItem('port');
      const token = await AsyncStorage.getItem('token');
      const id = data?.id;

      const payload = {
        Name: name,
        EMail: email,
        Phone: phone,
        Phone2: phone2,
        Birthday: birthday,
        IsSalesLead: salesLead === 'true',
        IsVendorLead: vendorLead === 'true',
        BPName: companyName,
        AD_Org_ID: {
          id: organizationID,
          identifier: organization,
        },
        SalesRep_ID: {
          id: salesRepID,
          identifier: salesRep,
        },
        AD_Client_ID: {
          id: bussinessPartnerID,
          identifier: bussinessPartner,
        },
        Description: description,
        IsActive: active === 'true',
        LeadStatus: {
          id: statusID,
          identifier: status,
        },
        Value: searchKey,
        LeadSource: {
          id: leadSourceID,
          identifier: leadSource,
        },
        LeadSourceDescription: leadSourceDesc,
        LeadStatusDescription: leadStatusDesc,
        Comments: comments,
      };
      console.log('payload', payload);

      const URL = `${protocol}://${host}:${port}/api/v1/models/AD_User/${id}`;
      const response = await axios.put(URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Updated successfully:', response.data);
      alert('Data saved successfully!');
    } catch (error) {
      console.log(error, 'CRM data save error');
      alert('Error saving data');
    }
  };
  // Section Header with dropdown
  const SectionHeader = ({title, expanded, toggle}) => (
    <TouchableOpacity onPress={toggle} style={styles.SectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <MaterialCommunityIcons
        name={expanded ? 'chevron-up' : 'chevron-down'}
        size={25}
        color={'#ccc'}
      />
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container}>
        <CustomHeader title={'Leads Details'} />

        <View style={{padding: '5%'}}>
          {/* BASIC INFO CARD */}
          <View style={styles.card}>
            <SectionHeader
              title=" User Basic Info"
              expanded={showBasicInfo}
              toggle={() => setShowBasicInfo(!showBasicInfo)}
            />
            {showBasicInfo && (
              <View>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.inputWrapper}
                  placeholder="Enter Name"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="#777"
                />
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.inputWrapper}
                  placeholder="Enter Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor="#777"
                />

                <Text style={styles.label}>Phone</Text>
                <TextInput
                  style={styles.inputWrapper}
                  placeholder="Enter Phone"
                  value={phone}
                  onChangeText={setPhone}
                  placeholderTextColor="#777"
                />

                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={styles.inputWrapper}
                  placeholder="N/A"
                  value={address}
                  onChangeText={setAddress}
                  placeholderTextColor="#777"
                />
              </View>
            )}
          </View>

          {/* MORE INFO */}
          <View style={styles.card}>
            <SectionHeader
              title="More Info"
              expanded={showMoreInfo}
              toggle={() => setShowMoreInfo(!showMoreInfo)}
            />
            {showMoreInfo && (
              <View>
                <Text style={styles.label}>Phone 2</Text>
                <TextInput
                  style={styles.inputWrapper}
                  placeholder="N/A"
                  value={phone2}
                  onChangeText={setPhone2}
                  placeholderTextColor="#777"
                />
                <Text style={styles.label}>Birthday</Text>
                <TextInput
                  style={styles.inputWrapper}
                  placeholder="N/A"
                  value={birthday}
                  onChangeText={setBirthday}
                  placeholderTextColor="#777"
                />

                <Text style={styles.label}>Sales Lead</Text>
                <TextInput
                  style={styles.inputWrapper}
                  placeholder="N/A"
                  value={salesLead}
                  onChangeText={setSalesLead}
                  placeholderTextColor="#777"
                />

                <Text style={styles.label}>Vendor Lead</Text>
                <TextInput
                  style={styles.inputWrapper}
                  placeholder="N/A"
                  value={vendorLead}
                  onChangeText={setVendorLead}
                  placeholderTextColor="#777"
                />
                {/* Bussiness Partner */}
                <Text style={styles.label}>Bussiness Partner</Text>
                {/* <Provider>
                  <Menu
                    visible={bpMenuVisible}
                    onDismiss={() => setBpMenuVisible(false)}
                    anchor={
                      <TouchableOpacity
                        onPress={() => setBpMenuVisible(true)}
                        style={[
                          styles.inputWrapper,
                          {
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingVertical: 14,
                          },
                        ]}>
                        <Text style={{color: '#000'}}>
                          {bussinessPartner || 'Select organization'}
                        </Text>
                        <MaterialCommunityIcons
                          name="chevron-down"
                          size={22}
                          color="#666"
                        />
                      </TouchableOpacity>
                    }>
                    {businessPartnerOptions.map(item => (
                      <Menu.Item
                        key={item.id}
                        onPress={() => {
                          setBussinessPartner(item.label);
                          setBussinessPartnerID(item.id);
                          setBpMenuVisible(false);
                        }}
                        title={item.label}
                      />
                    ))}
                  </Menu>
                </Provider> */}
                <Provider>
                  <TouchableOpacity
                    onPress={() => setBpMenuVisible(true)}
                    style={[
                      styles.inputWrapper,
                      {
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingVertical: 14,
                      },
                    ]}>
                    <Text style={{color: '#555'}}>
                      {bussinessPartner || 'select'}
                    </Text>
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={22}
                      color="#666"
                    />
                  </TouchableOpacity>

                  <Modal
                    visible={bpMenuVisible}
                    onDismiss={() => setBpMenuVisible(false)}
                    transparent={true}
                    animationType="fade">
                    <View style={styles.modalOverlay}>
                      <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Select Partner</Text>

                        {businessPartnerOptions.map(item => (
                          <TouchableOpacity
                            key={item.id}
                            style={styles.optionItem}
                            onPress={() => {
                              setBussinessPartner(item.label);
                              setBussinessPartnerID(item.id);
                              setBpMenuVisible(false);
                            }}>
                            <Text
                              style={{
                                color: '#555',
                                fontSize: 13,
                                fontFamily: 'K2D-Medium',
                              }}>
                              {item.label}
                            </Text>
                          </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                          style={styles.cancelBtn}
                          onPress={() => setBpMenuVisible(false)}>
                          <Text style={styles.cancelBtnTxt}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>
                </Provider>

                <Text style={styles.label}>Sales Representative</Text>
                <Provider>
                  <TouchableOpacity
                    onPress={() => setSalesRepMenuVisible(true)}
                    style={[
                      styles.inputWrapper,
                      {
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingVertical: 14,
                      },
                    ]}>
                    <Text style={{color: '#555'}}>
                      {salesRep || 'select Resresentative'}
                    </Text>
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={22}
                      color="#666"
                    />
                  </TouchableOpacity>

                  <Modal
                    visible={salesRepMenuVisible}
                    onDismiss={() => setSalesRepMenuVisible(false)}
                    transparent={true}
                    animationType="fade">
                    <View style={styles.modalOverlay}>
                      <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>
                          Select Organization
                        </Text>

                        {salesRepOptions.map(item => (
                          <TouchableOpacity
                            key={item.id}
                            style={styles.optionItem}
                            onPress={() => {
                              setSalesRep(item.label);
                              setSalesRepID(item.id);
                              setSalesRepMenuVisible(false);
                            }}>
                            <Text
                              style={{
                                color: '#555',
                                fontSize: 13,
                                fontFamily: 'K2D-Medium',
                              }}>
                              {item.label}
                            </Text>
                          </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                          style={styles.cancelBtn}
                          onPress={() => setSalesRepMenuVisible(false)}>
                          <Text style={styles.cancelBtnTxt}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>
                </Provider>
                {/* Organization */}

                <Text style={styles.label}>organization</Text>
                {/* <Provider>
                  <Menu
                    visible={orgMenuVisible}
                    onDismiss={() => setOrgMenuVisible(false)}
                    anchor={
                      <TouchableOpacity
                        onPress={() => setOrgMenuVisible(true)}
                        style={[
                          styles.inputWrapper,
                          {
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingVertical: 14,
                          },
                        ]}>
                        <Text style={{color: '#000'}}>
                          {organization || 'Select organization'}
                        </Text>
                        <MaterialCommunityIcons
                          name="chevron-down"
                          size={22}
                          color="#666"
                        />
                      </TouchableOpacity>
                    }>
                    {organizationOptions.map(item => (
                      <Menu.Item
                        key={item.id}
                        onPress={() => {
                          setOrganization(item.label);
                          setOrganizationID(item.id);
                          setOrgMenuVisible(false);
                        }}
                        title={item.label}
                      />
                    ))}
                  </Menu>
                </Provider> */}
                <Provider>
                  <TouchableOpacity
                    onPress={() => setOrgMenuVisible(true)}
                    style={[
                      styles.inputWrapper,
                      {
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingVertical: 14,
                      },
                    ]}>
                    <Text style={{color: '#555'}}>
                      {organization || 'select Organization'}
                    </Text>
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={22}
                      color="#666"
                    />
                  </TouchableOpacity>

                  <Modal
                    visible={orgMenuVisible}
                    onDismiss={() => setOrgMenuVisible(false)}
                    transparent={true}
                    animationType="fade">
                    <View style={styles.modalOverlay}>
                      <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>
                          Select Organization
                        </Text>

                        {organizationOptions.map(item => (
                          <TouchableOpacity
                            key={item.id}
                            style={styles.optionItem}
                            onPress={() => {
                              setOrganization(item.label);
                              setOrganizationID(item.id);
                              setOrgMenuVisible(false);
                            }}>
                            <Text
                              style={{
                                color: '#555',
                                fontSize: 13,
                                fontFamily: 'K2D-Medium',
                              }}>
                              {item.label}
                            </Text>
                          </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                          style={styles.cancelBtn}
                          onPress={() => setOrgMenuVisible(false)}>
                          <Text style={styles.cancelBtnTxt}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>
                </Provider>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={styles.inputWrapper}
                  placeholder="N/A"
                  value={description}
                  onChangeText={setDescription}
                  placeholderTextColor="#777"
                  multiline={true}
                />

                <Text style={styles.label}>Active</Text>
                <TextInput
                  style={styles.inputWrapper}
                  placeholder="N/A"
                  value={active}
                  onChangeText={setActive}
                  placeholderTextColor="#777"
                />
                <Text style={styles.label}>Lead Status</Text>
                {/* <Provider>
                  <Menu
                    visible={statusMenuVisible}
                    onDismiss={() => setStatusMenuVisible(false)}
                    anchor={
                      <TouchableOpacity
                        onPress={() => setStatusMenuVisible(true)}
                        style={[
                          styles.inputWrapper,
                          {
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingVertical: 14,
                          },
                        ]}>
                        <Text style={{color: '#000'}}>
                          {status || 'Select Lead Status'}
                        </Text>
                        <MaterialCommunityIcons
                          name="chevron-down"
                          size={22}
                          color="#666"
                        />
                      </TouchableOpacity>
                    }>
                    {leadStatusOptions.map(item => (
                      <Menu.Item
                        key={item.id}
                        onPress={() => {
                          setStatus(item.label);
                          setStatusID(item.id);
                          setStatusMenuVisible(false);
                        }}
                        title={item.label}
                      />
                    ))}
                  </Menu>
                </Provider> */}
                <Provider>
                  <TouchableOpacity
                    onPress={() => setStatusMenuVisible(true)}
                    style={[
                      styles.inputWrapper,
                      {
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingVertical: 14,
                      },
                    ]}>
                    <Text style={{color: '#555'}}>
                      {status || 'select lead status'}
                    </Text>
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={22}
                      color="#666"
                    />
                  </TouchableOpacity>

                  <Modal
                    visible={statusMenuVisible}
                    onDismiss={() => setStatusMenuVisible(false)}
                    transparent={true}
                    animationType="fade">
                    <View style={styles.modalOverlay}>
                      <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>
                          Select Lead Status
                        </Text>

                        {leadStatusOptions.map(item => (
                          <TouchableOpacity
                            key={item.id}
                            style={styles.optionItem}
                            onPress={() => {
                              setStatus(item.label);
                              setStatusID(item.id);
                              setStatusMenuVisible(false);
                            }}>
                            <Text
                              style={{
                                color: '#555',
                                fontSize: 13,
                                fontFamily: 'K2D-Medium',
                              }}>
                              {item.label}
                            </Text>
                          </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                          style={styles.cancelBtn}
                          onPress={() => setStatusMenuVisible(false)}>
                          <Text style={styles.cancelBtnTxt}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>
                </Provider>

                <Text style={styles.label}>Search Key</Text>
                <TextInput
                  style={styles.inputWrapper}
                  placeholder="N/A"
                  value={searchKey}
                  onChangeText={setSearchKey}
                  placeholderTextColor="#777"
                />
              </View>
            )}
          </View>

          {/* COMPANY INFO */}
          <View style={styles.card}>
            <SectionHeader
              title="Company Info"
              expanded={showCompanyInfo}
              toggle={() => setShowCompanyInfo(!showCompanyInfo)}
            />
            {showCompanyInfo && (
              <View>
                <Text style={styles.label}>Company Name</Text>
                <TextInput
                  style={styles.inputWrapper}
                  placeholder="N/A"
                  value={companyName}
                  onChangeText={setCompanyName}
                  placeholderTextColor="#777"
                />

                <Text style={styles.label}>Company Address</Text>
                <TextInput
                  style={styles.inputWrapper}
                  placeholder="N/A"
                  value={companyAddress}
                  onChangeText={setCompanyAddress}
                  placeholderTextColor="#777"
                />
              </View>
            )}
          </View>

          {/* OTHER INFO */}
          <View style={styles.card}>
            <SectionHeader
              title="Other Info"
              expanded={showOtherInfo}
              toggle={() => setShowOtherInfo(!showOtherInfo)}
            />
            {showOtherInfo && (
              <View>
                <Text style={styles.label}>Campaign</Text>
                <TextInput
                  style={styles.inputWrapper}
                  placeholder="N/A"
                  value={compaign}
                  onChangeText={setCompaign}
                  placeholderTextColor="#777"
                />
                <Text style={styles.label}>Lead Source</Text>
                {/* <Provider>
                  <Menu
                    visible={leadSourceMenuVisible}
                    onDismiss={() => setLeadSourceMenuVisible(false)}
                    anchor={
                      <TouchableOpacity
                        onPress={() => setLeadSourceMenuVisible(true)}
                        style={[
                          styles.inputWrapper,
                          {
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingVertical: 14,
                          },
                        ]}>
                        <Text style={{color: '#ccc'}}>
                          {leadSource || 'select lead source'}
                        </Text>
                        <MaterialCommunityIcons
                          name="chevron-down"
                          size={22}
                          color="#666"
                        />
                      </TouchableOpacity>
                    }>
                    {leadSourceOptions.map(item => (
                      <Menu.Item
                        key={item.id}
                        onPress={() => {
                          setLeadSource(item.label);
                          setLeadSourceID(item.id);
                          setLeadSourceMenuVisible(false);
                        }}
                        title={item.label}
                      />
                    ))}
                  </Menu>
                </Provider> */}
                <Provider>
                  <TouchableOpacity
                    onPress={() => setLeadSourceModalVisible(true)}
                    style={[
                      styles.inputWrapper,
                      {
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingVertical: 14,
                      },
                    ]}>
                    <Text style={{color: '#555'}}>
                      {leadSource || 'select lead source'}
                    </Text>
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={22}
                      color="#666"
                    />
                  </TouchableOpacity>

                  <Modal
                    visible={leadSourceModalVisible}
                    onDismiss={() => setLeadSourceModalVisible(false)}
                    transparent={true}
                    animationType="fade">
                    <View style={styles.modalOverlay}>
                      <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>
                          Select Lead Source
                        </Text>

                        {leadSourceOptions.map(item => (
                          <TouchableOpacity
                            key={item.id}
                            style={styles.optionItem}
                            onPress={() => {
                              setLeadSource(item.label);
                              setLeadSourceID(item.id);
                              setLeadSourceModalVisible(false);
                            }}>
                            <Text
                              style={{
                                color: '#555',
                                fontSize: 13,
                                fontFamily: 'K2D-Medium',
                              }}>
                              {item.label}
                            </Text>
                          </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                          style={styles.cancelBtn}
                          onPress={() => setLeadSourceModalVisible(false)}>
                          <Text style={styles.cancelBtnTxt}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>
                </Provider>

                <Text style={styles.label}>Lead Source Description</Text>
                <TextInput
                  style={styles.inputWrapper}
                  placeholder="N/A"
                  value={leadSourceDesc}
                  onChangeText={setLeadSourceDesc}
                  placeholderTextColor="#777"
                  multiline={true}
                />
                <Text style={styles.label}>Lead Status Description</Text>
                <TextInput
                  style={styles.inputWrapper}
                  placeholder="N/A"
                  value={leadStatusDesc}
                  onChangeText={setLeadStatusDesc}
                  placeholderTextColor="#777"
                  multiline={true}
                />

                <Text style={styles.label}>Comments</Text>
                <TextInput
                  style={styles.inputWrapper}
                  placeholder="N/A"
                  value={comments}
                  onChangeText={setComments}
                  placeholderTextColor="#777"
                  multiline={true}
                />
              </View>
            )}
          </View>

          {/* SAVE BUTTON */}
          <TouchableOpacity style={styles.saveBtn} onPress={LeadDetailApi}>
            <Text style={styles.saveBtnTxt}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LeadsDetails;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f4f2f8'},
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 2,
    marginBottom: 14,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'K2D-Bold',
    marginBottom: 10,
    color: '#000',
  },
  row: {marginBottom: 8},
  label: {
    fontSize: 13,
    color: '#000',
    marginVertical: '2%',
    fontFamily: 'K2D-Bold',
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    paddingHorizontal: '4%',
    fontFamily: 'K2D-Medium',
  },
  SectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {fontSize: 15, fontFamily: 'K2D-SemiBold', color: '#000'},
  inputWrapper: {
    backgroundColor: '#fff',
    elevation: 2,
    borderRadius: 6,
    color: '#000',
    paddingHorizontal: '5%',
  },
  saveBtn: {
    flex: 1,
    width: '85%',
    backgroundColor: '#2F4FE3',
    height: 50,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    alignSelf: 'center',
  },
  saveBtnTxt: {color: '#fff', fontFamily: 'K2D-SemiBold', fontSize: 15},
  modalOverlay: {
    flex: 1,
    // backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    position: 'absolute',
    padding: 20,
    // height: 100,
    // width: '110%',
    // marginTop: '-30%',
    bottom: 15,
    // left: 5
    right: -20,
  },

  modalBox: {
    width: 100,
    backgroundColor: '#fff',
    borderRadius: 2,
    padding: 10,
    elevation: 10,
    zIndex: 999,
    // marginTop: '-205%',
    // marginRight:'10%'
  },

  modalTitle: {
    fontSize: 12,
    fontFamily: 'K2D-Bold',
    alignItems: 'center',
    // paddingHorizontal: '1%',
    marginBottom: 2,
    color: '#555',
  },

  optionItem: {
    paddingVertical: '0%',
    paddingHorizontal: '2%',
    // borderBottomWidth: 1,
    // borderBottomColor: '#ddd',
  },

  cancelBtn: {
    marginTop: 5,
    backgroundColor: '#555',
    paddingVertical: 2,
    // width: 60,
    borderRadius: 4,
    alignItems: 'center',
    // paddingHorizontal:'5%'
    marginLeft: '1%',
  },
  cancelBtnTxt: {
    color: '#fff',
    fontFamily: 'K2D-Medium',
    fontSize: 10,
  },
});
