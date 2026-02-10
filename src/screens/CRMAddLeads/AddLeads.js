// screens/AddLeads.js
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomHeader from '../../components/CustomHeader';
import { useAddLeadForm } from '../../hooks/CRMhooks/useAddLeadForm';
import { useCreateLead, useCampaigns } from '../../services/CRMAPI/useLead';
import FormSection from '../../components/AddLead/FormSection';
import FormInput from '../../components/AddLead/LeadForm';
import SelectPicker from '../../components/AddLead/SelectPicker';
import { Picker } from '@react-native-picker/picker';

const AddLeads = () => {
  const navigation = useNavigation();
  
  // Use custom form hook
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
    initializeForm,
  } = useAddLeadForm();

  // Use React Query mutations
  const createLeadMutation = useCreateLead();
  const { data: campaigns = [], isLoading: loadingCampaigns } = useCampaigns();

  // Status options
  const leadStatusOptions = [
    { label: 'New', value: 'N' },
    { label: 'Working', value: 'W' },
    { label: 'Expire', value: 'E' },
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

  // Initialize form on mount
  useEffect(() => {
    initializeForm();
  }, [initializeForm]);

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    if (!validateRequiredFields()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form.');
      return;
    }

    try {
      // Prepare data
      const submitData = prepareSubmitData();
      
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
      console.error('Lead creation error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to create lead. Please try again.'
      );
    }
  };

  // Loading state
  const isLoading = createLeadMutation.isLoading || loadingCampaigns;

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <CustomHeader title="Add Lead" />
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2F4FE3" />
          <Text style={styles.loadingText}>Creating lead...</Text>
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
          
          <FormInput
            label="Phone"
            required
            value={formData.phone}
            onChangeText={(value) => updateField('phone', value)}
            placeholder="+92XXXXXXXXXX"
            keyboardType="phone-pad"
            error={errors.phone}
            focused={focusedField === 'phone'}
            onFocus={() => setFocusedField('phone')}
            onBlur={() => setFocusedField(null)}
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
          
          <FormInput
            label="Assigned To"
            value={formData.salesRep}
            editable={false}
            placeholder="Auto-filled from your account"
          />
          
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
          <FormInput
            label="Secondary Phone"
            value={formData.phone2}
            onChangeText={(value) => updateField('phone2', value)}
            placeholder="+92XXXXXXXXXX"
            keyboardType="phone-pad"
            error={errors.phone2}
            focused={focusedField === 'phone2'}
            onFocus={() => setFocusedField('phone2')}
            onBlur={() => setFocusedField(null)}
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

          {/* Campaign Picker */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Campaign</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.campaignID}
                onValueChange={(value) => updateField('campaignID', value)}
                style={styles.picker}
              >
                <Picker.Item label="Select Campaign" value={null} />
                {campaigns.map((campaign) => (
                  <Picker.Item
                    key={campaign.id}
                    label={campaign.Name}
                    value={campaign.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Lead Source Picker */}
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

          {/* Status Picker */}
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
                  <Picker.Item label="Select" value="" />
                  <Picker.Item label="True" value="true" />
                  <Picker.Item label="False" value="false" />
                </Picker>
              </View>
            </View>
          </View>

          {/* Read-only fields */}
          <FormInput
            label="Organization"
            value={formData.organization}
            editable={false}
          />
          
          <FormInput
            label="Is Active"
            value="True"
            editable={false}
          />
        </FormSection>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            createLeadMutation.isLoading && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={createLeadMutation.isLoading}
        >
          <Text style={styles.submitButtonText}>
            {createLeadMutation.isLoading ? 'Creating...' : 'Create Lead'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formContent: {
    padding: 16,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    color: '#000',
    fontFamily: 'K2D-SemiBold',
    fontSize: 14,
    marginBottom: 6,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
  },
  picker: {
    height: 40,
    color: '#000',
  },
  smallPicker: {
    height: 40,
    color: '#000',
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
    color: '#000',
    fontFamily: 'K2D-SemiBold',
    fontSize: 14,
    marginBottom: 6,
  },
  submitButton: {
    backgroundColor: '#2F4FE3',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#8fa3e3',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'K2D-SemiBold',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default AddLeads;