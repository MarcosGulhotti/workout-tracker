export const CreateWorkout = `
INSERT INTO workouts (id, workout_name, day_of_week) VALUES (?, ?, ?);
`;