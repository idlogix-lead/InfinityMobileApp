// hooks/useCRM.js - COMPLETE FIXED VERSION with proper sales opportunity handling
// ADDED: useUpdateSalesOpportunity hook

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
// DATA TRANSFORMATION HELPERS
// ============================================

// Transform lead data to extract nested properties
const transformLeadData = (lead) => {
  if (!lead) return null;
  
  return {
    ...lead,
    // Extract business partner info from nested object
    businessPartnerId: lead.C_BPartner_ID?.id || null,
    businessPartnerName: lead.C_BPartner_ID?.identifier || '',
    businessPartnerLabel: lead.C_BPartner_ID?.identifier || '',
    
    // Extract client info
    clientId: lead.AD_Client_ID?.id || null,
    clientName: lead.AD_Client_ID?.identifier || '',
    
    // Extract organization info
    organizationId: lead.AD_Org_ID?.id || null,
    organizationName: lead.AD_Org_ID?.identifier || '',
    
    // Extract sales rep info
    salesRepId: lead.SalesRep_ID?.id || null,
    salesRepName: lead.SalesRep_ID?.identifier || '',
    
    // Extract lead source info
    leadSourceId: lead.LeadSource?.id || null,
    leadSourceName: lead.LeadSource?.identifier || '',
    
    // Extract status info
    statusId: lead.LeadStatus?.id || 'N',
    statusName: lead.LeadStatus?.identifier || 'New',
    
    // Ensure boolean fields are properly handled
    IsSalesLead: lead.IsSalesLead === true,
    IsVendorLead: lead.IsVendorLead === true,
    IsActive: lead.IsActive === true,
  };
};

// Transform array of leads
const transformLeadsData = (leads) => {
  if (!Array.isArray(leads)) return [];
  return leads.map(transformLeadData);
};

// Transform sales opportunity data to extract nested properties
const transformSalesOpportunityData = (opportunity) => {
  if (!opportunity) return null;
  
  return {
    ...opportunity,
    // Extract business partner info
    businessPartnerId: opportunity.C_BPartner_ID?.id || null,
    businessPartnerName: opportunity.C_BPartner_ID?.identifier || '',
    
    // Extract sales stage info
    salesStageId: opportunity.C_SalesStage_ID?.id || null,
    salesStageName: opportunity.C_SalesStage_ID?.identifier || '',
    
    // Extract currency info
    currencyId: opportunity.C_Currency_ID?.id || null,
    currencyCode: opportunity.C_Currency_ID?.identifier || '',
    
    // Extract sales rep info
    salesRepId: opportunity.SalesRep_ID?.id || null,
    salesRepName: opportunity.SalesRep_ID?.identifier || '',
    
    // Extract user/contact info
    userId: opportunity.AD_User_ID?.id || null,
    userName: opportunity.AD_User_ID?.identifier || '',
    
    // Extract client/org info
    clientId: opportunity.AD_Client_ID?.id || null,
    clientName: opportunity.AD_Client_ID?.identifier || '',
    organizationId: opportunity.AD_Org_ID?.id || null,
    organizationName: opportunity.AD_Org_ID?.identifier || '',
    
    // Ensure numeric fields are properly handled
    OpportunityAmt: opportunity.OpportunityAmt || 0,
    Probability: opportunity.Probability || 0,
    WeightedAmt: opportunity.WeightedAmt || 0,
    Cost: opportunity.Cost || 0,
    
    // Ensure boolean fields
    IsActive: opportunity.IsActive === true,
  };
};

// Transform array of sales opportunities
const transformSalesOpportunitiesData = (opportunities) => {
  if (!Array.isArray(opportunities)) return [];
  return opportunities.map(transformSalesOpportunityData);
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
        
        // Transform the data to extract nested properties
        const transformedData = transformLeadsData(data);
        
        console.log(`✅ useLeads success, data length: ${transformedData.length}`);
        return transformedData;
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
  
  return useQuery({
    queryKey: ['leads', status ? { status } : {}],
    queryFn: async () => {
      console.log(`🔍 Fetching leads with status: ${status || 'All'}`);
      try {
        const data = await crmApiService.getLeads(filters);
        
        // Process and normalize the data
        const processedData = (Array.isArray(data) ? data : []).map(lead => ({
          ...lead,
          LeadStatus: lead.LeadStatus || { id: 'N', identifier: 'New' },
          statusId: lead.LeadStatus?.id || 'N',
          statusLabel: lead.LeadStatus?.identifier || 'New',
          // Extract business partner info
          businessPartnerId: lead.C_BPartner_ID?.id || null,
          businessPartnerName: lead.C_BPartner_ID?.identifier || '',
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

// Hook for fetching a single lead by ID - FIXED with proper transformation
export const useLeadById = (leadId, enabled = true) => {
  return useQuery({
    queryKey: ['lead', leadId],
    queryFn: async () => {
      try {
        if (!leadId) return null;
        console.log(`🔍 Fetching lead with ID: ${leadId}`);
        const data = await crmApiService.getLeadById(leadId);
        
        // Transform the data to extract nested properties
        const transformedData = transformLeadData(data);
        
        console.log('✅ Transformed lead data:', transformedData);
        return transformedData;
      } catch (error) {
        console.error('Get lead by ID failed:', error.message);
        handleApiError(error, 'useLeadById');
        return null;
      }
    },
    enabled: enabled && !!leadId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    retryDelay: 1000,
  });
};

// Hook for fetching sales opportunities
export const useSalesOpportunities = (filters = {}, enabled = true) => {
  console.log('📞 useSalesOpportunities called, enabled:', enabled, 'filters:', filters);
  
  return useQuery({
    queryKey: ['sales-opportunities', filters],
    queryFn: async () => {
      console.log('🔍 useSalesOpportunities queryFn executing - ATTEMPTING TO FETCH DATA');
      try {
        // Get auth state to ensure we're authenticated
        const authState = useAuthStore.getState();
        const userId = authState.userId;
        const token = authState.token;
        
        console.log('🔐 Auth state in useSalesOpportunities:', { 
          userId, 
          hasToken: !!token,
          tokenLength: token?.length,
        });
        
        // Check for token instead of isCompleteAuthenticated
        if (!token) {
          console.log('🛑 useSalesOpportunities: No token, returning empty array');
          return [];
        }
        
        if (!userId) {
          console.log('⚠️ useSalesOpportunities: No userId, but continuing with empty filter');
        }
        
        // Add user ID to filters if not present
        const finalFilters = {
          ...filters,
          userId: filters.userId || userId,
        };
        
        console.log('📤 Calling API with filters:', finalFilters);
        const data = await crmApiService.getSalesOpportunities(finalFilters);
        
        // SAFETY: Ensure we always return an array
        if (!Array.isArray(data)) {
          console.warn('⚠️ useSalesOpportunities: API returned non-array, type:', typeof data);
          console.log('⚠️ Data received:', data);
          return [];
        }
        
        console.log(`✅ useSalesOpportunities received ${data.length} raw records`);
        
        // Transform the data to extract nested properties
        const transformedData = data.map(opp => {
          // Create a transformed object with flattened properties
          const transformed = {
            ...opp,
            // Business Partner
            businessPartnerId: opp.C_BPartner_ID?.id,
            businessPartnerName: opp.C_BPartner_ID?.identifier,
            
            // Sales Stage
            salesStageId: opp.C_SalesStage_ID?.id,
            salesStageName: opp.C_SalesStage_ID?.identifier,
            
            // Currency
            currencyId: opp.C_Currency_ID?.id,
            currencyCode: opp.C_Currency_ID?.identifier,
            
            // Sales Rep
            salesRepId: opp.SalesRep_ID?.id,
            salesRepName: opp.SalesRep_ID?.identifier,
            
            // User/Contact (if any)
            userId: opp.AD_User_ID?.id,
            userName: opp.AD_User_ID?.identifier,
            
            // Client/Org
            clientId: opp.AD_Client_ID?.id,
            clientName: opp.AD_Client_ID?.identifier,
            organizationId: opp.AD_Org_ID?.id,
            organizationName: opp.AD_Org_ID?.identifier,
          };
          
          return transformed;
        });
        
        console.log(`✅ Transformed ${transformedData.length} opportunities`);
        
        // Log first few transformed opportunities for debugging
        if (transformedData.length > 0) {
          console.log('📊 First transformed opportunity:', {
            id: transformedData[0].id,
            documentNo: transformedData[0].DocumentNo,
            businessPartner: transformedData[0].businessPartnerName,
            stage: transformedData[0].salesStageName,
            amount: transformedData[0].OpportunityAmt
          });
        } else {
          console.log('⚠️ No opportunities found in API response');
        }
        
        return transformedData;
      } catch (error) {
        console.error('❌ useSalesOpportunities error:', error);
        console.error('❌ Error stack:', error.stack);
        handleApiError(error, 'useSalesOpportunities');
        return []; // Always return empty array on error
      }
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    retryDelay: 1000,
    onError: (error) => {
      console.error('🔥 useSalesOpportunities query error:', error);
    },
    onSuccess: (data) => {
      console.log('✅ useSalesOpportunities query successful, data length:', data?.length);
    }
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
      
      // Transform the new lead
      const transformedLead = transformLeadData(newLead);
      
      // Update all leads queries
      queryClient.setQueriesData(['leads'], (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        return [transformedLead, ...oldData];
      });
      
      // Update status-specific queries
      const status = newLead.LeadStatus?.identifier || 'New';
      queryClient.setQueriesData(['leads', { status }], (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        return [transformedLead, ...oldData];
      });
      
      // Invalidate statistics
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
    onSuccess: (updatedLead, variables) => {
      console.log('✅ Lead updated successfully, updating cache');
      
      // Transform the updated lead
      const transformedLead = transformLeadData(updatedLead);
      
      // Update the specific lead cache
      queryClient.setQueryData(['lead', variables.id], transformedLead);
      
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
          lead.id === transformedLead.id ? transformedLead : lead
        );
      });
      
      // Update status-specific queries
      if (statusChanged) {
        // Remove from old status cache
        queryClient.setQueriesData(['leads', { status: oldStatus }], (oldData) => {
          if (!Array.isArray(oldData)) return oldData;
          return oldData.filter(lead => lead.id !== transformedLead.id);
        });
        
        // Add to new status cache
        queryClient.setQueriesData(['leads', { status: newStatus }], (oldData) => {
          if (!Array.isArray(oldData)) return oldData;
          // Check if lead already exists in new status cache
          const exists = oldData.some(lead => lead.id === transformedLead.id);
          if (exists) {
            return oldData.map(lead => 
              lead.id === transformedLead.id ? transformedLead : lead
            );
          } else {
            return [...oldData, transformedLead];
          }
        });
      } else {
        // Just update the status-specific cache
        queryClient.setQueriesData(['leads', { status: newStatus }], (oldData) => {
          if (!Array.isArray(oldData)) return oldData;
          return oldData.map(lead => 
            lead.id === transformedLead.id ? transformedLead : lead
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
      
      // Update the specific lead cache
      const currentLead = queryClient.getQueryData(['lead', leadId]);
      if (currentLead) {
        queryClient.setQueryData(['lead', leadId], {
          ...currentLead,
          LeadStatus: {
            id: statusId,
            identifier: statusIdentifier
          }
        });
      }
      
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
    mutationFn: async (opportunityData) => {
      console.log('📤 Creating sales opportunity with data:', JSON.stringify(opportunityData, null, 2));
      
      // Validate required fields
      if (!opportunityData.C_BPartner_ID?.id) {
        console.error('❌ Missing C_BPartner_ID');
        throw new Error('Business Partner is required');
      }
      
      if (!opportunityData.C_SalesStage_ID?.id) {
        console.error('❌ Missing C_SalesStage_ID');
        throw new Error('Sales Stage is required');
      }
      
      if (!opportunityData.C_Currency_ID?.id) {
        console.error('❌ Missing C_Currency_ID');
        throw new Error('Currency is required');
      }
      
      if (!opportunityData.SalesRep_ID?.id) {
        console.error('❌ Missing SalesRep_ID');
        throw new Error('Sales Representative is required');
      }
      
      try {
        const result = await crmApiService.createSalesOpportunity(opportunityData);
        console.log('✅ Sales opportunity created successfully:', result);
        return result;
      } catch (error) {
        console.error('❌ Failed to create sales opportunity:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('🎉 Sales opportunity created, invalidating queries');
      // Invalidate sales opportunities queries to refresh the list
      queryClient.invalidateQueries(['sales-opportunities']);
      
      // Show success message
      Alert.alert('Success', 'Sales opportunity created successfully!');
    },
    onError: (error) => {
      console.error('💥 useCreateSalesOpportunity error:', error);
      handleApiError(error, 'useCreateSalesOpportunity');
      
      // Show error message
      Alert.alert('Error', error.message || 'Failed to create sales opportunity');
    },
    retry: 1,
    retryDelay: 1000,
  });
};

// ============================================
// ADDED: Mutation for updating sales opportunity
// ============================================
export const useUpdateSalesOpportunity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      console.log('📤 Updating sales opportunity:', { id, updates });
      
      if (!id) {
        throw new Error('Opportunity ID is required to update');
      }
      
      try {
        const result = await crmApiService.updateSalesOpportunity(id, updates);
        console.log('✅ Sales opportunity updated successfully:', result);
        return result;
      } catch (error) {
        console.error('❌ Failed to update sales opportunity:', error);
        throw error;
      }
    },
    onSuccess: (updatedData, variables) => {
      console.log('🎉 Sales opportunity updated, updating cache');
      
      // Transform the updated data
      const transformedData = transformSalesOpportunityData(updatedData);
      
      // Update the specific opportunity cache
      queryClient.setQueryData(['sales-opportunity', variables.id], transformedData);
      
      // Update the list cache
      queryClient.setQueriesData(['sales-opportunities'], (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        
        return oldData.map(opp => 
          opp.id === transformedData.id ? transformedData : opp
        );
      });
      
      // Show success message
      Alert.alert('Success', 'Sales opportunity updated successfully!');
    },
    onError: (error) => {
      console.error('💥 useUpdateSalesOpportunity error:', error);
      handleApiError(error, 'useUpdateSalesOpportunity');
      
      // Show error message
      Alert.alert('Error', error.message || 'Failed to update sales opportunity');
    },
    retry: 1,
    retryDelay: 1000,
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
        const data = await crmApiService.searchLeads(searchTerm);
        return transformLeadsData(data);
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

// ============================================
// EXPORTS
// ============================================
export default {
  useLeads,
  useLeadsByStatus,
  useLeadStatistics,
  useFollowups,
  useSalesOpportunities,
  useLeadById,
  useCreateLead,
  useUpdateLead,
  useUpdateLeadStatus,
  useCreateFollowup,
  useUpdateFollowup,
  useDeleteFollowup,
  useUpdateFollowupStatus,
  useCreateSalesOpportunity,
  useUpdateSalesOpportunity, // ADDED
  useSearchLeads,
  useLeadActivities,
  useActivityStatistics,
  useCompletedLeadActivities,
  useRefreshCRMData,
  getStatusId,
  getStatusIdentifier
};