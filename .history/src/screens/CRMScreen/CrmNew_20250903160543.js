import {View, Text} from 'react-native';
import React from 'react';
import CustomHeader from '../../components/CustomHeader';

const CrmNew = () => {
  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <CustomHeader title="CRM New" />
      <Text style={{color: 'black'}}>CrmNew</Text>
    </View>
  );
};

export default CrmNew;
