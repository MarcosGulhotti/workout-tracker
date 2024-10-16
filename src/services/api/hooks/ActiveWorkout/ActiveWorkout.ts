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

// Função para buscar o histórico de pesos de cada exercício e série
export const getWeightsHistory = async (exerciseId: string) => {
    return new Promise<SavedWeights | null>((resolve, reject) => {
        // Buscar o exercício específico
        const query = `SELECT id AS exerciseId, exercise_name FROM completed_exercises WHERE completed_workout_id = ?;`;
        executeSql(
            query,
            [exerciseId],
            (_, { rows }) => {
                const exercise = rows._array[0];

                if (!exercise) {
                    console.log('Exercício não encontrado');
                    reject(null);
                    return;
                }

                let completedExercise: SavedWeights  = {
                    exerciseId: exercise.exerciseId.toString(),
                    exerciseName: exercise.exercise_name,
                    sets: [],
                };

                // Buscar o histórico de pesos para o exercício
                executeSql(
                    `SELECT completed_exercise_id, set_number, weight
                     FROM completed_sets
                     WHERE completed_exercise_id = ?
                     ORDER BY set_number ASC;`,
                    [completedExercise.exerciseId],
                    (_, { rows }) => {
                        rows._array.forEach(set => {
                            completedExercise.sets.push({
                                setNumber: set.set_number,
                                weight: set.weight,
                                repetitions: '0',
                            });
                        });

                        // Resolver a promise com o histórico de pesos do exercício
                        return resolve(completedExercise);
                    },
                    (_, error) => {
                        console.error('Erro ao buscar histórico de pesos:', error);
                        reject(error);
                        return !!error;
                    }
                );
            },
            (_, error) => {
                console.error('Erro ao buscar exercício:', error);
                reject(error);
                return !!error;
            }
        );
    });
};