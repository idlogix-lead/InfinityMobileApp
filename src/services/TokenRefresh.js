import { AppState } from 'react-native';
import { useAuthStore } from '../store/authStore';

class TokenRefreshService {
  constructor() {
    this.refreshInterval = null;
    this.appStateSubscription = null;
  }

  start() {
    console.log('🚀 Token refresh service started');
    
    // Check token every 5 minutes
    this.refreshInterval = setInterval(() => {
      this.checkAndRefreshToken();
    }, 5 * 60 * 1000); // 5 minutes
    
    // Also check when app comes to foreground
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('📱 App came to foreground, checking token...');
        this.checkAndRefreshToken();
      }
    });
  }

  stop() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    console.log('🛑 Token refresh service stopped');
  }

  async checkAndRefreshToken() {
    try {
      const authState = useAuthStore.getState();
      
      // Check if token needs refresh (less than 10 minutes remaining)
      if (authState.shouldCompleteRefresh?.()) {
        console.log('🔄 Token expiring soon, refreshing in background...');
        // FIXED: Use completeRelogin instead of relogin
        await authState.completeRelogin?.();
        console.log('✅ Background token refresh completed');
      } else {
        // Optional: Log when token is still valid
        const expiryInfo = authState.getTokenExpiryInfo?.();
        if (expiryInfo?.timeRemaining) {
          const minutesRemaining = Math.round(expiryInfo.timeRemaining / 60000);
          console.log(`⏰ Token valid, ${minutesRemaining} minutes remaining`);
        }
      }
    } catch (error) {
      console.error('❌ Background refresh failed:', error.message);
      
      // If refresh fails due to missing credentials, stop the service
      if (error.message === 'No stored credentials available for token refresh' ||
          error.message.includes('missing')) {
        console.log('⚠️ Stopping refresh service due to missing credentials');
        this.stop();
      }
    }
  }

  // Optional: Force immediate refresh
  async forceRefresh() {
    console.log('🔄 Force refreshing token...');
    return this.checkAndRefreshToken();
  }
}

export const tokenRefreshService = new TokenRefreshService();