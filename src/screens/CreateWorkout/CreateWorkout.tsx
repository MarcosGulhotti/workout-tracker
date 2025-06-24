import { Modal } from "@/components/Modal/Modal";
import { DAYS_OF_WEEK } from "@/consts/days";
import { CreateExerciseProps } from "@/database/types";
import { useWorkoutDatabase } from "@/database/useWorkoutDatabase";
import { useCreateWorkoutContext } from "@/hooks/useCreateWorkoutContext";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LabeledTextInput } from "../../components/LabeledTextInput/LabeledTextInput";
import { PageWrapper } from "../../components/PageWrapper/PageWrapper";
import { Separator } from "../../components/Separator/Separator";
import { StyledButton } from "../../components/StyledButton/StyledButton";
import { NavigationPageProps } from "../../types/navigation";

export function CreateWorkout({ navigation }: NavigationPageProps) {
  const [workoutName, setWorkoutName] = useState<string>("");
  const [exerciseName, setExerciseName] = useState<string>("");

  const [showDaysModal, setShowDaysModal] = useState(false);
  const [showExercisesModal, setShowExercisesModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>("");

  const { handleCreateWorkout } = useCreateWorkoutContext();

  const [cardioDuration, setCardioDuration] = useState<string>("");

  const [numberOfSets, setNumberOfSets] = useState<string>(""); // Number of sets (user input)
  const [setsData, setSetsData] = useState<{ reps: string; weight: string }[]>(
    [],
  ); // Track reps and weight

  const [savedExercises, setSavedExercises] = useState<CreateExerciseProps[]>(
    [],
  );

  const workoutDatabase = useWorkoutDatabase();

  const handleAddExercise = async () => {
    // Map over the setsData to create the sets array
    const sets = setsData.map((setData, index) => ({
      set_number: index + 1,
      repetitions: parseInt(setData.reps, 10),
      weight: parseFloat(setData.weight), // Include weight if needed
    }));

    // Create the exercise object to save in memory
    const exerciseToSaveInMemory: CreateExerciseProps = {
      exerciseName,
      sets,
    };

    // Add the new exercise to savedExercises
    setSavedExercises((prev) => [...prev, exerciseToSaveInMemory]);

    // Clear the state for a new exercise
    setSetsData([]); // Reset setsData
    setNumberOfSets("");
    setExerciseName("");
  };

  const handleNumberOfSetsChange = (text: string) => {
    const numSets = parseInt(text, 10);

    if (numSets > 0 && numSets < 100) {
      setNumberOfSets(text);

      // Initialize data for the specified number of sets
      const initialSets = Array.from({ length: numSets }, () => ({
        reps: "",
        weight: "",
      }));
      setSetsData(initialSets);
    }
  };

  const handleSetDataChange = (
    index: number,
    field: "reps" | "weight",
    value: string,
  ) => {
    setSetsData((prevData) =>
      prevData.map((set, i) =>
        i === index ? { ...set, [field]: value } : set,
      ),
    );
  };

  return (
    <PageWrapper
      navigate={navigation}
      selectedButton="CreateWorkout"
      hideNavBar
    >
      <Separator text="New Workout" />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <LabeledTextInput
            label="Workout Name *"
            placeholder="Enter workout name"
            value={workoutName}
            onChangeText={(text) => {
              setWorkoutName(text);
            }}
            style={{ paddingHorizontal: 20 }}
          />

          <View style={styles.setsInputContainer}>
            <View style={styles.container}>
              <Text style={styles.label}>Day of the week</Text>
              <StyledButton
                text={
                  selectedDay.length ? selectedDay : "Enter Day of the week"
                }
                onPress={() => {
                  Keyboard.dismiss();
                  setShowDaysModal(true);
                }}
                variant={selectedDay.length ? "selectedInput" : "input"}
              />
            </View>
            <LabeledTextInput
              label="Cardio Duration"
              placeholder="Enter cardio duration"
              value={cardioDuration}
              onChangeText={(text) => setCardioDuration(text)}
              type="number-pad"
            />
          </View>

          <Separator text="Exercises" />

          <View style={styles.setsInputContainer}>
            <LabeledTextInput
              label="Exercise Name *"
              placeholder="Enter exercise name"
              value={exerciseName}
              onChangeText={setExerciseName}
            />
            <LabeledTextInput
              label="Number of Sets *"
              placeholder="Enter number of sets"
              value={String(numberOfSets)}
              onChangeText={(text) => {
                if (Number(text) < 100) {
                  handleNumberOfSetsChange(text);
                }
              }}
              type="number-pad"
              onSubmitEditing={Keyboard.dismiss}
            />
          </View>

          {Array.from({ length: parseInt(numberOfSets || "0", 10) }).map(
            (_, index) => (
              <View key={index} style={styles.setsInputContainer}>
                <View style={styles.setNumberView}>
                  <Text>Set {index + 1}</Text>
                </View>
                <LabeledTextInput
                  label="Repetitions"
                  type="decimal-pad"
                  placeholder="Enter repetitions"
                  value={setsData[index]?.reps || ""}
                  onChangeText={(text) =>
                    handleSetDataChange(index, "reps", text)
                  }
                />
                <LabeledTextInput
                  label="Weight"
                  type="decimal-pad"
                  placeholder="Enter weight"
                  value={setsData[index]?.weight || ""}
                  onChangeText={(text) =>
                    handleSetDataChange(index, "weight", text)
                  }
                />
              </View>
            ),
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.buttonsContainer}>
        {savedExercises.length > 0 && (
          <StyledButton
            text="List Exercises"
            onPress={() => setShowExercisesModal(true)}
            variant="secondary"
          />
        )}
        {exerciseName.length > 0 && (
          <StyledButton
            text="Add Exercise"
            onPress={handleAddExercise}
            disabled={exerciseName.length === 0}
          />
        )}
        {exerciseName.length === 0 && savedExercises.length > 0 && (
          <StyledButton
            text="Create workout"
            onPress={() =>
              handleCreateWorkout(
                workoutDatabase,
                {
                  exercises: savedExercises,
                  workoutName,
                },
                () => navigation.navigate("ListAllWorkouts"),
              )
            }
          />
        )}
      </View>

      <Modal.Wrapper
        visible={showDaysModal}
        onClose={() => setShowDaysModal(false)}
      >
        <Modal.Header
          title="Day of the week"
          onClose={() => setShowDaysModal(false)}
          customIcon="calendar"
        />
        <Modal.Content>
          <ScrollView style={styles.modalItemsContainer}>
            {DAYS_OF_WEEK.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.modalItem,
                  selectedDay === day ? { backgroundColor: "#00A8E8" } : {},
                ]}
                onPress={() => {
                  setSelectedDay(day);
                  setShowDaysModal(false);
                }}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    selectedDay === day ? { color: "#fff" } : {},
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Modal.Content>
        <Modal.Footer
          mainButton={{
            text: "Clear",
            onPress: () => {
              setSelectedDay("");
              setShowDaysModal(false);
            },
            variant: "danger",
          }}
        />
      </Modal.Wrapper>

      <Modal.Wrapper
        visible={showExercisesModal}
        onClose={() => setShowExercisesModal(false)}
      >
        <Modal.Header
          title="Exercises"
          onClose={() => setShowExercisesModal(false)}
        />
        <Modal.Content>
          <ScrollView style={styles.modalItemsContainer}>
            {savedExercises.map((exercise, index) => (
              <View key={index} style={styles.modalItem}>
                <Text style={styles.modalItemText}>
                  {exercise.exerciseName}
                </Text>

                <View style={styles.badgeContainer}>
                  {exercise.sets.length > 0 &&
                    exercise.sets.map((set, idx) => (
                      <Text key={idx} style={styles.badge}>
                        {set.repetitions
                          ? set.repetitions + " reps "
                          : `Set ${idx + 1} ` + "Missing data"}
                        {set.weight ? set.weight + "kg" : ""}
                      </Text>
                    ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </Modal.Content>
      </Modal.Wrapper>
    </PageWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  setsInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 10,
    paddingHorizontal: 20,
    gap: 10,
  },
  setNumberView: {
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Lato",
    backgroundColor: "#ECECEC",
    borderRadius: 15,
    height: 40,
    width: 50,
  },
  separator: {
    width: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#D9D9D9",
    bottom: 20,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 10,
    padding: 20,
  },
  modalItemsContainer: {
    display: "flex",
    flexDirection: "column",
  },
  modalItem: {
    backgroundColor: "#F2F2F2",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 30,
    alignItems: "center",
  },
  modalItemText: {
    fontSize: 20,
    fontFamily: "Montserrat",
    fontWeight: "bold",
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: "#00171F",
    fontFamily: "Lato",
  },
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginTop: 5,
  },
  badge: {
    backgroundColor: "#00A8E8",
    color: "white",
    padding: 5,
    borderRadius: 10,
    fontFamily: "Lato",
  },
});
