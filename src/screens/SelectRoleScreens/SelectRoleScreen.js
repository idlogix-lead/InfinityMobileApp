import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useCompleteLogin } from '../../hooks/useAuth';
import colors from '../../constants/Colors';
import Ionicons from 'react-native-vector-icons/dist/Ionicons';

const { width } = Dimensions.get('window');

const SelectRoleScreen = ({ navigation, route }) => {
  const { clientId, clientName, token } = route.params;
  
  const [roleId, setRoleId] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  
  const completeLoginMutation = useCompleteLogin();
  const isLoading = useAuthStore(state => state.isLoading);
  const error = useAuthStore(state => state.error);
  const clearError = useAuthStore(state => state.clearError);
  
  const handleSubmit = async () => {
    if (!roleId.trim()) {
      Alert.alert('Required Field', 'Please enter Role ID');
      return;
    }
    if (!organizationId.trim()) {
      Alert.alert('Required Field', 'Please enter Organization ID');
      return;
    }
    if (!warehouseId.trim()) {
      Alert.alert('Required Field', 'Please enter Warehouse ID');
      return;
    }

    try {
      const parameters = {
        clientId,
        roleId,
        organizationId,
        warehouseId,
      };
      
      const result = await completeLoginMutation.mutateAsync(parameters);
      
      // Navigate to main app screen
      navigation.navigate('FingerPrintScreen', {
        token: result.token,
        tokenOk: result.userId?.toString(),
        roleId: roleId,
      });
      
    } catch (error) {
      console.log('Complete login error:', error);
    }
  };

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error]);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={colors.primary}
        translucent={false}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section with Client Info */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              disabled={isLoading}>
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <Ionicons name="shield-checkmark" size={50} color={colors.primary} />
            </View>
          </View>
          
          <View style={styles.titleContainer}>
            {/* Client Name as Main Title */}
            <Text style={styles.title}>{clientName}</Text>
            
            {/* Client ID below the title */}
            <View style={styles.clientIdContainer}>
              <Text style={styles.clientId}>Client ID: {clientId}</Text>
            </View>
        
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderContent}>
              <Ionicons name="key" size={24} color={colors.textInverse} />
              <Text style={styles.cardTitle}>Access Parameters</Text>
            </View>
          </View>

          {/* Card Body */}
          <View style={styles.cardBody}>
            {/* Role ID Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
              
                <Text style={styles.label}>Role ID *</Text>
              </View>
              <TextInput
                style={[styles.textInput, isLoading && styles.inputDisabled]}
                value={roleId}
                onChangeText={setRoleId}
                placeholder="Enter your Role ID"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
                editable={!isLoading}
                autoCapitalize="none"
                autoCorrect={false}
              />
             
            </View>
            
            {/* Organization ID Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
               
                <Text style={styles.label}>Organization ID *</Text>
              </View>
              <TextInput
                style={[styles.textInput, isLoading && styles.inputDisabled]}
                value={organizationId}
                onChangeText={setOrganizationId}
                placeholder="Enter your Organization ID"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
                editable={!isLoading}
                autoCapitalize="none"
                autoCorrect={false}
              />
              
            </View>
            
            {/* Warehouse ID Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
              
                <Text style={styles.label}>Warehouse ID *</Text>
              </View>
              <TextInput
                style={[styles.textInput, isLoading && styles.inputDisabled]}
                value={warehouseId}
                onChangeText={setWarehouseId}
                placeholder="Enter your Warehouse ID"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
                editable={!isLoading}
                autoCapitalize="none"
                autoCorrect={false}
              />
            
            </View>
          

            {/* Submit Button */}
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}>
                <View style={styles.buttonContent}>
                  {isLoading ? (
                    <Ionicons name="sync" size={20} color={colors.textInverse} style={styles.buttonSpinner} />
                  ) : (
                    <Ionicons name="checkmark-circle" size={20} color={colors.textInverse} />
                  )}
                  <Text style={styles.primaryButtonText}>
                    {isLoading ? 'Verifying...' : 'Complete Login'}
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.goBack()}
                disabled={isLoading}>
                <Text style={styles.secondaryButtonText}>Go Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

       
       
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 5,
  },
  headerTop: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.background,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 5,
  },
  logoBackground: {
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
    fontFamily: 'K2D-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textAlign: 'center',
  },
  clientIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  clientId: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: 'K2D-Regular',
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textTertiary,
    fontFamily: 'K2D-Regular',
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 20,
    elevation: 10,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardHeader: {
    backgroundColor: colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 50,
    justifyContent: 'center',
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textInverse,
    fontFamily: 'K2D-Bold',
    marginLeft: 10,
  },
  cardBody: {
    padding: 15,
  },
  inputGroup: {
    marginBottom: 5,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'K2D-SemiBold',
  },
  textInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderLight,
    height: 50,
    paddingHorizontal: 18,
    fontSize: 16,
    color: colors.textPrimary,
    fontFamily: 'K2D-Regular',
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputDisabled: {
    backgroundColor: colors.surfaceDisabled,
    borderColor: colors.border,
  },
 
 
  buttonGroup: {
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    height: 60,
    borderRadius: 14,
    elevation: 6,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  buttonSpinner: {
    animation: 'spin 1s linear infinite',
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'K2D-Bold',
    marginLeft: 12,
  },
  secondaryButton: {
    backgroundColor: colors.background,
    height: 50,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'K2D-SemiBold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 25,
    paddingHorizontal: 20,
  },
 
});

export default SelectRoleScreen;