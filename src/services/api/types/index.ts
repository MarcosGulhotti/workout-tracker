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
    workout_id: string;
    workout_name: string;
    date: string;
    completed_exercises: CompletedExercise[];
};

export type CompletedExercise = {
    completed_workout_id: string;
    completed_exercise_id: string;
    exercise_name: string;
    completed_sets: CompletedSets[];
};

export type CompletedSets = {
    completed_exercise_id: string;
    set_number: string;
    repetitions: string;
    weight: string;
    observation?: string;
}

export type ExerciseSet = {
    set_number: string;
    repetitions: string;
    weight: string;
}