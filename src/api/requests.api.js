// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const getBaseURL = async () => {
//   const protocol = await AsyncStorage.getItem('protocol');
//   const host = await AsyncStorage.getItem('host');
//   const port = await AsyncStorage.getItem('port');
//   return `${protocol}://${host}:${port}`;
// };

// export const fetchMyRequests = async () => {
//   const token = await AsyncStorage.getItem('token');
//   const userId = Number(await AsyncStorage.getItem('userId'));
//   const baseURL = await getBaseURL();

//   const res = await axios.get(`${baseURL}/api/v1/models/R_Request`, {
//     headers: {Authorization: `Bearer ${token}`},
//   });

//   return res.data.records.filter(r => r?.SalesRep_ID?.id === userId);
// };
// export const fetchMyProjects = async () => {
//   const token = await AsyncStorage.getItem('token');
//   const userId = Number(await AsyncStorage.getItem('userId'));
//   const baseURL = await getBaseURL();

//   // Step 1: Fetch all requests/tasks
//   const requestsRes = await axios.get(`${baseURL}/api/v1/models/R_Request`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });

//   const userRequests = requestsRes.data.records.filter(
//     r => r?.AD_User_ID?.id === userId
//   );

//   // Step 2: Extract unique project IDs from the user's requests
//   const projectMap = {};
//   userRequests.forEach(r => {
//     if (r?.C_Project_ID?.id) {
//       projectMap[r.C_Project_ID.id] = {
//         id: r.C_Project_ID.id,
//         uid: r.C_Project_ID.uid,
//         name: r.C_Project_ID.identifier, // or r.C_Project_ID.name if available
//       };
//     }
//   });

//   // Step 3: Return unique projects
//   return Object.values(projectMap);
// };

// // Fetch updates for a task
// export const fetchTaskUpdates = async taskId => {
//   const token = await AsyncStorage.getItem('token');
//   const userId = await AsyncStorage.getItem('userId');
//   const baseURL = await getBaseURL();

//   const res = await axios.get(
//     `${baseURL}/api/v1/models/R_RequestUpdate?filter=[["R_Request_ID.id","=",${taskId}],"and",["CreatedBy.id","=",${userId}]]`,
//     {headers: {Authorization: `Bearer ${token}`}},
//   );

//   return res.data.records || [];
// };

// // Fetch standard responses
// export const fetchStandardResponses = async () => {
//   const token = await AsyncStorage.getItem('token');
//   const baseURL = await getBaseURL();

//   const res = await axios.get(`${baseURL}/api/v1/models/R_StandardResponse`, {
//     headers: {Authorization: `Bearer ${token}`},
//   });

//   return res.data.records || [];
// };

// // Send task message
// export const sendTaskMessage = async ({taskId, message}) => {
//   const token = await AsyncStorage.getItem('token');
//   const baseURL = await getBaseURL();

//   const res = await axios.post(
//     `${baseURL}/api/v1/models/R_RequestUpdate`,
//     {
//       R_Request_ID: {id: taskId},
//       Result: message,
//     },
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     },
//   );

//   return res.data;
// };
// // Update Task
// export const updateTask = async ({taskId, payload}) => {
//   const token = await AsyncStorage.getItem('token');
//   const baseURL = await getBaseURL();

//   const res = await axios.put(
//     `${baseURL}/api/v1/models/R_Request/${taskId}`,
//     payload,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     },
//   );

//   return res.data;
// };

// export const fetchTaskById = async taskId => {
//   const token = await AsyncStorage.getItem('token');
//   const baseURL = await getBaseURL();

//   const res = await axios.get(`${baseURL}/api/v1/models/R_Request/${taskId}`, {
//     headers: {Authorization: `Bearer ${token}`},
//   });

//   return res.data;
// };

// // FETCH BPatner
// export const fetchBPartner = async () => {
//   const token = await AsyncStorage.getItem('token');
//   const baseURL = await getBaseURL();

//   const res = await axios.get(`${baseURL}/api/v1/models/C_BPartner`, {
//     headers: {Authorization: `Bearer ${token}`},
//   });

//   return res.data.records || [];
// };

// // FETCH user
// export const fetchUsers = async () => {
//   const token = await AsyncStorage.getItem('token');
//   const baseURL = await getBaseURL();

//   const res = await axios.get(`${baseURL}/api/v1/models/AD_User`, {
//     headers: {Authorization: `Bearer ${token}`},
//   });

//   return res.data.records || [];
// };

// // FETCH user
// export const fetchProjects = async () => {
//   const token = await AsyncStorage.getItem('token');
//   const baseURL = await getBaseURL();

//   const res = await axios.get(`${baseURL}/api/v1/models/C_Project`, {
//     headers: {Authorization: `Bearer ${token}`},
//   });

//   return res.data.records || [];

// };

// // FETCH Assets
// export const fetchAssets = async () => {
//   const token = await AsyncStorage.getItem('token');
//   const baseURL = await getBaseURL();

//   const res = await axios.get(`${baseURL}/api/v1/models/A_Asset`, {
//     headers: {Authorization: `Bearer ${token}`},
//   });

//   return res.data.records || [];
// };

// // FETCH Campaigns
// export const fetchCampaigns = async () => {
//   const token = await AsyncStorage.getItem('token');
//   const baseURL = await getBaseURL();

//   const res = await axios.get(`${baseURL}/api/v1/models/C_Campaign`, {
//     headers: {Authorization: `Bearer ${token}`},
//   });

//   return res.data.records || [];
// };

// // FETCH RMA
// export const fetchRMA = async () => {
//   const token = await AsyncStorage.getItem('token');
//   const baseURL = await getBaseURL();

//   const res = await axios.get(`${baseURL}/api/v1/models/M_RMA`, {
//     headers: {Authorization: `Bearer ${token}`},
//   });

//   return res.data.records || [];
// };

// services/CRMAPI/requests.api.js
import axios from 'axios';

// ============================================
// AUTH STORE HELPER (No AsyncStorage)
// ============================================
let authStore = null;

const getAuthStore = () => {
  if (authStore) return authStore;

  try {
    authStore = require('../store/authStore');
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
  const store = require('../store/authStore');
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
    const store = require('../store/authStore');
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
    const store = require('../store/authStore');
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

// Fetch My Requests
export const fetchMyRequests = async () => {
  const {userId} = getAuthState();
  const baseURL = getBaseURL();

  const res = await makeRequest(`${baseURL}/models/R_Request`);
  return res.records.filter(r => r?.SalesRep_ID?.id === Number(userId));
};

// Fetch My Projects
export const fetchMyProjects = async () => {
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
};

// Fetch Task Updates
export const fetchTaskUpdates = async taskId => {
  const {userId} = getAuthState();
  const baseURL = getBaseURL();

  const res = await makeRequest(
    `${baseURL}/models/R_RequestUpdate?filter=[["R_Request_ID.id","=",${taskId}],"and",["CreatedBy.id","=",${userId}]]`,
  );

  return res.records || [];
};

// Fetch Standard Responses
export const fetchStandardResponses = async () => {
  const baseURL = getBaseURL();
  const res = await makeRequest(`${baseURL}/models/R_StandardResponse`);
  return res.records || [];
};

// Send Task Message
export const sendTaskMessage = async ({taskId, message}) => {
  const baseURL = getBaseURL();
  return await makeRequest(`${baseURL}/models/R_RequestUpdate`, {
    method: 'POST',
    body: {
      R_Request_ID: {id: taskId},
      Result: message,
    },
  });
};

// Update Task
export const updateTask = async ({taskId, payload}) => {
  const baseURL = getBaseURL();
  return await makeRequest(`${baseURL}/models/R_Request/${taskId}`, {
    method: 'PUT',
    body: payload,
  });
};

// Fetch Task by ID
export const fetchTaskById = async taskId => {
  const baseURL = getBaseURL();
  return await makeRequest(`${baseURL}/models/R_Request/${taskId}`);
};

// Fetch BPartner
export const fetchBPartner = async () => {
  const baseURL = getBaseURL();
  const res = await makeRequest(`${baseURL}/models/C_BPartner`);
  return res.records || [];
};

// Fetch Users
export const fetchUsers = async () => {
  const baseURL = getBaseURL();
  const res = await makeRequest(`${baseURL}/models/AD_User`);
  return res.records || [];
};

// Fetch Projects
export const fetchProjects = async () => {
  const baseURL = getBaseURL();
  const res = await makeRequest(`${baseURL}/models/C_Project`);
  return res.records || [];
};

// Fetch Assets
export const fetchAssets = async () => {
  const baseURL = getBaseURL();
  const res = await makeRequest(`${baseURL}/models/A_Asset`);
  return res.records || [];
};

// Fetch Campaigns
export const fetchCampaigns = async () => {
  const baseURL = getBaseURL();
  const res = await makeRequest(`${baseURL}/models/C_Campaign`);
  return res.records || [];
};

// Fetch RMA
export const fetchRMA = async () => {
  const baseURL = getBaseURL();
  const res = await makeRequest(`${baseURL}/models/M_RMA`);
  return res.records || [];
};

// Fetch Request Type, Category, Group, Project for create a request
export const fetchRequestTyp = async () => {
  const baseURL = getBaseURL();
  const res = await makeRequest(`${baseURL}/models/R_RequestType`);
  return res.records || [];
};
export const fetchRequestCat = async () => {
  const baseURL = getBaseURL();
  const res = await makeRequest(`${baseURL}/models/R_Category`);
  return res.records || [];
};
export const fetchRequestGrp = async () => {
  const baseURL = getBaseURL();
  const res = await makeRequest(`${baseURL}/models/R_Group`);
  return res.records || [];
};
export const fetchRequestpro = async () => {
  const baseURL = getBaseURL();
  const res = await makeRequest(`${baseURL}/models/C_Project`);
  return res.records || [];
};

export const createTask = async payload => {
  const baseURL = getBaseURL();
  const res = await makeAddRequest(`${baseURL}/models/R_Request`, {
    method: 'POST',
    body: payload,
  });
  return res;
};