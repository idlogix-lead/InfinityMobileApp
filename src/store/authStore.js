import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const decodeJWT = (token) => {
  try {
    if (!token) return null;
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      token: null,
      tokenOk: null,
      userId: null,
      roleId: null,
      userName: null,
      password: null, // ← ADD THIS LINE (was missing!)
      
      // Server configuration
      serverConfig: {
        protocol: null,
        host: null,
        port: null,
      },
      
      // Client info
      clientId: null,
      clientName: null, // ← ADD THIS LINE (was referenced but not defined)
      organizationId: null,
      warehouseId: null,
      
      // Temporary data (not persisted)
      availableClients: null, // ← ADD THIS for storing clients from basic login
      
      // App state
      isLoading: false,
      error: null,
      
      // Actions
      setServerConfig: (config) => set({ 
        serverConfig: { ...get().serverConfig, ...config } 
      }),
      
      setAuthData: (data) => set({ 
        user: data.user || get().user,
        token: data.token || get().token,
        tokenOk: data.tokenOk || get().tokenOk,
        userId: data.userId || get().userId,
        roleId: data.roleId || get().roleId,
        userName: data.userName || get().userName,
        password: data.password || get().password, // ← ADD THIS LINE
        clientId: data.clientId || get().clientId,
        clientName: data.clientName || get().clientName, // ← ADD THIS LINE
        organizationId: data.organizationId || get().organizationId,
        warehouseId: data.warehouseId || get().warehouseId,
        availableClients: data.availableClients || get().availableClients, // ← ADD THIS LINE
      }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      
      logout: () => set({
        user: null,
        token: null,
        tokenOk: null,
        userId: null,
        roleId: null,
        userName: null,
        password: null, // ← ADD THIS LINE
        clientId: null,
        clientName: null, // ← ADD THIS LINE
        organizationId: null,
        warehouseId: null,
        availableClients: null, // ← ADD THIS LINE
        error: null,
      }),
      
      clearError: () => set({ error: null }),
      
      // Helper getters
      get isAuthenticated() {
        return !!(get().token && get().userName);
      },
      
      get hasServerConfig() {
        const { protocol, host, port } = get().serverConfig;
        return !!(protocol && host && port);
      },
      
      get tokenData() {
        const token = get().token;
        return decodeJWT(token);
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Persist these fields
        serverConfig: state.serverConfig,
        userName: state.userName,
        password: state.password, // ← CRITICAL: Add password here!
        roleId: state.roleId,
        clientId: state.clientId,
        clientName: state.clientName,
        organizationId: state.organizationId,
        warehouseId: state.warehouseId,
        token: state.token,       
        userId: state.userId,
        
      
      }),
    }
  )
);