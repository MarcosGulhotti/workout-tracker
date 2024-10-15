import { WorkoutDetails } from "../../types";
import { useDataBase } from "../useDatabase";
import { getExercisesForWorkout } from "./utils";

const { executeSql } = useDataBase();

/**
 * Fetches all workout details from the database.
 *
 * @returns {Promise<WorkoutDetails[]>} A promise that resolves to an array of workout details.
 *
 * @throws Will throw an error if there is an issue executing the SQL query.
 */
export function listAllWorkouts(): Promise<WorkoutDetails[]> {
    return new Promise((resolve, reject) => {
        // First, get all workouts
        executeSql(`SELECT * FROM workouts;`, [], async (_, { rows }) => {
            const workouts: WorkoutDetails[] = rows._array;

            // Use Promise.all to fetch exercises for each workout
            try {
                const workoutsWithExercises = await Promise.all(
                    workouts.map(async (workout) => {
                        // Fetch exercises for the current workout
                        workout.exercises = await getExercisesForWorkout(workout.id, executeSql);
                        return workout;
                    })
                );

                resolve(workoutsWithExercises);
            } catch (error) {
                console.log('Error fetching exercises for workouts', error);
                reject(error);
            }
        }, (_, error) => {
            console.log('Error fetching workouts', error);
            reject(error);
            return !!error;
        });
    });
}