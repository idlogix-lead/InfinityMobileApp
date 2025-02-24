import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const BasicInformation = () => {
  // Debugging log to ensure this component is rendered
  console.log('Rendering BasicInformation');

  return (
    <View style={styles.container}>
      <Text style={styles.textHeading}>Personal Information</Text>
      {/* Additional content for testing */}
      <Text style={styles.additionalText}>More information here...</Text>
    </View>
  );
};

export default BasicInformation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Ensure the background is not the same color as the text
  },
  textHeading: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
  },
  additionalText: {
    color: '#333',
    fontSize: 18,
  },
});
