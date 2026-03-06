import axios from 'axios';

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
// BASE URL HELPER
// ============================================
const getBaseURL = () => {
  const store = require('../../../store/authStore');
  const {serverConfig} = store.useAuthStore.getState();

  if (!serverConfig?.protocol || !serverConfig?.host || !serverConfig?.port) {
    console.error('SERVER_CONFIG_MISSING', serverConfig);
    throw new Error('SERVER_CONFIG_MISSING');
  }

  return `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.port}/api/v1`;
};

// ============================================
// HELPER TO CHECK IF COMPLETE LOGIN PARAMETERS ARE READY
// ============================================
const areLoginParametersReady = (authState) => {
  const params = authState.loginParameters;
  return !!(params?.clientId && params?.roleId && params?.organizationId && params?.warehouseId);
};

// ============================================
// WAIT FOR COMPLETE LOGIN PARAMETERS
// ============================================
const waitForLoginParameters = async (timeout = 3000) => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const store = require('../../../store/authStore');
    const currentState = store.useAuthStore.getState();
    
    if (areLoginParametersReady(currentState)) {
      console.log('✅ [Approval API] Login parameters are now ready');
      return currentState;
    }
    
    // Wait 100ms before checking again
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('❌ [Approval API] Timeout waiting for login parameters');
  return null;
};

// ============================================
// UPDATED API HELPER WITH COMPLETE LOGIN AUTO-RELOGIN
// ============================================
const makeRequest = async (url, options = {}) => {
  let authState;
  try {
    const store = require('../../../store/authStore');
    authState = store.useAuthStore.getState();
  } catch (e) {
    console.error('Failed to get auth state:', e);
    throw new Error('AUTH_STORE_ERROR');
  }

  let {token} = authState;
  if (!token) throw new Error('AUTH_TOKEN_MISSING');

  // Validate token before making request
  const validation = validateToken(token);
  
  // If token is expired, trigger complete relogin
  if (!validation.isValid && validation.reason === 'EXPIRED') {
    console.log('⚠️ [Approval API] Token expired, checking relogin status...');
    
    // If already reloginning, queue this request
    if (isReloginning) {
      console.log('⏳ [Approval API] Relogin in progress, queueing request...');
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });
    }
    
    // Start relogin process
    isReloginning = true;
    
    try {
      console.log('🔄 [Approval API] Starting complete login auto-relogin...');
      
      // FIX: Wait for login parameters if needed
      if (!areLoginParametersReady(authState)) {
        console.log('⏳ [Approval API] Login parameters not ready, waiting...');
        const readyState = await waitForLoginParameters();
        if (readyState) {
          authState = readyState;
        } else {
          console.log('❌ [Approval API] Login parameters never became ready');
          processQueue(new Error('COMPLETE_RELOGIN_FAILED'));
          throw new Error('SESSION_EXPIRED');
        }
      }
      
      const newToken = await authState.completeRelogin?.();
      
      if (newToken) {
        console.log('✅ [Approval API] Complete login relogin successful, processing queue...');
        token = newToken;
        processQueue(null, newToken);
      } else {
        console.log('❌ [Approval API] Complete login relogin failed');
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
    console.log(`🌐 [Approval API] Making request to: ${url}`);
    
    const res = await axios({
      url,
      method: options.method || 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      data: options.body,
    });

    return res.data;
  } catch (error) {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.log('🔐 [Approval API] Got 401, checking if we should relogin...');
      
      // If we already tried relogin for this request, don't try again
      if (options._retry) {
        console.log('❌ [Approval API] Already tried relogin, giving up');
        throw new Error('SESSION_EXPIRED');
      }
      
      // If already reloginning, queue this request
      if (isReloginning) {
        console.log('⏳ [Approval API] Relogin in progress, queueing request...');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
      }
      
      // Start relogin
      isReloginning = true;
      
      try {
        console.log('🔄 [Approval API] Attempting complete login relogin due to 401...');
        
        // FIX: Get fresh auth state and wait for parameters if needed
        const freshStore = require('../../../store/authStore');
        let freshAuthState = freshStore.useAuthStore.getState();
        
        if (!areLoginParametersReady(freshAuthState)) {
          console.log('⏳ [Approval API] Login parameters not ready after 401, waiting...');
          const readyState = await waitForLoginParameters();
          if (readyState) {
            freshAuthState = readyState;
          } else {
            console.log('❌ [Approval API] Login parameters never became ready after 401');
            processQueue(new Error('COMPLETE_RELOGIN_FAILED'));
            throw new Error('SESSION_EXPIRED');
          }
        }
        
        const newToken = await freshAuthState.completeRelogin?.();
        
        if (newToken) {
          console.log('✅ [Approval API] Complete login relogin successful, retrying request...');
          processQueue(null, newToken);
          
          // Retry this request with new token
          return makeRequest(url, {
            ...options,
            _retry: true,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${newToken}`,
            },
          });
        } else {
          console.log('❌ [Approval API] Complete login relogin failed');
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
    console.error('❌ [Approval API] Request failed:', {
      url,
      status: error.response?.status,
      message: error.message
    });
    
    throw error;
  }
};

// ============================================
// UPDATED MAKE ADD REQUEST WITH COMPLETE LOGIN AUTO-RELOGIN
// ============================================
const makeAddRequest = async (url, options = {}) => {
  // Reuse makeRequest with POST method
  return makeRequest(url, { ...options, method: options.method || 'POST' });
};

// ============================================
// UPDATED API FUNCTIONS WITH ERROR HANDLING
// ============================================

// Fetch My approvals activities
export const fetchWFAct = async () => {
  try {
    const baseURL = getBaseURL();
    const res = await makeRequest(`${baseURL}/models/mbl_workflow_v`);
    return res.records || [];
  } catch (error) {
    console.error('fetchWFAct error:', error.message);
    
    if (error.message === 'SESSION_EXPIRED') {
      throw error; // Let React Query handle it
    }
    
    // Return empty array for other errors to prevent UI crashes
    return [];
  }
};

// Fetch Payments
export const fetchPayment = async () => {
  try {
    const baseURL = getBaseURL();
    const res = await makeRequest(`${baseURL}/models/C_Payment`);
    return res.records || [];
  } catch (error) {
    console.error('fetchPayment error:', error.message);
    
    if (error.message === 'SESSION_EXPIRED') {
      throw error;
    }
    
    return [];
  }
};

// Optional: Add filter support for workflow activities
export const fetchFilteredWFAct = async (filter = '') => {
  try {
    const baseURL = getBaseURL();
    const encodedFilter = filter ? encodeURIComponent(filter) : '';
    
    const url = encodedFilter
      ? `${baseURL}/models/ad_wf_activity?$filter=${encodedFilter}`
      : `${baseURL}/models/ad_wf_activity`;
    
    const res = await makeRequest(url);
    return res.records || [];
  } catch (error) {
    console.error('fetchFilteredWFAct error:', error.message);
    if (error.message === 'SESSION_EXPIRED') throw error;
    return [];
  }
};

// Export queue status for debugging (optional)
export const getQueueStatus = () => ({
  isReloginning,
  queueLength: failedQueue.length
});