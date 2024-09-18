export const CreateCompletedSetsTable = `
CREATE TABLE IF NOT EXISTS completed_sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    completed_exercise_id INTEGER,
    set_number INTEGER,
    repetitions INTEGER,
    weight REAL,
    observation TEXT,
    FOREIGN KEY (completed_exercise_id) REFERENCES completed_exercises (id) ON DELETE CASCADE
);
`