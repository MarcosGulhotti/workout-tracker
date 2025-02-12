import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { TouchableOpacityProps } from "react-native-gesture-handler";

export type StyledButtonProps = {
  text: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "danger" | "input" | "selectedInput";
  customStyles?: { [key: string]: any };
} & TouchableOpacityProps;

export function StyledButton({
  text,
  onPress,
  customStyles,
  variant = "primary",
  ...props
}: StyledButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.styledButton, styles[variant], customStyles]}
      onPress={onPress}
      {...props}
    >
      <Text style={[styles.styledText, styles[`${variant}Text`]]}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  styledButton: {
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
  },
  styledText: {
    fontSize: 16,
    fontFamily: "Lato",
    fontWeight: "bold",
    textAlign: "center",
  },
  primary: {
    backgroundColor: "#00A8E8",
  },
  secondary: {
    backgroundColor: "#ECECEC",
  },
  primaryText: {
    color: "white",
  },
  secondaryText: {
    color: "#333333",
  },
  danger: {
    backgroundColor: "#FB2E31",
  },
  dangerText: {
    color: "white",
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BDBDBD",
  },
  selectedInput: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BDBDBD",
  },
  inputText: {
    color: "#BDBDBD",
    fontWeight: "normal",
    textAlign: "left",
    marginLeft: 10,
  },
  selectedInputText: {
    color: "#333333",
    fontWeight: "normal",
    textAlign: "left",
    marginLeft: 10,
  },
});
