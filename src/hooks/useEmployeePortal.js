// src/hooks/employeeHooks.js
import { useQuery, useQueryClient } from 'react-query';
import { useAuthStore } from '../store/authStore';
import employeeApi from '../services/EmployeePortal/employeePortalApi';

// Hook to get user info with partner ID
export const useUserInfo = (enabled = true) => {
  const token = useAuthStore(state => state.token);
  const userId = useAuthStore(state => state.userId);
  
  return useQuery({
    queryKey: ['userInfo', userId],
    queryFn: () => employeeApi.getUserInfo(token, userId),
    enabled: enabled && !!token && !!userId,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
};

// Hook to get leave requests
export const useLeaveRequests = (partnerId, filters = {}, enabled = true) => {
  const token = useAuthStore(state => state.token);
  
  return useQuery({
    queryKey: ['leaveRequests', partnerId, filters],
    queryFn: () => employeeApi.getLeaveRequests(token, partnerId, filters),
    enabled: enabled && !!token && !!partnerId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

// Hook to get today's attendance
export const useTodayAttendance = (partnerId, enabled = true) => {
  return useQuery({
    queryKey: ['todayAttendance', partnerId],
    queryFn: () => employeeApi.getTodayAttendance(),
    enabled: enabled && !!partnerId,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5,
    refetchIntervalInBackground: true,
    retry: 1,
  });
};

// Hook to get leave balance
export const useLeaveBalance = (partnerId, enabled = true) => {
  return useQuery({
    queryKey: ['leaveBalance', partnerId],
    queryFn: () => employeeApi.getLeaveBalance(),
    enabled: enabled && !!partnerId,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
};

// Hook to get activities
export const useActivities = (partnerId, enabled = true) => {
  return useQuery({
    queryKey: ['activities', partnerId],
    queryFn: () => employeeApi.getActivities(),
    enabled: enabled && !!partnerId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

// Hook to refresh employee data
export const useRefreshEmployeeData = () => {
  const queryClient = useQueryClient();
  
  const refreshAll = async () => {
    console.log('Refreshing all employee data...');
    
    await queryClient.invalidateQueries({
      predicate: (query) => 
        query.queryKey[0] === 'userInfo' ||
        query.queryKey[0] === 'leaveRequests' ||
        query.queryKey[0] === 'todayAttendance' ||
        query.queryKey[0] === 'leaveBalance' ||
        query.queryKey[0] === 'activities'
    });
    
    console.log('Employee data refreshed successfully');
  };
  
  return { refreshAll };
};