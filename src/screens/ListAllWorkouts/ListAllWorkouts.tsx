import { CreateWorkoutProps } from "@/database/types";
import { useWorkoutDatabase } from "@/database/useWorkoutDatabase";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements";
import { Header } from "../../components/Header/Header";
import { PageWrapper } from "../../components/PageWrapper/PageWrapper";
import { Separator } from "../../components/Separator/Separator";
import { NavigationPageProps } from "../../types/navigation";

export function ListAllWorkouts({ navigation, route }: NavigationPageProps) {
    const [workouts, setWorkouts] = useState<CreateWorkoutProps[]>([])

    const workoutDatabase = useWorkoutDatabase();

    const handleListAllWorkouts = async () => {
        const result = await workoutDatabase.listAllWorkouts().catch((err) => {
            Alert.alert('Error', `There was an error listing all workouts: ${err.message}`);
            return { allWorkouts: [] as CreateWorkoutProps[] };
        });

        if (result && result.allWorkouts) {
            setWorkouts(result.allWorkouts);
        }
    }

    useFocusEffect(
        useCallback(() => {
            handleListAllWorkouts();
        }, [])
    );

    useEffect(() => {
        handleListAllWorkouts()
    }, [])

    return (
        <PageWrapper>
            <Header navigate={navigation} actionButtonIcon="add-circle" handleClickActionButton={() => navigation.navigate('CreateWorkout')} />
            <Separator text="Workouts" />

            <ScrollView style={styles.container}>
                {workouts && workouts.map((workout, index) => (
                    <TouchableOpacity
                        style={styles.createdExercisesContainer}
                        onPress={() => navigation.navigate('WorkoutDetails', { selectedWorkout: workout })}
                        key={index}
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