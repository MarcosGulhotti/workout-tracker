import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { enableScreens } from "react-native-screens";
import { RootStackParamList } from "../types/navigation";
import { CreateExercises } from "./CreateExercises/CreateExercises";
import { CreateWorkout } from "./CreateWorkout/CreateWorkout";
import { Home } from "./Home/Home";
import { ListAllWorkouts } from "./ListAllWorkouts/ListAllWorkouts";
import { WorkingOut } from "./WorkingOut/WorkingOut";
import { WorkoutDetailsPage } from "./WorkoutDetails/WorkoutDetails";

enableScreens();

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Router component that sets up the navigation structure for the application.
 * It uses a `NavigationContainer` to manage the navigation tree and contains a `Stack.Navigator`
 *
 * @returns {JSX.Element} The navigation container with the defined stack navigator.
 */
export function Router() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="CreateWorkout" component={CreateWorkout} />
                <Stack.Screen name="CreateExercise" component={CreateExercises} />
                <Stack.Screen name="ListAllWorkouts" component={ListAllWorkouts} />
                <Stack.Screen name="WorkoutDetails" component={WorkoutDetailsPage} />
                <Stack.Screen name="WorkingOut" component={WorkingOut} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}