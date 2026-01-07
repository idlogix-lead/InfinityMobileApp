import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'base-64';

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

    // Add padding
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

      // User info
      userName: null,
      password: null,

      // Role info
      roleId: null,
      roleName: null,

      // Client info
      clientId: null,
      clientName: null,

      // Organization info
      organizationId: null,
      organizationName: null,

      // Warehouse info
      warehouseId: null,
      warehouseName: null,

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
      // ACTIONS
      // ============================================

      checkAuthState: () => {
        const state = get();
        const isBasicAuth = !!(state.token && state.userName);
        const isCompleteAuth = isBasicAuth && !!state.roleId && !!state.userId && state.userId !== state.userName;

        return { isBasicAuth, isCompleteAuth };
      },

      setCredentials: (userName, password) => set({
        userName,
        password
      }),

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
          clients: data.clients || currentState.clients,
          availableClients: data.clients || currentState.availableClients,

          // Clear role data for fresh login
          roleId: null,
          roleName: null,
          organizationId: null,
          organizationName: null,
          warehouseId: null,
          warehouseName: null,
        });
      },

      setAvailableClients: (clients) => set({ availableClients: clients }),

      setClientSelection: (clientId, clientName) => set({
        clientId,
        clientName
      }),

      setServerConfig: (config) => set({
        serverConfig: { ...get().serverConfig, ...config }
      }),

      // For basic login
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
          clients: finalClients || currentState.clients,
          availableClients: finalClients || currentState.availableClients,

          // Clear previous selections
          roleId: null,
          roleName: null,
          organizationId: null,
          organizationName: null,
          warehouseId: null,
          warehouseName: null,
        });
      },

      // For complete login (after role selection)
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

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      logout: () => {
        // Get current state to preserve credentials
        const currentState = get();

        set({
          // Clear session data
          token: null,
          tokenOk: null,
          userId: null,
          roleId: null,
          roleName: null,

          // PRESERVE credentials for "Remember Me"
          userName: currentState.userName,
          password: currentState.password,

          // Clear other session data
          clientId: null,
          clientName: null,
          organizationId: null,
          organizationName: null,
          warehouseId: null,
          warehouseName: null,
          availableClients: null,
          error: null,
        });
      },

      clearError: () => set({ error: null }),

      // ============================================
      // GETTERS
      // ============================================

      // Check if user has basic authentication (after login)
      get isBasicAuthenticated() {
        const state = get();
        return !!(
          state.token &&
          typeof state.token === 'string' &&
          state.token.length > 10 &&
          state.userName
        );
      },

      // Check if user has complete authentication (after role selection)
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

        // Complete auth requires all three
        return hasBasicAuth && hasRealUserId && hasRoleId;
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
        roleId: state.roleId,
        roleName: state.roleName,
        clientId: state.clientId,
        clientName: state.clientName,
        organizationId: state.organizationId,
        organizationName: state.organizationName,
        warehouseId: state.warehouseId,
        warehouseName: state.warehouseName,
      }),
    }
  )
);