import { SavedWeights } from "../../../../screens/WorkingOut/WorkingOut";
import { useDataBase } from "../useDatabase";

const { executeSql } = useDataBase();

type CompletedWorkout = {
    workout_id: string;
    workoutName: string;
    date: string;
    savedWeights: SavedWeights[];
}

/**
 * Saves a completed workout along with its exercises and sets into the database.
 *
 * @param {CompletedWorkout} param0 - The completed workout details.
 * @param {number} param0.workout_id - The ID of the workout.
 * @param {string} param0.workoutName - The name of the workout.
 * @param {string} param0.date - The date when the workout was completed.
 * @param {Array<{ exerciseName: string, sets: Array<{ setNumber: number, repetitions: number, weight: number }> }>} param0.savedWeights - The list of exercises with their respective sets.
 * @returns {Promise<void>} A promise that resolves when the workout is successfully saved or rejects with an error message.
 */
export const saveCompletedWorkout = async ({ workout_id, workoutName, date, savedWeights }: CompletedWorkout) => { //! TODO Refactor
    return new Promise<void>((resolve, reject) => {
        // Inserir o treino completo na tabela 'completed_workouts'
        executeSql(
            'INSERT INTO completed_workouts (workout_id, workout_name, date) VALUES (?, ?, ?);',
            [workout_id, workoutName, date],
            (_, result) => {
                console.log('INSERT INTO completed_workouts')
                const completedWorkoutId = result.insertId;
                if (!completedWorkoutId) {
                    reject('Erro ao salvar treino completo: ID não encontrado.');
                    return;
                };

                // Iterar pelos exercícios e salvar no banco de dados
                savedWeights.forEach(exercise => {
                    executeSql(
                        'INSERT INTO completed_exercises (completed_workout_id, exercise_name) VALUES (?, ?);',
                        [workout_id, exercise.exerciseName], // Use o nome do exercício ou uma referência que você possui
                        (_, result) => {

                            console.log('INSERT INTO completed_exercises')
                            const completedExerciseId = result.insertId;

                            if (!completedExerciseId) return;

                            // Iterar pelas séries e salvar no banco de dados
                            exercise.sets.forEach(set => {
                                executeSql(
                                    'INSERT INTO completed_sets (completed_exercise_id, set_number, repetitions, weight) VALUES (?, ?, ?, ?);',
                                    [completedExerciseId, set.setNumber, set.repetitions, set.weight],
                                    () => console.log(`Set ${set.setNumber} do exercício ${exercise.exerciseId} salvo.`),
                                    (_, error) => {
                                        console.error('Erro ao salvar a série:', error);
                                        reject(error);
                                        return !!error
                                    }
                                );
                            });
                        },
                        (_, error) => {
                            console.error('Erro ao salvar o exercício:', error);
                            reject(error);
                            return !!error
                        }
                    );
                });

                resolve();
            },
            (_, error) => {
                console.error('Erro ao salvar treino completo:', error);
                reject(error);
                return !!error
            }
        );
    });
};
