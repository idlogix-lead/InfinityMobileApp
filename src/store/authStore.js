// store/authStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import keychainService from '../services/KeyChainService';
import { decodeJWT, validateToken } from '../utils/authUtils'; // Import from utils

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

      // Role info
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

      // Complete login parameters
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
          token: state.token,
          tokenOk: state.tokenOk,
          userId: state.userId,
          userName: state.userName,
          password: state.password,
          roleId: state.roleId,
          roleName: state.roleName,
          organizationId: state.organizationId,
          organizationName: state.organizationName,
          warehouseId: state.warehouseId,
          warehouseName: state.warehouseName,
          clientId: state.clientId,
          clientName: state.clientName,
          serverConfig: { ...state.serverConfig },
          loginParameters: { ...state.loginParameters },
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
        let finalClientId = data.clientId;
        let finalClientName = data.clientName;
        let finalClients = data.clients || data.availableClients;

        if (finalClients && finalClients.length === 1 && !finalClientId) {
          const client = finalClients[0];
          finalClientId = client.id;
          finalClientName = client.name;
        }

        const currentState = get();
        const validation = validateToken(data.token);
        console.log('Token validation on setBasicAuthData:', validation);

        set({
          token: data.token || currentState.token,
          tokenOk: validation.isValid ? 'true' : 'false',
          userName: data.userName || currentState.userName,
          password: data.password || currentState.password,
          userId: data.userId || currentState.userId || data.userName,
          clientId: finalClientId || currentState.clientId,
          clientName: finalClientName || currentState.clientName,
          availableClients: finalClients || currentState.availableClients,
          roleId: currentState.roleId,
          roleName: currentState.roleName,
          organizationId: currentState.organizationId,
          organizationName: currentState.organizationName,
          warehouseId: currentState.warehouseId,
          warehouseName: currentState.warehouseName,
          lastTokenValidation: {
            timestamp: Date.now(),
            result: validation
          }
        });
      },

      setLoginData: (data) => {
        const currentState = get();
        const validation = validateToken(data.token);
        console.log('Token validation on setLoginData:', validation);

        set({
          userName: currentState.userName,
          password: currentState.password,
          token: data.token || currentState.token,
          tokenOk: validation.isValid ? 'true' : 'false',
          userId: data.userId || currentState.userId,
          clientId: data.clientId || currentState.clientId,
          clientName: data.clientName || currentState.clientName,
          availableClients: data.clients || currentState.availableClients,
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
        loginParameters: { ...get().loginParameters, clientId }
      }),

      setLoginParameters: (params) => set({
        loginParameters: { ...get().loginParameters, ...params }
      }),

      setCompleteAuthData: (data) => {
        let realUserId = data.extractedUserId;
        if (data.token && !realUserId) {
          const decoded = decodeJWT(data.token);
          if (decoded?.AD_User_ID) {
            realUserId = decoded.AD_User_ID.toString();
          }
        }

        const validation = validateToken(data.token);
        console.log('Token validation on setCompleteAuthData:', validation);

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
          roleId: data.roleId || get().roleId,
          roleName: data.roleName || get().roleName,
          clientId: data.clientId || get().clientId,
          clientName: data.clientName || get().clientName,
          organizationId: data.organizationId || get().organizationId,
          organizationName: data.organizationName || get().organizationName,
          warehouseId: data.warehouseId || get().warehouseId,
          warehouseName: data.warehouseName || get().warehouseName,
          loginParameters: loginParams,
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
      saveCurrentSession: async () => {
        try {
          const state = get();
          
          if (!state.userId || !state.token) {
            throw new Error('No active session to save');
          }

          const validation = validateToken(state.token);
          if (!validation.isValid) {
            console.warn('Attempting to save session with invalid token:', validation.reason);
          }

          const sessionSnapshot = {
            token: state.token,
            tokenOk: state.tokenOk,
            userId: state.userId,
            userName: state.userName,
            password: state.password,
            roleId: state.roleId,
            roleName: state.roleName,
            organizationId: state.organizationId,
            organizationName: state.organizationName,
            warehouseId: state.warehouseId,
            warehouseName: state.warehouseName,
            clientId: state.clientId,
            clientName: state.clientName,
            serverConfig: { ...state.serverConfig },
            loginParameters: state.loginParameters || {
              clientId: state.clientId,
              roleId: state.roleId,
              organizationId: state.organizationId,
              warehouseId: state.warehouseId,
              language: 'en_US'
            },
            savedAt: new Date().toISOString(),
            isComplete: state.isCompleteAuthenticated,
          };
          
          await keychainService.saveUserSession(sessionSnapshot);
          await keychainService.setCurrentSessionId(state.userId);
          set({ currentSessionId: state.userId });
          
          console.log('✅ Session saved with complete login parameters');
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

          const validation = validateToken(session.token);
          console.log('Session token validation:', validation);

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

          await keychainService.setCurrentSessionId(session.userId);
          
          console.log('✅ Session loaded with complete login parameters');
          return true;
        } catch (error) {
          console.error('Error loading session:', error);
          return false;
        }
      },

      clearCurrentSession: () => {
        set({
          token: null,
          tokenOk: null,
          userId: null,
          currentSessionId: null,
          lastTokenValidation: null,
          clientId: null,
          clientName: null,
          availableClients: null,
          availableRoles: null,
          availableOrganizations: null,
          availableWarehouses: null,
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
        
        if (!deleteFromKeychain && state.isCompleteAuthenticated) {
          await get().saveCurrentSession();
        }
        
        get().clearCurrentSession();
        await keychainService.clearCurrentSessionId();
      },

      // ============================================
      // COMPLETE LOGIN AUTO-RELOGIN
      // ============================================
      completeRelogin: async () => {
        const state = get();
        
        if (!state.userName || !state.password) {
          console.log('❌ No saved credentials for complete relogin');
          return null;
        }

        console.log('📋 Current login parameters:', state.loginParameters);

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
          
          const baseUrl = `${state.serverConfig.protocol}://${state.serverConfig.host}:${state.serverConfig.port}/api/v1`;
          
          const parameters = {
            clientId: clientId.toString(),
            roleId: roleId.toString(),
            organizationId: organizationId.toString(),
            warehouseId: warehouseId.toString(),
            language: state.loginParameters.language || 'en_US'
          };
          
          console.log('📤 Complete relogin parameters:', parameters);
          
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
            
            let extractedUserId = null;
            const decodedToken = decodeJWT(data.token);
            if (decodedToken?.AD_User_ID) {
              extractedUserId = decodedToken.AD_User_ID.toString();
            } else if (decodedToken?.sub) {
              extractedUserId = decodedToken.sub;
            }
            
            set({ 
              token: data.token,
              tokenOk: 'true',
              userId: extractedUserId || state.userId,
              lastTokenValidation: {
                timestamp: Date.now(),
                result: validateToken(data.token)
              }
            });
            
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
        
        if (!state.token || typeof state.token !== 'string' || state.token.length < 10 || !state.userName) {
          return false;
        }
        
        return true;
      },

      get isCompleteAuthenticated() {
        const state = get();

        const hasBasicAuth = state.token &&
          typeof state.token === 'string' &&
          state.token.length > 10 &&
          state.userName;

        const hasRealUserId = state.userId &&
          !isNaN(Number(state.userId)) &&
          state.userId !== state.userName;

        const hasCompleteParams = state.loginParameters &&
          state.loginParameters.clientId &&
          state.loginParameters.roleId &&
          state.loginParameters.organizationId &&
          state.loginParameters.warehouseId;

        const hasRoleData = state.roleId && state.organizationId && state.warehouseId;

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
        serverConfig: state.serverConfig,
        userName: state.userName,
        password: state.password,
        token: state.token,
        userId: state.userId,
        roleId: state.roleId,
        roleName: state.roleName,
        clientId: state.clientId,
        clientName: state.clientName,
        organizationId: state.organizationId,
        organizationName: state.organizationName,
        warehouseId: state.warehouseId,
        warehouseName: state.warehouseName,
        loginParameters: state.loginParameters,
        currentSessionId: state.currentSessionId,
        lastTokenValidation: state.lastTokenValidation,
      }),
      onRehydrateStorage: (state) => {
        if (state?.token) {
          const validation = validateToken(state.token);
          console.log('Token validation on rehydration:', validation);
          
          if (!validation.isValid) {
            console.log('Restored token status:', validation.reason);
          }
        }
        return state;
      },
    }
  )
);