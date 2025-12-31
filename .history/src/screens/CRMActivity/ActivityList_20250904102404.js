import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import CustomHeader from '../../components/CustomHeader';

const ActivityList = () => {
  return (
    <View style={{flex: 1}}>
      <CustomHeader title="Activity List" />
      <Text>ActivityList</Text>
    </View>
  );
};

export default ActivityList;

const styles = StyleSheet.create({});
