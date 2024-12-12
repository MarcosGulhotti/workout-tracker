export type ExerciseSet = {
    set_number: string;
    repetitions: string;
    weight: string;
}

export type ExerciseForWorkout = {
    id: string;
    exercise_name: string;
    workout_id: number;
    sets?: ExerciseSet[]
};

export type CreateWorkoutProps = {
    id: string;
    workout_name: string;
    selectedDay: string;
    exercises?: ExerciseForWorkout[];
}