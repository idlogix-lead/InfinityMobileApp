import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

const Search = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.mainHeading}>Search</Text>
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainHeading: {
    color: '#000',
    fontSize: 20,
    fontFamily: 'K2D-Bold',
  },
});
