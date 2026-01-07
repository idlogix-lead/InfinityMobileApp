// hooks/useCRM.js
import { useQuery, useMutation, useQueryClient } from 'react-query';
import crmApiService from '../../services/CRMAPI/crmApiService';

// Hook for fetching leads
export const useLeads = (filters = {}, enabled = true) => {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: () => crmApiService.getLeads(filters),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Hook for fetching lead statistics
export const useLeadStatistics = (enabled = true) => {
  return useQuery({
    queryKey: ['lead-statistics'],
    queryFn: () => crmApiService.getLeadStatistics(),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Hook for fetching followups
export const useFollowups = (filters = {}, enabled = true) => {
  return useQuery({
    queryKey: ['followups', filters],
    queryFn: () => crmApiService.getFollowups(filters),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Hook for fetching sales opportunities
export const useSalesOpportunities = (filters = {}, enabled = true) => {
  return useQuery({
    queryKey: ['sales-opportunities', filters],
    queryFn: () => crmApiService.getSalesOpportunities(filters),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

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
        return oldData?.map(lead => 
          lead.id === updatedLead.id ? { ...lead, ...updatedLead } : lead
        ) || [];
      });
      
      // Invalidate statistics
      queryClient.invalidateQueries(['lead-statistics']);
    },
  });
};

// Mutation for updating lead status
export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ leadId, status }) => crmApiService.updateLeadStatus(leadId, status),
    onSuccess: (updatedLead) => {
      // Update leads cache
      queryClient.setQueryData(['leads'], (oldData) => {
        return oldData?.map(lead => 
          lead.id === updatedLead.id ? { ...lead, LeadStatus: { id: updatedLead.status } } : lead
        ) || [];
      });
      
      // Invalidate statistics
      queryClient.invalidateQueries(['lead-statistics']);
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
        return oldData?.map(followup => 
          followup.id === updatedFollowup.id ? { ...followup, ...updatedFollowup } : followup
        ) || [];
      });
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
        return oldData?.filter(followup => followup.id !== result.id) || [];
      });
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
  });
};

// Hook for searching leads
export const useSearchLeads = (searchTerm, enabled = true) => {
  return useQuery({
    queryKey: ['search-leads', searchTerm],
    queryFn: () => crmApiService.searchLeads(searchTerm),
    enabled: enabled && searchTerm?.length > 2, // Only search if term is at least 3 chars
    staleTime: 1000 * 60 * 5,
  });
};

// Hook for fetching lead activities
export const useLeadActivities = (leadId, enabled = true) => {
  return useQuery({
    queryKey: ['lead-activities', leadId],
    queryFn: () => crmApiService.getLeadActivities(leadId),
    enabled: enabled && !!leadId,
    staleTime: 1000 * 60 * 2,
  });
};