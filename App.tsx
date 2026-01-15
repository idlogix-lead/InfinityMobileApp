import React from 'react';
import {StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {MenuProvider} from 'react-native-popup-menu';
import Navigation from './src/navigation/Navigation';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

// 1️⃣ Create QueryClient
const queryClient = new QueryClient();

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <MenuProvider>
        {/* 2️⃣ Wrap your app with QueryClientProvider */}
        <QueryClientProvider client={queryClient}>
          <Navigation />
        </QueryClientProvider>
      </MenuProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
