import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { HandlerNavigation } from './src/navigation/HandlerNavigation';
import { AuthProvider } from './src/context/AuthContext';
import { SQLliteProvider } from './src/context/SQLliteContext';

const App = () => {
  return (

    <NavigationContainer>

      <SQLliteProvider>
        <AuthProvider>
          <HandlerNavigation />
        </AuthProvider>
      </SQLliteProvider>

    </NavigationContainer>

  )
}

export default App