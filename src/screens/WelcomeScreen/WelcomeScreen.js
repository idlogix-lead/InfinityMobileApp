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
import React, { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import { useAuthStore } from '../../store/authStore';
import colors from '../../constants/Colors'; // Import colors

const { height, width } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const [selectedValue, setSelectedValue] = useState('http');
  const [ipAddress, setIpAddress] = useState('');
  const [portNum, setPortNum] = useState('');
  
  const setServerConfig = useAuthStore(state => state.setServerConfig);
  const serverConfig = useAuthStore(state => state.serverConfig);

  const options = [
    { label: 'HTTP', value: 'http' },
    { label: 'HTTPS', value: 'https' },
  ];

  useEffect(() => {
    // Load saved config on mount
    if (serverConfig.protocol) setSelectedValue(serverConfig.protocol);
    if (serverConfig.host) setIpAddress(serverConfig.host);
    if (serverConfig.port) setPortNum(serverConfig.port);

    const handleBackButton = () => {
      BackHandler.exitApp();
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
  }, []);

  const navigateToSignIn = () => {
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

    // Save to Zustand store
    setServerConfig({
      protocol: selectedValue,
      host: ipAddress,
      port: portNum,
    });

    navigation.navigate('SignIn');
  };

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
          <View style={styles.logoContainer}>
            <Image
              source={require('../../asserts/WelcomeSrn/infinityerpiconillustrator23.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Infinity ERP</Text>
          </View>
        </View>

        {/* Configuration Card */}
        <View style={styles.card}>
          {/* Card Header with Primary Dark Background - ONLY TITLE */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderContent}>
              <Text style={styles.cardTitle}>Server Configuration</Text>
            </View>
          </View>

          {/* Card Body */}
          <View style={styles.cardBody}>
            {/* Description in White Area */}
            <View style={styles.descriptionContainer}>
              <Text style={styles.cardDescription}>
                Configure your server connection to get started
              </Text>
            </View>

            {/* Protocol Picker */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.labelIcon}>🌐</Text>
                <Text style={styles.label}>Protocol</Text>
              </View>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedValue}
                  onValueChange={setSelectedValue}
                  style={styles.picker}
                  dropdownIconColor={colors.primaryDark}
                >
                  {options.map(option => (
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

            {/* IP Address Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.labelIcon}>🔗</Text>
                <Text style={styles.label}>Domain / IP Address</Text>
              </View>
              <TextInput
                onChangeText={setIpAddress}
                value={ipAddress}
                placeholder="e.g., 192.168.1.100 or yourdomain.com"
                placeholderTextColor={colors.textTertiary}
                style={styles.textInput}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Port Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.labelIcon}>🔢</Text>
                <Text style={styles.label}>Port Number</Text>
              </View>
              <TextInput
                onChangeText={setPortNum}
                value={portNum}
                placeholder="e.g., 8080 or 3000"
                placeholderTextColor={colors.textTertiary}
                style={styles.textInput}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={navigateToSignIn}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  <Text style={styles.primaryButtonText}>Save & Continue</Text>
                  <Text style={styles.buttonArrow}>→</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => {
                  // Optional: Clear configuration
                  setIpAddress('');
                  setPortNum('');
                  setSelectedValue('http');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Reset Configuration</Text>
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

export default WelcomeScreen;

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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 5,
  },
  logoContainer: {
    width: width * 0.25,
    height: width * 0.25,
    backgroundColor: colors.background,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
   
   
  },
  logo: {
    width: '65%',
    height: '65%',
    tintColor: colors.primary,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 6,
    fontFamily: 'K2D-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    backgroundColor: colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 60,
    justifyContent: 'center',
  },
  cardHeaderContent: {
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 44,
    height: 44,
    
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerIcon: {
    fontSize: 30,
  },
  cardTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: colors.textInverse,
    fontFamily: 'K2D-Bold',
  },
  cardBody: {
    padding: 15,
  },
  descriptionContainer: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  cardDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    fontFamily: 'K2D-Regular',
  },
  inputGroup: {
    marginBottom: 10,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelIcon: {
    fontSize: 16,
    marginRight: 8,
    color: colors.primary,
  },
  label: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    fontFamily: 'K2D-SemiBold',
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
    height: 54,
    color: colors.textPrimary,
    fontFamily: 'K2D-Regular',
    fontSize: 16,
  },
  textInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderLight,
    height: 54,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.textPrimary,
    fontFamily: 'K2D-Regular',
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonGroup: {
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    height: 58,
    borderRadius: 14,
    marginBottom: 16,
    elevation: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'hidden',
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
    fontSize: 22,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'K2D-SemiBold',
  },
 
  footer: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'K2D-Regular',
  },
  footerVersion: {
    fontSize: 12,
    color: colors.textDisabled,
    fontFamily: 'K2D-Regular',
  },
});