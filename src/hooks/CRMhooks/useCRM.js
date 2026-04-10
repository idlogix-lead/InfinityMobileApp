// hooks/useCRM.js - COMPLETE UPDATED VERSION with all hooks
// Directly uses statuses extracted from leads
// All alerts removed from mutation hooks - UI components handle notifications

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useMemo } from 'react';
import crmApiService from '../../services/CRMAPI/crmApiService';
import { useAuthStore } from '../../store/authStore';

// ============================================
// COMMON ERROR HANDLER
// ============================================
const handleApiError = (error, context) => {
  console.error(`❌ ${context} Error:`, error.message);
  
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
// LEAD STATUS MANAGEMENT
// ============================================

// Helper function to get color from ID (used when statuses not loaded)
const getStatusColorFromId = (statusId) => {
  const colorMap = {
    'N': '#2196F3',
    'W': '#FF9800',
    'C': '#4CAF50',
    'E': '#F44336',
    'Q': '#9C27B0',
    'L': '#F44336',
    'H': '#FFC107',
  };
  
  if (colorMap[statusId]) return colorMap[statusId];
  
  const colors = [
    '#1E88E5', '#D32F2F', '#7B1FA2', '#C2185B', '#E64A19',
    '#388E3C', '#FBC02D', '#00796B', '#5D4037', '#455A64'
  ];
  
  const hash = statusId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Hook for fetching lead statuses directly from leads
 * This will automatically include any new statuses added in backend
 */
export const useLeadStatuses = (enabled = true) => {
  return useQuery({
    queryKey: ['lead-statuses'],
    queryFn: async () => {
      console.log('📊 Fetching lead statuses from leads...');
      try {
        const statuses = await crmApiService.getLeadStatuses();
        console.log(`✅ Retrieved ${statuses.length} lead statuses`);
        return statuses;
      } catch (error) {
        console.error('❌ Failed to fetch lead statuses:', error);
        
        // Return default statuses as fallback
        return [
          { id: 'N', name: 'New', description: 'New Lead', sequence: 10, count: 0, color: '#2196F3', isActive: true },
          { id: 'W', name: 'Working', description: 'Working on Lead', sequence: 20, count: 0, color: '#FF9800', isActive: true },
          { id: 'C', name: 'Converted', description: 'Converted to Customer', sequence: 30, count: 0, color: '#4CAF50', isActive: true },
          { id: 'E', name: 'Expired', description: 'Lead Expired', sequence: 40, count: 0, color: '#F44336', isActive: true }
        ];
      }
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
  });
};

/**
 * Get status name by ID
 */
export const getStatusNameById = (statusId, statuses) => {
  if (!statusId) return 'Unknown';
  if (!statuses || !Array.isArray(statuses)) return statusId;
  
  const status = statuses.find(s => s.id === statusId);
  return status?.name || statusId;
};

/**
 * Get status by ID
 */
export const getStatusById = (statusId, statuses) => {
  if (!statusId || !statuses) return null;
  return statuses.find(s => s.id === statusId);
};

// ============================================
// DATA TRANSFORMATION HELPERS
// ============================================

// Transform lead data to extract nested properties
const transformLeadData = (lead, statuses = []) => {
  if (!lead) return null;
  
  const statusId = lead.LeadStatus?.id || 'N';
  const status = statuses.find(s => s.id === statusId) || {
    id: statusId,
    name: lead.LeadStatus?.identifier || 'Unknown',
    color: getStatusColorFromId(statusId)
  };
  
  return {
    ...lead,
    // Lead Status
    LeadStatus: lead.LeadStatus || { id: 'N', identifier: 'New' },
    statusId: statusId,
    statusName: status.name,
    statusColor: status.color,
    statusObject: status,
    
    // Lead Source
    LeadSource: lead.LeadSource || null,
    sourceId: lead.LeadSource?.id || null,
    sourceName: lead.LeadSource?.identifier || '',
    
    // Sales Rep
    SalesRep_ID: lead.SalesRep_ID || null,
    salesRepId: lead.SalesRep_ID?.id || null,
    salesRepName: lead.SalesRep_ID?.identifier || '',
    
    // Business Partner
    businessPartnerId: lead.C_BPartner_ID?.id || null,
    businessPartnerName: lead.C_BPartner_ID?.identifier || lead.BPName || '',
    
    // Client
    clientId: lead.AD_Client_ID?.id || null,
    clientName: lead.AD_Client_ID?.identifier || '',
    
    // Organization
    organizationId: lead.AD_Org_ID?.id || null,
    organizationName: lead.AD_Org_ID?.identifier || '',
    
    // Location
    locationId: lead.C_Location_ID?.id || null,
    locationName: lead.C_Location_ID?.identifier || '',
    
    // Created/Updated By
    createdById: lead.CreatedBy?.id || null,
    createdByName: lead.CreatedBy?.identifier || '',
    updatedById: lead.UpdatedBy?.id || null,
    updatedByName: lead.UpdatedBy?.identifier || '',
    
    // Booleans
    IsSalesLead: lead.IsSalesLead === true,
    IsActive: lead.IsActive === true,
    IsLocked: lead.IsLocked === true,
    IsSupportUser: lead.IsSupportUser === true,
    
    // Dates
    createdDate: lead.Created,
    updatedDate: lead.Updated,
    lastContactDate: lead.LastContact,
    
    // Contact Info
    email: lead.EMail,
    phone: lead.Phone,
    phone2: lead.Phone2,
    fax: lead.Fax,
    
    // Lead Info
    value: lead.Value,
    description: lead.Description,
    lastResult: lead.LastResult,
  };
};

// Transform array of leads
const transformLeadsData = (leads, statuses = []) => {
  if (!Array.isArray(leads)) return [];
  return leads.map(lead => transformLeadData(lead, statuses));
};

// Transform sales opportunity data
const transformSalesOpportunityData = (opportunity) => {
  if (!opportunity) return null;
  
  return {
    ...opportunity,
    // Business Partner
    businessPartnerId: opportunity.C_BPartner_ID?.id || null,
    businessPartnerName: opportunity.C_BPartner_ID?.identifier || '',
    
    // Sales Stage
    salesStageId: opportunity.C_SalesStage_ID?.id || null,
    salesStageName: opportunity.C_SalesStage_ID?.identifier || '',
    
    // Currency
    currencyId: opportunity.C_Currency_ID?.id || null,
    currencyCode: opportunity.C_Currency_ID?.identifier || '',
    
    // Sales Rep
    salesRepId: opportunity.SalesRep_ID?.id || null,
    salesRepName: opportunity.SalesRep_ID?.identifier || '',
    
    // Lead/Contact
    leadId: opportunity.AD_User_ID?.id || null,
    leadName: opportunity.AD_User_ID?.identifier || '',
    
    // Client/Org
    clientId: opportunity.AD_Client_ID?.id || null,
    clientName: opportunity.AD_Client_ID?.identifier || '',
    organizationId: opportunity.AD_Org_ID?.id || null,
    organizationName: opportunity.AD_Org_ID?.identifier || '',
    
    // Campaign
    campaignId: opportunity.C_Campaign_ID?.id || null,
    campaignName: opportunity.C_Campaign_ID?.identifier || '',
    
    // Amounts
    amount: opportunity.OpportunityAmt || 0,
    probability: opportunity.Probability || 0,
    weightedAmount: opportunity.WeightedAmt || 0,
    cost: opportunity.Cost || 0,
    
    // Dates
    createdDate: opportunity.Created,
    updatedDate: opportunity.Updated,
    expectedCloseDate: opportunity.ExpectedCloseDate,
    
    // Booleans
    IsActive: opportunity.IsActive === true,
  };
};

// Transform array of sales opportunities
const transformSalesOpportunitiesData = (opportunities) => {
  if (!Array.isArray(opportunities)) return [];
  return opportunities.map(transformSalesOpportunityData);
};

// ============================================
// QUERY HOOKS
// ============================================

// Hook for fetching leads
export const useLeads = (filters = {}, enabled = true) => {
  const { data: statuses = [] } = useLeadStatuses(enabled);
  
  console.log('📞 useLeads called, enabled:', enabled, 'filters:', filters);
  
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: async () => {
      console.log('🔍 useLeads queryFn executing');
      try {
        const data = await crmApiService.getLeads(filters);
        
        if (!Array.isArray(data)) {
          console.warn('⚠️ useLeads: API returned non-array');
          return [];
        }
        
        const transformedData = transformLeadsData(data, statuses);
        
        console.log(`✅ useLeads success, data length: ${transformedData.length}`);
        
        if (transformedData.length > 0) {
          console.log('📊 Sample lead status:', {
            id: transformedData[0].id,
            name: transformedData[0].Name,
            statusId: transformedData[0].statusId,
            statusName: transformedData[0].statusName,
            salesRep: transformedData[0].salesRepName
          });
        }
        
        return transformedData;
      } catch (error) {
        handleApiError(error, 'useLeads');
        return [];
      }
    },
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

// Hook for fetching leads by status
export const useLeadsByStatus = (statusId, enabled = true) => {
  const filters = statusId ? { status: statusId } : {};
  const { data: leads = [], isLoading } = useLeads(filters, enabled);
  
  return {
    data: leads,
    isLoading,
    totalCount: leads.length,
  };
};

// Hook for fetching lead statistics
export const useLeadStatistics = (enabled = true) => {
  const { data: statuses = [] } = useLeadStatuses(enabled);
  
  return useQuery({
    queryKey: ['lead-statistics'],
    queryFn: async () => {
      try {
        const stats = await crmApiService.getLeadStatistics();
        
        // Add status names and colors to statistics
        const byStatus = {};
        statuses.forEach(status => {
          byStatus[status.id] = {
            count: stats.byStatus[status.id]?.count || 0,
            name: status.name,
            id: status.id,
            color: status.color,
          };
        });
        
        return {
          total: stats.total,
          byStatus,
        };
      } catch (error) {
        handleApiError(error, 'useLeadStatistics');
        return { total: 0, byStatus: {} };
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
        
        if (!Array.isArray(data)) {
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
    staleTime: 1000 * 60 * 2,
  });
};

// Hook for fetching a single lead by ID
export const useLeadById = (leadId, enabled = true) => {
  const { data: statuses = [] } = useLeadStatuses(enabled);
  
  return useQuery({
    queryKey: ['lead', leadId],
    queryFn: async () => {
      try {
        if (!leadId) return null;
        console.log(`🔍 Fetching lead with ID: ${leadId}`);
        
        const data = await crmApiService.getLeadById(leadId);
        const transformedData = transformLeadData(data, statuses);
        
        console.log('✅ Transformed lead data:', {
          id: transformedData.id,
          name: transformedData.Name,
          status: transformedData.statusName
        });
        
        return transformedData;
      } catch (error) {
        console.error('Get lead by ID failed:', error.message);
        handleApiError(error, 'useLeadById');
        return null;
      }
    },
    enabled: enabled && !!leadId,
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 5,
    retry: 1,
  });
};
// In useCRM.js
export const useLocation = (locationId, enabled = true) => {
  return useQuery({
    queryKey: ['location', locationId],
    queryFn: async () => {
      if (!locationId) return null;
      const data = await crmApiService.getLocationById(locationId);
      return data;
    },
    enabled: enabled && !!locationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
// ============================================
// COUNTRIES HOOK
// ============================================

/**
 * Hook for fetching countries
 * @param {boolean} enabled - Whether the query should run
 */
export const useCountries = (enabled = true) => {
  return useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      console.log('🌍 Fetching countries...');
      const data = await crmApiService.getCountries();
      return data;
    },
    enabled,
    staleTime: 1000 * 60 * 60,       // 1 hour
    cacheTime: 1000 * 60 * 60 * 24,  // 24 hours
    refetchOnWindowFocus: false,
    retry: 2,
  });
};




// Hook for fetching sales opportunities
export const useSalesOpportunities = (filters = {}, enabled = true) => {
  return useQuery({
    queryKey: ['sales-opportunities', filters],
    queryFn: async () => {
      console.log('🔍 useSalesOpportunities queryFn executing');
      try {
        const authState = useAuthStore.getState();
        const userId = authState.userId;
        const token = authState.token;
        
        console.log('🔐 Auth state:', { userId, hasToken: !!token });
        
        if (!token) {
          console.log('🛑 No token, returning empty array');
          return [];
        }
        
        const data = await crmApiService.getSalesOpportunities(filters);
        
        if (!Array.isArray(data)) {
          return [];
        }
        
        const transformedData = transformSalesOpportunitiesData(data);
        
        console.log(`✅ Retrieved ${transformedData.length} opportunities`);
        
        return transformedData;
      } catch (error) {
        console.error('❌ useSalesOpportunities error:', error);
        handleApiError(error, 'useSalesOpportunities');
        return [];
      }
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    retry: 2,
  });
};

// ============================================
// MUTATION HOOKS - ALL ALERTS REMOVED
// ============================================

// Mutation for creating a lead
// Mutation for creating a lead
export const useCreateLead = () => {
  const queryClient = useQueryClient();
  const { data: statuses = [] } = useLeadStatuses();

  return useMutation({
    mutationFn: (leadData) => crmApiService.createLead(leadData),
    onSuccess: (newLead) => {
      console.log('✅ Lead created successfully, raw lead:', newLead);

      const transformedLead = transformLeadData(newLead, statuses);
      console.log('✅ Transformed lead salesRepId:', transformedLead.salesRepId);

      // Update leads cache
      queryClient.setQueriesData(['leads'], (oldData) => {
        if (!Array.isArray(oldData)) return [transformedLead];
        return [transformedLead, ...oldData];
      });

      // Invalidate statistics and statuses
      queryClient.invalidateQueries(['lead-statistics']);
      queryClient.invalidateQueries(['lead-statuses']);
    },
    onError: (error) => {
      handleApiError(error, 'useCreateLead');
    },
  });
};

// Mutation for updating a lead
export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  const { data: statuses = [] } = useLeadStatuses();
  
  return useMutation({
    mutationFn: ({ id, updates }) => crmApiService.updateLead(id, updates),
    onSuccess: (updatedLead, variables) => {
      console.log('✅ Lead updated successfully');
      
      const transformedLead = transformLeadData(updatedLead, statuses);
      
      // Update specific lead cache
      queryClient.setQueryData(['lead', variables.id], transformedLead);
      
      // Update leads list caches
      queryClient.setQueriesData(['leads'], (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.map(lead => 
          lead.id === transformedLead.id ? transformedLead : lead
        );
      });
      
      // Invalidate statistics and statuses
      queryClient.invalidateQueries(['lead-statistics']);
      queryClient.invalidateQueries(['lead-statuses']);
      
      // ALERT REMOVED - Component handles notification
    },
    onError: (error) => {
      handleApiError(error, 'useUpdateLead');
      // ALERT REMOVED - Component handles notification
    },
  });
};

// Mutation for updating lead status
export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient();
  const { data: statuses = [] } = useLeadStatuses();
  
  return useMutation({
    mutationFn: async ({ leadId, statusId }) => {
      console.log('🔄 Updating lead status:', { leadId, statusId });
      
      if (!leadId) {
        throw new Error('Lead ID is required');
      }
      
      if (!statusId) {
        throw new Error('Status ID is required');
      }
      
      const response = await crmApiService.updateLeadStatus(leadId, statusId);
      
      const statusName = getStatusNameById(statusId, statuses);
      
      return { 
        ...response, 
        leadId, 
        statusId,
        statusName
      };
    },
    onMutate: async ({ leadId, statusId }) => {
      console.log('🔄 Optimistic update for lead status');
      
      await queryClient.cancelQueries(['leads']);
      await queryClient.cancelQueries(['lead', leadId]);
      
      const previousLeads = queryClient.getQueryData(['leads']);
      const previousLead = queryClient.getQueryData(['lead', leadId]);
      
      const status = statuses.find(s => s.id === statusId) || {
        id: statusId,
        name: 'Unknown',
        color: getStatusColorFromId(statusId)
      };
      
      // Optimistically update leads list
      queryClient.setQueriesData(['leads'], (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        
        return oldData.map(lead => {
          if (lead.id === leadId) {
            return {
              ...lead,
              LeadStatus: { id: statusId, identifier: status.name },
              statusId: statusId,
              statusName: status.name,
              statusColor: status.color,
            };
          }
          return lead;
        });
      });
      
      // Optimistically update single lead
      queryClient.setQueryData(['lead', leadId], (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          LeadStatus: { id: statusId, identifier: status.name },
          statusId: statusId,
          statusName: status.name,
          statusColor: status.color,
        };
      });
      
      return { previousLeads, previousLead };
    },
    onSuccess: (data) => {
      console.log('✅ Lead status updated successfully');
      queryClient.invalidateQueries(['lead-statistics']);
      queryClient.invalidateQueries(['lead-statuses']);
      
      // ALERT REMOVED - Component handles notification
    },
    onError: (error, variables, context) => {
      console.error('❌ Status update failed:', error);
      
      // Rollback
      if (context?.previousLeads) {
        queryClient.setQueryData(['leads'], context.previousLeads);
      }
      if (context?.previousLead) {
        queryClient.setQueryData(['lead', variables.leadId], context.previousLead);
      }
      
      // ALERT REMOVED - Component handles notification
    },
    onSettled: () => {
      // Don't refetch leads, just statistics and statuses
      queryClient.invalidateQueries(['lead-statistics']);
      queryClient.invalidateQueries(['lead-statuses']);
    },
  });
};

// ============================================
// FOLLOWUP MUTATION HOOKS - ALL ALERTS REMOVED
// ============================================

// Mutation for updating followup status
export const useUpdateFollowupStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isComplete, leadId }) => 
      crmApiService.updateFollowup(id, { IsComplete: isComplete }),
    onMutate: async ({ id, isComplete, leadId }) => {
      await queryClient.cancelQueries(['followups']);
      await queryClient.cancelQueries(['lead-completed-activities', leadId]);
      
      const previousFollowups = queryClient.getQueryData(['followups']);
      const previousCompleted = queryClient.getQueryData(['lead-completed-activities', leadId]);
      
      // Optimistically update followups list
      queryClient.setQueriesData(['followups'], (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.map(followup => 
          followup.id === id ? { ...followup, IsComplete: isComplete } : followup
        );
      });
      
      // Optimistically update completed activities if leadId is known
      if (leadId) {
        queryClient.setQueryData(['lead-completed-activities', leadId], (oldData) => {
          if (!Array.isArray(oldData)) return oldData;
          if (isComplete) {
            // If marking as complete, add the followup to completed list
            const followup = previousFollowups?.find(f => f.id === id);
            if (followup) {
              return [...oldData, { ...followup, IsComplete: true }];
            }
          } else {
            // If marking as incomplete, remove from completed list
            return oldData.filter(f => f.id !== id);
          }
          return oldData;
        });
      }
      
      return { previousFollowups, previousCompleted };
    },
    onError: (error, variables, context) => {
      if (context?.previousFollowups) {
        queryClient.setQueryData(['followups'], context.previousFollowups);
      }
      if (context?.previousCompleted) {
        queryClient.setQueryData(['lead-completed-activities', variables.leadId], context.previousCompleted);
      }
      handleApiError(error, 'useUpdateFollowupStatus');
      // ALERT REMOVED - Component handles notification
    },
    onSuccess: (data, variables) => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries(['followups']);
      if (variables.leadId) {
        queryClient.invalidateQueries(['lead-completed-activities', variables.leadId]);
      }
      // ALERT REMOVED - Component handles notification
    },
  });
};

// Mutation for creating followup
export const useCreateFollowup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (followupData) => crmApiService.createFollowup(followupData),
    onSuccess: (newFollowup, variables) => {
      console.log('✅ Followup created successfully');
      
      const leadId = newFollowup.AD_User_ID?.id || variables.AD_User_ID?.id;
      
      // Update followups cache
      queryClient.setQueriesData(['followups'], (oldData) => {
        if (!Array.isArray(oldData)) return [newFollowup];
        return [newFollowup, ...oldData];
      });
      
      // If the new followup is completed, also update completed activities cache
      if (newFollowup.IsComplete && leadId) {
        queryClient.setQueriesData(['lead-completed-activities', leadId], (oldData) => {
          if (!Array.isArray(oldData)) return [newFollowup];
          return [newFollowup, ...oldData];
        });
      }
      
      // Invalidate lead activities (both general and completed)
      if (leadId) {
        queryClient.invalidateQueries(['lead-activities', leadId]);
        queryClient.invalidateQueries(['lead-completed-activities', leadId]);
      }
      
      // ALERT REMOVED - Component handles notification
    },
    onError: (error) => {
      handleApiError(error, 'useCreateFollowup');
      // ALERT REMOVED - Component handles notification
    },
  });
};

// Mutation for updating followup
export const useUpdateFollowup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }) => crmApiService.updateFollowup(id, updates),
    onSuccess: (updatedFollowup, variables) => {
      console.log('✅ Followup updated successfully');
      
      // Try to get leadId from the updated followup or from variables
      const leadId = updatedFollowup.AD_User_ID?.id || variables.leadId;
      
      // Update followups cache
      queryClient.setQueriesData(['followups'], (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.map(followup => 
          followup.id === updatedFollowup.id ? { ...followup, ...updatedFollowup } : followup
        );
      });
      
      // Invalidate lead activities
      if (leadId) {
        queryClient.invalidateQueries(['lead-activities', leadId]);
        queryClient.invalidateQueries(['lead-completed-activities', leadId]);
      }
      
      // ALERT REMOVED - Component handles notification
    },
    onError: (error) => {
      handleApiError(error, 'useUpdateFollowup');
      // ALERT REMOVED - Component handles notification
    },
  });
};

// Mutation for deleting followup
export const useDeleteFollowup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (followupId) => crmApiService.deleteFollowup(followupId),
    onMutate: async (followupId) => {
      await queryClient.cancelQueries(['followups']);
      
      // Get the followup being deleted to know its leadId
      const followups = queryClient.getQueryData(['followups']);
      let leadId = null;
      let deletedFollowup = null;
      
      if (Array.isArray(followups)) {
        deletedFollowup = followups.find(f => f.id === followupId);
        leadId = deletedFollowup?.AD_User_ID?.id;
      }
      
      // Cancel any pending queries for that lead's completed activities
      if (leadId) {
        await queryClient.cancelQueries(['lead-completed-activities', leadId]);
      }
      
      const previousFollowups = followups;
      const previousCompleted = leadId ? queryClient.getQueryData(['lead-completed-activities', leadId]) : null;
      
      // Optimistically remove from followups cache
      queryClient.setQueriesData(['followups'], (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.filter(followup => followup.id !== followupId);
      });
      
      // Optimistically remove from completed activities if it was completed
      if (leadId && deletedFollowup?.IsComplete) {
        queryClient.setQueryData(['lead-completed-activities', leadId], (oldData) => {
          if (!Array.isArray(oldData)) return oldData;
          return oldData.filter(f => f.id !== followupId);
        });
      }
      
      return { previousFollowups, previousCompleted, leadId, deletedFollowup };
    },
    onError: (error, followupId, context) => {
      // Rollback
      if (context?.previousFollowups) {
        queryClient.setQueryData(['followups'], context.previousFollowups);
      }
      if (context?.leadId && context?.previousCompleted) {
        queryClient.setQueryData(['lead-completed-activities', context.leadId], context.previousCompleted);
      }
      handleApiError(error, 'useDeleteFollowup');
      // ALERT REMOVED - Component handles notification
    },
    onSuccess: (result, followupId, context) => {
      // Invalidate to ensure consistency (though optimistic update already removed)
      queryClient.invalidateQueries(['followups']);
      if (context?.leadId) {
        queryClient.invalidateQueries(['lead-completed-activities', context.leadId]);
      }
      // ALERT REMOVED - Component handles notification
    },
  });
};

// ============================================
// SALES OPPORTUNITY MUTATION HOOKS - ALL ALERTS REMOVED
// ============================================

// Mutation for creating sales opportunity
export const useCreateSalesOpportunity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (opportunityData) => {
      console.log('📤 Creating sales opportunity');
      
      if (!opportunityData.C_BPartner_ID?.id) {
        throw new Error('Business Partner is required');
      }
      
      if (!opportunityData.C_SalesStage_ID?.id) {
        throw new Error('Sales Stage is required');
      }
      
      if (!opportunityData.C_Currency_ID?.id) {
        throw new Error('Currency is required');
      }
      
      if (!opportunityData.SalesRep_ID?.id) {
        throw new Error('Sales Representative is required');
      }
      
      const result = await crmApiService.createSalesOpportunity(opportunityData);
      return result;
    },
    onSuccess: () => {
      console.log('✅ Sales opportunity created');
      queryClient.invalidateQueries(['sales-opportunities']);
      // ALERT REMOVED - Component handles notification
    },
    onError: (error) => {
      console.error('❌ Create sales opportunity failed:', error);
      handleApiError(error, 'useCreateSalesOpportunity');
      // ALERT REMOVED - Component handles notification
    },
  });
};

// Mutation for updating sales opportunity
export const useUpdateSalesOpportunity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      console.log('📤 Updating sales opportunity:', id);
      
      if (!id) {
        throw new Error('Opportunity ID is required');
      }
      
      const result = await crmApiService.updateSalesOpportunity(id, updates);
      return result;
    },
    onSuccess: (updatedData, variables) => {
      console.log('✅ Sales opportunity updated');
      
      const transformedData = transformSalesOpportunityData(updatedData);
      
      queryClient.setQueryData(['sales-opportunity', variables.id], transformedData);
      
      queryClient.setQueriesData(['sales-opportunities'], (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.map(opp => 
          opp.id === transformedData.id ? transformedData : opp
        );
      });
      
      // ALERT REMOVED - Component handles notification
    },
    onError: (error) => {
      console.error('❌ Update sales opportunity failed:', error);
      handleApiError(error, 'useUpdateSalesOpportunity');
      // ALERT REMOVED - Component handles notification
    },
  });
};

// ============================================
// SEARCH AND ACTIVITY HOOKS
// ============================================

// Hook for searching leads
export const useSearchLeads = (searchTerm, enabled = true) => {
  const { data: statuses = [] } = useLeadStatuses(enabled);
  
  return useQuery({
    queryKey: ['search-leads', searchTerm],
    queryFn: async () => {
      try {
        if (!searchTerm || searchTerm.trim() === '') {
          return [];
        }
        const data = await crmApiService.searchLeads(searchTerm);
        return transformLeadsData(data, statuses);
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
    staleTime: 1000 * 60 * 2,
  });
};

// Hook for fetching completed activities
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
    staleTime: 1000 * 60 * 2,
  });
};

// Hook for activity statistics
export const useActivityStatistics = (leadId) => {
  const { data: activities = [] } = useLeadActivities(leadId);
  
  const stats = useMemo(() => {
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
  
  return stats;
};

// ============================================
// REFRESH HOOK
// ============================================

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
        query.queryKey[0] === 'lead-activities' ||
        query.queryKey[0] === 'lead-statuses'
    });
    
    // Clear statuses cache in service
    crmApiService.clearLeadStatusesCache();
  };
};

// ============================================
// SALES REPRESENTATIVES HOOK
// ============================================

/**
 * Hook for fetching sales representatives
 * @param {boolean} enabled - Whether the query should run
 */
export const useSalesRepresentatives = (enabled = true) => {
  return useQuery({
    queryKey: ['sales-representatives'],
    queryFn: async () => {
      console.log('👥 Fetching sales representatives...');
      const data = await crmApiService.getSalesRepresentatives();
      return data;
    },
    enabled,
    staleTime: 1000 * 60 * 15,      // 15 minutes
    cacheTime: 1000 * 60 * 60,       // 1 hour
    refetchOnWindowFocus: false,     // optional
    retry: 2,
  });
};

// ============================================
// EXPORTS
// ============================================
export default {
  // Lead Status hooks
  useLeadStatuses,
  getStatusNameById,
  getStatusById,
  
  // Lead hooks
  useLeads,
  useLeadsByStatus,
  useLeadStatistics,
  useLeadById,
  useSearchLeads,
  
  // Followup hooks
  useFollowups,
  useLeadActivities,
  useCompletedLeadActivities,
  useActivityStatistics,
  
  // Opportunity hooks
  useSalesOpportunities,
  
  // Mutation hooks
  useCreateLead,
  useUpdateLead,
  useUpdateLeadStatus,
  useCreateFollowup,
  useUpdateFollowup,
  useDeleteFollowup,
  useUpdateFollowupStatus,
  useCreateSalesOpportunity,
  useUpdateSalesOpportunity,
  
  // Utility
  useRefreshCRMData,
  useSalesRepresentatives,
  useCountries
};