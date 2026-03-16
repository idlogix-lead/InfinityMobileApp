// screens/CRM/AddActivity.js – Fully themed with CRMTheme and safe‑area header fix

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
  Modal,
  FlatList,
  ActivityIndicator,
  TextInput as RNTextInput,
  StatusBar,
  SafeAreaView,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useMutation, useQueryClient } from 'react-query';
import AntDesign from 'react-native-vector-icons/AntDesign';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomHeader from '../../components/CustomHeader';
import {
  useCreateFollowup,
  useUpdateFollowup,
  useDeleteFollowup,
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

  const authUserId = useAuthStore((state) => state.userId);
  const authUserName = useAuthStore((state) => state.userName);

  const [isMounted, setIsMounted] = useState(false);
  const [initialRepSet, setInitialRepSet] = useState(false);

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    onCancel: null,
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancelButton: false,
  });

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [isComplete, setIsComplete] = useState(false);
  const [activityCollapsed, setActivityCollapsed] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState('Select Activity Type');
  const [description, setDescription] = useState('');

  const [selectedSalesRepId, setSelectedSalesRepId] = useState(null);
  const [selectedSalesRepName, setSelectedSalesRepName] = useState('');
  const [showSalesRepModal, setShowSalesRepModal] = useState(false);
  const [salesRepSearch, setSalesRepSearch] = useState('');

  const [calendarMode, setCalendarMode] = useState('from');
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarTitle, setCalendarTitle] = useState('Select Date');

  const activityAnim = React.useRef(new Animated.Value(0)).current;

  const { data: salesReps = [], isLoading: loadingSalesReps } = useSalesRepresentatives(isMounted);

  const createFollowupMutation = useCreateFollowup();
  const updateFollowupMutation = useUpdateFollowup();
  const deleteFollowupMutation = useDeleteFollowup();

  const activityTypeMap = {
    Email: 'EM',
    Phone: 'PC',
    Meeting: 'ME',
    Task: 'TA',
  };

  const activityLabelMap = {
    EM: 'Email',
    PC: 'Phone',
    ME: 'Meeting',
    TA: 'Task',
  };

  const filteredSalesReps = useMemo(() => {
    if (!salesRepSearch.trim()) return salesReps;
    const query = salesRepSearch.toLowerCase();
    return salesReps.filter((rep) => rep.Name && rep.Name.toLowerCase().includes(query));
  }, [salesReps, salesRepSearch]);

  const selectedRepName = useMemo(() => {
    if (!selectedSalesRepId) return '';
    const rep = salesReps.find((r) => r.id === selectedSalesRepId);
    return rep ? rep.Name : selectedSalesRepName;
  }, [selectedSalesRepId, salesReps, selectedSalesRepName]);

  useEffect(() => {
    if (mode === 'create' && !initialRepSet && salesReps.length > 0 && authUserId && !selectedSalesRepId) {
      const currentUserAsRep = salesReps.find((rep) => rep.id === parseInt(authUserId, 10));
      if (currentUserAsRep) {
        setSelectedSalesRepId(currentUserAsRep.id);
        setSelectedSalesRepName(currentUserAsRep.Name);
        setInitialRepSet(true);
      } else {
        const userByName = salesReps.find(
          (rep) => rep.Name && rep.Name.toLowerCase() === authUserName?.toLowerCase()
        );
        if (userByName) {
          setSelectedSalesRepId(userByName.id);
          setSelectedSalesRepName(userByName.Name);
          setInitialRepSet(true);
        }
      }
    }
  }, [mode, salesReps, authUserId, authUserName, selectedSalesRepId, initialRepSet]);

  useEffect(() => {
    if (mode === 'edit' && data) {
      const activityId = data?.ContactActivityType?.id;
      setSelectedActivity(activityLabelMap[activityId] || 'Select Activity Type');
      if (data.StartDate) setFromDate(new Date(data.StartDate));
      if (data.EndDate) setToDate(new Date(data.EndDate));
      if (data.SalesRep_ID?.id) {
        setSelectedSalesRepId(data.SalesRep_ID.id);
        setSelectedSalesRepName(data.SalesRep_ID.identifier || '');
        setInitialRepSet(true);
      }
      setDescription(data.Description || '');
      setIsComplete(data.IsComplete || false);
    } else if (mode === 'create' && data?.id) {
      setSelectedActivity('Select Activity Type');
      setFromDate(new Date());
      setToDate(new Date());
      setDescription('');
      setIsComplete(false);
    }
  }, [mode, data]);

  const formatDate = (date) => date.toISOString().split('.')[0] + 'Z';
  const formatDisplayDate = (date) => moment(date).format('DD MMM YYYY');

  const showAlert = (title, message, type = 'info', onConfirm = null, onCancel = null) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      onConfirm: onConfirm || (() => setAlertConfig((prev) => ({ ...prev, visible: false }))),
      onCancel: onCancel || (() => setAlertConfig((prev) => ({ ...prev, visible: false }))),
      confirmText: type === 'delete' ? 'Delete' : 'OK',
      cancelText: 'Cancel',
      showCancelButton: type === 'delete' || type === 'warning',
    });
  };

  const showSuccessAlert = (message, onConfirm = null) => showAlert('Success', message, 'success', onConfirm);
  const showErrorAlert = (message, onConfirm = null) => showAlert('Error', message, 'error', onConfirm);
  const showValidationAlert = (message) => showAlert('Validation Error', message, 'warning');
  const showDeleteConfirmation = (onConfirm) => showAlert('Delete Activity', 'Are you sure you want to delete this activity?', 'delete', onConfirm);
  const hideAlert = () => setAlertConfig((prev) => ({ ...prev, visible: false }));

  const handleSave = async () => {
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
    const payload = {
      StartDate: formatDate(fromDate),
      EndDate: formatDate(toDate),
      Description: description.trim(),
      IsComplete: isComplete,
      SalesRep_ID: { id: selectedSalesRepId, identifier: selectedSalesRepName },
    };

    if (mode === 'create') {
      payload.ContactActivityType = { id: activityId };
      payload.AD_User_ID = data;
    }

    try {
      if (mode === 'edit') {
        await updateFollowupMutation.mutateAsync({ id: data.id, updates: payload });
        if (isMounted) {
          showSuccessAlert('Activity updated successfully!', () => {
            hideAlert();
            if (isMounted) navigation.goBack();
          });
        }
      } else {
        await createFollowupMutation.mutateAsync(payload);
        if (isMounted) {
          showSuccessAlert('Activity created successfully!', () => {
            hideAlert();
            if (isMounted) navigation.goBack();
          });
        }
      }
    } catch (error) {
      if (isMounted) showErrorAlert(`Failed to save activity: ${error.message || 'Unknown error'}`);
    }
  };

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
        if (isMounted) showErrorAlert('Failed to delete activity.');
      }
    });
  };

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
      if (selectedDate > toDate) setToDate(selectedDate);
    } else {
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

  const handleSelectSalesRep = (rep) => {
    setSelectedSalesRepId(rep.id);
    setSelectedSalesRepName(rep.Name);
    setShowSalesRepModal(false);
    setSalesRepSearch('');
  };

  const handleClearSalesRep = () => {
    setSelectedSalesRepId(null);
    setSelectedSalesRepName('');
    setInitialRepSet(false);
  };

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
        {item.EMail && <Text style={styles.repEmail}>{item.EMail}</Text>}
        {item.id === parseInt(authUserId, 10) && (
          <Text style={styles.currentUserBadge}>(You)</Text>
        )}
      </View>
      {selectedSalesRepId === item.id && (
        <Icon name="check" size={Layout.iconSize.sm} color={Colors.primary} />
      )}
    </TouchableOpacity>
  );

  const isLoading =
    createFollowupMutation.isLoading ||
    updateFollowupMutation.isLoading ||
    deleteFollowupMutation.isLoading ||
    loadingSalesReps;

  // Safe area header wrapper
  const HeaderWrapper = Platform.OS === 'ios' ? SafeAreaView : View;
  const headerWrapperStyle = Platform.OS === 'android'
    ? { paddingTop: RNStatusBar.currentHeight || 0, backgroundColor: 'transparent' }
    : { backgroundColor: 'transparent' };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <HeaderWrapper style={headerWrapperStyle}>
        <CustomHeader
          title={mode === 'edit' ? 'Edit Activity' : 'Add Activity'}
          LeftIcon="arrow-left"
          LeftPress={() => navigation.goBack()}
          RightIcon={null}
          RightPress={null}
        />
      </HeaderWrapper>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>
            {createFollowupMutation.isLoading
              ? 'Creating...'
              : updateFollowupMutation.isLoading
              ? 'Updating...'
              : deleteFollowupMutation.isLoading
              ? 'Deleting...'
              : 'Loading data...'}
          </Text>
        </View>
      )}

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
          if (alertConfig.onCancel) alertConfig.onCancel();
          hideAlert();
        }}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        showCancelButton={alertConfig.showCancelButton}
      />

      <CalendarModal
        visible={showCalendar}
        initialDate={calendarMode === 'from' ? fromDate : toDate}
        onClose={() => setShowCalendar(false)}
        onSelectDate={handleDateSelect}
        title={calendarTitle}
        minDate={calendarMode === 'to' ? fromDate : undefined}
      />

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

            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
              <RNTextInput
                style={styles.searchInput}
                placeholder="Search by name..."
                placeholderTextColor={Colors.textTertiary}
                value={salesRepSearch}
                onChangeText={setSalesRepSearch}
                autoFocus={true}
              />
              {salesRepSearch.length > 0 && (
                <TouchableOpacity onPress={() => setSalesRepSearch('')} style={styles.clearSearchButton}>
                  <Icon name="close" size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filteredSalesReps}
              renderItem={renderSalesRepItem}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="person-off" size={50} color={Colors.borderDark} />
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
          <View style={styles.innerContainer}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formCard}>
                {mode === 'create' && (
                  <View style={styles.fieldContainer}>
                    <TouchableOpacity
                      onPress={toggleActivitySection}
                      style={styles.selector}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.selectorText,
                          selectedActivity === 'Select Activity Type' && styles.placeholderText,
                        ]}
                      >
                        {selectedActivity}
                      </Text>
                      <Animated.View style={{ transform: [{ rotate: getRotation(activityAnim) }] }}>
                        <AntDesign name="down" size={Layout.iconSize.sm} color={Colors.textPrimary} />
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

                <View style={styles.pickerContainer}>
                  <TouchableOpacity
                    style={[styles.salesRepSelector, !selectedSalesRepId && styles.selectorError]}
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
                            <Icon name="close" size={18} color={Colors.textSecondary} />
                          </TouchableOpacity>
                          <AntDesign name="down" size={Layout.iconSize.sm} color={Colors.textPrimary} />
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

                <View style={styles.fieldContainer}>
                  <TouchableOpacity onPress={handleFromDatePress} style={styles.selector} activeOpacity={0.7}>
                    <Text style={styles.selectorText}>{formatDisplayDate(fromDate)}</Text>
                    <EvilIcons name="calendar" size={Layout.iconSize.lg} color={Colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.fieldContainer}>
                  <TouchableOpacity onPress={handleToDatePress} style={styles.selector} activeOpacity={0.7}>
                    <Text style={styles.selectorText}>{formatDisplayDate(toDate)}</Text>
                    <EvilIcons name="calendar" size={Layout.iconSize.lg} color={Colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.fieldContainer}>
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
                  <Text style={[styles.checkboxLabel, isComplete && styles.checkboxLabelChecked]}>
                    Mark as Complete
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Bottom fixed buttons */}
            <View style={styles.bottomButtonContainer}>
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
                  mode !== 'edit' && styles.fullWidthButton,
                ]}
                disabled={createFollowupMutation.isLoading || updateFollowupMutation.isLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.saveButtonText}>
                  {createFollowupMutation.isLoading || updateFollowupMutation.isLoading
                    ? 'Saving...'
                    : mode === 'edit'
                    ? 'Update'
                    : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.medium,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.medium,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  formCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    paddingHorizontal: 0,
  },
  fieldContainer: {
    marginBottom: Spacing.md,
  },
  pickerContainer: {
    marginBottom: Spacing.md,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Spacing.md,
    height: Layout.input.height,
    backgroundColor: Colors.backgroundLight,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectorText: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },
  salesRepSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.backgroundLight,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectorError: {
    borderColor: Colors.error,
    shadowColor: Colors.error,
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
    fontSize: Typography.fontSize.medium,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.regular,
  },
  placeholderText: {
    fontSize: Typography.fontSize.medium,
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily.regular,
    flex: 1,
  },
  clearButton: {
    padding: Spacing.xxs,
    marginLeft: Spacing.xs,
  },
  optionsContainer: {
    marginTop: Spacing.xs,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionItem: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  optionText: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },
  inputWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.backgroundLight,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    height: Layout.input.height,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    includeFontPadding: false,
  },
  textAreaWrapper: {
    minHeight: verticalScale(100),
  },
  textArea: {
    minHeight: verticalScale(100),
    textAlignVertical: 'top',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    marginLeft: Spacing.sm,
  },
  checkboxLabel: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  checkboxLabelChecked: {
    color: Colors.primary,
  },
  // Bottom fixed button container
  bottomButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  actionButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Layout.borderRadius.md,
    minWidth: scale(100),
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  fullWidthButton: {
    flex: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.backgroundLight,
    borderTopLeftRadius: Layout.borderRadius.xl,
    borderTopRightRadius: Layout.borderRadius.xl,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomWidth: 0,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
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
    padding: Spacing.xs,
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
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: Layout.input.height,
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    padding: 0,
  },
  clearSearchButton: {
    padding: Spacing.xxs,
  },
  repList: {
    maxHeight: Layout.modal.maxHeight - Layout.button.height.md * 4,
  },
  repListContent: {
    paddingBottom: Spacing.md,
  },
  repItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
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
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  repEmail: {
    fontSize: Typography.fontSize.xsmall,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.regular,
    marginTop: Spacing.xxs,
  },
  currentUserBadge: {
    fontSize: Typography.fontSize.xsmall,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.medium,
    marginTop: Spacing.xxs,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  modalFooter: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    alignItems: 'center',
  },
  footerText: {
    fontSize: Typography.fontSize.small,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
});

export default AddActivity;