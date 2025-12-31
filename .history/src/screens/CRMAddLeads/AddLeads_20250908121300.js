import {StyleSheet, Text, View, TextInput} from 'react-native';
import React from 'react';
import CustomHeader from '../../components/CustomHeader';

const AddLeads = () => {
  return (
    <View style={{flex: 1}}>
      <CustomHeader title={'Add Leads'} />
      <Text style={{color: '#000'}}>Lead Name</Text>
      <TextInput style={styles.input} placeholder="Enter Lead Name" />
    </View>
  );
};

export default AddLeads;

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: 'gray',
  },
});
