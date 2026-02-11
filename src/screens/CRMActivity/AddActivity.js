// screens/CRM/AddActivity.js
import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useMutation, useQueryClient } from 'react-query';
import AntDesign from 'react-native-vector-icons/AntDesign';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextInput } from 'react-native-paper';
import CustomHeader from '../../components/CustomHeader';
import { 
  useCreateFollowup, 
  useUpdateFollowup,
  useDeleteFollowup 
} from '../../hooks/CRMhooks/useCRM';
import { useCRMStore } from '../../store/crmStore';

const AddActivity = ({ route, navigation }) => {
  const { data, mode } = route.params;
  const queryClient = useQueryClient();
  
  // State
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [activityCollapsed, setActivityCollapsed] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState('Select Activity Type');
  const [description, setDescription] = useState('');

  // Animations
  const activityAnim = React.useRef(new Animated.Value(0)).current;

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
    }
  }, [mode, data]);

  // Format date for API
  const formatDate = (date) => {
    return date.toISOString().split('.')[0] + 'Z';
  };

  // Handle save with validation
  const handleSave = async () => {
    // Validation - SAME AS PREVIOUS CODE
    if (selectedActivity === 'Select Activity Type' && mode === 'create') {
      Alert.alert('Validation Error', 'Please select an activity type.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter a description.');
      return;
    }

    const activityId = activityTypeMap[selectedActivity];

    // Prepare payload
    const payload = {
      StartDate: formatDate(fromDate),
      EndDate: formatDate(toDate),
      Description: description.trim(),
      IsComplete: isComplete,
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
  const handleFromDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowFromDatePicker(false);
    }

    if (selectedDate) {
      setFromDate(selectedDate);
    }
  };

  const handleToDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowToDatePicker(false);
    }

    if (selectedDate) {
      setToDate(selectedDate);
    }
  };

  const selectActivity = (type) => {
    setSelectedActivity(type);
    setActivityCollapsed(true);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 ,backgroundColor: '#EDEBEB'}}
      keyboardVerticalOffset={80}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flex: 1 }}>
            <CustomHeader 
              title={mode === 'edit' ? 'Edit Activity' : 'Add Activity'}
              onBackPress={() => navigation.goBack()}
            />

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
                      <AntDesign name="down" size={16} color={'#2F4FE3'} />
                    </Animated.View>
                  </TouchableOpacity>

                  {!activityCollapsed && (
                    <View style={styles.activityOptions}>
                      {Object.keys(activityTypeMap).map((type) => (
                        <TouchableOpacity
                          key={type}
                          onPress={() => selectActivity(type)}
                          style={styles.activityOption}
                        >
                          <Text style={styles.activityOptionText}>{type}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </>
              )}

              {/* Start Date */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Start Date *</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowFromDatePicker(true)}
                style={styles.dateInput}
              >
                <Text style={styles.dateText}>
                  {fromDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
                <EvilIcons name="calendar" size={24} color={'#2F4FE3'} />
              </TouchableOpacity>
              {showFromDatePicker && (
                <DateTimePicker
                  value={fromDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleFromDateChange}
                  maximumDate={toDate}
                />
              )}

              {/* End Date */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>End Date *</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowToDatePicker(true)}
                style={styles.dateInput}
              >
                <Text style={styles.dateText}>
                  {toDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
                <EvilIcons name="calendar" size={24} color={'#2F4FE3'} />
              </TouchableOpacity>
              {showToDatePicker && (
                <DateTimePicker
                  value={toDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleToDateChange}
                  minimumDate={fromDate}
                />
              )}

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
                    primary: '#2F4FE3',
                    background: '#FFFFFF',
                  },
                }}
                outlineColor="#E0E0E0"
                activeOutlineColor="#2F4FE3"
              />

              {/* Complete Checkbox */}
              <TouchableOpacity
                onPress={() => setIsComplete(!isComplete)}
                style={styles.checkboxContainer}
              >
                <Icon
                  name={isComplete ? 'check-box' : 'check-box-outline-blank'}
                  size={24}
                  color={isComplete ? '#2F4FE3' : '#666'}
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
  formContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'K2D-SemiBold',
    color: '#333',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: 'K2D-Regular',
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  activityOptions: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  activityOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activityOptionText: {
    fontSize: 16,
    fontFamily: 'K2D-Regular',
    color: '#333',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'K2D-Regular',
    color: '#333',
  },
  descriptionInput: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxLabel: {
    fontSize: 16,
    fontFamily: 'K2D-Medium',
    color: '#666',
    marginLeft: 12,
  },
  checkboxLabelChecked: {
    color: '#2F4FE3',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'K2D-SemiBold',
  },
  saveButton: {
    backgroundColor: '#2F4FE3',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'K2D-SemiBold',
  },
});

export default AddActivity;