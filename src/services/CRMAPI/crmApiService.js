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
// JWT DECODER FOR API SERVICE
// ============================================
const decodeJWT = (token) => {
  try {
    if (!token) return null;
    
    // Remove Bearer prefix if exists
    const cleanToken = token.replace('Bearer ', '');
    
    // Split into 3 parts
    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // Get the middle part (payload)
    const payloadBase64 = parts[1];
    
    // Convert URL-safe base64 to standard base64
    let standardBase64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed
    while (standardBase64.length % 4 !== 0) {
      standardBase64 += '=';
    }
    
    // Decode using base64 library
    const decodedStr = require('base-64').decode(standardBase64);
    
    // Parse JSON
    return JSON.parse(decodedStr);
  } catch (error) {
    console.error('API Service - JWT Decode Error:', error);
    return null;
  }
};

// ============================================
// TOKEN VALIDATION
// ============================================
const validateToken = (token) => {
  try {
    if (!token) return { isValid: false, reason: 'NO_TOKEN' };
    
    const decoded = decodeJWT(token);
    if (!decoded) return { isValid: false, reason: 'INVALID_TOKEN' };
    
    // Check expiration if present
    if (decoded.exp) {
      const expirationTime = decoded.exp * 1000;
      const currentTime = Date.now();
      
      if (currentTime >= expirationTime) {
        return { isValid: false, reason: 'EXPIRED' };
      }
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, reason: 'VALIDATION_ERROR' };
  }
};

// ============================================
// RELOGIN QUEUE SYSTEM
// ============================================
let isReloginning = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ============================================
// UPDATED MAKE REQUEST WITH COMPLETE LOGIN AUTO-RELOGIN
// ============================================
const makeRequest = async (url, options = {}) => {
  try {
    const authState = getAuthState();
    let token = authState.token;

    if (!token) {
      throw new Error('AUTH_TOKEN_MISSING');
    }

    // Check if token is expired or expiring soon
    const validation = validateToken(token);
    
    // If token is expired, trigger complete relogin
    if (!validation.isValid && validation.reason === 'EXPIRED') {
      console.log('⚠️ Token expired, checking relogin status...');
      
      // If already reloginning, queue this request
      if (isReloginning) {
        console.log('⏳ Relogin in progress, queueing request...');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
      }
      
      // Start relogin process
      isReloginning = true;
      
      try {
        console.log('🔄 Starting complete login auto-relogin...');
        // FIXED: Use completeRelogin instead of relogin
        const newToken = await authState.completeRelogin?.();
        
        if (newToken) {
          console.log('✅ Complete login relogin successful, processing queue...');
          token = newToken;
          processQueue(null, newToken);
        } else {
          console.log('❌ Complete login relogin failed');
          processQueue(new Error('COMPLETE_RELOGIN_FAILED'));
          throw new Error('SESSION_EXPIRED');
        }
      } catch (reloginError) {
        processQueue(reloginError);
        throw reloginError;
      } finally {
        isReloginning = false;
      }
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

    // Handle 401 Unauthorized
    if (response.status === 401) {
      console.log('🔐 Got 401, checking if we should relogin...');
      
      // If we already tried relogin for this request, don't try again
      if (options._retry) {
        console.log('❌ Already tried relogin, giving up');
        throw new Error('SESSION_EXPIRED');
      }
      
      // If already reloginning, queue this request
      if (isReloginning) {
        console.log('⏳ Relogin in progress, queueing request...');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
      }
      
      // Start relogin
      isReloginning = true;
      
      try {
        console.log('🔄 Attempting complete login relogin due to 401...');
        // FIXED: Use completeRelogin instead of relogin
        const newToken = await authState.completeRelogin?.();
        
        if (newToken) {
          console.log('✅ Complete login relogin successful, retrying request...');
          processQueue(null, newToken);
          
          // Retry this request with new token
          return makeRequest(url, {
            ...options,
            _retry: true,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${newToken}`,
            },
          });
        } else {
          console.log('❌ Complete login relogin failed');
          processQueue(new Error('COMPLETE_RELOGIN_FAILED'));
          throw new Error('SESSION_EXPIRED');
        }
      } catch (reloginError) {
        processQueue(reloginError);
        throw reloginError;
      } finally {
        isReloginning = false;
      }
    }

    if (!response.ok) {
      let errorData = null;
      try {
        const errorText = await response.text();
        errorData = errorText;
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

      if (response.status === 403) {
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
    });

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
// CRM API SERVICE - REST OF YOUR METHODS (UNCHANGED)
// ============================================
const crmApiService = {
  /**
   * Fetch lead statuses directly from leads
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
              sequence: statusMap.size * 10,
              count: 1,
              color: getStatusColor(statusId),
              isActive: true
            });
          } else {
            const status = statusMap.get(statusId);
            status.count++;
          }
        }
      });

      const statuses = Array.from(statusMap.values())
        .sort((a, b) => {
          const order = { 'N': 1, 'W': 2, 'C': 3, 'E': 4 };
          const aOrder = order[a.id] || 5;
          const bOrder = order[b.id] || 5;
          if (aOrder !== bOrder) return aOrder - bOrder;
          return (a.name || '').localeCompare(b.name || '');
        });

      console.log(`✅ Extracted ${statuses.length} unique statuses from leads`);

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
   * Create a new location (C_Location)
   */
  /**
   * Create a new location (C_Location)
   */
  createLocation: async (locationData) => {
    try {
      const url = buildUrl('models/C_Location');
      console.log('📍 Create location URL:', url);

      const data = await makeRequest(url, {
        method: 'POST',
        body: locationData,
      });

      console.log('✅ Location created successfully with ID:', data.id);
      return data;
    } catch (error) {
      console.error('Create location failed:', error.message);
      throw error;
    }
  },
  // In crmApiService.js
getLocationById: async (locationId) => {
  try {
    const url = buildUrl(`models/C_Location/${locationId}`);
    const data = await makeRequest(url);
    return data;
  } catch (error) {
    console.error('Get location by ID failed:', error.message);
    throw error;
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
   * Fetch leads with optional filters
   */
  getLeads: async (filters = {}) => {
    try {
      const authState = getAuthState();
      const userId = authState.userId;
      
      console.log('🔍 getLeads - Current user ID:', userId);
      
      // Build comprehensive filter
      let filterParts = ['IsSalesLead eq true'];
      
      if (userId) {
        filterParts.push(`SalesRep_ID eq ${userId}`);
      }
      
      if (filters.status) {
        filterParts.push(`LeadStatus/id eq '${filters.status}'`);
      }
      
      if (filters.source) {
        filterParts.push(`LeadSource/id eq '${filters.source}'`);
      }
      
      if (filters.salesRepId) {
        filterParts.push(`SalesRep_ID eq ${filters.salesRepId}`);
      }
      
      if (filters.startDate) {
        filterParts.push(`Created ge '${filters.startDate}'`);
      }
      if (filters.endDate) {
        filterParts.push(`Created le '${filters.endDate}'`);
      }
      
      if (filters.search) {
        filterParts.push(`(contains(Name, '${filters.search}') or contains(EMail, '${filters.search}') or contains(Phone, '${filters.search}') or contains(BPName, '${filters.search}'))`);
      }
      
      const filterString = filterParts.join(' and ');
      const url = buildUrl('models/AD_User', {}, filterString);
      console.log('🔍 Leads API URL:', url);
      
      const data = await makeRequest(url);
      const records = Array.isArray(data.records) ? data.records : [];
      
      console.log(`✅ Retrieved ${records.length} leads`);
      
      return records;
    } catch (error) {
      console.error('❌ Get leads failed:', error.message);
      
      // Don't throw SESSION_EXPIRED for all errors
      if (error.message === 'SESSION_EXPIRED') {
        throw error;
      } else if (error.message === 'TEMPORARY_AUTH_ERROR') {
        console.log('🔄 Temporary auth error, returning empty array');
        return [];
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
   * Fetch sales representatives
   */
  getSalesRepresentatives: async (filters = {}) => {
    try {
      let filterParts = ['IsActive eq true'];
      const filterString = filterParts.join(' and ');
      const url = buildUrl('models/AD_User', {}, filterString);

      console.log('👥 Sales Reps API URL:', url);

      const data = await makeRequest(url);
      let records = Array.isArray(data.records) ? data.records : [];

      console.log(`✅ Retrieved ${records.length} users from first page`);

      const hasUmar = records.some(user => user.id === 1000004);

      if (!hasUmar) {
        console.log('⚠️ Umar missing from first page, fetching next page...');

        const secondPageUrl = `${url}${url.includes('?') ? '&' : '?'}$skip=100`;
        const secondPageData = await makeRequest(secondPageUrl);
        const secondPageRecords = Array.isArray(secondPageData.records) ? secondPageData.records : [];

        console.log(`📄 Second page: ${secondPageRecords.length} users`);

        records = [...records, ...secondPageRecords];

        if (records.some(user => user.id === 1000004)) {
          console.log('✅ Umar found on second page!');
        } else {
          console.log('⚠️ Umar still missing, fetching directly...');

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

      console.log('✅ Lead created successfully. Returned data:', {
        id: data.id,
        SalesRep_ID: data.SalesRep_ID,
        IsSalesLead: data.IsSalesLead,
        Name: data.Name,
      });

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

      const data = await makeRequest(url, {
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

      if (userLeadIds.length === 0) {
        console.log('⚠️ No leads found for this user, returning empty followups');
        return [];
      }

      const filterParts = [];

      if (userLeadIds.length > 0) {
        const leadIdConditions = userLeadIds.map(id => `AD_User_ID eq ${id}`);
        filterParts.push(`(${leadIdConditions.join(' or ')})`);
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

      const filterParts = [];

      if (userId) {
        filterParts.push(`(CreatedBy eq ${userId} or SalesRep_ID eq ${userId})`);
      }

      if (filters.stage) {
        filterParts.push(`C_SalesStage_ID/id eq '${filters.stage}'`);
      }

      if (filters.status) {
        filterParts.push(`OpportunityStatus/id eq '${filters.status}'`);
      }

      if (filters.startDate) {
        filterParts.push(`Created ge '${filters.startDate}'`);
      }
      if (filters.endDate) {
        filterParts.push(`Created le '${filters.endDate}'`);
      }

      filterParts.push(`IsActive eq true`);

      const filterString = filterParts.length > 0 ? filterParts.join(' and ') : null;
      const url = buildUrl('models/C_Opportunity', {}, filterString);

      console.log('🔍 Sales Opportunities URL:', url);

      const data = await makeRequest(url);
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

      const authState = getAuthState();
      const userId = authState.userId;

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
   * Fetch lead activities
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

      statuses.forEach(status => {
        statistics.byStatus[status.id] = {
          count: 0,
          name: status.name,
          id: status.id,
          color: status.color
        };
      });

      leads.forEach(lead => {
        const statusId = lead.LeadStatus?.id || 'N';
        if (statistics.byStatus[statusId]) {
          statistics.byStatus[statusId].count++;
        } else {
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
getCountries: async () => {
  try {
    let allRecords = [];
    let skip = 0;
    const pageSize = 100; // Must match the API's max page size (or any value <= server limit)
    let hasMore = true;

    while (hasMore) {
      // Build base URL from buildUrl (without pagination)
      const baseUrl = buildUrl('models/C_Country');
      // Append pagination parameters: $top and $skip
      const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}$top=${pageSize}&$skip=${skip}`;

      console.log(`🌍 Fetching countries page (skip=${skip})...`);

      const data = await makeRequest(url);
      const records = Array.isArray(data.records) ? data.records : [];
      allRecords = [...allRecords, ...records];

      // Determine if more pages exist
      const totalCount = data['row-count'] || 0; // Use row-count from response (246)
      if (totalCount > 0) {
        hasMore = allRecords.length < totalCount;
      } else {
        // Fallback: if no total count provided, check if we got a full page
        hasMore = records.length === pageSize;
      }

      skip += pageSize; // move to next page
    }

    console.log(`✅ Retrieved ${allRecords.length} countries total`);
    return allRecords;
  } catch (error) {
    console.error('❌ Get countries failed:', error.message);
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