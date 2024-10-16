import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import DayPicker from "../../components/DayPicker/DayPicker";
import { Header } from "../../components/Header/Header";
import { LabeledTextInput } from "../../components/LabeledTextInput/LabeledTextInput";
import { PageWrapper } from "../../components/PageWrapper/PageWrapper";
import { Separator } from "../../components/Separator/Separator";
import { StyledButton } from "../../components/StyledButton/StyledButton";
import { createNewWorkout } from "../../services/api/workoutClient";
import { NavigationPageProps } from "../../types/navigation";

export function CreateWorkout({ navigation }: NavigationPageProps) {
    const [workoutName, setWorkoutName] = useState<string>('');

    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const [showDays, setShowDays] = useState(false)

    const handleDayPress = (day: number) => {
        setSelectedDay(day);
    };

    const handleCreateWorkout = async () => {
        const newWorkout = await createNewWorkout(workoutName, String(selectedDay));

        navigation.navigate('CreateExercise', { selectedWorkout: newWorkout });
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
                        style={{ width: '90%', alignSelf: 'center' }}
                        placeholder="Enter workout name"
                        value={workoutName}
                        onChangeText={text => setWorkoutName(text)}
                    />


                    <Separator text='Day of the week' />

                    <DayPicker selectedDay={selectedDay} handleDayPress={handleDayPress} />


                </ScrollView>

                <View style={styles.buttonsContainer}>
                    <StyledButton
                        text="Create workout"
                        onPress={handleCreateWorkout}
                        customStyles={{ marginHorizontal: 10, height: 40 }}
                        disabled={!workoutName || !selectedDay}
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
});