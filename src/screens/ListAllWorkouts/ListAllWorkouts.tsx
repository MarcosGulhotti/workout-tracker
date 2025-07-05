import BottomSheet, {
  BottomSheetRefProps,
} from "@/components/BottomSheet/BottomSheet";
import WorkoutCard from "@/components/Cards/WorkoutCard/WorkoutCard";
import { Workout, WorkoutDetails } from "@/database/types";
import { useWorkoutDatabase } from "@/database/useWorkoutDatabase";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { PageWrapper } from "../../components/PageWrapper/PageWrapper";
import { Separator } from "../../components/Separator/Separator";
import { NavigationPageProps } from "../../types/navigation";

export function ListAllWorkouts({ navigation, route }: NavigationPageProps) {
  const workoutDetailsRef = useRef<BottomSheetRefProps>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailsModalIsVisible, setDetailsModalIsVisible] = useState(false);
  const [detailedWorkout, setDetailedWorkout] = useState<WorkoutDetails | null>(
    null,
  );

  const { listAllWorkouts, getWorkoutDetails } = useWorkoutDatabase();

  const handleListAllWorkouts = useCallback(async () => {
    setLoading(true);
    const result = await listAllWorkouts().catch((err) => {
      Alert.alert(
        "Error",
        `There was an error listing all workouts: ${err.message}`,
      );
      return { allWorkouts: [] as Workout[] };
    });

    if (result && result.allWorkouts) {
      setWorkouts(result.allWorkouts);
    }
    setLoading(false);
  }, [listAllWorkouts]);

  const handleGetWorkoutDetails = useCallback(
    async (workoutId: string) => {
      const result = await getWorkoutDetails(workoutId).catch((err) => {
        Alert.alert(
          "Error",
          `There was an error getting detailed workout: ${err.message}`,
        );
        return {} as WorkoutDetails;
      });
      if (!result) {
        return;
      }
      const isActive = workoutDetailsRef?.current?.isActive();
      if (isActive) {
        workoutDetailsRef?.current?.scrollTo(0);
        setDetailsModalIsVisible(false);
        setDetailedWorkout(null);
      } else {
        workoutDetailsRef?.current?.scrollTo(-500);
        setDetailsModalIsVisible(true);
        setDetailedWorkout(result);
      }
    },
    [getWorkoutDetails],
  );

  useFocusEffect(
    useCallback(() => {
      if (!loading && workouts.length === 0) {
        handleListAllWorkouts();
      }
    }, [handleListAllWorkouts, loading, workouts.length]),
  );

  return (
    <PageWrapper
      navigate={navigation}
      selectedButton="ListAllWorkouts"
      hideNavBar={detailsModalIsVisible}
      closeBackdrop={() => {
        setDetailsModalIsVisible(false);
        setDetailedWorkout(null);
        workoutDetailsRef.current?.scrollTo(0);
      }}
      hasBottomSheet={detailsModalIsVisible}
    >
      <ScrollView style={styles.container}>
        <Separator text="Workouts" />
        {loading && <Text>Loading...</Text>}
        {!loading && workouts && (
          <WorkoutCard
            workouts={workouts}
            onPress={(workout) => {
              handleGetWorkoutDetails(workout.id);
              setDetailsModalIsVisible(true);
            }}
          />
        )}
      </ScrollView>

      <BottomSheet
        ref={workoutDetailsRef}
        closeBackdrop={() => setDetailsModalIsVisible(false)}
        primaryButton={{
          title: "Start Workout",
          onPress: () => {
            if (detailedWorkout) {
              navigation.navigate("WorkingOut", {
                workoutId: detailedWorkout.workout_id,
              });
              setDetailsModalIsVisible(false);
              setDetailedWorkout(null);
              workoutDetailsRef.current?.scrollTo(0);
            }
          },
        }}
      >
        <ScrollView style={styles.modalItemsContainer}>
          {detailedWorkout &&
            detailedWorkout.exercises?.map((exercise, index) => (
              <View key={index}>
                <Text style={styles.title}>
                  {exercise.exercise_name} - {exercise.sets?.length ?? "No"}{" "}
                  Sets
                </Text>
              </View>
            ))}
        </ScrollView>
      </BottomSheet>
    </PageWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  createdExercisesContainer: {
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "center",
    padding: 15,
    backgroundColor: "#F2F2F2",
    marginVertical: 5,
    borderRadius: 15,
  },
  texts: {
    fontFamily: "Lato",
    color: "#415A77",
    fontSize: 12,
  },
  title: {
    fontFamily: "Lato",
    color: "#1E1E1E",
    fontWeight: "bold",
  },
  modalItemsContainer: {
    display: "flex",
    flexDirection: "column",
  },
});
