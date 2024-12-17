import { SetsInput } from "@/components/SetsInput/SetsInput";
import { CreateExerciseProps } from "@/database/types";
import { useWorkoutDatabase } from "@/database/useWorkoutDatabase";
import { openDatabaseSync } from "expo-sqlite";
import { useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Header } from "../../components/Header/Header";
import { LabeledTextInput } from "../../components/LabeledTextInput/LabeledTextInput";
import { PageWrapper } from "../../components/PageWrapper/PageWrapper";
import { Separator } from "../../components/Separator/Separator";
import { StyledButton } from "../../components/StyledButton/StyledButton";
import { NavigationPageProps } from "../../types/navigation";

const database = openDatabaseSync('workout_database.db');

export function CreateWorkout({ navigation }: NavigationPageProps) {
    const [workoutName, setWorkoutName] = useState<string>('');
    const [exerciseName, setExerciseName] = useState<string>('');
    const [numberOfSets, setNumberOfSets] = useState<string>('');

    const [reps, setReps] = useState<string[]>([]);

    const [savedExercises, setSavedExercises] = useState<CreateExerciseProps[]>([])


    const [showDays, setShowDays] = useState(false)

    const workoutDatabase = useWorkoutDatabase();

    const handleAddExercise = async () => {
        const sets = [...Array(parseInt(numberOfSets))].map((set, index) => {
            return {
                set_number: index + 1,
                repetitions: parseInt(reps[index]),
            };
        })

        const exerciseToSaveInMemory: CreateExerciseProps = {
            exerciseName,
            sets
        }

        setSavedExercises([...savedExercises, exerciseToSaveInMemory])

        setReps([]);
        setNumberOfSets('');
        setExerciseName('');
    }

    const handleCreateWorkout = async () => {
        console.log("FOI")
        const { response } = await workoutDatabase.createWorkout({
            workoutName,
            exercises: savedExercises
        });

        Alert.alert(response)
    }

    return (
        <PageWrapper>
            <Header navigate={navigation} />

            <Separator text='Create Workout' />

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >

                <ScrollView>
                    <LabeledTextInput
                        label="Workout Name"
                        style={styles.content}
                        placeholder="Enter workout name"
                        value={workoutName}
                        onChangeText={text => setWorkoutName(text)}
                    />


                    <Separator text='Exercises' />
                    <View style={styles.content}>
                        <LabeledTextInput
                            label="Exercise Name"
                            placeholder="Enter exercise name"
                            value={exerciseName}
                            onChangeText={setExerciseName}
                        />
                        <LabeledTextInput
                            label="Number of Sets"
                            placeholder="Enter number of sets"
                            value={String(numberOfSets)}
                            onChangeText={(text) => {
                                if (Number(text) < 100) {
                                    setNumberOfSets(text)
                                }
                            }}
                            type="number-pad"
                            onSubmitEditing={Keyboard.dismiss}
                        />

                        <SetsInput
                            reps={reps}
                            setNewReps={setReps}
                            sets={Number(numberOfSets)}
                        />
                    </View>

                    {savedExercises.length > 0 && <Separator text="Created Exercises" />}

                    <View style={styles.content}>
                        {savedExercises.length > 0 && (
                            savedExercises.map((exercise, index) => (
                                <View style={styles.createdExercisesContainer} key={index}>
                                    <Text style={styles.texts}>{exercise.exerciseName}:</Text>
                                    <View style={styles.setsContainer}>
                                        {exercise.sets.map((set, index) => (
                                            <View style={styles.setsTextContainer} key={index}>
                                                <Text style={styles.setsText}>Set {set.set_number}: {set.repetitions} reps</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>

                <View style={styles.buttonsContainer}>
                    <StyledButton
                        text="Add Exercise"
                        onPress={handleAddExercise}
                        customStyles={{ marginHorizontal: 10, height: 40 }}
                        disabled={exerciseName.length === 0}
                    />
                    <StyledButton
                        text="Create workout"
                        onPress={handleCreateWorkout}
                        customStyles={{ marginHorizontal: 10, height: 40 }}
                        disabled={!workoutName}
                    />
                </View>
            </KeyboardAvoidingView>
        </PageWrapper >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    content: {
        flexGrow: 1,
        width: '90%',
        alignSelf: 'center',
    },
    createdExercisesContainer: {
        flexDirection: 'row',
        marginTop: 5,
        flexWrap: 'wrap',
    },
    texts: {
        fontFamily: 'Roboto',
        fontSize: 18,
        color: '#34495E',
        fontWeight: 'bold',
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
});