// hooks/CRMhooks/useLeadActions.js
import { Alert, Linking } from 'react-native';
import { useCallback } from 'react';

export const useLeadActions = () => {
  const handleMail = useCallback((email) => {
    if (!email) {
      Alert.alert('Error', 'Email address not found.');
      return;
    }
    Linking.openURL(`mailto:${email}`).catch(() => {
      Alert.alert('Error', 'Cannot open email app.');
    });
  }, []);

  const handlePhone = useCallback((phone) => {
    if (!phone) {
      Alert.alert('Error', 'Phone number not found.');
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Error', 'Cannot open phone app.');
    });
  }, []);

  const handleWhatsApp = useCallback((phone) => {
    if (!phone) {
      Alert.alert('Error', 'WhatsApp number not found.');
      return;
    }
    
    let formattedPhone = phone.trim().replace(/[^0-9]/g, '');
    
    if (formattedPhone.startsWith('92')) {
      // Already correct format
    } else if (formattedPhone.startsWith('0')) {
      formattedPhone = '92' + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('0092')) {
      formattedPhone = formattedPhone.replace('0092', '92');
    } else {
      Alert.alert('Error', 'Invalid phone number format.');
      return;
    }
    
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}`;
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert('Error', 'Cannot open WhatsApp.');
    });
  }, []);

  return {
    handleMail,
    handlePhone,
    handleWhatsApp,
  };
};