import { useSQLiteContext } from "expo-sqlite";
import { CreateWorkoutProps, ExerciseForWorkout, ExerciseSet, Workout } from "./types";

import { CompletedExercise, CompletedWorkout } from "@/services/api/types";
import { v4 as uuidv4 } from 'uuid';

type ExerciseData = {
    id: number;
    completed_workout_id: string;
    completed_exercise_id: string;
    exercise_name: string;
};

/**
 * Querys precisam ser nesse modelo de agora em diante
 * INSET INTO table_name (column1, column2, column3, ...) VALUES ($value1, $value2, $value3, ...);
 */

export function useWorkoutDatabase() {
    const database = useSQLiteContext()

    async function create(query: string, data: any) {
        const statement = await database.prepareAsync(query);
        try {
            const results = await statement.executeAsync(data);
            /**
             * passar dessa maneira
             * data = {
             * $value1: 'value1',
             * $value2: 'value2',
             * $value3: 'value3',
             * }
             */

            const insertedRowId = results.lastInsertRowId.toLocaleString();

            // Para retornar mais infos se necessario
            return { insertedRowId }
        } catch (error) {
            throw error
        } finally {
            await statement.finalizeAsync();
        }
    }

    /**
     * Asynchronously retrieves all workouts from the database along with their associated exercises.
     *
     * @returns {Promise<{ results: any }>} A promise that resolves to an object containing the results of the query.
     * @throws Will throw an error if the database query fails.
     */
    async function listAllWorkouts(): Promise<{ allWorkouts: CreateWorkoutProps[] }> {
        const statement = await database.prepareAsync("SELECT * FROM workouts");

        try {
            const results = await statement.executeAsync<CreateWorkoutProps>();

            const allWorkouts = await results.getAllAsync();

            return { allWorkouts };
        } catch (error) {
            throw new Error(String(error));
        } finally {
            await statement.finalizeAsync();
        }
    }

    /**
     * Retrieves detailed workout information including exercises and their sets.
     *
     * @param {string} workout_id - The ID of the workout to retrieve details for.
     * @returns {Promise<{ exercises: ExerciseForWorkout[] }>} A promise that resolves to an object containing an array of exercises with their respective sets.
     * @throws Will throw an error if the database query or any asynchronous operation fails.
     */
    async function getDetailedWorkout(workout_id: string) {
        const detailed_statement = await database.prepareAsync("SELECT * FROM exercises WHERE workout_id = ?");

        let output: ExerciseForWorkout[] = [];
        try {
            const detailed_results = await detailed_statement.executeAsync<ExerciseForWorkout>([workout_id]);
            const exercises = await detailed_results.getAllAsync();

            for (const exercise of exercises) {
                const { sets } = await getSetsForExercise(exercise.id);
                output.push({
                    ...exercise,
                    sets: sets,
                });
            }

            return { exercises: output };
        } catch (error) {
            throw error;
        } finally {
            await detailed_statement.finalizeAsync();
        }
    }

    /**
     * Retrieves all sets associated with a specific exercise from the database.
     *
     * @param {string} exercise_id - The unique identifier of the exercise.
     * @returns {Promise<{ sets: ExerciseSet[] }>} A promise that resolves to an object containing an array of sets.
     * @throws Will throw an error if the database query fails.
     */
    async function getSetsForExercise(exercise_id: string) {
        const sets_statement = await database.prepareAsync("SELECT * FROM sets WHERE exercise_id = ?");
        try {
            const sets_results = await sets_statement.executeAsync<ExerciseSet>([exercise_id]);
            const sets = await sets_results.getAllAsync();

            return { sets }
        } catch (error) {
            throw error
        } finally {
            await sets_statement.finalizeAsync();
        }
    }

    async function createWorkout({ name, exercises }: Workout) {
        const workoutStatement = await database.prepareAsync(`
            INSERT INTO workouts (name) VALUES (?);
        `);

        try {
            const workoutResult = await workoutStatement.executeAsync<Workout>([name]);
            const workoutId = workoutResult.lastInsertRowId;

            for (const exercise of exercises) {
                const exerciseStatement = await database.prepareAsync(`
                    INSERT INTO exercises (workout_id, name) VALUES (?, ?);
                `);

                const exerciseResult = await exerciseStatement.executeAsync([workoutId, exercise.name]);
                const exerciseId = exerciseResult.lastInsertRowId;

                for (const set of exercise.sets) {
                    const setStatement = await database.prepareAsync(`
                        INSERT INTO sets (exercise_id, set_number, repetitions) VALUES (?, ?, ?);
                    `);
                    await setStatement.executeAsync([exerciseId, set.set_number, set.repetitions]);
                    await setStatement.finalizeAsync();
                }

                await exerciseStatement.finalizeAsync();
            }

            await workoutStatement.finalizeAsync();
        } catch (error) {
            console.error("❌ Error saving workout:", error);
            throw error;
        }
    }

    async function addExerciseToWorkout(workoutId: string, exerciseName: string, sets: ExerciseSet[]) {
        const statement = await database.prepareAsync("INSERT INTO exercises (id, workout_id, exercise_name) VALUES ($id, $workoutId, $exerciseName)");

        const id = uuidv4();

        const data = {
            $id: id,
            $workoutId: workoutId,
            $exerciseName: exerciseName
        }

        try {
            await statement.executeAsync(data);


            const exerciseSets = await addSetsToWorkout(id, sets);

            return { id, workoutId, exerciseName, sets: exerciseSets }
        } catch (error) {
            throw error
        } finally {
            await statement.finalizeAsync();
        }
    }

    async function addSetsToWorkout(exerciseId: string, sets: ExerciseSet[]) {
        const statement = await database.prepareAsync("INSERT INTO sets (id, exercise_id, set_number, repetitions, weight) VALUES ($id, $exerciseId, $setNumber, $repetitions, $weight)");

        const data = sets.map((set, index) => {
            return {
                $id: uuidv4(),
                $exerciseId: exerciseId,
                $setNumber: index + 1,
                $repetitions: set.repetitions,
                $weight: set.weight
            }
        })

        try {
            data.forEach(async (set) => {
                await statement.executeAsync(set);
            })

            return { data }
        } catch (error) {
            throw error
        } finally {
            await statement.finalizeAsync();
        }
    }

    async function checkWeigthHistory(workoutId: string): Promise<{ history: CompletedWorkout | null }> {
        // SQL Statements
        const lastWorkoutStatement = await database.prepareAsync(`
            SELECT * FROM completed_workouts
            WHERE workout_id = ?
            ORDER BY date DESC
            LIMIT 1;
        `);
        const lastExerciseStatement = await database.prepareAsync(`
            SELECT * FROM completed_exercises
            WHERE completed_workout_id = ?
            ORDER BY id DESC
            LIMIT 1;
        `);
        const lastSetStatement = await database.prepareAsync(`
            SELECT id, set_number, weight, repetitions
            FROM completed_sets
            WHERE completed_exercise_id = ?
            ORDER BY id DESC
            LIMIT 1;
        `);

        try {
            // Fetch the last completed workout for the given workoutId
            const workoutResults = await lastWorkoutStatement.executeAsync<CompletedWorkout>([workoutId]);
            const workoutData = await workoutResults.getAllAsync();

            if (workoutData.length === 0) {
                return { history: null }; // No workout found
            }

            const workout = workoutData[0];

            // Fetch the last exercise for the workout
            const exerciseResults = await lastExerciseStatement.executeAsync<CompletedExercise>([workout.workout_id]);
            const exerciseData = await exerciseResults.getAllAsync();

            if (exerciseData.length === 0) {
                return { history: null }; // No exercises found
            }

            const lastExercise = exerciseData[0];

            // Fetch the last set for the last exercise
            const setResults = await lastSetStatement.executeAsync<ExerciseSet>([lastExercise.completed_exercise_id]);
            const setData = await setResults.getAllAsync();

            const lastSet = setData.map((set) => ({
                set_number: set.set_number,
                weight: set.weight || "0",
                repetitions: set.repetitions || "0",
                completed_exercise_id: lastExercise.completed_exercise_id,
            }));

            // Construct the final `CompletedWorkout` object
            const history: CompletedWorkout = {
                workout_id: workout.workout_id,
                workout_name: workout.workout_name,
                date: workout.date,
                completed_exercises: [
                    {
                        completed_exercise_id: lastExercise.completed_exercise_id,
                        completed_workout_id: workout.workout_id,
                        exercise_name: lastExercise.exercise_name,
                        completed_sets: lastSet,
                    },
                ],
            };

            return { history };
        } catch (error) {
            console.error("Error retrieving weight history:", error);
            throw new Error("Failed to retrieve weight history.");
        } finally {
            // Finalize all prepared statements
            await lastWorkoutStatement.finalizeAsync();
            await lastExerciseStatement.finalizeAsync();
            await lastSetStatement.finalizeAsync();
        }
    }



    /**
      * Saves a completed workout along with its exercises and sets into the database.
      *
      * @param {Object} workoutData - The workout data to save.
      * @param {string} workoutData.workout_id - The ID of the workout.
      * @param {string} workoutData.workoutName - The name of the workout.
      * @param {string} workoutData.date - The date the workout was completed.
      * @param {Array} workoutData.savedWeights - Array of exercises and their sets.
      * @returns {Promise<void>} A promise that resolves when the workout is successfully saved.
      */
    const saveCompletedWorkout = async ({
        workout_id,
        workoutName,
        date,
        savedWeights,
    }: {
        workout_id: string;
        workoutName: string;
        date: string;
        savedWeights: {
            exerciseId: string;
            exerciseName: string;
            sets: { setNumber: string; repetitions: string; weight: string }[];
        }[];
    }): Promise<void> => {
        const workoutStatement = await database.prepareAsync(
            "INSERT INTO completed_workouts (workout_id, workout_name, date) VALUES ($workout_id, $workout_name, $date)"
        );

        try {
            // Insert the workout
            await workoutStatement.executeAsync({
                $workout_id: workout_id,
                $workout_name: workoutName,
                $date: date,
            });

            // Loop through exercises
            for (const { exerciseName, sets, exerciseId } of savedWeights) {
                const exerciseStatement = await database.prepareAsync(
                    "INSERT INTO completed_exercises (completed_workout_id, exercise_name, completed_exercise_id) VALUES ($workout_id, $exercise_name, $completed_exercise_id)"
                );

                await exerciseStatement.executeAsync({
                    $workout_id: workout_id, // Associate with the workout
                    $exercise_name: exerciseName,
                    $completed_exercise_id: exerciseId
                });

                console.log("Exercise ID:", exerciseId);

                // Loop through sets for the current exercise
                for (const { setNumber, repetitions, weight } of sets) {
                    const setStatement = await database.prepareAsync(
                        "INSERT INTO completed_sets (completed_exercise_id, set_number, repetitions, weight) VALUES ($exercise_id, $set_number, $repetitions, $weight)"
                    );

                    await setStatement.executeAsync({
                        $exercise_id: exerciseId, // Associate with the exercise
                        $set_number: setNumber,
                        $repetitions: Number(repetitions),
                        $weight: Number(weight),
                    });

                    await setStatement.finalizeAsync();
                }

                await exerciseStatement.finalizeAsync();
            }
        } catch (error) {
            console.error("Error saving completed workout:", error);
            throw new Error("Failed to save the completed workout");
        } finally {
            await workoutStatement.finalizeAsync();
        }
    };

    async function hardResetProject(database: any): Promise<void> {
        // Queries para manipular as foreign keys
        const disableForeignKeys = "PRAGMA foreign_keys = OFF;";
        const enableForeignKeys = "PRAGMA foreign_keys = ON;";

        // Queries para dropar as tabelas existentes
        const dropTablesQueries = [
            "DROP TABLE IF EXISTS cardio;",
            "DROP TABLE IF EXISTS completed_exercises;",
            "DROP TABLE IF EXISTS completed_sets;",
            "DROP TABLE IF EXISTS completed_workouts;",
            "DROP TABLE IF EXISTS exercises;",
            "DROP TABLE IF EXISTS sets;",
            "DROP TABLE IF EXISTS workouts;"
        ];

        // Queries para recriar as tabelas
        const createTablesQueries = [
            `
            CREATE TABLE IF NOT EXISTS cardio (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                workout_id INTEGER,
                description TEXT,
                duration INTEGER,
                speed REAL,
                FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE
            );
            `,
            `
            CREATE TABLE IF NOT EXISTS completed_exercises (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                completed_workout_id INTEGER NOT NULL,
                exercise_name TEXT NOT NULL,
                FOREIGN KEY (completed_workout_id) REFERENCES completed_workouts (id) ON DELETE CASCADE
            );
            `,
            `
            CREATE TABLE IF NOT EXISTS completed_sets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                completed_exercise_id INTEGER NOT NULL,
                set_number INTEGER NOT NULL,
                repetitions INTEGER NOT NULL,
                weight REAL NOT NULL,
                observation TEXT,
                FOREIGN KEY (completed_exercise_id) REFERENCES completed_exercises (id) ON DELETE CASCADE
            );
            `,
            `
            CREATE TABLE IF NOT EXISTS completed_workouts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                workout_id TEXT NOT NULL,
                workout_name TEXT NOT NULL,
                date TEXT NOT NULL,
                FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE
            );
            `,
            `
            CREATE TABLE IF NOT EXISTS exercises (
                id TEXT PRIMARY KEY,
                workout_id TEXT NOT NULL,
                exercise_name TEXT NOT NULL,
                FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE
            );
            `,
            `
            CREATE TABLE IF NOT EXISTS sets (
                id TEXT PRIMARY KEY,
                exercise_id TEXT NOT NULL,
                set_number INTEGER NOT NULL,
                repetitions INTEGER NOT NULL,
                weight TEXT NOT NULL,
                FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE
            );
            `,
            `
            CREATE TABLE IF NOT EXISTS workouts (
                id TEXT PRIMARY KEY,
                workout_name TEXT NOT NULL,
                day_of_week TEXT NOT NULL
            );
            `
        ];

        try {
            console.log("🚨 Starting hard reset...");

            // Desabilita constraints de chave estrangeira
            await database.execAsync(disableForeignKeys);
            console.log("🔧 Foreign keys disabled.");

            // Dropa todas as tabelas
            for (const query of dropTablesQueries) {
                console.log(`🗑 Dropping table with query: ${query}`);
                await database.execAsync(query);
            }

            // Recria todas as tabelas
            for (const query of createTablesQueries) {
                console.log(`🔨 Creating table with query: ${query}`);
                await database.execAsync(query);
            }

            // Reabilita constraints de chave estrangeira
            await database.execAsync(enableForeignKeys);
            console.log("🔧 Foreign keys enabled.");

            // Validação: Verificar o esquema das tabelas
            const tablesToVerify = [
                "cardio",
                "completed_exercises",
                "completed_sets",
                "completed_workouts",
                "exercises",
                "sets",
                "workouts"
            ];
            for (const tableName of tablesToVerify) {
                console.log(`🔍 Verifying schema for table: ${tableName}`);
                const result = await database.getAllAsync(`PRAGMA table_info(${tableName});`);
                console.log(`✅ Schema for ${tableName}:`, result);
            }

            console.log("🎉 Project hard reset completed successfully!");
        } catch (error) {
            console.error("❌ Error during hard reset:", error);
            throw new Error("Failed to perform hard reset.");
        }
    }

    return { create, listAllWorkouts, createWorkout, addExerciseToWorkout, getDetailedWorkout, checkWeigthHistory, saveCompletedWorkout, hardResetProject }
}