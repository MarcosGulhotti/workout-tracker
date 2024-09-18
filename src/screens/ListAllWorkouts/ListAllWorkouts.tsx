import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { ListItem } from "react-native-elements";
import { Header } from "../../components/Header/Header";
import { PageWrapper } from "../../components/PageWrapper/PageWrapper";
import { Separator } from "../../components/Separator/Separator";
import { StyledButton } from "../../components/StyledButton/StyledButton";
import { WorkoutDetails } from "../../services/api/types";
import { deleteWorkout, getWorkoutDetails, listAllWorkouts } from "../../services/api/workoutClient";
import { NavigationPageProps } from "../../types/navigation";

export function ListAllWorkouts({ navigation, route }: NavigationPageProps) {
    const [workouts, setWorkouts] = useState<WorkoutDetails[]>([])

    const [detailedWorkout, setDetailedWorkout] = useState<WorkoutDetails | null>(null);

    // State to manage which accordion is expanded
    const [expanded, setExpanded] = useState<number | null>(null);

    const handleListAllWorkouts = async () => {
        const workouts = await listAllWorkouts();

        setWorkouts(workouts);
    }

    const handleShowWorkoutDetails = async (id: string) => {
        if (!id) {
            return;
        }

        const output = await getWorkoutDetails(id);

        setDetailedWorkout(output ?? null)
    }

    useEffect(() => {
        handleListAllWorkouts()
    }, [])

    return (
        <PageWrapper>
            <Header navigate={navigation} showAddButton />
            <Separator text="Workouts" />

            <ScrollView>
                {workouts && workouts.map((workout, index) => (
                    <ListItem.Accordion
                        key={workout.id}
                        onPress={() => {
                            setExpanded(expanded === index ? null : index);
                            handleShowWorkoutDetails(workout.id)
                        }}
                        content={
                            <>
                                <ListItem.Content>
                                    <ListItem.Title>{workout.workout_name}</ListItem.Title>
                                </ListItem.Content>
                            </>
                        }
                        isExpanded={expanded === index}
                    >
                        {detailedWorkout?.exercises?.map(exercise => (
                            <View key={exercise.id} style={{ width: '90%', alignSelf: 'center' }}>
                                <Text>{exercise.exercise_name}</Text>
                                {exercise.sets.map(set => (
                                    <Text key={set.set_number}>{set.set_number} - {set.repetitions}</Text>
                                ))}
                            </View>
                        ))}
                        <StyledButton
                            text="DELETE"
                            onPress={() => {
                                deleteWorkout(workout.id);
                                setExpanded(null);
                                handleListAllWorkouts();
                            }}
                            customStyles={{ backgroundColor: '#E74C3C', margin: 20 }}
                        />
                    </ListItem.Accordion>
                ))}
            </ScrollView>

        </PageWrapper>
    )
}