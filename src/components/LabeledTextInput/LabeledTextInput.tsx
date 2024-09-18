import React from 'react';
import { KeyboardTypeOptions, StyleSheet, Text, TextInput, View } from 'react-native';

interface LabeledTextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean; // For password fields
  style?: object; // Optional additional styles
  type?: KeyboardTypeOptions
  onSubmitEditing?: () => void
}

export function LabeledTextInput({
  label,
  value,
  onChangeText,
  placeholder = '',
  secureTextEntry = false,
  type = 'default',
  onSubmitEditing,
  style = {}, // Default to an empty object
}: LabeledTextInputProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={type}
        onSubmitEditing={onSubmitEditing}
        onEndEditing={onSubmitEditing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#34495E', // Dark color for the label
  },
  input: {
    borderWidth: 1,
    borderColor: '#BDC3C7', // Light gray border
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#ECF0F1', // Light gray background
  },
});
