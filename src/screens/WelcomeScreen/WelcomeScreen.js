import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TextInput,
  TouchableOpacity,
  BackHandler,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import { Picker } from '@react-native-picker/picker';
import { useAuthStore } from '../../store/authStore';
import colors from '../../constants/Colors';

const { height, width } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const [selectedValue, setSelectedValue] = useState('http');
  const [ipAddress, setIpAddress] = useState('');
  const [portNum, setPortNum] = useState('');
  const [isNavigating, setIsNavigating] = useState(false); // Prevent double navigation
  const navigationRef = useRef(false); // Track if we've already navigated
  
  const setServerConfig = useAuthStore(state => state.setServerConfig);
  const serverConfig = useAuthStore(state => state.serverConfig);

  const options = [
    { label: 'HTTP', value: 'http' },
    { label: 'HTTPS', value: 'https' },
  ];

  // Responsive scaling factors
  const scaleWidth = (size) => (width / 375) * size;
  const scaleHeight = (size) => (height / 812) * size;
  
  // Determine device orientation
  const isLandscape = width > height;
  const isTablet = width >= 768;

  useEffect(() => {
    console.log('🌐 WelcomeScreen: Mounted');
    navigationRef.current = false;
    
    // Load saved config on mount
    if (serverConfig.protocol) setSelectedValue(serverConfig.protocol);
    if (serverConfig.host) setIpAddress(serverConfig.host);
    if (serverConfig.port) setPortNum(serverConfig.port);

    const handleBackButton = () => {
      BackHandler.exitApp();
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
      console.log('🌐 WelcomeScreen: Unmounted');
    };
  }, []);

  const navigateToSignIn = () => {
    // Prevent double navigation
    if (isNavigating || navigationRef.current) {
      console.log('⚠️ WelcomeScreen: Navigation already in progress, ignoring');
      return;
    }
    
    if (!selectedValue) {
      alert('Please select host protocol');
      return;
    } else if (ipAddress.trim() === '') {
      alert('Please enter your IP address');
      return;
    } else if (portNum.trim() === '') {
      alert('Please enter your Port Number');
      return;
    }

    // Set navigating flag
    setIsNavigating(true);
    navigationRef.current = true;
    
    console.log('🌐 WelcomeScreen: Saving config and navigating...');

    // Save to Zustand store
    setServerConfig({
      protocol: selectedValue,
      host: ipAddress,
      port: portNum,
    });

    // Use setTimeout to ensure state update
    setTimeout(() => {
      console.log('🌐 WelcomeScreen: Navigating to SignIn');
      navigation.navigate('SignIn');
      
      // Reset flag after navigation
      setTimeout(() => {
        setIsNavigating(false);
      }, 1000);
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView 
        contentContainerStyle={[
          styles.content,
          isLandscape && styles.contentLandscape
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Illustration */}
        <Image
          source={require('../../asserts/WelcomeSrn/icons...41.png')}
          style={[
            styles.illustration,
            isLandscape && styles.illustrationLandscape,
            isTablet && styles.illustrationTablet
          ]}
          resizeMode="contain"
        />

        {/* Title */}
        <Text style={[
          styles.title,
          isLandscape && styles.titleLandscape,
          isTablet && styles.titleTablet
        ]}>
          Server Configuration
        </Text>

        {/* Card */}
        <View style={[
          styles.card,
          isLandscape && styles.cardLandscape,
          isTablet && styles.cardTablet
        ]}>
          {/* Protocol */}
          <View style={styles.inputWrapper}>
            <Picker
              selectedValue={selectedValue}
              onValueChange={setSelectedValue}
              style={styles.picker}
            >
              <Picker.Item label="Select Host" value="" />
              <Picker.Item label="HTTP" value="http" />
              <Picker.Item label="HTTPS" value="https" />
            </Picker>
          </View>

          {/* Domain */}
          <TextInput
            style={styles.input}
            placeholder="Domain/IP Address"
            placeholderTextColor="#999"
            value={ipAddress}
            onChangeText={setIpAddress}
            autoCapitalize="none"
          />

          {/* Port */}
          <TextInput
            style={styles.input}
            placeholder="Port Number"
            placeholderTextColor="#999"
            value={portNum}
            onChangeText={setPortNum}
            keyboardType="numeric"
          />

          {/* Save Button */}
          <TouchableOpacity 
            style={[
              styles.button,
              isLandscape && styles.buttonLandscape,
              isTablet && styles.buttonTablet,
              isNavigating && styles.buttonDisabled
            ]} 
            onPress={navigateToSignIn}
            disabled={isNavigating}
          >
            <Text style={[
              styles.buttonText,
              isTablet && styles.buttonTextTablet
            ]}>
              {isNavigating ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default WelcomeScreen;

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
    backgroundColor: colors.background,
  },

  contentLandscape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: height * 0.02,
    paddingBottom: height * 0.02,
  },

  illustration: {
    height: height * 0.35,
    width: width * 0.85,
    maxHeight: 350,
    maxWidth: 350,
    marginBottom: height * 0.02,
  },

  illustrationLandscape: {
    height: height * 0.6,
    width: width * 0.4,
    marginBottom: 0,
    marginRight: width * 0.05,
  },

  illustrationTablet: {
    height: height * 0.4,
    width: width * 0.5,
    maxHeight: 400,
    maxWidth: 400,
  },

  title: {
    fontSize: width * 0.05,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: height * 0.03,
    textAlign: 'center',
    minWidth: width * 0.6,
  },

  titleLandscape: {
    fontSize: width * 0.04,
    marginBottom: height * 0.02,
  },

  titleTablet: {
    fontSize: width * 0.045,
    marginBottom: height * 0.04,
  },

  card: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: width * 0.04,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  cardLandscape: {
    width: width * 0.45,
    maxWidth: 400,
    padding: width * 0.03,
  },

  cardTablet: {
    width: width * 0.6,
    maxWidth: 600,
    padding: width * 0.05,
  },

  inputWrapper: {
    backgroundColor: colors.backgroundGray,
    borderRadius: 8,
    marginBottom: height * 0.015,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },

  picker: {
    height: height * 0.06,
    minHeight: 50,
    color: colors.textPrimary,
  },

  input: {
    height: height * 0.06,
    minHeight: 50,
    backgroundColor: colors.backgroundGray,
    borderRadius: 8,
    paddingHorizontal: width * 0.04,
    marginBottom: height * 0.015,
    fontSize: width * 0.035,
    color: colors.inputText,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },

  button: {
    height: height * 0.06,
    minHeight: 48,
    backgroundColor: colors.authButton,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.02,
    elevation: 4,
    marginHorizontal: width * 0.15,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  buttonDisabled: {
    backgroundColor: '#cccccc',
  },

  buttonLandscape: {
    marginHorizontal: width * 0.1,
    height: height * 0.07,
  },

  buttonTablet: {
    marginHorizontal: width * 0.2,
    height: height * 0.07,
    minHeight: 56,
  },

  buttonText: {
    color: colors.textInverse,
    fontSize: width * 0.04,
    fontWeight: '600',
  },

  buttonTextTablet: {
    fontSize: width * 0.045,
  },
});