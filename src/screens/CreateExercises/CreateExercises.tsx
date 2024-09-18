import { useMemo, useState } from "react";
import { Keyboard, ScrollView, StyleSheet, Text, View } from "react-native";
import { Header } from "../../components/Header/Header";
import { LabeledTextInput } from "../../components/LabeledTextInput/LabeledTextInput";
import { PageWrapper } from "../../components/PageWrapper/PageWrapper";
import { Separator } from "../../components/Separator/Separator";
import { StyledButton } from "../../components/StyledButton/StyledButton";
import { ExerciseSet } from "../../services/api/types";
import { addExerciseToWorkout } from "../../services/api/workoutClient";
import { NavigationPageProps } from "../../types/navigation";

export function CreateExercises({ navigation, route }: NavigationPageProps) {
    const [exerciseName, setExerciseName] = useState<string>('');
    const [numberOfSets, setNumberOfSets] = useState<string>('');

    const [reps, setReps] = useState<string[]>([]);

    const [savedExercises, setSavedExercises] = useState<{ exerciseName: string; sets: ExerciseSet[] }[]>([])

    const selectedWorkout = useMemo(() => route.params ? route.params.selectedWorkout : null, [route]);

    const handleSaveExercises = async () => {
        if (!selectedWorkout) {
            return;
        }

        savedExercises.forEach(async (elm) => {
            await addExerciseToWorkout(selectedWorkout.id, elm.exerciseName, elm.sets);
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

            <ScrollView style={styles.content}>
                <LabeledTextInput
                    label="Exercise Name"
                    placeholder="Enter exercise name"
                    value={exerciseName}
                    onChangeText={setExerciseName}
                />

                <LabeledTextInput
                    label="Number of Sets"
                    placeholder="Enter number of sets"
                    value={numberOfSets}
                    onChangeText={setNumberOfSets}
                    type="number-pad"
                    onSubmitEditing={() => Keyboard.dismiss}
                />

                {numberOfSets && [...Array(parseInt(numberOfSets))].map((set, index) => (
                    <LabeledTextInput
                        key={index}
                        label={`Set ${index + 1}`}
                        placeholder={`Enter number of reps for set ${index + 1}`}
                        type="number-pad"
                        value={reps[index]}
                        onChangeText={text => {
                            const newReps = [...reps];
                            newReps[index] = text;
                            setReps(newReps);
                        }}
                        onSubmitEditing={() => Keyboard.dismiss}
                    />
                ))}

                {savedExercises.length > 0 && <Separator text="Created Exercises" />}

                {savedExercises.length > 0 && (
                    savedExercises.map((exercise) =>
                        <View style={{ marginVertical: 10 }}>
                            <Text>{exercise.exerciseName}</Text>
                            <View style={styles.createdExercisesContainer}>
                                {exercise.sets.map((sets, ind) => <Text>1x{sets.repetitions} {ind < exercise.sets.length - 1 && ', '}</Text>)}
                            </View>
                        </View>
                    )
                )}

                <View style={styles.buttonsContainer}>
                    <StyledButton
                        text="Add Exercise"
                        onPress={handleAddExercise}
                        customStyles={{ marginHorizontal: 10, height: 40 }}
                        disabled={exerciseName.length === 0}
                    />
                    <StyledButton //TODO - ADD MODAL VALIDATION TO FINISH IF THERE IS A EXERCISE BEING CREATED, EXERCISE WILL NOT BE SAVED IF USER DONT USE ADD BUTTON.
                        text="Finish"
                        onPress={() => handleSaveExercises()}
                        customStyles={{ marginHorizontal: 10, height: 40 }}
                        disabled={exerciseName.length > 0 || reps.length > 0}
                    />
                </View>
            </ScrollView>
        </PageWrapper>
    )
}

const styles = StyleSheet.create({
    content: {
        width: '90%',
        alignSelf: 'center'
    },
    createdExercisesContainer: {
        display: 'flex',
        flexDirection: 'row',
        marginTop: 5
    },
    title: {},
    buttonsContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignSelf: 'center',
        width: '95%',
    },
});