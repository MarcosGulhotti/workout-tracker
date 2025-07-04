import { Modal } from "@/components/Modal/Modal";
import { PageWrapper } from "@/components/PageWrapper/PageWrapper";
import { Separator } from "@/components/Separator/Separator";
import { WorkoutDetails } from "@/database/types";
import {
  CompletedWorkoutData,
  useWorkoutDatabase,
} from "@/database/useWorkoutDatabase";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { NavigationPageProps } from "../../types/navigation";
import { NavigationFooter } from "./components/NavigationFooter";

type SetInput = {
  weight: string;
  reps: string;
};

type ExerciseInput = {
  [setNumber: string]: SetInput;
};

type WorkoutInputState = {
  [exerciseId: string]: ExerciseInput;
};

export function WorkingOut({ navigation, route }: NavigationPageProps) {
  const workoutId = useMemo(
    () => (route.params ? route.params.workoutId : null),
    [route],
  );

  const [loading, setLoading] = useState(true);
  const [workout, setWorkout] = useState<WorkoutDetails | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [inputState, setInputState] = useState<WorkoutInputState>({});
  const [exerciseListModalVisible, setExerciseListModalVisible] =
    useState(false);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  const isCurrentExerciseCompleted = useMemo(() => {
    if (
      !workout ||
      currentExerciseIndex < 0 ||
      currentExerciseIndex >= workout.exercises.length
    ) {
      return false;
    }
    const currentExercise = workout.exercises[currentExerciseIndex];
    return completedExercises.includes(currentExercise.exercise_id);
  }, [workout, currentExerciseIndex, completedExercises]);

  const { getWorkoutDetails, saveCompletedWorkout } = useWorkoutDatabase();

  const checkIfWorkoutIsCompleted = useCallback(
    (exerciseId: string) => {
      return completedExercises.includes(exerciseId);
    },
    [completedExercises],
  );

  const handleGetWorkoutDetails = useCallback(
    async (workoutId: string) => {
      const result = await getWorkoutDetails(workoutId).catch((err) => {
        Alert.alert(
          "Error",
          `There was an error getting workout details: ${err.message}`,
        );
        return {} as WorkoutDetails;
      });

      if (result) {
        setWorkout(result);
        initializeInputState(result);
      }

      setLoading(false);
    },
    [getWorkoutDetails],
  );

  const initializeInputState = (workout: WorkoutDetails) => {
    const initialState: WorkoutInputState = {};
    workout.exercises.forEach((exercise) => {
      const setInputs: ExerciseInput = {};
      exercise.sets.forEach((set) => {
        setInputs[set.set_number.toString()] = {
          weight: "",
          reps: set.repetitions.toString(),
        };
      });
      initialState[exercise.exercise_id] = setInputs;
    });
    setInputState(initialState);
  };

  const handleInputChange = (
    exerciseId: string,
    setNumber: string,
    field: keyof SetInput,
    value: string,
  ) => {
    setInputState((prev) => {
      const exercise = prev[exerciseId] ?? {};
      const set = exercise[setNumber] ?? { weight: "", reps: "" };

      return {
        ...prev,
        [exerciseId]: {
          ...exercise,
          [setNumber]: {
            ...set,
            [field]: value,
          },
        },
      };
    });
  };

  const toggleExerciseComplete = (exerciseId: string) => {
    setCompletedExercises((prev) => {
      if (prev.includes(exerciseId)) {
        return prev.filter((id) => id !== exerciseId); // Desmarca
      } else {
        return [...prev, exerciseId]; // Marca
      }
    });
  };

  useEffect(() => {
    if (!workoutId) {
      Alert.alert("Error", "No workout ID provided.");
      setLoading(false);
      return;
    }

    if (loading) {
      handleGetWorkoutDetails(workoutId);
    }
  }, [workoutId, handleGetWorkoutDetails, loading]);

  function buildCompletedWorkoutData(
    workout: WorkoutDetails,
    inputState: WorkoutInputState,
  ): CompletedWorkoutData {
    return {
      workout_id: workout.workout_id,
      workout_name: workout.workout_name,
      date: new Date().toISOString(),
      completed_exercises: workout.exercises.map((exercise) => {
        const sets = inputState[exercise.exercise_id];
        const completed_sets = Object.entries(sets).map(
          ([setNumber, setData]) => ({
            setNumber: setNumber,
            weight: setData.weight,
            repetitions: setData.reps,
          }),
        );

        return {
          exerciseId: exercise.exercise_id,
          exerciseName: exercise.exercise_name,
          completed_sets,
        };
      }),
    };
  }

  const handleFinishWorkout = async () => {
    if (!workout) return;

    const dataToSave = buildCompletedWorkoutData(workout, inputState);
    try {
      await saveCompletedWorkout(dataToSave);
      Alert.alert("Treino salvo com sucesso!");
      navigation.navigate("Home"); // ou qualquer tela de destino
    } catch {
      Alert.alert("Erro", "Não foi possível salvar o treino.");
    }
  };

  if (loading) {
    return (
      <PageWrapper navigate={navigation} hideNavBar selectedButton="WorkingOut">
        <Text>Loading...</Text>
      </PageWrapper>
    );
  }

  if (!workout) {
    return (
      <PageWrapper navigate={navigation} hideNavBar selectedButton="WorkingOut">
        <Text>No workout details available.</Text>
      </PageWrapper>
    );
  }

  const exercises = workout.exercises;
  const currentExercise = exercises[currentExerciseIndex];

  return (
    <PageWrapper navigate={navigation} hideNavBar selectedButton="WorkingOut">
      <ScrollView style={{ padding: 20 }}>
        {/* <View style={styles.highlightCard}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#fff" }}>
              {workout.workout_name}
            </Text>
            <Icon
              name="check-circle"
              color={isCurrentExerciseCompleted ? "lightgreen" : "lightgray"}
              size={28}
              onPress={() =>
                toggleExerciseComplete(currentExercise.exercise_id)
              }
            />
          </View>
          <Text style={{ color: "#fff", marginTop: 5 }}>
            {`Exercícios: ${exercises.length}`}
          </Text>
        </View> */}
        <View>
          <Separator text="Exercises" />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "baseline",
                gap: 5,
              }}
            >
              <Text
                style={{
                  fontFamily: "Montserrat",
                  fontSize: 18,
                  fontWeight: "bold",
                  marginVertical: 10,
                }}
              >
                {currentExercise.exercise_name}
              </Text>
              <Text
                style={{
                  fontFamily: "Montserrat",
                  fontSize: 12,
                  fontWeight: "light",
                }}
              >
                {`${currentExercise.sets.length} Sets`}
              </Text>
            </View>
            <View>
              <TouchableOpacity
                onPress={() =>
                  toggleExerciseComplete(currentExercise.exercise_id)
                }
                style={
                  isCurrentExerciseCompleted
                    ? styles.activeCompletedButton
                    : styles.completedButton
                }
              >
                <Text
                  style={{
                    color: isCurrentExerciseCompleted ? "#fff" : "#000",
                  }}
                >
                  Completed
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {currentExercise.sets.map((set) => {
            const setNumber = set.set_number.toString();
            const input = inputState[currentExercise.exercise_id]?.[
              setNumber
            ] ?? {
              weight: "",
              reps: "",
            };

            return (
              <View
                key={`${currentExercise.exercise_id}-${setNumber}`}
                style={{ marginVertical: 10 }}
              >
                <Text>Set {set.set_number}</Text>
                <Text>Reps Esperadas: {set.repetitions}</Text>

                <TextInput
                  placeholder="Reps feitas"
                  value={input.reps}
                  keyboardType="numeric"
                  onChangeText={(text) =>
                    handleInputChange(
                      currentExercise.exercise_id,
                      setNumber,
                      "reps",
                      text,
                    )
                  }
                  style={{
                    borderWidth: 1,
                    padding: 8,
                    marginVertical: 5,
                  }}
                />

                <TextInput
                  placeholder="Carga (kg)"
                  value={input.weight}
                  keyboardType="numeric"
                  onChangeText={(text) =>
                    handleInputChange(
                      currentExercise.exercise_id,
                      setNumber,
                      "weight",
                      text,
                    )
                  }
                  style={{
                    borderWidth: 1,
                    padding: 8,
                    marginVertical: 5,
                  }}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>

      <NavigationFooter
        onPrevious={() =>
          setCurrentExerciseIndex((prev) => Math.max(0, prev - 1))
        }
        onNext={() =>
          setCurrentExerciseIndex((prev) =>
            Math.min(prev + 1, exercises.length - 1),
          )
        }
        onFinish={handleFinishWorkout}
        onOpenExercises={() => setExerciseListModalVisible(true)}
        previousDisabled={currentExerciseIndex === 0}
        nextDisabled={currentExerciseIndex >= exercises.length - 1}
      />

      <Modal.Wrapper
        visible={exerciseListModalVisible}
        onClose={() => setExerciseListModalVisible(false)}
      >
        <Modal.Header
          title={workout.workout_name}
          onClose={() => setExerciseListModalVisible(false)}
        />
        <Modal.Content>
          <ScrollView style={{ paddingVertical: 10 }}>
            {exercises.map((exercise, index) => {
              const totalSets = exercise.sets.length;
              const setDescription = `${totalSets} ${totalSets === 1 ? "set" : "sets"}`;

              const isCurrent = currentExerciseIndex === index;

              const isCompleted = checkIfWorkoutIsCompleted(
                exercise.exercise_id,
              );

              const textColor = isCurrent
                ? "#fff"
                : isCompleted
                  ? "#fff"
                  : "#000";

              return (
                <TouchableOpacity
                  key={exercise.exercise_id}
                  style={{
                    backgroundColor: isCurrent
                      ? "#00A8E8"
                      : isCompleted
                        ? "#4CAF50"
                        : "#F2F2F2",
                    borderRadius: 10,
                    padding: 15,
                    marginVertical: 10,
                    marginHorizontal: 30,
                    alignItems: "center",
                  }}
                  onPress={() => {
                    setCurrentExerciseIndex(index);
                    setExerciseListModalVisible(false);
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: textColor,
                    }}
                  >
                    {exercise.exercise_name}
                  </Text>
                  <Text
                    style={{
                      color: textColor,
                      marginTop: 4,
                    }}
                  >
                    {setDescription}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <Modal.Footer
            mainButton={{
              text: "Fechar",
              onPress: () => setExerciseListModalVisible(false),
              variant: "primary",
            }}
          />
        </Modal.Content>
      </Modal.Wrapper>
    </PageWrapper>
  );
}

const styles = StyleSheet.create({
  highlightCard: {
    backgroundColor: "#00A8E8",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 30,
  },
  completedButton: {
    backgroundColor: "#F2F2F2",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginTop: 10,
  },
  activeCompletedButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginTop: 10,
  },
});
