import { NavigationOptions } from "@/screens";
import { StyleSheet, Text, View } from "react-native";
import { Icon } from "react-native-elements";

type NavBarProps = {
  selectedButton: NavigationOptions;
  handleNavigate?: (option: NavigationOptions) => void;
};

export function NavBar({ handleNavigate, selectedButton }: NavBarProps) {
  const handlePress = (index: NavigationOptions) => {
    handleNavigate && handleNavigate(index);
  };

  return (
    <View style={styles.container}>
      <View
        style={
          selectedButton === "Home" ? styles.selectedIcon : styles.iconContainer
        }
      >
        <Icon
          name="home"
          color="#1E1E1E"
          size={35}
          onPress={() => handlePress("Home")}
          accessible
          accessibilityLabel="Home"
        />
        <Text style={styles.styledText}>Home</Text>
      </View>
      <View
        style={
          selectedButton === "ListAllWorkouts"
            ? styles.selectedIcon
            : styles.iconContainer
        }
      >
        <Icon
          name="list"
          color="#1E1E1E"
          size={35}
          onPress={() => handlePress("ListAllWorkouts")}
          accessible
          accessibilityLabel="Workouts"
        />
        <Text style={styles.styledText}>Workouts</Text>
      </View>
      <View
        style={
          selectedButton === "History"
            ? styles.selectedIcon
            : styles.iconContainer
        }
      >
        <Icon
          name="history"
          color="#1E1E1E"
          size={35}
          onPress={() => handlePress("History")}
          accessible
          accessibilityLabel="List"
        />
        <Text style={styles.styledText}>History</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  selectedIcon: {
    justifyContent: "center",
    alignItems: "center",
  },
  styledText: {
    fontFamily: "Lato",
    fontSize: 12,
  },
});
