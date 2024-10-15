import { useDataBase } from "../useDatabase";

const { executeSql } = useDataBase();

/**
 * Deletes a workout from the database based on the provided workout ID.
 *
 * @param {string} workoutId - The ID of the workout to be deleted.
 * @returns {Promise<void>} A promise that resolves when the workout is successfully deleted, or rejects with an error if the deletion fails.
 */
export function deleteWorkout(workoutId: string): Promise<void> {
    return new Promise((resolve, reject) => {
        executeSql(
            `DELETE FROM workouts WHERE id = ?;
             DELETE FROM exercises WHERE workout_id = ?;
             DELETE FROM sets WHERE workout_id = ?;`,
            [workoutId],
            (_, result) => {
                console.log('Workout deleted successfully', result);
                resolve();
            },
            (_, error) => {
                console.log('Error deleting workout', error);
                reject(error);
                return !!error;
            }
        );
    });
}
