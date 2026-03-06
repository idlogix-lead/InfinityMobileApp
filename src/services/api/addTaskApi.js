import axios from 'axios';

// ============================================
// AUTH STORE HELPER
// ============================================
let authStore = null;

const getAuthStore = () => {
  if (authStore) return authStore;

  try {
    authStore = require('../../../store/authStore');
    return authStore;
  } catch (error) {
    console.error('Failed to load auth store:', error);
    return null;
  }
};

const getAuthState = () => {
  const store = getAuthStore();
  if (!store) return {};
  try {
    return store.useAuthStore.getState();
  } catch (error) {
    console.error('Failed to get auth state:', error);
    return {};
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
// JWT DECODER
// ============================================
const decodeJWT = (token) => {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const base64Str = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64Str.padEnd(base64Str.length + (4 - base64Str.length % 4) % 4, '=');
    
    const decoded = require('base-64').decode(padded);
    return JSON.parse(decoded);
  } catch (error) {
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
// BASE URL HELPER - NO FALLBACK
// ============================================
const getBaseURL = () => {
  const authState = getAuthState();
  const serverConfig = authState.serverConfig;

  if (!serverConfig?.protocol || !serverConfig?.host || !serverConfig?.port) {
    console.error('SERVER_CONFIG_MISSING - Server configuration is required', serverConfig);
    throw new Error('SERVER_CONFIG_MISSING');
  }

  return `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.port}/api/v1`;
};

// ============================================
// ENHANCED FETCH API WITH AUTO-RELOGIN
// ============================================
const fetchAPI = async (model, options = {}) => {
  let authState;
  try {
    authState = getAuthState();
  } catch (e) {
    console.error('Failed to get auth state:', e);
    throw new Error('AUTH_STORE_ERROR');
  }

  let { token } = authState;
  if (!token) throw new Error('AUTH_TOKEN_MISSING');

  // Validate token before making request
  const validation = validateToken(token);
  
  // If token is expired, trigger complete relogin
  if (!validation.isValid && validation.reason === 'EXPIRED') {
    console.log('⚠️ [Request API] Token expired, checking relogin status...');
    
    // If already reloginning, queue this request
    if (isReloginning) {
      console.log('⏳ [Request API] Relogin in progress, queueing request...');
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });
    }
    
    // Start relogin process
    isReloginning = true;
    
    try {
      console.log('🔄 [Request API] Starting complete login auto-relogin...');
      const newToken = await authState.completeRelogin?.();
      
      if (newToken) {
        console.log('✅ [Request API] Complete login relogin successful, processing queue...');
        token = newToken;
        processQueue(null, newToken);
      } else {
        console.log('❌ [Request API] Complete login relogin failed');
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

  try {
    const baseURL = getBaseURL(); // This will throw if server config missing
    const url = `${baseURL}/models/${model}`;
    console.log(`🌐 [Request API] Fetching ${model} from: ${url}`);
    
    const res = await axios({
      url,
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      data: options.body,
    });

    return res.data.records || [];
  } catch (error) {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.log('🔐 [Request API] Got 401, checking if we should relogin...');
      
      // If we already tried relogin for this request, don't try again
      if (options._retry) {
        console.log('❌ [Request API] Already tried relogin, giving up');
        throw new Error('SESSION_EXPIRED');
      }
      
      // If already reloginning, queue this request
      if (isReloginning) {
        console.log('⏳ [Request API] Relogin in progress, queueing request...');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
      }
      
      // Start relogin
      isReloginning = true;
      
      try {
        console.log('🔄 [Request API] Attempting complete login relogin due to 401...');
        const newToken = await authState.completeRelogin?.();
        
        if (newToken) {
          console.log('✅ [Request API] Complete login relogin successful, retrying request...');
          processQueue(null, newToken);
          
          // Retry this request with new token
          return fetchAPI(model, {
            ...options,
            _retry: true,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${newToken}`,
            },
          });
        } else {
          console.log('❌ [Request API] Complete login relogin failed');
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
    
    // Handle other errors
    console.error('❌ [Request API] Request failed:', {
      model,
      status: error.response?.status,
      message: error.message
    });
    
    throw error;
  }
};

// ============================================
// CREATE TASK WITH AUTO-RELOGIN
// ============================================
export const createTask = async (payload) => {
  return fetchAPI('R_Request', {
    method: 'POST',
    body: payload,
  });
};

// ============================================
// EXPORT FETCH FUNCTIONS
// ============================================
export const fetchRequestTypes = () => fetchAPI('R_RequestType');
export const fetchCategories = () => fetchAPI('R_Category');
export const fetchGroups = () => fetchAPI('R_Group');
export const fetchProjects = () => fetchAPI('C_Project');
export const fetchSalesUsers = () => fetchAPI('AD_User');

// Optional: Add fetch with custom options
export const fetchWithOptions = (model, options = {}) => fetchAPI(model, options);

// Export queue status for debugging
export const getQueueStatus = () => ({
  isReloginning,
  queueLength: failedQueue.length
});