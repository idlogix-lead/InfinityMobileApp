// src/services/salaryApi.js
import apiService from '../authApi';

const salaryApi = {
  // Get salary slip data
  getSalarySlips: async (token, userId) => {
    try {
      const baseUrl = apiService.getBaseUrl();
      
      const response = await fetch(
        `${baseUrl}/models/hr_payroll_movement_v?$filter=ad_user_id eq ${userId}`,
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
        console.error('Get salary slips error:', errorText);
        throw new Error('Failed to fetch salary slips');
      }
      
      const data = await response.json();
      return data.records || [];
    } catch (error) {
      console.error('Get salary slips fetch error:', error.message);
      throw error;
    }
  },
  
  // Process salary data (same logic as your original)
  processSalaryData: (records) => {
    if (!records || records.length === 0) return { records: [], latestPeriod: '', latestData: {} };
    
    // Find latest date
    const latestDate = records.reduce((max, record) => {
      const recordDate = new Date(record.StartDate);
      return recordDate > max ? recordDate : max;
    }, new Date(0));
    
    const latestMonthStart = new Date(latestDate.getFullYear(), latestDate.getMonth(), 1);
    const twelveMonthsAgoStart = new Date(latestMonthStart.getFullYear(), latestMonthStart.getMonth() - 11, 1);
    
    // Filter records from last 12 months
    const recentRecords = records.filter(record => {
      const recordDate = new Date(record.StartDate);
      return recordDate >= twelveMonthsAgoStart && recordDate <= latestDate;
    });
    
    // Sort by date descending
    const sortedResponse = recentRecords.sort((a, b) => {
      const startDateA = new Date(a.StartDate);
      const startDateB = new Date(b.StartDate);
      return startDateB - startDateA;
    });
    
    // Get latest period data
    const latestPeriod = sortedResponse[0]?.HR_Period_ID?.identifier || '';
    const latestData = sortedResponse[0] || {};
    
    return {
      records: sortedResponse,
      latestPeriod,
      latestData
    };
  }
};

export default salaryApi;