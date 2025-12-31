import {View, Text} from 'react-native';
import React from 'react';
import CustomHeader from '../../components/CustomHeader';

const CrmExpire = () => {
  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <CustomHeader title="Expired Leads" />
      <Text style={{color: 'black'}}>CrmExpire</Text>
    </View>
  );
};

export default CrmExpire;
