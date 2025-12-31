import {View, Text} from 'react-native';
import React from 'react';
import CustomHeader from '../../components/CustomHeader';

const CrmConverted = () => {
  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <CustomHeader title="Converted Leads" />
      <Text style={{color: 'black'}}>CrmConverted</Text>
    </View>
  );
};

export default CrmConverted;
