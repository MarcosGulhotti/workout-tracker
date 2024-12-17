import { Workout } from "@/database/types";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
    Home: undefined; // No params expected
    CreateWorkout: undefined  // No params expected
    CreateExercise: { selectedWorkout: Workout };
    ListAllWorkouts: undefined;
    WorkoutDetails: { workoutId: string };
    WorkingOut: { selectedWorkout: Workout, lastSavedWorkout: Workout | null }
};

type KeyOfRootStackParamList = keyof RootStackParamList

export type ScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, KeyOfRootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, KeyOfRootStackParamList>;

export type  NavigationPageProps = {
    navigation: ScreenNavigationProp;
    route: ScreenRouteProp;
}
