export const CreateSetsTable = `
CREATE TABLE IF NOT EXISTS sets (
    id TEXT PRIMARY KEY,
    exercise_id TEXT,
    set_number INTEGER,   
    repetitions INTEGER,  
    weight TEXT,          
    FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE
);
`