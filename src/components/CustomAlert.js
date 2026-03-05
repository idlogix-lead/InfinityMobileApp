// components/CustomAlert.js
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import theme from '../constants/CRMTheme/CRMTheme';

const { width } = Dimensions.get('window');
const { Colors, Typography, Layout } = theme;
const { scale, verticalScale } = Layout;

const CustomAlert = ({
  visible,
  title,
  message,
  type = 'info',
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancelButton = false,
}) => {
  // Get icon based on alert type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Icon name="check-circle" size={scale(40)} color={Colors.success} />;
      case 'error':
        return <Icon name="error" size={scale(40)} color={Colors.error} />;
      case 'warning':
        return <Icon name="warning" size={scale(40)} color={Colors.warning} />;
      case 'delete':
        return <Icon name="delete" size={scale(40)} color={Colors.error} />;
      default:
        return <Icon name="info" size={scale(40)} color={Colors.primary} />;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.alertContainer}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            {getIcon()}
          </View>

          {/* Title */}
          {title && (
            <Text style={styles.title}>{title}</Text>
          )}

          {/* Message */}
          {message && (
            <Text style={styles.message}>{message}</Text>
          )}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {showCancelButton && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                type === 'delete' && styles.deleteConfirmButton,
                !showCancelButton && styles.fullWidthButton,
              ]}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: width * 0.85,
    maxWidth: scale(400),
    backgroundColor: '#FFFFFF', // White background as requested
    borderRadius: Layout.borderRadius.xl,
    padding: Layout.spacing.xl,
    alignItems: 'center',
    
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    
    // Elevation for Android
    elevation: 12,
  },
  iconContainer: {
    marginBottom: Layout.spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.h4,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Layout.spacing.sm,
  },
  message: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Layout.spacing.xl,
    lineHeight: Typography.lineHeight.medium,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: Layout.spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: scale(100),
    
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    
    // Elevation for Android
    elevation: 3,
  },
  fullWidthButton: {
    flex: 1,
  },
  confirmButton: {
    backgroundColor: Colors.primary, // Blue button as requested
  },
  deleteConfirmButton: {
    backgroundColor: Colors.error,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  confirmButtonText: {
    color: '#FFFFFF', // White text on blue button
    fontSize: Typography.fontSize.button,
    fontFamily: Typography.fontFamily.semiBold,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.button,
    fontFamily: Typography.fontFamily.medium,
  },
});

export default CustomAlert;