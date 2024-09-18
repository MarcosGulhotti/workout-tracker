import React, { useState } from 'react';
import { Button, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { ExerciseSet, WorkoutDetails } from '../../services/api/types';
import { addExerciseToWorkout, createNewExercise, createNewWorkout, getWorkoutDetails, hardResetProject, listAllWorkouts } from '../../services/api/workoutClient';

export function Home() {
    const [workouts, setWorkouts] = useState<WorkoutDetails[]>([]);

    const [workoutName, setWorkoutName] = useState<string>('');

    const [exerciseName, setExerciseName] = useState<string>('');
    const [numberOfSets, setNumberOfSets] = useState<string>('');

    const [selectedWorkout, setSelectedWorkout] = useState<WorkoutDetails | null>(null);

    const [detailedWorkout, setDetailedWorkout] = useState<WorkoutDetails | null>(null);
    const [showWorkoutDetails, setShowWorkoutDetails] = useState<boolean>(false);

    const [reps, setReps] = useState<string[]>([]);

    const handleListAllWorkouts = async () => {
        const workouts = await listAllWorkouts();

        setWorkouts(workouts);
    }

    const handleCreateWorkout = async () => {
        const today = new Date();
        await createNewWorkout(workoutName, today.getDay().toString());
    }

    const handleCreateExercise = async () => {
        if (!selectedWorkout || !exerciseName) return;
        await createNewExercise(selectedWorkout.id, exerciseName)
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

        await addExerciseToWorkout(selectedWorkout.id, exerciseName, sets);
    }

    const handleShowWorkoutDetails = async (id: string) => {
        if (!id) {
            return;
        }

        const output = await getWorkoutDetails(id);

        console.log('OUTPUT', output?.exercises)

        setDetailedWorkout(output ?? null);

        setShowWorkoutDetails(!showWorkoutDetails);
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text>Welcome to the Home Screen</Text>

            <TextInput style={styles.input} placeholder="Enter workout name" value={workoutName} onChangeText={text => setWorkoutName(text)} />

            <Button title="Create workout" onPress={handleCreateWorkout} />

            <Button title="List all workouts" onPress={handleListAllWorkouts} />

            <Button title="HARD RESET" onPress={hardResetProject} />

            {workouts.map((workout) => (
                <TouchableOpacity style={workout.id === selectedWorkout?.id ? styles.selectedWorkout : styles.selectWorkout} key={workout.id}
                    onPress={() => {
                        setSelectedWorkout(workout);
                    }}
                >
                    <Text>{workout.workout_name}</Text>
                </TouchableOpacity>
            ))}

            {showWorkoutDetails && detailedWorkout && (
                <>
                    <Text>Exercicio: {detailedWorkout.workout_name} - Dia: {detailedWorkout.day_of_week}</Text>
                    {detailedWorkout.exercises?.map(exercise => (
                        <>
                            <Text key={exercise.id}>{exercise.exercise_name}</Text>
                            <Text>{exercise.sets.map(set => (
                                <Text key={set.set_number}>{set.set_number} - {set.repetitions}</Text>

                            ))}</Text>
                        </>
                    ))}
                </>
            )}

            {selectedWorkout && (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter exercise name"
                        value={exerciseName}
                        onChangeText={text => setExerciseName(text)}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Enter number of sets"
                        value={numberOfSets}
                        onChangeText={text => setNumberOfSets(text)}
                    />

                    {numberOfSets && [...Array(parseInt(numberOfSets))].map((set, index) => (
                        <TextInput
                            key={index}
                            style={styles.input}
                            placeholder={`Enter number of reps for set ${index + 1}`}
                            value={reps[index]}
                            onChangeText={text => {
                                const newReps = [...reps];
                                newReps[index] = text;
                                setReps(newReps);
                            }}
                        />
                    ))}

                    <Button title="Add exercise" onPress={handleAddExercise} />
                </>
            )}

            {selectedWorkout && (
                <Button title='Show Details' onPress={() => {
                    handleShowWorkoutDetails(selectedWorkout.id);
                }} />
            )}


        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    input: {
        borderWidth: 1,
        borderColor: 'black',
        padding: 10,
        margin: 10,
    },
    selectWorkout: {
        borderWidth: 1,
        borderColor: 'black',
        padding: 10,
        margin: 10,
    },
    selectedWorkout: {
        borderWidth: 1,
        borderColor: 'black',
        padding: 10,
        margin: 10,
        backgroundColor: 'grey',
    }
});