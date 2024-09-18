export type Exercise = {
    id: string;
    exercise_name: string;
    workout_id: number;
    sets: ExerciseSet[]
};

export type WorkoutDetails = {
    id: string;
    workout_name: string;
    day_of_week: string;
    exercises?: Exercise[];
};

export type CompletedWorkout = {
    id: number;
    workout_name: string;
    date: string;
    completed_exercises: CompletedExercise[];
};

export type CompletedExercise = {
    id: number;
    completed_workout_id: number;
    exercise_name: string;
    completed_sets: CompletedSets[];
};

type CompletedSets = {
    id: number;
    completed_exercise_id: number;
    set_number: number;
    repetitions: number;
    weight: number;
    observation?: string;
}

export type ExerciseSet = {
    set_number: string;
    repetitions: string;
    weight: string;
}