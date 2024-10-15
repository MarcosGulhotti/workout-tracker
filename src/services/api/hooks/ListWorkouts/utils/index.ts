import { Exercise, ExerciseSet } from "../../../types";
import { SQLExecCallback } from "../../useDatabase";


/**
 * Retrieves the sets associated with a specific exercise from the database.
 *
 * @param exerciseId - The unique identifier of the exercise.
 * @param executeSql - A callback function to execute the SQL query.
 * @returns A promise that resolves to an array of ExerciseSet objects.
 *
 * @throws Will reject the promise if there is an error executing the SQL query.
 */
function getSetsForExercise(exerciseId: string, executeSql: SQLExecCallback): Promise<ExerciseSet[]> {
    return new Promise((resolve, reject) => {
        executeSql(
            `SELECT * FROM sets WHERE exercise_id = ?;`,
            [exerciseId],
            (_, { rows }) => {
                const sets: ExerciseSet[] = rows._array;

                resolve(sets);
            },
            (_, error) => {
                console.log('Error fetching sets for exercise:', error);
                reject(error);
                return !!error;
            }
        );
    });
}

/**
 * Retrieves exercises for a specific workout, including their associated sets.
 *
 * @param workoutId - The ID of the workout for which to retrieve exercises.
 * @param executeSql - A callback function to execute SQL queries.
 * @returns A promise that resolves to an array of exercises, each with their associated sets.
 *
 * @throws Will throw an error if there is an issue fetching exercises for the workout.
 */
export async function getExercisesForWorkout(workoutId: string, executeSql: SQLExecCallback): Promise<Exercise[]> {
    return await new Promise<Exercise[]>((resolve, reject) => {
        executeSql(
            `SELECT * FROM exercises WHERE workout_id = ?;`,
            [workoutId],
            async (_, { rows }) => {
                const exercises = rows._array as Exercise[];

                const exercisesWithSets = await Promise.all(
                    exercises.map(async (exercise) => {
                        const sets = await getSetsForExercise(exercise.id, executeSql);
                        return {
                            ...exercise,
                            sets
                        };
                    })
                );

                resolve(exercisesWithSets);
            },
            (_, error) => {
                console.log('Error fetching exercises for workout:', error);
                reject(error);
                return !!error;
            }
        );
    });
};
