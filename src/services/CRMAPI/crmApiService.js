// services/CRMAPI/crmApiService.js - COMPLETE UPDATED VERSION
// Directly extracts statuses from leads without trying other endpoints

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
// CACHE FOR LEAD STATUSES
// ============================================
let leadStatusesCache = null;
let leadStatusesCacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ============================================
// COLOR GENERATION FOR STATUSES
// ============================================
const getStatusColor = (statusId, index = 0) => {
  // Predefined colors for common statuses
  const colorMap = {
    'N': '#2196F3', // New - Blue
    'W': '#FF9800', // Working - Orange
    'C': '#4CAF50', // Converted - Green
    'E': '#F44336', // Expired - Red
    'Q': '#9C27B0', // Qualified - Purple
    'L': '#F44336', // Lost - Red
    'H': '#FFC107', // Hot - Amber
    'C': '#00BCD4', // Cold - Cyan
  };

  if (colorMap[statusId]) {
    return colorMap[statusId];
  }

  // Generate consistent color for custom statuses based on string hash
  const colors = [
    '#1E88E5', '#D32F2F', '#7B1FA2', '#C2185B', '#E64A19',
    '#388E3C', '#FBC02D', '#00796B', '#5D4037', '#455A64',
    '#0288D1', '#C0CA33', '#8E24AA', '#D81B60', '#F57C00',
    '#43A047', '#00ACC1', '#6D4C41', '#546E7A', '#BDBDBD'
  ];

  // Create a hash from the status ID for consistent coloring
  const hash = statusId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  return colors[Math.abs(hash) % colors.length];
};

// ============================================
// CRM API SERVICE
// ============================================
const crmApiService = {

  /**
   * Fetch lead statuses directly from leads
   * This will automatically get any new statuses added in backend
   */
  getLeadStatuses: async (forceRefresh = false) => {
    try {
      // Check cache first
      const now = Date.now();
      if (!forceRefresh &&
        leadStatusesCache &&
        leadStatusesCacheTime &&
        (now - leadStatusesCacheTime) < CACHE_DURATION) {
        console.log('📊 Using cached lead statuses:', leadStatusesCache.length);
        return leadStatusesCache;
      }

      console.log('📊 Extracting unique statuses from leads...');

      // Fetch all leads that are sales leads
      const leadsUrl = buildUrl('models/AD_User', {}, 'IsSalesLead eq true');
      const leadsData = await makeRequest(leadsUrl);
      const leads = Array.isArray(leadsData.records) ? leadsData.records : [];

      console.log(`📊 Found ${leads.length} leads to extract statuses from`);

      // Extract unique statuses
      const statusMap = new Map();

      leads.forEach(lead => {
        if (lead.LeadStatus) {
          const statusId = lead.LeadStatus.id;
          const statusName = lead.LeadStatus.identifier;

          if (!statusMap.has(statusId)) {
            statusMap.set(statusId, {
              id: statusId,
              name: statusName,
              description: lead.LeadStatusDescription || '',
              sequence: statusMap.size * 10, // Simple sequencing
              count: 1,
              color: getStatusColor(statusId),
              isActive: true
            });
          } else {
            // Increment count
            const status = statusMap.get(statusId);
            status.count++;
          }
        }
      });

      // Convert map to array and sort
      const statuses = Array.from(statusMap.values())
        .sort((a, b) => {
          // Sort by predefined order: New, Working, Converted, Expired, then others
          const order = { 'N': 1, 'W': 2, 'C': 3, 'E': 4 };
          const aOrder = order[a.id] || 5;
          const bOrder = order[b.id] || 5;
          if (aOrder !== bOrder) return aOrder - bOrder;
          return (a.name || '').localeCompare(b.name || '');
        });

      console.log(`✅ Extracted ${statuses.length} unique statuses from leads`);

      // Log all statuses found
      statuses.forEach(status => {
        console.log(`   - ${status.name} (${status.id}): ${status.count} leads, color: ${status.color}`);
      });

      // Update cache
      leadStatusesCache = statuses;
      leadStatusesCacheTime = now;

      return statuses;
    } catch (error) {
      console.error('❌ Get lead statuses failed:', error.message);

      // Return default statuses as fallback
      const defaultStatuses = [
        { id: 'N', name: 'New', description: 'New Lead', sequence: 10, count: 0, color: '#2196F3', isActive: true },
        { id: 'W', name: 'Working', description: 'Working on Lead', sequence: 20, count: 0, color: '#FF9800', isActive: true },
        { id: 'C', name: 'Converted', description: 'Converted to Customer', sequence: 30, count: 0, color: '#4CAF50', isActive: true },
        { id: 'E', name: 'Expired', description: 'Lead Expired', sequence: 40, count: 0, color: '#F44336', isActive: true }
      ];

      console.log('⚠️ Using default statuses as fallback');
      return defaultStatuses;
    }
  },

  /**
   * Clear lead statuses cache
   */
  clearLeadStatusesCache: () => {
    leadStatusesCache = null;
    leadStatusesCacheTime = null;
    console.log('📊 Lead statuses cache cleared');
  },

  /**
/**
 * Fetch leads with optional filters
 */
  /**
 * Fetch leads with optional filters
 */
getLeads: async (filters = {}) => {
  try {
    const authState = getAuthState();
    const userId = authState.userId;
    
    console.log('🔍 getLeads - Current user ID:', userId);
    
    // Build comprehensive filter
    let filterParts = ['IsSalesLead eq true'];
    
    // User should see ONLY leads where they are the sales representative
    // EXCLUDING leads they created but aren't assigned as sales rep
    if (userId) {
      filterParts.push(`SalesRep_ID eq ${userId}`);
    }
    
    // Add status filter using the reference list syntax
    if (filters.status) {
      filterParts.push(`LeadStatus/id eq '${filters.status}'`);
    }
    
    // Add source filter
    if (filters.source) {
      filterParts.push(`LeadSource/id eq '${filters.source}'`);
    }
    
    // Add sales rep filter - this overrides the default if provided
    if (filters.salesRepId) {
      filterParts.push(`SalesRep_ID eq ${filters.salesRepId}`);
    }
    
    // Date filters
    if (filters.startDate) {
      filterParts.push(`Created ge '${filters.startDate}'`);
    }
    if (filters.endDate) {
      filterParts.push(`Created le '${filters.endDate}'`);
    }
    
    // Search filter
    if (filters.search) {
      filterParts.push(`(contains(Name, '${filters.search}') or contains(EMail, '${filters.search}') or contains(Phone, '${filters.search}') or contains(BPName, '${filters.search}'))`);
    }
    
    // Build filter string
    const filterString = filterParts.join(' and ');
    
    const url = buildUrl('models/AD_User', {}, filterString);
    console.log('🔍 Leads API URL:', url);
    
    const data = await makeRequest(url);
    
    // SAFE data extraction with fallback
    const records = Array.isArray(data.records) ? data.records : [];
    
    console.log(`✅ Retrieved ${records.length} leads where user is sales rep`);
    
    // Simple count log without warnings
    if (records.length === 0) {
      console.log('📊 No leads found where user is assigned as sales rep');
    }
    
    return records;
  } catch (error) {
    console.error('❌ Get leads failed:', error.message);
    
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
   * Fetch sales representatives (AD_Users with specific role or all)
   */
  /**
  * Fetch sales representatives (AD_Users with specific role or all)
  * Handles pagination to get ALL users, not just first page
  */
  getSalesRepresentatives: async (filters = {}) => {
    try {
      // Build filter for sales reps
      let filterParts = ['IsActive eq true'];
      const filterString = filterParts.join(' and ');
      const url = buildUrl('models/AD_User', {}, filterString);

      console.log('👥 Sales Reps API URL:', url);

      const data = await makeRequest(url);
      let records = Array.isArray(data.records) ? data.records : [];

      console.log(`✅ Retrieved ${records.length} users from first page`);

      // Check if Umar is missing (ID: 1000004)
      const hasUmar = records.some(user => user.id === 1000004);

      if (!hasUmar) {
        console.log('⚠️ Umar missing from first page, fetching next page...');

        // Fetch second page (skip=100)
        const secondPageUrl = `${url}${url.includes('?') ? '&' : '?'}$skip=100`;
        const secondPageData = await makeRequest(secondPageUrl);
        const secondPageRecords = Array.isArray(secondPageData.records) ? secondPageData.records : [];

        console.log(`📄 Second page: ${secondPageRecords.length} users`);

        // Combine both pages
        records = [...records, ...secondPageRecords];

        // Check again for Umar
        if (records.some(user => user.id === 1000004)) {
          console.log('✅ Umar found on second page!');
        } else {
          console.log('⚠️ Umar still missing, fetching directly...');

          // Last resort: fetch Umar directly
          try {
            const umarUrl = buildUrl('models/AD_User/1000004');
            const umarData = await makeRequest(umarUrl);
            if (umarData && umarData.id) {
              records.push(umarData);
              console.log('✅ Added Umar manually');
            }
          } catch (umarError) {
            console.error('❌ Failed to fetch Umar directly:', umarError.message);
          }
        }
      }

      // Sort by name
      records.sort((a, b) => (a.Name || '').localeCompare(b.Name || ''));

      console.log(`📊 Final list has ${records.length} users`);
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
  updateLeadStatus: async (leadId, statusId) => {
    try {
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
   * Fetch all followups/activities
   */
  getFollowups: async (filters = {}) => {
    try {
      const authState = getAuthState();
      const userId = authState.userId;

      console.log('🔍 getFollowups - Current user ID:', userId);

      // First, get all leads this user can see
      let userLeadIds = [];
      try {
        const leadsFilter = `IsSalesLead eq true and (CreatedBy eq ${userId} or SalesRep_ID eq ${userId})`;
        const leadsUrl = buildUrl('models/AD_User', {}, leadsFilter);

        const leadsResponse = await makeRequest(leadsUrl);
        const userLeads = Array.isArray(leadsResponse.records) ? leadsResponse.records : [];
        userLeadIds = userLeads.map(lead => lead.id);

        console.log(`✅ Found ${userLeadIds.length} leads user can see`);
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

      // Only include followups for leads this user can see
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
   * Fetch sales opportunities
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

      // Show opportunities where user is creator OR sales rep
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

      const data = await makeRequest(url);

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
      const url = buildUrl('models/C_Opportunity');

      // Get auth state for default values
      const authState = getAuthState();
      const userId = authState.userId;

      // Ensure the data is properly formatted for iDempiere
      const formattedData = {
        ...opportunityData,
        AD_Client_ID: opportunityData.AD_Client_ID?.id ?
          { id: opportunityData.AD_Client_ID.id } :
          { id: 1000000 },

        AD_Org_ID: opportunityData.AD_Org_ID?.id ?
          { id: opportunityData.AD_Org_ID.id } :
          { id: 1000000 },

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
          { id: 1000000 },

        C_Currency_ID: opportunityData.C_Currency_ID?.id ?
          { id: opportunityData.C_Currency_ID.id } :
          { id: 306 },
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

      const data = await makeRequest(url, {
        method: 'POST',
        body: formattedData,
      });

      console.log('✅ Sales opportunity created successfully');
      return data;
    } catch (error) {
      console.error('❌ Create sales opportunity failed:', error.message);
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
      const statuses = await crmApiService.getLeadStatuses();

      const statistics = {
        total: leads.length,
        byStatus: {},
      };

      // Initialize all statuses with 0
      statuses.forEach(status => {
        statistics.byStatus[status.id] = {
          count: 0,
          name: status.name,
          id: status.id,
          color: status.color
        };
      });

      // Count leads by status
      leads.forEach(lead => {
        const statusId = lead.LeadStatus?.id || 'N';
        if (statistics.byStatus[statusId]) {
          statistics.byStatus[statusId].count++;
        } else {
          // Handle unknown status
          statistics.byStatus[statusId] = {
            count: 1,
            name: lead.LeadStatus?.identifier || 'Unknown',
            id: statusId,
            color: getStatusColor(statusId)
          };
        }
      });

      return statistics;
    } catch (error) {
      console.error('Get lead statistics failed:', error.message);
      return { total: 0, byStatus: {} };
    }
  },

  /**
   * Search leads
   */
  searchLeads: async (searchTerm) => {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        return await crmApiService.getLeads();
      }

      return await crmApiService.getLeads({ search: searchTerm.trim() });
    } catch (error) {
      console.error('Search leads failed:', error.message);

      // Fallback to local filtering
      try {
        const allLeads = await crmApiService.getLeads();
        const cleanSearchTerm = searchTerm.trim().toLowerCase();

        const filteredLeads = allLeads.filter(lead => {
          const name = (lead.Name || '').toLowerCase();
          const email = (lead.EMail || '').toLowerCase();
          const phone = (lead.Phone || '').toLowerCase();
          const bpName = (lead.BPName || '').toLowerCase();

          return name.includes(cleanSearchTerm) ||
            email.includes(cleanSearchTerm) ||
            phone.includes(cleanSearchTerm) ||
            bpName.includes(cleanSearchTerm);
        });

        return filteredLeads;
      } catch (fallbackError) {
        console.error('Fallback search failed:', fallbackError.message);
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