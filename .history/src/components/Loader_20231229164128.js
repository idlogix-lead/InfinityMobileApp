import React from 'react';
import { StyleSheet, View, ActivityIndicator, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const Loader = () => {
  return (
   
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0050C0" />
      </View>
  
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    width:'100%',
    height:'100%',
    borderRadius: 10,
    justifyContent:'center'
   
  },
});

export default Loader;