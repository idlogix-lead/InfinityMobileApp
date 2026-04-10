// store/authStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'base-64';
import keychainService from '../services/KeyChainService';

// ============================================
// SIMPLE JWT DECODER FOR STORE
// ============================================
const decodeJWT = (token) => {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const base64Str = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64Str.padEnd(base64Str.length + (4 - base64Str.length % 4) % 4, '=');
    
    const decoded = base64.decode(padded);
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
};

// ============================================
// TOKEN VALIDATION UTILITIES
// ============================================
const validateToken = (token) => {
  try {
    if (!token) return { isValid: false, reason: 'NO_TOKEN' };
    
    const decoded = decodeJWT(token);
    if (!decoded) return { isValid: false, reason: 'INVALID_TOKEN' };
    
    // Check expiration if present
    if (decoded.exp) {
      const expirationTime = decoded.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeRemaining = expirationTime - currentTime;
      
      if (currentTime >= expirationTime) {
        return { 
          isValid: false, 
          reason: 'EXPIRED',
          expiredAt: new Date(expirationTime).toISOString()
        };
      }
      
      return { 
        isValid: true, 
        expiresAt: new Date(expirationTime).toISOString(),
        timeRemaining,
        decoded
      };
    }
    
    // If no exp claim, consider it valid (long-lived token)
    return { 
      isValid: true, 
      expiresAt: 'Never',
      timeRemaining: Infinity,
      decoded 
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return { isValid: false, reason: 'VALIDATION_ERROR' };
  }
};

// ============================================
// AUTH STORE
// ============================================
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Auth state
      token: null,
      tokenOk: null,
      userId: null,
      currentSessionId: null,
      lastTokenValidation: null,

      // User info
      userName: null,
      password: null,

      // Role info (ALWAYS saved after role selection)
      roleId: null,
      roleName: null,
      organizationId: null,
      organizationName: null,
      warehouseId: null,
      warehouseName: null,

      // Client info
      clientId: null,
      clientName: null,

      // Server configuration
      serverConfig: {
        protocol: null,
        host: null,
        port: null,
      },

      // Complete login parameters - NEW
      loginParameters: {
        clientId: null,
        roleId: null,
        organizationId: null,
        warehouseId: null,
        language: 'en_US'
      },

      // Temporary data
      availableClients: null,
      availableRoles: null,
      availableOrganizations: null,
      availableWarehouses: null,

      // App state
      isLoading: false,
      error: null,

      // ============================================
      // TOKEN VALIDATION METHODS
      // ============================================
      validateCurrentToken: () => {
        const state = get();
        const { token } = state;
        
        const validation = validateToken(token);
        
        // Update last validation timestamp
        set({ 
          lastTokenValidation: {
            timestamp: Date.now(),
            result: validation
          }
        });
        
        return validation;
      },

      isTokenValid: () => {
        const state = get();
        const validation = state.validateCurrentToken();
        return validation.isValid;
      },

      getTokenExpiryInfo: () => {
        const state = get();
        const validation = validateToken(state.token);
        return {
          isValid: validation.isValid,
          expiresAt: validation.expiresAt,
          timeRemaining: validation.timeRemaining,
          reason: validation.reason
        };
      },

      // ============================================
      // BASIC ACTIONS
      // ============================================
      createSessionSnapshot: () => {
        const state = get();
        return {
          // Auth state
          token: state.token,
          tokenOk: state.tokenOk,
          userId: state.userId,
          
          // User info
          userName: state.userName,
          password: state.password,
          
          // Role info
          roleId: state.roleId,
          roleName: state.roleName,
          organizationId: state.organizationId,
          organizationName: state.organizationName,
          warehouseId: state.warehouseId,
          warehouseName: state.warehouseName,
          
          // Client info
          clientId: state.clientId,
          clientName: state.clientName,
          
          // Server configuration
          serverConfig: { ...state.serverConfig },
          
          // Complete login parameters - NEW
          loginParameters: { ...state.loginParameters },
          
          // Metadata
          savedAt: new Date().toISOString(),
          isComplete: state.isCompleteAuthenticated,
        };
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      setCredentials: (userName, password) => set({
        userName,
        password
      }),

      setServerConfig: (config) => set({
        serverConfig: { ...get().serverConfig, ...config }
      }),

      // ============================================
      // AUTH DATA SETTERS
      // ============================================
      setBasicAuthData: (data) => {
        // Extract client info if clients array is provided
        let finalClientId = data.clientId;
        let finalClientName = data.clientName;
        let finalClients = data.clients || data.availableClients;

        // If we have a clients array but no clientId, auto-select single client
        if (finalClients && finalClients.length === 1 && !finalClientId) {
          const client = finalClients[0];
          finalClientId = client.id;
          finalClientName = client.name;
        }

        // Get current state
        const currentState = get();

        // Validate the token
        const validation = validateToken(data.token);
        console.log('Token validation on setBasicAuthData:', validation);

        set({
          token: data.token || currentState.token,
          tokenOk: validation.isValid ? 'true' : 'false',
          userName: data.userName || currentState.userName,
          password: data.password || currentState.password,
          userId: data.userId || currentState.userId || data.userName,

          // Set client info
          clientId: finalClientId || currentState.clientId,
          clientName: finalClientName || currentState.clientName,

          // Store clients array
          availableClients: finalClients || currentState.availableClients,

          // PRESERVE existing role data
          roleId: currentState.roleId,
          roleName: currentState.roleName,
          organizationId: currentState.organizationId,
          organizationName: currentState.organizationName,
          warehouseId: currentState.warehouseId,
          warehouseName: currentState.warehouseName,

          // Update last validation
          lastTokenValidation: {
            timestamp: Date.now(),
            result: validation
          }
        });
      },

      setLoginData: (data) => {
        const currentState = get();

        // Validate the token
        const validation = validateToken(data.token);
        console.log('Token validation on setLoginData:', validation);

        set({
          // PRESERVE existing credentials
          userName: currentState.userName,
          password: currentState.password,

          // Update login data
          token: data.token || currentState.token,
          tokenOk: validation.isValid ? 'true' : 'false',
          userId: data.userId || currentState.userId,
          clientId: data.clientId || currentState.clientId,
          clientName: data.clientName || currentState.clientName,
          availableClients: data.clients || currentState.availableClients,

          // Update last validation
          lastTokenValidation: {
            timestamp: Date.now(),
            result: validation
          }
        });
      },

      setAvailableClients: (clients) => set({ availableClients: clients }),
      setAvailableRoles: (roles) => set({ availableRoles: roles }),
      setAvailableOrganizations: (orgs) => set({ availableOrganizations: orgs }),
      setAvailableWarehouses: (warehouses) => set({ availableWarehouses: warehouses }),

      setClientSelection: (clientId, clientName) => set({
        clientId,
        clientName,
        // Update login parameters
        loginParameters: { ...get().loginParameters, clientId }
      }),

      // NEW: Set complete login parameters
      setLoginParameters: (params) => set({
        loginParameters: { ...get().loginParameters, ...params }
      }),

      setCompleteAuthData: (data) => {
        // Extract REAL userId from complete login token
        let realUserId = data.extractedUserId;
        if (data.token && !realUserId) {
          const decoded = decodeJWT(data.token);
          if (decoded?.AD_User_ID) {
            realUserId = decoded.AD_User_ID.toString();
          }
        }

        // Validate the token
        const validation = validateToken(data.token);
        console.log('Token validation on setCompleteAuthData:', validation);

        // Build complete login parameters
        const loginParams = {
          clientId: data.clientId || get().clientId,
          roleId: data.roleId || get().roleId,
          organizationId: data.organizationId || get().organizationId,
          warehouseId: data.warehouseId || get().warehouseId,
          language: data.language || 'en_US'
        };

        set({
          token: data.token || get().token,
          tokenOk: validation.isValid ? 'true' : 'false',
          userId: realUserId || get().userId,

          // Save role data for future logins
          roleId: data.roleId || get().roleId,
          roleName: data.roleName || get().roleName,

          clientId: data.clientId || get().clientId,
          clientName: data.clientName || get().clientName,

          organizationId: data.organizationId || get().organizationId,
          organizationName: data.organizationName || get().organizationName,

          warehouseId: data.warehouseId || get().warehouseId,
          warehouseName: data.warehouseName || get().warehouseName,

          // Save complete login parameters
          loginParameters: loginParams,

          // Update last validation
          lastTokenValidation: {
            timestamp: Date.now(),
            result: validation
          }
        });
      },

      setRoleData: (roleData) => set({
        roleId: roleData.roleId,
        roleName: roleData.roleName,
        organizationId: roleData.organizationId,
        organizationName: roleData.organizationName,
        warehouseId: roleData.warehouseId,
        warehouseName: roleData.warehouseName,
        // Update login parameters
        loginParameters: {
          ...get().loginParameters,
          roleId: roleData.roleId,
          organizationId: roleData.organizationId,
          warehouseId: roleData.warehouseId
        }
      }),

      // ============================================
      // SESSION MANAGEMENT INTEGRATION
      // ============================================
     // In store/authStore.js - Update saveCurrentSession method

saveCurrentSession: async () => {
  try {
    const state = get();
    
    if (!state.userId || !state.token) {
      throw new Error('No active session to save');
    }

    // Validate token before saving
    const validation = validateToken(state.token);
    if (!validation.isValid) {
      console.warn('Attempting to save session with invalid token:', validation.reason);
    }

    // Create session snapshot with COMPLETE data
    const sessionSnapshot = {
      // Auth state
      token: state.token,
      tokenOk: state.tokenOk,
      userId: state.userId,
      
      // User info
      userName: state.userName,
      password: state.password,
      
      // Role info
      roleId: state.roleId,
      roleName: state.roleName,
      organizationId: state.organizationId,
      organizationName: state.organizationName,
      warehouseId: state.warehouseId,
      warehouseName: state.warehouseName,
      
      // Client info
      clientId: state.clientId,
      clientName: state.clientName,
      
      // Server configuration
      serverConfig: { ...state.serverConfig },
      
      // COMPLETE LOGIN PARAMETERS - Make sure these are saved
      loginParameters: state.loginParameters || {
        clientId: state.clientId,
        roleId: state.roleId,
        organizationId: state.organizationId,
        warehouseId: state.warehouseId,
        language: 'en_US'
      },
      
      // Metadata
      savedAt: new Date().toISOString(),
      isComplete: state.isCompleteAuthenticated,
    };
    
    // Save to keychain
    await keychainService.saveUserSession(sessionSnapshot);
    
    // Set as current session
    await keychainService.setCurrentSessionId(state.userId);
    
    // Update session registry
    set({ currentSessionId: state.userId });
    
    console.log('✅ Session saved with complete login parameters');
    return true;
  } catch (error) {
    console.error('Error saving session:', error);
    return false;
  }
},

  // In store/authStore.js - Update loadSession method

loadSession: async (userId) => {
  try {
    const session = await keychainService.loadUserSession(userId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    // Validate token before restoring
    const validation = validateToken(session.token);
    console.log('Session token validation:', validation);

    // Restore session state including login parameters
    set({
      token: session.token,
      tokenOk: validation.isValid ? 'true' : 'false',
      userId: session.userId,
      currentSessionId: session.userId,
      userName: session.userName,
      password: session.password,
      roleId: session.roleId,
      roleName: session.roleName,
      organizationId: session.organizationId,
      organizationName: session.organizationName,
      warehouseId: session.warehouseId,
      warehouseName: session.warehouseName,
      clientId: session.clientId,
      clientName: session.clientName,
      serverConfig: { ...session.serverConfig },
      // CRITICAL FIX: Ensure loginParameters are restored
      loginParameters: session.loginParameters || {
        clientId: session.clientId,
        roleId: session.roleId,
        organizationId: session.organizationId,
        warehouseId: session.warehouseId,
        language: 'en_US'
      },
      lastTokenValidation: {
        timestamp: Date.now(),
        result: validation
      }
    });

    // Update keychain current session
    await keychainService.setCurrentSessionId(session.userId);
    
    console.log('✅ Session loaded with complete login parameters');
    return true;
  } catch (error) {
    console.error('Error loading session:', error);
    return false;
  }
},
      clearCurrentSession: () => {
        // Clear only session-specific data, preserve credentials if needed
        const currentState = get();
        
        set({
          token: null,
          tokenOk: null,
          userId: null,
          currentSessionId: null,
          lastTokenValidation: null,
          
          // Clear role-specific data
          clientId: null,
          clientName: null,
          availableClients: null,
          availableRoles: null,
          availableOrganizations: null,
          availableWarehouses: null,
          
          // Clear login parameters
          loginParameters: {
            clientId: null,
            roleId: null,
            organizationId: null,
            warehouseId: null,
            language: 'en_US'
          },
          
          error: null,
          isLoading: false,
        });
      },

      switchSession: async (userId) => {
        const success = await get().loadSession(userId);
        return success;
      },

      // ============================================
      // LOGOUT
      // ============================================
      logout: async (deleteFromKeychain = false) => {
        const state = get();
        
        if (deleteFromKeychain && state.userId) {
          await keychainService.deleteUserSession(state.userId);
        }
        
        // Save session before clearing (if not deleting)
        if (!deleteFromKeychain && state.isCompleteAuthenticated) {
          await get().saveCurrentSession();
        }
        
        get().clearCurrentSession();
        await keychainService.clearCurrentSessionId();
      },

      // ============================================
      // COMPLETE LOGIN AUTO-RELOGIN (UPDATED)
      // ============================================
    // In store/authStore.js - Update completeRelogin with better logging

completeRelogin: async () => {
  const state = get();
  
  // Check if we have saved credentials and complete login parameters
  if (!state.userName || !state.password) {
    console.log('❌ No saved credentials for complete relogin');
    return null;
  }

  // Log the current login parameters for debugging
  console.log('📋 Current login parameters:', state.loginParameters);

  // Check if we have complete login parameters
  const { clientId, roleId, organizationId, warehouseId } = state.loginParameters || {};
  if (!clientId || !roleId || !organizationId || !warehouseId) {
    console.log('❌ Missing complete login parameters for relogin', {
      hasClientId: !!clientId,
      hasRoleId: !!roleId,
      hasOrgId: !!organizationId,
      hasWarehouseId: !!warehouseId
    });
    return null;
  }
  
  try {
    console.log('🔄 Attempting complete login auto-relogin...');
    
    // Get base URL
    const baseUrl = `${state.serverConfig.protocol}://${state.serverConfig.host}:${state.serverConfig.port}/api/v1`;
    
    // Prepare complete login parameters
    const parameters = {
      clientId: clientId.toString(),
      roleId: roleId.toString(),
      organizationId: organizationId.toString(),
      warehouseId: warehouseId.toString(),
      language: state.loginParameters.language || 'en_US'
    };
    
    console.log('📤 Complete relogin parameters:', parameters);
    
    // Call complete login endpoint with saved credentials and parameters
    const response = await fetch(`${baseUrl}/auth/tokens`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        userName: state.userName,
        password: state.password,
        parameters: parameters
      }),
    });
    
    if (!response.ok) {
      console.log('❌ Complete relogin failed with status:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (data.token) {
      console.log('✅ Complete login auto-relogin successful');
      
      // Extract user ID from token
      let extractedUserId = null;
      const decodedToken = decodeJWT(data.token);
      if (decodedToken?.AD_User_ID) {
        extractedUserId = decodedToken.AD_User_ID.toString();
      } else if (decodedToken?.sub) {
        extractedUserId = decodedToken.sub;
      }
      
      // Update token in store and preserve all data
      set({ 
        token: data.token,
        tokenOk: 'true',
        userId: extractedUserId || state.userId,
        lastTokenValidation: {
          timestamp: Date.now(),
          result: validateToken(data.token)
        }
      });
      
      // ✅ CRITICAL: Update the keychain with the new token and all session data
      await get().saveCurrentSession();
      
      return data.token;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Complete relogin error:', error.message);
    return null;
  }
},

      // ============================================
      // CHECK IF TOKEN NEEDS COMPLETE RELOGIN
      // ============================================
      shouldCompleteRefresh: () => {
        const state = get();
        if (!state.token) return false;
        
        try {
          const decoded = decodeJWT(state.token);
          if (!decoded || !decoded.exp) return false;
          
          const expirationTime = decoded.exp * 1000;
          const currentTime = Date.now();
          const timeUntilExpiry = expirationTime - currentTime;
          
          // Refresh if less than 10 minutes remaining
          // Since token lasts 1 hour (60 minutes), refresh at 50 minutes
          const shouldRefresh = timeUntilExpiry < 10 * 60 * 1000;
          
          if (shouldRefresh) {
            console.log(`⏰ Token expires in ${Math.round(timeUntilExpiry / 60000)} minutes, will refresh soon`);
          }
          
          return shouldRefresh;
        } catch (error) {
          return false;
        }
      },

      // ============================================
      // UTILITY FUNCTIONS
      // ============================================
      checkAuthState: () => {
        const state = get();
        const isBasicAuth = !!(state.token && state.userName);
        const isCompleteAuth = state.isCompleteAuthenticated;

        return { isBasicAuth, isCompleteAuth };
      },

      hasCompleteRoleData: () => {
        const state = get();
        return !!(
          state.roleId &&
          state.organizationId &&
          state.warehouseId &&
          state.roleName &&
          state.organizationName &&
          state.warehouseName
        );
      },

      // ============================================
      // GETTERS
      // ============================================
      get isBasicAuthenticated() {
        const state = get();
        
        // Check if we have token and username
        if (!state.token || typeof state.token !== 'string' || state.token.length < 10 || !state.userName) {
          return false;
        }
        
        return true;
      },

      get isCompleteAuthenticated() {
        const state = get();

        // Check if we have valid token and username (basic auth)
        const hasBasicAuth = state.token &&
          typeof state.token === 'string' &&
          state.token.length > 10 &&
          state.userName;

        // Check if we have REAL numeric user ID (not username)
        const hasRealUserId = state.userId &&
          !isNaN(Number(state.userId)) &&
          state.userId !== state.userName;

        // Check if we have complete login parameters
        const hasCompleteParams = state.loginParameters &&
          state.loginParameters.clientId &&
          state.loginParameters.roleId &&
          state.loginParameters.organizationId &&
          state.loginParameters.warehouseId;

        // Check if we have role data
        const hasRoleData = state.roleId && state.organizationId && state.warehouseId;

        // Complete auth requires all
        return hasBasicAuth && hasRealUserId && hasCompleteParams && hasRoleData;
      },

      get hasServerConfig() {
        const { protocol, host, port } = get().serverConfig;
        return !!(protocol && host && port);
      },

      get tokenData() {
        const token = get().token;
        return decodeJWT(token);
      },

      get tokenExpiryInfo() {
        return get().getTokenExpiryInfo();
      },

      get displayClientInfo() {
        return get().clientName || 'No Client';
      },

      get displayRoleInfo() {
        return get().roleName || 'No Role';
      },

      get displayOrganizationInfo() {
        return get().organizationName || 'No Organization';
      },

      get displayWarehouseInfo() {
        return get().warehouseName || 'No Company';
      },

      get fullUserContext() {
        return {
          client: get().clientName,
          role: get().roleName,
          organization: get().organizationName,
          warehouse: get().warehouseName,
        };
      },

      get savedRoleContext() {
        const state = get();
        if (state.hasCompleteRoleData() && state.roleName && state.organizationName && state.warehouseName) {
          return {
            role: state.roleName,
            organization: state.organizationName,
            warehouse: state.warehouseName,
          };
        }
        return null;
      },

      get isTokenValidJWT() {
        const token = get().token;
        if (!token) return false;
        if (typeof token !== 'string') return false;
        if (token.length < 10) return false;

        try {
          const parts = token.split('.');
          return parts.length === 3;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Persist these fields
        serverConfig: state.serverConfig,
        userName: state.userName,
        password: state.password,
        token: state.token,
        userId: state.userId,
        // Always persist role data
        roleId: state.roleId,
        roleName: state.roleName,
        clientId: state.clientId,
        clientName: state.clientName,
        organizationId: state.organizationId,
        organizationName: state.organizationName,
        warehouseId: state.warehouseId,
        warehouseName: state.warehouseName,
        // Persist complete login parameters
        loginParameters: state.loginParameters,
        // Session management
        currentSessionId: state.currentSessionId,
        // Persist last validation for debugging
        lastTokenValidation: state.lastTokenValidation,
      }),
      onRehydrateStorage: (state) => {
        // Validate token when loading from storage
        if (state?.token) {
          const validation = validateToken(state.token);
          console.log('Token validation on rehydration:', validation);
          
          if (!validation.isValid) {
            console.log('Restored token status:', validation.reason);
          }
        }
       
      },
    }
  )
);