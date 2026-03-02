// screens/AddLeads.js - COMPLETE FIXED VERSION

import React, { useState, useMemo, useEffect } from 'react'; // ADDED useEffect
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StatusBar,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomHeader from '../../components/CustomHeader';
import { useAddLeadForm } from '../../hooks/CRMhooks/useAddLeadForm';
import { useCreateLead, useSalesRepresentatives } from '../../hooks/CRMhooks/useCRM';
import FormSection from '../../components/AddLead/FormSection';
import { FormInput, PhoneInput } from '../../components/AddLead/LeadForm';
import SelectPicker from '../../components/AddLead/SelectPicker';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AddLeads = () => {
  const navigation = useNavigation();
  
  // ADDED: State to track if component is mounted
  const [isMounted, setIsMounted] = useState(false);

  // ADDED: useEffect to set mounted state after first render
  useEffect(() => {
    setIsMounted(true);
    return () => {
      // Cleanup if needed
    };
  }, []);

  // Use custom form hook - this should now handle initialization internally
  const {
    formData,
    errors,
    focusedField,
    expandedSections,
    updateField,
    setFocusedField,
    toggleSection,
    validateRequiredFields,
    copyContactToBusinessPartner,
    prepareSubmitData,
  } = useAddLeadForm();

  const createLeadMutation = useCreateLead();
  
  // FIXED: Pass enabled flag to useSalesRepresentatives
  // The query will only run after the component has mounted (isMounted = true)
  const { data: salesReps = [], isLoading: loadingSalesReps } = useSalesRepresentatives(isMounted);

  // State for searchable sales rep picker
  const [showSalesRepModal, setShowSalesRepModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Status options
  const leadStatusOptions = [
    { label: 'New', value: 'N' },
    { label: 'Working', value: 'W' },
    { label: 'Expired', value: 'E' },
    { label: 'Converted', value: 'C' },
  ];

  // Lead source options
  const leadSourceOptions = [
    { label: 'Cold Call', value: 'CC' },
    { label: 'Existing Customer', value: 'EC' },
    { label: 'Self Generated', value: 'SG' },
    { label: 'Employee', value: 'EM' },
    { label: 'Partner', value: 'PA' },
    { label: 'Public Relations', value: 'PR' },
    { label: 'Direct Mail', value: 'DM' },
    { label: 'Conference', value: 'CO' },
    { label: 'Trade Show', value: 'TS' },
    { label: 'Web Site', value: 'WS' },
    { label: 'Word of mouth', value: 'WM' },
    { label: 'Email', value: 'EM' },
    { label: 'Campaign', value: 'CA' },
    { label: 'Other', value: 'OT' },
  ];

  // Filter sales reps based on search query
  const filteredSalesReps = useMemo(() => {
    if (!searchQuery.trim()) {
      return salesReps;
    }
    
    const query = searchQuery.toLowerCase();
    return salesReps.filter(rep => 
      rep.Name && rep.Name.toLowerCase().includes(query)
    );
  }, [salesReps, searchQuery]);

  // Get selected sales rep name
  const selectedRepName = useMemo(() => {
    if (!formData.salesRep) return '';
    const rep = salesReps.find(r => r.id === formData.salesRep);
    return rep ? rep.Name : '';
  }, [formData.salesRep, salesReps]);

  // Handle sales rep selection
  const handleSelectSalesRep = (rep) => {
    updateField('salesRep', rep.id);
    setShowSalesRepModal(false);
    setSearchQuery('');
  };

  // Clear selected sales rep
  const handleClearSalesRep = () => {
    updateField('salesRep', '');
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    if (!validateRequiredFields()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form.');
      return;
    }

    // Validate sales rep is selected
    if (!formData.salesRep) {
      Alert.alert('Validation Error', 'Please select a Sales Representative.');
      return;
    }

    try {
      // Prepare data
      const submitData = prepareSubmitData();
      
      console.log('📦 Submitting lead data:', JSON.stringify(submitData, null, 2));
      
      // Submit via mutation
      await createLeadMutation.mutateAsync(submitData);
      
      // Success
      Alert.alert(
        'Success',
        'Lead created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('❌ Lead creation error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to create lead. Please try again.'
      );
    }
  };

  // Loading state
  const isLoading = createLeadMutation.isLoading || loadingSalesReps;

  // Render sales rep item
  const renderSalesRepItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.repItem,
        formData.salesRep === item.id && styles.selectedRepItem,
      ]}
      onPress={() => handleSelectSalesRep(item)}
    >
      <View style={styles.repItemContent}>
        <Text style={styles.repName}>{item.Name}</Text>
        {item.EMail && (
          <Text style={styles.repEmail}>{item.EMail}</Text>
        )}
      </View>
      {formData.salesRep === item.id && (
        <Icon name="check" size={20} color="#2F4FE3" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <CustomHeader title="Add Lead" />
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2F4FE3" />
          <Text style={styles.loadingText}>
            {createLeadMutation.isLoading ? 'Creating lead...' : 'Loading data...'}
          </Text>
        </View>
      )}
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.formWrapper}
        contentContainerStyle={styles.formContent}
      >
        {/* Contact Info Section */}
        <FormSection
          title="Contact Info"
          expanded={expandedSections.contactInfo}
          onToggle={() => toggleSection('contactInfo')}
        >
          <FormInput
            label="Name"
            required
            value={formData.name}
            onChangeText={(value) => updateField('name', value)}
            placeholder="Enter name"
            error={errors.name}
            focused={focusedField === 'name'}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
          />
          
          <FormInput
            label="Email"
            required
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            focused={focusedField === 'email'}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
          />
          
          <PhoneInput
            label="Phone"
            required
            value={formData.phone}
            onChangeText={(value) => updateField('phone', value)}
            placeholder="Enter phone number"
            error={errors.phone}
            focused={focusedField === 'phone'}
            onFocus={() => setFocusedField('phone')}
            onBlur={() => setFocusedField(null)}
            defaultCountryCode="+92"
          />
          
          <FormInput
            label="Address"
            required
            value={formData.address}
            onChangeText={(value) => updateField('address', value)}
            placeholder="Enter address"
            multiline
            numberOfLines={3}
            error={errors.address}
            focused={focusedField === 'address'}
            onFocus={() => setFocusedField('address')}
            onBlur={() => setFocusedField(null)}
          />
          
          {/* Searchable Sales Representative Picker */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Assigned To (Sales Representative)*</Text>
            <TouchableOpacity
              style={[
                styles.salesRepSelector,
                errors.salesRep && styles.selectorError,
              ]}
              onPress={() => setShowSalesRepModal(true)}
            >
              {selectedRepName ? (
                <View style={styles.selectedRepContainer}>
                  <Text style={styles.selectedRepText}>{selectedRepName}</Text>
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleClearSalesRep();
                    }}
                  >
                    <Icon name="close" size={18} color="#666" />
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.placeholderText}>Select Sales Representative</Text>
              )}
              <Icon name="arrow-drop-down" size={24} color="#666" />
            </TouchableOpacity>
            {errors.salesRep && (
              <Text style={styles.errorText}>{errors.salesRep}</Text>
            )}
          </View>
          
          <FormInput
            label="Description"
            required
            value={formData.description}
            onChangeText={(value) => updateField('description', value)}
            placeholder="Enter description"
            multiline
            numberOfLines={4}
            error={errors.description}
            focused={focusedField === 'description'}
            onFocus={() => setFocusedField('description')}
            onBlur={() => setFocusedField(null)}
          />
        </FormSection>

        {/* Business Partner Info Section */}
        <FormSection
          title="Business Partner Info"
          expanded={expandedSections.businessPartnerInfo}
          onToggle={() => toggleSection('businessPartnerInfo')}
        >
          <FormInput
            label="Company Name"
            required
            value={formData.companyName}
            onChangeText={(value) => updateField('companyName', value)}
            placeholder="Enter company name or copy from contact"
            icon="content-copy"
            onIconPress={copyContactToBusinessPartner}
            error={errors.companyName}
            focused={focusedField === 'companyName'}
            onFocus={() => setFocusedField('companyName')}
            onBlur={() => setFocusedField(null)}
          />
          
          <FormInput
            label="Company Address"
            required
            value={formData.companyAddress}
            onChangeText={(value) => updateField('companyAddress', value)}
            placeholder="Enter company address or copy from contact"
            icon="content-copy"
            onIconPress={copyContactToBusinessPartner}
            multiline
            numberOfLines={3}
            error={errors.companyAddress}
            focused={focusedField === 'companyAddress'}
            onFocus={() => setFocusedField('companyAddress')}
            onBlur={() => setFocusedField(null)}
          />
        </FormSection>

        {/* Other Info Section */}
        <FormSection
          title="Other Info"
          expanded={expandedSections.otherInfo}
          onToggle={() => toggleSection('otherInfo')}
        >
          <PhoneInput
            label="Secondary Phone"
            value={formData.phone2}
            onChangeText={(value) => updateField('phone2', value)}
            placeholder="Enter secondary phone"
            error={errors.phone2}
            focused={focusedField === 'phone2'}
            onFocus={() => setFocusedField('phone2')}
            onBlur={() => setFocusedField(null)}
            defaultCountryCode="+92"
          />
          
          <FormInput
            label="Birthday"
            value={formData.birthday}
            onChangeText={(value) => updateField('birthday', value)}
            placeholder="YYYY-MM-DD"
            error={errors.birthday}
            focused={focusedField === 'birthday'}
            onFocus={() => setFocusedField('birthday')}
            onBlur={() => setFocusedField(null)}
          />
          
          <FormInput
            label="City"
            value={formData.city}
            onChangeText={(value) => updateField('city', value)}
            placeholder="Enter city"
            focused={focusedField === 'city'}
            onFocus={() => setFocusedField('city')}
            onBlur={() => setFocusedField(null)}
          />
          
          <FormInput
            label="Search Key"
            value={formData.searchKey}
            onChangeText={(value) => updateField('searchKey', value)}
            placeholder="Enter search key"
            focused={focusedField === 'searchKey'}
            onFocus={() => setFocusedField('searchKey')}
            onBlur={() => setFocusedField(null)}
          />

          <SelectPicker
            label="Lead Source"
            value={formData.leadSourceID}
            options={leadSourceOptions}
            onSelect={(option) => {
              updateField('leadSource', option.label);
              updateField('leadSourceID', option.value);
            }}
            placeholder="Select lead source"
          />
          
          <FormInput
            label="Lead Source Description"
            value={formData.leadSourceDesc}
            onChangeText={(value) => updateField('leadSourceDesc', value)}
            placeholder="Enter lead source description"
            multiline
            numberOfLines={3}
            focused={focusedField === 'leadSourceDesc'}
            onFocus={() => setFocusedField('leadSourceDesc')}
            onBlur={() => setFocusedField(null)}
          />

          <SelectPicker
            label="Status"
            value={formData.statusID}
            options={leadStatusOptions}
            onSelect={(option) => {
              updateField('status', option.label);
              updateField('statusID', option.value);
            }}
            placeholder="Select status"
          />
          
          <FormInput
            label="Lead Status Description"
            value={formData.leadStatusDesc}
            onChangeText={(value) => updateField('leadStatusDesc', value)}
            placeholder="Enter status description"
            multiline
            numberOfLines={3}
            focused={focusedField === 'leadStatusDesc'}
            onFocus={() => setFocusedField('leadStatusDesc')}
            onBlur={() => setFocusedField(null)}
          />
          
          <FormInput
            label="Comments"
            value={formData.comments}
            onChangeText={(value) => updateField('comments', value)}
            placeholder="Enter comments"
            multiline
            numberOfLines={4}
            focused={focusedField === 'comments'}
            onFocus={() => setFocusedField('comments')}
            onBlur={() => setFocusedField(null)}
          />

          {/* Boolean fields */}
          <View style={styles.booleanContainer}>
            <View style={styles.booleanField}>
              <Text style={styles.booleanLabel}>Sales Lead</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.salesLead}
                  onValueChange={(value) => updateField('salesLead', value)}
                  style={styles.smallPicker}
                >
                  <Picker.Item label="True" value="true" />
                  <Picker.Item label="False" value="false" />
                </Picker>
              </View>
            </View>
            
            <View style={styles.booleanField}>
              <Text style={styles.booleanLabel}>Vendor Lead</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.vendorLead}
                  onValueChange={(value) => updateField('vendorLead', value)}
                  style={styles.smallPicker}
                >
                  <Picker.Item label="True" value="true" />
                  <Picker.Item label="False" value="false" />
                </Picker>
              </View>
            </View>
          </View>
        </FormSection>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (createLeadMutation.isLoading || !formData.salesRep) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={createLeadMutation.isLoading || !formData.salesRep}
        >
          <Text style={styles.submitButtonText}>
            {createLeadMutation.isLoading ? 'Creating...' : 'Create Lead'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Sales Representative Selection Modal */}
      <Modal
        visible={showSalesRepModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowSalesRepModal(false);
          setSearchQuery('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Sales Representative</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowSalesRepModal(false);
                  setSearchQuery('');
                }}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={true}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearSearchButton}
                >
                  <Icon name="close" size={18} color="#666" />
                </TouchableOpacity>
              )}
            </View>
            
            {/* Sales Representatives List */}
            <FlatList
              data={filteredSalesReps}
              renderItem={renderSalesRepItem}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="person-off" size={50} color="#ccc" />
                  <Text style={styles.emptyText}>
                    {searchQuery.trim() 
                      ? `No sales representatives found for "${searchQuery}"`
                      : 'No sales representatives available'}
                  </Text>
                </View>
              }
              style={styles.repList}
              contentContainerStyle={styles.repListContent}
            />
            
            {/* Footer */}
            <View style={styles.modalFooter}>
              <Text style={styles.footerText}>
                {filteredSalesReps.length} of {salesReps.length} sales representatives
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEBEB',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
    fontFamily: 'K2D-Medium',
  },
  formWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  formContent: {
    padding: 20,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    color: '#333',
    fontFamily: 'K2D-SemiBold',
    fontSize: 14,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    
    // Elevation for Android
    elevation: 3,
  },
  picker: {
    height: 48,
    color: '#333',
  },
  smallPicker: {
    height: 48,
    color: '#333',
    fontSize: 14,
  },
  booleanContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  booleanField: {
    flex: 1,
    marginRight: 8,
  },
  booleanLabel: {
    color: '#333',
    fontFamily: 'K2D-SemiBold',
    fontSize: 14,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  submitButton: {
    backgroundColor: '#2F4FE3',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    
    // Shadow for iOS
    shadowColor: '#2F4FE3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    
    // Elevation for Android
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#8fa3e3',
    shadowOpacity: 0.2,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'K2D-SemiBold',
    letterSpacing: 0.5,
  },
  bottomSpacing: {
    height: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: 'K2D-Regular',
  },
  
  // Sales Rep Selector Styles
  salesRepSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    
    // Elevation for Android
    elevation: 3,
  },
  selectorError: {
    borderColor: '#FF3B30',
    shadowColor: '#FF3B30',
  },
  selectedRepContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedRepText: {
    fontSize: 15,
    color: '#333',
    fontFamily: 'K2D-Regular',
  },
  placeholderText: {
    fontSize: 15,
    color: '#999',
    fontFamily: 'K2D-Regular',
    flex: 1,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    
    // Elevation for Android
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'K2D-SemiBold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    
    // Elevation for Android
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    fontFamily: 'K2D-Regular',
    color: '#333',
  },
  clearSearchButton: {
    padding: 4,
  },
  repList: {
    maxHeight: 400,
  },
  repListContent: {
    paddingBottom: 16,
  },
  repItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedRepItem: {
    backgroundColor: '#f0f5ff',
  },
  repItemContent: {
    flex: 1,
  },
  repName: {
    fontSize: 15,
    fontFamily: 'K2D-SemiBold',
    color: '#333',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'K2D-Regular',
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    fontFamily: 'K2D-Regular',
    color: '#666',
  },
});

export default AddLeads;