// services/apiService.js
import { useAuthStore } from '../store/authStore';
import base64 from 'base-64';

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
      console.error('Invalid JWT format');
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
    const decodedStr = base64.decode(standardBase64);
    
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
        return { 
          isValid: false, 
          reason: 'EXPIRED',
          expiredAt: new Date(expirationTime).toISOString()
        };
      }
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, reason: 'VALIDATION_ERROR' };
  }
};

// Helper function to store credentials
const setCredentials = (userName, password) => {
  try {
    const authStore = useAuthStore.getState();
    if (authStore.setCredentials) {
      authStore.setCredentials(userName, password);
      console.log('✅ Credentials stored for user:', userName);
    } else {
      console.warn('⚠️ setCredentials not available in auth store');
    }
  } catch (error) {
    console.error('❌ Failed to store credentials:', error);
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

const apiService = {
  getBaseUrl: () => {
    const serverConfig = useAuthStore.getState().serverConfig;
    if (!serverConfig.protocol || !serverConfig.host || !serverConfig.port) {
      throw new Error('Server configuration missing. Please configure server settings first.');
    }
    return `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.port}/api/v1`;
  },
  
  // Step 1: Basic login (just email/password)
  basicLogin: async (userName, password) => {
    try {
      const baseUrl = apiService.getBaseUrl();
      console.log('Basic Login URL:', `${baseUrl}/auth/tokens`);
      
      const payload = { userName, password };
      
      console.log('Basic login payload:', JSON.stringify(payload, null, 2));
      
      const response = await fetch(`${baseUrl}/auth/tokens`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      console.log('Basic login response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Basic login error:', errorText);
        throw new Error('Authentication failed');
      }
      
      const data = await response.json();
      
      // Validate token
      if (data.token) {
        const validation = validateToken(data.token);
        console.log('Token validation:', validation);
      }
      
      console.log('Basic login success:', { 
        hasToken: !!data.token, 
        hasClients: data.clients?.length > 0 
      });
      
      // STORE CREDENTIALS FOR RELOGIN
      setCredentials(userName, password);
      
      return data;
    } catch (error) {
      console.error('Basic login fetch error:', error.message);
      throw error;
    }
  },
  
  // Step 2: Complete login with parameters
  completeLogin: async (userName, password, parameters) => {
    try {
      const baseUrl = apiService.getBaseUrl();
      console.log('🔐 Complete Login URL:', `${baseUrl}/auth/tokens`);
      
      // Ensure all parameters are strings
      const stringParams = {
        clientId: parameters.clientId?.toString(),
        roleId: parameters.roleId?.toString(),
        organizationId: parameters.organizationId?.toString(),
        warehouseId: parameters.warehouseId?.toString(),
        language: parameters.language || 'en_US'
      };
      
      const payload = { 
        userName, 
        password, 
        parameters: stringParams 
      };
      
      console.log('📤 Complete login payload:', JSON.stringify(payload, null, 2));
      
      const response = await fetch(`${baseUrl}/auth/tokens`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      console.log('📥 Complete login response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Complete login error response:', errorText);
        
        let errorMessage = 'Complete authentication failed';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch (e) {
          // If not JSON, use text as is
          if (errorText) errorMessage = errorText;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('✅ Complete login success - Response keys:', Object.keys(data));
      
      // Extract user ID from the token immediately
      if (data.token) {
        const validation = validateToken(data.token);
        console.log('Token validation:', validation);
        
        const decodedToken = decodeJWT(data.token);
        console.log('✅ Complete Login - Decoded Token:', decodedToken);
        
        // Add the extracted user ID to the response
        if (decodedToken?.AD_User_ID) {
          data.extractedUserId = decodedToken.AD_User_ID.toString();
          console.log('✅ Extracted User ID from token:', data.extractedUserId);
        } else if (decodedToken?.sub) {
          data.extractedUserId = decodedToken.sub;
          console.log('✅ Using sub field as User ID:', data.extractedUserId);
        }
      }
      
      // STORE CREDENTIALS AND UPDATE LOGIN PARAMETERS
      setCredentials(userName, password);
      
      // Update login parameters in auth store
      const authStore = useAuthStore.getState();
      if (authStore.setLoginParameters) {
        authStore.setLoginParameters({
          clientId: parameters.clientId,
          roleId: parameters.roleId,
          organizationId: parameters.organizationId,
          warehouseId: parameters.warehouseId,
          language: parameters.language || 'en_US'
        });
      }
      
      return data;
    } catch (error) {
      console.error('❌ Complete login fetch error:', error.message);
      throw error;
    }
  },
  
  // Fetch roles
  getRoles: async (token, clientId) => {
    try {
      const baseUrl = apiService.getBaseUrl();
      console.log('Fetching roles for client:', clientId);
      
      const response = await fetch(
        `${baseUrl}/auth/roles?client=${clientId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Get roles error:', errorText);
        throw new Error('Failed to fetch roles');
      }
      
      const data = await response.json();
      
      // Store available roles in auth store
      const authStore = useAuthStore.getState();
      if (authStore.setAvailableRoles) {
        authStore.setAvailableRoles(data.roles || []);
      }
      
      return data.roles || [];
    } catch (error) {
      console.error('Get roles fetch error:', error.message);
      throw error;
    }
  },

  // Fetch organizations
  getOrganizations: async (token, clientId, roleId) => {
    try {
      const baseUrl = apiService.getBaseUrl();
      console.log('Fetching orgs for client/role:', clientId, roleId);
      
      const response = await fetch(
        `${baseUrl}/auth/organizations?client=${clientId}&role=${roleId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Get organizations error:', errorText);
        throw new Error('Failed to fetch organizations');
      }
      
      const data = await response.json();
      
      // Store available organizations in auth store
      const authStore = useAuthStore.getState();
      if (authStore.setAvailableOrganizations) {
        authStore.setAvailableOrganizations(data.organizations || []);
      }
      
      return data.organizations || [];
    } catch (error) {
      console.error('Get organizations fetch error:', error.message);
      throw error;
    }
  },

  // Fetch warehouses
  getWarehouses: async (token, clientId, roleId, organizationId) => {
    try {
      const baseUrl = apiService.getBaseUrl();
      console.log('Fetching warehouses for client/role/org:', clientId, roleId, organizationId);
      
      const response = await fetch(
        `${baseUrl}/auth/warehouses?client=${clientId}&role=${roleId}&organization=${organizationId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Get warehouses error:', errorText);
        throw new Error('Failed to fetch warehouses');
      }
      
      const data = await response.json();
      
      // Store available warehouses in auth store
      const authStore = useAuthStore.getState();
      if (authStore.setAvailableWarehouses) {
        authStore.setAvailableWarehouses(data.warehouses || []);
      }
      
      return data.warehouses || [];
    } catch (error) {
      console.error('Get warehouses fetch error:', error.message);
      throw error;
    }
  },
  
  // ============================================
  // UPDATED MAKE REQUEST WITH COMPLETE LOGIN AUTO-RELOGIN
  // ============================================
  makeRequest: async (url, options = {}) => {
    try {
      const authState = useAuthStore.getState();
      let token = authState.token;

      if (!token) {
        throw new Error('AUTH_TOKEN_MISSING');
      }

      // Check if token is expired or expiring soon
      const validation = validateToken(token);
      
      // If token is expired, trigger complete login relogin
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
        console.log('🔐 Got 401, checking if we should complete relogin...');
        
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
          const newToken = await authState.completeRelogin?.();
          
          if (newToken) {
            console.log('✅ Complete login relogin successful, retrying request...');
            processQueue(null, newToken);
            
            // Retry this request with new token
            return apiService.makeRequest(url, {
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
  },

  // Helper method to build URLs
  buildUrl: (endpoint, filters = {}, customFilter = null) => {
    const authState = useAuthStore.getState();
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
  },

  // Clear stored credentials (for logout)
  clearCredentials: () => {
    try {
      const authStore = useAuthStore.getState();
      if (authStore.setCredentials) {
        authStore.setCredentials(null, null);
        console.log('✅ Credentials cleared');
      }
    } catch (error) {
      console.error('❌ Failed to clear credentials:', error);
    }
  },
};

export default apiService;