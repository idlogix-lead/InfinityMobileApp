import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import CustomHeader from '../../components/CustomHeader';

const AddActivity = () => {
  return (
    <View style={{flex: 1}}>
      <CustomHeader title={'Add Activity'} />
      <View>
        <Text style={{color: '#000', fontSize: 15, fontWeight: 'bold'}}>
          Activity Type
        </Text>
      </View>
    </View>
  );
};

export default AddActivity;

const styles = StyleSheet.create({});
