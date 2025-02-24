import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const BasicInformation = () => {
  console.log('Basic Information is rendering'); 
  return (
    <View style={styles.container}>
    <Text style={styles.textHeading}>Personal Information</Text>
    {/* Additional debug text */}
    <Text style={styles.debugText}>This is the Basic Information Screen</Text>
  </View>
  )
}

export default BasicInformation

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightgrey', // Contrasting background color
  },
  textHeading: {
    color: '#000',
    fontSize: 24, // Increased font size
    fontWeight: 'bold',
  },
  debugText: {
    marginTop: 20,
    fontSize: 18,
    color: 'blue', // Different color for debugging
  },
});
