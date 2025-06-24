import WorkoutCard from "@/components/Cards/WorkoutCard/WorkoutCard";
import { Modal } from "@/components/Modal/Modal";
import { Workout, WorkoutDetails } from "@/database/types";
import { useWorkoutDatabase } from "@/database/useWorkoutDatabase";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { PageWrapper } from "../../components/PageWrapper/PageWrapper";
import { Separator } from "../../components/Separator/Separator";
import { NavigationPageProps } from "../../types/navigation";

export function ListAllWorkouts({ navigation, route }: NavigationPageProps) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
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

      if (result) {
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

  useEffect(() => {
    if (!loading && workouts.length === 0) {
      handleListAllWorkouts();
    }
  }, [handleListAllWorkouts, loading, workouts]);

  return (
    <PageWrapper
      navigate={navigation}
      selectedButton="ListAllWorkouts"
      hideNavBar={detailsModalVisible}
    >
      <ScrollView style={styles.container}>
        <Separator text="Workouts" />
        {loading && <Text>Loading...</Text>}
        {!loading && workouts && (
          <WorkoutCard
            workouts={workouts}
            onPress={(workout) => {
              handleGetWorkoutDetails(workout.id);
              setDetailsModalVisible(true);
            }}
          />
        )}
      </ScrollView>
      <Modal.Wrapper
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
      >
        <Modal.Header
          title={detailedWorkout?.workout_name ?? "Workout Details"}
          onClose={() => setDetailsModalVisible(false)}
        />
        <Modal.Content>
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
          <Modal.Footer
            mainButton={{
              text: "Start Workout",
              onPress: () => {
                if (detailedWorkout) {
                  navigation.navigate("WorkingOut", {
                    workoutId: detailedWorkout.workout_id,
                  });
                  setDetailsModalVisible(false);
                }
              },
              variant: "primary",
            }}
            actionButtons={{
              primary: {
                icon: "delete",
                onPress: () => null,
                variant: "danger",
              },
              secondary: {
                icon: "edit",
                onPress: () => null,
                variant: "secondary",
              },
            }}
          />
        </Modal.Content>
      </Modal.Wrapper>
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
