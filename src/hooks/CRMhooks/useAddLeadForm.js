// hooks/useAddLeadForm.js - COMPLETELY FIXED VERSION
// No more render-time state updates!

import { useState, useCallback, useEffect } from 'react';
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
    vendorLead: 'false',
    searchKey: '',
    city: '',
    leadSource: 'Cold Call',
    leadSourceID: 'CC',
    leadSourceDesc: '',
    leadStatusDesc: '',
    comments: '',
    campaignID: null,
    
    // Auto-filled fields - will be populated in useEffect
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

  // ============================================
  // FIXED: Initialize in useEffect, NOT in render
  // ============================================
  useEffect(() => {
    let isMounted = true;
    
    const initializeForm = async () => {
      try {
        // Auto-fill sales rep from auth store
        const authState = useAuthStore.getState();
        const userName = authState.userName;
        const userId = authState.userId;
        
        console.log('🔄 Initializing form with auth data:', { userName, userId });
        
        if (isMounted) {
          setFormData(prev => ({
            ...prev,
            salesRep: userName || '',
            salesRepID: userId || '1000117',
          }));
        }

        // Get organization from AsyncStorage
        const orgData = await AsyncStorage.getItem('orgs');
        if (orgData && isMounted) {
          const data = JSON.parse(orgData);
          const orgs = data.filter(org => !org.name.includes('*'));
          if (orgs.length > 0) {
            setFormData(prev => ({
              ...prev,
              organization: orgs[0].name,
              organizationID: orgs[0].id || '1000000',
            }));
          }
        }
      } catch (error) {
        if (isMounted) {
          console.log('Error initializing form:', error);
        }
      }
    };

    initializeForm();
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array = runs once on mount

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
    // More flexible phone validation
    if (!phone) return false;
    // Accept +92XXXXXXXXXX or 03XXXXXXXXX or other formats
    const phoneRegex = /^(\+\d{1,4})?\d{8,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
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

    // Secondary phone format validation (optional)
    if (formData.phone2 && formData.phone2.trim() && !validatePhone(formData.phone2)) {
      newErrors.phone2 = 'Invalid phone format';
    }

    // Birthday format validation
    if (formData.birthday && !validateDate(formData.birthday)) {
      newErrors.birthday = 'Invalid date format (use YYYY-MM-DD)';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      console.log('❌ Form validation errors:', newErrors);
      return false;
    }
    
    console.log('✅ Form validation passed');
    return true;
  }, [formData, validateEmail, validatePhone, validateDate]);

  // Copy contact info to business partner
  const copyContactToBusinessPartner = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      companyName: prev.name,
      companyAddress: prev.address,
    }));
  }, []);

  // Prepare form data for API submission - MATCH OLD VERSION STRUCTURE
  const prepareSubmitData = useCallback(() => {
    console.log('📦 Preparing submit data from form:', formData);
    
    // Location data (must match old version)
    const locationData = {
      AD_Client_ID: { id: formData.businessPartnerID || '1000000' },
      AD_Org_ID: { id: formData.organizationID || '1000000' },
      Address1: formData.address || '',
      City: formData.city || '',
      C_Country_ID: { id: formData.countryID || '271' },
      IsActive: true,
    };
    
    // Main lead data (must match old version)
    const submitData = {
      Name: formData.name || '',
      EMail: formData.email || '',
      Phone: formData.phone || '',
      Phone2: formData.phone2 || '',
      IsSalesLead: formData.salesLead === 'true',
      IsVendorLead: formData.vendorLead === 'true',
      BPName: formData.companyName || '',
      SalesRep_ID: { id: formData.salesRepID || '1000117' },
      AD_Org_ID: { id: formData.organizationID || '1000000' },
      AD_Client_ID: { id: formData.businessPartnerID || '1000000' },
      Description: formData.description || '',
      IsActive: true,
      LeadStatus: { id: formData.statusID || 'N' },
      Value: formData.searchKey || '',
      LeadSource: { id: formData.leadSourceID || 'CC' },
      LeadSourceDescription: formData.leadSourceDesc || '',
      LeadStatusDescription: formData.leadStatusDesc || '',
      Comments: formData.comments || '',
      UserAddress1: formData.address || '',
      UserAddress2: formData.companyAddress || '',
      locationData: locationData,
    };
    
    // Add optional fields if they exist
    if (formData.birthday) {
      submitData.Birthday = formData.birthday;
    }
    
    if (formData.campaignID) {
      submitData.C_Campaign_ID = { id: formData.campaignID };
    }
    
    console.log('📦 Final submit data:', submitData);
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
    // REMOVED: initializeForm - it's now internal only!
  };
};