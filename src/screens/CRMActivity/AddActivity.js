// screens/CRM/AddActivity.js
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
import { useSalesRepresentatives } from '../../services/CRMAPI/useLead';
import { useCRMStore } from '../../store/crmStore';
import moment from 'moment';

// Import theme
import theme from '../../constants/CRMTheme/CRMTheme';
import CalendarModal from '../../components/RequestScreenComponents/Calendar/CalendarModal';

const { Colors, Typography, Layout, Spacing } = theme;
const { scale, verticalScale } = Layout;

const AddActivity = ({ route, navigation }) => {
  const { data, mode } = route.params;
  const queryClient = useQueryClient();
  
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

  // Hooks
  const { data: salesReps = [], isLoading: loadingSalesReps } = useSalesRepresentatives();

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
        
        Alert.alert(
          'Success',
          'Activity updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        // Create new activity
        await createFollowupMutation.mutateAsync(payload);
        
        Alert.alert(
          'Success',
          'Activity created successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert(
        'Error',
        `Failed to save activity: ${error.message || 'Unknown error'}`
      );
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
              Alert.alert(
                'Success',
                'Activity deleted successfully!',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to delete activity.');
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
        <View style={styles.repAvatar}>
          <Text style={styles.repAvatarText}>
            {item.Name?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.repDetails}>
          <Text style={styles.repName}>{item.Name}</Text>
          {item.Email && (
            <Text style={styles.repEmail}>{item.Email}</Text>
          )}
        </View>
      </View>
      {selectedSalesRepId === item.id && (
        <MaterialCommunityIcons name="check-circle" size={Layout.iconSize.md} color={Colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <CustomHeader 
              title={mode === 'edit' ? 'Edit Activity' : 'Add Activity'}
              LeftIcon="arrow-left"
              LeftPress={() => navigation.goBack()}
              RightIcon={null}
              RightPress={null}
            />

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
                    >
                      <MaterialCommunityIcons name="close" size={Layout.iconSize.lg} color={Colors.textPrimary} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalSearch}>
                    <MaterialCommunityIcons name="magnify" size={Layout.iconSize.sm} color={Colors.textSecondary} />
                    <RNTextInput
                      style={styles.modalSearchInput}
                      placeholder="Search by name..."
                      placeholderTextColor={Colors.textTertiary}
                      value={salesRepSearch}
                      onChangeText={setSalesRepSearch}
                    />
                    {salesRepSearch.length > 0 && (
                      <TouchableOpacity onPress={() => setSalesRepSearch('')}>
                        <MaterialCommunityIcons name="close-circle" size={Layout.iconSize.sm} color={Colors.textSecondary} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {loadingSalesReps ? (
                    <View style={styles.modalLoading}>
                      <ActivityIndicator size="large" color={Colors.primary} />
                      <Text style={styles.modalLoadingText}>Loading...</Text>
                    </View>
                  ) : (
                    <FlatList
                      data={filteredSalesReps}
                      renderItem={renderSalesRepItem}
                      keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                      ListEmptyComponent={
                        <View style={styles.modalEmpty}>
                          <MaterialCommunityIcons name="account-off" size={Layout.iconSize.xl} color={Colors.border} />
                          <Text style={styles.modalEmptyText}>
                            {salesRepSearch.trim()
                              ? `No results for "${salesRepSearch}"`
                              : 'No sales representatives available'}
                          </Text>
                        </View>
                      }
                    />
                  )}
                </View>
              </View>
            </Modal>

            {/* Form Container */}
            <View style={styles.formContainer}>
              {/* Activity Type (only for create mode) */}
              {mode === 'create' && (
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Activity Type *</Text>
                  </View>

                  <TouchableOpacity
                    onPress={toggleActivitySection}
                    style={styles.dropdown}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.dropdownText,
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
                    <View style={styles.activityOptions}>
                      {Object.keys(activityTypeMap).map((type) => (
                        <TouchableOpacity
                          key={type}
                          onPress={() => selectActivity(type)}
                          style={styles.activityOption}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.activityOptionText}>{type}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </>
              )}

              {/* Sales Representative - Dynamic Searchable Picker */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Sales Representative *</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.salesRepSelector,
                  !selectedSalesRepId && styles.selectorEmpty
                ]}
                onPress={() => setShowSalesRepModal(true)}
                activeOpacity={0.7}
              >
                {selectedSalesRepName ? (
                  <View style={styles.selectedRepContainer}>
                    <View style={styles.selectedRepInfo}>
                      <MaterialCommunityIcons name="account-tie" size={Layout.iconSize.sm} color={Colors.primary} />
                      <Text style={styles.selectedRepText}>{selectedSalesRepName}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleClearSalesRep();
                      }}
                    >
                      <MaterialCommunityIcons name="close-circle" size={Layout.iconSize.sm} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text style={styles.placeholderText}>Select Sales Representative</Text>
                    <MaterialCommunityIcons name="chevron-down" size={Layout.iconSize.sm} color={Colors.textSecondary} />
                  </>
                )}
              </TouchableOpacity>

              {/* Start Date */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Start Date *</Text>
              </View>
              <TouchableOpacity
                onPress={handleFromDatePress}
                style={styles.dateInput}
                activeOpacity={0.7}
              >
                <Text style={styles.dateText}>
                  {formatDisplayDate(fromDate)}
                </Text>
                <EvilIcons name="calendar" size={Layout.iconSize.lg} color={Colors.primary} />
              </TouchableOpacity>

              {/* End Date */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>End Date *</Text>
              </View>
              <TouchableOpacity
                onPress={handleToDatePress}
                style={styles.dateInput}
                activeOpacity={0.7}
              >
                <Text style={styles.dateText}>
                  {formatDisplayDate(toDate)}
                </Text>
                <EvilIcons name="calendar" size={Layout.iconSize.lg} color={Colors.primary} />
              </TouchableOpacity>

              {/* Description */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Description *</Text>
              </View>
              <TextInput
                mode="outlined"
                multiline
                numberOfLines={4}
                placeholder="Enter activity description..."
                style={styles.descriptionInput}
                value={description}
                onChangeText={setDescription}
                theme={{
                  colors: {
                    primary: Colors.primary,
                    background: Colors.backgroundLight,
                  },
                }}
                outlineColor={Colors.border}
                activeOutlineColor={Colors.primary}
              />

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
              <View style={styles.actionButtons}>
                {mode === 'edit' && (
                  <TouchableOpacity
                    onPress={handleDelete}
                    style={[styles.button, styles.deleteButton]}
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
                  style={[styles.button, styles.saveButton]}
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
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: verticalScale(20),
  },
  formContainer: {
    backgroundColor: Colors.cardBackground,
    marginTop: verticalScale(20),
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xxs,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.backgroundLight,
    marginBottom: Spacing.md,
  },
  dropdownText: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },
  placeholderText: {
    color: Colors.textTertiary,
  },
  activityOptions: {
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  activityOption: {
    paddingVertical: verticalScale(12),
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  activityOptionText: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.backgroundLight,
    marginBottom: Spacing.md,
  },
  dateText: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },
  descriptionInput: {
    backgroundColor: Colors.backgroundLight,
    marginBottom: Spacing.md,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  checkboxLabel: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  checkboxLabelChecked: {
    color: Colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
  },
  button: {
    paddingVertical: verticalScale(12),
    paddingHorizontal: Spacing.xl,
    borderRadius: Layout.borderRadius.md,
    minWidth: scale(100),
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: Colors.error,
  },
  deleteButtonText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.semiBold,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.semiBold,
  },

  // Sales Rep Selector Styles
  salesRepSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: verticalScale(12),
    marginBottom: Spacing.md,
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    
    // Elevation for Android
    elevation: 2,
  },
  selectorEmpty: {
    borderColor: Colors.errorLight,
  },
  selectedRepContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedRepInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  selectedRepText: {
    fontSize: Typography.fontSize.medium,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.regular,
  },
  clearButton: {
    padding: Spacing.xxs,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
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
    shadowOpacity: 0.2,
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
  modalSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.md,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    gap: Spacing.xs,
    height: verticalScale(42),
    
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    
    // Elevation for Android
    elevation: 2,
  },
  modalSearchInput: {
    flex: 1,
    height: verticalScale(42),
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
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
    paddingVertical: verticalScale(32),
  },
  modalEmptyText: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary,
    textAlign: 'center',
  },

  // Rep Item Styles
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
});

export default AddActivity;