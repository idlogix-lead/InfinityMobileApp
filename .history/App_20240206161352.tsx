import React from 'react';
import Navigation from './src/navigation/Navigation'
import { MenuProvider } from 'react-native-popup-menu';
function App() {
  return (
    <MenuProvider>
      <Navigation />
    </MenuProvider>
  );
}

export default App;
