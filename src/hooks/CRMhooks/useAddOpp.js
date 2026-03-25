// hooks/CRMhooks/useAddOpp.js
import { useQuery } from 'react-query';
import { useAuthStore } from '../../store/authStore';

const makeAuthenticatedRequest = async (endpoint, authState, filter = '') => {
  const { token, serverConfig } = authState;
  if (!token || !serverConfig?.protocol || !serverConfig?.host || !serverConfig?.port) {
    throw new Error('Authentication or server config missing');
  }

  const baseUrl = `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.port}/api/v1`;
  let url = `${baseUrl}/${endpoint}`;
  if (filter) {
    url += `?$filter=${encodeURIComponent(filter)}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.records || [];
};

// ==============================
// Sales Stages
// ==============================
export const useStages = () => {
  const authState = useAuthStore();
  return useQuery({
    queryKey: ['stages'],
    queryFn: () => makeAuthenticatedRequest('models/C_SalesStage', authState),
    staleTime: 1000 * 60 * 10,
    cacheTime: 1000 * 60 * 30,
    retry: 2,
  });
};

// ==============================
// Currencies
// ==============================
export const useCurrencies = () => {
  const authState = useAuthStore();
  return useQuery({
    queryKey: ['currencies'],
    queryFn: () => makeAuthenticatedRequest('models/C_Currency', authState),
    staleTime: 1000 * 60 * 60,
    cacheTime: 1000 * 60 * 60 * 24,
    retry: 2,
  });
};

// ==============================
// Campaigns
// ==============================
export const useCampaigns = () => {
  const authState = useAuthStore();
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: () => makeAuthenticatedRequest('models/C_Campaign', authState),
    staleTime: 1000 * 60 * 10,
    cacheTime: 1000 * 60 * 30,
    retry: 2,
  });
};

// ==============================
// Business Partners
// ==============================
export const useBusinessPartners = () => {
  const authState = useAuthStore();
  return useQuery({
    queryKey: ['businessPartners'],
    queryFn: () => makeAuthenticatedRequest('models/C_BPartner', authState),
    staleTime: 1000 * 60 * 10,
    cacheTime: 1000 * 60 * 30,
    retry: 2,
  });
};

// ==============================
// Contacts (Users) for a specific Business Partner
// ==============================
export const useBPContacts = (bpId) => {
  const authState = useAuthStore();
  return useQuery({
    queryKey: ['bpContacts', bpId],
    queryFn: () => {
      if (!bpId) return [];
      return makeAuthenticatedRequest('models/AD_User', authState, `C_BPartner_ID eq ${bpId}`);
    },
    enabled: !!bpId,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    retry: 1,
  });
};