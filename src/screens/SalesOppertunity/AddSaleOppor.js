import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
  StatusBar,
  Pressable,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CustomHeader from '../../components/CustomHeader';
import {Picker} from '@react-native-picker/picker';

const BASE_URL = 'http://116.58.53.114:9999/api/v1/models';

const AddSaleOppor = ({navigation}) => {
  /* ---------------- LOGIN ---------------- */
  const [tenantId, setTenantId] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [orgId, setOrgId] = useState('');
  const [salesRepId, setSalesRepId] = useState('');
  const [salesRepName, setSalesRepName] = useState('');

  /* ---------------- OPPORTUNITY ---------------- */
  const [selectedBPId, setSelectedBPId] = useState(null);
  const [selectedBPName, setSelectedBPName] = useState('');
  const [bpQuery, setBpQuery] = useState('');
  const [bpResults, setBpResults] = useState([]);
  const [showBPList, setShowBPList] = useState(false);

  const [bpContacts, setBpContacts] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [documentNo, setDocumentNo] = useState('');
  const [description, setDescription] = useState('');
  const [comments, setComments] = useState('');

  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [amount, setAmount] = useState('');

  /* ---------------- SALES STAGE ---------------- */
  const [stages, setStages] = useState([]);
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [probability, setProbability] = useState('0');

  /* ---------------- CURRENCY STATES ---------------- */
  const [currencyQuery, setCurrencyQuery] = useState('');
  const [currencyResults, setCurrencyResults] = useState([]);
  const [showCurrencyList, setShowCurrencyList] = useState(false);

  /* ---------------- OTHERS ---------------- */
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [active] = useState(true);

  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrencyId, setSelectedCurrencyId] = useState(null);

  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const [organization, setOrganization] = useState('');
  const [organizationID, setOrganizationID] = useState(null);

  const [errors, setErrors] = useState({});

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    loadLoginData();
    fetchUserOrg();
    fetchStages();
    fetchCurrencies();
    fetchCampaigns();
    setDocumentNo('Auto Generated');
  }, []);

  const loadLoginData = async () => {
    setTenantId(await AsyncStorage.getItem('clientId'));
    setTenantName(await AsyncStorage.getItem('clientName'));
    setOrgId(await AsyncStorage.getItem('organizationId'));
    setSalesRepId(await AsyncStorage.getItem('userId'));
    setSalesRepName(await AsyncStorage.getItem('userName'));
  };

  const fetchUserOrg = async () => {
    const orgData = await AsyncStorage.getItem('orgs');
    if (orgData) {
      const orgs = JSON.parse(orgData).filter(o => !o.name.includes('*'));
      if (orgs.length) {
        setOrganization(orgs[0].name);
        setOrganizationID(orgs[0].id);
      }
    }
  };

  /* ---------------- SEARCH BUSINESS PARTNER ---------------- */
  const searchBusinessPartner = async text => {
    setBpQuery(text);

    if (text.length < 2) {
      setBpResults([]);
      setShowBPList(false);
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(
        `${BASE_URL}/C_BPartner?$filter=contains(Name,'${text}')&$select=Name,Value`,
        {headers: {Authorization: `Bearer ${token}`}},
      );
      setBpResults(res.data.records || []);
      setShowBPList(true);
    } catch (e) {
      console.log('BP search error', e.message);
    }
  };

  /* ---------------- BP USERS ---------------- */
  const fetchBpUsers = async bpId => {
    if (!bpId) return;
    const token = await AsyncStorage.getItem('token');
    const res = await axios.get(
      `${BASE_URL}/AD_User?$filter=C_BPartner_ID eq ${bpId}&$select=Name`,
      {headers: {Authorization: `Bearer ${token}`}},
    );
    const users = res.data.records || [];
    setBpContacts(users);
    setSelectedUserId(users[0]?.id || null);
  };

  /* ---------------- STAGES ---------------- */
  const fetchStages = async () => {
    const token = await AsyncStorage.getItem('token');
    const res = await axios.get(
      `${BASE_URL}/C_SalesStage?$select=Name,Probability`,
      {headers: {Authorization: `Bearer ${token}`}},
    );
    setStages(res.data.records || []);
  };

  const handleStageChange = id => {
    setSelectedStageId(id);
    const stage = stages.find(s => s.id === id);
    setProbability(stage?.Probability?.toString() || '0');
  };

  /* ---------------- CURRENCY ---------------- */

  const searchCurrency = text => {
    setCurrencyQuery(text);

    if (text.length < 1) {
      setCurrencyResults([]);
      setShowCurrencyList(false);
      return;
    }

    const filtered = currencies.filter(
      c =>
        c.ISO_Code.toLowerCase().includes(text.toLowerCase()) ||
        c.Description.toLowerCase().includes(text.toLowerCase()),
    );
    setCurrencyResults(filtered);
    setShowCurrencyList(true);
  };
  const fetchCurrencies = async () => {
    const token = await AsyncStorage.getItem('token');
    const res = await axios.get(
      `${BASE_URL}/C_Currency?$select=ISO_Code,Description`,
      {headers: {Authorization: `Bearer ${token}`}},
    );
    setCurrencies(res.data.records || []);
  };

  /* ---------------- CAMPAIGNS ---------------- */
  const fetchCampaigns = async () => {
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const token = await AsyncStorage.getItem('token');

    const res = await axios.get(
      `${protocol}://${host}:${port}/api/v1/models/C_Campaign`,
      {headers: {Authorization: `Bearer ${token}`}},
    );
    setCampaigns(res.data.records || []);
  };

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    let e = {};
    if (!selectedBPId) e.bp = 'Field required';
    if (!selectedStageId) e.stage = 'Field required';
    if (!expectedCloseDate) e.date = 'Field required';
    if (!amount) e.amount = 'Field required';
    if (!selectedCurrencyId) e.currency = 'Field required';

    setErrors(e);

    if (Object.keys(e).length) {
      Alert.alert('Missing Information', 'Please provide all required fields');
      return;
    }
    submitOpportunity();
  };

  /* ---------------- SUBMIT ---------------- */
  const submitOpportunity = async () => {
    const payload = {
      AD_Client_ID: tenantId,
      AD_Org_ID: {id: organizationID},
      C_BPartner_ID: selectedBPId,
      AD_User_ID: selectedUserId,
      SalesRep_ID: salesRepId,
      C_SalesStage_ID: selectedStageId,
      Probability: Number(probability),
      ExpectedCloseDate: expectedCloseDate,
      OpportunityAmt: Number(amount),
      C_Currency_ID: selectedCurrencyId,
      Description: description,
      Comments: comments,
      IsActive: active,
    };

    const token = await AsyncStorage.getItem('token');
    await axios.post(`${BASE_URL}/C_Opportunity`, payload, {
      headers: {Authorization: `Bearer ${token}`},
    });

    Alert.alert('Success', 'Sales Opportunity Created');
    navigation.goBack();
  };

  /* ---------------- UI ---------------- */
  return (
    <>
      <StatusBar translucent backgroundColor="transparent" />
      <CustomHeader title="Add Sale Opportunity" />

      <ScrollView
        style={styles.formWrapper}
        contentContainerStyle={{paddingBottom: 100}}
        showsVerticalScrollIndicator={false}>
        <Label title="Document No" />
        <ReadOnly value={documentNo} />

        {/* 🔍 BUSINESS PARTNER SEARCH */}
        <Label title="Business Partner" required />
        <View style={{position: 'relative', marginTop: 4, zIndex: 10}}>
          <TextInput
            style={[styles.input, errors.bp && styles.errorBorder]}
            placeholder="Search Business Partner"
            placeholderTextColor="#9E9E9E"
            value={selectedBPName || bpQuery}
            onChangeText={text => {
              setSelectedBPName('');
              setSelectedBPId(null);
              searchBusinessPartner(text);
              setErrors(p => ({...p, bp: null}));
            }}
          />
          {showBPList && (
            <View style={styles.searchList}>
              {bpResults.map(item => (
                <Pressable
                  key={item.id}
                  style={({pressed}) => [
                    styles.searchItem,
                    {backgroundColor: pressed ? '#EAF0FF' : '#fff'},
                  ]}
                  onPress={() => {
                    setSelectedBPId(item.id);
                    setSelectedBPName(item.Name);
                    setShowBPList(false);
                    fetchBpUsers(item.id);
                  }}>
                  <Text style={styles.searchItemTxt}>{item.Name}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* CONTACT */}
        {/* <Label title="User / Contact" />
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={selectedUserId}
            onValueChange={setSelectedUserId}
            style={{
              height: 40,
              color: '#000', // ✅ picker text black
            }}
            itemStyle={{
              height: 40,
              color: '#000',
              fontSize: 13,
            }}>
            {bpContacts.map(u => (
              <Picker.Item
                key={u.id}
                label={u.Name || 'Auto selected'}
                value={u.id}
                style={styles.searchItemTxt}
              />
            ))}
          </Picker>
        </View> */}

        <Label title="User / Contact" />

        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={selectedUserId}
            onValueChange={value => {
              if (value !== null) {
                setSelectedUserId(value);
              }
            }}
            style={{
              height: 40,
              color: selectedUserId ? '#000' : '#9E9E9E', // ✅ placeholder gray
            }}
            itemStyle={{
              height: 40,
              fontSize: 13,
              color: '#000',
            }}>
            {/* ✅ Placeholder item */}
            <Picker.Item
              label="Auto select"
              value={null}
              color="#9E9E9E"
              style={styles.searchItemTxt}
            />

            {/* ✅ Real values */}
            {bpContacts.map(u => (
              <Picker.Item
                key={u.id}
                label={u.Name}
                value={u.id}
                color="#000"
                style={styles.searchItemTxt}
              />
            ))}
          </Picker>
        </View>

        {/* REST SAME AS BEFORE */}
        <Label title="Sales Rep" />
        <ReadOnly value={salesRepName} />
        <Label title="Sales Stage" required />
        <PickerWrap error={errors.stage}>
          <Picker
            selectedValue={selectedStageId}
            onValueChange={handleStageChange}
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
              label="Select Stage"
              value={null}
              style={styles.searchItemTxt}
            />
            {stages.map(s => (
              <Picker.Item
                key={s.id}
                label={s.Name}
                value={s.id}
                style={styles.searchItemTxt}
              />
            ))}
          </Picker>
        </PickerWrap>
        <ErrorText error={errors.stage} />
        <Label title="Campaign" />
        <View style={styles.pickerWrap}>
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

        <Label title="Probability" />
        <ReadOnly value={`${probability}%`} />

        <Label title="Expected Close Date" required />
        <TouchableOpacity
          style={[styles.input, errors.date && styles.errorBorder]}
          onPress={() => setShowDatePicker(true)}>
          <Text
            style={{
              color: expectedCloseDate ? '#000' : '#9E9E9E',
              fontSize: 14,
            }}>
            {expectedCloseDate || 'Select date'}
          </Text>
        </TouchableOpacity>
        <ErrorText error={errors.date} />

        {showDatePicker && (
          <DateTimePicker
            value={expectedCloseDate ? new Date(expectedCloseDate) : new Date()}
            mode="date"
            onChange={(e, d) => {
              setShowDatePicker(false);
              if (d) setExpectedCloseDate(d.toISOString().split('T')[0]);
            }}
          />
        )}

        <Label title="Opportunity Amount" required />
        <Input
          value={amount}
          keyboardType="numeric"
          onChangeText={v => {
            setAmount(v);
            setErrors(prev => ({...prev, amount: null}));
          }}
          error={errors.amount}
        />
        <ErrorText error={errors.amount} />
        {/* <Label title="Currency" required />
        <PickerWrap error={errors.currency}>
          <Picker
            selectedValue={selectedCurrencyId}
            onValueChange={v => {
              setSelectedCurrencyId(v);
              setErrors(prev => ({...prev, currency: null}));
            }}>
            <Picker.Item label="Select Currency" value={null} />
            {currencies.map(c => (
              <Picker.Item
                key={c.id}
                label={`${c.ISO_Code} - ${c.Description}`}
                value={c.id}
              />
            ))}
          </Picker>
        </PickerWrap>
        <ErrorText error={errors.currency} /> */}
        <Label title="Currency" required />
        <View style={{position: 'relative', marginTop: 4, zIndex: 10}}>
          <Input
            value={
              currencyQuery ||
              currencies.find(c => c.id === selectedCurrencyId)?.ISO_Code ||
              ''
            }
            placeholder="Search Currency"
            onChangeText={text => {
              setSelectedCurrencyId(null);
              searchCurrency(text);
              setErrors(prev => ({...prev, currency: null}));
            }}
            error={errors.currency}
          />
          <ErrorText error={errors.currency} />

          {showCurrencyList && (
            <View style={styles.searchList}>
              {currencyResults.map(c => (
                <Pressable
                  key={c.id}
                  style={({pressed}) => [
                    styles.searchItem,
                    {backgroundColor: pressed ? '#EAFOFF' : '#fff'},
                  ]}
                  onPress={() => {
                    setSelectedCurrencyId(c.id);
                    setCurrencyQuery(`${c.ISO_Code}`);
                    setShowCurrencyList(false);
                  }}>
                  <Text
                    style={
                      styles.searchItemTxt
                    }>{`${c.ISO_Code} - ${c.Description}`}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <Label title="Description" />
        <Input
          value={description}
          placeholder={'enter description'}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={{height: 90, textAlignVertical: 'center'}}
        />
        <Label title="Comments" />
        <Input
          placeholder={'give comments'}
          value={comments}
          onChangeText={setComments}
          multiline
          numberOfLines={4}
          style={{height: 90, textAlignVertical: 'center'}}
        />

        <Label title="Tenant" />
        <ReadOnly value={tenantName} />

        <Label title="Organization" />
        <ReadOnly value={organization} />

        <View style={styles.switchRow}>
          <Text style={styles.label}>Active</Text>
          <Switch
            value={active}
            disabled
            trackColor={{false: '#ccc', true: '#2F4FE3'}} // background track colors
            thumbColor={active ? '#fff' : '#f4f3f4'} // knob color
          />
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.submitBtn} onPress={validate}>
        <Text style={styles.submitText}>Create Opportunity</Text>
      </TouchableOpacity>
    </>
  );
};

/* ---------------- COMMON ---------------- */
const Label = ({title, required}) => (
  <Text style={styles.label}>
    {title}
    {required && <Text style={{color: 'red'}}> *</Text>}
  </Text>
);
const Input = ({error, ...props}) => (
  <TextInput
    {...props}
    placeholderTextColor="#9E9E9E"
    style={[styles.input, error && styles.errorBorder, {color: '#000'}]}
  />
);
const ReadOnly = ({value}) => (
  <View style={[styles.input, styles.readOnly]}>
    <Text style={{color: '#555'}}>{value}</Text>
  </View>
);

const PickerWrap = ({children, error}) => (
  <View style={[styles.pickerWrap, error && styles.errorBorder]}>
    {children}
  </View>
);
const ErrorText = ({error}) =>
  error ? <Text style={styles.errorText}>{error}</Text> : null;

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff', padding: 16},
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
    padding: '5%',
  },
  label: {
    fontSize: 12,
    color: '#000',
    marginTop: 12,
    fontFamily: 'K2D-Bold',
    paddingTop: '2%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 6,
    marginTop: 4,
    height: 45,
    fontSize: 14,
    color: '#000',
  },
  readOnly: {backgroundColor: '#f1f1f1'},
  pickerWrap: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginTop: 4,
  },
  errorBorder: {borderColor: 'red'},
  errorText: {color: 'red', fontSize: 11},
  searchItem: {padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee'},
  searchItemTxt: {color: '#000', fontSize: 13},
  submitBtn: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#2F4FE3',
    padding: 16,
    borderRadius: 10,
  },
  submitText: {color: '#fff', textAlign: 'center', fontWeight: 'bold'},
  searchList: {
    position: 'absolute', // float over other content
    top: 60, // adjust relative to the input field
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    maxHeight: 180,
    backgroundColor: '#fff',
    zIndex: 10, // make sure it stays on top
    overflow: 'hidden',
    elevation: 2,
  },
});

export default AddSaleOppor;
