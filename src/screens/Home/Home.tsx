import WorkoutCard from "@/components/Cards/WorkoutCard/WorkoutCard";
import { Workout } from "@/database/types";
import { useWorkoutDatabase } from "@/database/useWorkoutDatabase";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import { PageWrapper } from "../../components/PageWrapper/PageWrapper";
import { NavigationPageProps } from "../../types/navigation";

export function Home({ navigation }: NavigationPageProps) {
  const [loading, setLoading] = useState(true);
  const [shouldShowNoWorkoutImage, setShouldShowNoWorkoutImage] =
    useState(false);

  const [workouts, setWorkouts] = useState<Workout[]>([]);

  const { checkWorkoutsAndHistory, listAllWorkouts } = useWorkoutDatabase();

  const handleListWorkouts = useCallback(async () => {
    const result = await listAllWorkouts().catch((err) => {
      Alert.alert(
        "Error",
        `There was an error listing all workouts: ${err.message}`,
      );
      return { allWorkouts: [] as Workout[] };
    });

    if (result && result.allWorkouts) {
      setWorkouts(result.allWorkouts.slice(0, 3));
    }
  }, [listAllWorkouts]);

  const checkIfUserHasData = useCallback(async () => {
    const { hasWorkoutsOrHistory } = await checkWorkoutsAndHistory();

    if (hasWorkoutsOrHistory) {
      await handleListWorkouts();
    } else {
      setShouldShowNoWorkoutImage(hasWorkoutsOrHistory);
    }
    setLoading(false);
  }, [checkWorkoutsAndHistory, handleListWorkouts]);

  useEffect(() => {
    if (loading) {
      checkIfUserHasData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageWrapper navigate={navigation} selectedButton="Home">
      <View style={{ flex: 1 }}>
        {loading && (
          <View>
            <Text>Loading...</Text>
          </View>
        )}

        {shouldShowNoWorkoutImage && (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Image
              style={{ width: "100%", height: 150, resizeMode: "contain" }}
              source={require("../../assets/images/noWorkouts.jpg")}
            />
            <Text
              style={{
                color: "#3F3D56",
                fontSize: 22,
                textAlign: "center",
                fontFamily: "BebasNeue",
              }}
            >
              You don't have any workouts yet.
            </Text>
          </View>
        )}

        {!loading && workouts.length > 0 && (
          <View style={{ flex: 1, padding: 10 }}>
            <Text
              style={{
                fontSize: 24,
                fontFamily: "BebasNeue",
                color: "#3F3D56",
                marginBottom: 10,
              }}
            >
              Your Workouts
            </Text>
            <WorkoutCard workouts={workouts} onPress={(workout) => {}} />
          </View>
        )}

        {/* <StyledButton text='RESET' onPress={workoutDatabase.hardResetProject} customStyles={{ margin: 10, height: 40 }} /> */}
      </View>
    </PageWrapper>
  );
}
