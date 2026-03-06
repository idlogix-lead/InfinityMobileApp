// screens/CRM/AddActivity.js - UPDATED with custom themed alerts

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
import { useAuthStore } from '../../store/authStore';
import moment from 'moment';

// Import theme
import theme from '../../constants/CRMTheme/CRMTheme';
import CalendarModal from '../../components/RequestScreenComponents/Calendar/CalendarModal';
import CustomAlert from '../../components/CustomAlert'; 
const { Colors, Typography, Layout, Spacing } = theme;
const { scale, verticalScale } = Layout;

const AddActivity = ({ route, navigation }) => {
  const { data, mode } = route.params;
  const queryClient = useQueryClient();
  
  // Get auth state
  const authUserId = useAuthStore((state) => state.userId);
  const authUserName = useAuthStore((state) => state.userName);
  
  console.log('🔐 AddActivity - Current logged in user:', { authUserId, authUserName });
  
  // State to track if component is mounted
  const [isMounted, setIsMounted] = useState(false);
  const [initialRepSet, setInitialRepSet] = useState(false);

  // Custom alert state
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info', // 'info', 'success', 'error', 'warning', 'delete'
    onConfirm: null,
    onCancel: null,
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancelButton: false,
  });

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

  // Get selected sales rep name
  const selectedRepName = useMemo(() => {
    if (!selectedSalesRepId) return '';
    const rep = salesReps.find(r => r.id === selectedSalesRepId);
    return rep ? rep.Name : selectedSalesRepName;
  }, [selectedSalesRepId, salesReps, selectedSalesRepName]);

  // Set default sales rep to current user once salesReps are loaded
  useEffect(() => {
    // Only run for create mode and when we haven't set initial rep yet
    if (mode === 'create' && !initialRepSet && salesReps.length > 0 && authUserId && !selectedSalesRepId) {
      console.log('🎯 AddActivity - Setting default sales rep to current user:', authUserId);
      
      // Try to find current user in sales reps list by ID
      const currentUserAsRep = salesReps.find(rep => rep.id === parseInt(authUserId));
      
      if (currentUserAsRep) {
        console.log('✅ Found current user in sales reps list:', currentUserAsRep.Name);
        setSelectedSalesRepId(currentUserAsRep.id);
        setSelectedSalesRepName(currentUserAsRep.Name);
        setInitialRepSet(true);
      } else {
        console.log('⚠️ Current user not found in sales reps list, looking by name...');
        
        // Try to find by name as fallback
        const userByName = salesReps.find(rep => 
          rep.Name && rep.Name.toLowerCase() === authUserName?.toLowerCase()
        );
        
        if (userByName) {
          console.log('✅ Found current user by name:', userByName.Name);
          setSelectedSalesRepId(userByName.id);
          setSelectedSalesRepName(userByName.Name);
          setInitialRepSet(true);
        } else {
          console.log('❌ Could not find current user in sales reps list');
          console.log('Auth User:', { id: authUserId, name: authUserName });
        }
      }
    }
  }, [mode, salesReps, authUserId, authUserName, selectedSalesRepId, initialRepSet]);

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
        setInitialRepSet(true);
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
      // Don't reset sales rep here - it will be set by the default rep useEffect
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

  // Custom alert helper functions
  const showAlert = (title, message, type = 'info', onConfirm = null, onCancel = null) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      onConfirm: onConfirm || (() => setAlertConfig(prev => ({ ...prev, visible: false }))),
      onCancel: onCancel || (() => setAlertConfig(prev => ({ ...prev, visible: false }))),
      confirmText: type === 'delete' ? 'Delete' : 'OK',
      cancelText: 'Cancel',
      showCancelButton: type === 'delete' || type === 'warning',
    });
  };

  const showSuccessAlert = (message, onConfirm = null) => {
    showAlert('Success', message, 'success', onConfirm);
  };

  const showErrorAlert = (message, onConfirm = null) => {
    showAlert('Error', message, 'error', onConfirm);
  };

  const showValidationAlert = (message) => {
    showAlert('Validation Error', message, 'warning');
  };

  const showDeleteConfirmation = (onConfirm) => {
    showAlert(
      'Delete Activity',
      'Are you sure you want to delete this activity?',
      'delete',
      onConfirm
    );
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  // Handle save with validation
  const handleSave = async () => {
    // Validation
    if (selectedActivity === 'Select Activity Type' && mode === 'create') {
      showValidationAlert('Please select an activity type.');
      return;
    }

    if (!description.trim()) {
      showValidationAlert('Please enter a description.');
      return;
    }

    if (!selectedSalesRepId) {
      showValidationAlert('Please select a sales representative.');
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
          showSuccessAlert('Activity updated successfully!', () => {
            hideAlert();
            if (isMounted) {
              navigation.goBack();
            }
          });
        }
      } else {
        // Create new activity
        await createFollowupMutation.mutateAsync(payload);
        
        if (isMounted) {
          showSuccessAlert('Activity created successfully!', () => {
            hideAlert();
            if (isMounted) {
              navigation.goBack();
            }
          });
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      if (isMounted) {
        showErrorAlert(`Failed to save activity: ${error.message || 'Unknown error'}`);
      }
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (mode !== 'edit' || !data?.id) return;

    showDeleteConfirmation(async () => {
      try {
        await deleteFollowupMutation.mutateAsync(data.id);
        hideAlert();
        if (isMounted) {
          showSuccessAlert('Activity deleted successfully!', () => {
            hideAlert();
            navigation.goBack();
          });
        }
      } catch (error) {
        hideAlert();
        if (isMounted) {
          showErrorAlert('Failed to delete activity.');
        }
      }
    });
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
        showValidationAlert('End date cannot be before start date.');
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
    setInitialRepSet(false); // Allow re-setting default if cleared
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
        {item.id === parseInt(authUserId) && (
          <Text style={styles.currentUserBadge}>(You)</Text>
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

      {/* Custom Alert Modal */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={() => {
          alertConfig.onConfirm();
          hideAlert();
        }}
        onCancel={() => {
          if (alertConfig.onCancel) {
            alertConfig.onCancel();
          }
          hideAlert();
        }}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        showCancelButton={alertConfig.showCancelButton}
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

      {/* Sales Representative Modal - Same as AddLeads */}
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
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
              <RNTextInput
                style={styles.searchInput}
                placeholder="Search by name..."
                placeholderTextColor="#999"
                value={salesRepSearch}
                onChangeText={setSalesRepSearch}
                autoFocus={true}
              />
              {salesRepSearch.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSalesRepSearch('')}
                  style={styles.clearSearchButton}
                >
                  <Icon name="close" size={18} color="#666" />
                </TouchableOpacity>
              )}
            </View>
            
            {/* Sales Representatives List */}
            <FlatList
              data={filteredSalesReps}
              renderItem={renderSalesRepItem}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="person-off" size={50} color="#ccc" />
                  <Text style={styles.emptyText}>
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

           {/* Sales Representative - Searchable Picker - Same as AddLeads */}
<View style={styles.pickerContainer}>
  <View style={styles.labelContainer}>
    <Text style={styles.label}>Assigned To (Sales Representative)*</Text>
    <Text style={styles.requiredStar}> *</Text>
  </View>
  <TouchableOpacity
    style={[
      styles.salesRepSelector,
      !selectedSalesRepId && styles.selectorError,
    ]}
    onPress={() => setShowSalesRepModal(true)}
    activeOpacity={0.7}
  >
    {selectedRepName ? (
      <View style={styles.selectedRepContainer}>
        <View style={styles.selectedRepInfo}>
          <Text style={styles.selectedRepText}>{selectedRepName}</Text>
        </View>
        <View style={styles.rightContainer}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={(e) => {
              e.stopPropagation();
              handleClearSalesRep();
            }}
          >
            <Icon name="close" size={18} color="#666" />
          </TouchableOpacity>
         <AntDesign name="down" size={Layout.iconSize.sm} color={Colors.primary} />
        </View>
      </View>
    ) : (
      <>
        <Text style={styles.placeholderText}>Select Sales Representative</Text>
   <AntDesign name="down" size={Layout.iconSize.sm} color={Colors.primary} />
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

// Styles - Updated to match AddLeads UI
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEBEB',
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
    color: '#333',
    fontFamily: 'K2D-Medium',
  },
  formWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  formContent: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    color: '#333',
    fontFamily: 'K2D-SemiBold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  requiredStar: {
    color: '#FF3B30',
    fontSize: 14,
    fontFamily: 'K2D-SemiBold',
    marginLeft: 2,
  },
  
  // Selector Styles
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
    backgroundColor: '#FFFFFF',
    
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    
    // Elevation for Android
    elevation: 3,
  },
  selectorText: {
    fontSize: 15,
    fontFamily: 'K2D-Regular',
    color: '#333',
  },
  
  // Sales Rep Selector Styles (copied from AddLeads)
  salesRepSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    
    // Elevation for Android
    elevation: 3,
  },
  selectorError: {
    borderColor: '#FF3B30',
    shadowColor: '#FF3B30',
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
    gap: 8,
  },
  selectedRepText: {
    fontSize: 15,
    color: '#333',
    fontFamily: 'K2D-Regular',
  },
  placeholderText: {
    fontSize: 15,
    color: '#999',
    fontFamily: 'K2D-Regular',
    flex: 1,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  
  // Options Dropdown
  optionsContainer: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
    
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    
    // Elevation for Android
    elevation: 3,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 15,
    fontFamily: 'K2D-Regular',
    color: '#333',
  },

  // Input Styles
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    
    // Elevation for Android
    elevation: 3,
  },
  input: {
    height: 48,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: 'K2D-Regular',
    color: '#333',
    includeFontPadding: false,
  },
  textAreaWrapper: {
    minHeight: 100,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingBottom: 12,
  },

  // Checkbox
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxLabel: {
    fontSize: 15,
    fontFamily: 'K2D-Medium',
    color: '#666',
    marginLeft: 8,
  },
  checkboxLabelChecked: {
    color: '#2F4FE3',
  },

  // Action Buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 20,
  },
  actionButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    
    // Elevation for Android
    elevation: 4,
  },
  fullWidthButton: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'K2D-SemiBold',
  },
  saveButton: {
    backgroundColor: '#2F4FE3',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'K2D-SemiBold',
  },
  bottomSpacing: {
    height: 20,
  },

  // Modal Styles (copied from AddLeads)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    
    // Shadow for iOS
    shadowColor: '#000',
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'K2D-SemiBold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    
    // Elevation for Android
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    fontFamily: 'K2D-Regular',
    color: '#333',
    paddingVertical: 0,
  },
  clearSearchButton: {
    padding: 4,
  },
  repList: {
    maxHeight: 400,
  },
  repListContent: {
    paddingBottom: 16,
  },
  repItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedRepItem: {
    backgroundColor: '#f0f5ff',
  },
  repItemContent: {
    flex: 1,
  },
  repName: {
    fontSize: 15,
    fontFamily: 'K2D-SemiBold',
    color: '#333',
  },
  repEmail: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'K2D-Regular',
    marginTop: 2,
  },
  currentUserBadge: {
    fontSize: 10,
    color: '#2F4FE3',
    fontFamily: 'K2D-Medium',
    marginTop: 2,
  },
  currentUserBadgeSmall: {
    fontSize: 10,
    color: '#2F4FE3',
    fontFamily: 'K2D-Medium',
    marginLeft: 4,
  },
  rightContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
},
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'K2D-Regular',
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    fontFamily: 'K2D-Regular',
    color: '#666',
  },
});

export default AddActivity;