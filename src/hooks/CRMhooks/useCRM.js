// hooks/useCRM.js
import { useQuery, useMutation, useQueryClient } from 'react-query';
import crmApiService from '../../services/CRMAPI/crmApiService';
import { useAuthStore } from '../../store/authStore';

// ============================================
// COMMON ERROR HANDLER
// ============================================
const handleApiError = (error, context) => {
  console.error(`❌ ${context} Error:`, error.message);
  
  // Handle specific error types
  if (error.message === 'SESSION_EXPIRED') {
    console.log('⚠️ Session expired, triggering logout...');
    // You could trigger a logout action here
    // useAuthStore.getState().logout();
    throw new Error('Your session has expired. Please login again.');
  } else if (error.message === 'PERMISSION_DENIED') {
    throw new Error('You do not have permission to access this resource.');
  } else if (error.message === 'SERVER_CONFIG_MISSING') {
    throw new Error('Server configuration is missing. Please configure server settings.');
  } else if (error.message === 'AUTH_TOKEN_MISSING') {
    throw new Error('Authentication token is missing. Please login again.');
  }
  
  throw error;
};

// ============================================
// QUERY HOOKS
// ============================================

// Hook for fetching leads
export const useLeads = (filters = {}, enabled = true) => {
  console.log('📞 useLeads called, enabled:', enabled);
  
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: async () => {
      console.log('🔍 useLeads queryFn executing with filters:', filters);
      try {
        const data = await crmApiService.getLeads(filters);
        
        // SAFETY: Ensure we always return an array
        if (!Array.isArray(data)) {
          console.warn('⚠️ useLeads: API returned non-array, converting to array');
          return [];
        }
        
        console.log(`✅ useLeads success, data length: ${data.length}`);
        return data;
      } catch (error) {
        handleApiError(error, 'useLeads');
        return []; // Fallback to empty array
      }
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
    retryDelay: 1000,
  });
};

// Hook for fetching lead statistics
export const useLeadStatistics = (enabled = true) => {
  return useQuery({
    queryKey: ['lead-statistics'],
    queryFn: async () => {
      try {
        return await crmApiService.getLeadStatistics();
      } catch (error) {
        handleApiError(error, 'useLeadStatistics');
        return { total: 0, new: 0, working: 0, converted: 0, expired: 0 };
      }
    },
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
// Add this to your useCRM.js file
export const useUpdateFollowupStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isComplete }) => 
      crmApiService.updateFollowup(id, { IsComplete: isComplete }),
    onSuccess: (updatedFollowup) => {
      queryClient.setQueryData(['followups'], (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        
        return oldData.map(followup => 
          followup.id === updatedFollowup.id ? { ...followup, ...updatedFollowup } : followup
        );
      });
    },
    onError: (error) => {
      handleApiError(error, 'useUpdateFollowupStatus');
    },
  });
};
// Hook for fetching followups
export const useFollowups = (filters = {}, enabled = true) => {
  return useQuery({
    queryKey: ['followups', filters],
    queryFn: async () => {
      try {
        const data = await crmApiService.getFollowups(filters);
        
        // SAFETY: Ensure array response
        if (!Array.isArray(data)) {
          console.warn('⚠️ useFollowups: API returned non-array');
          return [];
        }
        
        console.log(`✅ Retrieved ${data.length} followups`);
        return data;
      } catch (error) {
        handleApiError(error, 'useFollowups');
        return [];
      }
    },
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Hook for fetching sales opportunities
export const useSalesOpportunities = (filters = {}, enabled = true) => {
  console.log('📞 useSalesOpportunities called, enabled:', enabled);
  
  return useQuery({
    queryKey: ['sales-opportunities', filters],
    queryFn: async () => {
      console.log('🔍 useSalesOpportunities queryFn executing with filters:', filters);
      try {
        // Get auth state to ensure we're authenticated
        const isCompleteAuthenticated = useAuthStore.getState().isCompleteAuthenticated;
        if (!isCompleteAuthenticated) {
          console.log('🛑 useSalesOpportunities: Not authenticated, returning empty array');
          return [];
        }
        
        // Add user ID to filters if not present
        const userId = useAuthStore.getState().userId;
        const finalFilters = {
          ...filters,
          userId: filters.userId || userId,
        };
        
        const data = await crmApiService.getSalesOpportunities(finalFilters);
        
        // SAFETY: Critical fix for destructuring errors
        if (!Array.isArray(data)) {
          console.warn('⚠️ useSalesOpportunities: API returned non-array, type:', typeof data);
          console.log('⚠️ Data received:', data);
          return [];
        }
        
        console.log(`✅ useSalesOpportunities success, data length: ${data.length}`);
        return data;
      } catch (error) {
        handleApiError(error, 'useSalesOpportunities');
        return []; // Always return empty array on error
      }
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
    retryDelay: 1000,
  });
};

// ============================================
// MUTATION HOOKS
// ============================================

// Mutation for creating a lead
export const useCreateLead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (leadData) => crmApiService.createLead(leadData),
    onSuccess: () => {
      // Invalidate leads queries
      queryClient.invalidateQueries(['leads']);
      queryClient.invalidateQueries(['lead-statistics']);
    },
    onError: (error) => {
      handleApiError(error, 'useCreateLead');
    },
  });
};

// Mutation for updating a lead
export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }) => crmApiService.updateLead(id, updates),
    onSuccess: (updatedLead) => {
      // Update leads cache
      queryClient.setQueryData(['leads'], (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        
        return oldData.map(lead => 
          lead.id === updatedLead.id ? { ...lead, ...updatedLead } : lead
        );
      });
      
      // Invalidate statistics
      queryClient.invalidateQueries(['lead-statistics']);
    },
    onError: (error) => {
      handleApiError(error, 'useUpdateLead');
    },
  });
};



// Mutation for updating lead status 
export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ leadId, status }) => {
      console.log('🔄 useUpdateLeadStatus mutationFn called with:', { leadId, status });
      
      if (!leadId) {
        throw new Error('Lead ID is required to update status');
      }
      
      try {
        const response = await crmApiService.updateLeadStatus(leadId, status);
        console.log('✅ useUpdateLeadStatus success:', response);
        return { ...response, leadId, status };
      } catch (error) {
        console.error('❌ useUpdateLeadStatus mutation error:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      console.log('✅ useUpdateLeadStatus onSuccess:', { data, variables });
      
      // Update leads cache
      queryClient.setQueryData(['leads'], (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        
        return oldData.map(lead => {
          if (lead.id === variables.leadId || lead.AD_User_ID?.id === variables.leadId) {
            return { 
              ...lead, 
              LeadStatus: { 
                id: variables.status === 'New' ? 'N' : 
                     variables.status === 'Working' ? 'W' : 
                     variables.status === 'Converted' ? 'C' : 
                     variables.status === 'Expired' ? 'E' : 'N',
                identifier: variables.status
              } 
            };
          }
          return lead;
        });
      });
      
      // Invalidate statistics
      queryClient.invalidateQueries(['lead-statistics']);
    },
    onError: (error, variables) => {
      console.error('❌ useUpdateLeadStatus onError:', { error, variables });
      Alert.alert('Error', `Failed to update status: ${error.message}`);
    },
  });
};

// Mutation for creating followup
export const useCreateFollowup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (followupData) => crmApiService.createFollowup(followupData),
    onSuccess: () => {
      // Invalidate followups queries
      queryClient.invalidateQueries(['followups']);
    },
    onError: (error) => {
      handleApiError(error, 'useCreateFollowup');
    },
  });
};

// Mutation for updating followup
export const useUpdateFollowup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }) => crmApiService.updateFollowup(id, updates),
    onSuccess: (updatedFollowup) => {
      // Update followups cache
      queryClient.setQueryData(['followups'], (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        
        return oldData.map(followup => 
          followup.id === updatedFollowup.id ? { ...followup, ...updatedFollowup } : followup
        );
      });
    },
    onError: (error) => {
      handleApiError(error, 'useUpdateFollowup');
    },
  });
};

// Mutation for deleting followup
export const useDeleteFollowup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (followupId) => crmApiService.deleteFollowup(followupId),
    onSuccess: (result) => {
      // Remove from followups cache
      queryClient.setQueryData(['followups'], (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        
        return oldData.filter(followup => followup.id !== result.id);
      });
    },
    onError: (error) => {
      handleApiError(error, 'useDeleteFollowup');
    },
  });
};

// Mutation for creating sales opportunity
export const useCreateSalesOpportunity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (opportunityData) => crmApiService.createSalesOpportunity(opportunityData),
    onSuccess: () => {
      // Invalidate sales opportunities queries
      queryClient.invalidateQueries(['sales-opportunities']);
    },
    onError: (error) => {
      handleApiError(error, 'useCreateSalesOpportunity');
    },
  });
};

// Hook for searching leads
export const useSearchLeads = (searchTerm, enabled = true) => {
  return useQuery({
    queryKey: ['search-leads', searchTerm],
    queryFn: async () => {
      try {
        return await crmApiService.searchLeads(searchTerm);
      } catch (error) {
        handleApiError(error, 'useSearchLeads');
        return [];
      }
    },
    enabled: enabled && searchTerm?.length > 2,
    staleTime: 1000 * 60 * 5,
    retry: false, // Don't retry search queries
  });
};

// Hook for fetching activities for a specific lead
export const useLeadActivities = (leadId, enabled = true) => {
  return useQuery({
    queryKey: ['lead-activities', leadId],
    queryFn: async () => {
      try {
        if (!leadId) return [];
        const activities = await crmApiService.getFollowups({ userId: leadId });
        return Array.isArray(activities) ? activities : [];
      } catch (error) {
        console.error('Get lead activities failed:', error.message);
        return [];
      }
    },
    enabled: enabled && !!leadId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Hook for activity statistics
export const useActivityStatistics = (leadId) => {
  const { data: activities = [] } = useLeadActivities(leadId);
  
  return React.useMemo(() => {
    const total = activities.length;
    const completed = activities.filter(a => a.IsComplete).length;
    const pending = total - completed;
    
    return {
      total,
      completed,
      pending,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [activities]);
};

// Hook for refreshing all CRM data
export const useRefreshCRMData = () => {
  const queryClient = useQueryClient();
  
  return () => {
    console.log('🔄 Refreshing all CRM data...');
    queryClient.invalidateQueries({
      predicate: (query) => 
        query.queryKey[0] === 'leads' ||
        query.queryKey[0] === 'lead-statistics' ||
        query.queryKey[0] === 'followups' ||
        query.queryKey[0] === 'sales-opportunities'
    });
  };
};