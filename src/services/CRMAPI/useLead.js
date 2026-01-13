// hooks/useLeadMutations.js
import { useMutation, useQuery, useQueryClient } from 'react-query';
import crmApiService from '../../services/CRMAPI/crmApiService';
import { useAuthStore } from '../../store/authStore';

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (leadData) => {
      console.log('📝 Creating lead with data:', leadData);
      
      try {
        // 1. Create Location first (CRITICAL FIX)
        let locationID;
        if (leadData.locationData) {
          console.log('📍 Creating location...');
          const locationResponse = await crmApiService.createLocation(leadData.locationData);
          locationID = locationResponse.id;
          console.log('📍 Location created with ID:', locationID);
        }
        
        // 2. Prepare AD_User payload exactly like old version
        const userData = {
          Name: leadData.Name,
          EMail: leadData.EMail,
          Phone: leadData.Phone,
          Phone2: leadData.Phone2 || '',
          IsSalesLead: leadData.IsSalesLead !== undefined ? leadData.IsSalesLead : true,
          IsVendorLead: leadData.IsVendorLead !== undefined ? leadData.IsVendorLead : false,
          BPName: leadData.BPName || '',
          SalesRep_ID: leadData.SalesRep_ID || { id: '1000117' },
          AD_Org_ID: leadData.AD_Org_ID || { id: '1000001' },
          AD_Client_ID: leadData.AD_Client_ID || { id: '1000000' },
          Description: leadData.Description || '',
          IsActive: true,
          LeadStatus: leadData.LeadStatus || { id: 'N' },
          Value: leadData.Value || '',
          LeadSource: leadData.LeadSource || { id: 'CC' },
          LeadSourceDescription: leadData.LeadSourceDescription || '',
          LeadStatusDescription: leadData.LeadStatusDescription || '',
          Comments: leadData.Comments || '',
          UserAddress1: leadData.UserAddress1 || '',
          UserAddress2: leadData.UserAddress2 || '',
        };
        
        // Add location reference if created
        if (locationID) {
          userData.C_Location_ID = { id: locationID };
        }
        
        // Add birthday if provided
        if (leadData.Birthday) {
          userData.Birthday = leadData.Birthday;
        }
        
        // Add campaign if provided
        if (leadData.C_Campaign_ID) {
          userData.C_Campaign_ID = leadData.C_Campaign_ID;
        }
        
        console.log('👤 Creating lead with final payload:', userData);
        
        // 3. Create the lead
        const response = await crmApiService.createLead(userData);
        
        console.log('✅ Lead created successfully:', response);
        
        return {
          ...response,
          // Return user-friendly data for UI
          Name: leadData.Name,
          EMail: leadData.EMail,
          Phone: leadData.Phone,
          Phone2: leadData.Phone2,
          Birthday: leadData.Birthday,
          BPName: leadData.BPName,
          UserAddress1: leadData.UserAddress1,
          UserAddress2: leadData.UserAddress2,
          LeadSourceDescription: leadData.LeadSourceDescription,
          LeadStatusDescription: leadData.LeadStatusDescription,
          Comments: leadData.Comments,
        };
      } catch (error) {
        console.error('❌ Create lead mutation error:', error);
        throw new Error(error.message || 'Failed to create lead');
      }
    },
    onSuccess: (data) => {
      console.log('✅ Lead creation successful, invalidating queries');
      // Invalidate leads queries to refresh data
      queryClient.invalidateQueries(['leads']);
      queryClient.invalidateQueries(['lead-statistics']);
      queryClient.invalidateQueries(['campaigns']);
    },
    onError: (error) => {
      console.error('❌ Create lead mutation error (onError):', error);
      
      // Handle authentication errors
      if (error.message.includes('401') || error.message.includes('Session expired') || error.message === 'SESSION_EXPIRED') {
        console.log('🔐 Authentication error, clearing auth...');
        const clearAuth = useAuthStore.getState().clearAuth;
        if (clearAuth) {
          clearAuth();
        }
      }
    },
  });
};
// Hook for fetching campaigns - Updated to use crmApiService
export const useCampaigns = () => {
  const clearAuth = useAuthStore(state => state.clearAuth);
  
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      try {
        const campaigns = await crmApiService.getCampaigns();
        return campaigns;
      } catch (error) {
        if (error.message.includes('401') || error.message.includes('Session expired')) {
          console.log('Authentication error in campaigns query, clearing auth...');
          clearAuth();
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1, // Retry once on failure
    retryDelay: 1000, // Wait 1 second before retry
  });
};

// Hook for fetching lead sources
export const useLeadSources = () => {
  const clearAuth = useAuthStore(state => state.clearAuth);
  
  return useQuery({
    queryKey: ['lead-sources'],
    queryFn: async () => {
      try {
        const leadSources = await crmApiService.getLeadSources();
        return leadSources;
      } catch (error) {
        if (error.message.includes('401') || error.message.includes('Session expired')) {
          console.log('Authentication error in lead sources query, clearing auth...');
          clearAuth();
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

// Hook for fetching lead statuses
export const useLeadStatuses = () => {
  const clearAuth = useAuthStore(state => state.clearAuth);
  
  return useQuery({
    queryKey: ['lead-statuses'],
    queryFn: async () => {
      try {
        const statuses = await crmApiService.getLeadStatuses();
        return statuses;
      } catch (error) {
        if (error.message.includes('401') || error.message.includes('Session expired')) {
          console.log('Authentication error in lead statuses query, clearing auth...');
          clearAuth();
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

// Hook for fetching industries
export const useIndustries = () => {
  const clearAuth = useAuthStore(state => state.clearAuth);
  
  return useQuery({
    queryKey: ['industries'],
    queryFn: async () => {
      try {
        const industries = await crmApiService.getIndustries();
        return industries;
      } catch (error) {
        if (error.message.includes('401') || error.message.includes('Session expired')) {
          console.log('Authentication error in industries query, clearing auth...');
          clearAuth();
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

// Hook for fetching business partners
export const useBusinessPartners = () => {
  const clearAuth = useAuthStore(state => state.clearAuth);
  
  return useQuery({
    queryKey: ['business-partners'],
    queryFn: async () => {
      try {
        const businessPartners = await crmApiService.getBusinessPartners();
        return businessPartners;
      } catch (error) {
        if (error.message.includes('401') || error.message.includes('Session expired')) {
          console.log('Authentication error in business partners query, clearing auth...');
          clearAuth();
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};