import { useState } from "react";
import { ScrollView } from "react-native";
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

            <ScrollView>
                <LabeledTextInput
                    label="Workout Name"
                    style={{ width: '90%', alignSelf: 'center' }}
                    placeholder="Enter workout name"
                    value={workoutName}
                    onChangeText={text => setWorkoutName(text)}
                    onSubmitEditing={() => {
                        if (workoutName.length > 0) {
                            setShowDays(true)
                        }
                    }}
                />
                {showDays &&
                    <DayPicker selectedDay={selectedDay} handleDayPress={handleDayPress} />
                }

                {selectedDay &&
                    <StyledButton
                        text="Create workout"
                        onPress={handleCreateWorkout}
                        customStyles={{ marginHorizontal: 10, height: 40 }}
                    />
                }
            </ScrollView>
        </PageWrapper>
    )
}
