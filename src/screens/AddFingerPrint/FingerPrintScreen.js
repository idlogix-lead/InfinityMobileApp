import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  ActivityIndicator,
  Alert
} from 'react-native';
import React, { useEffect, useState, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../store/authStore';

const FingerPrintScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Verifying authentication...');
  
  // Get all auth data
  const token = useAuthStore(state => state.token);
  const userId = useAuthStore(state => state.userId);
  const userName = useAuthStore(state => state.userName);
  const roleId = useAuthStore(state => state.roleId);
  
  // Create a reliable auth check
  const isAuthenticated = useMemo(() => {
    const result = Boolean(
      token &&
      typeof token === 'string' &&
      token.length > 10 &&
      userName &&
      userId &&
      !isNaN(Number(userId)) &&
      userId !== userName &&
      roleId
    );
    
    console.log('📱 FingerPrintScreen - Auth Check:', {
      tokenExists: !!token,
      tokenLength: token?.length || 0,
      userName,
      userId,
      isNumericUserId: userId && !isNaN(Number(userId)),
      hasRoleId: !!roleId,
      calculatedValue: result
    });
    
    return result;
  }, [token, userId, userName, roleId]);

  useEffect(() => {
    console.log('\n' + '='.repeat(60));
    console.log('👆 FINGERPRINT SCREEN');
    console.log('='.repeat(60));
    
    const checkAuth = async () => {
      setIsLoading(true);
      setStatusMessage('Verifying authentication...');
      
      // Wait for store to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('📱 FingerPrintScreen values:');
      console.log('  Token length:', token?.length || 0);
      console.log('  User ID:', userId);
      console.log('  Username:', userName);
      console.log('  Role ID:', roleId);
      console.log('  Calculated isAuthenticated:', isAuthenticated);
      
      if (isAuthenticated) {
        console.log('\n✅ AUTHENTICATED! Saving data...');
        setStatusMessage('Authentication successful! Saving data...');
        
        await saveUserData();
        
        // Wait a moment then update status
        setTimeout(() => {
          setStatusMessage('Authentication complete! You will be redirected...');
          setIsLoading(false);
          
          // Automatically go back after 2 seconds
          setTimeout(() => {
            // Just go back - Navigation component will handle the switch
            navigation.goBack();
          }, 2000);
        }, 1000);
        
      } else {
        console.log('\n❌ NOT AUTHENTICATED');
        setStatusMessage('Authentication failed. Please login again.');
        setIsLoading(false);
        
        // Show error and go back after 3 seconds
        setTimeout(() => {
          Alert.alert(
            'Authentication Failed',
            'Unable to verify authentication. Please login again.',
            [{ 
              text: 'OK', 
              onPress: () => navigation.goBack() 
            }]
          );
        }, 2000);
      }
    };
    
    checkAuth();
    
    // Back handler - always go back
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    
    return () => backHandler.remove();
  }, [isAuthenticated, navigation]);

  // Save user data to AsyncStorage
  const saveUserData = async () => {
    try {
      // Get server config from store
      const serverConfig = useAuthStore.getState().serverConfig;
      
      const userData = {
        // Server config
        protocol: serverConfig.protocol || 'http',
        host: serverConfig.host,
        port: serverConfig.port,
        
        // Auth data
        userName: userName,
        password: useAuthStore.getState().password,
        clientName: useAuthStore.getState().clientName,
        clientId: useAuthStore.getState().clientId,
        roleId: roleId,
        roleName: useAuthStore.getState().roleName,
        organizationId: useAuthStore.getState().organizationId,
        organizationName: useAuthStore.getState().organizationName,
        warehouseId: useAuthStore.getState().warehouseId,
        warehouseName: useAuthStore.getState().warehouseName,
        userId: userId,
        token: token,
      };
      
      console.log('💾 Saving user data to AsyncStorage...');
      
      // Save individual items
      for (const [key, value] of Object.entries(userData)) {
        if (value !== null && value !== undefined) {
          await AsyncStorage.setItem(key, value.toString());
        }
      }
      
      console.log('✅ User data saved successfully');
    } catch (error) {
      console.error('❌ Error saving user data:', error);
    }
  };

  // Handle manual continue
  const handleManualContinue = async () => {
    if (isAuthenticated) {
      await saveUserData();
      navigation.goBack();
    } else {
      Alert.alert(
        'Not Authenticated',
        'Authentication failed. Please login again.',
        [{ 
          text: 'OK', 
          onPress: () => navigation.goBack() 
        }]
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#800000" />
          <Text style={styles.loadingText}>{statusMessage}</Text>
          <View style={styles.detailsContainer}>
            <Text style={styles.detailText}>User ID: {userId || 'Not set'}</Text>
            <Text style={styles.detailText}>Username: {userName || 'Not set'}</Text>
            <Text style={styles.detailText}>Role ID: {roleId || 'Not set'}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {isAuthenticated ? (
          <>
            <Text style={styles.title}>✅ Authentication Complete!</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>User: {userName}</Text>
              <Text style={styles.infoText}>ID: {userId}</Text>
              <Text style={styles.infoText}>Role: {useAuthStore.getState().roleName || 'Not set'}</Text>
              <Text style={styles.infoText}>Client: {useAuthStore.getState().clientName || 'Not set'}</Text>
            </View>
            
            <Text style={styles.successMessage}>
              Your authentication is complete. The app will now redirect you...
            </Text>
            
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleManualContinue}
            >
              <Text style={styles.buttonText}>Continue to App</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>❌ Authentication Failed</Text>
            <View style={[styles.infoCard, styles.errorCard]}>
              <Text style={styles.errorText}>User: {userName || 'Not found'}</Text>
              <Text style={styles.errorText}>ID: {userId || 'Not found'}</Text>
              <Text style={styles.errorText}>Role ID: {roleId || 'Not found'}</Text>
            </View>
            
            <Text style={styles.errorMessage}>
              Please check your credentials and try again.
            </Text>
            
            <TouchableOpacity 
              style={[styles.button, styles.errorButton]} 
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>Go Back to Login</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default FingerPrintScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
    marginTop: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  detailsContainer: {
    marginTop: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    width: '90%',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginVertical: 3,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#800000',
    marginBottom: 30,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    width: '100%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  errorCard: {
    borderColor: '#ff4444',
    borderWidth: 1,
  },
  infoText: {
    fontSize: 16,
    color: 'green',
    marginVertical: 5,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginVertical: 5,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#800000',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
    minWidth: 200,
    alignItems: 'center',
  },
  errorButton: {
    backgroundColor: '#cc0000',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successMessage: {
    fontSize: 16,
    color: 'green',
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorMessage: {
    fontSize: 16,
    color: 'red',
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});