import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import CustomHeader from '../../components/CustomHeader';

const AddLeads = () => {
  return (
    <View style={{flex: 1}}>
      <CustomHeader title={'Add Leads'} />
      <Text style={{color: '#000'}}>Lead Name</Text>
    </View>
  );
};

export default AddLeads;

const styles = StyleSheet.create({});
