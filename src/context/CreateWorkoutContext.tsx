import { CreateExerciseProps, WorkoutDatabase } from "@/database/types";
import { createContext, useCallback } from "react";
import { Alert } from "react-native";

type CreateWorkoutContextType = {
  handleCreateWorkout: (
    database: WorkoutDatabase,
    data: {
      workoutName: string;
      exercises: CreateExerciseProps[];
    },
  ) => Promise<void>;
};

export const CreateWorkoutContext =
  createContext<CreateWorkoutContextType | null>(null);

export const CreateWorkoutProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const handleCreateWorkout = useCallback(
    async (
      database: WorkoutDatabase,
      data: { workoutName: string; exercises: CreateExerciseProps[] },
    ) => {
      const { exercises, workoutName } = data;

      const { response } = await database.createWorkout({
        workoutName,
        exercises,
      });

      Alert.alert(response);
    },
    [],
  );

  return (
    <CreateWorkoutContext.Provider value={{ handleCreateWorkout }}>
      {children}
    </CreateWorkoutContext.Provider>
  );
};
