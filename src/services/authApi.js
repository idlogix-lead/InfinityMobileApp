import { decodeJWT, getBaseUrl, apiRequest } from '../utils/apiUtils';

// ============================================
// AUTH API SERVICE
// ============================================
const apiService = {
  // Step 1: Basic login (just email/password)
  basicLogin: async (userName, password) => {
    try {
      const baseUrl = getBaseUrl();
      const url = `${baseUrl}/auth/tokens`;
      
      console.log('🔐 Basic Login URL:', url);
      
      const payload = { userName, password };
      
      console.log('📤 Basic login payload:', JSON.stringify(payload, null, 2));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      console.log('📥 Basic login response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Basic login error:', errorText);
        throw new Error('Authentication failed');
      }
      
      const data = await response.json();
      console.log('✅ Basic login success:', { 
        hasToken: !!data.token, 
        hasClients: data.clients?.length > 0 
      });
      
      return data;
    } catch (error) {
      console.error('❌ Basic login fetch error:', error.message);
      throw error;
    }
  },
  
  // Step 2: Complete login with parameters
  completeLogin: async (userName, password, parameters) => {
    try {
      const baseUrl = getBaseUrl();
      const url = `${baseUrl}/auth/tokens`;
      
      console.log('🔐 Complete Login URL:', url);
      
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
      
      const response = await fetch(url, {
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
      
      return data;
    } catch (error) {
      console.error('❌ Complete login fetch error:', error.message);
      throw error;
    }
  },
  
  // Fetch roles
  getRoles: async (token, clientId) => {
    try {
      const baseUrl = getBaseUrl();
      const url = `${baseUrl}/auth/roles?client=${clientId}`;
      
      console.log('👥 Fetching roles for client:', clientId);
      
      const data = await apiRequest(url, {}, token);
      return data.roles || [];
    } catch (error) {
      console.error('❌ Get roles error:', error.message);
      throw error;
    }
  },

  // Fetch organizations
  getOrganizations: async (token, clientId, roleId) => {
    try {
      const baseUrl = getBaseUrl();
      const url = `${baseUrl}/auth/organizations?client=${clientId}&role=${roleId}`;
      
      console.log('🏢 Fetching orgs for client/role:', clientId, roleId);
      
      const data = await apiRequest(url, {}, token);
      return data.organizations || [];
    } catch (error) {
      console.error('❌ Get organizations error:', error.message);
      throw error;
    }
  },

  // Fetch warehouses
  getWarehouses: async (token, clientId, roleId, organizationId) => {
    try {
      const baseUrl = getBaseUrl();
      const url = `${baseUrl}/auth/warehouses?client=${clientId}&role=${roleId}&organization=${organizationId}`;
      
      console.log('📦 Fetching warehouses for client/role/org:', clientId, roleId, organizationId);
      
      const data = await apiRequest(url, {}, token);
      return data.warehouses || [];
    } catch (error) {
      console.error('❌ Get warehouses error:', error.message);
      throw error;
    }
  },
};

export default apiService;