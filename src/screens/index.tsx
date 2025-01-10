import { initializeDatabase } from "@/database/initializeDatabase";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SQLiteProvider } from "expo-sqlite";
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

export type NavigationOptions = 'Home' | 'CreateWorkout' | 'ListAllWorkouts';

/**
 * Router component that sets up the navigation structure for the application.
 * It uses a `NavigationContainer` to manage the navigation tree and contains a `Stack.Navigator`
 *
 * @returns {JSX.Element} The navigation container with the defined stack navigator.
 */
export function Router() {
    return (
        <SQLiteProvider databaseName='workout_database.db' onInit={initializeDatabase}>
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
        </SQLiteProvider>
    )
}