// components/CRM/SalesRepModal.js - Reusable Sales Representative Modal

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import theme from '../../constants/CRMTheme';

const { Colors, Typography, Layout, Spacing } = theme;
const { scale, verticalScale } = Layout;

/**
 * Reusable Sales Representative Modal Component
 * @param {Object} props
 * @param {boolean} props.visible - Controls modal visibility
 * @param {Array} props.salesReps - List of sales representatives
 * @param {boolean} props.loading - Loading state
 * @param {string} props.selectedRepId - Currently selected rep ID
 * @param {string} props.selectedRepName - Currently selected rep name
 * @param {Function} props.onSelect - Callback when a rep is selected
 * @param {Function} props.onClear - Callback to clear selection
 * @param {Function} props.onClose - Callback to close modal
 * @param {string} props.placeholder - Placeholder text for search
 * @param {string} props.title - Modal title
 * @param {boolean} props.showClearButton - Whether to show clear button
 * @param {React.ReactNode} props.customTrigger - Custom trigger element (optional)
 */
const SalesRepModal = ({
  visible,
  salesReps = [],
  loading = false,
  selectedRepId,
  selectedRepName,
  onSelect,
  onClear,
  onClose,
  placeholder = "Search by name...",
  title = "Select Sales Representative",
  showClearButton = true,
  customTrigger,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter sales reps based on search query
  const filteredSalesReps = useMemo(() => {
    if (!searchQuery.trim()) {
      return salesReps;
    }
    const query = searchQuery.toLowerCase();
    return salesReps.filter(rep =>
      rep.Name && rep.Name.toLowerCase().includes(query)
    );
  }, [salesReps, searchQuery]);

  // Clear search when modal closes
  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  // Handle rep selection
  const handleSelect = (rep) => {
    onSelect(rep);
    setSearchQuery('');
  };

  // Render sales rep item
  const renderSalesRepItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.repItem,
        selectedRepId === item.id && styles.selectedRepItem,
      ]}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.repItemContent}>
        <View style={styles.repAvatar}>
          <Text style={styles.repAvatarText}>
            {item.Name?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.repDetails}>
          <Text style={styles.repName} numberOfLines={1}>{item.Name}</Text>
          {item.EMail && (
            <Text style={styles.repEmail} numberOfLines={1}>{item.EMail}</Text>
          )}
        </View>
      </View>
      {selectedRepId === item.id && (
        <Icon name="check" size={20} color={Colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={placeholder}
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearSearchButton}
              >
                <Icon name="close" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Sales Representatives List */}
          {loading ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.modalLoadingText}>Loading...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredSalesReps}
              renderItem={renderSalesRepItem}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              initialNumToRender={20}
              maxToRenderPerBatch={20}
              windowSize={10}
              ListEmptyComponent={
                <View style={styles.modalEmpty}>
                  <Icon name="person-off" size={50} color={Colors.border} />
                  <Text style={styles.modalEmptyText}>
                    {searchQuery.trim()
                      ? `No results for "${searchQuery}"`
                      : 'No sales representatives available'}
                  </Text>
                </View>
              }
              style={styles.repList}
              contentContainerStyle={styles.repListContent}
            />
          )}

          {/* Footer with count */}
          <View style={styles.modalFooter}>
            <Text style={styles.footerText}>
              {filteredSalesReps.length} of {salesReps.length} sales representatives
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/**
 * Sales Representative Selector Component
 * This is the trigger component that shows the selected rep and opens the modal
 */
export const SalesRepSelector = ({
  selectedRepName,
  error,
  onPress,
  onClear,
  showClearButton = true,
  placeholder = "Select Sales Representative",
  disabled = false,
}) => (
  <View style={styles.selectorContainer}>
    <TouchableOpacity
      style={[
        styles.selector,
        error && styles.selectorError,
        disabled && styles.selectorDisabled,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      {selectedRepName ? (
        <View style={styles.selectedRepContainer}>
          <View style={styles.selectedRepInfo}>
            <MaterialCommunityIcons name="account-tie" size={Layout.iconSize.sm} color={Colors.primary} />
            <Text style={styles.selectedRepText} numberOfLines={1}>{selectedRepName}</Text>
          </View>
          {showClearButton && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={(e) => {
                e.stopPropagation();
                onClear();
              }}
              disabled={disabled}
            >
              <Icon name="close" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <>
          <Text style={styles.placeholderText}>{placeholder}</Text>
          <Icon name="arrow-drop-down" size={24} color={Colors.textSecondary} />
        </>
      )}
    </TouchableOpacity>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: Layout.borderRadius.lg,
    borderTopRightRadius: Layout.borderRadius.lg,
    maxHeight: '80%',
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    
    // Elevation for Android
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    fontSize: Typography.fontSize.h4,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: Spacing.xxs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    margin: Spacing.md,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.backgroundLight,
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    
    // Elevation for Android
    elevation: 2,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: verticalScale(42),
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  clearSearchButton: {
    padding: Spacing.xxs,
  },
  repList: {
    maxHeight: 400,
  },
  repListContent: {
    paddingBottom: Spacing.md,
  },
  repItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(10),
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  selectedRepItem: {
    backgroundColor: Colors.infoLight,
  },
  repItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  repAvatar: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    
    // Shadow for iOS
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    
    // Elevation for Android
    elevation: 2,
  },
  repAvatarText: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textInverse,
  },
  repDetails: {
    flex: 1,
  },
  repName: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xxs,
  },
  repEmail: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  modalLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(32),
  },
  modalLoadingText: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  modalEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(40),
    paddingHorizontal: Spacing.xl,
  },
  modalEmptyText: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  modalFooter: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    alignItems: 'center',
  },
  footerText: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },

  // Selector Styles
  selectorContainer: {
    marginBottom: Spacing.md,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 0,
    height: 42,
    backgroundColor: Colors.backgroundLight,
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    
    // Elevation for Android
    elevation: 2,
  },
  selectorError: {
    borderColor: Colors.error,
    borderWidth: 1.5,
  },
  selectorDisabled: {
    backgroundColor: Colors.backgroundLight,
    opacity: 0.7,
  },
  selectedRepContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedRepInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  selectedRepText: {
    fontSize: Typography.fontSize.small,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.regular,
  },
  placeholderText: {
    fontSize: Typography.fontSize.small,
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily.regular,
  },
  clearButton: {
    padding: Spacing.xxs,
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.regular,
    marginTop: Spacing.xxs,
    marginLeft: Spacing.xs,
  },
});

export default SalesRepModal;