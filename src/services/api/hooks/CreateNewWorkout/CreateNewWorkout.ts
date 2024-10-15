import { v4 as uuidv4 } from 'uuid';
import { useDataBase } from "../../../hooks/useDatabase";
import { AddExerciseToWorkout, CreateWorkout } from "../../sql";
import { ExerciseSet, WorkoutDetails } from "../types";

const { executeSql } = useDataBase();

/**
 * Creates a new workout entry in the database.
 *
 * @param workoutName - The name of the workout to be created.
 * @param dayOfWeek - The day of the week the workout is scheduled for.
 * @returns A promise that resolves when the workout is successfully created or rejects with an error.
 */
export async function createNewWorkout(workoutName: string, dayOfWeek: string): Promise<WorkoutDetails> {
    const id = uuidv4();
    return new Promise((resolve, reject) => {
        executeSql(CreateWorkout, [id, workoutName, dayOfWeek],
            (_, result) => {
                console.log('Treino criado com sucesso', result);
                const newWorkout = new Promise<WorkoutDetails>((resolve, reject) => {
                    executeSql(
                        `SELECT * FROM workouts WHERE id = ?;`,
                        [id],
                        (_, { rows }) => {
                            const workout = rows._array[0] as WorkoutDetails;
                            resolve(workout);
                        },
                        (_, error) => {
                            console.log('Erro ao buscar treino', error);
                            reject(error);
                            return !!error;
                        }
                    );
                });

                resolve(newWorkout);
            },
            (_, error) => {
                console.log('Erro ao criar treino', error);
                reject(error);
                return !!error;
            });
    });
}


/**
 * Adds a new exercise to a workout and inserts associated sets into the database.
 *
 * @param workout_id - The ID of the workout to which the exercise will be added.
 * @param exercise_name - The name of the exercise to be added.
 * @param sets - An array of sets associated with the exercise. Each set should contain set_number, repetitions, and weight.
 *
 * @returns A promise that resolves when the exercise and all associated sets have been successfully inserted into the database.
 *
 * @throws Will log an error message if there is an issue inserting the exercise or any of the sets.
 */
export function addExerciseToWorkout(
    workout_id: string,
    exercise_name: string,
    sets: ExerciseSet[]
) {
    const newExerciseId = uuidv4(); // Generate a UUID for the new exercise

    executeSql(AddExerciseToWorkout, [newExerciseId, workout_id, exercise_name],
        async (_, result) => {
            console.log('Exercise inserted successfully', result);
            // Insert each set associated with the exercise

            await new Promise((resolve, reject) => {
                sets.forEach(set => {
                    executeSql(
                        `INSERT INTO sets (id, exercise_id, set_number, repetitions, weight) VALUES (?, ?, ?, ?, ?);`,
                        [uuidv4(), newExerciseId, Number(set.set_number), Number(set.repetitions), String(set.weight)],
                        (_, result) => {
                            console.log('Set inserido com sucesso', result);
                            resolve(result);
                        },
                        (_, error) => {
                            console.log('Erro ao inserir set', error);
                            reject(error);
                            return !!error;
                        }
                    );
                });
            });
        },
        (_, error) => {
            console.log('Erro ao inserir exercício', error);
            return !!error;
        })
}