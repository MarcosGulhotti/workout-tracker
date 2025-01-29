import { type SQLiteDatabase } from 'expo-sqlite';

export async function initializeDatabase(database: SQLiteDatabase) {
    await database.execAsync(`
        CREATE TABLE IF NOT EXISTS workouts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        );
    `);

    await database.execAsync(`
        CREATE TABLE IF NOT EXISTS exercises (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            workout_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE
        );
    `);

    await database.execAsync(`
        CREATE TABLE IF NOT EXISTS sets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            exercise_id INTEGER NOT NULL,
            set_number INTEGER NOT NULL,
            repetitions INTEGER NOT NULL,
            FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE
        );
    `);

    await database.execAsync(`
        CREATE TABLE IF NOT EXISTS completed_workouts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            workout_name TEXT NOT NULL,
            workout_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE
        );
    `);

    await database.execAsync(`
        CREATE TABLE IF NOT EXISTS completed_exercises (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            completed_workout_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            FOREIGN KEY (completed_workout_id) REFERENCES completed_workouts (id) ON DELETE CASCADE
        );
    `);

    await database.execAsync(`
        CREATE TABLE IF NOT EXISTS completed_sets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            completed_exercise_id INTEGER NOT NULL,
            set_number INTEGER NOT NULL,
            weight REAL NOT NULL,
            repetitions INTEGER NOT NULL,
            FOREIGN KEY (completed_exercise_id) REFERENCES completed_exercises (id) ON DELETE CASCADE
        );
    `);
}