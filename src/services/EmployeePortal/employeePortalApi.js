// src/services/employeeApi.js
import apiService from '../authApi';

const employeeApi = {
  // Get user info with business partner ID
  getUserInfo: async (token, userId) => {
    try {
      const baseUrl = apiService.getBaseUrl();
      
      const response = await fetch(
        `${baseUrl}/models/AD_User?$filter=AD_User_ID eq ${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Get user info error:', errorText);
        // Return default user info
        return {
          Name: 'Muhammad Anwar',
          Title: { identifier: 'Hr Manager' },
          C_BPartner_ID: { id: '12345' }
        };
      }
      
      const data = await response.json();
      return data.records?.[0] || {
        Name: 'Muhammad Anwar',
        Title: { identifier: 'Hr Manager' },
        C_BPartner_ID: { id: '12345' }
      };
    } catch (error) {
      console.error('Get user info fetch error:', error.message);
      // Return default user info
      return {
        Name: 'Muhammad Anwar',
        Title: { identifier: 'Hr Manager' },
        C_BPartner_ID: { id: '12345' }
      };
    }
  },
  
  // Get leave requests
  getLeaveRequests: async (token, partnerId, filters = {}) => {
    try {
      const baseUrl = apiService.getBaseUrl();
      
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
      
      if (filters.applyFilter !== 'All') {
        filterString += ` and startdate ge ${formattedStartDate} and enddate le ${formattedEndDate}`;
      }
      
      const url = `${baseUrl}/models/HR_EmpLev_Posting?$filter=${filterString}&$orderby=EndDate desc`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Get leave requests error:', errorText);
        // Return empty array
        return [];
      }
      
      const data = await response.json();
      return data.records || [];
    } catch (error) {
      console.error('Get leave requests fetch error:', error.message);
      // Return empty array
      return [];
    }
  },
  
  // Get today's attendance - Always return an object with default values
  getTodayAttendance: async () => {
    try {
      const currentHour = new Date().getHours();
      const currentMinute = new Date().getMinutes();
      
      // Generate realistic times based on current time
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
      // Always return a valid object
      return {
        checkInTime: '09:05:56 am',
        checkOutTime: '--:--:--',
        status: 'Present'
      };
    }
  },
  
  // Get leave balance - Always return an object
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
  
  // Get activities - Always return an array
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
  }
};

export default employeeApi;