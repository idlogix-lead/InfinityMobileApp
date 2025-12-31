import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import CustomHeader from '../../components/CustomHeader';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ActivityList = ({navigation}) => {
  return (
    <View style={{flex: 1}}>
      <CustomHeader title="Activity List" />
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('AddActivity', {
            data: data?.id,
            mode: 'create',
          });
          //   console.log('Navigating with:', data?.id);
        }}
        style={styles.addButton}>
        <Text>
          <Ionicons name="add-outline" size={25} color={'black'} />
        </Text>
        <Text style={{color: '#000', marginLeft: 8, margin: 2}}>
          Add Activity
        </Text>
      </TouchableOpacity>
      <Text style={{color: '#000'}}>ActivityList</Text>
    </View>
  );
};

export default ActivityList;

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: 'lightgreen',
    height: '5%',
    width: '95%',
    marginTop: 17,
    alignSelf: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingTop: 4,
    borderRadius: 7,
  },
});
