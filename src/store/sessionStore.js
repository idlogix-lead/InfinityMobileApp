// store/sessionStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { keychainService } from '../services/KeyChainService';
import { decodeJWT } from '../utils/authUtils'; // Import from utils

// ============================================
// SESSION MANAGER STORE
// ============================================
export const useSessionStore = create(
  persist(
    (set, get) => ({
      // Session registry
      sessionsRegistry: [],
      isLoading: false,
      error: null,

      // ============================================
      // SESSION MANAGEMENT ACTIONS
      // ============================================

      // Load all sessions from Keychain
      loadAllSessions: async () => {
        try {
          set({ isLoading: true });
          const sessions = await keychainService.getAllSessions();
          
          // Get current session ID
          const currentSessionId = await keychainService.getCurrentSessionId();
          
          // Transform sessions for UI display and validate tokens
          const registry = sessions.map(session => {
            // Validate token if present
            let tokenValid = true;
            if (session.token) {
              try {
                const decoded = decodeJWT(session.token);
                if (decoded?.exp) {
                  tokenValid = Date.now() < decoded.exp * 1000;
                }
              } catch (e) {
                tokenValid = false;
              }
            }

            return {
              id: session.userId,
              userId: session.userId,
              userName: session.userName,
              clientName: session.clientName || 'Unknown Client',
              roleName: session.roleName || 'Unknown Role',
              organizationName: session.organizationName || 'Unknown Org',
              savedAt: session.savedAt,
              isCurrent: session.userId === currentSessionId,
              serverConfig: session.serverConfig,
              isComplete: session.isComplete,
              tokenValid
            };
          });

          set({ sessionsRegistry: registry, isLoading: false });
          return registry;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return [];
        }
      },

      // Add session to registry
      addToRegistry: async (sessionData) => {
        try {
          const { sessionsRegistry } = get();
          const { userId, userName } = sessionData;
          
          // Check if already exists
          const existingIndex = sessionsRegistry.findIndex(
            session => session.userId === userId
          );
          
          let updatedRegistry;
          if (existingIndex !== -1) {
            // Update existing
            updatedRegistry = [...sessionsRegistry];
            updatedRegistry[existingIndex] = {
              ...sessionData,
              updatedAt: new Date().toISOString(),
            };
          } else {
            // Add new
            updatedRegistry = [
              ...sessionsRegistry,
              {
                ...sessionData,
                addedAt: new Date().toISOString(),
              }
            ];
          }
          
          // Limit to 5 sessions
          if (updatedRegistry.length > 5) {
            updatedRegistry = updatedRegistry.slice(-5);
          }
          
          set({ sessionsRegistry: updatedRegistry });
          return updatedRegistry;
        } catch (error) {
          console.error('Error adding to registry:', error);
          return get().sessionsRegistry;
        }
      },

      // Remove session from registry and Keychain
      removeSession: async (userId) => {
        try {
          // Delete from Keychain
          await keychainService.deleteUserSession(userId);
          
          // Update registry
          const { sessionsRegistry } = get();
          const updatedRegistry = sessionsRegistry.filter(
            session => session.userId !== userId
          );
          
          set({ sessionsRegistry: updatedRegistry });
          return updatedRegistry;
        } catch (error) {
          console.error('Error removing session:', error);
          return get().sessionsRegistry;
        }
      },

      // Switch to a session
      switchToSession: async (userId) => {
        try {
          set({ isLoading: true });
          
          // Load session from Keychain
          const session = await keychainService.loadUserSession(userId);
          if (!session) {
            throw new Error('Session not found');
          }
          
          // Validate token before switching
          let tokenValid = true;
          if (session.token) {
            try {
              const decoded = decodeJWT(session.token);
              if (decoded?.exp) {
                tokenValid = Date.now() < decoded.exp * 1000;
              }
            } catch (e) {
              tokenValid = false;
            }
          }
          
          if (!tokenValid) {
            console.log('⚠️ Switching to session with expired token');
          }
          
          // Set as current session
          await keychainService.setCurrentSessionId(userId);
          
          // Update registry to mark this as current
          const { sessionsRegistry } = get();
          const updatedRegistry = sessionsRegistry.map(session => ({
            ...session,
            isCurrent: session.userId === userId,
          }));
          
          set({ 
            sessionsRegistry: updatedRegistry,
            isLoading: false 
          });
          
          return session;
        } catch (error) {
          set({ 
            error: error.message,
            isLoading: false 
          });
          throw error;
        }
      },

      // Get current session
      getCurrentSession: () => {
        const { sessionsRegistry } = get();
        return sessionsRegistry.find(session => session.isCurrent);
      },

      // Check if user has saved sessions
      hasSavedSessions: () => {
        return get().sessionsRegistry.length > 0;
      },

      // Clear all sessions
      clearAllSessions: async () => {
        try {
          await keychainService.deleteAllSessions();
          set({ sessionsRegistry: [] });
          return true;
        } catch (error) {
          console.error('Error clearing all sessions:', error);
          return false;
        }
      },

      // Initialize sessions on app start
      initialize: async () => {
        try {
          // Load all saved sessions
          await get().loadAllSessions();
          
          // Get current session ID
          const currentSessionId = await keychainService.getCurrentSessionId();
          
          if (currentSessionId) {
            // Mark current session in registry
            const { sessionsRegistry } = get();
            const updatedRegistry = sessionsRegistry.map(session => ({
              ...session,
              isCurrent: session.userId === currentSessionId,
            }));
            
            set({ sessionsRegistry: updatedRegistry });
          }
        } catch (error) {
          console.error('Error initializing sessions:', error);
        }
      },

      // Get sessions with validity info
      getSessionsWithValidity: () => {
        const { sessionsRegistry } = get();
        return sessionsRegistry.map(session => ({
          ...session,
          tokenValid: session.tokenValid
        }));
      },
    }),
    {
      name: 'session-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({}),
    }
  )
);