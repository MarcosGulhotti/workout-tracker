import { useEffect, useMemo, useState } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";
import { Header } from "../../components/Header/Header";
import { PageWrapper } from "../../components/PageWrapper/PageWrapper";
import { Separator } from "../../components/Separator/Separator";
import { WorkoutDetails } from "../../services/api/types";
import { CompletedWorkoutDetails, deleteWorkout, getCompletedWorkoutDetails, getWorkoutDetails } from "../../services/api/workoutClient";
import { NavigationPageProps } from "../../types/navigation";

export function WorkoutDetailsPage({ navigation, route }: NavigationPageProps) {
    const [workoutDetails, setWorkoutDetails] = useState<WorkoutDetails | null>(null);

    const [completedWorkoutDetails, setCompletedWorkoutDetails] = useState<CompletedWorkoutDetails | null>(null)

    const selectedWorkout = useMemo(() => route.params ? route.params.selectedWorkout : null, [route]);

    const handleGetWorkoutDetails = async () => {
        if (!selectedWorkout) {
            return;
        }
        const test = await getCompletedWorkoutDetails(selectedWorkout?.id)
        const output = await getWorkoutDetails(selectedWorkout.id);

        setCompletedWorkoutDetails(test)

        setWorkoutDetails(output)
    }

    const handleDeleteWorkout = async () => {
        if (selectedWorkout && selectedWorkout.id) {
            await deleteWorkout(selectedWorkout.id)
        }
    }

    useEffect(() => {
        handleGetWorkoutDetails()
    }, [])

    return (
        <PageWrapper>
            <Header navigate={navigation} />
            <Separator text={selectedWorkout?.workout_name ?? 'Workout Details'} />
            <ScrollView style={styles.container}>
                {workoutDetails?.exercises?.map((exercise, index) => (
                    <View style={styles.createdExercisesContainer} key={index}>
                        <Text style={styles.texts}>{exercise.exercise_name}:</Text>
                        <View style={styles.setsContainer}>
                            {exercise.sets.map((set, index) => (
                                <View style={styles.setsTextContainer} key={index}>
                                    <Text style={styles.setsText} key={index}>{`Set ${set.set_number}: ${set.repetitions} reps`}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                <Button title="Delete" onPress={handleDeleteWorkout} />

                <View>
                    <Separator text="Last Completed Workout" />

                    <Text>{completedWorkoutDetails?.workoutName} - {completedWorkoutDetails?.date}</Text>

                    {completedWorkoutDetails?.exercises.map((exercise) => (
                        <View>
                            <Text>{exercise.exerciseName}:</Text>
                            {exercise.sets.map((set, index) => (
                                <View style={styles.setsTextContainer} key={index}>
                                    <Text style={styles.setsText} key={index}>{`Set ${set.setNumber}: ${set.repetitions} reps - ${set.weight}Kg`}</Text>
                                </View>
                            ))}
                        </View>
                    ))}

                </View>
            </ScrollView>
        </PageWrapper>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    createdExercisesContainer: {
        paddingHorizontal: 20,
        paddingVertical: 5,
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