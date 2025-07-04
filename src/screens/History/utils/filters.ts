import { CompletedWorkout } from "@/database/types";

type WorkoutFilters = {
  searchTerm?: string;
  workoutName?: string;
  startDate?: Date;
  endDate?: Date;
};

/**
 * Filters completed workouts based on the provided filters.
 *
 * @param {CompletedWorkout[]} data - The array of completed workouts to filter.
 * @param {WorkoutFilters} filters - The filters to apply.
 * @returns {CompletedWorkout[]} - The filtered array of completed workouts.
 */
export function filterCompletedWorkouts(
  data: CompletedWorkout[],
  filters: WorkoutFilters,
): CompletedWorkout[] {
  return data.filter((workout) => {
    const workoutDate = new Date(workout.date);

    const matchesSearch =
      !filters.searchTerm ||
      workout.workout_name
        .toLowerCase()
        .includes(filters.searchTerm.toLowerCase());

    const matchesWorkoutName =
      !filters.workoutName || workout.workout_name === filters.workoutName;

    const matchesDateRange =
      (!filters.startDate || workoutDate >= filters.startDate) &&
      (!filters.endDate || workoutDate <= filters.endDate);

    return matchesSearch && matchesWorkoutName && matchesDateRange;
  });
}
