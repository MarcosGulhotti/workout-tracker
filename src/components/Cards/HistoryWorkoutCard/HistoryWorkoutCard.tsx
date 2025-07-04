import { CompletedWorkout } from "@/database/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";

/**
 * Renders a list of CompletedWorkout cards.
 *
 * @component
 * @param {CompletedWorkout[]} CompletedWorkouts - An array of CompletedWorkout objects to display.
 * @param {() => void} onPress - Callback function to handle press events on the more options button.
 * @returns {JSX.Element[]} An array of CompletedWorkout card components.
 *
 */
export default function HistoryWorkoutCard({
  completedWorkouts,
  onPress,
}: {
  completedWorkouts: CompletedWorkout[];
  onPress: (workout: CompletedWorkout) => void;
}) {
  return completedWorkouts.map((workout, index) => (
    <View style={styles.createdExercisesContainer} key={index}>
      <View>
        <Text style={styles.title}>
          {workout.workout_name} -{" "}
          {format(workout.date, "PPP", { locale: ptBR })}
        </Text>
        <Text style={styles.texts}>
          {workout.completed_exercises?.length ?? "No"} Completed Exercises
        </Text>
      </View>
      <TouchableOpacity
        style={{ width: 30, backgroundColor: "transparent" }}
        onPress={() => onPress(workout)}
      >
        <Icon name="more-vert" color="#BDBDBD" />
      </TouchableOpacity>
    </View>
  ));
}

const styles = StyleSheet.create({
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
});
