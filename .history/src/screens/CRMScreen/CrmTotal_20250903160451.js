import {View, Text} from 'react-native';
import React from 'react';
import CustomHeader from '../../components/CustomHeader';

const CrmTotal = () => {
  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <CustomHeader title="CRM Total" />
      <Text style={{color: 'black'}}>CrmTotal</Text>
    </View>
  );
};

export default CrmTotal;
