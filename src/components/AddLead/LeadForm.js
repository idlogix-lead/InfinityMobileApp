// components/forms/FormInput.js
import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const FormInput = ({
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
      
      <TextInput
        style={[
          styles.input,
          focused && styles.inputFocused,
          error && styles.inputError,
          multiline && styles.multilineInput,
          inputStyle,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#ccc"
        onFocus={onFocus}
        onBlur={onBlur}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : 1}
        editable={editable}
        {...props}
      />
      
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
    color: '#000',
    fontFamily: 'K2D-SemiBold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  required: {
    color: 'red',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    color: '#000',
    fontSize: 14,
    fontFamily: 'K2D-Regular',
  },
  inputFocused: {
    borderColor: '#2F4FE3',
  },
  inputError: {
    borderColor: 'red',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 11,
    marginTop: 4,
    fontFamily: 'K2D-Regular',
  },
});

export default FormInput;