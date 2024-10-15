import { getDay } from 'date-fns';
import * as SQLite from 'expo-sqlite/legacy';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { CreateCardioTable, CreateCompletedExercisesTable, CreateCompletedSetsTable, CreateCompletedWorkoutsTable, CreateExercisesTable, CreateSetsTable, CreateWorkout, CreateWorkoutTable, DropAllTables } from '../sql';
import { AddExerciseToWorkout } from '../sql/Update/AddExerciseToWorkout';
import { useDataBase } from './hooks/useDatabase';
import { Exercise, ExerciseSet, WorkoutDetails } from './types';

const database = SQLite.openDatabase('workout_database');

const { executeSql, executeSqlBatch } = useDataBase();

/**
 * Sets up the database by executing a batch of SQL statements to create necessary tables.
 *
 * Logs a message upon successful completion or an error message if the transaction fails.
 * 
 * @returns {Promise<void>} A promise that resolves when the database setup is complete.
 */
export async function setUpDatabase() {
    executeSqlBatch([
        { sql: CreateWorkoutTable },
        { sql: CreateExercisesTable },
        { sql: CreateSetsTable },
        { sql: CreateCardioTable },
        { sql: CreateCompletedWorkoutsTable },
        { sql: CreateCompletedExercisesTable },
        { sql: CreateCompletedSetsTable },
    ], () => {
        console.log("Configuração do banco de dados concluída");
    }, (error) => {
        console.log("Erro na transação: ", error);
        return !!error;
    });
}

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
                        workout.exercises = await getExercisesForWorkout(workout.id);
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

export function listExercises() {
    database.transaction(tx => {
        tx.executeSql(
            `SELECT * FROM exercises;`,
            [],
            (_, { rows }) => {
                console.log('Exercícios:', rows._array);
            },
            (_, error) => {
                console.log('Erro ao buscar exercícios', error);
                return !!error;
            }
        );
    });
}

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

export function hardResetProject() {
    executeSql(`PRAGMA foreign_keys = OFF;`, [], () => {
        console.log('Foreign keys disabled.');
    });

    // Drop the table
    executeSql(`DROP TABLE IF EXISTS exercises;`, [], () => {
        console.log('Exercises table dropped.');
    });

    // Drop the table
    executeSql(`DROP TABLE IF EXISTS workouts;`, [], () => {
        console.log('Exercises table dropped.');
    });

    executeSql(`DROP TABLE IF EXISTS sets;`, [], () => {
        console.log('Exercises table dropped.');
    });

    // Drop the table
    executeSql(`DROP TABLE IF EXISTS completed_workouts;`, [], () => {
        console.log('Exercises table dropped.');
    });

    // Re-enable foreign key constraints
    executeSql(`PRAGMA foreign_keys = ON;`, [], () => {
        console.log('Foreign keys enabled.');
    });

    executeSql('BEGIN TRANSACTION;', [], () => {
        console.log('Transaction started.');

        // Drop the table
        executeSql(`DROP TABLE IF EXISTS exercises;`, [], () => {
            console.log('Exercises table dropped.');

            // Create the table with the correct schema
            executeSql(`
                CREATE TABLE IF NOT EXISTS exercises (
                    id TEXT PRIMARY KEY,
                    workout_id TEXT,
                    exercise_name TEXT NOT NULL,
                    FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE
                );
            `, [], () => {
                console.log('Exercises table created with the correct schema.');
            });
        });

        // Drop the table
        executeSql(`DROP TABLE IF EXISTS workouts;`, [], () => {
            console.log('Exercises table dropped.');

            // Create the table with the correct schema
            executeSql(`
                CREATE TABLE IF NOT EXISTS workouts (
                    id TEXT PRIMARY KEY,
                    workout_name TEXT NOT NULL,
                    day_of_week TEXT NOT NULL
                );
            `, [], () => {
                console.log('Workouts table created with the correct schema.');
            });
        });

        // Drop sets table
        executeSql(`DROP TABLE IF EXISTS sets;`, [], () => {
            console.log('Sets table dropped.');

            // Create the table with the correct schema
            executeSql(`
                CREATE TABLE IF NOT EXISTS sets (
                    id TEXT PRIMARY KEY,
                    exercise_id TEXT,
                    set_number INTEGER,
                    repetitions INTEGER,
                    weight TEXT,
                    FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE
                );
            `, [], () => {
                console.log('Sets table created with the correct schema.');
            });
        });

        executeSql('COMMIT;', [], () => {
            console.log('Transaction committed.');
        });
    });
    executeSql(
        `PRAGMA table_info(exercises);`,
        [],
        (_, { rows }) => {
            console.log('Updated table schema:', rows._array);
        },
        (_, error) => {
            console.log('Error fetching table schema', error);
            return !!error;
        }
    );

    executeSql(
        `PRAGMA table_info(workouts);`,
        [],
        (_, { rows }) => {
            console.log('Updated table schema:', rows._array);
        },
        (_, error) => {
            console.log('Error fetching table schema', error);
            return !!error;
        }
    );

    executeSql(
        `PRAGMA table_info(completed_workouts);`,
        [],
        (_, { rows }) => {
            console.log('Updated table schema:', rows._array);
        },
        (_, error) => {
            console.log('Error fetching table schema', error);
            return !!error;
        }
    );

    executeSql(
        `PRAGMA table_info(sets);`,
        [],
        (_, { rows }) => {
            console.log('Updated table schema SETS:', rows._array);
        },
        (_, error) => {
            console.log('Error fetching table schema', error);
            return !!error;
        }
    );

    executeSql(DropAllTables)
}

export const getWorkoutDetails = async (workoutId: string): Promise<WorkoutDetails | null> => {
    const workout = await new Promise<WorkoutDetails>((resolve, reject) => {
        executeSql(
            `SELECT * FROM workouts WHERE id = ?;`,
            [workoutId],
            async (_, { rows }) => {
                const workout = rows._array[0] as WorkoutDetails;

                const exercises = await getExercisesForWorkout(workout.id);

                resolve({
                    ...workout,
                    exercises
                });
            },
            (_, error) => {
                console.log('Error fetching workout details:', error);
                reject(error);
                return !!error;
            }
        );
    }
    );

    return workout;
};

const getExercisesForWorkout = async (workoutId: string): Promise<Exercise[]> => {
    const exercises = await new Promise<Exercise[]>((resolve, reject) => {
        executeSql(
            `SELECT * FROM exercises WHERE workout_id = ?;`,
            [workoutId],
            async (_, { rows }) => {
                const exercises = rows._array as Exercise[];

                const exercisesWithSets = await Promise.all(
                    exercises.map(async (exercise) => {
                        const sets = await getSetsForExercise(exercise.id);
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

    return exercises;
};

// Helper function to fetch sets for a specific exercise
function getSetsForExercise(exerciseId: string): Promise<ExerciseSet[]> {
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

export function getWorkoutOfTheDay(): Promise<WorkoutDetails | null> {
    return new Promise(async (resolve, reject) => {
        const allWorkouts = await listAllWorkouts()
        console.log(allWorkouts)

        if (allWorkouts.length === 0) {
            reject('No workout detected')
            return;
        }

        const today = getDay(new Date)

        const output = allWorkouts.find((elm) => elm.day_of_week === String(today))

        if (!output) {
            reject('No workout detected')
            return;
        }

        const detailedWorkout = await getWorkoutDetails(output.id)

        resolve(detailedWorkout)
    })
}

// Tipo para representar cada série
type CompletedSet = {
    setNumber: string;
    repetitions: string;
    weight: string;
};

// Tipo para representar cada exercício
type CompletedExercise = {
    exerciseId: string;
    exerciseName: string;
    sets: CompletedSet[];
};

// Tipo para representar o treino completo
export type CompletedWorkoutDetails = {
    workoutName: string;
    date: string;
    exercises: CompletedExercise[];
};

// Função para buscar os detalhes de um treino concluído específico
export const getCompletedWorkoutDetails = async (completedWorkoutId: string) => {
    return new Promise<CompletedWorkoutDetails | null>((resolve, reject) => {
        // Buscar informações gerais do treino concluído
        executeSql(
            `SELECT workout_name, date FROM completed_workouts WHERE workout_id = ?;`,
            [completedWorkoutId],
            (_, { rows }) => {
                const workout = rows._array[0];

                if (!workout) {
                    console.log('Treino não encontrado');
                    resolve(null);
                    return;
                }

                // Buscar os exercícios relacionados ao treino concluído
                executeSql(
                    `SELECT id AS exerciseId, exercise_name FROM completed_exercises WHERE completed_workout_id = ?;`,
                    [completedWorkoutId],
                    (_, { rows }) => {
                        const exercises: CompletedExercise[] = rows._array.map(exercise => ({
                            exerciseId: exercise.exerciseId.toString(),
                            exerciseName: exercise.exercise_name,
                            sets: [],
                        }));

                        // Para cada exercício, buscar as séries realizadas
                        const exerciseIds = exercises.map(e => e.exerciseId);
                        if (exerciseIds.length === 0) {
                            resolve({
                                workoutName: workout.workout_name,
                                date: workout.date,
                                exercises: [],
                            });
                            return;
                        }

                        // Busca as séries relacionadas aos exercícios do treino concluído
                        executeSql(
                            `SELECT completed_exercise_id, set_number, repetitions, weight
                   FROM completed_sets
                   WHERE completed_exercise_id IN (${exerciseIds.join(',')})
                   ORDER BY set_number ASC;`,
                            [],
                            (_, { rows }) => {
                                rows._array.forEach(set => {
                                    const exercise = exercises.find(e => e.exerciseId === set.completed_exercise_id.toString());
                                    if (exercise) {
                                        exercise.sets.push({
                                            setNumber: set.set_number.toString(),
                                            repetitions: set.repetitions.toString(),
                                            weight: set.weight.toString(),
                                        });
                                    }
                                });

                                // Resolver a promise com os dados completos do treino concluído
                                resolve({
                                    workoutName: workout.workout_name,
                                    date: workout.date,
                                    exercises,
                                });
                            },
                            (_, error) => {
                                console.error('Erro ao buscar séries:', error);
                                reject(error);
                                return !!error
                            }
                        );
                    },
                    (_, error) => {
                        console.error('Erro ao buscar exercícios:', error);
                        reject(error);
                        return !!error
                    }
                );
            },
            (_, error) => {
                console.error('Erro ao buscar treino concluído:', error);
                reject(error);
                return !!error
            }
        );
    });
};