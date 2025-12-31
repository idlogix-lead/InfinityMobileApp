import {View, Text} from 'react-native';
import React from 'react';
import CustomHeader from '../../components/CustomHeader';
import CRMCard from '../../components/CRMCard/CRMCard';
import {Provider} from 'react-native-paper';

const CrmConverted = () => {
  return (
    <Provider>
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <CustomHeader title="Converted Leads" />
        <View>
          <CRMCard
            header={'KM-UJHUGIGF'}
            name={'Wasif'}
            email={'wasif@example.com'}
            //   mail={() => handleMail('wasif@example.com')}
            //   phone={() => handlePhone('1234567890')}
            //   whatsapp={() => handleWhatsApp('1234567890')}
            dateText={'2023-01-01'}
          />
        </View>
      </View>
    </Provider>
  );
};

export default CrmConverted;
