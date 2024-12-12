import { useWorkoutDatabase } from '@/database/useWorkoutDatabase';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Header } from '../../components/Header/Header';
import { PageWrapper } from '../../components/PageWrapper/PageWrapper';
import { Separator } from '../../components/Separator/Separator';
import { StyledButton } from '../../components/StyledButton/StyledButton';
import { WorkoutDetails } from '../../services/api/types';
import { getWorkoutOfTheDay } from '../../services/api/workoutClient';
import { NavigationPageProps } from '../../types/navigation';

export function Home({ navigation }: NavigationPageProps) {
    const [workoutOfTheDay, setWorkoutOfTheDay] = useState<WorkoutDetails | null>(null)

    const workoutDatabase = useWorkoutDatabase();

    const handleGetWorkoutOfTheDay = useCallback(async () => {
        const workout = await getWorkoutOfTheDay()

        setWorkoutOfTheDay(workout);
    }, [])

    useEffect(() => {
        handleGetWorkoutOfTheDay()
    }, [])

    return (
        <PageWrapper>
            <Header navigate={navigation} />
            <ScrollView>
                {/* {workoutOfTheDay &&
                    <View>
                        <Separator text='Quick Start' />
                        <StyledButton
                            text={`Start Workout: ${workoutOfTheDay.workout_name}`}
                            customStyles={{ marginHorizontal: 10, height: 40 }}
                            onPress={() => navigation.navigate('WorkingOut', { selectedWorkout: workoutOfTheDay })}
                        />
                    </View>
                } */}
                <Separator text='Workouts' />

                <View style={styles.buttonsContainer}>
                    <StyledButton
                        showIcon
                        iconName='assignment'
                        text='New Workout'
                        customStyles={{ marginHorizontal: 10, height: 40 }}
                        onPress={() => navigation.navigate('CreateWorkout')}
                    />
                    <StyledButton
                        showIcon
                        iconName='search'
                        text='All Workouts'
                        customStyles={{ marginHorizontal: 10, height: 40 }}
                        onPress={() => navigation.navigate('ListAllWorkouts')}
                    />
                </View>

                <StyledButton text='RESET' onPress={() => workoutDatabase.hardResetProject()} customStyles={{ margin: 10, height: 40 }} />
            </ScrollView>
        </PageWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    outsideContainer: {
        backgroundColor: '#34495E'
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
    },
    buttonsContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignSelf: 'center',
        width: '95%',
    },
});