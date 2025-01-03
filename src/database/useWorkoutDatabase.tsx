import { useSQLiteContext } from "expo-sqlite";
import { CompletedExercise, CompletedSet, CompletedWorkout, CreateWorkoutProps, Exercise, Set, Workout, WorkoutDetails } from "./types";

export type CompletedSetData = {
    setNumber: string;
    weight: string;
    repetitions: string;
}

export type CompletedExerciseData = {
    exerciseId: string;
    exerciseName: string;
    completed_sets: CompletedSetData[];
}

export type CompletedWorkoutData = {
    workout_id: string;
    workout_name: string;
    date: string;
    completed_exercises: CompletedExerciseData[];
}

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
                workout_name: workout.workout_name,
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

    async function deleteWorkout(workoutId: string): Promise<{ response: string }> {
        try {
            console.log("🚀 Deleting workout with ID:", workoutId);

            // Deleta o workout
            const deleteWorkoutQuery = `
                DELETE FROM workouts
                WHERE id = ?;
            `;
            const deleteStatement = await database.prepareAsync(deleteWorkoutQuery);
            await deleteStatement.executeAsync([workoutId]);

            console.log("✅ Workout and related exercises/sets deleted successfully.");
            await deleteStatement.finalizeAsync();

            return { response: "Workout deleted" };
        } catch (error) {
            console.error("❌ Error deleting workout:", error);
            throw error;
        }
    }

    async function getWorkoutHistory(workoutId: string): Promise<CompletedWorkout[]> {
        try {
            console.log("🚀 Fetching all completed workouts for workout ID:", workoutId);
    
            // Query para buscar TODOS os completed_workouts associados ao workout_id
            const completedWorkoutsQuery = `
                SELECT id, workout_id, workout_name, date
                FROM completed_workouts
                WHERE workout_id = ?
                ORDER BY date DESC;
            `;
            const workoutStatement = await database.prepareAsync(completedWorkoutsQuery);
            const workoutResult = await workoutStatement.executeAsync<CompletedWorkout>([workoutId]);
            const workoutData = await workoutResult.getAllAsync();
    
            if (workoutData.length === 0) {
                console.log("❌ No completed workouts found for the given workout ID.");
                return [];
            }
    
            const completedWorkouts: CompletedWorkout[] = [];
    
            // Query para buscar os exercícios relacionados
            const completedExercisesQuery = `
                SELECT id, completed_workout_id, name
                FROM completed_exercises
                WHERE completed_workout_id = ?;
            `;
    
            // Query para buscar os sets relacionados a cada exercício
            const completedSetsQuery = `
                SELECT id, set_number, repetitions, weight, completed_exercise_id
                FROM completed_sets
                WHERE completed_exercise_id = ?
                ORDER BY set_number ASC;
            `;
    
            for (const workout of workoutData) {
                const exercisesStatement = await database.prepareAsync(completedExercisesQuery);
                const exercisesResult = await exercisesStatement.executeAsync<CompletedExercise>([workout.id]);
                const exercisesData = await exercisesResult.getAllAsync();
    
                const completedExercises: CompletedExercise[] = [];
    
                for (const exercise of exercisesData) {
                    const setsStatement = await database.prepareAsync(completedSetsQuery);
                    const setsResult = await setsStatement.executeAsync<CompletedSet>([exercise.id]);
                    const setsData = await setsResult.getAllAsync();
    
                    completedExercises.push({
                        id: exercise.id,
                        completed_workout_id: exercise.completed_workout_id,
                        name: exercise.name,
                        completed_sets: setsData,
                    });
    
                    await setsStatement.finalizeAsync();
                }
    
                completedWorkouts.push({
                    id: workout.id,
                    workout_id: workout.workout_id,
                    workout_name: workout.workout_name,
                    date: workout.date,
                    completed_exercises: completedExercises,
                });
    
                await exercisesStatement.finalizeAsync();
            }
    
            console.log("🎉 All completed workouts fetched successfully:", completedWorkouts);
    
            await workoutStatement.finalizeAsync();
    
            return completedWorkouts;
        } catch (error) {
            console.error("❌ Error fetching completed workouts:", error);
            throw error;
        }
    }


    async function saveCompletedWorkout(
        workoutData: CompletedWorkoutData
    ): Promise<void> {
        try {
            console.log("🚀 Starting to save completed workout...");
    
            // 1️⃣ Salvar o Workout Completo
            const completedWorkoutQuery = `
                INSERT INTO completed_workouts (workout_id, workout_name, date)
                VALUES ($workout_id, $workout_name, $date);
            `;
            const workoutStatement = await database.prepareAsync(completedWorkoutQuery);
            const workoutResult = await workoutStatement.executeAsync({
                $workout_id: workoutData.workout_id,
                $workout_name: workoutData.workout_name,
                $date: workoutData.date,
            });
    
            const completedWorkoutId = workoutResult.lastInsertRowId;
            console.log("✅ Completed workout saved with ID:", completedWorkoutId);
    
            // 2️⃣ Salvar os Exercícios Concluídos
            for (const exercise of workoutData.completed_exercises) {
                const completedExerciseQuery = `
                    INSERT INTO completed_exercises (completed_workout_id, name)
                    VALUES ($completed_workout_id, $name);
                `;
                const exerciseStatement = await database.prepareAsync(completedExerciseQuery);
                const exerciseResult = await exerciseStatement.executeAsync({
                    $completed_workout_id: completedWorkoutId,
                    $name: exercise.exerciseName,
                });
    
                const completedExerciseId = exerciseResult.lastInsertRowId;
                console.log("✅ Completed exercise saved with ID:", completedExerciseId);
    
                // 3️⃣ Salvar os Sets de Cada Exercício
                for (const set of exercise.completed_sets) {
                    const completedSetQuery = `
                        INSERT INTO completed_sets (completed_exercise_id, set_number, weight, repetitions)
                        VALUES ($completed_exercise_id, $set_number, $weight, $repetitions);
                    `;
                    const setStatement = await database.prepareAsync(completedSetQuery);
                    await setStatement.executeAsync({
                        $completed_exercise_id: completedExerciseId,
                        $set_number: set.setNumber,
                        $weight: set.weight,
                        $repetitions: set.repetitions,
                    });
    
                    console.log(`✅ Set ${set.setNumber} saved for exercise ID: ${completedExerciseId}`);
                    await setStatement.finalizeAsync();
                }
    
                await exerciseStatement.finalizeAsync();
            }
    
            console.log("🎉 Completed workout saved successfully!");
            await workoutStatement.finalizeAsync();
        } catch (error) {
            console.error("❌ Error saving completed workout:", error);
            throw error;
        }
    }
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
        deleteWorkout,
        hardResetProject,
        getWorkoutHistory
    }
}