// store/authUtils.js
import base64 from 'base-64';

export const decodeJWT = (token) => {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const base64Str = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64Str.padEnd(base64Str.length + (4 - base64Str.length % 4) % 4, '=');
    
    const decoded = base64.decode(padded);
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
};

export const validateToken = (token) => {
  try {
    if (!token) return { isValid: false, reason: 'NO_TOKEN' };
    
    const decoded = decodeJWT(token);
    if (!decoded) return { isValid: false, reason: 'INVALID_TOKEN' };
    
    if (decoded.exp) {
      const expirationTime = decoded.exp * 1000;
      const currentTime = Date.now();
      
      if (currentTime >= expirationTime) {
        return { 
          isValid: false, 
          reason: 'EXPIRED',
          expiredAt: new Date(expirationTime).toISOString()
        };
      }
      
      return { 
        isValid: true, 
        expiresAt: new Date(expirationTime).toISOString(),
        timeRemaining: expirationTime - currentTime,
        decoded
      };
    }
    
    return { 
      isValid: true, 
      expiresAt: 'Never',
      timeRemaining: Infinity,
      decoded 
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return { isValid: false, reason: 'VALIDATION_ERROR' };
  }
};