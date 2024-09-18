import { useEffect } from 'react';
import { View } from 'react-native';
import { Router } from './src/screens';
import { setUpDatabase } from './src/services/api/workoutClient';

/**
 * The main entry point of the application.
 * 
 * @returns {JSX.Element} The root view of the application.
 */
export default function App() {

  useEffect(() => {
    setUpDatabase();
  }, [])

  return (
    <View style={{ flex: 1 }}>
      <Router />
    </View>
  );
}