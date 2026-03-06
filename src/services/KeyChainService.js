// KeyChainService.js - FINAL VERSION WITH SESSION RECOVERY
import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants
const SERVICE_PREFIX = 'com.erp.mobile.app';

export const keychainService = {
  // ==================== CORE FUNCTIONS ====================
  
  saveUserSession: async (sessionData) => {
    try {
      const { userId, userName } = sessionData;
      
      if (!userId || !userName) {
        throw new Error('User ID and Username are required');
      }

      console.log(`[Keychain] Saving session for ${userName}`);
      
      // Prepare session data
      const sessionToSave = {
        ...sessionData,
        savedAt: new Date().toISOString(),
        version: '1.0',
      };

      const sessionString = JSON.stringify(sessionToSave);

      // Save to Keychain - SIMPLE & DIRECT
      const result = await Keychain.setGenericPassword(
        userName,
        sessionString,
        {
          service: `${SERVICE_PREFIX}.${userId}`,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
          storage: Keychain.STORAGE_TYPE.FB,
        }
      );

      if (result) {
        // Update registry
        await keychainService._updateRegistry(userId, userName);
        console.log(`[Keychain] ✅ Session saved for ${userName}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[Keychain] ❌ Save error:', error.message);
      
      // Fallback to AsyncStorage
      try {
        await keychainService._saveToFallback(sessionData);
        return true;
      } catch (fallbackError) {
        console.error('[Keychain] Fallback also failed:', fallbackError);
        return false;
      }
    }
  },

  loadUserSession: async (userId) => {
    try {
      console.log(`[Keychain] Loading session for ${userId}`);
      
      // Try Keychain
      const credentials = await Keychain.getGenericPassword({
        service: `${SERVICE_PREFIX}.${userId}`,
      });

      if (credentials && credentials.password) {
        const sessionData = JSON.parse(credentials.password);
        console.log(`[Keychain] ✅ Session loaded`);
        return sessionData;
      }
      
      // Try fallback
      return await keychainService._loadFromFallback(userId);
    } catch (error) {
      console.error('[Keychain] ❌ Load error:', error.message);
      return await keychainService._loadFromFallback(userId);
    }
  },

  deleteUserSession: async (userId) => {
    try {
      console.log(`[Keychain] Deleting session for ${userId}`);
      
      // Delete from Keychain
      const result = await Keychain.resetGenericPassword({
        service: `${SERVICE_PREFIX}.${userId}`,
      });
      
      // Delete from registry
      await keychainService._removeFromRegistry(userId);
      
      // Delete from fallback
      await AsyncStorage.removeItem(`keychain_fallback_${userId}`);
      
      console.log(`[Keychain] ✅ Session deleted`);
      return result;
    } catch (error) {
      console.error('[Keychain] ❌ Delete error:', error.message);
      return false;
    }
  },

  getAllSessions: async () => {
    try {
      const registry = await keychainService._getRegistry();
      const sessions = [];
      
      for (const item of registry) {
        const session = await keychainService.loadUserSession(item.userId);
        if (session) {
          sessions.push({
            ...session,
            userName: item.userName,
            savedAt: item.timestamp,
          });
        }
      }
      
      console.log(`[Keychain] Found ${sessions.length} sessions`);
      return sessions;
    } catch (error) {
      console.error('[Keychain] ❌ Get all sessions error:', error);
      return [];
    }
  },

  // ==================== SESSION RECOVERY ====================
  
  recoverSession: async () => {
    try {
      console.log('[Keychain] Attempting to recover session...');
      
      // Try to get current session ID
      const currentId = await keychainService.getCurrentSessionId();
      if (currentId) {
        const session = await keychainService.loadUserSession(currentId);
        if (session && session.token) {
          console.log('🔐 Session recovered for:', session.userName);
          return session;
        }
      }
      
      // If no current session, try the most recent from registry
      const registry = await keychainService._getRegistry();
      if (registry.length > 0) {
        const mostRecent = registry[0];
        const session = await keychainService.loadUserSession(mostRecent.userId);
        if (session && session.token) {
          console.log('🔐 Most recent session recovered');
          
          // Set as current session
          await keychainService.setCurrentSessionId(mostRecent.userId);
          return session;
        }
      }
      
      // Try to find any session in fallback storage
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        const sessionKeys = allKeys.filter(key => key.startsWith('keychain_fallback_'));
        
        for (const key of sessionKeys) {
          const sessionString = await AsyncStorage.getItem(key);
          if (sessionString) {
            const session = JSON.parse(sessionString);
            if (session && session.token) {
              console.log('🔐 Found session in fallback storage');
              
              // Save to Keychain for future use
              await keychainService.saveUserSession(session);
              return session;
            }
          }
        }
      } catch (fallbackError) {
        console.log('No sessions in fallback storage');
      }
      
      console.log('No recoverable session found');
      return null;
    } catch (error) {
      console.error('[Keychain] Session recovery failed:', error);
      return null;
    }
  },

  // ==================== CURRENT SESSION ====================
  
  setCurrentSessionId: async (userId) => {
    try {
      await AsyncStorage.setItem('current_session_id', userId || '');
      console.log(`[Keychain] Current session set to: ${userId}`);
    } catch (error) {
      console.error('[Keychain] Set current session error:', error);
    }
  },

  getCurrentSessionId: async () => {
    try {
      return await AsyncStorage.getItem('current_session_id');
    } catch (error) {
      console.error('[Keychain] Get current session error:', error);
      return null;
    }
  },

  clearCurrentSessionId: async () => {
    try {
      await AsyncStorage.removeItem('current_session_id');
      console.log('[Keychain] Current session cleared');
    } catch (error) {
      console.error('[Keychain] Clear current session error:', error);
    }
  },

  // ==================== UTILITY FUNCTIONS ====================
  
  hasSession: async (userId) => {
    try {
      const session = await keychainService.loadUserSession(userId);
      return !!session;
    } catch (error) {
      console.error('[Keychain] Has session check error:', error);
      return false;
    }
  },

  getSessionByUsername: async (userName) => {
    try {
      const sessions = await keychainService.getAllSessions();
      return sessions.find(session => session.userName === userName) || null;
    } catch (error) {
      console.error('[Keychain] Get by username error:', error);
      return null;
    }
  },

  deleteAllSessions: async () => {
    try {
      const registry = await keychainService._getRegistry();
      
      // Delete all sessions
      for (const item of registry) {
        await keychainService.deleteUserSession(item.userId);
      }
      
      // Clear registry
      await AsyncStorage.removeItem('sessions_registry');
      await AsyncStorage.removeItem('current_session_id');
      
      console.log('[Keychain] ✅ All sessions deleted');
      return true;
    } catch (error) {
      console.error('[Keychain] ❌ Delete all sessions error:', error);
      return false;
    }
  },

  // ==================== PRIVATE HELPERS ====================
  
  _saveToFallback: async (sessionData) => {
    try {
      const { userId } = sessionData;
      const sessionString = JSON.stringify({
        ...sessionData,
        savedAt: new Date().toISOString(),
        isFallback: true,
      });
      
      await AsyncStorage.setItem(`keychain_fallback_${userId}`, sessionString);
      await keychainService._updateRegistry(userId, sessionData.userName);
      console.log(`[Keychain] ⚠️ Saved to fallback: ${userId}`);
      return true;
    } catch (error) {
      console.error('[Keychain] ❌ Fallback save failed:', error);
      return false;
    }
  },

  _loadFromFallback: async (userId) => {
    try {
      const sessionString = await AsyncStorage.getItem(`keychain_fallback_${userId}`);
      if (sessionString) {
        const session = JSON.parse(sessionString);
        console.log(`[Keychain] ⚠️ Loaded from fallback: ${userId}`);
        return session;
      }
      return null;
    } catch (error) {
      console.error('[Keychain] ❌ Fallback load failed:', error);
      return null;
    }
  },

  _updateRegistry: async (userId, userName) => {
    try {
      let registry = await keychainService._getRegistry();
      
      // Remove if exists
      registry = registry.filter(item => item.userId !== userId);
      
      // Add to beginning
      registry.unshift({
        userId,
        userName,
        timestamp: new Date().toISOString(),
      });
      
      // Keep only 5 most recent
      if (registry.length > 5) {
        registry = registry.slice(0, 5);
      }
      
      await AsyncStorage.setItem('sessions_registry', JSON.stringify(registry));
    } catch (error) {
      console.error('[Keychain] Registry update error:', error);
    }
  },

  _getRegistry: async () => {
    try {
      const registryString = await AsyncStorage.getItem('sessions_registry');
      return registryString ? JSON.parse(registryString) : [];
    } catch (error) {
      console.error('[Keychain] Registry get error:', error);
      return [];
    }
  },

  _removeFromRegistry: async (userId) => {
    try {
      let registry = await keychainService._getRegistry();
      registry = registry.filter(item => item.userId !== userId);
      await AsyncStorage.setItem('sessions_registry', JSON.stringify(registry));
    } catch (error) {
      console.error('[Keychain] Registry remove error:', error);
    }
  },

  // ==================== TEST FUNCTIONS ====================
  
  testKeychain: async () => {
    const testId = `test_${Date.now()}`;
    const testSession = {
      userId: testId,
      userName: 'testuser',
      token: 'test_token_' + Math.random().toString(36).substring(7),
      serverConfig: {
        protocol: 'https',
        host: 'test.example.com',
        port: '443',
      },
    };

    console.log('[Keychain] === STARTING TEST ===');
    
    try {
      // Test 1: Save
      console.log('[Keychain] Test 1: Saving session...');
      const saved = await keychainService.saveUserSession(testSession);
      
      if (!saved) {
        return { success: false, error: 'Failed to save' };
      }

      // Test 2: Load
      console.log('[Keychain] Test 2: Loading session...');
      const loaded = await keychainService.loadUserSession(testId);
      
      if (!loaded) {
        return { success: false, error: 'Failed to load' };
      }

      // Test 3: Recover
      console.log('[Keychain] Test 3: Testing recovery...');
      const recovered = await keychainService.recoverSession();
      
      // Test 4: Delete
      console.log('[Keychain] Test 4: Deleting session...');
      const deleted = await keychainService.deleteUserSession(testId);
      
      if (!deleted) {
        return { success: false, error: 'Failed to delete' };
      }

      // Test 5: Verify deleted
      console.log('[Keychain] Test 5: Verifying deletion...');
      const shouldBeNull = await keychainService.loadUserSession(testId);
      
      if (shouldBeNull) {
        return { success: false, error: 'Session not properly deleted' };
      }

      console.log('[Keychain] ✅ ALL TESTS PASSED');
      return { success: true, message: 'Keychain is working properly' };
      
    } catch (error) {
      console.error('[Keychain] ❌ TEST FAILED:', error);
      return { 
        success: false, 
        error: error.message,
        stack: error.stack 
      };
    }
  },

  getDeviceCapabilities: async () => {
    try {
      const capabilities = {
        biometryType: await Keychain.getSupportedBiometryType(),
        canUseHardware: await Keychain.canUseHardware(),
        securityLevel: await Keychain.getSecurityLevel(),
      };
      console.log('[Keychain] Device Capabilities:', capabilities);
      return capabilities;
    } catch (error) {
      console.error('[Keychain] Error getting device capabilities:', error);
      return { error: error.message };
    }
  },

  healthCheck: async () => {
    try {
      // Check if Keychain is accessible
      await Keychain.getSupportedBiometryType();
      
      // Try to recover session
      const recovered = await keychainService.recoverSession();
      
      return { 
        status: 'healthy', 
        keychain: 'accessible',
        hasRecoveredSession: !!recovered 
      };
    } catch (error) {
      console.error('[Keychain] Health check failed:', error);
      return { 
        status: 'unhealthy', 
        keychain: 'inaccessible',
        error: error.message 
      };
    }
  },
};

export default keychainService;