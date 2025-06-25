import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function NavigationFooter({
  onPrevious,
  onNext,
  onFinish,
  onOpenExercises,
  previousDisabled = false,
  nextDisabled = false,
}: {
  onPrevious: () => void;
  onNext: () => void;
  onFinish: () => void;
  onOpenExercises: () => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
}) {
  return (
    <View style={styles.footerContainer}>
      {/* Previous */}
      <TouchableOpacity
        style={[styles.circleButton, previousDisabled && styles.disabledButton]}
        onPress={onPrevious}
        disabled={previousDisabled}
      >
        <Ionicons
          name="chevron-back"
          size={28}
          color={previousDisabled ? "#A0A0A0" : "#000"}
        />
      </TouchableOpacity>

      <View style={{ flex: 1, alignItems: "center" }}>
        {/* Finish */}
        <TouchableOpacity style={styles.finishButton} onPress={onFinish}>
          <MaterialCommunityIcons
            name="flag-checkered"
            size={22}
            color="white"
          />
          <Text style={styles.finishText}>Finish</Text>
        </TouchableOpacity>

        {/* Exercises */}
        <TouchableOpacity
          style={styles.exercisesButton}
          onPress={onOpenExercises}
        >
          <Text style={styles.exercisesText}>Exercises</Text>
        </TouchableOpacity>
      </View>

      {/* Next */}
      <TouchableOpacity
        style={[styles.circleButton, nextDisabled && styles.disabledButton]}
        onPress={onNext}
        disabled={nextDisabled}
      >
        <Ionicons
          name="chevron-forward"
          size={28}
          color={nextDisabled ? "#A0A0A0" : "#000"}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 30,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 30,
    backgroundColor: "#F2F2F2",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
  },
  disabledButton: {
    opacity: 0.4,
  },
  finishButton: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: "#00A8E8",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
  },
  finishText: {
    fontSize: 12,
    color: "white",
    fontWeight: "bold",
    marginTop: 5,
  },
  exercisesButton: {
    backgroundColor: "#F2F2F2",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginTop: 10,
  },
  exercisesText: {
    color: "#000",
    fontWeight: "bold",
  },
});
