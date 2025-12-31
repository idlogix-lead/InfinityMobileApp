import {View, Text} from 'react-native';
import React from 'react';
import CustomHeader from '../../components/CustomHeader';
import CRMCard from '../../components/CRMCard/CRMCard';

const CrmExpire = () => {
  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <CustomHeader title="Expired Leads" />
      <View>
        <CRMCard
          header={'KM-UJHUGIGF'}
          name={'Wasif'}
          email={'wasif@example.com'}
          mail={() => handleMail('wasif@example.com')}
          phone={() => handlePhone('1234567890')}
          whatsapp={() => handleWhatsApp('1234567890')}
          dateText={'2023-01-01'}
        />
      </View>
    </View>
  );
};

export default CrmExpire;
