import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import CustomHeader from '../../components/CustomHeader';

const AddActivity = () => {
  return (
    <View style={{flex: 1}}>
      <CustomHeader title={'Add Activity'} />
      {/* Activity */}
      <View style={styles.activity}>
        <Text style={{color: '#000', fontSize: 15, fontWeight: 'bold'}}>
          Activity Type
        </Text>
      </View>

      <TouchableOpacity style={styles.dateInput}></TouchableOpacity>
    </View>
  );
};

export default AddActivity;

const styles = StyleSheet.create({
  activity: {
    padding: 10,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginHorizontal: 10,
    marginTop: 8,
    backgroundColor: '#fff',
  },
});
