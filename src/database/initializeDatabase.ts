import { type SQLiteDatabase } from 'expo-sqlite';

export async function initializeDatabase(database: SQLiteDatabase) {
    await database.execAsync(`
        CREATE TABLE IF NOT EXISTS workouts (
            id TEXT PRIMARY KEY,
            workout_name TEXT NOT NULL,
            day_of_week TEXT NOT NULL
        );
    `);

    await database.execAsync(`
        CREATE TABLE IF NOT EXISTS exercises (
            id TEXT PRIMARY KEY,
            workout_id TEXT NOT NULL,
            exercise_name TEXT NOT NULL,
            FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE
        );
    `);

    await database.execAsync(`
        CREATE TABLE IF NOT EXISTS sets (
            id TEXT PRIMARY KEY,
            exercise_id TEXT,
            set_number INTEGER,
            repetitions INTEGER,
            weight TEXT,
            FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE
        );
    `);

    await database.execAsync(`
        CREATE TABLE IF NOT EXISTS cardio (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            workout_id INTEGER,
            description TEXT,
            duration INTEGER,
            speed REAL,
            FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE
        );
    `);

    await database.execAsync(`
        CREATE TABLE IF NOT EXISTS completed_workouts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            workout_id TEXT,
            workout_name TEXT NOT NULL,
            date TEXT,
            FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE
        );
    `);

    await database.execAsync(`
        CREATE TABLE IF NOT EXISTS completed_exercises (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            completed_workout_id TEXT NOT NULL,
            exercise_name TEXT NOT NULL,
            FOREIGN KEY (completed_workout_id) REFERENCES completed_workouts (id) ON DELETE CASCADE
        );
    `);

    await database.execAsync(`
        CREATE TABLE IF NOT EXISTS completed_sets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            completed_exercise_id INTEGER,
            set_number INTEGER,
            repetitions INTEGER,
            weight REAL,
            observation TEXT,
            FOREIGN KEY (completed_exercise_id) REFERENCES completed_exercises (id) ON DELETE CASCADE
        );
    `);
}