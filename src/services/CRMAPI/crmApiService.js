// services/crmApiService.js
import { useAuthStore } from '../../store/authStore';

const crmApiService = {
  // Get base URL from auth store
  getBaseUrl: () => {
    const serverConfig = useAuthStore.getState().serverConfig;
    if (!serverConfig.protocol || !serverConfig.host || !serverConfig.port) {
      throw new Error('Server configuration missing. Please configure server settings first.');
    }
    return `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.port}/api/v1`;
  },

  /**
   * Fetch leads with optional filters
   */
  getLeads: async (filters = {}) => {
    try {
      const baseUrl = crmApiService.getBaseUrl();
      const token = useAuthStore.getState().token;
      const userId = useAuthStore.getState().userId;

      // Build filter string
      let filterParts = ['IsSalesLead eq true'];
      
      if (userId) {
        filterParts.push(`SalesRep_ID eq ${userId}`);
      }
      
      // Add status filter if provided
      if (filters.status) {
        const statusMap = {
          'New': 'N',
          'Working': 'W', 
          'Converted': 'C',
          'Expired': 'E'
        };
        const statusId = statusMap[filters.status] || filters.status;
        filterParts.push(`LeadStatus/id eq '${statusId}'`);
      }

      // Add date filters if provided
      if (filters.startDate) {
        filterParts.push(`Created ge '${filters.startDate}'`);
      }
      
      if (filters.endDate) {
        filterParts.push(`Created le '${filters.endDate}'`);
      }

      const filterString = filterParts.join(' and ');
      const URL = `${baseUrl}/models/AD_User?$filter=${encodeURIComponent(filterString)}`;
      
      console.log('Fetching leads with URL:', URL);

      const response = await fetch(URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Get leads error response:', errorText);
        throw new Error(`Failed to fetch leads: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Retrieved ${data.records?.length || 0} leads`);
      return data.records || [];
    } catch (error) {
      console.error('Get leads fetch error:', error.message);
      throw error;
    }
  },

  /**
   * Fetch single lead by ID
   */
  getLeadById: async (leadId) => {
    try {
      const baseUrl = crmApiService.getBaseUrl();
      const token = useAuthStore.getState().token;

      const URL = `${baseUrl}/models/AD_User/${leadId}`;
      
      console.log('Fetching lead by ID:', leadId);

      const response = await fetch(URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Get lead by ID error:', errorText);
        throw new Error(`Failed to fetch lead: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get lead by ID fetch error:', error.message);
      throw error;
    }
  },

  /**
   * Create a new lead
   */
  createLead: async (leadData) => {
    try {
      const baseUrl = crmApiService.getBaseUrl();
      const token = useAuthStore.getState().token;

      const URL = `${baseUrl}/models/AD_User`;
      
      console.log('Creating lead with data:', leadData);

      const response = await fetch(URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(leadData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create lead error response:', errorText);
        throw new Error(`Failed to create lead: ${response.status}`);
      }

      const data = await response.json();
      console.log('Lead created successfully:', data);
      return data;
    } catch (error) {
      console.error('Create lead fetch error:', error.message);
      throw error;
    }
  },

  /**
   * Update lead
   */
  updateLead: async (leadId, updates) => {
    try {
      const baseUrl = crmApiService.getBaseUrl();
      const token = useAuthStore.getState().token;

      const URL = `${baseUrl}/models/AD_User/${leadId}`;
      
      console.log('Updating lead:', leadId, 'with data:', updates);

      const response = await fetch(URL, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update lead error response:', errorText);
        throw new Error(`Failed to update lead: ${response.status}`);
      }

      const data = await response.json();
      console.log('Lead updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Update lead fetch error:', error.message);
      throw error;
    }
  },

  /**
   * Update lead status
   */
  updateLeadStatus: async (leadId, status) => {
    try {
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

      const statusId = statusMap[status] || 'N';
      
      const updates = {
        LeadStatus: {
          id: statusId,
        },
      };

      return await crmApiService.updateLead(leadId, updates);
    } catch (error) {
      console.error('Update lead status error:', error.message);
      throw error;
    }
  },

  /**
   * Fetch all followups/activities
   */
  getFollowups: async (filters = {}) => {
    try {
      const baseUrl = crmApiService.getBaseUrl();
      const token = useAuthStore.getState().token;

      // Build filter string
      let filterParts = [];
      
      if (filters.userId) {
        filterParts.push(`AD_User_ID/id eq ${filters.userId}`);
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

      let URL = `${baseUrl}/models/C_ContactActivity`;
      
      if (filterParts.length > 0) {
        const filterString = filterParts.join(' and ');
        URL += `?$filter=${encodeURIComponent(filterString)}`;
      }

      console.log('Fetching followups with URL:', URL);

      const response = await fetch(URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Get followups error response:', errorText);
        throw new Error(`Failed to fetch followups: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Retrieved ${data.records?.length || 0} followups`);
      return data.records || [];
    } catch (error) {
      console.error('Get followups fetch error:', error.message);
      throw error;
    }
  },

  /**
   * Fetch followup by ID
   */
  getFollowupById: async (followupId) => {
    try {
      const baseUrl = crmApiService.getBaseUrl();
      const token = useAuthStore.getState().token;

      const URL = `${baseUrl}/models/C_ContactActivity/${followupId}`;
      
      console.log('Fetching followup by ID:', followupId);

      const response = await fetch(URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Get followup by ID error:', errorText);
        throw new Error(`Failed to fetch followup: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get followup by ID fetch error:', error.message);
      throw error;
    }
  },

  /**
   * Create a new followup/activity
   */
  createFollowup: async (followupData) => {
    try {
      const baseUrl = crmApiService.getBaseUrl();
      const token = useAuthStore.getState().token;

      const URL = `${baseUrl}/models/C_ContactActivity`;
      
      console.log('Creating followup with data:', followupData);

      const response = await fetch(URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(followupData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create followup error response:', errorText);
        throw new Error(`Failed to create followup: ${response.status}`);
      }

      const data = await response.json();
      console.log('Followup created successfully:', data);
      return data;
    } catch (error) {
      console.error('Create followup fetch error:', error.message);
      throw error;
    }
  },

  /**
   * Update followup
   */
  updateFollowup: async (followupId, updates) => {
    try {
      const baseUrl = crmApiService.getBaseUrl();
      const token = useAuthStore.getState().token;

      const URL = `${baseUrl}/models/C_ContactActivity/${followupId}`;
      
      console.log('Updating followup:', followupId, 'with data:', updates);

      const response = await fetch(URL, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update followup error response:', errorText);
        throw new Error(`Failed to update followup: ${response.status}`);
      }

      const data = await response.json();
      console.log('Followup updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Update followup fetch error:', error.message);
      throw error;
    }
  },

  /**
   * Delete followup/activity
   */
  deleteFollowup: async (followupId) => {
    try {
      const baseUrl = crmApiService.getBaseUrl();
      const token = useAuthStore.getState().token;

      const URL = `${baseUrl}/models/C_ContactActivity/${followupId}`;
      
      console.log('Deleting followup:', followupId);

      const response = await fetch(URL, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete followup error response:', errorText);
        throw new Error(`Failed to delete followup: ${response.status}`);
      }

      console.log('Followup deleted successfully');
      return { success: true, id: followupId };
    } catch (error) {
      console.error('Delete followup fetch error:', error.message);
      throw error;
    }
  },

  /**
   * Fetch sales opportunities
   */
  getSalesOpportunities: async (filters = {}) => {
    try {
      const baseUrl = crmApiService.getBaseUrl();
      const token = useAuthStore.getState().token;

      // Build filter string
      let filterParts = [];
      
      if (filters.stage) {
        filterParts.push(`C_SalesStage_ID/id eq '${filters.stage}'`);
      }
      
      if (filters.userId) {
        filterParts.push(`SalesRep_ID/id eq ${filters.userId}`);
      }
      
      if (filters.startDate) {
        filterParts.push(`Created ge '${filters.startDate}'`);
      }
      
      if (filters.endDate) {
        filterParts.push(`Created le '${filters.endDate}'`);
      }

      let URL = `${baseUrl}/models/C_Opportunity`;
      
      if (filterParts.length > 0) {
        const filterString = filterParts.join(' and ');
        URL += `?$filter=${encodeURIComponent(filterString)}`;
      }

      console.log('Fetching sales opportunities with URL:', URL);

      const response = await fetch(URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Get sales opportunities error response:', errorText);
        throw new Error(`Failed to fetch sales opportunities: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Retrieved ${data.records?.length || 0} sales opportunities`);
      return data.records || [];
    } catch (error) {
      console.error('Get sales opportunities fetch error:', error.message);
      throw error;
    }
  },

  /**
   * Create sales opportunity
   */
  createSalesOpportunity: async (opportunityData) => {
    try {
      const baseUrl = crmApiService.getBaseUrl();
      const token = useAuthStore.getState().token;

      const URL = `${baseUrl}/models/C_Opportunity`;
      
      console.log('Creating sales opportunity with data:', opportunityData);

      const response = await fetch(URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(opportunityData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create sales opportunity error response:', errorText);
        throw new Error(`Failed to create sales opportunity: ${response.status}`);
      }

      const data = await response.json();
      console.log('Sales opportunity created successfully:', data);
      return data;
    } catch (error) {
      console.error('Create sales opportunity fetch error:', error.message);
      throw error;
    }
  },

  /**
   * Update sales opportunity
   */
  updateSalesOpportunity: async (opportunityId, updates) => {
    try {
      const baseUrl = crmApiService.getBaseUrl();
      const token = useAuthStore.getState().token;

      const URL = `${baseUrl}/models/C_Opportunity/${opportunityId}`;
      
      console.log('Updating sales opportunity:', opportunityId, 'with data:', updates);

      const response = await fetch(URL, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update sales opportunity error response:', errorText);
        throw new Error(`Failed to update sales opportunity: ${response.status}`);
      }

      const data = await response.json();
      console.log('Sales opportunity updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Update sales opportunity fetch error:', error.message);
      throw error;
    }
  },

  /**
   * Fetch lead activities (followups for a specific lead)
   */
  getLeadActivities: async (leadId) => {
    try {
      return await crmApiService.getFollowups({ userId: leadId });
    } catch (error) {
      console.error('Get lead activities error:', error.message);
      throw error;
    }
  },

  /**
   * Fetch lead statistics
   */
  getLeadStatistics: async () => {
    try {
      const leads = await crmApiService.getLeads();
      
      const statistics = {
        total: leads.length,
        new: leads.filter(lead => lead?.LeadStatus?.id === 'N').length,
        working: leads.filter(lead => lead?.LeadStatus?.id === 'W').length,
        converted: leads.filter(lead => lead?.LeadStatus?.id === 'C').length,
        expired: leads.filter(lead => lead?.LeadStatus?.id === 'E').length,
      };
      
      return statistics;
    } catch (error) {
      console.error('Get lead statistics error:', error.message);
      throw error;
    }
  },

  /**
   * Search leads by name, email, or phone
   */
  searchLeads: async (searchTerm) => {
    try {
      const baseUrl = crmApiService.getBaseUrl();
      const token = useAuthStore.getState().token;
      const userId = useAuthStore.getState().userId;

      const filterString = `(IsSalesLead eq true) and (SalesRep_ID eq ${userId}) and (contains(tolower(Name), tolower('${searchTerm}')) or contains(tolower(EMail), tolower('${searchTerm}')) or contains(tolower(Phone), tolower('${searchTerm}')))`;
      
      const URL = `${baseUrl}/models/AD_User?$filter=${encodeURIComponent(filterString)}`;

      console.log('Searching leads with URL:', URL);

      const response = await fetch(URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Search leads error response:', errorText);
        throw new Error(`Failed to search leads: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Found ${data.records?.length || 0} leads matching search`);
      return data.records || [];
    } catch (error) {
      console.error('Search leads fetch error:', error.message);
      throw error;
    }
  },
};

export default crmApiService;