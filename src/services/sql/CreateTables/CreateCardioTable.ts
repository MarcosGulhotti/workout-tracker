export const CreateCardioTable = `
CREATE TABLE IF NOT EXISTS cardio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER,
    description TEXT,
    duration INTEGER,
    speed REAL,
    FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE
);
`