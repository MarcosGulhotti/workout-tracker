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

export type Workout = {
    id: string;
    name: string;
    exercises?: Exercise[];
}

export type Exercise = {
    id: string;
    workout_id: number;
    name: string;
    sets: Set[];
}

export type Set = {
    id: string;
    exercise_id: number;
    set_number: number;
    repetitions: number;
}

export type CompletedWorkout = {
    id: string;
    workout_id: number;
    date: string;
}

export type CompletedExercise = {
    id: string;
    completed_workout_id: number;
    name: string;
}

export type CompletedSet = {
    id: string;
    completed_exercise_id: number;
    set_number: number;
    weight: number;
    repetitions: number;
}

export type CreateWorkoutProps = {
    workoutName: string;
    exercises: CreateExerciseProps[]
}

export type CreateExerciseProps = {
    exerciseName: string;
    sets: {
        set_number: number;
        repetitions: number;
    }[]
}