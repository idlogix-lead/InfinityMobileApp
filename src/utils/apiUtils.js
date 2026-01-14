// apiUtils.js - FIXED VERSION
import { useAuthStore } from '../store/authStore';
import base64 from 'base64-js'; // Make sure you have this installed

// ============================================
// JWT DECODER (Reusable) - USING base64 library
// ============================================
export const decodeJWT = (token) => {
  try {
    if (!token) {
      console.error('No token provided to decodeJWT');
      return null;
    }
    
    // Remove Bearer prefix if exists
    const cleanToken = token.replace('Bearer ', '').trim();
    
    console.log('🔐 Decoding JWT token, length:', cleanToken.length);
    
    // Split into 3 parts
    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format, parts:', parts.length);
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
    
    // Decode using base64 library - CORRECT WAY
    // base64-js returns Uint8Array, need to convert to string
    const bytes = base64.toByteArray(standardBase64);
    const decodedStr = new TextDecoder().decode(bytes);
    
    const decoded = JSON.parse(decodedStr);
    console.log('✅ JWT Decoded successfully:', decoded);
    
    return decoded;
  } catch (error) {
    console.error('🔥 JWT Decode Error Details:', {
      error: error.message,
      tokenPreview: token ? token.substring(0, 50) + '...' : 'null'
    });
    return null;
  }
};

// ============================================
// ALTERNATIVE: Use the original base64 library
// If you were using 'base-64' npm package instead
// ============================================
// If you want to use the original method, install:
// npm install base-64

// Then use:
/*
import base64 from 'base-64';

export const decodeJWT = (token) => {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const base64Str = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64Str.padEnd(base64Str.length + (4 - base64Str.length % 4) % 4, '=');
    
    const decoded = base64.decode(padded);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('API Service - JWT Decode Error:', error);
    return null;
  }
};
*/

// ============================================
// BASE URL BUILDER (Reusable)
// ============================================
export const getBaseUrl = () => {
  try {
    const serverConfig = useAuthStore.getState().serverConfig;
    
    if (!serverConfig) {
      throw new Error('Server configuration not found in auth store');
    }
    
    const { protocol, host, port } = serverConfig;
    
    if (!protocol || !host || !port) {
      throw new Error('Server configuration incomplete. Protocol, host, and port are required.');
    }
    
    return `${protocol}://${host}:${port}/api/v1`;
  } catch (error) {
    console.error('Failed to build base URL:', error.message);
    throw new Error('SERVER_CONFIG_MISSING: ' + error.message);
  }
};

// ============================================
// AUTH STATE HELPER (Non-React Safe)
// ============================================
export const getAuthState = () => {
  try {
    return useAuthStore.getState();
  } catch (error) {
    console.warn('Auth store not available:', error.message);
    return {};
  }
};

// ============================================
// API REQUEST BUILDER (Reusable)
// ============================================
export const buildApiUrl = (endpoint, filters = {}, customFilter = null) => {
  const baseUrl = getBaseUrl();
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
      if (typeof value === 'string') {
        filterParts.push(`${key} eq '${value.replace(/'/g, "''")}'`);
      } else {
        filterParts.push(`${key} eq ${value}`);
      }
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
// FETCH WRAPPER (Reusable)
// ============================================
export const apiRequest = async (url, options = {}, authToken = null) => {
  try {
    // Get token from parameter or auth store
    let token = authToken;
    if (!token) {
      const authState = getAuthState();
      token = authState.token;
    }
    
    if (!token) {
      console.error('Authentication token missing for request:', url);
      throw new Error('AUTH_TOKEN_MISSING');
    }
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    };
    
    console.log('🌐 API Request:', {
      method: requestOptions.method,
      url,
      hasToken: !!token,
      tokenLength: token?.length || 0
    });
    
    const response = await fetch(url, requestOptions);
    
    console.log('🌐 API Response Status:', response.status);
    
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
      
      if (response.status === 401) {
        throw new Error('SESSION_EXPIRED');
      } else if (response.status === 403) {
        throw new Error('PERMISSION_DENIED');
      } else if (response.status === 404) {
        throw new Error('RESOURCE_NOT_FOUND');
      } else if (response.status === 500) {
        throw new Error('SERVER_ERROR');
      }
      
      throw new Error(`API_ERROR_${response.status}: ${JSON.stringify(errorData)}`);
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
    
    throw error;
  }
};