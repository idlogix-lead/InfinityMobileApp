// hooks/useCRM.js - FIXED VERSION

import { useQuery, useMutation, useQueryClient } from 'react-query';
import crmApiService from '../../services/CRMAPI/crmApiService';
import { useAuthStore } from '../../store/authStore';
import { Alert } from 'react-native';

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
// STATUS MAPPING HELPERS
// ============================================

// Map status identifier to ID
export const getStatusId = (statusIdentifier) => {
  const statusMap = {
    'New': 'N',
    'Working': 'W',
    'Converted': 'C',
    'Expired': 'E',
    'N': 'N',
    'W': 'W',
    'C': 'C',
    'E': 'E'
  };
  return statusMap[statusIdentifier] || 'N';
};

// Map status ID to identifier
export const getStatusIdentifier = (statusId) => {
  const statusMap = {
    'N': 'New',
    'W': 'Working',
    'C': 'Converted',
    'E': 'Expired'
  };
  return statusMap[statusId] || 'New';
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

// Hook for fetching leads by status (for category filtering)
export const useLeadsByStatus = (status, enabled = true) => {
  console.log('📞 useLeadsByStatus called, status:', status);
  
  const filters = {};
  if (status) {
    filters.status = status;
  }
  
  const queryClient = useQueryClient();
  const queryKey = ['leads', status ? { status } : {}];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      console.log(`🔍 Fetching leads with status: ${status || 'All'}`);
      try {
        const data = await crmApiService.getLeads(filters);
        
        // Process and normalize the data
        const processedData = (Array.isArray(data) ? data : []).map(lead => ({
          ...lead,
          LeadStatus: lead.LeadStatus || { id: 'N', identifier: 'New' },
          statusId: lead.LeadStatus?.id || 'N',
          statusLabel: lead.LeadStatus?.identifier || 'New'
        }));
        
        console.log(`✅ Retrieved ${processedData.length} leads for status: ${status || 'All'}`);
        return processedData;
      } catch (error) {
        handleApiError(error, 'useLeadsByStatus');
        return [];
      }
    },
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 5, // 5 minutes
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
    onSuccess: (newLead) => {
      console.log('✅ Lead created successfully, updating cache');
      
      // Update all leads queries
      queryClient.setQueriesData(['leads'], (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        return [newLead, ...oldData];
      });
      
      // Update status-specific queries
      const status = newLead.LeadStatus?.identifier || 'New';
      queryClient.setQueriesData(['leads', { status }], (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        return [newLead, ...oldData];
      });
      
      // Invalidate statistics
      queryClient.invalidateQueries(['lead-statistics']);
    },
    onError: (error) => {
      handleApiError(error, 'useCreateLead');
    },
  });
};

// Mutation for updating a lead - FIXED: Removed refetch triggers
export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }) => crmApiService.updateLead(id, updates),
    onSuccess: (updatedLead, variables) => {
      console.log('✅ Lead updated successfully, updating cache');
      
      // Get old lead data to check if status changed
      const oldLeads = queryClient.getQueryData(['leads']);
      let oldStatus = null;
      
      if (Array.isArray(oldLeads)) {
        const oldLead = oldLeads.find(lead => lead.id === variables.id);
        oldStatus = oldLead?.LeadStatus?.identifier;
      }
      
      const newStatus = updatedLead.LeadStatus?.identifier;
      const statusChanged = oldStatus && newStatus && oldStatus !== newStatus;
      
      // Update all leads cache
      queryClient.setQueriesData(['leads'], (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        
        return oldData.map(lead => 
          lead.id === updatedLead.id ? { ...lead, ...updatedLead } : lead
        );
      });
      
      // Update status-specific queries
      if (statusChanged) {
        // Remove from old status cache
        queryClient.setQueriesData(['leads', { status: oldStatus }], (oldData) => {
          if (!Array.isArray(oldData)) return oldData;
          return oldData.filter(lead => lead.id !== updatedLead.id);
        });
        
        // Add to new status cache
        queryClient.setQueriesData(['leads', { status: newStatus }], (oldData) => {
          if (!Array.isArray(oldData)) return oldData;
          // Check if lead already exists in new status cache
          const exists = oldData.some(lead => lead.id === updatedLead.id);
          if (exists) {
            return oldData.map(lead => 
              lead.id === updatedLead.id ? { ...lead, ...updatedLead } : lead
            );
          } else {
            return [...oldData, updatedLead];
          }
        });
      } else {
        // Just update the status-specific cache
        queryClient.setQueriesData(['leads', { status: newStatus }], (oldData) => {
          if (!Array.isArray(oldData)) return oldData;
          return oldData.map(lead => 
            lead.id === updatedLead.id ? { ...lead, ...updatedLead } : lead
          );
        });
      }
      
      // Only invalidate statistics (lightweight), NOT leads
      queryClient.invalidateQueries(['lead-statistics']);
    },
    onError: (error) => {
      handleApiError(error, 'useUpdateLead');
    },
    // Don't refetch after mutation
    refetchQueries: false,
  });
};

// Mutation for updating lead status - FIXED: Removed infinite loop
export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ leadId, status }) => {
      console.log('🔄 useUpdateLeadStatus mutationFn called with:', { leadId, status });
      
      if (!leadId) {
        throw new Error('Lead ID is required to update status');
      }
      
      try {
        const statusId = getStatusId(status);
        const statusIdentifier = getStatusIdentifier(statusId);
        
        const response = await crmApiService.updateLeadStatus(leadId, status);
        console.log('✅ useUpdateLeadStatus API success:', response);
        
        return { 
          ...response, 
          leadId, 
          status,
          statusId,
          statusIdentifier 
        };
      } catch (error) {
        console.error('❌ useUpdateLeadStatus mutation error:', error);
        throw error;
      }
    },
    onMutate: async ({ leadId, status }) => {
      console.log('🔄 Optimistic update for lead status:', { leadId, status });
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['leads']);
      
      // Get status IDs
      const statusId = getStatusId(status);
      const statusIdentifier = getStatusIdentifier(statusId);
      
      // Snapshot the previous value
      const previousLeads = queryClient.getQueryData(['leads']);
      
      // Get old lead data to find previous status
      let oldStatus = null;
      if (Array.isArray(previousLeads)) {
        const oldLead = previousLeads.find(lead => lead.id === leadId || lead.AD_User_ID?.id === leadId);
        oldStatus = oldLead?.LeadStatus?.identifier;
      }
      
      // Optimistically update all leads caches
      const optimisticUpdate = (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        
        return oldData.map(lead => {
          if (lead.id === leadId || lead.AD_User_ID?.id === leadId) {
            return {
              ...lead,
              LeadStatus: {
                id: statusId,
                identifier: statusIdentifier
              },
              statusId: statusId,
              statusLabel: statusIdentifier
            };
          }
          return lead;
        });
      };
      
      // Update all leads queries
      queryClient.setQueriesData(['leads'], optimisticUpdate);
      
      // Update status-specific queries
      if (oldStatus && oldStatus !== statusIdentifier) {
        // Remove from old status cache
        queryClient.setQueriesData(['leads', { status: oldStatus }], (oldData) => {
          if (!Array.isArray(oldData)) return oldData;
          return oldData.filter(lead => !(lead.id === leadId || lead.AD_User_ID?.id === leadId));
        });
        
        // Get the updated lead from the main cache
        const updatedLeads = queryClient.getQueryData(['leads']);
        let updatedLead = null;
        if (Array.isArray(updatedLeads)) {
          updatedLead = updatedLeads.find(lead => lead.id === leadId || lead.AD_User_ID?.id === leadId);
        }
        
        // Add to new status cache
        if (updatedLead) {
          queryClient.setQueriesData(['leads', { status: statusIdentifier }], (oldData) => {
            if (!Array.isArray(oldData)) return [updatedLead];
            // Check if lead already exists
            const exists = oldData.some(lead => lead.id === leadId || lead.AD_User_ID?.id === leadId);
            if (exists) {
              return oldData.map(lead => 
                (lead.id === leadId || lead.AD_User_ID?.id === leadId) ? updatedLead : lead
              );
            } else {
              return [...oldData, updatedLead];
            }
          });
        }
      } else {
        // Just update the status-specific cache
        queryClient.setQueriesData(['leads', { status: statusIdentifier }], optimisticUpdate);
      }
      
      // Return context with snapshots
      return { previousLeads, oldStatus, leadId, newStatus: statusIdentifier };
    },
    onSuccess: (data, variables, context) => {
      console.log('✅ useUpdateLeadStatus onSuccess:', { data, variables, context });
      
      // Only invalidate statistics, NOT leads
      queryClient.invalidateQueries(['lead-statistics']);
      
      // Show success message
      Alert.alert('Success', `Lead status updated to ${variables.status} successfully!`);
    },
    onError: (error, variables, context) => {
      console.error('❌ useUpdateLeadStatus onError:', { error, variables, context });
      
      // Rollback on error
      if (context?.previousLeads) {
        queryClient.setQueryData(['leads'], context.previousLeads);
        
        // Also rollback status-specific queries
        if (context.oldStatus) {
          queryClient.invalidateQueries(['leads', { status: context.oldStatus }]);
        }
        queryClient.invalidateQueries(['leads', { status: context.newStatus }]);
      }
      
      Alert.alert('Error', `Failed to update status: ${error.message}`);
    },
    // CRITICAL FIX: Don't refetch leads here - this was causing infinite loop
    onSettled: () => {
      // Only invalidate statistics, NOT leads
      queryClient.invalidateQueries(['lead-statistics']);
    },
  });
};

// Mutation for updating followup status
export const useUpdateFollowupStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isComplete }) => 
      crmApiService.updateFollowup(id, { IsComplete: isComplete }),
    onMutate: async ({ id, isComplete }) => {
      await queryClient.cancelQueries(['followups']);
      
      const previousFollowups = queryClient.getQueryData(['followups']);
      
      queryClient.setQueriesData(['followups'], (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.map(followup => 
          followup.id === id ? { ...followup, IsComplete: isComplete } : followup
        );
      });
      
      return { previousFollowups };
    },
    onError: (error, variables, context) => {
      if (context?.previousFollowups) {
        queryClient.setQueryData(['followups'], context.previousFollowups);
      }
      handleApiError(error, 'useUpdateFollowupStatus');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['followups']);
    },
  });
};

// Mutation for creating followup
export const useCreateFollowup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (followupData) => crmApiService.createFollowup(followupData),
    onSuccess: (newFollowup) => {
      // Update followups cache
      queryClient.setQueriesData(['followups'], (oldData) => {
        if (!Array.isArray(oldData)) return [newFollowup];
        return [newFollowup, ...oldData];
      });
      
      // Invalidate lead activities
      if (newFollowup.AD_User_ID?.id) {
        queryClient.invalidateQueries(['lead-activities', newFollowup.AD_User_ID.id]);
      }
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
      queryClient.setQueriesData(['followups'], (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.map(followup => 
          followup.id === updatedFollowup.id ? { ...followup, ...updatedFollowup } : followup
        );
      });
      
      // Invalidate lead activities
      if (updatedFollowup.AD_User_ID?.id) {
        queryClient.invalidateQueries(['lead-activities', updatedFollowup.AD_User_ID.id]);
      }
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
    onSuccess: (result, followupId) => {
      // Get the deleted followup data to know which lead it belonged to
      const followups = queryClient.getQueryData(['followups']);
      let leadId = null;
      
      if (Array.isArray(followups)) {
        const deletedFollowup = followups.find(f => f.id === followupId);
        leadId = deletedFollowup?.AD_User_ID?.id;
      }
      
      // Remove from followups cache
      queryClient.setQueriesData(['followups'], (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.filter(followup => followup.id !== followupId);
      });
      
      // Invalidate lead activities
      if (leadId) {
        queryClient.invalidateQueries(['lead-activities', leadId]);
      }
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

// ============================================
// SEARCH AND ACTIVITY HOOKS
// ============================================

// Hook for searching leads
export const useSearchLeads = (searchTerm, enabled = true) => {
  return useQuery({
    queryKey: ['search-leads', searchTerm],
    queryFn: async () => {
      try {
        if (!searchTerm || searchTerm.trim() === '') {
          return [];
        }
        return await crmApiService.searchLeads(searchTerm);
      } catch (error) {
        console.error('Search leads failed:', error.message);
        return [];
      }
    },
    enabled: enabled && searchTerm?.length > 2,
    staleTime: 1000 * 60 * 5,
    retry: false,
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

// ============================================
// REFRESH HOOK
// ============================================

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
        query.queryKey[0] === 'sales-opportunities' ||
        query.queryKey[0] === 'lead-activities'
    });
  };
};

// Hook for fetching completed activities for a specific lead
export const useCompletedLeadActivities = (leadId, enabled = true) => {
  return useQuery({
    queryKey: ['lead-completed-activities', leadId],
    queryFn: async () => {
      try {
        if (!leadId) return [];
        const activities = await crmApiService.getCompletedLeadActivities(leadId);
        return Array.isArray(activities) ? activities : [];
      } catch (error) {
        console.error('Get completed lead activities failed:', error.message);
        return [];
      }
    },
    enabled: enabled && !!leadId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export default {
  useLeads,
  useLeadsByStatus,
  useLeadStatistics,
  useFollowups,
  useSalesOpportunities,
  useCreateLead,
  useUpdateLead,
  useUpdateLeadStatus,
  useCreateFollowup,
  useUpdateFollowup,
  useDeleteFollowup,
  useUpdateFollowupStatus,
  useCreateSalesOpportunity,
  useSearchLeads,
  useLeadActivities,
  useActivityStatistics,
  useCompletedLeadActivities,
  useRefreshCRMData,
  getStatusId,
  getStatusIdentifier
};