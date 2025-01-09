import { NavBar } from '@/components/NavBar/NavBar';
import { useWorkoutDatabase } from '@/database/useWorkoutDatabase';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Header } from '../../components/Header/Header';
import { PageWrapper } from '../../components/PageWrapper/PageWrapper';
import { WorkoutDetails } from '../../services/api/types';
import { NavigationPageProps } from '../../types/navigation';

export function Home({ navigation }: NavigationPageProps) {
    const [workoutOfTheDay, setWorkoutOfTheDay] = useState<WorkoutDetails | null>(null)
    const [loading, setLoading] = useState(true);
    const [shouldShowNoWorkoutImage, setShouldShowNoWorkoutImage] = useState(false);

    const workoutDatabase = useWorkoutDatabase();

    const checkIfUserHasData = useCallback(async () => {
        const { hasWorkoutsOrHistory } = await workoutDatabase.checkWorkoutsAndHistory();

        setShouldShowNoWorkoutImage(hasWorkoutsOrHistory);
        setLoading(false);
    }, [workoutDatabase, loading, shouldShowNoWorkoutImage])


    useEffect(() => {
        if (loading) {
            checkIfUserHasData()
        }
    }, [])

    console.log('hasWorkoutsOrHistory', shouldShowNoWorkoutImage);


    return (
        <PageWrapper>
            <Header navigate={navigation} />
            <View style={{ flex: 1 }}>
                {loading && <View><Text>Loading...</Text></View>}

                {shouldShowNoWorkoutImage && (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Image
                            style={{ width: '100%', height: 150, resizeMode: 'contain' }}
                            source={require('../../assets/images/noWorkouts.jpg')}
                        />
                        <Text style={{ color: '#3F3D56', fontSize: 22, textAlign: 'center', fontFamily: 'BebasNeue' }}>You don't have any workouts yet.</Text>
                    </View>
                )}

                {/* <StyledButton text='RESET' onPress={workoutDatabase.hardResetProject} customStyles={{ margin: 10, height: 40 }} /> */}
            </View>
            <NavBar />
        </PageWrapper>
    );
}

const styles = StyleSheet.create({});