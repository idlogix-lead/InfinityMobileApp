// hooks/useActivities.js
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

const BASE_URL = 'C_ContactActivity';

// Helper function to build API URL
const buildActivityUrl = (endpoint = '') => {
  const { serverConfig, token } = useAuthStore.getState();
  
  if (!serverConfig?.protocol || !serverConfig?.host || !serverConfig?.port) {
    throw new Error('Server configuration is missing');
  }
  
  if (!token) {
    throw new Error('Authentication token is missing');
  }
  
  const baseUrl = `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.port}/api/v1/models/${BASE_URL}`;
  return endpoint ? `${baseUrl}/${endpoint}` : baseUrl;
};

// Helper function to get headers
const getHeaders = () => {
  const { token } = useAuthStore.getState();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// Activity type mapping
const ACTIVITY_TYPES = {
  Email: 'EM',
  Phone: 'PC',
  Meeting: 'ME',
  Task: 'TA',
};

// Get activity label from ID
const getActivityLabel = (id) => {
  const entry = Object.entries(ACTIVITY_TYPES).find(([, value]) => value === id);
  return entry?.[0] || 'Selected Activity';
};

// Format date for API
const formatDate = (date) => {
  return date.toISOString().split('.')[0] + 'Z'; // remove milliseconds
};

// ============================================
// QUERY HOOKS
// ============================================

// Get all activities
export const useActivities = (filters = {}) => {
  return useQuery({
    queryKey: ['activities', filters],
    queryFn: async () => {
      try {
        const url = buildActivityUrl();
        const headers = getHeaders();
        
        // Build filter string
        const filterParts = [];
        
        if (filters.userId) {
          filterParts.push(`AD_User_ID eq ${filters.userId}`);
        }
        
        if (filters.isComplete !== undefined) {
          filterParts.push(`IsComplete eq ${filters.isComplete}`);
        }
        
        if (filters.startDate) {
          filterParts.push(`StartDate ge '${filters.startDate}'`);
        }
        
        if (filters.endDate) {
          filterParts.push(`EndDate le '${filters.endDate}'`);
        }
        
        if (filters.activityType) {
          filterParts.push(`ContactActivityType/id eq '${filters.activityType}'`);
        }
        
        // Add filter to URL
        let finalUrl = url;
        if (filterParts.length > 0) {
          const filterString = filterParts.join(' and ');
          finalUrl += `?$filter=${encodeURIComponent(filterString)}`;
        }
        
        const response = await axios.get(finalUrl, { headers });
        
        if (response.data?.records) {
          return response.data.records;
        }
        
        return [];
      } catch (error) {
        console.error('Get activities error:', error.response?.data || error.message);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Get activities for a specific lead
export const useLeadActivities = (leadId) => {
  return useActivities({ userId: leadId });
};

// Get activity by ID
export const useActivityById = (activityId) => {
  return useQuery({
    queryKey: ['activity', activityId],
    queryFn: async () => {
      if (!activityId) return null;
      
      try {
        const url = buildActivityUrl(activityId);
        const headers = getHeaders();
        
        const response = await axios.get(url, { headers });
        return response.data;
      } catch (error) {
        console.error('Get activity by ID error:', error.response?.data || error.message);
        throw error;
      }
    },
    enabled: !!activityId,
  });
};

// ============================================
// MUTATION HOOKS
// ============================================

// Create activity
export const useCreateActivity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (activityData) => {
      try {
        const url = buildActivityUrl();
        const headers = getHeaders();
        
        const payload = {
          ...activityData,
          StartDate: formatDate(new Date(activityData.StartDate)),
          EndDate: formatDate(new Date(activityData.EndDate)),
          Description: activityData.Description?.trim() || 'No description provided',
          IsComplete: activityData.IsComplete || false,
        };
        
        // Only include ContactActivityType when creating
        if (activityData.activityType && ACTIVITY_TYPES[activityData.activityType]) {
          payload.ContactActivityType = { id: ACTIVITY_TYPES[activityData.activityType] };
        }
        
        // Include user ID if provided
        if (activityData.leadId) {
          payload.AD_User_ID = { id: activityData.leadId };
        }
        
        const response = await axios.post(url, payload, { headers });
        return response.data;
      } catch (error) {
        console.error('Create activity error:', error.response?.data || error.message);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate activities queries
      queryClient.invalidateQueries(['activities']);
    },
  });
};

// Update activity
export const useUpdateActivity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      try {
        const url = buildActivityUrl(id);
        const headers = getHeaders();
        
        const payload = {
          ...updates,
          StartDate: updates.StartDate ? formatDate(new Date(updates.StartDate)) : undefined,
          EndDate: updates.EndDate ? formatDate(new Date(updates.EndDate)) : undefined,
        };
        
        const response = await axios.put(url, payload, { headers });
        return response.data;
      } catch (error) {
        console.error('Update activity error:', error.response?.data || error.message);
        throw error;
      }
    },
    onSuccess: (updatedActivity) => {
      // Update specific activity in cache
      queryClient.setQueryData(['activity', updatedActivity.id], updatedActivity);
      
      // Invalidate activities list
      queryClient.invalidateQueries(['activities']);
    },
  });
};

// Delete activity
export const useDeleteActivity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (activityId) => {
      try {
        const url = buildActivityUrl(activityId);
        const headers = getHeaders();
        
        await axios.delete(url, { headers });
        return { id: activityId, success: true };
      } catch (error) {
        console.error('Delete activity error:', error.response?.data || error.message);
        throw error;
      }
    },
    onSuccess: (result) => {
      // Remove from cache
      queryClient.setQueryData(['activities'], (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.filter(activity => activity.id !== result.id);
      });
    },
  });
};

// Export utility functions
export { ACTIVITY_TYPES, getActivityLabel, formatDate };