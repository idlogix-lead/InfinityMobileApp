// useAuthStatus.js
import { useAuthStore } from '../store/authStore';

export const useAuthStatus = () => {
  const token = useAuthStore(state => state.token);
  const userName = useAuthStore(state => state.userName);
  const userId = useAuthStore(state => state.userId);
  
  const isAuthenticated = (
    token && 
    typeof token === 'string' && 
    token.length > 10 &&
    userName &&
    userId &&
    userId !== userName &&
    !isNaN(Number(userId))
  );
  
  console.log('🔐 useAuthStatus:', {
    hasToken: !!token,
    tokenType: typeof token,
    tokenLength: token?.length || 0,
    hasUserName: !!userName,
    hasUserId: !!userId,
    isAuthenticated
  });
  
  return isAuthenticated;
};