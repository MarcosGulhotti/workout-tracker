import React, { useRef } from "react";
import { Keyboard, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { TextInputProps } from "react-native";

type SetsInputProps = TextInputProps & {
    sets: number | null;
    reps: string[];
    setNewReps: (newReps: string[]) => void;
}

export function SetsInput(props: SetsInputProps) {
    const { sets, reps, setNewReps } = props;

    // Create a ref for each TextInput
    const inputRefs = useRef<TextInput[] | null>([]);

    return (
        <View style={styles.container}>
            {[...Array(sets)].map((set, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.inputContainer}
                    // Focus the specific TextInput when the corresponding View is pressed
                    onPress={() => {
                        if (inputRefs.current && inputRefs.current[index]) {
                            inputRefs.current[index].focus();
                        }
                    }}
                >
                    <TextInput
                        ref={(ref) => {
                            if (ref && inputRefs.current) {
                                inputRefs.current[index] = ref
                            }
                        }} // Attach a ref to each TextInput
                        placeholder={`Set ${index + 1}`}
                        keyboardType="number-pad"
                        value={reps[index]}
                        onChangeText={text => {
                            const newReps = [...reps];
                            newReps[index] = text;
                            setNewReps(newReps);
                        }}
                        onSubmitEditing={() => Keyboard.dismiss()}
                        style={styles.input}
                    />
                </TouchableOpacity>
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingVertical: 10
    },
    inputContainer: {
        width: 60,
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 10,
        margin: 5,
    },
    input: {
        flex: 1,
        flexGrow: 1,
        padding: 10,
        borderRadius: 10,
    }
});
