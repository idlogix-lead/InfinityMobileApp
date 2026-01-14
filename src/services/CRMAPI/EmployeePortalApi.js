import { buildApiUrl, apiRequest, getAuthState } from '../utils/apiUtils';

// ============================================
// EMPLOYEE PORTAL API SERVICE
// ============================================
const employeePortalApi = {
  /**
   * Get business partner ID for current user
   */
  getBusinessPartnerId: async () => {
    try {
      const authState = getAuthState();
      const userId = authState.userId;
      
      if (!userId) {
        throw new Error('USER_ID_MISSING');
      }
      
      const url = buildApiUrl(`models/AD_User`, { AD_User_ID: userId });
      console.log('🔍 Fetching business partner ID URL:', url);
      
      const data = await apiRequest(url);
      
      // Extract business partner ID from response
      const businessPartnerId = data.records?.[0]?.C_BPartner_ID?.id;
      
      if (!businessPartnerId) {
        console.warn('No business partner ID found for user:', userId);
      }
      
      console.log('✅ Business partner ID:', businessPartnerId);
      return businessPartnerId;
    } catch (error) {
      console.error('❌ Get business partner ID failed:', error.message);
      throw error;
    }
  },

  /**
   * Get employee details including name and position
   */
  getEmployeeDetails: async () => {
    try {
      const authState = getAuthState();
      const userId = authState.userId;
      
      if (!userId) {
        throw new Error('USER_ID_MISSING');
      }
      
      const url = buildApiUrl(`models/AD_User/${userId}`);
      console.log('👤 Fetching employee details URL:', url);
      
      const data = await apiRequest(url);
      
      // Extract relevant employee information
      const employeeInfo = {
        name: data.Name || 'Employee Name',
        email: data.EMail || '',
        phone: data.Phone || '',
        businessPartnerId: data.C_BPartner_ID?.id,
        // Add other relevant fields from your API response
      };
      
      console.log('✅ Employee details retrieved:', employeeInfo);
      return employeeInfo;
    } catch (error) {
      console.error('❌ Get employee details failed:', error.message);
      throw error;
    }
  },

  /**
   * Get leave requests for employee
   * @param {Object} filters - Optional filters
   * @param {string} filters.businessPartnerId - Business partner ID
   * @param {string} filters.startDate - Start date filter
   * @param {string} filters.endDate - End date filter
   * @param {string} filters.applyFilter - Time filter ('Last 7 Days', 'Last month', 'All')
   */
  getLeaveRequests: async (filters = {}) => {
    try {
      const authState = getAuthState();
      
      // Get business partner ID if not provided
      let businessPartnerId = filters.businessPartnerId;
      if (!businessPartnerId) {
        // Try to get from auth state or fetch it
        const bpId = await employeePortalApi.getBusinessPartnerId();
        businessPartnerId = bpId;
      }
      
      if (!businessPartnerId) {
        throw new Error('BUSINESS_PARTNER_ID_MISSING');
      }
      
      // Calculate date range based on filter
      let startDate = new Date();
      let endDate = new Date();
      
      if (filters.applyFilter === 'Last 7 Days') {
        startDate.setDate(endDate.getDate() - 7);
      } else if (filters.applyFilter === 'Last month') {
        startDate.setMonth(endDate.getMonth() - 1);
      } else {
        // Default: All time
        startDate = new Date('2000-01-01');
      }
      
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      // Build filter string
      let filterParts = [`C_BPartner_ID eq ${businessPartnerId}`];
      
      if (formattedStartDate) {
        filterParts.push(`StartDate ge ${formattedStartDate}`);
      }
      
      if (formattedEndDate) {
        filterParts.push(`EndDate le ${formattedEndDate}`);
      }
      
      const filterString = filterParts.join(' and ');
      const orderBy = 'EndDate desc';
      
      const url = buildApiUrl('models/HR_EmpLev_Posting', {}, 
        filterParts.length > 0 ? filterParts.join(' and ') : null
      );
      
      // Add orderby parameter
      const fullUrl = `${url}${url.includes('?') ? '&' : '?'}$orderby=${orderBy}`;
      
      console.log('📋 Leave requests URL:', fullUrl);
      
      const data = await apiRequest(fullUrl);
      
      const records = Array.isArray(data.records) ? data.records : [];
      console.log(`✅ Retrieved ${records.length} leave requests`);
      return records;
    } catch (error) {
      console.error('❌ Get leave requests failed:', error.message);
      
      if (error.message === 'SESSION_EXPIRED') {
        throw error;
      }
      
      return [];
    }
  },

  /**
   * Get today's attendance (check-in/check-out)
   */
  getTodayAttendance: async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const authState = getAuthState();
      const userId = authState.userId;
      
      if (!userId) {
        throw new Error('USER_ID_MISSING');
      }
      
      const filter = `AD_User_ID eq ${userId} and AttendanceDate eq '${today}'`;
      const url = buildApiUrl('models/HR_Attendance', {}, filter);
      
      console.log('🕒 Today attendance URL:', url);
      
      const data = await apiRequest(url);
      const records = Array.isArray(data.records) ? data.records : [];
      
      // Sort by time to get latest check-in/check-out
      records.sort((a, b) => new Date(b.Created) - new Date(a.Created));
      
      console.log(`✅ Retrieved ${records.length} attendance records for today`);
      return records;
    } catch (error) {
      console.error('❌ Get today attendance failed:', error.message);
      return [];
    }
  },

  /**
   * Get current leave balance
   */
  getLeaveBalance: async () => {
    try {
      const authState = getAuthState();
      const userId = authState.userId;
      
      if (!userId) {
        throw new Error('USER_ID_MISSING');
      }
      
      // This endpoint might be different in your system
      // Adjust based on your actual API
      const url = buildApiUrl(`models/HR_LeaveBalance`, { AD_User_ID: userId });
      
      console.log('⚖️ Leave balance URL:', url);
      
      const data = await apiRequest(url);
      const records = Array.isArray(data.records) ? data.records : [];
      
      if (records.length > 0) {
        const balance = records[0].Balance || 0;
        console.log(`✅ Leave balance: ${balance}`);
        return balance;
      }
      
      console.log('ℹ️ No leave balance record found, returning default');
      return 2; // Default fallback
    } catch (error) {
      console.error('❌ Get leave balance failed:', error.message);
      return 2; // Default fallback
    }
  },

  /**
   * Get employee activities for today
   */
  getTodayActivities: async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const authState = getAuthState();
      const userId = authState.userId;
      
      if (!userId) {
        throw new Error('USER_ID_MISSING');
      }
      
      const filter = `AD_User_ID eq ${userId} and ActivityDate eq '${today}'`;
      const url = buildApiUrl('models/HR_Activity', {}, filter);
      
      console.log('📊 Today activities URL:', url);
      
      const data = await apiRequest(url);
      const records = Array.isArray(data.records) ? data.records : [];
      
      // Format activities for display
      const activities = records.slice(0, 3).map(record => ({
        id: record.id,
        title: record.ActivityName || 'Activity',
        type: record.ActivityType?.identifier || 'Activity Type',
        description: record.Description || 'No Description Provided',
      }));
      
      // Fill with mock data if no activities
      if (activities.length === 0) {
        return [
          {
            id: 1,
            title: 'Team Meeting',
            type: 'Meeting',
            description: 'Weekly team sync',
          },
          {
            id: 2,
            title: 'Project Review',
            type: 'Review',
            description: 'Monthly project review',
          },
          {
            id: 3,
            title: 'Training Session',
            type: 'Training',
            description: 'New tool training',
          },
        ];
      }
      
      console.log(`✅ Retrieved ${activities.length} activities for today`);
      return activities;
    } catch (error) {
      console.error('❌ Get today activities failed:', error.message);
      // Return mock data on error
      return [
        {
          id: 1,
          title: 'Team Meeting',
          type: 'Meeting',
          description: 'Weekly team sync',
        },
        {
          id: 2,
          title: 'Project Review',
          type: 'Review',
          description: 'Monthly project review',
        },
        {
          id: 3,
          title: 'Training Session',
          type: 'Training',
          description: 'New tool training',
        },
      ];
    }
  },

  /**
   * Create new leave request
   */
  createLeaveRequest: async (leaveData) => {
    try {
      const url = buildApiUrl('models/HR_EmpLev_Posting');
      console.log('📝 Create leave request URL:', url);
      
      const data = await apiRequest(url, {
        method: 'POST',
        body: leaveData,
      });
      
      console.log('✅ Leave request created successfully');
      return data;
    } catch (error) {
      console.error('❌ Create leave request failed:', error.message);
      throw error;
    }
  },

  /**
   * Update leave request
   */
  updateLeaveRequest: async (leaveId, updates) => {
    try {
      const url = buildApiUrl(`models/HR_EmpLev_Posting/${leaveId}`);
      console.log('✏️ Update leave request URL:', url);
      
      const data = await apiRequest(url, {
        method: 'PUT',
        body: updates,
      });
      
      console.log('✅ Leave request updated successfully');
      return data;
    } catch (error) {
      console.error('❌ Update leave request failed:', error.message);
      throw error;
    }
  },

  /**
   * Delete leave request
   */
  deleteLeaveRequest: async (leaveId) => {
    try {
      const url = buildApiUrl(`models/HR_EmpLev_Posting/${leaveId}`);
      console.log('🗑️ Delete leave request URL:', url);
      
      await apiRequest(url, {
        method: 'DELETE',
      });
      
      console.log('✅ Leave request deleted successfully');
      return { success: true, id: leaveId };
    } catch (error) {
      console.error('❌ Delete leave request failed:', error.message);
      throw error;
    }
  },

  /**
   * Get leave statistics
   */
  getLeaveStatistics: async () => {
    try {
      const requests = await employeePortalApi.getLeaveRequests();
      
      const statistics = {
        total: requests.length,
        pending: requests.filter(req => req.DocStatus?.identifier === 'Drafted').length,
        approved: requests.filter(req => req.DocStatus?.identifier === 'Completed').length,
        rejected: requests.filter(req => req.DocStatus?.identifier === 'Voided').length,
        onLeave: requests.filter(req => {
          const today = new Date();
          const start = new Date(req.StartDate);
          const end = new Date(req.EndDate);
          return start <= today && today <= end && req.DocStatus?.identifier === 'Completed';
        }).length,
      };
      
      console.log('📊 Leave statistics:', statistics);
      return statistics;
    } catch (error) {
      console.error('❌ Get leave statistics failed:', error.message);
      return { total: 0, pending: 0, approved: 0, rejected: 0, onLeave: 0 };
    }
  },
};

export default employeePortalApi;