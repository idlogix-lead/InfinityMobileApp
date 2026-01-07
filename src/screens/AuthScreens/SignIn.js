import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TextInput,
  TouchableOpacity,
  BackHandler,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { CheckBox } from 'react-native-elements';
import Ionicons from 'react-native-vector-icons/dist/Ionicons';

// Custom hooks and stores
import { useAuthStore } from '../../store/authStore';
import { useBasicLogin } from '../../hooks/useAuth';
import colors from '../../constants/Colors';

const { height, width } = Dimensions.get('window');

const SignIn = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedValue, setSelectedValue] = useState('English');
  const [checkedRem, setCheckedRem] = useState(true);
  
  const languageOptions = [
    { label: 'English', value: 'English' },
  ];

  const basicLoginMutation = useBasicLogin();
  const isLoading = useAuthStore(state => state.isLoading);
  const error = useAuthStore(state => state.error);
  
  const setLoading = useAuthStore(state => state.setLoading);
  const clearError = useAuthStore(state => state.clearError);
  
  // Load saved credentials on mount
  useEffect(() => {
    const { userName: savedUserName, password: savedPassword } = useAuthStore.getState();
    
    if (savedUserName) {
      setUserName(savedUserName);
    }
    if (savedPassword) {
      setPassword(savedPassword);
      // Auto-check remember me if password is saved
      setCheckedRem(true);
    }
  }, []);

  const handleLogin = async () => {
    if (!userName.trim() || !password.trim()) {
      Alert.alert('Validation', 'Please enter username and password');
      return;
    }

    try {
      // Store credentials if "Remember Me" is checked
      if (checkedRem) {
        // Store credentials
        useAuthStore.getState().setCredentials(userName, password);
      } else {
        // Clear stored credentials
        useAuthStore.getState().setCredentials(null, null);
      }

      // Step 1: Basic login
      const loginData = await basicLoginMutation.mutateAsync({ userName, password });
      
      // Extract client information
      const clients = loginData.clients || [];
      
      if (clients.length === 0) {
        Alert.alert('Login Failed', 'No clients available for this user');
        return;
      }
      
      // Store login data without affecting credentials
      useAuthStore.getState().setLoginData({
        token: loginData.token,
        userId: userName, // Temporary ID
        clients: clients,
        ...(clients.length === 1 ? {
          clientId: clients[0].id,
          clientName: clients[0].name,
        } : {})
      });
      
      // Navigate based on number of clients
      if (clients.length === 1) {
        navigation.navigate('SelectRoleScreen');
      } else {
        navigation.navigate('SelectClientScreen', {
          clients: clients,
        });
      }
      
    } catch (error) {
      Alert.alert('Login Failed', error.message || 'Please check your credentials');
    }
  };

  useEffect(() => {
    // Clear error on focus
    const unsubscribe = navigation.addListener('focus', () => {
      clearError();
    });

    const backAction = () => {
      navigation.navigate('WelcomeScreen');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => {
      unsubscribe();
      backHandler.remove();
    };
  }, [navigation]);

  // Show error alert if exists
  useEffect(() => {
    if (error) {
      Alert.alert('Login Error', error);
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
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.settingsIconButton}
              onPress={() => navigation.navigate('WelcomeScreen')}
              disabled={isLoading}>
              <Ionicons name="settings-outline" size={26} color={colors.textInverse} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <Image
                source={require('../../asserts/WelcomeSrn/infinityerpiconillustrator23.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>
          
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue to Infinity ERP
            </Text>
          </View>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderContent}>
              <Text style={styles.cardTitle}>Login</Text>
            </View>
          </View>

          {/* Card Body */}
          <View style={styles.cardBody}>
      
            {/* Username Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.labelIcon}>👤</Text>
                <Text style={styles.label}>Username</Text>
              </View>
              <TextInput
                onChangeText={setUserName}
                value={userName}
                placeholder="Enter your username"
                placeholderTextColor={colors.textTertiary}
                style={styles.textInput}
                editable={!isLoading}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.labelIcon}>🔒</Text>
                <Text style={styles.label}>Password</Text>
              </View>
              <TextInput
                onChangeText={setPassword}
                value={password}
                placeholder="Enter your password"
                placeholderTextColor={colors.textTertiary}
                style={styles.textInput}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            {/* Language Picker */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.labelIcon}>🌐</Text>
                <Text style={styles.label}>Language</Text>
              </View>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedValue}
                  onValueChange={setSelectedValue}
                  style={styles.picker}
                  dropdownIconColor={colors.primary}
                  enabled={!isLoading}
                >
                  {languageOptions.map(option => (
                    <Picker.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                      color={colors.textPrimary}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Options Section */}
            <View style={styles.optionsContainer}>
              <View style={styles.optionsRow}>
                <View style={styles.optionItem}>
                  <CheckBox
                    checked={checkedRem}
                    onPress={() => !isLoading && setCheckedRem(!checkedRem)}
                    containerStyle={styles.checkbox}
                    checkedIcon={
                      <Text style={styles.checkIcon}>✓</Text>
                    }
                    uncheckedIcon={<View style={styles.uncheckedIcon} />}
                  />
                  <Text style={styles.optionText}>Remember me</Text>
                </View>
              </View>
            </View>

            {/* Login Button */}
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}>
                <View style={styles.buttonContent}>
                  {isLoading ? (
                    <Text style={styles.primaryButtonText}>Logging in...</Text>
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>Sign In</Text>
                      <Text style={styles.buttonArrow}>→</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Secure • Reliable • Enterprise Ready
          </Text>
          <Text style={styles.footerVersion}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignIn;

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
    justifyContent: 'flex-end',
    marginBottom: 5,
  },
  settingsIconButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary,
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
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '70%',
    height: '70%',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
    fontFamily: 'K2D-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: 'K2D-Regular',
    opacity: 0.9,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 10,
    elevation: 10,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardHeader: {
    backgroundColor: colors.textDisabled,
    paddingVertical: 5,
    paddingHorizontal: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 60,
    justifyContent: 'center',
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: 'K2D-Bold',
  },
  cardBody: {
    padding: 15,
  },
  inputGroup: {
    marginBottom: 10,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  labelIcon: {
    fontSize: 18,
    marginRight: 10,
    color: colors.primary,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'K2D-SemiBold',
  },
  textInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderLight,
    height: 56,
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
  pickerContainer: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  picker: {
    height: 56,
    color: colors.primary,
    fontFamily: 'K2D-Regular',
    fontSize: 16,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0,
    marginRight: 8,
  },
  checkIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primaryDark,
  },
  uncheckedIcon: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.inputBackground,
  },
  optionText: {
    fontSize: 15,
    color: colors.primary,
    fontFamily: 'K2D-Regular',
  },
  buttonGroup: {
    marginTop: 5,
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
    marginHorizontal: 30,
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
  primaryButtonText: {
    color: colors.textInverse,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'K2D-Bold',
  },
  buttonArrow: {
    color: colors.textInverse,
    fontSize: 24,
    marginLeft: 12,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
    fontFamily: 'K2D-Regular',
  },
  footerVersion: {
    fontSize: 12,
    color: colors.textPrimary,
    fontFamily: 'K2D-Regular',
  },
});