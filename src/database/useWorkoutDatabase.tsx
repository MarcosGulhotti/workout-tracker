import { useSQLiteContext } from "expo-sqlite";
import { CreateWorkoutProps, Exercise, Set, Workout, WorkoutDetails } from "./types";


/**
 * Querys precisam ser nesse modelo de agora em diante
 * INSET INTO table_name (column1, column2, column3, ...) VALUES ($value1, $value2, $value3, ...);
 */
export function useWorkoutDatabase() {
    const database = useSQLiteContext();

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

    async function getWorkoutDetails(workoutId: string) {
        try {
            console.log("🚀 Fetching workout details for ID:", workoutId);

            // Query para pegar o workout pelo ID
            const workoutQuery = `
                SELECT id, name AS workout_name
                FROM workouts
                WHERE id = ?;
            `;
            const workoutStatement = await database.prepareAsync(workoutQuery);
            const workoutResult = await workoutStatement.executeAsync<Workout>([workoutId]);
            const workoutData = await workoutResult.getAllAsync();

            if (workoutData.length === 0) {
                console.log("❌ No workout found with the given ID.");
                return null; // Nenhum workout encontrado
            }

            const workout = workoutData[0];
            console.log("✅ Workout fetched:", workout);

            // Query para pegar os exercícios vinculados ao workout
            const exercisesQuery = `
                SELECT id, name
                FROM exercises
                WHERE workout_id = ?;
            `;
            const exercisesStatement = await database.prepareAsync(exercisesQuery);
            const exercisesResult = await exercisesStatement.executeAsync<Exercise>([workoutId]);
            const exercisesData = await exercisesResult.getAllAsync();

            console.log("✅ Exercises fetched:", exercisesData);

            const exercisesWithSets = [];

            for (const exercise of exercisesData) {
                // Query para pegar os sets vinculados ao exercício
                const setsQuery = `
                    SELECT set_number, repetitions
                    FROM sets
                    WHERE exercise_id = ?;
                `;
                const setsStatement = await database.prepareAsync(setsQuery);
                const setsResult = await setsStatement.executeAsync<Set>([exercise.id]);
                const setsData = await setsResult.getAllAsync();

                exercisesWithSets.push({
                    exercise_id: exercise.id,
                    exercise_name: exercise.name,
                    sets: setsData,
                });

                await setsStatement.finalizeAsync();
            }

            // Construindo a resposta final
            const workoutDetails: WorkoutDetails = {
                workout_id: workout.id,
                workout_name: workout.name,
                exercises: exercisesWithSets,
            };

            console.log("🎉 Full workout details fetched successfully:", workoutDetails);

            // Finaliza as consultas
            await workoutStatement.finalizeAsync();
            await exercisesStatement.finalizeAsync();

            return workoutDetails;
        } catch (error) {
            console.error("❌ Error fetching workout details:", error);
            throw error;
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

    return {
        listAllWorkouts,
        createWorkout,
        getWorkoutDetails,
        saveCompletedWorkout,
        hardResetProject
    }
}