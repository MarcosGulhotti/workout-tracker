import { CreateWorkoutProps } from "@/database/types";
import { CompletedWorkout } from "@/services/api/types";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
    Home: undefined; // No params expected
    CreateWorkout: undefined  // No params expected
    CreateExercise: { selectedWorkout: CreateWorkoutProps };
    ListAllWorkouts: undefined;
    WorkoutDetails: { selectedWorkout: CreateWorkoutProps };
    WorkingOut: { selectedWorkout: CreateWorkoutProps, lastSavedWorkout: CompletedWorkout | null }
};

type KeyOfRootStackParamList = keyof RootStackParamList

export type ScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, KeyOfRootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, KeyOfRootStackParamList>;

export type  NavigationPageProps = {
    navigation: ScreenNavigationProp;
    route: ScreenRouteProp;
}
