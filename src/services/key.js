// DebugKeychain.js
import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import keychainService from './KeyChainService';

const DebugKeychain = () => {
  const [results, setResults] = useState(null);
  const [capabilities, setCapabilities] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const runTests = async () => {
    setIsTesting(true);
    console.log('=== RUNNING KEYCHAIN TESTS ===');
    
    try {
      // Test 1: Device capabilities
      const caps = await keychainService.getDeviceCapabilities();
      setCapabilities(caps);
      console.log('Capabilities:', caps);
      
      // Test 2: Simple keychain test
      const testResult = await keychainService.testKeychain();
      setResults(testResult);
      
      // Show alert
      Alert.alert(
        'Test Complete',
        testResult.success ? '✅ Keychain is working!' : '❌ Keychain failed: ' + testResult.error
      );
      
    } catch (error) {
      console.error('Test failed:', error);
      Alert.alert('Test Failed', error.message);
    } finally {
      setIsTesting(false);
    }
    
    console.log('=== TESTS COMPLETED ===');
  };

  const clearAllSessions = async () => {
    try {
      await keychainService.deleteAllSessions();
      Alert.alert('Success', 'All sessions cleared');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Keychain Debug</Text>
      
      <Button
        title={isTesting ? "Testing..." : "Run Keychain Test"}
        onPress={runTests}
        disabled={isTesting}
      />
      
      <View style={styles.spacer} />
      
      <Button
        title="Clear All Sessions"
        onPress={clearAllSessions}
        color="red"
      />
      
      {capabilities && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Capabilities</Text>
          <Text style={styles.resultText}>
            Security Level: {capabilities.securityLevel || 'Unknown'}
          </Text>
          <Text style={styles.resultText}>
            Biometry: {capabilities.biometryType || 'None'}
          </Text>
          <Text style={styles.resultText}>
            Hardware Support: {capabilities.canUseHardware ? 'Yes' : 'No'}
          </Text>
          {capabilities.error && (
            <Text style={styles.errorText}>Error: {capabilities.error}</Text>
          )}
        </View>
      )}
      
      {results && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          <Text style={[styles.resultText, results.success ? styles.success : styles.error]}>
            Status: {results.success ? 'SUCCESS' : 'FAILED'}
          </Text>
          {results.message && (
            <Text style={styles.resultText}>Message: {results.message}</Text>
          )}
          {results.error && (
            <Text style={styles.errorText}>Error: {results.error}</Text>
          )}
        </View>
      )}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        <Text style={styles.instructionText}>
          1. Run the test above{'\n'}
          2. Check device capabilities{'\n'}
          3. If failed, check ADB logs:{'\n'}
          <Text style={styles.codeText}>
            adb logcat | grep -i keychain
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  spacer: {
    height: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    marginBottom: 5,
  },
  success: {
    color: 'green',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontWeight: 'bold',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  codeText: {
    fontFamily: 'monospace',
    backgroundColor: '#eee',
    padding: 5,
    borderRadius: 3,
  },
});

export default DebugKeychain;