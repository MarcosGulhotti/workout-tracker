import { useWorkoutDatabase } from "@/database/useWorkoutDatabase";
import { useMemo, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Header } from "../../components/Header/Header";
import { LabeledTextInput } from "../../components/LabeledTextInput/LabeledTextInput";
import { PageWrapper } from "../../components/PageWrapper/PageWrapper";
import { Separator } from "../../components/Separator/Separator";
import { SetsInput } from "../../components/SetsInput/SetsInput";
import { StyledButton } from "../../components/StyledButton/StyledButton";
import { ExerciseSet } from "../../services/api/types";
import { NavigationPageProps } from "../../types/navigation";

export function CreateExercises({ navigation, route }: NavigationPageProps) {
    const [exerciseName, setExerciseName] = useState<string>('');
    const [numberOfSets, setNumberOfSets] = useState<string>('');

    const [reps, setReps] = useState<string[]>([]);

    const [savedExercises, setSavedExercises] = useState<{ exerciseName: string; sets: ExerciseSet[] }[]>([])

    const selectedWorkout = useMemo(() => route.params ? route.params.selectedWorkout : null, [route]);

    const workoutDatabase = useWorkoutDatabase();

    const handleSaveExercises = async () => {
        if (!selectedWorkout) {
            return;
        }

        savedExercises.forEach(async (elm) => {
            const exercises = workoutDatabase.addExerciseToWorkout(selectedWorkout.id, elm.exerciseName, elm.sets);
            console.log(exercises);
            // await addExerciseToWorkout(selectedWorkout.id, elm.exerciseName, elm.sets);
        })

        setReps([]);
        setNumberOfSets('');
        setExerciseName('');

        navigation.navigate('Home')
    }

    const handleAddExercise = async () => {
        if (!selectedWorkout) {
            return;
        }

        const sets = [...Array(parseInt(numberOfSets))].map((set, index) => {
            return {
                set_number: index + 1,
                repetitions: parseInt(reps[index]),
                weight: 0,
            };
        }) as unknown as ExerciseSet[]

        const exerciseToSaveInMemory = {
            exerciseName,
            sets
        }

        setSavedExercises([...savedExercises, exerciseToSaveInMemory])

        setReps([]);
        setNumberOfSets('');
        setExerciseName('');
    }

    return (
        <PageWrapper>
            <Header navigate={navigation} />

            <Separator text={selectedWorkout?.workout_name ?? 'Create Exercises'} />

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >
                <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 0 }}>
                    <LabeledTextInput
                        label="Exercise Name"
                        placeholder="Enter exercise name"
                        value={exerciseName}
                        onChangeText={setExerciseName}
                    />

                    <LabeledTextInput
                        label="Number of Sets"
                        placeholder="Enter number of sets"
                        value={String(numberOfSets)}
                        onChangeText={(text) => {
                            if (Number(text) < 100) {
                                setNumberOfSets(text)
                            }
                        }}
                        type="number-pad"
                        onSubmitEditing={Keyboard.dismiss}
                    />

                    <SetsInput
                        reps={reps}
                        setNewReps={setReps}
                        sets={Number(numberOfSets)}
                    />

                    {savedExercises.length > 0 && <Separator text="Created Exercises" />}

                    {savedExercises.length > 0 && (
                        savedExercises.map((exercise, index) => (
                            <View style={styles.createdExercisesContainer} key={index}>
                                <Text style={styles.texts}>{exercise.exerciseName}:</Text>
                                <View style={styles.setsContainer}>
                                    {exercise.sets.map((set, index) => (
                                        <View style={styles.setsTextContainer}>
                                            <Text style={styles.setsText} key={index}>{`Set ${set.set_number}: ${set.repetitions} reps`}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>

                <View style={styles.buttonsContainer}>
                    <StyledButton
                        text="Add Exercise"
                        onPress={handleAddExercise}
                        customStyles={{ marginHorizontal: 10, height: 40 }}
                        disabled={exerciseName.length === 0}
                    />
                    <StyledButton
                        text="Finish"
                        onPress={() => handleSaveExercises()}
                        customStyles={{ marginHorizontal: 10, height: 40 }}
                        disabled={exerciseName.length > 0 || reps.length > 0}
                    />
                </View>
            </KeyboardAvoidingView>
        </PageWrapper>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        width: '90%',
        alignSelf: 'center',
    },
    createdExercisesContainer: {
        flexDirection: 'row',
        marginTop: 5,
        flexWrap: 'wrap',
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    setsContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        paddingVertical: 5,
    },
    setsText: {
        fontFamily: 'Roboto',
        color: '#34495E',
    },
    setsTextContainer: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 5,
        paddingVertical: 10,
        margin: 5,
        width: 100,
        alignItems: 'center',
    },
    texts: {
        fontFamily: 'Roboto',
        fontSize: 18,
        color: '#34495E',
        fontWeight: 'bold',
    },
});
