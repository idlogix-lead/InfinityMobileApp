import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';
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

      <View style={{paddingHorizontal: 20, marginTop: 20}}>
        <Text style={{color: '#000'}}>Phone</Text>
        <TextInput style={styles.input} placeholder="Enter Phone Number" />
      </View>

      <View style={{paddingHorizontal: 20, marginTop: 20}}>
        <Text style={{color: '#000'}}>Email</Text>
        <TextInput style={styles.input} placeholder="Enter Email" />
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 20,
        }}>
        <View style={{flex: 1, paddingHorizontal: 20}}>
          <Text style={{color: '#000'}}>Status</Text>
          <TextInput style={styles.input} placeholder="New Lead" />
        </View>
        <View style={{flex: 1, paddingHorizontal: 20}}>
          <Text style={{color: '#000'}}>Assigned To</Text>
          <TextInput style={styles.input} placeholder="Current User" />
        </View>
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: '#000',
          padding: 12,
          borderRadius: 15,
          alignItems: 'center',
          marginTop: 20,
          marginHorizontal: 20,
        }}>
        <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>
          Submit
        </Text>
      </TouchableOpacity>
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
