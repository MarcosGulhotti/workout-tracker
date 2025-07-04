import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";
import { ScreenNavigationProp } from "../../types/navigation";

export type HeaderProps = {
  navigate: ScreenNavigationProp;
  showAddButton?: boolean;
  showSearchButton?: boolean;
  customButton?: string;
  customButtonOnPress?: () => void;
  modalOpen?: boolean;
};

export function Header({
  navigate,
  customButton,
  customButtonOnPress,
  showAddButton = true,
  showSearchButton = true,
  modalOpen = false,
}: HeaderProps) {
  const canGoBack = useMemo(() => navigate.canGoBack(), [navigate]);

  return (
    <View
      style={[styles.headerContent, { borderBottomWidth: modalOpen ? 0 : 1 }]}
    >
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
            <Icon name="add" color="#1E1E1E" size={24} />
          </TouchableOpacity>
        )}
        {showSearchButton && (
          <TouchableOpacity
            onPress={() => navigate.navigate("ListAllWorkouts")}
          >
            <Icon name="search" color="#1E1E1E" size={24} />
          </TouchableOpacity>
        )}
        {customButton && (
          <TouchableOpacity onPress={customButtonOnPress}>
            <Icon name={customButton} color="#1E1E1E" size={24} />
          </TouchableOpacity>
        )}
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
