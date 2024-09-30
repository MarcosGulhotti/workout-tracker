import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { WorkoutDetails } from "../services/api/types";

export type RootStackParamList = {
    Home: undefined; // No params expected
    CreateWorkout: undefined  // No params expected
    CreateExercise: { selectedWorkout: WorkoutDetails };
    ListAllWorkouts: undefined;
    WorkoutDetails: { selectedWorkout: WorkoutDetails };
    WorkingOut: { selectedWorkout: WorkoutDetails }
};

type KeyOfRootStackParamList = keyof RootStackParamList

export type ScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, KeyOfRootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, KeyOfRootStackParamList>;

export type  NavigationPageProps = {
    navigation: ScreenNavigationProp;
    route: ScreenRouteProp;
}
