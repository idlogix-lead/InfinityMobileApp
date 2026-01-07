// hooks/useAddLeadForm.js
import { useState, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAddLeadForm = () => {
  const [formData, setFormData] = useState({
    // Contact Info
    name: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    
    // Business Partner Info
    companyName: '',
    companyAddress: '',
    
    // Other Info
    phone2: '',
    birthday: '',
    salesLead: 'true',
    vendorLead: '',
    searchKey: '',
    city: '',
    leadSource: '',
    leadSourceID: 'CC',
    leadSourceDesc: '',
    leadStatusDesc: '',
    comments: '',
    campaignID: null,
    
    // Auto-filled fields
    salesRep: '',
    salesRepID: '',
    organization: '',
    organizationID: '',
    businessPartnerID: '1000000',
    countryID: '271',
    statusID: 'N',
    status: 'New',
  });

  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    contactInfo: true,
    businessPartnerInfo: false,
    otherInfo: false,
  });

  // Fetch user data on mount
  const initializeForm = useCallback(async () => {
    try {
      // Auto-fill sales rep from auth store
      const userName = useAuthStore.getState().userName;
      const userId = useAuthStore.getState().userId;
      
      if (userName) {
        setFormData(prev => ({
          ...prev,
          salesRep: userName,
          salesRepID: userId || '1000117',
        }));
      }

      // Get organization from AsyncStorage
      const orgData = await AsyncStorage.getItem('orgs');
      if (orgData) {
        const data = JSON.parse(orgData);
        const orgs = data.filter(org => !org.name.includes('*'));
        if (orgs.length > 0) {
          setFormData(prev => ({
            ...prev,
            organization: orgs[0].name,
            organizationID: orgs[0].id || '1000001',
          }));
        }
      }
    } catch (error) {
      console.log('Error initializing form:', error);
    }
  }, []);

  // Update form field
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  // Toggle section
  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  // Validation functions
  const validateEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validatePhone = useCallback((phone) => {
    const phoneRegex = /^\+\d{8,15}$/;
    return phoneRegex.test(phone);
  }, []);

  const validateDate = useCallback((date) => {
    if (!date) return true; // Optional field
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(date);
  }, []);

  // Validate required fields
  const validateRequiredFields = useCallback(() => {
    const requiredFields = ['name', 'email', 'phone', 'address', 'description', 'companyName', 'companyAddress'];
    const newErrors = {};

    requiredFields.forEach(field => {
      if (!formData[field]?.trim()) {
        newErrors[field] = 'Field required';
      }
    });

    // Email format validation
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone format validation
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Invalid phone format (use +92XXXXXXXXXX)';
    }

    // Birthday format validation
    if (formData.birthday && !validateDate(formData.birthday)) {
      newErrors.birthday = 'Invalid date format (use YYYY-MM-DD)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateEmail, validatePhone, validateDate]);

  // Copy contact info to business partner
  const copyContactToBusinessPartner = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      companyName: prev.name,
      companyAddress: prev.address,
    }));
  }, []);

  // Prepare form data for API submission
  const prepareSubmitData = useCallback(() => {
    const submitData = {
      // Core lead data
      Name: formData.name,
      EMail: formData.email,
      Phone: formData.phone,
      Phone2: formData.phone2 || '',
      IsSalesLead: formData.salesLead === 'true',
      IsVendorLead: formData.vendorLead === 'true',
      BPName: formData.companyName,
      SalesRep_ID: { id: formData.salesRepID || '1000117' },
      AD_Org_ID: { id: formData.organizationID || '1000001' },
      AD_Client_ID: { id: formData.businessPartnerID || '1000000' },
      Description: formData.description,
      IsActive: true,
      LeadStatus: { id: formData.statusID || 'N' },
      Value: formData.searchKey || '',
      LeadSource: { id: formData.leadSourceID || 'CC' },
      LeadSourceDescription: formData.leadSourceDesc || '',
      LeadStatusDescription: formData.leadStatusDesc || '',
      Comments: formData.comments || '',
      UserAddress1: formData.address,
      UserAddress2: formData.companyAddress,
      
      // Location data
      locationData: {
        AD_Client_ID: { id: formData.businessPartnerID || '1000000' },
        AD_Org_ID: { id: formData.organizationID || '1000001' },
        Address1: formData.address,
        City: formData.city || '',
        C_Country_ID: { id: formData.countryID || '271' },
        IsActive: true,
      },
    };

    // Add optional fields if they exist
    if (formData.birthday) {
      submitData.Birthday = formData.birthday;
    }

    if (formData.campaignID) {
      submitData.C_Campaign_ID = { id: formData.campaignID };
    }

    return submitData;
  }, [formData]);

  return {
    formData,
    errors,
    focusedField,
    expandedSections,
    updateField,
    setFocusedField,
    setErrors,
    toggleSection,
    validateRequiredFields,
    copyContactToBusinessPartner,
    prepareSubmitData,
    initializeForm,
  };
};