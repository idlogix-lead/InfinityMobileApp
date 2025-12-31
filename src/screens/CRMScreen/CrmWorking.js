import {StyleSheet, Text, View, FlatList, Linking, Alert} from 'react-native';
import React from 'react';
import {Provider} from 'react-native-paper';
import CustomHeader from '../../components/CustomHeader';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CRMCard from '../../components/CRMCard/CRMCard';
import moment from 'moment';

const CrmWorking = ({route, navigation}) => {
  const {workingLeads, activity} = route.params;

  // todayLeadsCount
  const todayLeadsCount = workingLeads
    ? workingLeads.filter(lead => moment(lead.Created).isSame(moment(), 'day'))
        .length
    : 0;

  // monthsLeadsCount
  const monthLeadsCount = workingLeads
    ? workingLeads.filter(lead =>
        moment(lead.Created).isSame(moment(), 'month'),
      ).length
    : 0;

  const handleMail = email => {
    if (!email) {
      Alert.alert('Error', 'Email address not found.');
      return;
    }
    Linking.openURL(`mailto:${email}`);
  };

  const handlePhone = phone => {
    if (!phone) {
      Alert.alert('Error', 'Phone number not found.');
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = phone => {
    if (!phone) {
      Alert.alert('Error', 'WhatsApp number not found.');
      return;
    }
    let formattedPhone = phone.trim(); // Extra spaces remove karein

    // "+" hata ke sirf digits rakhein
    formattedPhone = formattedPhone.replace(/[^0-9]/g, '');

    // Agar number "+92" ya "92" se start hai, to as it is rakhein
    if (formattedPhone.startsWith('92')) {
      // Already correct format hai, kuch mat karein
    } else if (formattedPhone.startsWith('0')) {
      // Agar "0" se start ho, to "92" add karein
      formattedPhone = '92' + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('0092')) {
      // Agar "0092" se start ho, to usko "92" me convert karein
      formattedPhone = formattedPhone.replace('0092', '92');
    } else {
      // Agar kuch aur format hai, to error de dein
      Alert.alert('Error', 'Invalid phone number format.');
      return;
    }
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}`;

    Linking.openURL(whatsappUrl).catch(() =>
      Alert.alert('Error', 'Cannot open WhatsApp.'),
    );
  };
  return (
    <Provider>
      <View style={{flex: 1}}>
        <CustomHeader title={'Working Leads'} />
        <View style={styles.main}>
          <View
            style={{
              backgroundColor: '#F5F5F5',
              height: 110,
              marginTop: '5%',
              marginHorizontal: 22,
              flexDirection: 'row',
              elevation: 10,
              shadowColor: '#000',
              borderRadius: 3,
              borderWidth: 0.5,
              borderColor: 'rgba(0, 0, 0, 0.10)',
            }}>
            <View style={{marginLeft: '10%', marginTop: 20}}>
              <View
                style={{alignItems: 'center', height: 20, marginBottom: '7%'}}>
                <MaterialIcons
                  name="article"
                  size={20}
                  color="rgba(38, 189, 206, 1)"
                />
              </View>
              <Text style={styles.filterTxt}>Today Leads</Text>
              <Text style={styles.filterTxt}>{todayLeadsCount}</Text>
            </View>
            <View style={{marginLeft: 20, marginTop: 20}}>
              <View style={{alignItems: 'center', marginBottom: '7%'}}>
                <MaterialIcons
                  name="calendar-month"
                  size={20}
                  color={'rgba(234, 71, 71, 1)'}
                />

                {/* <EvilIcons name="calendar" size={25} color={'black'} /> */}
              </View>
              <Text style={styles.filterTxt}>This Month</Text>
              <Text style={styles.filterTxt}>{monthLeadsCount}</Text>
            </View>
            <View style={{marginLeft: 20, marginTop: 20}}>
              <View
                style={{alignItems: 'center', height: 20, marginBottom: '7%'}}>
                <MaterialCommunityIcons
                  name="file-account"
                  size={20}
                  color={'rgba(231, 205, 76, 1)'}
                />
              </View>
              <Text style={styles.filterTxt}>All Leads</Text>
              <Text style={styles.filterTxt}>{workingLeads.length}</Text>
            </View>
          </View>
          <FlatList
            data={workingLeads}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => {
              // activityCount
              const userActivity = activity.filter(
                act => act?.AD_User_ID?.id === item?.id,
              );
              // Sort by Created date (assuming it's act.Created)
              const lastActivity = userActivity.sort(
                (a, b) => new Date(b.Created) - new Date(a.Created),
              )[0];

              // Now display the type
              const lastActivityType =
                lastActivity?.ContactActivityType?.identifier || 'N/A';
              const activityCount = userActivity.length;
              return (
                <CRMCard
                  header={item.AD_Org_ID.identifier}
                  name={item?.Name}
                  email={item?.EMail}
                  cellNo={item?.Phone}
                  count={activityCount}
                  interactionType={lastActivityType}
                  status={item?.LeadStatus?.identifier}
                  mail={() => handleMail(item?.EMail)}
                  phone={() => handlePhone(item?.Phone)}
                  whatsapp={() => handleWhatsApp(item?.Phone)}
                  dateText={item?.Updated}
                  actOnPress={() => {
                    navigation.navigate('ActivityList', {
                      data: item,
                      mode: 'create',
                    });
                  }}
                  onPress={() => {
                    navigation.navigate('LeadsDetails', {data: item});
                  }}
                />
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No leads found for the selected date range
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </Provider>
  );
};

export default CrmWorking;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    marginTop: -22,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  filterTxt: {
    fontFamily: 'K2D-Medium',
    fontSize: 15,
    color: '#000',
    textAlign: 'center',
  },
});
