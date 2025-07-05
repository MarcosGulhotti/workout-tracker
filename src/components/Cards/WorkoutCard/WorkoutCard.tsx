import { Workout } from "@/database/types";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * Renders a list of workout cards.
 *
 * @component
 * @param {Workout[]} workouts - An array of workout objects to display.
 * @param {() => void} onPress - Callback function to handle press events on the more options button.
 * @returns {JSX.Element[]} An array of workout card components.
 *
 */
export default function WorkoutCard({
  workouts,
  onPress,
}: {
  workouts: Workout[];
  onPress: (workout: Workout) => void;
}) {
  return workouts.map((workout, index) => (
    <TouchableOpacity
      onPress={() => onPress(workout)}
      style={styles.createdExercisesContainer}
      key={index}
    >
      <View>
        <Text style={styles.title}>{workout.name}</Text>
        <Text style={styles.texts}>
          {workout.exercises?.length ?? "No"} Exercises
        </Text>
      </View>
    </TouchableOpacity>
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
