// screens/CRM/AddActivity.js - UPDATED with AddLeads UI styling

import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
  Keyboard,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
  TextInput as RNTextInput,
  StatusBar,
} from 'react-native';
import { useMutation, useQueryClient } from 'react-query';
import AntDesign from 'react-native-vector-icons/AntDesign';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { TextInput } from 'react-native-paper';
import CustomHeader from '../../components/CustomHeader';
import { 
  useCreateFollowup, 
  useUpdateFollowup,
  useDeleteFollowup 
} from '../../hooks/CRMhooks/useCRM';
import { useSalesRepresentatives } from '../../hooks/CRMhooks/useCRM';
import moment from 'moment';

// Import theme
import theme from '../../constants/CRMTheme/CRMTheme';
import CalendarModal from '../../components/RequestScreenComponents/Calendar/CalendarModal';

const { Colors, Typography, Layout, Spacing } = theme;
const { scale, verticalScale } = Layout;

const AddActivity = ({ route, navigation }) => {
  const { data, mode } = route.params;
  const queryClient = useQueryClient();
  
  // State to track if component is mounted
  const [isMounted, setIsMounted] = useState(false);

  // useEffect to set mounted state after first render
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  // State
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [isComplete, setIsComplete] = useState(false);
  const [activityCollapsed, setActivityCollapsed] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState('Select Activity Type');
  const [description, setDescription] = useState('');

  // Sales Representative State
  const [selectedSalesRepId, setSelectedSalesRepId] = useState(null);
  const [selectedSalesRepName, setSelectedSalesRepName] = useState('');
  const [showSalesRepModal, setShowSalesRepModal] = useState(false);
  const [salesRepSearch, setSalesRepSearch] = useState('');

  // Calendar state
  const [calendarMode, setCalendarMode] = useState('from'); // 'from' or 'to'
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarTitle, setCalendarTitle] = useState('Select Date');

  // Animations
  const activityAnim = React.useRef(new Animated.Value(0)).current;

  // Hooks - Pass isMounted to control query execution
  const { data: salesReps = [], isLoading: loadingSalesReps } = useSalesRepresentatives(isMounted);

  // Mutations
  const createFollowupMutation = useCreateFollowup();
  const updateFollowupMutation = useUpdateFollowup();
  const deleteFollowupMutation = useDeleteFollowup();

  // Activity type mapping
  const activityTypeMap = {
    'Email': 'EM',
    'Phone': 'PC', 
    'Meeting': 'ME',
    'Task': 'TA',
  };

  // Reverse mapping for display
  const activityLabelMap = {
    'EM': 'Email',
    'PC': 'Phone',
    'ME': 'Meeting',
    'TA': 'Task',
  };

  // Filter sales reps based on search query
  const filteredSalesReps = useMemo(() => {
    if (!salesRepSearch.trim()) {
      return salesReps;
    }
    const query = salesRepSearch.toLowerCase();
    return salesReps.filter(rep =>
      rep.Name && rep.Name.toLowerCase().includes(query)
    );
  }, [salesReps, salesRepSearch]);

  // Initialize form for edit mode
  useEffect(() => {
    if (mode === 'edit' && data) {
      console.log('Initializing edit mode with data:', data);
      
      // Set activity type
      const activityId = data?.ContactActivityType?.id;
      setSelectedActivity(activityLabelMap[activityId] || 'Select Activity Type');
      
      // Set dates
      if (data.StartDate) {
        setFromDate(new Date(data.StartDate));
      }
      if (data.EndDate) {
        setToDate(new Date(data.EndDate));
      }
      
      // Set sales rep
      if (data.SalesRep_ID?.id) {
        setSelectedSalesRepId(data.SalesRep_ID.id);
        setSelectedSalesRepName(data.SalesRep_ID.identifier || '');
      }
      
      // Set other fields
      setDescription(data.Description || '');
      setIsComplete(data.IsComplete || false);
    } else if (mode === 'create' && data?.id) {
      console.log('Initializing create mode for lead:', data.id);
      // Reset form for create mode
      setSelectedActivity('Select Activity Type');
      setFromDate(new Date());
      setToDate(new Date());
      setDescription('');
      setIsComplete(false);
      setSelectedSalesRepId(null);
      setSelectedSalesRepName('');
    }
  }, [mode, data]);

  // Format date for API
  const formatDate = (date) => {
    return date.toISOString().split('.')[0] + 'Z';
  };

  // Format date for display
  const formatDisplayDate = (date) => {
    return moment(date).format('DD MMM YYYY');
  };

  // Handle save with validation
  const handleSave = async () => {
    // Validation
    if (selectedActivity === 'Select Activity Type' && mode === 'create') {
      Alert.alert('Validation Error', 'Please select an activity type.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter a description.');
      return;
    }

    if (!selectedSalesRepId) {
      Alert.alert('Validation Error', 'Please select a sales representative.');
      return;
    }

    const activityId = activityTypeMap[selectedActivity];

    // Prepare payload
    const payload = {
      StartDate: formatDate(fromDate),
      EndDate: formatDate(toDate),
      Description: description.trim(),
      IsComplete: isComplete,
      SalesRep_ID: {
        id: selectedSalesRepId,
        identifier: selectedSalesRepName
      }
    };

    // For create mode, add activity type and lead ID
    if (mode === 'create') {
      payload.ContactActivityType = { id: activityId };
      payload.AD_User_ID = data; // This should be the lead object or just ID
    }

    console.log('Saving activity with payload:', payload);

    try {
      if (mode === 'edit') {
        // Update existing activity
        await updateFollowupMutation.mutateAsync({
          id: data.id,
          updates: payload,
        });
        
        if (isMounted) {
          Alert.alert(
            'Success',
            'Activity updated successfully!',
            [
              {
                text: 'OK',
                onPress: () => {
                  if (isMounted) {
                    navigation.goBack();
                  }
                },
              },
            ]
          );
        }
      } else {
        // Create new activity
        await createFollowupMutation.mutateAsync(payload);
        
        if (isMounted) {
          Alert.alert(
            'Success',
            'Activity created successfully!',
            [
              {
                text: 'OK',
                onPress: () => {
                  if (isMounted) {
                    navigation.goBack();
                  }
                },
              },
            ]
          );
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      if (isMounted) {
        Alert.alert(
          'Error',
          `Failed to save activity: ${error.message || 'Unknown error'}`
        );
      }
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (mode !== 'edit' || !data?.id) return;

    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFollowupMutation.mutateAsync(data.id);
              if (isMounted) {
                Alert.alert(
                  'Success',
                  'Activity deleted successfully!',
                  [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
              }
            } catch (error) {
              if (isMounted) {
                Alert.alert('Error', 'Failed to delete activity.');
              }
            }
          },
        },
      ]
    );
  };

  // Animation helpers
  const toggleActivitySection = () => {
    setActivityCollapsed(!activityCollapsed);
    Animated.timing(activityAnim, {
      toValue: activityCollapsed ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const getRotation = (anim) =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

  // Date handlers
  const handleFromDatePress = () => {
    setCalendarMode('from');
    setCalendarTitle('Select Start Date');
    setShowCalendar(true);
  };

  const handleToDatePress = () => {
    setCalendarMode('to');
    setCalendarTitle('Select End Date');
    setShowCalendar(true);
  };

  const handleDateSelect = (date) => {
    const selectedDate = new Date(date);
    
    if (calendarMode === 'from') {
      setFromDate(selectedDate);
      // If from date is after to date, update to date as well
      if (selectedDate > toDate) {
        setToDate(selectedDate);
      }
    } else {
      // Ensure to date is not before from date
      if (selectedDate < fromDate) {
        Alert.alert('Invalid Date', 'End date cannot be before start date.');
        return;
      }
      setToDate(selectedDate);
    }
    setShowCalendar(false);
  };

  const selectActivity = (type) => {
    setSelectedActivity(type);
    setActivityCollapsed(true);
  };

  // Handle sales rep selection
  const handleSelectSalesRep = (rep) => {
    setSelectedSalesRepId(rep.id);
    setSelectedSalesRepName(rep.Name);
    setShowSalesRepModal(false);
    setSalesRepSearch('');
  };

  // Clear selected sales rep
  const handleClearSalesRep = () => {
    setSelectedSalesRepId(null);
    setSelectedSalesRepName('');
  };

  // Render sales rep item
  const renderSalesRepItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.repItem,
        selectedSalesRepId === item.id && styles.selectedRepItem,
      ]}
      onPress={() => handleSelectSalesRep(item)}
      activeOpacity={0.7}
    >
      <View style={styles.repItemContent}>
        <Text style={styles.repName}>{item.Name}</Text>
        {item.EMail && (
          <Text style={styles.repEmail}>{item.EMail}</Text>
        )}
      </View>
      {selectedSalesRepId === item.id && (
        <Icon name="check" size={20} color={Colors.primary} />
      )}
    </TouchableOpacity>
  );

  // Loading state
  const isLoading = createFollowupMutation.isLoading || 
                    updateFollowupMutation.isLoading || 
                    deleteFollowupMutation.isLoading || 
                    loadingSalesReps;

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <CustomHeader 
        title={mode === 'edit' ? 'Edit Activity' : 'Add Activity'}
        LeftIcon="arrow-left"
        LeftPress={() => navigation.goBack()}
        RightIcon={null}
        RightPress={null}
      />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>
            {createFollowupMutation.isLoading ? 'Creating...' : 
             updateFollowupMutation.isLoading ? 'Updating...' :
             deleteFollowupMutation.isLoading ? 'Deleting...' :
             'Loading data...'}
          </Text>
        </View>
      )}

      {/* Calendar Modal */}
      <CalendarModal
        visible={showCalendar}
        initialDate={calendarMode === 'from' ? fromDate : toDate}
        onClose={() => setShowCalendar(false)}
        onSelectDate={handleDateSelect}
        title={calendarTitle}
        minDate={calendarMode === 'to' ? fromDate : undefined}
      />

      {/* Sales Representative Modal */}
      <Modal
        visible={showSalesRepModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowSalesRepModal(false);
          setSalesRepSearch('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Sales Representative</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowSalesRepModal(false);
                  setSalesRepSearch('');
                }}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            {/* Search Input */}
            <View style={styles.modalSearch}>
              <Icon name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
              <RNTextInput
                style={styles.modalSearchInput}
                placeholder="Search by name..."
                placeholderTextColor={Colors.textTertiary}
                value={salesRepSearch}
                onChangeText={setSalesRepSearch}
                autoFocus={true}
              />
              {salesRepSearch.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSalesRepSearch('')}
                  style={styles.clearSearchButton}
                >
                  <Icon name="close" size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
            
            {/* Sales Representatives List */}
            <FlatList
              data={filteredSalesReps}
              renderItem={renderSalesRepItem}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={
                <View style={styles.modalEmpty}>
                  <Icon name="person-off" size={50} color={Colors.border} />
                  <Text style={styles.modalEmptyText}>
                    {salesRepSearch.trim() 
                      ? `No sales representatives found for "${salesRepSearch}"`
                      : 'No sales representatives available'}
                  </Text>
                </View>
              }
              style={styles.repList}
              contentContainerStyle={styles.repListContent}
            />
            
            {/* Footer */}
            <View style={styles.modalFooter}>
              <Text style={styles.footerText}>
                {filteredSalesReps.length} of {salesReps.length} sales representatives
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.formWrapper}
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Activity Type (only for create mode) */}
            {mode === 'create' && (
              <View style={styles.fieldContainer}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>Activity Type</Text>
                  <Text style={styles.requiredStar}> *</Text>
                </View>

                <TouchableOpacity
                  onPress={toggleActivitySection}
                  style={styles.selector}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.selectorText,
                    selectedActivity === 'Select Activity Type' && styles.placeholderText
                  ]}>
                    {selectedActivity}
                  </Text>
                  <Animated.View
                    style={{ transform: [{ rotate: getRotation(activityAnim) }] }}
                  >
                    <AntDesign name="down" size={Layout.iconSize.sm} color={Colors.primary} />
                  </Animated.View>
                </TouchableOpacity>

                {!activityCollapsed && (
                  <View style={styles.optionsContainer}>
                    {Object.keys(activityTypeMap).map((type) => (
                      <TouchableOpacity
                        key={type}
                        onPress={() => selectActivity(type)}
                        style={styles.optionItem}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.optionText}>{type}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Sales Representative - Searchable Picker */}
            <View style={styles.fieldContainer}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Sales Representative</Text>
                <Text style={styles.requiredStar}> *</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.selector,
                  !selectedSalesRepId && styles.selectorEmpty,
                ]}
                onPress={() => setShowSalesRepModal(true)}
                activeOpacity={0.7}
              >
                {selectedSalesRepName ? (
                  <View style={styles.selectedItemContainer}>
                    <View style={styles.selectedItemInfo}>
                      <MaterialCommunityIcons name="account-tie" size={Layout.iconSize.sm} color={Colors.primary} />
                      <Text style={styles.selectedItemText}>{selectedSalesRepName}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleClearSalesRep();
                      }}
                    >
                      <Icon name="close" size={18} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text style={styles.placeholderText}>Select Sales Representative</Text>
                    <Icon name="arrow-drop-down" size={24} color={Colors.textSecondary} />
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Start Date */}
            <View style={styles.fieldContainer}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Start Date</Text>
                <Text style={styles.requiredStar}> *</Text>
              </View>
              <TouchableOpacity
                onPress={handleFromDatePress}
                style={styles.selector}
                activeOpacity={0.7}
              >
                <Text style={styles.selectorText}>
                  {formatDisplayDate(fromDate)}
                </Text>
                <EvilIcons name="calendar" size={Layout.iconSize.lg} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {/* End Date */}
            <View style={styles.fieldContainer}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>End Date</Text>
                <Text style={styles.requiredStar}> *</Text>
              </View>
              <TouchableOpacity
                onPress={handleToDatePress}
                style={styles.selector}
                activeOpacity={0.7}
              >
                <Text style={styles.selectorText}>
                  {formatDisplayDate(toDate)}
                </Text>
                <EvilIcons name="calendar" size={Layout.iconSize.lg} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Description */}
            <View style={styles.fieldContainer}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Description</Text>
                <Text style={styles.requiredStar}> *</Text>
              </View>
              <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                <RNTextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter activity description..."
                  placeholderTextColor={Colors.textTertiary}
                  value={description}
                  onChangeText={setDescription}
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Complete Checkbox */}
            <TouchableOpacity
              onPress={() => setIsComplete(!isComplete)}
              style={styles.checkboxContainer}
              activeOpacity={0.7}
            >
              <Icon
                name={isComplete ? 'check-box' : 'check-box-outline-blank'}
                size={Layout.iconSize.lg}
                color={isComplete ? Colors.primary : Colors.textSecondary}
              />
              <Text style={[
                styles.checkboxLabel,
                isComplete && styles.checkboxLabelChecked
              ]}>
                Mark as Complete
              </Text>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              {mode === 'edit' && (
                <TouchableOpacity
                  onPress={handleDelete}
                  style={[styles.actionButton, styles.deleteButton]}
                  disabled={deleteFollowupMutation.isLoading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.deleteButtonText}>
                    {deleteFollowupMutation.isLoading ? 'Deleting...' : 'Delete'}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleSave}
                style={[
                  styles.actionButton, 
                  styles.saveButton,
                  mode !== 'edit' && styles.fullWidthButton
                ]}
                disabled={createFollowupMutation.isLoading || updateFollowupMutation.isLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.saveButtonText}>
                  {createFollowupMutation.isLoading || updateFollowupMutation.isLoading
                    ? 'Saving...'
                    : mode === 'edit' ? 'Update' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomSpacing} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || '#EDEBEB',
  },
  keyboardView: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: 'K2D-Medium',
  },
  formWrapper: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: Layout.borderRadius.lg,
    elevation: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  formContent: {
    padding: Spacing.lg,
  },
  fieldContainer: {
    marginBottom: Spacing.md,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xxs,
  },
  label: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  requiredStar: {
    color: Colors.error,
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.bold,
    marginLeft: 2,
  },
  
  // Selector Styles
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 0,
    height: 42,
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    
    // Elevation for Android
    elevation: 2,
  },
  selectorText: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },
  selectorEmpty: {
    borderColor: Colors.errorLight,
  },
  placeholderText: {
    fontSize: Typography.fontSize.small,
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily.regular,
  },

  // Options Dropdown
  optionsContainer: {
    marginTop: Spacing.xs,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.sm,
    overflow: 'hidden',
  },
  optionItem: {
    paddingVertical: verticalScale(10),
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  optionText: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },

  // Selected Item Styles
  selectedItemContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  selectedItemText: {
    fontSize: Typography.fontSize.small,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.regular,
  },
  clearButton: {
    padding: Spacing.xxs,
  },

  // Input Styles
  inputWrapper: {
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.sm,
    justifyContent: 'center',
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    
    // Elevation for Android
    elevation: 2,
  },
  input: {
    height: 42,
    paddingHorizontal: Spacing.sm,
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  textAreaWrapper: {
    minHeight: verticalScale(80),
  },
  textArea: {
    minHeight: verticalScale(80),
    textAlignVertical: 'top',
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(10),
  },

  // Checkbox
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  checkboxLabel: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  checkboxLabelChecked: {
    color: Colors.primary,
  },

  // Action Buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  actionButton: {
    paddingVertical: verticalScale(12),
    paddingHorizontal: Spacing.xl,
    borderRadius: Layout.borderRadius.md,
    minWidth: scale(100),
    alignItems: 'center',
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    
    // Elevation for Android
    elevation: 3,
  },
  fullWidthButton: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: Colors.error,
  },
  deleteButtonText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.semiBold,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.semiBold,
  },
  bottomSpacing: {
    height: verticalScale(20),
  },

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
  modalSearch: {
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
  modalSearchInput: {
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
  },
  repName: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  repEmail: {
    fontSize: Typography.fontSize.xsmall,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
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
});

export default AddActivity;