import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getBaseURL = async () => {
  const protocol = await AsyncStorage.getItem('protocol');
  const host = await AsyncStorage.getItem('host');
  const port = await AsyncStorage.getItem('port');
  return `${protocol}://${host}:${port}`;
};

export const fetchMyRequests = async () => {
  const token = await AsyncStorage.getItem('token');
  const userId = Number(await AsyncStorage.getItem('userId'));
  const baseURL = await getBaseURL();

  const res = await axios.get(`${baseURL}/api/v1/models/R_Request`, {
    headers: {Authorization: `Bearer ${token}`},
  });

  return res.data.records.filter(r => r?.SalesRep_ID?.id === userId);
};

// export const fetchMyProjects = async () => {
//   const token = await AsyncStorage.getItem('token');
//   const userId = Number(await AsyncStorage.getItem('userId'));
//   const baseURL = await getBaseURL();

//   const res = await axios.get(`${baseURL}/api/v1/models/C_Project`, {
//     headers: {Authorization: `Bearer ${token}`},
//   });

//   return res.data.records
//     .filter(p => p?.CreatedBy?.id === userId)
//     .map(p => ({
//       id: p.id,
//       uid: p.uid,
//       name: p.Name,
//     }));
// };

export const fetchMyProjects = async () => {
  const token = await AsyncStorage.getItem('token');
  const userId = Number(await AsyncStorage.getItem('userId'));
  const baseURL = await getBaseURL();

  // Step 1: Fetch all requests/tasks
  const requestsRes = await axios.get(`${baseURL}/api/v1/models/R_Request`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const userRequests = requestsRes.data.records.filter(
    r => r?.AD_User_ID?.id === userId
  );

  // Step 2: Extract unique project IDs from the user's requests
  const projectMap = {};
  userRequests.forEach(r => {
    if (r?.C_Project_ID?.id) {
      projectMap[r.C_Project_ID.id] = {
        id: r.C_Project_ID.id,
        uid: r.C_Project_ID.uid,
        name: r.C_Project_ID.identifier, // or r.C_Project_ID.name if available
      };
    }
  });

  // Step 3: Return unique projects
  return Object.values(projectMap);
};


// Fetch updates for a task
export const fetchTaskUpdates = async taskId => {
  const token = await AsyncStorage.getItem('token');
  const userId = await AsyncStorage.getItem('userId');
  const baseURL = await getBaseURL();

  const res = await axios.get(
    `${baseURL}/api/v1/models/R_RequestUpdate?filter=[["R_Request_ID.id","=",${taskId}],"and",["CreatedBy.id","=",${userId}]]`,
    {headers: {Authorization: `Bearer ${token}`}},
  );

  return res.data.records || [];
};

// Fetch standard responses
export const fetchStandardResponses = async () => {
  const token = await AsyncStorage.getItem('token');
  const baseURL = await getBaseURL();

  const res = await axios.get(`${baseURL}/api/v1/models/R_StandardResponse`, {
    headers: {Authorization: `Bearer ${token}`},
  });

  return res.data.records || [];
};

// Send task message
export const sendTaskMessage = async ({taskId, message}) => {
  const token = await AsyncStorage.getItem('token');
  const baseURL = await getBaseURL();

  const res = await axios.post(
    `${baseURL}/api/v1/models/R_RequestUpdate`,
    {
      R_Request_ID: {id: taskId},
      Result: message,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

  return res.data;
};
// Update Task
export const updateTask = async ({taskId, payload}) => {
  const token = await AsyncStorage.getItem('token');
  const baseURL = await getBaseURL();

  const res = await axios.put(
    `${baseURL}/api/v1/models/R_Request/${taskId}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

  return res.data;
};

export const fetchTaskById = async taskId => {
  const token = await AsyncStorage.getItem('token');
  const baseURL = await getBaseURL();

  const res = await axios.get(`${baseURL}/api/v1/models/R_Request/${taskId}`, {
    headers: {Authorization: `Bearer ${token}`},
  });

  return res.data;
};

// FETCH BPatner 
export const fetchBPartner = async () => {
  const token = await AsyncStorage.getItem('token');
  const baseURL = await getBaseURL();

  const res = await axios.get(`${baseURL}/api/v1/models/C_BPartner`, {
    headers: {Authorization: `Bearer ${token}`},
  });

  return res.data.records || [];
};

// FETCH user 
export const fetchUsers = async () => {
  const token = await AsyncStorage.getItem('token');
  const baseURL = await getBaseURL();

  const res = await axios.get(`${baseURL}/api/v1/models/AD_User`, {
    headers: {Authorization: `Bearer ${token}`},
  });

  return res.data.records || [];
};

// FETCH user 
export const fetchProjects = async () => {
  const token = await AsyncStorage.getItem('token');
  const baseURL = await getBaseURL();

  const res = await axios.get(`${baseURL}/api/v1/models/C_Project`, {
    headers: {Authorization: `Bearer ${token}`},
  });

  return res.data.records || [];

};

// FETCH Assets 
export const fetchAssets = async () => {
  const token = await AsyncStorage.getItem('token');
  const baseURL = await getBaseURL();

  const res = await axios.get(`${baseURL}/api/v1/models/A_Asset`, {
    headers: {Authorization: `Bearer ${token}`},
  });

  return res.data.records || [];
};

// FETCH Campaigns
export const fetchCampaigns = async () => {
  const token = await AsyncStorage.getItem('token');
  const baseURL = await getBaseURL();

  const res = await axios.get(`${baseURL}/api/v1/models/C_Campaign`, {
    headers: {Authorization: `Bearer ${token}`},
  });

  return res.data.records || [];
};

// FETCH RMA
export const fetchRMA = async () => {
  const token = await AsyncStorage.getItem('token');
  const baseURL = await getBaseURL();

  const res = await axios.get(`${baseURL}/api/v1/models/M_RMA`, {
    headers: {Authorization: `Bearer ${token}`},
  });

  return res.data.records || [];
};