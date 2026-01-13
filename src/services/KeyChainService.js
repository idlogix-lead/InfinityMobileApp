import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants
const SERVICE_NAME = 'com.erp.mobile.app';
const CURRENT_SESSION_KEY = 'current_session_key';
const SESSIONS_REGISTRY_KEY = 'sessions_registry';
const SESSIONS_COUNT_KEY = 'sessions_count_key';

// ============================================
// KEYCHAIN SERVICE
// ============================================

export const keychainService = {
  // ============================================
  // SESSION MANAGEMENT
  // ============================================

  /**
   * Save a complete user session to Keychain
   */
  saveUserSession: async (sessionData) => {
    try {
      const { userId, userName } = sessionData;
      
      if (!userId || !userName) {
        throw new Error('User ID and Username are required');
      }

      // Create unique key for this user
      const key = `${SERVICE_NAME}.session.${userId}`;
      
      // Serialize session data
      const sessionString = JSON.stringify({
        ...sessionData,
        savedAt: new Date().toISOString(),
      });

      // Save to Keychain (encrypted)
      const result = await Keychain.setInternetCredentials(
        key,
        userName,
        sessionString,
        {
          service: SERVICE_NAME,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
          securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
        }
      );

      if (result) {
        // Add to registry
        await keychainService.addToRegistry(userId, userName, key);
        // Update sessions count
        await keychainService.updateSessionsCount();
        console.log(`✅ Session saved for user: ${userName} (${userId})`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error saving session to Keychain:', error);
      throw error;
    }
  },

  /**
   * Load a specific user session from Keychain
   */
  loadUserSession: async (userId) => {
    try {
      const key = `${SERVICE_NAME}.session.${userId}`;
      
      const credentials = await Keychain.getInternetCredentials(key, {
        service: SERVICE_NAME,
      });

      if (credentials && credentials.password) {
        const sessionData = JSON.parse(credentials.password);
        console.log(`✅ Session loaded for user ID: ${userId}`);
        return sessionData;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error loading session from Keychain:', error);
      return null;
    }
  },

  /**
   * Get all saved sessions from Keychain
   */
  getAllSessions: async () => {
    try {
      // Get sessions registry
      const sessionsRegistry = await AsyncStorage.getItem(SESSIONS_REGISTRY_KEY);
      
      if (!sessionsRegistry) {
        return [];
      }

      const sessionKeys = JSON.parse(sessionsRegistry);
      const sessions = [];

      // Load each session
      for (const sessionKey of sessionKeys) {
        try {
          if (sessionKey && sessionKey.userId) {
            const session = await keychainService.loadUserSession(sessionKey.userId);
            if (session) {
              sessions.push({
                ...session,
                key: sessionKey.key,
              });
            }
          }
        } catch (error) {
          console.error(`Error loading session ${sessionKey?.userId}:`, error);
        }
      }

      // Sort by most recent
      return sessions.sort((a, b) => 
        new Date(b.savedAt || 0) - new Date(a.savedAt || 0)
      );
    } catch (error) {
      console.error('❌ Error getting all sessions:', error);
      return [];
    }
  },

  /**
   * Delete a specific user session
   */
  deleteUserSession: async (userId) => {
    try {
      const key = `${SERVICE_NAME}.session.${userId}`;
      
      // Remove from Keychain
      const result = await Keychain.resetInternetCredentials(key, {
        service: SERVICE_NAME,
      });

      if (result) {
        // Update sessions registry
        const sessionsRegistry = await AsyncStorage.getItem(SESSIONS_REGISTRY_KEY);
        
        if (sessionsRegistry) {
          const sessionKeys = JSON.parse(sessionsRegistry);
          const updatedKeys = sessionKeys.filter(session => 
            session && session.userId !== userId
          );
          
          await AsyncStorage.setItem(
            SESSIONS_REGISTRY_KEY,
            JSON.stringify(updatedKeys)
          );
          
          await keychainService.updateSessionsCount();
        }

        console.log(`🗑️ Session deleted for user ID: ${userId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error deleting session:', error);
      return false;
    }
  },

  /**
   * Delete all saved sessions
   */
  deleteAllSessions: async () => {
    try {
      const sessions = await keychainService.getAllSessions();
      
      for (const session of sessions) {
        if (session && session.userId) {
          await keychainService.deleteUserSession(session.userId);
        }
      }

      // Clear registry
      await AsyncStorage.removeItem(SESSIONS_REGISTRY_KEY);
      await AsyncStorage.removeItem(SESSIONS_COUNT_KEY);

      console.log('🗑️ All sessions deleted');
      return true;
    } catch (error) {
      console.error('❌ Error deleting all sessions:', error);
      return false;
    }
  },

  /**
   * Update sessions count in AsyncStorage
   */
  updateSessionsCount: async () => {
    try {
      const sessions = await keychainService.getAllSessions();
      await AsyncStorage.setItem(SESSIONS_COUNT_KEY, sessions.length.toString());
    } catch (error) {
      console.error('Error updating sessions count:', error);
    }
  },

  /**
   * Get total sessions count
   */
  getSessionsCount: async () => {
    try {
      const count = await AsyncStorage.getItem(SESSIONS_COUNT_KEY);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      console.error('Error getting sessions count:', error);
      return 0;
    }
  },

  /**
   * Check if a session exists for a user
   */
  hasSession: async (userId) => {
    try {
      const session = await keychainService.loadUserSession(userId);
      return !!session;
    } catch (error) {
      console.error('Error checking session:', error);
      return false;
    }
  },

  // ============================================
  // CURRENT SESSION MANAGEMENT
  // ============================================

  /**
   * Save current session ID
   */
  setCurrentSessionId: async (userId) => {
    try {
      await AsyncStorage.setItem(CURRENT_SESSION_KEY, userId || '');
    } catch (error) {
      console.error('Error setting current session ID:', error);
    }
  },

  /**
   * Get current session ID
   */
  getCurrentSessionId: async () => {
    try {
      const userId = await AsyncStorage.getItem(CURRENT_SESSION_KEY);
      return userId || null;
    } catch (error) {
      console.error('Error getting current session ID:', error);
      return null;
    }
  },

  /**
   * Clear current session ID
   */
  clearCurrentSessionId: async () => {
    try {
      await AsyncStorage.removeItem(CURRENT_SESSION_KEY);
    } catch (error) {
      console.error('Error clearing current session ID:', error);
    }
  },

  // ============================================
  // SESSION REGISTRY MANAGEMENT
  // ============================================

  /**
   * Add session to registry
   */
  addToRegistry: async (userId, userName, key) => {
    try {
      const sessionsRegistry = await AsyncStorage.getItem(SESSIONS_REGISTRY_KEY);
      const registry = sessionsRegistry ? JSON.parse(sessionsRegistry) : [];
      
      // Check if already exists
      const existingIndex = registry.findIndex(session => 
        session && session.userId === userId
      );
      
      if (existingIndex !== -1) {
        // Update existing entry
        registry[existingIndex] = {
          userId,
          userName,
          key,
          updatedAt: new Date().toISOString(),
        };
      } else {
        // Add new entry
        registry.push({
          userId,
          userName,
          key,
          addedAt: new Date().toISOString(),
        });
      }
      
      // Limit to last 5 accounts
      if (registry.length > 5) {
        registry.splice(0, registry.length - 5);
      }
      
      await AsyncStorage.setItem(SESSIONS_REGISTRY_KEY, JSON.stringify(registry));
    } catch (error) {
      console.error('Error adding to registry:', error);
    }
  },

  /**
   * Get sessions registry
   */
  getSessionsRegistry: async () => {
    try {
      const registry = await AsyncStorage.getItem(SESSIONS_REGISTRY_KEY);
      return registry ? JSON.parse(registry) : [];
    } catch (error) {
      console.error('Error getting sessions registry:', error);
      return [];
    }
  },

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  /**
   * Create a session snapshot from auth store
   */
  createSessionSnapshot: (authStore) => {
    return {
      // Auth state
      token: authStore.token,
      tokenOk: authStore.tokenOk,
      userId: authStore.userId,
      
      // User info
      userName: authStore.userName,
      password: authStore.password,
      
      // Role info
      roleId: authStore.roleId,
      roleName: authStore.roleName,
      organizationId: authStore.organizationId,
      organizationName: authStore.organizationName,
      warehouseId: authStore.warehouseId,
      warehouseName: authStore.warehouseName,
      
      // Client info
      clientId: authStore.clientId,
      clientName: authStore.clientName,
      
      // Server configuration
      serverConfig: { ...authStore.serverConfig },
      
      // Metadata
      savedAt: new Date().toISOString(),
      isComplete: authStore.isCompleteAuthenticated,
    };
  },
  /**
 * Get session by username
 */
getSessionByUsername: async (userName) => {
  try {
    const sessions = await keychainService.getAllSessions();
    return sessions.find(session => 
      session.userName === userName
    ) || null;
  } catch (error) {
    console.error('Error getting session by username:', error);
    return null;
  }
},

  /**
   * Validate session data
   */
  validateSession: (sessionData) => {
    if (!sessionData) return false;
    
    const requiredFields = [
      'token',
      'userId',
      'userName',
      'serverConfig',
      'savedAt'
    ];
    
    for (const field of requiredFields) {
      if (!sessionData[field]) {
        console.error(`Missing required field: ${field}`);
        return false;
      }
    }
    
    // Validate server config
    const { protocol, host, port } = sessionData.serverConfig;
    if (!protocol || !host || !port) {
      console.error('Invalid server config in session');
      return false;
    }
    
    // Validate token
    if (typeof sessionData.token !== 'string' || sessionData.token.length < 10) {
      console.error('Invalid token in session');
      return false;
    }
    
    return true;
  },
};

export default keychainService;