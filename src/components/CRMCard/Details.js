import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';


export default function UserDetailScreen({ route }) {
  const { user } = route.params; // dynamic user data

  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);
  const [showOtherInfo, setShowOtherInfo] = useState(false);

  const InfoRow = ({ label, value }) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || '—'}</Text>
    </View>
  );

  const SectionHeader = ({ title, expanded, toggle }) => (
    <TouchableOpacity style={styles.sectionHeader} onPress={toggle}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <MaterialCommunityIcons
        name={expanded ? 'chevron-up' : 'chevron-down'}
        size={25}
        color={'#6A0DAD'}
      />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* BASIC INFO CARD */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>User Basic Info</Text>
        <InfoRow label="Name" value={user?.Name} />
        <InfoRow label="Phone" value={user?.Phone} />
        <InfoRow label="Email" value={user?.Email} />
        <InfoRow label="Address" value={user?.Address} />
      </View>

      {/* MORE INFO DROPDOWN */}
      <View style={styles.card}>
        <SectionHeader
          title="More Info"
          expanded={showMoreInfo}
          toggle={() => setShowMoreInfo(!showMoreInfo)}
        />
        {showMoreInfo && (
          <View>
            <InfoRow label="2nd Phone" value={user?.SecondPhone} />
            <InfoRow label="Birthday" value={user?.Birthday} />
            <InfoRow label="Address" value={user?.Address2} />
            <InfoRow label="Sales Lead" value={user?.SalesLead} />
            <InfoRow label="Vendor Lead" value={user?.VendorLead} />
            <InfoRow label="Position" value={user?.Position} />
            <InfoRow label="Business PartnerTenant" value={user?.BusinessPartnerTenant} />
            <InfoRow label="Organization" value={user?.Organization} />
            <InfoRow label="Description" value={user?.Description} />
            <InfoRow label="Active" value={user?.Active} />
            <InfoRow label="Status" value={user?.Status} />
            <InfoRow label="Search Key" value={user?.SearchKey} />
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
            <InfoRow label="Company Name" value={user?.CompanyName} />
            <InfoRow label="Company Address" value={user?.CompanyAddress} />
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
            <InfoRow label="Campaign" value={user?.Campaign} />
            <InfoRow label="Lead Source" value={user?.LeadSource} />
            <InfoRow label="Lead Source Description" value={user?.LeadSourceDesc} />
            <InfoRow label="Lead Status Description" value={user?.LeadStatusDesc} />
            <InfoRow label="Comments" value={user?.Comments} />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f2f8',
    padding: 12,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 14,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#6A0DAD',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    color: '#555',
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    maxWidth: '60%',
    textAlign: 'right',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#6A0DAD',
  },
});
  {
            "id": 1000249,
            "uid": "9a982787-957e-40cf-b32e-750698c222b0",
            "Name": "Kanwar Hanan Ur Rehman",
            "AD_Client_ID": {
                "propertyLabel": "Tenant",
                "id": 1000000,
                "identifier": "UActros",
                "model-name": "ad_client"
            },
            "AD_Org_ID": {
                "propertyLabel": "Organization",
                "id": 1000001,
                "identifier": "Kuwait Mall",
                "model-name": "ad_org"
            },
            "IsActive": true,
            "Created": "2024-04-20T22:16:12Z",
            "CreatedBy": {
                "propertyLabel": "Created By",
                "id": 1000003,
                "identifier": "adnan.bilal",
                "model-name": "ad_user"
            },
            "Updated": "2025-12-03T16:13:49Z",
            "UpdatedBy": {
                "propertyLabel": "Updated By",
                "id": 1000002,
                "identifier": "faisal",
                "model-name": "ad_user"
            },
            "EMail": "kanwarhanan99@hmail.com",
            "C_BPartner_ID": {
                "propertyLabel": "Business Partner",
                "id": 1000104,
                "identifier": "Kanwar Hanan Ur Rehman",
                "model-name": "c_bpartner"
            },
            "Birthday": "1997-05-09",
            "Phone": "'+923000430744",
            "LastResult": "Invoice: 171973",
            "LastContact": "2025-07-24",
            "NotificationType": {
                "propertyLabel": "Notification Type",
                "id": "X",
                "identifier": "None",
                "model-name": "ad_ref_list"
            },
            "IsFullBPAccess": true,
            "Value": "rhaq",
            "IsInPayroll": false,
            "IsSalesLead": false,
            "C_Location_ID": {
                "propertyLabel": "Address",
                "id": 1002591,
                "identifier": "Ward no 2,House No 13/349 R,kanwar Street,Mandi Sadiq Ganj,Tehsil minchnabad, District Bahawalnagar, ,  ",
                "model-name": "c_location",
                "AD_Client_ID": {
                    "propertyLabel": "Tenant",
                    "id": 1000000,
                    "identifier": "UActros",
                    "model-name": "ad_client"
                },
                "AD_Org_ID": {
                    "propertyLabel": "Organization",
                    "id": 0,
                    "identifier": "*",
                    "model-name": "ad_org"
                },
                "Address1": "Ward no 2,House No 13/349 R,kanwar Street,Mandi Sadiq Ganj,Tehsil minchnabad, District Bahawalnagar",
                "C_Country_ID": {
                    "propertyLabel": "Country",
                    "id": 100,
                    "identifier": "United States",
                    "model-name": "c_country"
                },
                "C_Location_UU": "4ab93f55-2c18-46e6-b5bb-76400d8cc66a",
                "Created": "2025-11-07 12:59:03.281",
                "CreatedBy": "1000000",
                "IsActive": "true",
                "IsValid": "false",
                "Updated": "2025-11-07 12:59:03.281",
                "UpdatedBy": "1000000"
            },
            "SalesRep_ID": {
                "propertyLabel": "Sales Representative",
                "id": 1000003,
                "identifier": "adnan.bilal",
                "model-name": "ad_user"
            },
            "IsLocked": false,
            "FailedLoginCount": 0,
            "IsNoPasswordReset": false,
            "IsExpired": false,
            "IsAddMailTextAutomatically": false,
            "IsNoExpire": false,
            "IsSupportUser": false,
            "IsShipTo": false,
            "IsBillTo": false,
            "IsVendorLead": false,
            "Fh_Name": "Kanwar Mujeeb Ur Rehman",
            "UserAddress1": "Kanwar Street,House No 13/349 R,Mandi Sadiq Ganj,Tehsil minchnabad,District Bahawalnagar",
            "UserAddress2": "Kanwar Street,House No 13/349 R,Mandi Sadiq Ganj,Tehsil minchnabad,District Bahawalnagar",
            "Job": "Self Employed",
            "Nationality": "Pakistani",
            "NationalCode": "'3110514340287",
            "City": "Mandi Sadiq Ganj ",
            "C_Country_ID": {
                "propertyLabel": "Country",
                "id": 271,
                "identifier": "Pakistan",
                "model-name": "c_country"
            },
            "Nominee_Name": "Kanwar Asis Ur Rehman",
            "NomineeFh_Name": "Kanwar Mujeeb Ur Rehman",
            "Nominee_Relation": "Brother",
            "Nominee_NationalCode": "'3110574874671",
            "Nominee_Address1": "Ward no 2,House No 13/349 R,kanwar Street,Mandi Sadiq Ganj,Tehsil minchnabad, District Bahawalnagar",
            "Nominee_Address2": "Ward no 2,House No 13/349 R,kanwar Street,Mandi Sadiq Ganj,Tehsil minchnabad, District Bahawalnagar",
            "Nominee_Nationality": "Pakistani",
            "Nominee_Phone": "+923000430744",
            "Nominee_Job": "Self Employed",
            "Nominee_City": "Mandi Sadiq Ganj",
            "Nominee_Country": {
                "propertyLabel": "Nominee_Country",
                "id": 271,
                "identifier": "Pakistan",
                "model-name": "c_country"
            },
            "Nominee_Birthday": "1995-08-24",
            "model-name": "ad_user"
        },

        const AddLeadApi = async () => {
  //   try {
  //     // Birthday validation
  //     if (birthday && !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
  //       alert('Birthday must be in YYYY-MM-DD format');
  //       return;
  //     }
  //     const protocol = await AsyncStorage.getItem('protocol');
  //     const host = await AsyncStorage.getItem('host');
  //     const port = await AsyncStorage.getItem('port');
  //     const token = await AsyncStorage.getItem('token');

  //     const payload = {
  //       Name: name,
  //       EMail: email,
  //       Phone: phone,
  //       UserAddress1: address,
  //       Phone2: phone2,

  //       IsSalesLead: salesLead,
  //       IsVendorLead: vendorLead,
  //       BPName: companyName,
  //       SalesRep_ID: {
  //         id: salesRepID || 1000117,
  //         identifier: salesRep || 'Muhammad Anwar',
  //       },
  //       AD_Org_ID: {
  //         id: organizationID || 1000001,
  //         identifier: organization || 'Kuwait Mall',
  //       },
  //       AD_Client_ID: {
  //         id: bussinessPartnerID || 1000000,
  //         identifier: bussinessPartner || 'UActros',
  //       },
  //       Description: description,
  //       IsActive: active,
  //       LeadStatus: statusID,
  //       Value: searchKey,
  //       LeadSourceDescription: leadSourceDesc,
  //       LeadStatusDescription: leadStatusDesc,
  //       Comments: comments,
  //       UserAddress2: companyAddress,
  //     };

  //     if (birthday) payload.Birthday = birthday;

  //     const URL = `${protocol}://${host}:${port}/api/v1/models/AD_User`;
  //     const response = await axios.post(URL, payload, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     console.log('Lead Created successfully:', response.data);
  //     Alert.alert('Success', 'Lead submitted successfully!');
  //     // Reset form
  //     setName('');
  //     setEmail('');
  //     setPhone('');
  //     setAddress('');
  //     setBirthday('');
  //     setSalesLead('true');
  //     setSalesRep('');
  //     setSalesRepID('');
  //     setVendorLead('');
  //     setBussinessPartner('');
  //     setBussinessPartnerID('');
  //     setPosition('');
  //     setDescription('');
  //     setActive(true);
  //     setStatusID('N');
  //     setStatus('New');
  //     setSearchKey('');
  //     setCompanyName('');
  //     setCompanyAddress('');
  //     setCompaign('');
  //     setLeadSource('');
  //     setLeadSourceID('');
  //     setLeadSourceDesc('');
  //     setLeadStatusDesc('');
  //     setComments('');
  //   } catch (error) {
  //     console.log('CRM data saving error:', error);
  //     console.log(error.response?.data);
  //     Alert.alert('Error', 'Failed to save lead');
  //   }
  // };
  // useEffect(() => {
  //   updateCampaigns();
  // }, [campaignID, campaign, campaignName]);
   // const updateCampaigns = async () => {
  //   try {
  //     const protocol = await AsyncStorage.getItem('protocol');
  //     const host = await AsyncStorage.getItem('host');
  //     const port = await AsyncStorage.getItem('port');
  //     const token = await AsyncStorage.getItem('token');
  //     // Create empty payload
  //     const payload = {
  //       Name: campaignName || 'Standard',
  //       C_Channel_ID: {
  //         id: 1000000, // example channel ID
  //         identifier: 'standard',
  //       },
  //     };
  //     console.log('campaign Payload', payload);

  //     const URL = `${protocol}://${host}:${port}/api/v1/models/C_Campaign`;
  //     const res = await axios.post(URL, payload, {
  //       headers: {Authorization: `Bearer ${token}`},
  //     });

  //     setCampaigns(res.data.records || []);
  //   } catch (e) {
  //     console.log('Campaign fetch error', e);
  //   }
  // };

  // useEffect(() => {
  //   const updateCampaigns = async () => {
  //     try {
  //       const protocol = await AsyncStorage.getItem('protocol');
  //       const host = await AsyncStorage.getItem('host');
  //       const port = await AsyncStorage.getItem('port');
  //       const token = await AsyncStorage.getItem('token');

  //       // Create empty payload
  //       const payload = {};

  //       // Add campaign only if campaignID exists
  //       if (campaignID) {
  //         payload.C_Campaign_ID = {
  //           id: campaignID,
  //           identifier: campaign,
  //         };
  //       }

  //       const URL = `${protocol}://${host}:${port}/api/v1/models/C_Campaign`;
  //       const res = await axios.post(URL, payload, {
  //         headers: {Authorization: `Bearer ${token}`},
  //       });

  //       setCampaigns(res.data.records || []);
  //     } catch (e) {
  //       console.log('Campaign fetch error', e);
  //     }
  //   };

  //   updateCampaigns();
  // }, [campaignID, campaign]); // add dependencies so it updates when campaign changes

  // useEffect(() => {
  //   const fetchChannels = async () => {
  //     try {
  //       const protocol = await AsyncStorage.getItem('protocol');
  //       const host = await AsyncStorage.getItem('host');
  //       const port = await AsyncStorage.getItem('port');
  //       const token = await AsyncStorage.getItem('token');

  //       const URL = `${protocol}://${host}:${port}/api/v1/models/C_Channel`;
  //       const res = await axios.get(URL, {
  //         headers: {Authorization: `Bearer ${token}`},
  //       });

  //       setChannels(res.data.records || []);
  //     } catch (e) {
  //       console.log('Channel fetch error', e);
  //     }
  //   };

  //   fetchChannels();
  // }, []);

  import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomHeader from '../../components/CustomHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import {Provider, Modal} from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Picker} from '@react-native-picker/picker';

const AddLeads = () => {
  /* ================= STATES ================= */
  const [expanded, setExpanded] = useState(true);
  const [showBPInfo, setShowBPInfo] = useState(false);
  const [showOtherInfo, setshowOtherInfo] = useState(false);
  const [loading, setLoading] = useState(false);

  // Contact Info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Business Partner
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');

  // Other fields (unchanged)
  const [description, setDescription] = useState('');
  const [birthday, setBirthday] = useState('');
  const [organization, setOrganization] = useState('');
  const [organizationID, setOrganizationID] = useState('');

  /* ================= VALIDATION ================= */
  const validateForm = () => {
    if (!name.trim()) return 'Contact Name is required';
    if (!email.trim()) return 'Email is required';
    if (!phone.trim()) return 'Phone is required';
    if (!address.trim()) return 'Address is required';
    if (!companyName.trim()) return 'Business Partner Name is required';
    if (!companyAddress.trim()) return 'Business Partner Address is required';
    return null;
  };

  /* ================= API ================= */
  const AddLeadApi = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }

    try {
      setLoading(true);

      const protocol = await AsyncStorage.getItem('protocol');
      const host = await AsyncStorage.getItem('host');
      const port = await AsyncStorage.getItem('port');
      const token = await AsyncStorage.getItem('token');

      // Create Location
      const locationRes = await axios.post(
        `${protocol}://${host}:${port}/api/v1/models/C_Location`,
        {
          AD_Client_ID: {id: 1000000},
          AD_Org_ID: {id: organizationID || 1000001},
          Address1: address,
          C_Country_ID: {id: 271},
          IsActive: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const locationID = locationRes.data.id;

      // Create Lead
      await axios.post(
        `${protocol}://${host}:${port}/api/v1/models/AD_User`,
        {
          Name: name,
          EMail: email,
          Phone: phone,
          BPName: companyName,
          UserAddress1: address,
          UserAddress2: companyAddress,
          C_Location_ID: {id: locationID},
          AD_Org_ID: {id: organizationID || 1000001},
          AD_Client_ID: {id: 1000000},
          IsActive: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      Alert.alert('Success', 'Lead submitted successfully!');
    } catch (err) {
      Alert.alert('Error', 'Failed to submit lead');
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  const RequiredLabel = ({text}) => (
    <Text style={styles.inputLabel}>
      {text} <Text style={{color: 'red'}}>*</Text>
    </Text>
  );

  return (
    <View style={{flex: 1}}>
      <StatusBar translucent backgroundColor="transparent" />
      <CustomHeader title="Add Leads" />

      <ScrollView style={styles.formWrapper}>
        {/* CONTACT INFO */}
        <View style={styles.sectionWrapper}>
          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => setExpanded(!expanded)}>
            <Text style={styles.sectionHeader}>Contact Info</Text>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={20}
            />
          </TouchableOpacity>

          {expanded && (
            <>
              <RequiredLabel text="Name" />
              <TextInput style={styles.input} value={name} onChangeText={setName} />

              <RequiredLabel text="Email" />
              <TextInput style={styles.input} value={email} onChangeText={setEmail} />

              <RequiredLabel text="Phone" />
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} />

              <RequiredLabel text="Address" />
              <TextInput style={styles.input} value={address} onChangeText={setAddress} />
            </>
          )}
        </View>

        {/* BUSINESS PARTNER */}
        <View style={styles.sectionWrapper}>
          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => setShowBPInfo(!showBPInfo)}>
            <Text style={styles.sectionHeader}>Business Partner Info</Text>
            <Ionicons
              name={showBPInfo ? 'chevron-up' : 'chevron-down'}
              size={20}
            />
          </TouchableOpacity>

          {showBPInfo && (
            <>
              <RequiredLabel text="Name" />
              <TextInput
                style={styles.input}
                value={companyName}
                onChangeText={setCompanyName}
              />

              <RequiredLabel text="Address" />
              <TextInput
                style={styles.input}
                value={companyAddress}
                onChangeText={setCompanyAddress}
              />
            </>
          )}
        </View>

        <TouchableOpacity
          style={styles.button}
          disabled={loading}
          onPress={AddLeadApi}>
          <Text style={{color: '#fff', fontSize: 16, fontWeight: 'bold'}}>
            Submit
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AddLeads;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  formWrapper: {
    backgroundColor: '#fff',
    width: '90%',
    marginLeft: '5%',
    marginTop: '10%',
    borderRadius: 6,
    paddingBottom: 20,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginTop: 8,
    paddingHorizontal: 10,
  },
  inputLabel: {
    marginTop: 12,
    fontFamily: 'K2D-SemiBold',
    color: '#000',
  },
  button: {
    backgroundColor: '#2F4FE3',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    margin: 20,
  },
  sectionWrapper: {
    padding: 10,
    marginVertical: 8,
    elevation: 2,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    fontFamily: 'K2D-Bold',
    fontSize: 15,
  },
  toggleBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
