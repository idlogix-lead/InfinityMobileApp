import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useAuthStore } from '../store/authStore';
import apiService from '../services/api';

// Hook for Step 1: Basic login
export const useBasicLogin = () => {
  const setAuthData = useAuthStore(state => state.setAuthData);
  const setLoading = useAuthStore(state => state.setLoading);
  const setError = useAuthStore(state => state.setError);
  
  return useMutation({
    mutationFn: ({ userName, password }) => 
      apiService.basicLogin(userName, password),
    onMutate: () => {
      setLoading(true);
      setError(null);
      
    },
   onSuccess: (data, variables) => {
  // variables contains { userName, password } from mutation
  setAuthData({
    userName: variables.userName,
    password: variables.password,
    token: data.token,
    availableClients: data.clients || [],
  });
},
    onError: (error) => {
      setError(error.message || 'Basic login failed');
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

// Hook for Step 2: Complete login with parameters
export const useCompleteLogin = () => {
  const setAuthData = useAuthStore(state => state.setAuthData);
  const setLoading = useAuthStore(state => state.setLoading);
  const setError = useAuthStore(state => state.setError);
  const userName = useAuthStore(state => state.userName);
  const password = useAuthStore(state => state.password);
  
  return useMutation({
    mutationFn: (parameters) => 
      apiService.completeLogin(userName, password, parameters),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      // Store complete auth data
      setAuthData({
        token: data.token,
        // Extract IDs from token
        clientId: data.clients?.[0]?.id?.toString(),
        clientName: data.clients?.[0]?.name,
        // Clear temporary data
        availableClients: null,
      });
    },
    onError: (error) => {
      setError(error.message || 'Complete login failed');
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useCreateSession = () => {
  const setAuthData = useAuthStore(state => state.setAuthData);
  const token = useAuthStore(state => state.token);
  
  return useMutation({
    mutationFn: (sessionData) => apiService.createSession(token, sessionData),
    onSuccess: (data) => {
      setAuthData({
        token: data.token,
        tokenOk: data.userId,
      });
    },
  });
};

export const useCheckAuth = () => {
  const { isAuthenticated, hasServerConfig, token, userName, password } = useAuthStore();
  
  return useQuery({
    queryKey: ['auth-check'],
    queryFn: async () => {
      if (!hasServerConfig) {
        throw new Error('Server configuration required');
      }
      
      if (!isAuthenticated || !token || !userName || !password) {
        throw new Error('Not authenticated');
      }
      
      // ✅ Use basicLogin instead of login
      const loginData = await apiService.basicLogin(userName, password);
      return loginData;
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: hasServerConfig && !!userName && !!password,
  });
};