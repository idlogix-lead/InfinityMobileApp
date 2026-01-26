import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getToken = async () => await AsyncStorage.getItem('token');
const getBaseURL = () => 'http://116.58.53.114:9999/api/v1/models';

const fetchAPI = async model => {
  const token = await getToken();
  const res = await axios.get(`${getBaseURL()}/${model}`, {
    headers: {Authorization: `Bearer ${token}`},
  });
  return res.data.records || [];
};

export const fetchRequestTypes = () => fetchAPI('R_RequestType');
export const fetchCategories = () => fetchAPI('R_Category');
export const fetchGroups = () => fetchAPI('R_Group');
export const fetchProjects = () => fetchAPI('C_Project');
export const fetchSalesUsers = () => fetchAPI('AD_User');

export const createTask = async payload => {
  const token = await getToken();
  return axios.post(`${getBaseURL()}/R_Request`, payload, {
    headers: {Authorization: `Bearer ${token}`},
  });
};