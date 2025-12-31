import {StyleSheet, Text, View, TextInput} from 'react-native';
import React from 'react';
import CustomHeader from '../../components/CustomHeader';

const AddLeads = () => {
  return (
    <View style={{flex: 1}}>
      <CustomHeader title={'Add Leads'} />
      <View style={{marginTop: 20}}>
        <Text style={{color: '#000'}}>Lead Name</Text>
        <TextInput style={styles.input} placeholder="Enter Lead Name" />
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 20,
        }}>
        <View style={{flex: 1, paddingHorizontal: 20}}>
          <Text style={{color: '#000'}}>First Name</Text>
          <TextInput style={styles.input} placeholder="Enter First Name" />
        </View>
        <View style={{flex: 1, paddingHorizontal: 20}}>
          <Text style={{color: '#000'}}>Last Name</Text>
          <TextInput style={styles.input} placeholder="Enter Last Name" />
        </View>
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
    paddingHorizontal: 10, // better spacing inside
  },
});
