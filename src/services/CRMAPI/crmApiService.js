import { buildApiUrl, apiRequest, getAuthState } from '../../utils/apiUtils';

// ============================================
// CRM API SERVICE
// ============================================
const crmApiService = {
  /**
   * Fetch leads with optional filters
   */
  getLeads: async (filters = {}) => {
    try {
      const authState = getAuthState();
      const userId = authState.userId;
      
      // Build comprehensive filter
      let filterParts = ['IsSalesLead eq true'];
      
      // Add user filter if available
      if (userId) {
        filterParts.push(`SalesRep_ID eq ${userId}`);
      }
      
      // Add status filter
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
      
      // Date filters
      if (filters.startDate) {
        filterParts.push(`Created ge '${filters.startDate}'`);
      }
      if (filters.endDate) {
        filterParts.push(`Created le '${filters.endDate}'`);
      }
      
      // Build filter string
      const filterString = filterParts.join(' and ');
      
      const url = buildApiUrl('models/AD_User', {}, filterString);
      console.log('🔍 Leads API URL:', url);
      
      const data = await apiRequest(url);
      
      // SAFE data extraction with fallback
      const records = Array.isArray(data.records) ? data.records : [];
      
      console.log(`✅ Retrieved ${records.length} leads`);
      return records;
    } catch (error) {
      console.error('❌ Get leads failed:', error.message);
      
      // Return empty array for non-auth errors
      if (error.message === 'SESSION_EXPIRED') {
        throw error;
      }
      
      return [];
    }
  },

  /**
   * Fetch single lead by ID
   */
  getLeadById: async (leadId) => {
    try {
      const url = buildApiUrl(`models/AD_User/${leadId}`);
      console.log('🔍 Lead by ID URL:', url);
      
      const data = await apiRequest(url);
      return data;
    } catch (error) {
      console.error('Get lead by ID failed:', error.message);
      throw error;
    }
  },

  /**
   * Create a new location
   */
  createLocation: async (locationData) => {
    try {
      const url = buildApiUrl('models/C_Location');
      console.log('📍 Create location URL:', url);
      
      const data = await apiRequest(url, {
        method: 'POST',
        body: locationData,
      });
      
      console.log('✅ Location created successfully:', data);
      return data;
    } catch (error) {
      console.error('Create location failed:', error.message);
      throw error;
    }
  },

  /**
   * Create a new lead
   */
  createLead: async (leadData) => {
    try {
      const url = buildApiUrl('models/AD_User');
      console.log('📝 Create lead URL:', url);
      
      const data = await apiRequest(url, {
        method: 'POST',
        body: leadData,
      });
      
      console.log('✅ Lead created successfully');
      return data;
    } catch (error) {
      console.error('Create lead failed:', error.message);
      throw error;
    }
  },

  /**
   * Update lead
   */
  updateLead: async (leadId, updates) => {
    try {
      const url = buildApiUrl(`models/AD_User/${leadId}`);
      console.log('✏️ Update lead URL:', url);
      
      const data = await apiRequest(url, {
        method: 'PUT',
        body: updates,
      });
      
      console.log('✅ Lead updated successfully');
      return data;
    } catch (error) {
      console.error('Update lead failed:', error.message);
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
      // Build filter parts
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

      // Build URL with filters
      const url = buildApiUrl('models/C_ContactActivity', {}, 
        filterParts.length > 0 ? filterParts.join(' and ') : null
      );
      
      console.log('🔍 Followups API URL:', url);
      
      const data = await apiRequest(url);
      
      const records = Array.isArray(data.records) ? data.records : [];
      console.log(`✅ Retrieved ${records.length} followups`);
      return records;
    } catch (error) {
      console.error('Get followups failed:', error.message);
      
      if (error.message === 'SESSION_EXPIRED') {
        throw error;
      }
      return [];
    }
  },

  /**
   * Fetch followup by ID
   */
  getFollowupById: async (followupId) => {
    try {
      const url = buildApiUrl(`models/C_ContactActivity/${followupId}`);
      const data = await apiRequest(url);
      return data;
    } catch (error) {
      console.error('Get followup by ID failed:', error.message);
      throw error;
    }
  },

  /**
   * Create a new followup/activity
   */
  createFollowup: async (followupData) => {
    try {
      const url = buildApiUrl('models/C_ContactActivity');
      const data = await apiRequest(url, {
        method: 'POST',
        body: followupData,
      });
      
      console.log('✅ Followup created successfully');
      return data;
    } catch (error) {
      console.error('Create followup failed:', error.message);
      throw error;
    }
  },

  /**
   * Update followup
   */
  updateFollowup: async (followupId, updates) => {
    try {
      const url = buildApiUrl(`models/C_ContactActivity/${followupId}`);
      const data = await apiRequest(url, {
        method: 'PUT',
        body: updates,
      });
      
      console.log('✅ Followup updated successfully');
      return data;
    } catch (error) {
      console.error('Update followup failed:', error.message);
      throw error;
    }
  },

  /**
   * Delete followup/activity
   */
  deleteFollowup: async (followupId) => {
    try {
      const url = buildApiUrl(`models/C_ContactActivity/${followupId}`);
      await apiRequest(url, {
        method: 'DELETE',
      });
      
      console.log('✅ Followup deleted successfully');
      return { success: true, id: followupId };
    } catch (error) {
      console.error('Delete followup failed:', error.message);
      throw error;
    }
  },

  /**
   * Fetch sales opportunities
   */
  getSalesOpportunities: async (filters = {}) => {
    try {
      const authState = getAuthState();
      const userId = authState.userId;
      
      // Build filter parts
      const filterParts = [];
      
      if (userId) {
        filterParts.push(`SalesRep_ID eq ${userId}`);
      }
      
      // Stage filter
      if (filters.stage) {
        filterParts.push(`C_SalesStage_ID/id eq '${filters.stage}'`);
      }
      
      // Opportunity status filter
      if (filters.status) {
        filterParts.push(`OpportunityStatus/id eq '${filters.status}'`);
      }
      
      // Date filters
      if (filters.startDate) {
        filterParts.push(`Created ge '${filters.startDate}'`);
      }
      if (filters.endDate) {
        filterParts.push(`Created le '${filters.endDate}'`);
      }
      
      // Always include active records
      filterParts.push(`IsActive eq true`);
      
      const url = buildApiUrl('models/C_Opportunity', {}, 
        filterParts.length > 0 ? filterParts.join(' and ') : null
      );
      
      console.log('🔍 Sales Opportunities URL:', url);
      
      const data = await apiRequest(url);
      
      // SAFE data extraction
      const records = Array.isArray(data.records) ? data.records : [];
      
      console.log(`✅ Retrieved ${records.length} sales opportunities`);
      
      return records;
    } catch (error) {
      console.error('❌ Get sales opportunities failed:', error.message);
      
      if (error.message === 'SESSION_EXPIRED') {
        throw error;
      }
      
      return [];
    }
  },

  /**
   * Create sales opportunity
   */
  createSalesOpportunity: async (opportunityData) => {
    try {
      const url = buildApiUrl('models/C_Opportunity');
      const data = await apiRequest(url, {
        method: 'POST',
        body: opportunityData,
      });
      
      console.log('✅ Sales opportunity created successfully');
      return data;
    } catch (error) {
      console.error('Create sales opportunity failed:', error.message);
      throw error;
    }
  },

  /**
   * Update sales opportunity
   */
  updateSalesOpportunity: async (opportunityId, updates) => {
    try {
      const url = buildApiUrl(`models/C_Opportunity/${opportunityId}`);
      const data = await apiRequest(url, {
        method: 'PUT',
        body: updates,
      });
      
      console.log('✅ Sales opportunity updated successfully');
      return data;
    } catch (error) {
      console.error('Update sales opportunity failed:', error.message);
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
      console.error('Get lead activities failed:', error.message);
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
      console.error('Get lead statistics failed:', error.message);
      return { total: 0, new: 0, working: 0, converted: 0, expired: 0 };
    }
  },

  /**
   * Search leads by name, email, or phone
   */
  searchLeads: async (searchTerm) => {
    try {
      const authState = getAuthState();
      const userId = authState.userId;
      
      if (!searchTerm || searchTerm.trim() === '') {
        return await crmApiService.getLeads();
      }
      
      // Build search filter
      const searchFilter = `IsSalesLead eq true and SalesRep_ID eq ${userId} and (contains(Name, '${searchTerm}') or contains(EMail, '${searchTerm}') or contains(Phone, '${searchTerm}'))`;
      
      const url = buildApiUrl('models/AD_User', {}, searchFilter);
      console.log('🔍 Search leads URL:', url);
      
      const data = await apiRequest(url);
      
      const records = Array.isArray(data.records) ? data.records : [];
      console.log(`✅ Found ${records.length} leads matching search`);
      
      return records;
    } catch (error) {
      console.error('Search leads failed:', error.message);
      return [];
    }
  },

  /**
   * Get campaigns
   */
  getCampaigns: async () => {
    try {
      const url = buildApiUrl('models/C_Campaign');
      console.log('🎯 Get campaigns URL:', url);
      
      const data = await apiRequest(url);
      const records = Array.isArray(data.records) ? data.records : [];
      
      console.log(`✅ Retrieved ${records.length} campaigns`);
      return records;
    } catch (error) {
      console.error('Get campaigns failed:', error.message);
      
      if (error.message === 'SESSION_EXPIRED') {
        throw error;
      }
      return [];
    }
  },

  /**
   * Get lead sources
   */
  getLeadSources: async () => {
    try {
      const url = buildApiUrl('models/C_LeadSource');
      console.log('📞 Get lead sources URL:', url);
      
      const data = await apiRequest(url);
      const records = Array.isArray(data.records) ? data.records : [];
      
      console.log(`✅ Retrieved ${records.length} lead sources`);
      return records;
    } catch (error) {
      console.error('Get lead sources failed:', error.message);
      
      if (error.message === 'SESSION_EXPIRED') {
        throw error;
      }
      return [];
    }
  },

  /**
   * Get lead statuses
   */
  getLeadStatuses: async () => {
    try {
      const url = buildApiUrl('models/C_LeadStatus');
      console.log('📊 Get lead statuses URL:', url);
      
      const data = await apiRequest(url);
      const records = Array.isArray(data.records) ? data.records : [];
      
      console.log(`✅ Retrieved ${records.length} lead statuses`);
      return records;
    } catch (error) {
      console.error('Get lead statuses failed:', error.message);
      
      if (error.message === 'SESSION_EXPIRED') {
        throw error;
      }
      return [];
    }
  },
};

export default crmApiService;