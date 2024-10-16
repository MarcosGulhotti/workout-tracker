import { View } from 'react-native';
import { Router } from './src/screens';

/**
 * The main entry point of the application.
 * 
 * @returns {JSX.Element} The root view of the application.
 */
export default function App() {

  return (
    <View style={{ flex: 1 }}>
      <Router />
    </View>
  );
}