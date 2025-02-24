import React from 'react';
import Navigation from './src/navigation/Navigation'
import { MenuProvider } from 'react-native-popup-menu';
import JsFIle from './src/JsFIle';
function App() {
  return (
    <MenuProvider>
      <Navigation />
    </MenuProvider>
    // <JsFIle />
  );
}

export default App;
