import { useAuthStore } from '../store/authStore';

const apiService = {
  getBaseUrl: () => {
    const serverConfig = useAuthStore.getState().serverConfig;
    if (!serverConfig.protocol || !serverConfig.host || !serverConfig.port) {
      throw new Error('Server configuration missing. Please configure server settings first.');
    }
    return `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.port}/api/v1`;
  },
  
  // Step 1: Basic login (just email/password)
  basicLogin: async (userName, password) => {
    try {
      const baseUrl = apiService.getBaseUrl();
      console.log('Basic Login URL:', `${baseUrl}/auth/tokens`);
      
      const payload = { userName, password };
      
      console.log('Basic login payload:', JSON.stringify(payload, null, 2));
      
      const response = await fetch(`${baseUrl}/auth/tokens`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      console.log('Basic login response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Basic login error:', errorText);
        throw new Error('Authentication failed');
      }
      
      const data = await response.json();
      console.log('Basic login success:', { 
        hasToken: !!data.token, 
        hasClients: data.clients?.length > 0 
      });
      
      return data;
    } catch (error) {
      console.error('Basic login fetch error:', error.message);
      throw error;
    }
  },
  
  // Step 2: Complete login with parameters
 completeLogin: async (userName, password, parameters) => {
  try {
    const baseUrl = apiService.getBaseUrl();
    console.log('Complete Login URL:', `${baseUrl}/auth/tokens`);
    
    // DEBUG: Log what's being received
    console.log('Complete login - Received params:', {
      userName,
      password: password ? '[HIDDEN]' : 'UNDEFINED',
      passwordLength: password?.length || 0,
      parameters
    });
    
    const payload = { 
      userName, 
      password, 
      parameters 
    };
    
    console.log('Complete login payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(`${baseUrl}/auth/tokens`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    console.log('Complete login response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Complete login error response:', errorText);
      throw new Error('Complete authentication failed');
    }
    
    const data = await response.json();
    console.log('Complete login success:', data);
    
    return data;
  } catch (error) {
    console.error('Complete login fetch error:', error.message);
    throw error;
  }
},
};

export default apiService;