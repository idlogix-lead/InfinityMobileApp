import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomHeader from '../../components/CustomHeader';
import ToggleSwitch from 'toggle-switch-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import {Provider, Modal} from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Picker} from '@react-native-picker/picker';

const AddLeads = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [salesRepMenuVisible, setSalesRepMenuVisible] = useState(false);
  const [leadSourceMenuVisible, setLeadSourceMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [showBPInfo, setShowBPInfo] = useState(false);
  const [showOtherInfo, setshowOtherInfo] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const leadStatusOptions = [
    {id: 'N', label: 'New'},
    {id: 'W', label: 'Working'},
    {id: 'E', label: 'Expire'},
    {id: 'C', label: 'Converted'},
  ];
  const leadSourceOptions = [{id: 'CC', label: 'Cold Call'}];

  const salesRepOptions = [{id: 1000117, label: 'Muhammad Anwar'}];

  // CONTACT INFO
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [salesRep, setSalesRep] = useState('');
  const [description, setDescription] = useState('');
  const [salesRepID, setSalesRepID] = useState('');

  // BP INFO
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');

  // OTHER INFO
  const [phone2, setPhone2] = useState('');
  const [birthday, setBirthday] = useState('');
  const [salesLead, setSalesLead] = useState('true');
  const [vendorLead, setVendorLead] = useState('');
  const [bussinessPartner, setBussinessPartner] = useState('');
  const [bussinessPartnerID, setBussinessPartnerID] = useState('');
  const [position, setPosition] = useState('');
  const [organization, setOrganization] = useState('');
  const [organizationID, setOrganizationID] = useState('');
  const [active] = useState(true);
  const [statusID, setStatusID] = useState('N'); // Default New
  const [status, setStatus] = useState('New');
  const [searchKey, setSearchKey] = useState('');
  const [city, setCity] = useState('');
  const [countryID, setcountryID] = useState('');
  const [leadSource, setLeadSource] = useState('');
  const [leadSourceID, setLeadSourceID] = useState('');
  const [leadSourceDesc, setLeadSourceDesc] = useState('');
  const [leadStatusDesc, setLeadStatusDesc] = useState('');
  const [comments, setComments] = useState('');

  const [channels, setChannels] = useState([]);
  const [channel, setChannel] = useState('');
  const [channelID, setChannelID] = useState(null);
  const [channelMenuVisible, setChannelMenuVisible] = useState(false);
  const [campaign, setCampaign] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [campaignID, setCampaignID] = useState(null);
  const [campaignMenuVisible, setCampaignMenuVisible] = useState(false);
  const campaignsOptions = [{id: 1000000, label: 'Standard'}];

  /* ================= PHONE & EMAIL VALIDATIONS ================= */

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+\d{8,15}$/;
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [touched, setTouched] = useState({});

  /* ================= VALIDATION ================= */

  const validateForm = () => {
    let newErrors = {};

    if (!name.trim()) newErrors.name = 'Field required';
    if (!email.trim()) newErrors.email = 'Field required';
    if (!phone.trim()) newErrors.phone = 'Field required';
    if (!address.trim()) newErrors.address = 'Field required';
    if (!description.trim()) newErrors.description = 'Field required';
    if (!companyName.trim()) newErrors.companyName = 'Field required';
    if (!companyAddress.trim()) newErrors.companyAddress = 'Field required';

    //  If any required field missing
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert('Missing Information', 'Please provide all required fields');
      return false;
    }

    //  Format validations (run only when fields exist)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Invalid Email', 'Enter a valid email address');
      return false;
    }

    if (!/^\+\d{8,15}$/.test(phone)) {
      Alert.alert('Invalid Phone', 'Enter phone number correctly');
      return false;
    }

    setErrors({});
    return true;
  };

  const getInputStyle = field => [
    styles.input,
    focusedField === field && {borderColor: '#2F4FE3'},
    errors[field] && {borderColor: 'red'},
  ];
  const ErrorText = ({field}) =>
    errors[field] ? (
      <Text style={{color: 'red', fontSize: 11, marginTop: 2}}>
        {errors[field]}
      </Text>
    ) : null;

  // Fetch logged-in user's organization on component mount
  useEffect(() => {
    const fetchUserOrg = async () => {
      try {
        const orgData = await AsyncStorage.getItem('orgs'); // must be saved at login
        if (orgData) {
          const data = JSON.parse(orgData);
          // Filter out orgs with '*' in name like select role screen
          const orgs = data.filter(org => !org.name.includes('*'));
          if (orgs.length > 0) {
            setOrganization(orgs[0].name);
            setOrganizationID(orgs[0].id);
          }
        }
      } catch (error) {
        console.log('Error fetching user organization:', error);
      }
    };
    fetchUserOrg();
  }, []);

  // Auto-fill Sales Representative based on logged-in user
  useEffect(() => {
    const autoFillSalesRep = async () => {
      try {
        const userId = await AsyncStorage.getItem('tokenOk');
        const userName = await AsyncStorage.getItem('userName');

        if (userId && userName) {
          setSalesRep(userName);
          setSalesRepID(Number(userId));
        }
      } catch (e) {
        console.log('SalesRep autofill error', e);
      }
    };

    autoFillSalesRep();
  }, []);

  /* ================= API ================= */
  const AddLeadApi = async () => {
    if (!validateForm()) return;
    try {
      //  Birthday validation
      if (birthday && !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
        Alert.alert('Birthday must be in YYYY-MM-DD format');
        return;
      }

      const protocol = await AsyncStorage.getItem('protocol');
      const host = await AsyncStorage.getItem('host');
      const port = await AsyncStorage.getItem('port');
      const token = await AsyncStorage.getItem('token');

      //  Create Location
      const locationPayload = {
        AD_Client_ID: {id: bussinessPartnerID || 1000000},
        AD_Org_ID: {id: organizationID || 1000001},
        Address1: address,
        City: city || '',
        C_Country_ID: {id: countryID || 271},
        IsActive: true,
      };
      const locationRes = await axios.post(
        `${protocol}://${host}:${port}/api/v1/models/C_Location`,
        locationPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      const locationID = locationRes.data.id;

      //  Prepare AD_User payload
      const payload = {
        Name: name,
        EMail: email,
        Phone: phone,
        Phone2: phone2,
        IsSalesLead: salesLead,
        IsVendorLead: vendorLead,
        BPName: companyName,
        SalesRep_ID: {id: salesRepID || 1000117},
        AD_Org_ID: {id: organizationID || 1000001},
        AD_Client_ID: {id: bussinessPartnerID || 1000000},
        Description: description,
        IsActive: true,
        LeadStatus: statusID,
        Value: searchKey,
        LeadSource: {id: leadSourceID || 'CC'},
        LeadSourceDescription: leadSourceDesc,
        LeadStatusDescription: leadStatusDesc,
        Comments: comments,
        UserAddress1: address,
        UserAddress2: companyAddress,
        C_Location_ID: {id: locationID},
      };
      if (birthday) payload.Birthday = birthday;

      //  Call API
      const response = await axios.post(
        `${protocol}://${host}:${port}/api/v1/models/AD_User`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // Merge backend response with user input
      const leadData = {
        ...response.data,
        Name: name,
        EMail: email,
        Phone: phone,
        Phone2: phone2,
        Birthday: birthday,
        BPName: companyName,
        UserAddress1: address,
        UserAddress2: companyAddress,
        LeadSourceDescription: leadSourceDesc,
        LeadStatusDescription: leadStatusDesc,
        Comments: comments,
        SalesLead: salesLead,
        VendorLead: vendorLead,
        Organization: organization,
        Active: active,
      };

      console.log('Lead Created successfully with user input:', leadData);
      Alert.alert('Success', 'Lead submitted successfully!');

      return leadData; // render back in component
    } catch (error) {
      console.log('CRM data saving error:', error);
      console.log(error.response?.data);
      Alert.alert('Error', 'Failed to save lead');
    }
  };

  const fetchCampaigns = async () => {
    try {
      const protocol = await AsyncStorage.getItem('protocol');
      const host = await AsyncStorage.getItem('host');
      const port = await AsyncStorage.getItem('port');
      const token = await AsyncStorage.getItem('token');

      const URL = `${protocol}://${host}:${port}/api/v1/models/C_Campaign`;
      const res = await axios.get(URL, {
        headers: {Authorization: `Bearer ${token}`},
      });

      setCampaigns(res.data.records || []);
    } catch (e) {
      console.log('Campaign fetch error', e);
    }
  };
  useEffect(() => {
    fetchCampaigns();
  }, []);

  //  FOR UNIQUE CAMPAIGNS
  const uniqueCampaigns = campaigns.filter(
    (campaign, index, self) =>
      index === self.findIndex(c => c.id === campaign.id),
  );

  // FUNCTIONS FOR COPY CONTACT TO BP INFO

  const copyContactNameToBP = () => {
    setCompanyName(name);
  };
  const copyContactAddToBP = () => {
    setCompanyAddress(address);
  };

  /* ================= UI Input ================= */
  const RequiredLabel = ({text}) => (
    <Text style={styles.inputLabel}>
      {text} <Text style={{color: 'red'}}>*</Text>
    </Text>
  );
  return (
    <View style={{flex: 1}}>
      <StatusBar translucent={true} backgroundColor="transparent" />
      <CustomHeader title={'Add Leads'} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.formWrapper}>
        {/* =========================== FIRST SECTION CONTACT INFO ======================== */}

        <View style={[styles.sectionWrapper, {marginTop: '5%'}]}>
          <View style={styles.toggle}>
            <TouchableOpacity
              onPress={() => setExpanded(!expanded)}
              style={styles.toggleBtn}>
              <Text style={styles.sectionHeader}>Contact Info</Text>
              <Ionicons
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#555"
              />
            </TouchableOpacity>

            {/* Collapsible Content */}
            {expanded && (
              <>
                {/* --- NAME ---  */}

                <RequiredLabel text="Name" />
                <TextInput
                  placeholder="enter name"
                  placeholderTextColor={'#ccc'}
                  style={getInputStyle('name')}
                  value={name}
                  onChangeText={text => {
                    setName(text);
                    setErrors({...errors, name: null});
                  }}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
                <ErrorText field="name" />

                {/* --- EMAIL --- */}

                <RequiredLabel text="Email" />
                <TextInput
                  placeholder="enter email"
                  placeholderTextColor={'#ccc'}
                  style={getInputStyle('email')}
                  value={email}
                  onChangeText={text => {
                    setEmail(text);
                    setErrors({...errors, email: null});
                  }}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
                <ErrorText field="email" />

                {/* --- PHONE --- */}

                <RequiredLabel text="Phone" />
                <TextInput
                  style={getInputStyle('phone')}
                  value={phone}
                  onChangeText={text => {
                    setPhone(text);
                    setErrors({...errors, phone: null});
                  }}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="+92XXXXXXXXXX"
                  placeholderTextColor={'#ccc'}
                />
                <ErrorText field="phone" />

                {/* --- ADDRESS --- */}

                <RequiredLabel text="Address" />
                <TextInput
                  placeholder="your address"
                  placeholderTextColor={'#ccc'}
                  style={getInputStyle('address')}
                  value={address}
                  onChangeText={text => {
                    setAddress(text);
                    setErrors({...errors, address: null});
                  }}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
                <ErrorText field="address" />

                {/* --- SALES REPRESENTATIVE --- */}

                <RequiredLabel text="Assigned To" />
                <TextInput
                  style={[styles.input, {backgroundColor: 'transparent'}]}
                  value={salesRep}
                  editable={false}
                />
                {/* <Provider>
                  <TouchableOpacity
                    onPress={() => setSalesRepMenuVisible(true)}
                    style={[
                      styles.input,
                      {
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingVertical: 10,
                      },
                    ]}>
                    <Text style={{color: '#ccc'}}>
                      {salesRep || 'select representative'}
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
                    animationType="fade">
                    <View style={styles.modalOverlay}>
                      <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>
                          Select Representative
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
                          <Text
                            style={{
                              color: '#fff',
                              fontFamily: 'K2D-Medium',
                              fontSize: 10,
                            }}>
                            Cancel
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>
                </Provider> */}

                {/* --- DESCRIPTION --- */}

                <RequiredLabel text="Description" />
                <TextInput
                  placeholder="enter description"
                  placeholderTextColor={'#ccc'}
                  style={getInputStyle('description')}
                  value={description}
                  onChangeText={text => {
                    setDescription(text);
                    setErrors({...errors, description: null});
                  }}
                  onFocus={() => setFocusedField('description')}
                  onBlur={() => setFocusedField(null)}
                  multiline
                  numberOfLines={4}
                />
                <ErrorText field="description" />
              </>
            )}
          </View>
        </View>

        {/*  ============================== SECOND SECTION BP INFO ================================ */}

        <View style={styles.sectionWrapper}>
          <View style={styles.toggle}>
            <TouchableOpacity
              onPress={() => setShowBPInfo(!showBPInfo)}
              style={styles.toggleBtn}>
              <Text style={styles.sectionHeader}>Bussiness Partner Info</Text>
              <Ionicons
                name={showBPInfo ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#555"
              />
            </TouchableOpacity>

            {/* --- COLLASABLE CONTENT --- */}

            {showBPInfo && (
              <>
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: '3%',
                    justifyContent: 'space-between',
                  }}>
                  {/* --- BP NAME --- */}

                  <RequiredLabel text="Name" />
                  <TouchableOpacity onPress={copyContactNameToBP}>
                    <MaterialCommunityIcons
                      name="content-copy"
                      size={18}
                      color="#2F4FE3"
                    />
                  </TouchableOpacity>
                </View>
                <TextInput
                  placeholder="enter manually or copy above"
                  placeholderTextColor={'#ccc'}
                  style={getInputStyle('companyName')}
                  value={companyName}
                  onChangeText={text => {
                    setCompanyName(text);
                    setErrors({...errors, companyName: null});
                  }}
                  onFocus={() => setFocusedField('companyName')}
                  onBlur={() => setFocusedField(null)}
                />
                <ErrorText field="companyName" />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: '3%',
                  }}>
                  {/* --- BP ADDRESS --- */}

                  <RequiredLabel text="Address" />
                  <TouchableOpacity onPress={copyContactAddToBP}>
                    <MaterialCommunityIcons
                      name="content-copy"
                      size={18}
                      color="#2F4FE3"
                    />
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="enter manually or copy above"
                  placeholderTextColor={'#ccc'}
                  style={getInputStyle('companyAddress')}
                  value={companyAddress}
                  onChangeText={text => {
                    setCompanyAddress(text);
                    setErrors({...errors, companyAddress: null});
                  }}
                  onFocus={() => setFocusedField('companyAddress')}
                  onBlur={() => setFocusedField(null)}
                />
                <ErrorText field="companyAddress" />
              </>
            )}
          </View>
        </View>

        {/*  ============================== THIRD SECTION OTHER INFO ============================= */}

        <View style={styles.sectionWrapper}>
          <View style={styles.toggle}>
            <TouchableOpacity
              onPress={() => setshowOtherInfo(!showOtherInfo)}
              style={styles.toggleBtn}>
              <Text style={styles.sectionHeader}>Other Info</Text>
              <Ionicons
                name={showOtherInfo ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#555"
              />
            </TouchableOpacity>

            {/* --- COLLASABLE CONTENT --- */}

            {showOtherInfo && (
              <View style={{paddingBottom: 12}}>
                {/* --- PHONE2 --- */}

                <View style={{marginTop: '3%'}}>
                  <Text style={styles.inputLabel}>Phone</Text>
                  <TextInput
                    style={getInputStyle('phone')}
                    value={phone2}
                    onChangeText={text => {
                      setPhone2(text);
                      setErrors({...errors, phone: null});
                    }}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="+92XXXXXXXXXX"
                    placeholderTextColor={'#ccc'}
                  />
                </View>

                {/* --- BIRTHDAY --- */}

                <View style={{marginTop: '3%'}}>
                  <Text style={styles.inputLabel}>Birthday</Text>
                  <TextInput
                    style={getInputStyle('birthday')}
                    value={birthday}
                    onChangeText={text => {
                      setBirthday(text);
                    }}
                    onFocus={() => setFocusedField('birthday')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#ccc"
                  />
                </View>

                {/* --- CAMPAIGN --- */}

                <Text style={[styles.inputLabel, {marginTop: '3%'}]}>
                  Select Campaign
                </Text>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 6,
                    marginVertical: 8,
                    overflow: 'hidden',
                    height: 40,
                    justifyContent: 'center',
                    marginTop: '2%',
                  }}>
                  <Picker
                    selectedValue={selectedCampaign}
                    onValueChange={itemValue => setSelectedCampaign(itemValue)}
                    style={{
                      height: 40,
                      width: '100%',
                    }}
                    itemStyle={{
                      height: 40,
                      fontSize: 13,
                      color: '#555',
                      fontFamily: 'K2D-Medium',
                    }}>
                    <Picker.Item
                      label="Select Campaign"
                      value={null}
                      style={{
                        color: '#555',
                        fontSize: 14,
                        fontFamily: 'K2D-Medium',
                      }}
                    />

                    {campaigns.map(item => (
                      <Picker.Item
                        key={item.id}
                        label={item.Name}
                        value={item.id}
                        style={{
                          color: '#555',
                          fontSize: 14,
                          fontFamily: 'K2D-Medium',
                        }}
                      />
                    ))}
                  </Picker>
                </View>

                {/* --- LEAD SOURCE --- */}

                <View style={{marginTop: '3%'}}>
                  <Text style={styles.inputLabel}>Lead Source</Text>
                  <Provider>
                    <TouchableOpacity
                      onPress={() => setLeadSourceMenuVisible(true)}
                      style={[
                        styles.input,
                        {
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingVertical: 10,
                        },
                      ]}>
                      <Text style={{color: '#ccc'}}>
                        {leadSource || 'select source'}
                      </Text>
                      <MaterialCommunityIcons
                        name="chevron-down"
                        size={22}
                        color="#666"
                      />
                    </TouchableOpacity>
                    <Modal
                      visible={leadSourceMenuVisible}
                      onDismiss={() => setLeadSourceMenuVisible(false)}
                      animationType="fade">
                      <View style={styles.modalOverlay}>
                        <View style={styles.modalBox}>
                          <Text style={styles.modalTitle}>Select Source</Text>
                          {leadSourceOptions.map(item => (
                            <TouchableOpacity
                              key={item.id}
                              style={styles.optionItem}
                              onPress={() => {
                                setLeadSource(item.label);
                                setLeadSourceID(item.id);
                                setLeadSourceMenuVisible(false);
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
                            onPress={() => setLeadSourceMenuVisible(false)}>
                            <Text
                              style={{
                                color: '#fff',
                                fontFamily: 'K2D-Medium',
                                fontSize: 10,
                              }}>
                              Cancel
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Modal>
                  </Provider>
                </View>

                {/* --- LEAD SOURCE DESCRRRIPTION --- */}

                <View style={{marginTop: '3%'}}>
                  <Text style={styles.inputLabel}>Lead Source Description</Text>
                  <TextInput
                    style={getInputStyle('leadSourceDesc')}
                    value={leadSourceDesc}
                    onChangeText={text => {
                      setLeadSourceDesc(text);
                    }}
                    onFocus={() => setFocusedField('leadSourceDesc')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="please provide description"
                    placeholderTextColor="#ccc"
                    multiline
                     numberOfLines={4}
                  />
                </View>

                {/* --- STATUS --- */}

                <View style={{marginTop: '3%', flex: 1}}>
                  <Text style={styles.inputLabel}>Status</Text>
                  <Provider>
                    <TouchableOpacity
                      onPress={() => setStatusMenuVisible(true)}
                      style={[
                        styles.input,
                        {
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingVertical: 10,
                        },
                      ]}>
                      <Text style={{color: '#555'}}>
                        {status || 'select lead'}
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
                      animationType="fade">
                      <View style={styles.modalOverlay}>
                        <View style={styles.modalBox}>
                          <Text style={styles.modalTitle}>Select Lead</Text>
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
                            <Text
                              style={{
                                color: '#fff',
                                fontFamily: 'K2D-Medium',
                                fontSize: 10,
                              }}>
                              Cancel
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Modal>
                  </Provider>
                </View>

                {/* --- STATUS DESC --- */}

                <View style={{marginTop: '3%'}}>
                  <Text style={styles.inputLabel}>Lead Status Description</Text>
                  <TextInput
                    style={getInputStyle('leadStatusDesc')}
                    value={leadStatusDesc}
                    onChangeText={text => {
                      setLeadStatusDesc(text);
                    }}
                    onFocus={() => setFocusedField('leadStatusDesc')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="please provide description"
                    placeholderTextColor="#ccc"
                    multiline
                    numberOfLines={4}
                  />
                </View>

                {/* --- COMMENTS --- */}

                <View style={{marginTop: '3%'}}>
                  <Text style={styles.inputLabel}>Comments</Text>
                  <TextInput
                    style={getInputStyle('comments')}
                    value={comments}
                    onChangeText={text => {
                      setComments(text);
                    }}
                    onFocus={() => setFocusedField('comments')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="give your comments"
                    placeholderTextColor="#ccc"
                    multiline
                    numberOfLines={4}
                  />
                </View>

                {/* --- SALES LEAD --- */}

                <View style={{marginTop: '3%'}}>
                  <Text style={styles.inputLabel}>Sales Lead</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="true/false"
                    value={salesLead}
                    onChangeText={setSalesLead}
                    placeholderTextColor="#777"
                  />
                </View>

                {/* --- VENDOR LEAD --- */}

                <View style={{marginTop: '3%'}}>
                  <Text style={styles.inputLabel}>Vendor Lead</Text>
                  <TextInput
                    style={getInputStyle('vendorLead')}
                    value={vendorLead}
                    onChangeText={text => {
                      setVendorLead(text);
                    }}
                    onFocus={() => setFocusedField('vendorLead')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="true / false"
                    placeholderTextColor="#ccc"
                  />
                </View>

                {/* --- TENANT --- */}

                <View style={{marginTop: '3%'}}>
                  <Text style={styles.inputLabel}>Tenant</Text>
                  <TextInput
                    style={styles.input}
                    value={'UActros'}
                    editable={false}
                    placeholderTextColor="#777"
                  />
                </View>

                {/* --- ORGANIZATION (read-only) --- */}

                <View style={{marginTop: '3%'}}>
                  <Text style={styles.inputLabel}>Organization</Text>
                  <TextInput
                    style={styles.input}
                    editable={false}
                    value={organization}
                    placeholderTextColor="#777"
                  />
                </View>

                {/* --- Active --- */}

                <View style={{marginTop: '3%'}}>
                  <Text style={styles.inputLabel}>Is Active</Text>
                  <TextInput
                    style={styles.input}
                    value={active ? 'True' : 'false'}
                    editable={false}
                  />
                </View>

                {/* --- SEARCH KEY --- */}

                <View style={{marginTop: '3%'}}>
                  <Text style={styles.inputLabel}>Search Key</Text>
                  <TextInput
                    style={getInputStyle('searchKey')}
                    value={searchKey}
                    onChangeText={text => {
                      setSearchKey(text);
                    }}
                    onFocus={() => setFocusedField('searchKey')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="provide search key"
                    placeholderTextColor="#ccc"
                  />
                </View>
              </View>
            )}
          </View>
        </View>

        {/* --- SUBMIT BUTTON --- */}

        <TouchableOpacity style={styles.button} onPress={AddLeadApi}>
          <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>
            Submit
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AddLeads;

const styles = StyleSheet.create({
  formWrapper: {
    backgroundColor: '#fff',
    elevation: 6,
    shadowColor: '#333',
    width: '90%',
    paddingBottom: '5%',
    marginLeft: '5%',
    marginTop: '9%',
    marginBottom: '5%',
    borderRadius: 6,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginTop: 10,
    borderRadius: 5,
    paddingHorizontal: 10,
    color: '#000',
  },
  inputLabel: {
    color: '#000',
    fontFamily: 'K2D-SemiBold',
    letterSpacing: 0.5,
  },
  textbox: {
    color: '#000',
    fontSize: 15,
    fontFamily: 'K2D-SemiBold',
  },
  button: {
    backgroundColor: '#2F4FE3',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: '10%',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    position: 'absolute',
    padding: 20,
    bottom: 15,
    left: 5,
  },
  modalBox: {
    width: 100,
    backgroundColor: '#fff',
    borderRadius: 2,
    padding: 10,
    elevation: 10,
    zIndex: 999,
  },
  modalTitle: {
    fontSize: 13,
    fontFamily: 'K2D-Bold',
    marginBottom: 2,
    color: '#555',
  },
  optionItem: {
    paddingVertical: '0%',
    paddingHorizontal: '2%',
  },
  cancelBtn: {
    marginTop: 5,
    backgroundColor: '#555',
    paddingVertical: 2,
    borderRadius: 4,
    alignItems: 'center',
    marginLeft: '1%',
  },
  sectionWrapper: {
    flex: 1,
    padding: 5,
    backgroundColor: '#fff',
    // borderWidth: 1,
    // borderColor: '#ccc',
    elevation: 2,
    marginBottom: '7%',
    // width:'90%',
    //  left: '5%'
  },
  sectionHeader: {
    fontFamily: 'K2D-Bold',
    fontSize: 15,
    color: '#000',
  },
  toggle: {
    marginVertical: 10,
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  toggleBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
