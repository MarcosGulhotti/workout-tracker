import { useSQLiteContext } from "expo-sqlite";
import { CreateWorkoutProps, ExerciseForWorkout, ExerciseSet, Workout } from "./types";

import { CompletedExercise, CompletedWorkout } from "@/services/api/types";
import { v4 as uuidv4 } from 'uuid';

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
    async function listAllWorkouts(): Promise<{ allWorkouts: Workout[] }> {
        const statement = await database.prepareAsync("SELECT * FROM workouts");

        try {
            const results = await statement.executeAsync<Workout>();

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

    async function createWorkout({ workoutName, exercises }: CreateWorkoutProps) {
        console.log("🚀 Starting to create workout:", workoutName);

        try {
            // Inicia uma transação para garantir consistência
            await database.execAsync("BEGIN TRANSACTION;");

            // Insere o workout
            const insertWorkoutQuery = `
            INSERT INTO workouts (name) VALUES (?);
        `;
            const resultWorkout = await database.runAsync(insertWorkoutQuery, [workoutName]);
            const workoutId = resultWorkout.lastInsertRowId;

            console.log("✅ Workout created with ID:", workoutId);

            for (const exercise of exercises) {
                console.log("🚀 Adding exercise:", exercise.exerciseName);

                // Insere o exercício vinculado ao workout
                const insertExerciseQuery = `
                INSERT INTO exercises (workout_id, name) VALUES (?, ?);
            `;
                const resultExercise = await database.runAsync(insertExerciseQuery, [
                    workoutId,
                    exercise.exerciseName,
                ]);
                const exerciseId = resultExercise.lastInsertRowId;

                console.log("✅ Exercise added with ID:", exerciseId);

                // Insere os sets vinculados ao exercício
                for (const set of exercise.sets) {
                    console.log("🚀 Adding set:", set);

                    const insertSetQuery = `
                    INSERT INTO sets (exercise_id, set_number, repetitions) VALUES (?, ?, ?);
                `;
                    await database.runAsync(insertSetQuery, [
                        exerciseId,
                        set.set_number,
                        set.repetitions,
                    ]);

                    console.log("✅ Set added for exercise ID:", exerciseId);
                }
            }

            // Commit da transação
            await database.execAsync("COMMIT;");
            console.log("🎉 Workout creation completed successfully.");

            return { response: "Workout created successfully." };
        } catch (error) {
            console.error("❌ Error saving workout:", error);

            // Rollback em caso de falha
            await database.execAsync("ROLLBACK;");
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

    async function hardResetProject() {
        console.log("🚧 Resetting database...");

        const queries = [
            "PRAGMA foreign_keys = OFF;",
            "DROP TABLE IF EXISTS cardio;",
            "DROP TABLE IF EXISTS completed_exercises;",
            "DROP TABLE IF EXISTS completed_sets;",
            "DROP TABLE IF EXISTS completed_workouts;",
            "DROP TABLE IF EXISTS exercises;",
            "DROP TABLE IF EXISTS sets;",
            "DROP TABLE IF EXISTS workouts;",
            "PRAGMA foreign_keys = ON;",

            // Recriação das tabelas
            `
            CREATE TABLE IF NOT EXISTS workouts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL
            );
            `,
            `
            CREATE TABLE IF NOT EXISTS exercises (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                workout_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE
            );
            `,
            `
            CREATE TABLE IF NOT EXISTS sets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                exercise_id INTEGER NOT NULL,
                set_number INTEGER NOT NULL,
                repetitions INTEGER NOT NULL,
                FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE
            );
            `,
        ];

        for (const query of queries) {
            await database.execAsync(query);
            console.log(`✅ Executed: ${query}`);
        }

        console.log("🎉 Database reset completed.");
    }

    return { create, listAllWorkouts, createWorkout, addExerciseToWorkout, getDetailedWorkout, checkWeigthHistory, saveCompletedWorkout, hardResetProject }
}