import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

const Inbox = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.mainHeading}>Inbox</Text>
    </View>
  );
};

export default Inbox;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingHorizontal: '6%',
    justifyContent: 'center',
    alignItems:'center'
  },
  mainHeading: {
    color: '#000',
    fontSize: 20,
    fontFamily:'K2D-Bold'
  },
});
