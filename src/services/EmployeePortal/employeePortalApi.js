// src/services/employeeApi.js
import apiService from '../authApi';

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

const employeeApi = {
  // ============================================
  // USER INFO - FIXED: Use full URL
  // ============================================
  getUserInfo: async () => {
    try {
      const authState = getAuthState();
      const userId = authState.userId;
      
      if (!userId) {
        console.warn('No userId found in auth state, using default user info');
        return {
          Name: 'Muhammad Anwar',
          Title: { identifier: 'Hr Manager' },
          C_BPartner_ID: { id: '12345' }
        };
      }
      
      // ✅ FIXED: Get base URL first
      const baseUrl = apiService.getBaseUrl();
      const url = `${baseUrl}/models/AD_User?$filter=AD_User_ID eq ${userId}`;
      
      console.log(`🔍 Fetching user info from: ${url}`);
      
      // Use apiService.makeRequest with full URL
      const data = await apiService.makeRequest(url);
      
      return data.records?.[0] || {
        Name: 'Muhammad Anwar',
        Title: { identifier: 'Hr Manager' },
        C_BPartner_ID: { id: '12345' }
      };
    } catch (error) {
      console.error('Get user info error:', error.message);
      
      if (error.message === 'SESSION_EXPIRED') {
        throw error;
      }
      
      return {
        Name: 'Muhammad Anwar',
        Title: { identifier: 'Hr Manager' },
        C_BPartner_ID: { id: '12345' }
      };
    }
  },
  
  // ============================================
  // LEAVE REQUESTS - FIXED: Use full URL
  // ============================================
  getLeaveRequests: async (filters = {}) => {
    try {
      const authState = getAuthState();
      const userId = authState.userId;
      
      if (!userId) {
        console.warn('No userId found in auth state, returning empty leave requests');
        return [];
      }
      
      // First get user info to get C_BPartner_ID
      const userInfo = await employeeApi.getUserInfo();
      const partnerId = userInfo?.C_BPartner_ID?.id;
      
      if (!partnerId) {
        console.warn('No partnerId found for user, returning empty leave requests');
        return [];
      }
      
      const baseUrl = apiService.getBaseUrl();
      
      // Calculate date filters
      let startDate = new Date();
      let endDate = new Date();
      
      if (filters.applyFilter === 'Last 7 Days') {
        startDate.setDate(endDate.getDate() - 7);
      } else if (filters.applyFilter === 'Last month') {
        startDate.setMonth(endDate.getMonth() - 1);
      } else {
        startDate = new Date('2000-01-01');
      }
      
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      let filterString = `C_BPartner_ID eq ${partnerId}`;
      
      if (filters.applyFilter !== 'All' && filters.applyFilter) {
        filterString += ` and startdate ge ${formattedStartDate} and enddate le ${formattedEndDate}`;
      }
      
      // ✅ FIXED: Construct full URL
      const url = `${baseUrl}/models/HR_EmpLev_Posting?$filter=${encodeURIComponent(filterString)}&$orderby=EndDate desc`;
      
      console.log(`🔍 Fetching leave requests from: ${url}`);
      
      const data = await apiService.makeRequest(url);
      
      return data.records || [];
    } catch (error) {
      console.error('Get leave requests error:', error.message);
      
      if (error.message === 'SESSION_EXPIRED') {
        throw error;
      }
      
      return [];
    }
  },
  
  // ============================================
  // TODAY'S ATTENDANCE - Mock data (no changes)
  // ============================================
  getTodayAttendance: async () => {
    try {
      const currentHour = new Date().getHours();
      const currentMinute = new Date().getMinutes();
      
      let checkInTime = '--:--:--';
      let checkOutTime = '--:--:--';
      let status = 'Not Checked In';
      
      if (currentHour >= 9) {
        checkInTime = `09:${currentMinute < 10 ? '0' + currentMinute : currentMinute}:00 am`;
        status = 'Present';
      }
      
      if (currentHour >= 17) {
        checkOutTime = `05:${currentMinute < 10 ? '0' + currentMinute : currentMinute}:00 pm`;
      } else if (currentHour >= 9) {
        status = 'Still Working';
      }
      
      return {
        checkInTime,
        checkOutTime,
        status
      };
    } catch (error) {
      console.error('Get today attendance error:', error.message);
      return {
        checkInTime: '09:05:56 am',
        checkOutTime: '--:--:--',
        status: 'Present'
      };
    }
  },
  
  // ============================================
  // LEAVE BALANCE - Mock data (no changes)
  // ============================================
  getLeaveBalance: async () => {
    try {
      return { 
        balance: 2,
        totalLeaves: 20,
        leavesTaken: 0
      };
    } catch (error) {
      console.error('Get leave balance error:', error.message);
      return { 
        balance: 2,
        totalLeaves: 20,
        leavesTaken: 0
      };
    }
  },
  
  // ============================================
  // ACTIVITIES - Mock data (no changes)
  // ============================================
  getActivities: async () => {
    try {
      return [
        {
          id: 1,
          title: 'Team Meeting',
          type: 'Meeting',
          description: 'Daily standup with team'
        },
        {
          id: 2,
          title: 'Project Review',
          type: 'Review',
          description: 'Review project milestones'
        },
        {
          id: 3,
          title: 'Training Session',
          type: 'Training',
          description: 'New software training'
        }
      ];
    } catch (error) {
      console.error('Get activities error:', error.message);
      return [
        {
          id: 1,
          title: 'Activity name',
          type: 'Activity Type',
          description: 'No Description Provided'
        },
        {
          id: 2,
          title: 'Activity name',
          type: 'Activity Type',
          description: 'No Description Provided'
        },
        {
          id: 3,
          title: 'Activity name',
          type: 'Activity Type',
          description: 'No Description Provided'
        }
      ];
    }
  },
  
  // ============================================
  // OPTIONAL: Get user by ID - FIXED
  // ============================================
  getUserById: async (userId) => {
    try {
      if (!userId) {
        throw new Error('USER_ID_MISSING');
      }
      
      const baseUrl = apiService.getBaseUrl();
      const url = `${baseUrl}/models/AD_User/${userId}`;
      
      const data = await apiService.makeRequest(url);
      return data;
    } catch (error) {
      console.error('Get user by ID error:', error.message);
      if (error.message === 'SESSION_EXPIRED') {
        throw error;
      }
      return null;
    }
  },
  
  // ============================================
  // OPTIONAL: Get employee by partner ID - FIXED
  // ============================================
  getEmployeeByPartnerId: async (partnerId) => {
    try {
      if (!partnerId) {
        throw new Error('PARTNER_ID_MISSING');
      }
      
      const baseUrl = apiService.getBaseUrl();
      const url = `${baseUrl}/models/AD_User?$filter=C_BPartner_ID eq ${partnerId}`;
      
      const data = await apiService.makeRequest(url);
      return data.records?.[0] || null;
    } catch (error) {
      console.error('Get employee by partner ID error:', error.message);
      if (error.message === 'SESSION_EXPIRED') {
        throw error;
      }
      return null;
    }
  }
};

export default employeeApi;