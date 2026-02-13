// components/forms/FormInput.js
import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Menu, Divider } from 'react-native-paper';

// Country codes with flags and dial codes
const COUNTRY_CODES = [
  { code: 'PK', dialCode: '+92', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'US', dialCode: '+1', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', dialCode: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'AE', dialCode: '+971', name: 'UAE', flag: '🇦🇪' },
  { code: 'SA', dialCode: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'IN', dialCode: '+91', name: 'India', flag: '🇮🇳' },
  { code: 'CA', dialCode: '+1', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', dialCode: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', dialCode: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', dialCode: '+33', name: 'France', flag: '🇫🇷' },
  { code: 'CN', dialCode: '+86', name: 'China', flag: '🇨🇳' },
  { code: 'JP', dialCode: '+81', name: 'Japan', flag: '🇯🇵' },
];

// Regular FormInput with shadow and elevation
export const FormInput = ({
  label,
  required = false,
  value,
  onChangeText,
  placeholder,
  error,
  focused,
  onFocus,
  onBlur,
  multiline = false,
  numberOfLines = 1,
  editable = true,
  icon,
  onIconPress,
  containerStyle,
  inputStyle,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
          {icon && onIconPress && (
            <TouchableOpacity onPress={onIconPress}>
              <MaterialCommunityIcons
                name={icon}
                size={18}
                color="#2F4FE3"
              />
            </TouchableOpacity>
          )}
        </View>
      )}
      
      <View style={[
        styles.inputWrapper,
        focused && styles.inputWrapperFocused,
        error && styles.inputWrapperError,
        !editable && styles.inputWrapperDisabled,
      ]}>
        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          onFocus={onFocus}
          onBlur={onBlur}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          editable={editable}
          {...props}
        />
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

// Phone Input Component with Country Code Selection
export const PhoneInput = ({
  label,
  required = false,
  value,
  onChangeText,
  placeholder = 'Enter phone number',
  error,
  focused,
  onFocus,
  onBlur,
  editable = true,
  containerStyle,
  defaultCountryCode = '+92', // Pakistan by default
  onCountryCodeChange,
  ...props
}) => {
  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRY_CODES.find(c => c.dialCode === defaultCountryCode) || COUNTRY_CODES[0]
  );
  const [menuVisible, setMenuVisible] = useState(false);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setMenuVisible(false);
    if (onCountryCodeChange) {
      onCountryCodeChange(country.dialCode);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}
      
      <View style={styles.phoneInputRow}>
        {/* Country Code Picker */}
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableOpacity
              style={[
                styles.countryPicker,
                focused && styles.countryPickerFocused,
                error && styles.countryPickerError,
                !editable && styles.countryPickerDisabled,
              ]}
              onPress={() => editable && setMenuVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
              <Text style={styles.dialCode}>{selectedCountry.dialCode}</Text>
              <MaterialCommunityIcons 
                name="chevron-down" 
                size={18} 
                color={editable ? "#666" : "#999"} 
              />
            </TouchableOpacity>
          }
          style={styles.countryMenu}
        >
          {COUNTRY_CODES.map((country, index) => (
            <React.Fragment key={country.code}>
              <Menu.Item
                onPress={() => handleCountrySelect(country)}
                title={`${country.flag} ${country.dialCode} ${country.name}`}
                titleStyle={[
                  styles.menuItemTitle,
                  selectedCountry.code === country.code && styles.menuItemSelected
                ]}
              />
              {index < COUNTRY_CODES.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Menu>

        {/* Phone Number Input */}
        <View style={[
          styles.phoneInputWrapper,
          focused && styles.phoneInputWrapperFocused,
          error && styles.phoneInputWrapperError,
          !editable && styles.phoneInputWrapperDisabled,
          styles.flexible,
        ]}>
          <TextInput
            style={[styles.phoneInput, !editable && styles.inputDisabled]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#999"
            onFocus={onFocus}
            onBlur={onBlur}
            keyboardType="phone-pad"
            editable={editable}
            {...props}
          />
        </View>
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    color: '#333',
    fontFamily: 'K2D-SemiBold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  required: {
    color: '#FF3B30',
  },
  
  // Input Wrapper with Shadow and Elevation
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    
    // Elevation for Android
    elevation: 3,
  },
  inputWrapperFocused: {
    borderColor: '#2F4FE3',
    shadowColor: '#2F4FE3',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  inputWrapperError: {
    borderColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOpacity: 0.1,
  },
  inputWrapperDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    shadowOpacity: 0.05,
    elevation: 1,
  },
  input: {
    height: 48,
    paddingHorizontal: 16,
    color: '#333',
    fontSize: 15,
    fontFamily: 'K2D-Regular',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingBottom: 12,
  },
  
  // Phone Input Specific Styles
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 12,
    minWidth: 100,
    
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    
    // Elevation for Android
    elevation: 3,
  },
  countryPickerFocused: {
    borderColor: '#2F4FE3',
    shadowColor: '#2F4FE3',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  countryPickerError: {
    borderColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOpacity: 0.1,
  },
  countryPickerDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    shadowOpacity: 0.05,
    elevation: 1,
  },
  countryFlag: {
    fontSize: 18,
    marginRight: 6,
  },
  dialCode: {
    fontSize: 14,
    fontFamily: 'K2D-Medium',
    color: '#333',
    marginRight: 4,
  },
  phoneInputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    
    // Elevation for Android
    elevation: 3,
  },
  phoneInputWrapperFocused: {
    borderColor: '#2F4FE3',
    shadowColor: '#2F4FE3',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  phoneInputWrapperError: {
    borderColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOpacity: 0.1,
  },
  phoneInputWrapperDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    shadowOpacity: 0.05,
    elevation: 1,
  },
  phoneInput: {
    height: 48,
    paddingHorizontal: 16,
    color: '#333',
    fontSize: 15,
    fontFamily: 'K2D-Regular',
  },
  flexible: {
    flex: 1,
  },
  inputDisabled: {
    color: '#999',
  },
  
  // Country Menu Styles
  countryMenu: {
    marginTop: 40,
  },
  menuItemTitle: {
    fontSize: 14,
    fontFamily: 'K2D-Regular',
  },
  menuItemSelected: {
    color: '#2F4FE3',
    fontFamily: 'K2D-SemiBold',
  },
  
  // Error Text
  errorText: {
    color: '#FF3B30',
    fontSize: 11,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: 'K2D-Regular',
  },
});

// Export both components
export default FormInput;