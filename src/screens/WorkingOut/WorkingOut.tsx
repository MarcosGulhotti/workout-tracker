import { ExerciseForWorkout } from "@/database/types";
import { useWorkoutDatabase } from "@/database/useWorkoutDatabase";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Header } from "../../components/Header/Header";
import { PageWrapper } from "../../components/PageWrapper/PageWrapper";
import { Separator } from "../../components/Separator/Separator";
import { StyledButton } from "../../components/StyledButton/StyledButton";
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

type CompletedSet = {
    exerciseId: string;
    setNumber: string;
    weight: string;
    repetitions: string;
}

export function WorkingOut({ navigation, route }: NavigationPageProps) {
    const { selectedWorkout, lastSavedWorkout } = useMemo(() => {
        if (route.params && 'selectedWorkout' in route.params && 'lastSavedWorkout' in route.params) {
            return route.params;
        }
        return { selectedWorkout: null, lastSavedWorkout: null };
    }, [route]);

    if (!selectedWorkout || !selectedWorkout.exercises) {
        navigation.goBack();
        return null;
    }

    const workoutDatabase = useWorkoutDatabase();

    const [currentExercise, setCurrentExercise] = useState<ExerciseForWorkout>(selectedWorkout.exercises[0]);

    const [weights, setWeights] = useState<string[]>([]);
    const [repetitions, setRepetitions] = useState<string[]>([]);

    const [savedWeights, setSavedWeights] = useState<SavedWeights[]>([]);
    const [completedSets, setCompletedSets] = useState<CompletedSet[]>([]);


    const handleNextExercise = () => {
        if (!selectedWorkout.exercises || !currentExercise.sets) return;

        // Check if all sets have weights and repetitions
        const incompleteSets = currentExercise.sets.some((set, index) => !weights[index] || !repetitions[index]);
        if (incompleteSets) {
            alert("Preencha todos os pesos e repetições antes de continuar.");
            return;
        }

        // Construct the data for the current exercise
        const completedSet: SavedWeights = {
            exerciseId: currentExercise.id,
            exerciseName: currentExercise.exercise_name,
            sets: currentExercise.sets.map((set, index) => ({
                setNumber: set.set_number,
                weight: weights[index] || "0", // Default to "0" if not set
                repetitions: repetitions[index] || "0", // Default to "0" if not set
            })),
        };

        // Append the current exercise data to `savedWeights`
        setSavedWeights((prev) => [...prev, completedSet]);

        // Determine the next exercise
        const nextExerciseIndex = selectedWorkout.exercises.findIndex((e) => e.id === currentExercise.id) + 1;
        if (nextExerciseIndex < selectedWorkout.exercises.length) {
            setCurrentExercise(selectedWorkout.exercises[nextExerciseIndex]);
            setWeights([]); // Clear inputs for the next exercise
            setRepetitions([]);
        } else {
            alert("Treino completo! Não se esqueça de salvar.");
        }
    };

    const handleSaveWorkout = async () => {
        try {
            if (!selectedWorkout.exercises || !currentExercise.sets) return;
    
            // Local variable to store the updated savedWeights
            let updatedSavedWeights = [...savedWeights];
    
            // Check if the current exercise is the last one and needs to be added
            if (!updatedSavedWeights.find((exercise) => exercise.exerciseId === currentExercise.id)) {
                const incompleteSets = currentExercise.sets.some((set, index) => !weights[index] || !repetitions[index]);
                if (incompleteSets) {
                    alert("Preencha todos os pesos e repetições antes de salvar.");
                    return;
                }
    
                // Add the current exercise to the updated savedWeights
                const completedSet: SavedWeights = {
                    exerciseId: currentExercise.id,
                    exerciseName: currentExercise.exercise_name,
                    sets: currentExercise.sets.map((set, index) => ({
                        setNumber: set.set_number,
                        weight: weights[index] || "0",
                        repetitions: repetitions[index] || "0",
                    })),
                };
    
                updatedSavedWeights = [...updatedSavedWeights, completedSet];
            }
    
            console.log("Updated savedWeights before save:", updatedSavedWeights);
    
            // Prepare the final object to pass to saveCompletedWorkout
            const workoutData = {
                workout_id: selectedWorkout.id,
                workoutName: selectedWorkout.workout_name,
                date: new Date().toISOString(),
                savedWeights: updatedSavedWeights.map((exercise) => ({
                    exerciseId: exercise.exerciseId,
                    exerciseName: exercise.exerciseName,
                    sets: exercise.sets.map((set) => ({
                        setNumber: set.setNumber,
                        repetitions: set.repetitions.toString(),
                        weight: set.weight.toString(),
                    })),
                })),
            };
    
            // Call the save function
            await workoutDatabase.saveCompletedWorkout(workoutData);
    
            alert("Treino salvo com sucesso!");
            // navigation.navigate("WorkoutHistory");
        } catch (error) {
            console.error("Erro ao salvar o treino:", error);
            alert("Ocorreu um erro ao salvar o treino. Tente novamente.");
        }
    };
    


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
                        {currentExercise.sets?.map((set, index) => {
                            const lastSavedSet = lastSavedWorkout?.completed_exercises
                                ?.find((e) => String(e.completed_exercise_id) === currentExercise.id)
                                ?.completed_sets.find((s) => Number(s.set_number) === Number(set.set_number));

                            return (
                                <View key={index}>
                                    <Text>Set {set.set_number}</Text>
                                    <View style={styles.setsContainer}>
                                        <Text>Repetições</Text>
                                        <TextInput
                                            style={styles.repInput}
                                            keyboardType="number-pad"
                                            placeholder={`${lastSavedSet ? lastSavedSet.repetitions : set.repetitions}`}
                                            value={repetitions[index]}
                                            onChangeText={(text) => {
                                                const updatedRepetitions = [...repetitions];
                                                updatedRepetitions[index] = text;
                                                setRepetitions(updatedRepetitions);
                                            }}
                                        />
                                        <Text>Peso</Text>
                                        <TextInput
                                            style={styles.repInput}
                                            keyboardType="number-pad"
                                            placeholder={`${lastSavedSet ? lastSavedSet.weight : set.weight}`}
                                            value={weights[index]}
                                            onChangeText={(text) => {
                                                const updatedWeights = [...weights];
                                                updatedWeights[index] = text;
                                                setWeights(updatedWeights);
                                            }}
                                        />
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>

                <View style={styles.buttonsContainer}>
                    <StyledButton
                        customStyles={{ height: 45, margin: 10 }}
                        text="Next"
                        onPress={handleNextExercise}
                        disabled={currentExercise.id === selectedWorkout.exercises[selectedWorkout.exercises.length - 1].id}
                    />

                    {currentExercise.id === selectedWorkout.exercises[selectedWorkout.exercises.length - 1].id && (
                        <StyledButton
                            customStyles={{ height: 45, margin: 10 }}
                            text="SAVE"
                            onPress={handleSaveWorkout}
                        />
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


/**
 * 1 - Usuario vai entrar na página e será verificado se ele tem historico nesse treino
 * 2 - Se tiver, os pesos do ultimo treino serão preenchidos automaticamente
 * 3 - O usuário vai preencher os pesos e repetições do treino atual
 * 4 - Ao clicar em next, os pesos e repetições serão salvos e o próximo exercício será carregado
 * 5 - O usuário vai preencher os pesos e repetições do próximo exercício
 * 6 - O processo se repete até o último exercício
 * 7 - Ao clicar em save, o treino completo será salvo no banco de dados
 * 8 - O usuário será redirecionado para a tela de histórico
 */