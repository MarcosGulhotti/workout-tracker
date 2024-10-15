import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements";
import { Header } from "../../components/Header/Header";
import { PageWrapper } from "../../components/PageWrapper/PageWrapper";
import { Separator } from "../../components/Separator/Separator";
import { WorkoutDetails } from "../../services/api/types";
import { listAllWorkouts } from "../../services/api/workoutClient";
import { NavigationPageProps } from "../../types/navigation";

export function ListAllWorkouts({ navigation, route }: NavigationPageProps) {
    const [workouts, setWorkouts] = useState<WorkoutDetails[]>([])

    const handleListAllWorkouts = async () => {
        const workouts = await listAllWorkouts();

        setWorkouts(workouts);
    }

    useEffect(() => {
        handleListAllWorkouts()
    }, [])

    return (
        <PageWrapper>
            <Header navigate={navigation} showAddButton />
            <Separator text="Workouts" />

            <ScrollView style={styles.container}>
                {workouts && workouts.map((workout, index) => (
                    <TouchableOpacity
                        style={styles.createdExercisesContainer}
                        onPress={() => navigation.navigate('WorkoutDetails', { selectedWorkout: workout })}
                    >
                        <Text style={styles.texts}>{workout.workout_name}</Text>
                        <Icon name="chevron-right" color='black' />
                    </TouchableOpacity>

                ))}
            </ScrollView>

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
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
        padding: 10,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#e5e5e5',
    },
    texts: {
        color: 'black'
    }
})