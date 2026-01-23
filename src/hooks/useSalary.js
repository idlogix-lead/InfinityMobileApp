// src/hooks/salaryHooks.js
import { useQuery } from 'react-query';
import { useAuthStore } from '../store/authStore';
import salaryApi from '../services/EmployeePortal/SalaryApi';

export const useSalarySlips = (enabled = true) => {
  const token = useAuthStore(state => state.token);
  const userId = useAuthStore(state => state.userId);
  
  return useQuery({
    queryKey: ['salarySlips', userId],
    queryFn: async () => {
      const records = await salaryApi.getSalarySlips(token, userId);
      return salaryApi.processSalaryData(records);
    },
    enabled: enabled && !!token && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    onError: (error) => {
      console.error('Error fetching salary slips:', error);
    },
  });
};