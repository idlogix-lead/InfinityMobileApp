// services/CRMAPI/crmApiService.js - UPDATED to show user-created AND user-as-salesrep opportunities

// ============================================
// AUTH STATE HELPER (No React Hook Issues)
// ============================================
let authStore = null;

// Dynamically import auth store to avoid React hook rules
const getAuthStore = () => {
  if (authStore) return authStore;
  
  try {
    // Use require instead of import for dynamic loading
    authStore = require('../../store/authStore');
    return authStore;
  } catch (error) {
    console.error('Failed to load auth store:', error);
    return null;
  }
};

const getAuthState = () => {
  const store = getAuthStore();
  if (!store) {
    console.warn('Auth store not available');
    return {};
  }
  
  try {
    return store.useAuthStore.getState();
  } catch (error) {
    console.error('Failed to get auth state:', error);
    return {};
  }
};

// ============================================
// API REQUEST HELPER
// ============================================
const makeRequest = async (url, options = {}) => {
  try {
    const authState = getAuthState();
    const token = authState.token;
    
    if (!token) {
      throw new Error('AUTH_TOKEN_MISSING');
    }
    
    console.log('🌐 API Request:', {
      method: options.method || 'GET',
      url,
      hasToken: !!token,
      tokenLength: token?.length || 0
    });
    
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    
    console.log('🌐 API Response Status:', response.status);
    
    if (!response.ok) {
      let errorData = null;
      try {
        const errorText = await response.text();
        errorData = errorText;
        
        // Try to parse as JSON if possible
        try {
          errorData = JSON.parse(errorText);
        } catch {
          // Keep as text if not JSON
        }
      } catch (textError) {
        errorData = 'Could not read error response';
      }
      
      console.error('❌ API Error:', {
        status: response.status,
        url,
        error: errorData
      });
      
      // Handle specific HTTP errors
      if (response.status === 401) {
        throw new Error('SESSION_EXPIRED');
      } else if (response.status === 403) {
        throw new Error('PERMISSION_DENIED');
      } else if (response.status === 404) {
        throw new Error('RESOURCE_NOT_FOUND');
      } else if (response.status === 500) {
        throw new Error('SERVER_ERROR');
      }
      
      throw new Error(`API_ERROR_${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('✅ API Success:', {
      url,
      recordCount: data.records?.length || 0,
      rowCount: data['row-count'] || 0
    });
    
    return data;
  } catch (error) {
    console.error('🔥 API Request Failed:', {
      url,
      error: error.message,
      errorCode: error.code
    });
    
    // Re-throw for react-query to handle
    throw error;
  }
};

// ============================================
// URL BUILDER
// ============================================
const buildUrl = (endpoint, filters = {}, customFilter = null) => {
  const authState = getAuthState();
  const serverConfig = authState.serverConfig;
  
  if (!serverConfig?.protocol || !serverConfig?.host || !serverConfig?.port) {
    throw new Error('SERVER_CONFIG_MISSING');
  }
  
  const baseUrl = `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.port}/api/v1`;
  let url = `${baseUrl}/${endpoint}`;
  
  // Build filter string
  const filterParts = [];
  
  // Add custom filter if provided
  if (customFilter) {
    filterParts.push(customFilter);
  }
  
  // Add individual filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      filterParts.push(`${key} eq ${typeof value === 'string' ? `'${value}'` : value}`);
    }
  });
  
  // Add filter to URL if we have any
  if (filterParts.length > 0) {
    const filterString = filterParts.join(' and ');
    url += `?$filter=${encodeURIComponent(filterString)}`;
  }
  
  return url;
};

// ============================================
// CRM API SERVICE
// ============================================
const crmApiService = {
  
  /**
   * Fetch leads with optional filters
   * FIXED: Show leads where user is creator OR sales rep
   */
  getLeads: async (filters = {}) => {
    try {
      const authState = getAuthState();
      const userId = authState.userId;
      
      console.log('🔍 getLeads - Current user ID:', userId);
      
      // Build comprehensive filter
      let filterParts = ['IsSalesLead eq true'];
      
      // FIXED: User should see leads they created OR where they are the sales rep
      if (userId) {
        filterParts.push(`(CreatedBy eq ${userId} or SalesRep_ID eq ${userId})`);
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
      
      const url = buildUrl('models/AD_User', {}, filterString);
      console.log('🔍 Leads API URL (CreatedBy OR SalesRep_ID):', url);
      
      const data = await makeRequest(url);
      
      // SAFE data extraction with fallback
      const records = Array.isArray(data.records) ? data.records : [];
      
      console.log(`✅ Retrieved ${records.length} leads where user is creator OR sales rep`);
      
      // Log details for debugging
      if (records.length > 0) {
        records.forEach((lead, index) => {
          console.log(`📊 Lead ${index + 1}:`, {
            id: lead.id,
            name: lead.Name,
            createdBy: lead.CreatedBy?.id || lead.CreatedBy,
            salesRepId: lead.SalesRep_ID?.id
          });
        });
      }
      
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
      const url = buildUrl(`models/AD_User/${leadId}`);
      console.log('🔍 Lead by ID URL:', url);
      
      const data = await makeRequest(url);
      return data;
    } catch (error) {
      console.error('Get lead by ID failed:', error.message);
      throw error;
    }
  },
  
  /**
   * Fetch sales representatives (AD_Users)
   */
  getSalesRepresentatives: async (filters = {}) => {
    try {
      // Build filter for sales reps (you might want to filter only active users or specific roles)
      let filterParts = ['IsActive eq true'];
      
      const filterString = filterParts.join(' and ');
      const url = buildUrl('models/AD_User', {}, filterString);
      
      console.log('👥 Sales Reps API URL:', url);
      
      const data = await makeRequest(url);
      const records = Array.isArray(data.records) ? data.records : [];
      
      console.log(`✅ Retrieved ${records.length} sales representatives`);
      return records;
    } catch (error) {
      console.error('Get sales representatives failed:', error.message);
      
      if (error.message === 'SESSION_EXPIRED') {
        throw error;
      }
      return [];
    }
  },
  
  /**
   * Unified update lead method - handles both status and other field updates
   */
  updateLeadUnified: async (leadId, updates) => {
    try {
      const url = buildUrl(`models/AD_User/${leadId}`);
      console.log('✏️ Unified update lead URL:', url, 'Updates:', updates);
      
      const data = await makeRequest(url, {
        method: 'PUT',
        body: updates,
      });
      
      console.log('✅ Lead updated successfully via unified method');
      return data;
    } catch (error) {
      console.error('Unified update lead failed:', error.message);
      throw error;
    }
  },
  
  /**
   * Create a new location
   */
  createLocation: async (locationData) => {
    try {
      const url = buildUrl('models/C_Location');
      console.log('📍 Create location URL:', url);
      
      const data = await makeRequest(url, {
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
      const url = buildUrl('models/AD_User');
      console.log('📝 Create lead URL:', url);
      
      const data = await makeRequest(url, {
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
      const url = buildUrl(`models/AD_User/${leadId}`);
      console.log('✏️ Update lead URL:', url);
      console.log('📦 Update payload:', JSON.stringify(updates, null, 2));
      
      const data = await makeRequest(url, {
        method: 'PUT',
        body: updates,
      });
      
      console.log('✅ Lead updated successfully');
      return data;
    } catch (error) {
      console.error('Update lead failed:', error.message);
      console.error('❌ Full error object:', JSON.stringify(error, null, 2));
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
   * Fetch completed activities for a specific lead
   */
  getCompletedLeadActivities: async (leadId) => {
    try {
      if (!leadId) return [];
      
      // Build filter for completed activities of this specific lead
      const filterParts = [
        `AD_User_ID eq ${leadId}`,
        `IsComplete eq true`
      ];
      
      const filterString = filterParts.join(' and ');
      const url = buildUrl('models/C_ContactActivity', {}, filterString);
      
      console.log('🔍 Completed Activities API URL:', url);
      
      const data = await makeRequest(url);
      const records = Array.isArray(data.records) ? data.records : [];
      
      console.log(`✅ Retrieved ${records.length} completed activities for lead ${leadId}`);
      return records;
    } catch (error) {
      console.error('Get completed lead activities failed:', error.message);
      
      if (error.message === 'SESSION_EXPIRED') {
        throw error;
      }
      return [];
    }
  },
  
  /**
   * Fetch all followups/activities - FIXED to show followups for leads user can see
   */
  getFollowups: async (filters = {}) => {
    try {
      const authState = getAuthState();
      const userId = authState.userId;
      
      console.log('🔍 getFollowups - Current user ID:', userId);
      
      // First, get all leads this user can see (created by OR sales rep)
      let userLeadIds = [];
      try {
        // Get leads where user is creator OR sales rep
        const leadsFilter = `IsSalesLead eq true and (CreatedBy eq ${userId} or SalesRep_ID eq ${userId})`;
        const leadsUrl = buildUrl('models/AD_User', {}, leadsFilter);
        console.log('🔍 Getting leads user can see:', leadsUrl);
        
        const leadsResponse = await makeRequest(leadsUrl);
        const userLeads = Array.isArray(leadsResponse.records) ? leadsResponse.records : [];
        userLeadIds = userLeads.map(lead => lead.id);
        
        console.log(`✅ Found ${userLeadIds.length} leads user can see (created by OR sales rep)`);
      } catch (leadError) {
        console.error('❌ Failed to fetch user leads for followup filtering:', leadError.message);
        return [];
      }
      
      // If no leads found, return empty array
      if (userLeadIds.length === 0) {
        console.log('⚠️ No leads found for this user, returning empty followups');
        return [];
      }
      
      // Build filter parts for followups
      const filterParts = [];
      
      // CRITICAL FIX: Only include followups for leads this user can see
      if (userLeadIds.length > 0) {
        const leadIdConditions = userLeadIds.map(id => `AD_User_ID eq ${id}`);
        filterParts.push(`(${leadIdConditions.join(' or ')})`);
      }
      
      // Add other filters
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
      const filterString = filterParts.length > 0 ? filterParts.join(' and ') : null;
      const url = buildUrl('models/C_ContactActivity', {}, filterString);
      
      console.log('🔍 Followups API URL:', url);
      
      const data = await makeRequest(url);
      
      const records = Array.isArray(data.records) ? data.records : [];
      console.log(`✅ Retrieved ${records.length} followups for leads user can see`);
      
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
      const url = buildUrl(`models/C_ContactActivity/${followupId}`);
      const data = await makeRequest(url);
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
      const url = buildUrl('models/C_ContactActivity');
      const data = await makeRequest(url, {
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
      const url = buildUrl(`models/C_ContactActivity/${followupId}`);
      const data = await makeRequest(url, {
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
      const url = buildUrl(`models/C_ContactActivity/${followupId}`);
      await makeRequest(url, {
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
   * Fetch sales opportunities - FIXED to show opportunities where user is creator OR sales rep
   */
  getSalesOpportunities: async (filters = {}) => {
    try {
      const authState = getAuthState();
      const userId = authState.userId;
      
      console.log('🔍 getSalesOpportunities - Current user ID:', userId);
      
      if (!userId) {
        console.log('⚠️ No userId found, returning empty opportunities');
        return [];
      }
      
      // Build filter parts for sales opportunities
      const filterParts = [];
      
      // ============================================
      // FIXED: Show opportunities where user is creator OR sales rep
      // ============================================
      if (userId) {
        filterParts.push(`(CreatedBy eq ${userId} or SalesRep_ID eq ${userId})`);
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
      
      const filterString = filterParts.length > 0 ? filterParts.join(' and ') : null;
      const url = buildUrl('models/C_Opportunity', {}, filterString);
      
      console.log('🔍 Sales Opportunities URL:', url);
      console.log('🔍 Filter parts:', filterParts);
      
      const data = await makeRequest(url);
      
      // SAFE data extraction
      const records = Array.isArray(data.records) ? data.records : [];
      
      console.log(`✅ Retrieved ${records.length} sales opportunities where user is creator OR sales rep`);
      
      // Log each opportunity's details
      if (records.length > 0) {
        records.forEach((opp, index) => {
          console.log(`📊 Opportunity ${index + 1}:`, {
            id: opp.id,
            documentNo: opp.DocumentNo,
            name: opp.Name,
            businessPartner: opp.C_BPartner_ID?.identifier,
            amount: opp.OpportunityAmt,
            stage: opp.C_SalesStage_ID?.identifier,
            leadId: opp.AD_User_ID?.id,
            salesRepId: opp.SalesRep_ID?.id,
            createdBy: opp.CreatedBy?.id || opp.CreatedBy
          });
        });
      } else {
        console.log('⚠️ No opportunities found for this user');
      }
      
      return records;
    } catch (error) {
      console.error('❌ Get sales opportunities failed:', error.message);
      console.error('❌ Error details:', error);
      
      // Handle specific errors
      if (error.message === 'SESSION_EXPIRED') {
        throw error;
      } else if (error.message === 'RESOURCE_NOT_FOUND') {
        console.log('⚠️ C_Opportunity endpoint may not exist. Check iDempiere REST API.');
        return [];
      } else if (error.message === 'PERMISSION_DENIED') {
        console.log('⚠️ Permission denied for sales opportunities. Check role permissions.');
        return [];
      }
      
      return [];
    }
  },

  /**
   * Create sales opportunity
   * FIXED: Properly format the request body for iDempiere
   */
  createSalesOpportunity: async (opportunityData) => {
    try {
      const url = buildUrl('models/C_Opportunity');
      
      // Get auth state for default values
      const authState = getAuthState();
      const userId = authState.userId;
      
      // Ensure the data is properly formatted for iDempiere
      const formattedData = {
        ...opportunityData,
        // Ensure these are properly formatted as objects with id
        AD_Client_ID: opportunityData.AD_Client_ID?.id ? 
          { id: opportunityData.AD_Client_ID.id } : 
          { id: 1000000 }, // Default client
        
        AD_Org_ID: opportunityData.AD_Org_ID?.id ? 
          { id: opportunityData.AD_Org_ID.id } : 
          { id: 1000000 }, // Default organization
        
        AD_User_ID: opportunityData.AD_User_ID?.id ? 
          { id: opportunityData.AD_User_ID.id } : 
          null,
        
        SalesRep_ID: opportunityData.SalesRep_ID?.id ? 
          { id: opportunityData.SalesRep_ID.id } : 
          userId ? { id: userId } : null,
        
        C_BPartner_ID: opportunityData.C_BPartner_ID?.id ? 
          { id: opportunityData.C_BPartner_ID.id } : 
          null,
        
        C_SalesStage_ID: opportunityData.C_SalesStage_ID?.id ? 
          { id: opportunityData.C_SalesStage_ID.id } : 
          { id: 1000000 }, // Default sales stage
        
        C_Currency_ID: opportunityData.C_Currency_ID?.id ? 
          { id: opportunityData.C_Currency_ID.id } : 
          { id: 306 }, // Default PKR
        
        C_Campaign_ID: opportunityData.C_Campaign_ID?.id ? 
          { id: opportunityData.C_Campaign_ID.id } : 
          opportunityData.C_Campaign_ID,
      };
      
      // Validate required fields
      if (!formattedData.AD_User_ID) {
        throw new Error('Lead (AD_User_ID) is required to create an opportunity');
      }
      
      if (!formattedData.C_BPartner_ID) {
        throw new Error('Business Partner is required to create an opportunity');
      }
      
      if (!formattedData.SalesRep_ID) {
        throw new Error('Sales Representative is required to create an opportunity');
      }
      
      console.log('📝 Create Sales Opportunity URL:', url);
      console.log('📦 Formatted opportunity data:', JSON.stringify(formattedData, null, 2));
      
      const data = await makeRequest(url, {
        method: 'POST',
        body: formattedData,
      });
      
      console.log('✅ Sales opportunity created successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Create sales opportunity failed:', error.message);
      console.error('❌ Error details:', error);
      throw error;
    }
  },

  /**
   * Update sales opportunity
   */
  updateSalesOpportunity: async (opportunityId, updates) => {
    try {
      const url = buildUrl(`models/C_Opportunity/${opportunityId}`);
      
      // Format updates similarly to create
      const formattedUpdates = {
        ...updates,
        AD_Client_ID: updates.AD_Client_ID?.id ? { id: updates.AD_Client_ID.id } : updates.AD_Client_ID,
        AD_Org_ID: updates.AD_Org_ID?.id ? { id: updates.AD_Org_ID.id } : updates.AD_Org_ID,
        AD_User_ID: updates.AD_User_ID?.id ? { id: updates.AD_User_ID.id } : updates.AD_User_ID,
        SalesRep_ID: updates.SalesRep_ID?.id ? { id: updates.SalesRep_ID.id } : updates.SalesRep_ID,
        C_BPartner_ID: updates.C_BPartner_ID?.id ? { id: updates.C_BPartner_ID.id } : updates.C_BPartner_ID,
        C_SalesStage_ID: updates.C_SalesStage_ID?.id ? { id: updates.C_SalesStage_ID.id } : updates.C_SalesStage_ID,
        C_Currency_ID: updates.C_Currency_ID?.id ? { id: updates.C_Currency_ID.id } : updates.C_Currency_ID,
        C_Campaign_ID: updates.C_Campaign_ID?.id ? { id: updates.C_Campaign_ID.id } : updates.C_Campaign_ID,
      };
      
      console.log('✏️ Update Sales Opportunity URL:', url);
      
      const data = await makeRequest(url, {
        method: 'PUT',
        body: formattedUpdates,
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
   * FIXED: Use combined filter for search
   */
  searchLeads: async (searchTerm) => {
    try {
      const authState = getAuthState();
      const userId = authState.userId;
      
      if (!searchTerm || searchTerm.trim() === '') {
        return await crmApiService.getLeads();
      }
      
      const cleanSearchTerm = searchTerm.trim();
      
      console.log('🔍 Searching for term:', cleanSearchTerm);
      
      // Build search filter - Use combined filter for leads user can see
      const searchFilter = `IsSalesLead eq true and (CreatedBy eq ${userId} or SalesRep_ID eq ${userId}) and (
        contains(tolower(Name), tolower('${cleanSearchTerm}')) or 
        contains(tolower(EMail), tolower('${cleanSearchTerm}')) or 
        contains(tolower(Phone), tolower('${cleanSearchTerm}'))
      )`;
      
      const url = buildUrl('models/AD_User', {}, searchFilter);
      console.log('🔍 Search leads URL:', url);
      
      const data = await makeRequest(url);
      
      const records = Array.isArray(data.records) ? data.records : [];
      console.log(`✅ Found ${records.length} leads matching search for "${cleanSearchTerm}"`);
      
      if (records.length > 0) {
        console.log('📋 Found leads:', records.map(r => r.Name));
      }
      
      return records;
    } catch (error) {
      console.error('Search leads failed:', error.message);
      
      // If the first approach fails, try a simpler search
      try {
        console.log('🔄 Trying alternative search method...');
        const authState = getAuthState();
        const userId = authState.userId;
        const cleanSearchTerm = searchTerm.trim().toLowerCase();
        
        // Get all leads user can see and filter locally
        const allLeads = await crmApiService.getLeads();
        
        const filteredLeads = allLeads.filter(lead => {
          const name = (lead.Name || '').toLowerCase();
          const email = (lead.EMail || '').toLowerCase();
          const phone = (lead.Phone || '').toLowerCase();
          
          return name.includes(cleanSearchTerm) || 
                 email.includes(cleanSearchTerm) || 
                 phone.includes(cleanSearchTerm);
        });
        
        console.log(`✅ Local filtering found ${filteredLeads.length} leads for "${searchTerm}"`);
        
        return filteredLeads;
      } catch (fallbackError) {
        console.error('Fallback search also failed:', fallbackError.message);
        return [];
      }
    }
  },
  
  /**
   * Get campaigns
   */
  getCampaigns: async () => {
    try {
      const url = buildUrl('models/C_Campaign');
      console.log('🎯 Get campaigns URL:', url);
      
      const data = await makeRequest(url);
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
      const url = buildUrl('models/C_LeadSource');
      console.log('📞 Get lead sources URL:', url);
      
      const data = await makeRequest(url);
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
      const url = buildUrl('models/C_LeadStatus');
      console.log('📊 Get lead statuses URL:', url);
      
      const data = await makeRequest(url);
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

  /**
   * Get currencies
   */
  getCurrencies: async () => {
    try {
      const url = buildUrl('models/C_Currency');
      console.log('💰 Get currencies URL:', url);
      
      const data = await makeRequest(url);
      const records = Array.isArray(data.records) ? data.records : [];
      
      console.log(`✅ Retrieved ${records.length} currencies`);
      return records;
    } catch (error) {
      console.error('Get currencies failed:', error.message);
      
      if (error.message === 'SESSION_EXPIRED') {
        throw error;
      }
      return [];
    }
  },

  /**
   * Get sales stages
   */
  getSalesStages: async () => {
    try {
      const url = buildUrl('models/C_SalesStage');
      console.log('📈 Get sales stages URL:', url);
      
      const data = await makeRequest(url);
      const records = Array.isArray(data.records) ? data.records : [];
      
      console.log(`✅ Retrieved ${records.length} sales stages`);
      return records;
    } catch (error) {
      console.error('Get sales stages failed:', error.message);
      
      if (error.message === 'SESSION_EXPIRED') {
        throw error;
      }
      return [];
    }
  },
};

export default crmApiService;