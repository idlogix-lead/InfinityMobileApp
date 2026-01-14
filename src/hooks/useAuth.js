import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useAuthStore } from '../store/authStore';
import apiService from '../services/authApi';

// Hook for Step 1: Basic login
export const useBasicLogin = () => {
  const setBasicAuthData = useAuthStore(state => state.setBasicAuthData);
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
      console.log('\n' + '='.repeat(60));
      console.log('🚀 BASIC LOGIN SUCCESS');
      console.log('='.repeat(60));
      
      // Store basic auth data (this should NOT mark user as fully authenticated)
      setBasicAuthData({
        userName: variables.userName,
        password: variables.password,
        token: data.token,
        clients: data.clients || [],
      });
      
      console.log('\n✅ Basic Login Complete');
      console.log(`📝 User ID: ${useAuthStore.getState().userId}`);
      console.log(`📋 Available Clients: ${data.clients?.length || 0}`);
      console.log('💡 User must select role to complete authentication');
      console.log('='.repeat(60) + '\n');
    },
    onError: (error) => {
      console.error('❌ Basic login error:', error);
      setError(error.message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

// Hook for Step 2: Complete login with parameters
export const useCompleteLogin = () => {
  const setCompleteAuthData = useAuthStore(state => state.setCompleteAuthData);
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
    onSuccess: (data, variables) => {
      console.log('\n' + '='.repeat(60));
      console.log('🔐 COMPLETE LOGIN SUCCESS');
      console.log('='.repeat(60));
      
      // Get REAL user ID from API response
      const realUserId = data.extractedUserId;
      
      if (!realUserId) {
        console.error('❌ No user ID extracted from complete login token');
        throw new Error('Failed to extract user information');
      }
      
      console.log(`✅ REAL User ID: ${realUserId}`);
      
      // Store complete auth data with REAL numeric ID
      setCompleteAuthData({
        token: data.token,
        extractedUserId: realUserId,
        clientId: variables.clientId,
        roleId: variables.roleId,
        organizationId: variables.organizationId,
        warehouseId: variables.warehouseId,
      });
      
      console.log('\n✅ AUTHENTICATION COMPLETE!');
      const storeState = useAuthStore.getState();
      console.log('📋 Final User Information:');
      console.log(`  • User ID: ${storeState.userId}`);
      console.log(`  • Username: ${storeState.userName}`);
      console.log(`  • Role ID: ${storeState.roleId}`);
      console.log(`  • Client ID: ${storeState.clientId}`);
      console.log('='.repeat(60) + '\n');
      
      return data;
    },
    onError: (error) => {
      console.error('\n❌ Complete login error:', error);
      setError(error.message || 'Complete login failed');
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

// ============================================
// OTHER HOOKS
// ============================================
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
      
      const loginData = await apiService.basicLogin(userName, password);
      return loginData;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    enabled: hasServerConfig && !!userName && !!password,
  });
};

export const useRoles = (clientId, enabled = true) => {
  const token = useAuthStore(state => state.token);
  
  return useQuery({
    queryKey: ['roles', clientId],
    queryFn: () => apiService.getRoles(token, clientId),
    enabled: enabled && !!token && !!clientId,
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching roles:', error);
    },
  });
};

export const useOrganizations = (clientId, roleId, enabled = true) => {
  const token = useAuthStore(state => state.token);
  
  return useQuery({
    queryKey: ['organizations', clientId, roleId],
    queryFn: () => apiService.getOrganizations(token, clientId, roleId),
    enabled: enabled && !!token && !!clientId && !!roleId,
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching organizations:', error);
    },
  });
};

export const useWarehouses = (clientId, roleId, organizationId, enabled = true) => {
  const token = useAuthStore(state => state.token);
  
  return useQuery({
    queryKey: ['warehouses', clientId, roleId, organizationId],
    queryFn: () => apiService.getWarehouses(token, clientId, roleId, organizationId),
    enabled: enabled && !!token && !!clientId && !!roleId && !!organizationId,
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching warehouses:', error);
    },
  });
};