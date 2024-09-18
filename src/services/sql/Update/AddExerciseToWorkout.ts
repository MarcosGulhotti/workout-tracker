export const AddExerciseToWorkout = `
INSERT INTO exercises (id, workout_id, exercise_name) VALUES (?, ?, ?);
`;