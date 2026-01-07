// hooks/useLeadMutations.js
import { useMutation, useQuery, useQueryClient } from 'react-query';
import crmApiService from '../../services/CRMAPI/crmApiService';
import { useAuthStore } from '../../store/authStore';

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (leadData) => {
      const serverConfig = useAuthStore.getState().serverConfig;
      
      if (!serverConfig?.protocol || !serverConfig?.host || !serverConfig?.port) {
        throw new Error('Server configuration missing');
      }
      
      // 1. Create Location first using the service
      let locationID;
      if (leadData.locationData) {
        const locationResponse = await crmApiService.createLocation(leadData.locationData);
        locationID = locationResponse.id;
      }
      
      // 2. Create AD_User with location reference
      const userData = {
        ...leadData,
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
        IsSalesLead: leadData.SalesLead || true,
        IsVendorLead: leadData.VendorLead || false,
      };
      
      // Add location reference if created
      if (locationID) {
        userData.C_Location_ID = { id: locationID };
      }
      
      // Remove locationData from payload
      delete userData.locationData;
      delete userData.SalesLead;
      delete userData.VendorLead;
      
      const response = await crmApiService.createLead(userData);
      
      return {
        ...response,
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
    },
    onSuccess: (data) => {
      // Invalidate leads queries to refresh data
      queryClient.invalidateQueries(['leads']);
      queryClient.invalidateQueries(['lead-statistics']);
      
      return data;
    },
    onError: (error) => {
      console.error('Create lead error:', error);
      
      // Handle authentication errors
      if (error.message.includes('401') || error.message.includes('Session expired')) {
        useAuthStore.getState().clearAuth?.();
      }
      
      throw error;
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