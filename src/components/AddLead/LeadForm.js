// components/forms/FormInput.js – Updated with CRMTheme
// Changes: label font size reduced to small, color changed to textSecondary

import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CountryPicker from 'react-native-country-picker-modal';
import { isValidPhoneNumber } from 'libphonenumber-js';
import CRMTheme from '../../constants/CRMTheme/CRMTheme';

const { Colors, Typography, Layout, Spacing } = CRMTheme;

// Regular FormInput – flat design
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
              <MaterialCommunityIcons name={icon} size={18} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      )}

      <View
        style={[
          styles.inputWrapper,
          focused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
          !editable && styles.inputWrapperDisabled,
        ]}
      >
        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          onFocus={onFocus}
          onBlur={onBlur}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          editable={editable}
          {...props}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// Helper to convert country code to flag emoji
const getFlagEmoji = (countryCode) => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
};

// Phone Input Component with Country Code Selection – flat design
export const PhoneInput = ({
  label,
  required = false,
  value,
  onChangeText,
  placeholder = 'Enter phone number',
  error: externalError,
  focused,
  onFocus,
  onBlur,
  editable = true,
  containerStyle,
  defaultCountryCode = 'PK',
  onCountryChange,
  ...props
}) => {
  const [country, setCountry] = useState({
    cca2: defaultCountryCode,
    callingCode: ['92'],
  });
  const [pickerVisible, setPickerVisible] = useState(false);
  const [internalError, setInternalError] = useState('');

  const error = externalError || internalError;

  const handleCountrySelect = (selected) => {
    setCountry({
      cca2: selected.cca2,
      callingCode: selected.callingCode,
    });
    setPickerVisible(false);
    setInternalError('');
    if (onCountryChange) {
      onCountryChange(selected);
    }
  };

  const handleBlur = (e) => {
    if (onBlur) onBlur(e);

    if (value && country?.callingCode?.[0]) {
      const fullNumber = `+${country.callingCode[0]}${value}`;
      const isValid = isValidPhoneNumber(fullNumber, country.cca2);
      if (!isValid) {
        setInternalError('Invalid phone number for selected country');
      } else {
        setInternalError('');
      }
    } else {
      setInternalError('');
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
        {/* Country picker button – only flag */}
        <TouchableOpacity
          style={[
            styles.countryPicker,
            focused && styles.countryPickerFocused,
            error && styles.countryPickerError,
            !editable && styles.countryPickerDisabled,
          ]}
          onPress={() => editable && setPickerVisible(true)}
          activeOpacity={0.7}
        >
          <CountryPicker
            {...{
              visible: pickerVisible,
              onClose: () => setPickerVisible(false),
              onSelect: handleCountrySelect,
              withEmoji: true,
              withFilter: true,
              withFlag: true,
              withCallingCode: false,
              withCountryNameButton: false,
              withAlphaFilter: true,
              countryCode: country.cca2,
              containerButtonStyle: styles.hiddenPicker,
            }}
          />
          <Text style={styles.countryFlag}>{getFlagEmoji(country.cca2)}</Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={18}
            color={editable ? Colors.textSecondary : Colors.textTertiary}
          />
        </TouchableOpacity>

        {/* Phone input area – unified field with dial code prefix */}
        <View
          style={[
            styles.phoneInputArea,
            focused && styles.phoneInputAreaFocused,
            error && styles.phoneInputAreaError,
            !editable && styles.phoneInputAreaDisabled,
            styles.flexible,
          ]}
        >
          <View style={styles.phoneInputContainer}>
            <Text style={styles.prefixText}>+{country.callingCode?.[0]}</Text>
            <TextInput
              style={[styles.phoneInput, !editable && styles.inputDisabled]}
              value={value}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9]/g, '');
                onChangeText(cleaned);
                setInternalError('');
              }}
              placeholder={placeholder}
              placeholderTextColor={Colors.textTertiary}
              onFocus={onFocus}
              onBlur={handleBlur}
              keyboardType="phone-pad"
              editable={editable}
              {...props}
            />
          </View>
        </View>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
    marginLeft: Spacing.md, 
  },
  // 🔹 UPDATED: label font smaller and lighter
  label: {
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.medium, 
    letterSpacing: 0.5,
   
  },
  required: {
    color: Colors.error,
  },

  // Regular Input Wrapper (for FormInput)
  inputWrapper: {
    backgroundColor: Colors.backgroundLight,
  },
  inputWrapperFocused: {
    borderColor: Colors.primary,
  },
  inputWrapperError: {
    borderColor: Colors.error,
  },
  inputWrapperDisabled: {
    backgroundColor: Colors.backgroundDark,
  },
  input: {
    height: 40,
    paddingHorizontal: Spacing.lg,
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.h1,
    fontFamily: Typography.fontFamily.bold,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },

  // Phone Input Specific Styles
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    minWidth: 60,
    justifyContent: 'space-between',
  },
  countryPickerFocused: {
    borderColor: Colors.primary,
  },
  countryPickerError: {
    borderColor: Colors.error,
  },
  countryPickerDisabled: {
    backgroundColor: Colors.backgroundDark,
    borderColor: Colors.border,
  },
  countryFlag: {
    fontSize: 20,
    marginRight: Spacing.xs,
  },
  hiddenPicker: {
    display: 'none',
  },
  phoneInputArea: {
    backgroundColor: Colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flex: 1,
  },
  phoneInputAreaFocused: {
    borderBottomColor: Colors.primary,
    borderBottomWidth: 2,
  },
  phoneInputAreaError: {
    borderBottomColor: Colors.error,
  },
  phoneInputAreaDisabled: {
    backgroundColor: Colors.backgroundDark,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    height: 40,
  },
  prefixText: {
    fontSize: Typography.fontSize.large,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    marginRight: Spacing.xs,
  },
  phoneInput: {
    flex: 1,
    height: 40,
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.large,
    fontFamily: Typography.fontFamily.medium,
    padding: 0,
    margin: 0,
  },
  flexible: {
    flex: 1,
  },
  inputDisabled: {
    color: Colors.textTertiary,
  },

  errorText: {
    color: Colors.error,
    fontSize: Typography.fontSize.xsmall,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
    fontFamily: Typography.fontFamily.regular,
  },
});

export default FormInput;