export const CreateCompletedWorkoutsTable = `
CREATE TABLE IF NOT EXISTS completed_workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id TEXT,
    workout_name TEXT NOT NULL,
    date TEXT,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
);
`