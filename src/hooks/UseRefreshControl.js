// hooks/useRefreshControl.js
import { useState, useCallback } from 'react';

export const useRefreshControl = (refreshFunctions = []) => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    
    try {
      // Execute all refresh functions in parallel
      const refreshPromises = refreshFunctions.map(fn => fn());
      await Promise.all(refreshPromises);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshFunctions]);

  return { refreshing, onRefresh };
};

export const useRefreshControlWithQuery = (queryClient, queryKeys = []) => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    
    try {
      // Invalidate all specified queries
      const invalidatePromises = queryKeys.map(key => 
        queryClient.invalidateQueries(key)
      );
      await Promise.all(invalidatePromises);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, queryKeys]);

  return { refreshing, onRefresh };
};