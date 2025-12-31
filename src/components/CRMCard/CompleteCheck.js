import {View, Text, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';

const CompleteCheck = ({isComplete, toggleComplete}) => {
  return (
    <TouchableOpacity
      onPress={toggleComplete}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
      }}>
      <View
        style={{
          width: 24,
          height: 24,
          borderWidth: 2,
          borderColor: isComplete ? 'green' : 'red',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 4,
        }}>
        <Text style={{color: isComplete ? 'green' : 'red', fontWeight: 'bold'}}>
          {isComplete ? '✔' : '✖'}
        </Text>
      </View>
      <Text
        style={{
          marginLeft: 8,
          color: isComplete ? 'green' : 'red',
          fontWeight: 'bold',
        }}>
        {isComplete ? 'Complete' : 'Incomplete'}
      </Text>
    </TouchableOpacity>
  );
};
export default CompleteCheck;
