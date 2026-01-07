import { useAuthStore } from '../store/authStore';
import base64 from 'base-64'; // Add this import

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
      console.log('Basic login success:', { 
        hasToken: !!data.token, 
        hasClients: data.clients?.length > 0 
      });
      
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
      return data.warehouses || [];
    } catch (error) {
      console.error('Get warehouses fetch error:', error.message);
      throw error;
    }
  },
};

export default apiService;