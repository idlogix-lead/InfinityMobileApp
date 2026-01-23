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
  Alert,
} from 'react-native';
import React, {useState} from 'react';
import CustomHeader from '../../components/CustomHeader';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Modal} from 'react-native-paper';
import {useMutation, useQueryClient} from 'react-query';
import {useAuthStore} from '../../store/authStore';
import crmApiService from '../../services/CRMAPI/crmApiService';

const {width} = Dimensions.get('window');

const LeadsDetails = ({route, navigation}) => {
  const {data: leadData} = route.params;
  const queryClient = useQueryClient();

  // Dropdown states
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [showBasicInfo, setShowBasicInfo] = useState(true);
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);
  const [showOtherInfo, setShowOtherInfo] = useState(false);

  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [bpMenuVisible, setBpMenuVisible] = useState(false);
  const [orgMenuVisible, setOrgMenuVisible] = useState(false);
  const [leadSourceModalVisible, setLeadSourceModalVisible] = useState(false);
  const [salesRepMenuVisible, setSalesRepMenuVisible] = useState(false);

  // Form state - Updated based on your API response
  const [name, setName] = useState(leadData?.Name || '');
  const [email, setEmail] = useState(leadData?.EMail || '');
  const [phone, setPhone] = useState(leadData?.Phone || '');
  const [phone2, setPhone2] = useState(leadData?.Phone2 || '');
  const [birthday, setBirthday] = useState(leadData?.Birthday || '');
  const [salesLead, setSalesLead] = useState(leadData?.IsSalesLead || false);
  const [vendorLead, setVendorLead] = useState(leadData?.IsVendorLead || false);
  const [businessPartnerId, setBusinessPartnerId] = useState(leadData?.AD_Client_ID?.id || '1000000');
  const [businessPartnerLabel, setBusinessPartnerLabel] = useState(leadData?.AD_Client_ID?.identifier || 'Starlet Innovations Pvt Ltd');
  const [organizationId, setOrganizationId] = useState(leadData?.AD_Org_ID?.id || '1000000');
  const [organizationLabel, setOrganizationLabel] = useState(leadData?.AD_Org_ID?.identifier || 'Starlet Innovation Pvt Ltd');
  const [description, setDescription] = useState(leadData?.Description || '');
  const [active, setActive] = useState(leadData?.IsActive !== undefined ? leadData.IsActive : true);
  const [searchKey, setSearchKey] = useState(leadData?.Value || '');
  const [salesRepId, setSalesRepId] = useState(leadData?.SalesRep_ID?.id || '1000117');
  const [salesRepLabel, setSalesRepLabel] = useState(leadData?.SalesRep_ID?.identifier || 'Muhammad Anwar');
  const [companyName, setCompanyName] = useState(leadData?.BPName || '');
  const [leadSourceDesc, setLeadSourceDesc] = useState(leadData?.LeadSourceDescription || '');
  const [leadStatusDesc, setLeadStatusDesc] = useState(leadData?.LeadStatusDescription || '');
  const [comments, setComments] = useState(leadData?.Comments || '');

  // Static dropdown options (since API doesn't have these tables)
  const leadStatusOptions = [
    {id: 'N', identifier: 'New'},
    {id: 'W', identifier: 'Working'},
    {id: 'C', identifier: 'Converted'},
    {id: 'E', identifier: 'Expired'},
  ];

  const businessPartnerOptions = [
    {id: '1000000', identifier: 'Starlet Innovations Pvt Ltd'},
    {id: '1000001', identifier: 'Other Client'},
  ];

  const organizationOptions = [
    {id: '1000000', identifier: 'Starlet Innovation Pvt Ltd'},
    {id: '1000001', identifier: 'Other Organization'},
  ];

  const leadSourceOptions = [
    {id: 'CC', identifier: 'Cold Call'},
    {id: 'E', identifier: 'Email'},
    {id: 'P', identifier: 'Phone'},
    {id: 'W', identifier: 'Website'},
    {id: 'R', identifier: 'Referral'},
  ];

  const salesRepOptions = [
    {id: '1000117', identifier: 'Muhammad Anwar'},
    {id: '1000000', identifier: 'STIAdmin'},
  ];

  // Since your API doesn't have LeadStatus, we need to handle it differently
  const [statusId, setStatusId] = useState('N');
  const [statusLabel, setStatusLabel] = useState('New');
  
  // Since your API doesn't have LeadSource, we need to handle it differently
  const [leadSourceId, setLeadSourceId] = useState('CC');
  const [leadSourceLabel, setLeadSourceLabel] = useState('Cold Call');

  // Update mutation
  const updateLeadMutation = useMutation({
    mutationFn: async (updatedData) => {
      console.log('📝 Updating lead with data:', updatedData);
      
      try {
        // Prepare the payload based on your old working code
        const payload = {
          Name: updatedData.Name,
          EMail: updatedData.EMail,
          Phone: updatedData.Phone || '',
          Phone2: updatedData.Phone2 || '',
          Birthday: updatedData.Birthday || null,
          IsSalesLead: updatedData.IsSalesLead,
          IsVendorLead: updatedData.IsVendorLead,
          BPName: updatedData.BPName || '',
          AD_Org_ID: {
            id: updatedData.AD_Org_ID.id,
            identifier: updatedData.AD_Org_ID.identifier
          },
          SalesRep_ID: updatedData.SalesRep_ID ? {
            id: updatedData.SalesRep_ID.id,
            identifier: updatedData.SalesRep_ID.identifier
          } : null,
          AD_Client_ID: {
            id: updatedData.AD_Client_ID.id,
            identifier: updatedData.AD_Client_ID.identifier
          },
          Description: updatedData.Description || '',
          IsActive: updatedData.IsActive,
          Value: updatedData.Value || '',
          // Since API doesn't support LeadStatus table, we'll handle differently
          // LeadStatus: updatedData.LeadStatus ? {
          //   id: updatedData.LeadStatus.id,
          //   identifier: updatedData.LeadStatus.identifier
          // } : null,
          LeadSourceDescription: updatedData.LeadSourceDescription || '',
          LeadStatusDescription: updatedData.LeadStatusDescription || '',
          Comments: updatedData.Comments || '',
        };

        console.log('📦 Sending update payload:', JSON.stringify(payload, null, 2));
        
        const response = await crmApiService.updateLead(leadData.id, payload);
        console.log('✅ Lead updated successfully:', response);
        
        return response;
      } catch (error) {
        console.error('❌ Update lead error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('✅ Lead update successful, updating cache');
      
      // Invalidate and refetch leads data
      queryClient.invalidateQueries(['leads']);
      queryClient.invalidateQueries(['lead', leadData.id]);
      queryClient.invalidateQueries(['lead-statistics']);
      
      // Show success message
      Alert.alert('Success', 'Lead updated successfully!');
      
      // Navigate back
      if (navigation) {
        navigation.goBack();
      }
    },
    onError: (error) => {
      console.error('❌ Lead update failed:', error);
      
      let errorMessage = 'Failed to update lead. Please try again.';
      
      if (error.message === 'SESSION_EXPIRED') {
        errorMessage = 'Your session has expired. Please login again.';
        // Handle session expiry
        const logout = useAuthStore.getState().logout;
        if (logout) {
          logout();
        }
      } else if (error.message.includes('401')) {
        errorMessage = 'Unauthorized. Please check your permissions.';
      } else if (error.message.includes('404')) {
        errorMessage = 'Lead not found. It may have been deleted.';
      }
      
      Alert.alert('Error', errorMessage);
    },
  });

  const handleSave = () => {
    // Validate required fields
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name is required');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Validation Error', 'Email is required');
      return;
    }

    // Prepare data for update
    const updateData = {
      Name: name,
      EMail: email,
      Phone: phone,
      Phone2: phone2,
      Birthday: birthday,
      IsSalesLead: salesLead,
      IsVendorLead: vendorLead,
      BPName: companyName,
      AD_Org_ID: {
        id: organizationId,
        identifier: organizationLabel
      },
      SalesRep_ID: {
        id: salesRepId,
        identifier: salesRepLabel
      },
      AD_Client_ID: {
        id: businessPartnerId,
        identifier: businessPartnerLabel
      },
      Description: description,
      IsActive: active,
      Value: searchKey,
      LeadSourceDescription: leadSourceDesc,
      LeadStatusDescription: leadStatusDesc,
      Comments: comments,
    };

    console.log('💾 Saving lead data:', updateData);
    updateLeadMutation.mutate(updateData);
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
        <CustomHeader 
          title={'Leads Details'}
          onBack={() => navigation.goBack()}
        />
        
        <View style={{padding: '5%'}}>
          
          {/* BASIC INFO CARD */}
          <View style={styles.card}>
            <SectionHeader
              title="User Basic Info"
              expanded={showBasicInfo}
              toggle={() => setShowBasicInfo(!showBasicInfo)}
            />
            {showBasicInfo && (
              <View>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.inputWrapper}
                  placeholder="Enter Name"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="#777"
                />
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.inputWrapper}
                  placeholder="Enter Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor="#777"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Text style={styles.label}>Phone</Text>
                <TextInput
                  style={styles.inputWrapper}
                  placeholder="Enter Phone"
                  value={phone}
                  onChangeText={setPhone}
                  placeholderTextColor="#777"
                  keyboardType="phone-pad"
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
                  placeholder="Secondary Phone"
                  value={phone2}
                  onChangeText={setPhone2}
                  placeholderTextColor="#777"
                  keyboardType="phone-pad"
                />
                
                <Text style={styles.label}>Sales Lead</Text>
                <TouchableOpacity
                  onPress={() => setSalesLead(!salesLead)}
                  style={[
                    styles.inputWrapper,
                    styles.dropdownInput,
                  ]}>
                  <Text style={{color: '#000'}}>
                    {salesLead ? 'Yes' : 'No'}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={22}
                    color="#666"
                  />
                </TouchableOpacity>

                <Text style={styles.label}>Vendor Lead</Text>
                <TouchableOpacity
                  onPress={() => setVendorLead(!vendorLead)}
                  style={[
                    styles.inputWrapper,
                    styles.dropdownInput,
                  ]}>
                  <Text style={{color: '#000'}}>
                    {vendorLead ? 'Yes' : 'No'}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={22}
                    color="#666"
                  />
                </TouchableOpacity>

                <Text style={styles.label}>Business Partner</Text>
                <TouchableOpacity
                  onPress={() => setBpMenuVisible(true)}
                  style={[
                    styles.inputWrapper,
                    styles.dropdownInput,
                  ]}>
                  <Text style={{color: businessPartnerLabel ? '#000' : '#777'}}>
                    {businessPartnerLabel || 'Select Business Partner'}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={22}
                    color="#666"
                  />
                </TouchableOpacity>

                <Text style={styles.label}>Sales Representative</Text>
                <TouchableOpacity
                  onPress={() => setSalesRepMenuVisible(true)}
                  style={[
                    styles.inputWrapper,
                    styles.dropdownInput,
                  ]}>
                  <Text style={{color: salesRepLabel ? '#000' : '#777'}}>
                    {salesRepLabel || 'Select Sales Representative'}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={22}
                    color="#666"
                  />
                </TouchableOpacity>

                <Text style={styles.label}>Organization</Text>
                <TouchableOpacity
                  onPress={() => setOrgMenuVisible(true)}
                  style={[
                    styles.inputWrapper,
                    styles.dropdownInput,
                  ]}>
                  <Text style={{color: organizationLabel ? '#000' : '#777'}}>
                    {organizationLabel || 'Select Organization'}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={22}
                    color="#666"
                  />
                </TouchableOpacity>

                <Text style={styles.label}>Active</Text>
                <TouchableOpacity
                  onPress={() => setActive(!active)}
                  style={[
                    styles.inputWrapper,
                    styles.dropdownInput,
                  ]}>
                  <Text style={{color: '#000'}}>
                    {active ? 'Yes' : 'No'}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={22}
                    color="#666"
                  />
                </TouchableOpacity>

                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.inputWrapper, styles.textArea]}
                  placeholder="Enter description"
                  value={description}
                  onChangeText={setDescription}
                  placeholderTextColor="#777"
                  multiline={true}
                  numberOfLines={3}
                />

                <Text style={styles.label}>Search Key</Text>
                <TextInput
                  style={styles.inputWrapper}
                  placeholder="Enter search key"
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
                  placeholder="Enter company name"
                  value={companyName}
                  onChangeText={setCompanyName}
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
                <Text style={styles.label}>Lead Source</Text>
                <TouchableOpacity
                  onPress={() => setLeadSourceModalVisible(true)}
                  style={[
                    styles.inputWrapper,
                    styles.dropdownInput,
                  ]}>
                  <Text style={{color: leadSourceLabel ? '#000' : '#777'}}>
                    {leadSourceLabel || 'Select Lead Source'}
                  </Text>
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={22}
                      color="#666"
                    />
                </TouchableOpacity>

                <Text style={styles.label}>Lead Source Description</Text>
                <TextInput
                  style={[styles.inputWrapper, styles.textArea]}
                  placeholder="Enter lead source description"
                  value={leadSourceDesc}
                  onChangeText={setLeadSourceDesc}
                  placeholderTextColor="#777"
                  multiline={true}
                  numberOfLines={2}
                />

                <Text style={styles.label}>Lead Status</Text>
                <TouchableOpacity
                  onPress={() => setStatusMenuVisible(true)}
                  style={[
                    styles.inputWrapper,
                    styles.dropdownInput,
                  ]}>
                  <Text style={{color: statusLabel ? '#000' : '#777'}}>
                    {statusLabel || 'Select Lead Status'}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={22}
                    color="#666"
                  />
                </TouchableOpacity>

                <Text style={styles.label}>Lead Status Description</Text>
                <TextInput
                  style={[styles.inputWrapper, styles.textArea]}
                  placeholder="Enter lead status description"
                  value={leadStatusDesc}
                  onChangeText={setLeadStatusDesc}
                  placeholderTextColor="#777"
                  multiline={true}
                  numberOfLines={2}
                />

                <Text style={styles.label}>Comments</Text>
                <TextInput
                  style={[styles.inputWrapper, styles.textArea]}
                  placeholder="Enter comments"
                  value={comments}
                  onChangeText={setComments}
                  placeholderTextColor="#777"
                  multiline={true}
                  numberOfLines={3}
                />
              </View>
            )}
          </View>

          {/* SAVE BUTTON */}
          <TouchableOpacity 
            style={[
              styles.saveBtn,
              updateLeadMutation.isLoading && styles.saveBtnDisabled
            ]} 
            onPress={handleSave}
            disabled={updateLeadMutation.isLoading}
          >
            <Text style={styles.saveBtnTxt}>
              {updateLeadMutation.isLoading ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODALS */}
      {/* Business Partner Modal */}
      <Modal
        visible={bpMenuVisible}
        onDismiss={() => setBpMenuVisible(false)}
        transparent={true}
        animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Business Partner</Text>
            <ScrollView style={styles.modalScroll}>
              {businessPartnerOptions.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.optionItem,
                    businessPartnerId === item.id && styles.optionItemSelected
                  ]}
                  onPress={() => {
                    setBusinessPartnerId(item.id);
                    setBusinessPartnerLabel(item.identifier);
                    setBpMenuVisible(false);
                  }}>
                  <Text style={styles.optionText}>
                    {item.identifier}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setBpMenuVisible(false)}>
              <Text style={styles.cancelBtnTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sales Rep Modal */}
      <Modal
        visible={salesRepMenuVisible}
        onDismiss={() => setSalesRepMenuVisible(false)}
        transparent={true}
        animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Sales Representative</Text>
            <ScrollView style={styles.modalScroll}>
              {salesRepOptions.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.optionItem,
                    salesRepId === item.id && styles.optionItemSelected
                  ]}
                  onPress={() => {
                    setSalesRepId(item.id);
                    setSalesRepLabel(item.identifier);
                    setSalesRepMenuVisible(false);
                  }}>
                  <Text style={styles.optionText}>
                    {item.identifier}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setSalesRepMenuVisible(false)}>
              <Text style={styles.cancelBtnTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Organization Modal */}
      <Modal
        visible={orgMenuVisible}
        onDismiss={() => setOrgMenuVisible(false)}
        transparent={true}
        animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Organization</Text>
            <ScrollView style={styles.modalScroll}>
              {organizationOptions.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.optionItem,
                    organizationId === item.id && styles.optionItemSelected
                  ]}
                  onPress={() => {
                    setOrganizationId(item.id);
                    setOrganizationLabel(item.identifier);
                    setOrgMenuVisible(false);
                  }}>
                  <Text style={styles.optionText}>
                    {item.identifier}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setOrgMenuVisible(false)}>
              <Text style={styles.cancelBtnTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Lead Status Modal */}
      <Modal
        visible={statusMenuVisible}
        onDismiss={() => setStatusMenuVisible(false)}
        transparent={true}
        animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Lead Status</Text>
            <ScrollView style={styles.modalScroll}>
              {leadStatusOptions.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.optionItem,
                    statusId === item.id && styles.optionItemSelected
                  ]}
                  onPress={() => {
                    setStatusId(item.id);
                    setStatusLabel(item.identifier);
                    setStatusMenuVisible(false);
                  }}>
                  <Text style={styles.optionText}>
                    {item.identifier}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setStatusMenuVisible(false)}>
              <Text style={styles.cancelBtnTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Lead Source Modal */}
      <Modal
        visible={leadSourceModalVisible}
        onDismiss={() => setLeadSourceModalVisible(false)}
        transparent={true}
        animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Lead Source</Text>
            <ScrollView style={styles.modalScroll}>
              {leadSourceOptions.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.optionItem,
                    leadSourceId === item.id && styles.optionItemSelected
                  ]}
                  onPress={() => {
                    setLeadSourceId(item.id);
                    setLeadSourceLabel(item.identifier);
                    setLeadSourceModalVisible(false);
                  }}>
                  <Text style={styles.optionText}>
                    {item.identifier}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setLeadSourceModalVisible(false)}>
              <Text style={styles.cancelBtnTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default LeadsDetails;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f4f2f8'},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f2f8',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'K2D-Medium',
    color: '#555',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  label: {
    fontSize: 13,
    color: '#333',
    marginVertical: 8,
    fontFamily: 'K2D-SemiBold',
  },
  SectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16, 
    fontFamily: 'K2D-SemiBold', 
    color: '#000'
  },
  inputWrapper: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    color: '#000',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'K2D-Regular',
  },
  dropdownInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveBtn: {
    width: '100%',
    backgroundColor: '#2F4FE3',
    height: 50,
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  saveBtnDisabled: {
    backgroundColor: '#9aa7e3',
  },
  saveBtnTxt: {
    color: '#fff', 
    fontFamily: 'K2D-SemiBold', 
    fontSize: 16
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'K2D-Bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: 300,
  },
  optionItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionItemSelected: {
    backgroundColor: '#f0f7ff',
  },
  optionText: {
    color: '#333',
    fontSize: 15,
    fontFamily: 'K2D-Medium',
  },
  noOptionsText: {
    textAlign: 'center',
    color: '#999',
    fontFamily: 'K2D-Regular',
    paddingVertical: 20,
  },
  cancelBtn: {
    marginTop: 15,
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnTxt: {
    color: '#fff',
    fontFamily: 'K2D-SemiBold',
    fontSize: 15,
  },
});