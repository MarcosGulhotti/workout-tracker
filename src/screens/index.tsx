import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { enableScreens } from "react-native-screens";
import { Home } from "./Home/Home";

enableScreens();

const Stack = createNativeStackNavigator();

/**
 * Router component that sets up the navigation structure for the application.
 * It uses a `NavigationContainer` to manage the navigation tree and contains a `Stack.Navigator`
 *
 * @returns {JSX.Element} The navigation container with the defined stack navigator.
 */
export function Router() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false, headerTransparent: true }}>
                <Stack.Screen name="Home" component={Home} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}