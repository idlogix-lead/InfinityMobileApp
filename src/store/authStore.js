import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'base-64';
import { keychainService } from '../services/KeyChainService';

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

      // Temporary data
      availableClients: null,

      // App state
      isLoading: false,
      error: null,

      // ============================================
      // BASIC ACTIONS
      // ============================================
    // In your auth store, update the createSessionSnapshot method:
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

        set({
          token: data.token || currentState.token,
          tokenOk: 'true',
          userName: data.userName || currentState.userName,
          password: data.password || currentState.password,
          userId: data.userId || currentState.userId || data.userName,

          // Set client info
          clientId: finalClientId || currentState.clientId,
          clientName: finalClientName || currentState.clientName,

          // Store clients array
          availableClients: finalClients || currentState.availableClients,

          // PRESERVE existing role data (automatically remembered)
          roleId: currentState.roleId,
          roleName: currentState.roleName,
          organizationId: currentState.organizationId,
          organizationName: currentState.organizationName,
          warehouseId: currentState.warehouseId,
          warehouseName: currentState.warehouseName,
        });
      },

      setLoginData: (data) => {
        const currentState = get();

        set({
          // PRESERVE existing credentials
          userName: currentState.userName,
          password: currentState.password,

          // Update login data
          token: data.token || currentState.token,
          userId: data.userId || currentState.userId,
          clientId: data.clientId || currentState.clientId,
          clientName: data.clientName || currentState.clientName,
          availableClients: data.clients || currentState.availableClients,
        });
      },

      setAvailableClients: (clients) => set({ availableClients: clients }),

      setClientSelection: (clientId, clientName) => set({
        clientId,
        clientName
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

        set({
          token: data.token || get().token,
          tokenOk: 'true',
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
        });
      },

      setRoleData: (roleData) => set({
        roleId: roleData.roleId,
        roleName: roleData.roleName,
        organizationId: roleData.organizationId,
        organizationName: roleData.organizationName,
        warehouseId: roleData.warehouseId,
        warehouseName: roleData.warehouseName,
      }),

      // ============================================
      // SESSION MANAGEMENT INTEGRATION
      // ============================================
    saveCurrentSession: async () => {
  try {
    const state = get();
    
    if (!state.userId || !state.token) {
      throw new Error('No active session to save');
    }

    // Use the new method
    const sessionSnapshot = get().createSessionSnapshot();
    
    // Save to keychain
    await keychainService.saveUserSession(sessionSnapshot);
    
    // Set as current session
    await keychainService.setCurrentSessionId(state.userId);
    
    // Update session registry
    set({ currentSessionId: state.userId });
    
    return true;
  } catch (error) {
    console.error('Error saving session:', error);
    return false;
  }
},

      loadSession: async (userId) => {
        try {
          const session = await keychainService.loadUserSession(userId);
          
          if (!session) {
            throw new Error('Session not found');
          }

          // Restore session state
          set({
            token: session.token,
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
          });

          // Update keychain current session
          await keychainService.setCurrentSessionId(session.userId);
          
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
          
          // Preserve these based on app logic
          // userName: null, // Keep for remember me
          // password: null, // Keep for remember me
          
          // Clear role-specific data
     
          
          clientId: null,
          clientName: null,
          availableClients: null,
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
        return !!(
          state.token &&
          typeof state.token === 'string' &&
          state.token.length > 10 &&
          state.userName
        );
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

        // Check if we have role ID
        const hasRoleId = !!state.roleId;

        // Check if we have organization ID
        const hasOrganizationId = !!state.organizationId;

        // Check if we have warehouse ID
        const hasWarehouseId = !!state.warehouseId;

        // Complete auth requires all
        return hasBasicAuth && hasRealUserId && hasRoleId && hasOrganizationId && hasWarehouseId;
      },

      get hasServerConfig() {
        const { protocol, host, port } = get().serverConfig;
        return !!(protocol && host && port);
      },

      get tokenData() {
        const token = get().token;
        return decodeJWT(token);
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
        // Session management
        currentSessionId: state.currentSessionId,
      }),
    }
  )
);