export const CreateCompletedExercisesTable = `
CREATE TABLE IF NOT EXISTS completed_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    completed_workout_id INTEGER,
    exercise_name TEXT NOT NULL,
    FOREIGN KEY (completed_workout_id) REFERENCES completed_workouts (id) ON DELETE CASCADE
);
`