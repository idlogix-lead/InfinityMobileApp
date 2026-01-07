// Updated FingerPrintScreen.js
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
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(false);
  
  // Get all auth data
  const token = useAuthStore(state => state.token);
  const userId = useAuthStore(state => state.userId);
  const userName = useAuthStore(state => state.userName);
  const tokenOk = useAuthStore(state => state.tokenOk);
  const roleId = useAuthStore(state => state.roleId);
  const clientId = useAuthStore(state => state.clientId);
  const clientName = useAuthStore(state => state.clientName);
  const organizationId = useAuthStore(state => state.organizationId);
  const warehouseId = useAuthStore(state => state.warehouseId);
  
  // Create a reliable auth check
  const isAuthenticated = useMemo(() => {
    const result = Boolean(
      token &&
      typeof token === 'string' &&
      token.length > 10 &&
      userName &&
      userId &&
      !isNaN(Number(userId)) && // Must be numeric
      userId !== userName
    );
    
    console.log('📱 FingerPrintScreen auth check:', {
      tokenExists: !!token,
      tokenLength: token?.length || 0,
      userName,
      userId,
      userIdIsNumeric: userId && !isNaN(Number(userId)),
      calculatedValue: result
    });
    
    return result;
  }, [token, userId, userName]);

  useEffect(() => {
    console.log('\n' + '='.repeat(60));
    console.log('👆 FINGERPRINT SCREEN - UPDATED');
    console.log('='.repeat(60));
    
    console.log('🔍 Auth values:');
    console.log('  Token:', token ? `${token.substring(0, 30)}...` : 'null');
    console.log('  Token length:', token?.length || 0);
    console.log('  User ID:', userId);
    console.log('  Username:', userName);
    console.log('  TokenOk:', tokenOk);
    console.log('  Role ID:', roleId);
    console.log('  Client ID:', clientId);
    console.log('  Organization ID:', organizationId);
    console.log('  Warehouse ID:', warehouseId);
    console.log('  Calculated isAuthenticated:', isAuthenticated);
    
    const checkAuth = async () => {
      setIsLoading(true);
      
      // Wait for store to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use the calculated value
      if (isAuthenticated) {
        console.log('\n✅ AUTHENTICATED! Saving data and waiting...');
        setIsAuthenticatedState(true);
        
        await saveUserData();
        
        // DON'T navigate here - just update state
        // The main Navigation component will detect the auth change
        // and automatically switch from Auth to App navigator
        
      } else {
        console.log('\n❌ NOT AUTHENTICATED');
        setIsAuthenticatedState(false);
        
        // If not authenticated after 3 seconds, show error
        setTimeout(() => {
          Alert.alert(
            'Authentication Failed',
            'Unable to verify authentication. Please login again.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }, 3000);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
    
    // Back handler
    const backAction = () => {
      if (isAuthenticatedState) {
        // If authenticated, exit app or go to app
        BackHandler.exitApp();
        return true;
      } else {
        // If not authenticated, go back
        navigation.goBack();
        return true;
      }
    };
    
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    
    return () => backHandler.remove();
  }, [isAuthenticated, navigation, token, userId, userName, tokenOk, roleId, clientId, organizationId, warehouseId]);

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
        clientName: clientName,
        clientId: clientId,
        roleId: roleId,
        roleName: useAuthStore.getState().roleName,
        organizationId: organizationId,
        organizationName: useAuthStore.getState().organizationName,
        warehouseId: warehouseId,
        warehouseName: useAuthStore.getState().warehouseName,
        tokenOk: tokenOk,
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
      // The navigation will happen automatically via the main Navigation component
      // Just show a message
      Alert.alert(
        'Success',
        'Authentication complete! The app will now load...',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Not Authenticated',
        'Please wait for authentication to complete or try again.',
        [{ text: 'OK' }]
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#800000" />
          <Text style={styles.loadingText}>Verifying authentication...</Text>
          <Text style={styles.subText}>User ID: {userId}</Text>
          <Text style={styles.subText}>Username: {userName}</Text>
          {isAuthenticated && (
            <Text style={styles.successText}>✅ Authentication successful!</Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {isAuthenticatedState ? (
          <>
            <Text style={styles.title}>Authentication Complete!</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>✅ User: {userName}</Text>
              <Text style={styles.infoText}>✅ ID: {userId}</Text>
              <Text style={styles.infoText}>✅ Role: {useAuthStore.getState().roleName}</Text>
              <Text style={styles.infoText}>✅ Client: {clientName}</Text>
            </View>
            
            <Text style={styles.successMessage}>
              You are now authenticated and will be redirected to the main app...
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
            <Text style={styles.title}>Authentication Required</Text>
            <View style={styles.infoCard}>
              <Text style={styles.errorText}>❌ User: {userName || 'Not found'}</Text>
              <Text style={styles.errorText}>❌ ID: {userId || 'Not found'}</Text>
              <Text style={styles.errorText}>❌ Authentication failed</Text>
            </View>
            
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
  },
  subText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  successText: {
    fontSize: 16,
    color: 'green',
    marginTop: 20,
    fontWeight: 'bold',
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
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },
});