import {StyleSheet, Text, View, TextInput} from 'react-native';
import React from 'react';
import CustomHeader from '../../components/CustomHeader';

const AddLeads = () => {
  return (
    <View style={{flex: 1}}>
      <CustomHeader title={'Add Leads'} />
      <View style={{paddingHorizontal: 20, marginTop: 20}}>
        <Text style={{color: '#000'}}>Lead Name</Text>
        <TextInput style={styles.input} placeholder="Enter Lead Name" />
      </View>
      <View style={{padding: 20}}>
        <Text style={{color: '#000'}}>Lead Name</Text>
        <TextInput style={styles.input} placeholder="Enter Lead Name" />
      </View>
    </View>
  );
};

export default AddLeads;

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 2,
    marginTop: 10,
    borderRadius: 5,
  },
});
