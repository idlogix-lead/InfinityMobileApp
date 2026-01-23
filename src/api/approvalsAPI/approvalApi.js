import axios from 'axios';

// ============================================
// AUTH STORE HELPER (No AsyncStorage)
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
// API HELPER
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

  const {token} = authState;
  if (!token) throw new Error('AUTH_TOKEN_MISSING');

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
};

const makeAddRequest = async (url, options = {}) => {
  let authState;
  try {
    const store = require('../../store/authStore');
    authState = store.useAuthStore.getState();
  } catch (e) {
    console.error('Failed to get auth state:', e);
    throw new Error('AUTH_STORE_ERROR');
  }

  const {token} = authState;
  if (!token) throw new Error('AUTH_TOKEN_MISSING');

  const res = await axios({
    url,
    method: options.method || 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    data: options.body,
  });

  return res.data;
};

// ============================================
// API FUNCTIONS
// ============================================

// Fetch My approvlas activities

export const fetchWFAct = async () => {
  const baseURL = getBaseURL();
  const res = await makeRequest(`${baseURL}/models/mbl_workflow_v`);
  return res.records || [];
};

export const fetchPayment = async () => {
  const baseURL = getBaseURL();
  const res = await makeRequest(`${baseURL}/models/C_Payment`);
  return res.records || [];
};

// export const fetchWFAct = async () => {
//   const baseURL = getBaseURL();

//   // ✅ authStore se state lo
//   const authState = getAuthState();
//   const {userId} = authState;

//   if (!userId) {
//     throw new Error('USER_ID_MISSING');
//   }

//   const res = await makeRequest(
//     `${baseURL}/models/ad_wf_activity?$filter=CreatedBy eq ${userId}`,
//   );

//   return res.records || [];
// };

// Fetch workflow activities (with filter support)
// export const fetchWFAct = async (filter = '') => {
//   const baseURL = getBaseURL();

//   const encodedFilter = filter ? encodeURIComponent(filter) : '';

//   const url = encodedFilter
//     ? `${baseURL}/models/ad_wf_activity?$filter=${encodedFilter}`
//     : `${baseURL}/models/ad_wf_activity`;

//   const res = await makeRequest(url);
//   return res.records || [];
// };
