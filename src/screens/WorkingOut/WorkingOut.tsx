import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Header } from "../../components/Header/Header";
import { PageWrapper } from "../../components/PageWrapper/PageWrapper";
import { Separator } from "../../components/Separator/Separator";
import { SetsInput } from "../../components/SetsInput/SetsInput";
import { StyledButton } from "../../components/StyledButton/StyledButton";
import { Exercise } from "../../services/api/types";
import { saveCompletedWorkout } from "../../services/api/workoutClient";
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

    const [savedWeigths, setSavedWeigths] = useState<SavedWeights[]>([])

    const [weights, setWeights] = useState<string[]>([])

    const handleNextExercise = () => {
        if (!selectedWorkout.exercises) return;

        const nextExercise = selectedWorkout.exercises.findIndex((elm) => elm.id === currentExercise.id)

        const savedSerie = {
            exerciseId: currentExercise.id,
            exerciseName: currentExercise.exercise_name,
            sets: currentExercise.sets.map((set) => ({
                setNumber: set.set_number,
                weight: weights[Number(set.set_number) - 1],
                repetitions: set.repetitions
            }))
        } as SavedWeights

        if (!selectedWorkout.exercises[nextExercise + 1]) {
            setSavedWeigths([...savedWeigths, savedSerie ])
            setWeights([])
            setCurrentExercise(selectedWorkout.exercises[0])
            return;
        }

        setSavedWeigths([...savedWeigths, savedSerie ])
        setCurrentExercise(selectedWorkout.exercises[nextExercise + 1])
        setWeights([])
    }

    const handleSaveWorkout = () => {
        saveCompletedWorkout(selectedWorkout.id, selectedWorkout.workout_name, new Date().toLocaleString(), savedWeigths)
    }
    
    console.log(savedWeigths)

    return (
        <PageWrapper>
            <Header navigate={navigation} />
            <Separator text={selectedWorkout?.workout_name ?? ''} />

            <ScrollView style={styles.container}>
                <Text style={styles.title}>Exercise: {currentExercise.exercise_name}</Text>

                <View>
                    {currentExercise.sets.map((set, index) => (
                        <Text key={index}>
                            Set {set.set_number}: {set.repetitions}
                        </Text>
                    ))}
                </View>

                <SetsInput
                    reps={weights}
                    setNewReps={setWeights}
                    sets={currentExercise.sets.length}
                />

                <StyledButton customStyles={{ height: 45, margin: 10 }} text="Next" onPress={handleNextExercise} />

                <StyledButton customStyles={{ height: 45, margin: 10 }} text="SAVE" onPress={handleSaveWorkout} />

            </ScrollView>
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
    }
})