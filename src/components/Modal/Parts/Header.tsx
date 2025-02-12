import { StyleSheet, Text, View } from "react-native";
import { Icon } from "react-native-elements";

type ModalHeaderProps = {
  customIcon?: string;
  title: string;
  onClose: () => void;
};

/**
 * Renders a header for a modal with a custom icon, title text, and a close button.
 *
 * @param props - The props object for this component.
 * @param props.title - The text displayed in the modal header.
 * @param props.onClose - Callback invoked when closing the modal.
 * @param props.customIcon - Optional name of the icon to display; defaults to "dumbbell".
 */
export function ModalHeader({
  title,
  onClose,
  customIcon = "dumbbell",
}: ModalHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.itemWrapperView}>
        <Icon
          name={customIcon}
          type="material-community"
          color="#00A8E8"
          size={30}
          accessible
          accessibilityLabel={customIcon}
          style={styles.customIcon}
        />
      </View>
      <View style={styles.itemWrapperView}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.itemWrapperView}>
        <View style={styles.iconContainer}>
          <Icon
            name="close"
            color="#B5B5B5"
            size={25}
            onPress={onClose}
            accessible
            accessibilityLabel="Close"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#BFBFBF",
  },
  iconContainer: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: "#F2F2F2",
  },
  itemWrapperView: {
    padding: 10,
  },
  customIcon: {
    borderRadius: 15,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F2F2",
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
  },
});
