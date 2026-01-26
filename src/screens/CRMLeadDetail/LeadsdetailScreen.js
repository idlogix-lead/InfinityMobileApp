// screens/CRM/LeadDetailsScreen.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFollowups } from '../../hooks/CRMhooks/useCRM';
import crmApiService from '../../services/CRMAPI/crmApiService';
import moment from 'moment';
import { useMutation, useQuery, useQueryClient } from 'react-query';

const LeadDetailsScreen = ({ navigation, route }) => {
  const { data: lead } = route.params;
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateField, setDateField] = useState(null);
  const [showAllActivities, setShowAllActivities] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch lead details using getLeadById
  const { data: leadDetails, isLoading: isLoadingLead, error: leadError } = useQuery(
    ['lead', lead?.id],
    () => crmApiService.getLeadById(lead?.id),
    {
      enabled: !!lead?.id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  // Fetch all activities for this specific lead using getFollowups with userId filter
  const { data: leadActivities = [], isLoading: isLoadingActivities, error: activitiesError } = useQuery(
    ['lead-activities', lead?.id],
    () => crmApiService.getFollowups({ userId: lead?.id }),
    {
      enabled: !!lead?.id,
      staleTime: 1000 * 60 * 2, // 2 minutes
    }
  );

  // Use detailed lead data if available, otherwise use passed data
  const displayLead = leadDetails || lead;

  // Sort activities by date (newest first)
  const sortedActivities = [...leadActivities].sort((a, b) => 
    new Date(b.Created) - new Date(a.Created)
  );

  // Activities to display based on showAllActivities state
  const displayedActivities = showAllActivities 
    ? sortedActivities 
    : sortedActivities.slice(0, 5); // Show first 5 activities by default

  // Initialize edited data
  useEffect(() => {
    if (displayLead) {
      setEditedData({
        Name: displayLead.Name || '',
        EMail: displayLead.EMail || '',
        Phone: displayLead.Phone || '',
        Description: displayLead.Description || '',
        BirthDay: displayLead.BirthDay ? new Date(displayLead.BirthDay) : null,
        Phone2: displayLead.Phone2 || '',
        UserAddress1: displayLead.UserAddress1 || '',
        UserAddress2: displayLead.UserAddress2 || '',
        Comments: displayLead.Comments || '',
      });
    }
  }, [displayLead]);

  // Update lead mutation
  const updateLeadMutation = useMutation(
    ({ leadId, updates }) => crmApiService.updateLead(leadId, updates),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['leads']);
        queryClient.invalidateQueries(['lead', displayLead.id]);
        setIsEditing(false);
        Alert.alert('Success', 'Lead updated successfully');
      },
      onError: (error) => {
        Alert.alert('Error', 'Failed to update lead: ' + error.message);
      },
    }
  );

  const handleUpdate = () => {
    if (!displayLead?.id) return;

    // Prepare updates with all editable fields
    const updates = {
      Name: editedData.Name,
      EMail: editedData.EMail,
      Phone: editedData.Phone,
      Description: editedData.Description,
      Phone2: editedData.Phone2,
      UserAddress1: editedData.UserAddress1,
      UserAddress2: editedData.UserAddress2,
      Comments: editedData.Comments,
    };

    // Add birthdate if changed
    if (editedData.BirthDay) {
      updates.BirthDay = moment(editedData.BirthDay).format('YYYY-MM-DD');
    }

    updateLeadMutation.mutate({ leadId: displayLead.id, updates });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate && dateField) {
      setEditedData(prev => ({
        ...prev,
        [dateField]: selectedDate,
      }));
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'new': return '#4CAF50';
      case 'working': return '#FF9800';
      case 'converted': return '#2196F3';
      case 'expired': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getActivityIcon = (activityType) => {
    switch (activityType?.toLowerCase()) {
      case 'call': return 'phone';
      case 'email': return 'email';
      case 'meeting': return 'event';
      case 'task': return 'task';
      case 'note': return 'note';
      case 'visit': return 'location-on';
      default: return 'history';
    }
  };

  const getActivityColor = (activityType) => {
    switch (activityType?.toLowerCase()) {
      case 'call': return '#4CAF50';
      case 'email': return '#EA4335';
      case 'meeting': return '#2196F3';
      case 'task': return '#FF9800';
      case 'note': return '#9C27B0';
      case 'visit': return '#009688';
      default: return '#666';
    }
  };

  const renderActivityItem = (activity, index) => {
    const activityType = activity.ContactActivityType?.identifier || 'Activity';
    const iconName = getActivityIcon(activityType);
    const iconColor = getActivityColor(activityType);
    
    return (
      <View key={index} style={styles.activityItem}>
        <View style={[styles.activityIconContainer, { backgroundColor: iconColor + '15' }]}>
          <MaterialIcons 
            name={iconName} 
            size={20} 
            color={iconColor} 
          />
        </View>
        <View style={styles.activityContent}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityType}>{activityType}</Text>
            <Text style={styles.activityDate}>
              {moment(activity.Created).format('DD/MM/YYYY HH:mm')}
            </Text>
          </View>
          
          {activity.Description && (
            <Text style={styles.activityDescription} numberOfLines={2}>
              {activity.Description}
            </Text>
          )}
          
          {activity.IsComplete !== undefined && (
            <View style={styles.activityStatus}>
              <View style={[
                styles.statusDot,
                { backgroundColor: activity.IsComplete ? '#4CAF50' : '#FF9800' }
              ]} />
              <Text style={styles.statusText}>
                {activity.IsComplete ? 'Completed' : 'Pending'}
              </Text>
            </View>
          )}
          
          {activity.StartDate && (
            <View style={styles.activityMeta}>
              <MaterialIcons name="schedule" size={14} color="#666" />
              <Text style={styles.activityMetaText}>
                Start: {moment(activity.StartDate).format('DD/MM/YYYY HH:mm')}
              </Text>
            </View>
          )}
          
          {activity.EndDate && (
            <View style={styles.activityMeta}>
              <MaterialIcons name="event" size={14} color="#666" />
              <Text style={styles.activityMetaText}>
                End: {moment(activity.EndDate).format('DD/MM/YYYY HH:mm')}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderField = (label, value, fieldName, isEditable = true) => {
    if (isEditing && isEditable) {
      if (fieldName === 'BirthDay') {
        return (
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>{label}:</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => {
                setDateField('BirthDay');
                setShowDatePicker(true);
              }}>
              <Text style={styles.inputText}>
                {editedData.BirthDay ? moment(editedData.BirthDay).format('DD/MM/YYYY') : 'Select Date'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      }

      return (
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>{label}:</Text>
          <TextInput
            style={styles.input}
            value={editedData[fieldName] || ''}
            onChangeText={(text) => setEditedData(prev => ({
              ...prev,
              [fieldName]: text,
            }))}
            placeholder={`Enter ${label}`}
          />
        </View>
      );
    }

    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>{label}:</Text>
        <Text style={styles.value}>
          {value || 'Not provided'}
        </Text>
      </View>
    );
  };

  const renderTextArea = (label, value, fieldName, isEditable = true) => {
    if (isEditing && isEditable) {
      return (
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>{label}:</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={editedData[fieldName] || ''}
            onChangeText={(text) => setEditedData(prev => ({
              ...prev,
              [fieldName]: text,
            }))}
            placeholder={`Enter ${label}`}
            multiline
            numberOfLines={4}
          />
        </View>
      );
    }

    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>{label}:</Text>
        <Text style={styles.value}>
          {value || 'Not provided'}
        </Text>
      </View>
    );
  };

  if (isLoadingLead) {
    return (
      <View style={styles.container}>
        <CustomHeader
          title="Lead Details"
          LeftIcon="arrow-left"
          LeftPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2F4FE3" />
          <Text style={styles.loadingText}>Loading lead details...</Text>
        </View>
      </View>
    );
  }

  if (leadError || !displayLead) {
    return (
      <View style={styles.container}>
        <CustomHeader
          title="Lead Details"
          LeftIcon="arrow-left"
          LeftPress={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#F44336" />
          <Text style={styles.errorText}>Failed to load lead details</Text>
          <Text style={styles.errorSubText}>
            {leadError?.message || 'Lead not found'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Lead Details"
        LeftIcon="arrow-left"
        LeftPress={() => navigation.goBack()}
       
      />

      <ScrollView style={styles.content}>
        {/* Lead Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Lead Information</Text>
          
          <View style={styles.headerSection}>
            <Text style={styles.leadName}>{displayLead.Name}</Text>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: getStatusColor(displayLead.LeadStatus?.identifier) }
            ]}>
              <Text style={styles.statusText}>
                {displayLead.LeadStatus?.identifier || 'Unknown'}
              </Text>
            </View>
          </View>
          
          {/* Basic Information */}
          <Text style={styles.sectionSubtitle}>Basic Information</Text>
          
          {renderField('Email', displayLead.EMail, 'EMail')}
          {renderField('Primary Phone', displayLead.Phone, 'Phone')}
          {renderField('Alternate Phone', displayLead.Phone2, 'Phone2')}
          {renderField('Birthday', displayLead.BirthDay ? moment(displayLead.BirthDay).format('DD/MM/YYYY') : null, 'BirthDay')}
          
          {/* Address Information */}
          <Text style={styles.sectionSubtitle}>Address Information</Text>
          
          {renderField('Address Line 1', displayLead.UserAddress1, 'UserAddress1')}
          {renderField('Address Line 2', displayLead.UserAddress2, 'UserAddress2')}
          
          {/* Business Information */}
          <Text style={styles.sectionSubtitle}>Business Information</Text>
          
          {renderField('Business Partner', displayLead.BPName, 'BPName', false)}
          
          {displayLead.Value && (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Value/Code:</Text>
              <Text style={styles.value}>{displayLead.Value}</Text>
            </View>
          )}
          
          {displayLead.LeadSource?.identifier && (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Lead Source:</Text>
              <Text style={styles.value}>{displayLead.LeadSource.identifier}</Text>
            </View>
          )}
          
          {displayLead.C_Campaign_ID?.identifier && (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Campaign:</Text>
              <Text style={styles.value}>{displayLead.C_Campaign_ID.identifier}</Text>
            </View>
          )}
          
          {/* Organization Information */}
          <Text style={styles.sectionSubtitle}>Organization Information</Text>
          
          {displayLead.AD_Org_ID?.identifier && (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Organization:</Text>
              <Text style={styles.value}>{displayLead.AD_Org_ID.identifier}</Text>
            </View>
          )}
          
          {displayLead.AD_Client_ID?.identifier && (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Client:</Text>
              <Text style={styles.value}>{displayLead.AD_Client_ID.identifier}</Text>
            </View>
          )}
          
          {displayLead.SalesRep_ID?.identifier && (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Sales Representative:</Text>
              <Text style={styles.value}>{displayLead.SalesRep_ID.identifier}</Text>
            </View>
          )}
          
          {/* Descriptions */}
          <Text style={styles.sectionSubtitle}>Descriptions & Notes</Text>
          
          {renderTextArea('Description', displayLead.Description, 'Description', false)}
          {renderTextArea('Comments', displayLead.Comments, 'Comments')}
          
          {displayLead.LeadSourceDescription && (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Lead Source Description:</Text>
              <Text style={styles.value}>{displayLead.LeadSourceDescription}</Text>
            </View>
          )}
          
          {displayLead.LeadStatusDescription && (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Status Description:</Text>
              <Text style={styles.value}>{displayLead.LeadStatusDescription}</Text>
            </View>
          )}
          
          {/* System Information */}
          <Text style={styles.sectionSubtitle}>System Information</Text>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Created:</Text>
            <Text style={styles.value}>
              {moment(displayLead.Created).format('DD/MM/YYYY HH:mm')}
            </Text>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Last Updated:</Text>
            <Text style={styles.value}>
              {moment(displayLead.Updated).format('DD/MM/YYYY HH:mm')}
            </Text>
          </View>
          
          {displayLead.IsActive !== undefined && (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Active:</Text>
              <Text style={styles.value}>
                {displayLead.IsActive ? 'Yes' : 'No'}
              </Text>
            </View>
          )}
          
          {displayLead.IsSalesLead !== undefined && (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Is Sales Lead:</Text>
              <Text style={styles.value}>
                {displayLead.IsSalesLead ? 'Yes' : 'No'}
              </Text>
            </View>
          )}
          
          {displayLead.IsVendorLead !== undefined && (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Is Vendor Lead:</Text>
              <Text style={styles.value}>
                {displayLead.IsVendorLead ? 'Yes' : 'No'}
              </Text>
            </View>
          )}
        </View>

        {/* Activities Card */}
        <View style={styles.card}>
          <View style={styles.activitiesHeader}>
            <Text style={styles.cardTitle}>Activities ({sortedActivities.length})</Text>
            {!isLoadingActivities && sortedActivities.length > 0 && (
              <TouchableOpacity
                style={styles.addActivityButton}
                onPress={() => {
                  navigation.navigate('ActivityList', {
                    data: displayLead,
                    mode: 'create',
                  });
                }}>
                <MaterialIcons name="add" size={20} color="#2F4FE3" />
                <Text style={styles.addActivityText}>Add Activity</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {isLoadingActivities ? (
            <View style={styles.activitiesLoading}>
              <ActivityIndicator size="small" color="#2F4FE3" />
              <Text style={styles.activitiesLoadingText}>Loading activities...</Text>
            </View>
          ) : activitiesError ? (
            <View style={styles.activitiesError}>
              <MaterialIcons name="error-outline" size={24} color="#F44336" />
              <Text style={styles.activitiesErrorText}>Failed to load activities</Text>
            </View>
          ) : sortedActivities.length === 0 ? (
            <View style={styles.noActivities}>
              <MaterialIcons name="event-note" size={48} color="#ddd" />
              <Text style={styles.noActivitiesText}>No activities found</Text>
              <Text style={styles.noActivitiesSubText}>Add your first activity</Text>
              <TouchableOpacity
                style={styles.addFirstActivityButton}
                onPress={() => {
                  navigation.navigate('ActivityList', {
                    data: displayLead,
                    mode: 'create',
                  });
                }}>
                <Text style={styles.addFirstActivityText}>Add Activity</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Activity Statistics */}
              <View style={styles.activityStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {sortedActivities.filter(a => a.IsComplete).length}
                  </Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {sortedActivities.filter(a => !a.IsComplete).length}
                  </Text>
                  <Text style={styles.statLabel}>Pending</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {sortedActivities.length}
                  </Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
              </View>
              
              {/* Activities List */}
              {displayedActivities.map((activity, index) => 
                renderActivityItem(activity, index)
              )}
              
              {/* Show More/Less Button */}
              {sortedActivities.length > 5 && (
                <TouchableOpacity
                  style={styles.showMoreButton}
                  onPress={() => setShowAllActivities(!showAllActivities)}>
                  <Text style={styles.showMoreText}>
                    {showAllActivities ? 'Show Less' : `Show All (${sortedActivities.length})`}
                  </Text>
                  <MaterialIcons 
                    name={showAllActivities ? "expand-less" : "expand-more"} 
                    size={20} 
                    color="#2F4FE3" 
                  />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={editedData[dateField] || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'K2D-Medium',
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'K2D-SemiBold',
    color: '#000',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 14,
    fontFamily: 'K2D-Regular',
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#2F4FE3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontFamily: 'K2D-SemiBold',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'K2D-SemiBold',
    color: '#000',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontFamily: 'K2D-SemiBold',
    color: '#2F4FE3',
    marginTop: 16,
    marginBottom: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  leadName: {
    fontSize: 22,
    fontFamily: 'K2D-Bold',
    color: '#000',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'K2D-Medium',
    color: '#fff',
  },
  fieldContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontFamily: 'K2D-Medium',
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontFamily: 'K2D-Regular',
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'K2D-Regular',
    color: '#000',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputText: {
    fontSize: 16,
    fontFamily: 'K2D-Regular',
    color: '#000',
  },
  // Activities Styles
  activitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addActivityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2F4FE3' + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addActivityText: {
    fontSize: 14,
    fontFamily: 'K2D-Medium',
    color: '#2F4FE3',
    marginLeft: 4,
  },
  activitiesLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  activitiesLoadingText: {
    fontSize: 14,
    fontFamily: 'K2D-Regular',
    color: '#666',
    marginLeft: 8,
  },
  activitiesError: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  activitiesErrorText: {
    fontSize: 14,
    fontFamily: 'K2D-Regular',
    color: '#666',
    marginLeft: 8,
  },
  noActivities: {
    alignItems: 'center',
    padding: 40,
  },
  noActivitiesText: {
    fontSize: 16,
    fontFamily: 'K2D-Medium',
    color: '#666',
    marginTop: 12,
  },
  noActivitiesSubText: {
    fontSize: 14,
    fontFamily: 'K2D-Regular',
    color: '#999',
    marginTop: 4,
  },
  addFirstActivityButton: {
    marginTop: 16,
    backgroundColor: '#2F4FE3',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addFirstActivityText: {
    color: '#fff',
    fontFamily: 'K2D-SemiBold',
    fontSize: 14,
  },
  activityStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'K2D-Bold',
    color: '#2F4FE3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'K2D-Medium',
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#ddd',
    marginHorizontal: 8,
  },
  activityItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  activityType: {
    fontSize: 14,
    fontFamily: 'K2D-SemiBold',
    color: '#000',
    flex: 1,
  },
  activityDate: {
    fontSize: 12,
    fontFamily: 'K2D-Regular',
    color: '#666',
    marginLeft: 8,
  },
  activityDescription: {
    fontSize: 13,
    fontFamily: 'K2D-Regular',
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  activityStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'K2D-Medium',
    color: '#666',
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  activityMetaText: {
    fontSize: 11,
    fontFamily: 'K2D-Regular',
    color: '#666',
    marginLeft: 4,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 8,
  },
  showMoreText: {
    fontSize: 14,
    fontFamily: 'K2D-Medium',
    color: '#2F4FE3',
    marginRight: 4,
  },
});

export default LeadDetailsScreen;