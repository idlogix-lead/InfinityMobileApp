import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import CustomHeader from '../../components/CustomHeader';
import CRMCard from '../../components/CRMCard/CRMCard';
import {Provider} from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CrmNew = ({navigation}) => {
  return (
    <Provider>
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <CustomHeader title="CRM New" />
        <TouchableOpacity style={styles.addButton}>
          <Text>
            <Ionicons name="add-outline" size={25} color={'black'} />
          </Text>
          <Text style={{color: '#000', marginLeft: 8, margin: 2}}>
            Add Lead
          </Text>
        </TouchableOpacity>
        <View>
          <CRMCard
            header={'KM-UJHUGIGF'}
            name={'Wasif'}
            email={'wasif@example.com'}
            //   mail={() => handleMail('wasif@example.com')}
            //   phone={() => handlePhone('1234567890')}
            //   whatsapp={() => handleWhatsApp('1234567890')}
            dateText={'2023-01-01'}
            actOnPress={() => navigation.navigate('ActivityList')}
          />
        </View>
      </View>
    </Provider>
  );
};

export default CrmNew;
const styles = StyleSheet.create({
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
});
