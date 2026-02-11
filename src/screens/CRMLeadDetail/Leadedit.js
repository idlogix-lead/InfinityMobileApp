import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
  FlatList,
  Modal as RNModal,
} from 'react-native';
import React, {useState, useEffect, useMemo} from 'react';
import CustomHeader from '../../components/CustomHeader';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Menu, Divider} from 'react-native-paper';
import {useUpdateLead, useLeadStatistics, useLeadActivities} from '../../hooks/CRMhooks/useCRM';
import { useSalesRepresentatives } from '../../services/CRMAPI/useLead';

const {width} = Dimensions.get('window');

/* ================= STATUS CONFIG ================= */
const STATUS_CONFIG = {
  New: {
    barColor: '#2ECC71',
    badgeText: 'New',
    badgeBg: '#EAF8F0',
    badgeColor: '#2ECC71',
    showDot: true,
  },
  Working: {
    barColor: '#F4A623',
    badgeText: 'Working',
    badgeBg: '#FFF3E0',
    badgeColor: '#F4A623',
    showDot: true,
  },
  Converted: {
    barColor: '#4A6CF7',
    badgeText: 'Converted',
    badgeBg: '#EEF1FF',
    badgeColor: '#4A6CF7',
    showDot: false,
    showCheck: true,
  },
  Expired: {
    barColor: '#EA4747',
    badgeText: 'Expired',
    badgeBg: '#FDECEC',
    badgeColor: '#EA4747',
    showDot: true,
  },  
};

// Tab Component
const TabButton = ({title, active, onPress}) => (
  <TouchableOpacity
    style={[styles.tabButton, active && styles.tabButtonActive]}
    onPress={onPress}>
    <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
      {title}
    </Text>
  </TouchableOpacity>
);

// Activity Item Component
const ActivityItem = ({activity}) => {
  const getActivityIcon = (type) => {
    switch(type) {
      case 'Phone Call': return 'phone';
      case 'Email': return 'email';
      case 'Meeting': return 'calendar';
      case 'Task': return 'checkbox-marked-circle';
      default: return 'account';
    }
  };

  const getStatusColor = (isComplete) => {
    return isComplete ? '#2ECC71' : '#F4A623';
  };

  return (
    <View style={styles.activityItem}>
      <View style={styles.activityIconContainer}>
        <MaterialCommunityIcons 
          name={getActivityIcon(activity.ContactActivityType?.identifier || 'Task')} 
          size={24} 
          color="#2F4FE3" 
        />
      </View>
      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityTitle}>{activity.ContactActivityType?.identifier || 'Activity'}</Text>
          <View style={[styles.activityStatus, { backgroundColor: getStatusColor(activity.IsComplete) + '20' }]}>
            <Text style={[styles.activityStatusText, { color: getStatusColor(activity.IsComplete) }]}>
              {activity.IsComplete ? 'Completed' : 'Pending'}
            </Text>
          </View>
        </View>
        <Text style={styles.activityDescription} numberOfLines={2}>
          {activity.Description || 'No description'}
        </Text>
        <View style={styles.activityMeta}>
          <View style={styles.activityMetaItem}>
            <MaterialCommunityIcons name="calendar" size={14} color="#666" />
            <Text style={styles.activityMetaText}>
              {activity.StartDate ? new Date(activity.StartDate).toLocaleDateString() : 'No date'}
            </Text>
          </View>
          {activity.ContactPerson && (
            <View style={styles.activityMetaItem}>
              <MaterialCommunityIcons name="account" size={14} color="#666" />
              <Text style={styles.activityMetaText}>{activity.ContactPerson.identifier}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const LeadEdit = ({route, navigation}) => {
  const { data: leadData } = route.params;
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('basic');
  
  // Use detailed data directly (assuming data is passed from parent)
  const displayLead = leadData;

  // Menu visibility states
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [bpMenuVisible, setBpMenuVisible] = useState(false);
  const [orgMenuVisible, setOrgMenuVisible] = useState(false);
  const [leadSourceMenuVisible, setLeadSourceMenuVisible] = useState(false);
  
  // Dynamic Sales Rep Modal state
  const [salesRepModalVisible, setSalesRepModalVisible] = useState(false);
  const [salesRepSearch, setSalesRepSearch] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    phone2: '',
    birthday: '',
    salesLead: false,
    vendorLead: false,
    businessPartnerId: '1000000',
    businessPartnerLabel: 'Starlet Innovations Pvt Ltd',
    organizationId: '1000000',
    organizationLabel: 'Starlet Innovation Pvt Ltd',
    description: '',
    active: true,
    searchKey: '',
    salesRepId: '',
    salesRepLabel: '',
    companyName: '',
    leadSourceDesc: '',
    leadStatusDesc: '',
    comments: '',
    statusId: 'N',
    statusLabel: 'New',
    leadSourceId: 'CC',
    leadSourceLabel: 'Cold Call',
  });

  // Use dynamic sales representatives
  const { data: salesReps = [], isLoading: loadingSalesReps } = useSalesRepresentatives();

  // Static dropdown options
  const leadStatusOptions = [
    {id: 'N', identifier: 'New'},
    {id: 'W', identifier: 'Working'},
    {id: 'C', identifier: 'Converted'},
    {id: 'E', identifier: 'Expired'},
  ];

  const businessPartnerOptions = [
    {id: '1000000', identifier: 'Starlet Innovations Pvt Ltd'},
    {id: '1000001', identifier: 'Other Client'},
  ];

  const organizationOptions = [
    {id: '1000000', identifier: 'Starlet Innovation Pvt Ltd'},
    {id: '1000001', identifier: 'Other Organization'},
  ];

  const leadSourceOptions = [
    {id: 'CC', identifier: 'Cold Call'},
    {id: 'E', identifier: 'Email'},
    {id: 'P', identifier: 'Phone'},
    {id: 'W', identifier: 'Website'},
    {id: 'R', identifier: 'Referral'},
  ];

  // Use the custom hooks from useCRM
  const updateLeadMutation = useUpdateLead();
  const { refetch: refetchLeadStatistics } = useLeadStatistics();
  const { data: activities = [], isLoading: activitiesLoading } = useLeadActivities(displayLead?.id);

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
    if (!formData.salesRepId) return '';
    const rep = salesReps.find(r => r.id === formData.salesRepId);
    return rep ? rep.Name : '';
  }, [formData.salesRepId, salesReps]);

  // Initialize form data
  useEffect(() => {
    if (displayLead) {
      setFormData({
        name: displayLead?.Name || '',
        email: displayLead?.EMail || '',
        phone: displayLead?.Phone || '',
        phone2: displayLead?.Phone2 || '',
        birthday: displayLead?.Birthday || '',
        salesLead: displayLead?.IsSalesLead || false,
        vendorLead: displayLead?.IsVendorLead || false,
        businessPartnerId: displayLead?.AD_Client_ID?.id || '1000000',
        businessPartnerLabel: displayLead?.AD_Client_ID?.identifier || 'Starlet Innovations Pvt Ltd',
        organizationId: displayLead?.AD_Org_ID?.id || '1000000',
        organizationLabel: displayLead?.AD_Org_ID?.identifier || 'Starlet Innovation Pvt Ltd',
        description: displayLead?.Description || '',
        active: displayLead?.IsActive !== undefined ? displayLead.IsActive : true,
        searchKey: displayLead?.Value || '',
        salesRepId: displayLead?.SalesRep_ID?.id || '',
        salesRepLabel: displayLead?.SalesRep_ID?.identifier || '',
        companyName: displayLead?.BPName || '',
        leadSourceDesc: displayLead?.LeadSourceDescription || '',
        leadStatusDesc: displayLead?.LeadStatusDescription || '',
        comments: displayLead?.Comments || '',
        statusId: displayLead?.LeadStatus?.id || 'N',
        statusLabel: displayLead?.LeadStatus?.identifier || 'New',
        leadSourceId: displayLead?.LeadSource?.id || 'CC',
        leadSourceLabel: displayLead?.LeadSource?.identifier || 'Cold Call',
      });
    }
  }, [displayLead]);

  const handleSave = () => {
    // Validate required fields
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Name is required');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Validation Error', 'Email is required');
      return;
    }

    const payload = {
      Name: formData.name,
      EMail: formData.email,
      Phone: formData.phone || '',
      Phone2: formData.phone2 || '',
      Birthday: formData.birthday || null,
      IsSalesLead: formData.salesLead,
      IsVendorLead: formData.vendorLead,
      BPName: formData.companyName || '',
      AD_Org_ID: {
        id: formData.organizationId,
        identifier: formData.organizationLabel
      },
      SalesRep_ID: formData.salesRepId ? {
        id: formData.salesRepId,
        identifier: formData.salesRepLabel
      } : null,
      AD_Client_ID: {
        id: formData.businessPartnerId,
        identifier: formData.businessPartnerLabel
      },
      Description: formData.description || '',
      IsActive: formData.active,
      Value: formData.searchKey || '',
      LeadSourceDescription: formData.leadSourceDesc || '',
      LeadStatusDescription: formData.leadStatusDesc || '',
      Comments: formData.comments || '',
      LeadStatus: {
        id: formData.statusId,
        identifier: formData.statusLabel
      },
      LeadSource: {
        id: formData.leadSourceId,
        identifier: formData.leadSourceLabel
      }
    };

    // Use the mutation hook
    updateLeadMutation.mutate({
      id: displayLead.id,
      updates: payload
    }, {
      onSuccess: () => {
        Alert.alert('Success', 'Lead updated successfully!');
        setIsEditMode(false);
        refetchLeadStatistics();
      },
      onError: (error) => {
        Alert.alert('Error', error.message || 'Failed to update lead');
      }
    });
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      handleSave();
    } else {
      setIsEditMode(true);
    }
  };

  const handleAddActivity = () => {
    navigation.navigate('AddActivity', { 
      data: displayLead, 
      mode: 'create' 
    });
  };

  const updateFormData = (key, value) => {
    setFormData(prev => ({...prev, [key]: value}));
  };

  // Handle sales rep selection
  const handleSelectSalesRep = (rep) => {
    updateFormData('salesRepId', rep.id);
    updateFormData('salesRepLabel', rep.Name);
    setSalesRepModalVisible(false);
    setSalesRepSearch('');
  };

  // Clear selected sales rep
  const handleClearSalesRep = () => {
    updateFormData('salesRepId', '');
    updateFormData('salesRepLabel', '');
  };

  // Handle status update
  const handleStatusUpdate = (statusOption) => {
    updateFormData('statusId', statusOption.id);
    updateFormData('statusLabel', statusOption.identifier);
    setStatusMenuVisible(false);
  };

  // Get current status UI config
  const statusUI = STATUS_CONFIG[formData.statusLabel] || STATUS_CONFIG.New;

  // Get status config or default for unknown statuses
  const getStatusConfig = (statusLabel) => {
    return STATUS_CONFIG[statusLabel] || {
      barColor: '#6c757d',
      badgeText: statusLabel || 'Unknown',
      badgeBg: '#f8f9fa',
      badgeColor: '#6c757d',
      showDot: true,
    };
  };

  // RENDER FUNCTIONS FOR DIFFERENT FIELD TYPES
  const renderTextField = (label, value, key, placeholder, keyboardType = 'default') => {
    if (!isEditMode) {
      return (
        <View style={styles.viewField}>
          <Text style={styles.viewLabel}>{label}:</Text>
          <Text style={styles.viewValue}>{value || 'Not provided'}</Text>
        </View>
      );
    }

    return (
      <View style={styles.editField}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={(text) => updateFormData(key, text)}
          placeholderTextColor="#777"
          keyboardType={keyboardType}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
          editable={isEditMode}
        />
      </View>
    );
  };

  const renderTextAreaField = (label, value, key, placeholder) => {
    if (!isEditMode) {
      return (
        <View style={styles.viewField}>
          <Text style={styles.viewLabel}>{label}:</Text>
          <Text style={styles.viewValue}>{value || 'Not provided'}</Text>
        </View>
      );
    }

    return (
      <View style={styles.editField}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={placeholder}
          value={value}
          onChangeText={(text) => updateFormData(key, text)}
          placeholderTextColor="#777"
          multiline={true}
          numberOfLines={4}
          textAlignVertical="top"
          editable={isEditMode}
        />
      </View>
    );
  };

  const renderDropdownField = (label, value, key, onPress, disabled = false) => {
    if (!isEditMode) {
      return (
        <View style={styles.viewField}>
          <Text style={styles.viewLabel}>{label}:</Text>
          <Text style={styles.viewValue}>{value || 'Not provided'}</Text>
        </View>
      );
    }

    return (
      <View style={styles.editField}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          onPress={onPress}
          style={[styles.dropdownInput, disabled && styles.dropdownDisabled]}
          disabled={disabled}
        >
          <Text style={{color: value ? '#000' : '#777'}}>
            {value || `Select ${label}`}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={22} color="#666" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderSalesRepField = () => {
    if (!isEditMode) {
      return (
        <View style={styles.viewField}>
          <Text style={styles.viewLabel}>Sales Representative:</Text>
          <Text style={styles.viewValue}>{selectedRepName || 'Not assigned'}</Text>
        </View>
      );
    }

    return (
      <View style={styles.editField}>
        <Text style={styles.label}>Sales Representative</Text>
        <TouchableOpacity
          style={[
            styles.salesRepSelector,
            !formData.salesRepId && styles.selectorEmpty
          ]}
          onPress={() => setSalesRepModalVisible(true)}
        >
          {selectedRepName ? (
            <View style={styles.selectedRepContainer}>
              <Text style={styles.selectedRepText}>{selectedRepName}</Text>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleClearSalesRep();
                }}
              >
                <MaterialCommunityIcons name="close" size={18} color="#666" />
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.placeholderText}>Select Sales Representative</Text>
          )}
          <MaterialCommunityIcons name="chevron-down" size={22} color="#666" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderBooleanField = (label, value, key, trueText = 'Yes', falseText = 'No') => {
    const displayValue = value ? trueText : falseText;
    
    if (!isEditMode) {
      return (
        <View style={styles.viewField}>
          <Text style={styles.viewLabel}>{label}:</Text>
          <Text style={styles.viewValue}>{displayValue}</Text>
        </View>
      );
    }

    return (
      <View style={styles.editField}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          onPress={() => updateFormData(key, !value)}
          style={styles.dropdownInput}>
          <Text style={{color: '#000'}}>
            {displayValue}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={22} color="#666" />
        </TouchableOpacity>
      </View>
    );
  };

  // Render sales rep item in modal
  const renderSalesRepItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.repItem,
        formData.salesRepId === item.id && styles.selectedRepItem,
      ]}
      onPress={() => handleSelectSalesRep(item)}
    >
      <View style={styles.repItemContent}>
        <Text style={styles.repName}>{item.Name}</Text>
        {item.Email && (
          <Text style={styles.repEmail}>{item.Email}</Text>
        )}
      </View>
      {formData.salesRepId === item.id && (
        <AntDesign name="check" size={20} color="#2F4FE3" />
      )}
    </TouchableOpacity>
  );

  // Render content based on active tab
  const renderTabContent = () => {
    switch(activeTab) {
      case 'basic':
        return (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
            </View>
            <View style={styles.sectionContent}>
              {renderTextField(
                "Phone",
                formData.phone,
                'phone',
                'Enter Phone',
                'phone-pad'
              )}
              
              {renderTextField(
                "Secondary Phone",
                formData.phone2,
                'phone2',
                'Secondary Phone',
                'phone-pad'
              )}
              
              {renderTextField(
                "Birthday",
                formData.birthday,
                'birthday',
                'YYYY-MM-DD'
              )}
              
              {/* Lead Source Dropdown with Menu */}
              <View style={styles.editField}>
                <Text style={styles.label}>Lead Source</Text>
                <Menu
                  visible={leadSourceMenuVisible}
                  onDismiss={() => setLeadSourceMenuVisible(false)}
                  anchor={
                    <TouchableOpacity
                      onPress={() => setLeadSourceMenuVisible(true)}
                      style={styles.dropdownInput}
                    >
                      <Text style={{color: formData.leadSourceLabel ? '#000' : '#777'}}>
                        {formData.leadSourceLabel || 'Select Lead Source'}
                      </Text>
                      <MaterialCommunityIcons name="chevron-down" size={22} color="#666" />
                    </TouchableOpacity>
                  }
                >
                  {leadSourceOptions.map((option, index) => (
                    <React.Fragment key={option.id}>
                      <Menu.Item
                        onPress={() => {
                          updateFormData('leadSourceId', option.id);
                          updateFormData('leadSourceLabel', option.identifier);
                          setLeadSourceMenuVisible(false);
                        }}
                        title={option.identifier}
                      />
                      {index < leadSourceOptions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </Menu>
              </View>
              
              {/* Dynamic Sales Representative Field */}
              {renderSalesRepField()}
            </View>
          </View>
        );
        
      case 'company':
        return (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Company Information</Text>
            </View>
            <View style={styles.sectionContent}>
              {renderTextField(
                "Company Name",
                formData.companyName,
                'companyName',
                'Enter company name'
              )}

              {/* Business Partner Dropdown with Menu */}
              <View style={styles.editField}>
                <Text style={styles.label}>Business Partner</Text>
                <Menu
                  visible={bpMenuVisible}
                  onDismiss={() => setBpMenuVisible(false)}
                  anchor={
                    <TouchableOpacity
                      onPress={() => setBpMenuVisible(true)}
                      style={styles.dropdownInput}
                    >
                      <Text style={{color: formData.businessPartnerLabel ? '#000' : '#777'}}>
                        {formData.businessPartnerLabel || 'Select Business Partner'}
                      </Text>
                      <MaterialCommunityIcons name="chevron-down" size={22} color="#666" />
                    </TouchableOpacity>
                  }
                >
                  {businessPartnerOptions.map((option, index) => (
                    <React.Fragment key={option.id}>
                      <Menu.Item
                        onPress={() => {
                          updateFormData('businessPartnerId', option.id);
                          updateFormData('businessPartnerLabel', option.identifier);
                          setBpMenuVisible(false);
                        }}
                        title={option.identifier}
                      />
                      {index < businessPartnerOptions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </Menu>
              </View>

              {/* Organization Dropdown with Menu */}
              <View style={styles.editField}>
                <Text style={styles.label}>Organization</Text>
                <Menu
                  visible={orgMenuVisible}
                  onDismiss={() => setOrgMenuVisible(false)}
                  anchor={
                    <TouchableOpacity
                      onPress={() => setOrgMenuVisible(true)}
                      style={styles.dropdownInput}
                    >
                      <Text style={{color: formData.organizationLabel ? '#000' : '#777'}}>
                        {formData.organizationLabel || 'Select Organization'}
                      </Text>
                      <MaterialCommunityIcons name="chevron-down" size={22} color="#666" />
                    </TouchableOpacity>
                  }
                >
                  {organizationOptions.map((option, index) => (
                    <React.Fragment key={option.id}>
                      <Menu.Item
                        onPress={() => {
                          updateFormData('organizationId', option.id);
                          updateFormData('organizationLabel', option.identifier);
                          setOrgMenuVisible(false);
                        }}
                        title={option.identifier}
                      />
                      {index < organizationOptions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </Menu>
              </View>
              
              {renderTextAreaField(
                "Lead Source Description",
                formData.leadSourceDesc,
                'leadSourceDesc',
                'Enter lead source description'
              )}
            </View>
          </View>
        );
        
      case 'detailed':
        return (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Detailed Information</Text>
            </View>
            <View style={styles.sectionContent}>
              {renderBooleanField(
                "Sales Lead",
                formData.salesLead,
                'salesLead'
              )}

              {renderBooleanField(
                "Vendor Lead",
                formData.vendorLead,
                'vendorLead'
              )}

              {renderTextAreaField(
                "Description",
                formData.description,
                'description',
                'Enter description'
              )}
              
              {renderTextAreaField(
                "Comments",
                formData.comments,
                'comments',
                'Enter comments'
              )}
            </View>
          </View>
        );
        
      case 'activities':
        return (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.activitiesHeader}>
                <Text style={styles.sectionTitle}>Activity Log</Text>
                <TouchableOpacity 
                  style={styles.addActivityButtonSmall}
                  onPress={handleAddActivity}>
                  <MaterialCommunityIcons name="plus" size={20} color="#2F4FE3" />
                  <Text style={styles.addActivityText}>Add Activity</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.sectionContent}>
              {activitiesLoading ? (
                <View style={styles.loadingActivities}>
                  <ActivityIndicator size="small" color="#2F4FE3" />
                  <Text style={styles.loadingText}>Loading activities...</Text>
                </View>
              ) : activities.length > 0 ? (
                <FlatList
                  data={activities}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({item}) => <ActivityItem activity={item} />}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                  ListFooterComponent={() => <View style={styles.listFooter} />}
                />
              ) : (
                <View style={styles.noActivities}>
                  <MaterialCommunityIcons name="calendar-blank" size={48} color="#ccc" />
                  <Text style={styles.noActivitiesText}>No activities found</Text>
                  <TouchableOpacity 
                    style={styles.addFirstActivityButton}
                    onPress={handleAddActivity}>
                    <Text style={styles.addFirstActivityText}>Add First Activity</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        );
        
      default:
        return null;
    }
  };

  if (!displayLead) {
    return (
      <View style={styles.errorContainer}>
        <CustomHeader 
          title={'Lead Details'}
          LeftIcon="arrow-left"
          LeftPress={() => navigation.goBack()}
          RightIcon={null}
          RightPress={null}
          MessageNameIcon={null}
          MessageOnPress={null}
        />
        <View style={styles.errorContent}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#F44336" />
          <Text style={styles.errorText}>Failed to load lead details</Text>
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
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      
      {/* Custom Header */}
      <CustomHeader
        title={'Lead Details'}
        LeftIcon="arrow-left"
        LeftPress={() => navigation.goBack()}
        RightIcon={isEditMode ? "content-save" : "pencil"}
        RightPress={handleEditToggle}
        MessageNameIcon={null}
        MessageOnPress={null}
      />
      
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        {/* SIMPLIFIED HEADER CARD */}
        <View style={styles.headerCard}>
          <View style={[styles.statusBar, { backgroundColor: statusUI.barColor }]} />
          
          <View style={styles.headerContent}>
            {/* Avatar */}
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
              style={styles.avatar}
            />
            
            <View style={styles.contactInfoSection}>
              {/* Lead Name */}
              <Text style={styles.leadName}>{formData.name || 'Unnamed Lead'}</Text>
              
              {/* Email */}
              {formData.email ? (
                <View style={styles.contactRow}>
                  <MaterialCommunityIcons name="email" size={14} color="#666" style={styles.contactIcon} />
                  <Text style={styles.contactText} numberOfLines={1}>
                    {formData.email}
                  </Text>
                </View>
              ) : null}
              
              {/* Primary Phone */}
              {formData.phone ? (
                <View style={styles.contactRow}>
                  <MaterialCommunityIcons name="phone" size={14} color="#666" style={styles.contactIcon} />
                  <Text style={styles.contactText}>
                    {formData.phone}
                  </Text>
                </View>
              ) : null}
              
              {/* Company Name */}
              {formData.companyName ? (
                <View style={styles.contactRow}>
                  <MaterialCommunityIcons name="office-building" size={14} color="#666" style={styles.contactIcon} />
                  <Text style={styles.companyText}>
                    {formData.companyName}
                  </Text>
                </View>
              ) : null}
              
              {/* Sales Representative */}
              {selectedRepName && (
                <View style={styles.contactRow}>
                  <MaterialCommunityIcons name="account" size={14} color="#666" style={styles.contactIcon} />
                  <Text style={styles.salesRepText}>
                    Assigned to: {selectedRepName}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Right Section with Status and Activity */}
          <View style={styles.rightSection}>
            {/* Status Dropdown using Menu - Only visible in Edit Mode */}
            {isEditMode ? (
              <Menu
                visible={statusMenuVisible}
                onDismiss={() => setStatusMenuVisible(false)}
                anchor={
                  <TouchableOpacity 
                    style={[styles.statusBadge, { backgroundColor: statusUI.badgeBg }]}
                    onPress={() => setStatusMenuVisible(true)}
                    activeOpacity={0.7}
                  >
                    {statusUI.showDot && (
                      <View style={[styles.dot, { backgroundColor: statusUI.badgeColor }]} />
                    )}
                    {statusUI.showCheck && (
                      <AntDesign
                        name="checkcircle"
                        size={14}
                        color={statusUI.badgeColor}
                        style={{ marginRight: 4 }}
                      />
                    )}
                    <Text style={[styles.statusBadgeText, { color: statusUI.badgeColor }]}>
                      {statusUI.badgeText}
                    </Text>
                    <AntDesign 
                      name="down" 
                      size={12} 
                      color={statusUI.badgeColor} 
                      style={{ marginLeft: 6 }}
                    />
                  </TouchableOpacity>
                }
                style={styles.statusMenu}
              >
                {leadStatusOptions.map((option, index) => (
                  <React.Fragment key={option.id}>
                    <Menu.Item
                      onPress={() => handleStatusUpdate(option)}
                      title={option.identifier}
                      titleStyle={[
                        styles.menuItemTitle,
                        formData.statusId === option.id && styles.menuItemSelected
                      ]}
                    />
                    {index < leadStatusOptions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </Menu>
            ) : (
              <View style={[styles.statusBadge, { backgroundColor: statusUI.badgeBg }]}>
                {statusUI.showDot && (
                  <View style={[styles.dot, { backgroundColor: statusUI.badgeColor }]} />
                )}
                {statusUI.showCheck && (
                  <AntDesign
                    name="checkcircle"
                    size={14}
                    color={statusUI.badgeColor}
                    style={{ marginRight: 4 }}
                  />
                )}
                <Text style={[styles.statusBadgeText, { color: statusUI.badgeColor }]}>
                  {statusUI.badgeText}
                </Text>
              </View>
            )}
            
            {/* Add Activity Button */}
            <TouchableOpacity 
              style={styles.addActivityButton}
              onPress={handleAddActivity}
            >
              <View style={styles.addActivityIcon}>
                <Ionicons name="alarm-outline" size={28} color="#2F4FE3" />
                <AntDesign 
                  name="pluscircle" 
                  size={14} 
                  color="#2F4FE3" 
                  style={styles.activityPlus}
                />
              </View>
            </TouchableOpacity>

            {/* Status Description - Only show in edit mode */}
            {isEditMode && formData.leadStatusDesc ? (
              <Text style={styles.statusDescription} numberOfLines={1}>
                {formData.leadStatusDesc}
              </Text>
            ) : null}
          </View>
        </View>
        
        {/* EDIT MODE INDICATOR */}
        {isEditMode && (
          <View style={styles.editModeIndicator}>
            <MaterialCommunityIcons name="pencil" size={14} color="#2F4FE3" />
            <Text style={styles.editModeText}>Edit Mode - All fields are editable</Text>
          </View>
        )}
        
        {/* TABS */}
        <View style={styles.tabsContainer}>
          <TabButton 
            title="Basic Info" 
            active={activeTab === 'basic'} 
            onPress={() => setActiveTab('basic')} 
          />
          <TabButton 
            title="Company" 
            active={activeTab === 'company'} 
            onPress={() => setActiveTab('company')} 
          />
          <TabButton 
            title="Detailed" 
            active={activeTab === 'detailed'} 
            onPress={() => setActiveTab('detailed')} 
          />
          <TabButton 
            title="Activities" 
            active={activeTab === 'activities'} 
            onPress={() => setActiveTab('activities')} 
          />
        </View>
        
        {/* TAB CONTENT */}
        {renderTabContent()}
        
        {/* ACTION BUTTONS (Edit Mode Only) */}
        {isEditMode && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[
                styles.saveBtn,
                updateLeadMutation.isLoading && styles.saveBtnDisabled
              ]} 
              onPress={handleSave}
              disabled={updateLeadMutation.isLoading}
            >
              {updateLeadMutation.isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="content-save" size={18} color="#FFFFFF" />
                  <Text style={styles.saveBtnTxt}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelBtn} 
              onPress={() => setIsEditMode(false)}
            >
              <Text style={styles.cancelBtnTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Dynamic Sales Representative Modal */}
      <RNModal
        visible={salesRepModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setSalesRepModalVisible(false);
          setSalesRepSearch('');
        }}
      >
        <View style={styles.salesRepModalOverlay}>
          <View style={styles.salesRepModalContainer}>
            <View style={styles.salesRepModalHeader}>
              <Text style={styles.salesRepModalTitle}>Select Sales Representative</Text>
              <TouchableOpacity
                onPress={() => {
                  setSalesRepModalVisible(false);
                  setSalesRepSearch('');
                }}
                style={styles.salesRepCloseButton}
              >
                <MaterialCommunityIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {/* Search Input */}
            <View style={styles.salesRepSearchContainer}>
              <MaterialCommunityIcons name="magnify" size={20} color="#666" style={styles.salesRepSearchIcon} />
              <TextInput
                style={styles.salesRepSearchInput}
                placeholder="Search by name..."
                value={salesRepSearch}
                onChangeText={setSalesRepSearch}
                autoFocus={true}
              />
              {salesRepSearch.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSalesRepSearch('')}
                  style={styles.salesRepClearSearchButton}
                >
                  <MaterialCommunityIcons name="close" size={18} color="#666" />
                </TouchableOpacity>
              )}
            </View>
            
            {/* Sales Representatives List */}
            {loadingSalesReps ? (
              <View style={styles.salesRepLoadingContainer}>
                <ActivityIndicator size="large" color="#2F4FE3" />
                <Text style={styles.salesRepLoadingText}>Loading sales representatives...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredSalesReps}
                renderItem={renderSalesRepItem}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={
                  <View style={styles.salesRepEmptyContainer}>
                    <MaterialCommunityIcons name="account-off" size={50} color="#ccc" />
                    <Text style={styles.salesRepEmptyText}>
                      {salesRepSearch.trim() 
                        ? `No sales representatives found for "${salesRepSearch}"`
                        : 'No sales representatives available'}
                    </Text>
                  </View>
                }
                style={styles.salesRepList}
                contentContainerStyle={styles.salesRepListContent}
              />
            )}
            
            {/* Footer */}
            <View style={styles.salesRepModalFooter}>
              <Text style={styles.salesRepFooterText}>
                {filteredSalesReps.length} of {salesReps.length} sales representatives
              </Text>
            </View>
          </View>
        </View>
      </RNModal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#EDEBEB'},
  scrollContent: {paddingBottom: 30},
  
  // Simplified Header Card
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 120,
  },
  statusBar: {
    width: 6,
    height: '100%',
    minHeight: 120,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  contactInfoSection: {
    flex: 1,
    justifyContent: 'center',
  },
  leadName: {
    fontSize: 18,
    fontFamily: 'K2D-SemiBold',
    color: '#333',
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactIcon: {
    marginRight: 6,
    width: 16,
  },
  contactText: {
    fontSize: 13,
    fontFamily: 'K2D-Regular',
    color: '#666',
    flex: 1,
  },
  companyText: {
    fontSize: 13,
    fontFamily: 'K2D-Medium',
    color: '#444',
    flex: 1,
  },
  salesRepText: {
    fontSize: 12,
    fontFamily: 'K2D-Regular',
    color: '#666',
    flex: 1,
    fontStyle: 'italic',
  },
  rightSection: {
    width: 140,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingRight: 16,
    paddingTop: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
    alignSelf: 'flex-end',
  },
  statusBadgeText: {
    fontSize: 13,
    fontFamily: 'K2D-SemiBold',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusDescription: {
    fontSize: 11,
    fontFamily: 'K2D-Regular',
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
    maxWidth: 120,
  },
  statusMenu: {
    marginTop: 40,
  },
  menuItemTitle: {
    fontSize: 14,
    fontFamily: 'K2D-Medium',
  },
  menuItemSelected: {
    color: '#2F4FE3',
    fontFamily: 'K2D-SemiBold',
  },
  addActivityButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  addActivityIcon: {
    position: 'relative',
  },
  activityPlus: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  
  // Edit Mode Indicator
  editModeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F4FF',
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    gap: 6,
  },
  editModeText: {
    fontSize: 13,
    fontFamily: 'K2D-SemiBold',
    color: '#2F4FE3',
  },
  
  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#2F4FE3',
  },
  tabButtonText: {
    fontSize: 14,
    fontFamily: 'K2D-SemiBold',
    color: '#666',
  },
  tabButtonTextActive: {
    color: '#fff',
  },
  
  // Section Cards
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  sectionHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'K2D-Bold',
    color: '#333',
  },
  sectionContent: {
    // Content styles
  },
  
  // Activities Header
  activitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addActivityButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F5FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  addActivityText: {
    fontSize: 14,
    fontFamily: 'K2D-SemiBold',
    color: '#2F4FE3',
  },
  
  // Activity Items
  activityItem: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 16,
    fontFamily: 'K2D-SemiBold',
    color: '#333',
  },
  activityStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activityStatusText: {
    fontSize: 12,
    fontFamily: 'K2D-SemiBold',
  },
  activityDescription: {
    fontSize: 14,
    fontFamily: 'K2D-Regular',
    color: '#666',
    marginBottom: 8,
  },
  activityMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  activityMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activityMetaText: {
    fontSize: 12,
    fontFamily: 'K2D-Medium',
    color: '#666',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 4,
  },
  listFooter: {
    height: 20,
  },
  noActivities: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noActivitiesText: {
    fontSize: 16,
    fontFamily: 'K2D-Medium',
    color: '#999',
    marginTop: 12,
    marginBottom: 20,
  },
  addFirstActivityButton: {
    backgroundColor: '#2F4FE3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstActivityText: {
    color: '#fff',
    fontFamily: 'K2D-SemiBold',
    fontSize: 16,
  },
  loadingActivities: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'K2D-Medium',
    color: '#666',
    marginTop: 8,
  },
  
  // Field Styles
  editField: {
    marginBottom: 16,
  },
  viewField: {
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    fontFamily: 'K2D-SemiBold',
  },
  viewLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'K2D-Medium',
    marginBottom: 4,
  },
  viewValue: {
    fontSize: 15,
    color: '#333',
    fontFamily: 'K2D-Regular',
  },
  
  // Input Styles
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    color: '#333',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'K2D-Regular',
  },
  dropdownInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownDisabled: {
    backgroundColor: '#f0f0f0',
    opacity: 0.7,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  
  // Sales Representative Selector Styles
  salesRepSelector: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorEmpty: {
    borderColor: '#ffb3b3',
    backgroundColor: '#fff5f5',
  },
  selectedRepContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedRepText: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'K2D-Regular',
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'K2D-Regular',
    flex: 1,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  
  // Sales Representative Modal Styles
  salesRepModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  salesRepModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  salesRepModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  salesRepModalTitle: {
    fontSize: 18,
    fontFamily: 'K2D-SemiBold',
    color: '#333',
  },
  salesRepCloseButton: {
    padding: 4,
  },
  salesRepSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
  },
  salesRepSearchIcon: {
    marginRight: 8,
  },
  salesRepSearchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    fontFamily: 'K2D-Regular',
    color: '#333',
  },
  salesRepClearSearchButton: {
    padding: 4,
  },
  salesRepLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  salesRepLoadingText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'K2D-Regular',
    color: '#666',
  },
  salesRepList: {
    maxHeight: 400,
  },
  salesRepListContent: {
    paddingBottom: 16,
  },
  repItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
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
    fontSize: 14,
    fontFamily: 'K2D-SemiBold',
    color: '#333',
    marginBottom: 2,
  },
  repEmail: {
    fontSize: 12,
    fontFamily: 'K2D-Regular',
    color: '#666',
  },
  salesRepEmptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  salesRepEmptyText: {
    fontSize: 14,
    fontFamily: 'K2D-Regular',
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
  },
  salesRepModalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  salesRepFooterText: {
    fontSize: 12,
    fontFamily: 'K2D-Regular',
    color: '#666',
  },
  
  // Action Buttons
  actionButtons: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  saveBtn: {
    width: '100%',
    backgroundColor: '#2F4FE3',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 8,
    elevation: 2,
    shadowColor: '#2F4FE3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveBtnDisabled: {
    backgroundColor: '#9aa7e3',
  },
  saveBtnTxt: {
    color: '#fff', 
    fontFamily: 'K2D-SemiBold', 
    fontSize: 16
  },
  cancelBtn: {
    width: '100%',
    backgroundColor: '#fff',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 10,
  },
  cancelBtnTxt: {
    color: '#666', 
    fontFamily: 'K2D-SemiBold', 
    fontSize: 16
  },
  bottomPadding: {
    height: 30,
  },
  
  // Loading and Error States
  errorContainer: {
    flex: 1,
    backgroundColor: '#f4f2f8',
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    paddingTop: 100,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'K2D-SemiBold',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
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
});

export default LeadEdit;