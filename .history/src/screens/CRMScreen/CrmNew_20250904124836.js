import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Linking,
  Alert,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import TotalCard from '../../components/CRMScreen/CRMTotal/TotalCard';
import {Provider} from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const CrmNew = ({route, navigation}) => {
  const {newLeads} = route.params;
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
    <View style={{flex: 1}}>
      <CustomHeader title={'New Leads'} />
      <Provider>
        <View style={styles.main}>
          {/* Add New Lead Button */}
          <TouchableOpacity style={styles.addButton}>
            <Text>
              <Ionicons name="add-outline" size={25} color={'black'} />
            </Text>
            <Text style={{color: '#000', marginLeft: 8, margin: 2}}>
              Add Lead
            </Text>
          </TouchableOpacity>
          {/* Card */}
          <FlatList
            data={newLeads}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <TotalCard
                header={'KM-UJHUGIGF'}
                name={item?.Name}
                email={item?.EMail}
                mail={() => handleMail(item?.EMail)}
                phone={() => handlePhone(item?.Phone)}
                whatsapp={() => handleWhatsApp(item?.Phone)}
                dateText={item?.Created}
                actOnPress={() => {
                  navigation.navigate('ActivityList', {
                    data: item,
                  });
                }}
                // onPress={() => {
                //   navigation.navigate('LeadsDetails', {data: item});
                // }}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No leads found for the selected date range
                </Text>
              </View>
            }
          />
        </View>
      </Provider>
    </View>
  );
};

export default CrmNew;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    marginTop: -22,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: 'lightgreen',
    height: '5%',
    width: '95%',
    marginTop: 17,
    alignSelf: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingTop: 4,
    borderRadius: 7,
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
});
