export const CreateWorkoutTable = `
CREATE TABLE IF NOT EXISTS workouts (
    id TEXT PRIMARY KEY,
    workout_name TEXT NOT NULL,
    day_of_week TEXT NOT NULL
);
`