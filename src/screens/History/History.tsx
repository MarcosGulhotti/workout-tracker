import HistoryWorkoutCard from "@/components/Cards/HistoryWorkoutCard/HistoryWorkoutCard";
import { Modal } from "@/components/Modal/Modal";
import { PageWrapper } from "@/components/PageWrapper/PageWrapper";
import { Separator } from "@/components/Separator/Separator";
import { CompletedWorkout } from "@/database/types";
import { useWorkoutDatabase } from "@/database/useWorkoutDatabase";
import { NavigationPageProps } from "@/types/navigation";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { filterCompletedWorkouts } from "./utils/filters";

export function History({ navigation }: NavigationPageProps) {
  const [loading, setLoading] = useState(false);
  const [workouts, setWorkouts] = useState<CompletedWorkout[]>([]);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [detailedWorkout, setDetailedWorkout] =
    useState<CompletedWorkout | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { getWorkoutHistory } = useWorkoutDatabase();

  const handleGetWorkoutHistory = useCallback(async () => {
    setLoading(true);
    const result = await getWorkoutHistory();
    setWorkouts(result);
    setLoading(false);
  }, [getWorkoutHistory]);

  const handleSetDetailedWorkout = useCallback((workout: CompletedWorkout) => {
    setDetailedWorkout(workout);
    setDetailsModalVisible(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!loading && workouts.length === 0) {
        handleGetWorkoutHistory();
      }
    }, [handleGetWorkoutHistory, loading, workouts]),
  );

  const filteredWorkouts = filterCompletedWorkouts(workouts, {
    searchTerm,
  });

  return (
    <PageWrapper navigate={navigation} selectedButton="History">
      <ScrollView>
        <Separator text="History" />

        <TextInput
          placeholder="Buscar por nome do treino..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={{
            backgroundColor: "#fff",
            marginHorizontal: 20,
            marginVertical: 10,
            padding: 10,
            borderRadius: 10,
            borderColor: "#ccc",
            borderWidth: 1,
          }}
        />

        {loading && <Text>Loading...</Text>}
        {!loading && (
          <HistoryWorkoutCard
            completedWorkouts={filteredWorkouts}
            onPress={handleSetDetailedWorkout}
          />
        )}
      </ScrollView>

      <Modal.Wrapper
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
      >
        <Modal.Header
          title={detailedWorkout?.workout_name || "Workout Details"}
          onClose={() => setDetailsModalVisible(false)}
        />
        <Modal.Content>
          <ScrollView>
            {detailedWorkout &&
              detailedWorkout.completed_exercises.map((exercise, index) => (
                <View key={index}>
                  <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                    {exercise.name} - {exercise.completed_sets.length} Sets
                  </Text>
                  {exercise.completed_sets.map((set, setIndex) => (
                    <View key={setIndex} style={{ marginLeft: 10 }}>
                      <Text>
                        Set {set.set_number}: {set.repetitions} reps at{" "}
                        {set.weight} kg
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
          </ScrollView>
        </Modal.Content>
      </Modal.Wrapper>
    </PageWrapper>
  );
}
