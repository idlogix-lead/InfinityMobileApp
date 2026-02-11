// hooks/CRMhooks/useLeadUpdate.js
import { useMutation, useQueryClient } from 'react-query';
import { Alert } from 'react-native';
import crmApiService from '../../services/CRMAPI/crmApiService';

// Status mapping helpers
const getStatusId = (statusIdentifier) => {
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

const getStatusIdentifier = (statusId) => {
  const statusMap = {
    'N': 'New',
    'W': 'Working',
    'C': 'Converted',
    'E': 'Expired'
  };
  return statusMap[statusId] || 'New';
};

export const useLeadUpdate = () => {
  const queryClient = useQueryClient();

  // Helper to find lead in cache by ID
  const findLeadInCache = (leadId) => {
    // Check main leads cache
    const mainLeads = queryClient.getQueryData(['leads']);
    if (Array.isArray(mainLeads)) {
      const lead = mainLeads.find(l => l.id === leadId || l.AD_User_ID?.id === leadId);
      if (lead) return lead;
    }

    // Check status-specific caches
    const statuses = ['New', 'Working', 'Converted', 'Expired'];
    for (const status of statuses) {
      const statusLeads = queryClient.getQueryData(['leads', { status }]);
      if (Array.isArray(statusLeads)) {
        const lead = statusLeads.find(l => l.id === leadId || l.AD_User_ID?.id === leadId);
        if (lead) return lead;
      }
    }

    return null;
  };

  // Helper to update lead in all caches
  const updateLeadInAllCaches = (leadId, updatedLead) => {
    // Update main leads cache
    queryClient.setQueriesData(['leads'], (oldData) => {
      if (!Array.isArray(oldData)) return oldData;
      return oldData.map(lead => 
        (lead.id === leadId || lead.AD_User_ID?.id === leadId) 
          ? { ...lead, ...updatedLead } 
          : lead
      );
    });

    // Update all status-specific caches
    const statuses = ['New', 'Working', 'Converted', 'Expired'];
    statuses.forEach(status => {
      queryClient.setQueriesData(['leads', { status }], (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.map(lead => 
          (lead.id === leadId || lead.AD_User_ID?.id === leadId) 
            ? { ...lead, ...updatedLead } 
            : lead
        );
      });
    });

    // Invalidate specific lead queries
    queryClient.invalidateQueries(['lead', leadId]);
    queryClient.invalidateQueries(['lead-activities', leadId]);
  };

  // Helper to move lead between status caches
  const moveLeadBetweenStatusCaches = (leadId, oldStatus, newStatus, updatedLead) => {
    if (oldStatus && oldStatus !== newStatus) {
      // Remove from old status cache
      queryClient.setQueriesData(['leads', { status: oldStatus }], (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.filter(lead => 
          !(lead.id === leadId || lead.AD_User_ID?.id === leadId)
        );
      });

      // Add to new status cache
      queryClient.setQueriesData(['leads', { status: newStatus }], (oldData) => {
        if (!Array.isArray(oldData)) return [updatedLead, ...oldData];
        // Check if already exists
        const exists = oldData.some(lead => 
          lead.id === leadId || lead.AD_User_ID?.id === leadId
        );
        if (exists) {
          return oldData.map(lead => 
            (lead.id === leadId || lead.AD_User_ID?.id === leadId) 
              ? { ...lead, ...updatedLead } 
              : lead
          );
        }
        return [updatedLead, ...oldData];
      });
    }
  };

  return useMutation({
    mutationFn: async ({ leadId, updates }) => {
      console.log('🔄 Unified update mutation called:', { leadId, updates });
      
      if (!leadId) {
        throw new Error('Lead ID is required to update lead');
      }

      // If status is being updated, transform it to the correct format
      if (updates.status) {
        const statusId = getStatusId(updates.status);
        updates.LeadStatus = { id: statusId };
        delete updates.status;
      }

      // Transform other fields as needed
      const apiUpdates = {
        ...updates,
        ...(updates.LeadStatus && { LeadStatus: updates.LeadStatus }),
        ...(updates.AD_Client_ID && { AD_Client_ID: updates.AD_Client_ID }),
        ...(updates.AD_Org_ID && { AD_Org_ID: updates.AD_Org_ID }),
        ...(updates.SalesRep_ID && { SalesRep_ID: updates.SalesRep_ID }),
        ...(updates.LeadSource && { LeadSource: updates.LeadSource }),
      };

      const response = await crmApiService.updateLeadUnified(leadId, apiUpdates);
      
      return {
        ...response,
        leadId,
        updates: apiUpdates,
      };
    },

    onMutate: async ({ leadId, updates }) => {
      console.log('🔄 Optimistic update started:', { leadId, updates });
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['leads']);
      
      // Get old lead data
      const oldLead = findLeadInCache(leadId);
      
      // Prepare optimistic update
      const optimisticLead = {
        ...oldLead,
        ...updates,
        ...(updates.LeadStatus && {
          LeadStatus: {
            id: updates.LeadStatus.id,
            identifier: getStatusIdentifier(updates.LeadStatus.id)
          },
          statusId: updates.LeadStatus.id,
          statusLabel: getStatusIdentifier(updates.LeadStatus.id)
        }),
      };

      // Update all caches
      updateLeadInAllCaches(leadId, optimisticLead);
      
      // Handle status movement if status changed
      const oldStatus = oldLead?.LeadStatus?.identifier;
      const newStatus = optimisticLead?.LeadStatus?.identifier;
      
      if (oldStatus && newStatus && oldStatus !== newStatus) {
        moveLeadBetweenStatusCaches(leadId, oldStatus, newStatus, optimisticLead);
      }

      return { oldLead, leadId, oldStatus, newStatus };
    },

    onSuccess: (data, variables, context) => {
      console.log('✅ Unified update successful:', { data, variables });
      
      // Invalidate all relevant queries
      queryClient.invalidateQueries(['leads']);
      queryClient.invalidateQueries(['lead-statistics']);
      queryClient.invalidateQueries(['lead', variables.leadId]);
      queryClient.invalidateQueries(['lead-activities', variables.leadId]);
      
      Alert.alert('Success', 'Lead updated successfully!');
    },

    onError: (error, variables, context) => {
      console.error('❌ Unified update failed:', error);
      
      // Rollback on error
      if (context?.oldLead) {
        updateLeadInAllCaches(context.leadId, context.oldLead);
        
        if (context.oldStatus) {
          moveLeadBetweenStatusCaches(
            context.leadId,
            context.newStatus,
            context.oldStatus,
            context.oldLead
          );
        }
      }
      
      Alert.alert('Error', `Failed to update lead: ${error.message}`);
    },

    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries(['leads']);
      queryClient.invalidateQueries(['lead-statistics']);
    },
  });
};

export default useLeadUpdate;