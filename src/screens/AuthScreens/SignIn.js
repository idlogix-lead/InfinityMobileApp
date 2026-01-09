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
import { useBasicLogin, useCompleteLogin } from '../../hooks/useAuth';
import colors from '../../constants/Colors';


const SignIn = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedValue, setSelectedValue] = useState('English');
  const [checkedRem, setCheckedRem] = useState(true);
  const [checkedUseSavedRole, setCheckedUseSavedRole] = useState(true); // Default to CHECKED
  
  // Responsive scaling factors
  const scaleWidth = (size) => (width / 375) * size;
  const scaleHeight = (size) => (height / 812) * size;
  const isLandscape = width > height;
  const isTablet = width >= 768;
  
  const languageOptions = [
    { label: 'English', value: 'English' },
  ];

  const basicLoginMutation = useBasicLogin();
  const completeLoginMutation = useCompleteLogin();
  const isLoading = useAuthStore(state => state.isLoading);
  const error = useAuthStore(state => state.error);
  
  const setLoading = useAuthStore(state => state.setLoading);
  const clearError = useAuthStore(state => state.clearError);
  const hasCompleteRoleData = useAuthStore(state => state.hasCompleteRoleData);
  const savedRoleContext = useAuthStore(state => state.savedRoleContext);
  
  // Load saved credentials on mount
  useEffect(() => {
    const state = useAuthStore.getState();
    const { userName: savedUserName, password: savedPassword } = state;
    
    if (savedUserName) {
      setUserName(savedUserName);
    }
    if (savedPassword) {
      setPassword(savedPassword);
      // Auto-check remember me if password is saved
      setCheckedRem(true);
    }
    
    // Default: "Select a role" is CHECKED (true)
    // This means user WILL go to role selection by default
  }, []);

  const handleLogin = async () => {
    if (!userName.trim() || !password.trim()) {
      Alert.alert('Validation', 'Please enter username and password');
      return;
    }

    try {
      // Store credentials if "Remember Me" is checked
      if (checkedRem) {
        useAuthStore.getState().setCredentials(userName, password);
      } else {
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
      
      // Store login data
      useAuthStore.getState().setLoginData({
        token: loginData.token,
        userId: userName, // Temporary ID
        clients: clients,
        ...(clients.length === 1 ? {
          clientId: clients[0].id,
          clientName: clients[0].name,
        } : {})
      });
      
      // ============================================
      // NEW LOGIC:
      // ============================================
      // If "Select a role" is CHECKED → Go to role selection
      // If "Select a role" is UNCHECKED → Skip role selection and go to main app
      // ============================================
      
      if (checkedUseSavedRole) {
        // User wants to select a role → Go to role selection
        console.log('📋 "Select a role" is CHECKED - Proceeding to role selection');
        proceedToRoleSelection(clients);
      } else {
        // User does NOT want to select a role → Try to use saved role or skip
        console.log('🚀 "Select a role" is UNCHECKED - Trying to skip role selection');
        
        // Check if we have saved role data
        const state = useAuthStore.getState();
        const hasSavedRole = state.hasCompleteRoleData();
        
        if (hasSavedRole) {
          // Use saved role data
          console.log('✅ Found saved role data - Using it');
          
          setLoading(true);
          try {
            const parameters = {
              clientId: state.clientId?.toString(),
              roleId: state.roleId?.toString(),
              organizationId: state.organizationId?.toString(),
              warehouseId: state.warehouseId?.toString(),
              language: 'en_US',
            };
            
            console.log('📋 Using saved role parameters:', parameters);
            
            const response = await completeLoginMutation.mutateAsync(parameters);
            
            console.log('✅ Complete login successful with saved role');
            
            // Store complete auth data
            useAuthStore.getState().setCompleteAuthData({
              token: response.token,
              extractedUserId: response.extractedUserId,
              clientId: state.clientId,
              roleId: state.roleId,
              roleName: state.roleName,
              organizationId: state.organizationId,
              organizationName: state.organizationName,
              warehouseId: state.warehouseId,
              warehouseName: state.warehouseName,
            });
            
            // Navigate directly to HomeScreen (main app)
            console.log('🏠 Navigating directly to HomeScreen');
            navigation.replace('HomeScreen');
            
          } catch (error) {
            console.log('❌ Saved role login failed:', error.message);
            // If saved role fails, fall back to role selection
            Alert.alert('Auto-Login Failed', 'Unable to login with saved role. Please select role manually.');
            proceedToRoleSelection(clients);
          } finally {
            setLoading(false);
          }
        } else {
          // No saved role data available
          console.log('❌ No saved role data available');
          Alert.alert(
            'No Saved Role',
            'No role data found. Please select a role.',
            [
              {
                text: 'OK',
                onPress: () => proceedToRoleSelection(clients)
              }
            ]
          );
        }
      }
      
    } catch (error) {
      Alert.alert('Login Failed', error.message || 'Please check your credentials');
    }
  };

  const proceedToRoleSelection = (clients) => {
    // Navigate based on number of clients
    if (clients.length === 1) {
      navigation.navigate('SelectRoleScreen');
    } else {
      navigation.navigate('SelectClientScreen', {
        clients: clients,
      });
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

  // Get safe saved role context
  const getSafeRoleContext = () => {
    if (savedRoleContext && savedRoleContext.role) {
      return savedRoleContext;
    }
    return null;
  };

  const safeRoleContext = getSafeRoleContext();

  // Update checkbox label based on state
  const getRoleCheckboxLabel = () => {
    if (checkedUseSavedRole) {
      return "Select a role";
    } else {
      const hasSaved = useAuthStore.getState().hasCompleteRoleData();
      return hasSaved ? "Use last selected role" : "No role saved";
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView 
        contentContainerStyle={[
          styles.content,
          isLandscape && styles.contentLandscape,
          isTablet && styles.contentTablet
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Illustration */}
        <Image
          source={require('../../asserts/WelcomeSrn/icon-erp167.png')}
          style={[
            styles.illustration,
            isLandscape && styles.illustrationLandscape,
            isTablet && styles.illustrationTablet
          ]}
          resizeMode="contain"
        />

        {/* Title Section */}
        <View style={[
          styles.titleSection,
          isLandscape && styles.titleSectionLandscape
        ]}>
          <Text style={[
            styles.title,
            isLandscape && styles.titleLandscape,
            isTablet && styles.titleTablet
          ]}>
            Welcome
          </Text>
          <Text style={[
            styles.subtitle,
            isLandscape && styles.subtitleLandscape,
            isTablet && styles.subtitleTablet
          ]}>
            Login to access your account
          </Text>
        </View>

        {/* Card */}
        <View style={[
          styles.card,
          isLandscape && styles.cardLandscape,
          isTablet && styles.cardTablet
        ]}>
          {/* Username */}
          <TextInput
            style={[
              styles.input,
              isLandscape && styles.inputLandscape,
              isTablet && styles.inputTablet
            ]}
            placeholder="Name"
            placeholderTextColor={colors.inputPlaceholder}
            value={userName}
            onChangeText={setUserName}
            autoCapitalize="none"
            editable={!isLoading}
          />

          {/* Password */}
          <TextInput
            style={[
              styles.input,
              isLandscape && styles.inputLandscape,
              isTablet && styles.inputTablet
            ]}
            placeholder="Password"
            placeholderTextColor={colors.inputPlaceholder}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
          />

          {/* Language */}
          <View style={[
            styles.inputWrapper,
            isLandscape && styles.inputWrapperLandscape,
            isTablet && styles.inputWrapperTablet
          ]}>
            <Picker
              selectedValue={selectedValue}
              onValueChange={setSelectedValue}
              enabled={!isLoading}
              style={[
                styles.picker,
                isLandscape && styles.pickerLandscape,
                isTablet && styles.pickerTablet
              ]}
            >
              <Picker.Item label="English" value="English" />
            </Picker>
          </View>

          {/* Checkboxes */}
          <View style={[
            styles.checkboxContainer,
            isLandscape && styles.checkboxContainerLandscape
          ]}>
            <View style={styles.checkboxRow}>
              <CheckBox
                checked={checkedUseSavedRole}
                onPress={() => setCheckedUseSavedRole(!checkedUseSavedRole)}
                containerStyle={[
                  styles.checkbox,
                  isTablet && styles.checkboxTablet
                ]}
                size={isTablet ? scaleWidth(20) : scaleWidth(16)}
              />
              <Text style={[
                styles.checkboxText,
                isLandscape && styles.checkboxTextLandscape,
                isTablet && styles.checkboxTextTablet
              ]}>
                {getRoleCheckboxLabel()}
              </Text>
            </View>

            <View style={styles.checkboxRow}>
              <CheckBox
                checked={checkedRem}
                onPress={() => setCheckedRem(!checkedRem)}
                containerStyle={[
                  styles.checkbox,
                  isTablet && styles.checkboxTablet
                ]}
                size={isTablet ? scaleWidth(20) : scaleWidth(16)}
              />
              <Text style={[
                styles.checkboxText,
                isLandscape && styles.checkboxTextLandscape,
                isTablet && styles.checkboxTextTablet
              ]}>
                Remember me
              </Text>
            </View>
          </View>

          {/* Show saved role info when checkbox is unchecked */}
          {!checkedUseSavedRole && (
            <View style={styles.savedRoleInfo}>
              <Text style={styles.savedRoleText}>
                {useAuthStore.getState().hasCompleteRoleData() 
                  ? `Will use: ${useAuthStore.getState().roleName} at ${useAuthStore.getState().organizationName}`
                  : 'No role saved. Please select a role first.'}
              </Text>
            </View>
          )}

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.button,
              isLoading && styles.buttonDisabled,
              isLandscape && styles.buttonLandscape,
              isTablet && styles.buttonTablet
            ]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.buttonText,
              isLandscape && styles.buttonTextLandscape,
              isTablet && styles.buttonTextTablet
            ]}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignIn;

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: height * 0.05,
    paddingBottom: height * 0.05,
    paddingHorizontal: width * 0.05,
  },

  contentLandscape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: height * 0.03,
    paddingBottom: height * 0.03,
    paddingHorizontal: width * 0.03,
  },

  contentTablet: {
    paddingTop: height * 0.08,
    paddingBottom: height * 0.08,
    paddingHorizontal: width * 0.08,
  },

  illustration: {
    width: width * 0.9,
    height: height * 0.35,
    maxWidth: 350,
    maxHeight: 250,
    marginBottom: height * 0.02,
  },

  illustrationLandscape: {
    width: width * 0.35,
    height: height * 0.6,
    marginBottom: 0,
    marginRight: width * 0.05,
  },

  illustrationTablet: {
    width: width * 0.5,
    height: height * 0.3,
    maxWidth: 400,
    maxHeight: 300,
    marginBottom: height * 0.03,
  },

  titleSection: {
    alignItems: 'center',
    marginBottom: height * 0.03,
  },

  titleSectionLandscape: {
    marginBottom: height * 0.02,
    marginRight: width * 0.05,
  },

  title: {
    fontSize: width * 0.06,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: height * 0.005,
    textAlign: 'center',
  },

  titleLandscape: {
    fontSize: width * 0.05,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },

  titleTablet: {
    fontSize: width * 0.07,
    marginBottom: height * 0.01,
  },

  subtitle: {
    fontSize: width * 0.04,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  subtitleLandscape: {
    fontSize: width * 0.035,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },

  subtitleTablet: {
    fontSize: width * 0.045,
  },

  card: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: width * 0.04,
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  cardLandscape: {
    width: width * 0.5,
    maxWidth: 450,
    padding: width * 0.03,
  },

  cardTablet: {
    width: width * 0.6,
    maxWidth: 600,
    padding: width * 0.05,
    borderRadius: 12,
  },

  inputWrapper: {
    backgroundColor: colors.backgroundGray,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    marginBottom: height * 0.015,
  },

  inputWrapperLandscape: {
    marginBottom: height * 0.02,
  },

  inputWrapperTablet: {
    borderRadius: 8,
    marginBottom: height * 0.02,
  },

  picker: {
    height: height * 0.06,
    minHeight: 48,
    color: colors.textPrimary,
  },

  pickerLandscape: {
    height: height * 0.07,
  },

  pickerTablet: {
    height: height * 0.065,
    minHeight: 52,
  },

  input: {
    height: height * 0.06,
    minHeight: 48,
    backgroundColor: colors.backgroundGray,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: width * 0.04,
    marginBottom: height * 0.015,
    color: colors.inputText,
    fontSize: width * 0.04,
  },

  inputLandscape: {
    height: height * 0.07,
    marginBottom: height * 0.02,
    fontSize: width * 0.035,
  },

  inputTablet: {
    height: height * 0.065,
    minHeight: 52,
    borderRadius: 8,
    paddingHorizontal: width * 0.045,
    marginBottom: height * 0.02,
    fontSize: width * 0.045,
  },

  checkboxContainer: {
    width: '100%',
    marginBottom: height * 0.02,
  },

  checkboxContainerLandscape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.025,
  },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.012,
  },

  checkbox: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0,
    marginRight: width * 0.02,
  },

  checkboxTablet: {
    marginRight: width * 0.025,
  },

  checkboxText: {
    fontSize: width * 0.035,
    color: colors.textSecondary,
  },

  checkboxTextLandscape: {
    fontSize: width * 0.03,
  },

  checkboxTextTablet: {
    fontSize: width * 0.04,
  },

  // Saved role info styles
  savedRoleInfo: {
    backgroundColor: colors.primary + '10',
    borderRadius: 6,
    padding: width * 0.03,
    marginBottom: height * 0.02,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },

  savedRoleText: {
    fontSize: width * 0.035,
    color: colors.primary,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  button: {
    height: height * 0.06,
    minHeight: 46,
    backgroundColor: colors.authButton,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.015,
    marginHorizontal: width * 0.15,
    elevation: 3,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  buttonLandscape: {
    height: height * 0.07,
    marginHorizontal: width * 0.1,
    marginTop: height * 0.02,
  },

  buttonTablet: {
    height: height * 0.07,
    minHeight: 52,
    borderRadius: 8,
    marginHorizontal: width * 0.2,
    marginTop: height * 0.02,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: colors.textInverse,
    fontSize: width * 0.045,
    fontWeight: '600',
  },

  buttonTextLandscape: {
    fontSize: width * 0.04,
  },

  buttonTextTablet: {
    fontSize: width * 0.05,
  },
});