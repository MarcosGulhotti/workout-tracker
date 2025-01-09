import { useFonts } from 'expo-font';
import { View } from 'react-native';
import { Router } from './src/screens';

/**
 * The main entry point of the application.
 * 
 * @returns {JSX.Element} The root view of the application.
 */
export default function App() {
  const [fontsLoaded] = useFonts({
    'Montserrat-Bold': require('./assets/fonts/Montserrat.ttf'),
  });

  console.log(fontsLoaded)

  return (
    <View style={{ flex: 1 }}>
      <Router />
    </View>
  );
}