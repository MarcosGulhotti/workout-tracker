import React from "react";
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from "react-native";
import { Input } from "../Input/Input";

interface LabeledTextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  style?: TextStyle;
  inputStyle?: TextStyle;
  type?: KeyboardTypeOptions;
  onSubmitEditing?: () => void;
  error?: boolean;
  onPress?: () => void;
}

export function LabeledTextInput({
  label,
  value,
  inputStyle,
  onChangeText,
  onSubmitEditing,
  onPress,
  placeholder = "",
  secureTextEntry = false,
  type = "default",
  style = {}, // Default to an empty object
  error = false,
}: LabeledTextInputProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.label, error && styles.errorLabel]}>{label}</Text>
      <Input
        style={[
          styles.input,
          inputStyle,
          error && styles.errorInput, // Apply error style if error is true
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={type}
        onSubmitEditing={onSubmitEditing}
        onEndEditing={onSubmitEditing}
        getValue={() => Promise.resolve(value)}
        onPress={onPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: "#00171F",
    fontFamily: "Lato",
  },
  input: {
    borderWidth: 1,
    borderColor: "#BDBDBD",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    height: 40,
  },
  errorInput: {
    borderColor: "red",
  },
  errorLabel: {
    color: "red",
  },
});
