import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";
import { ScreenNavigationProp } from "../../types/navigation";

type HeaderProps = {
  navigate: ScreenNavigationProp;
  showAddButton?: boolean;
};

export function Header({ navigate, showAddButton = true }: HeaderProps) {
  const canGoBack = useMemo(() => navigate.canGoBack(), [navigate]);

  return (
    <View style={styles.headerContent}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {canGoBack && (
          <Icon
            name="navigate-before"
            color="#1E1E1E"
            size={28}
            onPress={navigate.goBack}
          />
        )}

        <Text style={styles.headerText}>Workout Tracker</Text>
      </View>

      <View style={styles.iconsContainer}>
        {showAddButton && (
          <TouchableOpacity onPress={() => navigate.navigate("CreateWorkout")}>
            <Icon name="add" color={"#1E1E1E"} size={24} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => navigate.navigate("ListAllWorkouts")}>
          <Icon name="search" color={"#1E1E1E"} size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContent: {
    height: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    borderBottomColor: "#E0E0E0",
    borderBottomWidth: 1,
  },
  headerText: {
    fontFamily: "Lato",
    fontSize: 20,
    fontWeight: "bold",
  },
  iconsContainer: {
    flexDirection: "row",
    gap: 20,
  },
});
