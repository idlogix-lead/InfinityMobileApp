// services/CRMAPI/requests.api.js
import axios from 'axios';

// ============================================
// AUTH STORE HELPER
// ============================================
let authStore = null;

const getAuthStore = () => {
  if (authStore) return authStore;

  try {
    authStore = require('../../store/authStore');
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
// RELOGIN QUEUE SYSTEM (NEW)
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
// JWT DECODER (NEW)
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
// TOKEN VALIDATION (NEW)
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
// BASE URL HELPER
// ============================================
const getBaseURL = () => {
  const store = require('../../store/authStore');
  const {serverConfig} = store.useAuthStore.getState();

  if (!serverConfig?.protocol || !serverConfig?.host || !serverConfig?.port) {
    console.error('SERVER_CONFIG_MISSING', serverConfig);
    throw new Error('SERVER_CONFIG_MISSING');
  }

  return `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.port}/api/v1`;
};

// ============================================
// ENHANCED API HELPER WITH AUTO-RELOGIN
// ============================================
const makeRequest = async (url, options = {}) => {
  let authState;
  try {
    const store = require('../../store/authStore');
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
    console.log('⚠️ [Requests API] Token expired, checking relogin status...');
    
    if (isReloginning) {
      console.log('⏳ [Requests API] Relogin in progress, queueing request...');
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });
    }
    
    isReloginning = true;
    
    try {
      console.log('🔄 [Requests API] Starting complete login auto-relogin...');
      const newToken = await authState.completeRelogin?.();
      
      if (newToken) {
        console.log('✅ [Requests API] Complete login relogin successful, processing queue...');
        token = newToken;
        processQueue(null, newToken);
      } else {
        console.log('❌ [Requests API] Complete login relogin failed');
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
    console.log(`🌐 [Requests API] Making request to: ${url}`);
    
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
      console.log('🔐 [Requests API] Got 401, checking if we should relogin...');
      
      if (options._retry) {
        console.log('❌ [Requests API] Already tried relogin, giving up');
        throw new Error('SESSION_EXPIRED');
      }
      
      if (isReloginning) {
        console.log('⏳ [Requests API] Relogin in progress, queueing request...');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
      }
      
      isReloginning = true;
      
      try {
        console.log('🔄 [Requests API] Attempting complete login relogin due to 401...');
        const newToken = await authState.completeRelogin?.();
        
        if (newToken) {
          console.log('✅ [Requests API] Complete login relogin successful, retrying request...');
          processQueue(null, newToken);
          
          return makeRequest(url, {
            ...options,
            _retry: true,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${newToken}`,
            },
          });
        } else {
          console.log('❌ [Requests API] Complete login relogin failed');
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
    
    console.error('❌ [Requests API] Request failed:', {
      url,
      status: error.response?.status,
      message: error.message
    });
    
    throw error;
  }
};

// ============================================
// SIMPLIFIED makeAddRequest (can use makeRequest)
// ============================================
const makeAddRequest = async (url, options = {}) => {
  return makeRequest(url, { ...options, method: options.method || 'POST' });
};

// ============================================
// API FUNCTIONS (UPDATED with error handling)
// ============================================

// Fetch My Requests
export const fetchMyRequests = async () => {
  try {
    const {userId} = getAuthState();
    const baseURL = getBaseURL();

    const res = await makeRequest(`${baseURL}/models/R_Request`);
    return res.records.filter(r => r?.SalesRep_ID?.id === Number(userId));
  } catch (error) {
    console.error('fetchMyRequests error:', error.message);
    if (error.message === 'SESSION_EXPIRED') throw error;
    return [];
  }
};

// Fetch My Projects
export const fetchMyProjects = async () => {
  try {
    const {userId} = getAuthState();
    const baseURL = getBaseURL();

    const requestsRes = await makeRequest(`${baseURL}/models/R_Request`);
    const userRequests = requestsRes.records.filter(
      r => r?.AD_User_ID?.id === Number(userId),
    );

    const projectMap = {};
    userRequests.forEach(r => {
      if (r?.C_Project_ID?.id) {
        projectMap[r.C_Project_ID.id] = {
          id: r.C_Project_ID.id,
          uid: r.C_Project_ID.uid,
          name: r.C_Project_ID.identifier,
        };
      }
    });

    return Object.values(projectMap);
  } catch (error) {
    console.error('fetchMyProjects error:', error.message);
    if (error.message === 'SESSION_EXPIRED') throw error;
    return [];
  }
};

// Fetch Task Updates
export const fetchTaskUpdates = async taskId => {
  try {
    const baseURL = getBaseURL();
    const res = await makeRequest(
      `${baseURL}/models/R_RequestUpdate?$filter=R_Request_ID eq ${taskId}`,
    );
    return res.records || [];
  } catch (error) {
    console.error('fetchTaskUpdates error:', error.message);
    if (error.message === 'SESSION_EXPIRED') throw error;
    return [];
  }
};

// Fetch My Comments
export const fetchMyComments = async userName => {
  try {
    const baseURL = getBaseURL();
    const res = await makeRequest(
      `${baseURL}/models/R_RequestUpdate?$filter=contains(tolower(Result),'@${userName.toLowerCase()}')`,
    );
    return res.records || [];
  } catch (error) {
    console.error('fetchMyComments error:', error.message);
    if (error.message === 'SESSION_EXPIRED') throw error;
    return [];
  }
};

// Fetch Standard Responses
export const fetchStandardResponses = async () => {
  try {
    const baseURL = getBaseURL();
    const res = await makeRequest(`${baseURL}/models/R_StandardResponse`);
    return res.records || [];
  } catch (error) {
    console.error('fetchStandardResponses error:', error.message);
    if (error.message === 'SESSION_EXPIRED') throw error;
    return [];
  }
};

// Send Task Message
export const sendTaskMessage = async ({taskId, message}) => {
  try {
    const baseURL = getBaseURL();
    return await makeRequest(`${baseURL}/models/R_RequestUpdate`, {
      method: 'POST',
      body: {
        R_Request_ID: {id: taskId},
        Result: message,
      },
    });
  } catch (error) {
    console.error('sendTaskMessage error:', error.message);
    throw error;
  }
};

// Update Task
export const updateTask = async ({taskId, payload}) => {
  try {
    const baseURL = getBaseURL();
    return await makeRequest(`${baseURL}/models/R_Request/${taskId}`, {
      method: 'PUT',
      body: payload,
    });
  } catch (error) {
    console.error('updateTask error:', error.message);
    throw error;
  }
};

// Fetch Task by ID
export const fetchTaskById = async taskId => {
  try {
    const baseURL = getBaseURL();
    return await makeRequest(`${baseURL}/models/R_Request/${taskId}`);
  } catch (error) {
    console.error('fetchTaskById error:', error.message);
    throw error;
  }
};

// Fetch BPartner
export const fetchBPartner = async () => {
  try {
    const baseURL = getBaseURL();
    const res = await makeRequest(`${baseURL}/models/C_BPartner`);
    return res.records || [];
  } catch (error) {
    console.error('fetchBPartner error:', error.message);
    if (error.message === 'SESSION_EXPIRED') throw error;
    return [];
  }
};

// Fetch Users
export const fetchUsers = async () => {
  try {
    const baseURL = getBaseURL();
    const res = await makeRequest(`${baseURL}/models/AD_User`);
    return res.records || [];
  } catch (error) {
    console.error('fetchUsers error:', error.message);
    if (error.message === 'SESSION_EXPIRED') throw error;
    return [];
  }
};

// Fetch Projects
export const fetchProjects = async () => {
  try {
    const baseURL = getBaseURL();
    const res = await makeRequest(`${baseURL}/models/C_Project`);
    return res.records || [];
  } catch (error) {
    console.error('fetchProjects error:', error.message);
    if (error.message === 'SESSION_EXPIRED') throw error;
    return [];
  }
};

// Fetch Assets
export const fetchAssets = async () => {
  try {
    const baseURL = getBaseURL();
    const res = await makeRequest(`${baseURL}/models/A_Asset`);
    return res.records || [];
  } catch (error) {
    console.error('fetchAssets error:', error.message);
    if (error.message === 'SESSION_EXPIRED') throw error;
    return [];
  }
};

// Fetch Campaigns
export const fetchCampaigns = async () => {
  try {
    const baseURL = getBaseURL();
    const res = await makeRequest(`${baseURL}/models/C_Campaign`);
    return res.records || [];
  } catch (error) {
    console.error('fetchCampaigns error:', error.message);
    if (error.message === 'SESSION_EXPIRED') throw error;
    return [];
  }
};

// Fetch RMA
export const fetchRMA = async () => {
  try {
    const baseURL = getBaseURL();
    const res = await makeRequest(`${baseURL}/models/M_RMA`);
    return res.records || [];
  } catch (error) {
    console.error('fetchRMA error:', error.message);
    if (error.message === 'SESSION_EXPIRED') throw error;
    return [];
  }
};

// Fetch Request Type
export const fetchRequestTyp = async () => {
  try {
    const baseURL = getBaseURL();
    const res = await makeRequest(`${baseURL}/models/R_RequestType`);
    return res.records || [];
  } catch (error) {
    console.error('fetchRequestTyp error:', error.message);
    if (error.message === 'SESSION_EXPIRED') throw error;
    return [];
  }
};

// Fetch Request Category
export const fetchRequestCat = async () => {
  try {
    const baseURL = getBaseURL();
    const res = await makeRequest(`${baseURL}/models/R_Category`);
    return res.records || [];
  } catch (error) {
    console.error('fetchRequestCat error:', error.message);
    if (error.message === 'SESSION_EXPIRED') throw error;
    return [];
  }
};

// Fetch Request Group
export const fetchRequestGrp = async () => {
  try {
    const baseURL = getBaseURL();
    const res = await makeRequest(`${baseURL}/models/R_Group`);
    return res.records || [];
  } catch (error) {
    console.error('fetchRequestGrp error:', error.message);
    if (error.message === 'SESSION_EXPIRED') throw error;
    return [];
  }
};

// Fetch Request Project
export const fetchRequestpro = async () => {
  try {
    const baseURL = getBaseURL();
    const res = await makeRequest(`${baseURL}/models/C_Project`);
    return res.records || [];
  } catch (error) {
    console.error('fetchRequestpro error:', error.message);
    if (error.message === 'SESSION_EXPIRED') throw error;
    return [];
  }
};

// Create Task
export const createTask = async payload => {
  try {
    const baseURL = getBaseURL();
    const res = await makeRequest(`${baseURL}/models/R_Request`, {
      method: 'POST',
      body: payload,
    });
    return res;
  } catch (error) {
    console.error('createTask error:', error.message);
    throw error;
  }
};

// Fetch Request Status
export const fetchReqStatus = async () => {
  try {
    const baseURL = getBaseURL();
    const res = await makeRequest(`${baseURL}/models/R_Status`);
    return res.records || [];
  } catch (error) {
    console.error('fetchReqStatus error:', error.message);
    if (error.message === 'SESSION_EXPIRED') throw error;
    return [];
  }
};

// ============================================
// EXPORT QUEUE STATUS FOR DEBUGGING
// ============================================
export const getQueueStatus = () => ({
  isReloginning,
  queueLength: failedQueue.length
});