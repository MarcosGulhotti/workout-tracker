import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Header } from "../../components/Header/Header";
import { Input } from "../../components/Input/Input";
import { PageWrapper } from "../../components/PageWrapper/PageWrapper";
import { Separator } from "../../components/Separator/Separator";
import { StyledButton } from "../../components/StyledButton/StyledButton";
import { getWeightsHistory, saveCompletedWorkout } from "../../services/api/hooks/ActiveWorkout/ActiveWorkout";
import { Exercise } from "../../services/api/types";
import { NavigationPageProps } from "../../types/navigation";

export type SavedWeights = {
    exerciseId: string;
    exerciseName: string;
    sets: {
        setNumber: string;
        weight: string;
        repetitions: string;
    }[]
}

export function WorkingOut({ navigation, route }: NavigationPageProps) {
    const selectedWorkout = useMemo(() => route.params ? route.params.selectedWorkout : null, [route]);

    // Accert that user can't start a workout without any exercises.
    if (!selectedWorkout || !selectedWorkout.exercises) {
        navigation.goBack()
        return;
    }

    const [currentExercise, setCurrentExercise] = useState<Exercise>(selectedWorkout.exercises[0])

    const [savedWeights, setSavedWeights] = useState<SavedWeights[]>([])

    const [weights, setWeights] = useState<string[]>([])

    /**
     * Handles the transition to the next exercise in the selected workout.
     *
     * @returns {void}
     */
    const handleNextExercise = () => {
        if (!selectedWorkout.exercises) return;

        const nextExercise = selectedWorkout.exercises.findIndex((elm) => elm.id === currentExercise.id)

        const savedSet = {
            exerciseId: currentExercise.id,
            exerciseName: currentExercise.exercise_name,
            sets: currentExercise.sets.map((set) => ({
                setNumber: set.set_number,
                weight: weights[Number(set.set_number) - 1],
                repetitions: set.repetitions
            }))
        } as SavedWeights

        if (!selectedWorkout.exercises[nextExercise + 1]) {
            setSavedWeights([...savedWeights, savedSet])
            setWeights([])
            setCurrentExercise(selectedWorkout.exercises[0])
            return;
        }

        setSavedWeights([...savedWeights, savedSet])
        setCurrentExercise(selectedWorkout.exercises[nextExercise + 1])
        setWeights([])
    }

    const handleSaveWorkout = () => {
        saveCompletedWorkout({workout_id: selectedWorkout.id, workoutName: selectedWorkout.workout_name, date: new Date().toLocaleString(), savedWeights })
    }

    /**
     * Retrieves the saved weight for a specific set of the current exercise.
     *
     * @param {number} index - The index of the set for which to retrieve the weight.
     * @returns {string} - The weight for the specified set. If no saved weight is found, returns the default weight.
     */
    const getSavedWeights = async (index: number): Promise<string> => { //! TODO Check this function
        console.log('getSavedWeights')
        const weightHistory = await getWeightsHistory(selectedWorkout.id)

        const arrayToMap = weightHistory ?? savedWeights.find((elm) => elm.exerciseId === currentExercise.id)
        
        if (arrayToMap) {
            return arrayToMap.sets[index].weight
        }

        return weights[index]
    }

    return (
        <PageWrapper>
            <Header navigate={navigation} />
            <Separator text={selectedWorkout?.workout_name ?? ''} />

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >
                <ScrollView style={styles.container}>
                    <Text style={styles.title}>Exercise: {currentExercise.exercise_name}</Text>

                    <View style={styles.repInputContainer}>
                        {currentExercise.sets.map((set, index) => (
                            <View style={styles.inputContainer} key={index}>
                                <View>
                                    <Text key={index}>
                                        Set {set.set_number}:
                                    </Text>
                                </View>
                                <View style={styles.setsContainer}>
                                    <View style={styles.repsContainer}>
                                        <Text>Repetitions - </Text>
                                        <TextInput // TODO Add last workout reps
                                            style={styles.repInput}
                                            placeholder={`${set.repetitions}`}
                                            value={set.repetitions.toString()}
                                        />
                                    </View>
                                    <View style={styles.repsContainer}>
                                        <Text>Weight - </Text>
                                        <View style={styles.centeredInput}>
                                            <Input //TODO Add last workout weight - TEST THIS
                                                style={styles.repInput}
                                                keyboardType="number-pad"
                                                onChangeText={text => {
                                                    const newReps = [...weights];
                                                    newReps[index] = text;
                                                    setWeights(newReps);
                                                }}
                                                getValue={async () => await getSavedWeights(index)}
                                                placeholder={set.weight}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>

                <View style={styles.buttonsContainer}>
                    <StyledButton customStyles={{ height: 45, margin: 10 }} text="Next" onPress={handleNextExercise} />

                    {currentExercise.id === selectedWorkout.exercises[selectedWorkout.exercises.length - 1].id && (
                        <StyledButton customStyles={{ height: 45, margin: 10 }} text="SAVE" onPress={handleSaveWorkout} />
                    )}
                </View>

            </KeyboardAvoidingView>
        </PageWrapper>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        flex: 1
    },
    title: {
        fontSize: 28,
        marginBottom: 10
    },
    repInputContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
    },
    inputContainer: {
        padding: 10,
    },
    repInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        width: 60,
        borderRadius: 5,
        padding: 5,
    },
    repsContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10
    },
    setsContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    centeredInput: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }
})