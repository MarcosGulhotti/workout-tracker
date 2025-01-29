import { CompletedWorkout, WorkoutDetails, WorkoutExercisesDetails } from "@/database/types";
import { CompletedExerciseData, CompletedSetData, useWorkoutDatabase } from "@/database/useWorkoutDatabase";
import { useCallback, useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Header } from "../../components/Header/Header";
import { PageWrapper } from "../../components/PageWrapper/PageWrapper";
import { Separator } from "../../components/Separator/Separator";
import { StyledButton } from "../../components/StyledButton/StyledButton";
import { NavigationPageProps } from "../../types/navigation";

export function WorkingOut({ navigation, route }: NavigationPageProps) {
    const workoutId = useMemo(() => route.params ? route.params.workoutId : null, [route.params]);

    if (!workoutId) {
        navigation.goBack();
        return null;
    }
    const workoutDatabase = useWorkoutDatabase();

    const [currentWorkout, setCurrentWorkout] = useState<WorkoutDetails | null>(null);
    const [lastSavedWorkout, setLastSavedWorkout] = useState<CompletedWorkout | null>(null);

    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [currentExercise, setCurrentExercise] = useState<WorkoutExercisesDetails | null>(null);

    const [savedExercises, setSavedExercises] = useState<CompletedExerciseData[]>([]);
    const [savedSets, setSavedSets] = useState<CompletedSetData[]>([]);

    const shouldBlockNextButton = useMemo(() => {
        if (!currentWorkout || !currentExercise) return true;
        const nextIndex = currentExerciseIndex + 1;
        return nextIndex >= currentWorkout.exercises.length;
    }, [currentWorkout, currentExercise, currentExerciseIndex]);

    const handleGetWorkoutDetails = useCallback(async () => {
        if (!workoutId) return; // Type Safety
        const workout = await workoutDatabase.getWorkoutDetails(workoutId);
        if (!workout) {
            navigation.goBack();
            return;
        }
        setCurrentWorkout(workout);
        setCurrentExercise(workout.exercises[0]);
    }, [workoutId, workoutDatabase, navigation]);

    const handleGetHistory = useCallback(async () => {
        if (!workoutId) return; // Type Safety
        const lastWorkout = (await workoutDatabase.getWorkoutHistory(workoutId)).sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        })[0];
        if (!lastWorkout) return;

        console.log("🚀 Completed Workouts History:", JSON.stringify(lastWorkout, null, 2));
        setLastSavedWorkout(lastWorkout);
    }, [workoutId, workoutDatabase]);

    const handleNextExercise = useCallback(() => {
        if (!currentWorkout || !currentExercise) return;

        const nextIndex = currentExerciseIndex + 1;
        if (nextIndex >= currentWorkout.exercises.length) {
            return;
        }
        const completedExerciseSet = {
            exerciseId: currentExercise.exercise_id,
            exerciseName: currentExercise.exercise_name,
            completed_sets: savedSets.map((set) => ({
                setNumber: set.setNumber,
                repetitions: set.repetitions,
                weight: set.weight,
            }))
        }

        setSavedExercises([...savedExercises, ...[completedExerciseSet]]);
        setCurrentExerciseIndex(nextIndex);
        setCurrentExercise(currentWorkout.exercises[nextIndex]);

        setSavedSets([]);
    }, [currentWorkout, currentExercise, currentExerciseIndex, savedSets, savedExercises]);

    const handleSaveWorkout = useCallback(async () => {
        if (!currentWorkout || !currentExercise) return;

        const completedExerciseSet = {
            exerciseId: currentExercise.exercise_id,
            exerciseName: currentExercise.exercise_name,
            completed_sets: savedSets.map((set) => ({
                setNumber: set.setNumber,
                repetitions: set.repetitions,
                weight: set.weight,
            }))
        }

        const completed_exercises = [...savedExercises, ...[completedExerciseSet]];

        const completedWorkoutData = {
            workout_id: currentWorkout.workout_id,
            workout_name: currentWorkout.workout_name,
            date: new Date().toISOString(),
            completed_exercises
        };

        console.log("🚀 Completed Workout Data:", JSON.stringify(completedWorkoutData, null, 2));

        await workoutDatabase.saveCompletedWorkout(completedWorkoutData);
        navigation.goBack();
    }, [savedSets, savedExercises, currentWorkout, currentExercise]);

    useEffect(() => {
        if (currentWorkout) return;

        handleGetWorkoutDetails();
        handleGetHistory();
    }, [currentWorkout, handleGetWorkoutDetails, handleGetHistory]);

    return (
        <PageWrapper>
            <Header navigate={navigation} />
            <Separator text={currentWorkout?.workout_name ?? ''} />

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >
                <ScrollView style={styles.container}>
                    <Text style={styles.title}>Exercise: {currentWorkout?.exercises[currentExerciseIndex].exercise_name}</Text>

                    <View style={styles.repInputContainer}>
                        {
                            currentExercise?.sets?.map((set, index) => {
                                return (
                                    <View key={index}>
                                        <Text>Set {set.set_number} - {set.repetitions} Reps</Text>
                                        <View style={styles.setsContainer}>
                                            <Text>Reps</Text>
                                            <TextInput
                                                style={styles.repInput}
                                                keyboardType="number-pad"
                                                placeholder={`${set.repetitions}`}
                                                onChangeText={(value) => {
                                                    const currentEditedSet = savedSets.filter((editedSet) => editedSet.setNumber === String(set.set_number));
                                                    const updatedSets = savedSets.filter((s) => s.setNumber !== String(set.set_number));

                                                    if (currentEditedSet.length > 0) {
                                                        setSavedSets([
                                                            ...updatedSets, {
                                                                repetitions: value,
                                                                setNumber: String(set.set_number),
                                                                weight: currentEditedSet[0].weight
                                                            }])
                                                    } else {
                                                        setSavedSets([
                                                            ...updatedSets, {
                                                                repetitions: value,
                                                                setNumber: String(set.set_number),
                                                                weight: ''
                                                            }])
                                                    }
                                                }
                                                }
                                            />
                                            <Text>Weight</Text>
                                            <TextInput
                                                style={styles.repInput}
                                                keyboardType="number-pad"
                                                placeholder="Weight"
                                                onChangeText={(value) => {
                                                    const currentEditedSet = savedSets.filter((editedSet) => editedSet.setNumber === String(set.set_number));
                                                    const updatedSets = savedSets.filter((s) => s.setNumber !== String(set.set_number));

                                                    if (currentEditedSet.length > 0) {
                                                        setSavedSets([
                                                            ...updatedSets, {
                                                                repetitions: currentEditedSet[0].repetitions,
                                                                setNumber: String(set.set_number),
                                                                weight: value
                                                            }])
                                                    } else {
                                                        setSavedSets([
                                                            ...savedSets, {
                                                                repetitions: String(set.repetitions),
                                                                setNumber: String(set.set_number),
                                                                weight: value
                                                            }])
                                                    }
                                                }
                                                }
                                            />
                                        </View>
                                    </View>
                                );
                            })
                        }
                    </View>
                </ScrollView>

                <View style={styles.buttonsContainer}>
                    {shouldBlockNextButton ? (
                        <StyledButton
                            customStyles={{ height: 45, margin: 10 }}
                            text="SAVE"
                            onPress={handleSaveWorkout}
                        />
                    )
                        : <StyledButton
                            customStyles={{ height: 45, margin: 10 }}
                            text="Next"
                            onPress={handleNextExercise}
                            disabled={shouldBlockNextButton}
                        />}
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
