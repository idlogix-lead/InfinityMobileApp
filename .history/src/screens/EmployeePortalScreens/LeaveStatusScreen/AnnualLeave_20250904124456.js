import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ToastAndroid,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomHeader from '../../../components/CustomHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CalendarPicker from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Picker} from '@react-native-picker/picker';
import Loader from '../../../components/Loader';
// import DateTimePickerModal from "react-native-modal-datetime-picker";
// import DatePicker from 'react-native-date-picker';

const AnnualLeave = ({navigation, route}) => {
  const isEdit = route.params?.isEdit || false;

  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  // const [startDate, setStartDate] = useState(new Date())
  console.log(startDate, 'startDate');
  const [endDate, setEndDate] = useState('');
  // const [endDate, setEndDate] = useState(new Date());
  console.log(endDate, 'EndDate');

  const [description, setDescription] = useState('');
  const [partnerId, setPartnerId] = useState(null);
  // const [showCalendarStart, setShowCalendarStart] = useState(false);
  const [showCalendarEnd, setShowCalendarEnd] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);
  const [years, setYears] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState(null);
  const [selectedYearLabel, setSelectedYearLabel] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [fetchClientName, setFetchClientName] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [paramData, setParamData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  // const [date, setDate] = useState(new Date());
  const [showCalendarStart, setShowCalendarStart] = useState(false);

  const handleYearSelection = year => {
    // Just store the label
    setSelectedYear(year.value); // Store only the label
    console.log(year.value, 'YearSelected');
  };

  // console.log(years, 'yearsLeave')

  {
    /* Variables for payload*/
  }
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString();
  const ptnrId = partnerId?.C_BPartner_ID?.id;
  // console.log(ptnrId, 'ptnrIdForTopOfScreen')
  const ptnrName = partnerId?.C_BPartner_ID?.identifier;

  const handleOrganizationChange = itemValue => {
    const selectedOrg = organizations.find(
      organization => organization.AD_Org_ID.identifier === itemValue,
    );

    setSelectedOrganization(selectedOrg);
  };

  const FindBusinessPrtId = async () => {
    setIsLoading(true);
    const token = await AsyncStorage.getItem('token');
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const Id = await AsyncStorage.getItem('userId');

    try {
      const response = await axios.get(
        `${protocol}://${host}:${port}/api/v1/models/AD_User?$filter=AD_User_ID eq ${Id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setPartnerId(response?.data?.records[0]);
    } catch (error) {
      console.error('Error  PartnerID:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const FindOrganizatins = async () => {
    setIsLoading(true);
    const token = await AsyncStorage.getItem('token');
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const Id = await AsyncStorage.getItem('userId');

    try {
      const response = await axios.get(
        `${protocol}://${host}:${port}/api/v1/models/AD_User_OrgAccess?$filter=AD_User_ID eq ${Id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setOrganizations(response?.data?.records);
      // console.log(response?.data?.records,'jbnjbjb')
    } catch (error) {
      console.error('Error  PartnerID:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // const getYearId = async () => {
  //     setIsLoading(true);
  //     const token = await AsyncStorage.getItem('token');
  //     const protocol = await AsyncStorage.getItem('protocol');
  //     const host = await AsyncStorage.getItem('host');
  //     const port = await AsyncStorage.getItem('port');
  //     try {
  //         const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/C_Year`, {
  //             headers: {
  //                 'Content-Type': 'application/json',
  //                 'Authorization': `Bearer ${token}`
  //             }
  //         });
  //         console.log(response?.data?.records,'YearDataInLeaveApplication')
  //         const extractedData = response.data.records.map(item => ({
  //             label: item.FiscalYear,
  //             value: item.id
  //         }));
  //         const reversedData = extractedData.reverse();
  //         // console.log(reversedData,'YearDataInReverse')
  //         setYears(reversedData);
  //     } catch (error) {
  //         console.error('Error Year Id:', error);
  //     } finally {
  //         setIsLoading(false);
  //     }
  // };

  // Only FacialYear One show in screen

  const getYearId = async () => {
    setIsLoading(true);
    const token = await AsyncStorage.getItem('token');
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const C_BPartner_ID = await AsyncStorage.getItem('C_BPartner_ID');

    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    const fiscalYearFormatCurrent = `${currentYear}/${(currentYear + 1)
      .toString()
      .slice(-2)}`;
    const fiscalYearFormatPrevious = `${previousYear}/${(previousYear + 1)
      .toString()
      .slice(-2)}`;

    try {
      const response = await axios.get(
        `${protocol}://${host}:${port}/api/v1/models/C_Year`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      // console.log(response?.data?.records,'responseForC_Year')

      const filteredData = response.data.records.filter(
        item =>
          item.FiscalYear === fiscalYearFormatCurrent ||
          item.FiscalYear === fiscalYearFormatPrevious,
      );

      if (filteredData.length > 0) {
        const extractedData = filteredData.map(item => ({
          label: item.FiscalYear,
          value: item.id,
        }));
        setYears(extractedData);
        console.log(extractedData, 'extractedData');
      } else {
        setYears([]);
      }
    } catch (error) {
      console.error('Error Year Id:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const LeaveRequestInfo = async () => {
    setIsLoading(true);
    const token = await AsyncStorage.getItem('token');
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    try {
      const response = await axios.get(
        `${protocol}://${host}:${port}/api/v1/models/HR_LevTypes`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const extractedData = response.data.records.map(item => ({
        label: item.Name,
        value: item.id,
      }));
      setLeaveTypes(extractedData);
    } catch (error) {
      console.error('Error :', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBasicInfo = async () => {
    setIsLoading(true);
    const token = await AsyncStorage.getItem('token');
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const Id = await AsyncStorage.getItem('userId');
    const clientName = await AsyncStorage.getItem('clientName');
    setFetchClientName(clientName);
    try {
      const response = await axios.get(
        `${protocol}://${host}:${port}/api/v1/models/hr_employee_v?$filter=ad_user_id eq ${Id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setEmployeeId(response?.data?.records[0]?.id);
    } catch (error) {
      console.log('Error', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getBasicInfo();
  }, []);

  // const SaveData = async () => {
  //     setIsLoading(true);
  //     const clientName = await AsyncStorage.getItem('clientName');
  //     const token = await AsyncStorage.getItem('token');
  //     const value = await AsyncStorage.getItem('userName');
  //     const protocol = await AsyncStorage.getItem('protocol');
  //     const host = await AsyncStorage.getItem('host');
  //     const port = await AsyncStorage.getItem('port');
  //     const Id = await AsyncStorage.getItem("userId");
  //     const clientId = await AsyncStorage.getItem('clientId');
  //     const C_BPartner_ID = await AsyncStorage.getItem('C_BPartner_ID');
  //     console.log(C_BPartner_ID, 'C_BPartner_ID')
  //     const organizationId = await AsyncStorage.getItem('organizationId');
  //     console.log(organizationId, 'organizationId')

  //     const payload = {
  //         'HR_Employee_ID': employeeId,
  //         'AD_Client_ID': { 'id': clientId, 'identifier': clientName },
  //         // 'AD_Org_ID': { 'id': selectedOrganization.AD_Org_ID.id, 'identifier': selectedOrganization.AD_Org_ID.identifier, },
  //         'AD_Org_ID': organizationId,
  //         // 'C_BPartner_ID': { 'id': ptnrId, 'identifier': ptnrName },
  //         'C_BPartner_ID': C_BPartner_ID,
  //         "IsActive": true,
  //         "Created": formattedDate,
  //         "CreatedBy": { "id": parseInt(Id), "identifier": value, "model-name": "ad_user" },
  //         "Updated": "",
  //         "UpdatedBy": { "id": parseInt(Id), "identifier": value, "model-name": "ad_user", "propertyLabel": "Updated By" },
  //         'StartDate': startDate,
  //         'EndDate': endDate,
  //         'HR_LevTypes_ID': { 'id': selectedLeaveType, 'identifier': leaveTypes.find(type => type.value === selectedLeaveType)?.label || '' },
  //         'Description': description,
  //         // 'C_Year_ID': { 'id': selectedYearId, 'identifier': selectedYearLabel },
  //         'C_Year_ID': selectedYear.label,
  //     }
  //     console.log(payload, 'PayloadForLeaveFrom')

  //     try {
  //         const response = await axios.post(`${protocol}://${host}:${port}/api/v1/models/HR_EmpLev_Posting`, payload,
  //             // {
  //             //     'HR_Employee_ID': employeeId,
  //             //     'AD_Client_ID': { 'id': clientId, 'identifier': clientName },
  //             //     // 'AD_Org_ID': { 'id': selectedOrganization.AD_Org_ID.id, 'identifier': selectedOrganization.AD_Org_ID.identifier, },
  //             //     'AD_Org_ID': organizationId,
  //             //     // 'C_BPartner_ID': { 'id': ptnrId, 'identifier': ptnrName },
  //             //     'C_BPartner_ID': C_BPartner_ID,
  //             //     "IsActive": true,
  //             //     "Created": formattedDate,
  //             //     "CreatedBy": { "id": parseInt(Id), "identifier": value, "model-name": "ad_user" },
  //             //     "Updated": "",
  //             //     "UpdatedBy": { "id": parseInt(Id), "identifier": value, "model-name": "ad_user", "propertyLabel": "Updated By" },
  //             //     'StartDate': startDate,
  //             //     'EndDate': endDate,
  //             //     'HR_LevTypes_ID': { 'id': selectedLeaveType, 'identifier': leaveTypes.find(type => type.value === selectedLeaveType)?.label || '' },
  //             //     'Description': description,
  //             //     // 'C_Year_ID': { 'id': selectedYearId, 'identifier': selectedYearLabel },
  //             //     'C_Year_ID': years,
  //             // },
  //             {
  //                 headers: {
  //                     'Content-Type': 'application/json',
  //                     'Accept': 'application/json',
  //                     'Authorization': `Bearer ${token}`,
  //                 },
  //             }
  //         );
  //         if (response.status === 201) {
  //             setStartDate('');
  //             setEndDate('');
  //             setSelectedLeaveType(null);
  //             setSelectedYearId(null);
  //             setSelectedYearLabel('');
  //             setDescription('');
  //             // setSelectedOrganization(null);
  //             ToastAndroid.show("Successfully created", ToastAndroid.SHORT);
  //             route.params?.refreshLeaveRequestInfo && route.params.refreshLeaveRequestInfo();
  //             navigation.navigate('LeaveStatus')
  //         }
  //         else {
  //             ToastAndroid.show("Error", ToastAndroid.SHORT);
  //         }
  //     } catch (error) {
  //         console.error('Error:', error);
  //     } finally {
  //         setIsLoading(false);
  //     }
  // };

  const SaveData = async () => {
    setIsLoading(true);
    const token = await AsyncStorage.getItem('token');
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const clientId = await AsyncStorage.getItem('clientId');
    const clientName = await AsyncStorage.getItem('clientName');
    const C_BPartner_ID = await AsyncStorage.getItem('C_BPartner_ID');
    const ptnrId = partnerId?.C_BPartner_ID?.id;
    console.log(ptnrId, 'ptnrIdForLeaveAnnualStatus');
    const organizationId = await AsyncStorage.getItem('organizationId');
    const Id = await AsyncStorage.getItem('userId');
    const value = await AsyncStorage.getItem('userName');
    const allKeys = await AsyncStorage.getAllKeys();
    const allData = await AsyncStorage.multiGet(allKeys);
    // console.log(allData, "allDataShowInAsyncStorage");

    // console.log(C_BPartner_ID, 'C_BPartner_IDForAnnualLeavePosting')
    // Create payload with only the label from selectedYear
    const payload = {
      HR_Employee_ID: employeeId,
      AD_Client_ID: {id: clientId, identifier: clientName},
      AD_Org_ID: organizationId,
      // 'C_BPartner_ID': C_BPartner_ID,
      C_BPartner_ID: ptnrId,
      IsActive: true,
      Created: formattedDate,
      CreatedBy: {id: parseInt(Id), identifier: value, 'model-name': 'ad_user'},
      Updated: '',
      UpdatedBy: {
        id: parseInt(Id),
        identifier: value,
        'model-name': 'ad_user',
        propertyLabel: 'Updated By',
      },
      StartDate: startDate,
      EndDate: endDate,
      HR_LevTypes_ID: {
        id: selectedLeaveType,
        identifier:
          leaveTypes.find(type => type.value === selectedLeaveType)?.label ||
          '',
      },
      Description: description,
      // Use only the label here
      C_Year_ID: selectedYear, // Send only the label of the selected year
    };

    console.log(payload, 'PayloadForLeaveFrom');

    try {
      const url = `${protocol}://${host}:${port}/api/v1/models/HR_EmpLev_Posting`;
      console.log(url, 'URLForAnnualLeave');

      const response = await axios.post(
        `${protocol}://${host}:${port}/api/v1/models/HR_EmpLev_Posting`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 201) {
        setStartDate('');
        setEndDate('');
        setSelectedLeaveType(null);
        setSelectedYear('');
        setDescription('');
        ToastAndroid.show('Successfully created', ToastAndroid.SHORT);
        route.params?.refreshLeaveRequestInfo &&
          route.params.refreshLeaveRequestInfo();
        navigation.navigate('LeaveStatus');
      } else {
        ToastAndroid.show('Error', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const Save = async () => {
    if (!startDate) {
      Alert.alert('Start date cannot be null');
    } else if (!endDate) {
      Alert.alert('End date cannot be null');
    } else if (selectedLeaveType == null) {
      Alert.alert('Leave type cannot be null');
    } else if (selectedYear == null) {
      Alert.alert('Year cannot be null');
    } else if (description === '') {
      Alert.alert('Description cannot be empty');
    }
    //  else if (selectedOrganization?.AD_Org_ID.identifier == null) {
    //     Alert.alert('Organization cannot be null');
    // }
    else {
      SaveData();
    }
  };

  const UpdateData = async () => {
    setIsLoading(true);
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await axios.put(
        `${protocol}://${host}:${port}/api/v1/models/hr_emplev_posting/${paramData?.id}`,
        {
          AD_Org_ID: {
            id: selectedOrganization.AD_Org_ID.id,
            identifier: selectedOrganization.AD_Org_ID.identifier,
          },
          StartDate: startDate,
          EndDate: endDate,
          HR_LevTypes_ID: {
            id: selectedLeaveType,
            identifier:
              leaveTypes.find(type => type.value === selectedLeaveType)
                ?.label || '',
          },
          Description: description,
          C_Year_ID: {id: selectedYear, identifier: selectedYearLabel},
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.status === 200) {
        setStartDate('');
        setEndDate('');
        setSelectedLeaveType(null);
        setSelectedYear(null);
        setSelectedYearLabel('');
        setDescription('');
        setSelectedOrganization(null);

        ToastAndroid.show('Successfully Updated', ToastAndroid.SHORT);
        route.params?.refreshLeaveRequestInfo &&
          route.params.refreshLeaveRequestInfo();
        navigation.navigate('LeaveStatus');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (years.length > 0) {
      setSelectedYear(years[0].value); // Pehla fiscal year default select hoga
    }
  }, [years]);

  useEffect(() => {
    FindBusinessPrtId();
    getYearId();
    FindOrganizatins();
  }, []);
  useEffect(() => {
    if (partnerId) {
      LeaveRequestInfo();
    }
  }, [partnerId]);

  // const onDateChangeStart = (date) => {
  //     setStartDate(date);
  //     // console.log(setStartDate,'DateSelectIncalender')
  //     setShowCalendarStart(false);
  // };

  const onDateChangeStart = date => {
    setStartDate(date); // This will store both date and time
    setShowCalendarStart(false);
  };
  const onDateChangeEnd = date => {
    setEndDate(date);
    setShowCalendarEnd(false);
  };

  useEffect(() => {
    if (route.params?.record) {
      const record = route.params.record;
      setParamData(record);

      setStartDate(record.StartDate);
      setEndDate(record.EndDate);
      setDescription(record.Description);
      setSelectedLeaveType(record.HR_LevTypes_ID?.id);
      setSelectedYear(record.C_Year_ID?.id);
      setSelectedYearLabel(record.C_Year_ID?.identifier);
      setSelectedOrganization(
        organizations.find(org => org.AD_Org_ID.id === record.AD_Org_ID?.id),
      );
    }
  }, [route.params?.record, organizations, leaveTypes]);

  return (
    <View style={{flex: 1}}>
      <CustomHeader title="Annual Leave" />
      {/* Start Date Modal */}
      <Modal
        visible={showCalendarStart}
        animationType="slide"
        transparent={true}>
        <View style={styles.blurView}>
          <View style={styles.modal}>
            <CalendarPicker
              onDateChange={onDateChangeStart}
              previousTitleStyle={{
                color: 'white',
                marginLeft: 15,
                fontFamily: 'K2D-Regular',
              }}
              nextTitleStyle={{
                color: 'white',
                marginRight: 15,
                fontFamily: 'K2D-Regular',
              }}
              textStyle={{
                color: 'white',
                fontFamily: 'K2D-Regular',
              }}
            />
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowCalendarStart(false)}>
              <Text style={styles.close}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* end date model */}
      <Modal visible={showCalendarEnd} animationType="slide" transparent={true}>
        <View style={styles.blurView}>
          <View style={styles.modal}>
            <CalendarPicker
              onDateChange={onDateChangeEnd}
              previousTitleStyle={{
                color: 'white',
                marginLeft: 15,
                fontFamily: 'K2D-Regular',
              }}
              nextTitleStyle={{
                color: 'white',
                marginRight: 15,
                fontFamily: 'K2D-Regular',
              }}
              textStyle={{
                color: 'white',
                fontFamily: 'K2D-Regular',
              }}
            />
            <TouchableOpacity
              onPress={() => setShowCalendarEnd(false)}
              style={styles.closeBtn}>
              <Text style={{color: 'black'}}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView>
        <View style={{marginBottom: '7%'}}>
          <Text style={styles.topTxt}>Select Start Date</Text>
          <TouchableOpacity
            onPress={() => setShowCalendarStart(true)}
            style={styles.startDate}>
            {startDate && (
              <Text style={styles.inside}>{startDate.toString()}</Text>
            )}
            {!startDate && (
              <View style={{flexDirection: 'row'}}>
                <View style={{width: '88%', justifyContent: 'center'}}>
                  <Text style={styles.inside}>Selected Start Date</Text>
                </View>
                <MaterialCommunityIcons
                  name="calendar-month-outline"
                  size={26}
                  color="#00B0F0"
                  style={styles.calender}
                />
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.topTxt}>Select End Date</Text>
          <TouchableOpacity
            onPress={() => setShowCalendarEnd(true)}
            style={styles.startDate}>
            {endDate && <Text style={styles.inside}>{endDate.toString()}</Text>}
            {!endDate && (
              <View style={{flexDirection: 'row'}}>
                <View style={{width: '88%', justifyContent: 'center'}}>
                  <Text style={styles.inside}>Selected End Date</Text>
                </View>
                <MaterialCommunityIcons
                  name="calendar-month-outline"
                  size={26}
                  color="#00B0F0"
                  style={styles.calender}
                />
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.topTxt}>Leave Type</Text>
          <View style={styles.startDate}>
            <Picker
              style={{color: 'gray'}}
              dropdownIconColor={'#0070C0'}
              selectedValue={selectedLeaveType}
              onValueChange={(itemValue, itemIndex) =>
                setSelectedLeaveType(itemValue)
              }>
              <Picker.Item label="Select Leave Type" value={null} />
              {leaveTypes.map((type, index) => (
                <Picker.Item
                  key={index}
                  label={type.label}
                  value={type.value}
                />
              ))}
            </Picker>
          </View>

          {/* <Text style={styles.topTxt}>Year</Text>
                    <View style={[styles.startDate,{backgroundColor:"red"}]}>
                        <Picker
                            style={{ color: 'gray' }}
                            dropdownIconColor={'#0070C0'}
                            selectedValue={selectedYearId}
                            onValueChange={(itemValue, itemIndex) => {
                                setSelectedYearId(itemValue);
                                const selectedYear = years.find(year => year.value === itemValue);
                                setSelectedYearLabel(selectedYear ? selectedYear.label : '');
                            }}>
                            <Picker.Item label="Select Year" value={null} />
                            {years.map((year, index) => (
                                <Picker.Item key={index} label={year.label} value={year.value} />
                            ))}
                        </Picker>
                    </View> */}

          <Text style={styles.topTxt}>Year</Text>
          <View style={styles.startDate}>
            {/* <Picker
                            style={{ color: 'gray' }}
                            dropdownIconColor={'#0070C0'}
                            selectedValue={selectedYearId}
                            onValueChange={(itemValue) => {
                                setSelectedYearId(itemValue);
                                const selectedYear = years.find(year => year.value === itemValue);
                                setSelectedYearLabel(selectedYear ? selectedYear.label : '');
                            }}
                        >
                            <Picker.Item label="Select Year" value={null} />
                            {years.map((year) => (
                                <Picker.Item key={year.value} label={year.label} value={year.value} />
                            ))}
                        </Picker> */}
            {/* Direct Values Save krwa di hai */}
            {/* <View>
                            {years.length > 0 ? (
                                years.map((year, index) => (
                                    <Text key={index} style={{ color: 'gray', paddingLeft: "2%" }}>
                                        {year.label}
                                    </Text>
                                ))
                            ) : (
                                <Text>No fiscal year data available</Text>
                            )}
                        </View> */}

            <View>
              {years.length > 0 ? (
                years.map((year, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleYearSelection(year)}>
                    <Text style={{color: 'gray', paddingLeft: '2%'}}>
                      {year.label}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text>No fiscal year data available</Text>
              )}
            </View>
          </View>

          <Text style={styles.topTxt}>Description</Text>
          <View style={styles.startDate}>
            <TextInput
              placeholderTextColor={'gray'}
              style={{color: 'gray', marginLeft: 5}}
              placeholder={'Description'}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* <Text style={styles.topTxt}>Client</Text>
                    <View style={styles.startDate}>
                        <Text style={styles.clientTxt}>{fetchClientName}</Text>
                    </View> */}

          {/* <Text style={styles.topTxt}>Organization</Text>
                    <View style={styles.startDate}>
                        <Picker
                            style={{ color: 'red' }}
                            dropdownIconColor={'#0070C0'}
                            selectedValue={selectedOrganization?.AD_Org_ID?.identifier}
                            onValueChange={handleOrganizationChange}
                        >
                            {organizations.map((organization) => (
                                <Picker.Item
                                    key={organization.uid}
                                    label={organization.AD_Org_ID.identifier}
                                    value={organization.AD_Org_ID.identifier}
                                />
                            ))}
                        </Picker>
                    </View> */}

          {isEdit ? (
            <TouchableOpacity
              style={styles.btnSave}
              onPress={() => UpdateData()}>
              <Text style={[styles.BtnTxt, {color: 'white'}]}>Update</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.btnSave} onPress={() => Save()}>
              <Text style={[styles.BtnTxt, {color: 'white'}]}>Save</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      {isLoading ? <Loader /> : null}
    </View>
  );
};

export default AnnualLeave;

const styles = StyleSheet.create({
  btnSave: {
    backgroundColor: '#00B0F0',
    height: 40,
    width: '50%',
    alignSelf: 'center',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  BtnTxt: {
    color: '#0070C0',
    fontSize: 16,
    fontFamily: 'K2D-Regular',
  },
  startDate: {
    height: 40,
    width: '85%',
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#00B0F0',
    borderRadius: 5,
    justifyContent: 'center',
  },
  inside: {
    marginLeft: 10,
    color: 'gray',
    fontFamily: 'K2D',
  },
  closeBtn: {
    backgroundColor: 'white',
    height: '10%',
    width: '40%',
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  close: {
    color: '#00B0F0',
    fontSize: 16,
    fontFamily: 'K2D-Regular',
  },
  modal: {
    width: '90%',
    backgroundColor: '#0070C0',
    borderRadius: 20,
    alignItems: 'center',
  },
  blurView: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  topTxt: {
    color: '#0070C0',
    fontSize: 16,
    fontFamily: 'K2D-Regular',
    width: '85%',
    alignSelf: 'center',
    marginTop: '3%',
  },
  clientTxt: {
    color: 'gray',
    marginLeft: 10,
    fontFamily: 'K2D-Regular',
  },
});
